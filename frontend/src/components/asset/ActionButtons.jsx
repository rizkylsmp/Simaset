export default function ActionButtons({ onEdit, onView, onDelete, assetId }) {
  return (
    <div className="flex gap-1 justify-center">
      <button
        onClick={() => onView(assetId)}
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        title="Lihat detail"
      >
        👁️
      </button>
      <button
        onClick={() => onEdit(assetId)}
        className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
        title="Edit"
      >
        ✏️
      </button>
      <button
        onClick={() => onDelete(assetId)}
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        title="Hapus"
      >
        🗑️
      </button>
    </div>
  );
}
