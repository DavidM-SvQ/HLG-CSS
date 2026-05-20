import React, { useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface UnscoredTableProps {
  tableRef: React.RefObject<HTMLDivElement | null>;
  isUnscoredExpanded: boolean;
  unscoredCyclistsSortColumn: string;
  unscoredCyclistsSortDirection: "asc" | "desc";
  onSort: (col: string) => void;
  filteredAndSortedData: any[];
  maxCarreras: number;
  maxDias: number;
  isUnscoredCopying: string | boolean;
}

export function UnscoredTable({
  tableRef,
  isUnscoredExpanded,
  unscoredCyclistsSortColumn,
  unscoredCyclistsSortDirection,
  onSort,
  filteredAndSortedData,
  maxCarreras,
  maxDias,
  isUnscoredCopying
}: UnscoredTableProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  const renderSortIcon = (column: string) => {
    if (unscoredCyclistsSortColumn !== column) return null;
    return unscoredCyclistsSortDirection === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5" />
    );
  };

  const responsiveWrapperRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredAndSortedData.length,
    getScrollElement: () => responsiveWrapperRef.current,
    estimateSize: () => isMobile ? 120 : 32,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0
    ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

  return (
    <div
      ref={tableRef}
      className={cn(
        "overflow-hidden bg-white border-t border-neutral-100",
        isUnscoredExpanded ? "max-h-none" : "h-[800px] px-2 md:px-0"
      )}
    >
      <div 
        ref={responsiveWrapperRef}
        className="table-responsive-wrapper overflow-auto w-full max-h-[600px] scrollbar-thin pb-4"
      >
        <table className="w-full text-xs text-left block md:table bg-white rounded-xl shadow-sm md:shadow-none">
          <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100 hidden md:table-header-group">
            <tr className="divide-x divide-neutral-100">
              {[
                { id: "jugador", label: "Jugador" },
                { id: "ciclista", label: "Ciclista" },
                { id: "ronda", label: "Ronda", align: "center" },
                { id: "carreras", label: "Carreras", align: "center", title: "Carreras disputadas" },
                { id: "dias", label: "Días", align: "center", title: "Días de competición" },
              ].map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    "sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap",
                    col.align === "center" && "text-center"
                  )}
                  title={col.title}
                  onClick={() => onSort(col.id)}
                >
                  <div className={cn("flex items-center gap-1", col.align === "center" && "justify-center")}>
                    {col.label} {renderSortIcon(col.id)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y md:divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group">
            {filteredAndSortedData.length === 0 ? (
              <tr className="block">
                <td colSpan={5} className="px-6 py-10 text-center text-neutral-400 italic text-[11px] block w-full">
                  No hay ciclistas sin puntuar que coincidan con los criterios.
                </td>
              </tr>
            ) : (
              <>
                {paddingTop > 0 && <tr className="hidden md:table-row"><td style={{height: `${paddingTop}px`}} colSpan={5} /></tr>}
                {virtualItems.map((virtualRow) => {
                  const idx = virtualRow.index;
                  const c = filteredAndSortedData[idx];
                  let isHiddenVisual = false;
                  if (isUnscoredCopying) {
                    if (isUnscoredCopying === "full") isHiddenVisual = false;
                    else {
                      const pageNum = parseInt((isUnscoredCopying as string).substring(1));
                      const start = (pageNum - 1) * 50;
                      const end = start + 50;
                      isHiddenVisual = !(idx >= start && idx < end);
                    }
                  }

                  if (isHiddenVisual && isUnscoredCopying) return null;

                  return (
                    <tr 
                      key={virtualRow.key} 
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className="hover:bg-neutral-50 transition-colors text-[11px] md:divide-x md:divide-neutral-100 flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 divide-neutral-100"
                    >
                      <td className="px-4 py-3 md:py-1 flex flex-col md:table-cell gap-1 bg-neutral-50/50 md:bg-transparent rounded-t-xl md:rounded-none">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Jugador</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-semibold md:font-medium text-neutral-800 md:text-neutral-600 truncate">{c.nombreEquipo}</span>{" "}
                          <span className="text-neutral-400 font-normal text-[9px]">[#{c.orden}]</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex flex-col md:table-cell gap-1">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ciclista</span>
                        <span className="font-bold text-neutral-900 truncate text-sm md:text-[11px]">{c.ciclista}</span>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ronda</span>
                        <span
                          className={cn(
                            "font-mono tabular-nums",
                            ["01", "02", "03", "1", "2", "3"].includes(c.ronda)
                              ? "bg-yellow-50 md:bg-transparent text-yellow-700 font-bold px-2 py-0.5 rounded md:p-0"
                              : "text-neutral-500"
                          )}
                        >
                          {c.ronda}
                        </span>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Carreras</span>
                        <span
                          className={cn(
                            "font-mono tabular-nums text-sm md:text-[11px]",
                            c.carreras === 0
                              ? "text-red-600 font-bold"
                              : c.carreras === maxCarreras && maxCarreras > 0
                              ? "text-green-600 font-bold"
                              : "text-neutral-600"
                          )}
                        >
                          {c.carreras}
                        </span>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell rounded-b-xl md:rounded-none bg-neutral-50/30 md:bg-transparent">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Días</span>
                        <span
                          className={cn(
                            "font-mono tabular-nums text-sm md:text-[11px]",
                            c.dias === 0
                              ? "text-red-600 font-bold"
                              : c.dias === maxDias && maxDias > 0
                              ? "text-green-600 font-bold"
                              : "text-neutral-600"
                          )}
                        >
                          {c.dias}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {paddingBottom > 0 && <tr className="hidden md:table-row"><td style={{height: `${paddingBottom}px`}} colSpan={5} /></tr>}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
