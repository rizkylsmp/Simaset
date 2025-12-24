export default function FormFileUpload({
  label,
  name,
  onChange,
  multiple = false,
  accept = "image/*",
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold">{label}</label>
      <label className="flex items-center border-2 border-gray-800 px-3 py-2 text-sm cursor-pointer hover:border-black hover:bg-gray-50 transition">
        <input
          type="file"
          name={name}
          onChange={onChange}
          multiple={multiple}
          accept={accept}
          className="hidden"
        />
        <span className="text-orange-600 font-medium">
          [📁 File Upload] Pilih File{multiple ? " (Multiple)" : ""}
        </span>
      </label>
    </div>
  );
}
