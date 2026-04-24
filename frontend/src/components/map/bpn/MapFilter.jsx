import { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  WarningIcon,
  LightningIcon,
  MinusCircleIcon,
  ChartPieIcon,
  XIcon,
  HandshakeIcon,
  StorefrontIcon,
  CrosshairIcon,
} from "@phosphor-icons/react";

const SEARCH_FIELDS = [
  "nama_aset",
  "kode_aset",
  "nib",
  "nibar",
  "nomor_sertifikat",
  "opd_pengguna",
  "lokasi",
  "kecamatan",
  "desa_kelurahan",
];

function normalizeText(value) {
  return value ? String(value).toLowerCase().trim() : "";
}

function normalizeDigits(value) {
  return value ? String(value).replace(/\D/g, "") : "";
}

function matchesSearch(value, term, termDigits) {
  const text = normalizeText(value);
  if (text.includes(term)) return true;

  const digits = normalizeDigits(value);
  return termDigits.length >= 2 && digits.includes(termDigits);
}

export default function MapFilter({
  selectedLayers,
  onLayerToggle,
  selectedSewaLayers,
  onSewaLayerToggle,
  onSearch,
  onSelectAsset,
  assets = [],
  searchResults = null,
  searchLoading = false,
  isBPKAMode = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Status layers — only for BPN
  const statusLayers = [
    {
      id: "aktif",
      label: "Aktif",
      color: "#10b981",
      bgColor: "bg-emerald-500",
      lightBg: "bg-emerald-50 dark:bg-emerald-900/20",
      icon: CheckCircleIcon,
    },
    {
      id: "bermasalah",
      label: "Bermasalah",
      color: "#eab308",
      bgColor: "bg-yellow-500",
      lightBg: "bg-yellow-50 dark:bg-yellow-900/20",
      icon: WarningIcon,
    },
    {
      id: "indikasi_bermasalah",
      label: "Indikasi",
      color: "#3b82f6",
      bgColor: "bg-blue-500",
      lightBg: "bg-blue-50 dark:bg-blue-900/20",
      icon: LightningIcon,
    },
    {
      id: "diblokir",
      label: "Diblokir",
      color: "#ef4444",
      bgColor: "bg-red-500",
      lightBg: "bg-red-50 dark:bg-red-900/20",
      icon: MinusCircleIcon,
    },
  ];

  const stats = useMemo(() => {
    const normalize = (s) => s?.toLowerCase().replace(/\s+/g, "_") || "";
    return {
      total: assets.length,
      aktif: assets.filter((a) => normalize(a.status) === "aktif").length,
      bermasalah: assets.filter((a) => normalize(a.status) === "bermasalah")
        .length,
      indikasi: assets.filter(
        (a) => normalize(a.status) === "indikasi_bermasalah",
      ).length,
      diblokir: assets.filter((a) => normalize(a.status) === "diblokir").length,
      tersewa: assets.filter((a) => a.status_sewa === "Tersewa").length,
      tersedia: assets.filter((a) => a.status_sewa === "Tersedia").length,
    };
  }, [assets]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  // Search results for dropdown (max 6)
  const localSearchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const lower = normalizeText(searchTerm);
    const digits = normalizeDigits(searchTerm);
    return assets
      .filter((asset) =>
        SEARCH_FIELDS.some((field) =>
          matchesSearch(asset[field], lower, digits),
        ),
      )
      .slice(0, 6);
  }, [searchTerm, assets]);
  const displayedSearchResults = searchResults ?? localSearchResults;

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="space-y-5">
      {/* Search Box */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          Cari Aset
        </label>
        <div className="relative">
          <MagnifyingGlassIcon
            size={18}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder={
              isBPKAMode
                ? "NIBAR, No Sertifikat, OPD..."
                : "Nama atau kode aset..."
            }
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-9 py-3 text-sm bg-surface border-2 border-border rounded-xl outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-text-primary placeholder:text-text-muted"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <XIcon size={16} weight="bold" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchLoading ? (
          <div className="mt-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[11px] text-text-muted shadow-lg">
            Mencari aset...
          </div>
        ) : null}

        {displayedSearchResults.length > 0 && !searchLoading && (
          <div className="mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface shadow-lg">
            {displayedSearchResults.map((asset) => {
              const hasCoordinates =
                Number.isFinite(Number(asset.latitude)) &&
                Number.isFinite(Number(asset.longitude));

              return (
              <div
                key={asset.id}
                className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-surface-secondary transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-text-primary truncate">
                    {asset.nama_aset || asset.kode_aset}
                  </p>
                  <p className="text-[10px] text-text-muted truncate">
                    {!hasCoordinates
                      ? "Belum ada koordinat"
                      : isBPKAMode && asset.nibar
                      ? `NIBAR: ${asset.nibar}`
                      : asset.kecamatan
                        ? `Kec. ${asset.kecamatan}`
                        : asset.lokasi || "-"}
                  </p>
                </div>
                <button
                  onClick={() => onSelectAsset?.(asset)}
                  disabled={!hasCoordinates}
                  className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                    hasCoordinates
                      ? "text-surface bg-accent hover:bg-accent/80"
                      : "text-text-muted bg-surface-secondary cursor-not-allowed"
                  }`}
                >
                  <CrosshairIcon size={12} weight="bold" />
                  {hasCoordinates ? "Lihat" : "Tanpa titik"}
                </button>
              </div>
              );
            })}
          </div>
        )}

        {searchTerm.length >= 2 &&
          displayedSearchResults.length === 0 &&
          !searchLoading && (
            <div className="mt-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[11px] text-text-muted shadow-lg">
              Tidak ditemukan aset yang cocok.
            </div>
          )}
      </div>

      {/* Status Aset — BPN only */}
      {!isBPKAMode && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-2">
            <ChartPieIcon size={14} />
            Filter Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statusLayers.map((layer) => {
              const Icon = layer.icon;
              const isActive = selectedLayers[layer.id] !== false;
              return (
                <button
                  key={layer.id}
                  onClick={() => onLayerToggle(layer.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                    isActive
                      ? `${layer.lightBg} border-current`
                      : "bg-surface border-border opacity-50"
                  }`}
                  style={{ borderColor: isActive ? layer.color : undefined }}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${layer.bgColor}`}
                  >
                    <Icon size={12} weight="fill" className="text-surface" />
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
      )}

      {/* Filter Sewa — BPKA only */}
      {isBPKAMode && selectedSewaLayers && onSewaLayerToggle && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-2">
            <HandshakeIcon size={14} />
            Filter Sewa
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Tersedia / Sedia Disewakan */}
            <button
              onClick={() => onSewaLayerToggle("tersedia")}
              className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                selectedSewaLayers.tersedia
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400"
                  : "bg-surface border-border opacity-50"
              }`}
            >
              <div className="w-5 h-5 rounded-md flex items-center justify-center bg-emerald-500">
                <StorefrontIcon
                  size={12}
                  weight="fill"
                  className="text-surface"
                />
              </div>
              <span
                className={`text-xs font-medium ${selectedSewaLayers.tersedia ? "text-text-primary" : "text-text-muted"}`}
              >
                Tersedia
              </span>
            </button>
            {/* Tersewa */}
            <button
              onClick={() => onSewaLayerToggle("tersewa")}
              className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                selectedSewaLayers.tersewa
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400"
                  : "bg-surface border-border opacity-50"
              }`}
            >
              <div className="w-5 h-5 rounded-md flex items-center justify-center bg-amber-500">
                <HandshakeIcon
                  size={12}
                  weight="fill"
                  className="text-surface"
                />
              </div>
              <span
                className={`text-xs font-medium ${selectedSewaLayers.tersewa ? "text-text-primary" : "text-text-muted"}`}
              >
                Tersewa
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Statistics Card */}
      <div className="bg-linear-to-br from-accent/10 to-accent/5 rounded-xl p-4 border border-accent/20">
        <div className="flex items-center gap-2 mb-3">
          <ChartPieIcon size={16} weight="fill" className="text-accent" />
          <h4 className="text-sm font-bold text-text-primary">
            Statistik Aset
          </h4>
        </div>

        <div className="flex items-center justify-between mb-3 p-2.5 bg-surface rounded-lg">
          <span className="text-xs text-text-secondary">Total Aset</span>
          <span className="text-xl font-bold text-text-primary">
            {stats.total}
          </span>
        </div>

        {!isBPKAMode && (
          <>
            <div className="space-y-1.5">
              {[
                {
                  label: "Aktif",
                  count: stats.aktif,
                  bgColor: "bg-emerald-500",
                },
                {
                  label: "Bermasalah",
                  count: stats.bermasalah,
                  bgColor: "bg-yellow-500",
                },
                {
                  label: "Indikasi",
                  count: stats.indikasi,
                  bgColor: "bg-blue-500",
                },
                {
                  label: "Diblokir",
                  count: stats.diblokir,
                  bgColor: "bg-red-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${item.bgColor}`}
                    />
                    <span className="text-text-secondary">{item.label}</span>
                  </div>
                  <span className="font-bold text-text-primary">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 h-1.5 bg-surface rounded-full overflow-hidden flex">
              {stats.total > 0 && (
                <>
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{
                      width: `${(stats.aktif / stats.total) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-yellow-500 transition-all"
                    style={{
                      width: `${(stats.bermasalah / stats.total) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-blue-500 transition-all"
                    style={{
                      width: `${(stats.indikasi / stats.total) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-red-500 transition-all"
                    style={{
                      width: `${(stats.diblokir / stats.total) * 100}%`,
                    }}
                  />
                </>
              )}
            </div>
          </>
        )}

        {isBPKAMode && (
          <>
            <div className="space-y-1.5">
              {[
                {
                  label: "Tersedia Disewa",
                  count: stats.tersedia,
                  bgColor: "bg-emerald-500",
                },
                {
                  label: "Tersewa",
                  count: stats.tersewa,
                  bgColor: "bg-amber-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${item.bgColor}`}
                    />
                    <span className="text-text-secondary">{item.label}</span>
                  </div>
                  <span className="font-bold text-text-primary">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 h-1.5 bg-surface rounded-full overflow-hidden flex">
              {stats.total > 0 && (
                <>
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{
                      width: `${(stats.tersedia / stats.total) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-amber-500 transition-all"
                    style={{
                      width: `${(stats.tersewa / stats.total) * 100}%`,
                    }}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
