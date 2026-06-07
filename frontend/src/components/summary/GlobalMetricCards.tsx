import { useEffect, useState } from "react";
import { FileText, IndianRupee, TrendingUp, Users } from "lucide-react";
import { getCustomers } from "@/api/customers";
import { fetchAllInvoices, getInvoices } from "@/api/invoices";
import { MetricCard } from "@/components/summary/MetricCard";
import { cn } from "@/utils/cn";
import { formatCurrency, getApiErrorMessage } from "@/utils/customer";
import {
  computeGlobalTotalBilled,
  computeGlobalTotalTax,
  formatNumber,
} from "@/utils/summary";

interface GlobalMetricCardsProps {
  refreshKey?: number;
  className?: string;
  showErrorBanner?: boolean;
  onCountsError?: (error: string | null) => void;
}

export function GlobalMetricCards({
  refreshKey = 0,
  className,
  showErrorBanner = false,
  onCountsError,
}: GlobalMetricCardsProps) {
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [totalBilled, setTotalBilled] = useState<number | null>(null);
  const [totalTax, setTotalTax] = useState<number | null>(null);

  const [countsLoading, setCountsLoading] = useState(true);
  const [totalsLoading, setTotalsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      setCountsLoading(true);

      try {
        const [invoicesResponse, customersResponse] = await Promise.all([
          getInvoices({ page: 1, limit: 1 }),
          getCustomers(),
        ]);

        if (!cancelled) {
          setInvoiceCount(invoicesResponse.meta.total);
          setCustomerCount(customersResponse.data.length);
          setError(null);
          onCountsError?.(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message = getApiErrorMessage(err);
          setError(message);
          onCountsError?.(message);
        }
      } finally {
        if (!cancelled) {
          setCountsLoading(false);
        }
      }
    };

    void loadCounts();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    let cancelled = false;

    const loadTotals = async () => {
      setTotalsLoading(true);

      try {
        const invoices = await fetchAllInvoices();

        if (!cancelled) {
          setTotalBilled(computeGlobalTotalBilled(invoices));
          setTotalTax(computeGlobalTotalTax(invoices));
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setTotalsLoading(false);
        }
      }
    };

    void loadTotals();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const metricsLoading = countsLoading || totalsLoading;

  return (
    <>
      <section
        className={cn(
          "grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4",
          className
        )}
      >
        <MetricCard
          label="Total billed"
          value={totalBilled == null ? "—" : formatCurrency(totalBilled)}
          loading={metricsLoading}
          icon={IndianRupee}
          iconColor="blue"
        />
        <MetricCard
          label="Total tax"
          value={totalTax == null ? "—" : formatCurrency(totalTax)}
          loading={metricsLoading}
          icon={TrendingUp}
          iconColor="green"
        />
        <MetricCard
          label="Total invoices"
          value={invoiceCount == null ? "—" : formatNumber(invoiceCount)}
          loading={countsLoading}
          icon={FileText}
          iconColor="red"
        />
        <MetricCard
          label="Total customers"
          value={customerCount == null ? "—" : formatNumber(customerCount)}
          loading={countsLoading}
          icon={Users}
          iconColor="purple"
        />
      </section>

      {showErrorBanner && error ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Some summary metrics could not be loaded: {error}
        </p>
      ) : null}
    </>
  );
}
