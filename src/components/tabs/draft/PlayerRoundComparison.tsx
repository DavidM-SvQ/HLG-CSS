import React, { useState, useRef, useMemo } from 'react';
import { AppState, PlayerScore, CyclistMetadata } from '../../../lib/types';
import { ReportCard } from '../../ui/ReportCard';
import { Layers, ArrowUpDown, ChevronUp, ChevronDown, Award, TrendingUp, HelpCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getVal } from '../../../lib/data-processing';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';

interface PlayerRoundComparisonProps {
  files: AppState;
  leaderboard: PlayerScore[];
  cyclistMetadata?: Record<string, CyclistMetadata>;
}

export const PlayerRoundComparison: React.FC<PlayerRoundComparisonProps> = ({
  files,
  leaderboard,
  cyclistMetadata
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortField, setSortField] = useState<string>("puntosTotales");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const tableRef = useRef<HTMLDivElement>(null);

  // Compute round breakdown per player from elecciones + leaderboard details
  const { processedRows, roundList, roundMaxMap } = useMemo(() => {
    if (!files?.elecciones?.data || !leaderboard || leaderboard.length === 0) {
      return { processedRows: [], roundList: [], roundMaxMap: {} };
    }

    // Map cyclist -> total points from leaderboard
    const cyclistTotalPoints: Record<string, number> = {};
    leaderboard.forEach((player) => {
      player.detalles?.forEach((d: any) => {
        if (d.ciclista) {
          cyclistTotalPoints[d.ciclista] = (cyclistTotalPoints[d.ciclista] || 0) + (d.puntosObtenidos || 0);
        }
      });
    });

    // Map team/player -> round -> list of picks
    const teamRoundMap: Record<string, Record<string, { ciclista: string; puntos: number; eleccion: number }>> = {};
    const roundSet = new Set<string>();

    files.elecciones.data.forEach((row: any, idx: number) => {
      const teamName = String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG") || "").trim();
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      let rStr = String(getVal(row, "Ronda") || "").trim();
      if (!rStr) rStr = "1";
      const ronda = rStr.padStart(2, "0");

      if (teamName && ciclista) {
        roundSet.add(ronda);
        if (!teamRoundMap[teamName]) teamRoundMap[teamName] = {};

        const pts = cyclistTotalPoints[ciclista] || 0;
        teamRoundMap[teamName][ronda] = {
          ciclista,
          puntos: pts,
          eleccion: idx + 1
        };
      }
    });

    const roundList = Array.from(roundSet).sort((a, b) => a.localeCompare(b));

    // Calculate max points scored in each round across all players
    const roundMaxMap: Record<string, number> = {};
    roundList.forEach((r) => {
      let maxPts = 0;
      Object.values(teamRoundMap).forEach((rounds) => {
        const pts = rounds[r]?.puntos || 0;
        if (pts > maxPts) maxPts = pts;
      });
      roundMaxMap[r] = maxPts;
    });

    // Build player comparison rows based on leaderboard
    const rows = leaderboard.map((p, idx) => {
      const teamName = p.nombreEquipo || p.jugador;
      const roundsData = teamRoundMap[teamName] || {};

      const roundPoints: Record<string, number> = {};
      let totalDraftPoints = 0;
      let bestRound = { ronda: "-", puntos: 0 };

      roundList.forEach((r) => {
        const pick = roundsData[r];
        const pts = pick?.puntos || 0;
        roundPoints[r] = pts;
        totalDraftPoints += pts;

        if (pts > bestRound.puntos) {
          bestRound = { ronda: `Ronda ${r}`, puntos: pts };
        }
      });

      const avgPerRound = roundList.length > 0 ? totalDraftPoints / roundList.length : 0;

      return {
        posicion: idx + 1,
        jugador: p.jugador,
        nombreEquipo: p.nombreEquipo,
        puntosTotales: (p as any).puntosTotales ?? p.puntos ?? totalDraftPoints,
        victorias: (p as any).victorias || 0,
        parciales: (p as any).parciales || 0,
        roundPoints,
        roundsData,
        avgPerRound,
        bestRound
      };
    });

    return { processedRows: rows, roundList, roundMaxMap };
  }, [files, leaderboard]);

  // Handle sorting
  const sortedRows = useMemo(() => {
    return [...processedRows].sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortField === "posicion") {
        valA = a.posicion;
        valB = b.posicion;
      } else if (sortField === "puntosTotales") {
        valA = a.puntosTotales;
        valB = b.puntosTotales;
      } else if (sortField === "jugador") {
        valA = a.nombreEquipo;
        valB = b.nombreEquipo;
      } else if (sortField.startsWith("r_")) {
        const rKey = sortField.replace("r_", "");
        valA = a.roundPoints[rKey] || 0;
        valB = b.roundPoints[rKey] || 0;
      }

      if (valA !== valB) {
        if (typeof valA === "string" && typeof valB === "string") {
          return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [processedRows, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "posicion" || field === "jugador" ? "asc" : "desc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 inline text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-3 h-3 ml-1 inline text-blue-600" />
    ) : (
      <ChevronDown className="w-3 h-3 ml-1 inline text-blue-600" />
    );
  };

  if (!processedRows || processedRows.length === 0) return null;

  return (
    <ReportCard
      title="Comparativa: Puntos Globales por Ronda del Draft"
      subtitle="Relación entre la clasificación general y los puntos obtenidos por cada elección en cada ronda."
      icon={<Layers className="w-5 h-5 text-blue-600" />}
      filename="comparativa-puntos-por-ronda"
      ref={tableRef}
      toolbarProps={{
        isExpanded,
        onExpand: () => setIsExpanded(!isExpanded)
      }}
      bodyClassName="p-6 pt-4"
    >
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[850px] text-xs">
            <thead className="select-none">
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                <th
                  className="px-3 py-3 border-r border-neutral-200 w-12 text-center cursor-pointer hover:bg-neutral-100 transition-colors group sticky left-0 z-20 bg-neutral-50"
                  onClick={() => handleSort("posicion")}
                >
                  Pos {renderSortIcon("posicion")}
                </th>
                <th
                  className="px-4 py-3 border-r border-neutral-200 min-w-[140px] cursor-pointer hover:bg-neutral-100 transition-colors group sticky left-[48px] z-20 bg-neutral-50 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)]"
                  onClick={() => handleSort("jugador")}
                >
                  Equipo / Jugador {renderSortIcon("jugador")}
                </th>
                <th
                  className="px-4 py-3 text-right bg-blue-50/80 border-r border-blue-200 text-blue-900 font-bold min-w-[110px] cursor-pointer hover:bg-blue-100 transition-colors group"
                  onClick={() => handleSort("puntosTotales")}
                >
                  Pts Totales {renderSortIcon("puntosTotales")}
                </th>

                {roundList.map((r) => (
                  <th
                    key={r}
                    className="px-2 py-3 text-center border-r border-neutral-100 min-w-[70px] cursor-pointer hover:bg-neutral-100 transition-colors group"
                    onClick={() => handleSort(`r_${r}`)}
                  >
                    Ronda {r} {renderSortIcon(`r_${r}`)}
                  </th>
                ))}

                <th className="px-3 py-3 text-center bg-neutral-100/70 border-l border-neutral-200 min-w-[90px]">
                  Media / R.
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 text-xs">
              {sortedRows.map((row) => {
                const totalPts = row.puntosTotales || 1;

                return (
                  <tr key={row.nombreEquipo} className="hover:bg-neutral-50/80 transition-colors group">
                    <td className="px-3 py-2 border-r border-neutral-100 text-center font-mono font-bold text-neutral-500 sticky left-0 z-10 bg-white group-hover:bg-neutral-50">
                      #{row.posicion}
                    </td>

                    <td className="px-4 py-2 border-r border-neutral-100 font-bold text-neutral-900 truncate sticky left-[48px] z-10 bg-white group-hover:bg-neutral-50 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)]" title={row.nombreEquipo}>
                      <div className="flex flex-col">
                        <span className="text-neutral-900 font-bold">{row.nombreEquipo}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">{row.jugador}</span>
                      </div>
                    </td>

                    <td className="px-4 py-2 text-right font-black text-blue-700 bg-blue-50/50 border-r border-blue-100 font-mono tabular-nums text-sm">
                      {row.puntosTotales.toLocaleString()}
                    </td>

                    {roundList.map((r) => {
                      const pick = row.roundsData[r];
                      const pts = row.roundPoints[r] || 0;
                      const maxInRound = roundMaxMap[r] || 0;
                      const isRoundWinner = pts > 0 && pts === maxInRound;
                      const pctOfTotal = totalPts > 0 ? ((pts / totalPts) * 100).toFixed(1) : "0.0";

                      return (
                        <td
                          key={r}
                          className={cn(
                            "px-2 py-2 text-center border-r border-neutral-100 font-mono tabular-nums transition-colors",
                            isRoundWinner
                              ? "bg-green-100/80 text-green-800 font-bold border-green-300"
                              : pts === 0
                              ? "text-neutral-300 bg-neutral-50/30"
                              : "text-neutral-800"
                          )}
                        >
                          <Tooltip>
                            <TooltipTrigger className="w-full flex items-center justify-center gap-1 focus:outline-none">
                              <span>{pts}</span>
                              {isRoundWinner && (
                                <Award className="w-3 h-3 text-green-600 shrink-0 inline-block" />
                              )}
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-neutral-900 text-white text-xs border-neutral-800 p-2 max-w-[220px]">
                              <div className="space-y-1 font-sans">
                                <div className="font-bold border-b border-neutral-700 pb-1">
                                  Ronda {r}: {pick?.ciclista || "Ninguno"}
                                </div>
                                <div>
                                  Puntos conseguidos: <strong className="text-green-400">{pts} pts</strong>
                                </div>
                                <div className="text-neutral-300 text-[10px]">
                                  Representa el <strong className="text-blue-300">{pctOfTotal}%</strong> del total de este jugador.
                                </div>
                                {isRoundWinner && (
                                  <div className="mt-1 bg-green-900/60 text-green-300 px-1.5 py-0.5 rounded text-[10px] font-bold text-center">
                                    🏆 Mejor elección de la Ronda {r}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}

                    <td className="px-3 py-2 text-center font-mono tabular-nums bg-neutral-50 text-neutral-600 font-semibold text-xs">
                      {row.avgPerRound.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ReportCard>
  );
};
