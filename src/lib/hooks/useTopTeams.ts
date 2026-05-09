import { useMemo } from "react";
import { useDataStore } from "../stores/useDataStore";
import { useComputedStore } from "../stores/useComputedStore";
import { getVal } from "../data-processing";

export interface TopTeamStat {
  jugador: string;
  nombreEquipo: string;
  orden: string;
  puntos: number;
  originalPos: number;
  wins: number;
  partialWins: number;
  ppc: number;
  ppd: number;
  numCarreras: number;
  totalDays: number;
}

export function useTopTeams(teamsMonthFilter: string, leaderboardTeamsSearch: string, topTeamsSortColumn: string, topTeamsSortDirection: string) {
  const { files } = useDataStore();
  const { leaderboard, raceWinners, globalTeamPartialWinsCount } = useComputedStore();

  return useMemo(() => {
    if (!leaderboard || !files.carreras.data) {
      return { sortedTeams: [], maxPoints: 1, minPoints: 0, maxWins: 0, maxPartialWins: 0 };
    }

    const filteredLeaderboard = leaderboard.filter((p) => p.nombreEquipo !== "No draft" && p.nombreEquipo !== "No draft [99]");

    const raceMonths: Record<string, number> = {};
    files.carreras.data.forEach((r) => {
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

    const teamStats = filteredLeaderboard.map((team, idx) => {
      const filteredDetalles = team.detalles.filter((d) => {
        if (teamsMonthFilter !== "all" && raceMonths[d.carrera] !== parseInt(teamsMonthFilter)) {
          return false;
        }
        return true;
      });

      const puntos = filteredDetalles.reduce((sum, d) => sum + d.puntosObtenidos, 0);
      const uniqueRaces = new Set(filteredDetalles.map((d) => d.carrera));
      const numCarreras = uniqueRaces.size;

      let totalDays = 0;
      uniqueRaces.forEach((raceName) => {
        const raceData = files.carreras.data?.find((r) => getVal(r, "Carrera")?.trim() === raceName);
        if (raceData) {
          const diasStr = getVal(raceData, "Días");
          totalDays += parseInt(diasStr) || 1;
        } else {
          totalDays += 1;
        }
      });

      let wins = 0;
      Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
        if (winnerTeam === team.nombreEquipo) {
          if (teamsMonthFilter === "all" || raceMonths[raceName] === parseInt(teamsMonthFilter)) {
            wins++;
          }
        }
      });

      let partialWins = 0;
      if (globalTeamPartialWinsCount && globalTeamPartialWinsCount.byRace) {
        Object.entries(globalTeamPartialWinsCount.byRace).forEach(([raceName, raceEvents]) => {
          if (teamsMonthFilter === "all" || raceMonths[raceName] === parseInt(teamsMonthFilter)) {
            Object.values(raceEvents).forEach((winnerTeams) => {
              if (winnerTeams.includes(team.nombreEquipo)) {
                partialWins++;
              }
            });
          }
        });
      }

      const ppc = numCarreras > 0 ? parseFloat((puntos / numCarreras).toFixed(1)) : 0;
      const ppd = totalDays > 0 ? parseFloat((puntos / totalDays).toFixed(1)) : 0;

      return {
        ...team,
        puntos,
        originalPos: idx + 1,
        wins,
        partialWins,
        ppc,
        ppd,
        numCarreras,
        totalDays,
      } as TopTeamStat;
    });

    const searchedTeams = teamStats.filter((t) =>
      t.nombreEquipo.toLowerCase().includes((leaderboardTeamsSearch || "").toLowerCase()),
    );

    const sortedTeams = [...searchedTeams].sort((a, b) => {
      const aVal = a[topTeamsSortColumn as keyof TopTeamStat] ?? 0;
      const bVal = b[topTeamsSortColumn as keyof TopTeamStat] ?? 0;

      let res = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        res = aVal - bVal;
      } else {
        res = String(aVal).localeCompare(String(bVal));
      }
      return topTeamsSortDirection === "asc" ? res : -res;
    });

    const maxPoints = Math.max(...sortedTeams.map((t) => t.puntos), 1);
    const minPoints = Math.min(...sortedTeams.map((t) => t.puntos), 0);
    const maxWins = Math.max(...sortedTeams.map((t) => t.wins), 0);
    const maxPartialWins = Math.max(...sortedTeams.map((t) => t.partialWins), 0);

    return { sortedTeams, maxPoints, minPoints, maxWins, maxPartialWins };

  }, [
    files.carreras.data,
    leaderboard,
    raceWinners,
    globalTeamPartialWinsCount,
    teamsMonthFilter,
    leaderboardTeamsSearch,
    topTeamsSortColumn,
    topTeamsSortDirection
  ]);
}
