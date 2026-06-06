import type { CustomerStatusChip, CustomerStatusCounts, Invoice } from "@/types/api";

const STATUS_CHIPS: CustomerStatusChip[] = [
  "Paid",
  "Unpaid",
  "Overdue",
  "Draft",
];

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

export const computeStatusCounts = (
  invoices: Invoice[]
): CustomerStatusCounts => {
  const counts: CustomerStatusCounts = {
    Paid: 0,
    Unpaid: 0,
    Overdue: 0,
    Draft: 0,
  };

  invoices.forEach((invoice) => {
    if (invoice.status in counts) {
      counts[invoice.status as CustomerStatusChip] += 1;
    }
  });

  return counts;
};

export const computeTotalTax = (invoices: Invoice[]): number =>
  invoices.reduce((sum, invoice) => sum + Number(invoice.tax || 0), 0);

export const CUSTOMER_STATUS_CHIPS = STATUS_CHIPS;

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
