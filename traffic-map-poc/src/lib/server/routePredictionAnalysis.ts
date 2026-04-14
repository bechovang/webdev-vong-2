import {
  CongestedSegment,
  DepartureOffsetMinutes,
  PredictionAnalysis,
  RouteData,
} from '@/lib/routing';
import { getTrafficSegmentsWithinBounds, TrafficSegmentRecord } from './trafficData';

const BBOX_PADDING_DEGREES = 0.0035;
const SEGMENT_MATCH_THRESHOLD_METERS = 160;

interface PredictedSegmentScore extends TrafficSegmentRecord {
  los: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  confidence: number;
  travelTimeFactor: number;
  predictedDelaySeconds: number;
  distanceToRouteMeters: number;
}

export async function analyzeRoutePrediction(
  route: RouteData,
  departureOffsetMinutes: DepartureOffsetMinutes
): Promise<PredictionAnalysis> {
  const routeBounds = getExpandedBounds(route.bbox, BBOX_PADDING_DEGREES);
  const nearbySegments = await getTrafficSegmentsWithinBounds(routeBounds);

  const matchedSegments = nearbySegments
    .map((segment) => scoreSegmentAgainstRoute(segment, route, departureOffsetMinutes))
    .filter((segment): segment is PredictedSegmentScore => segment !== null)
    .sort((a, b) => a.distanceToRouteMeters - b.distanceToRouteMeters)
    .slice(0, 48);

  if (matchedSegments.length === 0) {
    return {
      departureOffsetMinutes,
      delaySeconds: 0,
      congestionScore: 0,
      riskLevel: 'low',
      summary: 'No nearby predicted congestion was detected on this route.',
    };
  }

  const weightedLength = matchedSegments.reduce((sum, segment) => sum + Math.max(segment.length, 30), 0);
  const weightedPenalty = matchedSegments.reduce(
    (sum, segment) => sum + getSeverityWeight(segment.los) * Math.max(segment.length, 30),
    0
  );

  const weightedTravelFactor = matchedSegments.reduce(
    (sum, segment) => sum + segment.travelTimeFactor * Math.max(segment.length, 30),
    0
  );

  const delaySeconds = Math.round(
    matchedSegments.reduce((sum, segment) => sum + segment.predictedDelaySeconds, 0)
  );

  const congestionScore = Number(Math.min(weightedPenalty / (weightedLength * 5), 1).toFixed(2));
  const avgTravelFactor = weightedTravelFactor / weightedLength;
  const highRiskCount = matchedSegments.filter((segment) => segment.los === 'E' || segment.los === 'F').length;
  const mediumRiskCount = matchedSegments.filter((segment) => segment.los === 'D').length;
  const riskLevel =
    highRiskCount >= 4 || avgTravelFactor >= 1.75 ? 'high' :
    highRiskCount >= 1 || mediumRiskCount >= 4 || avgTravelFactor >= 1.35 ? 'medium' :
    'low';

  return {
    departureOffsetMinutes,
    delaySeconds,
    congestionScore,
    riskLevel,
    congestedSegments: buildCongestedSegments(matchedSegments),
    summary: buildSummary({
      departureOffsetMinutes,
      delaySeconds,
      riskLevel,
      highRiskCount,
      mediumRiskCount,
    }),
  };
}

function scoreSegmentAgainstRoute(
  segment: TrafficSegmentRecord,
  route: RouteData,
  departureOffsetMinutes: DepartureOffsetMinutes
): PredictedSegmentScore | null {
  const segmentMidpoint: [number, number] = [
    (segment.s_lng + segment.e_lng) / 2,
    (segment.s_lat + segment.e_lat) / 2,
  ];

  const distanceToRouteMeters = getDistanceToRoute(segmentMidpoint, route.geometry.coordinates);
  if (distanceToRouteMeters > SEGMENT_MATCH_THRESHOLD_METERS) {
    return null;
  }

  const predicted = predictSegmentTraffic(segment, departureOffsetMinutes);
  const baseSpeedMetersPerSecond = Math.max((segment.max_velocity || 20) / 3.6, 1.8);
  const baseDurationSeconds = Math.max((segment.length || 30) / baseSpeedMetersPerSecond, 4);
  const predictedDelaySeconds = Math.round(baseDurationSeconds * (predicted.travelTimeFactor - 1));

  return {
    ...segment,
    los: predicted.los,
    confidence: predicted.confidence,
    travelTimeFactor: predicted.travelTimeFactor,
    predictedDelaySeconds,
    distanceToRouteMeters,
  };
}

function predictSegmentTraffic(segment: TrafficSegmentRecord, departureOffsetMinutes: DepartureOffsetMinutes) {
  const targetTime = new Date(Date.now() + departureOffsetMinutes * 60 * 1000);
  const hour = targetTime.getHours();
  const weekday = targetTime.getDay();
  const isWeekend = weekday === 0 || weekday === 6;
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  const isNight = hour >= 22 || hour <= 6;
  const isMajorRoad = segment.street_level === 1;
  const noise = deterministicNoise(segment.segment_id, hour, weekday);

  if (isNight) {
    return { los: 'A' as const, confidence: 0.88, travelTimeFactor: 1.02 + noise * 0.08 };
  }

  if (isWeekend) {
    if (hour >= 8 && hour <= 20) {
      return noise > 0.65
        ? { los: 'C' as const, confidence: 0.72, travelTimeFactor: 1.18 + noise * 0.18 }
        : { los: 'B' as const, confidence: 0.76, travelTimeFactor: 1.05 + noise * 0.14 };
    }

    return { los: 'A' as const, confidence: 0.84, travelTimeFactor: 1.01 + noise * 0.08 };
  }

  if (isRushHour) {
    if (isMajorRoad) {
      if (noise > 0.78) {
        return { los: 'E' as const, confidence: 0.74, travelTimeFactor: 2.15 + noise * 0.45 };
      }
      if (noise > 0.46) {
        return { los: 'D' as const, confidence: 0.71, travelTimeFactor: 1.55 + noise * 0.35 };
      }
      return { los: 'C' as const, confidence: 0.66, travelTimeFactor: 1.22 + noise * 0.2 };
    }

    return noise > 0.58
      ? { los: 'D' as const, confidence: 0.69, travelTimeFactor: 1.48 + noise * 0.3 }
      : { los: 'C' as const, confidence: 0.7, travelTimeFactor: 1.18 + noise * 0.18 };
  }

  return noise > 0.5
    ? { los: 'C' as const, confidence: 0.74, travelTimeFactor: 1.16 + noise * 0.16 }
    : { los: 'B' as const, confidence: 0.77, travelTimeFactor: 1.04 + noise * 0.12 };
}

function deterministicNoise(segmentId: number, hour: number, weekday: number) {
  const seed = (segmentId * 9301 + hour * 49297 + weekday * 233280) % 233280;
  return seed / 233280;
}

function getExpandedBounds(
  bbox: [number, number, number, number],
  padding: number
): { minLng: number; minLat: number; maxLng: number; maxLat: number } {
  const [minLng, minLat, maxLng, maxLat] = bbox;

  return {
    minLng: minLng - padding,
    minLat: minLat - padding,
    maxLng: maxLng + padding,
    maxLat: maxLat + padding,
  };
}

function getDistanceToRoute(point: [number, number], coordinates: GeoJSON.Position[]) {
  let minDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i] as [number, number];
    const end = coordinates[i + 1] as [number, number];
    const candidate = getDistanceToSegment(point, start, end);

    if (candidate < minDistance) {
      minDistance = candidate;
    }
  }

  return minDistance;
}

function getDistanceToSegment(point: [number, number], start: [number, number], end: [number, number]) {
  const avgLat = ((point[1] + start[1] + end[1]) / 3) * (Math.PI / 180);
  const metersPerLng = 111320 * Math.cos(avgLat);
  const metersPerLat = 110540;

  const px = point[0] * metersPerLng;
  const py = point[1] * metersPerLat;
  const sx = start[0] * metersPerLng;
  const sy = start[1] * metersPerLat;
  const ex = end[0] * metersPerLng;
  const ey = end[1] * metersPerLat;

  const dx = ex - sx;
  const dy = ey - sy;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(px - sx, py - sy);
  }

  const t = Math.max(0, Math.min(1, ((px - sx) * dx + (py - sy) * dy) / lengthSquared));
  const projectionX = sx + t * dx;
  const projectionY = sy + t * dy;

  return Math.hypot(px - projectionX, py - projectionY);
}

function getSeverityWeight(los: PredictedSegmentScore['los']) {
  switch (los) {
    case 'A':
      return 0;
    case 'B':
      return 1;
    case 'C':
      return 2;
    case 'D':
      return 3;
    case 'E':
      return 4;
    case 'F':
      return 5;
  }
}

function buildCongestedSegments(matchedSegments: PredictedSegmentScore[]): CongestedSegment[] {
  return matchedSegments
    .filter((segment) => segment.los === 'D' || segment.los === 'E' || segment.los === 'F')
    .sort((a, b) => {
      const severityDiff = getSeverityWeight(b.los) - getSeverityWeight(a.los);
      if (severityDiff !== 0) {
        return severityDiff;
      }

      return b.predictedDelaySeconds - a.predictedDelaySeconds;
    })
    .slice(0, 12)
    .map((segment) => ({
      segmentId: segment.segment_id,
      los: segment.los,
      confidence: Number(segment.confidence.toFixed(2)),
      delaySeconds: segment.predictedDelaySeconds,
      geometry: {
        type: 'LineString',
        coordinates: [
          [segment.s_lng, segment.s_lat],
          [segment.e_lng, segment.e_lat],
        ],
      },
    }));
}

function buildSummary(params: {
  departureOffsetMinutes: DepartureOffsetMinutes;
  delaySeconds: number;
  riskLevel: 'low' | 'medium' | 'high';
  highRiskCount: number;
  mediumRiskCount: number;
}) {
  const whenLabel =
    params.departureOffsetMinutes === 0
      ? 'if you leave now'
      : `for a departure in +${params.departureOffsetMinutes} minutes`;

  const delayMinutes = params.delaySeconds > 0 ? Math.max(1, Math.round(params.delaySeconds / 60)) : 0;

  if (params.riskLevel === 'high') {
    return `High predicted congestion ${whenLabel}. Expect roughly +${delayMinutes} min delay with ${params.highRiskCount} severe bottlenecks on the route.`;
  }

  if (params.riskLevel === 'medium') {
    return `Moderate congestion ${whenLabel}. The route may slow by about +${delayMinutes} min with ${params.mediumRiskCount + params.highRiskCount} pressure points nearby.`;
  }

  return `Low congestion ${whenLabel}. Only minor slowdowns are predicted on this route.`;
}
