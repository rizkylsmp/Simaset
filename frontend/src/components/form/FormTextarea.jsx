export default function FormTextarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  rows = 3,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full border-2 border-gray-800 px-3 py-2 text-sm outline-none hover:border-black focus:border-black focus:ring-0 transition resize-none"
      />
    </div>
  );
}
