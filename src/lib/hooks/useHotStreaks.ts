import { useMemo } from 'react';
import { getVal } from '../data-processing';

export function useHotStreaks(
  files: any, 
  cyclistMetadata: any, 
  playerTeamMap: Record<string, string>, 
  playerOrderMap: Record<string, string>, 
  cyclistRoundMap: Record<string, string>,
  hotStreakLastNWeeks: number,
  hotStreakMinPoints: number | "",
  hotStreakMaxPoints: number | "",
  limit?: number
) {
  return useMemo(() => {
    if (!files.carreras?.data || !files.resultados?.data) return { items: [], totalActiveWeeks: 0 };

    const getISOWeekString = (date: Date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
      return `${d.getUTCFullYear()}-W${week.toString().padStart(2, '0')}`;
    };

    const raceWeeks: Record<string, string> = {};
    const weeksWithResults = new Set<string>();

    files.carreras.data.forEach((r: any) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const fechaFin = getVal(r, "Fecha");
      if (carreraName && fechaFin) {
        const parts = fechaFin.toString().split(/[-/]/);
        let dateObj;
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          } else {
            dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
          if (dateObj && !isNaN(dateObj.getTime())) {
             raceWeeks[carreraName] = getISOWeekString(dateObj);
          }
        }
      }
    });

    const cyclistToJugador: Record<string, string> = {};
    if (files.elecciones?.data) {
       files.elecciones.data.forEach((row: any) => {
         const c = (row["Ciclista"] || "").toString().trim();
         const j = (row["Jugador"] || row["Nombre_TG"] || "").toString().trim();
         if (c && j && j !== "No draft" && j !== "Libre") {
           cyclistToJugador[c] = j;
         }
       });
    }

    const weeklyPoints: Record<string, Record<string, number>> = {};

    Object.entries(cyclistMetadata || {}).forEach(([ciclista, meta]: [string, any]) => {
      if (!weeklyPoints[ciclista]) weeklyPoints[ciclista] = {};
      
      const jugador = cyclistToJugador[ciclista];
      const team = jugador ? (playerTeamMap[jugador] || jugador) : null;
      if (!team) return; // ONLY CONSIDER CYCLISTS WITH TEAM per the requirement

      if (meta.puntosPorCarrera) {
        Object.entries(meta.puntosPorCarrera).forEach(([race, pts]) => {
          const points = pts as number;
          if (points > 0) {
             const w = raceWeeks[race];
             if (w) {
               weeklyPoints[ciclista][w] = (weeklyPoints[ciclista][w] || 0) + points;
               weeksWithResults.add(w);
             }
          }
        });
      }
    });

    const sortedActiveWeeks = Array.from(weeksWithResults).sort();
    const recentWeeks = hotStreakLastNWeeks > 0 ? sortedActiveWeeks.slice(-hotStreakLastNWeeks) : sortedActiveWeeks;

    const streaks = Object.entries(weeklyPoints).filter(([name]) => cyclistToJugador[name]).map(([name, wMap]) => {
      const ronda = cyclistRoundMap[name] || "0";
      const jugador = cyclistToJugador[name];
      const team = jugador ? (playerTeamMap[jugador] || jugador) : "?";
      const order = playerOrderMap[jugador] || "?";
      const pointsPerWeek = recentWeeks.map(w => wMap[w] || 0);
      return {
        name: `${name} <${ronda.toString().padStart(2, '0')}>`,
        team: `${team} [#${order}]`,
        pointsInPeriod: pointsPerWeek.reduce((a, b) => a + b, 0),
        pointsPerWeek,
        originalName: name
      };
    });

    const minP = typeof hotStreakMinPoints === "number" ? hotStreakMinPoints : -Infinity;
    const maxP = typeof hotStreakMaxPoints === "number" ? hotStreakMaxPoints : Infinity;

    const filtered = streaks.filter(x => x.pointsInPeriod >= minP && x.pointsInPeriod <= maxP);
    filtered.sort((a,b) => b.pointsInPeriod - a.pointsInPeriod);

    return { 
      items: limit ? filtered.slice(0, limit) : filtered, 
      totalActiveWeeks: recentWeeks.length 
    };
  }, [files, cyclistMetadata, playerTeamMap, hotStreakMinPoints, hotStreakMaxPoints, limit, hotStreakLastNWeeks, playerOrderMap, cyclistRoundMap]);
}

export function useHotStreaksTeams(
  files: any, 
  cyclistMetadata: any, 
  playerTeamMap: Record<string, string>, 
  playerOrderMap: Record<string, string>, 
  hotStreakLastNWeeks: number,
  hotStreakMinPoints: number | "",
  hotStreakMaxPoints: number | ""
) {
  return useMemo(() => {
    if (!files.carreras?.data || !files.resultados?.data) return { items: [], totalActiveWeeks: 0 };

    const getISOWeekString = (date: Date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
      return `${d.getUTCFullYear()}-W${week.toString().padStart(2, '0')}`;
    };

    const raceWeeks: Record<string, string> = {};
    const weeksWithResults = new Set<string>();

    files.carreras.data.forEach((r: any) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const fechaFin = getVal(r, "Fecha");
      if (carreraName && fechaFin) {
        const parts = fechaFin.toString().split(/[-/]/);
        let dateObj;
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          } else {
            dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
          if (dateObj && !isNaN(dateObj.getTime())) {
             raceWeeks[carreraName] = getISOWeekString(dateObj);
          }
        }
      }
    });

    const cyclistToJugador: Record<string, string> = {};
    if (files.elecciones?.data) {
       files.elecciones.data.forEach((row: any) => {
         const c = (row["Ciclista"] || "").toString().trim();
         const j = (row["Jugador"] || row["Nombre_TG"] || "").toString().trim();
         if (c && j && j !== "No draft" && j !== "Libre") {
           cyclistToJugador[c] = j;
         }
       });
    }

    const teamWeeklyPoints: Record<string, Record<string, number>> = {};
    const teamToJugador: Record<string, string> = {};

    Object.entries(cyclistMetadata || {}).forEach(([ciclista, meta]: [string, any]) => {
      const jugador = cyclistToJugador[ciclista];
      const team = jugador ? (playerTeamMap[jugador] || jugador) : null;
      if (team) {
         if (!teamWeeklyPoints[team]) teamWeeklyPoints[team] = {};
         teamToJugador[team] = jugador;
      }

      if (meta.puntosPorCarrera && team) {
        Object.entries(meta.puntosPorCarrera).forEach(([race, pts]) => {
          const points = pts as number;
          if (points > 0) {
             const w = raceWeeks[race];
             if (w) {
               weeksWithResults.add(w);
               teamWeeklyPoints[team][w] = (teamWeeklyPoints[team][w] || 0) + points;
             }
          }
        });
      }
    });

    const sortedActiveWeeks = Array.from(weeksWithResults).sort();
    const recentWeeks = hotStreakLastNWeeks > 0 ? sortedActiveWeeks.slice(-hotStreakLastNWeeks) : sortedActiveWeeks;

    const tStreaks = Object.entries(teamWeeklyPoints).map(([name, wMap]) => {
      const order = playerOrderMap[teamToJugador[name]] || "?";
      const pointsPerWeek = recentWeeks.map(w => wMap[w] || 0);
      return {
        name: `${name} [#${order}]`,
        pointsInPeriod: pointsPerWeek.reduce((a, b) => a + b, 0),
        pointsPerWeek,
        originalName: name
      };
    });

    const minP = typeof hotStreakMinPoints === "number" ? hotStreakMinPoints : -Infinity;
    const maxP = typeof hotStreakMaxPoints === "number" ? hotStreakMaxPoints : Infinity;

    const filteredTeams = tStreaks.filter(x => x.pointsInPeriod >= minP && x.pointsInPeriod <= maxP);
    filteredTeams.sort((a,b) => b.pointsInPeriod - a.pointsInPeriod);

    return { 
      items: filteredTeams.slice(0, 20),
      totalActiveWeeks: recentWeeks.length 
    };
  }, [files, cyclistMetadata, playerTeamMap, hotStreakMinPoints, hotStreakMaxPoints, hotStreakLastNWeeks, playerOrderMap]);
}
