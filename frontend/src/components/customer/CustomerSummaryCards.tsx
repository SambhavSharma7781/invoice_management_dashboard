import { formatCurrency } from "@/utils/customer";

interface CustomerSummaryCardsProps {
  totalBilled: number;
  totalTax: number | null;
  outstanding: number;
  invoiceCount: number;
  taxLoading?: boolean;
}

interface SummaryCardProps {
  label: string;
  value: string;
  loading?: boolean;
}

function SummaryCard({ label, value, loading = false }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
      <p className="text-sm text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-28 animate-pulse rounded bg-slate-200" />
      ) : (
        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
      )}
    </div>
  );
}

export function CustomerSummaryCards({
  totalBilled,
  totalTax,
  outstanding,
  invoiceCount,
  taxLoading = false,
}: CustomerSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Total billed" value={formatCurrency(totalBilled)} />
      <SummaryCard
        label="Total tax"
        value={totalTax == null ? "—" : formatCurrency(totalTax)}
        loading={taxLoading}
      />
      <SummaryCard label="Outstanding" value={formatCurrency(outstanding)} />
      <SummaryCard
        label="# Invoices"
        value={String(invoiceCount)}
      />
    </div>
  );
}
