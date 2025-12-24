export default function ActivityTable() {
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

  return (
    <div className="border-2 border-black bg-white">
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-3">
        <div className="text-sm font-bold">Aktivitas Terbaru</div>
        <button className="border-2 border-white px-3 py-1 text-xs font-medium hover:bg-white hover:text-black transition">
          [Button] Lihat Semua
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-black text-white border-b-2 border-black">
              <th className="border-r-2 border-black px-4 py-3 text-left text-sm font-bold w-12">
                No
              </th>
              <th className="border-r-2 border-black px-4 py-3 text-left text-sm font-bold">
                Waktu
              </th>
              <th className="border-r-2 border-black px-4 py-3 text-left text-sm font-bold">
                User
              </th>
              <th className="border-r-2 border-black px-4 py-3 text-left text-sm font-bold">
                Aktivitas
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold">
                Deskripsi
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, idx) => (
              <tr
                key={activity.id}
                className="border-b-2 border-black hover:bg-gray-50"
              >
                <td className="border-r-2 border-black px-4 py-3 text-sm text-black">
                  {idx + 1}
                </td>
                <td className="border-r-2 border-black px-4 py-3 text-sm text-black">
                  {activity.waktu}
                </td>
                <td className="border-r-2 border-black px-4 py-3 text-sm text-black">
                  {activity.user}
                </td>
                <td className="border-r-2 border-black px-4 py-3 text-sm text-black font-medium">
                  {activity.aktivitas}
                </td>
                <td className="px-4 py-3 text-sm text-blue-600 hover:underline cursor-pointer">
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
