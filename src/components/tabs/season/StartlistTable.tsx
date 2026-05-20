import React, { useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { formatNumberSpanish } from "../../../lib/data-processing";
import { Search } from "lucide-react";
import { Button } from "../../ui/button";
import { useVirtualizer } from "@tanstack/react-virtual";

export function StartlistTable(props: any) {
  const {
    startlistScrollRef, startlistSortCol, startlistSortDir, toggleSort,
    filteredRowPagination, filteredRows, memoizedData, 
    setStartlistFilterTeam, setStartlistFilterRondas, setStartlistFilterDiasMin, setStartlistFilterDiasMax, 
    setStartlistFilterDebut, setStartlistFilterPuntosMin, setStartlistFilterPuntosMax, isStartlistCopying,
    isExpanded
  } = props;
  
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => startlistScrollRef.current,
    estimateSize: () => isMobile ? 180 : 40,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0
    ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

  return (
    <>
      <div
        ref={startlistScrollRef}
        className={cn(
          "table-responsive-wrapper overflow-auto border-0 md:border md:border-neutral-200 rounded-lg flex-1 crosshair-container w-full h-full",
          isExpanded ? "max-h-none" : "max-h-[800px]"
        )}
      >
        <table className="w-full text-[13px] text-left block md:table min-w-0 md:min-w-[750px] md:table-fixed border-collapse">
          <thead className="text-[11px] text-neutral-500 uppercase sticky top-0 z-10 bg-neutral-50 shadow-[0_1px_0_0_#e5e5e5] hidden md:table-header-group">
            <tr>
              <th
                className="px-3 py-2 cursor-pointer hover:bg-neutral-100 transition-colors duration-150 group w-[35%] sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5,4px_0_8px_-2px_rgba(0,0,0,0.05)]"
                onClick={() => toggleSort("jugador")}
              >
                <span className="flex items-center gap-1">
                  Equipo{" "}
                  {startlistSortCol === "jugador" &&
                    (startlistSortDir === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th className="px-3 py-2 w-12 text-center text-neutral-400 font-medium">
                Dor
              </th>
              <th className="px-3 py-2 text-neutral-800 font-semibold w-[35%]">
                Ciclista
              </th>
              <th className="px-3 py-2 text-center w-[12%]">País</th>
              <th className="px-3 py-2 text-center w-[12%]">Eq</th>
              <th
                className="px-3 py-2 text-center cursor-pointer hover:bg-neutral-100 transition-colors duration-150 group w-16"
                onClick={() => toggleSort("ronda")}
              >
                <span className="flex justify-center gap-1">
                  Rnd{" "}
                  {startlistSortCol === "ronda" &&
                    (startlistSortDir === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th
                className="px-3 py-2 text-center cursor-pointer hover:bg-neutral-100 transition-colors duration-150 group w-16"
                onClick={() => toggleSort("dias")}
                title="Días de Competición Totales"
              >
                <span className="flex justify-center gap-1 border-b border-dashed border-neutral-300">
                  Día{" "}
                  {startlistSortCol === "dias" &&
                    (startlistSortDir === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th className="px-3 py-2 text-center w-[10%]">Debut</th>
              <th
                className="px-3 py-2 text-right cursor-pointer hover:bg-neutral-100 transition-colors duration-150 group w-20"
                onClick={() => toggleSort("puntos")}
                title="Puntos con los que el ciclista ha llegado a esta carrera"
              >
                <span className="flex justify-end gap-1 border-b border-dashed border-neutral-300">
                  Pts{" "}
                  {startlistSortCol === "puntos" &&
                    (startlistSortDir === "asc" ? "↑" : "↓")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y md:divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group pb-4 md:pb-0 px-2 md:px-0">
            {filteredRows.length === 0 ? (
              <tr className="block">
                <td colSpan={9} className="py-12 border-none block w-full">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-neutral-900 mb-1">
                      No hay resultados
                    </h4>
                    <p className="text-sm text-neutral-500 max-w-sm mb-4">
                      No se han encontrado ciclistas que coincidan con los
                      filtros actuales.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStartlistFilterTeam("All");
                        setStartlistFilterRondas([]);
                        setStartlistFilterDiasMin("");
                        setStartlistFilterDiasMax("");
                        setStartlistFilterDebut("Todos");
                        setStartlistFilterPuntosMin("");
                        setStartlistFilterPuntosMax("");
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {paddingTop > 0 && <tr className="block md:table-row"><td style={{height: `${paddingTop}px`, display: "block"}} colSpan={9} /></tr>}
                {virtualItems.map((virtualRow) => {
                  const i = virtualRow.index;
                  const r = filteredRows[i];
                  const page = filteredRowPagination.pages[i];
                  let isHiddenVisual = false;
                  if (isStartlistCopying) {
                    if (
                      isStartlistCopying !== "full" &&
                      isStartlistCopying !== `p${page}`
                    ) {
                      isHiddenVisual = true;
                    }
                  }

                  const getCyclistPointsColorStyle = (punt: number) => {
                    if (punt === 0 && memoizedData.maxCyclistPoints === 0)
                      return {};
                    const min = memoizedData.minCyclistPoints;
                    const max = memoizedData.maxCyclistPoints;
                    const range = max - min;
                    const val = punt - min;
                    const t =
                      range === 0 ? 1 : Math.max(0, Math.min(1, val / range));
                    return {
                      backgroundColor: `hsla(${t * 120}, 70%, 50%, 0.15)`,
                      color: `hsla(${t * 120}, 80%, 35%, 1)`,
                    };
                  };

                  return (
                    <tr
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className={cn(
                        "group hover:bg-blue-50/50 transition-colors flex flex-row flex-wrap md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 divide-neutral-100",
                        isHiddenVisual && "hidden",
                      )}
                    >
                    <td
                      className="w-full px-4 py-3 md:px-3 md:py-2 font-medium text-neutral-800 truncate sticky left-0 bg-neutral-50/50 md:bg-white z-10 md:shadow-[1px_0_0_0_#e5e5e5,4px_0_8px_-2px_rgba(0,0,0,0.05)] group-hover:bg-blue-50/50 flex justify-between items-center md:table-cell rounded-t-xl md:rounded-none border-b border-neutral-100 md:border-b-0"
                      title={r.jugador}
                    >
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Equipo</span>
                      <span className="truncate">{r.jugador}</span>
                    </td>
                    
                    <td className="w-1/4 md:w-auto px-2 py-2 md:px-3 md:py-2 flex flex-col md:table-cell items-center gap-1 text-center border-r md:border-r-0 border-neutral-100 bg-white md:bg-transparent">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Dor</span>
                      <span className="text-neutral-500 font-mono tabular-nums text-sm md:text-[11px]">{r.dorsal}</span>
                    </td>
                    <td className="w-2/4 md:w-auto px-2 py-2 md:px-3 md:py-2 flex flex-col items-center justify-center md:table-cell gap-1 text-center border-r md:border-r-0 border-neutral-100 bg-white md:bg-transparent">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">País</span>
                      <span className="text-2xl md:text-xl md:text-base leading-none" title={r.paisLetras}>{r.pais}</span>
                    </td>
                    <td className="w-1/4 md:w-auto px-2 py-2 md:px-3 md:py-2 flex flex-col items-center md:table-cell gap-1 text-center bg-white md:bg-transparent">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Eq</span>
                      <span className="font-medium text-neutral-700 truncate" title={r.equipo}>{r.equipo}</span>
                    </td>
                    
                    <td
                      className="w-full px-4 py-3 md:px-3 md:py-2 font-semibold text-neutral-900 truncate flex flex-col md:table-cell gap-1 bg-white border-t md:border-t-0 border-neutral-100 text-center md:text-left"
                      title={r.ciclista}
                    >
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ciclista</span>
                      <span className="text-[15px] md:text-[13px] font-bold">{r.ciclista}</span>
                    </td>
                    
                    <td className="w-1/3 md:w-auto px-2 py-2 md:px-3 md:py-2 flex flex-col md:table-cell justify-between items-center text-center border-r md:border-r-0 border-neutral-100 gap-1 content-center bg-white md:bg-transparent">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ronda</span>
                      <div className="flex-1 flex items-center justify-center">
                        <span className={cn(
                          "font-mono tabular-nums text-sm md:text-[11px] px-2 py-0.5 rounded",
                          (r.ronda === "01" || r.ronda === "02" || r.ronda === "03") ? "bg-yellow-100 text-yellow-800 font-bold" : "text-neutral-600"
                        )}>
                          {r.ronda}
                        </span>
                      </div>
                    </td>
                    <td className="w-1/3 md:w-auto px-2 py-2 md:px-3 md:py-2 flex flex-col md:table-cell justify-between items-center text-center border-r md:border-r-0 border-neutral-100 gap-1 content-center bg-white md:bg-transparent">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Días</span>
                      <div className="flex-1 flex items-center justify-center">
                        <span className={cn(
                          "font-mono tabular-nums text-sm md:text-[11px] px-2 py-0.5 rounded",
                          r.dias === 0 && "bg-red-100 text-red-700 font-bold",
                          r.dias > 0 && r.dias === memoizedData?.maxDias && "bg-green-100 text-green-700 font-bold",
                          r.dias > 0 && r.dias === memoizedData?.minDias && r.dias !== memoizedData?.maxDias && "bg-orange-100 text-orange-800 font-bold",
                          r.dias > 0 && r.dias !== memoizedData?.maxDias && r.dias !== memoizedData?.minDias && "text-neutral-600"
                        )}>
                          {r.dias}
                        </span>
                      </div>
                    </td>
                    <td className="w-1/3 md:w-auto px-2 py-2 md:px-3 md:py-2 flex flex-col md:table-cell justify-between items-center text-center gap-1 content-center bg-white md:bg-transparent">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Debut</span>
                      <div className="flex-1 flex items-center justify-center">
                        {r.debut === "Sí" ? (
                          <span className="bg-blue-100 text-blue-700 border border-blue-300 shadow-sm px-2 py-0.5 md:px-1.5 md:py-0.5 rounded uppercase tracking-wider relative text-xs md:text-[10px] font-bold">
                            Sí
                          </span>
                        ) : <span className="text-neutral-400 md:hidden">-</span>}
                      </div>
                    </td>
                    
                    <td
                      className="w-full px-4 py-3 md:px-3 md:py-2 flex justify-between items-center md:table-cell rounded-b-xl md:rounded-none bg-blue-50/30 md:bg-transparent font-mono tabular-nums text-sm md:text-[11px] font-bold text-neutral-700 text-right border-t md:border-t-0 border-neutral-100"
                      style={
                        r.puntos > 0 ? getCyclistPointsColorStyle(r.puntos) : {}
                      }
                    >
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider" style={{color: "inherit", opacity: 0.7}}>Puntos Previos</span>
                      {r.puntos > 0 ? formatNumberSpanish(r.puntos) : "-"}
                    </td>
                  </tr>
                  );
                })}
                {paddingBottom > 0 && <tr className="block md:table-row"><td style={{height: `${paddingBottom}px`, display: "block"}} colSpan={9} /></tr>}
              </>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
