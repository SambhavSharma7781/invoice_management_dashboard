import type { Invoice } from "@/types/api";

export const computeGlobalTotalBilled = (invoices: Invoice[]): number =>
  invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

export const computeGlobalTotalTax = (invoices: Invoice[]): number =>
  invoices.reduce((sum, invoice) => sum + Number(invoice.tax || 0), 0);

export const formatNumber = (value: number): string =>
  value.toLocaleString("en-IN");
