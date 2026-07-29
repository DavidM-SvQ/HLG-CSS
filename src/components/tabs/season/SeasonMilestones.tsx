import { AppState, PlayerScore, CyclistMetadata } from '../../../lib/types';
import { useSeasonMilestonesLogic, MilestoneItem } from "./hooks/useSeasonMilestonesLogic";
import React, { useRef, useState } from "react";
import { Flag, Users, Medal, Info, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { ExportToolbar } from "../../ui/ExportToolbar";

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const MilestoneCard = ({ m, type }: { m: MilestoneItem; type: 'team' | 'cyclist' }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isTeam = type === 'team';
  const themeBg = isTeam ? 'bg-indigo-50/50' : 'bg-rose-50/50';
  const themeBorder = isTeam ? 'border-indigo-100' : 'border-rose-100';
  const themeText = isTeam ? 'text-indigo-500' : 'text-rose-500';
  const themeBadgeBg = isTeam ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-rose-50 text-rose-700 border-rose-100';
  const themeHoverText = isTeam ? 'group-hover:text-indigo-600' : 'group-hover:text-rose-600';

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If there's less than 320px below, open upward
      if (spaceBelow < 320) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
    setShowPopup(true);
  };

  return (
    <div 
      ref={cardRef}
      className="relative group z-10 hover:z-30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowPopup(false)}
    >
      <motion.div 
        variants={itemVariants} 
        whileHover={{ x: 4 }} 
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-neutral-100 shadow-sm rounded-2xl hover:shadow-md transition-all group gap-3 sm:gap-0 cursor-pointer relative"
        onClick={() => {
          if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setOpenUpward(window.innerHeight - rect.bottom < 320);
          }
          setShowPopup(!showPopup);
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden", themeBg, themeBorder, themeText)}>
              {m.icon}
            </div>
            <div className="sm:hidden text-xs font-mono tabular-nums text-neutral-400 font-bold whitespace-nowrap uppercase tracking-widest">
              {m.date}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h5 className={cn("font-bold text-neutral-900 text-sm leading-tight transition-colors break-words", themeHoverText)}>{m.label}</h5>
              <button 
                type="button" 
                className="text-neutral-400 hover:text-blue-600 transition-colors p-0.5 rounded-full shrink-0"
                title="Ver detalles del hito"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPopup(!showPopup);
                }}
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <span className={cn("inline-flex items-center px-2.5 py-0.5 mt-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border break-words overflow-hidden text-ellipsis max-w-full", themeBadgeBg)}>
              {isTeam ? m.team : m.cyclist}
            </span>
          </div>
        </div>
        <div className="hidden sm:block text-xs font-mono tabular-nums text-neutral-400 font-bold whitespace-nowrap ml-4 uppercase tracking-widest">
          {m.date}
        </div>
      </motion.div>

      {/* Hover Popup (Light Theme) */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: openUpward ? -8 : 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpward ? -6 : 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute left-0 right-0 sm:left-auto sm:right-0 sm:w-[420px] z-50 p-4 bg-white/95 backdrop-blur-md text-neutral-800 rounded-2xl shadow-xl border border-neutral-200/90 pointer-events-auto",
              openUpward ? "bottom-full mb-2" : "top-full mt-2"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-3 pb-3 mb-3 border-b border-neutral-100">
              <div className={cn("p-2 rounded-xl bg-neutral-50 border border-neutral-200/80 shadow-sm shrink-0", themeText)}>
                {m.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  {isTeam ? "Hito de Equipo" : "Hito de Ciclista"}
                </div>
                <div className="font-extrabold text-sm text-neutral-900 leading-snug">
                  {m.title || m.label}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Explicación Teórica */}
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Explicación Teórica</span>
                </div>
                <p className="text-amber-950/90 leading-relaxed font-normal">
                  {m.explanation}
                </p>
                {m.triggerDetails && (
                  <div className="mt-2 text-[11px] text-amber-800 border-t border-amber-200/60 pt-1.5 font-mono">
                    <strong className="text-amber-900 font-semibold">Activación:</strong> {m.triggerDetails}
                  </div>
                )}
              </div>

              {/* Datos de Por qué ha logrado el hito */}
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Datos del Logro</span>
                </div>
                <p className="text-emerald-950 font-medium leading-relaxed">
                  {m.details || `${isTeam ? m.team : m.cyclist} cumplió este hito el ${m.date}.`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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

        <div className="overflow-visible bg-transparent relative z-10">
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
                    <MilestoneCard key={m.id + '_' + idx} m={m} type="team" />
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
                    <MilestoneCard key={m.id + '_' + idx} m={m} type="cyclist" />
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
