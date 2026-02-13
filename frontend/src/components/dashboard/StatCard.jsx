import { TrendUp, TrendDown } from "@phosphor-icons/react";

export default function StatCard({
  number,
  label,
  icon,
  trend,
  trendValue,
  color = "blue",
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };

  const bgGradient = colorClasses[color] || colorClasses.blue;

  return (
    <div className="group relative bg-surface rounded-2xl border border-border p-5 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Decorative gradient blob */}
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 bg-linear-to-br ${bgGradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          {icon && (
            <div
              className={`w-12 h-12 bg-linear-to-br ${bgGradient} rounded-xl flex items-center justify-center shadow-lg shadow-black/10`}
            >
              {icon}
            </div>
          )}
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                trend === "up"
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              }`}
            >
              {trend === "up" ? (
                <TrendUp size={14} weight="bold" />
              ) : (
                <TrendDown size={14} weight="bold" />
              )}
              {trendValue}
            </div>
          )}
        </div>

        <div className="text-3xl font-bold text-text-primary mb-1 tracking-tight">
          {number}
        </div>
        <div className="text-sm font-medium text-text-tertiary">{label}</div>
      </div>
    </div>
  );
}
