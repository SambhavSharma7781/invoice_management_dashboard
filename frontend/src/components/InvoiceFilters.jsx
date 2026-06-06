import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const STATUS_OPTIONS = [
  "Draft",
  "Sent",
  "Unpaid",
  "Overdue",
  "Paid",
  "Void",
];

const TAX_RATE_OPTIONS = ["0", "3", "5", "18", "28"];

const filterButtonClass = (active) =>
  [
    "h-9 rounded-lg border px-3 text-sm font-medium shadow-none",
    active
      ? "border-blue-500 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ].join(" ");

function FilterPopover({ open, onClose, children, className = "" }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={`absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[16rem] rounded-lg border border-slate-200 bg-white p-4 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

export function InvoiceFilters({
  filters,
  setFilters,
  customers = [],
  searchQuery,
  onSearchChange,
  taxRateFilter,
  onTaxRateFilterChange,
  onReset,
}) {
  const [openPanel, setOpenPanel] = useState(null);

  const handleChange = (event) => {
    const { name, value, multiple, options } = event.target;

    if (multiple) {
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);

      setFilters((previous) => ({
        ...previous,
        [name]: selectedValues,
      }));

      return;
    }

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleReset = () => {
    onReset();
    setOpenPanel(null);
  };

  const statusActive = filters.status.length > 0;
  const taxActive = Boolean(taxRateFilter);
  const dateActive =
    filters.issueDateFrom ||
    filters.issueDateTo ||
    filters.dueDateFrom ||
    filters.dueDateTo;

  const togglePanel = (panel) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  return (
    <div className="relative z-30 overflow-visible border-b border-slate-100 px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <Input
            type="search"
            placeholder="Search invoice / customer"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 rounded-lg border-slate-200 bg-white shadow-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              className={filterButtonClass(statusActive)}
              onClick={() => togglePanel("status")}
            >
              Status
              {statusActive ? ` (${filters.status.length})` : ""}
            </button>

            <FilterPopover
              open={openPanel === "status"}
              onClose={() => setOpenPanel(null)}
              className="right-0 left-auto min-w-[14rem]"
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </p>
              <Select
                name="status"
                multiple
                size={6}
                value={filters.status}
                onChange={handleChange}
                className="h-auto py-1"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Customer
                </p>
                <Select
                  name="customerId"
                  value={filters.customerId}
                  onChange={handleChange}
                >
                  <option value="">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.company})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Sort by
                  </p>
                  <Select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleChange}
                  >
                    <option value="invoiceId">Invoice ID</option>
                    <option value="customerName">Customer Name</option>
                    <option value="amount">Amount</option>
                    <option value="total">Total</option>
                    <option value="issueDate">Issue Date</option>
                    <option value="dueDate">Due Date</option>
                  </Select>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Order
                  </p>
                  <Select
                    name="sortOrder"
                    value={filters.sortOrder}
                    onChange={handleChange}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </Select>
                </div>
              </div>
            </FilterPopover>
          </div>

          <div className="relative">
            <button
              type="button"
              className={filterButtonClass(taxActive)}
              onClick={() => togglePanel("tax")}
            >
              Tax rate
            </button>

            <FilterPopover
              open={openPanel === "tax"}
              onClose={() => setOpenPanel(null)}
              className="right-0 left-auto"
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Tax rate
              </p>
              <Select
                value={taxRateFilter}
                onChange={(event) => onTaxRateFilterChange(event.target.value)}
              >
                <option value="">All rates</option>
                {TAX_RATE_OPTIONS.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}%
                  </option>
                ))}
              </Select>
            </FilterPopover>
          </div>

          <div className="relative">
            <button
              type="button"
              className={filterButtonClass(dateActive)}
              onClick={() => togglePanel("date")}
            >
              Date
            </button>

            <FilterPopover
              open={openPanel === "date"}
              onClose={() => setOpenPanel(null)}
              className="right-0 left-auto min-w-[18rem]"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Issue from
                  </label>
                  <Input
                    type="date"
                    name="issueDateFrom"
                    value={filters.issueDateFrom}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Issue to
                  </label>
                  <Input
                    type="date"
                    name="issueDateTo"
                    value={filters.issueDateTo}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Due from
                  </label>
                  <Input
                    type="date"
                    name="dueDateFrom"
                    value={filters.dueDateFrom}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Due to
                  </label>
                  <Input
                    type="date"
                    name="dueDateTo"
                    value={filters.dueDateTo}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </FilterPopover>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 px-2 text-slate-500"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
