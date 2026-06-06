import { apiClient } from "./client";
import type { TopCustomerSummary } from "@/types/api";

export interface TopCustomersResponse {
  success: true;
  data: TopCustomerSummary[];
}

export async function getTopCustomers(): Promise<TopCustomersResponse> {
  const { data } = await apiClient.get<TopCustomersResponse>(
    "/api/summary/top-customers"
  );
  return data;
}
