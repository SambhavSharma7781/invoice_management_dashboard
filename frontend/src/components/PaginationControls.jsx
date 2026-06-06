import { Button } from "@/components/ui/Button";

function getVisiblePages(currentPage, totalPages) {
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
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const visiblePages = getVisiblePages(page, Math.max(totalPages, 1));

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-medium text-slate-900">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-900">
          {totalItems.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page <= 1}
          className="h-8 w-8 rounded-lg px-0 shadow-none"
          aria-label="Previous page"
        >
          ‹
        </Button>

        {visiblePages.map((pageNumber, index) => {
          const previousPage = visiblePages[index - 1];
          const showEllipsis = index > 0 && pageNumber - previousPage > 1;

          return (
            <span key={pageNumber} className="flex items-center gap-1.5">
              {showEllipsis ? (
                <span className="px-1 text-sm text-slate-400">…</span>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(pageNumber)}
                className={
                  pageNumber === page
                    ? "h-8 min-w-8 rounded-lg border-blue-500 bg-white px-2 text-blue-600 shadow-none"
                    : "h-8 min-w-8 rounded-lg px-2 shadow-none"
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
            setPage((current) => Math.min(totalPages, current + 1))
          }
          disabled={page >= totalPages || totalPages === 0}
          className="h-8 w-8 rounded-lg px-0 shadow-none"
          aria-label="Next page"
        >
          ›
        </Button>
      </div>
    </div>
  );
}
