import { TopDraftCyclists } from "./TopDraftCyclists";
import { UnscoredCyclists } from "./UnscoredCyclists";
import { UndebutedCyclists } from "./UndebutedCyclists";
import { NoDraftCyclists } from "./NoDraftCyclists";
import React, { useContext, useRef } from "react";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";


export function SeasonCyclistsTab() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const topCyclistsDraftRefContainer = useRef<HTMLDivElement>(null);
  const unscoredRefContainer = useRef<HTMLDivElement>(null);
  const undebutedRefContainer = useRef<HTMLDivElement>(null);
  const noDraftRefContainer = useRef<HTMLDivElement>(null);

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
                              <TopDraftCyclists />
                              <UnscoredCyclists />
                              <UndebutedCyclists />
                            </>
                          ) : cyclistsSubTab === "no-draft" ? (
                            <NoDraftCyclists />
                          ) : cyclistsSubTab === "detalle" ? (
                            <React.Suspense fallback={<div className="p-4 text-center text-neutral-500 animate-pulse">Cargando detalles...</div>}>
                              <CyclistDetailView files={files} selectedCyclistDetail={selectedCyclistDetail} setSelectedCyclistDetail={setSelectedCyclistDetail} cyclistMetadata={cyclistMetadata} cyclistRoundMap={cyclistRoundMap} playerByCyclist={playerByCyclist} playerOrderMap={playerOrderMap} playerTeamMap={playerTeamMap} />
                            </React.Suspense>
                          ) : null}
                        </div>
                      
    </>
  );
}

