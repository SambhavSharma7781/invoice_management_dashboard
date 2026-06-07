import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/utils/cn";
import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";
import {
  computeAnchorPlacement,
  type HorizontalAlign,
} from "@/utils/viewportFloatingPosition";

export interface ViewportSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface ViewportSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: ViewportSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  align?: HorizontalAlign;
  preferredWidth?: number;
}

const scrollListClassName =
  "max-h-[min(320px,60vh)] overflow-y-auto overscroll-contain";

export function ViewportSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  required = false,
  className,
  align = "start",
  preferredWidth,
}: ViewportSelectProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<ReturnType<
    typeof computeAnchorPlacement
  > | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  const closeMenu = () => setOpen(false);

  useCloseOnScroll(open, closeMenu, { ignoreScrollWithinRef: menuRef });

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setAnchor(null);
      return;
    }

    const updateAnchor = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const triggerWidth = triggerRef.current?.offsetWidth ?? 280;

      if (!trigger) {
        return;
      }

      setAnchor(
        computeAnchorPlacement(
          trigger,
          preferredWidth ?? Math.max(triggerWidth, 220),
          window.innerWidth,
          window.innerHeight,
          align
        )
      );
    };

    updateAnchor();
    window.addEventListener("resize", updateAnchor);

    return () => {
      window.removeEventListener("resize", updateAnchor);
    };
  }, [open, align, preferredWidth, options.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      closeMenu();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    closeMenu();
  };

  const verticalClass = anchor?.openAbove ? "bottom-full mb-2" : "top-full mt-2";
  const horizontalClass = anchor?.alignEnd ? "right-0" : "left-0";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        data-viewport-select-trigger
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required || undefined}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-left text-sm text-slate-900 shadow-none focus-visible:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
          className
        )}
      >
        <span className="min-w-0 truncate">
          {selectedOption?.label ?? (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <span className="ml-2 shrink-0 text-slate-400" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="listbox"
          aria-labelledby={id}
          data-viewport-dropdown
          style={
            anchor
              ? {
                  width: anchor.width,
                  maxHeight: anchor.maxHeight,
                }
              : undefined
          }
          className={cn(
            "absolute z-[120] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg",
            verticalClass,
            horizontalClass
          )}
        >
          <div className={scrollListClassName}>
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value || "__empty__"}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "block w-full cursor-pointer border-b border-slate-100 px-3 py-2.5 text-left text-sm last:border-b-0",
                    isSelected
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="block truncate font-medium">
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="block truncate text-xs text-slate-500">
                      {option.description}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
