import { apiClient } from "./client";

export async function getInvoices(params) {
  const { data } = await apiClient.get("/api/invoices", { params });
  return data;
}
