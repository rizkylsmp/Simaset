import { useState } from "react";
import {
  FunnelSimpleIcon,
  CaretDownIcon,
  CaretUpIcon,
  StackIcon,
  MapPinAreaIcon,
} from "@phosphor-icons/react";

export default function BPNLayerControl({
  activeLayer,
  setActiveLayer,
  panelTitle = "Kontrol Layer BPN",
  bidangLabel = "Bidang Tanah (BPN)",
  showLegend = false,
  legendTitle = "Legenda",
  legendItems = [],
  showKelurahan = true,
  setShowKelurahan,
  showKecamatan = true,
  setShowKecamatan,
  isBPKAMode = false,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const allLayers = [
    {
      value: "bidang",
      label: bidangLabel,
      swatch: (
        <span className="w-3.5 h-2.5 rounded-sm border border-sky-400 bg-sky-400/20 shrink-0" />
      ),
    },
    {
      value: "rdtr",
      label: "RDTR / Pola Ruang",
      swatch: (
        <span
          className="w-3.5 h-2.5 rounded-sm shrink-0"
          style={{
            backgroundColor: "#22c55e",
            opacity: 0.7,
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        />
      ),
    },
    {
      value: "znt",
      label: "ZNT / Nilai Tanah",
      swatch: (
        <span
          className="w-3.5 h-2.5 rounded-sm shrink-0"
          style={{
            backgroundColor: "#f97316",
            opacity: 0.7,
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        />
      ),
    },
  ];

  // BPKA mode: only show bidang (Aset Pemkot), hide RDTR/ZNT
  const layers = isBPKAMode
    ? allLayers.filter((l) => l.value === "bidang")
    : allLayers;

  return (
    <div>
      {/* Header toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 text-left hover:bg-surface-secondary transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <FunnelSimpleIcon
            size={15}
            weight="fill"
            className="text-accent shrink-0"
          />
          <span className="text-xs font-bold text-text-primary truncate">
            {panelTitle}
          </span>
        </div>
        {isOpen ? (
          <CaretUpIcon size={13} className="text-text-muted shrink-0" />
        ) : (
          <CaretDownIcon size={13} className="text-text-muted shrink-0" />
        )}
      </button>

      {/* Body */}
      {isOpen && (
        <div className="mt-1.5 bg-surface border border-border rounded-xl overflow-hidden">
          {/* Pilihan layer */}
          <div className="px-3 pt-3 pb-2.5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <StackIcon size={11} className="text-text-muted" />
              <span className="text-[10px] uppercase tracking-wide font-semibold text-text-muted">
                Lapisan Aktif
              </span>
            </div>

            {isBPKAMode ? (
              /* BPKA: simple switch toggle for Aset Pemkot */
              <label className="flex items-center justify-between gap-2 cursor-pointer group">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3.5 h-2.5 rounded-sm border border-amber-400 bg-amber-400/20 shrink-0" />
                  <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors truncate">
                    {bidangLabel}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={activeLayer === "bidang"}
                  onClick={() =>
                    setActiveLayer(activeLayer === "bidang" ? "none" : "bidang")
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    activeLayer === "bidang" ? "bg-amber-500" : "bg-border"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                      activeLayer === "bidang"
                        ? "translate-x-4"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            ) : (
              /* BPN: mutual exclusive radio buttons */
              <div className="space-y-2">
                {layers.map(({ value, label, swatch }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="active-layer"
                      value={value}
                      checked={activeLayer === value}
                      onChange={() => setActiveLayer(value)}
                      className="w-3.5 h-3.5 accent-accent"
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {swatch}
                      <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors truncate">
                        {label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Batas Wilayah toggles */}
          {setShowKelurahan && setShowKecamatan && (
            <div className="px-3 pb-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5 mb-2.5">
                <MapPinAreaIcon size={11} className="text-text-muted" />
                <span className="text-[10px] uppercase tracking-wide font-semibold text-text-muted">
                  Batas Wilayah
                </span>
              </div>
              <div className="space-y-1.5">
                {/* Kelurahan */}
                <label
                  className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-2 transition-all duration-200 border ${
                    showKelurahan
                      ? "bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-800/40"
                      : "bg-transparent border-transparent hover:bg-surface-secondary"
                  }`}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showKelurahan}
                    onClick={() => setShowKelurahan(!showKelurahan)}
                    className={`relative inline-flex h-4.5 w-8 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      showKelurahan ? "bg-emerald-500" : "bg-border"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                        showKelurahan ? "translate-x-3.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-5 shrink-0 rounded-full"
                      style={{
                        height: "2px",
                        backgroundColor: showKelurahan ? "#10b981" : "#94a3b8",
                        transition: "background-color 0.2s",
                      }}
                    />
                    <span
                      className={`text-xs font-medium transition-colors truncate ${
                        showKelurahan
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-text-muted"
                      }`}
                    >
                      Batas Kelurahan
                    </span>
                  </div>
                </label>

                {/* Kecamatan */}
                <label
                  className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-2 transition-all duration-200 border ${
                    showKecamatan
                      ? "bg-violet-50 dark:bg-violet-900/15 border-violet-200 dark:border-violet-800/40"
                      : "bg-transparent border-transparent hover:bg-surface-secondary"
                  }`}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showKecamatan}
                    onClick={() => setShowKecamatan(!showKecamatan)}
                    className={`relative inline-flex h-4.5 w-8 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      showKecamatan ? "bg-violet-500" : "bg-border"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                        showKecamatan ? "translate-x-3.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-5 shrink-0"
                      style={{
                        height: "2.5px",
                        backgroundImage: `repeating-linear-gradient(90deg, ${showKecamatan ? "#8b5cf6" : "#334155"} 0 4px, transparent 4px 7px)`,
                        backgroundSize: "7px 2.5px",
                        transition: "background-image 0.2s",
                      }}
                    />
                    <span
                      className={`text-xs font-medium transition-colors truncate ${
                        showKecamatan
                          ? "text-violet-700 dark:text-violet-300"
                          : "text-text-muted"
                      }`}
                    >
                      Batas Kecamatan
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Legenda */}
          {showLegend && legendItems.length > 0 && (
            <div className="px-3 pb-3 pt-2.5 border-t border-border/50">
              <span className="text-[10px] uppercase tracking-wide font-semibold text-text-muted block mb-2">
                {legendTitle}
              </span>
              <div className="space-y-1.5">
                {legendItems.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className="flex items-center gap-2 text-xs text-text-secondary"
                  >
                    {item.type === "line" ? (
                      <span
                        className="inline-block w-4 rounded-full shrink-0"
                        style={{
                          backgroundColor: item.color,
                          height: `${item.thickness || 2}px`,
                        }}
                      />
                    ) : (
                      <span
                        className="inline-block w-4 h-3 rounded-sm border border-black/10 shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    <span className="leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
