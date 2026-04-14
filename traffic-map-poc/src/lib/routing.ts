export type Coordinate = [number, number];

export type RouteProfile = 'car' | 'bike' | 'walk';

export type RouteProvider = 'graphhopper' | 'mock' | 'valhalla';

export type DepartureOffsetMinutes = 0 | 15 | 30 | 60;

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds?: number;
  streetName?: string;
}

export interface CongestedSegment {
  segmentId: number;
  los?: string;
  confidence?: number;
  delaySeconds?: number;
  geometry?: GeoJSON.LineString;
}

export interface PredictionCoverage {
  matchedSegmentCount: number;
  sampledPointCount: number;
  coverageRatio: number;
  level: 'low' | 'partial' | 'good';
}

export interface PredictionAnalysis {
  departureOffsetMinutes: DepartureOffsetMinutes;
  delaySeconds?: number;
  congestionScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  congestedSegments?: CongestedSegment[];
  summary?: string;
  coverage?: PredictionCoverage;
}

export interface RouteData {
  provider: RouteProvider;
  profile: RouteProfile;
  distanceMeters: number;
  durationSeconds: number;
  geometry: GeoJSON.LineString;
  bbox: [number, number, number, number];
  steps?: RouteStep[];
}

export interface RouteRequest {
  origin: Coordinate;
  destination: Coordinate;
  profile?: RouteProfile;
  departureOffsetMinutes?: DepartureOffsetMinutes;
  includeSteps?: boolean;
  includePredictionAnalysis?: boolean;
}

export interface ApiError {
  code: 'invalid_input' | 'provider_error' | 'no_route' | 'timeout' | 'unknown';
  message: string;
}

export interface RouteResponseSuccess {
  status: 'success';
  data: {
    route: RouteData;
    predictionAnalysis?: PredictionAnalysis;
  };
}

export interface RouteResponseError {
  status: 'error';
  error: ApiError;
}

export type RouteResponse = RouteResponseSuccess | RouteResponseError;

export type PickingMode = 'origin' | 'destination' | null;
