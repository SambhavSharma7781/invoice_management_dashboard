import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { getCustomers } from "@/api/customers";
import { getInvoices } from "@/api/invoices";
import type { TopCustomerSummary } from "@/types/api";
import { formatCurrency, customerNameToSlug } from "@/utils/customer";
import { formatNumber } from "@/utils/summary";

interface TopCustomersChartProps {
  customers: TopCustomerSummary[];
  loading?: boolean;
  error?: string | null;
}

/** Rank order: #1 blue, #2 green, #3 amber, #4 red, #5 purple */
const REVENUE_CHART_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
] as const;

function formatDonutCenterAmount(value: number): string {
  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(2)}Cr`;
  }
  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(2)}L`;
  }
  if (value >= 1_000) {
    return `₹${(value / 1_000).toFixed(1)}K`;
  }
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

const RANK_BADGE_CLASSES = [
  "bg-amber-100 text-amber-700",
  "bg-slate-100 text-slate-600",
  "bg-orange-100 text-orange-700",
  "bg-gray-100 text-gray-500",
  "bg-gray-100 text-gray-500",
] as const;

function ChartRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-slate-100" />
      <div className="h-8 w-32 shrink-0 animate-pulse rounded bg-slate-100" />
      <div className="h-3 min-w-0 flex-1 animate-pulse rounded-full bg-gray-100" />
      <div className="h-4 w-20 shrink-0 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export function TopCustomersChart({
  customers,
  loading = false,
  error = null,
}: TopCustomersChartProps) {
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadFooterCounts = async () => {
      try {
        const [invoicesResponse, customersResponse] = await Promise.all([
          getInvoices({ page: 1, limit: 1 }),
          getCustomers(),
        ]);

        if (!cancelled) {
          setInvoiceCount(invoicesResponse.meta.total);
          setCustomerCount(customersResponse.data.length);
        }
      } catch {
        if (!cancelled) {
          setInvoiceCount(null);
          setCustomerCount(null);
        }
      }
    };

    void loadFooterCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="min-w-0 md:w-[60%]">
            <div className="mb-4 h-6 w-56 animate-pulse rounded bg-slate-100" />
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, index) => (
                <ChartRowSkeleton key={index} />
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-col items-center border-gray-200 md:w-[40%] md:border-l md:pl-6">
            <div className="mb-4 h-5 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-48 w-48 animate-pulse rounded-full bg-slate-100" />
          </div>
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

  const topFive = customers.slice(0, 5);
  const maxRevenue = topFive[0]?.totalRevenue ?? 0;
  const totalRevenue = topFive.reduce(
    (sum, entry) => sum + entry.totalRevenue,
    0
  );
  const chartData = topFive.map((entry, index) => ({
    id: entry.customer._id,
    name: entry.customer.name,
    value: Number(entry.totalRevenue),
    fill: REVENUE_CHART_COLORS[index],
  }));

  const footerText =
    invoiceCount != null && customerCount != null
      ? `Based on ${formatNumber(invoiceCount)} invoices · ${formatNumber(customerCount)} customers · Void & Draft excluded`
      : "Void & Draft excluded";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="min-w-0 md:w-[60%]">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Trophy
              className="h-5 w-5 shrink-0 text-amber-500"
              aria-hidden="true"
            />
            Top 5 Customers by Revenue
          </h2>

          <div>
            {topFive.map((entry, index) => {
              const widthPercent =
                maxRevenue > 0
                  ? Math.max((entry.totalRevenue / maxRevenue) * 100, 4)
                  : 0;
              const barColor = REVENUE_CHART_COLORS[index];
              const rankBadgeClass =
                RANK_BADGE_CLASSES[index] ??
                RANK_BADGE_CLASSES[RANK_BADGE_CLASSES.length - 1];

              return (
                <div
                  key={entry.customer._id}
                  className="flex items-center gap-3 border-b border-gray-100 py-3 transition-colors last:border-b-0 hover:rounded-lg hover:bg-slate-50"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${rankBadgeClass}`}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0 w-28 shrink-0 sm:w-36">
                    <Link
                      to={`/customers/${customerNameToSlug(entry.customer.name)}`}
                      className="block truncate text-sm font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {entry.customer.name}
                    </Link>
                    <p className="truncate text-xs text-gray-400">
                      {entry.customer.company}
                    </p>
                  </div>

                  <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>

                  <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-gray-800 sm:w-28">
                    {formatCurrency(entry.totalRevenue)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-center border-gray-200 md:w-[40%] md:border-l md:pl-6">
          <h3 className="mb-4 w-full text-center font-semibold text-gray-700 md:text-left">
            Revenue share
          </h3>

          <div className="relative mx-auto aspect-square w-full max-w-[220px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  stroke="none"
                  paddingAngle={topFive.length > 1 ? 2 : 0}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
              <span className="max-w-[72%] text-sm font-bold tabular-nums leading-tight text-gray-900">
                {formatDonutCenterAmount(totalRevenue)}
              </span>
              <span className="text-xs text-gray-400">total</span>
            </div>
          </div>

          <ul className="mt-4 w-full max-w-xs space-y-2">
            {topFive.map((entry, index) => (
              <li
                key={entry.customer._id}
                className="flex items-center gap-2"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor: REVENUE_CHART_COLORS[index],
                  }}
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate text-sm text-gray-600">
                  {entry.customer.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
        {footerText}
      </p>
    </div>
  );
}
