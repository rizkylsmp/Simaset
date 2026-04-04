import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  asetService,
  userService,
  riwayatService,
  petaService,
} from "../services/api";
import MapDisplayBPN from "../components/map/bpn/MapDisplayBPN";
import { useAuthStore } from "../stores/authStore";
import {
  ChartBarIcon,
  MapTrifoldIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import DashboardBPKAPanel from "../components/dashboard/DashboardBPKAPanel";
import DashboardBPNPanel from "../components/dashboard/DashboardBPNPanel";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || "bpn";
  const isBPKARole = userRole === "bpka" || userRole === "admin_bpka";

  const [loading, setLoading] = useState(true);
  const [asetStats, setAsetStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [riwayatStats, setRiwayatStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  const [mapAssets, setMapAssets] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [showStatsPanel, setShowStatsPanel] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchMapMarkers();
  }, []);

  const fetchMapMarkers = useCallback(async () => {
    setMapLoading(true);
    try {
      const response = await petaService.getMarkers();
      const markers = response.data.data || [];
      const transformed = markers.map((marker) => ({
        id: marker.id,
        kode_aset: marker.kode,
        nama_aset: marker.nama,
        lokasi: marker.lokasi,
        status: marker.status?.toLowerCase().replace(/\s+/g, "_") || "aktif",
        luas: marker.luas?.toString() || "0",
        tahun: marker.tahun?.toString() || "-",
        jenis_aset: marker.jenis,
        latitude: marker.lat,
        longitude: marker.lng,
        polygon: marker.polygon || null,
      }));
      setMapAssets(transformed);
    } catch (error) {
      console.error("Error fetching map markers:", error);
    } finally {
      setMapLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const role = user?.role?.toLowerCase();
      const isAdmin = role === "admin_bpka" || role === "admin_bpn";
      const canViewRiwayat = isAdmin;

      const promises = [asetService.getStats()];
      promises.push(isAdmin ? userService.getStats() : Promise.resolve(null));
      promises.push(
        canViewRiwayat ? riwayatService.getStats() : Promise.resolve(null),
      );
      promises.push(
        canViewRiwayat
          ? riwayatService.getAll({ limit: 5 })
          : Promise.resolve(null),
      );

      const [asetRes, userRes, riwayatRes, activitiesRes] =
        await Promise.all(promises);

      setAsetStats(asetRes.data.data);
      if (userRes) setUserStats(userRes.data.data);
      if (riwayatRes) setRiwayatStats(riwayatRes.data.data);
      setRecentActivities(activitiesRes?.data?.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const panelProps = {
    loading,
    asetStats,
    userStats,
    riwayatStats,
    recentActivities,
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* ==================== FULL-SCREEN MAP ==================== */}
      <div id="map-fullscreen-container" className="absolute inset-0">
        {mapLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full" />
                <MapTrifoldIcon
                  size={24}
                  weight="fill"
                  className="text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </div>
              <p className="text-sm text-text-muted mt-4">Memuat peta...</p>
            </div>
          </div>
        ) : (
          <MapDisplayBPN
            assets={mapAssets}
            mode={isBPKARole ? "bpka" : "bpn"}
          />
        )}
      </div>

      {/* ==================== STATS PANEL TOGGLE ==================== */}
      {!showStatsPanel && (
        <button
          onClick={() => setShowStatsPanel(true)}
          className="absolute bottom-16 right-4 z-10 bg-surface/90 backdrop-blur-sm rounded-lg border border-border shadow-lg px-3 py-2 flex items-center gap-2 hover:bg-surface transition-all group"
        >
          <ChartBarIcon size={16} weight="fill" className="text-accent" />
          <span className="text-xs font-semibold text-text-primary hidden sm:inline">
            Statistik
          </span>
          <CaretLeftIcon
            size={14}
            weight="bold"
            className="text-text-muted group-hover:text-accent transition-colors"
          />
        </button>
      )}

      {/* ==================== STATS OVERLAY ==================== */}
      <div
        className={`absolute inset-0 z-30 bg-surface/98 backdrop-blur-md flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
          showStatsPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel Header */}
        <div className="px-4 lg:px-6 py-3 border-b border-border flex items-center justify-between bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <ChartBarIcon size={20} weight="fill" className="text-surface" />
            </div>
            <div>
              <h2 className="font-bold text-text-primary">
                Dashboard {isBPKARole ? "BPKA" : "BPN"}
              </h2>
              <p className="text-xs text-text-muted">
                Selamat datang, {user?.nama_lengkap || "User"} 👋
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowStatsPanel(false)}
            className="flex items-center gap-1.5 px-3 py-2 hover:bg-surface-tertiary rounded-lg transition-colors text-text-secondary group"
          >
            <span className="text-xs font-medium group-hover:text-text-primary">
              Tutup
            </span>
            <CaretRightIcon
              size={16}
              weight="bold"
              className="group-hover:text-accent transition-colors"
            />
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {isBPKARole ? (
            <DashboardBPKAPanel {...panelProps} />
          ) : (
            <DashboardBPNPanel {...panelProps} />
          )}
        </div>
      </div>
    </div>
  );
}
