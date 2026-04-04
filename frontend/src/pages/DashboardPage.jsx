import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  CheckCircleIcon,
  WarningIcon,
  CurrencyDollarIcon,
  RulerIcon,
  MoneyIcon,
  UsersThreeIcon,
  NotePencilIcon,
  ClipboardTextIcon,
  BuildingsIcon,
  CaretRightIcon,
  ArrowRightIcon,
  EyeIcon,
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
  SignInIcon,
  DownloadSimpleIcon,
  MapTrifoldIcon,
  CaretLeftIcon,
} from "@phosphor-icons/react";
import { BarChartComponent, DonutChartComponent } from "../components/charts";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || "bpn";
  const isBPKARole = userRole === "bpka" || userRole === "admin_bpka";

  const [loading, setLoading] = useState(true);
  const [asetStats, setAsetStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [riwayatStats, setRiwayatStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  // Map state
  const [mapAssets, setMapAssets] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);

  // Stats panel
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
      const userRole = user?.role?.toLowerCase();
      const isAdmin = userRole === "admin_bpka" || userRole === "admin_bpn";
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

  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const formatCurrency = (num) => {
    if (!num) return "Rp 0";
    if (num >= 1e12) return `Rp ${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(1)}M`;
    if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(1)}Jt`;
    return `Rp ${formatNumber(num)}`;
  };

  const formatArea = (num) => {
    if (!num) return "0 m²";
    if (num >= 10000) return `${(num / 10000).toFixed(1)} ha`;
    return `${formatNumber(num)} m²`;
  };

  const getActivityBadge = (aksi) => {
    const badges = {
      CREATE:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
      UPDATE:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      DELETE: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      VIEW: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      LOGIN:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
      LOGOUT:
        "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400",
      BACKUP:
        "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
      RESTORE:
        "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
    };
    return (
      badges[aksi?.toUpperCase()] || "bg-surface-tertiary text-text-secondary"
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Computed ratios for stat cards
  const totalAset = asetStats?.totalAset || 0;
  const totalAktif = asetStats?.byStatus?.Aktif || 0;
  const totalBermasalah =
    (asetStats?.byStatus?.Bermasalah || 0) +
    (asetStats?.byStatus?.["Indikasi Bermasalah"] || 0);
  const pctAktif = totalAset ? Math.round((totalAktif / totalAset) * 100) : 0;
  const pctBermasalah = totalAset
    ? Math.round((totalBermasalah / totalAset) * 100)
    : 0;
  const avgNilai = totalAset ? (asetStats?.totalNilai || 0) / totalAset : 0;

  // Stats cards data
  const statsCards = [
    {
      label: "Total Aset",
      value: formatNumber(totalAset),
      icon: ChartBarIcon,
      gradient: "from-blue-500 to-blue-600",
      detail: `${formatArea(asetStats?.totalLuas)} total luas`,
      sub: `${Object.keys(asetStats?.byJenis || {}).length} jenis aset`,
    },
    {
      label: "Aset Aktif",
      value: formatNumber(totalAktif),
      icon: CheckCircleIcon,
      gradient: "from-emerald-500 to-emerald-600",
      detail: `${pctAktif}% dari total aset`,
      progress: pctAktif,
      progressColor: "bg-emerald-500",
    },
    {
      label: "Aset Bermasalah",
      value: formatNumber(totalBermasalah),
      icon: WarningIcon,
      gradient: "from-red-500 to-red-600",
      detail: `${asetStats?.byStatus?.Bermasalah || 0} bermasalah, ${asetStats?.byStatus?.["Indikasi Bermasalah"] || 0} indikasi`,
      progress: pctBermasalah,
      progressColor: "bg-red-500",
    },
    {
      label: "Total Nilai Aset",
      value: formatCurrency(asetStats?.totalNilai || 0),
      icon: CurrencyDollarIcon,
      gradient: "from-amber-500 to-amber-600",
      detail: `Rata-rata ${formatCurrency(avgNilai)}/aset`,
      sub: `${formatArea(asetStats?.totalLuas)} total luas`,
    },
  ];

  // Status distribution for chart data
  const statusData = asetStats?.byStatus
    ? Object.entries(asetStats.byStatus).map(([status, count]) => ({
        name: status,
        value: count,
        color:
          status === "Aktif"
            ? "#10b981"
            : status === "Bermasalah"
              ? "#eab308"
              : status === "Indikasi Bermasalah"
                ? "#3b82f6"
                : "#ef4444",
      }))
    : [];

  const totalStatus = statusData.reduce((sum, item) => sum + item.value, 0);

  // Asset by type chart data
  const jenisAsetData = asetStats?.byJenis
    ? Object.entries(asetStats.byJenis).map(([jenis, count]) => ({
        name: jenis.charAt(0).toUpperCase() + jenis.slice(1),
        value: count,
      }))
    : [];

  // Activity icons map
  const getActivityIcon = (aksi) => {
    const icons = {
      CREATE: PlusIcon,
      UPDATE: PencilSimpleIcon,
      DELETE: TrashIcon,
      VIEW: EyeIcon,
      LOGIN: SignInIcon,
      BACKUP: DownloadSimpleIcon,
    };
    return icons[aksi?.toUpperCase()] || ClipboardTextIcon;
  };

  const getActivityColor = (aksi) => {
    const colors = {
      CREATE: "from-emerald-500 to-emerald-600",
      UPDATE: "from-amber-500 to-amber-600",
      DELETE: "from-red-500 to-red-600",
      VIEW: "from-blue-500 to-blue-600",
      LOGIN: "from-purple-500 to-purple-600",
      BACKUP: "from-indigo-500 to-indigo-600",
    };
    return colors[aksi?.toUpperCase()] || "from-gray-500 to-gray-600";
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

      {/* ==================== MAP OVERLAYS ==================== */}

      {/* ==================== STATS PANEL TOGGLE BUTTON ==================== */}
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

      {/* ==================== STATS OVERLAY (within map area) ==================== */}
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
                Statistik Dashboard
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

        {/* Panel Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="space-y-4">
            {/* Stat Cards - responsive grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {statsCards.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-surface rounded-xl border border-border p-3.5 relative overflow-hidden"
                  >
                    <div
                      className={`absolute -right-4 -top-4 w-16 h-16 bg-linear-to-br ${stat.gradient} rounded-full opacity-5`}
                    />
                    {loading ? (
                      <div className="animate-pulse space-y-2">
                        <div className="w-8 h-8 bg-surface-secondary rounded-lg" />
                        <div className="h-5 bg-surface-secondary rounded w-16" />
                        <div className="h-3 bg-surface-secondary rounded w-20" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-8 h-8 bg-linear-to-br ${stat.gradient} rounded-lg flex items-center justify-center shadow-md`}
                          >
                            <IconComponent
                              size={16}
                              weight="fill"
                              className="text-surface"
                            />
                          </div>
                          <span className="text-[10px] font-medium text-text-muted">
                            {stat.label}
                          </span>
                        </div>
                        <div className="text-xl font-bold text-text-primary">
                          {stat.value}
                        </div>
                        <span className="text-[10px] text-text-muted truncate block mt-1">
                          {stat.detail}
                        </span>
                        {stat.progress !== undefined && (
                          <div className="mt-2">
                            <div className="w-full h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${stat.progressColor} rounded-full transition-all duration-500`}
                                style={{
                                  width: `${Math.min(stat.progress, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {stat.sub && (
                          <span className="text-[10px] text-text-muted block mt-1.5">
                            {stat.sub}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Charts Row - 3 columns on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Distribution - Donut Chart */}
              <div className="bg-surface rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-text-primary">
                    Distribusi Status
                  </h3>
                  <button
                    onClick={() => navigate("/aset")}
                    className="text-[10px] text-accent hover:underline font-medium flex items-center gap-1"
                  >
                    Detail <ArrowRightIcon size={10} />
                  </button>
                </div>
                {loading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-3 border-accent border-t-transparent rounded-full" />
                  </div>
                ) : statusData.length > 0 ? (
                  <div>
                    <DonutChartComponent
                      data={statusData}
                      height={160}
                      innerRadius={40}
                      outerRadius={65}
                      showLabel={true}
                      centerText={{ value: totalStatus, label: "Total" }}
                      onCellClick={(entry) =>
                        navigate("/peta", {
                          state: {
                            filterStatus: entry.name
                              .toLowerCase()
                              .replace(/\s+/g, "_"),
                          },
                        })
                      }
                    />
                    <div className="mt-3 space-y-1.5">
                      {statusData.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
                          onClick={() =>
                            navigate("/peta", {
                              state: {
                                filterStatus: item.name
                                  .toLowerCase()
                                  .replace(/\s+/g, "_"),
                              },
                            })
                          }
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs text-text-secondary">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-text-primary">
                              {item.value}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              ({((item.value / totalStatus) * 100).toFixed(0)}
                              %)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-text-muted">
                    <div className="text-center">
                      <ChartBarIcon
                        size={32}
                        className="mx-auto mb-2 opacity-50"
                      />
                      <span className="text-xs">Belum ada data</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Komposisi Jenis Aset - Bar Chart */}
              <div className="bg-surface rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-text-primary">
                    Komposisi Jenis Aset
                  </h3>
                  <span className="text-[10px] text-text-muted bg-surface-secondary px-2 py-0.5 rounded-md">
                    {jenisAsetData.length} jenis
                  </span>
                </div>
                {loading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-3 border-accent border-t-transparent rounded-full" />
                  </div>
                ) : jenisAsetData.length > 0 ? (
                  <div>
                    <BarChartComponent
                      data={jenisAsetData}
                      dataKey="value"
                      xAxisKey="name"
                      color="#8b5cf6"
                      height={160}
                      horizontal={true}
                    />
                    <div className="mt-3 space-y-1.5">
                      {jenisAsetData
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 3)
                        .map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-1.5"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-purple-500 rounded-full opacity-80" />
                              <span className="text-xs text-text-secondary">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-text-primary">
                              {item.value} aset
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-text-muted">
                    <div className="text-center">
                      <BuildingsIcon
                        size={32}
                        className="mx-auto mb-2 opacity-50"
                      />
                      <span className="text-xs">Belum ada data jenis</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ringkasan Cepat - Compact Stats */}
              <div className="bg-surface rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-text-primary">
                    Ringkasan Data
                  </h3>
                </div>
                {loading ? (
                  <div className="space-y-2 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 bg-surface-secondary rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-surface-secondary rounded-lg">
                      <div className="flex items-center gap-2">
                        <RulerIcon
                          size={16}
                          className="text-blue-600 dark:text-blue-400"
                        />
                        <span className="text-xs text-text-secondary">
                          Total Luas
                        </span>
                      </div>
                      <span className="text-xs font-bold text-text-primary">
                        {formatArea(asetStats?.totalLuas)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-surface-secondary rounded-lg">
                      <div className="flex items-center gap-2">
                        <MoneyIcon
                          size={16}
                          className="text-amber-600 dark:text-amber-400"
                        />
                        <span className="text-xs text-text-secondary">
                          Total Nilai
                        </span>
                      </div>
                      <span className="text-xs font-bold text-text-primary">
                        {formatCurrency(asetStats?.totalNilai)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-surface-secondary rounded-lg">
                      <div className="flex items-center gap-2">
                        <BuildingsIcon
                          size={16}
                          className="text-purple-600 dark:text-purple-400"
                        />
                        <span className="text-xs text-text-secondary">
                          Rata-rata Luas
                        </span>
                      </div>
                      <span className="text-xs font-bold text-text-primary">
                        {formatArea(
                          totalAset
                            ? (asetStats?.totalLuas || 0) / totalAset
                            : 0,
                        )}
                      </span>
                    </div>
                    {userStats && (
                      <div className="flex items-center justify-between p-2.5 bg-surface-secondary rounded-lg">
                        <div className="flex items-center gap-2">
                          <UsersThreeIcon
                            size={16}
                            className="text-indigo-600 dark:text-indigo-400"
                          />
                          <span className="text-xs text-text-secondary">
                            Total Pengguna
                          </span>
                        </div>
                        <span className="text-xs font-bold text-text-primary">
                          {formatNumber(userStats.totalUsers)}
                        </span>
                      </div>
                    )}
                    {riwayatStats && (
                      <div className="flex items-center justify-between p-2.5 bg-surface-secondary rounded-lg">
                        <div className="flex items-center gap-2">
                          <NotePencilIcon
                            size={16}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                          <span className="text-xs text-text-secondary">
                            Total Aktivitas
                          </span>
                        </div>
                        <span className="text-xs font-bold text-text-primary">
                          {formatNumber(riwayatStats?.totalActivities)}
                        </span>
                      </div>
                    )}
                    {/* Status Health Indicator */}
                    <div className="mt-2 p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-text-primary">
                          Kesehatan Aset
                        </span>
                        <span
                          className={`text-[11px] font-bold ${pctAktif >= 80 ? "text-emerald-600 dark:text-emerald-400" : pctAktif >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {pctAktif}% Sehat
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden flex">
                        {statusData.map((item, idx) => (
                          <div
                            key={idx}
                            className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                            style={{
                              width: `${totalStatus ? (item.value / totalStatus) * 100 : 0}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                        {statusData.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[9px] text-text-muted">
                              {item.name} (
                              {((item.value / totalStatus) * 100).toFixed(0)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Aktivitas Terbaru - Full Width */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardTextIcon
                    size={16}
                    weight="fill"
                    className="text-accent"
                  />
                  <h3 className="font-semibold text-sm text-text-primary">
                    Aktivitas Terbaru
                  </h3>
                </div>
                <button
                  onClick={() => navigate("/riwayat")}
                  className="text-[10px] text-accent hover:underline font-medium flex items-center gap-1"
                >
                  Semua <CaretRightIcon size={10} />
                </button>
              </div>
              {loading ? (
                <div className="p-4 space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-surface-secondary rounded-lg" />
                      <div className="flex-1">
                        <div className="h-3 bg-surface-secondary rounded w-1/3 mb-1" />
                        <div className="h-2 bg-surface-secondary rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentActivities.slice(0, 5).map((activity, idx) => {
                    const IconComponent = getActivityIcon(activity.aksi);
                    return (
                      <div
                        key={activity.id_riwayat || idx}
                        className="px-4 py-3 hover:bg-surface-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 bg-linear-to-br ${getActivityColor(activity.aksi)} rounded-lg flex items-center justify-center shadow-sm`}
                          >
                            <IconComponent
                              size={14}
                              weight="bold"
                              className="text-surface"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-medium text-xs text-text-primary">
                                {activity.user?.username ||
                                  activity.user_id ||
                                  "User"}
                              </span>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getActivityBadge(activity.aksi)}`}
                              >
                                {activity.aksi}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-muted truncate">
                              {activity.keterangan ||
                                `${activity.aksi} pada tabel ${activity.tabel}`}
                            </p>
                          </div>
                          <p className="text-[10px] text-text-muted shrink-0">
                            {formatDateTime(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-text-muted">
                  <ClipboardTextIcon
                    size={32}
                    className="mx-auto mb-2 opacity-50"
                  />
                  <span className="text-xs">Belum ada aktivitas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
