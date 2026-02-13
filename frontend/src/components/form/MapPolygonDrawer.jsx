import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapTrifold,
  Polygon as PolygonIcon,
  Trash,
  ArrowCounterClockwise,
  Lightbulb,
  MapPin,
  PencilSimple,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Crosshair,
  House,
} from "@phosphor-icons/react";

// Vertex marker icon
const vertexIcon = L.divIcon({
  html: `<div style="background:#3b82f6;border:2px solid white;border-radius:50%;width:14px;height:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:grab;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: "polygon-vertex",
});

const activeVertexIcon = L.divIcon({
  html: `<div style="background:#ef4444;border:2px solid white;border-radius:50%;width:16px;height:16px;box-shadow:0 2px 8px rgba(239,68,68,0.4);cursor:grab;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: "polygon-vertex-active",
});

// Click handler for adding new points
function DrawClickHandler({ isDrawing, onAddPoint }) {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        onAddPoint([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

// Zoom controls
function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-3 right-3 bg-surface/95 backdrop-blur-sm rounded-lg border border-border shadow-lg overflow-hidden z-1000">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="w-9 h-9 flex items-center justify-center hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors border-b border-border text-sm font-bold"
      >
        <Plus size={16} weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="w-9 h-9 flex items-center justify-center hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors text-sm font-bold"
      >
        <Minus size={16} weight="bold" />
      </button>
    </div>
  );
}

// Fit map to polygon bounds
function FitBounds({ points }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (points && points.length >= 2 && !fitted.current) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
      fitted.current = true;
    }
  }, [points, map]);

  return null;
}

export default function MapPolygonDrawer({
  polygonData,
  onPolygonChange,
  label = "Gambar Polygon Bidang Tanah",
  centerLat,
  centerLng,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);

  const defaultCenter = [-7.6469, 112.9075];
  const hasCenter =
    centerLat && centerLng && !isNaN(centerLat) && !isNaN(centerLng);
  const mapCenter = hasCenter
    ? [parseFloat(centerLat), parseFloat(centerLng)]
    : defaultCenter;

  // Initialize from existing data
  useEffect(() => {
    if (polygonData && Array.isArray(polygonData) && polygonData.length >= 3) {
      setPoints(
        polygonData.map((p) => (Array.isArray(p) ? p : [p.lat, p.lng])),
      );
    }
  }, []);

  // Sync changes to parent
  const syncToParent = useCallback(
    (newPoints) => {
      if (newPoints.length >= 3) {
        onPolygonChange(newPoints);
      } else {
        onPolygonChange(null);
      }
    },
    [onPolygonChange],
  );

  const handleAddPoint = (point) => {
    const newPoints = [...points, point];
    setPoints(newPoints);
    syncToParent(newPoints);
  };

  const handleRemoveLastPoint = () => {
    if (points.length > 0) {
      const newPoints = points.slice(0, -1);
      setPoints(newPoints);
      syncToParent(newPoints);
    }
  };

  const handleClearAll = () => {
    setPoints([]);
    setIsDrawing(false);
    onPolygonChange(null);
  };

  const handleStartDraw = () => {
    setIsDrawing(true);
  };

  const handleFinishDraw = () => {
    setIsDrawing(false);
  };

  const handleVertexDrag = (index, newPos) => {
    const newPoints = [...points];
    newPoints[index] = [newPos.lat, newPos.lng];
    setPoints(newPoints);
    syncToParent(newPoints);
  };

  const handleRemoveVertex = (index) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
    syncToParent(newPoints);
  };

  const hasPolygon = points.length >= 3;
  const pointCount = points.length;

  // Calculate area (approximate in m²)
  const calculateArea = () => {
    if (points.length < 3) return 0;
    // Shoelace formula with lat/lng to meters approximation
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const lat1 = (points[i][0] * Math.PI) / 180;
      const lat2 = (points[j][0] * Math.PI) / 180;
      const dLng = ((points[j][1] - points[i][1]) * Math.PI) / 180;
      area += dLng * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    area = Math.abs((area * 6378137 * 6378137) / 2);
    return area;
  };

  const formatArea = (area) => {
    if (area === 0) return "-";
    if (area < 10000) return `${area.toFixed(1)} m²`;
    return `${(area / 10000).toFixed(2)} ha`;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-text-primary">
        {label}
      </label>

      {/* Polygon Status & Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-surface-secondary border border-border rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            {hasPolygon ? (
              <>
                <PolygonIcon
                  size={16}
                  weight="fill"
                  className="text-emerald-500"
                />
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    {pointCount} titik
                  </span>
                  <span className="text-xs text-text-muted ml-2">
                    ~ {formatArea(calculateArea())}
                  </span>
                </div>
              </>
            ) : (
              <>
                <PolygonIcon
                  size={16}
                  weight="regular"
                  className="text-text-muted"
                />
                <span className="text-sm text-text-muted">
                  Belum ada polygon
                </span>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-2.5 bg-accent text-surface rounded-lg hover:opacity-90 transition text-sm font-medium flex items-center gap-1.5"
        >
          <PolygonIcon size={16} weight="bold" />
          {isExpanded ? "Tutup" : hasPolygon ? "Edit" : "Gambar"}
        </button>
      </div>

      {/* Expandable Map Area */}
      {isExpanded && (
        <div className="border border-border rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="bg-surface-secondary px-3 py-2 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              {!isDrawing ? (
                <button
                  type="button"
                  onClick={handleStartDraw}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent text-surface rounded-lg text-xs font-semibold hover:opacity-90 transition shadow-sm"
                >
                  <PencilSimple size={14} weight="bold" />
                  Mulai Gambar
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleFinishDraw}
                    disabled={points.length < 3}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500 text-surface rounded-lg text-xs font-semibold hover:opacity-90 transition shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle size={14} weight="bold" />
                    Selesai
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLastPoint}
                    disabled={points.length === 0}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-secondary transition disabled:opacity-40"
                  >
                    <ArrowCounterClockwise size={14} weight="bold" />
                    Undo
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {hasPolygon && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                >
                  <Trash size={14} weight="bold" />
                  Hapus Semua
                </button>
              )}
            </div>
          </div>

          {/* Drawing instruction bar */}
          {isDrawing && (
            <div className="bg-accent/10 border-b border-accent/20 px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-medium text-accent">
                Klik pada peta untuk menambahkan titik polygon (min. 3 titik)
              </span>
              <span className="text-xs text-text-muted ml-auto">
                {pointCount} titik
              </span>
            </div>
          )}

          {/* Map */}
          <div className="h-80 relative">
            <MapContainer
              center={mapCenter}
              zoom={hasPolygon ? 16 : 15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />

              <DrawClickHandler
                isDrawing={isDrawing}
                onAddPoint={handleAddPoint}
              />

              {hasPolygon && <FitBounds points={points} />}

              {/* Polygon shape */}
              {points.length >= 3 && (
                <Polygon
                  positions={points}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: isDrawing ? "8 4" : null,
                  }}
                />
              )}

              {/* Drawing preview line (connect points in order) */}
              {isDrawing && points.length >= 2 && points.length < 3 && (
                <Polygon
                  positions={points}
                  pathOptions={{
                    color: "#3b82f6",
                    fillOpacity: 0,
                    weight: 2,
                    dashArray: "8 4",
                  }}
                />
              )}

              {/* Vertex markers - draggable when not drawing */}
              {points.map((point, idx) => (
                <Marker
                  key={`vertex-${idx}`}
                  position={point}
                  icon={dragIndex === idx ? activeVertexIcon : vertexIcon}
                  draggable={!isDrawing}
                  eventHandlers={{
                    dragstart: () => setDragIndex(idx),
                    drag: (e) => {
                      handleVertexDrag(idx, e.target.getLatLng());
                    },
                    dragend: (e) => {
                      handleVertexDrag(idx, e.target.getLatLng());
                      setDragIndex(null);
                    },
                    contextmenu: (e) => {
                      e.originalEvent.preventDefault();
                      if (points.length > 3) {
                        handleRemoveVertex(idx);
                      }
                    },
                  }}
                />
              ))}

              <ZoomControls />
            </MapContainer>
          </div>

          {/* Point List & Info */}
          <div className="bg-surface-secondary border-t border-border">
            {hasPolygon && (
              <div className="px-3 py-2 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-text-muted">
                      <span className="font-semibold text-text-primary">
                        {pointCount}
                      </span>{" "}
                      titik
                    </span>
                    <span className="text-text-muted">
                      Luas:{" "}
                      <span className="font-semibold text-text-primary">
                        {formatArea(calculateArea())}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Help text */}
            <div className="px-3 py-2">
              <p className="text-xs text-text-tertiary flex items-center gap-1.5">
                <Lightbulb size={14} weight="bold" className="shrink-0" />
                {isDrawing
                  ? 'Klik peta untuk tambah titik. Tekan "Selesai" jika sudah.'
                  : hasPolygon
                    ? "Seret titik untuk mengubah bentuk. Klik kanan titik untuk menghapus."
                    : 'Klik "Mulai Gambar" lalu klik peta untuk membuat polygon.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
