import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";
import {
  computeAnchorPlacement,
  MOBILE_BREAKPOINT,
} from "@/utils/viewportFloatingPosition";

function getViewportWidth() {
  return window.innerWidth;
}

export { MOBILE_BREAKPOINT };

export function FilterPopover({
  open,
  onClose,
  triggerRef,
  children,
  title,
  className = "",
  align = "start",
  preferredWidth = 288,
  preferredMaxHeight,
}) {
  const panelRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [isMobileSheet, setIsMobileSheet] = useState(
    () => getViewportWidth() < MOBILE_BREAKPOINT
  );
  const [anchor, setAnchor] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useCloseOnScroll(open && isMobileSheet, onClose, {
    ignoreScrollWithinRef: panelRef,
  });

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const updateMode = () => {
      setIsMobileSheet(getViewportWidth() < MOBILE_BREAKPOINT);
    };

    updateMode();
    window.addEventListener("resize", updateMode);

    return () => {
      window.removeEventListener("resize", updateMode);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || isMobileSheet || !triggerRef?.current) {
      setAnchor(null);
      return;
    }

    const updateAnchor = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();

      if (!trigger) {
        return;
      }

      setAnchor(
        computeAnchorPlacement(
          trigger,
          preferredWidth,
          window.innerWidth,
          window.innerHeight,
          align,
          preferredMaxHeight
        )
      );
    };

    updateAnchor();
    window.addEventListener("resize", updateAnchor);

    return () => {
      window.removeEventListener("resize", updateAnchor);
    };
  }, [open, isMobileSheet, triggerRef, align, preferredWidth, preferredMaxHeight]);

  useEffect(() => {
    if (!open || !isMobileSheet) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, isMobileSheet]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event) => {
      if (
        panelRef.current?.contains(event.target) ||
        triggerRef?.current?.contains(event.target)
      ) {
        return;
      }

      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose, triggerRef]);

  if (!open || !mounted) {
    return null;
  }

  if (isMobileSheet) {
    return createPortal(
      <div className="fixed inset-0 z-[100] flex flex-col justify-end pb-3">
        <button
          type="button"
          aria-label="Close filter panel"
          className="absolute inset-0 cursor-pointer bg-slate-900/30"
          onClick={onClose}
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          data-floating-panel
          className="relative flex max-h-[min(calc(85dvh-0.75rem),calc(100dvh-2rem))] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {title ? (
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-md px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Done
              </button>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            {children}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  const verticalClass = anchor?.openAbove
    ? "bottom-full mb-2"
    : "top-full mt-2";
  const horizontalClass = anchor?.alignEnd ? "right-0" : "left-0";

  return (
    <div
      ref={panelRef}
      data-floating-panel
      style={
        anchor
          ? {
              width: anchor.width,
              maxHeight: anchor.maxHeight,
            }
          : undefined
      }
      className={`absolute ${verticalClass} ${horizontalClass} z-[100] flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg ${className}`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
    </div>
  );
}
