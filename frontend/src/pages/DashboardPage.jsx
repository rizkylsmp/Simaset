import Header from "../components/dashboard/Header";
import Sidebar from "../components/dashboard/Sidebar";
import StatCard from "../components/dashboard/StatCard";
import ChartPlaceholder from "../components/dashboard/ChartPlaceholder";
import ActivityTable from "../components/dashboard/ActivityTable";
import { useAuthStore } from "../stores/authStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const stats = [
    { number: "1,234", label: "Total Aset" },
    { number: "987", label: "Aset Aktif" },
    { number: "45", label: "Aset Berperkara" },
    { number: "156", label: "User Terdaftar" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 space-y-6">
          {/* Page Title */}
          <div className="text-3xl font-bold">
            DASHBOARD {user?.role?.toUpperCase() || "ADMIN"}
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                number={stat.number}
                label={stat.label}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-3 gap-6">
            {/* Line Chart - Takes 2 columns */}
            <div className="col-span-2">
              <ChartPlaceholder
                title="Perkembangan Aset Per Tahun"
                type="line"
              />
            </div>

            {/* Pie Chart - Takes 1 column */}
            <div>
              <ChartPlaceholder title="Distribusi Status Aset" type="pie" />
            </div>
          </div>

          {/* Activity Table */}
          <ActivityTable />
        </main>
      </div>
    </div>
  );
}
