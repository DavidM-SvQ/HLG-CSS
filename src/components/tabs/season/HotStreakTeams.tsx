import React, { useContext, useState, useRef } from "react";
import { SeasonViewContext } from "./SeasonViewContext";
import { Copy, Download, Maximize2, Minimize2 } from "lucide-react";
import { expandNodeForCapture } from "../../../lib/dom-utils";
import { copyImageToClipboard } from "../../../lib/clipboard";
import { useHotStreaksTeams } from "../../../lib/hooks/useHotStreaks";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";

export function HotStreakTeams() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const { files, cyclistMetadata, playerTeamMap, playerOrderMap, cn } = context;

  const chartRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [hotStreakMinPoints, setHotStreakMinPoints] = useState<number | "">(1);
  const [hotStreakMaxPoints, setHotStreakMaxPoints] = useState<number | "">("");
  const [hotStreakLastNWeeks, setHotStreakLastNWeeks] = useState<number>(4);
  
  const { handleCopyImage, handleDownloadImage, isCopying } = useTableScreenshot(chartRef);

  const handleCopy = async () => {
    await handleCopyImage({
      fileName: "rachas-puntos-equipos.png",
      scale: 2,
      backgroundColor: "#ffffff",
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      style: {
        fontFamily: "Inter, sans-serif",
        padding: "24px",
        borderRadius: "16px",
      }
    });
  };

  const handleDownload = async () => {
    await handleDownloadImage({
      fileName: "rachas-puntos-equipos.png",
      scale: 2,
      backgroundColor: "#ffffff",
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      style: {
        fontFamily: "Inter, sans-serif",
        padding: "24px",
        borderRadius: "16px",
      }
    });
  };

  const hotStreaksData = useHotStreaksTeams(
    files, 
    cyclistMetadata, 
    playerTeamMap, 
    playerOrderMap, 
    hotStreakLastNWeeks, 
    hotStreakMinPoints, 
    hotStreakMaxPoints
  );

  if (!hotStreaksData || hotStreaksData.items.length === 0) return null;

  return (
    <div className={cn("bg-white border border-neutral-200 rounded-2xl shadow-sm flex flex-col mt-6", isExpanded ? "fixed inset-4 z-50 overflow-hidden shadow-2xl" : "h-auto")} ref={chartRef}>
      <div className="px-6 py-5 border-b border-neutral-100 flex flex-col gap-4 bg-neutral-50/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <span role="img" aria-label="fire">🔥</span> Rachas de puntos - Equipos
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Top 20 Equipos con más puntos sumados en el periodo seleccionado.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-neutral-200 shadow-sm relative z-10 hidden sm:flex">
             <button onClick={handleCopy} className={cn("p-1.5 rounded-md transition-colors", isCopying ? "bg-green-50 text-green-600" : "hover:bg-neutral-100 text-neutral-500")} title="Copiar al portapapeles">
               <Copy className="w-4 h-4" />
             </button>
             <button onClick={handleDownload} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 transition-colors" title="Descargar ranking">
               <Download className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-neutral-300 mx-1"></div>
             <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 transition-colors" title={isExpanded ? "Contraer" : "Expandir"}>
               {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
             </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
           <div className="flex flex-col gap-1 w-full sm:w-auto">
             <label className="text-xs font-semibold text-neutral-500 uppercase">Período</label>
             <select
               className="text-sm border-neutral-300 rounded focus:ring-rose-500 focus:border-rose-500"
               value={hotStreakLastNWeeks}
               onChange={(e) => setHotStreakLastNWeeks(Number(e.target.value))}
             >
               <option value={2}>Últimas 2 semanas</option>
               <option value={4}>Últimas 4 semanas</option>
               <option value={8}>Últimas 8 semanas</option>
             </select>
           </div>
           
           <div className="flex flex-col gap-1 w-full sm:w-auto">
             <label className="text-xs font-semibold text-neutral-500 uppercase">Puntos sumados</label>
             <div className="flex items-center gap-2">
               <input
                 type="number"
                 placeholder="Min (1)"
                 className="text-sm border-neutral-300 rounded focus:ring-rose-500 focus:border-rose-500 w-24"
                 value={hotStreakMinPoints === "" ? "" : hotStreakMinPoints}
                 onChange={(e) => setHotStreakMinPoints(e.target.value === "" ? "" : Number(e.target.value))}
               />
               <span className="text-neutral-400">-</span>
               <input
                 type="number"
                 placeholder="Max (∞)"
                 className="text-sm border-neutral-300 rounded focus:ring-rose-500 focus:border-rose-500 w-24"
                 value={hotStreakMaxPoints === "" ? "" : hotStreakMaxPoints}
                 onChange={(e) => setHotStreakMaxPoints(e.target.value === "" ? "" : Number(e.target.value))}
               />
             </div>
           </div>
        </div>
      </div>
      
      <div className={cn("p-6 flex-1 overflow-auto", isExpanded ? "h-0" : "")}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {hotStreaksData.items.length > 0 ? hotStreaksData.items.map((t, i) => (
            <div key={i} className="flex flex-col bg-neutral-50 border border-neutral-100 p-2.5 rounded-xl gap-2">
              <div className="flex items-start gap-2">
                <span className="font-black text-rose-500 bg-rose-50 w-6 h-6 flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">{i+1}</span>
                <div className="flex flex-col flex-grow min-w-0">
                   <div className="flex justify-between items-start">
                     <span className="font-bold text-neutral-800 text-sm line-clamp-1" title={t.name}>{t.name}</span>
                     <span className="font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-neutral-200 text-neutral-700 text-xs whitespace-nowrap ml-2">{Math.round(t.pointsInPeriod)} pts</span>
                   </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-1 pl-8">
               {t.pointsPerWeek.map((pts: number, idx: number) => {
                  const qualifies = pts > 0;
                  return (
                    <div key={idx} className={`w-8 text-center text-[10px] py-0.5 rounded ${qualifies ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-neutral-200 text-neutral-500'}`} title={`Semana ${idx + 1}: ${pts} pts`}>
                      {pts}
                    </div>
                  );
               })}
             </div>
            </div>
          )) : (
            <div className="text-neutral-400 italic text-sm py-4 col-span-full">No hay datos suficientes recientes o no cumplen los filtros de puntos.</div>
          )}
        </div>
      </div>
    </div>
  );
}
