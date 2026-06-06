import { Button } from "@/components/ui/Button";

export function PaginationControls({ page, totalPages, totalItems, setPage }) {
  return (
    <div className="flex items-center justify-between mt-4 py-4">
      <div className="text-sm text-slate-500">
        Showing page <span className="font-medium text-slate-900">{page}</span> of{" "}
        <span className="font-medium text-slate-900">{Math.max(1, totalPages)}</span>
        {" "}({totalItems} total)
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
