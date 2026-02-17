import {
  EyeIcon,
  PencilSimpleIcon,
  TrashIcon,
  DotsThreeIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";

export default function ActionButtons({
  onEdit,
  onView,
  onDelete,
  onShowOnMap,
  assetId,
  asset,
  showEdit = true,
  showDelete = true,
  highlightEdit = false,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex gap-1 justify-center items-center">
      {/* View Button - Always visible */}
      <button
        onClick={() => onView?.()}
        className="group relative p-2 text-text-muted hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
        title="Lihat detail"
      >
        <EyeIcon size={18} weight="bold" />
      </button>

      {/* Show on Map Button */}
      {onShowOnMap && (
        <button
          onClick={onShowOnMap}
          className="group relative p-2 text-text-muted hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all"
          title="Lihat di Peta"
        >
          <MapPinIcon size={18} weight="bold" />
        </button>
      )}

      {/* Edit Button */}
      {showEdit && onEdit && highlightEdit ? (
        <button
          onClick={() => onEdit(assetId)}
          className="group relative flex items-center gap-1.5 px-3 py-1.5 bg-accent text-surface rounded-lg text-xs font-semibold hover:opacity-90 shadow-sm shadow-accent/20 transition-all"
          title="Ubah Data"
        >
          <PencilSimpleIcon size={14} weight="bold" />
          <span>Ubah</span>
        </button>
      ) : showEdit && onEdit ? (
        <button
          onClick={() => onEdit(assetId)}
          className="group relative p-2 text-text-muted hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
          title="Edit"
        >
          <PencilSimpleIcon size={18} weight="bold" />
        </button>
      ) : null}

      {/* Delete Button */}
      {showDelete && onDelete && (
        <button
          onClick={() => onDelete(assetId)}
          className="group relative p-2 text-text-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          title="Hapus"
        >
          <TrashIcon size={18} weight="bold" />
        </button>
      )}
    </div>
  );
}
