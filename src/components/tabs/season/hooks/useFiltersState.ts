import { useUrlState } from "../../../../hooks/useUrlState";

export function useFiltersState() {
  const [evolutionTimeFilter, setEvolutionTimeFilter] = useUrlState("evolutionTimeFilter", "all");
  
  const [teamsSortColumn, setTeamsSortColumn] = useUrlState("teamsSortColumn", "totalPoints");
  const [teamsSortDirection, setTeamsSortDirection] = useUrlState("teamsSortDirection", "desc");
  const [historyTeamFilter, setHistoryTeamFilter] = useUrlState("historyTeamFilter", "all");
  const [historySortColumn, setHistorySortColumn] = useUrlState("historySortColumn", "fecha");
  const [historySortDirection, setHistorySortDirection] = useUrlState("historySortDirection", "desc");
  const [cyclistsMonthFilter, setCyclistsMonthFilter] = useUrlState("cyclistsMonthFilter", "all");
  const [noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter] = useUrlState("noDraftCyclistsMonthFilter", "all");
  const [topCyclistsLimit, setTopCyclistsLimit] = useUrlState("topCyclistsLimit", 10);
  const [noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit] = useUrlState("noDraftTopCyclistsLimit", 10);

  const [topTeamsSortColumn, setTopTeamsSortColumn] = useUrlState<string>("topTeamsSortColumn", "pos");
  const [topTeamsSortDirection, setTopTeamsSortDirection] = useUrlState<"asc" | "desc">("topTeamsSortDirection", "asc");
  const [winsHistorySortColumn, setWinsHistorySortColumn] = useUrlState<string>("winsHistorySortColumn", "carrera");
  const [winsHistorySortDirection, setWinsHistorySortDirection] = useUrlState<"asc" | "desc">("winsHistorySortDirection", "asc");
  const [cyclistsSortColumn, setCyclistsSortColumn] = useUrlState<string>("cyclistsSortColumn", "puntos");
  const [cyclistsSortDirection, setCyclistsSortDirection] = useUrlState<"asc" | "desc">("cyclistsSortDirection", "desc");
  const [unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn] = useUrlState<string>("unscoredCyclistsSortColumn", "pos");
  const [unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection] = useUrlState<"asc" | "desc">("unscoredCyclistsSortDirection", "asc");
  const [undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn] = useUrlState<string>("undebutedCyclistsSortColumn", "pos");
  const [undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection] = useUrlState<"asc" | "desc">("undebutedCyclistsSortDirection", "asc");
  const [noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn] = useUrlState<string>("noDraftCyclistsSortColumn", "puntos");
  const [noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection] = useUrlState<"asc" | "desc">("noDraftCyclistsSortDirection", "desc");

  const [teamsMonthFilter, setTeamsMonthFilter] = useUrlState<string>("teamsMonthFilter", "all");
  const [historyMonthFilter, setHistoryMonthFilter] = useUrlState<string>("historyMonthFilter", "all");

  const [cyclistsTeamFilter, setCyclistsTeamFilter] = useUrlState<string[]>("cyclistsTeamFilter", []);
  const [cyclistsCategoryFilter, setCyclistsCategoryFilter] = useUrlState<string[]>("cyclistsCategoryFilter", []);
  const [cyclistsRoundFilter, setCyclistsRoundFilter] = useUrlState<string[]>("cyclistsRoundFilter", []);
  const [cyclistsNameSearch, setCyclistsNameSearch] = useUrlState<string>("cyclistsNameSearch", "");

  const [unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter] = useUrlState<string>("unscoredCyclistsTeamFilter", "all");
  const [unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter] = useUrlState<string[]>("unscoredCyclistsRoundFilter", []);

  const [undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter] = useUrlState<string>("undebutedCyclistsTeamFilter", "all");
  const [undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter] = useUrlState<string[]>("undebutedCyclistsRoundFilter", []);

  const [noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter] = useUrlState<string>("noDraftCyclistsTeamFilter", "all");
  
  const [selectedEvolutionTeams, setSelectedEvolutionTeams] = useUrlState<string[]>("selectedEvolutionTeams", []);
  
  const [leaderboardTeamsSearch, setLeaderboardTeamsSearch] = useUrlState("leaderboardTeamsSearch", "");
  const [winsSearch, setWinsSearch] = useUrlState("winsSearch", "");
  const [winsHistorySearch, setWinsHistorySearch] = useUrlState("winsHistorySearch", "");

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
