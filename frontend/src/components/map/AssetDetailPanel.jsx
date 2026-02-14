import {
  MapPinIcon,
  XIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  WarningIcon,
  LightningIcon,
  MinusCircleIcon,
  RulerIcon,
  CalendarBlankIcon,
  BuildingsIcon,
  TagIcon,
  NavigationArrowIcon,
} from "@phosphor-icons/react";

export default function AssetDetailPanel({ asset, onClose, onViewDetail }) {
  if (!asset) return null;

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase().replace(/\s+/g, "_");
    const configs = {
      aktif: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-700",
        icon: CheckCircleIcon,
        dot: "bg-emerald-500",
      },
      berperkara: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-300",
        border: "border-red-200 dark:border-red-700",
        icon: WarningIcon,
        dot: "bg-red-500",
      },
      indikasi_berperkara: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-700",
        icon: LightningIcon,
        dot: "bg-blue-500",
      },
      tidak_aktif: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-700",
        icon: MinusCircleIcon,
        dot: "bg-amber-500",
      },
    };
    return (
      configs[s] || {
        bg: "bg-gray-100 dark:bg-gray-900/30",
        text: "text-gray-700 dark:text-gray-300",
        border: "border-gray-200 dark:border-gray-700",
        icon: MinusCircleIcon,
        dot: "bg-gray-500",
      }
    );
  };

  const statusConfig = getStatusConfig(asset.status);
  const StatusIcon = statusConfig.icon;
  const statusLabel =
    asset.status?.charAt(0).toUpperCase() +
    asset.status?.slice(1).replace(/_/g, " ");

  return (
    <div className="absolute bottom-20 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bg-surface/95 backdrop-blur-md rounded-2xl border border-border w-auto sm:w-96 shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header with gradient */}
      <div className="relative bg-linear-to-r from-accent to-accent/80 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 bg-surface/20 rounded-xl flex items-center justify-center shrink-0">
              <MapPinIcon size={18} weight="fill" className="text-surface" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-surface truncate leading-tight">
                {asset.nama_aset}
              </h3>
              <p className="text-[10px] text-surface/70 font-mono mt-0.5">
                {asset.kode_aset}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-surface/20 rounded-lg transition-colors text-surface/80 hover:text-surface shrink-0 ml-2"
          >
            <XIcon size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3.5">
        {/* Status Badge + Jenis */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${statusConfig.bg} ${statusConfig.border}`}
          >
            <StatusIcon size={14} weight="fill" className={statusConfig.text} />
            <span className={`text-xs font-bold ${statusConfig.text}`}>
              {statusLabel}
            </span>
          </div>
          {asset.jenis_aset && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border">
              <TagIcon size={12} className="text-text-muted" />
              <span className="text-xs font-medium text-text-secondary">
                {asset.jenis_aset}
              </span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-start gap-2.5 p-3 bg-surface-secondary rounded-xl">
          <MapPinIcon size={14} className="text-text-muted shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
            {asset.lokasi || "Lokasi tidak tersedia"}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-surface-secondary rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-text-muted mb-1">
              <RulerIcon size={12} />
              <span className="text-[10px] uppercase tracking-wide font-medium">
                Luas
              </span>
            </div>
            <p className="text-sm font-bold text-text-primary">
              {parseFloat(asset.luas || 0).toLocaleString("id-ID")} m²
            </p>
          </div>
          <div className="bg-surface-secondary rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-text-muted mb-1">
              <CalendarBlankIcon size={12} />
              <span className="text-[10px] uppercase tracking-wide font-medium">
                Tahun
              </span>
            </div>
            <p className="text-sm font-bold text-text-primary">
              {asset.tahun || "-"}
            </p>
          </div>
        </div>

        {/* View Detail Button */}
        <button
          onClick={() => onViewDetail(asset)}
          className="w-full bg-accent text-surface px-4 py-3 text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-accent/30 transition-all flex items-center justify-center gap-2 group"
        >
          <span>Lihat Detail Lengkap</span>
          <ArrowRightIcon
            size={16}
            weight="bold"
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </div>
  );
}
