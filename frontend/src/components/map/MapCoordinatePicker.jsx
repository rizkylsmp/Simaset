import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapTrifoldIcon,
  MapPinIcon,
  LightbulbIcon,
  XIcon,
  CheckIcon,
  ArrowsOutIcon,
} from "@phosphor-icons/react";

// Custom marker icon
const selectedIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; border: 3px solid white; border-radius: 50%; width: 24px; height: 24px; box-shadow: 0 3px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  className: "custom-marker",
});

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

// Component to recenter map when position changes
function MapRecenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { duration: 0.5 });
    }
  }, [position, map]);

  return null;
}

export default function MapCoordinatePicker({
  latitude,
  longitude,
  onCoordinateChange,
  label = "Pilih Lokasi di Peta",
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tempCoords, setTempCoords] = useState(null);
  const defaultCenter = [-7.6469, 112.9075]; // Kota Pasuruan

  // Determine map center and marker position
  const hasValidCoords =
    latitude && longitude && !isNaN(latitude) && !isNaN(longitude);
  const position = hasValidCoords
    ? [parseFloat(latitude), parseFloat(longitude)]
    : null;
  const mapCenter = position || defaultCenter;

  const handleLocationSelect = (lat, lng) => {
    if (isFullscreen) {
      setTempCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
    } else {
      onCoordinateChange(lat.toFixed(6), lng.toFixed(6));
    }
  };

  const handleOpenFullscreen = () => {
    setTempCoords(hasValidCoords ? { lat: latitude, lng: longitude } : null);
    setIsFullscreen(true);
  };

  const handleConfirmFullscreen = () => {
    if (tempCoords) {
      onCoordinateChange(tempCoords.lat, tempCoords.lng);
    }
    setIsFullscreen(false);
  };

  const handleCancelFullscreen = () => {
    setTempCoords(null);
    setIsFullscreen(false);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          onCoordinateChange(lat.toFixed(6), lng.toFixed(6));
        },
        (error) => {
          alert(
            "Tidak dapat mengakses lokasi. Pastikan izin lokasi diaktifkan.",
          );
        },
      );
    } else {
      alert("Browser tidak mendukung Geolocation");
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-text-primary">
        {label}
      </label>

      {/* Coordinate Display & Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="bg-surface-secondary border border-border rounded-lg px-3 py-1.5">
            <label className="text-xs text-text-tertiary block mb-0.5">
              Latitude
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={latitude || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || val === "-" || /^-?\d*\.?\d*$/.test(val)) {
                  onCoordinateChange(val, longitude || "");
                }
              }}
              placeholder="-7.6469"
              className="w-full text-sm font-medium text-text-primary bg-transparent outline-none placeholder:text-text-muted"
            />
          </div>
          <div className="bg-surface-secondary border border-border rounded-lg px-3 py-1.5">
            <label className="text-xs text-text-tertiary block mb-0.5">
              Longitude
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={longitude || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || val === "-" || /^-?\d*\.?\d*$/.test(val)) {
                  onCoordinateChange(latitude || "", val);
                }
              }}
              placeholder="112.9075"
              className="w-full text-sm font-medium text-text-primary bg-transparent outline-none placeholder:text-text-muted"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-2 bg-accent text-surface rounded-lg hover:opacity-90 transition text-sm font-medium h-full flex items-center gap-1.5"
          title={isExpanded ? "Tutup Peta" : "Buka Peta"}
        >
          <MapTrifoldIcon size={16} weight="bold" />{" "}
          {isExpanded ? "Tutup" : "Pilih"}
        </button>
        <button
          type="button"
          onClick={handleOpenFullscreen}
          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium h-full flex items-center gap-1.5"
          title="Buka Peta Fullscreen"
        >
          <ArrowsOutIcon size={16} weight="bold" />
        </button>
      </div>

      {/* Fullscreen Map Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-9999 bg-surface flex flex-col">
          {/* Fullscreen Header */}
          <div className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <MapPinIcon size={20} weight="bold" className="text-blue-500" />
              <div>
                <h3 className="font-semibold text-text-primary text-sm">
                  Pilih Koordinat Lokasi
                </h3>
                <p className="text-xs text-text-muted">
                  Klik pada peta untuk menentukan titik lokasi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tempCoords && (
                <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-mono">
                  {tempCoords.lat}, {tempCoords.lng}
                </span>
              )}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-xs bg-surface-secondary border border-border text-text-secondary px-3 py-1.5 rounded-lg hover:bg-surface-tertiary transition font-medium flex items-center gap-1.5"
              >
                <MapPinIcon size={14} weight="bold" /> Lokasi Saya
              </button>
              <button
                type="button"
                onClick={handleConfirmFullscreen}
                disabled={!tempCoords}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition disabled:opacity-40"
              >
                <CheckIcon size={16} weight="bold" /> Done
              </button>
              <button
                type="button"
                onClick={handleCancelFullscreen}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition"
              >
                <XIcon size={18} weight="bold" />
              </button>
            </div>
          </div>

          {/* Fullscreen Map */}
          <div className="flex-1 relative map-cursor-crosshair">
            <MapContainer
              center={
                tempCoords
                  ? [parseFloat(tempCoords.lat), parseFloat(tempCoords.lng)]
                  : mapCenter
              }
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              {tempCoords && (
                <Marker
                  position={[
                    parseFloat(tempCoords.lat),
                    parseFloat(tempCoords.lng),
                  ]}
                  icon={selectedIcon}
                />
              )}
              {tempCoords && (
                <MapRecenter
                  position={[
                    parseFloat(tempCoords.lat),
                    parseFloat(tempCoords.lng),
                  ]}
                />
              )}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Expandable Map */}
      {isExpanded && (
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Map Toolbar */}
          <div className="bg-surface-secondary px-3 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs text-text-secondary flex items-center gap-1.5">
              <MapPinIcon size={14} weight="bold" /> Klik pada peta untuk
              memilih lokasi
            </span>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-xs bg-accent/10 text-accent px-2 py-1 rounded hover:bg-accent/20 transition font-medium flex items-center gap-1"
            >
              <MapPinIcon size={12} weight="bold" /> Lokasi Saya
            </button>
          </div>

          {/* Map Container */}
          <div className="h-96 relative map-cursor-crosshair">
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />

              <MapClickHandler onLocationSelect={handleLocationSelect} />
              <MapRecenter position={position} />

              {/* Marker at selected position */}
              {position && <Marker position={position} icon={selectedIcon} />}
            </MapContainer>

            {/* Zoom Controls */}
            <div className="absolute bottom-2 right-2 bg-surface rounded-lg border border-border shadow-lg overflow-hidden z-1000">
              <button
                type="button"
                onClick={() => {
                  const mapEl = document.querySelector(".leaflet-container");
                  if (mapEl && mapEl._leaflet_map) {
                    mapEl._leaflet_map.zoomIn();
                  }
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors border-b border-border font-medium text-sm"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => {
                  const mapEl = document.querySelector(".leaflet-container");
                  if (mapEl && mapEl._leaflet_map) {
                    mapEl._leaflet_map.zoomOut();
                  }
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors font-medium text-sm"
              >
                −
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-surface-secondary px-3 py-2 border-t border-border">
            <p className="text-xs text-text-tertiary text-center flex items-center justify-center gap-1.5">
              <LightbulbIcon size={14} weight="bold" /> Geser peta dan klik
              untuk menentukan titik koordinat yang tepat
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
