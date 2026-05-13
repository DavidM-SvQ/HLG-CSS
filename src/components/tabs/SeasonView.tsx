import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";
import { SeasonViewContext } from "./season/SeasonViewContext";
import { SeasonHighlights } from "./season/SeasonHighlights";
import { SeasonCyclistsTab } from "./season/SeasonCyclistsTab";
import { SeasonWinsTab } from "./season/SeasonWinsTab";
import { SeasonPointsTab } from "./season/SeasonPointsTab";
import { SeasonMilestones } from "./season/SeasonMilestones";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { cn } from "../../lib/utils";
import { getVal, formatNumberSpanish } from "../../lib/data-processing";
import { domToBlob, domToDataUrl } from "modern-screenshot";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import React, { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { useUIState } from "./season/hooks/useUIState";
import { useFiltersState } from "./season/hooks/useFiltersState";
import { motion, AnimatePresence } from "motion/react";

const CyclistDetailView = lazy(() => import("../modals/CyclistDetailView").then(m => ({ default: m.CyclistDetailView })));


export interface SeasonViewProps {
  playerTeamMap: Record<string, string>;
  playerByCyclist: Record<string, string>;
  uniqueRaces: string[];
  files: any;
  leaderboard: any[];
  raceWinners: Record<string, string>;
  globalTeamPartialWinsCount: any;
  globalTeamWinsCount: any;
  cyclistMetadata: any;
  cyclistRoundMap: Record<string, string>;
  playerOrderMap: Record<string, string>;
}

export const SeasonView = (props: SeasonViewProps) => {
  const { files, playerTeamMap, playerByCyclist, uniqueRaces, leaderboard, raceWinners, globalTeamPartialWinsCount, globalTeamWinsCount, cyclistMetadata, cyclistRoundMap, playerOrderMap } = props;

  const [selectedCyclistDetail, setSelectedCyclistDetail] = React.useState<string | null>(null);

  const {
    seasonSubTab, setSeasonSubTab,
    cyclistsSubTab, setCyclistsSubTab,
  } = useUIState();

  const {
    evolutionTimeFilter, setEvolutionTimeFilter,
    teamsSortColumn, setTeamsSortColumn, teamsSortDirection, setTeamsSortDirection,
    historyTeamFilter, setHistoryTeamFilter, historySortColumn, setHistorySortColumn, historySortDirection, setHistorySortDirection,
    cyclistsMonthFilter, setCyclistsMonthFilter, noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter,
    topCyclistsLimit, setTopCyclistsLimit, noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit,
    topTeamsSortColumn, setTopTeamsSortColumn, topTeamsSortDirection, setTopTeamsSortDirection,
    winsHistorySortColumn, setWinsHistorySortColumn, winsHistorySortDirection, setWinsHistorySortDirection,
    cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection,
    unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn, unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection,
    undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn, undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection,
    noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn, noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection,
    teamsMonthFilter, setTeamsMonthFilter, historyMonthFilter, setHistoryMonthFilter,
    cyclistsTeamFilter, setCyclistsTeamFilter, cyclistsCategoryFilter, setCyclistsCategoryFilter,
    cyclistsRoundFilter, setCyclistsRoundFilter, cyclistsNameSearch, setCyclistsNameSearch,
    unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter, unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter,
    undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter, undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter,
    noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter,
    selectedEvolutionTeams, setSelectedEvolutionTeams,
    leaderboardTeamsSearch, setLeaderboardTeamsSearch,
    winsSearch, setWinsSearch, winsHistorySearch, setWinsHistorySearch,
  } = useFiltersState();

  const LINE_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0284c7", "#ea580c", "#c026d3", "#059669", "#4f46e5", "#b91c1c", "#0891b2", "#84cc16", "#db2777", "#f59e0b", "#65a30d", "#8b5cf6", "#14b8a6", "#ec4899", "#f97316"];

  

  const { filteredLeaderboard, teamWinsCount } = useMemo(() => {
    const filteredLeaderboard = leaderboard?.filter((p) => p.nombreEquipo !== "No draft") || [];
    const teamWinsCount: Record<string, number> = {};
    filteredLeaderboard?.forEach((p) => {
      if (p.nombreEquipo !== "No draft" && p.nombreEquipo !== "No draft [99]") {
        teamWinsCount[p.nombreEquipo] = 0;
      }
    });
    Object.values(raceWinners).forEach((teamName) => {
      const name = teamName as string;
      if (teamWinsCount[name] !== undefined) {
        teamWinsCount[name]++;
      }
    });
    return { filteredLeaderboard, teamWinsCount };
  }, [leaderboard, raceWinners]);

  return (
    <SeasonViewContext.Provider value={{cn, CyclistDetailView, files, playerTeamMap, playerByCyclist, uniqueRaces, leaderboard, raceWinners, globalTeamPartialWinsCount, globalTeamWinsCount, cyclistMetadata, cyclistRoundMap, playerOrderMap, seasonSubTab, setSeasonSubTab, evolutionTimeFilter, setEvolutionTimeFilter, teamsSortColumn, setTeamsSortColumn, teamsSortDirection, setTeamsSortDirection, historyTeamFilter, setHistoryTeamFilter, historySortColumn, setHistorySortColumn, historySortDirection, setHistorySortDirection, cyclistsSubTab, setCyclistsSubTab, cyclistsMonthFilter, setCyclistsMonthFilter, topCyclistsLimit, setTopCyclistsLimit, noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter, noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit, selectedCyclistDetail, setSelectedCyclistDetail, LINE_COLORS, topTeamsSortColumn, setTopTeamsSortColumn, topTeamsSortDirection, setTopTeamsSortDirection, winsHistorySortColumn, setWinsHistorySortColumn, winsHistorySortDirection, setWinsHistorySortDirection, cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection, unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn, unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection, undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn, undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection, noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn, noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection, teamsMonthFilter, setTeamsMonthFilter, historyMonthFilter, setHistoryMonthFilter, cyclistsTeamFilter, setCyclistsTeamFilter, cyclistsCategoryFilter, setCyclistsCategoryFilter, cyclistsRoundFilter, setCyclistsRoundFilter, cyclistsNameSearch, setCyclistsNameSearch, unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter, unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter, undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter, undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter, noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter, selectedEvolutionTeams, setSelectedEvolutionTeams, leaderboardTeamsSearch, setLeaderboardTeamsSearch, winsSearch, setWinsSearch, winsHistorySearch, setWinsHistorySearch, formatNumberSpanish, getVal, filteredLeaderboard, teamWinsCount}}>
          <div className="space-y-8">
            <SeasonHighlights 
              leaderboard={leaderboard} 
              raceWinners={raceWinners} 
              uniqueRaces={uniqueRaces} 
              files={files} 
            />
  {/* Sub-tabs Navigation */}
  <div className="flex justify-center mb-4 md:mb-8 w-full">
    <div className="flex bg-neutral-100 p-1 md:p-1.5 rounded-xl shadow-inner w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {[
        { id: "puntos", label: "Puntos", icon: BarChart3 },
        { id: "victorias", label: "Victorias", icon: Trophy },
        { id: "ciclistas", label: "Ciclistas", icon: Users },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setSeasonSubTab(tab.id as any)}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 sm:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all duration-200 whitespace-nowrap",
            seasonSubTab === tab.id
              ? "bg-white text-blue-600 shadow-md transform sm:scale-105"
              : "text-neutral-500 hover:text-neutral-700 hover:bg-white/50"
          )}
        >
          <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  </div>

  <AnimatePresence mode="wait">
    {seasonSubTab === "puntos" && (
      <motion.div
        key="puntos"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <SeasonPointsTab />
      </motion.div>
    )}
    {seasonSubTab === "victorias" && (
      <motion.div
        key="victorias"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <SeasonWinsTab />
      </motion.div>
    )}
    {seasonSubTab === "ciclistas" && (
      <motion.div
        key="ciclistas"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <SeasonCyclistsTab />
      </motion.div>
    )}
  </AnimatePresence>

  <SeasonMilestones leaderboard={leaderboard} files={files} cyclistMetadata={cyclistMetadata} raceWinners={raceWinners} />
</div>
    </SeasonViewContext.Provider>
  );
};

export default SeasonView;
