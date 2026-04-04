import { useNavigate } from "react-router-dom";
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
} from "@phosphor-icons/react";
import { BarChartComponent, DonutChartComponent } from "../charts";

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
  return `${formatNumber(Math.round(num))} m²`;
};

const getActivityBadge = (aksi) => {
  const map = {
    CREATE:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    UPDATE:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    DELETE: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    VIEW: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    LOGIN:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    LOGOUT: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400",
    BACKUP:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
    RESTORE: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  };
  return map[aksi?.toUpperCase()] || "bg-surface-tertiary text-text-secondary";
};

const getActivityIcon = (aksi) => {
  const map = {
    CREATE: PlusIcon,
    UPDATE: PencilSimpleIcon,
    DELETE: TrashIcon,
    VIEW: EyeIcon,
    LOGIN: SignInIcon,
    BACKUP: DownloadSimpleIcon,
  };
  return map[aksi?.toUpperCase()] || ClipboardTextIcon;
};

const getActivityColor = (aksi) => {
  const map = {
    CREATE: "from-emerald-500 to-emerald-600",
    UPDATE: "from-amber-500 to-amber-600",
    DELETE: "from-red-500 to-red-600",
    VIEW: "from-blue-500 to-blue-600",
    LOGIN: "from-purple-500 to-purple-600",
    BACKUP: "from-indigo-500 to-indigo-600",
  };
  return map[aksi?.toUpperCase()] || "from-gray-500 to-gray-600";
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DashboardBPKAPanel({
  loading,
  asetStats,
  userStats,
  riwayatStats,
  recentActivities,
}) {
  const navigate = useNavigate();

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

  // Status donut chart
  const statusColors = {
    Aktif: "#10b981",
    Bermasalah: "#ef4444",
    "Indikasi Bermasalah": "#f59e0b",
    Diblokir: "#6b7280",
  };
  const statusData = asetStats?.byStatus
    ? Object.entries(asetStats.byStatus).map(([name, value]) => ({
        name,
        value,
        color: statusColors[name] || "#8b5cf6",
      }))
    : [];
  const totalStatus = statusData.reduce((s, i) => s + i.value, 0);

  // Jenis aset bar chart
  const jenisData = asetStats?.byJenis
    ? Object.entries(asetStats.byJenis)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  // OPD pengguna data
  const opdData = asetStats?.byOpdPengguna
    ? Object.entries(asetStats.byOpdPengguna)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
    : [];

  const statsCards = [
    {
      label: "Total Aset",
      value: formatNumber(totalAset),
      icon: BuildingsIcon,
      gradient: "from-blue-500 to-blue-600",
      detail: `${Object.keys(asetStats?.byJenis || {}).length} jenis aset terdaftar`,
    },
    {
      label: "Total Nilai",
      value: formatCurrency(asetStats?.totalNilai || 0),
      icon: CurrencyDollarIcon,
      gradient: "from-amber-500 to-amber-600",
      detail: `Rata-rata ${formatCurrency(avgNilai)}/aset`,
    },
    {
      label: "Total Luas",
      value: formatArea(asetStats?.totalLuas),
      icon: RulerIcon,
      gradient: "from-cyan-500 to-cyan-600",
      detail: `Rata-rata ${formatArea(totalAset ? (asetStats?.totalLuas || 0) / totalAset : 0)}/aset`,
    },
    {
      label: "Bermasalah",
      value: formatNumber(totalBermasalah),
      icon: WarningIcon,
      gradient: "from-red-500 to-red-600",
      detail: `${pctBermasalah}% dari total aset`,
      progress: pctBermasalah,
      progressColor: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-4">
      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
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
                      <Icon size={16} weight="fill" className="text-surface" />
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
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== CHARTS ROW ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Distribusi Status - Donut */}
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
                        ({((item.value / totalStatus) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <ChartBarIcon size={32} className="mx-auto mb-2 opacity-50" />
                <span className="text-xs">Belum ada data</span>
              </div>
            </div>
          )}
        </div>

        {/* Jenis Aset - Bar Chart */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-text-primary">
              Komposisi Jenis Aset
            </h3>
            <span className="text-[10px] text-text-muted bg-surface-secondary px-2 py-0.5 rounded-md">
              {jenisData.length} jenis
            </span>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-3 border-accent border-t-transparent rounded-full" />
            </div>
          ) : jenisData.length > 0 ? (
            <div>
              <BarChartComponent
                data={jenisData}
                dataKey="value"
                xAxisKey="name"
                color="#8b5cf6"
                height={160}
                horizontal={true}
              />
              <div className="mt-3 space-y-1.5">
                {jenisData.slice(0, 3).map((item, idx) => (
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
                <BuildingsIcon size={32} className="mx-auto mb-2 opacity-50" />
                <span className="text-xs">Belum ada data jenis</span>
              </div>
            </div>
          )}
        </div>

        {/* OPD Pengguna / Ringkasan */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-text-primary">
              {opdData.length > 0 ? "OPD Pengguna Aset" : "Ringkasan Data"}
            </h3>
          </div>
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-surface-secondary rounded-lg" />
              ))}
            </div>
          ) : opdData.length > 0 ? (
            <div>
              <BarChartComponent
                data={opdData}
                dataKey="value"
                xAxisKey="name"
                color="#3b82f6"
                height={160}
                horizontal={true}
              />
              <div className="mt-3 text-center">
                <span className="text-[10px] text-text-muted">
                  {Object.keys(asetStats?.byOpdPengguna || {}).length} OPD
                  pengguna terdaftar
                </span>
              </div>
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
                    totalAset ? (asetStats?.totalLuas || 0) / totalAset : 0,
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
            </div>
          )}
        </div>
      </div>

      {/* ===== HEALTH BAR + ACTIVITIES ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kesehatan Aset */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-text-primary">
              Kesehatan Aset
            </h3>
            <span
              className={`text-xs font-bold ${pctAktif >= 80 ? "text-emerald-600 dark:text-emerald-400" : pctAktif >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
            >
              {pctAktif}% Sehat
            </span>
          </div>
          {loading ? (
            <div className="animate-pulse h-16 bg-surface-secondary rounded-lg" />
          ) : (
            <>
              <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden flex">
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
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
                {statusData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[10px] text-text-muted">
                      {item.name}: {item.value} (
                      {((item.value / totalStatus) * 100).toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
              {/* Quick insight */}
              <div className="mt-3 p-2.5 bg-surface-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon
                    size={14}
                    weight="fill"
                    className="text-emerald-500 shrink-0"
                  />
                  <span className="text-[10px] text-text-secondary">
                    {totalAktif} aset dalam kondisi aktif dari total {totalAset}{" "}
                    aset yang terdaftar.
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Aktivitas Terbaru */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border overflow-hidden">
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
                const Icon = getActivityIcon(activity.aksi);
                return (
                  <div
                    key={activity.id_riwayat || idx}
                    className="px-4 py-3 hover:bg-surface-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 bg-linear-to-br ${getActivityColor(activity.aksi)} rounded-lg flex items-center justify-center shadow-sm`}
                      >
                        <Icon
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
  );
}
