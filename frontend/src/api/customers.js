import { apiClient } from "./client";

export async function getCustomers() {
  const { data } = await apiClient.get("/api/customers");
  return data;
}
