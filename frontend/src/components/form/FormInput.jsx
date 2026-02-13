export default function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  size = "md",
  step,
}) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-sm",
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-text-primary">
        {label}
        {required && <span className="text-red-600 dark:text-red-400"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        step={step}
        className={`w-full border-2 border-border bg-surface text-text-primary placeholder:text-text-muted outline-none rounded-xl hover:border-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all ${sizeClasses[size]}`}
      />
    </div>
  );
}
