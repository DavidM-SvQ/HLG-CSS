import React from "react";
import { TrendingUp, BarChart2, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import { cn } from "../../../../lib/utils";
import { ReportCard } from "../../../ui/ReportCard";
import { TeamComparisonCaptureHeader } from "./TeamComparisonCaptureHeader";
import { CustomPositionTooltip, CustomPointsTooltip } from "./ComparisonTooltips";
import { MonthlyComparisonItem, TeamSummary, renderRankBadge } from "./types";

export interface MonthlyComparisonCardProps {
  monthlyChartData: MonthlyComparisonItem[];
  totalTeamsInLeague: number;
  teamA: string;
  teamB: string;
  summaryA: TeamSummary | null;
  summaryB: TeamSummary | null;
  finalCumulativeDiff: number;
  isExpandedCharts: boolean;
  onToggleExpandCharts: () => void;
  isExpandedMonths: boolean;
  onToggleExpandMonths: () => void;
}

export const MonthlyComparisonCard: React.FC<MonthlyComparisonCardProps> = ({
  monthlyChartData,
  totalTeamsInLeague,
  teamA,
  teamB,
  summaryA,
  summaryB,
  finalCumulativeDiff,
  isExpandedCharts,
  onToggleExpandCharts,
  isExpandedMonths,
  onToggleExpandMonths,
}) => {
  return (
    <div className="space-y-6 pt-2">
      {/* Charts Card */}
      <ReportCard
        title={
          <span className="flex items-center gap-2 flex-wrap">
            <span>Evolución Mensual:</span>
            <span className="text-orange-600 font-extrabold">{summaryA?.name || teamA}</span>
            <span className="text-neutral-400 font-bold text-xs uppercase">vs</span>
            <span className="text-purple-600 font-extrabold">{summaryB?.name || teamB}</span>
          </span>
        }
        subtitle="Gráficas de trayectoria de puesto oficial en la liga y aceleración de puntos acumulados mes a mes."
        icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
        filename={`evolucion-graficas-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
        toolbarProps={{
          isExpanded: isExpandedCharts,
          onExpand: onToggleExpandCharts,
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Monthly Ranking Evolution in League */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  Evolución de Posiciones Mensual en Liga
                </h4>
                <p className="text-[10px] text-neutral-500">
                  Puesto oficial en la liga al final de cada mes (el puesto 1º se sitúa arriba).
                </p>
              </div>
              <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200">
                {totalTeamsInLeague} equipos
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    reversed={true}
                    domain={[1, Math.max(totalTeamsInLeague, 2)]}
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(v) => `${v}º`}
                  />
                  <RechartsTooltip content={<CustomPositionTooltip teamA={teamA} teamB={teamB} />} />
                  <Line
                    type="monotone"
                    dataKey="teamARank"
                    name={teamA}
                    stroke="#ea580c"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#ea580c", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="teamBRank"
                    name={teamB}
                    stroke="#9333ea"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#9333ea", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-1 border-t border-neutral-100">
              <span className="flex items-center gap-1.5 text-orange-700">
                <span className="w-3 h-3 rounded-full bg-orange-600 inline-block" />
                {teamA}
              </span>
              <span className="flex items-center gap-1.5 text-purple-700">
                <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
                {teamB}
              </span>
            </div>
          </div>

          {/* Chart 2: Monthly Cumulative Points Evolution */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-600" />
                  Evolución de Puntos Acumulados Mensuales
                </h4>
                <p className="text-[10px] text-neutral-500">
                  Crecimiento progresivo de la puntuación total mes a mes.
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <RechartsTooltip content={<CustomPointsTooltip teamA={teamA} teamB={teamB} />} />
                  <Area
                    type="monotone"
                    dataKey="teamACum"
                    name={teamA}
                    stroke="#ea580c"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorA)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="teamBCum"
                    name={teamB}
                    stroke="#9333ea"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorB)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-1 border-t border-neutral-100">
              <span className="flex items-center gap-1.5 text-orange-700">
                <span className="w-3 h-3 rounded-full bg-orange-600 inline-block" />
                {teamA}
              </span>
              <span className="flex items-center gap-1.5 text-purple-700">
                <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
                {teamB}
              </span>
            </div>
          </div>
        </div>
      </ReportCard>

      {/* Monthly Comparison Table with selective bold and short rank badge */}
      <ReportCard
        title={
          <span className="flex items-center gap-2 flex-wrap">
            <span>Tabla de Puntos por Meses:</span>
            <span className="text-orange-600 font-extrabold">{summaryA?.name || teamA}</span>
            <span className="text-neutral-400 font-bold text-xs uppercase">vs</span>
            <span className="text-purple-600 font-extrabold">{summaryB?.name || teamB}</span>
          </span>
        }
        subtitle="Muestra los puntos ganados en el mes y el acumulado. Resaltado en negrita solo el valor máximo de cada duelo."
        icon={<Calendar className="w-5 h-5 text-orange-600" />}
        filename={`comparacion-meses-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
        toolbarProps={{
          isExpanded: isExpandedMonths,
          onExpand: onToggleExpandMonths,
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
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider select-none">
                  <th className="px-3 py-3 border-r border-neutral-200 w-28 text-center">Mes</th>
                  <th className="px-4 py-3 bg-orange-50/50 text-orange-950 border-r border-orange-100 min-w-[140px]">
                    Puntos Mes {teamA}
                  </th>
                  <th className="px-4 py-3 bg-purple-50/50 text-purple-900 border-r border-purple-100 min-w-[140px]">
                    Puntos Mes {teamB}
                  </th>
                  <th className="px-3 py-3 text-center border-r border-neutral-200 min-w-[100px] bg-neutral-100/50">
                    Dif. Mes
                  </th>
                  <th className="px-4 py-3 bg-orange-100/30 text-orange-950 border-r border-orange-100 min-w-[140px]">
                    Acum. {teamA}
                  </th>
                  <th className="px-4 py-3 bg-purple-100/30 text-purple-950 border-r border-purple-100 min-w-[140px]">
                    Acum. {teamB}
                  </th>
                  <th className="px-4 py-3 text-center bg-amber-50/60 text-amber-900 font-bold min-w-[130px] border-r border-neutral-200">
                    Dif. Acumulada
                  </th>
                  <th className="px-3 py-3 text-center bg-neutral-50 min-w-[100px]">
                    Duelo Pos. (A vs B)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 text-xs">
                {monthlyChartData.map((m) => {
                  const isPtsAMax = m.teamAPtsMonth > m.teamBPtsMonth;
                  const isPtsBMax = m.teamBPtsMonth > m.teamAPtsMonth;

                  const isCumAMax = m.teamACum > m.teamBCum;
                  const isCumBMax = m.teamBCum > m.teamACum;

                  return (
                    <tr key={m.monthIndex} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-3 py-2.5 text-center border-r border-neutral-200 font-medium text-neutral-800 bg-neutral-50">
                        {m.monthFull}
                      </td>

                      {/* Puntos Mes Team A (bold only if max) */}
                      <td
                        className={cn(
                          "px-4 py-2.5 border-r border-neutral-100",
                          isPtsAMax ? "bg-orange-50/40" : "bg-white"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "font-mono",
                              isPtsAMax ? "font-bold text-orange-950" : "font-normal text-neutral-600"
                            )}
                          >
                            +{m.teamAPtsMonth.toLocaleString()} pts
                          </span>
                          {renderRankBadge(m.singleMonthRankA, totalTeamsInLeague)}
                        </div>
                      </td>

                      {/* Puntos Mes Team B (bold only if max) */}
                      <td
                        className={cn(
                          "px-4 py-2.5 border-r border-neutral-100",
                          isPtsBMax ? "bg-purple-50/40" : "bg-white"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "font-mono",
                              isPtsBMax ? "font-bold text-purple-950" : "font-normal text-neutral-600"
                            )}
                          >
                            +{m.teamBPtsMonth.toLocaleString()} pts
                          </span>
                          {renderRankBadge(m.singleMonthRankB, totalTeamsInLeague)}
                        </div>
                      </td>

                      {/* Dif. Mes (unbolded) */}
                      <td className="px-3 py-2.5 text-center border-r border-neutral-200 bg-neutral-50/30 font-mono font-normal">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs",
                            m.diffMonth > 0
                              ? "bg-orange-100 text-orange-900"
                              : m.diffMonth < 0
                              ? "bg-purple-100 text-purple-800"
                              : "bg-neutral-200 text-neutral-600"
                          )}
                        >
                          {m.diffMonth > 0
                            ? `+${m.diffMonth} (A)`
                            : m.diffMonth < 0
                            ? `+${Math.abs(m.diffMonth)} (B)`
                            : "0"}
                        </span>
                      </td>

                      {/* Acum. Team A (bold only if max) */}
                      <td
                        className={cn(
                          "px-4 py-2.5 border-r border-orange-100",
                          isCumAMax ? "bg-orange-50/50" : "bg-white"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "font-mono",
                              isCumAMax ? "font-bold text-orange-950" : "font-normal text-neutral-600"
                            )}
                          >
                            {m.teamACum.toLocaleString()} pts
                          </span>
                          {renderRankBadge(m.teamARank, totalTeamsInLeague)}
                        </div>
                      </td>

                      {/* Acum. Team B (bold only if max) */}
                      <td
                        className={cn(
                          "px-4 py-2.5 border-r border-purple-100",
                          isCumBMax ? "bg-purple-50/50" : "bg-white"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "font-mono",
                              isCumBMax ? "font-bold text-purple-950" : "font-normal text-neutral-600"
                            )}
                          >
                            {m.teamBCum.toLocaleString()} pts
                          </span>
                          {renderRankBadge(m.teamBRank, totalTeamsInLeague)}
                        </div>
                      </td>

                      {/* Dif. Acumulada (unbolded) */}
                      <td
                        className={cn(
                          "px-4 py-2.5 text-center font-mono font-normal text-xs border-r border-neutral-200",
                          m.diffCum > 0
                            ? "bg-orange-100/40 text-orange-950"
                            : m.diffCum < 0
                            ? "bg-purple-100/40 text-purple-900"
                            : "bg-neutral-100 text-neutral-700"
                        )}
                      >
                        {m.diffCum > 0
                          ? `+${m.diffCum.toLocaleString()} (A)`
                          : m.diffCum < 0
                          ? `+${Math.abs(m.diffCum).toLocaleString()} (B)`
                          : "0"}
                      </td>

                      {/* Duelo Posiciones */}
                      <td className="px-3 py-2.5 text-center font-mono font-normal text-xs bg-neutral-50">
                        <span className="text-orange-700 font-medium">{m.teamARank}º</span>
                        <span className="text-neutral-400 mx-1">vs</span>
                        <span className="text-purple-700 font-medium">{m.teamBRank}º</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </ReportCard>
    </div>
  );
};
