import { useState } from "react";

export default function AssetSearch({ onSearch, onFilterChange, onAddClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [lokasiFilter, setLokasiFilter] = useState("");

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    onFilterChange({ status, lokasi: lokasiFilter });
  };

  const handleLokasiChange = (e) => {
    const lokasi = e.target.value;
    setLokasiFilter(lokasi);
    onFilterChange({ status: statusFilter, lokasi });
  };

  return (
    <div className="flex gap-4 items-center flex-wrap">
      {/* Search Input */}
      <div className="flex-1 min-w-64">
        <div className="flex items-center border border-gray-300 rounded-lg bg-white">
          <span className="px-3 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Cari aset..."
            value={searchTerm}
            onChange={handleSearch}
            className="flex-1 px-3 py-2.5 text-sm outline-none rounded-r-lg"
          />
        </div>
      </div>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={handleStatusChange}
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:border-gray-400 cursor-pointer focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
      >
        <option value="">Status</option>
        <option value="aktif">Aktif</option>
        <option value="berperkara">Berperkara</option>
        <option value="tidak-aktif">Tidak Aktif</option>
      </select>

      {/* Lokasi Filter */}
      <select
        value={lokasiFilter}
        onChange={handleLokasiChange}
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:border-gray-400 cursor-pointer focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
      >
        <option value="">Lokasi</option>
        <option value="yogyakarta">Yogyakarta</option>
        <option value="jakarta">Jakarta</option>
        <option value="surabaya">Surabaya</option>
        <option value="medan">Medan</option>
      </select>

      {/* Export Button */}
      <button className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all">
        📤 Export
      </button>
    </div>
  );
}
