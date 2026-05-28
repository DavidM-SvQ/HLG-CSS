import React, { useContext, useState, useEffect } from "react";
import { History, Maximize2, Copy, CheckCircle2, ClipboardList, UploadCloud, ChevronUp, ChevronDown, Trophy, X } from "lucide-react";
import { SeasonViewContext } from "./SeasonViewContext";
import { useFilters } from "./useFilters";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { useVirtualizer } from "@tanstack/react-virtual";

import { performTextCopy } from "./hooks/useExportHandlers";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { Button } from "../../ui/button";

export function WinsHistoryTable() {
  const context = useContext(SeasonViewContext)!;

  const {
    cn,
    filteredLeaderboard,
    historyTeamFilter, setHistoryTeamFilter,
    historyMonthFilter, setHistoryMonthFilter,
    historySortColumn, setHistorySortColumn,
    historySortDirection, setHistorySortDirection,
    formatNumberSpanish
  } = context;

  const [isWinsHistoryExpanded, setIsWinsHistoryExpanded] = React.useState(false);
  const [isWinsHistoryCopying, setIsWinsHistoryCopying] = React.useState<string | boolean>(false);
  const [isWinsHistoryTextCopying, setIsWinsHistoryTextCopying] = React.useState(false);
  const winsHistoryRef = React.useRef<HTMLDivElement>(null);
  const responsiveWrapperRef = React.useRef<HTMLDivElement>(null);
  const expandedWrapperRef = React.useRef<HTMLDivElement>(null);
  
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        fileName: "export.png", scale: 2, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff",
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
    setIsWinsHistoryCopying(type || "full");
    try {
      await downloadWinsImage({
        fileName: `historial-ganadores${type && type !== "full" ? `-${type}` : ""}.png`,
        scale: 2, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff",
        onBeforeCapture: (el) => prepareTableForCopy(el, type),
        onAfterCapture: (el) => resetTableAfterCopy(el)
      });
    } finally {
      setIsWinsHistoryCopying(false);
    }
  };

  const { filteredHistoryRaces } = useFilters({
    ...context,
    historyTeamFilter,
    historyMonthFilter,
    historySortColumn,
    historySortDirection
  });

  const numBlocks = Math.ceil(filteredHistoryRaces.length / 50);

  const rowVirtualizer = useVirtualizer({
    count: filteredHistoryRaces.length,
    getScrollElement: () => responsiveWrapperRef.current,
    estimateSize: () => isMobile ? 120 : 52,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0
    ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

  const rowExpandedVirtualizer = useVirtualizer({
    count: filteredHistoryRaces.length,
    getScrollElement: () => expandedWrapperRef.current,
    estimateSize: () => isMobile ? 120 : 52,
    overscan: 10,
  });

  const virtualExpandedItems = rowExpandedVirtualizer.getVirtualItems();
  const expandedPaddingTop = virtualExpandedItems.length > 0 ? virtualExpandedItems[0].start : 0;
  const expandedPaddingBottom = virtualExpandedItems.length > 0
    ? rowExpandedVirtualizer.getTotalSize() - virtualExpandedItems[virtualExpandedItems.length - 1].end
    : 0;

  return (
    <>
      <div
        ref={winsHistoryRef}
        className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm group relative mt-8"
      >
        <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 flex-wrap md:flex-nowrap">
            <History className="w-5 h-5 text-purple-600" />
            Historial de Ganadores por Carrera
          </h3>
          <p className="text-sm text-neutral-500 max-w-full">
            Relación cronológica de las victorias obtenidas por los equipos en cada carrera.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
            <ExportToolbar
              isExpanded={false}
              onExpand={() => setIsWinsHistoryExpanded(true)}
              onCopyImage={handleCopyWinsHistory}
              isImageCopying={isWinsHistoryCopying}
              onDownloadImage={handleDownloadWinsHistory}
              onCopyText={handleCopyWinsHistoryText}
              isTextCopying={isWinsHistoryTextCopying}
              textCopyLabel="Texto"
              useClipboardIconForText={true}
              filename="historial-ganadores"
              numBlocks={numBlocks}
            />
            <div className="flex gap-2 flex-wrap">
              <select
                value={historyTeamFilter}
                onChange={(e) => setHistoryTeamFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 min-w-[140px]"
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
                className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 min-w-[140px]"
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
        <div className="overflow-x-auto overflow-y-auto max-h-[75vh] px-2 md:px-0">
          <div ref={responsiveWrapperRef} className="table-responsive-wrapper min-h-[300px] overflow-auto w-full h-full pb-4">
            <table className="w-full text-sm text-left block md:table min-w-0 md:min-w-[600px]">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10 hidden md:table-header-group">
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
              <tbody className="divide-y md:divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group">
                {filteredHistoryRaces.length === 0 ? (
                  <tr className="block flex items-center justify-center">
                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-500 w-full block">
                      No hay carreras que coincidan con los filtros.
                    </td>
                  </tr>
                ) : isWinsHistoryCopying ? (
                    // BYPASS VIRTUALIZER
                    (isWinsHistoryCopying === "full" ? filteredHistoryRaces : typeof isWinsHistoryCopying === 'string' && isWinsHistoryCopying.startsWith('p') ? filteredHistoryRaces.slice((parseInt(isWinsHistoryCopying.substring(1)) - 1) * 50, parseInt(isWinsHistoryCopying.substring(1)) * 50) : filteredHistoryRaces).map((item, idx) => {
                      const { race, winnerTeamName, winnerDisplayName, winnerPoints, date } = item;
                      return (
                        <tr key={race} data-index={idx} className="hover:bg-neutral-50 transition-colors wins-history-row flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 divide-neutral-100">
                          <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell gap-4 rounded-t-xl md:rounded-none bg-neutral-50/50 md:bg-transparent">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Fecha</span>
                            <span className="text-neutral-500 font-mono tabular-nums text-sm md:text-xs bg-white md:bg-transparent px-2 py-1 md:p-0 rounded border md:border-0 border-neutral-200 shrink-0">{date}</span>
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4 flex flex-col md:table-cell gap-1">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Carrera</span>
                            <span className="font-semibold md:font-medium text-neutral-900 line-clamp-2">{race}</span>
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell text-right">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Equipo Ganador</span>
                            {winnerTeamName ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-2.5 md:py-1 rounded-full bg-yellow-50 text-yellow-700 font-bold text-xs border border-yellow-100 shadow-sm md:shadow-none whitespace-nowrap overflow-hidden text-ellipsis truncate max-w-[200px] md:max-w-none">
                                <Trophy className="w-3.5 h-3.5 shrink-0" />
                                {winnerDisplayName || winnerTeamName}
                              </span>
                            ) : (
                              <span className="text-neutral-400 italic">Desierto</span>
                            )}
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell text-right rounded-b-xl md:rounded-none">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Puntos</span>
                            {winnerPoints > 0 ? (
                              <span className="font-mono text-lg md:text-sm font-bold text-neutral-900 tracking-tight">
                                {formatNumberSpanish(winnerPoints)}
                              </span>
                            ) : (
                              <span className="text-neutral-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <>
                    {paddingTop > 0 && <tr className="hidden md:table-row"><td style={{height: `${paddingTop}px`}} colSpan={4} /></tr>}
                    {virtualItems.map((virtualRow) => {
                      const item = filteredHistoryRaces[virtualRow.index];
                      const { race, winnerTeamName, winnerDisplayName, winnerPoints, date } = item;

                      let isHiddenVisual = false;
                      if (isWinsHistoryCopying) {
                        if (isWinsHistoryCopying === "full") isHiddenVisual = false;
                        else {
                          const pageNum = parseInt((isWinsHistoryCopying as string).substring(1));
                          const start = (pageNum - 1) * 50;
                          const end = start + 50;
                          isHiddenVisual = !(virtualRow.index >= start && virtualRow.index < end);
                        }
                      }

                      if (isHiddenVisual) return null;

                      return (
                        <tr key={race} data-index={virtualRow.index} ref={rowVirtualizer.measureElement} className="hover:bg-neutral-50 transition-colors wins-history-row flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 divide-neutral-100">
                          <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell gap-4 rounded-t-xl md:rounded-none bg-neutral-50/50 md:bg-transparent">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Fecha</span>
                            <span className="text-neutral-500 font-mono tabular-nums text-sm md:text-xs bg-white md:bg-transparent px-2 py-1 md:p-0 rounded border md:border-0 border-neutral-200 shrink-0">{date}</span>
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4 flex flex-col md:table-cell gap-1">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Carrera</span>
                            <span className="font-semibold md:font-medium text-neutral-900 line-clamp-2">{race}</span>
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell text-right">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Equipo Ganador</span>
                            {winnerTeamName ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-2.5 md:py-1 rounded-full bg-yellow-50 text-yellow-700 font-bold text-xs border border-yellow-100 shadow-sm md:shadow-none whitespace-nowrap overflow-hidden text-ellipsis truncate max-w-[200px] md:max-w-none">
                                <Trophy className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{winnerDisplayName}</span>
                              </span>
                            ) : (
                              <span className="text-neutral-400 italic">Sin resultados</span>
                            )}
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell text-right font-semibold text-neutral-700 font-mono tabular-nums bg-blue-50/10 md:bg-transparent rounded-b-xl md:rounded-none">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Puntos</span>
                            <span className="text-base md:text-sm">{winnerTeamName ? winnerPoints : "-"}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {paddingBottom > 0 && <tr className="hidden md:table-row"><td style={{height: `${paddingBottom}px`}} colSpan={4} /></tr>}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isWinsHistoryExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 md:p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-lg md:text-xl font-bold text-neutral-800 flex items-center gap-2">
                <History className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                <span className="hidden md:inline">Historial de Ganadores por Carrera</span>
                <span className="inline md:hidden">Historial</span>
              </h3>
              <Button variant="outline"
                onClick={() => setIsWinsHistoryExpanded(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-neutral-50/20">
              <div ref={expandedWrapperRef} className="table-responsive-wrapper min-h-[300px] overflow-auto w-full h-full max-h-[70vh]">
                <table className="w-full text-base text-left block md:table">
                  <thead className="text-sm text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10 hidden md:table-header-group">
                    <tr>
                      <th className="px-6 py-4 font-bold">Fecha</th>
                      <th className="px-6 py-4 font-bold">Carrera</th>
                      <th className="px-6 py-4 font-bold text-right">Equipo Ganador</th>
                      <th className="px-6 py-4 font-bold text-right">Puntos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y md:divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group">
                    {expandedPaddingTop > 0 && <tr className="hidden md:table-row"><td style={{height: `${expandedPaddingTop}px`}} colSpan={4} /></tr>}
                    {virtualExpandedItems.map((virtualRow) => {
                      const row = filteredHistoryRaces[virtualRow.index];
                      return (
                        <tr key={virtualRow.index} data-index={virtualRow.index} ref={rowExpandedVirtualizer.measureElement} className="hover:bg-neutral-50 transition-colors flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 divide-neutral-100">
                          <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell gap-4 rounded-t-xl md:rounded-none bg-neutral-50/50 md:bg-transparent">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Fecha</span>
                            <span className="text-neutral-600 font-mono tabular-nums text-sm md:text-base border md:border-none border-neutral-200 px-2 py-1 md:p-0 rounded bg-white md:bg-transparent">{row.date}</span>
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4 flex flex-col md:table-cell gap-1">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Carrera</span>
                            <span className="font-bold text-neutral-900">{row.race}</span>
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell text-right">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ganador</span>
                            {row.winnerTeamName ? (
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-3 md:py-1 rounded-full text-sm font-bold bg-yellow-50 text-yellow-700 border border-yellow-100 max-w-[200px] md:max-w-none shadow-sm md:shadow-none">
                                <Trophy className="w-4 h-4 md:w-3 md:h-3 shrink-0" />
                                <span className="truncate">{row.winnerDisplayName}</span>
                              </span>
                            ) : (
                              <span className="text-neutral-400 italic">Sin resultados</span>
                            )}
                          </td>
                          <td className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:table-cell text-right font-mono tabular-nums font-bold text-blue-600 bg-blue-50/10 md:bg-transparent rounded-b-xl md:rounded-none">
                            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Puntos</span>
                            <span className="text-lg md:text-base">{row.winnerTeamName ? row.winnerPoints : "-"}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {expandedPaddingBottom > 0 && <tr className="hidden md:table-row"><td style={{height: `${expandedPaddingBottom}px`}} colSpan={4} /></tr>}
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
