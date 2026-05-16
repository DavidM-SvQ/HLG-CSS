import React from "react";
import { cn } from "../../../lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

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
  
  const renderSortIcon = (column: string) => {
    if (unscoredCyclistsSortColumn !== column) return null;
    return unscoredCyclistsSortDirection === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5" />
    );
  };

  return (
    <div
      ref={tableRef}
      className={cn(
        "overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 scrollbar-thin",
        isUnscoredExpanded ? "max-h-none" : "h-[800px]"
      )}
    >
      <div className="table-responsive-wrapper overflow-auto w-full max-h-[600px]">
        <table className="min-w-full text-xs text-left bg-white rounded-xl shadow-sm">
          <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
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
          <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-neutral-400 italic text-[11px]">
                  No hay ciclistas sin puntuar que coincidan con los criterios.
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((c, idx) => {
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
                  <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100">
                    <td className="px-4 py-1 text-neutral-600 whitespace-nowrap">
                      <span className="font-medium">{c.nombreEquipo}</span>{" "}
                      <span className="text-neutral-400 font-normal text-[9px]">[#{c.orden}]</span>
                    </td>
                    <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                      {c.ciclista}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-1 text-center font-mono whitespace-nowrap",
                        ["01", "02", "03", "1", "2", "3"].includes(c.ronda)
                          ? "bg-yellow-50 text-yellow-700 font-bold"
                          : "text-neutral-500"
                      )}
                    >
                      {c.ronda}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-1 text-center font-mono whitespace-nowrap",
                        c.carreras === 0
                          ? "text-red-600 font-bold"
                          : c.carreras === maxCarreras && maxCarreras > 0
                          ? "text-green-600 font-bold"
                          : "text-neutral-600"
                      )}
                    >
                      {c.carreras}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-1 text-center font-mono whitespace-nowrap",
                        c.dias === 0
                          ? "text-red-600 font-bold"
                          : c.dias === maxDias && maxDias > 0
                          ? "text-green-600 font-bold"
                          : "text-neutral-600"
                      )}
                    >
                      {c.dias}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
