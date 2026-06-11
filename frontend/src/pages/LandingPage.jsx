import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polygon,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ArrowRightIcon,
  BuildingsIcon,
  RulerIcon,
  TagIcon,
  PhoneIcon,
  EnvelopeSimpleIcon,
  StorefrontIcon,
  SignInIcon,
  CaretLeftIcon,
  CaretRightIcon,
  XIcon,
  WhatsappLogoIcon,
  ImageIcon,
  SunIcon,
  MoonIcon,
  FunnelIcon,
  MapTrifoldIcon,
  HandshakeIcon,
  PaperPlaneTiltIcon,
  CheckCircleIcon,
  CircleNotchIcon,
  UserIcon,
  ListIcon,
  StackIcon,
  PolygonIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  WarningCircleIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CalendarIcon,
} from "@phosphor-icons/react";
import {
  sewaService,
  petaService,
  authService,
} from "../services/api";
import { useThemeStore } from "../stores/themeStore";
import { useAuthStore } from "../stores/authStore";
import { useSessionStore } from "../stores/sessionStore";
import SewaPolygonMap from "../components/sewa/SewaPolygonMap";
import pasuruanLogo from "../assets/images/pasuruanLogo.png";

const PUBLIC_BASEMAP_OPTIONS = [
  {
    id: "maplibre",
    label: "MapLibre",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  },
  {
    id: "osm",
    label: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
  {
    id: "esri_satellite",
    label: "ESRI Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
];

const CERTIFICATE_COLORS = {
  certified: { color: "#0ea5e9", stroke: "#0369a1" },
  uncertified: { color: "#ef4444", stroke: "#b91c1c" },
  unknown: { color: "#9ca3af", stroke: "#6b7280" },
};

const isAssetCertified = (asset) => {
  const certificateStatus = String(
    asset?.status_sertifikat ||
      asset?.statusSertifikat ||
      asset?.["STATUS SERTIFIKAT"] ||
      "",
  ).toLowerCase();
  if (
    certificateStatus.includes("belum") ||
    certificateStatus.includes("tidak")
  ) {
    return false;
  }
  if (
    certificateStatus.includes("sudah") ||
    certificateStatus.includes("telah") ||
    certificateStatus.includes("bersertifikat")
  ) {
    return true;
  }

  const certificateNumber = String(
    asset?.nomor_sertifikat || asset?.nomorSertifikat || asset?.["NOMOR HAK"] || "",
  ).trim();
  return certificateNumber.length > 10 ? true : null;
};

const getCertificateMapStyle = (asset) => {
  const certified = isAssetCertified(asset);
  if (certified === true) return CERTIFICATE_COLORS.certified;
  if (certified === false) return CERTIFICATE_COLORS.uncertified;
  return CERTIFICATE_COLORS.unknown;
};

const getAssetLatLng = (asset = {}) => {
  const lat = Number(asset.latitude ?? asset.lat);
  const lng = Number(asset.longitude ?? asset.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ============================================================
// FLY TO ASSET (zoom + open popup)
// ============================================================
function FlyToAsset({ target, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    const position = getAssetLatLng(target);
    if (!position) return;
    map.flyTo(position, 18, { duration: 1 });
    // Open popup after fly animation completes
    const timer = setTimeout(() => {
      const ref = markerRefs.current?.[target.id];
      if (ref) ref.openPopup();
    }, 1100);
    return () => clearTimeout(timer);
  }, [target, map, markerRefs]);
  return null;
}

// ============================================================
// MAP MARKERS (zoom-responsive)
// ============================================================
function MarkerNumberCanvas({ markers, visible }) {
  const map = useMap();
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = map.getSize();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = size.x * ratio;
    canvas.height = size.y * ratio;
    canvas.style.width = `${size.x}px`;
    canvas.style.height = `${size.y}px`;

    const topLeft = map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(canvas, topLeft);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, size.x, size.y);

    if (!visible) return;

    const zoom = map.getZoom();
    const fontSize = zoom >= 17 ? 9 : 8;
    ctx.font = `800 ${fontSize}px Inter, ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(15, 23, 42, 0.62)";
    ctx.lineWidth = 2.4;

    markers.forEach(({ position, number }) => {
      const point = map.latLngToLayerPoint(position).subtract(topLeft);
      if (
        point.x < -16 ||
        point.y < -16 ||
        point.x > size.x + 16 ||
        point.y > size.y + 16
      ) {
        return;
      }

      const label = String(number);
      ctx.strokeText(label, point.x, point.y + 0.2);
      ctx.fillText(label, point.x, point.y + 0.2);
    });
  }, [map, markers, visible]);

  useEffect(() => {
    const canvas = L.DomUtil.create(
      "canvas",
      "simaset-marker-number-canvas",
    );
    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "420";
    canvasRef.current = canvas;
    map.getPanes().overlayPane.appendChild(canvas);

    draw();
    map.on("move zoom resize zoomend moveend", draw);

    return () => {
      map.off("move zoom resize zoomend moveend", draw);
      canvas.remove();
      canvasRef.current = null;
    };
  }, [draw, map]);

  useEffect(() => {
    draw();
  }, [draw]);

  return null;
}

function ZoomMarkers({ assets, onLogin, markerRefs }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const canvasRenderer = useMemo(() => L.canvas({ padding: 0.4 }), []);

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on("zoomend", onZoom);
    return () => map.off("zoomend", onZoom);
  }, [map]);

  const radius = Math.max(5, Math.min(9, 5 + (zoom - 12) * 0.7));
  const showMarkerNumbers = zoom >= 14;
  const markerItems = useMemo(
    () =>
      assets
        .map((asset) => ({ asset, position: getAssetLatLng(asset) }))
        .filter((item) => item.position)
        .map((item, index) => ({
          ...item,
          number: index + 1,
        })),
    [assets],
  );

  return (
    <>
      <MarkerNumberCanvas markers={markerItems} visible={showMarkerNumbers} />
      {markerItems.map(({ asset: a, position }) => (
      <CircleMarker
        key={a.id || a.id_aset || `${position[0]}-${position[1]}`}
        center={position}
        radius={radius}
        renderer={canvasRenderer}
        ref={(el) => {
          if (el && markerRefs.current && a.id) markerRefs.current[a.id] = el;
        }}
        pathOptions={{
          color: getCertificateMapStyle(a).stroke,
          weight: 1.4,
          fillColor: getCertificateMapStyle(a).color,
          fillOpacity: 0.85,
        }}
      >
        <Popup maxWidth={260}>
          <div className="font-sans p-1">
            <div className="font-bold text-sm text-text-primary mb-1">
              {a.nama_aset}
            </div>
            {a.lokasi && (
              <p className="text-xs text-text-muted mb-1">📍 {a.lokasi}</p>
            )}
            {a.luas && (
              <p className="text-xs text-text-muted">
                📐 {Number(a.luas).toLocaleString("id-ID")} m²
              </p>
            )}
            <button
              onClick={() => onLogin?.()}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-surface text-xs font-semibold rounded-lg transition-colors"
            >
              <SignInIcon size={13} weight="bold" />
              Login untuk Detail
            </button>
          </div>
        </Popup>
      </CircleMarker>
      ))}
    </>
  );
}

function getLeafletPolygonPoints(polygon) {
  if (!polygon) return null;

  const normalizeGeojsonPoint = (point) => {
    if (!Array.isArray(point) || point.length < 2) return null;
    const lng = Number(point[0]);
    const lat = Number(point[1]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  };

  const normalizeLatLngPoint = (point) => {
    if (Array.isArray(point)) {
      const lat = Number(point[0]);
      const lng = Number(point[1]);
      return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
    }
    const lat = Number(point?.lat);
    const lng = Number(point?.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  };

  const coordinates =
    polygon?.type === "FeatureCollection"
      ? polygon.features?.find((feature) => feature?.geometry?.type === "Polygon")
          ?.geometry?.coordinates?.[0]
      : polygon?.geometry?.coordinates?.[0] || polygon?.coordinates?.[0];

  if (coordinates) {
    const points = coordinates.map(normalizeGeojsonPoint).filter(Boolean);
    return points.length >= 3 ? points : null;
  }

  if (Array.isArray(polygon)) {
    const rawRing = Array.isArray(polygon[0]?.[0]) ? polygon[0] : polygon;
    const points = rawRing.map(normalizeLatLngPoint).filter(Boolean);
    return points.length >= 3 ? points : null;
  }

  return null;
}

function AssetPolygons({ assets = [], onLogin }) {
  return assets
    .map((asset) => ({
      asset,
      points: getLeafletPolygonPoints(
        asset.polygon || asset.polygon_bidang || asset.polygon_sewa,
      ),
    }))
    .filter((item) => item.points)
    .map(({ asset, points }) => (
      <Polygon
        key={`polygon-${asset.id}`}
        positions={points}
        pathOptions={{
          color: getCertificateMapStyle(asset).stroke,
          weight: 1.5,
          fillColor: getCertificateMapStyle(asset).color,
          fillOpacity: 0.15,
        }}
      >
        <Popup maxWidth={260}>
          <div className="font-sans p-1">
            <div className="font-bold text-sm text-text-primary mb-1">
              {asset.nama_aset}
            </div>
            {asset.lokasi && (
              <p className="text-xs text-text-muted mb-1">{asset.lokasi}</p>
            )}
            <button
              onClick={() => onLogin?.()}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-surface text-xs font-semibold rounded-lg transition-colors"
            >
              <SignInIcon size={13} weight="bold" />
              Login untuk Detail
            </button>
          </div>
        </Popup>
      </Polygon>
    ));
}

function PublicMapLayerControl({
  activeBaseLayer,
  setActiveBaseLayer,
  showMarkers,
  setShowMarkers,
  showPolygons,
  setShowPolygons,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-3 right-3 z-20">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface/95 text-text-primary shadow-lg backdrop-blur-md hover:bg-surface-secondary transition"
        title="Layer peta"
        aria-label="Layer peta"
      >
        <StackIcon size={19} weight="fill" />
      </button>
      {open && (
        <div className="mt-2 w-60 rounded-xl border border-border bg-surface/95 p-3 shadow-xl backdrop-blur-md">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">
              Pilih Layer Map
            </p>
            <div className="space-y-1.5">
              {PUBLIC_BASEMAP_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-text-secondary hover:bg-surface-secondary"
                  title={option.label}
                >
                  <input
                    type="radio"
                    name="landing-basemap"
                    checked={activeBaseLayer === option.id}
                    onChange={() => setActiveBaseLayer(option.id)}
                    className="h-3.5 w-3.5 accent-accent"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="my-3 border-t border-border/70" />

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">
              Tampilan Layer
            </p>
            <div className="space-y-1.5">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-text-secondary hover:bg-surface-secondary">
              <input
                type="checkbox"
                checked={showMarkers}
                onChange={(e) => setShowMarkers(e.target.checked)}
                className="h-3.5 w-3.5 accent-accent"
              />
              <MapPinIcon size={14} weight="fill" className="text-sky-600" />
              Tampilkan marker
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-text-secondary hover:bg-surface-secondary">
              <input
                type="checkbox"
                checked={showPolygons}
                onChange={(e) => setShowPolygons(e.target.checked)}
                className="h-3.5 w-3.5 accent-accent"
              />
              <PolygonIcon size={14} weight="fill" className="text-sky-600" />
              Tampilkan polygon
            </label>
            {!showMarkers && !showPolygons && (
              <p className="px-2 pt-1 text-[10px] text-text-muted">
                Default menampilkan marker.
              </p>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ASSET DETAIL MODAL
// ============================================================
function AssetDetailModal({ item, onClose, onApply }) {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  if (!item) return null;

  const aset = item.aset || {};
  const photos = item.foto_sewa?.length
    ? item.foto_sewa
    : aset.foto_aset
      ? [aset.foto_aset]
      : [];

  const lokasi = aset.lokasi || item.lokasi_aset;
  const wilayah = [aset.desa_kelurahan, aset.kecamatan]
    .filter(Boolean)
    .join(", ");
  const luas = aset.luas ? Number(aset.luas).toLocaleString("id-ID") : null;
  const polygonData = item.polygon_sewa || aset.polygon_bidang;
  const luasPolygon = polygonData?.properties?.luas
    ? Number(polygonData.properties.luas).toLocaleString("id-ID")
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo Gallery */}
        {photos.length > 0 ? (
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-2xl overflow-hidden">
            <img
              src={photos[currentPhoto]}
              alt={item.nama_aset}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentPhoto((p) =>
                      p === 0 ? photos.length - 1 : p - 1,
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <CaretLeftIcon size={18} weight="bold" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPhoto((p) =>
                      p === photos.length - 1 ? 0 : p + 1,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <CaretRightIcon size={18} weight="bold" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                  {currentPhoto + 1} / {photos.length}
                </div>
              </>
            )}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <XIcon size={18} weight="bold" />
            </button>
          </div>
        ) : (
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-2xl flex items-center justify-center">
            <ImageIcon size={48} className="text-gray-300 dark:text-gray-600" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <XIcon size={18} weight="bold" />
            </button>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-text-primary leading-snug">
                {item.nama_aset}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shrink-0 ${
                  item.status === "Disewakan"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                }`}
              >
                <StorefrontIcon size={13} weight="fill" />
                {item.status === "Disewakan" ? "Disewakan" : "Tersedia"}
              </span>
            </div>
            {item.no_lot && (
              <p className="text-sm font-mono font-medium text-text-muted mt-1">
                LOT-{item.no_lot}
              </p>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lokasi && (
              <div className="sm:col-span-2 flex items-start gap-2.5 bg-surface-secondary rounded-xl p-3 border border-border">
                <MapPinIcon
                  size={18}
                  weight="fill"
                  className="text-red-500 mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    Lokasi
                  </p>
                  <p className="text-sm text-text-primary mt-0.5">{lokasi}</p>
                </div>
              </div>
            )}
            {wilayah && (
              <div className="flex items-start gap-2.5 bg-surface-secondary rounded-xl p-3 border border-border">
                <BuildingsIcon
                  size={18}
                  weight="fill"
                  className="text-blue-500 shrink-0"
                />
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    Wilayah
                  </p>
                  <p className="text-sm text-text-primary mt-0.5">{wilayah}</p>
                </div>
              </div>
            )}
            {(luas || luasPolygon) && (
              <div className="flex items-start gap-2.5 bg-surface-secondary rounded-xl p-3 border border-border">
                <RulerIcon
                  size={18}
                  weight="bold"
                  className="text-emerald-500 shrink-0"
                />
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    Luas
                  </p>
                  <p className="text-sm text-text-primary mt-0.5">
                    {luas || luasPolygon} m²
                  </p>
                </div>
              </div>
            )}
            {item.status === "Disewakan" && (
              <div className="flex items-start gap-2.5 bg-surface-secondary rounded-xl p-3 border border-border">
                <CalendarIcon
                  size={18}
                  weight="fill"
                  className="text-amber-500 shrink-0"
                />
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    Berakhir Sampai
                  </p>
                  <p className="text-sm text-text-primary mt-0.5">
                    {item.tanggal_berakhir
                      ? formatDate(item.tanggal_berakhir)
                      : "Belum ditentukan"}
                  </p>
                </div>
              </div>
            )}
            {aset.jenis_aset && (
              <div className="flex items-start gap-2.5 bg-surface-secondary rounded-xl p-3 border border-border">
                <TagIcon
                  size={18}
                  weight="fill"
                  className="text-purple-500 shrink-0"
                />
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    Jenis Aset
                  </p>
                  <p className="text-sm text-text-primary mt-0.5">
                    {aset.jenis_aset}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Polygon Map */}
          {polygonData && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                <MapTrifoldIcon
                  size={14}
                  weight="fill"
                  className="inline mr-1 -mt-0.5"
                />
                Peta Lokasi
              </p>
              <div className="rounded-xl overflow-hidden border border-border">
                <SewaPolygonMap
                  polygon={polygonData}
                  height={240}
                  showHeader={false}
                />
              </div>
            </div>
          )}

          {/* Catatan */}
          {item.catatan && (
            <div className="bg-surface-secondary rounded-xl p-4 border border-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                Deskripsi / Catatan
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {item.catatan}
              </p>
            </div>
          )}

          {/* CTA */}
          {item.status === "Disewakan" ? (
            <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-xl border border-emerald-500/20">
              <StorefrontIcon size={18} weight="fill" />
              Aset ini sedang disewakan
            </div>
          ) : (
            <button
              onClick={() => {
                onApply(item);
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-surface text-sm font-semibold rounded-xl transition-colors"
            >
              <PaperPlaneTiltIcon size={18} weight="fill" />
              Masuk untuk Ajukan Sewa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ASSET CARD
// ============================================================
function AssetCard({ item, onClick }) {
  const aset = item.aset || {};
  const thumbnail = item.foto_sewa?.[0] || aset.foto_aset;

  return (
    <button
      onClick={onClick}
      className="group bg-surface rounded-xl border border-border shadow-sm hover:shadow-lg hover:border-accent/20 transition-all duration-200 overflow-hidden text-left w-full h-full flex flex-col"
    >
      <div className="h-44 sm:h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden relative shrink-0">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.nama_aset}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={36} className="text-gray-300 dark:text-gray-600" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-surface text-xs font-semibold rounded-full backdrop-blur-sm ${
              item.status === "Disewakan"
                ? "bg-emerald-500/90"
                : "bg-cyan-500/90"
            }`}
          >
            <StorefrontIcon size={13} weight="fill" />
            {item.status === "Disewakan" ? "Disewakan" : "Tersedia"}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2 min-h-10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {item.nama_aset}
        </h3>
        <div className="mt-2 min-h-5">
          {(aset.lokasi || item.lokasi_aset) && (
            <div className="flex items-start gap-1.5">
              <MapPinIcon
                size={14}
                weight="fill"
                className="text-red-400 mt-0.5 shrink-0"
              />
              <span className="text-xs text-text-muted line-clamp-1">
                {aset.lokasi || item.lokasi_aset}
              </span>
            </div>
          )}
        </div>
        <div className="mt-2.5 min-h-16 flex flex-col gap-1.5">
          {(aset.luas || item.polygon_sewa?.properties?.luas) && (
            <span className="text-xs text-text-muted flex items-center gap-1 min-w-0">
              <RulerIcon size={12} weight="bold" className="shrink-0" />
              <span className="truncate">
                {Number(
                  aset.luas || item.polygon_sewa?.properties?.luas,
                ).toLocaleString("id-ID")}{" "}
                m²
              </span>
            </span>
          )}
          <div className="flex items-center gap-3 min-w-0">
            {item.no_lot && (
              <span className="text-xs text-text-muted flex items-center gap-1 min-w-0">
                <TagIcon size={12} weight="fill" className="shrink-0" />
                <span className="truncate">LOT-{item.no_lot}</span>
              </span>
            )}
            {aset.jenis_aset && (
              <span className="text-xs text-text-muted flex items-center gap-1 min-w-0">
                <TagIcon size={12} weight="fill" className="shrink-0" />
                <span className="truncate">{aset.jenis_aset}</span>
              </span>
            )}
          </div>
          <div className="min-h-4">
            {item.status === "Disewakan" && (
              <span className="text-xs text-text-muted flex items-center gap-1 min-w-0">
                <CalendarIcon size={12} weight="fill" className="shrink-0" />
                <span className="truncate">
                  Sampai{" "}
                  {item.tanggal_berakhir
                    ? formatDate(item.tanggal_berakhir)
                    : "belum ditentukan"}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="pt-2 mt-auto border-t border-border">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
            Lihat Detail
            <ArrowRightIcon size={12} weight="bold" />
          </span>
        </div>
      </div>
    </button>
  );
}

// ============================================================
// LANDING PAGE
// ============================================================
export default function LandingPage() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, initDarkMode } = useThemeStore();
  const { setUser, setToken } = useAuthStore();
  const startSession = useSessionStore((s) => s.startSession);

  // Sections refs
  const petaRef = useRef(null);
  const sewaRef = useRef(null);
  const kontakRef = useRef(null);

  // Sewa data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [jenisAset, setJenisAset] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Map data
  const [mapAssets, setMapAssets] = useState([]);
  const [mapSearch, setMapSearch] = useState("");
  const [focusedAsset, setFocusedAsset] = useState(null);
  const [showMapMarkers, setShowMapMarkers] = useState(true);
  const [showMapPolygons, setShowMapPolygons] = useState(false);
  const [activeMapLayer, setActiveMapLayer] = useState("osm");
  const markerRefs = useRef({});
  const activeMapLayerConfig =
    PUBLIC_BASEMAP_OPTIONS.find((option) => option.id === activeMapLayer) ||
    PUBLIC_BASEMAP_OPTIONS[1];

  // Mobile nav
  const [mobileNav, setMobileNav] = useState(false);

  // Login panel state
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [otpType, setOtpType] = useState("authenticator");
  const [otpRecipient, setOtpRecipient] = useState("");
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    initDarkMode();
  }, [initDarkMode]);

  // Fetch map markers
  useEffect(() => {
    petaService
      .getPublicMarkers()
      .then((res) => setMapAssets(res.data.data || []))
      .catch(() => setMapAssets([]));
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch available sewa
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (kecamatan) params.kecamatan = kecamatan;
    if (jenisAset) params.jenis_aset = jenisAset;

    sewaService
      .getPublicAvailable(params)
      .then((res) => setItems(res.data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, kecamatan, jenisAset]);

  const filterOptions = useMemo(() => {
    const kecSet = new Set();
    const jenisSet = new Set();
    items.forEach((item) => {
      if (item.aset?.kecamatan) kecSet.add(item.aset.kecamatan);
      if (item.aset?.jenis_aset) jenisSet.add(item.aset.jenis_aset);
    });
    return {
      kecamatan: [...kecSet].sort(),
      jenis: [...jenisSet].sort(),
    };
  }, [items]);

  const filteredMapAssets = useMemo(() => {
    if (!mapSearch.trim()) return mapAssets;
    const q = mapSearch.toLowerCase();
    return mapAssets.filter(
      (a) =>
        a.nama_aset?.toLowerCase().includes(q) ||
        a.lokasi?.toLowerCase().includes(q) ||
        a.kecamatan?.toLowerCase().includes(q) ||
        a.desa_kelurahan?.toLowerCase().includes(q),
    );
  }, [mapAssets, mapSearch]);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMobileNav(false);
  };

  const handleApply = (item) => {
    const params = new URLSearchParams();
    if (item?.id_sewa) params.set("id_sewa", item.id_sewa);
    navigate(`/masyarakat/login?${params.toString()}`);
  };

  const navLinks = [
    { label: "Peta", icon: MapTrifoldIcon, ref: petaRef },
    { label: "Sewa Aset", icon: HandshakeIcon, ref: sewaRef },
    { label: "Ajukan Sewa", icon: PaperPlaneTiltIcon, ref: kontakRef },
  ];

  // Login handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      if (!loginUsername || !loginPassword) {
        setLoginError("Username dan password harus diisi");
        setLoginLoading(false);
        return;
      }
      const response = await authService.login(
        loginUsername,
        loginPassword,
        "email",
      );
      if (response.data.mfaRequired) {
        setMfaToken(response.data.mfaToken);
        setOtpType("authenticator");
        setOtpRecipient("");
        setMfaStep(true);
        setOtpCode("");
        setLoginLoading(false);
        return;
      }
      if (response.data.otpRequired) {
        setMfaToken(response.data.otpToken);
        setOtpType(response.data.otpChannel || "email");
        setOtpRecipient(response.data.recipient || "");
        setMfaStep(true);
        setOtpCode("");
        setLoginLoading(false);
        return;
      }
      setToken(response.data.token);
      setUser(response.data.user);
      startSession(response.data.sessionDuration);
      toast.success("Login berhasil!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "Login gagal";
      setLoginError(msg);
      toast.error(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      if (!otpCode || otpCode.length !== 6) {
        setLoginError("Masukkan 6 digit kode OTP");
        setLoginLoading(false);
        return;
      }
      const response =
        otpType === "authenticator"
          ? await authService.verifyMfaLogin(mfaToken, otpCode)
          : await authService.verifyLoginOtp(mfaToken, otpCode);
      setToken(response.data.token);
      setUser(response.data.user);
      startSession(response.data.sessionDuration);
      toast.success("Login berhasil!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "Verifikasi OTP gagal";
      setLoginError(msg);
      toast.error(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-surface-secondary">
      {/* ==================== NAV ==================== */}
      <nav className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img
              src={pasuruanLogo}
              alt="Logo"
              className="w-9 h-9 object-contain"
            />
            <div className="text-left">
              <h1 className="text-base font-bold text-text-primary tracking-tight leading-none">
                SIMASET
              </h1>
              <p className="text-[10px] text-text-muted hidden sm:block">
                Sistem Manajemen Aset Tanah
              </p>
            </div>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.ref)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <link.icon size={16} weight="bold" />
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="md:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
            >
              <ListIcon size={18} weight="bold" />
            </button>
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
            >
              {darkMode ? (
                <SunIcon size={18} weight="bold" />
              ) : (
                <MoonIcon size={18} weight="bold" />
              )}
            </button>
            <button
              onClick={() => setShowLoginPanel(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-surface text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
            >
              <SignInIcon size={16} weight="bold" />
              <span className="hidden sm:inline">Login</span>
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNav && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  setMobileNav(false);
                  scrollTo(link.ref);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <link.icon size={16} weight="bold" />
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 dark:from-emerald-900 dark:via-emerald-950 dark:to-teal-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoMnY0aC0yem0tNiA2aC0ydi00aDJ2NHptMC02di00aDJ2NGgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium mb-5">
              <StorefrontIcon size={14} weight="fill" />
              Informasi Aset Tersedia untuk Disewa
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Sewa Aset Tanah
              <br />
              <span className="text-emerald-200">Kota Pasuruan</span>
            </h2>
            <p className="text-white/70 text-base md:text-lg max-w-lg leading-relaxed mb-8">
              Temukan aset tanah yang tersedia untuk disewakan. Lihat lokasi di
              peta, cek detail aset, dan ajukan permintaan sewa secara online.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo(sewaRef)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-700 font-semibold text-sm rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
              >
                <StorefrontIcon size={18} weight="fill" />
                Lihat Aset Tersedia
              </button>
              <button
                onClick={() => scrollTo(kontakRef)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/15 backdrop-blur-sm text-white font-semibold text-sm rounded-xl hover:bg-white/25 transition-colors border border-white/20"
              >
                <PaperPlaneTiltIcon size={18} weight="fill" />
                Ajukan Permintaan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PETA SECTION ==================== */}
      <section
        ref={petaRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
            <MapTrifoldIcon
              size={20}
              weight="fill"
              className="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-primary">
              Peta Lokasi Aset
            </h3>
            <p className="text-sm text-text-muted">
              Lokasi seluruh aset tanah Kota Pasuruan
            </p>
          </div>
          <div className="relative w-64 hidden sm:block">
            <MagnifyingGlassIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Cari lokasi di peta..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
            />
            {mapSearch && (
              <button
                onClick={() => setMapSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                <XIcon size={14} weight="bold" />
              </button>
            )}
          </div>
        </div>
        {/* Mobile search */}
        <div className="sm:hidden mb-4">
          <div className="relative">
            <MagnifyingGlassIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Cari lokasi di peta..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
            />
            {mapSearch && (
              <button
                onClick={() => setMapSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                <XIcon size={14} weight="bold" />
              </button>
            )}
          </div>
        </div>
        {mapSearch && (
          <div className="mb-3 space-y-1.5">
            <p className="text-xs text-text-muted">
              {filteredMapAssets.length} hasil ditemukan
            </p>
            {filteredMapAssets.length > 0 && (
              <div className="bg-surface-secondary rounded-xl border border-border max-h-48 overflow-y-auto divide-y divide-border">
                {filteredMapAssets.slice(0, 20).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setFocusedAsset(a);
                      setMapSearch("");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-tertiary transition-colors text-left"
                  >
                    <MapPinIcon
                      size={14}
                      weight="fill"
                      className="text-emerald-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {a.nama_aset}
                      </p>
                      {a.lokasi && (
                        <p className="text-[11px] text-text-muted truncate">
                          {a.lokasi}
                        </p>
                      )}
                    </div>
                    <ArrowRightIcon
                      size={14}
                      weight="bold"
                      className="text-text-muted shrink-0"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="relative h-[400px] md:h-[500px]">
            <PublicMapLayerControl
              activeBaseLayer={activeMapLayer}
              setActiveBaseLayer={setActiveMapLayer}
              showMarkers={showMapMarkers}
              setShowMarkers={setShowMapMarkers}
              showPolygons={showMapPolygons}
              setShowPolygons={setShowMapPolygons}
            />
            <MapContainer
              center={[-7.6469, 112.9075]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
              attributionControl={false}
              preferCanvas={true}
            >
              <TileLayer
                key={activeMapLayerConfig.id}
                url={activeMapLayerConfig.url}
              />
              {showMapPolygons && (
                <AssetPolygons
                  assets={mapAssets}
                  onLogin={() => setShowLoginPanel(true)}
                />
              )}
              {(showMapMarkers || (!showMapMarkers && !showMapPolygons)) && (
                <ZoomMarkers
                  assets={mapAssets}
                  onLogin={() => setShowLoginPanel(true)}
                  markerRefs={markerRefs}
                />
              )}
              <FlyToAsset target={focusedAsset} markerRefs={markerRefs} />
            </MapContainer>
          </div>
        </div>
      </section>

      {/* ==================== SEWA ASET SECTION ==================== */}
      <section
        ref={sewaRef}
        className="bg-surface border-t border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
              <HandshakeIcon
                size={20}
                weight="fill"
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Aset Tersedia untuk Disewa
              </h3>
              <p className="text-sm text-text-muted">
                {loading ? "Memuat..." : `${items.length} aset tersedia`}
              </p>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="bg-surface-secondary rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <MagnifyingGlassIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Cari nama atau lokasi aset..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="relative sm:w-44">
              <FunnelIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <select
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
              >
                <option value="">Semua Kecamatan</option>
                {filterOptions.kecamatan.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative sm:w-44">
              <TagIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <select
                value={jenisAset}
                onChange={(e) => setJenisAset(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
              >
                <option value="">Semua Jenis</option>
                {filterOptions.jenis.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-xl border border-border overflow-hidden animate-pulse h-full flex flex-col"
                >
                  <div className="h-44 sm:h-48 bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="p-4 flex flex-col flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-4" />
                    <div className="space-y-2 mt-3 min-h-16">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <StorefrontIcon
                size={48}
                weight="light"
                className="mx-auto text-text-muted mb-4"
              />
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                Belum Ada Aset Tersedia
              </h4>
              <p className="text-sm text-text-muted max-w-md mx-auto">
                {search || kecamatan || jenisAset
                  ? "Tidak ditemukan aset yang sesuai filter."
                  : "Saat ini belum ada aset yang tersedia untuk disewakan."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((item) => (
                <AssetCard
                  key={item.id_sewa}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== REQUEST CTA ==================== */}
      <section
        ref={kontakRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
      >
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-text-primary mb-2">
            Ajukan Permintaan Sewa
          </h3>
          <p className="text-text-secondary text-sm max-w-lg mx-auto">
            Pengajuan sewa dilakukan melalui akun masyarakat agar status
            permintaan dan dokumen balasan BPKA bisa dipantau dengan aman.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-3">
            <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-5">
                <ShieldCheckIcon size={24} weight="fill" />
              </div>
              <h4 className="text-xl font-bold text-text-primary mb-2">
                Masuk untuk Mengajukan Sewa
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                Pengajuan sewa hanya dapat dikirim melalui akun masyarakat.
                Setelah masuk, identitas pemohon akan terisi otomatis dan Anda
                dapat memantau status pada menu Sewa yang Diajukan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/masyarakat/login")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-surface transition hover:opacity-90"
                >
                  <SignInIcon size={18} weight="bold" />
                  Masuk Akun Masyarakat
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/masyarakat/login?mode=register")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-accent/40 hover:text-accent"
                >
                  <UserIcon size={18} weight="bold" />
                  Daftar Akun
                </button>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-text-secondary">
                <div className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={16}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <span>Status pengajuan tersimpan di akun masyarakat.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={16}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <span>Dokumen balasan BPKA diterima oleh akun pemohon.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon
                    size={16}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <span>Data identitas pemohon tidak perlu diketik ulang.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h4 className="font-bold text-text-primary text-sm mb-4">
                Kontak BPKA Kota Pasuruan
              </h4>
              <div className="space-y-4">
                <a
                  href="https://wa.me/-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <WhatsappLogoIcon
                      size={20}
                      weight="fill"
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      WhatsApp
                    </p>
                    <p className="text-xs text-text-muted">-</p>
                  </div>
                </a>

                <a
                  href="tel:+623435421111"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <PhoneIcon
                      size={20}
                      weight="fill"
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Telepon
                    </p>
                    <p className="text-xs text-text-muted">-</p>
                  </div>
                </a>

                <a
                  href="mailto:bpkad@pasuruankota.go.id"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <EnvelopeSimpleIcon
                      size={20}
                      weight="fill"
                      className="text-purple-600 dark:text-purple-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Email
                    </p>
                    <p className="text-xs text-text-muted">-</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-6">
              <h4 className="font-bold text-text-primary text-sm mb-3">
                Alamat Kantor
              </h4>
              <div className="flex items-start gap-2.5">
                <MapPinIcon
                  size={18}
                  weight="fill"
                  className="text-red-500 mt-0.5 shrink-0"
                />
                <p className="text-sm text-text-secondary leading-relaxed">
                  Jl. Pahlawan No. 20, Kota Pasuruan, Jawa Timur 67126
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-accent dark:bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={pasuruanLogo} alt="Logo" className="w-6 h-6" />
            <span className="text-xs text-surface/70 dark:text-text-muted">
              © {new Date().getFullYear()} SIMASET — BPKAD Kota Pasuruan
            </span>
          </div>
          <span className="text-xs text-surface/50 dark:text-text-muted">
            Sistem Manajemen Aset Tanah
          </span>
        </div>
      </footer>

      {/* ==================== LOGIN SIDE PANEL ==================== */}
      <div
        className={`fixed top-0 right-0 h-full z-50 transition-all duration-500 ease-out ${
          showLoginPanel
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            showLoginPanel ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => {
            setShowLoginPanel(false);
            setMfaStep(false);
            setMfaToken("");
            setOtpType("authenticator");
            setOtpRecipient("");
            setOtpCode("");
            setLoginError("");
          }}
        />

        {/* Panel */}
        <div className="relative h-full w-screen sm:w-96 md:w-[26rem] bg-surface dark:bg-gray-900 flex flex-col shadow-2xl max-h-screen overflow-hidden border-l border-border ml-auto">
          {/* Close button */}
          <button
            onClick={() => {
              setShowLoginPanel(false);
              setMfaStep(false);
              setMfaToken("");
              setOtpType("authenticator");
              setOtpRecipient("");
              setOtpCode("");
              setLoginError("");
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-surface-secondary border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors z-10"
          >
            <XIcon size={18} weight="bold" />
          </button>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Header */}
            <div className="px-6 md:px-8 pt-8 pb-6 text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4 bg-emerald-600">
                <img
                  src={pasuruanLogo}
                  alt="SIMASET"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h2 className="text-text-primary font-bold text-xl tracking-tight">
                SIMASET
              </h2>
              <p className="text-text-muted text-sm mt-1.5">
                Masuk ke akun Anda untuk melanjutkan
              </p>
            </div>

            {/* Form */}
            <div className="px-6 md:px-8 pb-6">
              {loginError && (
                <div className="mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <WarningCircleIcon
                      size={12}
                      weight="fill"
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {loginError}
                  </p>
                </div>
              )}

              {mfaStep ? (
                <form onSubmit={handleMfaVerify} className="space-y-5">
                  <div className="text-center mb-2">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mx-auto flex items-center justify-center mb-3">
                      <ShieldCheckIcon
                        size={28}
                        weight="duotone"
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                    <h3 className="text-text-primary font-bold text-base">
                      Verifikasi Dua Langkah
                    </h3>
                    <p className="text-text-muted text-xs mt-1">
                      {otpType === "authenticator"
                        ? "Masukkan kode 6 digit dari aplikasi authenticator Anda"
                        : `Masukkan kode 6 digit yang dikirim ke ${
                            otpType === "whatsapp" ? "WhatsApp" : "email"
                          }${otpRecipient ? ` ${otpRecipient}` : ""}`}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                      <ShieldCheckIcon size={12} weight="bold" />
                      Kode OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoComplete="one-time-code"
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      disabled={loginLoading}
                      placeholder="000000"
                      className="w-full h-14 px-4 text-center text-2xl font-mono tracking-[0.5em] bg-surface-secondary border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-text-primary placeholder:text-text-muted disabled:opacity-50"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loginLoading || otpCode.length !== 6}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-surface text-sm font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loginLoading ? (
                      <>
                        <CircleNotchIcon
                          size={18}
                          weight="bold"
                          className="animate-spin"
                        />
                        Memverifikasi...
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon size={18} weight="bold" />
                        Verifikasi
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMfaStep(false);
                      setMfaToken("");
                      setOtpType("authenticator");
                      setOtpRecipient("");
                      setOtpCode("");
                      setLoginError("");
                    }}
                    className="w-full h-11 text-sm text-text-muted hover:text-text-primary font-medium transition-colors flex items-center justify-center gap-2 bg-surface-secondary hover:bg-surface-secondary/80 rounded-xl border border-border"
                  >
                    <ArrowLeftIcon size={16} weight="bold" />
                    Kembali ke Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                      <UserIcon size={12} weight="bold" />
                      Username
                    </label>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      disabled={loginLoading}
                      placeholder="Masukkan username"
                      className="w-full h-12 px-4 text-sm bg-surface-secondary border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-text-primary placeholder:text-text-muted disabled:opacity-50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                      <LockIcon size={12} weight="bold" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={loginLoading}
                        placeholder="Masukkan password"
                        className="w-full h-12 pl-4 pr-12 text-sm bg-surface-secondary border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-text-primary placeholder:text-text-muted disabled:opacity-50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-secondary"
                      >
                        {showPassword ? (
                          <EyeSlashIcon size={18} />
                        ) : (
                          <EyeIcon size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-surface text-sm font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loginLoading ? (
                      <>
                        <CircleNotchIcon
                          size={18}
                          weight="bold"
                          className="animate-spin"
                        />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <SignInIcon size={18} weight="bold" />
                        Masuk
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Demo Credentials */}
            {!mfaStep && (
              <div className="px-6 md:px-8 py-4 bg-surface-secondary/50 border-t border-border">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-3 text-center">
                  Demo Credentials
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "Admin BPKA",
                      username: "admin_bpka",
                      password: "admin123",
                      color: "bg-purple-600",
                    },
                    {
                      label: "BPKA",
                      username: "bpka",
                      password: "bpka123",
                      color: "bg-emerald-600",
                    },
                  ].map((cred) => (
                    <button
                      key={cred.username}
                      type="button"
                      onClick={() => {
                        setLoginUsername(cred.username);
                        setLoginPassword(cred.password);
                      }}
                      className="bg-surface border border-border rounded-xl p-3 text-left hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-5 h-5 rounded-lg ${cred.color} flex items-center justify-center`}
                        >
                          <span className="text-[8px] font-bold text-surface">
                            {cred.label[0]}
                          </span>
                        </div>
                        <span className="font-semibold text-text-primary text-xs">
                          {cred.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted font-mono truncate pl-7">
                        {cred.username}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 px-6 md:px-8 py-4 border-t border-border bg-surface-secondary/50">
            <p className="text-center text-text-muted text-[10px]">
              © 2025 SIMASET • Fikry Satrio
            </p>
          </div>
        </div>
      </div>

      {/* ==================== DETAIL MODAL ==================== */}
      {selectedItem && (
        <AssetDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onApply={handleApply}
        />
      )}
    </div>
  );
}
