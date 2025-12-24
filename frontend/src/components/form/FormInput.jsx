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
      <label className="block text-sm font-bold">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border-2 border-gray-800 px-3 py-2 text-sm outline-none hover:border-black focus:border-black focus:ring-0 transition"
      />
    </div>
  );
}
