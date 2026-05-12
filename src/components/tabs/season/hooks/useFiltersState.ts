import { useState } from "react";

export function useFiltersState() {
  const [evolutionTimeFilter, setEvolutionTimeFilter] = useState("all");
  
  const [teamsSortColumn, setTeamsSortColumn] = useState("totalPoints");
  const [teamsSortDirection, setTeamsSortDirection] = useState("desc");
  const [historyTeamFilter, setHistoryTeamFilter] = useState("all");
  const [historySortColumn, setHistorySortColumn] = useState("fecha");
  const [historySortDirection, setHistorySortDirection] = useState("desc");
  const [cyclistsMonthFilter, setCyclistsMonthFilter] = useState("all");
  const [noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter] = useState("all");
  const [topCyclistsLimit, setTopCyclistsLimit] = useState(10);
  const [noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit] = useState(10);

  const [topTeamsSortColumn, setTopTeamsSortColumn] = useState<string>("pos");
  const [topTeamsSortDirection, setTopTeamsSortDirection] = useState<"asc" | "desc">("asc");
  const [winsHistorySortColumn, setWinsHistorySortColumn] = useState<string>("carrera");
  const [winsHistorySortDirection, setWinsHistorySortDirection] = useState<"asc" | "desc">("asc");
  const [cyclistsSortColumn, setCyclistsSortColumn] = useState<string>("puntos");
  const [cyclistsSortDirection, setCyclistsSortDirection] = useState<"asc" | "desc">("desc");
  const [unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn] = useState<string>("pos");
  const [unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection] = useState<"asc" | "desc">("asc");
  const [undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn] = useState<string>("pos");
  const [undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection] = useState<"asc" | "desc">("asc");
  const [noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn] = useState<string>("puntos");
  const [noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection] = useState<"asc" | "desc">("desc");

  const [teamsMonthFilter, setTeamsMonthFilter] = useState<string>("all");
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>("all");

  const [cyclistsTeamFilter, setCyclistsTeamFilter] = useState<string[]>([]);
  const [cyclistsCategoryFilter, setCyclistsCategoryFilter] = useState<string[]>([]);
  const [cyclistsRoundFilter, setCyclistsRoundFilter] = useState<string[]>([]);
  const [cyclistsNameSearch, setCyclistsNameSearch] = useState<string>("");

  const [unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter] = useState<string>("all");
  const [unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter] = useState<string[]>([]);

  const [undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter] = useState<string>("all");
  const [undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter] = useState<string[]>([]);

  const [noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter] = useState<string>("all");
  
  const [selectedEvolutionTeams, setSelectedEvolutionTeams] = useState<string[]>([]);
  
  const [leaderboardTeamsSearch, setLeaderboardTeamsSearch] = useState("");
  const [winsSearch, setWinsSearch] = useState("");
  const [winsHistorySearch, setWinsHistorySearch] = useState("");

  return {
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
  };
}
