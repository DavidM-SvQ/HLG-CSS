import React from "react";
import { cn } from "../../lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200/60", className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      <div className="border-b border-neutral-200 pb-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      <div className="py-2 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={`r-${i}`} className="flex gap-4 py-2 border-b border-neutral-100/50">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={`c-${i}-${j}`} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
