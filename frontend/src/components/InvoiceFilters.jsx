import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function InvoiceFilters({
  filters,
  setFilters,
  customers = [],
}) {
  const handleChange = (e) => {
    const { name, value, multiple, options } = e.target;

    if (multiple) {
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);

      setFilters((prev) => ({
        ...prev,
        [name]: selectedValues,
      }));

      return;
    }

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFilters({
      status: [],
      customerId: "",
      issueDateFrom: "",
      issueDateTo: "",
      dueDateFrom: "",
      dueDateTo: "",
      sortBy: "issueDate",
      sortOrder: "desc",
    });
  };

  return (
    <div className="mb-6 rounded-lg border bg-slate-50/50 p-4">
      <div className="flex flex-col gap-4">
        {/* Top Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Status Filter */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Status
            </label>

            <Select
              name="status"
              multiple
              size={6}
              value={filters.status}
              onChange={handleChange}
              className="h-auto py-1"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
              <option value="Paid">Paid</option>
              <option value="Void">Void</option>
            </Select>
          </div>

          {/* Customer Filter */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Customer
            </label>

            <Select
              name="customerId"
              value={filters.customerId}
              onChange={handleChange}
            >
              <option value="">All Customers</option>

              {customers.map((customer) => (
                <option
                  key={customer._id}
                  value={customer._id}
                >
                  {customer.name} ({customer.company})
                </option>
              ))}
            </Select>
          </div>

          {/* Sorting */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">
                Sort By
              </label>

              <Select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleChange}
              >
                <option value="amount">Amount</option>
                <option value="issueDate">Issue Date</option>
                <option value="dueDate">Due Date</option>
              </Select>
            </div>

            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">
                Order
              </label>

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
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Issue Date From
            </label>

            <Input
              type="date"
              name="issueDateFrom"
              value={filters.issueDateFrom}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Issue Date To
            </label>

            <Input
              type="date"
              name="issueDateTo"
              value={filters.issueDateTo}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Due Date From
            </label>

            <Input
              type="date"
              name="dueDateFrom"
              value={filters.dueDateFrom}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Due Date To
            </label>

            <Input
              type="date"
              name="dueDateTo"
              value={filters.dueDateTo}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}