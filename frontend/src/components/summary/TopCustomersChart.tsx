import { Link } from "react-router-dom";
import type { TopCustomerSummary } from "@/types/api";
import { formatCurrency } from "@/utils/customer";

interface TopCustomersChartProps {
  customers: TopCustomerSummary[];
  loading?: boolean;
  error?: string | null;
}

function ChartRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="h-4 w-32 shrink-0 animate-pulse rounded bg-slate-100" />
      <div className="h-2.5 min-w-0 flex-1 animate-pulse rounded-full bg-slate-100" />
      <div className="h-4 w-20 shrink-0 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export function TopCustomersChart({
  customers,
  loading = false,
  error = null,
}: TopCustomersChartProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 h-5 w-48 animate-pulse rounded bg-slate-100" />
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <ChartRowSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  if (!customers.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        No customer billing data available yet.
      </div>
    );
  }

  const maxRevenue = customers[0]?.totalRevenue ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Top customers by value
      </h2>

      <div className="divide-y divide-slate-100">
        {customers.map((entry) => {
          const widthPercent =
            maxRevenue > 0
              ? Math.max((entry.totalRevenue / maxRevenue) * 100, 4)
              : 0;

          return (
            <div
              key={entry.customer._id}
              className="flex items-center gap-4 py-3"
            >
              <Link
                to={`/customers/${entry.customer._id}`}
                className="w-36 shrink-0 truncate text-sm font-medium text-slate-900 hover:text-blue-600 sm:w-44"
              >
                {entry.customer.name}
              </Link>

              <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-300"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>

              <span className="w-24 shrink-0 text-right text-sm font-semibold text-slate-900 sm:w-28">
                {formatCurrency(entry.totalRevenue)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
