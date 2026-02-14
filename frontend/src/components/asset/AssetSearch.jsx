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
} from "@phosphor-icons/react";

export default function AssetSearch({ onSearch, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);

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

  const handleStatusChange = useCallback(
    (status) => {
      const newStatus = statusFilter === status ? "" : status;
      setStatusFilter(newStatus);
      onFilterChange({ status: newStatus });
    },
    [onFilterChange, statusFilter],
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    onSearch("");
    onFilterChange({ status: "" });
  }, [onSearch, onFilterChange]);

  const statusOptions = [
    {
      value: "Aktif",
      label: "Aktif",
      icon: CheckCircleIcon,
      color: "emerald",
    },
    {
      value: "Berperkara",
      label: "Berperkara",
      icon: WarningIcon,
      color: "red",
    },
    {
      value: "Indikasi Berperkara",
      label: "Indikasi",
      icon: LightningIcon,
      color: "amber",
    },
    {
      value: "Tidak Aktif",
      label: "Tidak Aktif",
      icon: MinusCircleIcon,
      color: "gray",
    },
  ];

  const hasActiveFilters = searchTerm || statusFilter;

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
              placeholder="Cari kode, nama, atau lokasi aset..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-11 pr-10 py-3 text-sm border border-border rounded-xl bg-surface-secondary/50 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
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
          {statusFilter && <span className="w-2 h-2 rounded-full bg-accent" />}
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

      {/* Filter Chips */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-xs text-text-muted font-medium py-2">
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
                <IconComponent size={14} weight={isActive ? "fill" : "bold"} />
                {option.label}
                {isActive && (
                  <XIcon size={12} weight="bold" className="ml-1 opacity-60" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
