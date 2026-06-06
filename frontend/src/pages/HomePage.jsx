import { useEffect, useState } from "react";
import { getCustomers } from "@/api/customers";
import { getInvoices } from "@/api/invoices";
import { InvoiceFilters } from "@/components/InvoiceFilters";
import { InvoiceTable } from "@/components/InvoiceTable";
import { PaginationControls } from "@/components/PaginationControls";

export default function HomePage() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);

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
  }, [page, filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Invoice Management Dashboard
        </h1>

        <p className="text-sm text-slate-500">
          {meta.total} invoices total
        </p>
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