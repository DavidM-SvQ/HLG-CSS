import { AppState, PlayerScore, CyclistMetadata } from '../../../lib/types';
import { useSeasonMilestonesLogic } from "./hooks/useSeasonMilestonesLogic";
import React, { useMemo, useRef, useState } from "react";
import { formatNumberSpanish, getVal } from "../../../lib/data-processing";
import { Flag, Globe, Users, Medal } from "lucide-react";
import { cn } from "../../../lib/utils";
import { motion } from "motion/react";
import { ExportToolbar } from "../../ui/ExportToolbar";

export const SeasonMilestones = ({ leaderboard, files, cyclistMetadata, raceWinners }: { leaderboard: PlayerScore[]; files: AppState; cyclistMetadata: Record<string, CyclistMetadata>; raceWinners?: Record<string, string> }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { teamMilestones, cyclistMilestones } = useSeasonMilestonesLogic({ leaderboard, files, cyclistMetadata, raceWinners });

  if (teamMilestones.length === 0 && cyclistMilestones.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className={cn("mt-12 w-full mx-auto", isExpanded ? "fixed inset-4 z-50 overflow-auto bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-4 sm:p-8" : "max-w-7xl")}>
      <div className="bg-white border flex flex-col border-neutral-200 rounded-3xl overflow-hidden shadow-sm relative z-0" ref={containerRef}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-50/50 via-neutral-50/20 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-100 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center hide-on-copy shadow-inner text-white relative overflow-hidden">
               <div className="absolute inset-0 bg-white/20 blur-md pointer-events-none" />
              <Flag className="w-6 h-6 relative z-10" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-neutral-900">Hitos de la Temporada</h3>
              <p className="text-sm text-neutral-500 font-semibold tracking-wide">Momentos clave de equipos y ciclistas</p>
            </div>
          </div>
          <div className="copy-button-ignore">
             <ExportToolbar
               targetRef={containerRef}
               filename="hitos_temporada"
               isExpanded={isExpanded}
               onExpand={() => setIsExpanded(!isExpanded)}
             />
          </div>
        </div>

        <div className="overflow-auto bg-transparent relative z-10">
          <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-start">
            {/* Team Milestones */}
            <div className="flex flex-col">
              <h4 className="font-black text-neutral-400 uppercase tracking-[0.2em] text-xs mb-6 flex items-center gap-2 pl-2">
                <Users className="w-4 h-4 text-indigo-400" /> Equipos
              </h4>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-3"
              >
                  {teamMilestones.map((m, idx) => (
                    <motion.div variants={itemVariants} whileHover={{ x: 4 }} key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-neutral-100 shadow-sm rounded-2xl hover:shadow-md transition-all group gap-3 sm:gap-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden text-indigo-500">
                            {m.icon}
                          </div>
                          <div className="sm:hidden text-xs font-mono tabular-nums text-neutral-400 font-bold whitespace-nowrap uppercase tracking-widest">
                            {m.date}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-neutral-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors break-words">{m.label}</h5>
                          <span className="inline-flex items-center px-2.5 py-0.5 mt-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider border border-indigo-100 break-words overflow-hidden text-ellipsis max-w-full">
                            {m.team}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block text-xs font-mono tabular-nums text-neutral-400 font-bold whitespace-nowrap ml-4 uppercase tracking-widest">
                        {m.date}
                      </div>
                    </motion.div>
                  ))}
                  {teamMilestones.length === 0 && (
                    <div className="p-8 text-center text-neutral-400 font-medium">
                      Aún no hay hitos de equipos.
                    </div>
                  )}
              </motion.div>
            </div>

            {/* Cyclist Milestones */}
            <div className="flex flex-col">
              <h4 className="font-black text-neutral-400 uppercase tracking-[0.2em] text-xs mb-6 flex items-center gap-2 pl-2">
                <Medal className="w-4 h-4 text-rose-400" /> Ciclistas
              </h4>
              <motion.div 
                 variants={containerVariants}
                 initial="hidden"
                 animate="show"
                 className="flex flex-col gap-3"
              >
                  {cyclistMilestones.map((m, idx) => (
                    <motion.div variants={itemVariants} whileHover={{ x: 4 }} key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-neutral-100 shadow-sm rounded-2xl hover:shadow-md transition-all group gap-3 sm:gap-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden text-rose-500">
                            {m.icon}
                           </div>
                           <div className="sm:hidden text-xs font-mono tabular-nums text-neutral-400 font-bold whitespace-nowrap uppercase tracking-widest">
                             {m.date}
                           </div>
                         </div>
                         <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-neutral-900 text-sm leading-tight group-hover:text-rose-600 transition-colors break-words">{m.label}</h5>
                          <span className="inline-flex items-center px-2.5 py-0.5 mt-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-[10px] uppercase tracking-wider border border-rose-100 break-words overflow-hidden text-ellipsis max-w-full">
                            {m.cyclist}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block text-xs font-mono tabular-nums text-neutral-400 font-bold whitespace-nowrap ml-4 uppercase tracking-widest">
                        {m.date}
                      </div>
                    </motion.div>
                  ))}
                  {cyclistMilestones.length === 0 && (
                    <div className="p-8 text-center text-neutral-400 font-medium">
                      Aún no hay hitos de ciclistas.
                    </div>
                  )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
