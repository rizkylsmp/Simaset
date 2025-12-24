export default function ActionButtons({ onEdit, onView, onDelete, assetId }) {
  return (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => onView(assetId)}
        className="border-2 border-black px-3 py-1 text-sm font-bold hover:bg-blue-100 transition"
        title="Lihat detail"
      >
        [→]
      </button>
      <button
        onClick={() => onEdit(assetId)}
        className="border-2 border-black px-3 py-1 text-sm font-bold hover:bg-yellow-100 transition"
        title="Edit"
      >
        [⎔]
      </button>
      <button
        onClick={() => onDelete(assetId)}
        className="border-2 border-black px-3 py-1 text-sm font-bold hover:bg-red-100 transition"
        title="Hapus"
      >
        [✕]
      </button>
    </div>
  );
}
