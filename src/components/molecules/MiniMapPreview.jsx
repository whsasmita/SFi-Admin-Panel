import React, { useEffect, useRef } from 'react';
import { IconMapPin, IconCheck, IconAlertTriangle } from '../atoms/Icons.jsx';

/**
 * Molecule: MiniMapPreview
 * Interactive Leaflet spatial preview with territorial bounding box check,
 * draggable marker, and click-to-pin coordinate assignment.
 */
export default function MiniMapPreview({
  lat,
  lng,
  label,
  semanticRole = 'FLOOD',
  height = 260,
  canEdit = true,
  onCoordinateChange,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const onCoordChangeRef = useRef(onCoordinateChange);

  useEffect(() => {
    onCoordChangeRef.current = onCoordinateChange;
  }, [onCoordinateChange]);

  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  const isValid = !isNaN(numLat) && !isNaN(numLng) && numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;

  // Thailand Bounding Box Check (Lat 5.61 - 20.46, Lng 97.34 - 105.64)
  const isInsideThailand = isValid && numLat >= 5.61 && numLat <= 20.46 && numLng >= 97.34 && numLng <= 105.64;

  useEffect(() => {
    const L = typeof window !== 'undefined' ? window.L : null;
    if (!mapContainerRef.current || !L) return;

    // Initialize Leaflet map instance once
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [13.7563, 100.5018], // Bangkok Default
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Click-to-pin handler on map
      map.on('click', (e) => {
        if (onCoordChangeRef.current && e?.latlng) {
          const clickedLat = e.latlng.lat.toFixed(6);
          const clickedLng = e.latlng.lng.toFixed(6);
          onCoordChangeRef.current(clickedLat, clickedLng);
        }
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update marker and center when coordinates change
    if (isValid) {
      const isEvac = String(semanticRole).toUpperCase() === 'EVACUATION';
      const markerColor = isEvac ? '#059669' : '#dc2626';

      const customIcon = L.divIcon({
        className: 'custom-preview-pin',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: ${markerColor};
            border: 2px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            cursor: grab;
          " title="Drag pin or click map to adjust coordinates">
            ${isEvac ? 'E' : 'F'}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      if (markerRef.current) {
        markerRef.current.setLatLng([numLat, numLng]);
        markerRef.current.setIcon(customIcon);
      } else {
        const marker = L.marker([numLat, numLng], {
          icon: customIcon,
          draggable: Boolean(canEdit),
        }).addTo(map);

        marker.on('dragend', (ev) => {
          const pos = ev.target.getLatLng();
          if (onCoordChangeRef.current && pos) {
            onCoordChangeRef.current(pos.lat.toFixed(6), pos.lng.toFixed(6));
          }
        });

        markerRef.current = marker;
      }

      map.setView([numLat, numLng], Math.max(map.getZoom(), 11), { animate: true });
    } else {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      map.setView([13.7563, 100.5018], 5);
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => clearTimeout(timer);
  }, [numLat, numLng, isValid, semanticRole, canEdit]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={mapContainerRef}
        style={{
          height: `${height}px`,
          width: '100%',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          backgroundColor: '#f1f5f9',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
        }}
      />

      {/* Floating Coordinate Status Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          padding: '6px 10px',
          fontSize: 11.5,
          fontFamily: 'var(--font-mono)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconMapPin size={13} color={isValid ? '#0284c7' : '#94a3b8'} />
          {isValid ? (
            <span>
              Lat: <strong>{numLat.toFixed(6)}</strong> | Lng: <strong>{numLng.toFixed(6)}</strong>
            </span>
          ) : (
            <span style={{ color: '#64748b' }}>No coordinates assigned</span>
          )}
        </div>

        {isValid && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10.5,
              color: isInsideThailand ? '#059669' : '#dc2626',
              fontWeight: 600,
            }}
          >
            {isInsideThailand ? (
              <>
                <IconCheck size={12} color="#059669" />
                <span>Inside Thailand Bounding Box</span>
              </>
            ) : (
              <>
                <IconAlertTriangle size={12} color="#dc2626" />
                <span>Warning: Outside Thailand Border</span>
              </>
            )}
          </div>
        )}
        {canEdit && onCoordinateChange && (
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
            Click map or drag pin to update Lat, Lng
          </div>
        )}
      </div>
    </div>
  );
}
