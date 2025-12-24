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
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Selamat datang kembali, {user?.nama_lengkap || "User"} 👋
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
          <span className="text-sm text-gray-500">Role:</span>
          <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
            {user?.role?.toUpperCase() || "ADMIN"}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:border-gray-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Perkembangan Aset Per Tahun</h3>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
              <div className="text-center text-gray-400">
                <span className="text-4xl block mb-2">📈</span>
                <span className="text-sm">Line Chart Placeholder</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart - Takes 1 column */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
            <h3 className="font-semibold text-gray-900 mb-4">Distribusi Status Aset</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
              <div className="text-center text-gray-400">
                <span className="text-4xl block mb-2">🥧</span>
                <span className="text-sm">Pie Chart Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Aktivitas Terbaru</h3>
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Lihat Semua →
          </button>
        </div>
        <ActivityTable />
      </div>
    </div>
  );
}
