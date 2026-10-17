import { useMemo } from 'react';

export function useTestsViewData(
  files: any, 
  cyclistMetadata: any, 
  cyclistRoundMap: any,
  dependencyTopCount: number
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

    const dependencyList = Object.entries(playerCyclists).map(([teamName, roster]) => {
      const sortedRoster = [...roster].sort((a, b) => b.puntos - a.puntos);
      const totalPoints = sortedRoster.reduce((sum, c) => sum + c.puntos, 0);
      
      const topCount = Math.min(dependencyTopCount, sortedRoster.length);
      const topStars = sortedRoster.slice(0, topCount);
      const restBloque = sortedRoster.slice(topCount);
      
      const topPoints = topStars.reduce((sum, c) => sum + c.puntos, 0);
      const restPoints = restBloque.reduce((sum, c) => sum + c.puntos, 0);

      const topPercent = totalPoints > 0 ? (topPoints / totalPoints) * 100 : 0;
      const restPercent = totalPoints > 0 ? (restPoints / totalPoints) * 100 : 0;

      return {
        teamName,
        topPercent,
        restPercent,
        topPoints,
        restPoints,
        totalPoints,
        topNames: topStars.map(s => `${s.ciclista} (${Math.round(s.puntos)} pts)`)
      };
    });

    return dependencyList.sort((a, b) => b.topPercent - a.topPercent);
  }, [files?.elecciones?.data, cyclistMetadata, cyclistRoundMap, dependencyTopCount]);

  return {
    draftData,
    teamDependencyData
  };
}
