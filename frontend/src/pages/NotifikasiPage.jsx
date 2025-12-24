import { useState } from "react";

export default function NotifikasiPage() {
  const [activeTab, setActiveTab] = useState("semua");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "login",
      icon: "👤",
      iconBg: "bg-gray-100",
      title: "Login Berhasil",
      isNew: true,
      time: "2 menit yang lalu",
      content: "Anda berhasil login ke sistem pada 15 Januari 2025, pukul 14:35:22 WIB.",
      detail: "IP Address: 192.168.1.100 | Device: Chrome (Windows)",
      actions: ["tandai_dibaca", "hapus"],
      isRead: false,
    },
    {
      id: 2,
      type: "update",
      icon: "📝",
      iconBg: "bg-yellow-100",
      title: "Perubahan Data Aset",
      isNew: true,
      time: "15 menit yang lalu",
      content: 'Data aset AST-045 telah diupdate oleh "bpn_user01".',
      detail: 'Perubahan: Status berubah dari "Aktif" menjadi "Dalam Verifikasi"',
      actions: ["lihat_detail", "tandai_dibaca", "hapus"],
      isRead: false,
    },
    {
      id: 3,
      type: "warning",
      icon: "⚠️",
      iconBg: "bg-orange-100",
      title: "Peringatan Sistem",
      isNew: true,
      time: "1 jam yang lalu",
      content: "Backup otomatis sistem akan dilakukan pada 16 Januari 2025, pukul 02:00 WIB.",
      detail: "Sistem mungkin tidak dapat diakses selama 10-15 menit.",
      actions: ["tandai_dibaca", "hapus"],
      isRead: false,
    },
    {
      id: 4,
      type: "success",
      icon: "✅",
      iconBg: "bg-green-100",
      title: "Verifikasi Data Selesai",
      isNew: false,
      time: "3 jam yang lalu",
      content: "Verifikasi data aset AST-032 oleh BPN telah selesai.",
      detail: "Status: Disetujui | Nomor Sertifikat: SHM-0012025",
      actions: ["lihat_detail", "hapus"],
      isRead: true,
    },
    {
      id: 5,
      type: "backup",
      icon: "💾",
      iconBg: "bg-purple-100",
      title: "Backup Berhasil",
      isNew: false,
      time: "Kemarin, 02:15",
      content: "Backup database sistem telah berhasil dilakukan.",
      detail: "File: backup_20250114_021500.sql | Ukuran: 156 MB",
      actions: ["download", "hapus"],
      isRead: true,
    },
    {
      id: 6,
      type: "user",
      icon: "👥",
      iconBg: "bg-blue-100",
      title: "User Baru Terdaftar",
      isNew: false,
      time: "2 hari yang lalu",
      content: 'User baru "tataruang02" telah didaftarkan dalam sistem.',
      detail: "Role: Dinas Tata Ruang | Oleh: admin01",
      actions: ["lihat_profil", "hapus"],
      isRead: true,
    },
    {
      id: 7,
      type: "report",
      icon: "📊",
      iconBg: "bg-orange-100",
      title: "Laporan Bulanan Tersedia",
      isNew: false,
      time: "3 hari yang lalu",
      content: "Laporan bulanan Desember 2024 telah dibuat dan siap didownload.",
      detail: "Total Aset: 1,234 | Aset Baru: 45 | Perubahan Status: 23",
      actions: ["download_laporan", "hapus"],
      isRead: true,
    },
  ]);

  // Statistics
  const stats = {
    total: notifications.length,
    belumDibaca: notifications.filter((n) => !n.isRead).length,
    hariIni: notifications.filter((n) => n.time.includes("menit") || n.time.includes("jam")).length,
  };

  const tabs = [
    { id: "semua", label: "Semua", count: stats.total },
    { id: "belum_dibaca", label: "Belum Dibaca", count: stats.belumDibaca },
    { id: "sudah_dibaca", label: "Sudah Dibaca", count: stats.total - stats.belumDibaca },
  ];

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, isNew: false } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, isNew: false }))
    );
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDeleteAll = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua notifikasi?")) {
      setNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "belum_dibaca") return !n.isRead;
    if (activeTab === "sudah_dibaca") return n.isRead;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola pemberitahuan dan aktivitas terbaru</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            <span>✓</span>
            Tandai Semua Dibaca
          </button>
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-red-50 transition-all"
          >
            <span>🗑️</span>
            Hapus Semua
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🔔</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Notifikasi</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📬</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.belumDibaca}</div>
              <div className="text-sm text-gray-500">Belum Dibaca</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.hariIni}</div>
              <div className="text-sm text-gray-500">Hari Ini</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-100">
          {filteredNotifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-gray-500">Tidak ada notifikasi</div>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  !notif.isRead ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${notif.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                    <span className="text-xl">{notif.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                      {notif.isNew && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          BARU
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{notif.content}</p>
                    <p className="text-xs text-gray-400 mb-3">{notif.detail}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          ✓ Tandai Dibaca
                        </button>
                      )}
                      {notif.actions.includes("lihat_detail") && (
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                          → Lihat Detail
                        </button>
                      )}
                      {notif.actions.includes("download") && (
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                          ↓ Download
                        </button>
                      )}
                      {notif.actions.includes("download_laporan") && (
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                          ↓ Download Laporan
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        × Hapus
                      </button>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="text-xs text-gray-400 shrink-0">
                    {notif.time}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
