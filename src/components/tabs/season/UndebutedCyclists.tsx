import React, { useContext, useRef } from "react";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";


export function UndebutedCyclists() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const topCyclistsDraftRefContainer = useRef<HTMLDivElement>(null);
  const unscoredRefContainer = useRef<HTMLDivElement>(null);
  const undebutedRefContainer = useRef<HTMLDivElement>(null);
  const noDraftRefContainer = useRef<HTMLDivElement>(null);

  const { cn, CyclistDetailView, files, playerTeamMap, playerByCyclist, uniqueRaces, leaderboard, raceWinners, globalTeamPartialWinsCount, globalTeamWinsCount, cyclistMetadata, cyclistRoundMap, playerOrderMap, seasonSubTab, setSeasonSubTab, isChartExpanded, setIsChartExpanded, evolutionMode, setEvolutionMode, isEvolutionChartExpanded, setIsEvolutionChartExpanded, teamsSortColumn, setTeamsSortColumn, teamsSortDirection, setTeamsSortDirection, isTopTeamsTableExpanded, setIsTopTeamsTableExpanded, isTopTeamsTableCopying, setIsTopTeamsTableCopying, isWinsRankingExpanded, setIsWinsRankingExpanded, winsChartType, setWinsChartType, historyTeamFilter, setHistoryTeamFilter, historySortColumn, setHistorySortColumn, historySortDirection, setHistorySortDirection, cyclistsSubTab, setCyclistsSubTab, cyclistsMonthFilter, setCyclistsMonthFilter, isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen, isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen, isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen, isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded, topCyclistsLimit, setTopCyclistsLimit, isUnscoredExpanded, setIsUnscoredExpanded, isUndebutedExpanded, setIsUndebutedExpanded, noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter, isNoDraftCyclistsExpanded, setIsNoDraftCyclistsExpanded, noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit, selectedCyclistDetail, setSelectedCyclistDetail, isCopying, setIsCopying, winsRankingRef, winsHistoryRef, unscoredTableRef, undebutedTableRef, noDraftCyclistsTableRef, LINE_COLORS, topTeamsSortColumn, setTopTeamsSortColumn, topTeamsSortDirection, setTopTeamsSortDirection, winsHistorySortColumn, setWinsHistorySortColumn, winsHistorySortDirection, setWinsHistorySortDirection, cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection, unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn, unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection, undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn, undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection, noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn, noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection, teamsMonthFilter, setTeamsMonthFilter, historyMonthFilter, setHistoryMonthFilter, cyclistsTeamFilter, setCyclistsTeamFilter, isTeamFilterOpen, setIsTeamFilterOpen, cyclistsCategoryFilter, setCyclistsCategoryFilter, isCategoryFilterOpen, setIsCategoryFilterOpen, cyclistsRoundFilter, setCyclistsRoundFilter, isRoundFilterOpen, setIsRoundFilterOpen, cyclistsNameSearch, setCyclistsNameSearch, unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter, unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter, isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen, undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter, undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter, isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen, noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter, isChartCopying, setIsChartCopying, isEvolutionChartCopying, setIsEvolutionChartCopying, isTopTeamsCopying, setIsTopTeamsCopying, isWinsRankingCopying, setIsWinsRankingCopying, isWinsEvolutionCopying, setIsWinsEvolutionCopying, isWinsHistoryCopying, setIsWinsHistoryCopying, isWinsHistoryTextCopying, setIsWinsHistoryTextCopying, isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying, isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying, isUnscoredCopying, setIsUnscoredCopying, isUnscoredTextCopying, setIsUnscoredTextCopying, isUndebutedCopying, setIsUndebutedCopying, isUndebutedTextCopying, setIsUndebutedTextCopying, isNoDraftCyclistsCopying, setIsNoDraftCyclistsCopying, isNoDraftCyclistsTextCopying, setIsNoDraftCyclistsTextCopying, chartRef, evolutionChartRef, topTeamsTableRef, winsRankingTableRef, winsEvolutionRef, winsHistoryTableRef, topCyclistsDraftRef, unscoredRef, undebutedRef, noDraftCyclistsRef, selectedEvolutionTeams, setSelectedEvolutionTeams, isExpanded, setIsExpanded, isEvolutionExpanded, setIsEvolutionExpanded, isWinsExpanded, setIsWinsExpanded, isWinsEvolutionExpanded, setIsWinsEvolutionExpanded, isWinsHistoryExpanded, setIsWinsHistoryExpanded, leaderboardTeamsSearch, setLeaderboardTeamsSearch, winsSearch, setWinsSearch, winsHistorySearch, setWinsHistorySearch, handleCopyChart, handleDownloadChart, handleCopyEvolutionChart, handleDownloadEvolutionChart, handleCopyTopTeamsTable, handleDownloadTopTeamsTable, handleCopyWinsRanking, handleDownloadWinsRanking, handleCopyWinsEvolution, handleDownloadWinsEvolution, handleCopyWinsHistory, handleCopyWinsHistoryText, handleDownloadWinsHistory, handleCopyTopCyclistsDraft, handleCopyTopCyclistsDraftText, handleDownloadTopCyclistsDraft, handleCopyUnscored, handleCopyUnscoredText, handleDownloadUnscored, handleCopyUndebuted, handleCopyUndebutedText, handleDownloadUndebuted, handleCopyNoDraftCyclists, handleCopyNoDraftCyclistsText, handleDownloadNoDraftCyclists, formatNumberSpanish, getVal, filteredLeaderboard, teamWinsCount } = context;

  return (
    <>
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
                                  <div ref={undebutedRefContainer} className="table-responsive-wrapper overflow-auto w-full max-h-[600px]"><table className="min-w-full text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-200 rounded-lg">
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
  );
}
