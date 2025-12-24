import { useState } from "react";
import AssetSearch from "../components/asset/AssetSearch";
import AssetTable from "../components/asset/AssetTable";
import Pagination from "../components/asset/Pagination";
import AssetFormModal from "../components/asset/AssetFormModal";

export default function AssetPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "", lokasi: "" });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenAddForm = () => {
    setEditingAsset(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (assetId) => {
    // TODO: Fetch asset data from API
    setEditingAsset({ id: assetId });
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingAsset(null);
  };

  const handleFormSubmit = (formData) => {
    console.log("Form submitted:", formData);
    alert("Form submitted! (Logic akan diimplementasikan nanti)");
    handleCloseForm();
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">Manajemen Data Aset</h1>
          <p className="text-text-tertiary text-sm mt-1">Kelola dan monitor semua aset tanah</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="flex items-center justify-center gap-2 bg-accent text-white dark:text-gray-900 px-4 py-2.5 rounded-lg hover:bg-accent-hover transition-all shadow-lg hover:shadow-xl text-sm font-medium w-full sm:w-auto"
        >
          <span>➕</span>
          Tambah Aset
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <AssetSearch
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onAddClick={handleOpenAddForm}
        />
      </div>

      {/* Asset Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <AssetTable onEditClick={handleOpenEditForm} />
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={10}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Asset Form Modal */}
      <AssetFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        assetData={editingAsset}
      />
    </div>
  );
}
