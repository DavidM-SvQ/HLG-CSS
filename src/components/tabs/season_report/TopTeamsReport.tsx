import React, { useRef, useState, useMemo } from "react";
import { Grid, Crown, Medal, Maximize2, Minimize2, CheckCircle2, Copy, ClipboardList, History, Trophy } from "lucide-react";
import { ReportCard } from "../../ui/ReportCard";
import { cn } from "../../../lib/utils";
import { formatNumberSpanish } from "../../../lib/data-processing";
import { TopTeamsTableContent } from "../season/TopTeamsTableContent";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { flushSync } from "react-dom";

interface TopTeamsReportProps {
  monthReportData: any;
  availableMonths: number[];
  monthsText: string;
  isMonthlyReport?: boolean;
}

const monthNamesDefault = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const TopTeamsReport: React.FC<TopTeamsReportProps> = ({
  monthReportData,
  availableMonths,
  monthsText,
  isMonthlyReport,
}) => {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);

  const [isTopTeamsExpanded, setIsTopTeamsExpanded] = useState(false);
  const [isPointsMonthsExpanded, setIsPointsMonthsExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  
  const [topTeamsSortColumn, setTopTeamsSortColumn] = useState<string>("puntos");
  const [topTeamsSortDirection, setTopTeamsSortDirection] = useState<"asc"|"desc">("desc");

  const { handleCopyImage: copyHistory, handleDownloadImage: downloadHistory } = useTableScreenshot(ref3);
  const [isHistoryCopying, setIsHistoryCopying] = useState<string | null>(null);

  const prepareHistoryTable = (container: HTMLElement, subset?: string) => {
    if (subset && subset !== "full") {
      const pageNum = parseInt(subset.slice(1));
      const startIdx = (pageNum - 1) * 50;
      const endIdx = startIdx + 50;
      const rows = container.querySelectorAll("tbody tr");
      rows.forEach((row, i) => {
        if (i < startIdx || i >= endIdx) {
          row.classList.add("hidden");
        } else {
          row.classList.remove("hidden");
        }
      });
    } else {
      const rows = container.querySelectorAll("tbody tr");
      rows.forEach((row) => row.classList.remove("hidden"));
    }
  };

  const handleCopyHistory = async (subset?: string) => {
    if (isHistoryCopying) return;
    flushSync(() => { setIsHistoryCopying(subset || "full"); });
    try {
      await copyHistory({
        fileName: "historial-ganadores.png",
        scale: 3,
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        backgroundColor: "#ffffff",
        onBeforeCapture: (el: HTMLElement) => prepareHistoryTable(el, subset),
      });
    } finally {
      setIsHistoryCopying(null);
    }
  };

  const handleDownloadHistory = async (subset?: string) => {
    const suffix = subset && subset !== "full" ? `-${subset}` : "";
    await downloadHistory({
      fileName: `historial-ganadores${suffix}.png`,
      scale: 3,
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      backgroundColor: "#ffffff",
      onBeforeCapture: (el: HTMLElement) => prepareHistoryTable(el, subset),
    });
  };

  const handleTeamsSort = (column: string) => {
    if (topTeamsSortColumn === column) {
      setTopTeamsSortDirection(
        topTeamsSortDirection === "desc" ? "asc" : "desc",
      );
    } else {
      setTopTeamsSortColumn(column);
      setTopTeamsSortDirection("desc");
    }
  };

  const monthNames = monthNamesDefault;

  const getPuntosColor = (puntos: number) => {
    if (maxPoints === minPoints) return "#3b82f6";
    // Normalize points between 0 and 1
    const normalized = (puntos - minPoints) / (maxPoints - minPoints);
    // Hue from 0 (red) to 120 (green)
    const hue = normalized * 120;
    // Adjust lightness and saturation for good readability on white
    return `hsl(${hue}, 85%, 45%)`;
  };

  const sortedTeams = useMemo(() => {
    if (!monthReportData?.topTeams) return [];
    const arr = [...monthReportData.topTeams];
    arr.sort((a, b) => {
      const aVal = a[topTeamsSortColumn] ?? 0;
      const bVal = b[topTeamsSortColumn] ?? 0;
      let res = 0;
      if (typeof aVal === "number" && typeof bVal === "number") res = aVal - bVal;
      else res = String(aVal).localeCompare(String(bVal));
      return topTeamsSortDirection === "asc" ? res : -res;
    });
    return arr;
  }, [monthReportData, topTeamsSortColumn, topTeamsSortDirection]);

  // Derive min/max limits for formatted colors
  const { 
    maxPoints, minPoints, 
    maxWins, minWins, 
    maxPartialWins, minPartialWins, 
    maxCarreras, minCarreras,
    maxPpc, minPpc,
    maxDays, minDays,
    maxPpd, minPpd
  } = useMemo(() => {
    const teams = monthReportData?.topTeams || [];
    return {
      maxPoints: Math.max(1, ...teams.map((t: any) => t.puntos || 0)),
      minPoints: Math.min(0, ...teams.map((t: any) => t.puntos || 0)),
      maxWins: Math.max(0, ...teams.map((t: any) => t.wins || 0)),
      minWins: Math.min(0, ...teams.map((t: any) => t.wins || 0)),
      maxPartialWins: Math.max(0, ...teams.map((t: any) => t.partialWins || 0)),
      minPartialWins: Math.min(0, ...teams.map((t: any) => t.partialWins || 0)),
      maxCarreras: Math.max(0, ...teams.map((t: any) => t.numCarreras || 0)),
      minCarreras: Math.min(0, ...teams.map((t: any) => t.numCarreras || 0)),
      maxPpc: Math.max(0, ...teams.map((t: any) => t.ppc || 0)),
      minPpc: Math.min(0, ...teams.map((t: any) => t.ppc || 0)),
      maxDays: Math.max(0, ...teams.map((t: any) => t.totalDays || 0)),
      minDays: Math.min(0, ...teams.map((t: any) => t.totalDays || 0)),
      maxPpd: Math.max(0, ...teams.map((t: any) => t.ppd || 0)),
      minPpd: Math.min(0, ...teams.map((t: any) => t.ppd || 0))
    };
  }, [monthReportData]);

  const tableProps = {
    topTeamsSortColumn,
    topTeamsSortDirection,
    handleTeamsSort,
    sortedTeams,
    getPuntosColor,
    formatNumberSpanish,
    maxWins, minWins,
    maxPartialWins, minPartialWins,
    maxCarreras, minCarreras,
    maxPpc, minPpc,
    maxDays, minDays,
    maxPpd, minPpd,
    hideDifColumn: true,
    hidePointsDiff: true,
    showDraftPos: true
  };

  if (!monthReportData) return null;

  return (
    <div className="space-y-8">
      <ReportCard 
        title={`Top Equipos por Puntuación${monthsText ? ` [${monthsText}]` : ""}`}
        subtitle="Ranking de los equipos fantasy por puntuación en este periodo."
        icon={<Grid />}
        filename="top-equipos"
        ref={ref1}
        toolbarProps={{
          isExpanded: isTopTeamsExpanded,
          onExpand: () => setIsTopTeamsExpanded(!isTopTeamsExpanded)
        }}
        bodyClassName="flex justify-center bg-white pb-8 relative text-sm border-t border-neutral-100"
      >
        <TopTeamsTableContent {...tableProps} dense scrollRef={ref1} isExpanded={isTopTeamsExpanded} />
      </ReportCard>

      {!isMonthlyReport && (
      <ReportCard
        title={`Puntos por meses${monthsText ? ` [${monthsText}]` : ""}`}
        subtitle="Puntos acumulados por cada equipo, desglosados mes a mes."
        icon={<Grid />}
        filename="puntos-meses"
        ref={ref2}
        toolbarProps={{
          isExpanded: true,
          onExpand: () => {}
        }}
        bodyClassName="overflow-x-auto bg-neutral-50/20 pb-8 relative mt-2 text-sm w-full min-w-0 border-t border-neutral-100"
      >
        <div className={cn("table-responsive-wrapper min-h-[300px] overflow-x-auto w-full crosshair-container")}>
          <table className="w-full min-w-[800px] text-sm text-left bg-white bg-white rounded-xl shadow-sm rounded-lg">
            <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50">
              <tr>
                <th className="px-4 py-3.5 font-semibold  border-b border-neutral-100">Pos</th>
                <th className="px-4 py-3.5 font-semibold border-b border-neutral-100 shadow-[1px_0_0_0_#e5e5e5]">Equipo</th>
                <th className="px-4 py-3.5 font-bold  border-b border-neutral-200 text-center w-24">Puntos totales</th>
                {availableMonths.map((mIdx: number) => (
                  <th key={mIdx} className="sticky top-0 z-30 bg-neutral-50 px-2 py-1.5 font-semibold  border-b border-neutral-100 text-center w-20">
                    {monthNames[mIdx]}
                  </th>
                ))}
                <th className="px-4 py-3.5 font-bold  border-b border-neutral-200 text-center w-24">Meses ganados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
              {(() => {
                const maxs: Record<number, number> = {};
                const mins: Record<number, number> = {};
                
                availableMonths.forEach((mIdx: number) => {
                    const allPoints = monthReportData.topTeams?.map((t: any) => t.monthlyPoints[mIdx] || 0) || [];
                    const allPositive = allPoints.filter((p: number) => p > 0);
                    maxs[mIdx] = allPositive.length > 0 ? Math.max(...allPositive) : 0;
                    mins[mIdx] = allPositive.length > 0 ? Math.min(...allPositive) : 0;
                });

                const teamsGanados = monthReportData.topTeams?.map((team: any) => {
                    let ganados = 0;
                    availableMonths.forEach((mIdx: number) => {
                        const pts = team.monthlyPoints[mIdx] || 0;
                        if (pts > 0 && pts === maxs[mIdx]) ganados++;
                    });
                    return ganados;
                }) || [];
                const maxMesesGanados = teamsGanados.length > 0 ? Math.max(...teamsGanados) : 0;

                return monthReportData.topTeams?.map((team: any, idx: number) => {
                  const posColor = team.currentPos === 1 ? "text-yellow-600 bg-yellow-50/50" : team.currentPos === 2 ? "text-neutral-500 bg-neutral-50/50" : team.currentPos === 3 ? "text-amber-700 bg-amber-50/50" : "text-neutral-400";
                  const mesesGanados = teamsGanados[idx];
                  
                  return (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-4 py-3  font-medium text-center relative max-w-[50px]">
                        <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold", posColor)}>
                          {team.currentPos}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-800 ">
                        {team.team} {team.draftRank && team.draftRank !== "-" && <span className="text-xs text-neutral-400 ml-1 font-normal">[<span className="font-mono tabular-nums opacity-60">#{team.draftRank}</span>]</span>}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-neutral-900 bg-neutral-100  border-l border-r border-neutral-200">
                        {team.pts.toLocaleString()}
                      </td>
                      {availableMonths.map((mIdx: number) => {
                        const pts = team.monthlyPoints[mIdx] || 0;
                        const isMax = maxs[mIdx] > 0 && pts === maxs[mIdx];
                        const isMin = pts > 0 && pts === mins[mIdx];
                        const bgColorStyles = isMax ? "bg-green-100 text-green-800" : isMin ? "bg-red-100 text-red-800" : "text-neutral-600 font-normal";
                        return (
                          <td key={mIdx} className={cn("px-2 py-1 text-center ", bgColorStyles)}>
                            {pts > 0 ? pts.toLocaleString() : "-"}
                          </td>
                        );
                      })}
                      <td className={cn("px-2 py-1 text-center font-bold  border-l border-neutral-200", maxMesesGanados > 0 && mesesGanados === maxMesesGanados ? "bg-yellow-100 text-yellow-800" : "bg-neutral-100 text-neutral-900")}>
                        {mesesGanados}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </ReportCard>
      )}

      {monthReportData.raceWinners && monthReportData.raceWinners.length > 0 && (
        <ReportCard
          title={`Historial de Ganadores por Carrera${monthsText ? ` [${monthsText}]` : ""}`}
          subtitle="Relación cronológica de las victorias obtenidas por los equipos en cada carrera."
          icon={<History />}
          iconClassName="text-purple-600"
          filename="historial-ganadores"
          ref={ref3}
          className="mt-8"
          toolbarProps={{
            isExpanded: isHistoryExpanded,
            onExpand: () => setIsHistoryExpanded(!isHistoryExpanded),
            onCopyImage: handleCopyHistory,
            isImageCopying: isHistoryCopying,
            onDownloadImage: handleDownloadHistory
          }}
          bodyClassName="p-0 border-t border-neutral-100"
        >
          <div className={cn("overflow-x-auto overflow-y-auto bg-neutral-50/20 scrollbar-thin rounded-b-xl", isHistoryExpanded ? "max-h-none" : "h-[400px]")}>
            <div className="table-responsive-wrapper min-h-[300px] overflow-x-auto w-full crosshair-container">
              <table className="w-full min-w-[600px] text-sm text-left">
                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10 shadow-[0_1px_0_0_#e5e5e5]">
                  <tr>
                    <th className="px-6 py-3 font-semibold ">Fecha</th>
                    <th className="px-6 py-3 font-semibold ">Carrera</th>
                    <th className="px-6 py-3 font-semibold ">Categoría</th>
                    <th className="px-6 py-3 font-semibold  text-center">Ganador</th>
                    <th className="px-6 py-3 font-semibold  text-right">Puntos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 bg-white">
                  {monthReportData.raceWinners.map((r: any, idx: number) => {
                    return (
                      <tr key={idx} className="hover:bg-purple-50/30 transition-colors group">
                        <td className="px-6 py-2.5  font-mono tabular-nums text-xs text-neutral-500">{r.fecha}</td>
                        <td className="px-6 py-2.5 font-medium text-neutral-900 max-w-[200px] truncate" title={r.race}>{r.race}</td>
                        <td className="px-6 py-2.5">
                          {r.categoria ? <span className="px-3 py-2 text-[10px] font-bold rounded-md bg-neutral-100 text-neutral-600 tracking-wider uppercase">{r.categoria}</span> : null}
                        </td>
                        <td className="px-6 py-2.5">
                          <div className="flex justify-center">
                            {r.winnerTeam !== "-" ? (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full font-bold text-xs ring-1 ring-yellow-600/20 shadow-sm whitespace-nowrap">
                                <Crown className="w-3 h-3 text-yellow-600 shrink-0" />
                                <span className="truncate">{r.winnerTeam}</span> <span className="shrink-0 opacity-60 font-mono tabular-nums">[#{r.draftRank}]</span>
                              </div>
                            ) : (
                              <span className="text-neutral-400 font-mono tabular-nums">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-2.5 text-right font-mono tabular-nums font-bold text-blue-600">{r.winnerPts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </ReportCard>
      )}
    </div>
  );
};
