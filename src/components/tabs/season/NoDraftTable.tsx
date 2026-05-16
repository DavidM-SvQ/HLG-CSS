import React from "react";
import { cn } from "../../../lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

interface NoDraftTableProps {
  tableRef: React.RefObject<HTMLDivElement | null>;
  isExpanded: boolean;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (col: string) => void;
  sortedStats: any[];
  maxPuntos: number;
  minPuntos: number;
}

export function NoDraftTable({
  tableRef,
  isExpanded,
  sortColumn,
  sortDirection,
  onSort,
  sortedStats,
  maxPuntos,
  minPuntos
}: NoDraftTableProps) {
  
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5" />
    );
  };

  return (
    <div
      ref={tableRef}
      className={cn(
        "overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 scrollbar-thin flex justify-center",
        isExpanded ? "max-h-none" : "h-[800px]"
      )}
    >
      <div className="table-responsive-wrapper overflow-auto w-full max-h-[600px]">
        <table className="w-full min-w-full md:min-w-[700px]">
          <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
            <tr className="divide-x divide-neutral-100">
              {[
                { id: "pos", label: "Pos" },
                { id: "nombre", label: "Ciclista", align: "left" },
                { id: "equipo", label: "Equipo" },
                { id: "pais", label: "País" },
                { id: "victorias", label: "Vic" },
                { id: "carreras", label: "Carr" },
                { id: "ppc", label: "P/C" },
                { id: "puntos", label: "Pts" },
              ].map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    "sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200",
                    col.align === "left" ? "text-left" : "text-center"
                  )}
                  onClick={() => onSort(col.id)}
                >
                  <div className={cn("flex items-center gap-1", col.align === "left" ? "justify-start" : "justify-center")}>
                    {col.label} {renderSortIcon(col.id)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
            {sortedStats.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-neutral-400 italic">
                  No hay ciclistas no elegidos que coincidan con los criterios.
                </td>
              </tr>
            ) : (
              sortedStats.map((s) => (
                <tr
                  key={s.name}
                  className="no-draft-row hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100"
                >
                  <td className="px-4 py-1 text-center">
                    <span
                      className={cn(
                        "w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[9px] font-bold",
                        s.originalPos === 1
                          ? "bg-yellow-100 text-yellow-700"
                          : s.originalPos === 2
                          ? "bg-neutral-200 text-neutral-600"
                          : s.originalPos === 3
                          ? "bg-orange-100 text-orange-700"
                          : "bg-neutral-100 text-neutral-500"
                      )}
                    >
                      {s.originalPos}
                    </span>
                  </td>
                  <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                    {s.name}
                  </td>
                  <td className="px-4 py-1 text-neutral-600 text-center whitespace-nowrap">
                    {s.data.equipoBreve}
                  </td>
                  <td className="px-4 py-1 text-lg text-center">{s.data.pais}</td>
                  <td
                    className={cn(
                      "px-4 py-1 text-center",
                      s.data.victorias > 0 ? "text-green-600 font-bold" : "text-neutral-400"
                    )}
                  >
                    {s.data.victorias}
                  </td>
                  <td className="px-4 py-1 text-center text-neutral-600">
                    {s.numCarreras}
                  </td>
                  <td className="px-4 py-1 text-center text-neutral-600">
                    {s.ppc.toFixed(1)}
                  </td>
                  <td
                    className="px-4 py-1 text-center font-black"
                    style={{
                      color: `hsl(${45 + ((s.data.puntos - minPuntos) / (maxPuntos - minPuntos || 1)) * 75}, 80%, 40%)`,
                    }}
                  >
                    {s.data.puntos}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
