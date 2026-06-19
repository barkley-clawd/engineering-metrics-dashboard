"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type HealthStatus = "healthy" | "warning" | "critical" | "unknown" | "empty";
type Trend = "up" | "down" | "neutral";

interface HealthSignalCardProps {
  label: string;
  value: string | number | null;
  unit?: string;
  trend?: Trend;
  status?: HealthStatus;
  detail?: string | null;
  loading?: boolean;
  error?: string | null;
}

const statusStyles: Record<HealthStatus, string> = {
  healthy: "border-status-success/20",
  warning: "border-status-warning/30",
  critical: "border-status-error/30 shadow-[0_0_0_1px_rgba(248,113,113,0.12)]",
  unknown: "border-card-border",
  empty: "border-card-border",
};

const trendIcons: Record<Trend, ReactNode> = {
  up: <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />,
  down: <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />,
  neutral: <Minus className="h-3.5 w-3.5" aria-hidden="true" />,
};

export function HealthSignalCard({
  label,
  value,
  unit,
  trend = "neutral",
  status = "unknown",
  detail,
  loading = false,
  error,
}: HealthSignalCardProps) {
  const displayValue = loading ? "" : value == null ? "—" : String(value);
  const tone =
    status === "critical"
      ? "text-status-error"
      : status === "warning"
        ? "text-status-warning"
        : status === "empty" || status === "unknown"
          ? "text-text-muted"
          : "text-text-primary";

  return (
    <div className={cn("rounded-lg border bg-card-bg p-4 min-w-0", statusStyles[status])}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
            {label}
          </p>
          {!loading && status !== "unknown" && status !== "empty" && (
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                status === "critical"
                  ? "bg-status-error"
                  : status === "warning"
                    ? "bg-status-warning"
                    : "bg-status-success",
              )}
              aria-hidden="true"
            />
          )}
        </div>
        {!loading && trend !== "neutral" && (
          <span className={cn("flex items-center gap-1 text-xs", tone)}>
            {trendIcons[trend]}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end gap-2 min-h-9">
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-card-hover" />
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-status-error">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <span className="truncate">{error}</span>
          </div>
        ) : (
          <>
            <p className={cn("text-2xl font-bold font-mono tabular-nums leading-none", tone)}>
              {displayValue}
            </p>
            {unit && <span className="pb-0.5 text-xs text-text-secondary">{unit}</span>}
          </>
        )}
      </div>

      <p className="mt-2 min-h-5 text-sm text-text-secondary">
        {detail ?? (status === "empty" ? "No data yet" : null)}
      </p>
    </div>
  );
}
