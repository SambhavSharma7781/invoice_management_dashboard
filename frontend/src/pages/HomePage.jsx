import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getCustomers } from "@/api/customers";
import { getInvoices } from "@/api/invoices";
import { InvoiceFilters } from "@/components/InvoiceFilters";
import { InvoiceFormModal } from "@/components/InvoiceFormModal";
import { InvoiceTable } from "@/components/InvoiceTable";
import { PaginationControls } from "@/components/PaginationControls";
import { Button } from "@/components/ui/Button";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    status: [],
    customerId: "",
    issueDateFrom: "",
    issueDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
    sortBy: "issueDate",
    sortOrder: "desc",
  });

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

  // Load customers once
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

  // Load invoices whenever page or filters change
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page,
          limit: 10,
          sortBy: filters.sortBy,
          order: filters.sortOrder,

          ...(filters.status.length > 0 && {
            status: filters.status.join(","),
          }),

          ...(filters.customerId && {
            customerId: filters.customerId,
          }),

          ...(filters.issueDateFrom && {
            issueDateFrom: filters.issueDateFrom,
          }),

          ...(filters.issueDateTo && {
            issueDateTo: filters.issueDateTo,
          }),

          ...(filters.dueDateFrom && {
            dueDateFrom: filters.dueDateFrom,
          }),

          ...(filters.dueDateTo && {
            dueDateTo: filters.dueDateTo,
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
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [page, filters, refreshKey]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Invoice Management Dashboard
          </h1>

          <p className="text-sm text-slate-500">
            {meta.total} invoices total
          </p>
        </div>

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
        >
          Create Invoice
        </Button>
      </header>

      <InvoiceFilters
        filters={filters}
        setFilters={handleFiltersChange}
        customers={customers}
      />

      <InvoiceTable
        invoices={invoices}
        loading={loading}
        error={error}
        onEdit={(invoice) =>
          setInvoiceModal({
            open: true,
            mode: "edit",
            invoiceId: invoice.invoiceId,
            initialInvoice: invoice,
          })
        }
      />

      <InvoiceFormModal
        open={invoiceModal.open}
        mode={invoiceModal.mode}
        invoiceId={invoiceModal.invoiceId}
        initialInvoice={invoiceModal.initialInvoice}
        customers={customers}
        onClose={closeInvoiceModal}
        onSuccess={handleInvoiceSaved}
      />

      {!loading && !error && (
        <PaginationControls
          page={page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          setPage={setPage}
        />
      )}
    </div>
  );
}