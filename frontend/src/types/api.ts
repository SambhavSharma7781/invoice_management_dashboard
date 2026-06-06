export type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Unpaid"
  | "Overdue"
  | "Paid"
  | "Void";

export type TaxRate = 0 | 3 | 5 | 18 | 28;

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Customer {
  _id: string;
  name: string;
  company: string;
}

export interface CustomerMetrics {
  totalInvoices: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
}

export interface CustomerDetail {
  customer: Customer;
  metrics: CustomerMetrics;
  invoices: {
    data: Invoice[];
    meta: PaginationMeta;
  };
}

export type CustomerStatusChip = "Paid" | "Unpaid" | "Overdue" | "Draft";

export type CustomerStatusCounts = Record<CustomerStatusChip, number>;

export interface InvoiceCustomerRef {
  _id: string;
  name: string;
  company: string;
}

export interface Invoice {
  _id: string;
  invoiceId: string;
  customerId: InvoiceCustomerRef | string;
  amount: number;
  taxRate: TaxRate;
  tax: number;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoicesListResponse {
  success: true;
  data: Invoice[];
  meta: PaginationMeta;
}

export interface InvoicePayload {
  customerId: string;
  amount: number;
  taxRate: TaxRate;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}

export interface InvoiceFormValues {
  customerId: string;
  amount: string;
  taxRate: TaxRate;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}
