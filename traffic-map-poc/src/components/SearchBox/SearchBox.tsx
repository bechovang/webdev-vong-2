'use client';

import React, { useRef, useState, useEffect } from 'react';
import { LonLat, SearchOption } from './types';
import { useSearch } from './useSearch';
import { humanDist, getDistrict } from './photon';

interface SearchBoxProps {
  mapCenter: LonLat;
  onSelect: (coords: LonLat, label: string) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ mapCenter, onSelect }) => {
  const { input, setInput, options, loading } = useSearch(mapCenter);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const showDropdown = focused && input.trim().length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt: SearchOption) => {
    let coords: LonLat | null = null;
    if (opt.type === 'geocoder' && opt.feature) coords = opt.feature.geometry.coordinates;
    if (opt.type === 'coords' && opt.coords) coords = opt.coords.center;
    if (!coords) return;
    onSelect(coords, opt.label);
    setInput('');
    setFocused(false);
  };

  return (
    <div ref={containerRef} style={styles.wrapper}>
      <div style={styles.bar}>
        <span style={styles.icon}>{'\uD83D\uDD0D'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Tìm địa điểm, đường, khu vực..."
          style={styles.input}
        />
        {input && (
          <button onClick={() => setInput('')} style={styles.clearBtn}>{'\u00D7'}</button>
        )}
      </div>
      {showDropdown && (
        <div style={styles.dropdown}>
          <ResultsList
            options={options}
            input={input}
            mapCenter={mapCenter}
            loading={loading}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
};

const ResultsList = ({ options, input, mapCenter, loading, onSelect }: {
  options: SearchOption[];
  input: string;
  mapCenter: LonLat;
  loading: boolean;
  onSelect: (opt: SearchOption) => void;
}) => {
  const geocoders = options.filter((o) => o.type === 'geocoder');

  const grouped = new Map<string, SearchOption[]>();
  for (const opt of geocoders) {
    const d = opt.feature ? getDistrict(opt.feature.properties) : 'Khác';
    if (!grouped.has(d)) grouped.set(d, []);
    grouped.get(d)!.push(opt);
  }

  return (
    <>
      {options.filter((o) => o.type === 'coords').map((opt, i) => (
        <div key={`c${i}`} style={styles.row} onClick={() => onSelect(opt)}>
          <span style={styles.rowIcon}>{'\uD83C\uDF0D'}</span>
          <div><div style={styles.rowLabel}>{opt.label}</div><div style={styles.rowSub}>{opt.sublabel}</div></div>
        </div>
      ))}
      {Array.from(grouped.entries()).map(([district, items]) => (
        <div key={district}>
          <div style={styles.groupHeader}>{district}</div>
          {items.map((opt, i) => (
            <ResultRow key={`g${i}`} option={opt} input={input} mapCenter={mapCenter} onSelect={onSelect} />
          ))}
        </div>
      ))}
      {options.some((o) => o.type === 'loader') && (
        <div style={styles.loadingRow}><Spinner /> Đang tìm kiếm...</div>
      )}
      {!loading && options.length === 0 && input.trim() && (
        <div style={styles.noResults}>Không tìm thấy &quot;{input}&quot;</div>
      )}
    </>
  );
};

const ResultRow = ({ option, input, mapCenter, onSelect }: {
  option: SearchOption; input: string; mapCenter: LonLat; onSelect: (o: SearchOption) => void;
}) => {
  const coords = option.feature?.geometry.coordinates;
  const dist = coords ? humanDist(mapCenter, coords) : '';
  return (
    <div style={styles.row} onClick={() => onSelect(option)}>
      <span style={styles.rowIcon}>{'\uD83D\uDCCD'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.rowLabel}>{highlight(option.label, input)}</div>
        <div style={styles.rowSub}>{option.sublabel} <span style={{ color: '#1976d2' }}>{dist}</span></div>
      </div>
    </div>
  );
};

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  return <>{text.slice(0, i)}<strong style={{ color: '#1976d2' }}>{text.slice(i, i + query.length)}</strong>{text.slice(i + query.length)}</>;
}

const Spinner = () => (
  <div style={{ width: 16, height: 16, border: '2px solid #e0e0e0', borderTop: '2px solid #1976d2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
);

const styles: Record<string, React.CSSProperties> = {
  wrapper: { position: 'relative', zIndex: 2100 },
  bar: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'white', borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    padding: '0 14px', height: 48,
  },
  icon: { fontSize: 18, flexShrink: 0 },
  input: {
    flex: 1, border: 'none', outline: 'none', fontSize: 14,
    fontFamily: 'Inter, sans-serif', background: 'transparent', color: '#333',
  },
  clearBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' },
  dropdown: {
    position: 'absolute', top: 56, left: 0, right: 0,
    background: 'white', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    maxHeight: 'calc(100vh - 140px)', overflowY: 'auto', padding: '4px 0',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s',
  },
  rowIcon: { fontSize: 16, flexShrink: 0 },
  rowLabel: { fontSize: 14, fontWeight: 500, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowSub: { fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  groupHeader: { padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: '#1976d2', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f0' },
  loadingRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', color: '#666', fontSize: 13 },
  noResults: { padding: '20px 16px', textAlign: 'center', color: '#999', fontSize: 13 },
};

export default SearchBox;
