import { AppState, PlayerScore } from '../../../../lib/types';
import { useMemo } from 'react';
import { getVal, normalizeRaceName, isSameRace } from '../../../../lib/data-processing';

export interface DraftStatsParams {
  files: AppState;
  leaderboard: PlayerScore[];
  draftDatosMonthFilter: string[];
  draftDatosCategoryFilter: string[];
  draftDatosTeamFilter: string[];
}

export function useDraftStats({
  files,
  leaderboard,
  draftDatosMonthFilter,
  draftDatosCategoryFilter,
  draftDatosTeamFilter,
}: DraftStatsParams) {
  return useMemo(() => {
    const raceTypeByName: Record<string, string> = {};
    const raceDateByName: Record<string, string> = {};
    const availableMonths = new Set<string>();
    const availableCategories = new Set<string>();
    const availableTeams = new Set<string>();

    files?.carreras?.data?.forEach((row: any) => {
      const carrera = getVal(row, "Carrera")?.trim();
      const categoria = getVal(row, "Categoría")?.trim();
      const fecha = getVal(row, "Fecha")?.trim();
      if (carrera) {
        const canonicalKey = normalizeRaceName(carrera);
        if (categoria) {
          raceTypeByName[carrera] = categoria;
          raceTypeByName[canonicalKey] = categoria;
        }
        if (fecha) {
          raceDateByName[carrera] = fecha;
          raceDateByName[canonicalKey] = fecha;
        }
      }
    });

    const getRaceCat = (carrera: string) => {
      if (!carrera) return "";
      return raceTypeByName[carrera] || raceTypeByName[normalizeRaceName(carrera)] || "";
    };

    const getRaceDate = (carrera: string) => {
      if (!carrera) return "";
      return raceDateByName[carrera] || raceDateByName[normalizeRaceName(carrera)] || "";
    };

    leaderboard?.forEach((player: any) => {
      player?.detalles?.forEach((d: any) => {
        const dateStr = getRaceDate(d.carrera) || d.fecha;
        if (dateStr) {
          const monthStr = dateStr.split("/")[1];
          if (monthStr) {
            const monthNames = [
              "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
            ];
            availableMonths.add(monthNames[parseInt(monthStr, 10) - 1]);
          }
        }
        const cat = getRaceCat(d.carrera);
        if (cat) availableCategories.add(cat);
      });
    });

    files?.elecciones?.data?.forEach((row: any) => {
      const teamName = getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG");
      if (teamName) availableTeams.add(teamName as string);
    });

    const cyclistPoints: Record<string, number> = {};
    leaderboard?.forEach((player: any) => {
      player?.detalles?.forEach((d: any) => {
        const dateStr = getRaceDate(d.carrera) || d.fecha;
        let matchesMonth = true;
        if (draftDatosMonthFilter.length > 0) {
          if (!dateStr) matchesMonth = false;
          else {
            const monthStr = dateStr.split("/")[1];
            if (monthStr) {
              const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
              const mName = monthNames[parseInt(monthStr, 10) - 1];
              if (!draftDatosMonthFilter.includes(mName)) matchesMonth = false;
            } else {
              matchesMonth = false;
            }
          }
        }

        let matchesCategory = true;
        if (draftDatosCategoryFilter.length > 0) {
          const cat = getRaceCat(d.carrera);
          if (!cat || !draftDatosCategoryFilter.includes(cat)) matchesCategory = false;
        }

        if (matchesMonth && matchesCategory) {
          cyclistPoints[d.ciclista] = (cyclistPoints[d.ciclista] || 0) + (d.puntosObtenidos || 0);
        }
      });
    });

    const draftData: any[] = [];
    if (files?.elecciones?.data) {
      const teamTotals: Record<string, number> = {};
      const teamRounds: Record<string, Record<string, number>> = {};
      const roundTotals: Record<string, number> = {};
      const validTeams = new Set<string>();

      files?.elecciones?.data.forEach((row: any) => {
        const teamName = String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG") || "");
        if (draftDatosTeamFilter.length > 0 && !draftDatosTeamFilter.includes(teamName)) return;

        validTeams.add(teamName);
        const ciclista = getVal(row, "Ciclista") as string;
        const pts = cyclistPoints[ciclista] || 0;
        const rStr = String(getVal(row, "Ronda"));
        const ronda = rStr.padStart(2, "0");

        teamTotals[teamName] = (teamTotals[teamName] || 0) + pts;
        if (!teamRounds[teamName]) teamRounds[teamName] = {};
        teamRounds[teamName][ronda] = (teamRounds[teamName][ronda] || 0) + pts;
        roundTotals[ronda] = (roundTotals[ronda] || 0) + pts;
      });

      const maxTeamScore = Math.max(...Object.values(teamTotals), 0);
      const allRounds = Array.from(new Set(Object.keys(roundTotals))).sort();

      for (const t of validTeams) {
        draftData.push({
          equipo: t,
          total: teamTotals[t] || 0,
          pointsByRound: teamRounds[t] || {},
          maxScore: maxTeamScore
        });
      }
      draftData.sort((a, b) => b.total - a.total);

      let teamSummariesObj: Record<string, any> = {};
      for (const t of validTeams) {
         teamSummariesObj[t] = {
           team: t,
           pickGanador: 0,
           buenosPicks: 0,
           normalesPicks: 0,
           malosPicks: 0,
           sinPuntuar: 0,
           totalPoints: teamTotals[t] || 0,
           totalPicks: 0
         };
      }

      const picksByRound: Record<string, { equipo: string, ciclista: string, pts: number }[]> = {};

      files?.elecciones?.data.forEach((row: any) => {
         const teamName = String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG") || "");
         if (!validTeams.has(teamName)) return;
         
         const ciclista = getVal(row, "Ciclista") as string;
         const pts = cyclistPoints[ciclista] || 0;
         const rStr = String(getVal(row, "Ronda"));
         const ronda = rStr.padStart(2, "0");
         
         if (!picksByRound[ronda]) picksByRound[ronda] = [];
         picksByRound[ronda].push({ equipo: teamName, ciclista, pts });
      });

      for (const ronda in picksByRound) {
        const picks = picksByRound[ronda];
        picks.sort((a, b) => b.pts - a.pts);
        
        let currentRank = 1;
        picks.forEach((p, index) => {
          if (index > 0 && p.pts < picks[index - 1].pts) {
            currentRank = index + 1;
          }
          const summary = teamSummariesObj[p.equipo];
          summary.totalPicks++;
          
          if (p.pts === 0) {
             summary.sinPuntuar++;
          } else {
             if (currentRank === 1) summary.pickGanador++;
             else if (currentRank <= 5) summary.buenosPicks++;
             else if (currentRank <= 14) summary.normalesPicks++;
             else summary.malosPicks++;
          }
        });
      }

      const teamSummaries = Object.values(teamSummariesObj).map((t: any) => ({
        ...t,
        pctGanadores: t.totalPicks > 0 ? (t.pickGanador / t.totalPicks) * 100 : 0,
        pctBuenos: t.totalPicks > 0 ? (t.buenosPicks / t.totalPicks) * 100 : 0,
        pctNormales: t.totalPicks > 0 ? (t.normalesPicks / t.totalPicks) * 100 : 0,
        pctMalos: t.totalPicks > 0 ? (t.malosPicks / t.totalPicks) * 100 : 0,
        pctSinPuntuar: t.totalPicks > 0 ? (t.sinPuntuar / t.totalPicks) * 100 : 0,
      }));

      return {
        availableMonths: Array.from(availableMonths).sort((a, b) => a.localeCompare(b)),
        availableCategories: Array.from(availableCategories).sort((a, b) => a.localeCompare(b)),
        availableTeams: Array.from(availableTeams).sort((a, b) => a.localeCompare(b)),
        draftData,
        allRounds,
        teamSummaries,
      };
    }

    return {
      availableMonths: Array.from(availableMonths).sort((a, b) => a.localeCompare(b)),
      availableCategories: Array.from(availableCategories).sort((a, b) => a.localeCompare(b)),
      availableTeams: Array.from(availableTeams).sort((a, b) => a.localeCompare(b)),
      draftData: [],
      allRounds: [],
      teamSummaries: [],
    };
  }, [files, leaderboard, draftDatosMonthFilter, draftDatosCategoryFilter, draftDatosTeamFilter]);
}
