import { useMemo } from "react";
import { useComputedStore } from "../stores/useComputedStore";
import { useDataStore } from "../stores/useDataStore";
import { getVal } from "../data-processing";

export interface TopDraftStat {
  ciclista: string;
  puntos: number;
  jugador: string;
  nombreEquipo: string;
  orden: string;
  ronda: string;
  pais: string;
  victorias: number;
  carreras: Set<string>;
  dias: number;
  numCarreras: number;
  ppc: number;
  ppd: number;
  originalIndex: number;
}

export function useTopDraft(
  cyclistsMonthFilter: string, 
  cyclistsCategoryFilter: string[], 
  cyclistsTeamFilter: string[], 
  cyclistsRoundFilter: string[],
  topCyclistsLimit: number
) {
  const { files } = useDataStore();
  const { 
    leaderboard, 
    playerByCyclist, 
    playerTeamMap, 
    playerOrderMap, 
    cyclistRoundMap, 
    cyclistMetadata 
  } = useComputedStore();

  return useMemo(() => {
    if (!files.carreras.data || !leaderboard) {
      return { sortedStats: [], allStats: [] };
    }

    const cyclistStats: Record<string, TopDraftStat> = {};

    Object.entries(playerByCyclist).forEach(([ciclista, jugador]) => {
      if (jugador !== "No draft" && jugador !== "No draft [99]") {
        cyclistStats[ciclista] = {
          ciclista,
          puntos: 0,
          jugador: jugador as string,
          nombreEquipo: playerTeamMap[jugador as string] || "",
          orden: playerOrderMap[jugador as string] || "",
          ronda: cyclistRoundMap[ciclista] || "",
          pais: cyclistMetadata[ciclista]?.pais || "",
          victorias: 0,
          carreras: new Set<string>(),
          dias: 0,
          numCarreras: 0,
          ppc: 0,
          ppd: 0,
          originalIndex: 0,
        };
      }
    });

    const raceMonths: Record<string, number> = {};
    const raceCats: Record<string, string> = {};
    files.carreras.data?.forEach((r) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const fechaFin = getVal(r, "Fecha");
      const cat = getVal(r, "Categoría")?.trim();
      if (carreraName) {
        if (cat) raceCats[carreraName] = cat;
        if (fechaFin) {
          const parts = fechaFin.split(/[-/]/);
          if (parts.length >= 2) {
            const monthIndex = parseInt(parts[1]) - 1;
            raceMonths[carreraName] = monthIndex;
          }
        }
      }
    });

    leaderboard?.forEach((player) => {
      player?.detalles?.forEach((d) => {
        if (cyclistsMonthFilter !== "all" && raceMonths[d.carrera] !== parseInt(cyclistsMonthFilter)) {
          return;
        }
        if (cyclistsCategoryFilter.length > 0) {
          const cat = raceCats[d.carrera];
          if (!cat || !cyclistsCategoryFilter.includes(cat)) return;
        }

        if (!cyclistStats[d.ciclista]) {
          cyclistStats[d.ciclista] = {
            ciclista: d.ciclista,
            puntos: 0,
            jugador: player.jugador,
            nombreEquipo: player.nombreEquipo,
            orden: player.orden,
            ronda: d.ronda,
            pais: cyclistMetadata[d.ciclista]?.pais || "",
            victorias: 0,
            carreras: new Set<string>(),
            dias: 0,
            numCarreras: 0,
            ppc: 0,
            ppd: 0,
            originalIndex: 0,
          };
        }

        const stats = cyclistStats[d.ciclista];
        stats.puntos += d.puntosObtenidos;
        stats.carreras.add(d.carrera);

        const isPos01 = d.posicion === "01" || d.posicion === "1" || d.posicion === 1;
        const isValidType = [
          "Etapa",
          "Etapa (Crono equipos)",
          "Clasificación final",
          "Clasificación final (Crono equipos)",
          "Clásica",
        ].includes(d.tipoResultado);

        if (isPos01 && isValidType) {
          stats.victorias += 1;
        }

        const raceData = files.carreras.data?.find((r) => getVal(r, "Carrera")?.trim() === d.carrera);
        if (raceData) {
          const diasStr = getVal(raceData, "Días");
          if (diasStr) {
            stats.dias += parseInt(diasStr) || 1;
          } else {
            stats.dias += 1;
          }
        } else {
          stats.dias += 1;
        }
      });
    });

    const allStats = Object.values(cyclistStats)
      .filter((data) => {
        if (data.nombreEquipo === "No draft" || data.nombreEquipo === "No draft [99]") return false;
        if (cyclistsTeamFilter.length > 0 && !cyclistsTeamFilter.includes(data.nombreEquipo)) return false;
        if (cyclistsRoundFilter.length > 0 && !cyclistsRoundFilter.includes(data.ronda)) return false;
        return true;
      })
      .sort((a, b) => b.puntos - a.puntos)
      .map((data, index) => {
        const numCarreras = data.carreras.size;
        const ppc = numCarreras > 0 ? parseFloat((data.puntos / numCarreras).toFixed(1)) : 0;
        const ppd = data.dias > 0 ? parseFloat((data.puntos / data.dias).toFixed(1)) : 0;
        return {
          ...data,
          numCarreras,
          ppc,
          ppd,
          originalIndex: index + 1
        };
      });

    return { 
      allStats,
      sortedStats: allStats.slice(0, topCyclistsLimit === 9999 ? undefined : topCyclistsLimit)
    };
  }, [
    files.carreras.data,
    leaderboard,
    playerByCyclist,
    playerTeamMap,
    playerOrderMap,
    cyclistRoundMap,
    cyclistMetadata,
    cyclistsMonthFilter,
    cyclistsCategoryFilter,
    cyclistsTeamFilter,
    cyclistsRoundFilter,
    topCyclistsLimit
  ]);
}
