'use client';

import { useCallback, useMemo, useState } from 'react';
import { Coordinate, PickingMode, RouteData, RouteResponse } from './routing';

interface UseRouteStateResult {
  origin: Coordinate | null;
  destination: Coordinate | null;
  route: RouteData | null;
  pickingMode: PickingMode;
  routeLoading: boolean;
  routeError: string | null;
  canRequestRoute: boolean;
  beginPicking: (mode: Exclude<PickingMode, null>) => void;
  cancelPicking: () => void;
  setPoint: (mode: Exclude<PickingMode, null>, coordinate: Coordinate) => void;
  requestRoute: () => Promise<void>;
  clearRoute: () => void;
}

export function useRouteState(): UseRouteStateResult {
  const [origin, setOrigin] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
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
    setRouteError(null);
  }, []);

  const clearRoute = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    setRoute(null);
    setPickingMode(null);
    setRouteLoading(false);
    setRouteError(null);
  }, []);

  const requestRoute = useCallback(async () => {
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
          departureOffsetMinutes: 0,
          includeSteps: true,
          includePredictionAnalysis: false,
        }),
      });

      const data = (await response.json()) as RouteResponse;
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.error.message || 'Failed to build route');
      }

      setRoute(data.data.route);
    } catch (error) {
      setRoute(null);
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
