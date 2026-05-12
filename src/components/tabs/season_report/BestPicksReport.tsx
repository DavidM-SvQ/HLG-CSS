import React, { useRef } from "react";
import { Star } from "lucide-react";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { cn } from "../../../lib/utils";

interface BestPicksReportProps {
  monthReportData: any;
  monthsText: string;
}

export const BestPicksReport: React.FC<BestPicksReportProps> = ({
  monthReportData,
  monthsText,
}) => {
  const ref12 = useRef<HTMLDivElement>(null);

  if (!monthReportData) return null;

  return (
    <div className="mt-8 bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto" ref={ref12}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start mb-6 gap-4">
        <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" /> Mejores picks por equipo {monthsText ? ` [${monthsText}]` : ""}
        </h3>
        <ExportToolbar targetRef={ref12} filename="mejores-picks" />
      </div>
      
      <div className="space-y-3 max-w-3xl">
         {monthReportData.bestPicks.map((p: any, idx: number) => {
           const maxPicks = monthReportData.bestPicks[0]?.count || 1;
           const width = `${(p.count / maxPicks) * 100}%`;
           return (
             <div key={idx} className="flex items-center gap-4">
               <div className="w-40 text-sm font-semibold text-neutral-700 truncate text-right" title={p.team}>
                 {p.team}
               </div>
               <div className="flex-1 bg-neutral-200 h-7 rounded-md overflow-hidden relative flex items-center">
                 <div 
                   className="bg-yellow-400 h-full transition-all duration-1000 flex items-center absolute left-0 top-0" 
                   style={{ width }}
                 >
                 </div>
                 <span className={cn("text-xs font-bold z-10", (p.count / maxPicks) < 0.1 ? "text-yellow-600 ml-3" : "text-yellow-900 ml-3")}>
                     {p.count} {p.count === 1 ? "pick" : "picks"}
                 </span>
               </div>
             </div>
           );
         })}
         {monthReportData.bestPicks.length === 0 && (
           <p className="text-sm text-neutral-500 italic">No hay datos suficientes de rondas.</p>
         )}
      </div>
    </div>
  );
};
