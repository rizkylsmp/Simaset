export default function StatCard({ number, label }) {
  return (
    <div className="border-2 border-black bg-white p-6">
      <div className="text-4xl font-bold text-center mb-4 text-black">
        {number}
      </div>
      <div className="text-center text-sm font-medium text-black border-t-2 border-black pt-4">
        {label}
      </div>
    </div>
  );
}
