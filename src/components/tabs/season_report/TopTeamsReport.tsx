import React, { useRef } from "react";
import { Grid, Calendar, Crown, Medal, Maximize2, Minimize2, CheckCircle2, Copy, ClipboardList, History } from "lucide-react";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";

interface TopTeamsReportProps {
  monthReportData: any;
  monthsText: string;
  availableMonths: number[];
  monthNames: string[];
  maxTeamStageWins: number;
  getTeamPuntosColor: (puntos: number) => string;
  formatNumberSpanish: (num: number) => string;
  
  isHistoryExpanded: boolean;
  setIsHistoryExpanded: (val: boolean) => void;
  isHistoryCopying: string | boolean;
  handleCopyHistory: (subset?: "full" | string) => void;
  isHistoryTextCopying: boolean;
  handleCopyHistoryText: () => void;
}

export const TopTeamsReport: React.FC<TopTeamsReportProps> = ({
  monthReportData,
  monthsText,
  availableMonths,
  monthNames,
  maxTeamStageWins,
  getTeamPuntosColor,
  formatNumberSpanish,
  
  isHistoryExpanded,
  setIsHistoryExpanded,
  isHistoryCopying,
  handleCopyHistory,
  isHistoryTextCopying,
  handleCopyHistoryText,
}) => {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref13 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  if (!monthReportData) return null;

  return (
    <div className="space-y-8">
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative" ref={ref1}>
        <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
              <Grid className="w-5 h-5 text-blue-600" />
              Top Equipos por Puntuación {monthsText ? ` [${monthsText}]` : ""}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 ">
              Ranking de los equipos fantasy por puntuación en este periodo.
            </p>
          </div>
          <ExportToolbar targetRef={ref1} filename="top-equipos" />
        </div>
        <div className="overflow-x-auto flex justify-center bg-neutral-50/20 pb-8 relative mt-2 text-sm">
          <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container">
            <table className="w-full min-w-[600px] text-sm text-left bg-white bg-white rounded-xl shadow-sm rounded-lg">
              <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50">
                <tr>
                  <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold  border-b border-neutral-100">Pos</th>
                  <th className="sticky top-0 left-0 z-40 bg-neutral-50 px-4 py-2 font-bold border-b border-neutral-100 shadow-[1px_0_0_0_#e5e5e5]">Equipo</th>
                  <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold  border-b border-neutral-100 text-center">Victorias eq.</th>
                  <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold  border-b border-neutral-100 text-center">Victorias parc.</th>
                  <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold  border-b border-neutral-100 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {(() => {
                  const maxWins = monthReportData.topTeams.length > 0 ? Math.max(...monthReportData.topTeams.map((t: any) => t.wins)) : 0;
                  const minWins = monthReportData.topTeams.length > 0 ? Math.min(...monthReportData.topTeams.map((t: any) => t.wins)) : 0;
                  return monthReportData.topTeams.map((team: any) => {
                    const posColor = team.currentPos === 1 ? "text-yellow-600 bg-yellow-50/50" : team.currentPos === 2 ? "text-neutral-500 bg-neutral-50/50" : team.currentPos === 3 ? "text-amber-700 bg-amber-50/50" : "text-neutral-400";
                    const winsColor = team.wins === 0 ? "text-red-600 font-bold" : (team.wins === maxWins && maxWins > 0) ? "text-green-600 font-bold" : (team.wins === minWins && minWins < maxWins) ? "text-yellow-600 font-bold" : "text-neutral-700";
                    const stageWinsColor = team.stageWins === 0 ? "text-red-600 font-bold" : (team.stageWins === maxTeamStageWins && maxTeamStageWins > 0) ? "text-green-600 font-bold" : "text-neutral-700";
                    const difColor = team.dif > 0 ? "text-green-600 bg-green-50/50" : team.dif < 0 ? "text-red-600 bg-red-50/50" : "text-neutral-400 bg-neutral-50/50";
                    return (
                      <tr key={team.team} className="hover:bg-blue-50/30 transition-colors text-xs">
                        <td className={cn("px-4 py-1 font-bold text-center ", posColor)}>
                          <div className="flex items-center justify-center gap-1 text-[11px]">{team.currentPos === 1 ? (<Crown className="w-3 h-3 text-yellow-600" />) : team.currentPos === 2 ? (<Medal className="w-3 h-3 text-neutral-400" />) : team.currentPos === 3 ? (<Medal className="w-3 h-3 text-amber-700" />) : null}{team.currentPos}º</div>
                        </td>
                        <td className="px-4 py-1 font-bold text-neutral-900 border-l border-neutral-100/50">{team.team} [#{team.originalPos}]</td>
                        <td className="px-4 py-1 text-center font-mono border-l border-neutral-100/50">
                          <span className={winsColor}><span className="font-mono tracking-tight">{formatNumberSpanish(team.wins)}</span></span>
                        </td>
                        <td className="px-4 py-1 text-center font-mono border-l border-neutral-100/50">
                          <span className={stageWinsColor}><span className="font-mono tracking-tight">{formatNumberSpanish(team.stageWins)}</span></span>
                        </td>
                        <td className="px-4 py-1 text-right font-mono font-bold bg-blue-50/30 border-l border-neutral-100/50 text-[13px]" style={{ color: getTeamPuntosColor(team.pts) }}><span className="font-mono tracking-tight">{formatNumberSpanish(team.pts)}</span></td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative mt-8 w-full min-w-0" ref={ref13}>
        <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
              <Grid className="w-5 h-5 text-indigo-600" />
              Puntos por meses {monthsText ? ` [${monthsText}]` : ""}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 ">
              Puntos acumulados por cada equipo, desglosados mes a mes.
            </p>
          </div>
          <ExportToolbar targetRef={ref13} filename="puntos-meses" />
        </div>
        <div className="overflow-x-auto bg-neutral-50/20 pb-8 relative mt-2 text-sm w-full min-w-0">
          <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container">
            <table className="w-full min-w-[800px] text-sm text-left bg-white bg-white rounded-xl shadow-sm rounded-lg">
              <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50">
                <tr>
                  <th className="sticky top-0 z-30 bg-neutral-50 px-2 py-1.5 font-semibold  border-b border-neutral-100">Pos</th>
                  <th className="sticky top-0 left-0 z-40 bg-neutral-50 px-2 py-1.5 font-semibold border-b border-neutral-100 shadow-[1px_0_0_0_#e5e5e5]">Equipo</th>
                  <th className="sticky top-0 z-30 bg-neutral-100 px-2 py-1.5 font-bold  border-b border-neutral-200 text-center w-24">Puntos totales</th>
                  {availableMonths.map((mIdx: number) => (
                    <th key={mIdx} className="sticky top-0 z-30 bg-neutral-50 px-2 py-1.5 font-semibold  border-b border-neutral-100 text-center w-20">
                      {monthNames[mIdx]}
                    </th>
                  ))}
                  <th className="sticky top-0 z-30 bg-neutral-100 px-2 py-1.5 font-bold  border-b border-neutral-200 text-center w-24">Meses ganados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {(() => {
                  const maxs: Record<number, number> = {};
                  const mins: Record<number, number> = {};
                  
                  // First calculate maxs and mins considering only positive points
                  availableMonths.forEach((mIdx: number) => {
                      const allPoints = monthReportData.topTeams.map((t: any) => t.monthlyPoints[mIdx] || 0);
                      const allPositive = allPoints.filter((p: number) => p > 0);
                      maxs[mIdx] = allPositive.length > 0 ? Math.max(...allPositive) : 0;
                      mins[mIdx] = allPositive.length > 0 ? Math.min(...allPositive) : 0;
                  });

                  const teamsGanados = monthReportData.topTeams.map((team: any) => {
                      let ganados = 0;
                      availableMonths.forEach((mIdx: number) => {
                          const pts = team.monthlyPoints[mIdx] || 0;
                          if (pts > 0 && pts === maxs[mIdx]) ganados++;
                      });
                      return ganados;
                  });
                  const maxMesesGanados = teamsGanados.length > 0 ? Math.max(...teamsGanados) : 0;

                  return monthReportData.topTeams.map((team: any, idx: number) => {
                    const posColor = team.currentPos === 1 ? "text-yellow-600 bg-yellow-50/50" : team.currentPos === 2 ? "text-neutral-500 bg-neutral-50/50" : team.currentPos === 3 ? "text-amber-700 bg-amber-50/50" : "text-neutral-400";
                    const mesesGanados = teamsGanados[idx];
                    
                    return (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-2 py-1  font-medium text-center relative max-w-[50px]">
                          <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold", posColor)}>
                            {team.currentPos}
                          </span>
                        </td>
                        <td className="px-2 py-1 font-semibold text-neutral-800 ">
                          {team.team} <span className="text-xs text-neutral-400 ml-1 font-normal">[#{team.originalPos}]</span>
                        </td>
                        <td className="px-2 py-1 text-center font-bold text-neutral-900 bg-neutral-100  border-l border-r border-neutral-200">
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
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative mt-8" ref={ref2}>
        <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
              <History className="w-5 h-5 text-purple-600" />
              Historial de Ganadores por Carrera {monthsText ? ` [${monthsText}]` : ""}
            </h3>
            <p className="text-sm text-neutral-500 ">
              Relación cronológica de las victorias obtenidas por los equipos en cada carrera.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5 pr-3 copy-button-ignore">
              <Button variant="outline"
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
                title={isHistoryExpanded ? "Contraer tabla" : "Expandir tabla"}
              >
                {isHistoryExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button variant="outline"
                onClick={() => handleCopyHistory("full")}
                disabled={!!isHistoryCopying}
                title="Copiar imagen"
                className={cn(
                  "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                  isHistoryCopying === "full" ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
                  isHistoryCopying && isHistoryCopying !== "full" && "opacity-50 cursor-not-allowed"
                )}
              >
                {isHistoryCopying === "full" ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              
              {(() => {
                const count = monthReportData.raceWinners.length;
                if (count > 50) {
                  return (
                    <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                      {Array.from({ length: Math.ceil(count / 50) }).map((_, i) => {
                        const s = "p" + (i + 1);
                        const isCopyingThis = isHistoryCopying === s;
                        return (
                          <Button variant="outline"
                            key={s}
                            onClick={() => handleCopyHistory(s)}
                            disabled={!!isHistoryCopying}
                            className={cn(
                              "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                              isCopyingThis ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
                              isHistoryCopying && !isCopyingThis && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {isCopyingThis ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {i * 50 + 1}-{(i + 1) * 50}
                          </Button>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              })()}

              <Button variant="ghost" size="icon"
                onClick={handleCopyHistoryText}
                disabled={isHistoryTextCopying}
                title="Copiar texto"
                className={cn(
                  "ml-1 px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
                  isHistoryTextCopying
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                )}
              >
                {isHistoryTextCopying ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <ClipboardList className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
        <div className={cn("overflow-x-auto overflow-y-auto bg-neutral-50/20 pb-8 rounded-b-2xl scrollbar-thin", isHistoryExpanded ? "max-h-none" : "h-[800px]")}>
          <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container">
            <table className="w-full min-w-[600px] text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10 border-b border-neutral-200">
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
                  let isHiddenVisual = false;
                  if (isHistoryCopying) {
                    if (isHistoryCopying === "full") isHiddenVisual = false;
                    else {
                      const pageNum = parseInt((isHistoryCopying as string).substring(1));
                      const start = (pageNum - 1) * 50;
                      const end = start + 50;
                      isHiddenVisual = !(idx >= start && idx < end);
                    }
                  }
                  if (isHiddenVisual && isHistoryCopying) return null;

                  return (
                    <tr key={idx} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-6 py-2.5  font-mono text-xs text-neutral-500">{r.fecha}</td>
                      <td className="px-6 py-2.5 font-medium text-neutral-900 max-w-[200px] truncate" title={r.race}>{r.race}</td>
                      <td className="px-6 py-2.5">
                        {r.categoria ? <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-neutral-100 text-neutral-600 tracking-wider uppercase">{r.categoria}</span> : null}
                      </td>
                      <td className="px-6 py-2.5">
                        <div className="flex justify-center">
                          {r.winnerTeam !== "-" ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full font-bold text-xs ring-1 ring-yellow-600/20 shadow-sm">
                              <Crown className="w-3 h-3 text-yellow-600" />
                              {r.winnerTeam} [#{r.draftRank}]
                            </div>
                          ) : (
                            <span className="text-neutral-400 font-mono">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-right font-mono font-bold text-blue-600">{r.winnerPts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
