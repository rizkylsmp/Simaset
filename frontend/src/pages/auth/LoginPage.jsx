import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { authService, petaService } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { useSessionStore } from "../../stores/sessionStore";
import { useThemeStore } from "../../stores/themeStore";
import {
  WrenchIcon,
  SignInIcon,
  EyeIcon,
  EyeSlashIcon,
  MapTrifoldIcon,
  MoonIcon,
  SunIcon,
  CircleNotchIcon,
  WarningCircleIcon,
  UserIcon,
  LockIcon,
  CaretRightIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  BuildingsIcon,
} from "@phosphor-icons/react";
import pasuruanLogo from "../../assets/images/pasuruanLogo.png";
import bpnLogo from "../../assets/images/bpnLogo.png";
import { renderToStaticMarkup } from "react-dom/server";

// Marker color by status
const getMarkerColor = (status) => {
  const colors = {
    aktif: "#10b981",
    bermasalah: "#eab308",
    diblokir: "#ef4444",
    indikasi_bermasalah: "#3b82f6",
  };
  return colors[status?.toLowerCase().replace(/\s+/g, "_")] || "#6b7280";
};

// Status label & color mapping
const statusConfig = {
  aktif: {
    label: "Aktif",
    bg: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  bermasalah: {
    label: "Bermasalah",
    bg: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-500",
  },
  diblokir: {
    label: "Diblokir",
    bg: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
  indikasi_bermasalah: {
    label: "Indikasi Bermasalah",
    bg: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
};

const getStatusConfig = (status) => {
  const key = status?.toLowerCase().replace(/\s+/g, "_");
  return (
    statusConfig[key] || {
      label: status || "-",
      bg: "bg-gray-100 text-gray-600",
      dot: "bg-gray-400",
    }
  );
};

// Zoom-aware markers with popup
function ZoomAwareMarkers({ assets, onLoginClick }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on("zoomend", onZoom);
    return () => map.off("zoomend", onZoom);
  }, [map]);

  const radius = Math.max(2, Math.min(10, 2 + (zoom - 10) * 1));

  return assets
    .filter((a) => a.latitude && a.longitude)
    .map((asset) => {
      const sc = getStatusConfig(asset.status);
      return (
        <CircleMarker
          key={asset.id}
          center={[asset.latitude, asset.longitude]}
          radius={radius}
          pathOptions={{
            color: "#fff",
            weight: 1.5,
            fillColor: getMarkerColor(asset.status),
            fillOpacity: 0.85,
          }}
          eventHandlers={{
            click: () =>
              map.setView(
                [asset.latitude, asset.longitude],
                Math.max(zoom, 16),
                { animate: true },
              ),
          }}
        >
          <Popup closeButton={true} maxWidth={320} minWidth={280}>
            <div className="font-sans p-1">
              {/* Header */}
              <div className="font-bold text-base text-gray-800 leading-snug mb-2">
                {asset.nama_aset}
              </div>

              {/* Status badge */}
              <div className="mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>

              {/* Info rows */}
              <div className="space-y-1.5 text-xs text-gray-600">
                {asset.lokasi && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 shrink-0">📍</span>
                    <span className="leading-snug">{asset.lokasi}</span>
                  </div>
                )}
                {(asset.kecamatan || asset.desa_kelurahan) && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 shrink-0">🏘️</span>
                    <span>
                      {[asset.desa_kelurahan, asset.kecamatan]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
                {asset.luas && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 shrink-0">📐</span>
                    <span>{Number(asset.luas).toLocaleString("id-ID")} m²</span>
                  </div>
                )}
                {asset.jenis_aset && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 shrink-0">🏷️</span>
                    <span>{asset.jenis_aset}</span>
                  </div>
                )}
              </div>

              {/* Divider + Login CTA */}
              <div className="border-t border-gray-200 mt-3 pt-2.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    map.closePopup();
                    onLoginClick();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  🔒 Login untuk detail lengkap
                </button>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      );
    });
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [assets, setAssets] = useState([]);
  // MFA state
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const startSession = useSessionStore((s) => s.startSession);
  const { darkMode, toggleDarkMode, initDarkMode } = useThemeStore();

  useEffect(() => {
    initDarkMode();
  }, [initDarkMode]);

  // Fetch real asset markers for the map background
  useEffect(() => {
    petaService
      .getPublicMarkers()
      .then((res) => setAssets(res.data.data || []))
      .catch(() => setAssets([]));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!username || !password) {
        setError("Username dan password harus diisi");
        setLoading(false);
        return;
      }

      const response = await authService.login(username, password);

      // Check if MFA is required
      if (response.data.mfaRequired) {
        setMfaToken(response.data.mfaToken);
        setMfaStep(true);
        setOtpCode("");
        setLoading(false);
        return;
      }

      setToken(response.data.token);
      setUser(response.data.user);
      startSession(response.data.sessionDuration);
      toast.success("Login berhasil!");
      navigate("/dashboard");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Login gagal";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!otpCode || otpCode.length !== 6) {
        setError("Masukkan 6 digit kode OTP");
        setLoading(false);
        return;
      }

      const response = await authService.verifyMfaLogin(mfaToken, otpCode);
      setToken(response.data.token);
      setUser(response.data.user);
      startSession(response.data.sessionDuration);
      toast.success("Login berhasil!");
      navigate("/dashboard");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Verifikasi OTP gagal";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setMfaStep(false);
    setMfaToken("");
    setOtpCode("");
    setError("");
  };

  // System configuration for branding
  const systemConfig = {
    bpka: {
      name: "Sistem BPKA",
      fullName: "Badan Pengelolaan Keuangan dan Aset Daerah",
      shortDesc: "Pusat data aset daerah",
      Icon: BuildingsIcon,
      logo: pasuruanLogo,
    },
    bpn: {
      name: "Sistem BPN",
      fullName: "Badan Pertanahan Nasional",
      shortDesc: "Data legal, fisik, administratif, spasial",
      Icon: MapTrifoldIcon,
      logo: bpnLogo,
    },
  };

  const currentSystem = systemConfig[selectedSystem];

  const demoCredentials = [
    {
      label: "Admin BPKA",
      username: "admin_bpka",
      password: "admin123",
      color: "bg-purple-600",
      textColor: "text-surface",
      system: "bpka",
    },
    {
      label: "BPKA",
      username: "bpka",
      password: "bpka123",
      color: "bg-emerald-600",
      textColor: "text-surface",
      system: "bpka",
    },
    {
      label: "Admin BPN",
      username: "admin_bpn",
      password: "admin123",
      color: "bg-amber-600",
      textColor: "text-surface",
      system: "bpn",
    },
    {
      label: "BPN",
      username: "bpn_user",
      password: "bpn123",
      color: "bg-blue-600",
      textColor: "text-surface",
      system: "bpn",
    },
  ];

  const filteredCredentials = demoCredentials.filter(
    (cred) => cred.system === selectedSystem,
  );

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-gray-900">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[-7.6469, 112.9075]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          scrollWheelZoom={true}
          dragging={true}
          doubleClickZoom={true}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Zoom-responsive dot markers */}
          <ZoomAwareMarkers
            assets={assets}
            onLoginClick={() => {
              setSelectedSystem(null);
              setShowLoginPanel(false);
            }}
          />
        </MapContainer>
      </div>

      {/* Map Overlay (subtle darkening) */}
      <div className="absolute inset-0 z-1 bg-accent/10 dark:bg-surface/30 pointer-events-none" />

      {/* Top Left - Logo Badge (hidden during system selection) */}
      <div
        className={`absolute top-4 left-4 md:top-6 md:left-6 z-10 pointer-events-auto transition-all duration-300 ${!selectedSystem ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <div className="flex items-center gap-2 md:gap-3 bg-accent/80 dark:bg-surface/80 backdrop-blur-xl rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-xl border border-surface/10">
          <img
            src={pasuruanLogo}
            alt="Logo Kota Pasuruan"
            className="w-8 h-8 md:w-10 md:h-10 object-contain"
          />
          <div>
            <h1 className="text-surface dark:text-accent font-bold text-sm md:text-lg tracking-tight">
              SIMASET
            </h1>
            <p className="text-surface/60 dark:text-accent/60 text-[10px] md:text-xs hidden sm:block">
              Sistem Manajemen Aset Tanah
            </p>
          </div>
        </div>
      </div>

      {/* Top Right - Dark Mode Toggle */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 pointer-events-auto">
        <button
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Aktifkan Light Mode" : "Aktifkan Dark Mode"}
          className={`w-10 h-10 md:w-11 md:h-11 rounded-xl backdrop-blur-xl shadow-xl border border-surface/10 flex items-center justify-center transition-all hover:scale-105 ${
            showLoginPanel ? "sm:hidden" : ""
          } ${darkMode ? "bg-gray-950/80 text-amber-400" : "bg-gray-900/80 text-surface"}`}
          title={darkMode ? "Light Mode" : "Dark Mode"}
        >
          {darkMode ? (
            <SunIcon size={20} weight="bold" />
          ) : (
            <MoonIcon size={20} weight="bold" />
          )}
        </button>
      </div>

      {/* Bottom Left - Legend */}
      <div
        className={`absolute ${
          showLoginPanel ? "bottom-4" : "bottom-24"
        } sm:bottom-4 md:bottom-6 left-4 md:left-6 z-10 pointer-events-auto transition-all duration-300`}
      >
        <div className="bg-accent/80 dark:bg-surface/80 backdrop-blur-xl rounded-2xl px-3 md:px-4 py-2 md:py-3 border border-surface/10 shadow-xl">
          <div className="flex items-center gap-3 md:gap-4">
            {[
              { label: "Aktif", color: "bg-emerald-500" },
              { label: "Bermasalah", color: "bg-yellow-500" },
              { label: "Indikasi", color: "bg-blue-500" },
              { label: "Diblokir", color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${item.color}`}
                />
                <span className="text-surface dark:text-accent text-[10px] md:text-xs">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== SYSTEM SELECTOR ==================== */}
      {!selectedSystem && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px]" />
          <div className="relative z-10 w-full max-w-2xl">
            {/* Branding */}
            <div className="text-center mb-8 md:mb-10">
              <img
                src={pasuruanLogo}
                alt="Logo Kota Pasuruan"
                className="w-18 h-18 md:w-22 md:h-22 mx-auto mb-4 md:mb-5 drop-shadow-2xl"
              />
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                SIMASET
              </h1>
              <p className="text-white/50 text-xs md:text-sm mt-1.5">
                Sistem Manajemen Aset Tanah &bull; Kota Pasuruan
              </p>
              <p className="text-white/30 text-[11px] md:text-xs mt-3">
                Pilih sistem untuk melanjutkan
              </p>
            </div>

            {/* System Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              {/* BPKA */}
              <button
                onClick={() => {
                  setSelectedSystem("bpka");
                  setShowLoginPanel(true);
                }}
                className="group bg-white/8 backdrop-blur-xl border border-white/12 rounded-2xl p-5 md:p-7 text-left hover:bg-emerald-500/15 hover:border-emerald-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:bg-emerald-500/30 transition-colors">
                  <BuildingsIcon
                    size={26}
                    weight="duotone"
                    className="text-emerald-400"
                  />
                </div>
                <h3 className="text-white font-bold text-base md:text-lg">
                  Sistem BPKA
                </h3>
                <p className="text-white/50 text-xs md:text-sm mt-1 leading-relaxed">
                  Badan Pengelolaan Keuangan dan Aset Daerah
                </p>
                <div className="flex items-center gap-2 mt-3 md:mt-4 text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
                  <span className="text-[10px] md:text-xs">
                    Pusat data aset daerah
                  </span>
                  <CaretRightIcon
                    size={12}
                    weight="bold"
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </button>

              {/* BPN */}
              <button
                onClick={() => {
                  setSelectedSystem("bpn");
                  setShowLoginPanel(true);
                }}
                className="group bg-white/8 backdrop-blur-xl border border-white/12 rounded-2xl p-5 md:p-7 text-left hover:bg-blue-500/15 hover:border-blue-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-colors">
                  <img
                    src={bpnLogo}
                    alt="Logo BPN"
                    className="w-10 h-10 md:w-12 md:h-12 object-contain"
                  />
                </div>
                <h3 className="text-white font-bold text-base md:text-lg">
                  Sistem BPN
                </h3>
                <p className="text-white/50 text-xs md:text-sm mt-1 leading-relaxed">
                  Badan Pertanahan Nasional
                </p>
                <div className="flex items-center gap-2 mt-3 md:mt-4 text-blue-400/60 group-hover:text-blue-400 transition-colors">
                  <span className="text-[10px] md:text-xs">
                    Data legal, fisik, administratif, spasial
                  </span>
                  <CaretRightIcon
                    size={12}
                    weight="bold"
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== LOGIN PANEL ==================== */}
      <div
        className={`absolute top-0 right-0 h-full z-30 transition-all duration-500 ease-out ${
          showLoginPanel
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <div className="h-full w-screen sm:w-100 md:w-107.5 bg-surface dark:bg-gray-900 flex flex-col shadow-2xl max-h-screen overflow-hidden border-l border-gray-200/50 dark:border-gray-700/50">
          {/* Toggle Button (desktop) */}
          <button
            onClick={() => setShowLoginPanel(false)}
            aria-label="Tutup panel login dan jelajahi peta"
            className="absolute top-1/2 -translate-y-1/2 -left-10 hidden sm:flex w-10 h-20 bg-surface dark:bg-gray-900 rounded-l-xl items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-r-0 border-gray-200 dark:border-gray-700 shadow-lg"
            title="Jelajahi Peta"
          >
            <CaretRightIcon size={18} weight="bold" />
          </button>

          {/* Mobile Close */}
          <button
            onClick={() => setShowLoginPanel(false)}
            aria-label="Tutup panel login"
            className="absolute top-3 right-3 sm:hidden w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Header */}
            <div className="px-6 md:px-8 pt-6 md:pt-10 pb-6 md:pb-8 text-center">
              {/* System-specific icon */}
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4 md:mb-5 ${
                  selectedSystem === "bpka" ? "bg-emerald-600" : "bg-blue-600"
                }`}
              >
                {currentSystem?.logo ? (
                  <img
                    src={currentSystem.logo}
                    alt={currentSystem.name}
                    className="w-12 h-12 md:w-14 md:h-14 object-contain"
                  />
                ) : (
                  currentSystem && (
                    <currentSystem.Icon
                      size={32}
                      weight="duotone"
                      className="text-white"
                    />
                  )
                )}
              </div>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl md:text-2xl tracking-tight">
                {currentSystem?.name || "SIMASET"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5">
                {currentSystem?.fullName ||
                  "Masuk ke akun Anda untuk melanjutkan"}
              </p>

              {/* Dark mode toggle inside panel */}
              <button
                onClick={toggleDarkMode}
                className="mx-auto mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                {darkMode ? (
                  <SunIcon size={14} weight="bold" className="text-amber-500" />
                ) : (
                  <MoonIcon size={14} weight="bold" />
                )}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            </div>

            {/* Form */}
            <div className="px-6 md:px-8 pb-4 md:pb-6">
              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3.5 flex items-start gap-3"
                >
                  <div className="w-5 h-5 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <WarningCircleIcon
                      size={12}
                      weight="fill"
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}

              {mfaStep ? (
                /* ===== MFA OTP VERIFICATION ===== */
                <form
                  onSubmit={handleMfaVerify}
                  className="space-y-4 md:space-y-5"
                >
                  <div className="text-center mb-2">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl mx-auto flex items-center justify-center mb-3">
                      <ShieldCheckIcon
                        size={28}
                        weight="duotone"
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-bold text-base">
                      Verifikasi Dua Langkah
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                      Masukkan kode 6 digit dari aplikasi authenticator Anda
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="otpCode"
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400"
                    >
                      <ShieldCheckIcon size={12} weight="bold" />
                      Kode OTP
                    </label>
                    <input
                      id="otpCode"
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
                      disabled={loading}
                      placeholder="000000"
                      className="w-full h-14 px-4 text-center text-2xl font-mono tracking-[0.5em] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-surface/20 focus:border-gray-400 dark:focus:border-gray-500 focus:bg-surface dark:focus:bg-gray-800 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 disabled:opacity-50"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full h-12 bg-accent hover:bg-gray-800 dark:hover:bg-gray-100 text-surface text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
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
                    onClick={handleBackToLogin}
                    className="w-full h-11 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <ArrowLeftIcon size={16} weight="bold" />
                    Kembali ke Login
                  </button>
                </form>
              ) : (
                /* ===== NORMAL LOGIN FORM ===== */
                <>
                  <form
                    onSubmit={handleLogin}
                    className="space-y-4 md:space-y-5"
                  >
                    {/* Username */}
                    <div className="space-y-2">
                      <label
                        htmlFor="username"
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400"
                      >
                        <UserIcon size={12} weight="bold" />
                        Username
                      </label>
                      <div className="relative">
                        <input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={loading}
                          placeholder="Masukkan username"
                          className="w-full h-12 pl-4 pr-4 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-surface/20 focus:border-gray-400 dark:focus:border-gray-500 focus:bg-surface dark:focus:bg-gray-800 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400"
                        >
                          <LockIcon size={12} weight="bold" />
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toast("Fitur dalam pengembangan!", {
                              icon: renderToStaticMarkup(
                                <WrenchIcon size={16} weight="bold" />,
                              ),
                            });
                          }}
                          className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          Lupa password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          placeholder="Masukkan password"
                          className="w-full h-12 pl-4 pr-12 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-surface/20 focus:border-gray-400 dark:focus:border-gray-500 focus:bg-surface dark:focus:bg-gray-800 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword
                              ? "Sembunyikan password"
                              : "Tampilkan password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {showPassword ? (
                            <EyeSlashIcon size={18} weight="regular" />
                          ) : (
                            <EyeIcon size={18} weight="regular" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-accent hover:bg-gray-800 dark:hover:bg-gray-100 text-surface text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
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

                  {/* Explore Map */}
                  <button
                    onClick={() => setShowLoginPanel(false)}
                    className="w-full mt-3 h-11 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <MapTrifoldIcon size={16} weight="duotone" />
                    Jelajahi Peta Terlebih Dahulu
                  </button>
                </>
              )}
            </div>

            {/* Demo Credentials - hidden during MFA step */}
            {!mfaStep && (
              <div className="px-6 md:px-8 py-4 md:py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 text-center">
                  Demo Credentials
                </p>
                <div
                  className={`grid gap-2 ${filteredCredentials.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                >
                  {filteredCredentials.map((cred) => (
                    <button
                      key={cred.username}
                      type="button"
                      onClick={() => {
                        setUsername(cred.username);
                        setPassword(cred.password);
                      }}
                      className="bg-surface dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-left hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-5 h-5 rounded-lg ${cred.color} flex items-center justify-center`}
                        >
                          <span
                            className={`text-[8px] font-bold ${cred.textColor}`}
                          >
                            {cred.label[0]}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs group-hover:text-gray-700 dark:group-hover:text-surface transition-colors">
                          {cred.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate pl-7">
                        {cred.username}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0">
            {/* System Switcher Strip */}
            <div className="px-4 md:px-6 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => {
                  setSelectedSystem(null);
                  setShowLoginPanel(false);
                  setError("");
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      selectedSystem === "bpka"
                        ? "bg-emerald-100 dark:bg-emerald-900/40"
                        : "bg-blue-100 dark:bg-blue-900/40"
                    }`}
                  >
                    {currentSystem?.logo ? (
                      <img
                        src={currentSystem.logo}
                        alt={currentSystem.name}
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      currentSystem && (
                        <currentSystem.Icon
                          size={14}
                          weight="duotone"
                          className={`${
                            selectedSystem === "bpka"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        />
                      )
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      {currentSystem?.name}
                    </p>
                    <p className="text-[9px] text-gray-400 dark:text-gray-500">
                      {currentSystem?.shortDesc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 dark:text-gray-500 group-hover:text-accent transition-colors">
                  <ArrowLeftIcon size={10} weight="bold" />
                  Ganti
                </div>
              </button>
            </div>

            {/* Copyright */}
            <div className="px-6 md:px-8 py-3 md:py-4 border-t border-gray-100 dark:border-gray-800 bg-surface dark:bg-gray-900">
              <p className="text-center text-gray-400 dark:text-gray-600 text-[10px] md:text-xs">
                © 2025 SIMASET • Fikry Satrio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== FLOATING BUTTONS (panel hidden) ==================== */}

      {/* Desktop - Login Button */}
      {selectedSystem && !showLoginPanel && (
        <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 z-20 hidden sm:block">
          <button
            onClick={() => setShowLoginPanel(true)}
            className="bg-surface dark:bg-gray-900 text-gray-900 dark:text-gray-100 pl-5 pr-6 py-3 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 group border border-gray-200 dark:border-gray-700"
          >
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <SignInIcon size={16} weight="bold" className="text-surface" />
            </div>
            <span className="text-sm">Masuk untuk Akses Penuh</span>
          </button>
        </div>
      )}

      {/* Mobile - Bottom Bar */}
      {selectedSystem && !showLoginPanel && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-linear-to-t from-gray-900 via-gray-900/95 to-transparent pt-10 sm:hidden">
          <button
            onClick={() => setShowLoginPanel(true)}
            className="w-full bg-surface dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-center gap-2.5 text-base border border-gray-200 dark:border-gray-700"
          >
            <SignInIcon size={18} weight="bold" />
            Masuk
          </button>
        </div>
      )}
    </div>
  );
}
