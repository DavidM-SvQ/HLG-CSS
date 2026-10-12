import React, { useState, useMemo, useRef } from "react";
import { AppState, PlayerScore, CyclistMetadata } from "../../../lib/types";
import { ReportCard } from "../../ui/ReportCard";
import { ArrowLeftRight, Trophy, TrendingUp, Users, Award, ChevronRight, CheckCircle2, BarChart2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { getVal } from "../../../lib/data-processing";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

export interface DraftComparacionesProps {
  files: AppState;
  leaderboard: PlayerScore[];
  cyclistMetadata?: Record<string, CyclistMetadata>;
  playerTeamMap?: Record<string, string>;
  playerOrderMap?: Record<string, string>;
}

export const DraftComparaciones: React.FC<DraftComparacionesProps> = ({
  files,
  leaderboard,
  cyclistMetadata,
  playerTeamMap,
  playerOrderMap,
}) => {
  // Extract all team/player names from leaderboard & elecciones
  const availableTeams = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return [];
    return leaderboard.map((p) => ({
      name: p.nombreEquipo || p.jugador,
      jugador: p.jugador,
      puntos: p.puntos || 0,
      orden: p.orden || "-",
    }));
  }, [leaderboard]);

  // Default select top 2 teams
  const [teamA, setTeamA] = useState<string>(availableTeams[0]?.name || "");
  const [teamB, setTeamB] = useState<string>(availableTeams[1]?.name || availableTeams[0]?.name || "");

  const reportCardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Swap teams
  const handleSwap = () => {
    setTeamA(teamB);
    setTeamB(teamA);
  };

  // Compute cyclist points from leaderboard
  const cyclistTotalPoints = useMemo(() => {
    const map: Record<string, number> = {};
    leaderboard?.forEach((player) => {
      player.detalles?.forEach((d: any) => {
        if (d.ciclista) {
          map[d.ciclista] = (map[d.ciclista] || 0) + (d.puntosObtenidos || 0);
        }
      });
    });
    return map;
  }, [leaderboard]);

  // Build rounds data for teamA and teamB
  const comparisonData = useMemo(() => {
    if (!files?.elecciones?.data || !teamA || !teamB) {
      return { rounds: [], summaryA: null, summaryB: null, roundsWonA: 0, roundsWonB: 0, ties: 0 };
    }

    const picksA: Record<string, { ciclista: string; puntos: number; eleccion: number }> = {};
    const picksB: Record<string, { ciclista: string; puntos: number; eleccion: number }> = {};
    const roundSet = new Set<string>();

    files.elecciones.data.forEach((row: any, idx: number) => {
      const teamName = String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG") || "").trim();
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      let rStr = String(getVal(row, "Ronda") || "").trim();
      if (!rStr) rStr = "1";
      const ronda = rStr.padStart(2, "0");

      if (teamName && ciclista) {
        roundSet.add(ronda);
        const pts = cyclistTotalPoints[ciclista] || 0;

        if (teamName === teamA) {
          picksA[ronda] = { ciclista, puntos: pts, eleccion: idx + 1 };
        }
        if (teamName === teamB) {
          picksB[ronda] = { ciclista, puntos: pts, eleccion: idx + 1 };
        }
      }
    });

    const roundList = Array.from(roundSet).sort((a, b) => a.localeCompare(b));

    let cumulativeDiff = 0;
    let roundsWonA = 0;
    let roundsWonB = 0;
    let ties = 0;

    const rounds = roundList.map((ronda) => {
      const pickA = picksA[ronda] || { ciclista: "-", puntos: 0, eleccion: 0 };
      const pickB = picksB[ronda] || { ciclista: "-", puntos: 0, eleccion: 0 };

      const diffRound = pickA.puntos - pickB.puntos;
      cumulativeDiff += diffRound;

      if (diffRound > 0) roundsWonA++;
      else if (diffRound < 0) roundsWonB++;
      else ties++;

      return {
        ronda,
        pickA,
        pickB,
        diffRound,
        cumulativeDiff,
        winner: diffRound > 0 ? "A" : diffRound < 0 ? "B" : "TIE",
        cumulativeLeader: cumulativeDiff > 0 ? "A" : cumulativeDiff < 0 ? "B" : "TIE",
      };
    });

    const infoA = availableTeams.find((t) => t.name === teamA);
    const infoB = availableTeams.find((t) => t.name === teamB);

    const totalPtsA = rounds.reduce((sum, r) => sum + r.pickA.puntos, 0);
    const totalPtsB = rounds.reduce((sum, r) => sum + r.pickB.puntos, 0);

    return {
      rounds,
      summaryA: { ...infoA, totalPts: totalPtsA },
      summaryB: { ...infoB, totalPts: totalPtsB },
      roundsWonA,
      roundsWonB,
      ties,
      finalCumulativeDiff: cumulativeDiff,
    };
  }, [files, teamA, teamB, availableTeams, cyclistTotalPoints]);

  if (!availableTeams || availableTeams.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500 bg-white rounded-2xl border border-neutral-200 shadow-sm">
        No hay datos suficientes del draft para realizar comparativas.
      </div>
    );
  }

  const { rounds, summaryA, summaryB, roundsWonA, roundsWonB, ties, finalCumulativeDiff } = comparisonData;

  return (
    <div className="space-y-6">
      {/* Team Selection Header Bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
              Equipo 1 (A)
            </label>
            <select
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              className="w-full bg-blue-50/60 border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            >
              {availableTeams.map((t) => (
                <option key={t.name} value={t.name} disabled={t.name === teamB}>
                  {t.name} ({t.jugador}) - {t.puntos} pts
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline"
            onClick={handleSwap}
            className="self-center p-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-transform active:scale-95 shadow-xs"
            title="Intercambiar Equipos A <-> B"
          >
            <ArrowLeftRight className="w-5 h-5 text-neutral-700" />
          </Button>

          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
              Equipo 2 (B)
            </label>
            <select
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              className="w-full bg-purple-50/60 border border-purple-200 rounded-xl px-4 py-2.5 text-sm font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
            >
              {availableTeams.map((t) => (
                <option key={t.name} value={t.name} disabled={t.name === teamA}>
                  {t.name} ({t.jugador}) - {t.puntos} pts
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {teamA && teamB && summaryA && summaryB && (
        <>
          {/* Head-to-Head Comparison Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Team A Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-3 top-3 opacity-10">
                <Trophy className="w-24 h-24" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-400/30 px-2 py-0.5 rounded text-blue-100 inline-block mb-2">
                  Equipo A
                </span>
                <h3 className="text-lg font-black truncate">{summaryA.name}</h3>
                <p className="text-xs text-blue-100">{summaryA.jugador}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-400/30 flex justify-between items-end">
                <div>
                  <span className="text-2xl font-black">{summaryA.totalPts.toLocaleString()}</span>
                  <span className="text-xs text-blue-200 ml-1">pts</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-blue-800/60 px-2 py-1 rounded">
                    🏆 {roundsWonA} rondas ganadas
                  </span>
                </div>
              </div>
            </div>

            {/* VS Status Indicator */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
                Diferencia Total
              </span>
              <div
                className={cn(
                  "text-3xl font-black font-mono tracking-tight my-1",
                  finalCumulativeDiff > 0
                    ? "text-blue-600"
                    : finalCumulativeDiff < 0
                    ? "text-purple-600"
                    : "text-neutral-700"
                )}
              >
                {finalCumulativeDiff > 0
                  ? `+${finalCumulativeDiff.toLocaleString()} A`
                  : finalCumulativeDiff < 0
                  ? `+${Math.abs(finalCumulativeDiff).toLocaleString()} B`
                  : "Empate"}
              </div>
              <p className="text-xs font-medium text-neutral-500 mt-1">
                {finalCumulativeDiff > 0 ? (
                  <span className="text-blue-700 font-bold">Ventaja para {summaryA.name}</span>
                ) : finalCumulativeDiff < 0 ? (
                  <span className="text-purple-700 font-bold">Ventaja para {summaryB.name}</span>
                ) : (
                  "Misma puntuación global"
                )}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-neutral-500 bg-neutral-50 px-3 py-1 rounded-full border border-neutral-200">
                <span>Rondas: A ({roundsWonA})</span>
                <span>•</span>
                <span>Empates ({ties})</span>
                <span>•</span>
                <span>B ({roundsWonB})</span>
              </div>
            </div>

            {/* Team B Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-3 top-3 opacity-10">
                <Trophy className="w-24 h-24" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-400/30 px-2 py-0.5 rounded text-purple-100 inline-block mb-2">
                  Equipo B
                </span>
                <h3 className="text-lg font-black truncate">{summaryB.name}</h3>
                <p className="text-xs text-purple-100">{summaryB.jugador}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-400/30 flex justify-between items-end">
                <div>
                  <span className="text-2xl font-black">{summaryB.totalPts.toLocaleString()}</span>
                  <span className="text-xs text-purple-200 ml-1">pts</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-purple-900/60 px-2 py-1 rounded">
                    🏆 {roundsWonB} rondas ganadas
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Comparison Table */}
          <ReportCard
            title="Cara a Cara por Ronda y Diferencia Acumulada"
            subtitle="Puntos conseguidos por cada pick en cada ronda, la diferencia de la ronda y el total acumulado progresivo."
            icon={<BarChart2 className="w-5 h-5 text-blue-600" />}
            filename={`comparacion-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
            ref={reportCardRef}
            toolbarProps={{
              isExpanded,
              onExpand: () => setIsExpanded(!isExpanded),
            }}
            bodyClassName="p-6 pt-2"
          >
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[800px] text-xs">
                  <thead className="select-none">
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                      <th className="px-3 py-3 border-r border-neutral-200 w-16 text-center">Ronda</th>

                      {/* Team A Pick */}
                      <th className="px-4 py-3 bg-blue-50/50 text-blue-900 border-r border-blue-100 min-w-[200px]">
                        Pick Equipo A: {summaryA.name}
                      </th>

                      {/* Team B Pick */}
                      <th className="px-4 py-3 bg-purple-50/50 text-purple-900 border-r border-purple-100 min-w-[200px]">
                        Pick Equipo B: {summaryB.name}
                      </th>

                      {/* Round Diff */}
                      <th className="px-3 py-3 text-center border-r border-neutral-200 min-w-[120px] bg-neutral-100/50">
                        Dif. Ronda
                      </th>

                      {/* Cumulative Running Diff */}
                      <th className="px-4 py-3 text-center bg-amber-50/60 text-amber-900 font-bold min-w-[160px]">
                        Diferencia Acumulada
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {rounds.map((r) => {
                      const isAWinner = r.winner === "A";
                      const isBWinner = r.winner === "B";

                      return (
                        <tr key={r.ronda} className="hover:bg-neutral-50/80 transition-colors">
                          {/* Ronda Number */}
                          <td className="px-3 py-2.5 text-center border-r border-neutral-200 font-mono font-bold text-neutral-600 bg-neutral-50">
                            Ronda {r.ronda}
                          </td>

                          {/* Team A Pick Details */}
                          <td
                            className={cn(
                              "px-4 py-2.5 border-r border-neutral-100",
                              isAWinner ? "bg-blue-50/60 font-medium" : "bg-white"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "truncate max-w-[150px]",
                                  isAWinner ? "font-bold text-blue-900" : "text-neutral-700"
                                )}
                                title={r.pickA.ciclista}
                              >
                                {r.pickA.ciclista}
                              </span>
                              <span
                                className={cn(
                                  "font-mono tabular-nums px-2 py-0.5 rounded text-xs ml-2 shrink-0 font-bold",
                                  isAWinner
                                    ? "bg-blue-200/70 text-blue-900"
                                    : "bg-neutral-100 text-neutral-600"
                                )}
                              >
                                {r.pickA.puntos} pts
                              </span>
                            </div>
                          </td>

                          {/* Team B Pick Details */}
                          <td
                            className={cn(
                              "px-4 py-2.5 border-r border-neutral-100",
                              isBWinner ? "bg-purple-50/60 font-medium" : "bg-white"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "truncate max-w-[150px]",
                                  isBWinner ? "font-bold text-purple-900" : "text-neutral-700"
                                )}
                                title={r.pickB.ciclista}
                              >
                                {r.pickB.ciclista}
                              </span>
                              <span
                                className={cn(
                                  "font-mono tabular-nums px-2 py-0.5 rounded text-xs ml-2 shrink-0 font-bold",
                                  isBWinner
                                    ? "bg-purple-200/70 text-purple-900"
                                    : "bg-neutral-100 text-neutral-600"
                                )}
                              >
                                {r.pickB.puntos} pts
                              </span>
                            </div>
                          </td>

                          {/* Round Difference */}
                          <td className="px-3 py-2.5 text-center border-r border-neutral-200 bg-neutral-50/30">
                            <span
                              className={cn(
                                "inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-mono font-bold tabular-nums",
                                r.diffRound > 0
                                  ? "bg-blue-100 text-blue-800"
                                  : r.diffRound < 0
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-neutral-200 text-neutral-600"
                              )}
                            >
                              {r.diffRound > 0
                                ? `+${r.diffRound} (A)`
                                : r.diffRound < 0
                                ? `+${Math.abs(r.diffRound)} (B)`
                                : "0"}
                            </span>
                          </td>

                          {/* Cumulative Running Total */}
                          <td
                            className={cn(
                              "px-4 py-2.5 text-center font-mono font-black tabular-nums text-xs",
                              r.cumulativeDiff > 0
                                ? "bg-blue-50 text-blue-900"
                                : r.cumulativeDiff < 0
                                ? "bg-purple-50 text-purple-900"
                                : "bg-neutral-100 text-neutral-700"
                            )}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <span>
                                {r.cumulativeDiff > 0
                                  ? `+${r.cumulativeDiff}`
                                  : r.cumulativeDiff < 0
                                  ? `+${Math.abs(r.cumulativeDiff)}`
                                  : "0"}
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-white/80 border border-neutral-200/80 shadow-2xs">
                                {r.cumulativeLeader === "A"
                                  ? `Líder: A`
                                  : r.cumulativeLeader === "B"
                                  ? `Líder: B`
                                  : "Empate"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Summary Footer Row */}
                  <tfoot className="bg-neutral-100 border-t-2 border-neutral-300 font-bold text-xs">
                    <tr>
                      <td className="px-3 py-3 text-center text-neutral-600">TOTAL</td>
                      <td className="px-4 py-3 bg-blue-100/70 text-blue-950 font-black text-right pr-6">
                        {summaryA.totalPts.toLocaleString()} pts
                      </td>
                      <td className="px-4 py-3 bg-purple-100/70 text-purple-950 font-black text-right pr-6">
                        {summaryB.totalPts.toLocaleString()} pts
                      </td>
                      <td className="px-3 py-3 text-center text-neutral-500 font-mono">
                        Rondas: {roundsWonA}A - {roundsWonB}B
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-center font-black font-mono text-sm",
                          finalCumulativeDiff > 0
                            ? "bg-blue-200 text-blue-900"
                            : finalCumulativeDiff < 0
                            ? "bg-purple-200 text-purple-900"
                            : "bg-neutral-200 text-neutral-800"
                        )}
                      >
                        {finalCumulativeDiff > 0
                          ? `+${finalCumulativeDiff} (A Gana)`
                          : finalCumulativeDiff < 0
                          ? `+${Math.abs(finalCumulativeDiff)} (B Gana)`
                          : "Empate Final"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </ReportCard>
        </>
      )}
    </div>
  );
};
