import { type CSSProperties, type ReactNode, useRef } from "react";
import { cn } from "@/utils/cn";
import { useScrollChain } from "@/hooks/useScrollChain";

interface ScrollPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function ScrollPanel({ children, className, style }: ScrollPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollChain(ref);

  return (
    <div
      ref={ref}
      className={cn("dropdown-scroll-panel", className)}
      style={style}
    >
      {children}
    </div>
  );
}
