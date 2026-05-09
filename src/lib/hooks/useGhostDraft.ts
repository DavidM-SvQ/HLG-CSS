import { useMemo } from "react";

export function useGhostDraft(
  eleccionesData: any[] | undefined,
  cyclistMetadata: Record<string, { puntosTotales: number; eleccion?: number; [key: string]: any }>,
  playerTeamMap: Record<string, string>,
  playerOrderMap: Record<string, string>
) {
  return useMemo(() => {
    if (!eleccionesData || !eleccionesData.length) return [];

    // 1. Build a list of all cyclists and their actual draft pick overall number
    const allCyclists: { name: string; points: number; actualPickNumber: number }[] = [];
    
    // Some cyclists are in metadata but were never drafted (isUndrafted = 0 or infinite pick).
    // Let's first map actual picks from elecciones
    let pickCounter = 1;
    const actualPickMap: Record<string, number> = {};
    const playerPicks: Record<string, { name: string; pickNumber: number; actualPoints: number }[]> = {};

    eleccionesData.forEach((row) => {
      const ciclista = (row["Ciclista"] || "").toString().trim();
      const jugador = (row["Jugador"] || row["Nombre_TG"] || "").toString().trim();
      
      if (ciclista) {
        // If it's a drafted pick, assign a pick number
        if (jugador && jugador !== "No draft" && jugador !== "Libre") {
          actualPickMap[ciclista] = pickCounter;
          
          if (!playerPicks[jugador]) {
            playerPicks[jugador] = [];
          }
          playerPicks[jugador].push({
            name: ciclista,
            pickNumber: pickCounter,
            actualPoints: cyclistMetadata[ciclista]?.puntosTotales || 0,
          });

          pickCounter++;
        }
      }
    });

    Object.entries(cyclistMetadata).forEach(([name, meta]) => {
      allCyclists.push({
        name,
        points: meta.puntosTotales || 0,
        // If they were not picked by a real player, their pick number is Infinity (always available)
        actualPickNumber: actualPickMap[name] || Infinity,
      });
    });

    // 2. Perform the Ghost Draft per team
    const results: any[] = [];

    for (const [jugador, picks] of Object.entries(playerPicks)) {
      // Sort team's picks descending by pickNumber (starting from their last pick)
      const sortedPicks = [...picks].sort((a, b) => b.pickNumber - a.pickNumber);
      
      let ghostPoints = 0;
      let actualTeamPoints = 0;
      const ghostRoster: { original: string; pickNumber: number; ghost: string; ghostPoints: number }[] = [];
      const usedCyclists = new Set<string>();

      for (const pick of sortedPicks) {
        actualTeamPoints += pick.actualPoints;

        // Find the best available cyclist for this pick
        // Must be available at `pick.pickNumber` and not already used
        let bestGhost: string | null = null;
        let maxPoints = -1;

        for (const cyclist of allCyclists) {
          if (!usedCyclists.has(cyclist.name)) {
             if (cyclist.actualPickNumber >= pick.pickNumber) {
               if (cyclist.points > maxPoints) {
                 maxPoints = cyclist.points;
                 bestGhost = cyclist.name;
               }
             }
          }
        }

        if (bestGhost) {
          usedCyclists.add(bestGhost);
          ghostPoints += maxPoints;
          ghostRoster.push({
            original: pick.name,
            pickNumber: pick.pickNumber,
            ghost: bestGhost,
            ghostPoints: maxPoints
          });
        }
      }

      const teamName = playerTeamMap[jugador] || jugador;
      const order = playerOrderMap[jugador] || "?";

      // Re-sort ghost roster back to ascending pick number for display
      ghostRoster.sort((a, b) => a.pickNumber - b.pickNumber);

      results.push({
        jugador,
        teamName: `${teamName} [#${order}]`,
        actualTeamPoints,
        ghostPoints,
        diff: ghostPoints - actualTeamPoints,
        ghostRoster
      });
    }

    return results.sort((a, b) => b.diff - a.diff);
  }, [eleccionesData, cyclistMetadata, playerTeamMap, playerOrderMap]);
}
