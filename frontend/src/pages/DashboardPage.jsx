import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { asetService, userService, riwayatService } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import {
  ChartBarIcon,
  CheckCircleIcon,
  WarningIcon,
  CurrencyDollarIcon,
  RulerIcon,
  MoneyIcon,
  UsersThreeIcon,
  UserCheckIcon,
  NotePencilIcon,
  ClipboardTextIcon,
  BuildingsIcon,
  CaretRightIcon,
  TrendUpIcon,
  TrendDownIcon,
  CalendarBlankIcon,
  ArrowRightIcon,
  EyeIcon,
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
  SignInIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";
import {
  AreaChartComponent,
  BarChartComponent,
  DonutChartComponent,
  SparklineChart,
} from "../components/charts";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [asetStats, setAsetStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [riwayatStats, setRiwayatStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const userRole = user?.role?.toLowerCase();
      const isAdmin = userRole === "admin";
      const canViewRiwayat = isAdmin || userRole === "bpkad";

      const promises = [asetService.getStats()];
      promises.push(isAdmin ? userService.getStats() : Promise.resolve(null));
      promises.push(canViewRiwayat ? riwayatService.getStats() : Promise.resolve(null));
      promises.push(canViewRiwayat ? riwayatService.getAll({ limit: 5 }) : Promise.resolve(null));

      const [asetRes, userRes, riwayatRes, activitiesRes] = await Promise.all(promises);

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

  // Stats cards data
  const statsCards = [
    {
      label: "Total Aset",
      value: formatNumber(asetStats?.totalAset || 0),
      icon: ChartBarIcon,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
      detail: `${formatArea(asetStats?.totalLuas)} total luas`,
      trend: { value: 12, isUp: true },
      sparkData: [
        { value: 30 },
        { value: 45 },
        { value: 35 },
        { value: 50 },
        { value: 40 },
        { value: 60 },
        { value: asetStats?.totalAset || 55 },
      ],
    },
    {
      label: "Aset Aktif",
      value: formatNumber(asetStats?.byStatus?.Aktif || 0),
      icon: CheckCircleIcon,
      gradient: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50 dark:bg-emerald-900/20",
      detail: "Status aktif & siap pakai",
      trend: { value: 8, isUp: true },
      sparkData: [
        { value: 20 },
        { value: 35 },
        { value: 25 },
        { value: 40 },
        { value: 30 },
        { value: 45 },
        { value: asetStats?.byStatus?.Aktif || 40 },
      ],
    },
    {
      label: "Aset Berperkara",
      value: formatNumber(
        (asetStats?.byStatus?.Berperkara || 0) +
          (asetStats?.byStatus?.["Indikasi Berperkara"] || 0),
      ),
      icon: WarningIcon,
      gradient: "from-red-500 to-red-600",
      bgLight: "bg-red-50 dark:bg-red-900/20",
      detail: `${asetStats?.byStatus?.Berperkara || 0} berperkara, ${
        asetStats?.byStatus?.["Indikasi Berperkara"] || 0
      } indikasi`,
      trend: { value: 3, isUp: false },
      sparkData: [
        { value: 10 },
        { value: 15 },
        { value: 12 },
        { value: 18 },
        { value: 14 },
        { value: 10 },
        {
          value:
            (asetStats?.byStatus?.Berperkara || 0) +
              (asetStats?.byStatus?.["Indikasi Berperkara"] || 0) || 8,
        },
      ],
    },
    {
      label: "Total Nilai Aset",
      value: formatCurrency(asetStats?.totalNilai || 0),
      icon: CurrencyDollarIcon,
      gradient: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50 dark:bg-amber-900/20",
      detail: "Nilai keseluruhan aset",
      trend: { value: 15, isUp: true },
      sparkData: [
        { value: 40 },
        { value: 55 },
        { value: 45 },
        { value: 70 },
        { value: 60 },
        { value: 80 },
        { value: 75 },
      ],
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
            : status === "Berperkara"
              ? "#ef4444"
              : status === "Indikasi Berperkara"
                ? "#f59e0b"
                : "#3b82f6",
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

  // Mock activity trend data (last 7 days)
  const activityTrendData = [
    { name: "Sen", aktivitas: 12 },
    { name: "Sel", aktivitas: 19 },
    { name: "Rab", aktivitas: 15 },
    { name: "Kam", aktivitas: 25 },
    { name: "Jum", aktivitas: 22 },
    { name: "Sab", aktivitas: 8 },
    { name: "Min", aktivitas: 5 },
  ];

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
    <div className="p-4 lg:p-6 space-y-6 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <ChartBarIcon size={24} weight="duotone" className="text-surface" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
              Dashboard
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Selamat datang kembali,{" "}
              <span className="font-medium text-text-secondary">
                {user?.nama_lengkap || "User"}
              </span>{" "}
              👋
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-2.5 shadow-sm">
            <CalendarBlankIcon size={18} className="text-text-muted" />
            <span className="text-sm text-text-secondary">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.label}
              className="group bg-surface rounded-2xl border border-border p-5 hover:shadow-xl hover:border-accent/30 transition-all duration-300 relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background decoration */}
              <div
                className={`absolute -right-8 -top-8 w-32 h-32 bg-linear-to-br ${stat.gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity`}
              />

              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-surface-secondary rounded-xl" />
                    <div className="w-20 h-8 bg-surface-secondary rounded" />
                  </div>
                  <div className="h-6 bg-surface-secondary rounded w-24" />
                  <div className="h-4 bg-surface-secondary rounded w-32" />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-linear-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <IconComponent
                        size={24}
                        weight="fill"
                        className="text-surface"
                      />
                    </div>
                    <div className="w-20 h-10">
                      <SparklineChart
                        data={stat.sparkData}
                        color={
                          stat.gradient.includes("blue")
                            ? "#3b82f6"
                            : stat.gradient.includes("emerald")
                              ? "#10b981"
                              : stat.gradient.includes("red")
                                ? "#ef4444"
                                : "#f59e0b"
                        }
                        height={40}
                        showDot={false}
                      />
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-text-secondary mb-2">
                    {stat.label}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {stat.detail}
                    </span>
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${
                        stat.trend.isUp
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {stat.trend.isUp ? (
                        <TrendUpIcon size={14} weight="bold" />
                      ) : (
                        <TrendDownIcon size={14} weight="bold" />
                      )}
                      {stat.trend.value}%
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution - Donut Chart */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-text-primary">
              Distribusi Status
            </h3>
            <button
              onClick={() => navigate("/aset")}
              className="text-xs text-accent hover:underline font-medium flex items-center gap-1"
            >
              Lihat Detail <ArrowRightIcon size={12} />
            </button>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
            </div>
          ) : statusData.length > 0 ? (
            <div>
              <DonutChartComponent
                data={statusData}
                height={200}
                innerRadius={50}
                outerRadius={80}
                showLabel={true}
                centerText={{
                  value: totalStatus,
                  label: "Total Aset",
                }}
              />
              {/* Legend */}
              <div className="mt-4 space-y-2">
                {statusData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-text-secondary">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {item.value}
                      </span>
                      <span className="text-xs text-text-muted">
                        ({((item.value / totalStatus) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <ChartBarIcon size={48} className="mx-auto mb-2 opacity-50" />
                <span className="text-sm">Belum ada data</span>
              </div>
            </div>
          )}
        </div>

        {/* Jenis Aset - Bar Chart */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-text-primary">Jenis Aset</h3>
            <button
              onClick={() => navigate("/aset")}
              className="text-xs text-accent hover:underline font-medium flex items-center gap-1"
            >
              Lihat Detail <ArrowRightIcon size={12} />
            </button>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
            </div>
          ) : jenisAsetData.length > 0 ? (
            <BarChartComponent
              data={jenisAsetData}
              dataKey="value"
              xAxisKey="name"
              color="#3b82f6"
              height={280}
              showGrid={true}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <BuildingsIcon size={48} className="mx-auto mb-2 opacity-50" />
                <span className="text-sm">Belum ada data jenis aset</span>
              </div>
            </div>
          )}
        </div>

        {/* Aktivitas Trend - Area Chart */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-text-primary">Tren Aktivitas</h3>
            <span className="text-xs text-text-muted bg-surface-secondary px-2 py-1 rounded-md">
              7 hari terakhir
            </span>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
            </div>
          ) : (
            <div>
              <AreaChartComponent
                data={activityTrendData}
                dataKey="aktivitas"
                xAxisKey="name"
                color="#8b5cf6"
                height={220}
                gradientId="activityGradient"
              />
              <div className="mt-4 flex items-center justify-between p-3 bg-surface-secondary rounded-xl">
                <div>
                  <p className="text-xs text-text-muted">Total Minggu Ini</p>
                  <p className="text-xl font-bold text-text-primary">
                    {activityTrendData.reduce((sum, d) => sum + d.aktivitas, 0)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <TrendUpIcon size={16} weight="bold" />
                  <span className="text-sm font-medium">+18%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Quick Stats & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-text-primary mb-4">
            Ringkasan Data
          </h3>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-surface-secondary rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <RulerIcon
                      size={20}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <span className="text-sm text-text-secondary">
                    Total Luas
                  </span>
                </div>
                <span className="font-bold text-text-primary">
                  {formatArea(asetStats?.totalLuas)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <MoneyIcon
                      size={20}
                      className="text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <span className="text-sm text-text-secondary">
                    Total Nilai
                  </span>
                </div>
                <span className="font-bold text-text-primary">
                  {formatCurrency(asetStats?.totalNilai)}
                </span>
              </div>

              {userStats && (
                <>
                  <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <UsersThreeIcon
                          size={20}
                          className="text-purple-600 dark:text-purple-400"
                        />
                      </div>
                      <span className="text-sm text-text-secondary">
                        Total User
                      </span>
                    </div>
                    <span className="font-bold text-text-primary">
                      {formatNumber(userStats.totalUsers)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <UserCheckIcon
                          size={20}
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <span className="text-sm text-text-secondary">
                        UserIcon Aktif
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatNumber(userStats.activeUsers)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <NotePencilIcon
                      size={20}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <span className="text-sm text-text-secondary">
                    Total Aktivitas
                  </span>
                </div>
                <span className="font-bold text-text-primary">
                  {formatNumber(riwayatStats?.totalActivities)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardTextIcon size={20} className="text-surface" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  Aktivitas Terbaru
                </h3>
                <p className="text-xs text-text-muted">
                  {recentActivities.length} aktivitas terakhir
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/riwayat")}
              className="text-sm text-accent hover:text-accent/80 font-medium transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-accent/10"
            >
              Lihat Semua
              <CaretRightIcon size={16} />
            </button>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-secondary rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-surface-secondary rounded w-1/3 mb-2" />
                      <div className="h-3 bg-surface-secondary rounded w-1/2" />
                    </div>
                    <div className="w-16 h-6 bg-surface-secondary rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="divide-y divide-border">
              {recentActivities.map((activity, idx) => {
                const IconComponent = getActivityIcon(activity.aksi);
                return (
                  <div
                    key={activity.id_riwayat || idx}
                    className="px-6 py-4 hover:bg-surface-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 bg-linear-to-br ${getActivityColor(
                          activity.aksi,
                        )} rounded-xl flex items-center justify-center shadow-md`}
                      >
                        <IconComponent
                          size={18}
                          weight="bold"
                          className="text-surface"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm text-text-primary">
                            {activity.user?.username ||
                              activity.user_id ||
                              "User"}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${getActivityBadge(
                              activity.aksi,
                            )}`}
                          >
                            {activity.aksi}
                          </span>
                        </div>
                        <p className="text-sm text-text-muted truncate">
                          {activity.keterangan ||
                            `${activity.aksi} pada tabel ${activity.tabel}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-muted">
                          {formatDateTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-text-muted">
              <ClipboardTextIcon size={48} className="mx-auto mb-2 opacity-50" />
              <span className="text-sm">Belum ada aktivitas terbaru</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
