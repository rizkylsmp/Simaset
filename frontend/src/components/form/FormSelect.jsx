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
      <label className="block text-sm font-bold text-text-primary">
        {label}
        {required && <span className="text-red-600 dark:text-red-400"> *</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border-2 border-border bg-surface text-text-primary px-3 py-2 text-sm outline-none rounded-lg hover:border-text-tertiary focus:border-accent focus:ring-0 cursor-pointer transition"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
