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
        return "bg-green-100 text-green-700";
      case "VIEW":
        return "bg-blue-100 text-blue-700";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-700";
      case "DELETE":
        return "bg-red-100 text-red-700";
      case "LOGIN":
        return "bg-purple-100 text-purple-700";
      case "LOGOUT":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Aktivitas</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor semua aktivitas pengguna dalam sistem</p>
        </div>
        <button
          onClick={handleApplyFilter}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalAktivitas.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Aktivitas</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🔐</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.loginHariIni}</div>
              <div className="text-sm text-gray-500">Login Hari Ini</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📝</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.perubahanData}</div>
              <div className="text-sm text-gray-500">Perubahan Data</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.userAktif}</div>
              <div className="text-sm text-gray-500">User Aktif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <span>🔍</span>
          <h3 className="font-semibold text-gray-900">Filter & Pencarian</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Mulai</label>
              <input
                type="date"
                value={filters.tanggalMulai}
                onChange={(e) => handleFilterChange("tanggalMulai", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Akhir</label>
              <input
                type="date"
                value={filters.tanggalAkhir}
                onChange={(e) => handleFilterChange("tanggalAkhir", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">User</label>
              <select
                value={filters.user}
                onChange={(e) => handleFilterChange("user", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
              >
                <option value="">Semua User</option>
                {userList.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis</label>
              <select
                value={filters.jenis}
                onChange={(e) => handleFilterChange("jenis", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
              >
                {jenisAktivitas.map((j) => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleApplyFilter}
                className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-all text-sm font-medium"
              >
                Terapkan
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Log Aktivitas</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{aktivitasData.length} aktivitas</span>
            
            {/* Filter Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilterCount > 0 
                    ? "bg-gray-900 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
                {activeFilterCount > 0 && (
                  <span className="bg-white text-gray-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">Filter Aktivitas</span>
                    <button
                      onClick={() => {
                        handleReset();
                        setShowFilterDropdown(false);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* User Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">User</label>
                      <select
                        value={filters.user}
                        onChange={(e) => handleFilterChange("user", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                      >
                        <option value="">Semua User</option>
                        {userList.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    {/* Jenis Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Jenis Aktivitas</label>
                      <select
                        value={filters.jenis}
                        onChange={(e) => handleFilterChange("jenis", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                      >
                        {jenisAktivitas.map((j) => (
                          <option key={j.value} value={j.value}>{j.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Dari</label>
                        <input
                          type="date"
                          value={filters.tanggalMulai}
                          onChange={(e) => handleFilterChange("tanggalMulai", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Sampai</label>
                        <input
                          type="date"
                          value={filters.tanggalAkhir}
                          onChange={(e) => handleFilterChange("tanggalAkhir", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                        />
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => {
                        handleApplyFilter();
                        setShowFilterDropdown(false);
                      }}
                      className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all"
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
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Waktu</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Jenis</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Deskripsi</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">IP Address</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {aktivitasData.map((item) => (
                <>
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{item.no}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.tanggal}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{item.user}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getJenisStyle(item.jenis)}`}>
                        {item.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{item.deskripsi}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.ipAddress}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRowExpand(item.id)}
                        className="text-gray-500 hover:text-gray-900 transition-colors text-sm"
                      >
                        {expandedRow === item.id ? "▲ Tutup" : "▼ Detail"}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === item.id && (
                    <tr key={`${item.id}-detail`} className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Target:</span>
                            <span className="ml-2 text-gray-600">{item.detail.target}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Timestamp:</span>
                            <span className="ml-2 text-gray-600 font-mono text-xs">{item.detail.timestamp}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium text-gray-700">Perubahan:</span>
                            <span className="ml-2 text-gray-600">{item.detail.perubahan}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium text-gray-700">User Agent:</span>
                            <span className="ml-2 text-gray-500 text-xs font-mono">{item.detail.userAgent}</span>
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
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Menampilkan 1-{aktivitasData.length} dari {stats.totalAktivitas.toLocaleString()} aktivitas
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
              ← Prev
            </button>
            <button className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium">1</button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">2</button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">3</button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
