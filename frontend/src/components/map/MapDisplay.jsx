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
    html: `<div style="background-color: ${color}; border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    className: "custom-marker",
  });
};

export default function MapContainer_({ assets, onMarkerClick }) {
  const defaultCenter = [-7.797068, 110.370529]; // Yogyakarta
  const defaultZoom = 12;

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
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
              <div className="text-xs">
                <strong>{asset.nama_aset}</strong>
                <br />
                <small>{asset.kode_aset}</small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white border-2 border-black px-4 py-2 z-10">
        <h1 className="font-bold text-sm">PETA INTERAKTIF ASET TANAH</h1>
      </div>

      {/* Zoom Controls Info */}
      <div className="absolute bottom-4 right-4 bg-white border-2 border-black px-3 py-3 space-y-2 z-10">
        <button className="border-2 border-black w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold">
          +
        </button>
        <button className="border-2 border-black w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold">
          −
        </button>
        <button className="border-2 border-black w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold">
          ⛶
        </button>
        <button className="border-2 border-black w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-sm">
          📍
        </button>
      </div>
    </div>
  );
}
