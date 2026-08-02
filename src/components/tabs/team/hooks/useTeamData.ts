import { AppState, PlayerScore, CyclistMetadata } from '../../../../lib/types';
import { useMemo } from "react";
import { getVal } from "../../../../lib/data-processing";

export function useTeamData({
  selectedTeam,
  leaderboard,
  raceWinners,
  globalTeamPartialWinsCount,
  files,
  formattedTeams,
  cyclistMetadata,
}: {
  selectedTeam: string;
  leaderboard: PlayerScore[];
  raceWinners: Record<string, string>;
  globalTeamPartialWinsCount: any;
  files: AppState;
  formattedTeams: any[];
  cyclistMetadata: Record<string, CyclistMetadata>;
}) {
  return useMemo(() => {
    if (!selectedTeam) return null;

    const teamPlayer = leaderboard?.find((p) => p.nombreEquipo === selectedTeam);
    const teamWins = Object.values(raceWinners).filter((w) => w === selectedTeam).length;
    const teamPartialWins = globalTeamPartialWinsCount.totals[selectedTeam] || 0;

    const teamCyclistsData = files?.elecciones?.data?.filter(
      (r: any) => (getVal(r, "Nombre_Equipo") || getVal(r, "Nombre_TG")) === selectedTeam
    ) || [];

    const ages = teamCyclistsData
      .map((c: any) => parseInt(getVal(c, "Edad")))
      .filter((a: number) => !isNaN(a));
      
    const avgAge = ages.length > 0 ? (ages.reduce((a: number, b: number) => a + b, 0) / ages.length).toFixed(1) : "-";

    const currentPuesto = leaderboard
      ? leaderboard?.findIndex((p) => p.nombreEquipo === selectedTeam) + 1
      : 0;
      
    const draftOrder = formattedTeams
      .find((t) => t.value === selectedTeam)
      ?.label.match(/\[#(\d+)\]/)?.[1];
      
    const draftOrderNum = draftOrder ? parseInt(draftOrder) : 0;
    const difConOrden = draftOrderNum - currentPuesto;

    const cyclistStats = teamCyclistsData.map((c: any) => {
      const ciclista = getVal(c, "Ciclista");
      const details = teamPlayer?.detalles.filter((d: any) => d.ciclista === ciclista) || [];

      const puntos = details.reduce((sum: number, d: any) => sum + d.puntosObtenidos, 0);

      const victorias = details.filter((d: any) => {
        const isPos01 = d.posicion === "01" || d.posicion === "1";
        const isValidType = [
          "Etapa",
          "Etapa (Crono equipos)",
          "Clasificación final",
          "Clasificación final (Crono equipos)",
        ].includes(d.tipoResultado);
        return isPos01 && isValidType;
      }).length;

      const metadata = cyclistMetadata[ciclista] || {
        edad: "-",
        pais: "-",
        equipoBreve: "-",
        ronda: "-",
        carrerasDisputadas: 0,
        diasCompeticion: 0,
      };

      return {
        ciclista,
        ronda: metadata.ronda,
        edad: metadata.edad || getVal(c, "Edad") || "-",
        pais: metadata.pais,
        equipoBreve: metadata.equipoBreve,
        puntos,
        victorias,
        carrerasDisputadas: metadata.carrerasDisputadas,
        diasCompeticion: metadata.diasCompeticion,
        puntosPorCarrera: metadata.carrerasDisputadas > 0 ? (puntos / metadata.carrerasDisputadas).toFixed(1) : "0.0",
        puntosPorDia: metadata.diasCompeticion > 0 ? (puntos / metadata.diasCompeticion).toFixed(1) : "0.0",
        pointsPct: (teamPlayer?.puntos || 0) > 0 ? (puntos / teamPlayer!.puntos) * 100 : 0,
      };
    });

    const unscoredCount = cyclistStats.filter((c: any) => c.puntos === 0).length;
    const undebutedCount = cyclistStats.filter((c: any) => (c.diasCompeticion || 0) === 0).length;

    return {
      teamPlayer,
      teamWins,
      teamPartialWins,
      avgAge,
      currentPuesto,
      draftOrderNum,
      difConOrden,
      cyclistStats,
      unscoredCount,
      undebutedCount,
    };
  }, [
    selectedTeam,
    leaderboard,
    raceWinners,
    globalTeamPartialWinsCount,
    files,
    formattedTeams,
    cyclistMetadata,
  ]);
}
