import { apiClient } from "./client";
import type { Customer, CustomerDetail } from "@/types/api";

export interface CustomerListResponse {
  success: true;
  data: Customer[];
}

export interface CustomerDetailResponse {
  success: true;
  data: CustomerDetail;
}

export type CustomerDetailParams = {
  page?: number;
  limit?: number;
};

export async function getCustomers(): Promise<CustomerListResponse> {
  const { data } = await apiClient.get<CustomerListResponse>("/api/customers");
  return data;
}

export async function getCustomerById(
  customerId: string,
  params?: CustomerDetailParams
): Promise<CustomerDetailResponse> {
  const { data } = await apiClient.get<CustomerDetailResponse>(
    `/api/customers/${customerId}`,
    { params }
  );
  return data;
}

export async function fetchAllCustomerInvoices(customerId: string) {
  const allInvoices: CustomerDetail["invoices"]["data"] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await getCustomerById(customerId, { page, limit: 100 });
    allInvoices.push(...response.data.invoices.data);
    totalPages = response.data.invoices.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return allInvoices;
}
