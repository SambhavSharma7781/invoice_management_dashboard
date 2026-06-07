import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-pointer bg-slate-500/50"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={cn(
          "relative z-10 flex w-full max-w-[760px] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[min(680px,calc(100dvh-2rem))] sm:rounded-2xl",
          "max-h-[min(92dvh,calc(100dvh-0.5rem))]",
          className
        )}
      >
        <div className="shrink-0 border-b border-slate-100 px-5 py-3.5 sm:px-6 sm:py-4">
          <h2
            id="dialog-title"
            className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-4">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-3 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
