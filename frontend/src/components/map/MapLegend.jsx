export default function MapLegend() {
  const statuses = [
    { label: "Aktif", color: "#22c55e" },
    { label: "Berperkara", color: "#ef4444" },
    { label: "Tidak Aktif", color: "#f59e0b" },
    { label: "Dijual", color: "#3b82f6" },
  ];

  return (
    <div className="absolute top-20 right-4 bg-white border-2 border-black w-56 shadow-lg z-10">
      {/* Header */}
      <div className="border-b-2 border-black bg-gray-100 px-4 py-3">
        <h3 className="font-bold text-sm">LEGENDA</h3>
      </div>

      {/* Legend Items */}
      <div className="p-4 space-y-3">
        {statuses.map((status) => (
          <div key={status.label} className="flex items-center gap-3">
            <div
              className="w-6 h-6 border-2 border-gray-800"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-xs">{status.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
