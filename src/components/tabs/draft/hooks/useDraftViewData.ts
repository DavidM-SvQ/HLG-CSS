import { useMemo } from 'react';
import { AppState, CyclistMetadata } from '../../../../lib/types';
import { getVal } from '../../../../lib/data-processing';

export function useDraftViewData(
  files: AppState,
  leaderboard: any[],
  cyclistMetadata: Record<string, CyclistMetadata>
) {
  const draftCyclistStats = useMemo(() => {
    const stats: Record<string, { puntos: number; victorias: number }> = {};
    leaderboard?.forEach((player: any) => {
      player?.detalles?.forEach((d: any) => {
        if (!stats[d.ciclista]) {
          stats[d.ciclista] = { puntos: 0, victorias: 0 };
        }
        stats[d.ciclista].puntos += d.puntosObtenidos;

        const isPos01 = d.posicion === "01" || d.posicion === "1";
        const isValidType = [
          "Etapa",
          "Etapa (Crono equipos)",
          "Clasificación final",
          "Clasificación final (Crono equipos)",
          "Clásica",
        ].includes(d.tipoResultado);

        if (isPos01 && isValidType) {
          stats[d.ciclista].victorias += 1;
        }
      });
    });
    return stats;
  }, [leaderboard]);

  const teamTotalPoints = useMemo(() => {
    const totals: Record<string, number> = {};
    files.elecciones?.data?.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista") as string;
      const equipo = getVal(row, "Nombre_Equipo") || (getVal(row, "Nombre_TG") as string);
      const pts = draftCyclistStats[ciclista]?.puntos || 0;
      if (equipo) {
        totals[equipo] = (totals[equipo] || 0) + pts;
      }
    });
    return totals;
  }, [files?.elecciones?.data, draftCyclistStats]);

  const draftComputedData = useMemo(() => {
    let minCarreras = Infinity;
    let minDc = Infinity;
    let minPpc = Infinity;
    let minPpd = Infinity;
    let minPct = Infinity;

    const maxPuntos = Math.max(
      1,
      ...Object.values(draftCyclistStats as Record<string, any>).map((s) => s.puntos)
    );

    files?.elecciones?.data?.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista") as string;
      if (!ciclista) return;
      const stats = draftCyclistStats[ciclista] || {
        puntos: 0,
        victorias: 0,
      };
      const meta = cyclistMetadata[ciclista] || {
        carrerasDisputadas: 0,
        diasCompeticion: 0,
      };

      const carr = meta.carrerasDisputadas;
      const dc = meta.diasCompeticion;
      const ppc = carr > 0 ? stats.puntos / carr : 0;
      const ppd = dc > 0 ? stats.puntos / dc : 0;

      const equipo =
        getVal(row, "Nombre_Equipo") ||
        (getVal(row, "Nombre_TG") as string);
      const pct =
        equipo && teamTotalPoints[equipo] > 0
          ? (stats.puntos / teamTotalPoints[equipo]) * 100
          : 0;

      if (carr > 0 && carr < minCarreras) minCarreras = carr;
      if (dc > 0 && dc < minDc) minDc = dc;
      if (ppc > 0 && ppc < minPpc) minPpc = ppc;
      if (ppd > 0 && ppd < minPpd) minPpd = ppd;
      if (pct > 0 && pct < minPct) minPct = pct;
    });

    return { maxPuntos, minCarreras, minDc, minPpc, minPpd, minPct };
  }, [files?.elecciones?.data, draftCyclistStats, cyclistMetadata, teamTotalPoints]);

  return { teamTotalPoints, draftCyclistStats, draftComputedData };
}
