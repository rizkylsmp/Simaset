export default function AssetDetailPanel({ asset, onClose, onViewDetail }) {
  if (!asset) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case "aktif": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "berperkara": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      case "dijual": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      default: return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
    }
  };

  return (
    <div className="absolute bottom-52 right-4 bg-surface rounded-xl border border-border w-80 shadow-xl z-20 overflow-hidden max-h-[calc(100vh-250px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-secondary px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-surface text-xs">📍</span>
          </div>
          <h3 className="font-semibold text-sm text-text-primary">Detail Aset</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center hover:bg-surface-tertiary rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Foto Aset */}
        <div className="rounded-lg border border-border h-36 flex items-center justify-center bg-surface-secondary overflow-hidden">
          <div className="text-center text-text-muted">
            <span className="text-3xl">🖼️</span>
            <p className="text-xs mt-1">Foto Aset</p>
          </div>
        </div>

        {/* Detail Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs text-text-tertiary">Kode Aset</span>
            <span className="text-xs font-semibold text-text-primary">{asset.kode_aset}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-text-tertiary">Nama</span>
            <span className="text-xs font-medium text-text-primary text-right max-w-[180px]">{asset.nama_aset}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-text-tertiary">Lokasi</span>
            <span className="text-xs text-text-secondary text-right max-w-[180px]">{asset.lokasi}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-tertiary">Status</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusStyle(asset.status)}`}>
              {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-tertiary">Luas</span>
            <span className="text-xs font-medium text-text-primary">{asset.luas} m²</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-tertiary">Tahun</span>
            <span className="text-xs font-medium text-text-primary">{asset.tahun}</span>
          </div>
        </div>

        {/* Button */}
        <button 
          onClick={() => onViewDetail(asset)}
          className="w-full bg-accent text-surface px-4 py-2.5 text-xs font-medium rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <span>Lihat Detail Lengkap</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
