'use client';

import React, { useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';

type HotspotRealtimeInfo = {
  severity?: number;
  speed_ratio: number;
  delay_ratio: number;
  road_closure: boolean;
};

type TrafficHotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius_meters: number;
  description?: string;
  realtime?: HotspotRealtimeInfo | null;
  realtime_status?: 'ok' | 'disabled' | 'error';
  realtime_message?: string;
};

interface HotspotInspectorProps {
  map: maplibregl.Map | null;
}

export const HotspotInspector: React.FC<HotspotInspectorProps> = ({ map }) => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState<TrafficHotspot[]>([]);
  const [realtimeEnabled, setRealtimeEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/hotspots', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || data?.error || `HTTP ${response.status}`);
        }

        if (!cancelled) {
          setHotspots(Array.isArray(data.hotspots) ? data.hotspots : []);
          setRealtimeEnabled(typeof data.realtime_enabled === 'boolean' ? data.realtime_enabled : null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setHotspots([]);
          setRealtimeEnabled(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div style={styles.wrapper}>
      <button type="button" onClick={() => setOpen((value) => !value)} style={styles.toggle}>
        {open ? 'An hotspot' : 'Xem hotspot'}
      </button>

      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div>
              <div style={styles.title}>Hotspot Inspector</div>
              <div style={styles.subtitle}>
                {loading ? 'Dang tai...' : error ? 'API loi' : `${hotspots.length} hotspot`}
              </div>
            </div>
            <div
              style={{
                ...styles.statusDot,
                background: loading ? '#f59e0b' : error ? '#ef4444' : '#22c55e',
              }}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              /api/hotspots loi: {error}
            </div>
          )}

          {!error && realtimeEnabled === false && (
            <div style={styles.warningBox}>
              Realtime dang tat vi backend chua co `TOMTOM_API_KEY`, nen hotspot hien co se khong dieu
              chinh segment nao.
            </div>
          )}

          {!error && !loading && hotspots.length === 0 && (
            <div style={styles.emptyBox}>API chay nhung dang khong tra hotspot nao.</div>
          )}

          <div style={styles.list}>
            {hotspots.map((hotspot) => {
              const severity = hotspot.realtime?.severity ?? 0;
              const realtimeLabel = hotspot.realtime_status === 'disabled'
                ? 'RT off'
                : hotspot.realtime_status === 'error'
                  ? 'RT err'
                  : `S${severity}`;

              return (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => {
                    map?.flyTo({
                      center: [hotspot.lng, hotspot.lat],
                      zoom: 15.5,
                      duration: 1000,
                    });
                  }}
                  style={styles.item}
                >
                  <div style={styles.itemTop}>
                    <span style={styles.itemName}>{hotspot.name}</span>
                    <span
                      style={{
                        ...styles.badge,
                        ...(hotspot.realtime_status === 'disabled'
                          ? styles.badgeMuted
                          : hotspot.realtime_status === 'error'
                            ? styles.badgeError
                            : severity >= 2
                              ? styles.badgeActive
                              : styles.badgeIdle),
                      }}
                    >
                      {realtimeLabel}
                    </span>
                  </div>
                  <div style={styles.itemDesc}>{hotspot.description || 'Khong co mo ta'}</div>
                  <div style={styles.itemMeta}>
                    {hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)} · R {Math.round(hotspot.radius_meters)}m
                  </div>
                  <div style={styles.itemRealtime}>
                    {hotspot.realtime_message || 'Khong co thong tin realtime'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    zIndex: 2200,
    width: 'min(360px, calc(100vw - 20px))',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  toggle: {
    border: 'none',
    borderRadius: 999,
    background: '#0f172a',
    color: 'white',
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(15, 23, 42, 0.25)',
  },
  panel: {
    width: '100%',
    maxHeight: '50vh',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.98)',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.18)',
    backdropFilter: 'blur(12px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 14px 10px',
    borderBottom: '1px solid #e2e8f0',
  },
  title: {
    fontSize: 14,
    fontWeight: 800,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    flexShrink: 0,
  },
  errorBox: {
    margin: 12,
    padding: 10,
    borderRadius: 12,
    background: '#fef2f2',
    color: '#991b1b',
    fontSize: 12,
    lineHeight: 1.5,
  },
  warningBox: {
    margin: 12,
    padding: 10,
    borderRadius: 12,
    background: '#fff7ed',
    color: '#9a3412',
    fontSize: 12,
    lineHeight: 1.5,
    border: '1px solid #fed7aa',
  },
  emptyBox: {
    margin: 12,
    padding: 10,
    borderRadius: 12,
    background: '#f8fafc',
    color: '#475569',
    fontSize: 12,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 12,
    maxHeight: 'calc(50vh - 64px)',
    overflowY: 'auto',
  },
  item: {
    textAlign: 'left',
    border: '1px solid #e2e8f0',
    background: '#fff',
    borderRadius: 12,
    padding: 12,
    cursor: 'pointer',
  },
  itemTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0f172a',
  },
  badge: {
    fontSize: 11,
    fontWeight: 800,
    borderRadius: 999,
    padding: '3px 8px',
  },
  badgeIdle: {
    color: '#92400e',
    background: '#ffedd5',
  },
  badgeActive: {
    color: '#991b1b',
    background: '#fee2e2',
  },
  badgeMuted: {
    color: '#475569',
    background: '#e2e8f0',
  },
  badgeError: {
    color: '#ffffff',
    background: '#ef4444',
  },
  itemDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
    lineHeight: 1.5,
  },
  itemMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 8,
  },
  itemRealtime: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 1.45,
  },
};

export default HotspotInspector;
