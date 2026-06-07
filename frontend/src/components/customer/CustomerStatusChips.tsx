import type { CustomerStatusCounts } from "@/types/api";
import { getVisibleStatusCounts } from "@/utils/customer";

interface CustomerStatusChipsProps {
  counts: CustomerStatusCounts | null;
  loading?: boolean;
}

export function CustomerStatusChips({
  counts,
  loading = false,
}: CustomerStatusChipsProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-9 w-28 animate-pulse rounded-full bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (!counts) {
    return null;
  }

  const visibleStatuses = getVisibleStatusCounts(counts);

  if (visibleStatuses.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {visibleStatuses.map(({ status, count }) => (
        <div
          key={status}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700"
        >
          <span className="font-medium text-slate-900">{status}</span>
          <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}
