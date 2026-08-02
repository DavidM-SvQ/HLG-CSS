import React, { useContext, useState, useRef, useEffect } from "react";
import { useUrlState } from "../../../hooks/useUrlState";
import { SeasonViewContext } from "./SeasonViewContext";
import { EmptyState } from "../../ui/EmptyState";
import { useHotStreaks } from "../../../lib/hooks/useHotStreaks";
import { motion } from "motion/react";
import { useDebounce } from "../../../lib/hooks/useDebounce";
import { ExportToolbar } from "../../ui/ExportToolbar";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Info } from "lucide-react";

export function HotStreakCyclists() {
  const context = useContext(SeasonViewContext)!;
  const { files, cyclistMetadata, playerTeamMap, playerOrderMap, cyclistRoundMap, cn } = context;

  const chartRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [hotStreakMinPoints, setHotStreakMinPoints] = useUrlState<number | "">("hotStreakMinPoints", 1);
  const [hotStreakMaxPoints, setHotStreakMaxPoints] = useUrlState<number | "">("hotStreakMaxPoints", "");
  const [hotStreakLastNWeeks, setHotStreakLastNWeeks] = useUrlState<number>("hotStreakLastNWeeks", 4);
  const [hotStreakCyclistsLimit, setHotStreakCyclistsLimit] = useUrlState<number>("hotStreakCyclistsLimit", 10);
  
  const [localMinPoints, setLocalMinPoints] = useState<number | "">(hotStreakMinPoints);
  const [localMaxPoints, setLocalMaxPoints] = useState<number | "">(hotStreakMaxPoints);
  
  const debouncedMinPoints = useDebounce(localMinPoints, 400);
  const debouncedMaxPoints = useDebounce(localMaxPoints, 400);
  
  useEffect(() => {
    if (String(debouncedMinPoints) !== String(hotStreakMinPoints)) setHotStreakMinPoints(debouncedMinPoints);
  }, [debouncedMinPoints, hotStreakMinPoints, setHotStreakMinPoints]);
  
  useEffect(() => {
    if (String(debouncedMaxPoints) !== String(hotStreakMaxPoints)) setHotStreakMaxPoints(debouncedMaxPoints);
  }, [debouncedMaxPoints, hotStreakMaxPoints, setHotStreakMaxPoints]);
  
  useEffect(() => {
    if (hotStreakMinPoints !== "" && localMinPoints === "") setLocalMinPoints(hotStreakMinPoints); // Sync back
  }, [hotStreakMinPoints, localMinPoints]);

  const hotStreaksData = useHotStreaks(
    files, 
    cyclistMetadata, 
    playerTeamMap, 
    playerOrderMap, 
    cyclistRoundMap, 
    hotStreakLastNWeeks, 
    hotStreakMinPoints, 
    hotStreakMaxPoints, 
    hotStreakCyclistsLimit
  );

  if (!hotStreaksData) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 400, damping: 25 } }
  };

  return (
    <div className={cn("bg-white border text-sm border-neutral-200 rounded-3xl shadow-sm flex flex-col mt-6 relative overflow-hidden", isExpanded ? "fixed inset-4 z-50 shadow-2xl" : "h-auto")} ref={chartRef}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-orange-100/50 via-rose-50/20 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="px-6 py-5 border-b border-neutral-100 flex flex-col gap-4 bg-white/50 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
              <span role="img" aria-label="fire" className="text-2xl drop-shadow-sm">🔥</span> Rachas de Ciclistas
              <TooltipProvider delay={100}>
                <Tooltip>
                  <TooltipTrigger className="bg-neutral-100 text-neutral-500 rounded-full p-1 cursor-help hover:bg-neutral-200 hover:text-neutral-700 transition">
                      <Info className="w-3.5 h-3.5" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs text-xs font-medium">
                    En las rachas las fechas se calculan usando la semana estándar de calendario ISO (lunes a domingo), a diferencia del gráfico mensual que usa cuartos estáticos del mes. Cada celda de la racha muestra los puntos del ciclista sumados en las carreras que finalizaron en la semana del calendario correspondiente.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h2>
            <p className="text-sm font-medium text-neutral-500 mt-1">
              Top Ciclistas con más puntos sumados en el periodo seleccionado.
            </p>
          </div>
          
          <div className="copy-button-ignore">
             <ExportToolbar
               targetRef={chartRef}
               filename="rachas-puntos-ciclistas"
               isExpanded={isExpanded}
               onExpand={() => setIsExpanded(!isExpanded)}
             />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/80 p-3 rounded-xl border border-neutral-200 shadow-sm copy-button-ignore">
           <div className="flex flex-col gap-1 w-full sm:w-auto">
             <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">Período</label>
             <select
               className="text-sm border-neutral-300 bg-neutral-50 rounded-lg focus:ring-rose-500 focus:border-rose-500 font-medium"
               value={hotStreakLastNWeeks}
               onChange={(e) => setHotStreakLastNWeeks(Number(e.target.value))}
             >
               <option value={2}>Últimas 2 semanas</option>
               <option value={4}>Últimas 4 semanas</option>
               <option value={8}>Últimas 8 semanas</option>
             </select>
           </div>
           
           <div className="flex flex-col gap-1 w-full sm:w-auto">
             <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">Puntos sumados</label>
             <div className="flex items-center gap-2">
               <input
                 type="number"
                 placeholder="Min (1)"
                 className="text-sm border-neutral-300 bg-neutral-50 rounded-lg focus:ring-rose-500 focus:border-rose-500 w-24 font-medium"
                 value={localMinPoints === "" ? "" : localMinPoints}
                 onChange={(e) => setLocalMinPoints(e.target.value === "" ? "" : Number(e.target.value))}
               />
               <span className="text-neutral-400 font-bold">-</span>
               <input
                 type="number"
                 placeholder="Max (∞)"
                 className="text-sm border-neutral-300 bg-neutral-50 rounded-lg focus:ring-rose-500 focus:border-rose-500 w-24 font-medium"
                 value={localMaxPoints === "" ? "" : localMaxPoints}
                 onChange={(e) => setLocalMaxPoints(e.target.value === "" ? "" : Number(e.target.value))}
               />
             </div>
           </div>

           <div className="flex flex-col gap-1 w-full sm:w-auto">
             <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-1">Top Ciclistas</label>
             <select
               className="text-sm border-neutral-300 bg-neutral-50 rounded-lg focus:ring-rose-500 focus:border-rose-500 font-medium"
               value={hotStreakCyclistsLimit}
               onChange={(e) => setHotStreakCyclistsLimit(Number(e.target.value))}
             >
               <option value={5}>Top 5</option>
               <option value={10}>Top 10</option>
               <option value={20}>Top 20</option>
               <option value={50}>Top 50</option>
             </select>
           </div>
        </div>
      </div>
      
      <div className={cn("p-6 flex-1 overflow-auto bg-transparent relative z-10", isExpanded ? "h-0" : "")}>
        <TooltipProvider delay={0}>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {hotStreaksData.items.length > 0 ? hotStreaksData.items.map((c: any, i: number) => (
              <motion.div variants={itemVariants} whileHover={{ y: -2, scale: 1.02 }} key={i} className="flex flex-col bg-white border border-neutral-200 p-3 rounded-2xl gap-3 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start gap-3">
                  <span className="font-black text-rose-600 bg-rose-50 w-7 h-7 flex items-center justify-center rounded-xl text-xs shrink-0 mt-0.5 group-hover:bg-rose-500 group-hover:text-white transition-colors">{i+1}</span>
                  <div className="flex flex-col flex-grow min-w-0">
                     <div className="flex justify-between items-start">
                       <div className="flex flex-col min-w-0">
                          <span className="font-bold text-neutral-900 text-sm line-clamp-1 h-[20px]" title={c.name}>{c.name}</span>
                          <span className="text-xs font-medium text-neutral-500 line-clamp-1 h-[16px]" title={c.team}>{c.team}</span>
                       </div>
                       <span className="font-black bg-neutral-900 text-white px-2 py-1 rounded-lg text-xs whitespace-nowrap ml-2 shadow-sm">{Math.round(c.pointsInPeriod)} pts</span>
                     </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-1 pl-10" style={{ perspective: "1000px" }}>
                 {c.pointsPerWeek.map((pts: number, idx: number) => {
                    const qualifies = pts > 0;
                    const weekDetails = c.pointsPerWeekDetails?.[idx]?.details || {};
                    const races = Object.entries(weekDetails).sort((a: any, b: any) => b[1] - a[1]);

                    return (
                      <React.Fragment key={idx}>
                        <Tooltip>
                        <TooltipTrigger render={<motion.div
                            whileHover={{ scale: 1.1, y: -2 }}
                            className={`w-9 text-center py-1 rounded border overflow-hidden cursor-default ${qualifies ? 'bg-gradient-to-t from-orange-100 to-orange-50 border-orange-200 shadow-sm text-orange-700 font-black' : 'bg-neutral-50 border-neutral-100 text-neutral-400 font-semibold'}`} 
                          />}>
                            <span className="text-[10px] block opacity-50 uppercase tracking-widest leading-none mb-0.5">S{idx+1}</span>
                            <span className="text-xs leading-none">{pts}</span>
                        </TooltipTrigger>
                        {qualifies && (
                          <TooltipContent className="bg-neutral-900 text-neutral-100 border-neutral-800 pointer-events-none p-2.5 shadow-xl">
                            <p className="font-bold text-[10px] text-neutral-400 mb-1 uppercase tracking-widest">Sem {idx + 1}</p>
                            <div className="flex flex-col gap-1.5">
                              {races.map(([raceName, points]) => (
                                <div key={raceName} className="flex justify-between items-center gap-4 text-xs whitespace-nowrap">
                                  <span className="font-medium opacity-90">{raceName.length > 25 ? raceName.substring(0, 25) + "..." : raceName}</span>
                                  <span className="font-bold text-orange-300">{Number(points)} pts</span>
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                      </React.Fragment>
                    );
                 })}
               </div>
              </motion.div>
            )) : (
              <div className="col-span-full">
                <EmptyState title="No hay rachas destacadas" description="No hay datos suficientes recientes o no cumplen los filtros de puntos." />
              </div>
            )}
          </motion.div>
        </TooltipProvider>
      </div>
    </div>
  );
}
