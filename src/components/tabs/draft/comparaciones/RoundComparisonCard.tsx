import React from "react";
import { BarChart2 } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { ReportCard } from "../../../ui/ReportCard";
import { TeamComparisonCaptureHeader } from "./TeamComparisonCaptureHeader";
import { RoundComparisonItem, RoundRankInfo, TeamSummary } from "./types";

export interface RoundComparisonCardProps {
  rounds: RoundComparisonItem[];
  roundPicksMap: Record<string, RoundRankInfo>;
  teamA: string;
  teamB: string;
  summaryA: TeamSummary;
  summaryB: TeamSummary;
  roundsWonA: number;
  roundsWonB: number;
  finalCumulativeDiff: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const RoundComparisonCard: React.FC<RoundComparisonCardProps> = ({
  rounds,
  roundPicksMap,
  teamA,
  teamB,
  summaryA,
  summaryB,
  roundsWonA,
  roundsWonB,
  finalCumulativeDiff,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <ReportCard
      title={
        <span className="flex items-center gap-2 flex-wrap">
          <span>Cara a Cara por Ronda:</span>
          <span className="text-orange-600 font-extrabold">{summaryA?.name || teamA}</span>
          <span className="text-neutral-400 font-bold text-xs uppercase">vs</span>
          <span className="text-purple-600 font-extrabold">{summaryB?.name || teamB}</span>
        </span>
      }
      subtitle="Puntos e impacto de cada elección en su ronda, con la posición del ciclista entre todas las elecciones de esa ronda."
      icon={<BarChart2 className="w-5 h-5 text-orange-600" />}
      filename={`comparacion-rondas-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
      toolbarProps={{
        isExpanded,
        onExpand: onToggleExpand,
      }}
      bodyClassName="p-6 pt-2"
    >
      <TeamComparisonCaptureHeader
        summaryA={summaryA}
        summaryB={summaryB}
        teamA={teamA}
        teamB={teamB}
        totalPointsDiff={finalCumulativeDiff}
      />
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[850px] text-xs">
            <thead className="select-none">
              <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                <th className="px-3 py-3 border-r border-neutral-200 w-16 text-center">Ronda</th>
                <th className="px-4 py-3 bg-orange-50/50 text-orange-950 border-r border-orange-100 min-w-[240px]">
                  Pick Equipo A: {summaryA.name}
                </th>
                <th className="px-4 py-3 bg-purple-50/50 text-purple-900 border-r border-purple-100 min-w-[240px]">
                  Pick Equipo B: {summaryB.name}
                </th>
                <th className="px-3 py-3 text-center border-r border-neutral-200 min-w-[120px] bg-neutral-100/50">
                  Dif. Ronda
                </th>
                <th className="px-4 py-3 text-center bg-amber-50/60 text-amber-900 font-bold min-w-[160px]">
                  Diferencia Acumulada
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 text-xs">
              {rounds.map((r) => {
                const isAWinner = r.winner === "A";
                const isBWinner = r.winner === "B";

                const infoA = roundPicksMap[`${r.ronda}_${r.pickA.ciclista}`];
                const infoB = roundPicksMap[`${r.ronda}_${r.pickB.ciclista}`];

                return (
                  <tr key={r.ronda} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-3 py-2.5 text-center border-r border-neutral-200 font-mono font-bold text-neutral-600 bg-neutral-50">
                      Ronda {r.ronda}
                    </td>

                    {/* Pick Team A (Orange) */}
                    <td
                      className={cn(
                        "px-4 py-2.5 border-r border-neutral-100",
                        isAWinner ? "bg-orange-50/60 font-medium" : "bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span
                            className={cn(
                              "truncate",
                              isAWinner ? "font-bold text-orange-900" : "text-neutral-700"
                            )}
                            title={r.pickA.ciclista}
                          >
                            {r.pickA.ciclista}
                          </span>

                          {/* Round Rank Indicator */}
                          {infoA && (
                            <span className="shrink-0">
                              {infoA.isBest ? (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                                  title="¡El mejor pick de esta ronda en toda la liga!"
                                >
                                  👑 {infoA.rank}º/{infoA.totalInRound}
                                </span>
                              ) : infoA.isWorst ? (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200"
                                  title="El pick con menos puntos de esta ronda"
                                >
                                  🔻 {infoA.rank}º/{infoA.totalInRound}
                                </span>
                              ) : (
                                <span
                                  className="text-[10px] font-mono text-neutral-400 font-medium"
                                  title={`Puesto ${infoA.rank} de ${infoA.totalInRound} en esta ronda`}
                                >
                                  #{infoA.rank}/{infoA.totalInRound}
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        <span
                          className={cn(
                            "font-mono tabular-nums px-2 py-0.5 rounded text-xs shrink-0 font-bold",
                            isAWinner
                              ? "bg-orange-200/70 text-orange-900"
                              : "bg-neutral-100 text-neutral-600"
                          )}
                        >
                          {r.pickA.puntos} pts
                        </span>
                      </div>
                    </td>

                    {/* Pick Team B (Purple) */}
                    <td
                      className={cn(
                        "px-4 py-2.5 border-r border-neutral-100",
                        isBWinner ? "bg-purple-50/60 font-medium" : "bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span
                            className={cn(
                              "truncate",
                              isBWinner ? "font-bold text-purple-900" : "text-neutral-700"
                            )}
                            title={r.pickB.ciclista}
                          >
                            {r.pickB.ciclista}
                          </span>

                          {/* Round Rank Indicator */}
                          {infoB && (
                            <span className="shrink-0">
                              {infoB.isBest ? (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                                  title="¡El mejor pick de esta ronda en toda la liga!"
                                >
                                  👑 {infoB.rank}º/{infoB.totalInRound}
                                </span>
                              ) : infoB.isWorst ? (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200"
                                  title="El pick con menos puntos de esta ronda"
                                >
                                  🔻 {infoB.rank}º/{infoB.totalInRound}
                                </span>
                              ) : (
                                <span
                                  className="text-[10px] font-mono text-neutral-400 font-medium"
                                  title={`Puesto ${infoB.rank} de ${infoB.totalInRound} en esta ronda`}
                                >
                                  #{infoB.rank}/{infoB.totalInRound}
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        <span
                          className={cn(
                            "font-mono tabular-nums px-2 py-0.5 rounded text-xs shrink-0 font-bold",
                            isBWinner
                              ? "bg-purple-200/70 text-purple-900"
                              : "bg-neutral-100 text-neutral-600"
                          )}
                        >
                          {r.pickB.puntos} pts
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-center border-r border-neutral-200 bg-neutral-50/30">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-mono font-bold tabular-nums",
                          r.diffRound > 0
                            ? "bg-orange-100 text-orange-900"
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

                    <td
                      className={cn(
                        "px-4 py-2.5 text-center font-mono font-black tabular-nums text-xs",
                        r.cumulativeDiff > 0
                          ? "bg-orange-50 text-orange-900"
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

            <tfoot className="bg-neutral-100 border-t-2 border-neutral-300 font-bold text-xs">
              <tr>
                <td className="px-3 py-3 text-center text-neutral-600">TOTAL</td>
                <td className="px-4 py-3 bg-orange-100/70 text-orange-950 font-black text-right pr-6">
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
                      ? "bg-orange-200 text-orange-900"
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
  );
};
