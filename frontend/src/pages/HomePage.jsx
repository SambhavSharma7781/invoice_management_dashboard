import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getCustomers } from "@/api/customers";
import { getInvoices } from "@/api/invoices";
import { InvoiceFilters } from "@/components/InvoiceFilters";
import { InvoiceFormModal } from "@/components/InvoiceFormModal";
import { InvoiceTable } from "@/components/InvoiceTable";
import { PaginationControls } from "@/components/PaginationControls";
import { Button } from "@/components/ui/Button";
import { getFriendlyApiErrorMessage } from "@/utils/apiErrors";

const PAGE_SIZE = 20;

const COMPLETE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isCompleteDate(value) {
  return COMPLETE_DATE_PATTERN.test(value);
}

const DEFAULT_FILTERS = {
  status: [],
  customerId: "",
  issueDateFrom: "",
  issueDateTo: "",
  dueDateFrom: "",
  dueDateTo: "",
  sortBy: "issueDate",
  sortOrder: "desc",
};

function filtersEqual(left, right) {
  return (
    left.sortBy === right.sortBy &&
    left.sortOrder === right.sortOrder &&
    left.customerId === right.customerId &&
    left.issueDateFrom === right.issueDateFrom &&
    left.issueDateTo === right.issueDateTo &&
    left.dueDateFrom === right.dueDateFrom &&
    left.dueDateTo === right.dueDateTo &&
    left.status.length === right.status.length &&
    left.status.every((status, index) => status === right.status[index])
  );
}

function isDefaultFilterState(filters, searchQuery, taxRateFilter, page) {
  return (
    page === 1 &&
    searchQuery === "" &&
    taxRateFilter === "" &&
    filtersEqual(filters, DEFAULT_FILTERS)
  );
}

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invoiceId: routeInvoiceId } = useParams();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [invoiceModal, setInvoiceModal] = useState({
    open: false,
    mode: "create",
    invoiceId: null,
    initialInvoice: null,
  });

  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
  });

  const [totalInvoices, setTotalInvoices] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [taxRateFilter, setTaxRateFilter] = useState("");

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    if (location.pathname === "/invoices/new") {
      setInvoiceModal({
        open: true,
        mode: "create",
        invoiceId: null,
        initialInvoice: null,
      });
      return;
    }

    if (routeInvoiceId && location.pathname.endsWith("/edit")) {
      const initialInvoice =
        invoices.find((invoice) => invoice.invoiceId === routeInvoiceId) ??
        null;

      setInvoiceModal({
        open: true,
        mode: "edit",
        invoiceId: routeInvoiceId,
        initialInvoice,
      });
    }
  }, [location.pathname, routeInvoiceId, invoices]);

  const closeInvoiceModal = () => {
    setInvoiceModal({
      open: false,
      mode: "create",
      invoiceId: null,
      initialInvoice: null,
    });

    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleInvoiceSaved = () => {
    setRefreshKey((current) => current + 1);
  };

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await getCustomers();
        setCustomers(response.data || []);
      } catch (err) {
        console.error("Failed to load customers:", err);
      }
    };

    loadCustomers();
  }, []);

  useEffect(() => {
    const loadTotalInvoices = async () => {
      try {
        const response = await getInvoices({ page: 1, limit: 1 });
        setTotalInvoices(response.meta?.total ?? 0);
      } catch (err) {
        console.error("Failed to load total invoice count:", err);
      }
    };

    loadTotalInvoices();
  }, [refreshKey]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const isInitialLoad = invoices.length === 0;

      if (isInitialLoad) {
        setLoading(true);
      }

      setError(null);

      try {
        const params = {
          page,
          limit: PAGE_SIZE,
          sortBy: filters.sortBy,
          order: filters.sortOrder,

          ...(filters.status.length > 0 && {
            status: filters.status.join(","),
          }),

          ...(filters.customerId && {
            customerId: filters.customerId,
          }),

          ...(filters.issueDateFrom &&
            isCompleteDate(filters.issueDateFrom) && {
            issueDateFrom: filters.issueDateFrom,
          }),

          ...(filters.issueDateTo &&
            isCompleteDate(filters.issueDateTo) && {
            issueDateTo: filters.issueDateTo,
          }),

          ...(filters.dueDateFrom &&
            isCompleteDate(filters.dueDateFrom) && {
            dueDateFrom: filters.dueDateFrom,
          }),

          ...(filters.dueDateTo &&
            isCompleteDate(filters.dueDateTo) && {
            dueDateTo: filters.dueDateTo,
          }),

          ...(searchQuery.trim() && {
            search: searchQuery.trim(),
          }),

          ...(taxRateFilter && {
            taxRate: taxRateFilter,
          }),
        };

        const response = await getInvoices(params);

        setInvoices(response.data || []);

        setMeta({
          total: response.meta?.total || 0,
          totalPages: response.meta?.totalPages || 1,
        });
      } catch (err) {
        console.error(err);
        setError(getFriendlyApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [page, filters, searchQuery, taxRateFilter, refreshKey]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSort = (sortBy, sortOrder) => {
    setFilters((previous) => ({
      ...previous,
      sortBy,
      sortOrder,
    }));
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleTaxRateFilterChange = (value) => {
    setTaxRateFilter(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    if (isDefaultFilterState(filters, searchQuery, taxRateFilter, page)) {
      return;
    }

    setSearchQuery("");
    setTaxRateFilter("");
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleRetry = () => {
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Invoice Management Dashboard
        </h1>
        {totalInvoices != null ? (
          <p className="mt-1 text-sm text-slate-500">
            {totalInvoices.toLocaleString("en-IN")} invoices total
          </p>
        ) : null}
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-col gap-4 border-b border-slate-100 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Invoices
          </h1>

          <div className="flex flex-wrap gap-2">
            <Link to="/summary">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-lg border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50"
              >
                Summary
              </Button>
            </Link>
            <Button
              type="button"
              onClick={() =>
                setInvoiceModal({
                  open: true,
                  mode: "create",
                  invoiceId: null,
                  initialInvoice: null,
                })
              }
              className="h-9 rounded-lg border border-blue-500 bg-white px-4 text-sm font-medium text-blue-600 shadow-none hover:bg-blue-50"
            >
              New invoice
            </Button>
          </div>
        </header>

        <InvoiceFilters
          filters={filters}
          setFilters={handleFiltersChange}
          customers={customers}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          taxRateFilter={taxRateFilter}
          onTaxRateFilterChange={handleTaxRateFilterChange}
          onReset={handleResetFilters}
        />

        <InvoiceTable
          invoices={invoices}
          loading={loading}
          error={error}
          onRetry={handleRetry}
          onEdit={(invoice) =>
            setInvoiceModal({
              open: true,
              mode: "edit",
              invoiceId: invoice.invoiceId,
              initialInvoice: invoice,
            })
          }
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={handleSort}
        />

        {!loading && !error && (
          <PaginationControls
            page={page}
            totalPages={meta.totalPages}
            totalItems={meta.total}
            pageSize={PAGE_SIZE}
            setPage={setPage}
          />
        )}
      </div>

      <InvoiceFormModal
        open={invoiceModal.open}
        mode={invoiceModal.mode}
        invoiceId={invoiceModal.invoiceId}
        initialInvoice={invoiceModal.initialInvoice}
        customers={customers}
        onClose={closeInvoiceModal}
        onSuccess={handleInvoiceSaved}
      />
    </div>
  );
}
