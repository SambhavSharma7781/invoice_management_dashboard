import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { CustomerMetrics, CustomerStatusCounts } from "@/types/api";
import { formatCurrency, getVisibleStatusCounts } from "@/utils/customer";
import { STATUS_CHART_COLORS, type InvoiceStatus } from "@/utils/invoice";

interface CustomerStatusMixChartProps {
  counts: CustomerStatusCounts | null;
  metrics: CustomerMetrics;
  loading?: boolean;
}

interface RevenueBreakdownProps {
  paidRevenue: number;
  pendingRevenue: number;
  totalRevenue: number;
}

function RevenueBreakdown({
  paidRevenue,
  pendingRevenue,
  totalRevenue,
}: RevenueBreakdownProps) {
  const voidDraftRevenue = Math.max(
    0,
    totalRevenue - paidRevenue - pendingRevenue
  );

  const items = [
    { label: "Paid", value: paidRevenue, barClassName: "bg-green-500" },
    { label: "Pending", value: pendingRevenue, barClassName: "bg-amber-500" },
    {
      label: "Void / Draft",
      value: voidDraftRevenue,
      barClassName: "bg-gray-400",
    },
  ];

  return (
    <div className="min-w-0 w-full flex-1">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">
        Revenue breakdown
      </h3>
      <div className="space-y-3">
        {items.filter((item) => item.value > 0).map((item) => {
          const widthPercent =
            totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0;

          return (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="shrink-0 tabular-nums text-slate-900">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${item.barClassName}`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface StatusSlice {
  status: InvoiceStatus;
  count: number;
}

export function CustomerStatusMixChart({
  counts,
  metrics,
  loading = false,
}: CustomerStatusMixChartProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 h-5 w-24 animate-pulse rounded bg-slate-100" />
        <div className="flex min-w-0 flex-col items-stretch gap-6 md:flex-row md:items-center md:gap-4">
          <div className="mx-auto aspect-square w-full max-w-[280px] shrink-0 animate-pulse rounded-full bg-slate-100 md:mx-0 md:h-[280px] md:w-[280px] md:max-w-none" />
          <div className="w-full space-y-2.5 md:w-auto md:shrink-0">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-4 w-full max-w-xs animate-pulse rounded bg-slate-100 md:w-32"
              />
            ))}
          </div>
          <div className="hidden w-px self-stretch bg-slate-200 md:block" />
          <div className="min-w-0 w-full flex-1 space-y-3">
            <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-1.5">
                <div className="h-4 animate-pulse rounded bg-slate-100" />
                <div className="h-2 animate-pulse rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!counts) {
    return null;
  }

  const slices: StatusSlice[] = getVisibleStatusCounts(counts);

  if (slices.length === 0) {
    return null;
  }

  const totalInvoices = slices.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Status mix</h2>

      <div className="flex min-w-0 flex-col items-stretch gap-6 md:flex-row md:items-center md:gap-4">
        <div className="relative mx-auto aspect-square w-full max-w-[280px] shrink-0 overflow-visible md:mx-0 md:h-[280px] md:w-[280px] md:max-w-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={slices}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                stroke="none"
                paddingAngle={slices.length > 1 ? 2 : 0}
              >
                {slices.map((slice) => (
                  <Cell
                    key={slice.status}
                    fill={STATUS_CHART_COLORS[slice.status]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums text-slate-900">
              {totalInvoices}
            </span>
            <span className="text-xs text-slate-500">invoices</span>
          </div>
        </div>

        <ul className="flex w-full flex-col justify-center gap-2 md:w-auto md:shrink-0">
          {slices.map((slice) => (
            <li
              key={slice.status}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_CHART_COLORS[slice.status] }}
                aria-hidden="true"
              />
              <span className="font-medium text-slate-900">{slice.status}</span>
              <span className="tabular-nums text-slate-600">{slice.count}</span>
            </li>
          ))}
        </ul>

        <div
          className="hidden w-px self-stretch bg-slate-200 md:block"
          aria-hidden="true"
        />

        <RevenueBreakdown
          paidRevenue={metrics.paidRevenue}
          pendingRevenue={metrics.pendingRevenue}
          totalRevenue={metrics.totalRevenue}
        />
      </div>
    </div>
  );
}
