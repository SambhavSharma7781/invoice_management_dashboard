import { apiClient } from "./client";
import type {
  ApiSuccessResponse,
  Invoice,
  InvoicePayload,
  InvoicesListResponse,
} from "@/types/api";

export type InvoiceListParams = Record<
  string,
  string | number | undefined
>;

export async function getInvoices(
  params?: InvoiceListParams
): Promise<InvoicesListResponse> {
  const { data } = await apiClient.get<InvoicesListResponse>(
    "/api/invoices",
    { params }
  );
  return data;
}

export async function getInvoice(
  invoiceId: string
): Promise<ApiSuccessResponse<Invoice>> {
  const { data } = await apiClient.get<ApiSuccessResponse<Invoice>>(
    `/api/invoices/${invoiceId}`
  );
  return data;
}

export async function createInvoice(
  payload: InvoicePayload
): Promise<ApiSuccessResponse<Invoice>> {
  const { data } = await apiClient.post<ApiSuccessResponse<Invoice>>(
    "/api/invoices",
    payload
  );
  return data;
}

export async function updateInvoice(
  invoiceId: string,
  payload: InvoicePayload
): Promise<ApiSuccessResponse<Invoice>> {
  const { data } = await apiClient.put<ApiSuccessResponse<Invoice>>(
    `/api/invoices/${invoiceId}`,
    payload
  );
  return data;
}
