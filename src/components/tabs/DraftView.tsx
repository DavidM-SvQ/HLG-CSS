import React, { Suspense } from 'react';
import { useUrlState } from '../../hooks/useUrlState';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { getFlagEmoji } from '../../lib/data-processing';
import { Button } from "../ui/button";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";
import { useDraftViewData } from './draft/hooks/useDraftViewData';
import { TableSkeleton } from '../ui/Skeleton';

const DraftElections = React.lazy(() => import('./draft/DraftElections').then(m => ({ default: m.DraftElections })));
const DraftDatos = React.lazy(() => import('./draft/DraftDatos').then(m => ({ default: m.DraftDatos })));
const DraftFantasmaView = React.lazy(() => import('./draft/DraftFantasmaView').then(m => ({ default: m.DraftFantasmaView })));

export const DraftView = () => {
  const { files } = useDataStore();
  const { 
    cyclistMetadata,
    leaderboard,
    teamToPlayerMap,
    playerTeamMap,
    playerOrderMap
  } = useComputedStore();

  const [draftSubTab, setDraftSubTab] = useUrlState<"elecciones" | "datos" | "fantasma">("draftSubTab", "elecciones");

  const { teamTotalPoints, draftCyclistStats, draftComputedData } = useDraftViewData(files, leaderboard, cyclistMetadata);

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
        <Button variant="outline"
          onClick={() => setDraftSubTab("fantasma")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            draftSubTab === "fantasma"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          Draft fantasma
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
        <Suspense fallback={<TableSkeleton rows={8} />}>
          <DraftElections 
            files={files}
            cyclistMetadata={cyclistMetadata}
            leaderboard={leaderboard}
            getFlagEmoji={getFlagEmoji}
            teamTotalPoints={teamTotalPoints}
            draftCyclistStats={draftCyclistStats}
            draftComputedData={draftComputedData}
          />
        </Suspense>
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
        <Suspense fallback={<TableSkeleton rows={8} />}>
          <DraftDatos 
            files={files}
            leaderboard={leaderboard}
            cyclistMetadata={cyclistMetadata}
            teamToPlayerMap={teamToPlayerMap}
            playerOrderMap={playerOrderMap}
          />
        </Suspense>
      </motion.div>
    )}

    {draftSubTab === "fantasma" && (
      <motion.div
        key="fantasma"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Suspense fallback={<TableSkeleton rows={8} />}>
          <DraftFantasmaView 
            files={files}
            cyclistMetadata={cyclistMetadata}
            playerTeamMap={playerTeamMap}
            playerOrderMap={playerOrderMap}
          />
        </Suspense>
      </motion.div>
    )}
    </AnimatePresence>
  </div>
    </>
  );
};
