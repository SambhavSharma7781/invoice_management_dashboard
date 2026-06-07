import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function toSafeInt(value, fallback = 0) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(0, Math.floor(parsed));
}

function getPaginationRange(page, pageSize, totalItems) {
  const safePage = Math.max(1, toSafeInt(page, 1));
  const safePageSize = toSafeInt(pageSize, 0);
  const safeTotal = toSafeInt(totalItems, 0);

  if (safePageSize <= 0 || safeTotal <= 0) {
    return null;
  }

  const start = (safePage - 1) * safePageSize + 1;
  const end = Math.min(safePage * safePageSize, safeTotal);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null;
  }

  return { start, end, total: safeTotal };
}

function getVisiblePages(currentPage, totalPages, compact) {
  if (compact) {
    const pages = new Set([currentPage]);

    if (currentPage > 1) {
      pages.add(currentPage - 1);
    }

    if (currentPage < totalPages) {
      pages.add(currentPage + 1);
    }

    if (currentPage > 2) {
      pages.add(1);
    }

    if (currentPage < totalPages - 1) {
      pages.add(totalPages);
    }

    return Array.from(pages).sort((a, b) => a - b);
  }

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage > 1) {
    pages.add(currentPage - 1);
  }

  if (currentPage < totalPages) {
    pages.add(currentPage + 1);
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  setPage,
}) {
  const isMobile = useIsMobileViewport();
  const safePage = Math.max(1, toSafeInt(page, 1));
  const safeTotalPages = toSafeInt(totalPages, 0);
  const safeTotalItems = toSafeInt(totalItems, 0);
  const safePageSize = toSafeInt(pageSize, 0);
  const range = getPaginationRange(safePage, safePageSize, safeTotalItems);

  if (safeTotalItems <= 0 || safeTotalPages <= 0 || safePageSize <= 0) {
    return null;
  }

  const compact = isMobile && safeTotalPages > 4;
  const visiblePages = getVisiblePages(
    safePage,
    Math.max(safeTotalPages, 1),
    compact
  );

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      {range ? (
        <div className="text-center text-sm text-slate-500 sm:text-left">
          Showing{" "}
          <span className="font-medium text-slate-900">
            {range.start}–{range.end}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-900">
            {range.total.toLocaleString("en-IN")}
          </span>
        </div>
      ) : (
        <div aria-hidden="true" className="hidden sm:block" />
      )}

      <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((current) => Math.max(1, toSafeInt(current, 1) - 1))}
          disabled={safePage <= 1}
          className="h-8 w-8 shrink-0 rounded-lg px-0 shadow-none"
          aria-label="Previous page"
        >
          ‹
        </Button>

        {visiblePages.map((pageNumber, index) => {
          const previousPage = visiblePages[index - 1];
          const showEllipsis = index > 0 && pageNumber - previousPage > 1;

          return (
            <span key={pageNumber} className="flex shrink-0 items-center gap-1.5">
              {showEllipsis ? (
                <span className="px-1 text-sm text-slate-400">…</span>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(pageNumber)}
                className={
                  pageNumber === safePage
                    ? "h-8 min-w-8 cursor-pointer rounded-lg border-blue-500 bg-white px-2 text-blue-600 shadow-none"
                    : "h-8 min-w-8 cursor-pointer rounded-lg px-2 shadow-none"
                }
              >
                {pageNumber}
              </Button>
            </span>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPage((current) =>
              Math.min(safeTotalPages, toSafeInt(current, 1) + 1)
            )
          }
          disabled={safePage >= safeTotalPages}
          className="h-8 w-8 shrink-0 rounded-lg px-0 shadow-none"
          aria-label="Next page"
        >
          ›
        </Button>
      </div>
    </div>
  );
}
