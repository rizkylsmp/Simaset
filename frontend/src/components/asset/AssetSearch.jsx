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
    <div className="border-2 border-black bg-white p-4 mb-6">
      <div className="flex gap-4 items-center flex-wrap">
        {/* Add Button */}
        <button
          onClick={onAddClick}
          className="bg-black text-white border-2 border-black px-4 py-2 text-sm font-bold hover:bg-gray-900 transition"
        >
          [+] Tambah Aset Baru
        </button>

        {/* Search Input */}
        <div className="flex-1 min-w-64">
          <div className="flex items-center border-2 border-black">
            <span className="px-3 text-sm">🔍</span>
            <input
              type="text"
              placeholder="[Input] Cari aset..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="border-2 border-black px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
        >
          <option value="">[Filter] Status ▼</option>
          <option value="aktif">Aktif</option>
          <option value="berperkara">Berperkara</option>
          <option value="tidak-aktif">Tidak Aktif</option>
        </select>

        {/* Lokasi Filter */}
        <select
          value={lokasiFilter}
          onChange={handleLokasiChange}
          className="border-2 border-black px-4 py-2 text-sm font-medium hover:bg-gray-100 cursor-pointer"
        >
          <option value="">[Filter] Lokasi ▼</option>
          <option value="yogyakarta">Yogyakarta</option>
          <option value="jakarta">Jakarta</option>
          <option value="surabaya">Surabaya</option>
          <option value="medan">Medan</option>
        </select>

        {/* Export Button */}
        <button className="border-2 border-black px-4 py-2 text-sm font-bold hover:bg-gray-100 transition">
          [📤] Export
        </button>
      </div>
    </div>
  );
}
