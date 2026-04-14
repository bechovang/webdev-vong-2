'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Coordinate,
  DepartureOffsetMinutes,
  PickingMode,
  PredictionAnalysis,
  RouteData,
  RouteResponse,
} from './routing';

interface UseRouteStateResult {
  origin: Coordinate | null;
  destination: Coordinate | null;
  route: RouteData | null;
  predictionAnalysis: PredictionAnalysis | null;
  pickingMode: PickingMode;
  routeLoading: boolean;
  routeError: string | null;
  canRequestRoute: boolean;
  beginPicking: (mode: Exclude<PickingMode, null>) => void;
  cancelPicking: () => void;
  setPoint: (mode: Exclude<PickingMode, null>, coordinate: Coordinate) => void;
  requestRoute: (params: { departureOffsetMinutes: DepartureOffsetMinutes; targetHour?: number; targetWeekday?: number }) => Promise<void>;
  clearRoute: () => void;
}

export function useRouteState(): UseRouteStateResult {
  const [origin, setOrigin] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [predictionAnalysis, setPredictionAnalysis] = useState<PredictionAnalysis | null>(null);
  const [pickingMode, setPickingMode] = useState<PickingMode>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const beginPicking = useCallback((mode: Exclude<PickingMode, null>) => {
    setPickingMode(mode);
    setRouteError(null);
  }, []);

  const cancelPicking = useCallback(() => {
    setPickingMode(null);
  }, []);

  const setPoint = useCallback((mode: Exclude<PickingMode, null>, coordinate: Coordinate) => {
    if (mode === 'origin') {
      setOrigin(coordinate);
    } else {
      setDestination(coordinate);
    }

    setPickingMode(null);
    setRoute(null);
    setPredictionAnalysis(null);
    setRouteError(null);
  }, []);

  const clearRoute = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    setRoute(null);
    setPredictionAnalysis(null);
    setPickingMode(null);
    setRouteLoading(false);
    setRouteError(null);
  }, []);

  const requestRoute = useCallback(async (params: { departureOffsetMinutes: DepartureOffsetMinutes; targetHour?: number; targetWeekday?: number }) => {
    if (!origin || !destination) {
      setRouteError('Pick both start and end points first.');
      return;
    }

    setRouteLoading(true);
    setRouteError(null);

    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
          profile: 'car',
          departureOffsetMinutes: params.departureOffsetMinutes,
          targetHour: params.targetHour,
          targetWeekday: params.targetWeekday,
          includeSteps: true,
          includePredictionAnalysis: true,
        }),
      });

      const data = (await response.json()) as RouteResponse;
      if (!response.ok || data.status !== 'success') {
        throw new Error(('error' in data ? data.error?.message : null) || 'Failed to build route');
      }

      setRoute(data.data.route);
      setPredictionAnalysis(data.data.predictionAnalysis || null);
    } catch (error) {
      setRoute(null);
      setPredictionAnalysis(null);
      setRouteError(error instanceof Error ? error.message : 'Failed to build route');
    } finally {
      setRouteLoading(false);
    }
  }, [destination, origin]);

  const canRequestRoute = useMemo(() => {
    return Boolean(origin && destination && !routeLoading);
  }, [destination, origin, routeLoading]);

  return {
    origin,
    destination,
    route,
    predictionAnalysis,
    pickingMode,
    routeLoading,
    routeError,
    canRequestRoute,
    beginPicking,
    cancelPicking,
    setPoint,
    requestRoute,
    clearRoute,
  };
}
