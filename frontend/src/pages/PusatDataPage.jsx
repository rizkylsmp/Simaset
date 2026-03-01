import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { pusatDataService } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../utils/permissions";
import { useConfirm } from "../components/ui/ConfirmDialog";
import {
  DatabaseIcon,
  PlusIcon,
  ArrowsClockwiseIcon,
  PencilSimpleIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XIcon,
  CaretUpIcon,
  CaretDownIcon,
  CaretUpDownIcon,
  BuildingsIcon,
  MapPinIcon,
  CurrencyCircleDollarIcon,
  HashIcon,
  CalendarIcon,
  UserIcon,
  FileTextIcon,
  WarningIcon,
  FloppyDiskIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

export default function PusatDataPage() {
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role?.toLowerCase() || "bpn";
  const canCreate = hasPermission(userRole, "pusatData", "create");
  const canUpdate = hasPermission(userRole, "pusatData", "update");
  const canDelete = hasPermission(userRole, "pusatData", "delete");
  const confirm = useConfirm();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, totalNilai: 0, totalLuas: 0 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const limit = 20;

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [formData, setFormData] = useState({
    kode_barang: "",
    nama_barang: "",
    nibar: "",
    luas: "",
    alamat: "",
    nilai_perolehan: "",
    no_sertifikat: "",
    tanggal: "",
    opd: "",
    pemegang: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pusatDataService.getAll({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });
      setData(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await pusatDataService.getStats();
      setStats(res.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(col);
      setSortOrder("ASC");
    }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col)
      return <CaretUpDownIcon size={14} className="opacity-40" />;
    return sortOrder === "ASC" ? (
      <CaretUpIcon size={14} className="text-accent" />
    ) : (
      <CaretDownIcon size={14} className="text-accent" />
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const resetForm = () => {
    setFormData({
      kode_barang: "",
      nama_barang: "",
      nibar: "",
      luas: "",
      alamat: "",
      nilai_perolehan: "",
      no_sertifikat: "",
      tanggal: "",
      opd: "",
      pemegang: "",
    });
    setEditingItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      kode_barang: item.kode_barang || "",
      nama_barang: item.nama_barang || "",
      nibar: item.nibar || "",
      luas: item.luas || "",
      alamat: item.alamat || "",
      nilai_perolehan: item.nilai_perolehan || "",
      no_sertifikat: item.no_sertifikat || "",
      tanggal: item.tanggal || "",
      opd: item.opd || "",
      pemegang: item.pemegang || "",
    });
    setShowForm(true);
  };

  const handleOpenView = (item) => {
    setViewingItem(item);
    setShowView(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await pusatDataService.update(editingItem.id_pusat_data, formData);
        toast.success("Data berhasil diperbarui");
      } else {
        await pusatDataService.create(formData);
        toast.success("Data berhasil ditambahkan");
      }
      setShowForm(false);
      resetForm();
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Hapus Data",
      message: `Apakah Anda yakin ingin menghapus "${item.nama_barang}"?`,
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      await pusatDataService.delete(item.id_pusat_data);
      toast.success("Data berhasil dihapus");
      fetchData();
      fetchStats();
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  const formatCurrency = (val) => {
    if (!val) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val) => {
    if (!val) return "-";
    return new Intl.NumberFormat("id-ID").format(val);
  };

  const columns = [
    { key: "kode_barang", label: "Kode Barang", width: "130px" },
    { key: "nama_barang", label: "Nama Barang", width: "200px" },
    { key: "nibar", label: "NIBAR", width: "120px" },
    { key: "luas", label: "Luas (m²)", width: "110px" },
    { key: "alamat", label: "Alamat", width: "200px" },
    { key: "nilai_perolehan", label: "Nilai Perolehan", width: "160px" },
    { key: "no_sertifikat", label: "No. Sertifikat", width: "140px" },
    { key: "tanggal", label: "Tanggal", width: "120px" },
    { key: "opd", label: "OPD", width: "180px" },
    { key: "pemegang", label: "Pemegang", width: "160px" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <DatabaseIcon size={24} weight="fill" className="text-surface" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-text-primary">
              Pusat Data
            </h1>
            <p className="text-sm text-text-secondary">
              Data aset BPKAD Kota Pasuruan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchData();
              fetchStats();
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary bg-surface border border-border rounded-lg hover:bg-surface-secondary transition-all"
          >
            <ArrowsClockwiseIcon size={16} weight="bold" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface bg-accent hover:bg-accent-hover rounded-lg shadow-lg shadow-accent/20 transition-all"
            >
              <PlusIcon size={16} weight="bold" />
              Tambah Data
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <DatabaseIcon
                size={20}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {formatNumber(stats.total)}
              </div>
              <div className="text-xs text-text-tertiary">Total Data</div>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CurrencyCircleDollarIcon
                size={20}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <div className="text-lg font-bold text-text-primary truncate">
                {formatCurrency(stats.totalNilai)}
              </div>
              <div className="text-xs text-text-tertiary">
                Total Nilai Perolehan
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <MapPinIcon
                size={20}
                className="text-amber-600 dark:text-amber-400"
              />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {formatNumber(stats.totalLuas)}
              </div>
              <div className="text-xs text-text-tertiary">Total Luas (m²)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Cari kode barang, nama, NIBAR, alamat, OPD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-surface-secondary border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-accent text-surface rounded-lg hover:bg-accent-hover text-sm font-medium transition-all"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider w-12">
                  No
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors"
                    style={{ minWidth: col.width }}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <SortIcon col={col.key} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider w-28">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-text-muted">
                        Memuat data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-surface-secondary rounded-2xl flex items-center justify-center">
                        <DatabaseIcon
                          size={32}
                          weight="duotone"
                          className="text-text-muted"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          Belum ada data
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          {search
                            ? "Tidak ditemukan data yang sesuai"
                            : "Tambahkan data pertama Anda"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr
                    key={item.id_pusat_data}
                    className="hover:bg-surface-secondary/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-text-muted text-xs">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-primary">
                      {item.kode_barang}
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {item.nama_barang}
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                      {item.nibar || "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-right">
                      {item.luas ? formatNumber(item.luas) : "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs max-w-50 truncate">
                      {item.alamat || "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-right font-mono text-xs">
                      {formatCurrency(item.nilai_perolehan)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {item.no_sertifikat || "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {item.tanggal
                        ? new Date(item.tanggal).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs max-w-45 truncate">
                      {item.opd || "-"}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {item.pemegang || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenView(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all"
                          title="Lihat Detail"
                        >
                          <EyeIcon size={14} weight="bold" />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-all"
                            title="Edit"
                          >
                            <PencilSimpleIcon size={14} weight="bold" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
                            title="Hapus"
                          >
                            <TrashIcon size={14} weight="bold" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-surface-secondary/30">
            <p className="text-xs text-text-muted">
              Menampilkan {(page - 1) * limit + 1}-
              {Math.min(page * limit, total)} dari {total} data
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <CaretLeftIcon size={14} weight="bold" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                      page === pageNum
                        ? "bg-accent text-surface shadow-md"
                        : "text-text-muted hover:bg-surface-secondary"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <CaretRightIcon size={14} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== CREATE/EDIT MODAL ==================== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
          />
          <div className="relative bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-surface-secondary/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <DatabaseIcon
                    size={20}
                    weight="duotone"
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-text-primary">
                    {editingItem ? "Edit Data" : "Tambah Data Baru"}
                  </h2>
                  <p className="text-xs text-text-muted">
                    {editingItem
                      ? "Perbarui informasi data aset"
                      : "Masukkan informasi data aset baru"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-all"
              >
                <XIcon size={16} weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Kode Barang */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <HashIcon size={12} weight="bold" />
                      Kode Barang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.kode_barang}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kode_barang: e.target.value,
                        })
                      }
                      required
                      placeholder="Masukkan kode barang"
                      className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all"
                    />
                  </div>

                  {/* Nama Barang */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <FileTextIcon size={12} weight="bold" />
                      Nama Barang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nama_barang}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nama_barang: e.target.value,
                        })
                      }
                      required
                      placeholder="Masukkan nama barang"
                      className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all"
                    />
                  </div>

                  {/* NIBAR */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <HashIcon size={12} weight="bold" />
                      NIBAR
                    </label>
                    <input
                      type="text"
                      value={formData.nibar}
                      onChange={(e) =>
                        setFormData({ ...formData, nibar: e.target.value })
                      }
                      placeholder="Nomor Identifikasi Barang"
                      className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all"
                    />
                  </div>

                  {/* Luas */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <MapPinIcon size={12} weight="bold" />
                      Luas (m²)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.luas}
                      onChange={(e) =>
                        setFormData({ ...formData, luas: e.target.value })
                      }
                      placeholder="Luas dalam meter persegi"
                      className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all"
                    />
                  </div>

                  {/* Nilai Perolehan */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <CurrencyCircleDollarIcon size={12} weight="bold" />
                      Nilai Perolehan (Rp)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.nilai_perolehan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nilai_perolehan: e.target.value,
                        })
                      }
                      placeholder="Nilai perolehan"
                      className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all"
                    />
                  </div>

                  {/* No Sertifikat */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <FileTextIcon size={12} weight="bold" />
                      No. Sertifikat
                    </label>
                    <input
                      type="text"
                      value={formData.no_sertifikat}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          no_sertifikat: e.target.value,
                        })
                      }
                      placeholder="Nomor sertifikat"
                      className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all"
                    />
                  </div>

                  {/* Tanggal */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <CalendarIcon size={12} weight="bold" />
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) =>
                        setFormData({ ...formData, tanggal: e.target.value })
                      }
                      className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all"
                    />
                  </div>

                  {/* OPD */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <BuildingsIcon size={12} weight="bold" />
                      OPD
                    </label>
                    <input
                      type="text"
                      value={formData.opd}
                      onChange={(e) =>
                        setFormData({ ...formData, opd: e.target.value })
                      }
                      placeholder="Organisasi Perangkat Daerah"
                      className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all"
                    />
                  </div>

                  {/* Pemegang */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <UserIcon size={12} weight="bold" />
                      Pemegang
                    </label>
                    <input
                      type="text"
                      value={formData.pemegang}
                      onChange={(e) =>
                        setFormData({ ...formData, pemegang: e.target.value })
                      }
                      placeholder="Nama pemegang aset"
                      className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all"
                    />
                  </div>

                  {/* Alamat - full width */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                      <MapPinIcon size={12} weight="bold" />
                      Alamat
                    </label>
                    <textarea
                      value={formData.alamat}
                      onChange={(e) =>
                        setFormData({ ...formData, alamat: e.target.value })
                      }
                      placeholder="Alamat lengkap"
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-text-primary placeholder:text-text-muted transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border bg-surface-secondary/30 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-secondary transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-surface bg-accent hover:bg-accent-hover rounded-lg shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FloppyDiskIcon size={16} weight="bold" />
                  )}
                  {editingItem ? "Simpan Perubahan" : "Tambah Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== VIEW MODAL ==================== */}
      {showView && viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowView(false)}
          />
          <div className="relative bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-surface-secondary/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <EyeIcon
                    size={20}
                    weight="duotone"
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-text-primary">Detail Data</h2>
                  <p className="text-xs text-text-muted">
                    {viewingItem.kode_barang}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowView(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-all"
              >
                <XIcon size={16} weight="bold" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {[
                  {
                    label: "Kode Barang",
                    value: viewingItem.kode_barang,
                    icon: HashIcon,
                  },
                  {
                    label: "Nama Barang",
                    value: viewingItem.nama_barang,
                    icon: FileTextIcon,
                  },
                  { label: "NIBAR", value: viewingItem.nibar, icon: HashIcon },
                  {
                    label: "Luas (m²)",
                    value: viewingItem.luas
                      ? formatNumber(viewingItem.luas)
                      : null,
                    icon: MapPinIcon,
                  },
                  {
                    label: "Alamat",
                    value: viewingItem.alamat,
                    icon: MapPinIcon,
                  },
                  {
                    label: "Nilai Perolehan",
                    value: formatCurrency(viewingItem.nilai_perolehan),
                    icon: CurrencyCircleDollarIcon,
                  },
                  {
                    label: "No. Sertifikat",
                    value: viewingItem.no_sertifikat,
                    icon: FileTextIcon,
                  },
                  {
                    label: "Tanggal",
                    value: viewingItem.tanggal
                      ? new Date(viewingItem.tanggal).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "long", year: "numeric" },
                        )
                      : null,
                    icon: CalendarIcon,
                  },
                  { label: "OPD", value: viewingItem.opd, icon: BuildingsIcon },
                  {
                    label: "Pemegang",
                    value: viewingItem.pemegang,
                    icon: UserIcon,
                  },
                ].map((field) => (
                  <div
                    key={field.label}
                    className="flex items-start gap-3 p-3 bg-surface-secondary/50 rounded-xl border border-border/50"
                  >
                    <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center shrink-0 border border-border">
                      <field.icon
                        size={14}
                        weight="bold"
                        className="text-text-muted"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                        {field.label}
                      </p>
                      <p className="text-sm text-text-primary mt-0.5 wrap-break-word">
                        {field.value || "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-surface-secondary/30 flex items-center justify-end gap-3 shrink-0">
              {canUpdate && (
                <button
                  onClick={() => {
                    setShowView(false);
                    handleOpenEdit(viewingItem);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                >
                  <PencilSimpleIcon size={14} weight="bold" />
                  Edit
                </button>
              )}
              <button
                onClick={() => setShowView(false)}
                className="px-4 py-2.5 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-secondary transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
