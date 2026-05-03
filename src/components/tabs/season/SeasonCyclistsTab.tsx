import React, { useContext } from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";


export function SeasonCyclistsTab() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const { cn, CyclistDetailView, files, playerTeamMap, playerByCyclist, uniqueRaces, leaderboard, raceWinners, globalTeamPartialWinsCount, globalTeamWinsCount, cyclistMetadata, cyclistRoundMap, playerOrderMap, seasonSubTab, setSeasonSubTab, isChartExpanded, setIsChartExpanded, evolutionMode, setEvolutionMode, isEvolutionChartExpanded, setIsEvolutionChartExpanded, teamsSortColumn, setTeamsSortColumn, teamsSortDirection, setTeamsSortDirection, isTopTeamsTableExpanded, setIsTopTeamsTableExpanded, isTopTeamsTableCopying, setIsTopTeamsTableCopying, isWinsRankingExpanded, setIsWinsRankingExpanded, winsChartType, setWinsChartType, historyTeamFilter, setHistoryTeamFilter, historySortColumn, setHistorySortColumn, historySortDirection, setHistorySortDirection, cyclistsSubTab, setCyclistsSubTab, cyclistsMonthFilter, setCyclistsMonthFilter, isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen, isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen, isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen, isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded, topCyclistsLimit, setTopCyclistsLimit, isUnscoredExpanded, setIsUnscoredExpanded, isUndebutedExpanded, setIsUndebutedExpanded, noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter, isNoDraftCyclistsExpanded, setIsNoDraftCyclistsExpanded, noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit, selectedCyclistDetail, setSelectedCyclistDetail, isCopying, setIsCopying, winsRankingRef, winsHistoryRef, unscoredTableRef, undebutedTableRef, noDraftCyclistsTableRef, LINE_COLORS, topTeamsSortColumn, setTopTeamsSortColumn, topTeamsSortDirection, setTopTeamsSortDirection, winsHistorySortColumn, setWinsHistorySortColumn, winsHistorySortDirection, setWinsHistorySortDirection, cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection, unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn, unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection, undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn, undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection, noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn, noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection, teamsMonthFilter, setTeamsMonthFilter, historyMonthFilter, setHistoryMonthFilter, cyclistsTeamFilter, setCyclistsTeamFilter, isTeamFilterOpen, setIsTeamFilterOpen, cyclistsCategoryFilter, setCyclistsCategoryFilter, isCategoryFilterOpen, setIsCategoryFilterOpen, cyclistsRoundFilter, setCyclistsRoundFilter, isRoundFilterOpen, setIsRoundFilterOpen, cyclistsNameSearch, setCyclistsNameSearch, unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter, unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter, isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen, undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter, undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter, isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen, noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter, isChartCopying, setIsChartCopying, isEvolutionChartCopying, setIsEvolutionChartCopying, isTopTeamsCopying, setIsTopTeamsCopying, isWinsRankingCopying, setIsWinsRankingCopying, isWinsEvolutionCopying, setIsWinsEvolutionCopying, isWinsHistoryCopying, setIsWinsHistoryCopying, isWinsHistoryTextCopying, setIsWinsHistoryTextCopying, isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying, isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying, isUnscoredCopying, setIsUnscoredCopying, isUnscoredTextCopying, setIsUnscoredTextCopying, isUndebutedCopying, setIsUndebutedCopying, isUndebutedTextCopying, setIsUndebutedTextCopying, isNoDraftCyclistsCopying, setIsNoDraftCyclistsCopying, isNoDraftCyclistsTextCopying, setIsNoDraftCyclistsTextCopying, chartRef, evolutionChartRef, topTeamsTableRef, winsRankingTableRef, winsEvolutionRef, winsHistoryTableRef, topCyclistsDraftRef, unscoredRef, undebutedRef, noDraftCyclistsRef, selectedEvolutionTeams, setSelectedEvolutionTeams, isExpanded, setIsExpanded, isEvolutionExpanded, setIsEvolutionExpanded, isWinsExpanded, setIsWinsExpanded, isWinsEvolutionExpanded, setIsWinsEvolutionExpanded, isWinsHistoryExpanded, setIsWinsHistoryExpanded, leaderboardTeamsSearch, setLeaderboardTeamsSearch, winsSearch, setWinsSearch, winsHistorySearch, setWinsHistorySearch, handleCopyChart, handleDownloadChart, handleCopyEvolutionChart, handleDownloadEvolutionChart, handleCopyTopTeamsTable, handleDownloadTopTeamsTable, handleCopyWinsRanking, handleDownloadWinsRanking, handleCopyWinsEvolution, handleDownloadWinsEvolution, handleCopyWinsHistory, handleCopyWinsHistoryText, handleDownloadWinsHistory, handleCopyTopCyclistsDraft, handleCopyTopCyclistsDraftText, handleDownloadTopCyclistsDraft, handleCopyUnscored, handleCopyUnscoredText, handleDownloadUnscored, handleCopyUndebuted, handleCopyUndebutedText, handleDownloadUndebuted, handleCopyNoDraftCyclists, handleCopyNoDraftCyclistsText, handleDownloadNoDraftCyclists, formatNumberSpanish, getVal, filteredLeaderboard, teamWinsCount } = context;

  return (
    <>
      
                        <div className="space-y-8">
                          {/* Sub-tabs for Ciclistas */}
                          <div className="flex justify-center">
                            <div className="flex bg-neutral-100 p-1.5 rounded-xl shadow-inner">
                              {[
                                { id: "draft", label: "Draft", icon: Users },
                                {
                                  id: "no-draft",
                                  label: "No draft",
                                  icon: AlertCircle,
                                },
                                { id: "detalle", label: "Detalle ciclista", icon: Users },
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  onClick={() =>
                                    setCyclistsSubTab(tab.id as any)
                                  }
                                  className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200",
                                    cyclistsSubTab === tab.id
                                      ? "bg-white text-blue-600 shadow-md transform scale-105"
                                      : "text-neutral-500 hover:text-neutral-700 hover:bg-white/50",
                                  )}
                                >
                                  <tab.icon className="w-4 h-4" />
                                  {tab.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {cyclistsSubTab === "draft" ? (
                            <>
                              <div
                                ref={topCyclistsDraftRef}
                                className={cn(
                                  "bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm relative",
                                  isTopCyclistsDraftExpanded &&
                                    "fixed inset-4 z-50 overflow-y-auto max-h-none shadow-2xl p-0",
                                )}
                              >
                                {isTopCyclistsDraftExpanded && (
                                  <button
                                    onClick={() =>
                                      setIsTopCyclistsDraftExpanded(false)
                                    }
                                    className="fixed top-8 right-8 p-3 bg-neutral-800 text-white rounded-full shadow-2xl z-[60] copy-button-ignore hover:bg-neutral-700 transition-all cursor-pointer"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                )}
                                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
                                    <User className="w-5 h-5 text-orange-600" />
                                    Top Ciclistas por Puntuación
                                  </h3>
                                  <p className="text-xs text-neutral-500 whitespace-nowrap">
                                    Ranking individual de todos los corredores
                                    con puntos.
                                  </p>

                                  <div className="flex flex-wrap items-center gap-3 mt-1">
                                    <div className="copy-button-ignore flex flex-wrap items-center gap-2 pr-3 border-r border-neutral-200">
                                      <button
                                        onClick={() =>
                                          setIsTopCyclistsDraftExpanded(true)
                                        }
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Ampliar tabla"
                                      >
                                        <Maximize2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCopyTopCyclistsDraft("full")
                                        }
                                        disabled={!!isTopCyclistsDraftCopying}
                                        className={cn(
                                          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm border",
                                          isTopCyclistsDraftCopying === "full"
                                            ? "bg-green-50 text-green-600 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100",
                                        )}
                                        title="Copiar tabla completa como imagen"
                                      >
                                        {isTopCyclistsDraftCopying ===
                                        "full" ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                      {topCyclistsLimit > 50 && (
                                        <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                                          {Array.from({
                                            length: Math.ceil(
                                              (topCyclistsLimit === 9999
                                                ? 500
                                                : topCyclistsLimit) / 50,
                                            ),
                                          }).map((_, i) => {
                                            const s = `p${i + 1}`;
                                            const start = i * 50 + 1;
                                            const end = (i + 1) * 50;
                                            const label = `${start}-${end}`;
                                            const isCopyingThis =
                                              isTopCyclistsDraftCopying === s;
                                            return (
                                              <button
                                                key={s}
                                                onClick={() =>
                                                  handleCopyTopCyclistsDraft(
                                                    s as any,
                                                  )
                                                }
                                                disabled={
                                                  !!isTopCyclistsDraftCopying
                                                }
                                                className={cn(
                                                  "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                                  isCopyingThis
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-white",
                                                  isTopCyclistsDraftCopying &&
                                                    !isCopyingThis &&
                                                    "opacity-50 cursor-not-allowed",
                                                )}
                                              >
                                                {isCopyingThis ? (
                                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                                ) : (
                                                  <Copy className="w-3.5 h-3.5" />
                                                )}
                                                {label}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                      <button
                                        onClick={handleCopyTopCyclistsDraftText}
                                        disabled={isTopCyclistsDraftTextCopying}
                                        className={cn(
                                          "px-3 h-8 text-sm font-medium rounded-lg border shadow-sm flex items-center justify-center transition-all",
                                          isTopCyclistsDraftTextCopying
                                            ? "bg-green-50 text-green-600 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100",
                                        )}
                                        title="Copiar texto de la tabla"
                                      >
                                        {isTopCyclistsDraftTextCopying ? (
                                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        ) : (
                                          <ClipboardList className="w-4 h-4 mr-1.5" />
                                        )}
                                        Texto
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadTopCyclistsDraft("full")
                                        }
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Descargar tabla completa como imagen"
                                      >
                                        <UploadCloud className="w-4 h-4 rotate-180" />
                                      </button>
                                    </div>

                                    {/* Teams Multi-select Filter */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setIsCyclistsTeamFilterOpen(
                                            !isCyclistsTeamFilterOpen,
                                          )
                                        }
                                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
                                      >
                                        <span className="truncate">
                                          {cyclistsTeamFilter.length === 0
                                            ? "Todos los equipos"
                                            : `${cyclistsTeamFilter.length} equipos`}
                                        </span>
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 text-neutral-400 transition-transform",
                                            isCyclistsTeamFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </button>

                                      {isCyclistsTeamFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                              setIsCyclistsTeamFilterOpen(false)
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                Equipos
                                              </span>
                                              {cyclistsTeamFilter.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    setCyclistsTeamFilter([])
                                                  }
                                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                  Limpiar
                                                </button>
                                              )}
                                            </div>
                                            {Array.from(
                                              new Set(
                                                leaderboard
                                                  ?.filter(
                                                    (p) =>
                                                      p.jugador !== "No draft",
                                                  )
                                                  .map((p) => p.nombreEquipo) ||
                                                  [],
                                              ),
                                            )
                                              .filter(Boolean)
                                              .sort((a, b) =>
                                                (a as string).localeCompare(
                                                  b as string,
                                                ),
                                              )
                                              .map((team) => (
                                                <label
                                                  key={team}
                                                  className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                    checked={cyclistsTeamFilter.includes(
                                                      team,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setCyclistsTeamFilter([
                                                          ...cyclistsTeamFilter,
                                                          team,
                                                        ]);
                                                      } else {
                                                        setCyclistsTeamFilter(
                                                          cyclistsTeamFilter.filter(
                                                            (t) => t !== team,
                                                          ),
                                                        );
                                                      }
                                                    }}
                                                  />
                                                  <span className="ml-2 text-sm text-neutral-700 truncate">
                                                    {team}
                                                  </span>
                                                </label>
                                              ))}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {/* Category Multi-select Filter */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setIsCyclistsCategoryFilterOpen(
                                            !isCyclistsCategoryFilterOpen,
                                          )
                                        }
                                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[150px]"
                                      >
                                        <span className="truncate">
                                          {cyclistsCategoryFilter.length === 0
                                            ? "Todas las categorías"
                                            : `${cyclistsCategoryFilter.length} categorías`}
                                        </span>
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 text-neutral-400 transition-transform",
                                            isCyclistsCategoryFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </button>

                                      {isCyclistsCategoryFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                              setIsCyclistsCategoryFilterOpen(
                                                false,
                                              )
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                Categorías
                                              </span>
                                              {cyclistsCategoryFilter.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    setCyclistsCategoryFilter(
                                                      [],
                                                    )
                                                  }
                                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                  Limpiar
                                                </button>
                                              )}
                                            </div>
                                            {Array.from(
                                              new Set(
                                                files.carreras.data
                                                  ?.map((r) =>
                                                    getVal(r, "Categoría"),
                                                  )
                                                  .map((c) => c?.trim())
                                                  .filter(Boolean) as string[],
                                              ),
                                            )
                                              .sort((a, b) =>
                                                a.localeCompare(b),
                                              )
                                              .map((cat) => (
                                                <label
                                                  key={cat}
                                                  className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                    checked={cyclistsCategoryFilter.includes(
                                                      cat,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setCyclistsCategoryFilter(
                                                          [
                                                            ...cyclistsCategoryFilter,
                                                            cat,
                                                          ],
                                                        );
                                                      } else {
                                                        setCyclistsCategoryFilter(
                                                          cyclistsCategoryFilter.filter(
                                                            (c) => c !== cat,
                                                          ),
                                                        );
                                                      }
                                                    }}
                                                  />
                                                  <span className="ml-2 text-sm text-neutral-700 truncate">
                                                    {cat}
                                                  </span>
                                                </label>
                                              ))}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {/* Round Multi-select Filter */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setIsCyclistsRoundFilterOpen(
                                            !isCyclistsRoundFilterOpen,
                                          )
                                        }
                                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
                                      >
                                        <span className="truncate">
                                          {cyclistsRoundFilter.length === 0
                                            ? "Todas las rondas"
                                            : `${cyclistsRoundFilter.length} rondas`}
                                        </span>
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 text-neutral-400 transition-transform",
                                            isCyclistsRoundFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </button>

                                      {isCyclistsRoundFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                              setIsCyclistsRoundFilterOpen(
                                                false,
                                              )
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                Rondas
                                              </span>
                                              {cyclistsRoundFilter.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    setCyclistsRoundFilter([])
                                                  }
                                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                  Limpiar
                                                </button>
                                              )}
                                            </div>
                                            {Array.from(
                                              new Set(
                                                Object.values(
                                                  cyclistRoundMap,
                                                ) as string[],
                                              ),
                                            )
                                              .filter(Boolean)
                                              .sort((a, b) =>
                                                a.localeCompare(b),
                                              )
                                              .map((ronda) => (
                                                <label
                                                  key={ronda}
                                                  className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                    checked={cyclistsRoundFilter.includes(
                                                      ronda,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setCyclistsRoundFilter([
                                                          ...cyclistsRoundFilter,
                                                          ronda,
                                                        ]);
                                                      } else {
                                                        setCyclistsRoundFilter(
                                                          cyclistsRoundFilter.filter(
                                                            (r) => r !== ronda,
                                                          ),
                                                        );
                                                      }
                                                    }}
                                                  />
                                                  <span className="ml-2 text-sm text-neutral-700">
                                                    Ronda {ronda}
                                                  </span>
                                                </label>
                                              ))}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    <select
                                      value={cyclistsMonthFilter}
                                      onChange={(e) =>
                                        setCyclistsMonthFilter(e.target.value)
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
                                    <div className="flex bg-neutral-100 p-1 rounded-lg">
                                      <button
                                        onClick={() => setTopCyclistsLimit(25)}
                                        className={cn(
                                          "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                          topCyclistsLimit === 25
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-700",
                                        )}
                                      >
                                        Top 25
                                      </button>
                                      <button
                                        onClick={() => setTopCyclistsLimit(50)}
                                        className={cn(
                                          "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                          topCyclistsLimit === 50
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-700",
                                        )}
                                      >
                                        Top 50
                                      </button>
                                      <button
                                        onClick={() => setTopCyclistsLimit(100)}
                                        className={cn(
                                          "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                          topCyclistsLimit === 100
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-700",
                                        )}
                                      >
                                        Top 100
                                      </button>
                                      <button
                                        onClick={() =>
                                          setTopCyclistsLimit(9999)
                                        }
                                        className={cn(
                                          "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                          topCyclistsLimit === 9999
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-700",
                                        )}
                                      >
                                        Todos
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="overflow-x-auto overflow-y-auto max-h-[750px] bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin">
                                  <div className="table-responsive-wrapper overflow-auto w-full h-full"><table className="w-auto min-w-[700px] text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-200 rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
                                      <tr className="divide-x divide-neutral-100">
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (cyclistsSortColumn === "pos") {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("pos");
                                              setCyclistsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Pos{" "}
                                            {cyclistsSortColumn === "pos" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              cyclistsSortColumn === "nombre"
                                            ) {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("nombre");
                                              setCyclistsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ciclista{" "}
                                            {cyclistsSortColumn === "nombre" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              cyclistsSortColumn === "equipo"
                                            ) {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("equipo");
                                              setCyclistsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Equipo{" "}
                                            {cyclistsSortColumn === "equipo" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (cyclistsSortColumn === "pais") {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("pais");
                                              setCyclistsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            País{" "}
                                            {cyclistsSortColumn === "pais" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              cyclistsSortColumn === "victorias"
                                            ) {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn(
                                                "victorias",
                                              );
                                              setCyclistsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Victorias{" "}
                                            {cyclistsSortColumn ===
                                              "victorias" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              cyclistsSortColumn === "carreras"
                                            ) {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("carreras");
                                              setCyclistsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Carreras{" "}
                                            {cyclistsSortColumn ===
                                              "carreras" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          title="Días de competición"
                                          onClick={() => {
                                            if (cyclistsSortColumn === "dias") {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("dias");
                                              setCyclistsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Días{" "}
                                            {cyclistsSortColumn === "dias" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          title="Puntos por carreras"
                                          onClick={() => {
                                            if (cyclistsSortColumn === "ppc") {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("ppc");
                                              setCyclistsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            P/C{" "}
                                            {cyclistsSortColumn === "ppc" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          title="Puntos por día de competición"
                                          onClick={() => {
                                            if (cyclistsSortColumn === "ppd") {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("ppd");
                                              setCyclistsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            P/D{" "}
                                            {cyclistsSortColumn === "ppd" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              cyclistsSortColumn === "puntos"
                                            ) {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("puntos");
                                              setCyclistsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-end gap-1">
                                            Puntos{" "}
                                            {cyclistsSortColumn === "puntos" &&
                                              (cyclistsSortDirection ===
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
                                      {(() => {
                                        const cyclistStats: Record<
                                          string,
                                          {
                                            puntos: number;
                                            jugador: string;
                                            nombreEquipo: string;
                                            orden: string;
                                            ronda: string;
                                            pais: string;
                                            victorias: number;
                                            carreras: Set<string>;
                                            dias: number;
                                          }
                                        > = {};

                                        // Initialize all drafted players
                                        Object.entries(playerByCyclist).forEach(
                                          ([ciclista, jugador]) => {
                                            if (jugador !== "No draft") {
                                              cyclistStats[ciclista] = {
                                                puntos: 0,
                                                jugador: jugador as string,
                                                nombreEquipo:
                                                  playerTeamMap[
                                                    jugador as string
                                                  ] || "",
                                                orden:
                                                  playerOrderMap[
                                                    jugador as string
                                                  ] || "",
                                                ronda:
                                                  cyclistRoundMap[ciclista] ||
                                                  "",
                                                pais:
                                                  cyclistMetadata[ciclista]
                                                    ?.pais || "",
                                                victorias: 0,
                                                carreras: new Set<string>(),
                                                dias: 0,
                                              };
                                            }
                                          },
                                        );

                                        // First, map races to months and categories
                                        const raceMonths: Record<
                                          string,
                                          number
                                        > = {};
                                        const raceCats: Record<string, string> =
                                          {};
                                        files.carreras.data?.forEach((r) => {
                                          const carreraName = getVal(
                                            r,
                                            "Carrera",
                                          )?.trim();
                                          const fechaFin = getVal(r, "Fecha");
                                          const cat = getVal(
                                            r,
                                            "Categoría",
                                          )?.trim();
                                          if (carreraName) {
                                            if (cat)
                                              raceCats[carreraName] = cat;
                                            if (fechaFin) {
                                              const parts =
                                                fechaFin.split(/[-/]/);
                                              if (parts.length >= 2) {
                                                const monthIndex =
                                                  parseInt(parts[1]) - 1;
                                                raceMonths[carreraName] =
                                                  monthIndex;
                                              }
                                            }
                                          }
                                        });

                                        leaderboard?.forEach((player) => {
                                          player?.detalles?.forEach((d) => {
                                            // Apply month filter
                                            if (
                                              cyclistsMonthFilter !== "all" &&
                                              raceMonths[d.carrera] !==
                                                parseInt(cyclistsMonthFilter)
                                            ) {
                                              return;
                                            }
                                            // Apply category filter
                                            if (
                                              cyclistsCategoryFilter.length > 0
                                            ) {
                                              const cat = raceCats[d.carrera];
                                              if (
                                                !cat ||
                                                !cyclistsCategoryFilter.includes(
                                                  cat,
                                                )
                                              )
                                                return;
                                            }

                                            if (!cyclistStats[d.ciclista]) {
                                              cyclistStats[d.ciclista] = {
                                                puntos: 0,
                                                jugador: player.jugador,
                                                nombreEquipo:
                                                  player.nombreEquipo,
                                                orden: player.orden,
                                                ronda: d.ronda,
                                                pais:
                                                  cyclistMetadata[d.ciclista]
                                                    ?.pais || "",
                                                victorias: 0,
                                                carreras: new Set(),
                                                dias: 0,
                                              };
                                            }

                                            const stats =
                                              cyclistStats[d.ciclista];
                                            stats.puntos += d.puntosObtenidos;
                                            stats.carreras.add(d.carrera);

                                            // Check if this result is a win (1st place)
                                            const isPos01 =
                                              d.posicion === "01" ||
                                              d.posicion === "1";
                                            const isValidType = [
                                              "Etapa",
                                              "Etapa (Crono equipos)",
                                              "Clasificación final",
                                              "Clasificación final (Crono equipos)",
                                              "Clásica",
                                            ].includes(d.tipoResultado);

                                            if (isPos01 && isValidType) {
                                              stats.victorias += 1;
                                            }

                                            // Get race days from carreras data
                                            const raceData =
                                              files.carreras.data?.find(
                                                (r) =>
                                                  getVal(
                                                    r,
                                                    "Carrera",
                                                  )?.trim() === d.carrera,
                                              );
                                            if (raceData) {
                                              const diasStr = getVal(
                                                raceData,
                                                "Días",
                                              );
                                              if (diasStr) {
                                                stats.dias +=
                                                  parseInt(diasStr) || 1;
                                              } else {
                                                stats.dias += 1; // Default to 1 day if not specified
                                              }
                                            } else {
                                              stats.dias += 1;
                                            }
                                          });
                                        });

                                        const allStats = Object.entries(
                                          cyclistStats,
                                        )
                                          .filter(([name, data]) => {
                                            if (
                                              data.nombreEquipo === "No draft"
                                            )
                                              return false;
                                            if (
                                              cyclistsTeamFilter.length > 0 &&
                                              !cyclistsTeamFilter.includes(
                                                data.nombreEquipo,
                                              )
                                            )
                                              return false;
                                            if (
                                              cyclistsRoundFilter.length > 0 &&
                                              !cyclistsRoundFilter.includes(
                                                data.ronda,
                                              )
                                            )
                                              return false;
                                            return true;
                                          })
                                          .sort(
                                            (a, b) => b[1].puntos - a[1].puntos,
                                          )
                                          .map(([name, data], index) => {
                                            const numCarreras =
                                              data.carreras.size;
                                            const ppc =
                                              numCarreras > 0
                                                ? parseFloat(
                                                    (
                                                      data.puntos / numCarreras
                                                    ).toFixed(1),
                                                  )
                                                : 0;
                                            const ppd =
                                              data.dias > 0
                                                ? parseFloat(
                                                    (
                                                      data.puntos / data.dias
                                                    ).toFixed(1),
                                                  )
                                                : 0;
                                            return {
                                              name,
                                              data,
                                              numCarreras,
                                              ppc,
                                              ppd,
                                              originalPos: index + 1,
                                            };
                                          });

                                        // Tomamos el top N primero para mantener siempre los corredores con más puntos
                                        const topScorers =
                                          topCyclistsLimit === 9999
                                            ? allStats
                                            : allStats.slice(
                                                0,
                                                topCyclistsLimit,
                                              );

                                        // Sort the array by column AFTER slicing
                                        topScorers.sort((a, b) => {
                                          let valA: any, valB: any;
                                          switch (cyclistsSortColumn) {
                                            case "pos":
                                              valA = a.originalPos;
                                              valB = b.originalPos;
                                              break;
                                            case "nombre":
                                              valA = a.name;
                                              valB = b.name;
                                              break;
                                            case "equipo":
                                              valA = a.data.nombreEquipo;
                                              valB = b.data.nombreEquipo;
                                              break;
                                            case "pais":
                                              valA = a.data.pais;
                                              valB = b.data.pais;
                                              break;
                                            case "victorias":
                                              valA = a.data.victorias;
                                              valB = b.data.victorias;
                                              break;
                                            case "carreras":
                                              valA = a.numCarreras;
                                              valB = b.numCarreras;
                                              break;
                                            case "dias":
                                              valA = a.data.dias;
                                              valB = b.data.dias;
                                              break;
                                            case "ppc":
                                              valA = a.ppc;
                                              valB = b.ppc;
                                              break;
                                            case "ppd":
                                              valA = a.ppd;
                                              valB = b.ppd;
                                              break;
                                            case "puntos":
                                            default:
                                              valA = a.data.puntos;
                                              valB = b.data.puntos;
                                              break;
                                          }

                                          if (
                                            typeof valA === "string" &&
                                            typeof valB === "string"
                                          ) {
                                            return cyclistsSortDirection ===
                                              "asc"
                                              ? valA.localeCompare(valB)
                                              : valB.localeCompare(valA);
                                          }

                                          if (valA < valB)
                                            return cyclistsSortDirection ===
                                              "asc"
                                              ? -1
                                              : 1;
                                          if (valA > valB)
                                            return cyclistsSortDirection ===
                                              "asc"
                                              ? 1
                                              : -1;
                                          return 0;
                                        });

                                        const sortedStats = topScorers;

                                        let maxVictorias = 0;
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

                                        if (sortedStats.length > 0) {
                                          maxPuntos =
                                            sortedStats[0].data.puntos;
                                          minPuntos =
                                            sortedStats[sortedStats.length - 1]
                                              .data.puntos;

                                          sortedStats.forEach((s) => {
                                            if (s.data.victorias > maxVictorias)
                                              maxVictorias = s.data.victorias;
                                            if (s.numCarreras > maxCarreras)
                                              maxCarreras = s.numCarreras;
                                            if (s.numCarreras < minCarreras)
                                              minCarreras = s.numCarreras;
                                            if (s.data.dias > maxDias)
                                              maxDias = s.data.dias;
                                            if (s.data.dias < minDias)
                                              minDias = s.data.dias;
                                            if (s.ppc > maxPpc) maxPpc = s.ppc;
                                            if (s.ppc < minPpc) minPpc = s.ppc;
                                            if (s.ppd > maxPpd) maxPpd = s.ppd;
                                            if (s.ppd < minPpd) minPpd = s.ppd;
                                          });
                                        }

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
                                          if (
                                            val === min &&
                                            min < max &&
                                            !isZeroRed
                                          )
                                            return "text-yellow-600 font-bold";
                                          return "text-neutral-700";
                                        };

                                        const getPuntosColor = (
                                          puntos: number,
                                        ) => {
                                          if (maxPuntos === minPuntos)
                                            return "hsl(120, 70%, 40%)";
                                          const ratio =
                                            (puntos - minPuntos) /
                                            (maxPuntos - minPuntos);
                                          const hue = 45 + ratio * 75; // 45 (yellow/orange) to 120 (green)
                                          return `hsl(${hue}, 80%, 40%)`;
                                        };

                                        return sortedStats.map((s, idx) => {
                                          const {
                                            name,
                                            data,
                                            numCarreras,
                                            ppc,
                                            ppd,
                                            originalPos,
                                          } = s;

                                          let isHiddenVisual = false;
                                          if (isTopCyclistsDraftCopying) {
                                            if (
                                              isTopCyclistsDraftCopying ===
                                              "full"
                                            )
                                              isHiddenVisual = false;
                                            else {
                                              const pageNum = parseInt(
                                                isTopCyclistsDraftCopying.substring(
                                                  1,
                                                ),
                                              );
                                              const start = (pageNum - 1) * 50;
                                              const end = start + 50;
                                              isHiddenVisual = !(
                                                idx >= start && idx < end
                                              );
                                            }
                                          }

                                          if (
                                            isHiddenVisual &&
                                            isTopCyclistsDraftCopying
                                          )
                                            return null;

                                          return (
                                            <tr
                                              key={name}
                                              className={cn(
                                                "hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] divide-x divide-neutral-100",
                                                isHiddenVisual && "hidden",
                                              )}
                                            >
                                              <td className="px-3 py-1 text-center">
                                                <span
                                                  className={cn(
                                                    "w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[9px] font-bold",
                                                    originalPos === 1
                                                      ? "bg-yellow-100 text-yellow-700"
                                                      : originalPos === 2
                                                        ? "bg-neutral-200 text-neutral-600"
                                                        : originalPos === 3
                                                          ? "bg-orange-100 text-orange-700"
                                                          : "bg-neutral-100 text-neutral-500",
                                                  )}
                                                >
                                                  {originalPos}
                                                </span>
                                              </td>
                                              <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                                {name}{" "}
                                                <span className="text-neutral-400 font-normal text-[9px]">
                                                  &lt;{data.ronda || "-"}&gt;
                                                </span>
                                              </td>
                                              <td className="px-4 py-1 text-neutral-600 whitespace-nowrap">
                                                {data.nombreEquipo ===
                                                "No draft" ? (
                                                  <span className="text-neutral-400 italic text-[10px]">
                                                    No elegido
                                                  </span>
                                                ) : (
                                                  <span className="font-medium">
                                                    {data.nombreEquipo}{" "}
                                                    <span className="text-neutral-400 font-normal text-[9px]">
                                                      [#{data.orden}]
                                                    </span>
                                                  </span>
                                                )}
                                              </td>
                                              <td className="px-3 py-1 text-base text-center">
                                                {data.pais}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-3 py-1 text-center font-mono",
                                                  getColorClass(
                                                    data.victorias,
                                                    maxVictorias,
                                                    0,
                                                    true,
                                                  ),
                                                )}
                                              >
                                                <span className="font-mono tracking-tight">{formatNumberSpanish(
                                                  data.victorias,
                                                )}</span>
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-3 py-1 text-center font-mono",
                                                  getColorClass(
                                                    numCarreras,
                                                    maxCarreras,
                                                    minCarreras,
                                                  ),
                                                )}
                                              >
                                                <span className="font-mono tracking-tight">{formatNumberSpanish(
                                                  numCarreras,
                                                )}</span>
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-3 py-1 text-center font-mono",
                                                  getColorClass(
                                                    data.dias,
                                                    maxDias,
                                                    minDias,
                                                  ),
                                                )}
                                              >
                                                <span className="font-mono tracking-tight">{formatNumberSpanish(data.dias)}</span>
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-3 py-1 text-center font-mono",
                                                  getColorClass(
                                                    ppc,
                                                    maxPpc,
                                                    minPpc,
                                                  ),
                                                )}
                                              >
                                                {formatNumberSpanish(
                                                  ppc.toFixed(1),
                                                )}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-3 py-1 text-center font-mono",
                                                  getColorClass(
                                                    ppd,
                                                    maxPpd,
                                                    minPpd,
                                                  ),
                                                )}
                                              >
                                                {formatNumberSpanish(
                                                  ppd.toFixed(1),
                                                )}
                                              </td>
                                              <td
                                                className="px-4 py-1 text-right font-black font-mono text-sm"
                                                style={{
                                                  color: getPuntosColor(
                                                    data.puntos,
                                                  ),
                                                }}
                                              >
                                                <span className="font-mono tracking-tight">{formatNumberSpanish(
                                                  data.puntos,
                                                )}</span>
                                              </td>
                                            </tr>
                                          );
                                        });
                                      })()}
                                    </tbody>
                                  </table></div>
                                </div>
                              </div>

                              {/* Unscored Cyclists Table */}
                              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-8">
                                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
                                    <UserMinus className="w-5 h-5 text-neutral-400" />
                                    Ciclistas sin puntuar (
                                    {(() => {
                                      // Get all cyclists from elecciones
                                      const unscored = files.elecciones.data
                                        ?.map((row) => {
                                          const ciclista = getVal(
                                            row,
                                            "Ciclista",
                                          )?.trim();
                                          const jugador = getVal(
                                            row,
                                            "Nombre_TG",
                                          )?.trim();

                                          // Calculate points
                                          let points = 0;
                                          leaderboard?.forEach((p) => {
                                            if (p.jugador === jugador) {
                                              p?.detalles?.forEach((d) => {
                                                if (d.ciclista === ciclista) {
                                                  points += d.puntosObtenidos;
                                                }
                                              });
                                            }
                                          });

                                          if (points > 0) return null;
                                          return {
                                            ciclista,
                                            ronda:
                                              cyclistRoundMap[ciclista] || "",
                                            nombreEquipo: getVal(
                                              row,
                                              "Nombre_Equipo",
                                            )?.trim(),
                                          };
                                        })
                                        .filter(Boolean) as any[];

                                      // Filter by team and round
                                      return unscored.filter((c) => {
                                        const teamMatch =
                                          unscoredCyclistsTeamFilter ===
                                            "all" ||
                                          c.nombreEquipo ===
                                            unscoredCyclistsTeamFilter;
                                        const roundMatch =
                                          unscoredCyclistsRoundFilter.length ===
                                            0 ||
                                          unscoredCyclistsRoundFilter.includes(
                                            c.ronda,
                                          );
                                        return teamMatch && roundMatch;
                                      }).length;
                                    })()}
                                    )
                                  </h3>
                                  <p className="text-xs text-neutral-500 whitespace-nowrap">
                                    Corredores elegidos en el draft que aún no
                                    han sumado puntos.
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 mt-1">
                                    <div className="flex flex-wrap items-center gap-1.5 pr-3 border-r border-neutral-200 copy-button-ignore">
                                      <button
                                        onClick={() =>
                                          setIsUnscoredExpanded(
                                            !isUnscoredExpanded,
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
                                        title={
                                          isUnscoredExpanded
                                            ? "Contraer tabla"
                                            : "Expandir tabla"
                                        }
                                      >
                                        {isUnscoredExpanded ? (
                                          <Minimize2 className="w-4 h-4" />
                                        ) : (
                                          <Maximize2 className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCopyUnscored("full")
                                        }
                                        disabled={!!isUnscoredCopying}
                                        title="Copiar imagen"
                                        className={cn(
                                          "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                                          isUnscoredCopying === "full"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white",
                                          isUnscoredCopying &&
                                            isUnscoredCopying !== "full" &&
                                            "opacity-50 cursor-not-allowed",
                                        )}
                                      >
                                        {isUnscoredCopying === "full" ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>

                                      {(() => {
                                        const unscoredCount =
                                          (files.elecciones.data
                                            ?.map((row) => {
                                              const ciclista = getVal(
                                                row,
                                                "Ciclista",
                                              )?.trim();
                                              const jugador = getVal(
                                                row,
                                                "Nombre_TG",
                                              )?.trim();
                                              let points = 0;
                                              leaderboard?.forEach((p) => {
                                                if (p.jugador === jugador) {
                                                  p?.detalles?.forEach((d) => {
                                                    if (d.ciclista === ciclista)
                                                      points +=
                                                        d.puntosObtenidos;
                                                  });
                                                }
                                              });
                                              if (points > 0) return null;
                                              return {
                                                ciclista,
                                                ronda:
                                                  cyclistRoundMap[ciclista] ||
                                                  "",
                                                nombreEquipo: getVal(
                                                  row,
                                                  "Nombre_Equipo",
                                                )?.trim(),
                                              };
                                            })
                                            .filter(Boolean) as any[]) || [];
                                        const count = unscoredCount.filter(
                                          (c) => {
                                            const teamMatch =
                                              unscoredCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                unscoredCyclistsTeamFilter;
                                            const roundMatch =
                                              unscoredCyclistsRoundFilter.length ===
                                                0 ||
                                              unscoredCyclistsRoundFilter.includes(
                                                c.ronda,
                                              );
                                            return teamMatch && roundMatch;
                                          },
                                        ).length;

                                        if (count > 50) {
                                          return (
                                            <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                                              {Array.from({
                                                length: Math.ceil(count / 50),
                                              }).map((_, i) => {
                                                const s = "p" + (i + 1);
                                                const isCopyingThis =
                                                  isUnscoredCopying === s;
                                                return (
                                                  <button
                                                    key={s}
                                                    onClick={() =>
                                                      handleCopyUnscored(
                                                        s as any,
                                                      )
                                                    }
                                                    disabled={
                                                      !!isUnscoredCopying
                                                    }
                                                    className={cn(
                                                      "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                                      isCopyingThis
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-white",
                                                      isUnscoredCopying &&
                                                        !isCopyingThis &&
                                                        "opacity-50 cursor-not-allowed",
                                                    )}
                                                  >
                                                    {isCopyingThis ? (
                                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                                    ) : (
                                                      <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                    {i * 50 + 1}-{(i + 1) * 50}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}

                                      <button
                                        onClick={handleCopyUnscoredText}
                                        disabled={isUnscoredTextCopying}
                                        title="Copiar texto"
                                        className={cn(
                                          "px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
                                          isUnscoredTextCopying
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                                        )}
                                      >
                                        {isUnscoredTextCopying ? (
                                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        ) : (
                                          <FileText className="w-4 h-4 mr-1.5" />
                                        )}
                                        Texto
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadUnscored("full")
                                        }
                                        title="Descargar imagen"
                                        className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Round Multi-select Filter */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setIsUnscoredRoundFilterOpen(
                                            !isUnscoredRoundFilterOpen,
                                          )
                                        }
                                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
                                      >
                                        <span className="truncate">
                                          {unscoredCyclistsRoundFilter.length ===
                                          0
                                            ? "Todas las rondas"
                                            : `${unscoredCyclistsRoundFilter.length} rondas`}
                                        </span>
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 text-neutral-400 transition-transform",
                                            isUnscoredRoundFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </button>

                                      {isUnscoredRoundFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                              setIsUnscoredRoundFilterOpen(
                                                false,
                                              )
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 py-2 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                Rondas
                                              </span>
                                              {unscoredCyclistsRoundFilter.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    setUnscoredCyclistsRoundFilter(
                                                      [],
                                                    )
                                                  }
                                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                  Limpiar
                                                </button>
                                              )}
                                            </div>
                                            {Array.from(
                                              new Set(
                                                Object.values(
                                                  cyclistRoundMap,
                                                ) as string[],
                                              ),
                                            )
                                              .filter(Boolean)
                                              .sort((a, b) =>
                                                a.localeCompare(b),
                                              )
                                              .map((ronda) => (
                                                <label
                                                  key={ronda}
                                                  className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                    checked={unscoredCyclistsRoundFilter.includes(
                                                      ronda,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setUnscoredCyclistsRoundFilter(
                                                          [
                                                            ...unscoredCyclistsRoundFilter,
                                                            ronda,
                                                          ],
                                                        );
                                                      } else {
                                                        setUnscoredCyclistsRoundFilter(
                                                          unscoredCyclistsRoundFilter.filter(
                                                            (r) => r !== ronda,
                                                          ),
                                                        );
                                                      }
                                                    }}
                                                  />
                                                  <span className="ml-2 text-sm text-neutral-700">
                                                    Ronda {ronda}
                                                  </span>
                                                </label>
                                              ))}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    <select
                                      value={unscoredCyclistsTeamFilter}
                                      onChange={(e) =>
                                        setUnscoredCyclistsTeamFilter(
                                          e.target.value,
                                        )
                                      }
                                      className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                      <option value="all">
                                        Todos los equipos
                                      </option>
                                      {leaderboard?.map((p) => (
                                        <option
                                          key={p.nombreEquipo}
                                          value={p.nombreEquipo}
                                        >
                                          {p.nombreEquipo}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div
                                  ref={unscoredTableRef}
                                  className={cn(
                                    "overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 scrollbar-thin",
                                    isUnscoredExpanded
                                      ? "max-h-none"
                                      : "h-[800px]",
                                  )}
                                >
                                  <div className="table-responsive-wrapper overflow-auto w-full h-full"><table className="min-w-full text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-200 rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
                                      <tr className="divide-x divide-neutral-100">
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "jugador"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "jugador",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Jugador{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "jugador" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "ciclista"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "ciclista",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ciclista{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "ciclista" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "ronda"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "ronda",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1 text-center justify-center">
                                            Ronda{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "ronda" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          title="Carreras disputadas"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "carreras"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "carreras",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Carreras{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "carreras" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          title="Días de competición"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "dias"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "dias",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Días{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "dias" &&
                                              (unscoredCyclistsSortDirection ===
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
                                      {(() => {
                                        // Get all cyclists from elecciones
                                        const unscored = files.elecciones.data
                                          ?.map((row) => {
                                            const ciclista = getVal(
                                              row,
                                              "Ciclista",
                                            )?.trim();
                                            const jugador = getVal(
                                              row,
                                              "Nombre_TG",
                                            )?.trim();
                                            const nombreEquipo = getVal(
                                              row,
                                              "Nombre_Equipo",
                                            )?.trim();
                                            const orden =
                                              playerOrderMap[jugador] || "";
                                            const ronda =
                                              cyclistRoundMap[ciclista] || "";

                                            // Calculate points
                                            let points = 0;
                                            leaderboard?.forEach((p) => {
                                              if (p.jugador === jugador) {
                                                p?.detalles?.forEach((d) => {
                                                  if (d.ciclista === ciclista) {
                                                    points += d.puntosObtenidos;
                                                  }
                                                });
                                              }
                                            });

                                            if (points > 0) return null;

                                            // Get metadata
                                            const meta = cyclistMetadata[
                                              ciclista
                                            ] || {
                                              carrerasDisputadas: 0,
                                              diasCompeticion: 0,
                                            };

                                            return {
                                              ciclista,
                                              jugador,
                                              nombreEquipo,
                                              orden,
                                              ronda,
                                              carreras: meta.carrerasDisputadas,
                                              dias: meta.diasCompeticion,
                                            };
                                          })
                                          .filter(Boolean) as any[];

                                        // Filter by team and round
                                        const filtered = unscored.filter(
                                          (c) => {
                                            const teamMatch =
                                              unscoredCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                unscoredCyclistsTeamFilter;
                                            const roundMatch =
                                              unscoredCyclistsRoundFilter.length ===
                                                0 ||
                                              unscoredCyclistsRoundFilter.includes(
                                                c.ronda,
                                              );
                                            return teamMatch && roundMatch;
                                          },
                                        );

                                        // Sort
                                        filtered.sort((a, b) => {
                                          let valA: any, valB: any;
                                          switch (unscoredCyclistsSortColumn) {
                                            case "jugador":
                                              valA = a.nombreEquipo;
                                              valB = b.nombreEquipo;
                                              break;
                                            case "ciclista":
                                              valA = a.ciclista;
                                              valB = b.ciclista;
                                              break;
                                            case "ronda":
                                              valA = a.ronda;
                                              valB = b.ronda;
                                              break;
                                            case "carreras":
                                              valA = a.carreras;
                                              valB = b.carreras;
                                              break;
                                            case "dias":
                                              valA = a.dias;
                                              valB = b.dias;
                                              break;
                                            default:
                                              valA = a.ronda;
                                              valB = b.ronda;
                                              break;
                                          }

                                          if (
                                            typeof valA === "string" &&
                                            typeof valB === "string"
                                          ) {
                                            return unscoredCyclistsSortDirection ===
                                              "asc"
                                              ? valA.localeCompare(valB)
                                              : valB.localeCompare(valA);
                                          }

                                          if (valA < valB)
                                            return unscoredCyclistsSortDirection ===
                                              "asc"
                                              ? -1
                                              : 1;
                                          if (valA > valB)
                                            return unscoredCyclistsSortDirection ===
                                              "asc"
                                              ? 1
                                              : -1;
                                          return 0;
                                        });

                                        // Calculate max values for conditional formatting
                                        const maxCarreras = Math.max(
                                          ...filtered.map((c) => c.carreras),
                                          0,
                                        );
                                        const maxDias = Math.max(
                                          ...filtered.map((c) => c.dias),
                                          0,
                                        );

                                        if (filtered.length === 0) {
                                          return (
                                            <tr>
                                              <td
                                                colSpan={5}
                                                className="px-6 py-10 text-center text-neutral-400 italic text-[11px]"
                                              >
                                                No hay ciclistas sin puntuar que
                                                coincidan con los criterios.
                                              </td>
                                            </tr>
                                          );
                                        }

                                        return filtered.map((c, idx) => {
                                          let isHiddenVisual = false;
                                          if (isUnscoredCopying) {
                                            if (isUnscoredCopying === "full")
                                              isHiddenVisual = false;
                                            else {
                                              const pageNum = parseInt(
                                                isUnscoredCopying.substring(1),
                                              );
                                              const start = (pageNum - 1) * 50;
                                              const end = start + 50;
                                              isHiddenVisual = !(
                                                idx >= start && idx < end
                                              );
                                            }
                                          }

                                          if (
                                            isHiddenVisual &&
                                            isUnscoredCopying
                                          )
                                            return null;

                                          return (
                                            <tr
                                              key={idx}
                                              className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100"
                                            >
                                              <td className="px-4 py-1 text-neutral-600 whitespace-nowrap">
                                                <span className="font-medium">
                                                  {c.nombreEquipo}
                                                </span>{" "}
                                                <span className="text-neutral-400 font-normal text-[9px]">
                                                  [#{c.orden}]
                                                </span>
                                              </td>
                                              <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                                {c.ciclista}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-4 py-1 text-center font-mono whitespace-nowrap",
                                                  [
                                                    "01",
                                                    "02",
                                                    "03",
                                                    "1",
                                                    "2",
                                                    "3",
                                                  ].includes(c.ronda)
                                                    ? "bg-yellow-50 text-yellow-700 font-bold"
                                                    : "text-neutral-500",
                                                )}
                                              >
                                                {c.ronda}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-4 py-1 text-center font-mono whitespace-nowrap",
                                                  c.carreras === 0
                                                    ? "text-red-600 font-bold"
                                                    : c.carreras ===
                                                          maxCarreras &&
                                                        maxCarreras > 0
                                                      ? "text-green-600 font-bold"
                                                      : "text-neutral-600",
                                                )}
                                              >
                                                {c.carreras}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-4 py-1 text-center font-mono whitespace-nowrap",
                                                  c.dias === 0
                                                    ? "text-red-600 font-bold"
                                                    : c.dias === maxDias &&
                                                        maxDias > 0
                                                      ? "text-green-600 font-bold"
                                                      : "text-neutral-600",
                                                )}
                                              >
                                                {c.dias}
                                              </td>
                                            </tr>
                                          );
                                        });
                                      })()}
                                    </tbody>
                                  </table></div>
                                </div>
                              </div>

                              {/* Undebuted Cyclists Table */}
                              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-8">
                                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
                                    <UserMinus className="w-5 h-5 text-neutral-400" />
                                    Ciclistas sin debutar (
                                    {(() => {
                                      const undebuted = files.elecciones.data
                                        ?.map((row) => {
                                          const ciclista = getVal(
                                            row,
                                            "Ciclista",
                                          )?.trim();
                                          const jugador = getVal(
                                            row,
                                            "Nombre_TG",
                                          )?.trim();
                                          const nombreEquipo = getVal(
                                            row,
                                            "Nombre_Equipo",
                                          )?.trim();
                                          const ronda =
                                            cyclistRoundMap[ciclista] || "";
                                          const meta = cyclistMetadata[
                                            ciclista
                                          ] || {
                                            carrerasDisputadas: 0,
                                            diasCompeticion: 0,
                                          };

                                          if (meta.diasCompeticion > 0)
                                            return null;

                                          return { nombreEquipo, ronda };
                                        })
                                        .filter(Boolean) as any[];

                                      const filtered = undebuted.filter((c) => {
                                        const teamMatch =
                                          undebutedCyclistsTeamFilter ===
                                            "all" ||
                                          c.nombreEquipo ===
                                            undebutedCyclistsTeamFilter;
                                        const roundMatch =
                                          undebutedCyclistsRoundFilter.length ===
                                            0 ||
                                          undebutedCyclistsRoundFilter.includes(
                                            c.ronda,
                                          );
                                        return teamMatch && roundMatch;
                                      });

                                      return filtered.length;
                                    })()}
                                    )
                                  </h3>
                                  <p className="text-xs text-neutral-500 whitespace-nowrap">
                                    Corredores elegidos en el draft que aún no
                                    han disputado ninguna carrera (días = 0).
                                  </p>
                                  <div className="flex flex-wrap gap-3 mt-1">
                                    <div className="flex flex-wrap items-center gap-1.5 border-r border-neutral-200 pr-3 copy-button-ignore">
                                      <button
                                        onClick={() =>
                                          setIsUndebutedExpanded(
                                            !isUndebutedExpanded,
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
                                        title={
                                          isUndebutedExpanded
                                            ? "Contraer tabla"
                                            : "Expandir tabla"
                                        }
                                      >
                                        {isUndebutedExpanded ? (
                                          <Minimize2 className="w-4 h-4" />
                                        ) : (
                                          <Maximize2 className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCopyUndebuted("full")
                                        }
                                        disabled={!!isUndebutedCopying}
                                        title="Copiar imagen"
                                        className={cn(
                                          "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                                          isUndebutedCopying === "full"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white",
                                          isUndebutedCopying &&
                                            isUndebutedCopying !== "full" &&
                                            "opacity-50 cursor-not-allowed",
                                        )}
                                      >
                                        {isUndebutedCopying === "full" ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>

                                      {(() => {
                                        const undebutedCount =
                                          (files.elecciones.data
                                            ?.map((row) => {
                                              const ciclista = getVal(
                                                row,
                                                "Ciclista",
                                              )?.trim();
                                              const meta = cyclistMetadata[
                                                ciclista
                                              ] || {
                                                carrerasDisputadas: 0,
                                                diasCompeticion: 0,
                                              };
                                              if (meta.diasCompeticion > 0)
                                                return null;
                                              return {
                                                nombreEquipo: getVal(
                                                  row,
                                                  "Nombre_Equipo",
                                                )?.trim(),
                                                ronda:
                                                  cyclistRoundMap[ciclista] ||
                                                  "",
                                              };
                                            })
                                            .filter(Boolean) as any[]) || [];
                                        const count = undebutedCount.filter(
                                          (c) => {
                                            const teamMatch =
                                              undebutedCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                undebutedCyclistsTeamFilter;
                                            const roundMatch =
                                              undebutedCyclistsRoundFilter.length ===
                                                0 ||
                                              undebutedCyclistsRoundFilter.includes(
                                                c.ronda,
                                              );
                                            return teamMatch && roundMatch;
                                          },
                                        ).length;

                                        if (count > 50) {
                                          return (
                                            <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                                              {Array.from({
                                                length: Math.ceil(count / 50),
                                              }).map((_, i) => {
                                                const s = "p" + (i + 1);
                                                const isCopyingThis =
                                                  isUndebutedCopying === s;
                                                return (
                                                  <button
                                                    key={s}
                                                    onClick={() =>
                                                      handleCopyUndebuted(
                                                        s as any,
                                                      )
                                                    }
                                                    disabled={
                                                      !!isUndebutedCopying
                                                    }
                                                    className={cn(
                                                      "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                                      isCopyingThis
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-white",
                                                      isUndebutedCopying &&
                                                        !isCopyingThis &&
                                                        "opacity-50 cursor-not-allowed",
                                                    )}
                                                  >
                                                    {isCopyingThis ? (
                                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                                    ) : (
                                                      <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                    {i * 50 + 1}-{(i + 1) * 50}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}

                                      <button
                                        onClick={handleCopyUndebutedText}
                                        disabled={isUndebutedTextCopying}
                                        title="Copiar texto"
                                        className={cn(
                                          "px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
                                          isUndebutedTextCopying
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                                        )}
                                      >
                                        {isUndebutedTextCopying ? (
                                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        ) : (
                                          <FileText className="w-4 h-4 mr-1.5" />
                                        )}
                                        Texto
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadUndebuted("full")
                                        }
                                        title="Descargar imagen"
                                        className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setIsUndebutedRoundFilterOpen(
                                            !isUndebutedRoundFilterOpen,
                                          )
                                        }
                                        className={cn(
                                          "flex items-center gap-2 px-3 py-2 text-sm border rounded-md shadow-sm transition-all",
                                          undebutedCyclistsRoundFilter.length >
                                            0
                                            ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                                            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                                        )}
                                      >
                                        {undebutedCyclistsRoundFilter.length ===
                                        0
                                          ? "Todas las rondas"
                                          : `${undebutedCyclistsRoundFilter.length} ${undebutedCyclistsRoundFilter.length === 1 ? "ronda" : "rondas"}`}
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 transition-transform",
                                            isUndebutedRoundFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </button>

                                      {isUndebutedRoundFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-[40]"
                                            onClick={() =>
                                              setIsUndebutedRoundFilterOpen(
                                                false,
                                              )
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-[50] py-1 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                                Filtrar por ronda
                                              </span>
                                              {undebutedCyclistsRoundFilter.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    setUndebutedCyclistsRoundFilter(
                                                      [],
                                                    )
                                                  }
                                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                  Limpiar
                                                </button>
                                              )}
                                            </div>
                                            {Array.from(
                                              new Set(
                                                Object.values(
                                                  cyclistRoundMap,
                                                ) as string[],
                                              ),
                                            )
                                              .filter(Boolean)
                                              .sort((a, b) =>
                                                a.localeCompare(b),
                                              )
                                              .map((ronda) => (
                                                <label
                                                  key={ronda}
                                                  className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                    checked={undebutedCyclistsRoundFilter.includes(
                                                      ronda,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setUndebutedCyclistsRoundFilter(
                                                          [
                                                            ...undebutedCyclistsRoundFilter,
                                                            ronda,
                                                          ],
                                                        );
                                                      } else {
                                                        setUndebutedCyclistsRoundFilter(
                                                          undebutedCyclistsRoundFilter.filter(
                                                            (r) => r !== ronda,
                                                          ),
                                                        );
                                                      }
                                                    }}
                                                  />
                                                  <span className="ml-2 text-sm text-neutral-700">
                                                    Ronda {ronda}
                                                  </span>
                                                </label>
                                              ))}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    <select
                                      value={undebutedCyclistsTeamFilter}
                                      onChange={(e) =>
                                        setUndebutedCyclistsTeamFilter(
                                          e.target.value,
                                        )
                                      }
                                      className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                      <option value="all">
                                        Todos los equipos
                                      </option>
                                      {leaderboard?.map((p) => (
                                        <option
                                          key={p.nombreEquipo}
                                          value={p.nombreEquipo}
                                        >
                                          {p.nombreEquipo}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div
                                  ref={undebutedTableRef}
                                  className={cn(
                                    "overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin",
                                    isUndebutedExpanded
                                      ? "max-h-none"
                                      : "max-h-[750px]",
                                  )}
                                >
                                  <div className="table-responsive-wrapper overflow-auto w-full h-full"><table className="min-w-full text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-200 rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
                                      <tr className="divide-x divide-neutral-100">
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          onClick={() => {
                                            if (
                                              undebutedCyclistsSortColumn ===
                                              "jugador"
                                            ) {
                                              setUndebutedCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUndebutedCyclistsSortColumn(
                                                "jugador",
                                              );
                                              setUndebutedCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Jugador{" "}
                                            {undebutedCyclistsSortColumn ===
                                              "jugador" &&
                                              (undebutedCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          onClick={() => {
                                            if (
                                              undebutedCyclistsSortColumn ===
                                              "ciclista"
                                            ) {
                                              setUndebutedCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUndebutedCyclistsSortColumn(
                                                "ciclista",
                                              );
                                              setUndebutedCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ciclista{" "}
                                            {undebutedCyclistsSortColumn ===
                                              "ciclista" &&
                                              (undebutedCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          onClick={() => {
                                            if (
                                              undebutedCyclistsSortColumn ===
                                              "ronda"
                                            ) {
                                              setUndebutedCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUndebutedCyclistsSortColumn(
                                                "ronda",
                                              );
                                              setUndebutedCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ronda{" "}
                                            {undebutedCyclistsSortColumn ===
                                              "ronda" &&
                                              (undebutedCyclistsSortDirection ===
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
                                      {(() => {
                                        // Get all cyclists from elecciones
                                        const undebuted = files.elecciones.data
                                          ?.map((row) => {
                                            const ciclista = getVal(
                                              row,
                                              "Ciclista",
                                            )?.trim();
                                            const jugador = getVal(
                                              row,
                                              "Nombre_TG",
                                            )?.trim();
                                            const nombreEquipo = getVal(
                                              row,
                                              "Nombre_Equipo",
                                            )?.trim();
                                            const orden =
                                              playerOrderMap[jugador] || "";
                                            const ronda =
                                              cyclistRoundMap[ciclista] || "";

                                            // Get metadata
                                            const meta = cyclistMetadata[
                                              ciclista
                                            ] || {
                                              carrerasDisputadas: 0,
                                              diasCompeticion: 0,
                                            };

                                            if (meta.diasCompeticion > 0)
                                              return null;

                                            return {
                                              ciclista,
                                              jugador,
                                              nombreEquipo,
                                              orden,
                                              ronda,
                                            };
                                          })
                                          .filter(Boolean) as any[];

                                        // Filter by team and round
                                        const filtered = undebuted.filter(
                                          (c) => {
                                            const teamMatch =
                                              undebutedCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                undebutedCyclistsTeamFilter;
                                            const roundMatch =
                                              undebutedCyclistsRoundFilter.length ===
                                                0 ||
                                              undebutedCyclistsRoundFilter.includes(
                                                c.ronda,
                                              );
                                            return teamMatch && roundMatch;
                                          },
                                        );

                                        // Sort
                                        filtered.sort((a, b) => {
                                          let valA: any, valB: any;
                                          switch (undebutedCyclistsSortColumn) {
                                            case "jugador":
                                              valA = a.nombreEquipo;
                                              valB = b.nombreEquipo;
                                              break;
                                            case "ciclista":
                                              valA = a.ciclista;
                                              valB = b.ciclista;
                                              break;
                                            case "ronda":
                                              valA = parseInt(a.ronda) || 0;
                                              valB = parseInt(b.ronda) || 0;
                                              break;
                                            default:
                                              valA = parseInt(a.ronda) || 0;
                                              valB = parseInt(b.ronda) || 0;
                                              break;
                                          }

                                          if (
                                            typeof valA === "string" &&
                                            typeof valB === "string"
                                          ) {
                                            return undebutedCyclistsSortDirection ===
                                              "asc"
                                              ? valA.localeCompare(valB)
                                              : valB.localeCompare(valA);
                                          }

                                          if (valA < valB)
                                            return undebutedCyclistsSortDirection ===
                                              "asc"
                                              ? -1
                                              : 1;
                                          if (valA > valB)
                                            return undebutedCyclistsSortDirection ===
                                              "asc"
                                              ? 1
                                              : -1;
                                          return 0;
                                        });

                                        if (filtered.length === 0) {
                                          return (
                                            <tr>
                                              <td
                                                colSpan={3}
                                                className="px-6 py-10 text-center text-neutral-400 italic text-[11px]"
                                              >
                                                No hay ciclistas sin debutar que
                                                coincidan con los filtros.
                                              </td>
                                            </tr>
                                          );
                                        }

                                        return filtered.map((c, idx) => {
                                          let isHiddenVisual = false;
                                          if (isUndebutedCopying) {
                                            if (isUndebutedCopying === "full")
                                              isHiddenVisual = false;
                                            else {
                                              const pageNum = parseInt(
                                                isUndebutedCopying.substring(1),
                                              );
                                              const start = (pageNum - 1) * 50;
                                              const end = start + 50;
                                              isHiddenVisual = !(
                                                idx >= start && idx < end
                                              );
                                            }
                                          }

                                          if (
                                            isHiddenVisual &&
                                            isUndebutedCopying
                                          )
                                            return null;

                                          return (
                                            <tr
                                              key={idx}
                                              className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100"
                                            >
                                              <td className="px-4 py-1 text-neutral-600 whitespace-nowrap">
                                                <span className="font-medium">
                                                  {c.nombreEquipo}
                                                </span>{" "}
                                                <span className="text-neutral-400 font-normal text-[9px]">
                                                  [#{c.orden}]
                                                </span>
                                              </td>
                                              <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                                {c.ciclista}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-4 py-1 text-center font-mono whitespace-nowrap",
                                                  [
                                                    "01",
                                                    "02",
                                                    "03",
                                                    "1",
                                                    "2",
                                                    "3",
                                                  ].includes(c.ronda)
                                                    ? "bg-yellow-50 text-yellow-700 font-bold"
                                                    : "text-neutral-500",
                                                )}
                                              >
                                                {c.ronda}
                                              </td>
                                            </tr>
                                          );
                                        });
                                      })()}
                                    </tbody>
                                  </table></div>
                                </div>
                              </div>
                            </>
                          ) : cyclistsSubTab === "no-draft" ? (
                            <div className="space-y-8">
                              {/* Top Cyclists (No draft) */}
                              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
                                    <User className="w-5 h-5 text-red-600" />
                                    Top Ciclistas No Elegidos (No draft)
                                  </h3>
                                  <p className="text-xs text-neutral-500 whitespace-nowrap">
                                    Corredores que han sumado puntos pero no
                                    fueron elegidos por ningún equipo.
                                  </p>

                                  <div className="flex flex-wrap gap-3 mt-1">
                                    <div className="flex flex-wrap items-center gap-1.5 border-r border-neutral-200 pr-3 copy-button-ignore">
                                      <button
                                        onClick={() =>
                                          setIsNoDraftCyclistsExpanded(
                                            !isNoDraftCyclistsExpanded,
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
                                        title={
                                          isNoDraftCyclistsExpanded
                                            ? "Contraer tabla"
                                            : "Expandir tabla"
                                        }
                                      >
                                        {isNoDraftCyclistsExpanded ? (
                                          <Minimize2 className="w-4 h-4" />
                                        ) : (
                                          <Maximize2 className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCopyNoDraftCyclists("full")
                                        }
                                        disabled={!!isNoDraftCyclistsCopying}
                                        title="Copiar imagen"
                                        className={cn(
                                          "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                                          isNoDraftCyclistsCopying === "full"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white",
                                          isNoDraftCyclistsCopying &&
                                            isNoDraftCyclistsCopying !==
                                              "full" &&
                                            "opacity-50 cursor-not-allowed",
                                        )}
                                      >
                                        {isNoDraftCyclistsCopying === "full" ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>

                                      {(() => {
                                        // Get no draft cyclists stats
                                        const noDraftStats: Record<
                                          string,
                                          any
                                        > = {};
                                        const noDraftCyclists =
                                          new Set<string>();
                                        leaderboard?.forEach((player) => {
                                          player?.detalles?.forEach((d) => {
                                            if (
                                              d.ciclista &&
                                              d.jugador === "No elegido"
                                            ) {
                                              noDraftCyclists.add(d.ciclista);
                                            }
                                          });
                                        });
                                        files.puntos?.data?.forEach((row) => {
                                          const ciclista = getVal(
                                            row,
                                            "Ciclista",
                                          );
                                          if (
                                            ciclista &&
                                            noDraftCyclists.has(ciclista)
                                          ) {
                                            const puntos = parseFloat(
                                              getVal(row, "Puntos") || "0",
                                            );
                                            if (!noDraftStats[ciclista])
                                              noDraftStats[ciclista] = {
                                                puntos: 0,
                                              };
                                            const monthMatch =
                                              noDraftCyclistsMonthFilter ===
                                                "all" ||
                                              new Date(
                                                (parseFloat(
                                                  getVal(row, "Fecha_carrera"),
                                                ) -
                                                  25569) *
                                                  86400 *
                                                  1000,
                                              )
                                                .getMonth()
                                                .toString() ===
                                                noDraftCyclistsMonthFilter;
                                            if (monthMatch) {
                                              noDraftStats[ciclista].puntos +=
                                                puntos;
                                            }
                                          }
                                        });

                                        const allStats = Array.from(
                                          noDraftCyclists,
                                        )
                                          .filter(
                                            (name) =>
                                              noDraftStats[name]?.puntos > 0,
                                          )
                                          .map((name) => ({
                                            name,
                                            data: noDraftStats[name],
                                          }))
                                          .sort(
                                            (a, b) =>
                                              b.data.puntos - a.data.puntos,
                                          );

                                        const topScorersLimit =
                                          noDraftTopCyclistsLimit === 9999
                                            ? allStats.length
                                            : Math.min(
                                                noDraftTopCyclistsLimit,
                                                allStats.length,
                                              );

                                        if (topScorersLimit > 50) {
                                          return (
                                            <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                                              {Array.from({
                                                length: Math.ceil(
                                                  topScorersLimit / 50,
                                                ),
                                              }).map((_, i) => {
                                                const s = "p" + (i + 1);
                                                const isCopyingThis =
                                                  isNoDraftCyclistsCopying ===
                                                  s;
                                                const start = i * 50 + 1;
                                                const end = (i + 1) * 50;
                                                return (
                                                  <button
                                                    key={s}
                                                    onClick={() =>
                                                      handleCopyNoDraftCyclists(
                                                        s as any,
                                                      )
                                                    }
                                                    disabled={
                                                      !!isNoDraftCyclistsCopying
                                                    }
                                                    className={cn(
                                                      "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                                      isCopyingThis
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-white",
                                                      isNoDraftCyclistsCopying &&
                                                        !isCopyingThis &&
                                                        "opacity-50 cursor-not-allowed",
                                                    )}
                                                  >
                                                    {isCopyingThis ? (
                                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                                    ) : (
                                                      <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                    {start}-{end}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}

                                      <button
                                        onClick={handleCopyNoDraftCyclistsText}
                                        disabled={isNoDraftCyclistsTextCopying}
                                        title="Copiar texto"
                                        className={cn(
                                          "px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
                                          isNoDraftCyclistsTextCopying
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                                        )}
                                      >
                                        {isNoDraftCyclistsTextCopying ? (
                                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        ) : (
                                          <FileText className="w-4 h-4 mr-1.5" />
                                        )}
                                        Texto
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadNoDraftCyclists("full")
                                        }
                                        title="Descargar imagen"
                                        className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>

                                    <select
                                      value={noDraftCyclistsMonthFilter}
                                      onChange={(e) =>
                                        setNoDraftCyclistsMonthFilter(
                                          e.target.value,
                                        )
                                      }
                                      className="px-3 py-1.5 h-8 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                    <div className="flex bg-neutral-100 p-1 rounded-lg">
                                      {[25, 50, 100, 9999].map((limit) => (
                                        <button
                                          key={limit}
                                          onClick={() =>
                                            setNoDraftTopCyclistsLimit(limit)
                                          }
                                          className={cn(
                                            "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                            noDraftTopCyclistsLimit === limit
                                              ? "bg-white text-blue-600 shadow-sm"
                                              : "text-neutral-500 hover:text-neutral-700",
                                          )}
                                        >
                                          {limit === 9999
                                            ? "Todos"
                                            : `Top ${limit}`}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  ref={noDraftCyclistsTableRef}
                                  className={cn(
                                    "overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 scrollbar-thin flex justify-center",
                                    isNoDraftCyclistsExpanded
                                      ? "max-h-none"
                                      : "h-[800px]",
                                  )}
                                >
                                  <div className="table-responsive-wrapper overflow-auto w-full h-full"><table className="w-auto min-w-[700px] text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-200 rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
                                      <tr className="divide-x divide-neutral-100">
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              noDraftCyclistsSortColumn ===
                                              "pos"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "pos",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Pos{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "pos" &&
                                              (noDraftCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              noDraftCyclistsSortColumn ===
                                              "nombre"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "nombre",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ciclista{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "nombre" &&
                                              (noDraftCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              noDraftCyclistsSortColumn ===
                                              "equipo"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "equipo",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Equipo{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "equipo" &&
                                              (noDraftCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              noDraftCyclistsSortColumn ===
                                              "pais"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "pais",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            País{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "pais" &&
                                              (noDraftCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              noDraftCyclistsSortColumn ===
                                              "victorias"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "victorias",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Vic{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "victorias" &&
                                              (noDraftCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              noDraftCyclistsSortColumn ===
                                              "carreras"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "carreras",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Carr{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "carreras" &&
                                              (noDraftCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          title="Puntos por carreras"
                                          onClick={() => {
                                            if (
                                              noDraftCyclistsSortColumn ===
                                              "ppc"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "ppc",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            P/C{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "ppc" &&
                                              (noDraftCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              noDraftCyclistsSortColumn ===
                                              "puntos"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "puntos",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Pts{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "puntos" &&
                                              (noDraftCyclistsSortDirection ===
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
                                      {(() => {
                                        const noDraftPlayer = leaderboard?.find(
                                          (p) => p.jugador === "No draft",
                                        );
                                        if (!noDraftPlayer) {
                                          return (
                                            <tr>
                                              <td
                                                colSpan={8}
                                                className="px-6 py-10 text-center text-neutral-400 italic"
                                              >
                                                No hay datos de puntuación para
                                                ciclistas no elegidos.
                                              </td>
                                            </tr>
                                          );
                                        }

                                        const cyclistStats: Record<
                                          string,
                                          {
                                            puntos: number;
                                            pais: string;
                                            equipoBreve: string;
                                            victorias: number;
                                            carreras: Set<string>;
                                            dias: number;
                                          }
                                        > = {};

                                        // Map races to months
                                        const raceMonths: Record<
                                          string,
                                          number
                                        > = {};
                                        files.carreras.data?.forEach((r) => {
                                          const carreraName = getVal(
                                            r,
                                            "Carrera",
                                          )?.trim();
                                          const fechaFin = getVal(r, "Fecha");
                                          if (carreraName && fechaFin) {
                                            const parts =
                                              fechaFin.split(/[-/]/);
                                            if (parts.length >= 2) {
                                              const monthIndex =
                                                parseInt(parts[1]) - 1;
                                              raceMonths[carreraName] =
                                                monthIndex;
                                            }
                                          }
                                        });

                                        noDraftPlayer.detalles.forEach((d) => {
                                          if (
                                            noDraftCyclistsMonthFilter !==
                                              "all" &&
                                            raceMonths[d.carrera] !==
                                              parseInt(
                                                noDraftCyclistsMonthFilter,
                                              )
                                          ) {
                                            return;
                                          }

                                          if (!cyclistStats[d.ciclista]) {
                                            const meta =
                                              cyclistMetadata[d.ciclista];
                                            cyclistStats[d.ciclista] = {
                                              puntos: 0,
                                              pais: meta?.pais || "",
                                              equipoBreve:
                                                meta?.equipoBreve || "",
                                              victorias: 0,
                                              carreras: new Set(),
                                              dias: 0,
                                            };
                                          }

                                          const stats =
                                            cyclistStats[d.ciclista];
                                          stats.puntos += d.puntosObtenidos;
                                          stats.carreras.add(d.carrera);

                                          const isPos01 =
                                            d.posicion === "01" ||
                                            d.posicion === "1";
                                          const isValidType = [
                                            "Etapa",
                                            "Etapa (Crono equipos)",
                                            "Clasificación final",
                                            "Clasificación final (Crono equipos)",
                                            "Clásica",
                                          ].includes(d.tipoResultado);
                                          if (isPos01 && isValidType)
                                            stats.victorias += 1;
                                        });

                                        const allStats = Object.entries(
                                          cyclistStats,
                                        )
                                          .sort(
                                            (a, b) => b[1].puntos - a[1].puntos,
                                          )
                                          .map(([name, data], index) => {
                                            const numCarreras =
                                              data.carreras.size;
                                            const ppc =
                                              numCarreras > 0
                                                ? parseFloat(
                                                    (
                                                      data.puntos / numCarreras
                                                    ).toFixed(1),
                                                  )
                                                : 0;
                                            return {
                                              name,
                                              data,
                                              numCarreras,
                                              ppc,
                                              originalPos: index + 1,
                                            };
                                          });

                                        allStats.sort((a, b) => {
                                          let valA: any, valB: any;
                                          switch (noDraftCyclistsSortColumn) {
                                            case "pos":
                                              valA = a.originalPos;
                                              valB = b.originalPos;
                                              break;
                                            case "nombre":
                                              valA = a.name;
                                              valB = b.name;
                                              break;
                                            case "equipo":
                                              valA = a.data.equipoBreve;
                                              valB = b.data.equipoBreve;
                                              break;
                                            case "pais":
                                              valA = a.data.pais;
                                              valB = b.data.pais;
                                              break;
                                            case "victorias":
                                              valA = a.data.victorias;
                                              valB = b.data.victorias;
                                              break;
                                            case "carreras":
                                              valA = a.numCarreras;
                                              valB = b.numCarreras;
                                              break;
                                            case "ppc":
                                              valA = a.ppc;
                                              valB = b.ppc;
                                              break;
                                            case "puntos":
                                            default:
                                              valA = a.data.puntos;
                                              valB = b.data.puntos;
                                              break;
                                          }
                                          if (
                                            typeof valA === "string" &&
                                            typeof valB === "string"
                                          ) {
                                            return noDraftCyclistsSortDirection ===
                                              "asc"
                                              ? valA.localeCompare(valB)
                                              : valB.localeCompare(valA);
                                          }
                                          if (valA < valB)
                                            return noDraftCyclistsSortDirection ===
                                              "asc"
                                              ? -1
                                              : 1;
                                          if (valA > valB)
                                            return noDraftCyclistsSortDirection ===
                                              "asc"
                                              ? 1
                                              : -1;
                                          return 0;
                                        });

                                        const sortedStats = allStats.slice(
                                          0,
                                          noDraftTopCyclistsLimit,
                                        );
                                        if (sortedStats.length === 0) {
                                          return (
                                            <tr>
                                              <td
                                                colSpan={8}
                                                className="px-6 py-10 text-center text-neutral-400 italic"
                                              >
                                                No hay ciclistas no elegidos que
                                                coincidan con los criterios.
                                              </td>
                                            </tr>
                                          );
                                        }

                                        const maxPuntos =
                                          sortedStats[0].data.puntos;
                                        const minPuntos =
                                          sortedStats[sortedStats.length - 1]
                                            .data.puntos;
                                        const maxVictorias = Math.max(
                                          ...sortedStats.map(
                                            (s) => s.data.victorias,
                                          ),
                                          0,
                                        );

                                        return sortedStats.map((s) => (
                                          <tr
                                            key={s.name}
                                            className="no-draft-row hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100"
                                          >
                                            <td className="px-4 py-1 text-center">
                                              <span
                                                className={cn(
                                                  "w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[9px] font-bold",
                                                  s.originalPos === 1
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : s.originalPos === 2
                                                      ? "bg-neutral-200 text-neutral-600"
                                                      : s.originalPos === 3
                                                        ? "bg-orange-100 text-orange-700"
                                                        : "bg-neutral-100 text-neutral-500",
                                                )}
                                              >
                                                {s.originalPos}
                                              </span>
                                            </td>
                                            <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                              {s.name}
                                            </td>
                                            <td className="px-4 py-1 text-neutral-600 text-center whitespace-nowrap">
                                              {s.data.equipoBreve}
                                            </td>
                                            <td className="px-4 py-1 text-lg text-center">
                                              {s.data.pais}
                                            </td>
                                            <td
                                              className={cn(
                                                "px-4 py-1 text-center",
                                                s.data.victorias > 0
                                                  ? "text-green-600 font-bold"
                                                  : "text-neutral-400",
                                              )}
                                            >
                                              {s.data.victorias}
                                            </td>
                                            <td className="px-4 py-1 text-center text-neutral-600">
                                              {s.numCarreras}
                                            </td>
                                            <td className="px-4 py-1 text-center text-neutral-600">
                                              {s.ppc.toFixed(1)}
                                            </td>
                                            <td
                                              className="px-4 py-1 text-center font-black"
                                              style={{
                                                color: `hsl(${45 + ((s.data.puntos - minPuntos) / (maxPuntos - minPuntos || 1)) * 75}, 80%, 40%)`,
                                              }}
                                            >
                                              {s.data.puntos}
                                            </td>
                                          </tr>
                                        ));
                                      })()}
                                    </tbody>
                                  </table></div>
                                </div>
                              </div>
                            </div>
                          ) : cyclistsSubTab === "detalle" ? (
                            <CyclistDetailView files={files} selectedCyclistDetail={selectedCyclistDetail} setSelectedCyclistDetail={setSelectedCyclistDetail} cyclistMetadata={cyclistMetadata} cyclistRoundMap={cyclistRoundMap} playerByCyclist={playerByCyclist} playerOrderMap={playerOrderMap} playerTeamMap={playerTeamMap} />
                          ) : null}
                        </div>
                      
    </>
  );
}
