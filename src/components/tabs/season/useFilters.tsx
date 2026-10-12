import { useMemo } from "react";
import { getVal, parseSafeDateStr } from "../../../lib/data-processing";

export function useFilters(context: any) {
  const {
    files,
    uniqueRaces,
    raceWinners,
    filteredLeaderboard,
    selectedEvolutionTeams,
    winsChartType,
    historyMonthFilter,
    historyTeamFilter,
    historySortColumn,
    historySortDirection,
    winsHistorySearch,
  } = context;

  const currentMonthIdx = new Date().getMonth();

  // 1. Team Colors
  const teamColors = useMemo(() => {
    const LINE_COLORS = ["#10b981", "#ef4444", "#8b5cf6", "#f43f5e", "#06b6d4", "#14b8a6", "#3b82f6"];
    const colors: Record<string, string> = {};
    filteredLeaderboard?.forEach((team: any, idx: number) => {
      const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
      if (idx === 0) colors[teamKey] = "#fbbf24"; // Gold
      else if (idx === 1) colors[teamKey] = "#94a3b8"; // Silver
      else if (idx === 2) colors[teamKey] = "#fb923c"; // Bronze
      else colors[teamKey] = LINE_COLORS[(idx - 3) % LINE_COLORS.length];
    });
    return colors;
  }, [filteredLeaderboard]);

  // 2. Chart Data for Team Wins Ranking
  const teamWinsRankingData = useMemo(() => {
    return Object.entries(context.teamWinsCount as Record<string, number>)
      .map(([name, wins]) => {
        const teamInfo = filteredLeaderboard?.find(
          (p: any) => p.nombreEquipo === name
        );
        const displayName = teamInfo ? `${name} [#${teamInfo.orden}]` : name;
        return { name: displayName, wins };
      })
      .sort((a, b) => b.wins - a.wins);
  }, [context.teamWinsCount, filteredLeaderboard]);

  // 3. Monthly Wins Evolution Data
  const monthlyWinsEvolutionData = useMemo(() => {
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    const dataByMonth: any[] = months.map((m) => ({ month: m }));
    const raceMonths: Record<string, number> = {};
    
    let maxMonthIdx = -1;

    files?.carreras?.data?.forEach((r: any) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const fechaFin = getVal(r, "Fecha");
      if (carreraName && fechaFin) {
        const parsedStr = parseSafeDateStr(fechaFin);
        const parts = parsedStr.split(/[-/]/);
        if (parts.length >= 2) {
          const monthIndex = parseInt(parts[1]) - 1;
          raceMonths[carreraName] = monthIndex;
          if (!isNaN(monthIndex) && monthIndex > maxMonthIdx) maxMonthIdx = monthIndex;
        }
      }
    });

    const activeMaxMonthIdx = maxMonthIdx >= 0 ? maxMonthIdx : new Date().getMonth();

    filteredLeaderboard?.forEach((team: any) => {
      const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
      if (selectedEvolutionTeams && selectedEvolutionTeams.length > 0 && !selectedEvolutionTeams.includes(teamKey)) return;

      let accumulated = 0;
      months.forEach((_m, mIdx) => {
        let monthWins = 0;
        Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
          if (winnerTeam === team.nombreEquipo && raceMonths[raceName] === mIdx) {
            monthWins++;
          }
        });
        if (winsChartType === "acumulado") {
          accumulated += monthWins;
          dataByMonth[mIdx][teamKey] = accumulated;
        } else {
          dataByMonth[mIdx][teamKey] = monthWins;
        }
      });
    });

    return dataByMonth.filter((m, idx) => {
      const hasData = Object.keys(m).some((key) => key !== "month" && m[key] > 0);
      return hasData && idx <= activeMaxMonthIdx;
    });
  }, [files?.carreras?.data, filteredLeaderboard, selectedEvolutionTeams, raceWinners, winsChartType]);

  // 4. Wins History Data (Filtered and Sorted)
  const filteredHistoryRaces = useMemo(() => {
    const raceMonths: Record<string, number> = {};
    const raceDates: Record<string, string> = {};
    files?.carreras?.data?.forEach((r: any) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const fechaFin = getVal(r, "Fecha");
      if (carreraName && fechaFin) {
        const parsedStr = parseSafeDateStr(fechaFin);
        raceDates[carreraName] = parsedStr;
        const parts = parsedStr.split(/[-/]/);
        if (parts.length >= 2) {
          const monthIndex = parseInt(parts[1]) - 1;
          raceMonths[carreraName] = monthIndex;
        }
      }
    });

    const raceData = uniqueRaces.map((race: string) => {
      const winnerTeamName = raceWinners[race];
      let winnerDisplayName = winnerTeamName || "";
      let winnerPoints = 0;

      if (winnerTeamName) {
        const teamInfo = filteredLeaderboard?.find(
          (p: any) => p.nombreEquipo === winnerTeamName
        );
        if (teamInfo) {
          winnerDisplayName = `${winnerTeamName} [#${teamInfo.orden}]`;
          winnerPoints = teamInfo.detalles
            .filter((d: any) => d.carrera === race)
            .reduce((sum: number, d: any) => sum + d.puntosObtenidos, 0);
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

    const filtered = raceData.filter((item: any) => {
      // 1. Modern Date Filter (EvolutionDateFilter support)
      let monthMatch = true;
      if (historyMonthFilter && historyMonthFilter !== "all") {
        if (historyMonthFilter.startsWith("custom_")) {
          const parts = historyMonthFilter.split("_");
          if (parts.length >= 3) {
            const s = parts[1];
            const e = parts[2];
            monthMatch = item.date ? item.date >= s && item.date <= e : false;
          }
        } else if (historyMonthFilter.startsWith("mrange_")) {
          const parts = historyMonthFilter.split("_");
          const s = parseInt(parts[1], 10);
          const e = parseInt(parts[2], 10);
          if (item.month !== undefined && !isNaN(item.month)) {
            monthMatch = item.month >= Math.min(s, e) && item.month <= Math.max(s, e);
          } else if (item.date) {
            const partsD = item.date.split(/[-/]/);
            if (partsD.length >= 2) {
              const m = parseInt(partsD[1], 10) - 1;
              monthMatch = m >= Math.min(s, e) && m <= Math.max(s, e);
            }
          }
        } else if (historyMonthFilter.startsWith("wrange_")) {
          const parts = historyMonthFilter.split("_");
          const sW = parseInt(parts[1], 10);
          const eW = parseInt(parts[2], 10);
          if (item.date) {
            const partsD = item.date.split(/[-/]/);
            if (partsD.length >= 3) {
              const m = parseInt(partsD[1], 10) - 1;
              const day = parseInt(partsD[2], 10);
              const wInM = Math.min(3, Math.floor((day - 1) / 7));
              const wIdx = m * 4 + wInM;
              monthMatch = wIdx >= Math.min(sW, eW) && wIdx <= Math.max(sW, eW);
            }
          }
        } else if (historyMonthFilter.startsWith("w_")) {
          const parts = historyMonthFilter.split("_");
          const targetW = parseInt(parts[1], 10);
          if (item.date) {
            const partsD = item.date.split(/[-/]/);
            if (partsD.length >= 3) {
              const m = parseInt(partsD[1], 10) - 1;
              const day = parseInt(partsD[2], 10);
              const wInM = Math.min(3, Math.floor((day - 1) / 7));
              const wIdx = m * 4 + wInM;
              monthMatch = wIdx === targetW;
            }
          }
        } else if (historyMonthFilter.includes("-")) {
          const [s, e] = historyMonthFilter.split("-").map(Number);
          if (item.month !== undefined && !isNaN(item.month)) {
            monthMatch = item.month >= s && item.month <= e;
          }
        } else {
          const parsedM = parseInt(historyMonthFilter, 10);
          if (!isNaN(parsedM)) {
            if (item.month !== undefined && !isNaN(item.month)) {
              monthMatch = item.month === parsedM;
            } else if (item.date) {
              const partsD = item.date.split(/[-/]/);
              if (partsD.length >= 2) {
                monthMatch = parseInt(partsD[1], 10) - 1 === parsedM;
              }
            }
          }
        }
      }

      // 2. Modern Team Filter (MultiSelectDropdown support)
      let teamMatch = true;
      if (historyTeamFilter && historyTeamFilter !== "all") {
        if (Array.isArray(historyTeamFilter)) {
          if (historyTeamFilter.length > 0 && !historyTeamFilter.includes("all") && !historyTeamFilter.includes("Todos")) {
            teamMatch = item.winnerTeamName ? historyTeamFilter.includes(item.winnerTeamName) : false;
          }
        } else {
          teamMatch = item.winnerTeamName === historyTeamFilter;
        }
      }

      // 3. Search Filter
      let searchMatch = true;
      if (winsHistorySearch && typeof winsHistorySearch === "string" && winsHistorySearch.trim() !== "") {
        const q = winsHistorySearch.trim().toLowerCase();
        searchMatch =
          Boolean(item.race && item.race.toLowerCase().includes(q)) ||
          Boolean(item.winnerTeamName && item.winnerTeamName.toLowerCase().includes(q)) ||
          Boolean(item.winnerDisplayName && item.winnerDisplayName.toLowerCase().includes(q));
      }

      return monthMatch && teamMatch && searchMatch;
    });

    filtered.sort((a: any, b: any) => {
      let valA: any, valB: any;
      switch (historySortColumn) {
        case "fecha": {
          const parseDate = (d: string) => {
            if (!d) return 0;
            const parsedStr = parseSafeDateStr(d);
            const parts = parsedStr.split(/[-/]/);
            if (parts.length >= 2) {
              if (parts.length === 3 && parts[0].length === 4) {
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getTime();
              } else if (parts.length === 3) {
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
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

      if (typeof valA === "string" && typeof valB === "string") {
        return historySortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (valA < valB) return historySortDirection === "asc" ? -1 : 1;
      if (valA > valB) return historySortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [uniqueRaces, raceWinners, filteredLeaderboard, files?.carreras?.data, historyMonthFilter, historyTeamFilter, historySortColumn, historySortDirection, winsHistorySearch]);

  const availableDateRange = useMemo(() => {
    let minDate = "";
    let maxDate = "";
    files?.carreras?.data?.forEach((r: any) => {
      const f = getVal(r, "Fecha");
      if (f) {
        const parsed = parseSafeDateStr(f);
        if (parsed && parsed.length === 10) {
          if (!minDate || parsed < minDate) minDate = parsed;
          if (!maxDate || parsed > maxDate) maxDate = parsed;
        }
      }
    });
    return minDate && maxDate ? { minDate, maxDate } : undefined;
  }, [files?.carreras?.data]);

  return {
    teamColors,
    teamWinsRankingData,
    monthlyWinsEvolutionData,
    filteredHistoryRaces,
    availableDateRange,
  };
}
