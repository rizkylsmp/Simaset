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
    {
      id: 1,
      aksi: "Login ke sistem",
      waktu: "15 Jan 2025, 14:35",
      ip: "192.168.1.100",
    },
    {
      id: 2,
      aksi: "Mengupdate data aset AST-045",
      waktu: "15 Jan 2025, 14:20",
      ip: "192.168.1.100",
    },
    {
      id: 3,
      aksi: "Menambah aset baru AST-156",
      waktu: "15 Jan 2025, 13:45",
      ip: "192.168.1.100",
    },
    {
      id: 4,
      aksi: "Download laporan bulanan",
      waktu: "14 Jan 2025, 16:30",
      ip: "192.168.1.100",
    },
    {
      id: 5,
      aksi: "Login ke sistem",
      waktu: "14 Jan 2025, 09:00",
      ip: "192.168.1.100",
    },
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
    alert(
      "Perubahan profil berhasil disimpan! (Logic akan diimplementasikan nanti)"
    );
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
    alert("Password berhasil diubah! (Logic akan diimplementasikan nanti)");
    setSecurityData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChangeFoto = () => {
    document.getElementById("foto-input").click();
  };

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(
        `Foto "${file.name}" berhasil diupload (Logic akan diimplementasikan nanti)`
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          Profil Pengguna
        </h1>
        <p className="text-text-tertiary text-xs sm:text-sm mt-1">
          Kelola informasi akun dan pengaturan keamanan
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="bg-linear-to-r from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-600 px-4 sm:px-6 py-5 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Profile Photo */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center border-4 border-white dark:border-gray-600 shadow-lg">
                <span className="text-3xl sm:text-4xl">👤</span>
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
                className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white dark:bg-gray-700 rounded-lg shadow-md flex items-center justify-center text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                📷
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                {profileData.namaLengkap}
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm truncate">
                {profileData.email}
              </p>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-wrap">
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full">
                  {profileData.role}
                </span>
                <span className="bg-green-500/80 text-white text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full">
                  ✓ {accountInfo.statusAkun}
                </span>
              </div>
            </div>

            {/* Stats - Hidden on mobile, shown on sm+ */}
            <div className="hidden sm:flex gap-3 lg:gap-4 shrink-0">
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 lg:px-5 py-2.5 lg:py-3 text-center">
                <div className="text-xl lg:text-2xl font-bold text-white">
                  {stats.totalLogin}
                </div>
                <div className="text-[10px] lg:text-xs text-gray-300">
                  Total Login
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 lg:px-5 py-2.5 lg:py-3 text-center">
                <div className="text-xl lg:text-2xl font-bold text-white">
                  {stats.aktivitas.toLocaleString()}
                </div>
                <div className="text-[10px] lg:text-xs text-gray-300">
                  Aktivitas
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 lg:px-5 py-2.5 lg:py-3 text-center">
                <div className="text-xl lg:text-2xl font-bold text-white">
                  {stats.hariAktif}
                </div>
                <div className="text-[10px] lg:text-xs text-gray-300">
                  Hari Aktif
                </div>
              </div>
            </div>
          </div>

          {/* Stats - Mobile only (below profile info) */}
          <div className="flex sm:hidden justify-center gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-center flex-1 max-w-[100px]">
              <div className="text-lg font-bold text-white">
                {stats.totalLogin}
              </div>
              <div className="text-[10px] text-gray-300">Login</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-center flex-1 max-w-[100px]">
              <div className="text-lg font-bold text-white">
                {stats.aktivitas.toLocaleString()}
              </div>
              <div className="text-[10px] text-gray-300">Aktivitas</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-center flex-1 max-w-[100px]">
              <div className="text-lg font-bold text-white">
                {stats.hariAktif}
              </div>
              <div className="text-[10px] text-gray-300">Hari Aktif</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-text-primary border-b-2 border-accent"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
                <span className="xs:hidden sm:hidden">
                  {tab.label.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {/* Tab: Informasi Pribadi */}
          {activeTab === "informasi_pribadi" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    disabled
                    className="w-full border border-border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-surface-secondary text-text-tertiary"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                    Role
                  </label>
                  <input
                    type="text"
                    value={profileData.role}
                    disabled
                    className="w-full border border-border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-surface-secondary text-text-tertiary"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={profileData.namaLengkap}
                    onChange={(e) =>
                      handleInputChange("namaLengkap", e.target.value)
                    }
                    className="w-full border border-border bg-surface text-text-primary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                    NIP
                  </label>
                  <input
                    type="text"
                    value={profileData.nip}
                    onChange={(e) => handleInputChange("nip", e.target.value)}
                    className="w-full border border-border bg-surface text-text-primary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full border border-border bg-surface text-text-primary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    value={profileData.noTelepon}
                    onChange={(e) =>
                      handleInputChange("noTelepon", e.target.value)
                    }
                    className="w-full border border-border bg-surface text-text-primary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={profileData.jabatan}
                    onChange={(e) =>
                      handleInputChange("jabatan", e.target.value)
                    }
                    className="w-full border border-border bg-surface text-text-primary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                    Instansi
                  </label>
                  <input
                    type="text"
                    value={profileData.instansi}
                    onChange={(e) =>
                      handleInputChange("instansi", e.target.value)
                    }
                    className="w-full border border-border bg-surface text-text-primary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                    Alamat
                  </label>
                  <textarea
                    value={profileData.alamat}
                    onChange={(e) =>
                      handleInputChange("alamat", e.target.value)
                    }
                    rows={3}
                    className="w-full border border-border bg-surface text-text-primary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="w-full sm:w-auto bg-accent text-surface px-6 py-2.5 rounded-lg hover:opacity-90 transition-all text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}

          {/* Tab: Keamanan */}
          {activeTab === "keamanan" && (
            <div className="max-w-lg space-y-4 sm:space-y-6">
              <div className="bg-surface-secondary rounded-lg p-3 sm:p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-text-primary">
                    Login Terakhir
                  </h4>
                  <p className="text-xs sm:text-sm text-text-tertiary">
                    {accountInfo.loginTerakhir}
                  </p>
                </div>
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>

              <div>
                <h3 className="font-semibold text-sm sm:text-base text-text-primary mb-3 sm:mb-4">
                  Ubah Password
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                      Password Saat Ini
                    </label>
                    <input
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) =>
                        handleSecurityChange("currentPassword", e.target.value)
                      }
                      className="w-full border border-border bg-surface text-text-primary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="Masukkan password saat ini"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) =>
                        handleSecurityChange("newPassword", e.target.value)
                      }
                      className="w-full border border-border bg-surface text-text-primary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="Minimal 8 karakter"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-1.5">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) =>
                        handleSecurityChange("confirmPassword", e.target.value)
                      }
                      className="w-full border border-border bg-surface text-text-primary rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="mt-4 w-full sm:w-auto bg-accent text-surface px-6 py-2.5 rounded-lg hover:opacity-90 transition-all text-sm font-medium"
                >
                  Ubah Password
                </button>
              </div>
            </div>
          )}

          {/* Tab: Aktivitas Terakhir */}
          {activeTab === "aktivitas_terakhir" && (
            <div>
              {/* Mobile view - Cards */}
              <div className="sm:hidden space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-surface-secondary rounded-lg p-3"
                  >
                    <p className="text-sm font-medium text-text-primary">
                      {activity.aksi}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-text-tertiary">
                        {activity.waktu}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {activity.ip}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop view - Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-secondary">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Aksi
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Waktu
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentActivities.map((activity) => (
                      <tr
                        key={activity.id}
                        className="hover:bg-surface-secondary transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-text-primary">
                          {activity.aksi}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {activity.waktu}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-tertiary font-mono">
                          {activity.ip}
                        </td>
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
