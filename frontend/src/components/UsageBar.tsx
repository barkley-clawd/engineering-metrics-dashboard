"use client";

import { cn } from "@/lib/utils";

interface UsageBarProps {
  proportion: number;
  className?: string;
}

export function UsageBar({ proportion, className }: UsageBarProps) {
  const width = Math.max(0, Math.min(1, proportion)) * 100;

  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-card-hover", className)}
      role="progressbar"
      aria-valuenow={Math.round(width)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          width: `${width}%`,
          background: "linear-gradient(90deg, #38bdf8, #a78bfa)",
        }}
      />
    </div>
  );
}
