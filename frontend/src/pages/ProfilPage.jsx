import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/api";
import {
  UserCircleIcon,
  LockIcon,
  ClipboardTextIcon,
  CameraIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationBadgeIcon,
  BuildingsIcon,
  ShieldCheckIcon,
  SignInIcon,
  GlobeIcon,
  CalendarBlankIcon,
  FloppyDiskIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  InfoIcon,
  UserIcon,
  FingerprintIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";

export default function ProfilPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [activeTab, setActiveTab] = useState("informasi_pribadi");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile data from API
  const [profileData, setProfileData] = useState({
    username: "",
    role: "",
    namaLengkap: "",
    nip: "",
    email: "",
    noTelepon: "",
    jabatan: "",
    instansi: "",
    alamat: "",
  });

  const [stats, setStats] = useState({ totalLogin: 0, aktivitas: 0, hariAktif: 0 });
  const [lastLogin, setLastLogin] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [statusAkun, setStatusAkun] = useState("Aktif");
  const [recentActivities, setRecentActivities] = useState([]);

  // Security data
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fetch profile data from API
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authService.me();
      const { data, stats: s, lastLogin: ll, recentActivities: ra } = res.data;

      setProfileData({
        username: data.username || "",
        role: data.role || "",
        namaLengkap: data.nama_lengkap || "",
        nip: data.nip || "",
        email: data.email || "",
        noTelepon: data.no_telepon || "",
        jabatan: data.jabatan || "",
        instansi: data.instansi || "",
        alamat: data.alamat || "",
      });

      setStats(s || { totalLogin: 0, aktivitas: 0, hariAktif: 0 });
      setLastLogin(ll);
      setCreatedAt(data.created_at);
      setStatusAkun(data.status_aktif ? "Aktif" : "Nonaktif");
      setRecentActivities(
        (ra || []).map((a) => ({
          id: a.id,
          aksi: a.aksi,
          waktu: formatDate(a.waktu),
          ip: a.ip || "-",
        }))
      );
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Gagal memuat data profil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const tabs = [
    {
      id: "informasi_pribadi",
      label: "Informasi Pribadi",
      icon: <UserCircleIcon size={16} />,
    },
    { id: "keamanan", label: "Keamanan", icon: <LockIcon size={16} /> },
    {
      id: "aktivitas_terakhir",
      label: "Aktivitas Terakhir",
      icon: <ClipboardTextIcon size={16} />,
    },
  ];

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurityData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await authService.updateProfile({
        nama_lengkap: profileData.namaLengkap,
        email: profileData.email,
        no_telepon: profileData.noTelepon,
        nip: profileData.nip,
        jabatan: profileData.jabatan,
        instansi: profileData.instansi,
        alamat: profileData.alamat,
      });
      // Update auth store so sidebar/header reflect changes
      if (res.data?.data) {
        setUser({ ...user, ...res.data.data });
      }
      toast.success("Profil berhasil diperbarui!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!securityData.currentPassword) {
      toast.error("Masukkan password saat ini!");
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok!");
      return;
    }
    if (securityData.newPassword.length < 8) {
      toast.error("Password minimal 8 karakter!");
      return;
    }
    try {
      setChangingPassword(true);
      await authService.changePassword({
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword,
      });
      toast.success("Password berhasil diubah!");
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal mengubah password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleChangeFoto = () => {
    document.getElementById("foto-input").click();
  };

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.success(`Foto "${file.name}" berhasil diupload!`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[60vh]">
        <SpinnerGapIcon size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Profile Hero Card */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="relative bg-linear-to-br from-accent via-accent/90 to-accent/70 px-5 sm:px-8 pt-6 sm:pt-8 pb-16 sm:pb-20">
          {/* Abstract pattern overlay */}
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-surface rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-surface rounded-full translate-y-1/2 -translate-x-1/4" />
          </div>

          {/* Stats row - Desktop */}
          <div className="relative hidden sm:flex items-center justify-end gap-3">
            {[
              { value: stats.totalLogin, label: "Login" },
              { value: stats.aktivitas.toLocaleString(), label: "Aktivitas" },
              { value: stats.hariAktif, label: "Hari Aktif" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-surface/10 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center min-w-20 border border-surface/10"
              >
                <div className="text-lg font-bold text-surface">{s.value}</div>
                <div className="text-[10px] text-surface/60 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Info - overlapping banner */}
        <div className="relative px-5 sm:px-8 -mt-12 sm:-mt-14 pb-5">
          {/* Avatar row */}
          <div className="flex items-end justify-between">
            <div className="relative shrink-0 group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-surface-secondary rounded-2xl flex items-center justify-center border-4 border-surface shadow-xl ring-1 ring-border">
                <UserCircleIcon
                  size={56}
                  weight="duotone"
                  className="text-text-muted"
                />
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
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-accent text-surface rounded-xl shadow-lg flex items-center justify-center hover:scale-105 transition-transform ring-2 ring-surface"
              >
                <CameraIcon size={14} weight="bold" />
              </button>
            </div>

            {/* Account meta - Desktop only */}
            <div className="hidden lg:flex items-center gap-4 text-xs text-text-muted pb-1">
              <div className="flex items-center gap-1.5">
                <CalendarBlankIcon size={13} />
                <span>Bergabung {formatDateShort(createdAt)}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-text-muted" />
              <div className="flex items-center gap-1.5">
                <SignInIcon size={13} />
                <span>Login terakhir {lastLogin ? formatDate(lastLogin.waktu) : '-'}</span>
              </div>
            </div>
          </div>

          {/* Name & badges - below avatar, fully on white card */}
          <div className="mt-3 sm:mt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary truncate">
              {profileData.namaLengkap}
            </h2>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-lg">
                <ShieldCheckIcon size={13} weight="fill" />
                {profileData.role}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg">
                <CheckCircleIcon size={13} weight="fill" />
                {statusAkun}
              </span>
            </div>
          </div>

          {/* Mobile stats */}
          <div className="flex sm:hidden justify-center gap-2 mt-4">
            {[
              { value: stats.totalLogin, label: "Login" },
              { value: stats.aktivitas.toLocaleString(), label: "Aktivitas" },
              { value: stats.hariAktif, label: "Hari Aktif" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-surface-secondary rounded-xl px-3 py-2 text-center flex-1 border border-border"
              >
                <div className="text-base font-bold text-text-primary">
                  {s.value}
                </div>
                <div className="text-[10px] text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        {/* Tab bar */}
        <div className="border-b border-border bg-surface-secondary/30 px-2 sm:px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-t-lg ${
                  activeTab === tab.id
                    ? "text-accent bg-surface shadow-sm border border-border border-b-surface -mb-px z-10"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {/* Tab: Informasi Pribadi */}
          {activeTab === "informasi_pribadi" && (
            <div className="space-y-6">
              {/* Read-only section */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <InfoIcon size={15} weight="fill" className="text-text-muted" />
                  Informasi Akun
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 bg-surface-secondary/50 border border-border rounded-xl px-4 py-3">
                    <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <UserIcon
                        size={16}
                        weight="duotone"
                        className="text-accent"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                        Username
                      </p>
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {profileData.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-secondary/50 border border-border rounded-xl px-4 py-3">
                    <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <ShieldCheckIcon
                        size={16}
                        weight="duotone"
                        className="text-accent"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                        Role / Hak Akses
                      </p>
                      <p className="text-sm font-semibold text-text-primary truncate capitalize">
                        {profileData.role?.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable section */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <FingerprintIcon
                    size={15}
                    weight="fill"
                    className="text-text-muted"
                  />
                  Data Pribadi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Nama Lengkap",
                      field: "namaLengkap",
                      icon: UserCircleIcon,
                      type: "text",
                    },
                    {
                      label: "NIP",
                      field: "nip",
                      icon: IdentificationBadgeIcon,
                      type: "text",
                    },
                    {
                      label: "Email",
                      field: "email",
                      icon: EnvelopeIcon,
                      type: "email",
                    },
                    {
                      label: "No. Telepon",
                      field: "noTelepon",
                      icon: PhoneIcon,
                      type: "tel",
                    },
                    {
                      label: "Jabatan",
                      field: "jabatan",
                      icon: BuildingsIcon,
                      type: "text",
                    },
                    {
                      label: "Instansi",
                      field: "instansi",
                      icon: GlobeIcon,
                      type: "text",
                    },
                  ].map(({ label, field, icon: Icon, type }) => (
                    <div key={field} className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                        <Icon
                          size={13}
                          weight="duotone"
                          className="text-text-muted"
                        />
                        {label}
                      </label>
                      <input
                        type={type}
                        value={profileData[field]}
                        onChange={(e) =>
                          handleInputChange(field, e.target.value)
                        }
                        className="w-full border border-border bg-surface text-text-primary rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <MapPinIcon
                        size={13}
                        weight="duotone"
                        className="text-text-muted"
                      />
                      Alamat
                    </label>
                    <textarea
                      value={profileData.alamat}
                      onChange={(e) =>
                        handleInputChange("alamat", e.target.value)
                      }
                      rows={3}
                      className="w-full border border-border bg-surface text-text-primary rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none placeholder:text-text-muted"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 bg-accent text-surface px-6 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm font-bold shadow-lg shadow-accent/20 disabled:opacity-50"
                >
                  <FloppyDiskIcon size={16} weight="bold" />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          )}

          {/* Tab: Keamanan */}
          {activeTab === "keamanan" && (
            <div className="max-w-xl space-y-5">
              {/* Last login info card */}
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <SignInIcon
                    size={18}
                    weight="duotone"
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">
                    Login Terakhir
                  </h4>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                    {lastLogin ? formatDate(lastLogin.waktu) : '-'}
                  </p>
                </div>
                <CheckCircleIcon
                  size={22}
                  weight="fill"
                  className="text-emerald-500 shrink-0"
                />
              </div>

              {/* Change password section */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-surface-secondary/50 px-5 py-3.5 border-b border-border flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                    <LockIcon
                      size={15}
                      weight="duotone"
                      className="text-accent"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text-primary">
                      Ubah Password
                    </h3>
                    <p className="text-[10px] text-text-muted">
                      Gunakan password yang kuat dan unik
                    </p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    {
                      label: "Password Saat Ini",
                      field: "currentPassword",
                      placeholder: "Masukkan password saat ini",
                    },
                    {
                      label: "Password Baru",
                      field: "newPassword",
                      placeholder: "Minimal 8 karakter",
                    },
                    {
                      label: "Konfirmasi Password",
                      field: "confirmPassword",
                      placeholder: "Ulangi password baru",
                    },
                  ].map(({ label, field, placeholder }) => (
                    <div key={field} className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary">
                        {label}
                      </label>
                      <input
                        type="password"
                        value={securityData[field]}
                        onChange={(e) =>
                          handleSecurityChange(field, e.target.value)
                        }
                        className="w-full border border-border bg-surface text-text-primary rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-text-muted"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="flex items-center gap-2 bg-accent text-surface px-5 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm font-bold shadow-lg shadow-accent/20 mt-1 disabled:opacity-50"
                  >
                    <LockIcon size={14} weight="bold" />
                    {changingPassword ? 'Mengubah...' : 'Ubah Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Aktivitas Terakhir */}
          {activeTab === "aktivitas_terakhir" && (
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <ClipboardTextIcon size={40} weight="duotone" className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Belum ada aktivitas tercatat</p>
                </div>
              ) : (
              <>
              {/* Mobile view - Cards */}
              <div className="sm:hidden space-y-2.5">
                {recentActivities.map((activity, idx) => (
                  <div
                    key={activity.id}
                    className="bg-surface-secondary/50 border border-border rounded-xl p-3.5 flex items-start gap-3"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <ClipboardTextIcon
                        size={14}
                        weight="duotone"
                        className="text-accent"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">
                        {activity.aksi}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-text-muted">
                          {activity.waktu}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-[10px] text-text-muted font-mono">
                          {activity.ip}
                        </span>
                      </div>
                    </div>
                    <ArrowRightIcon
                      size={14}
                      className="text-text-muted shrink-0 mt-1"
                    />
                  </div>
                ))}
              </div>

              {/* Desktop view - Table */}
              <div className="hidden sm:block border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-secondary/50">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                        No
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                        Aksi
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                        Waktu
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentActivities.map((activity, idx) => (
                      <tr
                        key={activity.id}
                        className="hover:bg-surface-secondary/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-xs text-text-muted font-medium">
                          {idx + 1}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-medium text-text-primary">
                            {activity.aksi}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-text-secondary">
                          {activity.waktu}
                        </td>
                        <td className="px-5 py-3.5">
                          <code className="text-xs text-text-muted bg-surface-secondary px-2 py-1 rounded-md font-mono">
                            {activity.ip}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
