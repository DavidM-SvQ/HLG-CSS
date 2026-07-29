import { TopTeamStat } from '../types';
import { useMemo } from "react";
import { useDataStore } from "../stores/useDataStore";
import { useComputedStore } from "../stores/useComputedStore";
import { getVal, parseSafeDateStr } from "../data-processing";

export function useTopTeams(
  teamsMonthFilter: string,
  teamsCategoryFilter: string = "all",
  leaderboardTeamsSearch: string,
  topTeamsSortColumn: string,
  topTeamsSortDirection: string
) {
  const { files } = useDataStore();
  const { leaderboard, raceWinners, globalTeamPartialWinsCount, playerByCyclist, playerTeamMap } = useComputedStore();

  return useMemo(() => {
    if (!leaderboard || !files.carreras.data) {
      return { 
        sortedTeams: [], 
        maxPoints: 1, 
        minPoints: 0, 
        maxWins: 0, 
        minWins: 0, 
        maxPartialWins: 0, 
        minPartialWins: 0, 
        maxCarreras: 0, 
        minCarreras: 0,
        maxPpc: 0,
        minPpc: 0,
        maxDays: 0,
        minDays: 0,
        maxPpd: 0,
        minPpd: 0
      };
    }

    const filteredLeaderboard = leaderboard.filter((p) => p.nombreEquipo !== "No draft" && p.nombreEquipo !== "No draft [99]");

    const raceMonths: Record<string, number> = {};
    const raceDates: Record<string, string> = {}; // YYYY-MM-DD
    const raceCategories: Record<string, string> = {};

    files.carreras.data.forEach((r) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const fechaFin = getVal(r, "Fecha");
      const cat = getVal(r, "Categoría")?.trim();
      if (carreraName) {
        if (cat) {
          raceCategories[carreraName] = cat;
          raceCategories[carreraName.toLowerCase()] = cat;
        }
        if (fechaFin) {
          const parsedStr = parseSafeDateStr(fechaFin);
          raceDates[carreraName] = parsedStr;
          const parts = parsedStr.split(/[-/]/);
          if (parts.length >= 2) {
            const monthIndex = parseInt(parts[1]) - 1;
            if (!isNaN(monthIndex)) raceMonths[carreraName] = monthIndex;
          }
        }
      }
    });

    const getRaceCat = (carreraName: string) => {
      if (!carreraName) return "";
      const trimmed = carreraName.trim();
      return raceCategories[trimmed] || raceCategories[trimmed.toLowerCase()] || "";
    };

    const isCustomDate = teamsMonthFilter.startsWith("custom_");
    let customStart = "";
    let customEnd = "";
    if (isCustomDate) {
      const parts = teamsMonthFilter.split("_");
      if (parts.length === 3) {
        customStart = parts[1];
        customEnd = parts[2];
      }
    }

    const teamCarrerasLog = new Map<string, Set<string>>();
    const teamDiasCount = new Map<string, number>();

    if (files.resultados?.data) {
      files.resultados.data.forEach((row) => {
        const ciclista = getVal(row, "Ciclista")?.trim();
        const carrera = getVal(row, "Carrera")?.trim();
        const etapa = getVal(row, "Etapa")?.toString().trim();
        
        if (ciclista && carrera) {
          if (teamsCategoryFilter !== "all" && getRaceCat(carrera) !== teamsCategoryFilter) {
            return;
          }
          if (isCustomDate) {
            const raceDate = raceDates[carrera];
            if (!raceDate || raceDate < customStart || raceDate > customEnd) {
              return;
            }
          } else if (teamsMonthFilter !== "all" && raceMonths[carrera] !== parseInt(teamsMonthFilter)) {
            return;
          }
          const jugador = playerByCyclist?.[ciclista];
          if (jugador) {
            const teamName = playerTeamMap?.[jugador];
            if (teamName) {
              if (!teamCarrerasLog.has(teamName)) Object.assign(teamCarrerasLog, teamCarrerasLog.set(teamName, new Set()));
              teamCarrerasLog.get(teamName)!.add(`${ciclista}|${carrera}`);
              
              if (etapa !== "CP" && etapa !== "CM") {
                teamDiasCount.set(teamName, (teamDiasCount.get(teamName) || 0) + 1);
              }
            }
          }
        }
      });
    }

    const teamStats = filteredLeaderboard.map((team, idx) => {
      const filteredDetalles = team.detalles.filter((d) => {
        if (teamsCategoryFilter !== "all" && getRaceCat(d.carrera) !== teamsCategoryFilter) {
          return false;
        }
        if (isCustomDate) {
          // Si el detalle tiene fecha (evolución) la usamos, o sino la de la carrera
          let dDate = d.fecha;
          if (!dDate) dDate = raceDates[d.carrera];
          if (!dDate || dDate < customStart || dDate > customEnd) {
             return false;
          }
        } else if (teamsMonthFilter !== "all" && raceMonths[d.carrera] !== parseInt(teamsMonthFilter)) {
          return false;
        }
        return true;
      });

      const puntos = filteredDetalles.reduce((sum, d) => sum + d.puntosObtenidos, 0);
      const numCarreras = teamCarrerasLog.get(team.nombreEquipo)?.size || 0;
      const totalDays = teamDiasCount.get(team.nombreEquipo) || 0;

      let wins = 0;
      Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
        if (winnerTeam === team.nombreEquipo) {
          if (teamsCategoryFilter !== "all" && getRaceCat(raceName) !== teamsCategoryFilter) {
            return;
          }
          if (isCustomDate) {
            const raceDate = raceDates[raceName];
            if (raceDate && raceDate >= customStart && raceDate <= customEnd) {
              wins++;
            }
          } else if (teamsMonthFilter === "all" || raceMonths[raceName] === parseInt(teamsMonthFilter)) {
            wins++;
          }
        }
      });

      let partialWins = 0;
      if (globalTeamPartialWinsCount && globalTeamPartialWinsCount.byRace) {
        Object.entries(globalTeamPartialWinsCount.byRace).forEach(([raceName, raceEvents]) => {
          if (teamsCategoryFilter !== "all" && getRaceCat(raceName) !== teamsCategoryFilter) {
            return;
          }
          if (isCustomDate) {
            const raceDate = raceDates[raceName];
            if (raceDate && raceDate >= customStart && raceDate <= customEnd) {
              Object.values(raceEvents).forEach((winnerTeams) => {
                if (winnerTeams.includes(team.nombreEquipo)) partialWins++;
              });
            }
          } else if (teamsMonthFilter === "all" || raceMonths[raceName] === parseInt(teamsMonthFilter)) {
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

      const draftPos = parseInt(team.orden) || 0;
      const diff = draftPos > 0 ? draftPos - (idx + 1) : 0;

      return {
        ...team,
        puntos,
        originalPos: idx + 1,
        diff,
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

    const maxPoints = sortedTeams.length > 0 ? Math.max(...sortedTeams.map((t) => t.puntos)) : 1;
    const minPoints = sortedTeams.length > 0 ? Math.min(...sortedTeams.map((t) => t.puntos)) : 0;
    const maxWins = sortedTeams.length > 0 ? Math.max(...sortedTeams.map((t) => t.wins)) : 0;
    const minWins = sortedTeams.length > 0 ? Math.min(...sortedTeams.map((t) => t.wins)) : 0;
    const maxPartialWins = sortedTeams.length > 0 ? Math.max(...sortedTeams.map((t) => t.partialWins)) : 0;
    const minPartialWins = sortedTeams.length > 0 ? Math.min(...sortedTeams.map((t) => t.partialWins)) : 0;
    const maxCarreras = sortedTeams.length > 0 ? Math.max(...sortedTeams.map((t) => t.numCarreras)) : 0;
    const minCarreras = sortedTeams.length > 0 ? Math.min(...sortedTeams.map((t) => t.numCarreras)) : 0;
    const maxPpc = sortedTeams.length > 0 ? Math.max(...sortedTeams.map((t) => t.ppc)) : 0;
    const minPpc = sortedTeams.length > 0 ? Math.min(...sortedTeams.map((t) => t.ppc)) : 0;
    const maxDays = sortedTeams.length > 0 ? Math.max(...sortedTeams.map((t) => t.totalDays)) : 0;
    const minDays = sortedTeams.length > 0 ? Math.min(...sortedTeams.map((t) => t.totalDays)) : 0;
    const maxPpd = sortedTeams.length > 0 ? Math.max(...sortedTeams.map((t) => t.ppd)) : 0;
    const minPpd = sortedTeams.length > 0 ? Math.min(...sortedTeams.map((t) => t.ppd)) : 0;

    return { 
      sortedTeams, 
      maxPoints, 
      minPoints, 
      maxWins, 
      minWins, 
      maxPartialWins, 
      minPartialWins, 
      maxCarreras, 
      minCarreras,
      maxPpc,
      minPpc,
      maxDays,
      minDays,
      maxPpd,
      minPpd
    };

  }, [
    files.carreras.data,
    files.resultados.data,
    leaderboard,
    raceWinners,
    globalTeamPartialWinsCount,
    teamsMonthFilter,
    teamsCategoryFilter,
    leaderboardTeamsSearch,
    playerByCyclist,
    playerTeamMap,
    topTeamsSortColumn,
    topTeamsSortDirection
  ]);
}
