import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import AssetSearch from "../../components/asset/AssetSearch";
import Pagination from "../../components/asset/Pagination";
import AssetFormModal from "../../components/asset/AssetFormModal";
import AssetViewModal from "../../components/asset/AssetViewModal";
import ActionButtons from "../../components/asset/ActionButtons";
import { asetService } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { hasPermission } from "../../utils/permissions";
import { useConfirm } from "../../components/ui/ConfirmDialog";
import useColumnResize from "../../hooks/useColumnResize";
import {
  DatabaseIcon,
  PlusIcon,
  ArrowsClockwiseIcon,
  FolderIcon,
  CheckCircleIcon,
  WarningIcon,
  LightningIcon,
  MinusCircleIcon,
  PackageIcon,
  CaretUpIcon,
  CaretDownIcon,
  CaretUpDownIcon,
  CalendarIcon,
  BuildingsIcon,
} from "@phosphor-icons/react";

// Status badge config
const getStatusConfig = (status) => {
  const statusLower = status?.toLowerCase();
  const configs = {
    aktif: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-500/30",
      icon: CheckCircleIcon,
      dot: "bg-emerald-500",
    },
    berperkara: {
      bg: "bg-red-50 dark:bg-red-500/10",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-500/30",
      icon: WarningIcon,
      dot: "bg-red-500",
    },
    "indikasi berperkara": {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-500/30",
      icon: LightningIcon,
      dot: "bg-amber-500",
    },
    "tidak aktif": {
      bg: "bg-gray-50 dark:bg-gray-500/10",
      text: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-500/30",
      icon: MinusCircleIcon,
      dot: "bg-gray-500",
    },
  };
  return (
    configs[statusLower] || {
      bg: "bg-gray-50 dark:bg-gray-500/10",
      text: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-500/30",
      icon: MinusCircleIcon,
      dot: "bg-gray-500",
    }
  );
};

const SortIcon = ({ column, sortBy, sortOrder }) => {
  if (sortBy !== column)
    return (
      <CaretUpDownIcon
        size={14}
        className="text-text-muted ml-1 inline opacity-50"
      />
    );
  return sortOrder === "asc" ? (
    <CaretUpIcon size={14} weight="bold" className="text-accent ml-1 inline" />
  ) : (
    <CaretDownIcon size={14} weight="bold" className="text-accent ml-1 inline" />
  );
};

export default function AssetPage() {
  // Auth & Permissions
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || "bpn";
  const canCreate = hasPermission(userRole, "aset", "create");
  const canUpdate = hasPermission(userRole, "aset", "update");
  const canDelete = hasPermission(userRole, "aset", "delete");
  const confirm = useConfirm();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingAsset, setViewingAsset] = useState(null);

  // Sort state
  const [sortBy, setSortBy] = useState("kode_aset");
  const [sortOrder, setSortOrder] = useState("asc");
  const [hoveredRow, setHoveredRow] = useState(null);
  const { columnWidths, onResizeStart } = useColumnResize();

  // Fetch assets from API
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.status && { status: filters.status }),
      };
      const response = await asetService.getAll(params);
      const { data, pagination } = response.data;
      setAssets(data || []);
      setTotalPages(pagination?.totalPages || 1);
      setTotalItems(pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Gagal memuat data aset");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filters]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleOpenAddForm = () => {
    setEditingAsset(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = async (assetId) => {
    try {
      const response = await asetService.getById(assetId);
      setEditingAsset(response.data.data);
      setIsFormModalOpen(true);
    } catch (error) {
      console.error("Error fetching asset:", error);
      toast.error("Gagal memuat data aset");
    }
  };

  const handleViewAsset = async (assetId) => {
    try {
      const response = await asetService.getById(assetId);
      setViewingAsset(response.data.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching asset:", error);
      toast.error("Gagal memuat data aset");
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingAsset(null);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingAsset(null);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingAsset?.id_aset) {
        await asetService.update(editingAsset.id_aset, formData);
        toast.success("Aset berhasil diperbarui");
      } else {
        await asetService.create(formData);
        toast.success("Aset berhasil ditambahkan");
      }
      handleCloseForm();
      fetchAssets();
    } catch (error) {
      console.error("Error saving asset:", error);
      const errorMsg = error.response?.data?.error || "Gagal menyimpan aset";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    const confirmed = await confirm({
      title: "Hapus Aset",
      message:
        "Apakah Anda yakin ingin menghapus aset ini? Data yang dihapus tidak dapat dikembalikan.",
      confirmText: "Hapus",
      cancelText: "Batal",
      type: "danger",
    });
    if (!confirmed) return;

    try {
      await asetService.delete(assetId);
      toast.success("Aset berhasil dihapus");
      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
      const errorMsg = error.response?.data?.error || "Gagal menghapus aset";
      toast.error(errorMsg);
    }
  };

  // Sorted data
  const sortedAssets = [...assets].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (sortBy === "luas" || sortBy === "nilai_aset") {
      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
    }
    if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  // Table Header component
  const TableHeader = ({ children, sortable, column, className = "", colKey }) => {
    const key = colKey || column || children?.toString();
    return (
      <th
        className={`relative px-4 py-4 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider ${
          sortable
            ? "cursor-pointer select-none hover:text-text-secondary transition-colors"
            : ""
        } ${className}`}
        style={columnWidths[key] ? { width: columnWidths[key] } : undefined}
        onClick={sortable ? () => handleSort(column) : undefined}
      >
        <span className="flex items-center gap-1">
          {children}
          {sortable && (
            <SortIcon column={column} sortBy={sortBy} sortOrder={sortOrder} />
          )}
        </span>
        <div
          onMouseDown={onResizeStart(key)}
          className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-accent/20 transition-colors z-10"
        />
      </th>
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <DatabaseIcon size={24} weight="fill" className="text-surface" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-text-primary">
              Pusat Data Aset
            </h1>
            <p className="text-text-muted text-sm">
              Daftarkan dan kelola identitas dasar semua aset tanah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAssets}
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

          {canCreate && (
            <button
              onClick={handleOpenAddForm}
              className="flex items-center justify-center gap-2 bg-linear-to-r from-accent to-accent/90 text-surface px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-accent/30 transition-all text-sm font-medium"
            >
              <PlusIcon size={18} weight="bold" />
              Daftarkan Aset Baru
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <FolderIcon
              size={22}
              weight="fill"
              className="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{totalItems}</p>
            <p className="text-xs text-text-muted">Total Aset</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <CheckCircleIcon
              size={22}
              weight="fill"
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">
              {assets.filter((a) => a.status?.toLowerCase() === "aktif").length}
            </p>
            <p className="text-xs text-text-muted">Aktif</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <WarningIcon
              size={22}
              weight="fill"
              className="text-red-600 dark:text-red-400"
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">
              {
                assets.filter((a) => a.status?.toLowerCase() === "berperkara")
                  .length
              }
            </p>
            <p className="text-xs text-text-muted">Berperkara</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <LightningIcon
              size={22}
              weight="fill"
              className="text-amber-600 dark:text-amber-400"
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">
              {
                assets.filter(
                  (a) => a.status?.toLowerCase() === "indikasi berperkara",
                ).length
              }
            </p>
            <p className="text-xs text-text-muted">Indikasi</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-surface rounded-2xl border border-border p-4 lg:p-5">
        <AssetSearch
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Data Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {/* Table Info Header */}
        <div className="px-4 lg:px-6 py-4 border-b border-border flex items-center justify-between bg-surface-secondary/50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-primary">
              Daftar Aset Terdaftar
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
                {[40, 80, 120, 160, 80, 100, 80, 80].map((w, i) => (
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
                  <div className="w-24 h-5 bg-surface-tertiary rounded" />
                  <div className="w-32 h-4 bg-surface-tertiary rounded" />
                  <div className="w-40 h-4 bg-surface-tertiary rounded" />
                  <div className="w-20 h-6 bg-surface-tertiary rounded-full" />
                  <div className="w-20 h-4 bg-surface-tertiary rounded" />
                  <div className="w-16 h-4 bg-surface-tertiary rounded" />
                  <div className="w-24 h-8 bg-surface-tertiary rounded-lg ml-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-surface-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PackageIcon size={40} weight="duotone" className="text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Belum ada aset terdaftar
            </h3>
            <p className="text-text-muted text-sm max-w-sm mx-auto mb-5">
              Daftarkan aset baru terlebih dahulu, kemudian lengkapi data
              substansinya di masing-masing menu.
            </p>
            {canCreate && (
              <button
                onClick={handleOpenAddForm}
                className="inline-flex items-center gap-2 bg-linear-to-r from-accent to-accent/90 text-surface px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-accent/30 transition-all text-sm font-medium"
              >
                <PlusIcon size={18} weight="bold" />
                Daftarkan Aset Baru
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-225">
                <thead>
                  <tr className="bg-linear-to-r from-surface-secondary to-surface border-b border-border">
                    <TableHeader className="w-14">No</TableHeader>
                    <TableHeader sortable column="kode_aset">
                      Kode Aset
                    </TableHeader>
                    <TableHeader
                      sortable
                      column="nama_aset"
                      className="min-w-44"
                    >
                      Nama Aset
                    </TableHeader>
                    <TableHeader sortable column="jenis_aset">
                      Jenis
                    </TableHeader>
                    <TableHeader sortable column="status">
                      Status
                    </TableHeader>
                    <TableHeader
                      sortable
                      column="tahun_perolehan"
                      className="text-center"
                    >
                      Tahun
                    </TableHeader>
                    <TableHeader className="text-center w-28">Aksi</TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {sortedAssets.map((asset, idx) => {
                    const statusConfig = getStatusConfig(asset.status);
                    const StatusIcon = statusConfig.icon;
                    const isHovered = hoveredRow === asset.id_aset;

                    return (
                      <tr
                        key={asset.id_aset}
                        className={`group transition-all duration-200 ${
                          isHovered
                            ? "bg-accent/5 dark:bg-accent/10"
                            : "hover:bg-surface-secondary/50"
                        }`}
                        onMouseEnter={() => setHoveredRow(asset.id_aset)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="px-4 py-4">
                          <span className="text-sm text-text-muted font-medium">
                            {(currentPage - 1) * 10 + idx + 1}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-secondary rounded-lg text-sm font-mono font-semibold text-text-primary">
                            {asset.kode_aset}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${statusConfig.dot} shrink-0`}
                            />
                            <span className="text-sm font-medium text-text-primary wrap-break-word max-w-80">
                              {asset.nama_aset}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-text-secondary capitalize">
                            {asset.jenis_aset || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <StatusIcon size={14} weight="fill" />
                            {asset.status}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <CalendarIcon size={14} className="text-text-muted" />
                            <span className="text-sm text-text-secondary">
                              {asset.tahun_perolehan || "-"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div
                            className={`transition-all duration-200 ${
                              isHovered ? "opacity-100" : "opacity-70"
                            }`}
                          >
                            <ActionButtons
                              assetId={asset.id_aset}
                              asset={asset}
                              onEdit={
                                canUpdate
                                  ? (id) => handleOpenEditForm(id)
                                  : null
                              }
                              onView={() => handleViewAsset(asset.id_aset)}
                              onDelete={
                                canDelete ? (id) => handleDeleteAsset(id) : null
                              }
                              showEdit={canUpdate}
                              showDelete={canDelete}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-border">
              {sortedAssets.map((asset) => {
                const statusConfig = getStatusConfig(asset.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div key={asset.id_aset} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-semibold text-text-muted bg-surface-secondary px-2 py-0.5 rounded">
                            {asset.kode_aset}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <StatusIcon size={10} weight="fill" />
                            {asset.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-text-primary line-clamp-1">
                          {asset.nama_aset}
                        </p>
                      </div>
                      <ActionButtons
                        assetId={asset.id_aset}
                        asset={asset}
                        onEdit={
                          canUpdate ? (id) => handleOpenEditForm(id) : null
                        }
                        onView={() => handleViewAsset(asset.id_aset)}
                        onDelete={
                          canDelete ? (id) => handleDeleteAsset(id) : null
                        }
                        showEdit={canUpdate}
                        showDelete={canDelete}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">
                          Jenis
                        </p>
                        <p className="text-xs text-text-secondary capitalize">
                          {asset.jenis_aset || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">
                          Tahun
                        </p>
                        <p className="text-xs text-text-secondary">
                          {asset.tahun_perolehan || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={10}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Form Modal */}
      <AssetFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        assetData={editingAsset}
        isSubmitting={isSubmitting}
      />

      {/* View Modal */}
      <AssetViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        asset={viewingAsset}
        onEdit={canUpdate ? handleOpenEditForm : null}
        canEdit={canUpdate}
      />
    </div>
  );
}
