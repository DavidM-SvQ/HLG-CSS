import React, { Suspense } from "react";
import { Bike } from "lucide-react";
import { SeasonViewProvider } from "./season/SeasonViewProvider";
import { SeasonCyclistsTab } from "./season/SeasonCyclistsTab";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";
import { TableSkeleton } from "../ui/Skeleton";

export const CyclistsView: React.FC = () => {
  const { files } = useDataStore();
  const {
    leaderboard,
    raceWinners,
    uniqueRaces,
    cyclistMetadata,
    playerTeamMap,
    playerByCyclist,
    globalTeamPartialWinsCount,
    globalTeamWinsCount,
    cyclistRoundMap,
    playerOrderMap,
  } = useComputedStore();

  return (
    <SeasonViewProvider
      files={files}
      leaderboard={leaderboard}
      raceWinners={raceWinners}
      uniqueRaces={uniqueRaces}
      cyclistMetadata={cyclistMetadata}
      playerTeamMap={playerTeamMap}
      playerByCyclist={playerByCyclist}
      globalTeamPartialWinsCount={globalTeamPartialWinsCount}
      globalTeamWinsCount={globalTeamWinsCount}
      cyclistRoundMap={cyclistRoundMap}
      playerOrderMap={playerOrderMap}
    >
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Bike className="w-6 h-6 text-blue-600" />
              Ciclistas
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Rendimiento, estadísticas de draft, ciclistas libres, detalle individual y comparativa cara a cara.
            </p>
          </div>
        </div>

        {/* Cyclists Tabs Content */}
        <Suspense fallback={<div className="p-8"><TableSkeleton rows={8} /></div>}>
          <SeasonCyclistsTab />
        </Suspense>
      </div>
    </SeasonViewProvider>
  );
};

export default CyclistsView;
