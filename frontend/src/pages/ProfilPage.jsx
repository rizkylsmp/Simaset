import { useState } from "react";
import { useAuthStore } from "../stores/authStore";

export default function ProfilPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("informasi_pribadi");

  // User profile data
  const [profileData, setProfileData] = useState({
    username: user?.username || "admin01",
    role: user?.role || "Admin",
    namaLengkap: user?.nama_lengkap || "Budi Santoso",
    nip: "199001012020011001",
    email: user?.email || "admin@stpn.ac.id",
    noTelepon: "08123456789",
    jabatan: "Administrator Sistem",
    instansi: "Sekolah Tinggi Pertanahan Nasional",
    alamat: "Jl. Tata Bumi No. 5, Gamping, Sleman, Yogyakarta",
  });

  // Account info
  const accountInfo = {
    akunDibuat: "15 Januari 2024",
    loginTerakhir: "15 Januari 2025, 14:35",
    statusAkun: "Aktif",
  };

  // Stats
  const stats = {
    totalLogin: 245,
    aktivitas: 1234,
    hariAktif: 89,
  };

  // Security data
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Recent activities
  const recentActivities = [
    { id: 1, aksi: "Login ke sistem", waktu: "15 Jan 2025, 14:35", ip: "192.168.1.100" },
    { id: 2, aksi: "Mengupdate data aset AST-045", waktu: "15 Jan 2025, 14:20", ip: "192.168.1.100" },
    { id: 3, aksi: "Menambah aset baru AST-156", waktu: "15 Jan 2025, 13:45", ip: "192.168.1.100" },
    { id: 4, aksi: "Download laporan bulanan", waktu: "14 Jan 2025, 16:30", ip: "192.168.1.100" },
    { id: 5, aksi: "Login ke sistem", waktu: "14 Jan 2025, 09:00", ip: "192.168.1.100" },
  ];

  const tabs = [
    { id: "informasi_pribadi", label: "Informasi Pribadi", icon: "👤" },
    { id: "keamanan", label: "Keamanan", icon: "🔒" },
    { id: "aktivitas_terakhir", label: "Aktivitas Terakhir", icon: "📋" },
  ];

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurityData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    alert("Perubahan profil berhasil disimpan!");
  };

  const handleChangePassword = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert("Password baru dan konfirmasi tidak cocok!");
      return;
    }
    if (securityData.newPassword.length < 8) {
      alert("Password minimal 8 karakter!");
      return;
    }
    alert("Password berhasil diubah!");
    setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleChangeFoto = () => {
    document.getElementById("foto-input").click();
  };

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`Foto "${file.name}" berhasil diupload`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Pengguna</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola informasi akun dan pengaturan keamanan</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-linear-to-r from-gray-900 to-gray-700 px-6 py-8">
          <div className="flex items-center gap-6">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-4xl">👤</span>
              </div>
              <input
                type="file"
                id="foto-input"
                accept="image/*"
                className="hidden"
                onChange={handleFotoUpload}
              />
              <button
                onClick={handleChangeFoto}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-sm hover:bg-gray-100 transition-colors"
              >
                📷
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{profileData.namaLengkap}</h2>
              <p className="text-gray-300 text-sm">{profileData.email}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {profileData.role}
                </span>
                <span className="bg-green-500/80 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  ✓ {accountInfo.statusAkun}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.totalLogin}</div>
                <div className="text-xs text-gray-300">Total Login</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.aktivitas.toLocaleString()}</div>
                <div className="text-xs text-gray-300">Aktivitas</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.hariAktif}</div>
                <div className="text-xs text-gray-300">Hari Aktif</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Tab: Informasi Pribadi */}
          {activeTab === "informasi_pribadi" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                  <input
                    type="text"
                    value={profileData.username}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <input
                    type="text"
                    value={profileData.role}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={profileData.namaLengkap}
                    onChange={(e) => handleInputChange("namaLengkap", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">NIP</label>
                  <input
                    type="text"
                    value={profileData.nip}
                    onChange={(e) => handleInputChange("nip", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">No. Telepon</label>
                  <input
                    type="tel"
                    value={profileData.noTelepon}
                    onChange={(e) => handleInputChange("noTelepon", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jabatan</label>
                  <input
                    type="text"
                    value={profileData.jabatan}
                    onChange={(e) => handleInputChange("jabatan", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Instansi</label>
                  <input
                    type="text"
                    value={profileData.instansi}
                    onChange={(e) => handleInputChange("instansi", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
                  <textarea
                    value={profileData.alamat}
                    onChange={(e) => handleInputChange("alamat", e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}

          {/* Tab: Keamanan */}
          {activeTab === "keamanan" && (
            <div className="max-w-lg space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Login Terakhir</h4>
                  <p className="text-sm text-gray-500">{accountInfo.loginTerakhir}</p>
                </div>
                <span className="text-green-600">✓</span>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Ubah Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Saat Ini</label>
                    <input
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => handleSecurityChange("currentPassword", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                      placeholder="Masukkan password saat ini"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
                    <input
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => handleSecurityChange("newPassword", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                      placeholder="Minimal 8 karakter"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => handleSecurityChange("confirmPassword", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="mt-4 bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all text-sm font-medium"
                >
                  Ubah Password
                </button>
              </div>
            </div>
          )}

          {/* Tab: Aktivitas Terakhir */}
          {activeTab === "aktivitas_terakhir" && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Waktu</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{activity.aksi}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{activity.waktu}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{activity.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
