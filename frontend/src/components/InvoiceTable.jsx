import { Link } from "react-router-dom";
import { customerNameToSlug } from "@/utils/customer";
import { getStatusBadgeClassName } from "@/utils/invoice";
import { cn } from "@/utils/cn";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
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

function SortableHeader({ label, active, direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1 text-left font-medium text-slate-600 hover:text-slate-900"
    >
      <span>{label}</span>
      <span className="text-[10px] text-slate-400">
        {active ? (direction === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </button>
  );
}

export function InvoiceTable({
  invoices,
  loading,
  fetching = false,
  error,
  onRetry,
  onEdit,
  sortBy,
  sortOrder,
  onSort,
}) {
  if (loading && !invoices?.length) {
    return (
      <div className="px-6 py-12 text-center text-sm text-slate-500">
        Loading invoices...
      </div>
    );
  }

  if (error && !invoices?.length) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!invoices?.length) {
    return (
      <EmptyState message="No invoices match the selected filters." />
    );
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      onSort(column, sortOrder === "asc" ? "desc" : "asc");
      return;
    }

    onSort(column, "desc");
  };

  return (
    <Table
      containerClassName={cn("px-4 sm:px-6", fetching && "opacity-50")}
      className="min-w-[720px]"
    >
        <TableHeader>
          <TableRow className="border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50/80">
            <TableHead className="px-4 py-3">
              <SortableHeader
                label="Invoice"
                active={sortBy === "invoiceId"}
                direction={sortOrder}
                onClick={() => handleSort("invoiceId")}
              />
            </TableHead>
            <TableHead className="px-4 py-3">
              <SortableHeader
                label="Customer"
                active={sortBy === "customerName"}
                direction={sortOrder}
                onClick={() => handleSort("customerName")}
              />
            </TableHead>
            <TableHead className="px-4 py-3">
              <SortableHeader
                label="Amount"
                active={sortBy === "amount"}
                direction={sortOrder}
                onClick={() => handleSort("amount")}
              />
            </TableHead>
            <TableHead className="px-4 py-3 text-slate-600">Tax%</TableHead>
            <TableHead className="px-4 py-3">
              <SortableHeader
                label="Total"
                active={sortBy === "total"}
                direction={sortOrder}
                onClick={() => handleSort("total")}
              />
            </TableHead>
            <TableHead className="px-4 py-3 text-slate-600">Status</TableHead>
            <TableHead className="px-4 py-3 text-right text-slate-600">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice._id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <TableCell className="px-4 py-3 font-medium text-slate-900">
                {invoice.invoiceId}
              </TableCell>

              <TableCell className="px-4 py-3 text-slate-700">
                {invoice.customerId?.name}
              </TableCell>

              <TableCell className="px-4 py-3 text-slate-700">
                ₹{Number(invoice.amount).toFixed(2)}
              </TableCell>

              <TableCell className="px-4 py-3 text-slate-700">
                {invoice.taxRate}%
              </TableCell>

              <TableCell className="px-4 py-3 font-medium text-slate-900">
                ₹{Number(invoice.total).toFixed(2)}
              </TableCell>

              <TableCell className="px-4 py-3">
                <Badge
                  className={`rounded-full ${getStatusBadgeClassName(invoice.status)}`}
                >
                  {invoice.status}
                </Badge>
              </TableCell>

              <TableCell className="px-4 py-3 text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(invoice)}
                    className="h-8 rounded-lg shadow-none"
                  >
                    Edit
                  </Button>

                  <Link
                    to={`/customers/${customerNameToSlug(invoice.customerId?.name ?? "")}`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg shadow-none"
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
  );
}
