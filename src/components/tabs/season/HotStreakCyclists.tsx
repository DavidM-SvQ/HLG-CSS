import React, { useContext, useState, useRef, useEffect } from "react";
import { useUrlState } from "../../../hooks/useUrlState";
import { SeasonViewContext } from "./SeasonViewContext";
import { Copy, Download, Maximize2, Minimize2 } from "lucide-react";
import { copyImageToClipboard } from "../../../lib/clipboard";
import { useHotStreaks } from "../../../lib/hooks/useHotStreaks";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { Button } from "../../ui/button";
import { motion } from "motion/react";
import { useDebounce } from "../../../lib/hooks/useDebounce";

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
    if (debouncedMinPoints !== hotStreakMinPoints) setHotStreakMinPoints(debouncedMinPoints);
  }, [debouncedMinPoints, hotStreakMinPoints, setHotStreakMinPoints]);
  
  useEffect(() => {
    if (debouncedMaxPoints !== hotStreakMaxPoints) setHotStreakMaxPoints(debouncedMaxPoints);
  }, [debouncedMaxPoints, hotStreakMaxPoints, setHotStreakMaxPoints]);
  
  useEffect(() => {
    if (hotStreakMinPoints !== "" && localMinPoints === "") setLocalMinPoints(hotStreakMinPoints); // Sync back
  }, [hotStreakMinPoints, localMinPoints]);
  
  const { handleCopyImage, handleDownloadImage, isCopying } = useTableScreenshot(chartRef);

  const handleCopy = async () => {
    await handleCopyImage({
      fileName: "rachas-puntos-ciclistas.png",
      scale: 2,
      backgroundColor: "#ffffff",
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      style: {
        fontFamily: "Inter, sans-serif",
        padding: "24px",
        borderRadius: "24px",
      }
    });
  };

  const handleDownload = async () => {
    await handleDownloadImage({
      fileName: "rachas-puntos-ciclistas.png",
      scale: 2,
      backgroundColor: "#ffffff",
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      style: {
        fontFamily: "Inter, sans-serif",
        padding: "24px",
        borderRadius: "24px",
      }
    });
  };

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

  if (!hotStreaksData || hotStreaksData.items.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, ease: "easeOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } }
  };

  return (
    <div className={cn("bg-white border text-sm border-neutral-200 rounded-3xl shadow-sm flex flex-col mt-6 relative overflow-hidden", isExpanded ? "fixed inset-4 z-50 shadow-2xl" : "h-auto")} ref={chartRef}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-orange-100/50 via-rose-50/20 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="px-6 py-5 border-b border-neutral-100 flex flex-col gap-4 bg-white/50 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
              <span role="img" aria-label="fire" className="text-2xl drop-shadow-sm">🔥</span> Rachas de Ciclistas
            </h2>
            <p className="text-sm font-medium text-neutral-500 mt-1">
              Top Ciclistas con más puntos sumados en el periodo seleccionado.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-xl border border-neutral-200 shadow-sm relative z-10 hidden sm:flex copy-button-ignore">
             <Button variant="ghost" size="icon" onClick={handleCopy} className={cn("p-1.5 rounded-lg transition-colors", isCopying ? "bg-green-50 text-green-600" : "hover:bg-neutral-100 text-neutral-500")} title="Copiar al portapapeles">
               <Copy className="w-4 h-4" />
             </Button>
             <Button variant="ghost" size="sm" onClick={handleDownload} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors" title="Descargar ranking">
               <Download className="w-4 h-4" />
             </Button>
             <div className="w-px h-5 bg-neutral-200 mx-1"></div>
             <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors" title={isExpanded ? "Contraer" : "Expandir"}>
               {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
             </Button>
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
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {hotStreaksData.items.length > 0 ? hotStreaksData.items.map((c, i) => (
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
                  return (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.1, y: -2 }}
                      className={`w-9 text-center py-1 rounded border overflow-hidden ${qualifies ? 'bg-gradient-to-t from-orange-100 to-orange-50 border-orange-200 shadow-sm text-orange-700 font-black' : 'bg-neutral-50 border-neutral-100 text-neutral-400 font-semibold'}`} 
                      title={`Semana ${idx + 1}: ${pts} pts`}
                    >
                      <span className="text-[10px] block opacity-50 uppercase tracking-widest leading-none mb-0.5">S{idx+1}</span>
                      <span className="text-xs leading-none">{pts}</span>
                    </motion.div>
                  );
               })}
             </div>
            </motion.div>
          )) : (
            <div className="text-neutral-400 italic text-sm py-4 col-span-full">No hay datos suficientes recientes o no cumplen los filtros de puntos.</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
