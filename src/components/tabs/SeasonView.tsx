import React, { Suspense } from "react";
import { SeasonViewProvider } from "./season/SeasonViewProvider";
import { SeasonHighlights } from "./season/SeasonHighlights";
import { SeasonMilestones } from "./season/SeasonMilestones";
import { BarChart3, Trophy, Users } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUrlState } from "../../hooks/useUrlState";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";
import { TableSkeleton } from "../ui/Skeleton";

const SeasonPointsTab = React.lazy(() => import("./season/SeasonPointsTab").then(m => ({ default: m.SeasonPointsTab })));
const SeasonWinsTab = React.lazy(() => import("./season/SeasonWinsTab").then(m => ({ default: m.SeasonWinsTab })));
const SeasonCyclistsTab = React.lazy(() => import("./season/SeasonCyclistsTab").then(m => ({ default: m.SeasonCyclistsTab })));


export const SeasonView = () => {
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
    playerOrderMap
  } = useComputedStore();

  const [seasonSubTab, setSeasonSubTab] = useUrlState<"puntos" | "victorias" | "ciclistas">("seasonSubTab", "puntos");

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
          <div className="space-y-8">
            <SeasonHighlights 
              leaderboard={leaderboard} 
              raceWinners={raceWinners} 
              uniqueRaces={uniqueRaces} 
              files={files} 
            />
  {/* Sub-tabs Navigation */}
  <div className="flex justify-center mb-4 md:mb-8 w-full">
    <div className="flex bg-neutral-100 p-1 md:p-1.5 rounded-xl shadow-inner w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {[
        { id: "puntos", label: "Puntos", icon: BarChart3 },
        { id: "victorias", label: "Victorias", icon: Trophy },
        { id: "ciclistas", label: "Ciclistas", icon: Users },
      ].map((tab) => (
        <Button variant="outline"
          key={tab.id}
          onClick={() => setSeasonSubTab(tab.id as any)}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 sm:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all duration-200 whitespace-nowrap",
            seasonSubTab === tab.id
              ? "bg-white text-blue-600 shadow-md transform sm:scale-105"
              : "text-neutral-500 hover:text-neutral-700 hover:bg-white/50"
          )}
        >
          <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          {tab.label}
        </Button>
      ))}
    </div>
  </div>

  <AnimatePresence mode="wait">
    {seasonSubTab === "puntos" && (
      <motion.div
        key="puntos"
        initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: 10 }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full"
      >
        <Suspense fallback={<TableSkeleton rows={12} />}>
          <SeasonPointsTab />
        </Suspense>
      </motion.div>
    )}
    {seasonSubTab === "victorias" && (
      <motion.div
        key="victorias"
        initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: 10 }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full"
      >
        <Suspense fallback={<TableSkeleton rows={12} />}>
          <SeasonWinsTab />
        </Suspense>
      </motion.div>
    )}
    {seasonSubTab === "ciclistas" && (
      <motion.div
        key="ciclistas"
        initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: 10 }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full relative z-[100]"
      >
        <Suspense fallback={<TableSkeleton rows={12} />}>
          <SeasonCyclistsTab />
        </Suspense>
      </motion.div>
    )}
  </AnimatePresence>

  <SeasonMilestones leaderboard={leaderboard} files={files} cyclistMetadata={cyclistMetadata} raceWinners={raceWinners} />
</div>
    </SeasonViewProvider>
  );
};

export default SeasonView;
