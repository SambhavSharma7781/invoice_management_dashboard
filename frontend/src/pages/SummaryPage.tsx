import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomers } from "@/api/customers";
import { fetchAllInvoices, getInvoices } from "@/api/invoices";
import { getTopCustomers } from "@/api/summary";
import { MetricCard } from "@/components/summary/MetricCard";
import { TopCustomersChart } from "@/components/summary/TopCustomersChart";
import { Button } from "@/components/ui/Button";
import type { TopCustomerSummary } from "@/types/api";
import { formatCurrency, getApiErrorMessage } from "@/utils/customer";
import {
  computeGlobalTotalBilled,
  computeGlobalTotalTax,
  formatNumber,
} from "@/utils/summary";

export default function SummaryPage() {
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [totalBilled, setTotalBilled] = useState<number | null>(null);
  const [totalTax, setTotalTax] = useState<number | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomerSummary[]>([]);

  const [countsLoading, setCountsLoading] = useState(true);
  const [totalsLoading, setTotalsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  const [pageError, setPageError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      setCountsLoading(true);
      setPageError(null);

      try {
        const [invoicesResponse, customersResponse] = await Promise.all([
          getInvoices({ page: 1, limit: 1 }),
          getCustomers(),
        ]);

        if (!cancelled) {
          setInvoiceCount(invoicesResponse.meta.total);
          setCustomerCount(customersResponse.data.length);
        }
      } catch (err) {
        if (!cancelled) {
          setPageError(getApiErrorMessage(err));
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
  }, []);

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
          setPageError(getApiErrorMessage(err));
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTopCustomers = async () => {
      setChartLoading(true);
      setChartError(null);

      try {
        const response = await getTopCustomers();

        if (!cancelled) {
          setTopCustomers(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setChartError(getApiErrorMessage(err));
          setTopCustomers([]);
        }
      } finally {
        if (!cancelled) {
          setChartLoading(false);
        }
      }
    };

    void loadTopCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  const metricsLoading = countsLoading || totalsLoading;

  if (pageError && invoiceCount == null && customerCount == null) {
    return (
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Summary / Analytics
          </h1>
          <Link to="/">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </header>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-600">
          {pageError}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Summary / Analytics
        </h1>
        <Link to="/">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total billed"
          value={totalBilled == null ? "—" : formatCurrency(totalBilled)}
          loading={metricsLoading}
        />
        <MetricCard
          label="Total tax"
          value={totalTax == null ? "—" : formatCurrency(totalTax)}
          loading={metricsLoading}
        />
        <MetricCard
          label="# Invoices"
          value={
            invoiceCount == null ? "—" : formatNumber(invoiceCount)
          }
          loading={countsLoading}
        />
        <MetricCard
          label="# Customers"
          value={
            customerCount == null ? "—" : formatNumber(customerCount)
          }
          loading={countsLoading}
        />
      </section>

      {pageError ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Some summary metrics could not be loaded: {pageError}
        </p>
      ) : null}

      <section>
        <TopCustomersChart
          customers={topCustomers}
          loading={chartLoading}
          error={chartError}
        />
      </section>
    </div>
  );
}
