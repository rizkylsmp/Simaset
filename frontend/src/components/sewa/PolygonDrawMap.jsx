import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  PencilSimpleIcon,
  TrashIcon,
  PolygonIcon,
  MapTrifoldIcon,
} from "@phosphor-icons/react";

// Default center: Kabupaten Tangerang area
const DEFAULT_CENTER = [-6.32, 106.45];
const DEFAULT_ZOOM = 13;

export default function PolygonDrawMap({
  polygon,
  onChange,
  readOnly = false,
  height = "300px",
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const drawnItems = useRef(null);
  const polygonLayer = useRef(null);
  const onChangeRef = useRef(onChange);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Keep onChange ref current
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Extract coordinates from various polygon formats
  const getCoords = (poly) => {
    if (!poly) return null;
    const coords =
      poly?.geometry?.coordinates?.[0] ||
      poly?.coordinates?.[0] ||
      (Array.isArray(poly?.[0]) ? poly[0] : null);
    if (!coords || coords.length < 3) return null;
    return coords;
  };

  // Convert coords [lng, lat] to Leaflet [lat, lng]
  const toLatLngs = (coords) => coords.map((c) => [c[1], c[0]]);

  // Convert Leaflet LatLngs to GeoJSON Feature
  const toGeoJSON = (latLngs) => {
    const coords = latLngs.map((ll) => [ll.lng, ll.lat]);
    // Close the ring
    if (
      coords.length > 0 &&
      (coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1])
    ) {
      coords.push([...coords[0]]);
    }

    // Calculate area (approximate in m²)
    const area = L.GeometryUtil ? L.GeometryUtil.geodesicArea(latLngs) : null;

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
      properties: {
        luas: area ? Math.round(area) : null,
      },
    };
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    // Satellite tile
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 20 },
    ).addTo(map);

    // Labels overlay
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 20, opacity: 0.7 },
    ).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    // Feature group for drawn items
    const drawn = new L.FeatureGroup();
    map.addLayer(drawn);
    drawnItems.current = drawn;

    // Handle draw events
    map.on(L.Draw.Event.CREATED, (e) => {
      drawn.clearLayers();
      const layer = e.layer;
      drawn.addLayer(layer);
      polygonLayer.current = layer;
      setIsDrawing(false);

      const latLngs = layer.getLatLngs()[0];
      const geoJSON = toGeoJSON(latLngs);
      onChangeRef.current?.(geoJSON);
    });

    map.on(L.Draw.Event.DRAWSTART, () => setIsDrawing(true));
    map.on(L.Draw.Event.DRAWSTOP, () => setIsDrawing(false));

    mapInstance.current = map;

    // Force invalidateSize after modal renders (multiple attempts)
    requestAnimationFrame(() => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 300);
    setTimeout(() => {
      map.invalidateSize();
      setMapReady(true);
    }, 500);

    return () => {
      map.remove();
      mapInstance.current = null;
      setMapReady(false);
    };
  }, []);

  // Render existing polygon when prop changes
  useEffect(() => {
    if (!mapInstance.current || !drawnItems.current) return;

    const coords = getCoords(polygon);
    drawnItems.current.clearLayers();
    polygonLayer.current = null;

    if (coords) {
      const latLngs = toLatLngs(coords);
      const layer = L.polygon(latLngs, {
        color: "#22c55e",
        weight: 2,
        fillColor: "#22c55e",
        fillOpacity: 0.25,
      });
      drawnItems.current.addLayer(layer);
      polygonLayer.current = layer;

      // Fit bounds
      const bounds = layer.getBounds();
      mapInstance.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
    }
  }, [polygon]);

  // ResizeObserver to handle modal animation / container resize
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      mapInstance.current?.invalidateSize();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const startDraw = () => {
    if (!mapInstance.current || readOnly) return;
    // Programmatically trigger polygon draw
    const handler = new L.Draw.Polygon(mapInstance.current, {
      allowIntersection: false,
      shapeOptions: {
        color: "#22c55e",
        weight: 2,
        fillColor: "#22c55e",
        fillOpacity: 0.25,
      },
    });
    handler.enable();
  };

  const clearPolygon = () => {
    if (!drawnItems.current) return;
    drawnItems.current.clearLayers();
    polygonLayer.current = null;
    onChangeRef.current?.(null);
  };

  const coords = getCoords(polygon);
  const area = polygon?.properties?.luas;

  return (
    <div className="space-y-2">
      {/* Header & actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapTrifoldIcon
            size={16}
            weight="fill"
            className="text-emerald-500"
          />
          <span className="text-sm font-medium text-text-secondary">
            Polygon Sewa
          </span>
          {coords && area && (
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {Number(area).toLocaleString("id-ID")} m²
            </span>
          )}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1.5">
            {!isDrawing ? (
              <button
                type="button"
                onClick={startDraw}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                <PencilSimpleIcon size={14} weight="bold" />
                {coords ? "Gambar Ulang" : "Gambar Polygon"}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg animate-pulse">
                <PolygonIcon size={14} weight="fill" />
                Klik pada peta untuk menggambar...
              </span>
            )}
            {coords && (
              <button
                type="button"
                onClick={clearPolygon}
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <TrashIcon size={14} weight="bold" />
                Hapus
              </button>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        style={{ height, position: "relative", zIndex: 0 }}
        className="w-full rounded-xl border border-border overflow-hidden"
      />

      {/* Status */}
      {coords && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
          <PolygonIcon size={12} weight="duotone" />
          <span>
            Polygon tersedia ({coords.length} titik)
            {polygon?.properties?.luas &&
              ` · ${Number(polygon.properties.luas).toLocaleString("id-ID")} m²`}
          </span>
        </div>
      )}
      {!coords && !isDrawing && !readOnly && (
        <p className="text-[11px] text-text-muted">
          Klik "Gambar Polygon" lalu klik titik-titik pada peta. Klik titik
          pertama untuk menutup polygon.
        </p>
      )}
    </div>
  );
}
