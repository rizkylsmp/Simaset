import { FunnelIcon } from "@phosphor-icons/react";

export default function BPNLayerControl({
  showBidangTanah,
  setShowBidangTanah,
  showBatasWilayah,
  setShowBatasWilayah,
  showBangunan,
  setShowBangunan,
  currentThematic,
  setCurrentThematic,
  is3D,
  setIs3D,
  panelTitle = "Kontrol Layer BPN",
  bidangLabel = "Bidang Tanah (BPN)",
}) {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon size={20} weight="fill" className="text-blue-600" />
        <h3 className="font-bold text-lg">{panelTitle}</h3>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2 text-gray-700">
          Lapisan Utama
        </h4>
        <label className="flex items-center mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showBatasWilayah}
            onChange={(e) => setShowBatasWilayah(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="ml-2 text-sm text-gray-600">Batas Wilayah</span>
        </label>
        <label className="flex items-center mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showBidangTanah}
            onChange={(e) => setShowBidangTanah(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="ml-2 text-sm text-gray-600">{bidangLabel}</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showBangunan}
            onChange={(e) => setShowBangunan(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="ml-2 text-sm text-gray-600">Bangunan 3D</span>
        </label>
      </div>

      <div className="mb-4 border-t pt-4">
        <h4 className="font-semibold text-sm mb-2 text-gray-700">
          Lapisan Tematik
        </h4>
        <label className="flex items-center mb-2 cursor-pointer">
          <input
            type="radio"
            name="thematic"
            value="none"
            checked={currentThematic === "none"}
            onChange={(e) => setCurrentThematic(e.target.value)}
            className="w-4 h-4"
          />
          <span className="ml-2 text-sm text-gray-600">Tidak Ada</span>
        </label>
        <label className="flex items-center mb-2 cursor-pointer">
          <input
            type="radio"
            name="thematic"
            value="rdtr"
            checked={currentThematic === "rdtr"}
            onChange={(e) => setCurrentThematic(e.target.value)}
            className="w-4 h-4"
          />
          <span className="ml-2 text-sm text-gray-600">RDTR (Pola Ruang)</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="thematic"
            value="znt"
            checked={currentThematic === "znt"}
            onChange={(e) => setCurrentThematic(e.target.value)}
            className="w-4 h-4"
          />
          <span className="ml-2 text-sm text-gray-600">ZNT (Nilai Tanah)</span>
        </label>
      </div>

      <button
        onClick={() => setIs3D(!is3D)}
        className={`w-full py-2 px-3 rounded font-semibold text-sm transition-colors ${
          is3D
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        {is3D ? "Mode 3D (Aktif)" : "Aktifkan 3D"}
      </button>
    </div>
  );
}
