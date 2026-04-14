'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl, { GeoJSONSource } from 'maplibre-gl';
import { Coordinate, RouteData } from '@/lib/routing';

const ROUTE_SOURCE_ID = 'route-source';
const ROUTE_CASING_LAYER_ID = 'route-line-casing';
const ROUTE_LAYER_ID = 'route-line';

interface RouteLayerProps {
  map: maplibregl.Map | null;
  origin: Coordinate | null;
  destination: Coordinate | null;
  route: RouteData | null;
}

export const RouteLayer: React.FC<RouteLayerProps> = ({ map, origin, destination, route }) => {
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destinationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const fittedRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!originMarkerRef.current) {
      originMarkerRef.current = new maplibregl.Marker({ color: '#16a34a' });
    }

    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new maplibregl.Marker({ color: '#dc2626' });
    }

    if (origin) {
      originMarkerRef.current.setLngLat(origin).addTo(map);
    } else {
      originMarkerRef.current.remove();
    }

    if (destination) {
      destinationMarkerRef.current.setLngLat(destination).addTo(map);
    } else {
      destinationMarkerRef.current.remove();
    }
  }, [destination, map, origin]);

  useEffect(() => {
    if (!map) return;

    const applyRoute = () => {
      if (!route) {
        if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
        if (map.getLayer(ROUTE_CASING_LAYER_ID)) map.removeLayer(ROUTE_CASING_LAYER_ID);
        if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);
        fittedRouteRef.current = null;
        return;
      }

      const featureCollection: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: route.geometry,
          },
        ],
      };

      const existingSource = map.getSource(ROUTE_SOURCE_ID) as GeoJSONSource | undefined;
      if (!existingSource) {
        map.addSource(ROUTE_SOURCE_ID, {
          type: 'geojson',
          data: featureCollection,
        });

        map.addLayer({
          id: ROUTE_CASING_LAYER_ID,
          type: 'line',
          source: ROUTE_SOURCE_ID,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 8,
            'line-opacity': 0.9,
          },
        });

        map.addLayer({
          id: ROUTE_LAYER_ID,
          type: 'line',
          source: ROUTE_SOURCE_ID,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#2563eb',
            'line-width': 5,
            'line-opacity': 0.9,
          },
        });
      } else {
        existingSource.setData(featureCollection);
      }

      const routeKey = JSON.stringify(route.geometry.coordinates);
      if (fittedRouteRef.current !== routeKey) {
        const [minLng, minLat, maxLng, maxLat] = route.bbox;
        const bounds = new maplibregl.LngLatBounds([minLng, minLat], [maxLng, maxLat]);

        map.fitBounds(bounds, {
          padding: { top: 170, right: 60, bottom: 140, left: 60 },
          duration: 800,
        });

        fittedRouteRef.current = routeKey;
      }
    };

    if (map.isStyleLoaded()) {
      applyRoute();
      return;
    }

    map.once('load', applyRoute);
    return () => {
      map.off('load', applyRoute);
    };
  }, [map, route]);

  useEffect(() => {
    return () => {
      originMarkerRef.current?.remove();
      destinationMarkerRef.current?.remove();
    };
  }, []);

  return null;
};

export default RouteLayer;
