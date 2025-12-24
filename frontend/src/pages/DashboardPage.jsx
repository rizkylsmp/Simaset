import StatCard from "../components/dashboard/StatCard";
import ChartPlaceholder from "../components/dashboard/ChartPlaceholder";
import ActivityTable from "../components/dashboard/ActivityTable";
import { useAuthStore } from "../stores/authStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const stats = [
    { number: "1,234", label: "Total Aset", icon: "📊", trend: "+12%" },
    { number: "987", label: "Aset Aktif", icon: "✅", trend: "+5%" },
    { number: "45", label: "Aset Berperkara", icon: "⚠️", trend: "-3%" },
    { number: "156", label: "User Terdaftar", icon: "👥", trend: "+8%" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Dashboard
          </h1>
          <p className="text-text-tertiary text-sm mt-1">
            Selamat datang kembali, {user?.nama_lengkap || "User"} 👋
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-2 shadow-sm">
          <span className="text-sm text-text-tertiary">Role:</span>
          <span className="text-sm font-semibold text-text-primary bg-surface-tertiary px-2 py-0.5 rounded">
            {user?.role?.toUpperCase() || "ADMIN"}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-xl border border-border p-5 hover:shadow-lg transition-all duration-300 hover:border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">{stat.number}</div>
            <div className="text-sm text-text-tertiary">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-xl border border-border p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Perkembangan Aset Per Tahun</h3>
              <select className="text-sm border border-border rounded-lg px-3 py-1.5 text-text-secondary bg-surface focus:outline-none focus:ring-2 focus:ring-accent">
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>
            </div>
            <div className="h-64 bg-surface-secondary rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center text-text-muted">
                <span className="text-4xl block mb-2">📈</span>
                <span className="text-sm">Line Chart Placeholder</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart - Takes 1 column */}
        <div>
          <div className="bg-surface rounded-xl border border-border p-6 h-full">
            <h3 className="font-semibold text-text-primary mb-4">Distribusi Status Aset</h3>
            <div className="h-64 bg-surface-secondary rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center text-text-muted">
                <span className="text-4xl block mb-2">🥧</span>
                <span className="text-sm">Pie Chart Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
          <h3 className="font-semibold text-text-primary">Aktivitas Terbaru</h3>
          <button 
            onClick={() => alert('Lihat Semua Aktivitas (Logic akan diimplementasikan nanti)')}
            className="text-sm text-text-secondary hover:text-text-primary font-medium transition-colors"
          >
            Lihat Semua →
          </button>
        </div>
        <ActivityTable />
      </div>
    </div>
  );
}
