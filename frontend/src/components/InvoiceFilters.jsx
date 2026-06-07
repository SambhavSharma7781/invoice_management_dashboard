import { useRef, useState } from "react";
import { FilterPopover } from "@/components/FilterPopover";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useIsMobileViewport } from "@/hooks/useIsMobileViewport";

const STATUS_OPTIONS = [
  "Draft",
  "Sent",
  "Unpaid",
  "Overdue",
  "Paid",
  "Void",
];

const TAX_RATE_OPTIONS = ["0", "3", "5", "18", "28"];

const SORT_OPTIONS = [
  { value: "amount", label: "Amount" },
  { value: "issueDate", label: "Issue Date" },
  { value: "dueDate", label: "Due Date" },
];

const filterButtonClass = (active) =>
  [
    "h-9 cursor-pointer rounded-lg border px-3 text-sm font-medium shadow-none",
    active
      ? "border-blue-500 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ].join(" ");

const chipClass = (active) =>
  [
    "cursor-pointer rounded-lg border px-3 py-2 text-left text-sm transition-colors",
    active
      ? "border-blue-500 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ].join(" ");

function FilterSectionLabel({ children }) {
  return (
    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
      {children}
    </p>
  );
}

function StatusFilterOptions({ value, onChange }) {
  const toggleStatus = (status) => {
    onChange(
      value.includes(status)
        ? value.filter((item) => item !== status)
        : [...value, status]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_OPTIONS.map((status) => (
        <button
          key={status}
          type="button"
          className={chipClass(value.includes(status))}
          onClick={() => toggleStatus(status)}
        >
          {status}
        </button>
      ))}
    </div>
  );
}

function CustomerFilterOptions({ customers, value, onChange }) {
  return (
    <div className="rounded-lg border border-slate-200">
      <button
        type="button"
        className={`${chipClass(!value)} block w-full rounded-none border-0 border-b border-slate-100 px-3 py-2.5 text-left`}
        onClick={() => onChange("")}
      >
        All Customers
      </button>
      {customers.map((customer) => (
        <button
          key={customer._id}
          type="button"
          className={`${chipClass(value === customer._id)} block w-full rounded-none border-0 border-b border-slate-100 px-3 py-2.5 text-left last:border-b-0`}
          onClick={() => onChange(customer._id)}
        >
          <span className="block truncate font-medium">{customer.name}</span>
          <span className="block truncate text-xs text-slate-500">
            {customer.company}
          </span>
        </button>
      ))}
    </div>
  );
}

function TaxRateFilterOptions({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={chipClass(!value)}
        onClick={() => onChange("")}
      >
        All rates
      </button>
      {TAX_RATE_OPTIONS.map((rate) => (
        <button
          key={rate}
          type="button"
          className={chipClass(value === rate)}
          onClick={() => onChange(rate)}
        >
          {rate}%
        </button>
      ))}
    </div>
  );
}

function SortFilterOptions({ sortBy, sortOrder, onSortByChange, onSortOrderChange }) {
  return (
    <div className="space-y-4">
      <div>
        <FilterSectionLabel>Sort by</FilterSectionLabel>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={chipClass(sortBy === option.value)}
              onClick={() => onSortByChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FilterSectionLabel>Order</FilterSectionLabel>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={chipClass(sortOrder === "asc")}
            onClick={() => onSortOrderChange("asc")}
          >
            Ascending
          </button>
          <button
            type="button"
            className={chipClass(sortOrder === "desc")}
            onClick={() => onSortOrderChange("desc")}
          >
            Descending
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusFilterPanel({ filters, setFilters, customers }) {
  return (
    <div className="space-y-4">
      <div>
        <FilterSectionLabel>Status</FilterSectionLabel>
        <StatusFilterOptions
          value={filters.status}
          onChange={(status) =>
            setFilters((previous) => ({ ...previous, status }))
          }
        />
      </div>

      <div>
        <FilterSectionLabel>Customer</FilterSectionLabel>
        <CustomerFilterOptions
          customers={customers}
          value={filters.customerId}
          onChange={(customerId) =>
            setFilters((previous) => ({ ...previous, customerId }))
          }
        />
      </div>

      <SortFilterOptions
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSortByChange={(sortBy) =>
          setFilters((previous) => ({ ...previous, sortBy }))
        }
        onSortOrderChange={(sortOrder) =>
          setFilters((previous) => ({ ...previous, sortOrder }))
        }
      />
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
  const isMobile = useIsMobileViewport();
  const statusTriggerRef = useRef(null);
  const taxTriggerRef = useRef(null);
  const dateTriggerRef = useRef(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

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
    <div className="relative z-30 border-b border-slate-100 px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <Input
            type="search"
            placeholder="Search invoice / customer"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 w-full rounded-lg border-slate-200 bg-white shadow-none"
          />
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          <div className="relative min-w-0">
            <button
              ref={statusTriggerRef}
              type="button"
              className={`${filterButtonClass(statusActive)} w-full sm:w-auto`}
              onClick={() => togglePanel("status")}
            >
              Status
              {statusActive ? ` (${filters.status.length})` : ""}
            </button>

            <FilterPopover
              open={openPanel === "status"}
              onClose={() => setOpenPanel(null)}
              triggerRef={statusTriggerRef}
              title={isMobile ? "Filters" : undefined}
              align="start"
              preferredWidth={360}
              preferredMaxHeight={480}
            >
              <StatusFilterPanel
                filters={filters}
                setFilters={setFilters}
                customers={customers}
              />
            </FilterPopover>
          </div>

          <div className="relative min-w-0">
            <button
              ref={taxTriggerRef}
              type="button"
              className={`${filterButtonClass(taxActive)} w-full sm:w-auto`}
              onClick={() => togglePanel("tax")}
            >
              Tax rate
            </button>

            <FilterPopover
              open={openPanel === "tax"}
              onClose={() => setOpenPanel(null)}
              triggerRef={taxTriggerRef}
              title={isMobile ? "Tax rate" : undefined}
              align="end"
              preferredWidth={176}
            >
              <TaxRateFilterOptions
                value={taxRateFilter}
                onChange={onTaxRateFilterChange}
              />
            </FilterPopover>
          </div>

          <div className="relative min-w-0">
            <button
              ref={dateTriggerRef}
              type="button"
              className={`${filterButtonClass(dateActive)} w-full sm:w-auto`}
              onClick={() => togglePanel("date")}
            >
              Date
            </button>

            <FilterPopover
              open={openPanel === "date"}
              onClose={() => setOpenPanel(null)}
              triggerRef={dateTriggerRef}
              title={isMobile ? "Date filters" : undefined}
              align="end"
              preferredWidth={288}
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
                    className="w-full"
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
                    className="w-full"
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
                    className="w-full"
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
                    className="w-full"
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
            className="col-span-2 h-9 px-2 text-slate-500 sm:col-span-1"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
