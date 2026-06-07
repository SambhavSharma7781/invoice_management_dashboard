import type { Customer } from "@/types/api";

const chipClass = (active: boolean) =>
  [
    "cursor-pointer rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    active
      ? "border-blue-500 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ].join(" ");

interface CustomerPickerProps {
  customers: Customer[];
  value: string;
  onChange: (customerId: string) => void;
  disabled?: boolean;
}

export function MobileCustomerPicker({
  customers,
  value,
  onChange,
  disabled = false,
}: CustomerPickerProps) {
  return (
    <div className="max-h-[min(320px,60vh)] overflow-y-auto overscroll-contain rounded-lg border border-slate-300 bg-white">
      {customers.map((customer) => (
        <button
          key={customer._id}
          type="button"
          disabled={disabled}
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

interface OptionPickerProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  formatLabel?: (value: T) => string;
  getActiveClassName?: (value: T) => string;
}

export function MobileOptionPicker<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  formatLabel = (option) => option,
  getActiveClassName,
}: OptionPickerProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            className={
              isActive && getActiveClassName
                ? `cursor-pointer rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getActiveClassName(option)}`
                : chipClass(isActive)
            }
            onClick={() => onChange(option)}
          >
            {formatLabel(option)}
          </button>
        );
      })}
    </div>
  );
}
