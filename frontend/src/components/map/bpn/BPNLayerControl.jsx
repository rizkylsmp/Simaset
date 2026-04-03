import { useState } from "react";
import {
  FunnelSimpleIcon,
  CaretDownIcon,
  CaretUpIcon,
  StackIcon,
} from "@phosphor-icons/react";

export default function BPNLayerControl({
  activeLayer,
  setActiveLayer,
  panelTitle = "Kontrol Layer BPN",
  bidangLabel = "Bidang Tanah (BPN)",
  showLegend = false,
  legendTitle = "Legenda",
  legendItems = [],
}) {
  const [isOpen, setIsOpen] = useState(true);

  const layers = [
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

  return (
    <div className="absolute top-4 left-4 z-20 w-60">
      {/* Header toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 bg-surface/95 backdrop-blur-md border border-border rounded-xl px-3 py-2.5 shadow-lg text-left hover:bg-surface transition-colors"
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
        <div className="mt-1.5 bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-lg overflow-hidden">
          {/* Pilihan layer — mutual exclusive */}
          <div className="px-3 pt-3 pb-2.5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <StackIcon size={11} className="text-text-muted" />
              <span className="text-[10px] uppercase tracking-wide font-semibold text-text-muted">
                Lapisan Aktif
              </span>
            </div>
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
          </div>

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
