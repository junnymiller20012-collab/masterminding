interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ label, value, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {trend && (
        <p
          className={[
            "text-xs mt-1 font-medium",
            trendUp ? "text-emerald-600" : "text-slate-400",
          ].join(" ")}
        >
          {trend}
        </p>
      )}
    </div>
  );
}
