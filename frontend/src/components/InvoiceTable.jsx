import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

export function InvoiceTable({ invoices, loading, error }) {
  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading invoices...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-500">
        Error loading invoices: {error.message}
      </div>
    );
  }

  if (!invoices?.length) {
    return (
      <div className="py-10 text-center text-slate-500">
        No invoices found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Tax %</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell className="font-medium">
                {invoice.invoiceId}
              </TableCell>

              <TableCell>
                {invoice.customerId?.name}
              </TableCell>

              <TableCell>
                {invoice.customerId?.company}
              </TableCell>

              <TableCell>
                ₹{Number(invoice.amount).toFixed(2)}
              </TableCell>

              <TableCell>
                {invoice.taxRate}%
              </TableCell>

              <TableCell>
                ₹{Number(invoice.total).toFixed(2)}
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    invoice.status === "Paid"
                      ? "default"
                      : "outline"
                  }
                >
                  {invoice.status}
                </Badge>
              </TableCell>

              <TableCell>
                {new Date(invoice.issueDate).toLocaleDateString()}
              </TableCell>

              <TableCell>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/invoices/${invoice.invoiceId}/edit`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </Link>

                  <Link
                    to={`/customers/${invoice.customerId?._id}`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Profile
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}