import { Badge } from "@/components/ui/Badge";
import type { CustomerStatusCounts } from "@/types/api";
import { getVisibleStatusCounts } from "@/utils/customer";
import { getStatusBadgeClassName } from "@/utils/invoice";

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
        <Badge
          key={status}
          className={`rounded-full px-4 py-2 text-sm ${getStatusBadgeClassName(status)}`}
        >
          <span className="font-medium">{status}</span>
          <span className="ml-1.5 font-semibold">{count}</span>
        </Badge>
      ))}
    </div>
  );
}
