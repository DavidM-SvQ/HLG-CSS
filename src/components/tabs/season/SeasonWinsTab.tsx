import React, { useContext } from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";

export function SeasonWinsTab() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const { cn, CyclistDetailView, files, playerTeamMap, playerByCyclist, uniqueRaces, leaderboard, raceWinners, globalTeamPartialWinsCount, globalTeamWinsCount, cyclistMetadata, cyclistRoundMap, playerOrderMap, seasonSubTab, setSeasonSubTab, isChartExpanded, setIsChartExpanded, evolutionMode, setEvolutionMode, isEvolutionChartExpanded, setIsEvolutionChartExpanded, teamsSortColumn, setTeamsSortColumn, teamsSortDirection, setTeamsSortDirection, isTopTeamsTableExpanded, setIsTopTeamsTableExpanded, isTopTeamsTableCopying, setIsTopTeamsTableCopying, isWinsRankingExpanded, setIsWinsRankingExpanded, winsChartType, setWinsChartType, historyTeamFilter, setHistoryTeamFilter, historySortColumn, setHistorySortColumn, historySortDirection, setHistorySortDirection, cyclistsSubTab, setCyclistsSubTab, cyclistsMonthFilter, setCyclistsMonthFilter, isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen, isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen, isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen, isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded, topCyclistsLimit, setTopCyclistsLimit, isUnscoredExpanded, setIsUnscoredExpanded, isUndebutedExpanded, setIsUndebutedExpanded, noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter, isNoDraftCyclistsExpanded, setIsNoDraftCyclistsExpanded, noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit, selectedCyclistDetail, setSelectedCyclistDetail, isCopying, setIsCopying, winsRankingRef, winsHistoryRef, unscoredTableRef, undebutedTableRef, noDraftCyclistsTableRef, LINE_COLORS, topTeamsSortColumn, setTopTeamsSortColumn, topTeamsSortDirection, setTopTeamsSortDirection, winsHistorySortColumn, setWinsHistorySortColumn, winsHistorySortDirection, setWinsHistorySortDirection, cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection, unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn, unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection, undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn, undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection, noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn, noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection, teamsMonthFilter, setTeamsMonthFilter, historyMonthFilter, setHistoryMonthFilter, cyclistsTeamFilter, setCyclistsTeamFilter, isTeamFilterOpen, setIsTeamFilterOpen, cyclistsCategoryFilter, setCyclistsCategoryFilter, isCategoryFilterOpen, setIsCategoryFilterOpen, cyclistsRoundFilter, setCyclistsRoundFilter, isRoundFilterOpen, setIsRoundFilterOpen, cyclistsNameSearch, setCyclistsNameSearch, unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter, unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter, isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen, undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter, undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter, isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen, noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter, isChartCopying, setIsChartCopying, isEvolutionChartCopying, setIsEvolutionChartCopying, isTopTeamsCopying, setIsTopTeamsCopying, isWinsRankingCopying, setIsWinsRankingCopying, isWinsEvolutionCopying, setIsWinsEvolutionCopying, isWinsHistoryCopying, setIsWinsHistoryCopying, isWinsHistoryTextCopying, setIsWinsHistoryTextCopying, isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying, isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying, isUnscoredCopying, setIsUnscoredCopying, isUnscoredTextCopying, setIsUnscoredTextCopying, isUndebutedCopying, setIsUndebutedCopying, isUndebutedTextCopying, setIsUndebutedTextCopying, isNoDraftCyclistsCopying, setIsNoDraftCyclistsCopying, isNoDraftCyclistsTextCopying, setIsNoDraftCyclistsTextCopying, chartRef, evolutionChartRef, topTeamsTableRef, winsRankingTableRef, winsEvolutionRef, winsHistoryTableRef, topCyclistsDraftRef, unscoredRef, undebutedRef, noDraftCyclistsRef, selectedEvolutionTeams, setSelectedEvolutionTeams, isExpanded, setIsExpanded, isEvolutionExpanded, setIsEvolutionExpanded, isWinsExpanded, setIsWinsExpanded, isWinsEvolutionExpanded, setIsWinsEvolutionExpanded, isWinsHistoryExpanded, setIsWinsHistoryExpanded, leaderboardTeamsSearch, setLeaderboardTeamsSearch, winsSearch, setWinsSearch, winsHistorySearch, setWinsHistorySearch, handleCopyChart, handleDownloadChart, handleCopyEvolutionChart, handleDownloadEvolutionChart, handleCopyTopTeamsTable, handleDownloadTopTeamsTable, handleCopyWinsRanking, handleDownloadWinsRanking, handleCopyWinsEvolution, handleDownloadWinsEvolution, handleCopyWinsHistory, handleCopyWinsHistoryText, handleDownloadWinsHistory, handleCopyTopCyclistsDraft, handleCopyTopCyclistsDraftText, handleDownloadTopCyclistsDraft, handleCopyUnscored, handleCopyUnscoredText, handleDownloadUnscored, handleCopyUndebuted, handleCopyUndebutedText, handleDownloadUndebuted, handleCopyNoDraftCyclists, handleCopyNoDraftCyclistsText, handleDownloadNoDraftCyclists, formatNumberSpanish, getVal, filteredLeaderboard, teamWinsCount } = context;

  return (
    <>
      
                        <div className="space-y-8">
                          <div
                            ref={winsRankingRef}
                            className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm group relative"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                              <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2 min-w-0">
                                <Trophy className="w-5 h-5 text-yellow-500 shrink-0" />
                                <span className="truncate">Ranking de Victorias por Equipo</span>
                              </h3>
                              <div className="copy-button-ignore flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => setIsWinsRankingExpanded(true)}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                  title="Ampliar gráfico"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCopyWinsRanking}
                                  disabled={isWinsRankingCopying}
                                  className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                    isWinsRankingCopying
                                      ? "bg-green-50 text-green-600 border border-green-200"
                                      : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100",
                                  )}
                                  title={
                                    isWinsRankingCopying
                                      ? "Copiado"
                                      : "Copiar gráfico como imagen"
                                  }
                                >
                                  {isWinsRankingCopying ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={handleDownloadWinsRanking}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                  title="Descargar gráfico como imagen"
                                >
                                  <UploadCloud className="w-4 h-4 rotate-180" />
                                </button>
                              </div>
                            </div>
                            <div className="h-[500px] w-full mt-4">
                              {(() => {
                                const chartData = Object.entries(teamWinsCount as Record<string, number>)
                                  .map(([name, wins]) => {
                                    const teamInfo = filteredLeaderboard?.find(
                                      (p) => p.nombreEquipo === name,
                                    );
                                    const displayName = teamInfo
                                      ? `${name} [#${teamInfo.orden}]`
                                      : name;
                                    return { name: displayName, wins };
                                  })
                                  .sort((a, b) => b.wins - a.wins);
                                const maxChartWins =
                                  chartData.length > 0 ? chartData[0].wins : 0;

                                return (
                                  <div className="w-full overflow-x-auto h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="99%">
                                    <BarChart
                                      data={chartData}
                                      layout="vertical"
                                      margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                      }}
                                    >
                                      <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                        stroke="#f5f5f5"
                                      />
                                      <XAxis
                                        type="number"
                                        allowDecimals={false}
                                      />
                                      <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={150}
                                        tick={{ fontSize: 12 }}
                                        interval={0}
                                      />
                                      <Tooltip
                                        cursor={{ fill: "#f5f5f5" }}
                                        contentStyle={{
                                          borderRadius: "8px",
                                          border: "none",
                                          boxShadow:
                                            "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                      />
                                      <Bar
                                        dataKey="wins"
                                        radius={[0, 4, 4, 0]}
                                        barSize={24}
                                      >
                                        {chartData.map((entry, index) => (
                                          <Cell
                                            key={`cell-${index}`}
                                            fill={
                                              entry.wins > 0 &&
                                              entry.wins === maxChartWins
                                                ? "#fbbf24"
                                                : "#3b82f6"
                                            }
                                          />
                                        ))}
                                        <LabelList
                                          dataKey="wins"
                                          position="right"
                                          fill="#737373"
                                          fontSize={12}
                                        />
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer></div></div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Expanded Wins Ranking Modal */}
                          {isWinsRankingExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                    Ranking de Victorias por Equipo
                                  </h3>
                                  <button
                                    onClick={() =>
                                      setIsWinsRankingExpanded(false)
                                    }
                                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8">
                                  <div className="h-[700px] w-full">
                                    {(() => {
                                      const chartData = Object.entries(teamWinsCount as Record<string, number>)
                                        .map(([name, wins]) => {
                                          const teamInfo =
                                            filteredLeaderboard?.find(
                                              (p) => p.nombreEquipo === name,
                                            );
                                          const displayName = teamInfo
                                            ? `${name} [#${teamInfo.orden}]`
                                            : name;
                                          return { name: displayName, wins };
                                        })
                                        .sort((a, b) => b.wins - a.wins);

                                      return (
                                        <div className="w-full overflow-x-auto h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="99%">
                                          <BarChart
                                            data={chartData}
                                            layout="vertical"
                                            margin={{
                                              top: 20,
                                              right: 60,
                                              left: 40,
                                              bottom: 20,
                                            }}
                                          >
                                            <CartesianGrid
                                              strokeDasharray="3 3"
                                              horizontal={true}
                                              vertical={false}
                                              stroke="#f0f0f0"
                                            />
                                            <XAxis type="number" hide />
                                            <YAxis
                                              dataKey="name"
                                              type="category"
                                              width={200}
                                              tick={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                fill: "#404040",
                                              }}
                                            />
                                            <Tooltip
                                              cursor={{ fill: "#f8fafc" }}
                                              contentStyle={{
                                                borderRadius: "12px",
                                                border: "none",
                                                boxShadow:
                                                  "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                              }}
                                            />
                                            <Bar
                                              dataKey="wins"
                                              fill="#3b82f6"
                                              radius={[0, 8, 8, 0]}
                                              barSize={40}
                                            >
                                              <LabelList
                                                dataKey="wins"
                                                position="right"
                                                style={{
                                                  fill: "#1d4ed8",
                                                  fontWeight: 800,
                                                  fontSize: 16,
                                                }}
                                              />
                                            </Bar>
                                          </BarChart>
                                        </ResponsiveContainer></div></div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Monthly Evolution Chart for Wins */}
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

                            const monthlyWinsEvolutionData = (() => {
                              const dataByMonth: any[] = months.map((m) => ({
                                month: m,
                              }));

                              // First, map races to months
                              const raceMonths: Record<string, number> = {};
                              files.carreras.data?.forEach((r) => {
                                const carreraName = getVal(
                                  r,
                                  "Carrera",
                                )?.trim();
                                const fechaFin = getVal(r, "Fecha");
                                if (carreraName && fechaFin) {
                                  const parts = fechaFin.toString().split(/[-/]/);
                                  if (parts.length >= 2) {
                                    const monthIndex = parseInt(parts[1]) - 1;
                                    raceMonths[carreraName] = monthIndex;
                                  }
                                }
                              });

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
                                  // Count wins for this team in this month
                                  let monthWins = 0;
                                  Object.entries(raceWinners).forEach(
                                    ([raceName, winnerTeam]) => {
                                      if (
                                        winnerTeam === team.nombreEquipo &&
                                        raceMonths[raceName] === mIdx
                                      ) {
                                        monthWins++;
                                      }
                                    },
                                  );

                                  if (winsChartType === "acumulado") {
                                    accumulated += monthWins;
                                    dataByMonth[mIdx][teamKey] = accumulated;
                                  } else {
                                    dataByMonth[mIdx][teamKey] = monthWins;
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
                                ref={winsEvolutionRef}
                                className="mt-12 group relative"
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 mb-6 gap-4">
                                  <div className="flex items-center gap-4 min-w-0">
                                    <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2 min-w-0">
                                      <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
                                      <span className="truncate">Evolución Mensual de Victorias</span>
                                    </h3>
                                    <div className="copy-button-ignore flex items-center gap-2 shrink-0">
                                      <button
                                        onClick={() =>
                                          setIsWinsEvolutionExpanded(true)
                                        }
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Ampliar gráfico"
                                      >
                                        <Maximize2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={handleCopyWinsEvolution}
                                        disabled={isWinsEvolutionCopying}
                                        className={cn(
                                          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                          isWinsEvolutionCopying
                                            ? "bg-green-50 text-green-600 border border-green-200"
                                            : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100",
                                        )}
                                        title={
                                          isWinsEvolutionCopying
                                            ? "Copiado"
                                            : "Copiar gráfico como imagen"
                                        }
                                      >
                                        {isWinsEvolutionCopying ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={handleDownloadWinsEvolution}
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
                                        setWinsChartType("acumulado")
                                      }
                                      className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                        winsChartType === "acumulado"
                                          ? "bg-white text-blue-600 shadow-sm"
                                          : "text-neutral-500 hover:text-neutral-700",
                                      )}
                                    >
                                      Acumulado
                                    </button>
                                    <button
                                      onClick={() =>
                                        setWinsChartType("mensual")
                                      }
                                      className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                        winsChartType === "mensual"
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
                                                selectedEvolutionTeams.includes(
                                                  teamKey,
                                                )
                                              ) {
                                                setSelectedEvolutionTeams(
                                                  selectedEvolutionTeams.filter(
                                                    (t) => t !== teamKey,
                                                  ),
                                                );
                                              } else {
                                                setSelectedEvolutionTeams([
                                                  ...selectedEvolutionTeams,
                                                  teamKey,
                                                ]);
                                              }
                                            }}
                                            className={cn(
                                              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                              isSelected
                                                ? "bg-white shadow-sm"
                                                : "bg-neutral-50 text-neutral-400 border-transparent hover:bg-neutral-100",
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
                                            {team.nombreEquipo}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="h-[400px] w-full">
                                    {monthlyWinsEvolutionData.length > 0 ? (
                                      <div className="w-full overflow-x-auto h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="99%">
                                        <LineChart
                                          data={monthlyWinsEvolutionData}
                                          margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 40,
                                          }}
                                        >
                                          <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#f5f5f5"
                                          />
                                          <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                              fontSize: 12,
                                              fill: "#94a3b8",
                                            }}
                                            dy={10}
                                          />
                                          <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                              fontSize: 12,
                                              fill: "#94a3b8",
                                            }}
                                            allowDecimals={false}
                                          />
                                          <Tooltip
                                            contentStyle={{
                                              borderRadius: "8px",
                                              border: "none",
                                              boxShadow:
                                                "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                            }}
                                            itemStyle={{
                                              fontSize: "12px",
                                              fontWeight: "bold",
                                            }}
                                            labelStyle={{
                                              fontSize: "12px",
                                              color: "#64748b",
                                              marginBottom: "4px",
                                            }}
                                          />
                                          <Legend
                                            verticalAlign="bottom"
                                            align="center"
                                            wrapperStyle={{
                                              fontSize: "12px",
                                              paddingTop: "30px",
                                            }}
                                            iconType="circle"
                                          />
                                          {filteredLeaderboard.map((team) => {
                                            const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
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
                                                strokeWidth={3}
                                                dot={{
                                                  r: 4,
                                                  strokeWidth: 2,
                                                  fill: "#fff",
                                                }}
                                                activeDot={{
                                                  r: 6,
                                                  strokeWidth: 0,
                                                }}
                                              />
                                            );
                                          })}
                                        </LineChart>
                                      </ResponsiveContainer></div></div>
                                    ) : (
                                      <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
                                        No hay datos de victorias para mostrar
                                        en los meses transcurridos.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Expanded Wins Evolution Modal */}
                          {isWinsEvolutionExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                    Evolución Mensual de Victorias (
                                    {winsChartType === "acumulado"
                                      ? "Acumulado"
                                      : "Mensual"}
                                    )
                                  </h3>
                                  <button
                                    onClick={() =>
                                      setIsWinsEvolutionExpanded(false)
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

                                      const modalWinsEvolutionData = (() => {
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
                                            let monthWins = 0;
                                            Object.entries(raceWinners).forEach(
                                              ([raceName, winnerTeam]) => {
                                                if (
                                                  winnerTeam ===
                                                  team.nombreEquipo
                                                ) {
                                                  const raceData =
                                                    files.carreras.data?.find(
                                                      (r) =>
                                                        getVal(
                                                          r,
                                                          "Carrera",
                                                        )?.trim() === raceName,
                                                    );
                                                  if (raceData) {
                                                    const fechaFin = getVal(
                                                      raceData,
                                                      "Fecha",
                                                    );
                                                    if (fechaFin) {
                                                      const parts =
                                                        fechaFin.toString().split(/[-/]/);
                                                      if (parts.length >= 2) {
                                                        const raceMonthIndex =
                                                          parseInt(parts[1]) -
                                                          1;
                                                        if (
                                                          raceMonthIndex ===
                                                          mIdx
                                                        )
                                                          monthWins++;
                                                      }
                                                    }
                                                  }
                                                }
                                              },
                                            );

                                            if (winsChartType === "acumulado") {
                                              accumulated += monthWins;
                                              dataByMonth[mIdx][teamKey] =
                                                accumulated;
                                            } else {
                                              dataByMonth[mIdx][teamKey] =
                                                monthWins;
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
                                        <div className="w-full overflow-x-auto h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="99%">
                                          <LineChart
                                            data={modalWinsEvolutionData}
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

                          {(() => {
                            // First, map races to months and dates
                            const raceMonths: Record<string, number> = {};
                            const raceDates: Record<string, string> = {};
                            files.carreras.data?.forEach((r) => {
                              const carreraName = getVal(r, "Carrera")?.trim();
                              const fechaFin = getVal(r, "Fecha");
                              if (carreraName && fechaFin) {
                                raceDates[carreraName] = fechaFin;
                                const parts = fechaFin.toString().split(/[-/]/);
                                if (parts.length >= 2) {
                                  const monthIndex = parseInt(parts[1]) - 1;
                                  raceMonths[carreraName] = monthIndex;
                                }
                              }
                            });

                            const raceData = uniqueRaces.map((race) => {
                              const winnerTeamName = raceWinners[race];
                              let winnerDisplayName = winnerTeamName || "";
                              let winnerPoints = 0;

                              if (winnerTeamName) {
                                const teamInfo = filteredLeaderboard?.find(
                                  (p) => p.nombreEquipo === winnerTeamName,
                                );
                                if (teamInfo) {
                                  winnerDisplayName = `${winnerTeamName} [#${teamInfo.orden}]`;
                                  winnerPoints = teamInfo.detalles
                                    .filter((d) => d.carrera === race)
                                    .reduce(
                                      (sum, d) => sum + d.puntosObtenidos,
                                      0,
                                    );
                                }
                              }

                              return {
                                race,
                                winnerTeamName,
                                winnerDisplayName,
                                winnerPoints,
                                month: raceMonths[race],
                                date: raceDates[race] || "",
                              };
                            });

                            const filteredRaces = raceData.filter((item) => {
                              const monthMatch =
                                historyMonthFilter === "all" ||
                                item.month === parseInt(historyMonthFilter);
                              const teamMatch =
                                historyTeamFilter === "all" ||
                                item.winnerTeamName === historyTeamFilter;
                              return monthMatch && teamMatch;
                            });

                            // Sort the filtered races
                            filteredRaces.sort((a, b) => {
                              let valA: any, valB: any;
                              switch (historySortColumn) {
                                case "fecha": {
                                  const parseDate = (d: string) => {
                                    if (!d) return 0;
                                    const parts = d.toString().split(/[-/]/);
                                    if (parts.length === 3) {
                                      // Assume dd/mm/yyyy or yyyy-mm-dd
                                      if (parts[0].length === 4) {
                                        return new Date(
                                          parseInt(parts[0]),
                                          parseInt(parts[1]) - 1,
                                          parseInt(parts[2]),
                                        ).getTime();
                                      } else {
                                        return new Date(
                                          parseInt(parts[2]),
                                          parseInt(parts[1]) - 1,
                                          parseInt(parts[0]),
                                        ).getTime();
                                      }
                                    }
                                    return 0;
                                  };
                                  valA = parseDate(a.date);
                                  valB = parseDate(b.date);
                                  break;
                                }
                                case "equipo":
                                  valA = a.winnerTeamName || "";
                                  valB = b.winnerTeamName || "";
                                  break;
                                case "puntos":
                                  valA = a.winnerPoints;
                                  valB = b.winnerPoints;
                                  break;
                                case "carrera":
                                default:
                                  valA = a.race;
                                  valB = b.race;
                                  break;
                              }

                              if (
                                typeof valA === "string" &&
                                typeof valB === "string"
                              ) {
                                return historySortDirection === "asc"
                                  ? valA.localeCompare(valB)
                                  : valB.localeCompare(valA);
                              }

                              if (valA < valB)
                                return historySortDirection === "asc" ? -1 : 1;
                              if (valA > valB)
                                return historySortDirection === "asc" ? 1 : -1;
                              return 0;
                            });

                            const numBlocks = Math.ceil(
                              filteredRaces.length / 50,
                            );

                            return (
                              <>
                                <div
                                  ref={winsHistoryRef}
                                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm group relative mt-8"
                                >
                                  <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                                    {/* Fila 1: Título */}
                                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
                                      <History className="w-5 h-5 text-purple-600" />
                                      Historial de Ganadores por Carrera
                                    </h3>
                                    {/* Fila 2: Subtítulo */}
                                    <p className="text-sm text-neutral-500 whitespace-nowrap">
                                      Relación cronológica de las victorias
                                      obtenidas por los equipos en cada carrera.
                                    </p>
                                    {/* Fila 3: Botones y Filtros */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
                                      <div className="copy-button-ignore flex items-center gap-2">
                                        <button
                                          onClick={() =>
                                            setIsWinsHistoryExpanded(true)
                                          }
                                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                          title="Ampliar tabla"
                                        >
                                          <Maximize2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleCopyWinsHistory("full")
                                          }
                                          disabled={!!isWinsHistoryCopying}
                                          className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                            isWinsHistoryCopying === "full"
                                              ? "bg-green-50 text-green-700 border border-green-200"
                                              : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100",
                                          )}
                                          title={
                                            isWinsHistoryCopying === "full"
                                              ? "Copiado"
                                              : "Copiar tabla como imagen"
                                          }
                                        >
                                          {isWinsHistoryCopying === "full" ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                          ) : (
                                            <Copy className="w-4 h-4" />
                                          )}
                                        </button>
                                        {numBlocks > 1 && (
                                          <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                                            {Array.from({
                                              length: numBlocks,
                                            }).map((_, i) => {
                                              const s = `p${i + 1}`;
                                              const start = i * 50 + 1;
                                              const end = Math.min(
                                                (i + 1) * 50,
                                                filteredRaces.length,
                                              );
                                              const label = `${start}-${end}`;
                                              const isCopyingThis =
                                                isWinsHistoryCopying === s;
                                              return (
                                                <button
                                                  key={s}
                                                  onClick={() =>
                                                    handleCopyWinsHistory(
                                                      s as any,
                                                    )
                                                  }
                                                  disabled={
                                                    !!isWinsHistoryCopying
                                                  }
                                                  className={cn(
                                                    "px-2 py-1 text-[10px] font-bold rounded-md border shadow-sm flex items-center gap-1 transition-all",
                                                    isCopyingThis
                                                      ? "bg-green-50 text-green-700 border-green-200"
                                                      : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                                    isWinsHistoryCopying &&
                                                      !isCopyingThis &&
                                                      "opacity-50 cursor-not-allowed",
                                                  )}
                                                  title={`Copiar rango ${label}`}
                                                >
                                                  {isCopyingThis ? (
                                                    <CheckCircle2 className="w-3 h-3" />
                                                  ) : (
                                                    <Copy className="w-3 h-3" />
                                                  )}
                                                  {label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                        <button
                                          onClick={handleCopyWinsHistoryText}
                                          disabled={isWinsHistoryTextCopying}
                                          className={cn(
                                            "flex items-center justify-center px-3 h-8 rounded-lg transition-all shadow-sm text-sm font-medium",
                                            isWinsHistoryTextCopying
                                              ? "bg-green-50 text-green-600 border border-green-200"
                                              : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100",
                                          )}
                                          title="Copiar como texto"
                                        >
                                          {isWinsHistoryTextCopying ? (
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                          ) : (
                                            <ClipboardList className="w-4 h-4 mr-1.5" />
                                          )}
                                          Texto
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDownloadWinsHistory("full")
                                          }
                                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                          title="Descargar tabla como imagen"
                                        >
                                          <UploadCloud className="w-4 h-4 rotate-180" />
                                        </button>
                                      </div>
                                      <div className="flex gap-2">
                                        <select
                                          value={historyTeamFilter}
                                          onChange={(e) =>
                                            setHistoryTeamFilter(e.target.value)
                                          }
                                          className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                          <option value="all">
                                            Todos los equipos
                                          </option>
                                          {[...filteredLeaderboard]
                                            .sort((a, b) =>
                                              a.nombreEquipo.localeCompare(
                                                b.nombreEquipo,
                                              ),
                                            )
                                            .map((t) => (
                                              <option
                                                key={t.nombreEquipo}
                                                value={t.nombreEquipo}
                                              >
                                                {t.nombreEquipo}
                                              </option>
                                            ))}
                                        </select>
                                        <select
                                          value={historyMonthFilter}
                                          onChange={(e) =>
                                            setHistoryMonthFilter(
                                              e.target.value,
                                            )
                                          }
                                          className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                  </div>
                                  <div className="overflow-x-auto overflow-y-auto max-h-[75vh]">
                                    <div className="table-responsive-wrapper overflow-auto w-full h-full"><table className="w-full min-w-[600px] text-sm text-left">
                                      <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10">
                                        <tr>
                                          <th
                                            className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors"
                                            onClick={() => {
                                              if (
                                                historySortColumn === "fecha"
                                              ) {
                                                setHistorySortDirection((d) =>
                                                  d === "asc" ? "desc" : "asc",
                                                );
                                              } else {
                                                setHistorySortColumn("fecha");
                                                setHistorySortDirection("asc");
                                              }
                                            }}
                                          >
                                            <div className="flex items-center gap-1">
                                              Fecha{" "}
                                              {historySortColumn === "fecha" &&
                                                (historySortDirection ===
                                                "asc" ? (
                                                  <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                  <ChevronDown className="w-4 h-4" />
                                                ))}
                                            </div>
                                          </th>
                                          <th
                                            className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors"
                                            onClick={() => {
                                              if (
                                                historySortColumn === "carrera"
                                              ) {
                                                setHistorySortDirection((d) =>
                                                  d === "asc" ? "desc" : "asc",
                                                );
                                              } else {
                                                setHistorySortColumn("carrera");
                                                setHistorySortDirection("asc");
                                              }
                                            }}
                                          >
                                            <div className="flex items-center gap-1">
                                              Carrera{" "}
                                              {historySortColumn ===
                                                "carrera" &&
                                                (historySortDirection ===
                                                "asc" ? (
                                                  <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                  <ChevronDown className="w-4 h-4" />
                                                ))}
                                            </div>
                                          </th>
                                          <th
                                            className="px-6 py-3 font-semibold text-right cursor-pointer hover:bg-neutral-100 select-none transition-colors"
                                            onClick={() => {
                                              if (
                                                historySortColumn === "equipo"
                                              ) {
                                                setHistorySortDirection((d) =>
                                                  d === "asc" ? "desc" : "asc",
                                                );
                                              } else {
                                                setHistorySortColumn("equipo");
                                                setHistorySortDirection("asc");
                                              }
                                            }}
                                          >
                                            <div className="flex items-center justify-end gap-1">
                                              Equipo Ganador{" "}
                                              {historySortColumn === "equipo" &&
                                                (historySortDirection ===
                                                "asc" ? (
                                                  <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                  <ChevronDown className="w-4 h-4" />
                                                ))}
                                            </div>
                                          </th>
                                          <th
                                            className="px-6 py-3 font-semibold text-right cursor-pointer hover:bg-neutral-100 select-none transition-colors"
                                            onClick={() => {
                                              if (
                                                historySortColumn === "puntos"
                                              ) {
                                                setHistorySortDirection((d) =>
                                                  d === "asc" ? "desc" : "asc",
                                                );
                                              } else {
                                                setHistorySortColumn("puntos");
                                                setHistorySortDirection("desc");
                                              }
                                            }}
                                          >
                                            <div className="flex items-center justify-end gap-1">
                                              Puntos{" "}
                                              {historySortColumn === "puntos" &&
                                                (historySortDirection ===
                                                "asc" ? (
                                                  <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                  <ChevronDown className="w-4 h-4" />
                                                ))}
                                            </div>
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-neutral-100">
                                        {(() => {
                                          if (filteredRaces.length === 0) {
                                            return (
                                              <tr>
                                                <td
                                                  colSpan={4}
                                                  className="px-6 py-8 text-center text-neutral-500"
                                                >
                                                  No hay carreras que coincidan
                                                  con los filtros.
                                                </td>
                                              </tr>
                                            );
                                          }

                                          return filteredRaces.map(
                                            (item, idx) => {
                                              const {
                                                race,
                                                winnerTeamName,
                                                winnerDisplayName,
                                                winnerPoints,
                                                date,
                                              } = item;

                                              let isHiddenVisual = false;
                                              if (isWinsHistoryCopying) {
                                                if (
                                                  isWinsHistoryCopying ===
                                                  "full"
                                                )
                                                  isHiddenVisual = false;
                                                else {
                                                  const pageNum = parseInt(
                                                    isWinsHistoryCopying.substring(
                                                      1,
                                                    ),
                                                  );
                                                  const start =
                                                    (pageNum - 1) * 50;
                                                  const end = start + 50;
                                                  isHiddenVisual = !(
                                                    idx >= start && idx < end
                                                  );
                                                }
                                              }

                                              if (isHiddenVisual) return null;

                                              return (
                                                <tr
                                                  key={race}
                                                  className="hover:bg-neutral-50 transition-colors wins-history-row"
                                                >
                                                  <td className="px-6 py-4 text-neutral-500 font-mono text-xs">
                                                    {date}
                                                  </td>
                                                  <td className="px-6 py-4 font-medium text-neutral-900">
                                                    {race}
                                                  </td>
                                                  <td className="px-6 py-4 text-right">
                                                    {winnerTeamName ? (
                                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 font-bold text-xs border border-yellow-100">
                                                        <Trophy className="w-3 h-3" />
                                                        {winnerDisplayName}
                                                      </span>
                                                    ) : (
                                                      <span className="text-neutral-400 italic">
                                                        Sin resultados
                                                      </span>
                                                    )}
                                                  </td>
                                                  <td className="px-6 py-4 text-right font-semibold text-neutral-700">
                                                    {winnerTeamName
                                                      ? winnerPoints
                                                      : "-"}
                                                  </td>
                                                </tr>
                                              );
                                            },
                                          );
                                        })()}
                                      </tbody>
                                    </table></div>
                                  </div>
                                </div>
                              </>
                            );
                          })()}

                          {/* Expanded Wins History Modal */}
                          {isWinsHistoryExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                                    <History className="w-6 h-6 text-purple-600" />
                                    Historial de Ganadores por Carrera
                                  </h3>
                                  <button
                                    onClick={() =>
                                      setIsWinsHistoryExpanded(false)
                                    }
                                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8">
                                  <div className="table-responsive-wrapper overflow-auto w-full h-full"><table className="w-full min-w-[600px] text-base text-left">
                                    <thead className="text-sm text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10">
                                      <tr>
                                        <th className="px-6 py-4 font-bold">
                                          Fecha
                                        </th>
                                        <th className="px-6 py-4 font-bold">
                                          Carrera
                                        </th>
                                        <th className="px-6 py-4 font-bold text-right">
                                          Equipo Ganador
                                        </th>
                                        <th className="px-6 py-4 font-bold text-right">
                                          Puntos
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                      {(() => {
                                        const historyData = [];
                                        Object.entries(raceWinners).forEach(
                                          ([raceName, winnerTeam]) => {
                                            const raceData =
                                              files.carreras.data?.find(
                                                (r) =>
                                                  getVal(
                                                    r,
                                                    "Carrera",
                                                  )?.trim() === raceName,
                                              );
                                            if (raceData) {
                                              const fechaFin = getVal(
                                                raceData,
                                                "Fecha",
                                              );
                                              const teamInfo =
                                                filteredLeaderboard?.find(
                                                  (p) =>
                                                    p.nombreEquipo ===
                                                    winnerTeam,
                                                );
                                              const winnerDisplayName = teamInfo
                                                ? `${winnerTeam} [#${teamInfo.orden}]`
                                                : winnerTeam;
                                              const winnerPoints = teamInfo
                                                ? teamInfo.detalles
                                                    .filter(
                                                      (d) =>
                                                        d.carrera === raceName,
                                                    )
                                                    .reduce(
                                                      (sum, d) =>
                                                        sum + d.puntosObtenidos,
                                                      0,
                                                    )
                                                : 0;

                                              historyData.push({
                                                fecha: fechaFin || "",
                                                carrera: raceName,
                                                equipo: winnerDisplayName,
                                                puntos: winnerPoints,
                                              });
                                            }
                                          },
                                        );

                                        return historyData
                                          .sort((a, b) => {
                                            const parseDate = (d: string) => {
                                              if (!d) return 0;
                                              const parts = d.toString().split(/[-/]/);
                                              if (parts.length === 3) {
                                                if (parts[0].length === 4)
                                                  return new Date(
                                                    parseInt(parts[0]),
                                                    parseInt(parts[1]) - 1,
                                                    parseInt(parts[2]),
                                                  ).getTime();
                                                return new Date(
                                                  parseInt(parts[2]),
                                                  parseInt(parts[1]) - 1,
                                                  parseInt(parts[0]),
                                                ).getTime();
                                              }
                                              return 0;
                                            };
                                            return (
                                              parseDate(b.fecha) -
                                              parseDate(a.fecha)
                                            );
                                          })
                                          .map((row, idx) => (
                                            <tr
                                              key={idx}
                                              className="hover:bg-neutral-50 transition-colors"
                                            >
                                              <td className="px-6 py-4 text-neutral-600">
                                                {row.fecha}
                                              </td>
                                              <td className="px-6 py-4 font-bold text-neutral-900">
                                                {row.carrera}
                                              </td>
                                              <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                                                  <Trophy className="w-3 h-3" />
                                                  {row.equipo}
                                                </span>
                                              </td>
                                              <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">
                                                {row.puntos}
                                              </td>
                                            </tr>
                                          ));
                                      })()}
                                    </tbody>
                                  </table></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      

                      
    </>
  );
}
