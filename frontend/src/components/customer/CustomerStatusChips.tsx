import type { CustomerStatusChip, CustomerStatusCounts } from "@/types/api";
import { CUSTOMER_STATUS_CHIPS } from "@/utils/customer";

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
        {CUSTOMER_STATUS_CHIPS.map((status) => (
          <div
            key={status}
            className="h-9 w-28 animate-pulse rounded-full bg-slate-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {CUSTOMER_STATUS_CHIPS.map((status: CustomerStatusChip) => (
        <div
          key={status}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700"
        >
          <span className="font-medium text-slate-900">{status}</span>
          <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
            {counts?.[status] ?? 0}
          </span>
        </div>
      ))}
    </div>
  );
}
