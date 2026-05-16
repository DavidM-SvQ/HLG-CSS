import React, { useContext } from "react";
import { useUrlState } from "../../../hooks/useUrlState";
import { History, Maximize2, Copy, CheckCircle2, ClipboardList, UploadCloud, ChevronUp, ChevronDown, Trophy, X } from "lucide-react";
import { SeasonViewContext } from "./SeasonViewContext";
import { useFilters } from "./useFilters";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";

import { performTextCopy } from "./hooks/useExportHandlers";
import { Button } from "../../ui/button";

export function WinsHistoryTable() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;

  const {
    cn,
    filteredLeaderboard,
  } = context;

  const [isWinsHistoryExpanded, setIsWinsHistoryExpanded] = React.useState(false);
  const [isWinsHistoryCopying, setIsWinsHistoryCopying] = React.useState<string | boolean>(false);
  const [isWinsHistoryTextCopying, setIsWinsHistoryTextCopying] = React.useState(false);
  const winsHistoryRef = React.useRef<HTMLDivElement>(null);

  const [historyTeamFilter, setHistoryTeamFilter] = useUrlState("historyTeamFilter", "all");
  const [historyMonthFilter, setHistoryMonthFilter] = useUrlState("historyMonthFilter", "all");
  const [historySortColumn, setHistorySortColumn] = useUrlState("historySortColumn", "date");
  const [historySortDirection, setHistorySortDirection] = useUrlState<"asc" | "desc">("historySortDirection", "desc");

  const { handleCopyImage: copyWinsImage, handleDownloadImage: downloadWinsImage } = useTableScreenshot(winsHistoryRef);

  const prepareTableForCopy = (container: HTMLElement, subset?: string) => {
    const rows = container.querySelectorAll(".wins-history-row");
    if (subset && subset !== "full") {
      const idx = parseInt(subset.slice(1)) - 1; // "p1" -> 0
      const start = idx * 50;
      const end = start + 50;
      rows.forEach((row, rIdx) => {
        if (rIdx < start || rIdx >= end) row.classList.add("hidden");
      });
    }
  };

  const resetTableAfterCopy = (container: HTMLElement) => {
    container.querySelectorAll(".wins-history-row").forEach((row) => row.classList.remove("hidden"));
  };

  const handleCopyWinsHistory = async (type?: string) => {
    setIsWinsHistoryCopying(type || "full");
    try {
      await copyWinsImage({
        fileName: "export.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff",
        onBeforeCapture: (el) => prepareTableForCopy(el, type),
        onAfterCapture: (el) => resetTableAfterCopy(el)
      });
    } finally {
      setIsWinsHistoryCopying(false);
    }
  };
  const handleCopyWinsHistoryText = async () => {
    performTextCopy(winsHistoryRef, setIsWinsHistoryTextCopying, "winsHistoryTable");
  };
  const handleDownloadWinsHistory = async (type?: string) => {
    await downloadWinsImage({
      fileName: `historial-ganadores${type && type !== "full" ? `-${type}` : ""}.png`,
      scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff",
      onBeforeCapture: (el) => prepareTableForCopy(el, type),
      onAfterCapture: (el) => resetTableAfterCopy(el)
    });
  };

  const { filteredHistoryRaces } = useFilters({
    ...context,
    historyTeamFilter,
    historyMonthFilter,
    historySortColumn,
    historySortDirection
  });

  const numBlocks = Math.ceil(filteredHistoryRaces.length / 50);

  return (
    <>
      <div
        ref={winsHistoryRef}
        className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm group relative mt-8"
      >
        <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
            <History className="w-5 h-5 text-purple-600" />
            Historial de Ganadores por Carrera
          </h3>
          <p className="text-sm text-neutral-500 whitespace-nowrap">
            Relación cronológica de las victorias obtenidas por los equipos en cada carrera.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
            <div className="copy-button-ignore flex items-center gap-2">
              <Button variant="outline"
                onClick={() => setIsWinsHistoryExpanded(true)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                title="Ampliar tabla"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="outline"
                onClick={() => handleCopyWinsHistory("full")}
                disabled={!!isWinsHistoryCopying}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                  isWinsHistoryCopying === "full"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                )}
                title={isWinsHistoryCopying === "full" ? "Copiado" : "Copiar tabla como imagen"}
              >
                {isWinsHistoryCopying === "full" ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              {numBlocks > 1 && (
                <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                  {Array.from({ length: numBlocks }).map((_, i) => {
                    const s = `p${i + 1}`;
                    const start = i * 50 + 1;
                    const end = Math.min((i + 1) * 50, filteredHistoryRaces.length);
                    const label = `${start}-${end}`;
                    const isCopyingThis = isWinsHistoryCopying === s;
                    return (
                      <Button variant="outline"
                        key={s}
                        onClick={() => handleCopyWinsHistory(s as any)}
                        disabled={!!isWinsHistoryCopying}
                        className={cn(
                          "px-2 py-1 text-[10px] font-bold rounded-md border shadow-sm flex items-center gap-1 transition-all",
                          isCopyingThis
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                          isWinsHistoryCopying && !isCopyingThis && "opacity-50 cursor-not-allowed"
                        )}
                        title={`Copiar rango ${label}`}
                      >
                        {isCopyingThis ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {label}
                      </Button>
                    );
                  })}
                </div>
              )}
              <Button variant="ghost" size="icon"
                onClick={handleCopyWinsHistoryText}
                disabled={isWinsHistoryTextCopying}
                className={cn(
                  "flex items-center justify-center px-3 h-8 rounded-lg transition-all shadow-sm text-sm font-medium",
                  isWinsHistoryTextCopying
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                )}
                title="Copiar como texto"
              >
                {isWinsHistoryTextCopying ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <ClipboardList className="w-4 h-4 mr-1.5" />}
                Texto
              </Button>
              <Button variant="outline"
                onClick={() => handleDownloadWinsHistory("full")}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                title="Descargar tabla como imagen"
              >
                <UploadCloud className="w-4 h-4 rotate-180" />
              </Button>
            </div>
            <div className="flex gap-2">
              <select
                value={historyTeamFilter}
                onChange={(e) => setHistoryTeamFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">Todos los equipos</option>
                {[...filteredLeaderboard]
                  .sort((a, b) => a.nombreEquipo.localeCompare(b.nombreEquipo))
                  .map((t) => (
                    <option key={t.nombreEquipo} value={t.nombreEquipo}>
                      {t.nombreEquipo}
                    </option>
                  ))}
              </select>
              <select
                value={historyMonthFilter}
                onChange={(e) => setHistoryMonthFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">Todos los meses</option>
                <option value="0">Enero</option>
                <option value="1">Febrero</option>
                <option value="2">Marzo</option>
                <option value="3">Abril</option>
                <option value="4">Mayo</option>
                <option value="5">Junio</option>
                <option value="6">Julio</option>
                <option value="7">Agosto</option>
                <option value="8">Septiembre</option>
                <option value="9">Octubre</option>
                <option value="10">Noviembre</option>
                <option value="11">Diciembre</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[75vh]">
          <div className="table-responsive-wrapper overflow-auto w-full h-full">
            <table className="w-full min-w-[600px] text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10">
                <tr>
                  <th
                    className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors"
                    onClick={() => {
                      if (historySortColumn === "fecha") {
                        setHistorySortDirection((d: string) => (d === "asc" ? "desc" : "asc"));
                      } else {
                        setHistorySortColumn("fecha");
                        setHistorySortDirection("asc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Fecha {historySortColumn === "fecha" && (historySortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors"
                    onClick={() => {
                      if (historySortColumn === "carrera") {
                        setHistorySortDirection((d: string) => (d === "asc" ? "desc" : "asc"));
                      } else {
                        setHistorySortColumn("carrera");
                        setHistorySortDirection("asc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Carrera {historySortColumn === "carrera" && (historySortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 font-semibold text-right cursor-pointer hover:bg-neutral-100 select-none transition-colors"
                    onClick={() => {
                      if (historySortColumn === "equipo") {
                        setHistorySortDirection((d: string) => (d === "asc" ? "desc" : "asc"));
                      } else {
                        setHistorySortColumn("equipo");
                        setHistorySortDirection("asc");
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Equipo Ganador {historySortColumn === "equipo" && (historySortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 font-semibold text-right cursor-pointer hover:bg-neutral-100 select-none transition-colors"
                    onClick={() => {
                      if (historySortColumn === "puntos") {
                        setHistorySortDirection((d: string) => (d === "asc" ? "desc" : "asc"));
                      } else {
                        setHistorySortColumn("puntos");
                        setHistorySortDirection("desc");
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Puntos {historySortColumn === "puntos" && (historySortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {filteredHistoryRaces.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                      No hay carreras que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  filteredHistoryRaces.map((item: any, idx: number) => {
                    const { race, winnerTeamName, winnerDisplayName, winnerPoints, date } = item;

                    let isHiddenVisual = false;
                    if (isWinsHistoryCopying) {
                      if (isWinsHistoryCopying === "full") isHiddenVisual = false;
                      else {
                        const pageNum = parseInt((isWinsHistoryCopying as string).substring(1));
                        const start = (pageNum - 1) * 50;
                        const end = start + 50;
                        isHiddenVisual = !(idx >= start && idx < end);
                      }
                    }

                    if (isHiddenVisual) return null;

                    return (
                      <tr key={race} className="hover:bg-neutral-50 transition-colors wins-history-row">
                        <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{date}</td>
                        <td className="px-6 py-4 font-medium text-neutral-900">{race}</td>
                        <td className="px-6 py-4 text-right">
                          {winnerTeamName ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 font-bold text-xs border border-yellow-100">
                              <Trophy className="w-3 h-3" />
                              {winnerDisplayName}
                            </span>
                          ) : (
                            <span className="text-neutral-400 italic">Sin resultados</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-neutral-700">
                          {winnerTeamName ? winnerPoints : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isWinsHistoryExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <History className="w-6 h-6 text-purple-600" />
                Historial de Ganadores por Carrera
              </h3>
              <Button variant="outline"
                onClick={() => setIsWinsHistoryExpanded(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="table-responsive-wrapper overflow-auto w-full h-full">
                <table className="w-full min-w-[600px] text-base text-left">
                  <thead className="text-sm text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 font-bold">Fecha</th>
                      <th className="px-6 py-4 font-bold">Carrera</th>
                      <th className="px-6 py-4 font-bold text-right">Equipo Ganador</th>
                      <th className="px-6 py-4 font-bold text-right">Puntos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                    {filteredHistoryRaces.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-neutral-600">{row.date}</td>
                        <td className="px-6 py-4 font-bold text-neutral-900">{row.race}</td>
                        <td className="px-6 py-4 text-right">
                          {row.winnerTeamName ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                              <Trophy className="w-3 h-3" />
                              {row.winnerDisplayName}
                            </span>
                          ) : (
                            <span className="text-neutral-400 italic">Sin resultados</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">
                          {row.winnerTeamName ? row.winnerPoints : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
