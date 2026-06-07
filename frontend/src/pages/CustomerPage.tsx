import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchAllCustomerInvoices,
  getCustomerBySlug,
} from "@/api/customers";
import { CustomerInvoiceHistory } from "@/components/customer/CustomerInvoiceHistory";
import { CustomerStatusChips } from "@/components/customer/CustomerStatusChips";
import { CustomerStatusMixChart } from "@/components/customer/CustomerStatusMixChart";
import { CustomerSummaryCards } from "@/components/customer/CustomerSummaryCards";
import { PaginationControls } from "@/components/PaginationControls";
import { Button } from "@/components/ui/Button";
import type { CustomerDetail, CustomerStatusCounts } from "@/types/api";
import {
  computeStatusCounts,
  computeTotalTax,
  createEmptyStatusCounts,
  getApiErrorMessage,
  getCustomerInitials,
} from "@/utils/customer";

const PAGE_LIMIT = 10;

export default function CustomerPage() {
  const { slug } = useParams();
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [statusCounts, setStatusCounts] = useState<CustomerStatusCounts | null>(
    null
  );
  const [totalTax, setTotalTax] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedDetailRef = useRef(false);

  useEffect(() => {
    setPage(1);
    hasLoadedDetailRef.current = false;
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setError("Customer slug is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadCustomerPage = async () => {
      if (hasLoadedDetailRef.current) {
        setIsFetching(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await getCustomerBySlug(slug, {
          page,
          limit: PAGE_LIMIT,
        });

        if (!cancelled) {
          setDetail(response.data);
          hasLoadedDetailRef.current = true;
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
          setDetail(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsFetching(false);
        }
      }
    };

    void loadCustomerPage();

    return () => {
      cancelled = true;
    };
  }, [slug, page]);

  useEffect(() => {
    if (!slug) {
      setStatsLoading(false);
      return;
    }

    let cancelled = false;

    const loadCustomerStats = async () => {
      setStatsLoading(true);
      setStatusCounts(null);
      setTotalTax(null);

      try {
        const invoices = await fetchAllCustomerInvoices(slug);

        if (!cancelled) {
          setStatusCounts(computeStatusCounts(invoices));
          setTotalTax(computeTotalTax(invoices));
        }
      } catch {
        if (!cancelled) {
          setStatusCounts(createEmptyStatusCounts());
          setTotalTax(0);
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    };

    void loadCustomerStats();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) {
    return (
      <div className="container mx-auto min-w-0 max-w-7xl p-4 md:p-8">
        <p className="text-sm text-red-600">Customer slug is missing.</p>
      </div>
    );
  }

  if (loading && !detail) {
    return (
      <div className="container mx-auto min-w-0 max-w-7xl p-4 md:p-8">
        <div className="mb-6 h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mb-8 flex items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="container mx-auto min-w-0 max-w-7xl p-4 md:p-8">
        <nav className="mb-6 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900">
            Invoices
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">Customer</span>
        </nav>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-600">
          {error}
        </div>
        <div className="mt-4">
          <Link to="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  const { customer, metrics, invoices } = detail;
  const initials = getCustomerInitials(customer.name);

  return (
    <div className="container mx-auto min-w-0 max-w-7xl p-4 md:p-8">
      <nav className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-900">
            Invoices
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">Customer</span>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </nav>

      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900">
            {customer.name}
          </h1>
          <p className="mt-1 break-words text-sm text-slate-500">{customer.company}</p>
        </div>
      </header>

      <section className="mb-6">
        <CustomerSummaryCards
          totalBilled={metrics.totalRevenue}
          totalTax={totalTax}
          outstanding={metrics.pendingRevenue}
          invoiceCount={metrics.totalInvoices}
          taxLoading={statsLoading}
        />
      </section>

      <section className="mb-8">
        <CustomerStatusChips counts={statusCounts} loading={statsLoading} />
      </section>

      <section className="mb-8">
        <CustomerStatusMixChart
          counts={statusCounts}
          metrics={metrics}
          loading={statsLoading}
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Invoice history
        </h2>

        <CustomerInvoiceHistory
          invoices={invoices.data}
          loading={loading}
          fetching={isFetching}
          error={error}
        />

        {!error && (
          <PaginationControls
            page={page}
            totalPages={invoices.meta.totalPages}
            totalItems={invoices.meta.total}
            pageSize={invoices.meta.limit ?? PAGE_LIMIT}
            setPage={setPage}
          />
        )}
      </section>
    </div>
  );
}
