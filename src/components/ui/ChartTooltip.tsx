import React from "react";
import { cn } from "../../lib/utils";

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  title?: string;
  formatter?: (value: any, name: string, entry: any, index: number) => React.ReactNode;
  labelFormatter?: (label: any, payload: any[]) => React.ReactNode;
}

export function ChartTooltip({
  active,
  payload,
  label,
  title,
  formatter,
  labelFormatter
}: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 border border-neutral-200 rounded-xl shadow-lg z-[100] min-w-[220px] transition-all duration-200">
        <div className="mb-3 border-b border-neutral-100 pb-2">
          {title ? (
            <p className="font-bold text-neutral-800 text-sm">{title}</p>
          ) : labelFormatter ? (
            <div className="font-bold text-neutral-800 text-sm">{labelFormatter(label, payload)}</div>
          ) : (
            <p className="font-bold text-neutral-800 text-sm">{label}</p>
          )}
        </div>
        <div className="space-y-2">
          {payload.map((item: any, index: number) => {
            const value = formatter ? formatter(item.value, item.name, item, index) : item.value;
            const name = item.name || item.dataKey;
            const color = item.color || item.fill || "#3b82f6";

            return (
              <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-6 text-xs transition-opacity hover:opacity-80">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-neutral-500 font-medium truncate max-w-[150px]">{name}:</span>
                </div>
                <span className="font-bold text-neutral-900 tabular-nums">
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
