import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import type { Invoice } from "@/types/api";
import { formatCurrency } from "@/utils/customer";

interface CustomerInvoiceHistoryProps {
  invoices: Invoice[];
  loading?: boolean;
  error?: string | null;
}

export function CustomerInvoiceHistory({
  invoices,
  loading = false,
  error = null,
}: CustomerInvoiceHistoryProps) {
  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-slate-500">
        Loading invoice history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-sm text-red-600">{error}</div>
    );
  }

  if (!invoices.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
        No invoices found for this customer.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="px-4">Invoice</TableHead>
            <TableHead className="px-4">Total</TableHead>
            <TableHead className="px-4">Tax</TableHead>
            <TableHead className="px-4">Status</TableHead>
            <TableHead className="px-4">Issued</TableHead>
            <TableHead className="px-4">Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell className="px-4 font-medium text-slate-900">
                {invoice.invoiceId}
              </TableCell>
              <TableCell className="px-4">
                {formatCurrency(invoice.total)}
              </TableCell>
              <TableCell className="px-4">
                {formatCurrency(invoice.tax)}
              </TableCell>
              <TableCell className="px-4">
                <Badge
                  variant={invoice.status === "Paid" ? "default" : "outline"}
                >
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="px-4 text-slate-600">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-4 text-slate-600">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
