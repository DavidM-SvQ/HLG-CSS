import React from "react";
import { ChevronUp, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { getVal } from "../../../lib/data-processing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { ReportCard } from "../../ui/ReportCard";

export function InfoRacesTable({
  setInfoSubTab,
  racesTableRef,
  isRacesExpanded,
  setIsRacesExpanded,
  handleCopyRaces,
  isRacesTextCopying,
  handleCopyRacesImage,
  isRacesImageCopying,
  handleDownloadRacesImage,
  racesFilter,
  setRacesFilter,
  racesCategoryFilter,
  setRacesCategoryFilter,
  racesMonthFilter,
  setRacesMonthFilter,
  files,
  setInfoCarrerasSortDir,
  infoCarrerasSortDir,
  memoizedRacesData,
  raceWinners,
  now
}: any) {
  return (
    <ReportCard
      title={
        <div className="flex items-center gap-3">
          <Button variant="outline"
            onClick={() => setInfoSubTab("menu")}
            className="text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <ChevronUp className="w-5 h-5 -rotate-90" />
          </Button>
          Detalle de carreras
        </div>
      }
      filename="detalle-carreras"
      ref={racesTableRef}
      toolbarProps={{
        isExpanded: isRacesExpanded,
        onExpand: () => setIsRacesExpanded(!isRacesExpanded),
        onCopyText: handleCopyRaces,
        isTextCopying: isRacesTextCopying,
        onCopyImage: handleCopyRacesImage,
        isImageCopying: isRacesImageCopying,
        onDownloadImage: handleDownloadRacesImage
      }}
      headerExtra={
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={racesFilter}
            onValueChange={(value) => setRacesFilter(value as any)}
          >
            <SelectTrigger className="w-full sm:w-48 bg-white border-neutral-300 focus:ring-blue-500 rounded-lg">
              <SelectValue placeholder="Todas las carreras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las carreras</SelectItem>
              <SelectItem value="finished">Ya disputadas</SelectItem>
              <SelectItem value="upcoming">Por disputar</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={racesCategoryFilter}
            onValueChange={(value) => setRacesCategoryFilter(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full sm:w-48 bg-white border-neutral-300 focus:ring-blue-500 rounded-lg">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {[
                ...new Set(
                  files.carreras.data?.map((r: any) =>
                    getVal(r, "Categoría")?.trim(),
                  ),
                ),
              ]
                .filter(Boolean)
                .map((c) => (
                  <SelectItem key={c as string} value={c as string}>
                    {c as string}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select
            value={racesMonthFilter}
            onValueChange={(value) => setRacesMonthFilter(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full sm:w-48 bg-white border-neutral-300 focus:ring-blue-500 rounded-lg">
              <SelectValue placeholder="Todos los meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los meses</SelectItem>
              {[
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre",
              ].map((m, i) => (
                <SelectItem
                  key={m}
                  value={(i + 1).toString().padStart(2, "0")}
                >
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div
        className={cn(
          "relative bg-white flex flex-col",
          isRacesExpanded
            ? "h-auto"
            : "h-[600px]",
        )}
      >
        {isRacesExpanded && (
          <Button variant="outline"
            onClick={() => setIsRacesExpanded(false)}
            className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
          >
            <X className="w-6 h-6" />
          </Button>
        )}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="table-responsive-wrapper min-h-[300px] overflow-auto w-full md:px-0 px-2 pt-2 h-full pb-4 max-w-full">
            <table className="w-full text-sm text-left bg-transparent md:bg-white rounded-xl shadow-sm md:shadow-none md:rounded-lg block md:table border-collapse">
              <thead className="text-xs text-neutral-500 uppercase border-b border-neutral-100 sticky top-0 z-10 shadow-sm hidden md:table-header-group bg-neutral-50 opacity-100">
                <tr className="bg-neutral-50">
                  <th className="px-6 py-3 bg-neutral-50 z-20">Carrera</th>
                  <th className="px-6 py-3 bg-neutral-50 z-20">Categoría</th>
                  <th
                    className="px-6 py-3 bg-neutral-50 z-20 cursor-pointer hover:bg-neutral-100 select-none transition-colors"
                    onClick={() => setInfoCarrerasSortDir((d: any) => d === "asc" ? "desc" : "asc")}
                  >
                    Fecha <span className="text-neutral-400">{infoCarrerasSortDir === "asc" ? "↑" : "↓"}</span>
                  </th>
                  <th className="px-6 py-3 bg-neutral-50 z-20 text-right">Ganador</th>
                </tr>
              </thead>
              <tbody className="bg-transparent md:bg-white md:divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group">
                {memoizedRacesData?.map((r: any, idx: number) => {
                  const fechaFin = getVal(r, "Fecha");
                  const parts = fechaFin?.toString().split(/[-/]/) || [];
                  let date: Date | null = null;
                  let isFinished = false;
                  if (parts.length === 3) {
                    if (parts[0].length === 4) {
                      date = new Date(
                        parseInt(parts[0]),
                        parseInt(parts[1]) - 1,
                        parseInt(parts[2]),
                      );
                    } else {
                      date = new Date(
                        parseInt(parts[2]),
                        parseInt(parts[1]) - 1,
                        parseInt(parts[0]),
                      );
                    }
                    isFinished = date.getTime() < now;
                  }
                  const raceName = getVal(r, "Carrera");
                  const winner = raceWinners[raceName];

                  return (
                    <tr
                      key={idx}
                      className={cn(
                        "transition-colors text-[11px] md:divide-x divide-neutral-100 flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none min-h-[44px]",
                        isFinished
                          ? "bg-neutral-50/50 text-neutral-400 opacity-80"
                          : "hover:bg-neutral-50"
                      )}
                    >
                      <td
                        className={cn(
                          "px-4 py-3 md:py-2.5 font-medium flex justify-between items-center md:table-cell gap-2 rounded-t-xl md:rounded-none bg-neutral-50/50 md:bg-transparent",
                          isFinished
                            ? "text-neutral-500"
                            : "text-neutral-900",
                        )}
                      >
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Carrera</span>
                        <div className="text-right md:text-left">{raceName}</div>
                      </td>
                      <td className="px-4 py-3 md:py-2.5 flex justify-between items-center md:table-cell gap-2">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Categoría</span>
                        <div className="text-right md:text-left">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-md text-xs font-semibold",
                              isFinished
                                ? "bg-neutral-200 text-neutral-500"
                                : "bg-neutral-100 text-neutral-600",
                            )}
                          >{getVal(r, "Categoría")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 md:py-2.5 font-mono tabular-nums flex justify-between items-center md:table-cell gap-2 border-t border-neutral-100 md:border-none">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Fecha</span>
                        <div className="text-right md:text-left text-sm">{fechaFin}</div>
                      </td>
                      <td className="px-4 py-3 md:py-2.5 text-right font-bold text-blue-600 flex justify-between items-center md:table-cell gap-2 border-t border-neutral-100 md:border-none rounded-b-xl md:rounded-none bg-blue-50/30 md:bg-transparent">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ganador</span>
                        <div className="text-right">{winner || "-"}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ReportCard>
  );
}
