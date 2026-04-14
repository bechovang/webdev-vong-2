'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import MapView from '@/components/Map';
import RouteControls from '@/components/RouteControls';
import RouteLayer from '@/components/RouteLayer';
import RouteSummaryPanel from '@/components/RouteSummaryPanel';
import TrafficOverlay from '@/components/TrafficOverlay';
import TimePicker, { TimeSelection } from '@/components/TimePicker';
import { useMapPicking, useRouteState, useTrafficSegments } from '@/lib';

export default function Home() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [error] = useState<string | null>(null);
  const [timeSelection, setTimeSelection] = useState<TimeSelection>({ type: 'preset', horizon: 'now' });
  const mapInitialized = useRef(false);
  const viewportSetupRef = useRef(false);

  const {
    segments,
    loading,
    loadByBounds,
    loadedCount,
    currentZoom,
    updateZoom,
    canHoverDetails,
  } = useTrafficSegments(map, timeSelection, { minZoomForDetails: 14 });
  const {
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
  } = useRouteState();

  useMapPicking({
    map,
    pickingMode,
    onPick: setPoint,
  });

  const handleMapLoad = (mapInstance: maplibregl.Map) => {
    setMap(mapInstance);
    mapInitialized.current = true;

    mapInstance.fitBounds(
      [
        [106.6, 10.7],
        [106.8, 10.9],
      ],
      { padding: 50, duration: 1000 }
    );

    updateZoom(mapInstance.getZoom());
  };

  useEffect(() => {
    if (!map || !mapInitialized.current || viewportSetupRef.current) return;

    const mapInstance = map;
    viewportSetupRef.current = true;
    let debounceTimer: NodeJS.Timeout | null = null;

    const requestViewportSegments = (force = false) => {
      const zoom = mapInstance.getZoom();
      updateZoom(zoom);

      const bounds = mapInstance.getBounds();
      const boundsArray: maplibregl.LngLatBoundsLike = [
        [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
        [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
      ];

      loadByBounds(boundsArray, zoom, force);
    };

    const onMoveEnd = () => {
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        requestViewportSegments();
      }, 250);
    };

    mapInstance.on('moveend', onMoveEnd);
    mapInstance.on('zoomend', onMoveEnd);

    const initialLoadTimer = setTimeout(() => {
      requestViewportSegments(true);
    }, 1000);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      clearTimeout(initialLoadTimer);
      mapInstance.off('moveend', onMoveEnd);
      mapInstance.off('zoomend', onMoveEnd);
    };
  }, [map, loadByBounds, updateZoom]);

  const isPrediction = timeSelection.type !== 'preset' || timeSelection.horizon !== 'now';
  const canLoadDetails = currentZoom >= 14;
  const departureOffsetMinutes =
    timeSelection.type === 'preset'
      ? timeSelection.horizon === '+15'
        ? 15
        : timeSelection.horizon === '+30'
          ? 30
          : timeSelection.horizon === '+60'
            ? 60
            : 0
      : getNearestDepartureOffsetMinutes(timeSelection.customTime);

  return (
    <main style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: isPrediction
            ? 'linear-gradient(135deg, #7c4dff 0%, #651fff 100%)'
            : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 2000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          transition: 'background 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>SmartRoute</h1>
            <p style={{ fontSize: 13, opacity: 0.9, margin: '2px 0 0 0' }}>
              Viewport-based traffic prediction for HCMC
            </p>
          </div>
          {isPrediction && (
            <div
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            >
              Prediction mode
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
            }}
          >
            {loadedCount.toLocaleString()} visible segments
          </div>
          {canLoadDetails && (
            <div
              style={{
                padding: '8px 16px',
                background: 'rgba(34, 197, 94, 0.2)',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            >
              Detail layer active
            </div>
          )}
        </div>
      </div>

      {loading && segments.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: '4px solid #e0e0e0',
              borderTop: '4px solid #1976d2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: 16,
            }}
          />
          <div style={{ fontSize: 16, fontWeight: 600 }}>Loading viewport data...</div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {loading && segments.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            right: 10,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '10px 16px',
            borderRadius: 10,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              border: '2px solid #e0e0e0',
              borderTop: '2px solid #1976d2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          Refreshing current viewport...
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ef4444',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 8,
            zIndex: 2000,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      <MapView onMapLoad={handleMapLoad} />

      {map && segments.length > 0 && (
        <TrafficOverlay map={map} segments={segments} timeSelection={timeSelection} />
      )}

      {map && (
        <RouteLayer
          map={map}
          origin={origin}
          destination={destination}
          route={route}
          predictionAnalysis={predictionAnalysis}
        />
      )}

      {!error && (
        <RouteControls
          origin={origin}
          destination={destination}
          hasRoute={Boolean(route)}
          pickingMode={pickingMode}
          routeLoading={routeLoading}
          canRequestRoute={canRequestRoute}
          onBeginPicking={beginPicking}
          onCancelPicking={cancelPicking}
          onRequestRoute={() => requestRoute(departureOffsetMinutes)}
          onClearRoute={clearRoute}
        />
      )}

      {!error && <TimePicker value={timeSelection} onChange={setTimeSelection} />}

      {!error && (
        <RouteSummaryPanel
          route={route}
          predictionAnalysis={predictionAnalysis}
          routeError={routeError}
          pickingMode={pickingMode}
        />
      )}

      {!error && segments.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: isPrediction ? 210 : 110,
            left: 10,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: 13,
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: 320,
            border: isPrediction ? '2px solid #7c4dff' : 'none',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Behavior</div>
          <div style={{ opacity: 0.8, lineHeight: 1.6, fontSize: 12 }}>
            <div>• Fetch only the current viewport after pan or zoom settles.</div>
            <div>• Zoom below 12 shows major roads only.</div>
            <div>• Zoom 12-14 shows more segments.</div>
            <div>• Hover details activate at zoom 15+.</div>
            <div style={{ marginTop: 6, padding: '6px 10px', background: '#f0f9ff', borderRadius: 6, fontWeight: 500, fontSize: 11 }}>
              Current zoom: {currentZoom.toFixed(1)}
            </div>
            <div style={{ marginTop: 4, padding: '6px 10px', background: canLoadDetails ? '#dcfce7' : '#f3f4f6', borderRadius: 6, fontWeight: 500, fontSize: 11 }}>
              {canLoadDetails ? 'Full viewport detail active' : 'Zoom in for full viewport detail'}
            </div>
            <div style={{ marginTop: 4, padding: '6px 10px', background: canHoverDetails ? '#dcfce7' : '#fef3c7', borderRadius: 6, fontWeight: 500, fontSize: 11 }}>
              {canHoverDetails ? 'Hover popup enabled' : 'Hover popup at zoom 15+'}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function getNearestDepartureOffsetMinutes(customTime?: Date) {
  if (!customTime) {
    return 0;
  }

  const diffMinutes = Math.max(0, Math.round((customTime.getTime() - Date.now()) / 60000));
  const supportedOffsets = [0, 15, 30, 60] as const;

  return supportedOffsets.reduce((closest, candidate) => {
    return Math.abs(candidate - diffMinutes) < Math.abs(closest - diffMinutes)
      ? candidate
      : closest;
  }, 0 as (typeof supportedOffsets)[number]);
}
