import type { InvoiceFormValues, InvoicePayload, TaxRate } from "@/types/api";

export const TAX_RATE_OPTIONS: TaxRate[] = [0, 3, 5, 18, 28];

export const INVOICE_STATUS_OPTIONS = [
  "Draft",
  "Sent",
  "Unpaid",
  "Overdue",
  "Paid",
  "Void",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUS_OPTIONS)[number];

const STATUS_BADGE_CLASS_NAMES: Record<InvoiceStatus, string> = {
  Paid: "border-transparent bg-green-100 text-green-700",
  Overdue:
    "border-transparent bg-red-100 text-red-800 font-bold ring-1 ring-red-200",
  Unpaid: "border-transparent bg-amber-100 text-amber-700",
  Sent: "border-transparent bg-blue-100 text-blue-700",
  Draft: "border-transparent bg-purple-100 text-purple-700",
  Void: "border-transparent bg-gray-100 text-gray-700",
};

export const getStatusBadgeClassName = (status: string): string =>
  STATUS_BADGE_CLASS_NAMES[status as InvoiceStatus] ??
  "border-transparent bg-slate-100 text-slate-700";

export const STATUS_CHART_COLORS: Record<InvoiceStatus, string> = {
  Paid: "#16a34a",
  Overdue: "#dc2626",
  Unpaid: "#d97706",
  Sent: "#2563eb",
  Draft: "#7c3aed",
  Void: "#6b7280",
};

export const roundCurrency = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const calculateTaxAndTotal = (
  amount: number,
  taxRate: TaxRate
): { tax: number; total: number } => {
  const tax = roundCurrency((amount * taxRate) / 100);
  const total = roundCurrency(amount + tax);
  return { tax, total };
};

export const toDateInputValue = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getDefaultFormValues = (): InvoiceFormValues => {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 14);

  return {
    customerId: "",
    amount: "",
    taxRate: 18,
    status: "Draft",
    issueDate: toDateInputValue(today.toISOString()),
    dueDate: toDateInputValue(due.toISOString()),
  };
};

export const invoiceToFormValues = (invoice: {
  customerId: { _id: string } | string;
  amount: number;
  taxRate: TaxRate;
  status: InvoiceFormValues["status"];
  issueDate: string;
  dueDate: string;
}): InvoiceFormValues => {
  const customerId =
    typeof invoice.customerId === "string"
      ? invoice.customerId
      : invoice.customerId._id;

  return {
    customerId,
    amount: String(invoice.amount),
    taxRate: invoice.taxRate,
    status: invoice.status,
    issueDate: toDateInputValue(invoice.issueDate),
    dueDate: toDateInputValue(invoice.dueDate),
  };
};

export const validateFormValues = (
  values: InvoiceFormValues
): string | null => {
  if (!values.customerId) {
    return "Please select a customer.";
  }

  const amount = Number(values.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Amount must be greater than 0.";
  }

  if (!values.issueDate) {
    return "Issue date is required.";
  }

  if (!values.dueDate) {
    return "Due date is required.";
  }

  const issueDate = new Date(values.issueDate);
  const dueDate = new Date(values.dueDate);

  if (Number.isNaN(issueDate.getTime()) || Number.isNaN(dueDate.getTime())) {
    return "Please enter valid dates.";
  }

  if (dueDate < issueDate) {
    return "Due date must be on or after issue date.";
  }

  return null;
};

export const formValuesToPayload = (
  values: InvoiceFormValues
): InvoicePayload => ({
  customerId: values.customerId,
  amount: Number(values.amount),
  taxRate: values.taxRate,
  status: values.status,
  issueDate: new Date(values.issueDate).toISOString(),
  dueDate: new Date(values.dueDate).toISOString(),
});

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
