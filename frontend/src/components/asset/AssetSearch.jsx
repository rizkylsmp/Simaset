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
        <div className="flex items-center border border-border rounded-lg bg-surface">
          <span className="px-3 text-text-tertiary">🔍</span>
          <input
            type="text"
            placeholder="Cari aset..."
            value={searchTerm}
            onChange={handleSearch}
            className="flex-1 px-3 py-2.5 text-sm outline-none rounded-r-lg bg-transparent text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={handleStatusChange}
        className="border border-border bg-surface text-text-secondary rounded-lg px-4 py-2.5 text-sm hover:border-text-tertiary cursor-pointer focus:ring-2 focus:ring-accent focus:border-accent transition-all"
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
        className="border border-border bg-surface text-text-secondary rounded-lg px-4 py-2.5 text-sm hover:border-text-tertiary cursor-pointer focus:ring-2 focus:ring-accent focus:border-accent transition-all"
      >
        <option value="">Lokasi</option>
        <option value="yogyakarta">Yogyakarta</option>
        <option value="jakarta">Jakarta</option>
        <option value="surabaya">Surabaya</option>
        <option value="medan">Medan</option>
      </select>

      {/* Export Button */}
      <button 
        onClick={() => alert('Export Data (Logic akan diimplementasikan nanti)')}
        className="border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:border-text-tertiary transition-all"
      >
        📤 Export
      </button>
    </div>
  );
}
