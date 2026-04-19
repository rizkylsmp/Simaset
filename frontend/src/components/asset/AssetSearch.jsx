import { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  XIcon,
  FunnelIcon,
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  WarningIcon,
  LightningIcon,
  MinusCircleIcon,
  MapPinIcon,
  CaretDownIcon,
  NavigationArrowIcon,
  IdentificationCardIcon,
  HandshakeIcon,
  CertificateIcon,
} from "@phosphor-icons/react";

const JENIS_HAK_OPTIONS = [
  "HAK PAKAI",
  "HAK MILIK",
  "HAK GUNA BANGUNAN",
  "HAK PENGELOLAAN",
];

export default function AssetSearch({
  onSearch,
  onFilterChange,
  isBPKAMode = false,
  filterOptions = { kecamatan: [], kelurahan: [] },
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kecamatanFilter, setKecamatanFilter] = useState("");
  const [kelurahanFilter, setKelurahanFilter] = useState("");
  const [hasLocationFilter, setHasLocationFilter] = useState("");
  const [hasNibarFilter, setHasNibarFilter] = useState("");
  const [jenisHakFilter, setJenisHakFilter] = useState("");
  const [statusSewaFilter, setStatusSewaFilter] = useState("");
  const [isCertifiedFilter, setIsCertifiedFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  // Available kelurahan — all from data (no kecamatan dependency since BPKA data may not have kecamatan)
  const kelurahanList = filterOptions.kelurahan || [];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Emit all filters at once
  const emitFilters = useCallback(
    (overrides = {}) => {
      const current = {
        status: statusFilter,
        kecamatan: kecamatanFilter,
        desa_kelurahan: kelurahanFilter,
        has_location: hasLocationFilter,
        has_nibar: hasNibarFilter,
        jenis_hak: jenisHakFilter,
        status_sewa: statusSewaFilter,
        is_certified: isCertifiedFilter,
        ...overrides,
      };
      onFilterChange(current);
    },
    [
      onFilterChange,
      statusFilter,
      kecamatanFilter,
      kelurahanFilter,
      hasLocationFilter,
      hasNibarFilter,
      jenisHakFilter,
      statusSewaFilter,
      isCertifiedFilter,
    ],
  );

  const handleStatusChange = useCallback(
    (status) => {
      const newStatus = statusFilter === status ? "" : status;
      setStatusFilter(newStatus);
      emitFilters({ status: newStatus });
    },
    [emitFilters, statusFilter],
  );

  const handleKecamatanChange = useCallback(
    (e) => {
      const val = e.target.value;
      setKecamatanFilter(val);
      setKelurahanFilter("");
      emitFilters({ kecamatan: val, desa_kelurahan: "" });
    },
    [emitFilters],
  );

  const handleKelurahanChange = useCallback(
    (e) => {
      const val = e.target.value;
      setKelurahanFilter(val);
      emitFilters({ desa_kelurahan: val });
    },
    [emitFilters],
  );

  const handleLocationFilterChange = useCallback(
    (val) => {
      const newVal = hasLocationFilter === val ? "" : val;
      setHasLocationFilter(newVal);
      emitFilters({ has_location: newVal });
    },
    [emitFilters, hasLocationFilter],
  );

  const handleNibarFilterChange = useCallback(
    (val) => {
      const newVal = hasNibarFilter === val ? "" : val;
      setHasNibarFilter(newVal);
      emitFilters({ has_nibar: newVal });
    },
    [emitFilters, hasNibarFilter],
  );

  const handleJenisHakChange = useCallback(
    (e) => {
      const val = e.target.value;
      setJenisHakFilter(val);
      emitFilters({ jenis_hak: val });
    },
    [emitFilters],
  );

  const handleStatusSewaChange = useCallback(
    (val) => {
      const newVal = statusSewaFilter === val ? "" : val;
      setStatusSewaFilter(newVal);
      emitFilters({ status_sewa: newVal });
    },
    [emitFilters, statusSewaFilter],
  );

  const handleIsCertifiedChange = useCallback(
    (val) => {
      const newVal = isCertifiedFilter === val ? "" : val;
      setIsCertifiedFilter(newVal);
      emitFilters({ is_certified: newVal });
    },
    [emitFilters, isCertifiedFilter],
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    setKecamatanFilter("");
    setKelurahanFilter("");
    setHasLocationFilter("");
    setHasNibarFilter("");
    setJenisHakFilter("");
    setStatusSewaFilter("");
    setIsCertifiedFilter("");
    onSearch("");
    onFilterChange({
      status: "",
      kecamatan: "",
      desa_kelurahan: "",
      has_location: "",
      has_nibar: "",
      jenis_hak: "",
      status_sewa: "",
      is_certified: "",
    });
  }, [onSearch, onFilterChange]);

  const statusOptions = [
    {
      value: "Aktif",
      label: "Aktif",
      icon: CheckCircleIcon,
      color: "emerald",
    },
    {
      value: "Bermasalah",
      label: "Bermasalah",
      icon: WarningIcon,
      color: "yellow",
    },
    {
      value: "Indikasi Bermasalah",
      label: "Indikasi",
      icon: LightningIcon,
      color: "amber",
    },
    {
      value: "Diblokir",
      label: "Diblokir",
      icon: MinusCircleIcon,
      color: "gray",
    },
  ];

  const allFilters = [
    statusFilter,
    kecamatanFilter,
    kelurahanFilter,
    hasLocationFilter,
    hasNibarFilter,
    jenisHakFilter,
    statusSewaFilter,
    isCertifiedFilter,
  ];
  const hasActiveFilters = searchTerm || allFilters.some(Boolean);
  const activeFilterCount = allFilters.filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Row */}
      <div className="flex gap-3 items-center flex-wrap">
        {/* Search Input */}
        <div className="flex-1 min-w-70">
          <div className="relative">
            <MagnifyingGlassIcon
              size={18}
              weight="bold"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder={
                isBPKAMode
                  ? "Cari NIBAR, No Sertifikat, OPD, kelurahan..."
                  : "Cari kode, nama, atau lokasi aset..."
              }
              aria-label="Cari aset"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-11 pr-10 py-3 text-sm border border-border rounded-xl bg-surface-secondary/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary hover:bg-surface-tertiary rounded-md transition-colors"
              >
                <XIcon size={14} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            showFilters
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-surface text-text-secondary hover:bg-surface-secondary"
          }`}
        >
          <FunnelIcon size={16} weight={showFilters ? "fill" : "bold"} />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-accent text-surface text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-surface text-sm font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-all"
          >
            <ArrowCounterClockwiseIcon size={16} weight="bold" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="space-y-3 pt-2">
          {/* Row 1: Location & Data filters (most important) */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-text-muted font-medium py-1.5 mr-1">
              <NavigationArrowIcon
                size={13}
                weight="fill"
                className="inline -mt-0.5 mr-1"
              />
              Lokasi:
            </span>
            <button
              onClick={() => handleLocationFilterChange("true")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                hasLocationFilter === "true"
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                  : "border-border bg-surface text-text-secondary hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-800"
              }`}
            >
              <MapPinIcon
                size={13}
                weight={hasLocationFilter === "true" ? "fill" : "bold"}
              />
              Ada Lokasi
              {hasLocationFilter === "true" && (
                <XIcon size={11} weight="bold" className="ml-0.5 opacity-60" />
              )}
            </button>
            <button
              onClick={() => handleLocationFilterChange("false")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                hasLocationFilter === "false"
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                  : "border-border bg-surface text-text-secondary hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-800"
              }`}
            >
              <MapPinIcon size={13} weight="bold" />
              Belum Ada Lokasi
              {hasLocationFilter === "false" && (
                <XIcon size={11} weight="bold" className="ml-0.5 opacity-60" />
              )}
            </button>

            {/* Separator */}
            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
            <span className="text-xs text-text-muted font-medium py-1.5 mr-1">
              <CertificateIcon
                size={13}
                weight="fill"
                className="inline -mt-0.5 mr-1"
              />
              Sertifikat:
            </span>
            <button
              onClick={() => handleIsCertifiedChange("true")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isCertifiedFilter === "true"
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700"
                  : "border-border bg-surface text-text-secondary hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-800"
              }`}
            >
              <CertificateIcon
                size={13}
                weight={isCertifiedFilter === "true" ? "fill" : "bold"}
              />
              Bersertifikat
              {isCertifiedFilter === "true" && (
                <XIcon size={11} weight="bold" className="ml-0.5 opacity-60" />
              )}
            </button>
            <button
              onClick={() => handleIsCertifiedChange("false")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isCertifiedFilter === "false"
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-600"
                  : "border-border bg-surface text-text-secondary hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              <MinusCircleIcon size={13} weight="bold" />
              Tidak / Belum
              {isCertifiedFilter === "false" && (
                <XIcon size={11} weight="bold" className="ml-0.5 opacity-60" />
              )}
            </button>

            {/* Separator BPKA */}
            {isBPKAMode && (
              <>
                <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
                <span className="text-xs text-text-muted font-medium py-1.5 mr-1">
                  <IdentificationCardIcon
                    size={13}
                    weight="fill"
                    className="inline -mt-0.5 mr-1"
                  />
                  NIBAR:
                </span>
                <button
                  onClick={() => handleNibarFilterChange("true")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    hasNibarFilter === "true"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                      : "border-border bg-surface text-text-secondary hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800"
                  }`}
                >
                  Ada NIBAR
                  {hasNibarFilter === "true" && (
                    <XIcon
                      size={11}
                      weight="bold"
                      className="ml-0.5 opacity-60"
                    />
                  )}
                </button>
                <button
                  onClick={() => handleNibarFilterChange("false")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    hasNibarFilter === "false"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-600"
                      : "border-border bg-surface text-text-secondary hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  Tanpa NIBAR
                  {hasNibarFilter === "false" && (
                    <XIcon
                      size={11}
                      weight="bold"
                      className="ml-0.5 opacity-60"
                    />
                  )}
                </button>

                <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
                <span className="text-xs text-text-muted font-medium py-1.5 mr-1">
                  <HandshakeIcon
                    size={13}
                    weight="fill"
                    className="inline -mt-0.5 mr-1"
                  />
                  Sewa:
                </span>
                <button
                  onClick={() => handleStatusSewaChange("tersewa")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    statusSewaFilter === "tersewa"
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                      : "border-border bg-surface text-text-secondary hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:border-amber-200 dark:hover:border-amber-800"
                  }`}
                >
                  Tersewa
                  {statusSewaFilter === "tersewa" && (
                    <XIcon
                      size={11}
                      weight="bold"
                      className="ml-0.5 opacity-60"
                    />
                  )}
                </button>
                <button
                  onClick={() => handleStatusSewaChange("tidak")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    statusSewaFilter === "tidak"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-600"
                      : "border-border bg-surface text-text-secondary hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  Tidak Tersewa
                  {statusSewaFilter === "tidak" && (
                    <XIcon
                      size={11}
                      weight="bold"
                      className="ml-0.5 opacity-60"
                    />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Row 2: Location dropdowns + Jenis Hak (BPKA) */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <MapPinIcon
                size={14}
                weight="fill"
                className="text-text-muted shrink-0"
              />
              <span className="text-xs text-text-muted font-medium whitespace-nowrap">
                Wilayah:
              </span>
            </div>

            {/* Kecamatan Dropdown */}
            <div className="relative min-w-44">
              <select
                value={kecamatanFilter}
                onChange={handleKecamatanChange}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-medium border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer"
              >
                <option value="">Semua Kecamatan</option>
                {(filterOptions.kecamatan || []).map((kec) => (
                  <option key={kec} value={kec}>
                    {kec}
                  </option>
                ))}
              </select>
              <CaretDownIcon
                size={12}
                weight="bold"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
            </div>

            {/* Kelurahan Dropdown */}
            <div className="relative min-w-44">
              <select
                value={kelurahanFilter}
                onChange={handleKelurahanChange}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-medium border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer"
              >
                <option value="">Semua Kelurahan</option>
                {kelurahanList.map((kel) => (
                  <option key={kel} value={kel}>
                    {kel}
                  </option>
                ))}
              </select>
              <CaretDownIcon
                size={12}
                weight="bold"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
            </div>

            {/* Jenis Hak dropdown (BPKA only) */}
            {isBPKAMode && (
              <>
                <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
                <div className="relative min-w-44">
                  <select
                    value={jenisHakFilter}
                    onChange={handleJenisHakChange}
                    className="w-full appearance-none pl-3 pr-8 py-2 text-xs font-medium border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer"
                  >
                    <option value="">Semua Jenis Hak</option>
                    {JENIS_HAK_OPTIONS.map((hak) => (
                      <option key={hak} value={hak}>
                        {hak}
                      </option>
                    ))}
                  </select>
                  <CaretDownIcon
                    size={12}
                    weight="bold"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Row 3: Status filter chips (BPN only — BPKA data doesn't use these statuses) */}
          {!isBPKAMode && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-text-muted font-medium py-1.5">
                Status:
              </span>
              {statusOptions.map((option) => {
                const IconComponent = option.icon;
                const isActive = statusFilter === option.value;
                const colorClasses = {
                  emerald: isActive
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                    : "hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-800",
                  red: isActive
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                    : "hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-800",
                  yellow: isActive
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700"
                    : "hover:bg-yellow-50 dark:hover:bg-yellow-900/10 hover:border-yellow-200 dark:hover:border-yellow-800",
                  amber: isActive
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                    : "hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:border-amber-200 dark:hover:border-amber-800",
                  gray: isActive
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700",
                };

                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isActive
                        ? colorClasses[option.color]
                        : `border-border bg-surface text-text-secondary ${colorClasses[option.color]}`
                    }`}
                  >
                    <IconComponent
                      size={14}
                      weight={isActive ? "fill" : "bold"}
                    />
                    {option.label}
                    {isActive && (
                      <XIcon
                        size={12}
                        weight="bold"
                        className="ml-1 opacity-60"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
