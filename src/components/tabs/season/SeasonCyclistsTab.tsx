import React, { useContext, useRef, Suspense } from "react";
import { Users, AlertCircle, ArrowLeftRight } from "lucide-react";
import { SeasonViewContext } from "./SeasonViewContext";
import { TableSkeleton } from "../../ui/Skeleton";
import { Button } from "../../ui/button";
import { AnimatePresence, motion } from "motion/react";

const TopDraftCyclists = React.lazy(() => import("./TopDraftCyclists").then(m => ({ default: m.TopDraftCyclists })));
const UnscoredCyclists = React.lazy(() => import("./UnscoredCyclists").then(m => ({ default: m.UnscoredCyclists })));
const UndebutedCyclists = React.lazy(() => import("./UndebutedCyclists").then(m => ({ default: m.UndebutedCyclists })));
const HotStreakCyclists = React.lazy(() => import("./HotStreakCyclists").then(m => ({ default: m.HotStreakCyclists })));
const NoDraftCyclists = React.lazy(() => import("./NoDraftCyclists").then(m => ({ default: m.NoDraftCyclists })));
const CyclistComparaciones = React.lazy(() => import("../cyclists/CyclistComparaciones").then(m => ({ default: m.CyclistComparaciones })));

export function SeasonCyclistsTab() {
  const context = useContext(SeasonViewContext)!;

  const { cn, CyclistDetailView, files, playerTeamMap, playerByCyclist, cyclistMetadata, cyclistRoundMap, playerOrderMap, cyclistsSubTab, setCyclistsSubTab, selectedCyclistDetail, setSelectedCyclistDetail } = context;

  return (
    <div className="space-y-8">
      {/* Sub-tabs for Ciclistas */}
      <div className="flex justify-center">
        <div className="flex bg-neutral-100 p-1.5 rounded-xl shadow-inner overflow-x-auto w-full sm:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { id: "draft", label: "Draft", icon: Users },
            {
              id: "no-draft",
              label: "No draft",
              icon: AlertCircle,
            },
            { id: "detalle", label: "Detalle ciclista", icon: Users },
            { id: "comparaciones", label: "Comparativa", icon: ArrowLeftRight },
          ].map((tab) => (
            <Button variant="outline"
              key={tab.id}
              onClick={() =>
                setCyclistsSubTab(tab.id as any)
              }
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap",
                cyclistsSubTab === tab.id
                  ? "bg-white text-blue-600 shadow-md transform sm:scale-105"
                  : "text-neutral-500 hover:text-neutral-700 hover:bg-white/50",
              )}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={cyclistsSubTab}
          initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: 10 }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full space-y-8 relative z-[100]"
        >
          {cyclistsSubTab === "draft" ? (
            <Suspense fallback={<div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200"><TableSkeleton rows={8} /></div>}>
              <TopDraftCyclists />
              <UnscoredCyclists />
              <UndebutedCyclists />
              <HotStreakCyclists />
            </Suspense>
          ) : cyclistsSubTab === "no-draft" ? (
            <Suspense fallback={<div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200"><TableSkeleton rows={8} /></div>}>
              <NoDraftCyclists />
            </Suspense>
          ) : cyclistsSubTab === "detalle" ? (
            <Suspense fallback={<div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200"><TableSkeleton rows={6} /></div>}>
              <CyclistDetailView files={files} selectedCyclistDetail={selectedCyclistDetail} setSelectedCyclistDetail={setSelectedCyclistDetail} cyclistMetadata={cyclistMetadata} cyclistRoundMap={cyclistRoundMap} playerByCyclist={playerByCyclist} playerOrderMap={playerOrderMap} playerTeamMap={playerTeamMap} />
            </Suspense>
          ) : cyclistsSubTab === "comparaciones" ? (
            <Suspense fallback={<div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200"><TableSkeleton rows={6} /></div>}>
              <CyclistComparaciones
                files={files}
                cyclistMetadata={cyclistMetadata}
                playerByCyclist={playerByCyclist}
                playerTeamMap={playerTeamMap}
                cyclistRoundMap={cyclistRoundMap}
                leaderboard={context.leaderboard}
              />
            </Suspense>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
