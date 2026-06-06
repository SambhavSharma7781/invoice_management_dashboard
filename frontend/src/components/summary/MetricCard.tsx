interface MetricCardProps {
  label: string;
  value: string;
  loading?: boolean;
}

export function MetricCard({ label, value, loading = false }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-28 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
      )}
    </div>
  );
}
