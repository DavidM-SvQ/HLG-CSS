import React, { useMemo, lazy } from "react";
import { SeasonViewContext } from "./SeasonViewContext";
import { useUIState } from "./hooks/useUIState";
import { useFiltersState } from "./hooks/useFiltersState";
import { useUrlState } from "../../../hooks/useUrlState";
import { cn } from "../../../lib/utils";
import { getVal, formatNumberSpanish } from "../../../lib/data-processing";

export interface SeasonViewProviderProps {
  files: any;
  playerTeamMap: Record<string, string>;
  playerByCyclist: Record<string, string>;
  uniqueRaces: string[];
  leaderboard: any[];
  raceWinners: Record<string, string>;
  globalTeamPartialWinsCount: any;
  globalTeamWinsCount: any;
  cyclistMetadata: any;
  cyclistRoundMap: Record<string, string>;
  playerOrderMap: Record<string, string>;
}

const CyclistDetailView = lazy(() => import("../../modals/CyclistDetailView").then((m) => ({ default: m.CyclistDetailView })));

const LINE_COLORS = [
  "#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0284c7",
  "#ea580c", "#c026d3", "#059669", "#4f46e5", "#b91c1c", "#0891b2",
  "#84cc16", "#db2777", "#f59e0b", "#65a30d", "#8b5cf6", "#14b8a6",
  "#ec4899", "#f97316",
];

export const SeasonViewProvider: React.FC<SeasonViewProviderProps & { children: React.ReactNode }> = ({
  children,
  files,
  playerTeamMap,
  playerByCyclist,
  uniqueRaces,
  leaderboard,
  raceWinners,
  globalTeamPartialWinsCount,
  globalTeamWinsCount,
  cyclistMetadata,
  cyclistRoundMap,
  playerOrderMap,
}) => {
  const [selectedCyclistDetail, setSelectedCyclistDetail] = useUrlState<string | null>("selected_cyclist", null);

  const uiState = useUIState();
  const filtersState = useFiltersState();

  const { filteredLeaderboard, teamWinsCount } = useMemo(() => {
    const filtered = leaderboard?.filter((p) => p.nombreEquipo !== "No draft") || [];
    const winsCount: Record<string, number> = {};
    filtered?.forEach((p) => {
      if (p.nombreEquipo !== "No draft" && p.nombreEquipo !== "No draft [99]") {
        winsCount[p.nombreEquipo] = 0;
      }
    });
    Object.values(raceWinners).forEach((teamName) => {
      const name = teamName as string;
      if (winsCount[name] !== undefined) {
        winsCount[name]++;
      }
    });
    return { filteredLeaderboard: filtered, teamWinsCount: winsCount };
  }, [leaderboard, raceWinners]);

  const value = {
    cn,
    CyclistDetailView,
    files,
    playerTeamMap,
    playerByCyclist,
    uniqueRaces,
    leaderboard,
    raceWinners,
    globalTeamPartialWinsCount,
    globalTeamWinsCount,
    cyclistMetadata,
    cyclistRoundMap,
    playerOrderMap,
    selectedCyclistDetail,
    setSelectedCyclistDetail,
    LINE_COLORS,
    filteredLeaderboard,
    teamWinsCount,
    formatNumberSpanish,
    getVal,
    ...uiState,
    ...filtersState,
  };

  return <SeasonViewContext.Provider value={value}>{children}</SeasonViewContext.Provider>;
};
