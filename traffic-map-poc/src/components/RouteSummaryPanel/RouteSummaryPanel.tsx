'use client';

import React from 'react';
import { PickingMode, RouteData } from '@/lib/routing';

interface RouteSummaryPanelProps {
  route: RouteData | null;
  routeError: string | null;
  pickingMode: PickingMode;
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
}

function formatDuration(durationSeconds: number) {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export const RouteSummaryPanel: React.FC<RouteSummaryPanelProps> = ({
  route,
  routeError,
  pickingMode,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        right: 10,
        bottom: 100,
        zIndex: 1200,
        width: 'min(320px, calc(100vw - 20px))',
        background: 'rgba(255, 255, 255, 0.96)',
        borderRadius: 16,
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.16)',
        padding: 16,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Route Summary</div>

      {!route && !routeError && (
        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginTop: 10 }}>
          {pickingMode
            ? `Click the map to set the ${pickingMode === 'origin' ? 'start' : 'end'} point.`
            : 'Pick a start and end point, then request a real route.'}
        </div>
      )}

      {routeError && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 12,
            background: '#fef2f2',
            color: '#b91c1c',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {routeError}
        </div>
      )}

      {route && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <div style={metricCardStyle}>
              <div style={metricLabelStyle}>Distance</div>
              <div style={metricValueStyle}>{formatDistance(route.distanceMeters)}</div>
            </div>
            <div style={metricCardStyle}>
              <div style={metricLabelStyle}>ETA</div>
              <div style={metricValueStyle}>{formatDuration(route.durationSeconds)}</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 10 }}>Steps</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(route.steps || []).slice(0, 5).map((step, index) => (
                <div key={`${step.instruction}-${index}`} style={stepRowStyle}>
                  <div style={stepIndexStyle}>{index + 1}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{step.instruction}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {formatDistance(step.distanceMeters)}
                    </div>
                  </div>
                </div>
              ))}
              {(!route.steps || route.steps.length === 0) && (
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                  No step-by-step instructions returned for this route.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const metricCardStyle: React.CSSProperties = {
  background: '#eff6ff',
  borderRadius: 12,
  padding: '12px 14px',
};

const metricLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#1d4ed8',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const metricValueStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: '#0f172a',
  marginTop: 4,
};

const stepRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  padding: '10px 12px',
  borderRadius: 12,
  background: '#f8fafc',
};

const stepIndexStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 999,
  background: '#dbeafe',
  color: '#1d4ed8',
  fontSize: 12,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

export default RouteSummaryPanel;
