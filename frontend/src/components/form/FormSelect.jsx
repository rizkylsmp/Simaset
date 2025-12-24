export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  placeholder = "Pilih...",
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border-2 border-gray-800 px-3 py-2 text-sm outline-none hover:border-black focus:border-black focus:ring-0 cursor-pointer transition"
      >
        <option value="">[Select] {placeholder} ▼</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
