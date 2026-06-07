import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export type MetricIconColor = "blue" | "green" | "red" | "purple";

const ICON_COLOR_CLASSES: Record<
  MetricIconColor,
  { bg: string; text: string; border: string }
> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-t-blue-500",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-t-green-500",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-t-red-500",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-t-purple-500",
  },
};

interface MetricCardProps {
  label: string;
  value: string;
  loading?: boolean;
  icon?: LucideIcon;
  iconColor?: MetricIconColor;
}

export function MetricCard({
  label,
  value,
  loading = false,
  icon: Icon,
  iconColor = "blue",
}: MetricCardProps) {
  const colors = ICON_COLOR_CLASSES[iconColor];

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 border-t-[3px] bg-white px-5 py-4 shadow-sm",
        colors.border
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-28 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="mt-1 break-words text-xl font-semibold tracking-tight text-slate-900 tabular-nums sm:text-2xl">
              {value}
            </p>
          )}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              colors.bg
            )}
          >
            <Icon className={cn("h-5 w-5", colors.text)} aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
