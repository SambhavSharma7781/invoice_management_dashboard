import { AlertCircle, FileText, IndianRupee, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/summary/MetricCard";
import { formatCurrency } from "@/utils/customer";

interface CustomerSummaryCardsProps {
  totalBilled: number;
  totalTax: number | null;
  outstanding: number;
  invoiceCount: number;
  taxLoading?: boolean;
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
      <MetricCard
        label="Total billed"
        value={formatCurrency(totalBilled)}
        icon={IndianRupee}
        iconColor="blue"
      />
      <MetricCard
        label="Total tax"
        value={totalTax == null ? "—" : formatCurrency(totalTax)}
        loading={taxLoading}
        icon={TrendingUp}
        iconColor="green"
      />
      <MetricCard
        label="Outstanding"
        value={formatCurrency(outstanding)}
        icon={AlertCircle}
        iconColor="red"
      />
      <MetricCard
        label="Invoices"
        value={String(invoiceCount)}
        icon={FileText}
        iconColor="purple"
      />
    </div>
  );
}
