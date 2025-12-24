import { useState, useRef, useEffect } from "react";

export default function RiwayatPage() {
  const [filters, setFilters] = useState({
    tanggalMulai: "",
    tanggalAkhir: "",
    user: "",
    jenis: "",
    deskripsi: "",
  });

  const [expandedRow, setExpandedRow] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showFilterSection, setShowFilterSection] = useState(true);
  const filterDropdownRef = useRef(null);

  // Sample activity data
  const aktivitasData = [
    {
      id: 1,
      no: 1,
      tanggal: "15/01/2025 14:35:22",
      user: "dinas_aset01",
      jenis: "CREATE",
      deskripsi: "Menambahkan data aset baru dengan kode AST-156",
      ipAddress: "192.168.1.100",
      detail: {
        target: "Data Aset (id: AST-156)",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
        perubahan: 'Menambahkan aset "Tanah Jl. Sudirman" dengan luas 750 m²',
        timestamp: "2025-01-15 14:35:22.156 UTC",
      },
    },
    {
      id: 2,
      no: 2,
      tanggal: "15/01/2025 14:30:15",
      user: "bpn_user01",
      jenis: "VIEW",
      deskripsi: "Melihat detail aset AST-045",
      ipAddress: "192.168.1.105",
      detail: {
        target: "Data Aset (id: AST-045)",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0",
        perubahan: "Hanya melihat data, tidak ada perubahan",
        timestamp: "2025-01-15 14:30:15.234 UTC",
      },
    },
    {
      id: 3,
      no: 3,
      tanggal: "15/01/2025 14:25:40",
      user: "admin01",
      jenis: "UPDATE",
      deskripsi: "Melakukan backup database sistem",
      ipAddress: "192.168.1.10",
      detail: {
        target: "Database Sistem",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
        perubahan: "Backup otomatis harian berhasil dilakukan",
        timestamp: "2025-01-15 14:25:40.789 UTC",
      },
    },
    {
      id: 4,
      no: 4,
      tanggal: "15/01/2025 14:20:10",
      user: "tata_ruang01",
      jenis: "UPDATE",
      deskripsi: "Memperbarui status verifikasi aset AST-089",
      ipAddress: "192.168.1.112",
      detail: {
        target: "Data Aset (id: AST-089)",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0",
        perubahan: "Status verifikasi diubah dari 'Pending' menjadi 'Terverifikasi'",
        timestamp: "2025-01-15 14:20:10.456 UTC",
      },
    },
    {
      id: 5,
      no: 5,
      tanggal: "15/01/2025 14:15:33",
      user: "dinas_aset01",
      jenis: "DELETE",
      deskripsi: "Menghapus dokumen pendukung pada aset AST-023",
      ipAddress: "192.168.1.100",
      detail: {
        target: "Dokumen Aset (id: DOC-445)",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
        perubahan: "Dokumen 'Surat_Keterangan_Lama.pdf' dihapus dari sistem",
        timestamp: "2025-01-15 14:15:33.123 UTC",
      },
    },
    {
      id: 6,
      no: 6,
      tanggal: "15/01/2025 14:10:05",
      user: "admin01",
      jenis: "LOGIN",
      deskripsi: "Login ke sistem",
      ipAddress: "192.168.1.10",
      detail: {
        target: "Sistem Autentikasi",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
        perubahan: "User berhasil login ke sistem",
        timestamp: "2025-01-15 14:10:05.890 UTC",
      },
    },
  ];

  // Statistics
  const stats = {
    totalAktivitas: 1234,
    loginHariIni: 156,
    perubahanData: 89,
    userAktif: 45,
  };

  // User list for filter
  const userList = ["admin01", "dinas_aset01", "bpn_user01", "tata_ruang01", "masyarakat01"];

  // Activity types
  const jenisAktivitas = [
    { value: "", label: "Semua Jenis" },
    { value: "CREATE", label: "Create" },
    { value: "VIEW", label: "View" },
    { value: "UPDATE", label: "Update" },
    { value: "DELETE", label: "Delete" },
    { value: "LOGIN", label: "Login" },
    { value: "LOGOUT", label: "Logout" },
  ];

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFilters({
      tanggalMulai: "",
      tanggalAkhir: "",
      user: "",
      jenis: "",
      deskripsi: "",
    });
  };

  const handleApplyFilter = () => {
    console.log("Applying filters:", filters);
  };

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Count active filters
  const activeFilterCount = [filters.user, filters.jenis, filters.tanggalMulai, filters.tanggalAkhir].filter(Boolean).length;

  const getJenisStyle = (jenis) => {
    switch (jenis) {
      case "CREATE":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "VIEW":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "UPDATE":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "DELETE":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "LOGIN":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
      case "LOGOUT":
        return "bg-surface-tertiary text-text-secondary";
      default:
        return "bg-surface-tertiary text-text-secondary";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Riwayat Aktivitas</h1>
          <p className="text-text-tertiary text-sm mt-1">Monitor semua aktivitas pengguna dalam sistem</p>
        </div>
        <button
          onClick={() => alert('Refresh Data (Logic akan diimplementasikan nanti)')}
          className="flex items-center gap-2 bg-surface-tertiary text-text-secondary px-4 py-2.5 rounded-lg hover:bg-border transition-all text-sm font-medium"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.totalAktivitas.toLocaleString()}</div>
              <div className="text-sm text-text-tertiary">Total Aktivitas</div>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🔐</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.loginHariIni}</div>
              <div className="text-sm text-text-tertiary">Login Hari Ini</div>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📝</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.perubahanData}</div>
              <div className="text-sm text-text-tertiary">Perubahan Data</div>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{stats.userAktif}</div>
              <div className="text-sm text-text-tertiary">User Aktif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowFilterSection(!showFilterSection)}
          className="w-full px-6 py-4 border-b border-border-light flex items-center justify-between hover:bg-surface-secondary transition-colors"
        >
          <div className="flex items-center gap-2">
            <span>🔍</span>
            <h3 className="font-semibold text-text-primary">Filter & Pencarian</h3>
          </div>
          <svg
            className={`w-5 h-5 text-red-500 transition-transform duration-200 ${showFilterSection ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {showFilterSection && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Tanggal Mulai</label>
                <input
                  type="date"
                  value={filters.tanggalMulai}
                  onChange={(e) => handleFilterChange("tanggalMulai", e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-surface text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Tanggal Akhir</label>
                <input
                  type="date"
                  value={filters.tanggalAkhir}
                  onChange={(e) => handleFilterChange("tanggalAkhir", e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-surface text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">User</label>
                <select
                  value={filters.user}
                  onChange={(e) => handleFilterChange("user", e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-surface text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                >
                  <option value="">Semua User</option>
                  {userList.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Jenis</label>
                <select
                  value={filters.jenis}
                  onChange={(e) => handleFilterChange("jenis", e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-surface text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                >
                  {jenisAktivitas.map((j) => (
                    <option key={j.value} value={j.value}>{j.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleApplyFilter}
                  className="flex-1 bg-accent text-white dark:text-gray-900 px-4 py-2.5 rounded-lg hover:bg-accent-hover transition-all text-sm font-medium"
                >
                  Terapkan
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 border border-border rounded-lg hover:bg-surface-secondary text-text-secondary transition-all text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
          <h3 className="font-semibold text-text-primary">Log Aktivitas</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-tertiary">{aktivitasData.length} aktivitas</span>
            
            {/* Filter Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilterCount > 0 
                    ? "bg-accent text-white dark:text-gray-900" 
                    : "bg-surface-tertiary text-text-secondary hover:bg-border"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
                {activeFilterCount > 0 && (
                  <span className="bg-white dark:bg-gray-900 text-accent text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-surface rounded-xl border border-border shadow-xl z-50 overflow-hidden">
                  <div className="bg-surface-secondary px-4 py-3 border-b border-border-light flex items-center justify-between">
                    <span className="font-semibold text-sm text-text-primary">Filter Aktivitas</span>
                    <button
                      onClick={() => {
                        handleReset();
                        setShowFilterDropdown(false);
                      }}
                      className="text-xs text-text-muted hover:text-text-secondary"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* User Filter */}
                    <div>
                      <label className="block text-xs font-medium text-text-tertiary mb-1.5">User</label>
                      <select
                        value={filters.user}
                        onChange={(e) => handleFilterChange("user", e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      >
                        <option value="">Semua User</option>
                        {userList.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    {/* Jenis Filter */}
                    <div>
                      <label className="block text-xs font-medium text-text-tertiary mb-1.5">Jenis Aktivitas</label>
                      <select
                        value={filters.jenis}
                        onChange={(e) => handleFilterChange("jenis", e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                      >
                        {jenisAktivitas.map((j) => (
                          <option key={j.value} value={j.value}>{j.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-text-tertiary mb-1.5">Dari</label>
                        <input
                          type="date"
                          value={filters.tanggalMulai}
                          onChange={(e) => handleFilterChange("tanggalMulai", e.target.value)}
                          className="w-full border border-border rounded-lg px-2 py-2 text-sm bg-surface text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-tertiary mb-1.5">Sampai</label>
                        <input
                          type="date"
                          value={filters.tanggalAkhir}
                          onChange={(e) => handleFilterChange("tanggalAkhir", e.target.value)}
                          className="w-full border border-border rounded-lg px-2 py-2 text-sm bg-surface text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                        />
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => {
                        handleApplyFilter();
                        setShowFilterDropdown(false);
                      }}
                      className="w-full bg-accent text-white dark:text-gray-900 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-all"
                    >
                      Terapkan Filter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-secondary border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">No</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Waktu</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Jenis</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Deskripsi</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">IP Address</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {aktivitasData.map((item) => (
                <>
                  <tr key={item.id} className="hover:bg-surface-secondary transition-colors">
                    <td className="px-6 py-4 text-sm text-text-primary">{item.no}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{item.tanggal}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-primary">{item.user}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getJenisStyle(item.jenis)}`}>
                        {item.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate">{item.deskripsi}</td>
                    <td className="px-6 py-4 text-sm text-text-muted font-mono">{item.ipAddress}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRowExpand(item.id)}
                        className="text-text-muted hover:text-text-primary transition-colors text-sm"
                      >
                        {expandedRow === item.id ? "▲ Tutup" : "▼ Detail"}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === item.id && (
                    <tr key={`${item.id}-detail`} className="bg-surface-secondary">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-text-secondary">Target:</span>
                            <span className="ml-2 text-text-tertiary">{item.detail.target}</span>
                          </div>
                          <div>
                            <span className="font-medium text-text-secondary">Timestamp:</span>
                            <span className="ml-2 text-text-tertiary font-mono text-xs">{item.detail.timestamp}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium text-text-secondary">Perubahan:</span>
                            <span className="ml-2 text-text-tertiary">{item.detail.perubahan}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium text-text-secondary">User Agent:</span>
                            <span className="ml-2 text-text-muted text-xs font-mono">{item.detail.userAgent}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
          <div className="text-sm text-text-tertiary">
            Menampilkan 1-{aktivitasData.length} dari {stats.totalAktivitas.toLocaleString()} aktivitas
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-muted hover:bg-surface-secondary transition-colors disabled:opacity-50" disabled>
              ← Prev
            </button>
            <button className="px-3 py-1.5 bg-accent text-white dark:text-gray-900 rounded-lg text-sm font-medium">1</button>
            <button className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:bg-surface-secondary transition-colors">2</button>
            <button className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:bg-surface-secondary transition-colors">3</button>
            <button className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:bg-surface-secondary transition-colors">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
