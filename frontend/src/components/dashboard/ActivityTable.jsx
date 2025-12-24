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
      Create: "bg-green-100 text-green-700",
      View: "bg-blue-100 text-blue-700",
      Backup: "bg-purple-100 text-purple-700",
      Login: "bg-gray-100 text-gray-700",
      Update: "bg-yellow-100 text-yellow-700",
    };
    return badges[type] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">📋</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Aktivitas Terbaru</h3>
        </div>
        <button 
          onClick={() => navigate("/riwayat")}
          className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-1"
        >
          Lihat Semua
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                No
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Waktu
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Aktivitas
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Deskripsi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.map((activity, idx) => (
              <tr
                key={activity.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-4 py-3 text-sm text-gray-500">
                  {idx + 1}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🕐</span>
                    {activity.waktu}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                    {activity.user}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getActivityBadge(activity.aktivitas)}`}>
                    {activity.aktivitas}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
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
