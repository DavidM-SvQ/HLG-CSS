import { AppState, PlayerScore } from '../../../lib/types';
import React from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown, X, ArrowUpDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getVal, getCategoryColorStyle, normalizeRaceName } from '../../../lib/data-processing';
import { useDraftStats } from './hooks/useDraftStats';
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";

interface DraftPointsTableProps {
  files: AppState;
  leaderboard: PlayerScore[];
  draftDatosMonthFilter: string[];
  draftDatosCategoryFilter: string[];
  draftDatosTeamFilter: string[];
  draftDatosSortColumn: string;
  setDraftDatosSortColumn: (val: string) => void;
  draftDatosSortDirection: 'asc' | 'desc';
  setDraftDatosSortDirection: (val: 'asc' | 'desc') => void;
  isDraftDatosTableExpanded: boolean;
  setIsDraftDatosTableExpanded: (val: boolean) => void;
  draftDatosTableRef: React.RefObject<HTMLDivElement>;
  draftDatosTooltip: any;
  setDraftDatosTooltip: (val: any) => void;
  playerOrderMap: any;
  teamToPlayerMap: any;
  cyclistMetadata?: any;
}

export const DraftPointsTable: React.FC<DraftPointsTableProps> = ({
  files,
  leaderboard,
  draftDatosMonthFilter,
  draftDatosCategoryFilter,
  draftDatosTeamFilter,
  draftDatosSortColumn,
  setDraftDatosSortColumn,
  draftDatosSortDirection,
  setDraftDatosSortDirection,
  isDraftDatosTableExpanded,
  setIsDraftDatosTableExpanded,
  draftDatosTableRef,
  draftDatosTooltip,
  setDraftDatosTooltip,
  playerOrderMap,
  teamToPlayerMap,
  cyclistMetadata
}) => {
  const { availableMonths, availableCategories, availableTeams, draftData, allRounds, teamSummaries } = useDraftStats({
    files,
    leaderboard,
    draftDatosMonthFilter,
    draftDatosCategoryFilter,
    draftDatosTeamFilter,
  });

  // Calculate generic statistics from leaderboard
  const raceTypeByName: Record<string, string> = {};
  const raceDateByName: Record<string, string> = {};
  files?.carreras?.data?.forEach((row: any) => {
    const carrera = getVal(row, "Carrera")?.trim();
    const categoria = getVal(row, "Categoría")?.trim();
    const fecha = getVal(row, "Fecha")?.trim();
    if (carrera) {
      const canonical = normalizeRaceName(carrera);
      if (categoria) {
        raceTypeByName[carrera] = categoria;
        raceTypeByName[canonical] = categoria;
      }
      if (fecha) {
        raceDateByName[carrera] = fecha;
        raceDateByName[canonical] = fecha;
      }
    }
  });

  const getDraftRaceCat = (carrera: string) => {
    if (!carrera) return "";
    return raceTypeByName[carrera] || raceTypeByName[normalizeRaceName(carrera)] || "";
  };

  const getDraftRaceDate = (carrera: string) => {
    if (!carrera) return "";
    return raceDateByName[carrera] || raceDateByName[normalizeRaceName(carrera)] || "";
  };

  const cyclistPoints: Record<string, number> = {};
  const cyclistWins: Record<string, number> = {};
  leaderboard?.forEach((player: any) => {
    player?.detalles?.forEach((d: any) => {
      const dateStr = getDraftRaceDate(d.carrera) || d.fecha;
      let matchesMonth = true;
      if (draftDatosMonthFilter.length > 0) {
        if (!dateStr) matchesMonth = false;
        else {
          const monthStr = dateStr.split("/")[1];
          if (monthStr) {
            const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const mName = monthNames[parseInt(monthStr, 10) - 1];
            if (!draftDatosMonthFilter.includes(mName)) matchesMonth = false;
          } else matchesMonth = false;
        }
      }

      let matchesCategory = true;
      if (draftDatosCategoryFilter.length > 0) {
        const cat = getDraftRaceCat(d.carrera);
        if (!cat || !draftDatosCategoryFilter.includes(cat)) matchesCategory = false;
      }

      if (matchesMonth && matchesCategory) {
        cyclistPoints[d.ciclista] = (cyclistPoints[d.ciclista] || 0) + (d.puntosObtenidos || 0);

        const isPos01 = d.posicion === "01" || d.posicion === "1";
        const isValidType = ["Etapa", "Etapa (Crono equipos)", "Clasificación final", "Clasificación final (Crono equipos)", "Clásica"].includes(d.tipoResultado);
        if (isPos01 && isValidType) {
          cyclistWins[d.ciclista] = (cyclistWins[d.ciclista] || 0) + 1;
        }
      }
    });
  });

  const teamRoundData: Record<string, Record<number, number>> = {};
  const teamRoundCyclist: Record<string, Record<number, any>> = {};
  const teamOrderMap: Record<string, string> = {};
  const teamsSet = new Set<string>();

  files?.elecciones?.data?.forEach((row: any) => {
    const teamName = (getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG")) as string;
    const roundStr = getVal(row, "Ronda");
    const round = parseInt(roundStr);
    const cyclist = getVal(row, "Ciclista") as string;
    const order = getVal(row, "Orden_Draft");

    if (teamName && !isNaN(round)) {
      if (draftDatosTeamFilter.length === 0 || draftDatosTeamFilter.includes(teamName)) {
        teamsSet.add(teamName);
        if (!teamRoundData[teamName]) {
          teamRoundData[teamName] = {};
          teamRoundCyclist[teamName] = {};
        }
        teamRoundData[teamName][round] = cyclistPoints[cyclist] || 0;
        teamRoundCyclist[teamName][round] = row;
        if (order) teamOrderMap[teamName] = order;
      }
    }
  });

  const rounds = Array.from({ length: 25 }, (_, i) => i + 1);

  const sortedTeams = Array.from(teamsSet).sort((a, b) => {
    if (draftDatosSortColumn === "Orden") {
      const orderA = parseInt(teamOrderMap[a] || "0");
      const orderB = parseInt(teamOrderMap[b] || "0");
      return draftDatosSortDirection === "asc" ? orderA - orderB : orderB - orderA;
    }
    if (draftDatosSortColumn === "TOTAL") {
      const totalA = rounds.reduce((sum, r) => sum + (teamRoundData[a][r] || 0), 0);
      const totalB = rounds.reduce((sum, r) => sum + (teamRoundData[b][r] || 0), 0);
      return draftDatosSortDirection === "asc" ? totalA - totalB : totalB - totalA;
    }
    if (draftDatosSortColumn.startsWith("R")) {
      const round = parseInt(draftDatosSortColumn.substring(1));
      const ptsA = teamRoundData[a][round] || 0;
      const ptsB = teamRoundData[b][round] || 0;
      return draftDatosSortDirection === "asc" ? ptsA - ptsB : ptsB - ptsA;
    }
    const orderA = parseInt(teamOrderMap[a] || "0");
    const orderB = parseInt(teamOrderMap[b] || "0");
    return orderA - orderB;
  });

  const roundStats: Record<number, { max: number; min: number }> = {};
  rounds.forEach((r) => {
    const scores = Array.from(teamsSet)
      .map((t) => teamRoundData[t]?.[r] || 0)
      .filter((s) => s > 0);
    if (scores.length > 0) {
      roundStats[r] = {
        max: Math.max(...scores),
        min: Math.min(...scores),
      };
    } else {
      roundStats[r] = { max: 0, min: 0 };
    }
  });

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const renderRow = (teamName: any, index: number) => {
    const teamTotal = rounds.reduce((sum, r) => sum + (teamRoundData[teamName][r] || 0), 0);
    const order = teamOrderMap[teamName] || "-";
    const player = teamToPlayerMap[teamName];

    return (
      <tr key={teamName} className="hover:bg-blue-50/30 transition-colors group">
        <td className="px-4 py-3 lg:py-1.5 font-mono tabular-nums text-neutral-400 sticky left-0 z-20 bg-white group-hover:bg-blue-50/50" style={{ width: "40px", minWidth: "40px" }}>
          <div className="flex items-center justify-center">
            <span className="w-4 inline-block text-center">{order}</span>
          </div>
        </td>
        <td className="px-4 py-3 lg:py-1.5 font-bold text-neutral-900 border-l border-neutral-100 truncate sticky left-[40px] z-20 bg-white group-hover:bg-blue-50/50 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)]" style={{ width: "110px", maxWidth: "110px", minWidth: "110px" }} title={teamName}>
          {teamName}
        </td>
        {rounds.map((r, i) => {
          const pts = teamRoundData[teamName][r] || 0;
          const isZero = pts === 0;
          const stats = roundStats[r];
          const isMax = pts > 0 && pts === stats?.max;
          const isMin = pts > 0 && pts === stats?.min;

          let cellStyle = {};
          if (!isZero && stats && stats.max > stats.min) {
            const ratio = (pts - stats.min) / (stats.max - stats.min);
            if (ratio > 0.5) {
              cellStyle = { backgroundColor: `rgba(34, 197, 94, ${(ratio - 0.5) * 0.4})` };
            } else {
              cellStyle = { backgroundColor: `rgba(239, 68, 68, ${(0.5 - ratio) * 0.2})` };
            }
          }

          if (isMax) cellStyle = { backgroundColor: "#dcfce7", fontWeight: "bold", color: "#166534", border: "1px solid #86efac" };
          if (isMin) cellStyle = { backgroundColor: "#fee2e2", color: "#991b1b" };

          const cyclistRow = teamRoundCyclist[teamName][r];
          const cyclistName = cyclistRow ? getVal(cyclistRow, "Ciclista") : null;
          const eqComp = cyclistRow ? getVal(cyclistRow, "EqComp") : null;
          const wins = cyclistName ? cyclistWins[cyclistName as string] || 0 : 0;
          const meta = cyclistName && cyclistMetadata ? (cyclistMetadata[cyclistName as string] || {}) : {};
          const ppc = meta.carrerasDisputadas > 0 ? pts / meta.carrerasDisputadas : 0;
          const ppdc = meta.diasCompeticion > 0 ? pts / meta.diasCompeticion : 0;

          return (
            <td
              key={r}
              className={cn(
                "px-0 lg:px-0.5 py-1 lg:py-1.5 text-center border-l border-neutral-100 font-mono tracking-tighter tabular-nums",
                isZero ? "text-red-400" : "text-neutral-900",
                (i + 1) % 5 === 0 ? "border-r border-r-neutral-200" : ""
              )}
              style={cellStyle}
            >
              {cyclistName ? (
                <Tooltip>
                  <TooltipTrigger className="w-full h-full flex items-center justify-center cursor-default min-h-[20px]">
                    {pts > 0 ? pts : "0"}
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-left bg-neutral-900 text-white border-neutral-800 shadow-xl max-w-[280px]">
                    <div className="flex flex-col gap-1.5 whitespace-nowrap text-xs p-1 font-sans">
                      <div className="font-bold border-b border-neutral-700 pb-1 mb-0.5 whitespace-normal break-words">
                        {cyclistName}
                      </div>
                      <div className="text-neutral-300">
                        Equipo: <span className="text-white font-medium">{eqComp || "-"}</span>
                      </div>
                      <div className="text-neutral-300">
                        Ronda: <span className="text-white font-medium">{r}</span> | Orden: <span className="text-white font-medium">{order || "-"}</span>
                      </div>
                      <div className="text-neutral-300">
                        Victorias: <span className="text-white font-medium">{wins}</span>
                      </div>
                      <div className="text-neutral-300">
                        Puntos Totales: <span className="text-blue-400 font-bold">{pts}</span>
                      </div>
                      {(ppc > 0 || ppdc > 0) && (
                        <div className="flex items-center gap-3 mt-1 pt-1 border-t border-neutral-700/50">
                          <span className="text-neutral-400">
                            P/C: <span className="text-neutral-200 font-mono tabular-nums">{ppc.toFixed(1)}</span>
                          </span>
                          <span className="text-neutral-400">
                            P/D: <span className="text-neutral-200 font-mono tabular-nums">{ppdc.toFixed(1)}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="cursor-default text-neutral-300 min-h-[20px] flex items-center justify-center">-</span>
              )}
            </td>
          );
        })}
        <td className="px-4 py-3 lg:py-1.5 text-right font-bold text-blue-700 bg-blue-50/90 border-l border-blue-100 sticky right-0 z-20 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)] group-hover:bg-blue-100/80 transition-colors font-mono tabular-nums tracking-tighter">
          {teamTotal}
        </td>
      </tr>
    );
  };

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "bg-white rounded-xl overflow-hidden relative",
        isDraftDatosTableExpanded ? "fixed inset-4 z-[99] p-6 shadow-2xl m-0 flex flex-col border border-neutral-200" : "w-full border border-neutral-100 shadow-sm"
      )}
    >
      {isDraftDatosTableExpanded && (
        <Button variant="outline"
          onClick={() => setIsDraftDatosTableExpanded(false)}
          className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
        >
          <X className="w-6 h-6" />
        </Button>
      )}

      <div ref={scrollRef} className={cn("table-responsive-wrapper min-h-[300px] w-full", isDraftDatosTableExpanded ? "flex-1 min-h-0 overflow-auto" : "overflow-auto max-h-[400px]")}>
        <table className="w-full text-[9px] lg:text-[10px] text-left border-collapse min-w-[1000px]">
          <thead className="text-[9px] lg:text-[10px] text-neutral-500 uppercase bg-neutral-50/80 backdrop-blur sticky top-0 z-30 shadow-sm border-b border-neutral-200">
            <tr>
              <th
                className="px-1 lg:px-2 py-2 cursor-pointer hover:bg-neutral-100 group transition-colors sticky left-0 z-40 bg-neutral-50"
                style={{ width: "40px", minWidth: "40px" }}
                onClick={() => {
                  if (draftDatosSortColumn === "Orden") {
                    setDraftDatosSortDirection(draftDatosSortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setDraftDatosSortColumn("Orden");
                    setDraftDatosSortDirection("asc");
                  }
                }}
              >
                <div className="flex items-center gap-0.5 font-bold">
                  Ord
                  <ArrowUpDown className={cn("w-2.5 h-2.5 text-neutral-300", draftDatosSortColumn === "Orden" && "text-blue-600")} />
                </div>
              </th>
              <th className="px-4 py-3 font-bold border-l border-neutral-200 sticky left-[40px] z-40 bg-neutral-50 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)] truncate" style={{ width: "110px", minWidth: "110px", maxWidth: "110px" }}>
                Equipo
              </th>
              {rounds.map((r, i) => (
                <th
                  key={r}
                  className={cn(
                    "px-0 lg:px-0.5 py-2 text-center border-l border-neutral-200 cursor-pointer hover:bg-neutral-100 group transition-colors",
                    (i + 1) % 5 === 0 ? "bg-neutral-100/50" : ""
                  )}
                  style={{ width: `${100/25}%` }}
                  onClick={() => {
                    const colIdx = `R${r}`;
                    if (draftDatosSortColumn === colIdx) {
                      setDraftDatosSortDirection(draftDatosSortDirection === "asc" ? "desc" : "asc");
                    } else {
                      setDraftDatosSortColumn(colIdx);
                      setDraftDatosSortDirection("desc");
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-0.5">
                    {r}
                    <ArrowUpDown className={cn("hidden lg:block w-2.5 h-2.5 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity", draftDatosSortColumn === `R${r}` && "opacity-100 text-blue-600")} />
                  </div>
                </th>
              ))}
              <th
                className="px-1 lg:px-2 py-2 text-right font-black text-blue-700 bg-blue-50/90 border-l border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors sticky right-0 z-40 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)]"
                onClick={() => {
                  if (draftDatosSortColumn === "TOTAL") {
                    setDraftDatosSortDirection(draftDatosSortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setDraftDatosSortColumn("TOTAL");
                    setDraftDatosSortDirection("desc");
                  }
                }}
              >
                <div className="flex items-center justify-end gap-0.5">
                  TOT
                  <ArrowUpDown className={cn("w-2.5 h-2.5", draftDatosSortColumn === "TOTAL" ? "text-blue-600" : "text-blue-300")} />
                </div>
              </th>
            </tr>
          </thead>
          <VirtualizedTableBody
            scrollElementRef={scrollRef}
            items={sortedTeams}
            renderRow={renderRow}
            colSpan={3 + rounds.length}
            estimateSize={36}
            className="divide-y divide-neutral-100 relative"
          />
        </table>
      </div>
    </motion.div>
  );
};
