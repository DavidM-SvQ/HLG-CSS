import React from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown, X, ArrowUpDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getVal, getCategoryColorStyle } from '../../../lib/data-processing';
import { useDraftStats } from './hooks/useDraftStats';

interface DraftPointsTableProps {
  files: any;
  leaderboard: any;
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
    if (carrera && categoria) raceTypeByName[carrera] = categoria;
    if (carrera && fecha) raceDateByName[carrera] = fecha;
  });

  const cyclistPoints: Record<string, number> = {};
  const cyclistWins: Record<string, number> = {};
  leaderboard?.forEach((player: any) => {
    player?.detalles?.forEach((d: any) => {
      const dateStr = raceDateByName[d.carrera] || d.fecha;
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
        const cat = raceTypeByName[d.carrera];
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

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      ref={draftDatosTableRef as any}
      className={cn(
        "bg-white border border-neutral-200 rounded-xl overflow-hidden relative shadow-sm",
        isDraftDatosTableExpanded ? "fixed inset-4 z-50 p-6 shadow-2xl m-0 flex flex-col" : "max-h-[70vh]"
      )}
    >
      {isDraftDatosTableExpanded && (
        <button
          onClick={() => setIsDraftDatosTableExpanded(false)}
          className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className={cn("table-responsive-wrapper overflow-auto w-full", isDraftDatosTableExpanded ? "flex-1 min-h-0" : "max-h-[70vh]")}>
        <table className="min-w-max w-full text-xs text-left border-collapse">
          <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-50/80 backdrop-blur sticky top-0 z-30 shadow-sm border-b border-neutral-200">
            <tr>
              <th
                className="px-4 py-3 cursor-pointer hover:bg-neutral-100 group transition-colors sticky left-0 z-40 bg-neutral-50"
                style={{ width: "60px", minWidth: "60px" }}
                onClick={() => {
                  if (draftDatosSortColumn === "Orden") {
                    setDraftDatosSortDirection(draftDatosSortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setDraftDatosSortColumn("Orden");
                    setDraftDatosSortDirection("asc");
                  }
                }}
              >
                <div className="flex items-center gap-1 font-bold">
                  Orden
                  <ArrowUpDown className={cn("w-3 h-3 text-neutral-300", draftDatosSortColumn === "Orden" && "text-blue-600")} />
                </div>
              </th>
              <th className="px-4 py-3 font-bold border-l border-neutral-200 sticky left-[60px] z-40 bg-neutral-50" style={{ width: "150px", minWidth: "150px" }}>
                Equipo
              </th>
              <th className="px-3 py-3 border-l border-neutral-200 text-center font-bold sticky left-[210px] z-40 bg-neutral-50 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)]" style={{ width: "100px", minWidth: "100px" }}>
                Manager
              </th>
              {rounds.map((r, i) => (
                <th
                  key={r}
                  className={cn(
                    "px-2 py-3 text-center border-l border-neutral-200 cursor-pointer hover:bg-neutral-100 group transition-colors",
                    (i + 1) % 5 === 0 ? "bg-neutral-100/50" : ""
                  )}
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
                    R{r}
                    <ArrowUpDown className={cn("w-3 h-3 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity", draftDatosSortColumn === `R${r}` && "opacity-100 text-blue-600")} />
                  </div>
                </th>
              ))}
              <th
                className="px-4 py-3 text-right font-black text-blue-700 bg-blue-50/90 border-l border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors sticky right-0 z-40 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)]"
                onClick={() => {
                  if (draftDatosSortColumn === "TOTAL") {
                    setDraftDatosSortDirection(draftDatosSortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setDraftDatosSortColumn("TOTAL");
                    setDraftDatosSortDirection("desc");
                  }
                }}
              >
                <div className="flex items-center justify-end gap-1">
                  TOTAL
                  <ArrowUpDown className={cn("w-3 h-3", draftDatosSortColumn === "TOTAL" ? "text-blue-600" : "text-blue-300")} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 relative">
            {sortedTeams.map((teamName, index) => {
              const teamTotal = rounds.reduce((sum, r) => sum + (teamRoundData[teamName][r] || 0), 0);
              const order = teamOrderMap[teamName] || "-";
              const player = teamToPlayerMap[teamName];

              return (
                <tr key={teamName} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-2 font-mono text-neutral-400 sticky left-0 z-20 bg-white group-hover:bg-blue-50/50" style={{ width: "60px", minWidth: "60px" }}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 inline-block text-center">{order}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 font-bold text-neutral-900 border-l border-neutral-100 truncate sticky left-[60px] z-20 bg-white group-hover:bg-blue-50/50" style={{ width: "150px", maxWidth: "150px", minWidth: "150px" }}>
                    {teamName}
                  </td>
                  <td className="px-3 py-2 text-center text-neutral-500 border-l border-neutral-100 text-[10px] uppercase font-bold truncate sticky left-[210px] z-20 bg-white shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)] group-hover:bg-blue-50/50" style={{ width: "100px", maxWidth: "100px", minWidth: "100px" }}>
                    {player || "-"}
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
                          "px-2 py-2 text-center border-l border-neutral-100",
                          isZero ? "text-red-400" : "text-neutral-900",
                          (i + 1) % 5 === 0 ? "border-r border-r-neutral-200" : ""
                        )}
                        style={cellStyle}
                        onMouseEnter={(e) => {
                          if (cyclistName) {
                            setDraftDatosTooltip({
                              show: true,
                              x: e.clientX,
                              y: e.clientY,
                              data: { cyclistName, eqComp, r, order, wins, pts, meta, ppc, ppdc },
                            });
                          }
                        }}
                        onMouseMove={(e) => {
                          if (cyclistName && draftDatosTooltip) {
                            setDraftDatosTooltip((prev: any) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                          }
                        }}
                        onMouseLeave={() => setDraftDatosTooltip(null)}
                      >
                        <span className="cursor-default">{pts > 0 ? pts : "0"}</span>
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 text-right font-bold text-blue-700 bg-blue-50/90 border-l border-blue-100 sticky right-0 z-20 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)] group-hover:bg-blue-100/80 transition-colors">
                    {teamTotal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
