import * as React from "react";
import { cn } from "@/utils/cn";

export const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
});
Select.displayName = "Select";
