import { useNavigate } from "react-router-dom";

export default function ActivityTable() {
  const navigate = useNavigate();

  const activities = [
    {
      id: 1,
      waktu: "2025-01-15 10:30",
      user: "dinas_aset01",
      aktivitas: "Create",
      deskripsi: "Menambah aset tanah baru AST-001",
    },
    {
      id: 2,
      waktu: "2025-01-15 10:25",
      user: "bpn_user01",
      aktivitas: "View",
      deskripsi: "Melihat detail aset AST-045",
    },
    {
      id: 3,
      waktu: "2025-01-15 10:20",
      user: "admin01",
      aktivitas: "Backup",
      deskripsi: "Melakukan backup database",
    },
    {
      id: 4,
      waktu: "2025-01-15 10:15",
      user: "tataruang01",
      aktivitas: "Login",
      deskripsi: "Login ke sistem",
    },
    {
      id: 5,
      waktu: "2025-01-15 10:10",
      user: "dinas_aset01",
      aktivitas: "Update",
      deskripsi: "Mengupdate status aset AST-032",
    },
  ];

  const getActivityBadge = (type) => {
    const badges = {
      Create:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      View: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      Backup:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
      Login: "bg-surface-tertiary text-text-secondary",
      Update:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    };
    return badges[type] || "bg-surface-tertiary text-text-secondary";
  };

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light bg-surface-secondary">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white dark:text-gray-900 text-sm">📋</span>
          </div>
          <h3 className="text-sm font-semibold text-text-primary">
            Aktivitas Terbaru
          </h3>
        </div>
        <button
          onClick={() => navigate("/riwayat")}
          className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-lg transition-all duration-200 flex items-center gap-1"
        >
          Lihat Semua
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-secondary border-b border-border-light">
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider w-12">
                No
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Waktu
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Aktivitas
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Deskripsi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {activities.map((activity, idx) => (
              <tr
                key={activity.id}
                className="hover:bg-surface-secondary transition-colors duration-150"
              >
                <td className="px-4 py-3 text-sm text-text-tertiary">
                  {idx + 1}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">🕐</span>
                    {activity.waktu}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-text-primary font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-surface-tertiary rounded-full flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                    {activity.user}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getActivityBadge(
                      activity.aktivitas
                    )}`}
                  >
                    {activity.aktivitas}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {activity.deskripsi}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
