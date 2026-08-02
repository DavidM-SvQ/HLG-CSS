import React, { useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface NoDraftTableProps {
  tableRef: React.RefObject<HTMLDivElement | null>;
  isExpanded: boolean;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (col: string) => void;
  sortedStats: any[];
  maxPuntos: number;
  minPuntos: number;
  isCopying?: string | boolean | null;
}

export function NoDraftTable({
  tableRef,
  isExpanded,
  sortColumn,
  sortDirection,
  onSort,
  sortedStats,
  maxPuntos,
  minPuntos,
  isCopying
}: NoDraftTableProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5" />
    );
  };

  const responsiveWrapperRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: sortedStats.length,
    getScrollElement: () => responsiveWrapperRef.current,
    estimateSize: () => isMobile ? 180 : 32,
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
        "overflow-hidden bg-white border-t border-neutral-100 flex justify-center",
        isExpanded ? "max-h-none" : "h-[800px] px-2 md:px-0"
      )}
    >
      <div 
        ref={responsiveWrapperRef}
        className="table-responsive-wrapper min-h-[300px] overflow-auto w-full max-h-[600px] scrollbar-thin pb-6"
      >
        <table className="w-full text-xs text-left block md:table min-w-0 md:min-w-[700px]">
          <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100 hidden md:table-header-group">
            <tr className="divide-x divide-neutral-100">
              {[
                { id: "pos", label: "Pos" },
                { id: "nombre", label: "Ciclista", align: "left" },
                { id: "equipo", label: "Equipo" },
                { id: "pais", label: "País" },
                { id: "victorias", label: "Vic" },
                { id: "carreras", label: "Carr" },
                { id: "dias", label: "Días" },
                { id: "ppc", label: "P/C" },
                { id: "ppd", label: "P/D" },
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
          <tbody className="divide-y md:divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group">
            {sortedStats.length === 0 ? (
              <tr className="block flex items-center justify-center">
                <td colSpan={10} className="px-6 py-10 text-center text-neutral-400 italic block w-full">
                  No hay ciclistas no elegidos que coincidan con los criterios.
                </td>
              </tr>
            ) : isCopying ? (
              // BYPASS VIRTUALIZER PARA LA CAPTURA DE IMAGEN
              (isCopying === "full" ? sortedStats : typeof isCopying === 'string' && isCopying.startsWith('p') ? sortedStats.slice((parseInt(isCopying.substring(1)) - 1) * 50, parseInt(isCopying.substring(1)) * 50) : sortedStats).map((s, idx) => (
                    <tr
                      key={s.name}
                      data-index={idx}
                      className="no-draft-row hover:bg-neutral-50 transition-colors text-[11px] md:divide-x md:divide-neutral-100 flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 divide-neutral-100"
                    >
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell gap-2 rounded-t-xl md:rounded-none bg-neutral-50/50 md:bg-transparent">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Posición Original</span>
                        <div className="flex justify-center md:block">
                          <span
                            className={cn(
                              "w-6 h-6 md:w-5 md:h-5 rounded-full flex items-center justify-center text-xs md:text-[9px] font-bold shadow-sm md:shadow-none",
                              s.originalPos === 1
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                : s.originalPos === 2
                                ? "bg-neutral-200 text-neutral-700 border border-neutral-300"
                                : s.originalPos === 3
                                ? "bg-orange-100 text-orange-700 border border-orange-200"
                                : "bg-neutral-100 text-neutral-500"
                            )}
                          >
                            {s.originalPos}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex flex-col md:table-cell gap-1">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ciclista</span>
                        <span className="font-bold text-neutral-900 text-[13px] md:text-[11px] truncate md:whitespace-nowrap">{s.name}</span>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell text-center">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Equipo</span>
                        <span className="text-neutral-900 font-semibold md:font-semibold truncate md:whitespace-nowrap">{s.data.equipoBreve}</span>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell text-center">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">País</span>
                        <span className="text-xl md:text-lg">{s.data.pais}</span>
                      </td>
                      
                      <td className="pt-2 pb-0 px-4 md:p-0 flex flex-row md:table-cell gap-2 border-none md:border-solid">
                        <div className="flex-1 flex justify-between items-center md:justify-center md:h-full md:px-4 md:py-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Victorias</span>
                          <span
                            className={cn(
                              "text-center text-[13px] md:text-[11px]",
                              s.data.victorias > 0 ? "text-green-700 font-bold bg-green-50 md:bg-transparent rounded" : "text-neutral-900 font-medium"
                            )}
                          >
                            {s.data.victorias}
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-2 px-4 md:p-0 flex flex-row md:table-cell gap-2 border-none md:border-solid">
                        <div className="flex-1 flex justify-between items-center md:justify-center md:h-full md:px-4 md:py-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Carreras</span>
                          <span className="text-center text-neutral-900 font-medium font-mono tabular-nums text-[13px] md:text-[11px]">
                            {s.numCarreras}
                          </span>
                        </div>
                      </td>

                      <td className="py-2 px-4 md:p-0 flex flex-row md:table-cell gap-2 border-none md:border-solid">
                        <div className="flex-1 flex justify-between items-center md:justify-center md:h-full md:px-4 md:py-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Días</span>
                          <span className="text-center text-neutral-900 font-medium font-mono tabular-nums text-[13px] md:text-[11px]">
                            {s.dias || 0}
                          </span>
                        </div>
                      </td>

                      <td className="pb-2 pt-0 px-4 md:p-0 flex flex-row md:table-cell gap-2 border-none md:border-solid">
                        <div className="flex-1 flex justify-between items-center md:justify-center md:h-full md:px-4 md:py-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ptos/Carrera</span>
                          <span className="text-center text-neutral-900 font-medium font-mono tabular-nums text-[13px] md:text-[11px]">
                            {s.ppc.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      <td className="pb-2 pt-0 px-4 md:p-0 flex flex-row md:table-cell gap-2 border-none md:border-solid">
                        <div className="flex-1 flex justify-between items-center md:justify-center md:h-full md:px-4 md:py-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ptos/Día</span>
                          <span className="text-center text-neutral-900 font-medium font-mono tabular-nums text-[13px] md:text-[11px]">
                            {(s.ppd || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell rounded-b-xl md:rounded-none bg-blue-50/30 md:bg-transparent border-t border-neutral-100 md:border-none">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Puntos</span>
                        <div className="flex justify-end md:block">
                          <span
                            className="text-right md:text-center font-black font-mono tabular-nums text-[14px] md:text-[11px]"
                            style={{
                              color: `hsl(${45 + ((s.data.puntos - minPuntos) / (maxPuntos - minPuntos || 1)) * 75}, 80%, 40%)`,
                            }}
                          >
                            {s.data.puntos}
                          </span>
                        </div>
                      </td>
                    </tr>
              ))
            ) : (
              <>
                {paddingTop > 0 && <tr className="hidden md:table-row"><td style={{height: `${paddingTop}px`}} colSpan={10} /></tr>}
                {virtualItems.map((virtualRow) => {
                  const s = sortedStats[virtualRow.index];
                  return (
                    <tr
                      key={s.name}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className="no-draft-row hover:bg-neutral-50 transition-colors text-[11px] md:divide-x md:divide-neutral-100 flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 divide-neutral-100"
                    >
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell gap-2 rounded-t-xl md:rounded-none bg-neutral-50/50 md:bg-transparent">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Posición Original</span>
                        <div className="flex justify-center md:block">
                          <span
                            className={cn(
                              "w-6 h-6 md:w-5 md:h-5 rounded-full flex items-center justify-center text-xs md:text-[9px] font-bold shadow-sm md:shadow-none",
                              s.originalPos === 1
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                : s.originalPos === 2
                                ? "bg-neutral-200 text-neutral-700 border border-neutral-300"
                                : s.originalPos === 3
                                ? "bg-orange-100 text-orange-700 border border-orange-200"
                                : "bg-neutral-100 text-neutral-500"
                            )}
                          >
                            {s.originalPos}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex flex-col md:table-cell gap-1">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ciclista</span>
                        <span className="font-bold text-neutral-900 text-[13px] md:text-[11px] truncate md:whitespace-nowrap">{s.name}</span>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell text-center">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Equipo</span>
                        <span className="text-neutral-600 font-medium md:font-normal truncate md:whitespace-nowrap">{s.data.equipoBreve}</span>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell text-center">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">País</span>
                        <span className="text-xl md:text-lg">{s.data.pais}</span>
                      </td>
                      
                      <td className="pt-2 pb-0 px-4 md:p-0 flex flex-row md:table-cell gap-2 border-none md:border-solid">
                        <div className="flex-1 flex justify-between items-center md:justify-center md:h-full md:px-4 md:py-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Victorias</span>
                          <span
                            className={cn(
                              "text-center text-[13px] md:text-[11px]",
                              s.data.victorias > 0 ? "text-green-600 font-bold bg-green-50 md:bg-transparent px-2 py-0.5 rounded" : "text-neutral-400"
                            )}
                          >
                            {s.data.victorias}
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-2 px-4 md:p-0 flex flex-row md:table-cell gap-2 border-none md:border-solid">
                        <div className="flex-1 flex justify-between items-center md:justify-center md:h-full md:px-4 md:py-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Carreras</span>
                          <span className="text-center text-neutral-600 font-mono tabular-nums text-[13px] md:text-[11px]">
                            {s.numCarreras}
                          </span>
                        </div>
                      </td>

                      <td className="py-2 px-4 md:p-0 flex flex-row md:table-cell gap-2 border-none md:border-solid">
                        <div className="flex-1 flex justify-between items-center md:justify-center md:h-full md:px-4 md:py-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Días</span>
                          <span className="text-center text-neutral-600 font-mono tabular-nums text-[13px] md:text-[11px]">
                            {s.dias || 0}
                          </span>
                        </div>
                      </td>

                      <td className="pb-2 pt-0 px-4 md:p-0 flex flex-row md:table-cell gap-2 border-none md:border-solid">
                        <div className="flex-1 flex justify-between items-center md:justify-center md:h-full md:px-4 md:py-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ptos/Carrera</span>
                          <span className="text-center text-neutral-600 font-mono tabular-nums text-[13px] md:text-[11px]">
                            {s.ppc.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      <td className="pb-2 pt-0 px-4 md:p-0 flex flex-row md:table-cell gap-2 border-none md:border-solid">
                        <div className="flex-1 flex justify-between items-center md:justify-center md:h-full md:px-4 md:py-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ptos/Día</span>
                          <span className="text-center text-neutral-600 font-mono tabular-nums text-[13px] md:text-[11px]">
                            {(s.ppd || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell rounded-b-xl md:rounded-none bg-blue-50/30 md:bg-transparent border-t border-neutral-100 md:border-none">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Puntos</span>
                        <div className="flex justify-end md:block">
                          <span
                            className="text-right md:text-center font-black font-mono tabular-nums text-[14px] md:text-[11px]"
                            style={{
                              color: `hsl(${45 + ((s.data.puntos - minPuntos) / (maxPuntos - minPuntos || 1)) * 75}, 80%, 40%)`,
                            }}
                          >
                            {s.data.puntos}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paddingBottom > 0 && <tr className="hidden md:table-row"><td style={{height: `${paddingBottom}px`}} colSpan={10} /></tr>}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
