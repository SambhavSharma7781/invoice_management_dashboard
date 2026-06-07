import type { CustomerStatusCounts, Invoice, InvoiceStatus } from "@/types/api";
import { INVOICE_STATUS_OPTIONS } from "@/utils/invoice";

export const customerNameToSlug = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, "-");

export const getCustomerInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const formatCurrency = (value: number): string =>
  `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const createEmptyStatusCounts = (): CustomerStatusCounts =>
  Object.fromEntries(
    INVOICE_STATUS_OPTIONS.map((status) => [status, 0])
  ) as CustomerStatusCounts;

export const computeStatusCounts = (
  invoices: Invoice[]
): CustomerStatusCounts => {
  const counts = createEmptyStatusCounts();

  invoices.forEach((invoice) => {
    if (invoice.status in counts) {
      counts[invoice.status] += 1;
    }
  });

  return counts;
};

export const getVisibleStatusCounts = (
  counts: CustomerStatusCounts
): Array<{ status: InvoiceStatus; count: number }> =>
  INVOICE_STATUS_OPTIONS.filter((status) => counts[status] > 0).map(
    (status) => ({
      status,
      count: counts[status],
    })
  );

export const computeTotalTax = (invoices: Invoice[]): number =>
  invoices.reduce((sum, invoice) => sum + Number(invoice.tax || 0), 0);

export const getApiErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "error" in error.response.data &&
    typeof error.response.data.error === "object" &&
    error.response.data.error !== null &&
    "message" in error.response.data.error &&
    typeof error.response.data.error.message === "string"
  ) {
    return error.response.data.error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};
