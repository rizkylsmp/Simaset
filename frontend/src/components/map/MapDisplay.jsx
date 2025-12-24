import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Custom icon colors based on status
const getMarkerIcon = (status) => {
  const colors = {
    aktif: "#22c55e", // green
    berperkara: "#ef4444", // red
    tidak_aktif: "#f59e0b", // orange
    dijual: "#3b82f6", // blue
  };

  const color = colors[status] || "#6b7280";

  return L.divIcon({
    html: `<div style="background-color: ${color}; border: 3px solid white; border-radius: 50%; width: 28px; height: 28px; box-shadow: 0 3px 8px rgba(0,0,0,0.25);"></div>`,
    iconSize: [28, 28],
    className: "custom-marker",
  });
};

export default function MapContainer_({ assets, onMarkerClick }) {
  const defaultCenter = [-7.797068, 110.370529]; // Yogyakarta
  const defaultZoom = 12;

  return (
    <div className="flex-1 relative h-full" style={{ minHeight: "calc(100vh - 64px)" }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        className="map-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Markers */}
        {assets.map((asset) => (
          <Marker
            key={asset.id}
            position={[asset.latitude, asset.longitude]}
            icon={getMarkerIcon(asset.status)}
            eventHandlers={{
              click: () => onMarkerClick(asset),
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <strong className="text-gray-900">{asset.nama_aset}</strong>
                <br />
                <span className="text-gray-500">{asset.kode_aset}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 px-5 py-2.5 shadow-lg z-10">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <h1 className="font-semibold text-sm text-gray-900">Peta Interaktif Aset Tanah</h1>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-10">
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-100 font-medium">
          +
        </button>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-100 font-medium">
          −
        </button>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-100">
          ⛶
        </button>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors text-sm">
          📍
        </button>
      </div>
    </div>
  );
}
