import { useMemo } from 'react';
import { getVal } from '../data-processing';

export function useGhostDraft(
  eleccionesData: any[] | undefined,
  cyclistMetadata: Record<string, { puntosTotales: number; eleccion?: number; [key: string]: any }>,
  playerTeamMap: Record<string, string>,
  playerOrderMap: Record<string, string>,
  mode: 'puntos' | 'rondas' = 'puntos'
) {
  return useMemo(() => {
    if (!eleccionesData || !eleccionesData.length) return [];

    let pickCounter = 1;

    // Collect all picks globally
    const allPicks: { name: string; pickNumber: number; actualPoints: number; round: string; roundNum: number; jugador: string }[] = [];

    eleccionesData.forEach((row) => {
      const ciclista = (getVal(row, 'Ciclista') || '').toString().trim();
      const jugador = (getVal(row, 'Jugador') || getVal(row, 'Nombre_TG') || '').toString().trim();
      const round = (getVal(row, 'Ronda') || '').toString().trim();
      const roundNum = parseInt(round.replace(/\D/g, '')) || 99;
      
      let pickNumStr = getVal(row, 'Elección#') || getVal(row, 'Elección') || getVal(row, 'Pick');
      let pickNum = parseInt(pickNumStr);
      if (isNaN(pickNum)) pickNum = pickCounter;
      
      if (ciclista && jugador && jugador !== 'No draft' && jugador !== 'Libre') {
        allPicks.push({
          name: ciclista,
          pickNumber: pickNum,
          actualPoints: cyclistMetadata[ciclista]?.puntosTotales || 0,
          round: round || '1',
          roundNum,
          jugador
        });
        pickCounter++;
      } else if (ciclista) {
        pickCounter++;
      }
    });

    // Sort all picks by pick number ascending
    allPicks.sort((a, b) => a.pickNumber - b.pickNumber);

    const playerPicks: Record<string, any[]> = {};
    
    // Collect all cyclists and sort by total points descending
    const allCyclists: { name: string; points: number }[] = [];
    Object.entries(cyclistMetadata).forEach(([name, meta]) => {
      allCyclists.push({
        name,
        points: meta.puntosTotales || 0,
      });
    });
    allCyclists.sort((a, b) => b.points - a.points);
    
    if (mode === 'rondas') {
      const usedCyclists = new Set<string>();

      // Pre-calculate points and sort globally once
      const allPicksWithPoints = allPicks.map(p => ({
        name: p.name,
        roundNum: p.roundNum,
        points: cyclistMetadata[p.name]?.puntosTotales || 0
      })).sort((a, b) => b.points - a.points);

      const draftedCyclistsSet = new Set<string>();

      allPicks.forEach((pick, index) => {
        draftedCyclistsSet.add(pick.name);

        const missedOpportunities = allCyclists
          .filter(c => !draftedCyclistsSet.has(c.name) && c.points > pick.actualPoints)
          .slice(0, 5) // already sorted globally
          .map(candidate => {
            const laterPick = allPicks.find(p => p.name === candidate.name);
            return {
              name: candidate.name,
              points: candidate.points,
              pickedBy: laterPick ? (playerTeamMap[laterPick.jugador] || laterPick.jugador) : "Nadie (Libre)",
              pickedAtPick: laterPick ? laterPick.pickNumber : "-",
              pickedAtRound: laterPick ? laterPick.round : "-"
            };
          });

        let ghostCyclist = null;
        for (let i = 0; i < allPicksWithPoints.length; i++) {
          const candidate = allPicksWithPoints[i];
          if (candidate.roundNum <= pick.roundNum && !usedCyclists.has(candidate.name)) {
            ghostCyclist = candidate;
            break;
          }
        }

        if (ghostCyclist) {
          usedCyclists.add(ghostCyclist.name);
        }
        
        if (!playerPicks[pick.jugador]) {
          playerPicks[pick.jugador] = [];
        }
        
        playerPicks[pick.jugador].push({
          original: pick.name,
          pickNumber: pick.pickNumber,
          ghost: ghostCyclist ? ghostCyclist.name : '?',
          ghostPoints: ghostCyclist ? ghostCyclist.points : 0,
          originalPoints: pick.actualPoints,
          round: pick.round,
          missedOpportunities
        });
      });
    } else {
      const draftedCyclistsSet = new Set<string>();

      // Now simply match cyclst i to pick i
      allPicks.forEach((pick, index) => {
        draftedCyclistsSet.add(pick.name);

        const missedOpportunities = allCyclists
          .filter(c => !draftedCyclistsSet.has(c.name) && c.points > pick.actualPoints)
          .slice(0, 5) // already sorted globally
          .map(candidate => {
            const laterPick = allPicks.find(p => p.name === candidate.name);
            return {
              name: candidate.name,
              points: candidate.points,
              pickedBy: laterPick ? (playerTeamMap[laterPick.jugador] || laterPick.jugador) : "Nadie (Libre)",
              pickedAtPick: laterPick ? laterPick.pickNumber : "-",
              pickedAtRound: laterPick ? laterPick.round : "-"
            };
          });

        const ghostCyclist = allCyclists[index]; // The i-th best cyclist overall
        
        if (!playerPicks[pick.jugador]) {
          playerPicks[pick.jugador] = [];
        }
        
        playerPicks[pick.jugador].push({
          original: pick.name,
          pickNumber: pick.pickNumber,
          ghost: ghostCyclist ? ghostCyclist.name : '?',
          ghostPoints: ghostCyclist ? ghostCyclist.points : 0,
          originalPoints: pick.actualPoints,
          round: pick.round,
          missedOpportunities
        });
      });
    }

    const results: any[] = [];

    for (const [jugador, picks] of Object.entries(playerPicks)) {
      let ghostPoints = 0;
      let actualTeamPoints = 0;

      for (const pick of picks) {
        actualTeamPoints += pick.originalPoints;
        ghostPoints += pick.ghostPoints;
      }

      const teamName = playerTeamMap[jugador] || jugador;
      const order = playerOrderMap[jugador] || '?';

      picks.sort((a, b) => a.pickNumber - b.pickNumber);

      results.push({
        jugador,
        teamName: `${teamName} [#${order}]`,
        actualTeamPoints,
        ghostPoints,
        diff: ghostPoints - actualTeamPoints,
        ghostRoster: picks
      });
    }

    return results.sort((a, b) => b.diff - a.diff);
  }, [eleccionesData, cyclistMetadata, playerTeamMap, playerOrderMap, mode]);
}
