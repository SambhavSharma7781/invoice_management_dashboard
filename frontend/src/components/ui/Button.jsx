import * as React from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50",
        variant === "outline" ? "border border-slate-200 bg-white shadow-sm hover:bg-slate-100" :
        variant === "ghost" ? "hover:bg-slate-100 text-slate-900" :
        "bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90",
        size === "sm" ? "h-8 rounded-md px-3 text-xs" :
        size === "lg" ? "h-10 rounded-md px-8" :
        size === "icon" ? "h-9 w-9" :
        "h-9 px-4 py-2",
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
