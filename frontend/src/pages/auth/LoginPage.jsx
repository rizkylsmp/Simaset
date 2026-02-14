import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { authService } from "../../services/api";
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
} from "@phosphor-icons/react";
import { renderToStaticMarkup } from "react-dom/server";

// Custom marker icon
const getMarkerIcon = (status) => {
  const colors = {
    aktif: "#10b981",
    berperkara: "#ef4444",
    indikasi_berperkara: "#3b82f6",
    tidak_aktif: "#f59e0b",
  };
  const s = status?.toLowerCase().replace(/\s+/g, "_");
  const color = colors[s] || "#6b7280";
  return L.divIcon({
    html: `<div style="background-color: ${color}; border: 3px solid var(--color-surface); border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    className: "custom-marker",
  });
};

// Sample assets for map preview
const sampleAssets = [
  {
    id: 1,
    nama: "Tanah Alun-Alun",
    status: "aktif",
    lat: -7.6457,
    lng: 112.9061,
  },
  {
    id: 2,
    nama: "Gedung Kantor Pemkot",
    status: "aktif",
    lat: -7.6485,
    lng: 112.9095,
  },
  {
    id: 3,
    nama: "Tanah Pelabuhan",
    status: "berperkara",
    lat: -7.635,
    lng: 112.902,
  },
  {
    id: 4,
    nama: "Lapangan Untung Suropati",
    status: "aktif",
    lat: -7.652,
    lng: 112.915,
  },
  {
    id: 5,
    nama: "Taman Kota",
    status: "indikasi_berperkara",
    lat: -7.64,
    lng: 112.913,
  },
  {
    id: 6,
    nama: "Kawasan Industri",
    status: "aktif",
    lat: -7.638,
    lng: 112.895,
  },
  {
    id: 7,
    nama: "Terminal Bus",
    status: "tidak_aktif",
    lat: -7.655,
    lng: 112.92,
  },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(true);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const startSession = useSessionStore((s) => s.startSession);
  const { darkMode, toggleDarkMode, initDarkMode } = useThemeStore();

  useEffect(() => {
    initDarkMode();
  }, [initDarkMode]);

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

  const demoCredentials = [
    {
      label: "Admin",
      username: "admin",
      password: "admin123",
      color: "bg-gray-900 dark:bg-gray-100",
      textColor: "text-surface",
    },
    {
      label: "BPKAD",
      username: "bpkad",
      password: "bpkad123",
      color: "bg-emerald-600",
      textColor: "text-surface",
    },
    {
      label: "BPN",
      username: "bpn_user",
      password: "bpn123",
      color: "bg-blue-600",
      textColor: "text-surface",
    },
  ];

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
          {sampleAssets.map((asset) => (
            <Marker
              key={asset.id}
              position={[asset.lat, asset.lng]}
              icon={getMarkerIcon(asset.status)}
            >
              <Popup closeButton={false} className="simple-popup">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      asset.status === "aktif"
                        ? "bg-emerald-500"
                        : asset.status === "berperkara"
                          ? "bg-red-500"
                          : asset.status === "indikasi_berperkara"
                            ? "bg-blue-500"
                            : "bg-amber-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {asset.nama}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Overlay (subtle darkening) */}
      <div className="absolute inset-0 z-1 bg-accent/10 dark:bg-accent/30 pointer-events-none" />

      {/* Top Left - Logo Badge */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 pointer-events-auto">
        <div className="flex items-center gap-2 md:gap-3 bg-gray-900/80 dark:bg-gray-950/80 backdrop-blur-xl rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-xl border border-surface/10">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-surface dark:bg-gray-100 rounded-xl flex items-center justify-center">
            <span className="text-base md:text-xl font-black text-gray-900">
              S
            </span>
          </div>
          <div>
            <h1 className="text-surface font-bold text-sm md:text-lg tracking-tight">
              SIMASET
            </h1>
            <p className="text-surface/60 text-[10px] md:text-xs hidden sm:block">
              Sistem Manajemen Aset Tanah
            </p>
          </div>
        </div>
      </div>

      {/* Top Right - Dark Mode Toggle */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 pointer-events-auto">
        <button
          onClick={toggleDarkMode}
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
        <div className="bg-gray-900/80 dark:bg-gray-950/80 backdrop-blur-xl rounded-2xl px-3 md:px-4 py-2 md:py-3 border border-surface/10 shadow-xl">
          <div className="flex items-center gap-3 md:gap-4">
            {[
              { label: "Aktif", color: "bg-emerald-500" },
              { label: "Berperkara", color: "bg-red-500" },
              { label: "Indikasi", color: "bg-blue-500" },
              { label: "Tidak Aktif", color: "bg-amber-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${item.color}`}
                />
                <span className="text-surface text-[10px] md:text-xs">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
            className="absolute top-1/2 -translate-y-1/2 -left-10 hidden sm:flex w-10 h-20 bg-surface dark:bg-gray-900 rounded-l-xl items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-r-0 border-gray-200 dark:border-gray-700 shadow-lg"
            title="Jelajahi Peta"
          >
            <CaretRightIcon size={18} weight="bold" />
          </button>

          {/* Mobile Close */}
          <button
            onClick={() => setShowLoginPanel(false)}
            className="absolute top-3 right-3 sm:hidden w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <svg
              className="w-5 h-5"
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
            <div className="px-6 md:px-8 pt-8 md:pt-12 pb-6 md:pb-8 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-accent rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4 md:mb-5 relative">
                <span className="text-2xl md:text-3xl font-black text-surface">
                  S
                </span>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-surface dark:border-gray-900 flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-surface"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl md:text-2xl tracking-tight">
                SIMASET
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5">
                Masuk ke akun Anda untuk melanjutkan
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
                <div className="mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3.5 flex items-start gap-3">
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

              <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
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
            </div>

            {/* Demo Credentials */}
            <div className="px-6 md:px-8 py-4 md:py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 text-center">
                Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-2">
                {demoCredentials.map((cred) => (
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
          </div>

          {/* Footer */}
          <div className="px-6 md:px-8 py-3 md:py-4 border-t border-gray-100 dark:border-gray-800 bg-surface dark:bg-gray-900 shrink-0">
            <p className="text-center text-gray-400 dark:text-gray-600 text-[10px] md:text-xs">
              © 2025 SIMASET • Fikry Satrio
            </p>
          </div>
        </div>
      </div>

      {/* ==================== FLOATING BUTTONS (panel hidden) ==================== */}

      {/* Desktop - Login Button */}
      {!showLoginPanel && (
        <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 z-20 hidden sm:block">
          <button
            onClick={() => setShowLoginPanel(true)}
            className="bg-surface dark:bg-gray-900 text-gray-900 dark:text-gray-100 pl-5 pr-6 py-3 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 group border border-gray-200 dark:border-gray-700"
          >
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <SignInIcon
                size={16}
                weight="bold"
                className="text-surface"
              />
            </div>
            <span className="text-sm">Masuk untuk Akses Penuh</span>
          </button>
        </div>
      )}

      {/* Mobile - Bottom Bar */}
      {!showLoginPanel && (
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
