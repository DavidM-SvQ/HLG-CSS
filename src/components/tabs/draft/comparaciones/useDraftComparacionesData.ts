import { useMemo } from "react";
import { AppState, PlayerScore, CyclistMetadata } from "../../../../lib/types";
import { getVal } from "../../../../lib/data-processing";
import {
  AvailableTeam,
  TeamSummary,
  RoundRankInfo,
  RoundComparisonItem,
  RadarItem,
  MonthlyComparisonItem,
  CategoryComparisonItem,
  DraftTierItem,
  MvpItem,
  monthsShortNames,
  monthsFullNames,
  getMonthIndexFromDateStr,
  normalizeCategoryName,
  getCategoryOrderRank,
} from "./types";

export interface UseDraftComparacionesDataProps {
  files: AppState;
  leaderboard: PlayerScore[];
  cyclistMetadata?: Record<string, CyclistMetadata>;
  teamA: string;
  teamB: string;
}

export function useDraftComparacionesData({
  files,
  leaderboard,
  cyclistMetadata,
  teamA,
  teamB,
}: UseDraftComparacionesDataProps) {
  // Extract all team/player names from leaderboard
  const availableTeams: AvailableTeam[] = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return [];
    return leaderboard
      .filter((p) => p.jugador !== "No draft" && p.nombreEquipo !== "No draft")
      .map((p) => ({
        name: p.nombreEquipo || p.jugador,
        jugador: p.jugador,
        puntos: p.puntos || 0,
        orden: p.orden || "-",
      }));
  }, [leaderboard]);

  // Compute total points gained by each cyclist across the entire league
  const cyclistTotalPoints = useMemo(() => {
    if (cyclistMetadata && Object.keys(cyclistMetadata).length > 0) {
      const map: Record<string, number> = {};
      for (const [name, meta] of Object.entries(cyclistMetadata)) {
        map[name] = meta.puntosTotales || 0;
      }
      return map;
    }
    const map: Record<string, number> = {};
    leaderboard?.forEach((player) => {
      player.detalles?.forEach((d: any) => {
        if (d.ciclista) {
          map[d.ciclista] = (map[d.ciclista] || 0) + (d.puntosObtenidos || 0);
        }
      });
    });
    return map;
  }, [cyclistMetadata, leaderboard]);

  // Compute round ranks for ALL draft picks in each round across all teams in the league
  const roundPicksMap = useMemo(() => {
    if (!files?.elecciones?.data) return {};

    const byRound: Record<string, { ciclista: string; pts: number }[]> = {};

    files.elecciones.data.forEach((row: any) => {
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      let rStr = String(getVal(row, "Ronda") || "").trim();
      if (!rStr) rStr = "1";
      const ronda = rStr.padStart(2, "0");

      if (ciclista) {
        if (!byRound[ronda]) byRound[ronda] = [];
        const pts = cyclistTotalPoints[ciclista] || 0;
        byRound[ronda].push({ ciclista, pts });
      }
    });

    const rankMap: Record<string, RoundRankInfo> = {};

    Object.entries(byRound).forEach(([ronda, cyclists]) => {
      const sorted = [...cyclists].sort((a, b) => b.pts - a.pts);
      const totalInRound = sorted.length;
      const maxPts = sorted[0]?.pts || 0;
      const minPts = sorted[sorted.length - 1]?.pts || 0;

      sorted.forEach((item, index) => {
        const rank = index + 1;
        const isBest = item.pts === maxPts && maxPts > 0;
        const isWorst = item.pts === minPts && totalInRound > 1;

        rankMap[`${ronda}_${item.ciclista}`] = {
          rank,
          totalInRound,
          isBest,
          isWorst,
          maxPtsInRound: maxPts,
        };
      });
    });

    return rankMap;
  }, [files?.elecciones?.data, cyclistTotalPoints]);

  // Build round-by-round comparison data for teamA and teamB
  const comparisonData = useMemo(() => {
    if (!files?.elecciones?.data || !teamA || !teamB) {
      return {
        rounds: [] as RoundComparisonItem[],
        summaryA: null as TeamSummary | null,
        summaryB: null as TeamSummary | null,
        roundsWonA: 0,
        roundsWonB: 0,
        ties: 0,
        finalCumulativeDiff: 0,
      };
    }

    const picksA: Record<string, { ciclista: string; puntos: number; eleccion: number }> = {};
    const picksB: Record<string, { ciclista: string; puntos: number; eleccion: number }> = {};
    const roundSet = new Set<string>();

    files.elecciones.data.forEach((row: any, idx: number) => {
      const teamName = String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG") || "").trim();
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      let rStr = String(getVal(row, "Ronda") || "").trim();
      if (!rStr) rStr = "1";
      const ronda = rStr.padStart(2, "0");

      if (teamName && ciclista) {
        roundSet.add(ronda);
        const pts = cyclistTotalPoints[ciclista] || 0;

        if (teamName === teamA) {
          picksA[ronda] = { ciclista, puntos: pts, eleccion: idx + 1 };
        }
        if (teamName === teamB) {
          picksB[ronda] = { ciclista, puntos: pts, eleccion: idx + 1 };
        }
      }
    });

    const roundList = Array.from(roundSet).sort((a, b) => a.localeCompare(b));

    let cumulativeDiff = 0;
    let roundsWonA = 0;
    let roundsWonB = 0;
    let ties = 0;

    const rounds: RoundComparisonItem[] = roundList.map((ronda) => {
      const pickA = picksA[ronda] || { ciclista: "-", puntos: 0, eleccion: 0 };
      const pickB = picksB[ronda] || { ciclista: "-", puntos: 0, eleccion: 0 };

      const diffRound = pickA.puntos - pickB.puntos;
      cumulativeDiff += diffRound;

      if (diffRound > 0) roundsWonA++;
      else if (diffRound < 0) roundsWonB++;
      else ties++;

      return {
        ronda,
        pickA,
        pickB,
        diffRound,
        cumulativeDiff,
        winner: diffRound > 0 ? "A" : diffRound < 0 ? "B" : "TIE",
        cumulativeLeader: cumulativeDiff > 0 ? "A" : cumulativeDiff < 0 ? "B" : "TIE",
      };
    });

    const infoA = availableTeams.find((t) => t.name === teamA);
    const infoB = availableTeams.find((t) => t.name === teamB);

    const totalPtsA = rounds.reduce((sum, r) => sum + r.pickA.puntos, 0);
    const totalPtsB = rounds.reduce((sum, r) => sum + r.pickB.puntos, 0);

    const summaryA: TeamSummary | null = infoA
      ? { ...infoA, totalPts: totalPtsA }
      : null;
    const summaryB: TeamSummary | null = infoB
      ? { ...infoB, totalPts: totalPtsB }
      : null;

    return {
      rounds,
      summaryA,
      summaryB,
      roundsWonA,
      roundsWonB,
      ties,
      finalCumulativeDiff: cumulativeDiff,
    };
  }, [files, teamA, teamB, availableTeams, cyclistTotalPoints]);

  // Compute radar chart data for comparing the 20 picks (scaled 0-100% per round)
  const radarData: RadarItem[] = useMemo(() => {
    if (!comparisonData?.rounds || comparisonData.rounds.length === 0) return [];
    return comparisonData.rounds.map((r) => {
      const infoA = roundPicksMap[`${r.ronda}_${r.pickA.ciclista}`];
      const infoB = roundPicksMap[`${r.ronda}_${r.pickB.ciclista}`];
      const maxPtsInRound =
        infoA?.maxPtsInRound ?? infoB?.maxPtsInRound ?? Math.max(r.pickA.puntos, r.pickB.puntos, 1);

      const valA = maxPtsInRound > 0 ? Math.round((r.pickA.puntos / maxPtsInRound) * 1000) / 10 : 0;
      const valB = maxPtsInRound > 0 ? Math.round((r.pickB.puntos / maxPtsInRound) * 1000) / 10 : 0;

      return {
        ronda: r.ronda,
        roundLabel: `R${parseInt(r.ronda, 10)}`,
        fullLabel: `Ronda ${r.ronda}`,
        cyclistA: r.pickA.ciclista,
        ptsA: r.pickA.puntos,
        valA,
        rankA: infoA?.rank || 0,
        totalInRoundA: infoA?.totalInRound || 1,

        cyclistB: r.pickB.ciclista,
        ptsB: r.pickB.puntos,
        valB,
        rankB: infoB?.rank || 0,
        totalInRoundB: infoB?.totalInRound || 1,

        maxPtsInRound,
      };
    });
  }, [comparisonData, roundPicksMap]);

  // Compute monthly data
  const monthlyData = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0)
      return {
        monthlyChartData: [] as MonthlyComparisonItem[],
        activeMonthsCount: 0,
        totalTeamsInLeague: 1,
      };

    const allTeams = leaderboard.filter((t) => t.jugador !== "No draft" && t.nombreEquipo !== "No draft");
    const teamCount = allTeams.length || 1;

    const monthlyPtsByTeam: Record<string, number[]> = {};
    allTeams.forEach((t) => {
      const tName = t.nombreEquipo || t.jugador;
      monthlyPtsByTeam[tName] = new Array(12).fill(0);
      t.detalles?.forEach((d) => {
        const mIdx = getMonthIndexFromDateStr(d.fecha);
        if (mIdx >= 0 && mIdx < 12) {
          monthlyPtsByTeam[tName][mIdx] += (d.puntosObtenidos || 0);
        }
      });
    });

    let maxMonthWithPoints = 0;
    allTeams.forEach((t) => {
      const tName = t.nombreEquipo || t.jugador;
      const ptsArr = monthlyPtsByTeam[tName];
      ptsArr.forEach((pts, mIdx) => {
        if (pts > 0 && mIdx > maxMonthWithPoints) {
          maxMonthWithPoints = mIdx;
        }
      });
    });

    const currentMonth = new Date().getMonth();
    const endMonthIdx = Math.max(maxMonthWithPoints, Math.min(currentMonth, 11));

    const cumPtsTracker: Record<string, number> = {};
    allTeams.forEach((t) => {
      cumPtsTracker[t.nombreEquipo || t.jugador] = 0;
    });

    const monthlyChartData: MonthlyComparisonItem[] = [];

    for (let m = 0; m <= endMonthIdx; m++) {
      // 1. Single month points & ranking
      const singleMonthScores = allTeams
        .map((t) => {
          const tName = t.nombreEquipo || t.jugador;
          return { tName, pts: monthlyPtsByTeam[tName][m] };
        })
        .sort((a, b) => b.pts - a.pts);

      const singleMonthRankMap: Record<string, number> = {};
      singleMonthScores.forEach((item, idx) => {
        singleMonthRankMap[item.tName] = idx + 1;
      });

      // 2. Cumulative points & ranking
      allTeams.forEach((t) => {
        const tName = t.nombreEquipo || t.jugador;
        cumPtsTracker[tName] += monthlyPtsByTeam[tName][m];
      });

      const cumScores = allTeams
        .map((t) => {
          const tName = t.nombreEquipo || t.jugador;
          return { tName, pts: cumPtsTracker[tName] };
        })
        .sort((a, b) => b.pts - a.pts);

      const cumRankMap: Record<string, number> = {};
      cumScores.forEach((item, idx) => {
        cumRankMap[item.tName] = idx + 1;
      });

      const ptsA_Month = teamA ? (monthlyPtsByTeam[teamA]?.[m] || 0) : 0;
      const ptsB_Month = teamB ? (monthlyPtsByTeam[teamB]?.[m] || 0) : 0;

      const singleMonthRankA = teamA ? (singleMonthRankMap[teamA] || teamCount) : 0;
      const singleMonthRankB = teamB ? (singleMonthRankMap[teamB] || teamCount) : 0;

      const cumA = teamA ? cumPtsTracker[teamA] || 0 : 0;
      const cumB = teamB ? cumPtsTracker[teamB] || 0 : 0;

      const rankA = teamA ? (cumRankMap[teamA] || teamCount) : 0;
      const rankB = teamB ? (cumRankMap[teamB] || teamCount) : 0;

      monthlyChartData.push({
        monthIndex: m,
        month: monthsShortNames[m],
        monthFull: monthsFullNames[m],
        teamAPtsMonth: ptsA_Month,
        teamBPtsMonth: ptsB_Month,
        singleMonthRankA,
        singleMonthRankB,
        diffMonth: ptsA_Month - ptsB_Month,
        teamACum: cumA,
        teamBCum: cumB,
        teamARank: rankA,
        teamBRank: rankB,
        diffCum: cumA - cumB,
        winnerMonth: ptsA_Month > ptsB_Month ? "A" : ptsB_Month > ptsA_Month ? "B" : "TIE",
      });
    }

    return { monthlyChartData, activeMonthsCount: endMonthIdx + 1, totalTeamsInLeague: teamCount };
  }, [leaderboard, teamA, teamB]);

  // Compute breakdown by race category
  const categoryComparisonData = useMemo(() => {
    if (!teamA || !teamB || !leaderboard)
      return {
        categories: [] as CategoryComparisonItem[],
        totalA: 0,
        totalB: 0,
        totalTeamsInLeague: 1,
      };

    const allTeams = leaderboard.filter((t) => t.jugador !== "No draft" && t.nombreEquipo !== "No draft");
    const totalTeamsInLeague = allTeams.length || 1;

    // Build race to category mapping with alias normalization
    const raceToCat: Record<string, string> = {};

    const processCatRow = (r: any) => {
      const c = getVal(r, "Carrera")?.trim();
      const rawCat = getVal(r, "Categoría")?.trim();
      if (c && rawCat) {
        const cat = normalizeCategoryName(rawCat);
        raceToCat[c] = cat;
        raceToCat[c.toLowerCase()] = cat;
      }
    };

    if (files?.carreras?.data) {
      files.carreras.data.forEach(processCatRow);
    }
    if (files?.puntos?.data) {
      files.puntos.data.forEach(processCatRow);
    }

    // Calculate points in each category for ALL teams in the league
    const teamCatPtsMap: Record<string, Record<string, number>> = {};
    const teamCatRacesMap: Record<string, Record<string, Set<string>>> = {};

    allTeams.forEach((t) => {
      const tName = t.nombreEquipo || t.jugador;
      teamCatPtsMap[tName] = {};
      teamCatRacesMap[tName] = {};

      t.detalles?.forEach((d: any) => {
        const raceName = d.carrera;
        const rawCat = raceToCat[raceName] || raceToCat[raceName?.toLowerCase()] || "Otras / Sin Categoría";
        const cat = normalizeCategoryName(rawCat);

        if (!teamCatPtsMap[tName][cat]) teamCatPtsMap[tName][cat] = 0;
        teamCatPtsMap[tName][cat] += (d.puntosObtenidos || 0);

        if (!teamCatRacesMap[tName][cat]) teamCatRacesMap[tName][cat] = new Set();
        if (raceName) teamCatRacesMap[tName][cat].add(raceName);
      });
    });

    const activeCategories = new Set<string>();
    Object.values(teamCatPtsMap).forEach((catPts) => {
      Object.entries(catPts).forEach(([cat, pts]) => {
        if (pts > 0) activeCategories.add(cat);
      });
    });

    const teamAPlayer = leaderboard.find((p) => (p.nombreEquipo || p.jugador) === teamA);
    const teamBPlayer = leaderboard.find((p) => (p.nombreEquipo || p.jugador) === teamB);

    const totalA = teamAPlayer?.puntos || 1;
    const totalB = teamBPlayer?.puntos || 1;

    const categories: CategoryComparisonItem[] = Array.from(activeCategories)
      .map((cat) => {
        const sortedTeamsForCat = [...allTeams]
          .map((t) => {
            const tName = t.nombreEquipo || t.jugador;
            return { tName, pts: teamCatPtsMap[tName]?.[cat] || 0 };
          })
          .sort((a, b) => b.pts - a.pts);

        const catRankMap: Record<string, number> = {};
        sortedTeamsForCat.forEach((item, idx) => {
          catRankMap[item.tName] = idx + 1;
        });

        const ptsA = teamCatPtsMap[teamA]?.[cat] || 0;
        const ptsB = teamCatPtsMap[teamB]?.[cat] || 0;

        const rankA = catRankMap[teamA] || totalTeamsInLeague;
        const rankB = catRankMap[teamB] || totalTeamsInLeague;

        const racesCountA = teamCatRacesMap[teamA]?.[cat]?.size || 0;
        const racesCountB = teamCatRacesMap[teamB]?.[cat]?.size || 0;

        const diff = ptsA - ptsB;
        const pctA = Math.round((ptsA / totalA) * 100);
        const pctB = Math.round((ptsB / totalB) * 100);

        return {
          category: cat,
          ptsA,
          ptsB,
          rankA,
          rankB,
          pctA,
          pctB,
          diff,
          racesCountA,
          racesCountB,
          totalCategoryPts: ptsA + ptsB,
          winner: ptsA > ptsB ? ("A" as const) : ptsB > ptsA ? ("B" as const) : ("TIE" as const),
        };
      })
      .sort((a, b) => {
        const rankA = getCategoryOrderRank(a.category);
        const rankB = getCategoryOrderRank(b.category);
        if (rankA !== rankB) return rankA - rankB;
        return b.totalCategoryPts - a.totalCategoryPts;
      });

    return { categories, totalA, totalB, totalTeamsInLeague };
  }, [leaderboard, teamA, teamB, files]);

  // Draft Tiers Data
  const draftTiersData: DraftTierItem[] = useMemo(() => {
    if (!files?.elecciones?.data || !teamA || !teamB) return [];

    const tiers = [
      { name: "Primeras Espadas (Rondas 1-5)", minR: 1, maxR: 5 },
      { name: "Bloque Medio (Rondas 6-12)", minR: 6, maxR: 12 },
      { name: "Fondo de Armario (Rondas 13+)", minR: 13, maxR: 999 },
    ];

    const teamAPicks: { ronda: number; ciclista: string; pts: number }[] = [];
    const teamBPicks: { ronda: number; ciclista: string; pts: number }[] = [];

    files.elecciones.data.forEach((row: any) => {
      const tName = String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG") || "").trim();
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      const rNum = parseInt(String(getVal(row, "Ronda") || "1"), 10) || 1;
      const pts = cyclistTotalPoints[ciclista] || 0;

      if (tName === teamA && ciclista) {
        teamAPicks.push({ ronda: rNum, ciclista, pts });
      }
      if (tName === teamB && ciclista) {
        teamBPicks.push({ ronda: rNum, ciclista, pts });
      }
    });

    return tiers.map((tier) => {
      const picksA = teamAPicks.filter((p) => p.ronda >= tier.minR && p.ronda <= tier.maxR);
      const picksB = teamBPicks.filter((p) => p.ronda >= tier.minR && p.ronda <= tier.maxR);

      const ptsA = picksA.reduce((sum, p) => sum + p.pts, 0);
      const ptsB = picksB.reduce((sum, p) => sum + p.pts, 0);

      const countA = picksA.length || 1;
      const countB = picksB.length || 1;

      const avgA = Math.round(ptsA / countA);
      const avgB = Math.round(ptsB / countB);

      const bestPickA = [...picksA].sort((a, b) => b.pts - a.pts)[0];
      const bestPickB = [...picksB].sort((a, b) => b.pts - a.pts)[0];

      return {
        tierName: tier.name,
        ptsA,
        ptsB,
        countA: picksA.length,
        countB: picksB.length,
        avgA,
        avgB,
        diff: ptsA - ptsB,
        bestPickA: bestPickA ? `${bestPickA.ciclista} (${bestPickA.pts}p)` : "-",
        bestPickB: bestPickB ? `${bestPickB.ciclista} (${bestPickB.pts}p)` : "-",
        winner: ptsA > ptsB ? ("A" as const) : ptsB > ptsA ? ("B" as const) : ("TIE" as const),
      };
    });
  }, [files?.elecciones?.data, teamA, teamB, cyclistTotalPoints]);

  // Top 3 MVPs Data
  const mvpData = useMemo(() => {
    if (!files?.elecciones?.data || !teamA || !teamB)
      return { mvpA: [] as MvpItem[], mvpB: [] as MvpItem[] };

    const teamAPicks: { ciclista: string; pts: number; ronda: number }[] = [];
    const teamBPicks: { ciclista: string; pts: number; ronda: number }[] = [];

    files.elecciones.data.forEach((row: any) => {
      const tName = String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG") || "").trim();
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      const rNum = parseInt(String(getVal(row, "Ronda") || "1"), 10) || 1;
      const pts = cyclistTotalPoints[ciclista] || 0;

      if (tName === teamA && ciclista) {
        teamAPicks.push({ ciclista, pts, ronda: rNum });
      }
      if (tName === teamB && ciclista) {
        teamBPicks.push({ ciclista, pts, ronda: rNum });
      }
    });

    const mvpA = teamAPicks.sort((a, b) => b.pts - a.pts).slice(0, 3);
    const mvpB = teamBPicks.sort((a, b) => b.pts - a.pts).slice(0, 3);

    return { mvpA, mvpB };
  }, [files?.elecciones?.data, teamA, teamB, cyclistTotalPoints]);

  return {
    availableTeams,
    cyclistTotalPoints,
    roundPicksMap,
    comparisonData,
    radarData,
    monthlyData,
    categoryComparisonData,
    draftTiersData,
    mvpData,
  };
}
