import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../../lib/utils";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";

export function UndebutedCyclistsTable({
  isUndebutedExpanded,
  undebutedRefContainer,
  undebutedCyclistsSortColumn,
  setUndebutedCyclistsSortColumn,
  undebutedCyclistsSortDirection,
  setUndebutedCyclistsSortDirection,
  filtered,
  isUndebutedCopying,
}: any) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const rowClassName = (idx: number, item: any) => "hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100 copy-row";
  
  return (
    <div
      className={cn(
        "overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin",
        isUndebutedExpanded ? "max-h-none" : "max-h-[750px] px-2 md:px-0",
      )}
    >
      <div ref={undebutedRefContainer} className="table-responsive-wrapper min-h-[300px] overflow-auto w-full max-h-[600px] pb-4">
        <table className="min-w-full text-xs text-left block md:table">
          <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100 hidden md:table-header-group">
            <tr className="divide-x divide-neutral-100">
              <th
                className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                onClick={() => {
                  if (undebutedCyclistsSortColumn === "jugador") {
                    setUndebutedCyclistsSortDirection((d: string) => (d === "asc" ? "desc" : "asc"));
                  } else {
                    setUndebutedCyclistsSortColumn("jugador");
                    setUndebutedCyclistsSortDirection("asc");
                  }
                }}
              >
                <div className="flex items-center gap-1">
                  Jugador{" "}
                  {undebutedCyclistsSortColumn === "jugador" &&
                    (undebutedCyclistsSortDirection === "asc" ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ))}
                </div>
              </th>
              <th
                className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                onClick={() => {
                  if (undebutedCyclistsSortColumn === "ciclista") {
                    setUndebutedCyclistsSortDirection((d: string) => (d === "asc" ? "desc" : "asc"));
                  } else {
                    setUndebutedCyclistsSortColumn("ciclista");
                    setUndebutedCyclistsSortDirection("asc");
                  }
                }}
              >
                <div className="flex items-center gap-1">
                  Ciclista{" "}
                  {undebutedCyclistsSortColumn === "ciclista" &&
                    (undebutedCyclistsSortDirection === "asc" ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ))}
                </div>
              </th>
              <th
                className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                onClick={() => {
                  if (undebutedCyclistsSortColumn === "ronda") {
                    setUndebutedCyclistsSortDirection((d: string) => (d === "asc" ? "desc" : "asc"));
                  } else {
                    setUndebutedCyclistsSortColumn("ronda");
                    setUndebutedCyclistsSortDirection("asc");
                  }
                }}
              >
                <div className="flex items-center gap-1">
                  Ronda{" "}
                  {undebutedCyclistsSortColumn === "ronda" &&
                    (undebutedCyclistsSortDirection === "asc" ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ))}
                </div>
              </th>
            </tr>
          </thead>
          {filtered.length === 0 ? (
            <tbody className="block md:table-row-group">
              <tr className="block">
                <td colSpan={3} className="px-6 py-10 text-center text-neutral-400 italic text-[11px] block w-full">
                  No hay ciclistas sin debutar que coincidan con los filtros.
                </td>
              </tr>
            </tbody>
          ) : (
            <VirtualizedTableBody
              items={filtered}
              scrollElementRef={undebutedRefContainer}
              estimateSize={isMobile ? 100 : 33}
              renderRow={(c, idx) => {
                let isHiddenVisual = false;
                if (isUndebutedCopying) {
                  if (isUndebutedCopying === "full") isHiddenVisual = false;
                  else {
                    const pageNum = parseInt((isUndebutedCopying as string).substring(1));
                    const start = (pageNum - 1) * 50;
                    const end = start + 50;
                    isHiddenVisual = !(idx >= start && idx < end);
                  }
                }
                
                if (isHiddenVisual && isUndebutedCopying) return null;
                
                return (
                  <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] md:divide-x md:divide-neutral-100 copy-row flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 divide-neutral-100">
                    <td className="px-4 py-3 md:py-1 flex flex-col md:table-cell gap-1 bg-neutral-50/50 md:bg-transparent rounded-t-xl md:rounded-none">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Jugador</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-semibold md:font-medium text-neutral-800 md:text-neutral-600 truncate">{c.nombreEquipo}</span>{" "}
                        <span className="text-neutral-400 font-normal text-[9px]">[<span className="font-mono tabular-nums opacity-60">#{}</span>]</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 md:py-1 flex flex-col md:table-cell gap-1">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ciclista</span>
                      <span className="font-bold text-neutral-900 truncate text-sm md:text-[11px]">{c.ciclista}</span>
                    </td>
                    <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell rounded-b-xl md:rounded-none">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ronda</span>
                      <span
                        className={cn(
                          "font-mono tabular-nums",
                          ["01", "02", "03", "1", "2", "3"].includes(c.ronda)
                            ? "bg-yellow-50 md:bg-transparent text-yellow-700 font-bold px-2 py-0.5 rounded md:p-0"
                            : "text-neutral-500",
                        )}
                      >
                        {c.ronda}
                      </span>
                    </td>
                  </tr>
                );
              }}
            />
          )}
        </table>
      </div>
    </div>
  );
}
