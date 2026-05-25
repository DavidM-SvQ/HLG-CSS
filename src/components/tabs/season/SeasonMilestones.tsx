import { AppState, PlayerScore, CyclistMetadata } from '../../../lib/types';
import { useSeasonMilestonesLogic } from "./hooks/useSeasonMilestonesLogic";
import React, { useMemo, useRef, useState } from "react";
import { formatNumberSpanish, getVal } from "../../../lib/data-processing";
import { Award, Trophy, Crown, Flag, Maximize2, Minimize2, Copy, Download, Globe, Users, Medal, CheckCircle2 } from "lucide-react";
import { expandNodeForCapture } from "../../../lib/dom-utils";
import { cn } from "../../../lib/utils";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { Button } from "../../ui/button";
import { motion } from "motion/react";

export const SeasonMilestones = ({ leaderboard, files, cyclistMetadata, raceWinners }: { leaderboard: PlayerScore[]; files: AppState; cyclistMetadata: Record<string, CyclistMetadata>; raceWinners?: Record<string, string> }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleCopyImage, handleDownloadImage, isCopying } = useTableScreenshot(containerRef);

  const { teamMilestones, cyclistMilestones } = useSeasonMilestonesLogic({ leaderboard, files, cyclistMetadata, raceWinners });


  const handleCopy = async () => {
    await handleCopyImage({ scale: 2, backgroundColor: "#ffffff", style: { overflow: "visible" }, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")) });
  };

  const handleDownload = async () => {
    await handleDownloadImage({ fileName: "hitos_temporada.png", scale: 2, backgroundColor: "#ffffff", style: { overflow: "visible" }, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")) });
  };

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
          <div className="flex items-center gap-2 copy-button-ignore">
             <Button variant="ghost" size="icon" onClick={handleCopy} className={cn("p-1.5 rounded-lg transition-colors", isCopying ? "bg-green-50 text-green-600" : "hover:bg-neutral-100 text-neutral-500")} title="Copiar al portapapeles">
               <Copy className="w-4 h-4" />
             </Button>
             <Button variant="ghost" size="sm" onClick={handleDownload} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors" title="Descargar">
               <Download className="w-4 h-4" />
             </Button>
             <div className="w-px h-5 bg-neutral-200 mx-1"></div>
             <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors" title={isExpanded ? "Contraer" : "Expandir"}>
               {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
             </Button>
          </div>
        </div>

        <div className="overflow-auto bg-transparent relative z-10">
          <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start min-w-[700px]">
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
                    <motion.div variants={itemVariants} whileHover={{ x: 4 }} key={idx} className="flex items-center justify-between p-4 bg-white border border-neutral-100 shadow-sm rounded-2xl hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden text-indigo-500">
                          {m.icon}
                        </div>
                        <div>
                          <h5 className="font-bold text-neutral-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">{m.label}</h5>
                          <span className="inline-flex items-center px-2.5 py-0.5 mt-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider border border-indigo-100">
                            {m.team}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-mono tabular-nums text-neutral-400 font-bold whitespace-nowrap ml-4 uppercase tracking-widest">
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
                    <motion.div variants={itemVariants} whileHover={{ x: 4 }} key={idx} className="flex items-center justify-between p-4 bg-white border border-neutral-100 shadow-sm rounded-2xl hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden text-rose-500">
                          {m.icon}
                         </div>
                         <div>
                          <h5 className="font-bold text-neutral-900 text-sm leading-tight group-hover:text-rose-600 transition-colors">{m.label}</h5>
                          <span className="inline-flex items-center px-2.5 py-0.5 mt-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-[10px] uppercase tracking-wider border border-rose-100">
                            {m.cyclist}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-mono tabular-nums text-neutral-400 font-bold whitespace-nowrap ml-4 uppercase tracking-widest">
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
