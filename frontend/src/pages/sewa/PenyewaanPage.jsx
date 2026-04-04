import { useState, useEffect, useCallback } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XIcon,
  FunnelIcon,
  ArrowCounterClockwiseIcon,
  ArrowsClockwiseIcon,
  HandshakeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  WarningIcon,
  XCircleIcon,
  ArrowUUpLeftIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { sewaService } from "../../services/api";
import { useConfirm } from "../../components/ui/ConfirmDialog";
import SewaTable from "../../components/sewa/SewaTable";
import SewaFormModal from "../../components/sewa/SewaFormModal";
import SewaViewModal from "../../components/sewa/SewaViewModal";
import PengembalianFormModal from "../../components/sewa/PengembalianFormModal";
import Pagination from "../../components/asset/Pagination";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "Aktif", label: "Aktif" },
  { value: "Akan Berakhir", label: "Akan Berakhir" },
  { value: "Berakhir", label: "Berakhir" },
  { value: "Dikembalikan", label: "Dikembalikan" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];

const STAT_CONFIG = [
  {
    key: "total",
    label: "Total Sewa",
    icon: ChartBarIcon,
    bg: "bg-surface-tertiary dark:bg-surface-tertiary",
    text: "text-text-primary",
    iconColor: "text-text-secondary",
  },
  {
    key: "aktif",
    label: "Aktif",
    icon: CheckCircleIcon,
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    key: "akanBerakhir",
    label: "Akan Berakhir",
    icon: WarningIcon,
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  {
    key: "berakhir",
    label: "Berakhir",
    icon: XCircleIcon,
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    iconColor: "text-red-500 dark:text-red-400",
  },
  {
    key: "dikembalikan",
    label: "Dikembalikan",
    icon: ArrowUUpLeftIcon,
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
];

export default function PenyewaanPage() {
  const confirm = useConfirm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [returnData, setReturnData] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sewaService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
      });
      setData(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalItems(res.data.pagination?.total || 0);
    } catch {
      toast.error("Gagal memuat data penyewaan");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await sewaService.getStats();
      setStats(res.data.data);
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

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSort = useCallback(
    (column) => {
      if (sortBy === column) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(column);
        setSortOrder("asc");
      }
    },
    [sortBy],
  );

  const handleCreate = async (formData) => {
    setFormLoading(true);
    try {
      await sewaService.create(formData);
      toast.success("Penyewaan berhasil ditambahkan");
      setShowForm(false);
      setEditData(null);
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menambahkan penyewaan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    setFormLoading(true);
    try {
      await sewaService.update(editData.id_sewa, formData);
      toast.success("Penyewaan berhasil diperbarui");
      setShowForm(false);
      setEditData(null);
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal memperbarui penyewaan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: "Hapus Data Penyewaan",
      message: `Data penyewaan "${item.nama_aset}" oleh "${item.nama_penyewa}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Hapus",
      cancelText: "Batal",
      type: "danger",
    });
    if (!confirmed) return;

    try {
      await sewaService.delete(item.id_sewa);
      toast.success("Data penyewaan berhasil dihapus");
      fetchData();
      fetchStats();
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  const handleEdit = (item) => {
    setEditData(item);
    setShowForm(true);
  };

  const handleView = (item) => {
    setViewData(item);
    setShowView(true);
  };

  const handleReturn = (item) => {
    setReturnData(item);
    setShowReturn(true);
  };

  const handleProcessReturn = async (formData) => {
    setReturnLoading(true);
    try {
      await sewaService.prosesPengembalian(returnData.id_sewa, formData);
      toast.success("Pengembalian berhasil diproses");
      setShowReturn(false);
      setReturnData(null);
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal memproses pengembalian");
    } finally {
      setReturnLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <HandshakeIcon size={24} weight="fill" className="text-surface" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-text-primary">
              Penyewaan Aset
            </h1>
            <p className="text-text-muted text-sm">
              Kelola data penyewaan aset daerah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchData();
              fetchStats();
            }}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-all text-sm font-medium disabled:opacity-50"
          >
            <ArrowsClockwiseIcon
              size={18}
              weight="bold"
              className={loading ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => {
              setEditData(null);
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-accent to-accent/90 text-surface px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-accent/30 transition-all text-sm font-medium"
          >
            <PlusIcon size={18} weight="bold" />
            Tambah Penyewaan
          </button>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {STAT_CONFIG.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className={`${s.bg} rounded-2xl border border-border p-4 flex items-center gap-3`}
              >
                <div className={`${s.iconColor}`}>
                  <Icon size={24} weight="duotone" />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${s.text}`}>
                    {stats[s.key]}
                  </div>
                  <div className="text-xs text-text-muted">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-surface rounded-2xl border border-border p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama aset, penyewa, nomor kontrak..."
              className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm bg-surface text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
              showFilters || statusFilter
                ? "bg-accent/10 border-accent/30 text-accent"
                : "border-border text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            <FunnelIcon size={16} />
            Filter
          </button>
          {(searchInput || statusFilter) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm text-text-secondary hover:bg-surface-secondary transition-colors"
            >
              <ArrowCounterClockwiseIcon size={16} />
              Reset
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-primary focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {/* Table Info Header */}
        <div className="px-4 lg:px-6 py-4 border-b border-border flex items-center justify-between bg-surface-secondary/50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-primary">
              Daftar Penyewaan
            </span>
            <span className="px-2.5 py-0.5 bg-accent/10 text-accent text-xs font-semibold rounded-full">
              {totalItems} data
            </span>
          </div>
          <div className="text-xs text-text-muted">
            Halaman {currentPage} dari {totalPages}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="overflow-hidden">
            <div className="bg-linear-to-r from-surface-secondary to-surface border-b border-border px-4 py-4">
              <div className="flex gap-4">
                {[40, 120, 120, 140, 100, 80, 100].map((w, i) => (
                  <div
                    key={i}
                    className="h-4 bg-surface-tertiary rounded animate-pulse"
                    style={{ width: w }}
                  />
                ))}
              </div>
            </div>
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  className="px-4 py-5 flex gap-4 items-center animate-pulse"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-8 h-4 bg-surface-tertiary rounded" />
                  <div className="w-32 h-5 bg-surface-tertiary rounded" />
                  <div className="w-28 h-4 bg-surface-tertiary rounded" />
                  <div className="w-36 h-4 bg-surface-tertiary rounded" />
                  <div className="w-24 h-4 bg-surface-tertiary rounded" />
                  <div className="w-20 h-6 bg-surface-tertiary rounded-full" />
                  <div className="w-24 h-8 bg-surface-tertiary rounded-lg ml-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <SewaTable
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onReturn={handleReturn}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Form Modal */}
      <SewaFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditData(null);
        }}
        onSubmit={editData ? handleUpdate : handleCreate}
        initialData={editData}
        isLoading={formLoading}
      />

      {/* View Modal */}
      <SewaViewModal
        isOpen={showView}
        onClose={() => {
          setShowView(false);
          setViewData(null);
        }}
        data={viewData}
      />

      {/* Pengembalian Modal */}
      <PengembalianFormModal
        isOpen={showReturn}
        onClose={() => {
          setShowReturn(false);
          setReturnData(null);
        }}
        onSubmit={handleProcessReturn}
        sewaData={returnData}
        isLoading={returnLoading}
      />
    </div>
  );
}
