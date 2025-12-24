export default function AssetDetailPanel({ asset, onClose }) {
  if (!asset) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-white border-2 border-black w-80 shadow-lg z-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black bg-gray-100 px-4 py-3">
        <h3 className="font-bold text-sm">DETAIL ASET</h3>
        <button
          onClick={onClose}
          className="font-bold text-lg hover:bg-gray-200 rounded px-2 py-0 transition"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Foto Aset */}
        <div className="border-2 border-gray-800 h-40 flex items-center justify-center bg-gray-50">
          <span className="text-gray-400 text-sm">[FOTO ASET]</span>
        </div>

        {/* Detail Info */}
        <div className="space-y-2 text-xs">
          <div className="flex border-b-2 border-gray-200 pb-2">
            <span className="font-bold w-24">Kode Aset</span>
            <span className="flex-1">{asset.kode_aset}</span>
          </div>
          <div className="flex border-b-2 border-gray-200 pb-2">
            <span className="font-bold w-24">Nama Aset</span>
            <span className="flex-1">{asset.nama_aset}</span>
          </div>
          <div className="flex border-b-2 border-gray-200 pb-2">
            <span className="font-bold w-24">Lokasi</span>
            <span className="flex-1">{asset.lokasi}</span>
          </div>
          <div className="flex border-b-2 border-gray-200 pb-2">
            <span className="font-bold w-24">Status</span>
            <span
              className={`flex-1 font-bold ${
                asset.status === "aktif"
                  ? "text-green-700"
                  : asset.status === "berperkara"
                  ? "text-red-700"
                  : "text-orange-700"
              }`}
            >
              {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
            </span>
          </div>
          <div className="flex border-b-2 border-gray-200 pb-2">
            <span className="font-bold w-24">Luas</span>
            <span className="flex-1 text-orange-600">{asset.luas} m²</span>
          </div>
          <div className="flex">
            <span className="font-bold w-24">Tahun</span>
            <span className="flex-1 text-orange-600">{asset.tahun}</span>
          </div>
        </div>

        {/* Button */}
        <button className="w-full bg-black text-white border-2 border-black px-4 py-2 text-xs font-bold hover:bg-gray-900 transition mt-4">
          [Button] Lihat Detail Lengkap
        </button>
      </div>
    </div>
  );
}
