export default function FormFileUpload({
  label,
  name,
  onChange,
  multiple = false,
  accept = "image/*",
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-text-primary">{label}</label>
      <label className="flex items-center border-2 border-dashed border-border bg-surface px-3 py-3 text-sm cursor-pointer rounded-lg hover:border-text-tertiary hover:bg-surface-secondary transition">
        <input
          type="file"
          name={name}
          onChange={onChange}
          multiple={multiple}
          accept={accept}
          className="hidden"
        />
        <span className="text-accent font-medium">
          📁 Pilih File{multiple ? " (Multiple)" : ""}
        </span>
      </label>
    </div>
  );
}
