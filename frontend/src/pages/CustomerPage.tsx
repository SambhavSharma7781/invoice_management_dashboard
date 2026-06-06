import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchAllCustomerInvoices,
  getCustomerById,
} from "@/api/customers";
import { CustomerInvoiceHistory } from "@/components/customer/CustomerInvoiceHistory";
import { CustomerStatusChips } from "@/components/customer/CustomerStatusChips";
import { CustomerSummaryCards } from "@/components/customer/CustomerSummaryCards";
import { PaginationControls } from "@/components/PaginationControls";
import { Button } from "@/components/ui/Button";
import type { CustomerDetail, CustomerStatusCounts } from "@/types/api";
import {
  computeStatusCounts,
  computeTotalTax,
  getApiErrorMessage,
  getCustomerInitials,
} from "@/utils/customer";

const PAGE_LIMIT = 10;

export default function CustomerPage() {
  const { customerId } = useParams();
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [statusCounts, setStatusCounts] = useState<CustomerStatusCounts | null>(
    null
  );
  const [totalTax, setTotalTax] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [customerId]);

  useEffect(() => {
    if (!customerId) {
      setError("Customer ID is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadCustomerPage = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCustomerById(customerId, {
          page,
          limit: PAGE_LIMIT,
        });

        if (!cancelled) {
          setDetail(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
          setDetail(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCustomerPage();

    return () => {
      cancelled = true;
    };
  }, [customerId, page]);

  useEffect(() => {
    if (!customerId) {
      setStatsLoading(false);
      return;
    }

    let cancelled = false;

    const loadCustomerStats = async () => {
      setStatsLoading(true);
      setStatusCounts(null);
      setTotalTax(null);

      try {
        const invoices = await fetchAllCustomerInvoices(customerId);

        if (!cancelled) {
          setStatusCounts(computeStatusCounts(invoices));
          setTotalTax(computeTotalTax(invoices));
        }
      } catch {
        if (!cancelled) {
          setStatusCounts({
            Paid: 0,
            Unpaid: 0,
            Overdue: 0,
            Draft: 0,
          });
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
  }, [customerId]);

  if (!customerId) {
    return (
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <p className="text-sm text-red-600">Customer ID is missing.</p>
      </div>
    );
  }

  if (loading && !detail) {
    return (
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-6 h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mb-8 flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200" />
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
      <div className="container mx-auto max-w-7xl p-4 md:p-8">
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
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
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

      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {customer.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{customer.company}</p>
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

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Invoice history
        </h2>

        <CustomerInvoiceHistory
          invoices={invoices.data}
          loading={loading}
          error={error}
        />

        {!loading && !error && invoices.meta.totalPages > 0 && (
          <PaginationControls
            page={page}
            totalPages={invoices.meta.totalPages}
            totalItems={invoices.meta.total}
            setPage={setPage}
          />
        )}
      </section>
    </div>
  );
}
