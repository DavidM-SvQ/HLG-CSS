import React, { useContext } from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";

export function SeasonPointsTab() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const { cn, CyclistDetailView, files, playerTeamMap, playerByCyclist, uniqueRaces, leaderboard, raceWinners, globalTeamPartialWinsCount, globalTeamWinsCount, cyclistMetadata, cyclistRoundMap, playerOrderMap, seasonSubTab, setSeasonSubTab, isChartExpanded, setIsChartExpanded, evolutionMode, setEvolutionMode, isEvolutionChartExpanded, setIsEvolutionChartExpanded, teamsSortColumn, setTeamsSortColumn, teamsSortDirection, setTeamsSortDirection, isTopTeamsTableExpanded, setIsTopTeamsTableExpanded, isTopTeamsTableCopying, setIsTopTeamsTableCopying, isWinsRankingExpanded, setIsWinsRankingExpanded, winsChartType, setWinsChartType, historyTeamFilter, setHistoryTeamFilter, historySortColumn, setHistorySortColumn, historySortDirection, setHistorySortDirection, cyclistsSubTab, setCyclistsSubTab, cyclistsMonthFilter, setCyclistsMonthFilter, isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen, isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen, isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen, isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded, topCyclistsLimit, setTopCyclistsLimit, isUnscoredExpanded, setIsUnscoredExpanded, isUndebutedExpanded, setIsUndebutedExpanded, noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter, isNoDraftCyclistsExpanded, setIsNoDraftCyclistsExpanded, noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit, selectedCyclistDetail, setSelectedCyclistDetail, isCopying, setIsCopying, winsRankingRef, winsHistoryRef, unscoredTableRef, undebutedTableRef, noDraftCyclistsTableRef, LINE_COLORS, topTeamsSortColumn, setTopTeamsSortColumn, topTeamsSortDirection, setTopTeamsSortDirection, winsHistorySortColumn, setWinsHistorySortColumn, winsHistorySortDirection, setWinsHistorySortDirection, cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection, unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn, unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection, undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn, undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection, noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn, noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection, teamsMonthFilter, setTeamsMonthFilter, historyMonthFilter, setHistoryMonthFilter, cyclistsTeamFilter, setCyclistsTeamFilter, isTeamFilterOpen, setIsTeamFilterOpen, cyclistsCategoryFilter, setCyclistsCategoryFilter, isCategoryFilterOpen, setIsCategoryFilterOpen, cyclistsRoundFilter, setCyclistsRoundFilter, isRoundFilterOpen, setIsRoundFilterOpen, cyclistsNameSearch, setCyclistsNameSearch, unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter, unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter, isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen, undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter, undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter, isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen, noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter, isChartCopying, setIsChartCopying, isEvolutionChartCopying, setIsEvolutionChartCopying, isTopTeamsCopying, setIsTopTeamsCopying, isWinsRankingCopying, setIsWinsRankingCopying, isWinsEvolutionCopying, setIsWinsEvolutionCopying, isWinsHistoryCopying, setIsWinsHistoryCopying, isWinsHistoryTextCopying, setIsWinsHistoryTextCopying, isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying, isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying, isUnscoredCopying, setIsUnscoredCopying, isUnscoredTextCopying, setIsUnscoredTextCopying, isUndebutedCopying, setIsUndebutedCopying, isUndebutedTextCopying, setIsUndebutedTextCopying, isNoDraftCyclistsCopying, setIsNoDraftCyclistsCopying, isNoDraftCyclistsTextCopying, setIsNoDraftCyclistsTextCopying, chartRef, evolutionChartRef, topTeamsTableRef, winsRankingTableRef, winsEvolutionRef, winsHistoryTableRef, topCyclistsDraftRef, unscoredRef, undebutedRef, noDraftCyclistsRef, selectedEvolutionTeams, setSelectedEvolutionTeams, isExpanded, setIsExpanded, isEvolutionExpanded, setIsEvolutionExpanded, isWinsExpanded, setIsWinsExpanded, isWinsEvolutionExpanded, setIsWinsEvolutionExpanded, isWinsHistoryExpanded, setIsWinsHistoryExpanded, leaderboardTeamsSearch, setLeaderboardTeamsSearch, winsSearch, setWinsSearch, winsHistorySearch, setWinsHistorySearch, handleCopyChart, handleDownloadChart, handleCopyEvolutionChart, handleDownloadEvolutionChart, handleCopyTopTeamsTable, handleDownloadTopTeamsTable, handleCopyWinsRanking, handleDownloadWinsRanking, handleCopyWinsEvolution, handleDownloadWinsEvolution, handleCopyWinsHistory, handleCopyWinsHistoryText, handleDownloadWinsHistory, handleCopyTopCyclistsDraft, handleCopyTopCyclistsDraftText, handleDownloadTopCyclistsDraft, handleCopyUnscored, handleCopyUnscoredText, handleDownloadUnscored, handleCopyUndebuted, handleCopyUndebutedText, handleDownloadUndebuted, handleCopyNoDraftCyclists, handleCopyNoDraftCyclistsText, handleDownloadNoDraftCyclists, formatNumberSpanish, getVal, filteredLeaderboard, teamWinsCount } = context;

  return (
    <>
      
                        <>
                          {/* General Classification Chart */}
                          <div
                            ref={chartRef}
                            className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm relative group"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                              <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2 w-full sm:w-auto min-w-0">
                                <BarChart3 className="w-5 h-5 text-blue-600 shrink-0" />
                                <span className="truncate">Clasificación General</span>
                              </h3>
                              <div className="copy-button-ignore flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => setIsChartExpanded(true)}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                  title="Ampliar gráfico"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCopyChart}
                                  disabled={isCopying}
                                  className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                    isCopying
                                      ? "bg-green-50 text-green-600 border border-green-200"
                                      : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100",
                                  )}
                                  title={
                                    isCopying
                                      ? "Copiado"
                                      : "Copiar gráfico como imagen"
                                  }
                                >
                                  {isCopying ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={handleDownloadChart}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                  title="Descargar gráfico como imagen"
                                >
                                  <UploadCloud className="w-4 h-4 rotate-180" />
                                </button>
                              </div>
                            </div>
                            <div
                              className="w-full"
                              style={{
                                height: Math.max(
                                  500,
                                  filteredLeaderboard.length * 35 + 60,
                                ),
                              }}
                            >
                              <div className="w-full overflow-x-auto pb-4 h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={filteredLeaderboard.map((p, idx) => {
                                    const draftOrder = p.orden
                                      ? parseInt(p.orden)
                                      : 0;
                                    const currentPos = idx + 1;
                                    const diff = draftOrder - currentPos;
                                    return {
                                      ...p,
                                      displayName: `${p.nombreEquipo} [#${p.orden}]`,
                                      victorias:
                                        teamWinsCount[p.nombreEquipo] || 0,
                                      diff,
                                      pos: currentPos,
                                    };
                                  })}
                                  layout="vertical"
                                  margin={{
                                    top: 20,
                                    right: 50,
                                    left: 20,
                                    bottom: 20,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                    stroke="#f0f0f0"
                                  />
                                  <XAxis
                                    type="number"
                                    tick={{ fontSize: 12 }}
                                  />
                                  <YAxis
                                    dataKey="displayName"
                                    type="category"
                                    width={150}
                                    interval={0}
                                    tick={(props) => {
                                      const { x, y, payload } = props;
                                      const item = filteredLeaderboard?.find(
                                        (p, idx) => {
                                          const displayName = `${p.nombreEquipo} [#${p.orden}]`;
                                          return displayName === payload.value;
                                        },
                                      );

                                      let color = "#64748b"; // default
                                      if (item) {
                                        const idx =
                                          filteredLeaderboard.indexOf(item);
                                        const draftOrder = item.orden
                                          ? parseInt(item.orden)
                                          : 0;
                                        const currentPos = idx + 1;
                                        const diff = draftOrder - currentPos;
                                        if (diff > 0)
                                          color = "#16a34a"; // green-600
                                        else if (diff < 0)
                                          color = "#dc2626"; // red-600
                                        else color = "#ca8a04"; // yellow-600
                                      }

                                      return (
                                        <g transform={`translate(${x},${y})`}>
                                          <text
                                            x={-10}
                                            y={4}
                                            textAnchor="end"
                                            fill={color}
                                            style={{
                                              fontSize: "11px",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {payload.value}
                                          </text>
                                        </g>
                                      );
                                    }}
                                  />
                                  <Tooltip
                                    cursor={{ fill: "#f8fafc" }}
                                    content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                          <div className="bg-white p-4 border border-neutral-200 rounded-xl shadow-xl">
                                            <p className="font-bold text-neutral-900 mb-2">
                                              {data.displayName}
                                            </p>
                                            <div className="space-y-1 text-sm">
                                              <div className="flex justify-between gap-8">
                                                <span className="text-neutral-500">
                                                  Puntos:
                                                </span>
                                                <span className="font-bold text-blue-600">
                                                  {data.puntos}
                                                </span>
                                              </div>
                                              <div className="flex justify-between gap-8">
                                                <span className="text-neutral-500">
                                                  Victorias:
                                                </span>
                                                <span className="font-bold text-yellow-600">
                                                  {data.victorias}
                                                </span>
                                              </div>
                                              <div className="flex justify-between gap-8">
                                                <span className="text-neutral-500">
                                                  Dif con orden:
                                                </span>
                                                <span
                                                  className={cn(
                                                    "font-bold",
                                                    data.diff > 0
                                                      ? "text-green-600"
                                                      : data.diff < 0
                                                        ? "text-red-600"
                                                        : "text-yellow-600",
                                                  )}
                                                >
                                                  {data.diff > 0
                                                    ? `+${data.diff}`
                                                    : data.diff}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Bar
                                    dataKey="puntos"
                                    radius={[0, 4, 4, 0]}
                                    isAnimationActive={false}
                                  >
                                    {filteredLeaderboard.map((entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={
                                          index === 0
                                            ? "#fbbf24"
                                            : index === 1
                                              ? "#94a3b8"
                                              : index === 2
                                                ? "#fb923c"
                                                : "#3b82f6"
                                        }
                                      />
                                    ))}
                                    <LabelList
                                      dataKey="puntos"
                                      position="right"
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: "bold",
                                        fill: "#64748b",
                                      }}
                                    />
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer></div></div>
                            </div>
                          </div>

                          {/* Expanded Chart Modal */}
                          {isChartExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2 whitespace-nowrap">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                    Clasificación General
                                  </h3>
                                  <button
                                    onClick={() => setIsChartExpanded(false)}
                                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8">
                                  <div
                                    className="w-full"
                                    style={{
                                      height: Math.max(
                                        800,
                                        filteredLeaderboard.length * 45 + 100,
                                      ),
                                    }}
                                  >
                                    <div className="w-full overflow-x-auto pb-4 h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="100%">
                                      <BarChart
                                        data={filteredLeaderboard.map(
                                          (p, idx) => {
                                            const draftOrder = p.orden
                                              ? parseInt(p.orden)
                                              : 0;
                                            const currentPos = idx + 1;
                                            const diff =
                                              draftOrder - currentPos;
                                            return {
                                              ...p,
                                              displayName: `${p.nombreEquipo} [#${p.orden}]`,
                                              victorias:
                                                teamWinsCount[p.nombreEquipo] ||
                                                0,
                                              diff,
                                              pos: currentPos,
                                            };
                                          },
                                        )}
                                        layout="vertical"
                                        margin={{
                                          top: 20,
                                          right: 80,
                                          left: 40,
                                          bottom: 20,
                                        }}
                                      >
                                        <CartesianGrid
                                          strokeDasharray="3 3"
                                          horizontal={false}
                                          stroke="#f0f0f0"
                                        />
                                        <XAxis
                                          type="number"
                                          tick={{ fontSize: 14 }}
                                        />
                                        <YAxis
                                          dataKey="displayName"
                                          type="category"
                                          width={200}
                                          interval={0}
                                          tick={(props) => {
                                            const { x, y, payload } = props;
                                            const item =
                                              filteredLeaderboard?.find(
                                                (p, idx) => {
                                                  const displayName = `${p.nombreEquipo} [#${p.orden}]`;
                                                  return (
                                                    displayName ===
                                                    payload.value
                                                  );
                                                },
                                              );

                                            let color = "#64748b";
                                            if (item) {
                                              const idx =
                                                filteredLeaderboard.indexOf(
                                                  item,
                                                );
                                              const draftOrder = item.orden
                                                ? parseInt(item.orden)
                                                : 0;
                                              const currentPos = idx + 1;
                                              const diff =
                                                draftOrder - currentPos;
                                              if (diff > 0) color = "#16a34a";
                                              else if (diff < 0)
                                                color = "#dc2626";
                                              else color = "#ca8a04";
                                            }

                                            return (
                                              <g
                                                transform={`translate(${x},${y})`}
                                              >
                                                <text
                                                  x={-15}
                                                  y={5}
                                                  textAnchor="end"
                                                  fill={color}
                                                  style={{
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                  }}
                                                >
                                                  {payload.value}
                                                </text>
                                              </g>
                                            );
                                          }}
                                        />
                                        <Tooltip
                                          cursor={{ fill: "#f8fafc" }}
                                          content={({ active, payload }) => {
                                            if (
                                              active &&
                                              payload &&
                                              payload.length
                                            ) {
                                              const data = payload[0].payload;
                                              return (
                                                <div className="bg-white p-5 border border-neutral-200 rounded-xl shadow-2xl">
                                                  <p className="font-bold text-neutral-900 text-lg mb-3">
                                                    {data.displayName}
                                                  </p>
                                                  <div className="space-y-2 text-base">
                                                    <div className="flex justify-between gap-12">
                                                      <span className="text-neutral-500">
                                                        Puntos:
                                                      </span>
                                                      <span className="font-bold text-blue-600">
                                                        {data.puntos}
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between gap-12">
                                                      <span className="text-neutral-500">
                                                        Victorias:
                                                      </span>
                                                      <span className="font-bold text-yellow-600">
                                                        {data.victorias}
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between gap-12">
                                                      <span className="text-neutral-500">
                                                        Dif con orden:
                                                      </span>
                                                      <span
                                                        className={cn(
                                                          "font-bold",
                                                          data.diff > 0
                                                            ? "text-green-600"
                                                            : data.diff < 0
                                                              ? "text-red-600"
                                                              : "text-yellow-600",
                                                        )}
                                                      >
                                                        {data.diff > 0
                                                          ? `+${data.diff}`
                                                          : data.diff}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            }
                                            return null;
                                          }}
                                        />
                                        <Bar
                                          dataKey="puntos"
                                          radius={[0, 6, 6, 0]}
                                          isAnimationActive={false}
                                        >
                                          {filteredLeaderboard.map(
                                            (entry, index) => (
                                              <Cell
                                                key={`cell-expanded-${index}`}
                                                fill={
                                                  index === 0
                                                    ? "#fbbf24"
                                                    : index === 1
                                                      ? "#94a3b8"
                                                      : index === 2
                                                        ? "#fb923c"
                                                        : "#3b82f6"
                                                }
                                              />
                                            ),
                                          )}
                                          <LabelList
                                            dataKey="puntos"
                                            position="right"
                                            style={{
                                              fontSize: "12px",
                                              fontWeight: "bold",
                                              fill: "#64748b",
                                            }}
                                          />
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer></div></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Monthly Evolution Chart */}
                          {(() => {
                            const months = [
                              "Ene",
                              "Feb",
                              "Mar",
                              "Abr",
                              "May",
                              "Jun",
                              "Jul",
                              "Ago",
                              "Sep",
                              "Oct",
                              "Nov",
                              "Dic",
                            ];
                            const currentMonthIdx = new Date().getMonth(); // 0-indexed

                            const teamColors: Record<string, string> = {};
                            filteredLeaderboard?.forEach((team, idx) => {
                              const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                              if (idx === 0)
                                teamColors[teamKey] = "#fbbf24"; // Gold
                              else if (idx === 1)
                                teamColors[teamKey] = "#94a3b8"; // Silver
                              else if (idx === 2)
                                teamColors[teamKey] = "#fb923c"; // Bronze
                              else
                                teamColors[teamKey] =
                                  LINE_COLORS[(idx - 3) % LINE_COLORS.length];
                            });

                            const monthlyEvolutionData = (() => {
                              const dataByMonth: any[] = months.map((m) => ({
                                month: m,
                              }));

                              filteredLeaderboard?.forEach((team) => {
                                const teamKey = `${team.nombreEquipo} [#${team.orden}]`;

                                // Skip if not selected (if any are selected)
                                if (
                                  selectedEvolutionTeams.length > 0 &&
                                  !selectedEvolutionTeams.includes(teamKey)
                                ) {
                                  return;
                                }

                                let accumulated = 0;

                                months.forEach((m, mIdx) => {
                                  const monthPoints = team.detalles.reduce(
                                    (sum, d) => {
                                      if (!d.fecha) return sum;
                                      const parts = d.fecha.split("/");
                                      if (parts.length < 2) return sum;
                                      const monthIndex = parseInt(parts[1]) - 1;
                                      if (monthIndex === mIdx)
                                        return sum + d.puntosObtenidos;
                                      return sum;
                                    },
                                    0,
                                  );

                                  if (evolutionMode === "acumulado") {
                                    accumulated += monthPoints;
                                    dataByMonth[mIdx][teamKey] = accumulated;
                                  } else {
                                    dataByMonth[mIdx][teamKey] = monthPoints;
                                  }
                                });
                              });

                              // Filter out months with no data AND future months
                              return dataByMonth.filter((m, idx) => {
                                const hasData = Object.keys(m).some(
                                  (key) => key !== "month" && m[key] > 0,
                                );
                                return hasData && idx <= currentMonthIdx;
                              });
                            })();

                            return (
                              <div
                                ref={evolutionChartRef}
                                className="mt-12 group relative"
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 mb-6 gap-4">
                                  <div className="flex items-center gap-4 min-w-0">
                                    <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2 min-w-0">
                                      <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
                                      <span className="truncate">Evolución Mensual</span>
                                    </h3>
                                    <div className="copy-button-ignore flex items-center gap-2 shrink-0">
                                      <button
                                        onClick={() =>
                                          setIsEvolutionChartExpanded(true)
                                        }
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Ampliar gráfico"
                                      >
                                        <Maximize2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={handleCopyEvolutionChart}
                                        disabled={isEvolutionChartCopying}
                                        className={cn(
                                          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                          isEvolutionChartCopying
                                            ? "bg-green-50 text-green-600 border border-green-200"
                                            : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100",
                                        )}
                                        title={
                                          isEvolutionChartCopying
                                            ? "Copiado"
                                            : "Copiar gráfico como imagen"
                                        }
                                      >
                                        {isEvolutionChartCopying ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={handleDownloadEvolutionChart}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Descargar gráfico como imagen"
                                      >
                                        <UploadCloud className="w-4 h-4 rotate-180" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex bg-neutral-100 p-1 rounded-lg">
                                    <button
                                      onClick={() =>
                                        setEvolutionMode("acumulado")
                                      }
                                      className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                        evolutionMode === "acumulado"
                                          ? "bg-white text-blue-600 shadow-sm"
                                          : "text-neutral-500 hover:text-neutral-700",
                                      )}
                                    >
                                      Acumulado
                                    </button>
                                    <button
                                      onClick={() =>
                                        setEvolutionMode("mensual")
                                      }
                                      className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                        evolutionMode === "mensual"
                                          ? "bg-white text-blue-600 shadow-sm"
                                          : "text-neutral-500 hover:text-neutral-700",
                                      )}
                                    >
                                      Mensual
                                    </button>
                                  </div>
                                </div>

                                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                                  {/* Team Selector */}
                                  <div className="mb-6 pb-6 border-b border-neutral-100">
                                    <div className="flex items-center justify-between mb-4">
                                      <p className="text-sm font-bold text-neutral-700">
                                        Filtrar Equipos:
                                      </p>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            setSelectedEvolutionTeams([])
                                          }
                                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                        >
                                          Mostrar Todos
                                        </button>
                                        <button
                                          onClick={() =>
                                            setSelectedEvolutionTeams(
                                              filteredLeaderboard.map(
                                                (t) =>
                                                  `${t.nombreEquipo} [#${t.orden}]`,
                                              ),
                                            )
                                          }
                                          className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                                        >
                                          Seleccionar Todos
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {filteredLeaderboard.map((team, idx) => {
                                        const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                                        const isSelected =
                                          selectedEvolutionTeams.length === 0 ||
                                          selectedEvolutionTeams.includes(
                                            teamKey,
                                          );
                                        const color = teamColors[teamKey];

                                        return (
                                          <button
                                            key={teamKey}
                                            onClick={() => {
                                              if (
                                                selectedEvolutionTeams.length ===
                                                0
                                              ) {
                                                // If none were explicitly selected (all shown), select only this one
                                                setSelectedEvolutionTeams([
                                                  teamKey,
                                                ]);
                                              } else {
                                                if (
                                                  selectedEvolutionTeams.includes(
                                                    teamKey,
                                                  )
                                                ) {
                                                  const next =
                                                    selectedEvolutionTeams.filter(
                                                      (t) => t !== teamKey,
                                                    );
                                                  setSelectedEvolutionTeams(
                                                    next,
                                                  );
                                                } else {
                                                  setSelectedEvolutionTeams([
                                                    ...selectedEvolutionTeams,
                                                    teamKey,
                                                  ]);
                                                }
                                              }
                                            }}
                                            className={cn(
                                              "px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2",
                                              isSelected
                                                ? "bg-white shadow-sm"
                                                : "bg-neutral-50 text-neutral-400 border-neutral-100 grayscale opacity-50",
                                            )}
                                            style={{
                                              borderColor: isSelected
                                                ? color
                                                : "transparent",
                                              color: isSelected
                                                ? color
                                                : undefined,
                                            }}
                                          >
                                            <div
                                              className="w-2 h-2 rounded-full"
                                              style={{ backgroundColor: color }}
                                            />
                                            {team.nombreEquipo}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="h-[600px] w-full">
                                    <div className="w-full overflow-x-auto pb-4 h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="100%">
                                      <LineChart
                                        data={monthlyEvolutionData}
                                        margin={{
                                          top: 20,
                                          right: 30,
                                          left: 20,
                                          bottom: 60,
                                        }}
                                      >
                                        <CartesianGrid
                                          strokeDasharray="3 3"
                                          vertical={false}
                                          stroke="#f0f0f0"
                                        />
                                        <XAxis
                                          dataKey="month"
                                          tick={{ fontSize: 12 }}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                          contentStyle={{
                                            borderRadius: "12px",
                                            border: "none",
                                            boxShadow:
                                              "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                          }}
                                          itemSorter={(item) =>
                                            -(item.value as number)
                                          }
                                        />
                                        <Legend
                                          verticalAlign="bottom"
                                          align="center"
                                          height={80}
                                          iconType="circle"
                                          wrapperStyle={{
                                            paddingTop: "40px",
                                            paddingBottom: "0px",
                                            fontSize: "12px",
                                          }}
                                        />
                                        {Object.keys(teamColors).map(
                                          (teamKey) => {
                                            // Only render line if selected
                                            if (
                                              selectedEvolutionTeams.length >
                                                0 &&
                                              !selectedEvolutionTeams.includes(
                                                teamKey,
                                              )
                                            ) {
                                              return null;
                                            }
                                            return (
                                              <Line
                                                key={teamKey}
                                                type="monotone"
                                                dataKey={teamKey}
                                                stroke={teamColors[teamKey]}
                                                strokeWidth={3}
                                                dot={{ r: 4, strokeWidth: 2 }}
                                                activeDot={{
                                                  r: 6,
                                                  strokeWidth: 0,
                                                }}
                                                connectNulls
                                              />
                                            );
                                          },
                                        )}
                                      </LineChart>
                                    </ResponsiveContainer></div></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Expanded Evolution Chart Modal */}
                          {isEvolutionChartExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                    Evolución Mensual (
                                    {evolutionMode === "acumulado"
                                      ? "Acumulado"
                                      : "Mensual"}
                                    )
                                  </h3>
                                  <button
                                    onClick={() =>
                                      setIsEvolutionChartExpanded(false)
                                    }
                                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8">
                                  <div className="h-[700px] w-full">
                                    {(() => {
                                      const months = [
                                        "Ene",
                                        "Feb",
                                        "Mar",
                                        "Abr",
                                        "May",
                                        "Jun",
                                        "Jul",
                                        "Ago",
                                        "Sep",
                                        "Oct",
                                        "Nov",
                                        "Dic",
                                      ];
                                      const currentMonthIdx =
                                        new Date().getMonth();

                                      const teamColors: Record<string, string> =
                                        {};
                                      filteredLeaderboard?.forEach(
                                        (team, idx) => {
                                          const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                                          if (idx === 0)
                                            teamColors[teamKey] = "#fbbf24";
                                          else if (idx === 1)
                                            teamColors[teamKey] = "#94a3b8";
                                          else if (idx === 2)
                                            teamColors[teamKey] = "#fb923c";
                                          else
                                            teamColors[teamKey] =
                                              LINE_COLORS[
                                                (idx - 3) % LINE_COLORS.length
                                              ];
                                        },
                                      );

                                      const modalEvolutionData = (() => {
                                        const dataByMonth: any[] = months.map(
                                          (m) => ({ month: m }),
                                        );

                                        filteredLeaderboard?.forEach((team) => {
                                          const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                                          if (
                                            selectedEvolutionTeams.length > 0 &&
                                            !selectedEvolutionTeams.includes(
                                              teamKey,
                                            )
                                          )
                                            return;

                                          let accumulated = 0;
                                          months.forEach((m, mIdx) => {
                                            const monthPoints =
                                              team.detalles.reduce((sum, d) => {
                                                if (!d.fecha) return sum;
                                                const parts =
                                                  d.fecha.split("/");
                                                if (parts.length < 2)
                                                  return sum;
                                                const monthIndex =
                                                  parseInt(parts[1]) - 1;
                                                if (monthIndex === mIdx)
                                                  return (
                                                    sum + d.puntosObtenidos
                                                  );
                                                return sum;
                                              }, 0);

                                            if (evolutionMode === "acumulado") {
                                              accumulated += monthPoints;
                                              dataByMonth[mIdx][teamKey] =
                                                accumulated;
                                            } else {
                                              dataByMonth[mIdx][teamKey] =
                                                monthPoints;
                                            }
                                          });
                                        });

                                        return dataByMonth.filter((m, idx) => {
                                          const hasData = Object.keys(m).some(
                                            (key) =>
                                              key !== "month" && m[key] > 0,
                                          );
                                          return (
                                            hasData && idx <= currentMonthIdx
                                          );
                                        });
                                      })();

                                      return (
                                        <div className="w-full overflow-x-auto pb-4 h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="100%">
                                          <LineChart
                                            data={modalEvolutionData}
                                            margin={{
                                              top: 20,
                                              right: 40,
                                              left: 20,
                                              bottom: 60,
                                            }}
                                          >
                                            <CartesianGrid
                                              strokeDasharray="3 3"
                                              vertical={false}
                                              stroke="#f0f0f0"
                                            />
                                            <XAxis
                                              dataKey="month"
                                              tick={{ fontSize: 14 }}
                                            />
                                            <YAxis tick={{ fontSize: 14 }} />
                                            <Tooltip
                                              contentStyle={{
                                                borderRadius: "12px",
                                                border: "none",
                                                boxShadow:
                                                  "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                                fontSize: "14px",
                                              }}
                                              itemSorter={(item) =>
                                                -(item.value as number)
                                              }
                                            />
                                            <Legend
                                              verticalAlign="bottom"
                                              align="center"
                                              height={100}
                                              iconType="circle"
                                              wrapperStyle={{
                                                paddingTop: "40px",
                                                paddingBottom: "0px",
                                                fontSize: "14px",
                                              }}
                                            />
                                            {Object.keys(teamColors).map(
                                              (teamKey) => {
                                                if (
                                                  selectedEvolutionTeams.length >
                                                    0 &&
                                                  !selectedEvolutionTeams.includes(
                                                    teamKey,
                                                  )
                                                )
                                                  return null;
                                                return (
                                                  <Line
                                                    key={teamKey}
                                                    type="monotone"
                                                    dataKey={teamKey}
                                                    stroke={teamColors[teamKey]}
                                                    strokeWidth={4}
                                                    dot={{
                                                      r: 5,
                                                      strokeWidth: 2,
                                                    }}
                                                    activeDot={{
                                                      r: 8,
                                                      strokeWidth: 0,
                                                    }}
                                                    connectNulls
                                                  />
                                                );
                                              },
                                            )}
                                          </LineChart>
                                        </ResponsiveContainer></div></div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Top Teams Table */}
                          {(() => {
                            // Map races to months
                            const raceMonths: Record<string, number> = {};
                            files.carreras.data?.forEach((r) => {
                              const carreraName = getVal(r, "Carrera")?.trim();
                              const fechaFin = getVal(r, "Fecha");
                              if (carreraName && fechaFin) {
                                const parts = fechaFin.toString().split(/[-/]/);
                                if (parts.length >= 2) {
                                  const monthIndex = parseInt(parts[1]) - 1;
                                  raceMonths[carreraName] = monthIndex;
                                }
                              }
                            });

                            const teamStats = filteredLeaderboard.map(
                              (team, idx) => {
                                const filteredDetalles = team.detalles.filter(
                                  (d) => {
                                    if (
                                      teamsMonthFilter !== "all" &&
                                      raceMonths[d.carrera] !==
                                        parseInt(teamsMonthFilter)
                                    ) {
                                      return false;
                                    }
                                    return true;
                                  },
                                );

                                const puntos = filteredDetalles.reduce(
                                  (sum, d) => sum + d.puntosObtenidos,
                                  0,
                                );
                                const uniqueRaces = new Set(
                                  filteredDetalles.map((d) => d.carrera),
                                );
                                const numCarreras = uniqueRaces.size;

                                let totalDays = 0;
                                uniqueRaces.forEach((raceName) => {
                                  const raceData = files.carreras.data?.find(
                                    (r) =>
                                      getVal(r, "Carrera")?.trim() === raceName,
                                  );
                                  if (raceData) {
                                    const diasStr = getVal(raceData, "Días");
                                    totalDays += parseInt(diasStr) || 1;
                                  } else {
                                    totalDays += 1;
                                  }
                                });

                                // Calculate wins for this team in the filtered period (team with most points in race)
                                let wins = 0;
                                Object.entries(raceWinners).forEach(
                                  ([raceName, winnerTeam]) => {
                                    if (winnerTeam === team.nombreEquipo) {
                                      if (
                                        teamsMonthFilter === "all" ||
                                        raceMonths[raceName] ===
                                          parseInt(teamsMonthFilter)
                                      ) {
                                        wins++;
                                      }
                                    }
                                  },
                                );

                                // Calculate partial wins for this team in the filtered period
                                let partialWins = 0;
                                Object.entries(
                                  globalTeamPartialWinsCount.byRace,
                                ).forEach(([raceName, raceEvents]) => {
                                  if (
                                    teamsMonthFilter === "all" ||
                                    raceMonths[raceName] ===
                                      parseInt(teamsMonthFilter)
                                  ) {
                                    Object.values(raceEvents).forEach(
                                      (winnerTeams) => {
                                        if (
                                          winnerTeams.includes(
                                            team.nombreEquipo,
                                          )
                                        ) {
                                          partialWins++;
                                        }
                                      },
                                    );
                                  }
                                });

                                const ppc =
                                  numCarreras > 0
                                    ? parseFloat(
                                        (puntos / numCarreras).toFixed(1),
                                      )
                                    : 0;
                                const ppd =
                                  totalDays > 0
                                    ? parseFloat(
                                        (puntos / totalDays).toFixed(1),
                                      )
                                    : 0;

                                return {
                                  ...team,
                                  puntos,
                                  numCarreras,
                                  totalDays,
                                  wins,
                                  partialWins,
                                  ppc,
                                  ppd,
                                  diff: parseInt(team.orden) || 0,
                                };
                              },
                            );

                            // Determine ranking based on current period points
                            teamStats.sort(
                              (a, b) =>
                                b.puntos - a.puntos ||
                                parseInt(a.orden) - parseInt(b.orden),
                            );
                            teamStats?.forEach((team, idx) => {
                              team.originalPos = idx + 1;
                              team.diff =
                                (parseInt(team.orden) || 0) - (idx + 1);
                            });

                            // Sort the array according to user selection
                            teamStats.sort((a, b) => {
                              let valA: any, valB: any;
                              switch (teamsSortColumn) {
                                case "pos":
                                  valA = a.originalPos;
                                  valB = b.originalPos;
                                  break;
                                case "equipo":
                                  valA = a.nombreEquipo;
                                  valB = b.nombreEquipo;
                                  break;
                                case "dif":
                                  valA = a.diff;
                                  valB = b.diff;
                                  break;
                                case "victorias":
                                  valA = a.wins;
                                  valB = b.wins;
                                  break;
                                case "victorias_parc":
                                  valA = a.partialWins;
                                  valB = b.partialWins;
                                  break;
                                case "puntos":
                                default:
                                  valA = a.puntos;
                                  valB = b.puntos;
                                  break;
                              }

                              if (
                                typeof valA === "string" &&
                                typeof valB === "string"
                              ) {
                                return teamsSortDirection === "asc"
                                  ? valA.localeCompare(valB)
                                  : valB.localeCompare(valA);
                              }

                              if (valA < valB)
                                return teamsSortDirection === "asc" ? -1 : 1;
                              if (valA > valB)
                                return teamsSortDirection === "asc" ? 1 : -1;
                              return 0;
                            });

                            let maxWins = 0,
                              minWins = Infinity;
                            let maxPartialWins = 0,
                              minPartialWins = Infinity;
                            let maxCarreras = 0,
                              minCarreras = Infinity;
                            let maxDias = 0,
                              minDias = Infinity;
                            let maxPpc = 0,
                              minPpc = Infinity;
                            let maxPpd = 0,
                              minPpd = Infinity;
                            let maxPuntos = 0,
                              minPuntos = Infinity;

                            if (teamStats.length > 0) {
                              maxPuntos = Math.max(
                                ...teamStats.map((s) => s.puntos),
                              );
                              minPuntos = Math.min(
                                ...teamStats.map((s) => s.puntos),
                              );
                              maxWins = Math.max(
                                ...teamStats.map((s) => s.wins),
                              );
                              minWins = Math.min(
                                ...teamStats.map((s) => s.wins),
                              );
                              maxPartialWins = Math.max(
                                ...teamStats.map((s) => s.partialWins),
                              );
                              minPartialWins = Math.min(
                                ...teamStats.map((s) => s.partialWins),
                              );
                              maxCarreras = Math.max(
                                ...teamStats.map((s) => s.numCarreras),
                              );
                              minCarreras = Math.min(
                                ...teamStats.map((s) => s.numCarreras),
                              );
                              maxDias = Math.max(
                                ...teamStats.map((s) => s.totalDays),
                              );
                              minDias = Math.min(
                                ...teamStats.map((s) => s.totalDays),
                              );
                              maxPpc = Math.max(...teamStats.map((s) => s.ppc));
                              minPpc = Math.min(...teamStats.map((s) => s.ppc));
                              maxPpd = Math.max(...teamStats.map((s) => s.ppd));
                              minPpd = Math.min(...teamStats.map((s) => s.ppd));
                            }

                            const getPuntosColor = (val: number) => {
                              if (maxPuntos === minPuntos && val > 0)
                                return "rgb(22, 163, 74)"; // Green 600
                              if (maxPuntos === minPuntos)
                                return "rgb(64, 64, 64)"; // Neutral 700
                              const ratio =
                                (val - minPuntos) / (maxPuntos - minPuntos);

                              // Smooth interpolation: Red (0) -> Yellow (0.5) -> Green (1)
                              // Hue: 0 (Red) -> 120 (Green).
                              // Since Red is 0 and Green is 120 in HSL hue circle:
                              const hue = ratio * 130;
                              return `hsl(${hue}, 80%, 35%)`;
                            };

                            const getColorClass = (
                              val: number,
                              max: number,
                              min: number,
                              isZeroRed: boolean = false,
                            ) => {
                              if (isZeroRed && val === 0)
                                return "text-red-600 font-bold";
                              if (val === max && max > 0)
                                return "text-green-600 font-bold";
                              if (val === min && min < max && !isZeroRed)
                                return "text-yellow-600 font-bold";
                              return "text-neutral-700";
                            };

                            return (
                              <div
                                ref={topTeamsTableRef}
                                className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-12 group relative"
                              >
                                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex items-center justify-between w-full min-w-0">
                                    <div className="min-w-0 pr-4">
                                      <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                        <LayoutGrid className="w-5 h-5 text-blue-600 shrink-0" />
                                        <span className="truncate">Top Equipos por Puntuación</span>
                                      </h3>
                                      <p className="text-xs text-neutral-500 mt-0.5 truncate">
                                        Ranking de los equipos fantasy por
                                        puntuación total.
                                      </p>
                                    </div>
                                    <div className="copy-button-ignore flex shrink-0 items-center gap-2">
                                      <button
                                        onClick={() =>
                                          setIsTopTeamsTableExpanded(true)
                                        }
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Ampliar tabla"
                                      >
                                        <Maximize2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={handleCopyTopTeamsTable}
                                        disabled={isTopTeamsTableCopying}
                                        className={cn(
                                          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                          isTopTeamsTableCopying
                                            ? "bg-green-50 text-green-600 border border-green-200"
                                            : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100",
                                        )}
                                        title={
                                          isTopTeamsTableCopying
                                            ? "Copiado"
                                            : "Copiar tabla como imagen"
                                        }
                                      >
                                        {isTopTeamsTableCopying ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={handleDownloadTopTeamsTable}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Descargar tabla como imagen"
                                      >
                                        <UploadCloud className="w-4 h-4 rotate-180" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <select
                                      value={teamsMonthFilter}
                                      onChange={(e) =>
                                        setTeamsMonthFilter(e.target.value)
                                      }
                                      className="px-3 py-2 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                      <option value="all">
                                        Todos los meses
                                      </option>
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
                                <div className="overflow-x-auto overflow-y-auto max-h-none min-h-[600px] flex justify-center bg-neutral-50/20 pb-8 scrollbar-thin relative mt-2">
                                  <div className="table-responsive-wrapper overflow-auto w-full h-full"><table className="w-auto min-w-[600px] text-sm text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-100 rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50">
                                      <tr>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors whitespace-nowrap border-b border-neutral-100"
                                          onClick={() => {
                                            if (teamsSortColumn === "pos") {
                                              setTeamsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setTeamsSortColumn("pos");
                                              setTeamsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Pos{" "}
                                            {teamsSortColumn === "pos" &&
                                              (teamsSortDirection === "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors whitespace-nowrap border-b border-neutral-100"
                                          onClick={() => {
                                            if (teamsSortColumn === "equipo") {
                                              setTeamsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setTeamsSortColumn("equipo");
                                              setTeamsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Equipo{" "}
                                            {teamsSortColumn === "equipo" &&
                                              (teamsSortDirection === "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors whitespace-nowrap border-b border-neutral-100"
                                          title="Diferencia con el orden en el draft"
                                          onClick={() => {
                                            if (teamsSortColumn === "dif") {
                                              setTeamsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setTeamsSortColumn("dif");
                                              setTeamsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Dif{" "}
                                            {teamsSortColumn === "dif" &&
                                              (teamsSortDirection === "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors whitespace-nowrap border-b border-neutral-100"
                                          title="Victorias del equipo (carrera)"
                                          onClick={() => {
                                            if (
                                              teamsSortColumn === "victorias"
                                            ) {
                                              setTeamsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setTeamsSortColumn("victorias");
                                              setTeamsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Victorias eq.{" "}
                                            {teamsSortColumn === "victorias" &&
                                              (teamsSortDirection === "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors whitespace-nowrap border-b border-neutral-100"
                                          title="Victorias parciales del equipo (etapas, etc)"
                                          onClick={() => {
                                            if (
                                              teamsSortColumn ===
                                              "victorias_parc"
                                            ) {
                                              setTeamsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setTeamsSortColumn(
                                                "victorias_parc",
                                              );
                                              setTeamsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Victorias parc.{" "}
                                            {teamsSortColumn ===
                                              "victorias_parc" &&
                                              (teamsSortDirection === "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors whitespace-nowrap border-b border-neutral-100"
                                          onClick={() => {
                                            if (teamsSortColumn === "puntos") {
                                              setTeamsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setTeamsSortColumn("puntos");
                                              setTeamsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-end gap-1">
                                            Puntos{" "}
                                            {teamsSortColumn === "puntos" &&
                                              (teamsSortDirection === "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                      {teamStats.map((team) => {
                                        const posColor =
                                          team.originalPos === 1
                                            ? "text-yellow-600 bg-yellow-50/50"
                                            : team.originalPos === 2
                                              ? "text-neutral-500 bg-neutral-50/50"
                                              : team.originalPos === 3
                                                ? "text-amber-700 bg-amber-50/50"
                                                : "text-neutral-400";

                                        const winsColor =
                                          team.wins === 0
                                            ? "text-red-600 font-bold"
                                            : team.wins === maxWins &&
                                                maxWins > 0
                                              ? "text-green-600 font-bold"
                                              : team.wins === minWins &&
                                                  minWins < maxWins
                                                ? "text-yellow-600 font-bold"
                                                : "text-neutral-700";

                                        const partialWinsColor =
                                          team.partialWins === 0
                                            ? "text-red-600 font-bold"
                                            : team.partialWins ===
                                                  maxPartialWins &&
                                                maxPartialWins > 0
                                              ? "text-green-600 font-bold"
                                              : team.partialWins ===
                                                    minPartialWins &&
                                                  minPartialWins <
                                                    maxPartialWins
                                                ? "text-yellow-600 font-bold"
                                                : "text-neutral-700";

                                        return (
                                          <tr
                                            key={team.jugador}
                                            className="hover:bg-blue-50/30 transition-colors text-xs"
                                          >
                                            <td
                                              className={cn(
                                                "px-4 py-1 font-bold text-center whitespace-nowrap",
                                                posColor,
                                              )}
                                            >
                                              <div className="flex items-center justify-center gap-1 text-[11px]">
                                                {team.originalPos === 1 ? (
                                                  <Medal className="w-4 h-4 text-yellow-500" />
                                                ) : team.originalPos === 2 ? (
                                                  <Medal className="w-4 h-4 text-neutral-400" />
                                                ) : team.originalPos === 3 ? (
                                                  <Medal className="w-4 h-4 text-amber-600" />
                                                ) : (
                                                  team.originalPos
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                              {team.nombreEquipo}{" "}
                                              <span className="text-neutral-400 font-normal text-[9px] ml-1">
                                                [#{team.orden}]
                                              </span>
                                            </td>
                                            <td className="px-4 py-1 text-center whitespace-nowrap font-mono scale-90">
                                              <span
                                                className={cn(
                                                  "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold",
                                                  team.diff > 0
                                                    ? "bg-green-100 text-green-800"
                                                    : team.diff < 0
                                                      ? "bg-red-100 text-red-800"
                                                      : "bg-neutral-100 text-neutral-600",
                                                )}
                                              >
                                                {team.diff > 0
                                                  ? <>+<span className="font-mono tracking-tight">{formatNumberSpanish(team.diff)}</span></>
                                                  : formatNumberSpanish(
                                                      team.diff,
                                                    )}
                                              </span>
                                            </td>
                                            <td
                                              className={cn(
                                                "px-4 py-1 text-center whitespace-nowrap font-mono",
                                                winsColor,
                                              )}
                                            >
                                              <span className="font-mono tracking-tight">{formatNumberSpanish(team.wins)}</span>
                                            </td>
                                            <td
                                              className={cn(
                                                "px-4 py-1 text-center whitespace-nowrap font-mono",
                                                partialWinsColor,
                                              )}
                                            >
                                              <span className="font-mono tracking-tight">{formatNumberSpanish(
                                                team.partialWins,
                                              )}</span>
                                            </td>
                                            <td
                                              className="px-4 py-1 text-right text-sm whitespace-nowrap font-mono font-bold"
                                              style={{
                                                color: getPuntosColor(
                                                  team.puntos,
                                                ),
                                              }}
                                            >
                                              <span className="font-mono tracking-tight">{formatNumberSpanish(team.puntos)}</span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table></div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Expanded Top Teams Table Modal */}
                          {isTopTeamsTableExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2 whitespace-nowrap">
                                    <LayoutGrid className="w-6 h-6 text-blue-600" />
                                    Top Equipos por Puntuación
                                  </h3>
                                  <button
                                    onClick={() =>
                                      setIsTopTeamsTableExpanded(false)
                                    }
                                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                                <div className="flex-1 overflow-auto p-8">
                                  {(() => {
                                    // Re-calculate stats for the modal
                                    const raceMonths: Record<string, number> =
                                      {};
                                    files.carreras.data?.forEach((r) => {
                                      const carreraName = getVal(
                                        r,
                                        "Carrera",
                                      )?.trim();
                                      const fechaFin = getVal(r, "Fecha");
                                      if (carreraName && fechaFin) {
                                        const parts = fechaFin.toString().split(/[-/]/);
                                        if (parts.length >= 2) {
                                          const monthIndex =
                                            parseInt(parts[1]) - 1;
                                          raceMonths[carreraName] = monthIndex;
                                        }
                                      }
                                    });

                                    const modalTeamStats =
                                      filteredLeaderboard.map((team, idx) => {
                                        const filteredDetalles =
                                          team.detalles.filter((d) => {
                                            if (
                                              teamsMonthFilter !== "all" &&
                                              raceMonths[d.carrera] !==
                                                parseInt(teamsMonthFilter)
                                            ) {
                                              return false;
                                            }
                                            return true;
                                          });

                                        const puntos = filteredDetalles.reduce(
                                          (sum, d) => sum + d.puntosObtenidos,
                                          0,
                                        );
                                        const uniqueRaces = new Set(
                                          filteredDetalles.map(
                                            (d) => d.carrera,
                                          ),
                                        );
                                        const numCarreras = uniqueRaces.size;

                                        let totalDays = 0;
                                        uniqueRaces.forEach((raceName) => {
                                          const raceData =
                                            files.carreras.data?.find(
                                              (r) =>
                                                getVal(r, "Carrera")?.trim() ===
                                                raceName,
                                            );
                                          if (raceData) {
                                            const diasStr = getVal(
                                              raceData,
                                              "Días",
                                            );
                                            totalDays += parseInt(diasStr) || 1;
                                          } else {
                                            totalDays += 1;
                                          }
                                        });

                                        let wins = 0;
                                        Object.entries(raceWinners).forEach(
                                          ([raceName, winnerTeam]) => {
                                            if (
                                              winnerTeam === team.nombreEquipo
                                            ) {
                                              if (
                                                teamsMonthFilter === "all" ||
                                                raceMonths[raceName] ===
                                                  parseInt(teamsMonthFilter)
                                              ) {
                                                wins++;
                                              }
                                            }
                                          },
                                        );

                                        let partialWins = 0;
                                        Object.entries(
                                          globalTeamPartialWinsCount.byRace,
                                        ).forEach(([raceName, raceEvents]) => {
                                          if (
                                            teamsMonthFilter === "all" ||
                                            raceMonths[raceName] ===
                                              parseInt(teamsMonthFilter)
                                          ) {
                                            Object.values(raceEvents).forEach(
                                              (winnerTeams) => {
                                                if (
                                                  winnerTeams.includes(
                                                    team.nombreEquipo,
                                                  )
                                                ) {
                                                  partialWins++;
                                                }
                                              },
                                            );
                                          }
                                        });

                                        const ppc =
                                          numCarreras > 0
                                            ? parseFloat(
                                                (puntos / numCarreras).toFixed(
                                                  1,
                                                ),
                                              )
                                            : 0;
                                        const ppd =
                                          totalDays > 0
                                            ? parseFloat(
                                                (puntos / totalDays).toFixed(1),
                                              )
                                            : 0;

                                        return {
                                          ...team,
                                          puntos,
                                          numCarreras,
                                          totalDays,
                                          wins,
                                          partialWins,
                                          ppc,
                                          ppd,
                                          diff: parseInt(team.orden) || 0,
                                        };
                                      });

                                    // Determine ranking based on current period points
                                    modalTeamStats.sort(
                                      (a, b) =>
                                        b.puntos - a.puntos ||
                                        parseInt(a.orden) - parseInt(b.orden),
                                    );
                                    modalTeamStats.forEach((team, idx) => {
                                      team.originalPos = idx + 1;
                                      team.diff =
                                        (parseInt(team.orden) || 0) - (idx + 1);
                                    });

                                    modalTeamStats.sort((a, b) => {
                                      let valA: any, valB: any;
                                      switch (teamsSortColumn) {
                                        case "pos":
                                          valA = a.originalPos;
                                          valB = b.originalPos;
                                          break;
                                        case "equipo":
                                          valA = a.nombreEquipo;
                                          valB = b.nombreEquipo;
                                          break;
                                        case "dif":
                                          valA = a.diff;
                                          valB = b.diff;
                                          break;
                                        case "victorias":
                                          valA = a.wins;
                                          valB = b.wins;
                                          break;
                                        case "victorias_parc":
                                          valA = a.partialWins;
                                          valB = b.partialWins;
                                          break;
                                        case "puntos":
                                        default:
                                          valA = a.puntos;
                                          valB = b.puntos;
                                          break;
                                      }

                                      if (
                                        typeof valA === "string" &&
                                        typeof valB === "string"
                                      ) {
                                        return teamsSortDirection === "asc"
                                          ? valA.localeCompare(valB)
                                          : valB.localeCompare(valA);
                                      }

                                      if (valA < valB)
                                        return teamsSortDirection === "asc"
                                          ? -1
                                          : 1;
                                      if (valA > valB)
                                        return teamsSortDirection === "asc"
                                          ? 1
                                          : -1;
                                      return 0;
                                    });

                                    let maxWins = 0,
                                      minWins = Infinity;
                                    let maxPartialWins = 0,
                                      minPartialWins = Infinity;
                                    let maxPuntos = 0,
                                      minPuntos = Infinity;
                                    if (modalTeamStats.length > 0) {
                                      maxPuntos = Math.max(
                                        ...modalTeamStats.map((s) => s.puntos),
                                      );
                                      minPuntos = Math.min(
                                        ...modalTeamStats.map((s) => s.puntos),
                                      );
                                      maxWins = Math.max(
                                        ...modalTeamStats.map((s) => s.wins),
                                      );
                                      minWins = Math.min(
                                        ...modalTeamStats.map((s) => s.wins),
                                      );
                                      maxPartialWins = Math.max(
                                        ...modalTeamStats.map(
                                          (s) => s.partialWins,
                                        ),
                                      );
                                      minPartialWins = Math.min(
                                        ...modalTeamStats.map(
                                          (s) => s.partialWins,
                                        ),
                                      );
                                    }

                                    const getPuntosColor = (val: number) => {
                                      if (maxPuntos === minPuntos && val > 0)
                                        return "rgb(22, 163, 74)";
                                      if (maxPuntos === minPuntos)
                                        return "rgb(64, 64, 64)";
                                      const ratio =
                                        (val - minPuntos) /
                                        (maxPuntos - minPuntos);
                                      const hue = ratio * 130;
                                      return `hsl(${hue}, 80%, 35%)`;
                                    };

                                    return (
                                      <div className="max-h-[85vh] overflow-y-auto scrollbar-thin">
                                        <div className="flex justify-center bg-neutral-50/20 py-6">
                                          <div className="table-responsive-wrapper overflow-auto w-full h-full"><table className="w-auto min-w-[700px] text-base text-left bg-white border-separate border-spacing-0 shadow-xl rounded-xl border border-neutral-100">
                                            <thead className="text-xs text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
                                              <tr>
                                                <th
                                                  className="sticky top-0 z-30 bg-neutral-50 px-6 py-2.5 font-bold text-center whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors border-b border-neutral-100"
                                                  onClick={() => {
                                                    if (
                                                      teamsSortColumn === "pos"
                                                    ) {
                                                      setTeamsSortDirection(
                                                        (d) =>
                                                          d === "asc"
                                                            ? "desc"
                                                            : "asc",
                                                      );
                                                    } else {
                                                      setTeamsSortColumn("pos");
                                                      setTeamsSortDirection(
                                                        "asc",
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <div className="flex items-center justify-center gap-1">
                                                    Pos{" "}
                                                    {teamsSortColumn ===
                                                      "pos" &&
                                                      (teamsSortDirection ===
                                                      "asc" ? (
                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                      ) : (
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                      ))}
                                                  </div>
                                                </th>
                                                <th
                                                  className="sticky top-0 z-30 bg-neutral-50 px-6 py-2.5 font-bold whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors border-b border-neutral-100"
                                                  onClick={() => {
                                                    if (
                                                      teamsSortColumn ===
                                                      "equipo"
                                                    ) {
                                                      setTeamsSortDirection(
                                                        (d) =>
                                                          d === "asc"
                                                            ? "desc"
                                                            : "asc",
                                                      );
                                                    } else {
                                                      setTeamsSortColumn(
                                                        "equipo",
                                                      );
                                                      setTeamsSortDirection(
                                                        "asc",
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <div className="flex items-center gap-1">
                                                    Equipo{" "}
                                                    {teamsSortColumn ===
                                                      "equipo" &&
                                                      (teamsSortDirection ===
                                                      "asc" ? (
                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                      ) : (
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                      ))}
                                                  </div>
                                                </th>
                                                <th
                                                  className="sticky top-0 z-30 bg-neutral-50 px-6 py-2.5 font-bold text-center whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors border-b border-neutral-100"
                                                  onClick={() => {
                                                    if (
                                                      teamsSortColumn === "dif"
                                                    ) {
                                                      setTeamsSortDirection(
                                                        (d) =>
                                                          d === "asc"
                                                            ? "desc"
                                                            : "asc",
                                                      );
                                                    } else {
                                                      setTeamsSortColumn("dif");
                                                      setTeamsSortDirection(
                                                        "asc",
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <div className="flex items-center justify-center gap-1">
                                                    Dif{" "}
                                                    {teamsSortColumn ===
                                                      "dif" &&
                                                      (teamsSortDirection ===
                                                      "asc" ? (
                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                      ) : (
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                      ))}
                                                  </div>
                                                </th>
                                                <th
                                                  className="sticky top-0 z-30 bg-neutral-50 px-6 py-2.5 font-bold text-center whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors border-b border-neutral-100"
                                                  title="Victorias del equipo (carrera)"
                                                  onClick={() => {
                                                    if (
                                                      teamsSortColumn ===
                                                      "victorias"
                                                    ) {
                                                      setTeamsSortDirection(
                                                        (d) =>
                                                          d === "asc"
                                                            ? "desc"
                                                            : "asc",
                                                      );
                                                    } else {
                                                      setTeamsSortColumn(
                                                        "victorias",
                                                      );
                                                      setTeamsSortDirection(
                                                        "desc",
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <div className="flex items-center justify-center gap-1">
                                                    Victorias eq.{" "}
                                                    {teamsSortColumn ===
                                                      "victorias" &&
                                                      (teamsSortDirection ===
                                                      "asc" ? (
                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                      ) : (
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                      ))}
                                                  </div>
                                                </th>
                                                <th
                                                  className="sticky top-0 z-30 bg-neutral-50 px-6 py-2.5 font-bold text-center whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors border-b border-neutral-100"
                                                  title="Victorias parciales del equipo (etapas, etc)"
                                                  onClick={() => {
                                                    if (
                                                      teamsSortColumn ===
                                                      "victorias_parc"
                                                    ) {
                                                      setTeamsSortDirection(
                                                        (d) =>
                                                          d === "asc"
                                                            ? "desc"
                                                            : "asc",
                                                      );
                                                    } else {
                                                      setTeamsSortColumn(
                                                        "victorias_parc",
                                                      );
                                                      setTeamsSortDirection(
                                                        "desc",
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <div className="flex items-center justify-center gap-1">
                                                    Victorias parc.{" "}
                                                    {teamsSortColumn ===
                                                      "victorias_parc" &&
                                                      (teamsSortDirection ===
                                                      "asc" ? (
                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                      ) : (
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                      ))}
                                                  </div>
                                                </th>
                                                <th
                                                  className="sticky top-0 z-30 bg-neutral-50 px-6 py-2.5 font-bold text-right whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors border-b border-neutral-100"
                                                  onClick={() => {
                                                    if (
                                                      teamsSortColumn ===
                                                      "puntos"
                                                    ) {
                                                      setTeamsSortDirection(
                                                        (d) =>
                                                          d === "asc"
                                                            ? "desc"
                                                            : "asc",
                                                      );
                                                    } else {
                                                      setTeamsSortColumn(
                                                        "puntos",
                                                      );
                                                      setTeamsSortDirection(
                                                        "asc",
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <div className="flex items-center justify-end gap-1">
                                                    Puntos{" "}
                                                    {teamsSortColumn ===
                                                      "puntos" &&
                                                      (teamsSortDirection ===
                                                      "asc" ? (
                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                      ) : (
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                      ))}
                                                  </div>
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                              {modalTeamStats.map((team) => {
                                                const posColor =
                                                  team.originalPos === 1
                                                    ? "text-yellow-600 bg-yellow-50/50"
                                                    : team.originalPos === 2
                                                      ? "text-neutral-500 bg-neutral-50/50"
                                                      : team.originalPos === 3
                                                        ? "text-amber-700 bg-amber-50/50"
                                                        : "text-neutral-400";

                                                const winsColor =
                                                  team.wins === 0
                                                    ? "text-red-600 font-bold"
                                                    : team.wins === maxWins &&
                                                        maxWins > 0
                                                      ? "text-green-600 font-bold"
                                                      : team.wins === minWins &&
                                                          minWins < maxWins
                                                        ? "text-yellow-600 font-bold"
                                                        : "text-neutral-700";

                                                const partialWinsColor =
                                                  team.partialWins === 0
                                                    ? "text-red-600 font-bold"
                                                    : team.partialWins ===
                                                          maxPartialWins &&
                                                        maxPartialWins > 0
                                                      ? "text-green-600 font-bold"
                                                      : team.partialWins ===
                                                            minPartialWins &&
                                                          minPartialWins <
                                                            maxPartialWins
                                                        ? "text-yellow-600 font-bold"
                                                        : "text-neutral-700";

                                                return (
                                                  <tr
                                                    key={team.jugador}
                                                    className="hover:bg-blue-50/30 transition-colors"
                                                  >
                                                    <td
                                                      className={cn(
                                                        "px-6 py-2 font-bold text-base text-center whitespace-nowrap",
                                                        posColor,
                                                      )}
                                                    >
                                                      <div className="flex items-center justify-center gap-2">
                                                        {team.originalPos ===
                                                        1 ? (
                                                          <Medal className="w-5 h-5 text-yellow-500" />
                                                        ) : team.originalPos ===
                                                          2 ? (
                                                          <Medal className="w-5 h-5 text-neutral-400" />
                                                        ) : team.originalPos ===
                                                          3 ? (
                                                          <Medal className="w-5 h-5 text-amber-600" />
                                                        ) : (
                                                          team.originalPos
                                                        )}
                                                      </div>
                                                    </td>
                                                    <td className="px-6 py-2 font-bold text-neutral-900 text-base whitespace-nowrap">
                                                      {team.nombreEquipo}{" "}
                                                      <span className="text-neutral-400 font-normal text-xs ml-1">
                                                        [#{team.orden}]
                                                      </span>
                                                    </td>
                                                    <td className="px-6 py-2 text-center whitespace-nowrap font-mono scale-95">
                                                      <span
                                                        className={cn(
                                                          "px-2 py-0.5 rounded-md text-xs font-bold",
                                                          team.diff > 0
                                                            ? "bg-green-100 text-green-700"
                                                            : team.diff < 0
                                                              ? "bg-red-100 text-red-700"
                                                              : "bg-neutral-100 text-neutral-600",
                                                        )}
                                                      >
                                                        {team.diff > 0
                                                          ? <>+<span className="font-mono tracking-tight">{formatNumberSpanish(team.diff)}</span></>
                                                          : formatNumberSpanish(
                                                              team.diff,
                                                            )}
                                                      </span>
                                                    </td>
                                                    <td
                                                      className={cn(
                                                        "px-6 py-2 text-center text-base whitespace-nowrap font-mono",
                                                        winsColor,
                                                      )}
                                                    >
                                                      <span className="font-mono tracking-tight">{formatNumberSpanish(
                                                        team.wins,
                                                      )}</span>
                                                    </td>
                                                    <td
                                                      className={cn(
                                                        "px-6 py-2 text-center text-base whitespace-nowrap font-mono",
                                                        partialWinsColor,
                                                      )}
                                                    >
                                                      <span className="font-mono tracking-tight">{formatNumberSpanish(
                                                        team.partialWins,
                                                      )}</span>
                                                    </td>
                                                    <td
                                                      className="px-6 py-2 text-right text-lg whitespace-nowrap font-mono font-bold"
                                                      style={{
                                                        color: getPuntosColor(
                                                          team.puntos,
                                                        ),
                                                      }}
                                                    >
                                                      <span className="font-mono tracking-tight">{formatNumberSpanish(
                                                        team.puntos,
                                                      )}</span>
                                                    </td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          </table></div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      

                      
    </>
  );
}
