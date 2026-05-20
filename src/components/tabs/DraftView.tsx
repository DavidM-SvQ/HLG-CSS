import React, { useMemo } from 'react';
import { useUrlState } from '../../hooks/useUrlState';
import { motion, AnimatePresence } from 'motion/react';
import { DraftElections } from './draft/DraftElections';
import { DraftDatos } from './draft/DraftDatos';
import { cn } from '../../lib/utils';
import { getVal, getFlagEmoji } from '../../lib/data-processing';
import { Button } from "../ui/button";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";


export const DraftView = () => {
  const { files } = useDataStore();
  const { 
    cyclistMetadata,
    leaderboard,
    teamToPlayerMap,
    playerOrderMap
  } = useComputedStore();

  const [draftSubTab, setDraftSubTab] = useUrlState<"elecciones" | "datos">("draftSubTab", "elecciones");

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

  return (
    <>

  <div className="space-y-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">
          Draft 2026
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Información y resultados del draft.
        </p>
      </div>
      <div className="flex bg-neutral-100 p-1 rounded-lg self-start">
        <Button variant="outline"
          onClick={() => setDraftSubTab("elecciones")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            draftSubTab === "elecciones"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          Elecciones
        </Button>
        <Button variant="outline"
          onClick={() => setDraftSubTab("datos")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            draftSubTab === "datos"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          Datos
        </Button>
      </div>
    </div>
    <AnimatePresence mode="wait">
        {draftSubTab === "elecciones" && (
      <motion.div
        key="elecciones"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <DraftElections 
          files={files}
          cyclistMetadata={cyclistMetadata}
          leaderboard={leaderboard}
          getFlagEmoji={getFlagEmoji}
          teamTotalPoints={teamTotalPoints}
          draftCyclistStats={draftCyclistStats}
          draftComputedData={draftComputedData}
        />
      </motion.div>
    )}

    {draftSubTab === "datos" && (
      <motion.div
        key="datos"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <DraftDatos 
          files={files}
          leaderboard={leaderboard}
          cyclistMetadata={cyclistMetadata}
          teamToPlayerMap={teamToPlayerMap}
          playerOrderMap={playerOrderMap}
        />
      </motion.div>
    )}
    </AnimatePresence>
  </div>
    </>
  );
};
