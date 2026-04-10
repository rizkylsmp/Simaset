import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
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

const DEFAULT_CENTER = [-6.32, 106.45];
const DEFAULT_ZOOM = 13;

// ── helpers ──────────────────────────────────────────────
function getCoords(poly) {
  if (!poly) return null;
  const c =
    poly?.geometry?.coordinates?.[0] ||
    poly?.coordinates?.[0] ||
    (Array.isArray(poly?.[0]) ? poly[0] : null);
  return c && c.length >= 3 ? c : null;
}

function toLatLngs(coords) {
  return coords.map((c) => [c[1], c[0]]);
}

function toGeoJSON(latLngs) {
  const coords = latLngs.map((ll) => [ll.lng, ll.lat]);
  if (
    coords.length > 0 &&
    (coords[0][0] !== coords[coords.length - 1][0] ||
      coords[0][1] !== coords[coords.length - 1][1])
  ) {
    coords.push([...coords[0]]);
  }
  let area = null;
  try {
    area = L.GeometryUtil.geodesicArea(latLngs);
  } catch {
    /* no-op */
  }
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [coords] },
    properties: { luas: area ? Math.round(area) : null },
  };
}

// ── sub-component: fit bounds when polygon changes ───────
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length >= 3) {
      map.fitBounds(positions, { padding: [40, 40], maxZoom: 18 });
    }
  }, [positions, map]);
  return null;
}

// ── sub-component: Leaflet-draw polygon handler ──────────
function DrawHandler({ active, onCreated, onCancel }) {
  const map = useMap();
  const handlerRef = useRef(null);
  const onCreatedRef = useRef(onCreated);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCreatedRef.current = onCreated;
    onCancelRef.current = onCancel;
  }, [onCreated, onCancel]);

  useEffect(() => {
    if (!active) {
      if (handlerRef.current) {
        try {
          handlerRef.current.disable();
        } catch {
          /* already disabled */
        }
        handlerRef.current = null;
      }
      return;
    }

    const handler = new L.Draw.Polygon(map, {
      allowIntersection: false,
      shapeOptions: {
        color: "#22c55e",
        weight: 2,
        fillColor: "#22c55e",
        fillOpacity: 0.25,
      },
    });

    handler.enable();
    handlerRef.current = handler;

    const onDraw = (e) => {
      const latLngs = e.layer.getLatLngs()[0];
      const geoJSON = toGeoJSON(latLngs);
      // Remove the raw drawn layer – we render via react-leaflet <Polygon>
      map.removeLayer(e.layer);
      onCreatedRef.current?.(geoJSON);
    };

    map.on(L.Draw.Event.CREATED, onDraw);

    return () => {
      try {
        handler.disable();
      } catch {
        /* ok */
      }
      handlerRef.current = null;
      map.off(L.Draw.Event.CREATED, onDraw);
    };
  }, [active, map]);

  return null;
}

// ── main component ───────────────────────────────────────
export default function PolygonDrawMap({
  polygon,
  onChange,
  readOnly = false,
  height = "300px",
}) {
  const [drawing, setDrawing] = useState(false);

  const coords = getCoords(polygon);
  const positions = useMemo(
    () => (coords ? toLatLngs(coords) : null),
    [polygon],
  );

  const center = useMemo(() => {
    if (!positions || positions.length < 3) return DEFAULT_CENTER;
    const lats = positions.map((p) => p[0]);
    const lngs = positions.map((p) => p[1]);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
  }, [positions]);

  const area = polygon?.properties?.luas;

  const handleCreated = (geoJSON) => {
    setDrawing(false);
    onChange?.(geoJSON);
  };

  const handleCancel = () => setDrawing(false);

  return (
    <div className="space-y-2">
      {/* Header & actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
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
            {!drawing ? (
              <button
                type="button"
                onClick={() => setDrawing(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                <PencilSimpleIcon size={14} weight="bold" />
                {coords ? "Gambar Ulang" : "Gambar Polygon"}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg animate-pulse">
                <PolygonIcon size={14} weight="fill" />
                Klik titik pada peta...
              </span>
            )}
            {coords && !drawing && (
              <button
                type="button"
                onClick={() => {
                  setDrawing(false);
                  onChange?.(null);
                }}
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <TrashIcon size={14} weight="bold" />
                Hapus
              </button>
            )}
            {drawing && (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-secondary rounded-lg transition-colors"
              >
                Batal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Map – react-leaflet handles DOM lifecycle */}
      <MapContainer
        center={center}
        zoom={positions ? 17 : DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height, width: "100%", borderRadius: "0.75rem", zIndex: 0 }}
        className="border border-border"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={20}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={20}
          opacity={0.7}
        />

        {/* Show existing polygon */}
        {positions && !drawing && (
          <Polygon
            positions={positions}
            pathOptions={{
              color: "#22c55e",
              weight: 2,
              fillColor: "#22c55e",
              fillOpacity: 0.25,
            }}
          />
        )}

        {/* Fit map to polygon bounds */}
        {positions && <FitBounds positions={positions} />}

        {/* Draw handler – only active when user clicks "Gambar" */}
        <DrawHandler
          active={drawing}
          onCreated={handleCreated}
          onCancel={handleCancel}
        />
      </MapContainer>

      {/* Status */}
      {coords && !drawing && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
          <PolygonIcon size={12} weight="duotone" />
          <span>
            Polygon tersedia ({coords.length} titik)
            {area && ` · ${Number(area).toLocaleString("id-ID")} m²`}
          </span>
        </div>
      )}
      {!coords && !drawing && !readOnly && (
        <p className="text-[11px] text-text-muted">
          Klik &quot;Gambar Polygon&quot; lalu klik titik-titik pada peta. Klik
          titik pertama untuk menutup polygon.
        </p>
      )}
    </div>
  );
}
