export default function ChartPlaceholder({ title, type }) {
  return (
    <div className="border-2 border-black bg-white">
      <div className="bg-gray-800 text-white text-sm font-bold px-4 py-3">
        {title}
      </div>
      <div className="h-64 flex items-center justify-center">
        <span className="text-gray-400 text-sm">
          [{type.toUpperCase()} CHART AREA]
        </span>
      </div>
    </div>
  );
}
