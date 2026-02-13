import { useState } from "react";
import {
  MagnifyingGlass,
  Funnel,
  CheckCircle,
  Warning,
  Lightning,
  MinusCircle,
  ChartPie,
  X,
  CaretDown,
  Buildings,
  CalendarBlank,
  MapPin,
} from "@phosphor-icons/react";

export default function MapFilter({
  selectedLayers,
  onLayerToggle,
  onSearch,
  onFilterChange,
  assets = [],
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [lokasiFilter, setLokasiFilter] = useState("");
  const [tahunFilter, setTahunFilter] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Status layers dengan icon
  const statusLayers = [
    {
      id: "aktif",
      label: "Aktif",
      color: "#10b981",
      bgColor: "bg-emerald-500",
      lightBg: "bg-emerald-50 dark:bg-emerald-900/20",
      icon: CheckCircle,
    },
    {
      id: "berperkara",
      label: "Berperkara",
      color: "#ef4444",
      bgColor: "bg-red-500",
      lightBg: "bg-red-50 dark:bg-red-900/20",
      icon: Warning,
    },
    {
      id: "indikasi_berperkara",
      label: "Indikasi",
      color: "#3b82f6",
      bgColor: "bg-blue-500",
      lightBg: "bg-blue-50 dark:bg-blue-900/20",
      icon: Lightning,
    },
    {
      id: "tidak_aktif",
      label: "Tidak Aktif",
      color: "#f59e0b",
      bgColor: "bg-amber-500",
      lightBg: "bg-amber-50 dark:bg-amber-900/20",
      icon: MinusCircle,
    },
  ];

  // Calculate statistics dynamically
  const stats = {
    total: assets.length,
    aktif: assets.filter(
      (a) => a.status?.toLowerCase().replace(/\s+/g, "_") === "aktif",
    ).length,
    berperkara: assets.filter(
      (a) => a.status?.toLowerCase().replace(/\s+/g, "_") === "berperkara",
    ).length,
    indikasi: assets.filter(
      (a) =>
        a.status?.toLowerCase().replace(/\s+/g, "_") === "indikasi_berperkara",
    ).length,
    tidak_aktif: assets.filter(
      (a) => a.status?.toLowerCase().replace(/\s+/g, "_") === "tidak_aktif",
    ).length,
  };

  const handleLayerToggle = (layerId) => {
    onLayerToggle(layerId);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  const handleFilterUpdate = (updates) => {
    const newFilters = {
      status: updates.status ?? statusFilter,
      lokasi: updates.lokasi ?? lokasiFilter,
      tahun: updates.tahun ?? tahunFilter,
      jenis: updates.jenis ?? jenisFilter,
    };
    if (updates.status !== undefined) setStatusFilter(updates.status);
    if (updates.lokasi !== undefined) setLokasiFilter(updates.lokasi);
    if (updates.tahun !== undefined) setTahunFilter(updates.tahun);
    if (updates.jenis !== undefined) setJenisFilter(updates.jenis);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setStatusFilter("");
    setLokasiFilter("");
    setTahunFilter("");
    setJenisFilter("");
    onFilterChange({ status: "", lokasi: "", tahun: "", jenis: "" });
  };

  const hasActiveFilters =
    statusFilter || lokasiFilter || tahunFilter || jenisFilter;

  return (
    <div className="p-4 space-y-5">
      {/* Search Box */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          Cari Aset
        </label>
        <div className="relative">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Nama atau kode aset..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-9 py-3 text-sm bg-surface border-2 border-border rounded-xl outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-text-primary placeholder:text-text-muted"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-2">
          <ChartPie size={14} />
          Tampilkan Layer
        </label>
        <div className="grid grid-cols-2 gap-2">
          {statusLayers.map((layer) => {
            const Icon = layer.icon;
            const isActive = selectedLayers[layer.id] !== false;
            return (
              <button
                key={layer.id}
                onClick={() => handleLayerToggle(layer.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  isActive
                    ? `${layer.lightBg} border-current`
                    : "bg-surface border-border opacity-50"
                }`}
                style={{ borderColor: isActive ? layer.color : undefined }}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${layer.bgColor}`}
                >
                  <Icon size={14} weight="fill" className="text-surface" />
                </div>
                <span
                  className={`text-xs font-medium ${isActive ? "text-text-primary" : "text-text-muted"}`}
                >
                  {layer.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="space-y-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between p-3 bg-surface border-2 border-border rounded-xl hover:border-text-tertiary transition-all"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <Funnel size={16} weight="bold" />
            Filter Lanjutan
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-accent text-surface text-xs font-bold rounded-full">
                Aktif
              </span>
            )}
          </span>
          <CaretDown
            size={16}
            weight="bold"
            className={`text-text-muted transition-transform ${showFilters ? "rotate-180" : ""}`}
          />
        </button>

        {showFilters && (
          <div className="space-y-3 p-4 bg-surface-secondary rounded-xl border border-border">
            {/* Status Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                <CheckCircle size={12} />
                Status Aset
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterUpdate({ status: e.target.value })}
                className="w-full border-2 border-border bg-surface text-text-primary rounded-lg px-3 py-2.5 text-sm cursor-pointer focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="berperkara">Berperkara</option>
                <option value="indikasi_berperkara">Indikasi Berperkara</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
            </div>

            {/* Lokasi Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                <MapPin size={12} />
                Wilayah
              </label>
              <select
                value={lokasiFilter}
                onChange={(e) => handleFilterUpdate({ lokasi: e.target.value })}
                className="w-full border-2 border-border bg-surface text-text-primary rounded-lg px-3 py-2.5 text-sm cursor-pointer focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              >
                <option value="">Semua Wilayah</option>
                <option value="pasuruan">Kota Pasuruan</option>
                <option value="surabaya">Surabaya</option>
                <option value="malang">Malang</option>
              </select>
            </div>

            {/* Tahun Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                <CalendarBlank size={12} />
                Tahun Perolehan
              </label>
              <select
                value={tahunFilter}
                onChange={(e) => handleFilterUpdate({ tahun: e.target.value })}
                className="w-full border-2 border-border bg-surface text-text-primary rounded-lg px-3 py-2.5 text-sm cursor-pointer focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              >
                <option value="">Semua Tahun</option>
                {[2020, 2021, 2022, 2023, 2024, 2025].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                <Buildings size={12} />
                Jenis Aset
              </label>
              <select
                value={jenisFilter}
                onChange={(e) => handleFilterUpdate({ jenis: e.target.value })}
                className="w-full border-2 border-border bg-surface text-text-primary rounded-lg px-3 py-2.5 text-sm cursor-pointer focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              >
                <option value="">Semua Jenis</option>
                <option value="tanah">Tanah</option>
                <option value="bangunan">Bangunan</option>
                <option value="kendaraan">Kendaraan</option>
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="w-full py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Statistics Card */}
      <div className="bg-linear-to-br from-accent/10 to-accent/5 rounded-xl p-4 border border-accent/20">
        <div className="flex items-center gap-2 mb-4">
          <ChartPie size={18} weight="fill" className="text-accent" />
          <h4 className="text-sm font-bold text-text-primary">
            Statistik Aset
          </h4>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between mb-4 p-3 bg-surface rounded-lg">
          <span className="text-sm text-text-secondary">Total Aset</span>
          <span className="text-2xl font-bold text-text-primary">
            {stats.total}
          </span>
        </div>

        {/* Status breakdown */}
        <div className="space-y-2">
          {[
            {
              label: "Aktif",
              count: stats.aktif,
              color: "emerald",
              bgColor: "bg-emerald-500",
            },
            {
              label: "Berperkara",
              count: stats.berperkara,
              color: "red",
              bgColor: "bg-red-500",
            },
            {
              label: "Indikasi",
              count: stats.indikasi,
              color: "blue",
              bgColor: "bg-blue-500",
            },
            {
              label: "Tidak Aktif",
              count: stats.tidak_aktif,
              color: "amber",
              bgColor: "bg-amber-500",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${item.bgColor}`} />
                <span className="text-text-secondary">{item.label}</span>
              </div>
              <span className="font-bold text-text-primary">{item.count}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-surface rounded-full overflow-hidden flex">
          {stats.total > 0 && (
            <>
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${(stats.aktif / stats.total) * 100}%` }}
              />
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${(stats.berperkara / stats.total) * 100}%` }}
              />
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${(stats.indikasi / stats.total) * 100}%` }}
              />
              <div
                className="bg-amber-500 transition-all"
                style={{
                  width: `${(stats.tidak_aktif / stats.total) * 100}%`,
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
