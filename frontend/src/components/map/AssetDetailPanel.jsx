export default function AssetDetailPanel({ asset, onClose, onViewDetail }) {
  if (!asset) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case "aktif": return "bg-green-100 text-green-700";
      case "berperkara": return "bg-red-100 text-red-700";
      case "dijual": return "bg-blue-100 text-blue-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-xl border border-gray-200 w-80 shadow-xl z-20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs">📍</span>
          </div>
          <h3 className="font-semibold text-sm text-gray-900">Detail Aset</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Foto Aset */}
        <div className="rounded-lg border border-gray-200 h-36 flex items-center justify-center bg-gray-50 overflow-hidden">
          <div className="text-center text-gray-400">
            <span className="text-3xl">🖼️</span>
            <p className="text-xs mt-1">Foto Aset</p>
          </div>
        </div>

        {/* Detail Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs text-gray-500">Kode Aset</span>
            <span className="text-xs font-semibold text-gray-900">{asset.kode_aset}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-gray-500">Nama</span>
            <span className="text-xs font-medium text-gray-900 text-right max-w-[180px]">{asset.nama_aset}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-gray-500">Lokasi</span>
            <span className="text-xs text-gray-700 text-right max-w-[180px]">{asset.lokasi}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Status</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusStyle(asset.status)}`}>
              {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Luas</span>
            <span className="text-xs font-medium text-gray-900">{asset.luas} m²</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Tahun</span>
            <span className="text-xs font-medium text-gray-900">{asset.tahun}</span>
          </div>
        </div>

        {/* Button */}
        <button 
          onClick={() => onViewDetail(asset)}
          className="w-full bg-gray-900 text-white px-4 py-2.5 text-xs font-medium rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
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
