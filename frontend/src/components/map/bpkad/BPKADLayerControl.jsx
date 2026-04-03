import { FunnelIcon } from "@phosphor-icons/react";

export default function BPKALayerControl({
  showAsetPemkot,
  setShowAsetPemkot,
  className = "",
}) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 max-w-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon size={20} weight="fill" className="text-blue-600" />
        <h3 className="font-bold text-lg">Filter BPKA</h3>
      </div>

      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={showAsetPemkot}
          onChange={(e) => setShowAsetPemkot(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="ml-2 text-sm text-gray-600">Aset Pemkot (BPKA)</span>
      </label>
    </div>
  );
}
