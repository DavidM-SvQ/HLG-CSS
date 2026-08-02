import { useMemo } from 'react';
import { getVal } from '../../../../lib/data-processing';

export function useTestsViewData(
  files: any, 
  cyclistMetadata: any, 
  playerOrderMap: any, 
  playerTeamMap: any, 
  cyclistRoundMap: any,
  dependencyTopCount: number,
  teamA: string,
  teamB: string
) {

  const draftData = useMemo(() => {
    if (!files?.elecciones?.data) return [];
    
    const orderMap: Record<string, number> = {};
    let orderCounter = 1;
    
    try {
      files?.elecciones?.data.forEach((row: any) => {
        const ciclista = (row["Ciclista"] || "").toString().trim();
        if (ciclista) {
           orderMap[ciclista] = orderCounter++;
        }
      });
    } catch(e) {}
    
    const results = [];
    for (const [ciclista, pickOrder] of Object.entries(orderMap)) {
      const puntos = cyclistMetadata[ciclista]?.puntosTotales || 0;
      results.push({
        ciclista,
        pickOrder,
        puntos
      });
    }
    
    return results.sort((a,b) => a.pickOrder - b.pickOrder);
  }, [files?.elecciones?.data, cyclistMetadata]);

  const teamDependencyData = useMemo(() => {
    if (!files?.elecciones?.data) return [];
    
    const playerCyclists: Record<string, { ciclista: string, puntos: number, ronda: string }[]> = {};
    
    files?.elecciones?.data.forEach((row: any) => {
      const ciclista = (row["Ciclista"] || "").toString().trim();
      const jugador = (row["Jugador"] || row["Nombre_TG"] || "").toString().trim();
      const ronda = (row["Ronda"] || "").toString().trim();
      
      if (ciclista && jugador && jugador !== "No draft" && jugador !== "Libre") {
         if (!playerCyclists[jugador]) {
           playerCyclists[jugador] = [];
         }
         playerCyclists[jugador].push({
           ciclista,
           ronda: cyclistRoundMap[ciclista] || ronda,
           puntos: cyclistMetadata[ciclista]?.puntosTotales || 0
         });
      }
    });
    
    const results = [];
    
    for (const [jugador, cyclists] of Object.entries(playerCyclists)) {
       const sortedCyclists = [...cyclists].sort((a,b) => b.puntos - a.puntos);
       const stars = sortedCyclists.slice(0, dependencyTopCount);
       const rest = sortedCyclists.slice(dependencyTopCount);

       const topPoints = stars.reduce((sum, c) => sum + c.puntos, 0);
       const restPoints = rest.reduce((sum, c) => sum + c.puntos, 0);
       const totalPoints = topPoints + restPoints;
       
       const topNames = stars.map(c => `${c.ciclista} <${(c.ronda || "0").toString().padStart(2, '0')}>`);
       
       const order = playerOrderMap[jugador] || "?";
       const teamName = `${playerTeamMap[jugador] || jugador} [#${order}]`;
       
       results.push({
         jugador,
         teamName,
         totalPoints,
         topPoints,
         restPoints,
         topNames,
         topPercent: totalPoints > 0 ? (topPoints / totalPoints) * 100 : 0,
         restPercent: totalPoints > 0 ? (restPoints / totalPoints) * 100 : 0,
       });
    }
    
    return results.sort((a,b) => b.topPercent - a.topPercent);
  }, [files?.elecciones?.data, cyclistMetadata, playerTeamMap, dependencyTopCount, cyclistRoundMap, playerOrderMap]);

  const trendingData = useMemo(() => {
    if (!files?.carreras?.data || !files?.resultados?.data) return { cyclists: [], teams: [], recentRaces: [] };

    const racesWithResults = new Set(files?.resultados?.data.map((r: any) => getVal(r, "Carrera")?.trim()).filter(Boolean));

    const raceDates: Record<string, number> = {};
    let maxDate = 0;
    
    files?.carreras?.data.forEach((r: any) => {
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
        }
        if (dateObj && !isNaN(dateObj.getTime())) {
          const t = dateObj.getTime();
          raceDates[carreraName] = t;
          if (racesWithResults.has(carreraName) && t > maxDate) {
            maxDate = t;
          }
        }
      }
    });

    if (maxDate === 0) return { cyclists: [], teams: [], recentRaces: [] };

    const twentyOneDaysMs = 21 * 24 * 60 * 60 * 1000;
    const windowStart = maxDate - twentyOneDaysMs;

    const recentRaces = Object.keys(raceDates).filter(r => 
      racesWithResults.has(r) && 
      raceDates[r] >= windowStart && 
      raceDates[r] <= maxDate
    );

    const cyclistRecentPoints: Record<string, number> = {};
    const teamRecentPoints: Record<string, number> = {};

    Object.entries(cyclistMetadata).forEach(([ciclista, meta]: any) => {
      if (meta.puntosPorCarrera) {
        let recentPoints = 0;
        recentRaces.forEach(race => {
          if (meta.puntosPorCarrera![race]) {
             recentPoints += meta.puntosPorCarrera![race];
          }
        });
        
        if (recentPoints > 0) {
          cyclistRecentPoints[ciclista] = recentPoints;
        }
      }
    });

    const cyclistToJugador: Record<string, string> = {};
    if (files?.elecciones?.data) {
       files?.elecciones?.data.forEach((row: any) => {
         const c = (row["Ciclista"] || "").toString().trim();
         const j = (row["Jugador"] || row["Nombre_TG"] || "").toString().trim();
         if (c && j && j !== "No draft" && j !== "Libre") {
           cyclistToJugador[c] = j;
         }
       });
    }

    Object.entries(cyclistRecentPoints).forEach(([ciclista, pts]) => {
      const jugador = cyclistToJugador[ciclista];
      if (jugador) {
        const team = playerTeamMap[jugador] || jugador;
        teamRecentPoints[team] = (teamRecentPoints[team] || 0) + pts;
      }
    });

    const topCyclists = Object.entries(cyclistRecentPoints)
      .map(([name, pts]) => ({ name, points: pts as number }))
      .sort((a,b) => b.points - a.points)
      .slice(0, 5);

    const topTeams = Object.entries(teamRecentPoints)
      .map(([name, pts]) => ({ name, points: pts as number }))
      .sort((a,b) => b.points - a.points)
      .slice(0, 5);

    return { cyclists: topCyclists, teams: topTeams, recentRaces };
  }, [files?.carreras?.data, files?.resultados?.data, files?.elecciones?.data, cyclistMetadata, playerTeamMap]);

  const teamsList = useMemo(() => {
    const tSet = new Set<string>();
    if (files?.elecciones?.data) {
       files?.elecciones?.data.forEach((row: any) => {
         const jugador = (row["Jugador"] || row["Nombre_TG"] || "").toString().trim();
         if (jugador && jugador !== "No draft" && jugador !== "Libre") {
           tSet.add(playerTeamMap[jugador] || jugador);
         }
       });
    }
    return Array.from(tSet).sort();
  }, [files?.elecciones?.data, playerTeamMap]);

  const h2hData = useMemo(() => {
    if (!teamA || !teamB || !files?.elecciones?.data) return null;

    const getTeamStats = (targetTeam: string) => {
      const players = Object.keys(playerTeamMap).filter(p => playerTeamMap[p] === targetTeam);
      if (players.length === 0) players.push(targetTeam);

      const roster: string[] = [];
      const ages: number[] = [];
      
      files?.elecciones?.data.forEach((row: any) => {
        const c = (row["Ciclista"] || "").toString().trim();
        const j = (row["Jugador"] || row["Nombre_TG"] || "").toString().trim();
        const age = parseInt((row["Edad"] || "0").toString().trim());
        
        if (c && j && players.includes(j)) {
          roster.push(c);
          if (!isNaN(age) && age > 0) ages.push(age);
        }
      });

      let totalPoints = 0;
      let totalDays = 0;
      let totalTop10s = 0;
      
      roster.forEach(c => {
         const meta = cyclistMetadata[c];
         if (meta) {
           totalPoints += meta.puntosTotales || 0;
           totalDays += meta.diasCompeticion || 0;
         }
      });

      if (files?.resultados?.data) {
        files?.resultados?.data.forEach((row: any) => {
           const c = getVal(row, "Ciclista")?.trim();
           const pos = parseInt(getVal(row, "Posición")?.toString() || "999");
           if (c && roster.includes(c) && pos <= 10) {
             totalTop10s++;
           }
        });
      }

      const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
      const ptsPerRide = roster.length > 0 ? totalPoints / roster.length : 0;

      return {
        name: targetTeam,
        points: totalPoints,
        days: totalDays,
        top10s: totalTop10s,
        avgAge,
        ptsPerRide,
        rosterSize: roster.length
      };
    };

    return {
      A: getTeamStats(teamA),
      B: getTeamStats(teamB)
    };
  }, [teamA, teamB, files?.elecciones?.data, files?.resultados?.data, cyclistMetadata, playerTeamMap]);

  return {
    draftData,
    teamDependencyData,
    trendingData,
    teamsList,
    h2hData
  };
}
