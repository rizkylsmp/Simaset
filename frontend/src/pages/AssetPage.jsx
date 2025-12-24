import { useState } from "react";
import Header from "../components/dashboard/Header";
import Sidebar from "../components/dashboard/Sidebar";
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 space-y-6">
          {/* Page Title */}
          <div className="border-2 border-black bg-gray-800 text-white px-4 py-3">
            <h1 className="text-lg font-bold">MANAJEMEN DATA ASET</h1>
          </div>

          {/* Search & Filter Controls */}
          <AssetSearch
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onAddClick={handleOpenAddForm}
          />

          {/* Asset Table */}
          <AssetTable onEditClick={handleOpenEditForm} />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={10}
            onPageChange={handlePageChange}
          />
        </main>
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
