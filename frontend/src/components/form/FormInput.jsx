export default function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-text-primary">
        {label}
        {required && <span className="text-red-600 dark:text-red-400"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border-2 border-border bg-surface text-text-primary placeholder:text-text-muted px-3 py-2 text-sm outline-none rounded-lg hover:border-text-tertiary focus:border-accent focus:ring-0 transition"
      />
    </div>
  );
}
