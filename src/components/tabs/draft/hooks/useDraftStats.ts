import { useMemo } from 'react';
import { getVal } from '../../../../lib/data-processing';

export interface DraftStatsParams {
  files: any;
  leaderboard: any;
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
      if (carrera && categoria) raceTypeByName[carrera] = categoria;
      if (carrera && fecha) raceDateByName[carrera] = fecha;
    });

    leaderboard?.forEach((player: any) => {
      player?.detalles?.forEach((d: any) => {
        const dateStr = raceDateByName[d.carrera] || d.fecha;
        if (dateStr) {
          const monthStr = dateStr.split("/")[1];
          if (monthStr) {
            const monthNames = [
              "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
            ];
            availableMonths.add(monthNames[parseInt(monthStr, 10) - 1]);
          }
        }
        const cat = raceTypeByName[d.carrera];
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
        const dateStr = raceDateByName[d.carrera] || d.fecha;
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
          const cat = raceTypeByName[d.carrera];
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

      files.elecciones.data.forEach((row: any) => {
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
           malosPicks: 0,
           sinPuntuar: 0,
           totalPoints: teamTotals[t] || 0,
           totalPicks: 0
         };
      }

      files.elecciones.data.forEach((row: any) => {
         const teamName = String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG") || "");
         if (!validTeams.has(teamName)) return;
         
         const ciclista = getVal(row, "Ciclista") as string;
         const pts = cyclistPoints[ciclista] || 0;
         const summary = teamSummariesObj[teamName];
         summary.totalPicks++;
         if (pts >= 1500) summary.pickGanador++;
         else if (pts >= 600) summary.buenosPicks++;
         else if (pts > 0) summary.malosPicks++;
         else summary.sinPuntuar++;
      });

      const teamSummaries = Object.values(teamSummariesObj).map((t: any) => ({
        ...t,
        pctGanadores: t.totalPicks > 0 ? (t.pickGanador / t.totalPicks) * 100 : 0,
        pctBuenos: t.totalPicks > 0 ? (t.buenosPicks / t.totalPicks) * 100 : 0,
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
