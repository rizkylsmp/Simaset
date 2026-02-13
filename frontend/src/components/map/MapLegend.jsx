import {
  StackSimple,
  MapPin,
  Polygon,
  CheckCircle,
  Warning,
  Lightning,
  MinusCircle,
  CaretUp,
  CaretDown,
  CheckSquare,
  Square,
} from "@phosphor-icons/react";
import { useState } from "react";

export default function MapLegend({
  showMarkers = true,
  showPolygons = true,
  onToggleMarkers,
  onTogglePolygons,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const markerStatuses = [
    {
      label: "Aktif",
      color: "#10b981",
      bgColor: "bg-emerald-500",
      icon: CheckCircle,
    },
    {
      label: "Berperkara",
      color: "#ef4444",
      bgColor: "bg-red-500",
      icon: Warning,
    },
    {
      label: "Indikasi Berperkara",
      color: "#3b82f6",
      bgColor: "bg-blue-500",
      icon: Lightning,
    },
    {
      label: "Tidak Aktif",
      color: "#f59e0b",
      bgColor: "bg-amber-500",
      icon: MinusCircle,
    },
  ];

  const polygonStatuses = [
    { label: "Aktif", color: "#10b981", bgColor: "bg-emerald-500" },
    { label: "Berperkara", color: "#ef4444", bgColor: "bg-red-500" },
    { label: "Tidak Aktif", color: "#f59e0b", bgColor: "bg-amber-500" },
    { label: "Indikasi Berperkara", color: "#3b82f6", bgColor: "bg-blue-500" },
  ];

  return (
    <div className="bg-surface/95 backdrop-blur-sm rounded-xl border border-border shadow-xl overflow-hidden transition-all w-56">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full border-b border-border bg-surface-secondary/80 px-3.5 py-2.5 flex items-center justify-between hover:bg-surface-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent/10 rounded-lg flex items-center justify-center">
            <StackSimple size={14} weight="fill" className="text-accent" />
          </div>
          <h3 className="font-bold text-xs text-text-primary">
            Layer Controls
          </h3>
        </div>
        {isCollapsed ? (
          <CaretDown size={14} className="text-text-muted" />
        ) : (
          <CaretUp size={14} className="text-text-muted" />
        )}
      </button>

      {!isCollapsed && (
        <div className="p-3 space-y-3">
          {/* Layer Toggles */}
          <div className="space-y-1">
            {/* Marker Toggle */}
            <button
              onClick={onToggleMarkers}
              className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-secondary transition-colors group"
            >
              {showMarkers ? (
                <CheckSquare
                  size={18}
                  weight="fill"
                  className="text-accent shrink-0"
                />
              ) : (
                <Square
                  size={18}
                  weight="regular"
                  className="text-text-muted shrink-0"
                />
              )}
              <MapPin
                size={16}
                weight="fill"
                className="text-accent shrink-0"
              />
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                Tampilkan Marker
              </span>
            </button>

            {/* Polygon Toggle */}
            <button
              onClick={onTogglePolygons}
              className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-secondary transition-colors group"
            >
              {showPolygons ? (
                <CheckSquare
                  size={18}
                  weight="fill"
                  className="text-accent shrink-0"
                />
              ) : (
                <Square
                  size={18}
                  weight="regular"
                  className="text-text-muted shrink-0"
                />
              )}
              <Polygon
                size={16}
                weight="fill"
                className="text-accent shrink-0"
              />
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                Tampilkan Polygon
              </span>
            </button>
          </div>

          {/* Marker Legend */}
          {showMarkers && (
            <>
              <div className="border-t border-border pt-2">
                <div className="flex items-center gap-1.5 mb-1.5 px-1.5">
                  <MapPin size={12} weight="fill" className="text-text-muted" />
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    Marker Aset
                  </span>
                </div>
                <div className="space-y-0.5">
                  {markerStatuses.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div
                        key={s.label}
                        className="flex items-center gap-2.5 px-1.5 py-1 rounded-lg"
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${s.bgColor} shadow-sm`}
                        >
                          <Icon
                            size={10}
                            weight="fill"
                            className="text-white"
                          />
                        </div>
                        <span className="text-[11px] text-text-secondary">
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Polygon Legend */}
          {showPolygons && (
            <div className="border-t border-border pt-2">
              <div className="flex items-center gap-1.5 mb-1.5 px-1.5">
                <Polygon size={12} weight="fill" className="text-text-muted" />
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Polygon Aset
                </span>
              </div>
              <div className="space-y-0.5">
                {polygonStatuses.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2.5 px-1.5 py-1 rounded-lg"
                  >
                    <div
                      className="w-5 h-3 rounded-sm border"
                      style={{
                        backgroundColor: s.color + "40",
                        borderColor: s.color,
                      }}
                    />
                    <span className="text-[11px] text-text-secondary">
                      {s.label}
                    </span>
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
