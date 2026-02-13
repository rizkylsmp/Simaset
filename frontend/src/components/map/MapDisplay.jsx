import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import {
  MapPin,
  MapTrifold,
  Plus,
  Minus,
  ArrowsOutSimple,
  Crosshair,
  House,
  CheckCircle,
  Warning,
  Lightning,
  MinusCircle,
  Ruler,
  CalendarBlank,
  ArrowRight,
} from "@phosphor-icons/react";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icon colors based on status - consistent across app
const getMarkerIcon = (status) => {
  const colors = {
    aktif: "#10b981", // emerald-500
    berperkara: "#ef4444", // red-500
    tidak_aktif: "#f59e0b", // amber-500
    indikasi_berperkara: "#3b82f6", // blue-500
    "tidak aktif": "#f59e0b",
    "indikasi berperkara": "#3b82f6",
  };

  const icons = {
    aktif: "✓",
    berperkara: "!",
    tidak_aktif: "○",
    indikasi_berperkara: "⚡",
  };

  const color = colors[status?.toLowerCase()] || "#6b7280";
  const icon = icons[status?.toLowerCase()] || "•";

  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);
        border: 3px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        box-shadow: 0 4px 12px ${color}60, 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
      ">${icon}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    className: "custom-marker",
  });
};

// Zoom Controls Component (must be inside MapContainer)
function ZoomControls({ defaultCenter, defaultZoom }) {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleFullscreen = () => {
    const mapContainer = document.querySelector(".leaflet-container");
    if (!document.fullscreenElement) {
      mapContainer?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo([latitude, longitude], 15, { duration: 1.5 });
        },
        () => {
          // If geolocation fails, go back to default center
          map.flyTo(defaultCenter, defaultZoom, { duration: 1 });
        },
      );
    } else {
      // Fallback to default center
      map.flyTo(defaultCenter, defaultZoom, { duration: 1 });
    }
  };

  const handleResetView = () => {
    map.flyTo(defaultCenter, defaultZoom, { duration: 1 });
  };

  return (
    <div className="absolute bottom-4 right-4 bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl overflow-hidden z-1000">
      <button
        onClick={handleZoomIn}
        title="Perbesar"
        className="w-11 h-11 flex items-center justify-center hover:bg-surface-secondary text-text-secondary hover:text-accent transition-colors border-b border-border"
      >
        <Plus size={20} weight="bold" />
      </button>
      <button
        onClick={handleZoomOut}
        title="Perkecil"
        className="w-11 h-11 flex items-center justify-center hover:bg-surface-secondary text-text-secondary hover:text-accent transition-colors border-b border-border"
      >
        <Minus size={20} weight="bold" />
      </button>
      <button
        onClick={handleFullscreen}
        title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
        className="w-11 h-11 flex items-center justify-center hover:bg-surface-secondary text-text-secondary hover:text-accent transition-colors border-b border-border"
      >
        <ArrowsOutSimple size={18} weight="bold" />
      </button>
      <button
        onClick={handleLocate}
        title="Lokasi Saya"
        className="w-11 h-11 flex items-center justify-center hover:bg-surface-secondary text-text-secondary hover:text-accent transition-colors border-b border-border"
      >
        <Crosshair size={18} weight="bold" />
      </button>
      <button
        onClick={handleResetView}
        title="Reset View"
        className="w-11 h-11 flex items-center justify-center hover:bg-surface-secondary text-text-secondary hover:text-accent transition-colors"
      >
        <House size={18} weight="bold" />
      </button>
    </div>
  );
}

export default function MapContainer_({
  assets,
  onMarkerClick,
  showMarkers = true,
  showPolygons = true,
}) {
  const defaultCenter = [-7.6469, 112.9075]; // Kota Pasuruan, Jawa Timur
  const defaultZoom = 13;

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase().replace(/\s+/g, "_");
    const configs = {
      aktif: { label: "Aktif", color: "emerald", dot: "#10b981" },
      berperkara: { label: "Berperkara", color: "red", dot: "#ef4444" },
      indikasi_berperkara: {
        label: "Indikasi Berperkara",
        color: "blue",
        dot: "#3b82f6",
      },
      tidak_aktif: { label: "Tidak Aktif", color: "amber", dot: "#f59e0b" },
    };
    return (
      configs[s] || { label: status || "-", color: "gray", dot: "#6b7280" }
    );
  };

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        className="map-container"
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Polygons */}
        {showPolygons &&
          assets
            .filter(
              (asset) =>
                asset.polygon &&
                Array.isArray(asset.polygon) &&
                asset.polygon.length >= 3,
            )
            .map((asset) => {
              const polygonColors = {
                aktif: { color: "#10b981", fillColor: "#10b981" },
                berperkara: { color: "#ef4444", fillColor: "#ef4444" },
                tidak_aktif: { color: "#f59e0b", fillColor: "#f59e0b" },
                indikasi_berperkara: { color: "#3b82f6", fillColor: "#3b82f6" },
              };
              const statusKey = asset.status
                ?.toLowerCase()
                .replace(/\s+/g, "_");
              const colors = polygonColors[statusKey] || {
                color: "#6b7280",
                fillColor: "#6b7280",
              };
              // polygon_bidang stored as array of [lat, lng]
              const positions = asset.polygon.map((p) =>
                Array.isArray(p) ? p : [p.lat, p.lng],
              );
              return (
                <Polygon
                  key={`poly-${asset.id}`}
                  positions={positions}
                  pathOptions={{
                    color: colors.color,
                    fillColor: colors.fillColor,
                    fillOpacity: 0.25,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => onMarkerClick(asset),
                  }}
                >
                  <Tooltip sticky>
                    <span className="text-xs font-semibold">
                      {asset.nama_aset}
                    </span>
                  </Tooltip>
                </Polygon>
              );
            })}

        {/* Markers */}
        {showMarkers &&
          assets.map((asset) => (
            <Marker
              key={asset.id}
              position={[asset.latitude, asset.longitude]}
              icon={getMarkerIcon(asset.status)}
              eventHandlers={{
                click: () => onMarkerClick(asset),
              }}
            >
              <Popup>
                {(() => {
                  const sc = getStatusConfig(asset.status);
                  return (
                    <div className="popup-card">
                      {/* Popup Header */}
                      <div className="bg-linear-to-r from-accent to-accent/80 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                            <MapPin
                              size={16}
                              weight="fill"
                              className="text-white"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-sm text-white truncate leading-tight">
                              {asset.nama_aset}
                            </h3>
                            <p className="text-[10px] text-white/70 font-mono mt-0.5">
                              {asset.kode_aset}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Popup Body */}
                      <div className="p-3.5 space-y-3">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sc.dot }}
                          />
                          <span className="text-xs font-semibold text-text-primary capitalize">
                            {sc.label}
                          </span>
                        </div>

                        {/* Location */}
                        {asset.lokasi && (
                          <div className="flex items-start gap-2 text-text-secondary">
                            <MapPin
                              size={13}
                              className="shrink-0 mt-0.5 text-text-muted"
                            />
                            <span className="text-xs leading-relaxed line-clamp-2">
                              {asset.lokasi}
                            </span>
                          </div>
                        )}

                        {/* Info Row */}
                        <div className="flex gap-2">
                          {asset.luas && asset.luas !== "0" && (
                            <div className="flex-1 bg-surface-secondary rounded-lg px-2.5 py-2">
                              <div className="flex items-center gap-1 text-text-muted mb-0.5">
                                <Ruler size={11} />
                                <span className="text-[9px] uppercase tracking-wider font-medium">
                                  Luas
                                </span>
                              </div>
                              <p className="text-xs font-bold text-text-primary">
                                {parseFloat(asset.luas).toLocaleString("id-ID")}{" "}
                                m²
                              </p>
                            </div>
                          )}
                          {asset.tahun && asset.tahun !== "-" && (
                            <div className="flex-1 bg-surface-secondary rounded-lg px-2.5 py-2">
                              <div className="flex items-center gap-1 text-text-muted mb-0.5">
                                <CalendarBlank size={11} />
                                <span className="text-[9px] uppercase tracking-wider font-medium">
                                  Tahun
                                </span>
                              </div>
                              <p className="text-xs font-bold text-text-primary">
                                {asset.tahun}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* CTA Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkerClick(asset);
                          }}
                          className="w-full bg-accent text-white dark:text-gray-900 text-xs font-semibold py-2 px-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Lihat Detail</span>
                          <ArrowRight size={13} weight="bold" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </Popup>
            </Marker>
          ))}

        {/* Zoom Controls - Inside MapContainer to access map instance */}
        <ZoomControls defaultCenter={defaultCenter} defaultZoom={defaultZoom} />
      </MapContainer>

      {/* Map Title - Hidden on mobile */}
      <div className="hidden sm:block absolute top-4 left-1/2 transform -translate-x-1/2 bg-surface/95 backdrop-blur-sm rounded-xl border border-border px-5 py-3 shadow-xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center">
            <MapTrifold size={20} weight="fill" className="text-accent" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-text-primary">
              Peta Interaktif Aset
            </h1>
            <p className="text-[10px] text-text-muted">
              Kota Pasuruan, Jawa Timur
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
