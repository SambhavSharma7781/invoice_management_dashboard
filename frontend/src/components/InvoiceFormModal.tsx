import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createInvoice, getInvoice, updateInvoice } from "@/api/invoices";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Customer, Invoice, InvoiceFormValues } from "@/types/api";
import {
  calculateTaxAndTotal,
  formValuesToPayload,
  getApiErrorMessage,
  getDefaultFormValues,
  INVOICE_STATUS_OPTIONS,
  invoiceToFormValues,
  TAX_RATE_OPTIONS,
  validateFormValues,
} from "@/utils/invoice";

export type InvoiceModalMode = "create" | "edit";

interface InvoiceFormModalProps {
  open: boolean;
  mode: InvoiceModalMode;
  invoiceId?: string | null;
  initialInvoice?: Invoice | null;
  customers: Customer[];
  onClose: () => void;
  onSuccess: () => void;
}

const labelClassName = "mb-1.5 block text-sm text-slate-500";

const fieldClassName =
  "h-10 rounded-lg border-slate-300 bg-white text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const readOnlyFieldClassName =
  "h-10 rounded-lg border-slate-200 bg-slate-100 text-sm text-slate-500 shadow-none";

function FormSkeleton() {
  return (
    <div className="space-y-5 pt-2" aria-busy="true" aria-label="Loading invoice">
      <div className="space-y-1.5">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="space-y-1.5">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-4 w-14 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}

export function InvoiceFormModal({
  open,
  mode,
  invoiceId,
  initialInvoice,
  customers,
  onClose,
  onSuccess,
}: InvoiceFormModalProps) {
  const [formValues, setFormValues] = useState<InvoiceFormValues>(
    getDefaultFormValues
  );
  const [displayInvoiceId, setDisplayInvoiceId] = useState<string | null>(null);
  const [loadedInvoiceId, setLoadedInvoiceId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === "edit";
  const hasInitialInvoice =
    isEditMode &&
    initialInvoice != null &&
    initialInvoice.invoiceId === invoiceId;
  const isEditDataReady =
    isEditMode &&
    !!invoiceId &&
    (loadedInvoiceId === invoiceId || hasInitialInvoice);
  const isEditLoading =
    open && isEditMode && !!invoiceId && !isEditDataReady && !error;

  const activeFormValues = useMemo(() => {
    if (hasInitialInvoice && loadedInvoiceId !== invoiceId) {
      return invoiceToFormValues(initialInvoice);
    }

    return formValues;
  }, [
    hasInitialInvoice,
    initialInvoice,
    loadedInvoiceId,
    invoiceId,
    formValues,
  ]);

  const activeDisplayInvoiceId =
    hasInitialInvoice && loadedInvoiceId !== invoiceId
      ? initialInvoice.invoiceId
      : displayInvoiceId;

  useLayoutEffect(() => {
    if (!open || !hasInitialInvoice || loadedInvoiceId === invoiceId) {
      return;
    }

    setFormValues(invoiceToFormValues(initialInvoice));
    setDisplayInvoiceId(initialInvoice.invoiceId);
    setLoadedInvoiceId(invoiceId ?? null);
  }, [open, hasInitialInvoice, initialInvoice, invoiceId, loadedInvoiceId]);

  useEffect(() => {
    if (!open) {
      setFormValues(getDefaultFormValues());
      setDisplayInvoiceId(null);
      setLoadedInvoiceId(null);
      setError(null);
      setSubmitting(false);
      return;
    }

    setError(null);

    if (mode === "create") {
      setFormValues(getDefaultFormValues());
      setDisplayInvoiceId(null);
      setLoadedInvoiceId(null);
      return;
    }

    if (!invoiceId) {
      setError("Invoice ID is missing.");
      return;
    }

    if (hasInitialInvoice) {
      return;
    }

    let cancelled = false;

    const loadInvoice = async () => {
      try {
        const response = await getInvoice(invoiceId);

        if (cancelled) {
          return;
        }

        setFormValues(invoiceToFormValues(response.data));
        setDisplayInvoiceId(response.data.invoiceId);
        setLoadedInvoiceId(invoiceId);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      }
    };

    void loadInvoice();

    return () => {
      cancelled = true;
    };
  }, [open, mode, invoiceId, hasInitialInvoice]);

  const amountNumber = Number(activeFormValues.amount);
  const preview = useMemo(() => {
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return { tax: 0, total: 0 };
    }

    return calculateTaxAndTotal(amountNumber, activeFormValues.taxRate);
  }, [amountNumber, activeFormValues.taxRate]);

  const selectedCustomer = useMemo(() => {
    const fromList = customers.find(
      (customer) => customer._id === activeFormValues.customerId
    );

    if (fromList) {
      return fromList;
    }

    if (
      hasInitialInvoice &&
      typeof initialInvoice.customerId === "object" &&
      initialInvoice.customerId._id === activeFormValues.customerId
    ) {
      return initialInvoice.customerId;
    }

    return undefined;
  }, [customers, activeFormValues.customerId, hasInitialInvoice, initialInvoice]);

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormValues((previous) => {
      const base =
        loadedInvoiceId === invoiceId
          ? previous
          : hasInitialInvoice
            ? invoiceToFormValues(initialInvoice)
            : previous;

      return {
        ...base,
        [name]:
          name === "taxRate"
            ? (Number(value) as InvoiceFormValues["taxRate"])
            : value,
      };
    });

    if (hasInitialInvoice && loadedInvoiceId !== invoiceId) {
      setDisplayInvoiceId(initialInvoice.invoiceId);
      setLoadedInvoiceId(invoiceId ?? null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validationError = validateFormValues(activeFormValues);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const payload = formValuesToPayload(activeFormValues);

      if (isEditMode && invoiceId) {
        await updateInvoice(invoiceId, payload);
      } else {
        await createInvoice(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEditMode ? "Edit Invoice" : "New Invoice";

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      {isEditLoading ? (
        <FormSkeleton />
      ) : error && isEditMode && !isEditDataReady ? (
        <div className="space-y-4 pt-2">
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 min-w-[110px] rounded-lg border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {isEditMode && activeDisplayInvoiceId ? (
            <div>
              <label className={labelClassName}>Invoice ID</label>
              <Input
                value={activeDisplayInvoiceId}
                disabled
                readOnly
                className={readOnlyFieldClassName}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="customerId" className={labelClassName}>
              Customer
            </label>
            {customers.length === 0 ? (
              <p className="text-sm text-slate-500">
                No customers available. Add customers before creating an invoice.
              </p>
            ) : (
              <Select
                id="customerId"
                name="customerId"
                value={activeFormValues.customerId}
                onChange={handleFieldChange}
                required
                disabled={submitting}
                className={fieldClassName}
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div>
            <label htmlFor="company" className={labelClassName}>
              Company (auto-filled)
            </label>
            <Input
              id="company"
              value={selectedCustomer?.company ?? ""}
              placeholder="Company name"
              disabled
              readOnly
              className={readOnlyFieldClassName}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="amount" className={labelClassName}>
                Amount
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={activeFormValues.amount}
                onChange={handleFieldChange}
                required
                disabled={submitting || customers.length === 0}
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="taxRate" className={labelClassName}>
                Tax rate
              </label>
              <Select
                id="taxRate"
                name="taxRate"
                value={String(activeFormValues.taxRate)}
                onChange={handleFieldChange}
                disabled={submitting || customers.length === 0}
                className={fieldClassName}
              >
                {TAX_RATE_OPTIONS.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}%
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="issueDate" className={labelClassName}>
                Issue date
              </label>
              <Input
                id="issueDate"
                name="issueDate"
                type="date"
                placeholder="yyyy-mm-dd"
                value={activeFormValues.issueDate}
                onChange={handleFieldChange}
                required
                disabled={submitting || customers.length === 0}
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="dueDate" className={labelClassName}>
                Due date
              </label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                placeholder="yyyy-mm-dd"
                value={activeFormValues.dueDate}
                onChange={handleFieldChange}
                required
                disabled={submitting || customers.length === 0}
                className={fieldClassName}
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className={labelClassName}>
              Status
            </label>
            <Select
              id="status"
              name="status"
              value={activeFormValues.status}
              onChange={handleFieldChange}
              disabled={submitting || customers.length === 0}
              className={fieldClassName}
            >
              {INVOICE_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
            <span>
              Tax{" "}
              <span className="font-medium text-slate-800">
                ₹{preview.tax.toFixed(2)}
              </span>
            </span>
            <span className="mx-2 text-slate-400">·</span>
            <span>
              Total{" "}
              <span className="font-medium text-slate-800">
                ₹{preview.total.toFixed(2)}
              </span>
            </span>
            <span className="text-slate-500"> (computed)</span>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="h-10 min-w-[110px] rounded-lg border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                (isEditMode && !isEditDataReady) ||
                customers.length === 0
              }
              className="h-10 min-w-[130px] rounded-lg border border-blue-500 bg-white px-6 text-sm font-medium text-blue-600 shadow-none hover:bg-blue-50 disabled:border-slate-200 disabled:text-slate-400"
            >
              {submitting ? "Saving..." : "Save invoice"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
