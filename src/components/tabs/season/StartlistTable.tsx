import React from "react";
import { cn } from "../../../lib/utils";
import { formatNumberSpanish } from "../../../lib/data-processing";
import { Search } from "lucide-react";
import { Button } from "../../ui/button";


export function StartlistTable(props: any) {
  const {
    startlistScrollRef, startlistSortCol, startlistSortDir, toggleSort,
    filteredRowPagination, filteredRows, memoizedData, 
    setStartlistFilterTeam, setStartlistFilterRondas, setStartlistFilterDiasMin, setStartlistFilterDiasMax, 
    setStartlistFilterDebut, setStartlistFilterPuntosMin, setStartlistFilterPuntosMax, isStartlistCopying
  } = props;

  return (
    <>
      <div
        ref={startlistScrollRef}
        className="table-responsive-wrapper overflow-auto border border-neutral-200 rounded-lg flex-1 crosshair-container max-h-[800px]"
      >
        <table className="w-full min-w-[750px] text-[13px] text-left table-fixed">
          <thead className="text-[11px] text-neutral-500 uppercase sticky top-0 z-10 bg-neutral-50 shadow-[0_1px_0_0_#e5e5e5]">
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
          <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 border-none">
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
              filteredRows.map((r, i) => {
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
                    key={i}
                    className={cn(
                      "group hover:bg-blue-50/50 transition-colors",
                      isHiddenVisual && "hidden",
                    )}
                  >
                    <td
                      className="px-3 py-2 font-medium text-neutral-800 truncate sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5,4px_0_8px_-2px_rgba(0,0,0,0.05)] group-hover:bg-blue-50/50"
                      title={r.jugador}
                    >
                      {r.jugador}
                    </td>
                    <td className="px-3 py-2 text-center text-neutral-400 font-mono text-[11px]">
                      {r.dorsal}
                    </td>
                    <td
                      className="px-3 py-2 font-semibold text-neutral-900 truncate"
                      title={r.ciclista}
                    >
                      {r.ciclista}
                    </td>
                    <td className="px-3 py-2 text-center truncate">
                      <span title={r.paisLetras}>{r.pais}</span>
                    </td>
                    <td
                      className="px-3 py-2 text-center font-medium text-neutral-600 truncate"
                      title={r.equipo}
                    >
                      {r.equipo}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-center font-mono text-[11px]",
                        (r.ronda === "01" ||
                          r.ronda === "02" ||
                          r.ronda === "03") &&
                          "bg-yellow-100 text-yellow-800 font-bold",
                      )}
                    >
                      {r.ronda}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-center font-mono text-[11px]",
                        r.dias === 0 && "bg-red-100 text-red-700 font-bold",
                        r.dias > 0 &&
                          r.dias === memoizedData?.maxDias &&
                          "bg-green-100 text-green-700 font-bold",
                        r.dias > 0 &&
                          r.dias === memoizedData?.minDias &&
                          r.dias !== memoizedData?.maxDias &&
                          "bg-orange-100 text-orange-800 font-bold",
                      )}
                    >
                      {r.dias}
                    </td>
                    <td className="px-3 py-2 text-center text-[10px] font-bold">
                      {r.debut === "Sí" && (
                        <span className="bg-blue-100 text-blue-700 border border-blue-300 shadow-sm px-1.5 py-0.5 rounded uppercase tracking-wider relative">
                          Sí
                        </span>
                      )}
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono text-[11px] font-bold text-neutral-700"
                      style={
                        r.puntos > 0 ? getCyclistPointsColorStyle(r.puntos) : {}
                      }
                    >
                      {r.puntos > 0 ? formatNumberSpanish(r.puntos) : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
