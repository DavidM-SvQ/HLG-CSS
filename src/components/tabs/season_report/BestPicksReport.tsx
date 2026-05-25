import React, { useRef, useState } from "react";
import { Star } from "lucide-react";
import { ReportCard } from "../../ui/ReportCard";
import { EmptyState } from "../../ui/EmptyState";
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
  const [isExpanded, setIsExpanded] = useState(false);

  if (!monthReportData) return null;

  return (
    <ReportCard
      title={`Mejores picks por equipo ${monthsText ? ` [${monthsText}]` : ""}`}
      icon={<Star />}
      filename="mejores-picks"
      ref={ref12}
      className="mt-8"
      toolbarProps={{
        isExpanded,
        onExpand: () => setIsExpanded(!isExpanded)
      }}
      bodyClassName={cn("bg-neutral-50 px-6 py-5 rounded-b-xl border-t border-neutral-100 overflow-auto crosshair-container", !isExpanded && "max-h-[800px]")}
    >
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
           <EmptyState title="Sin picks destacados" description="No hay datos suficientes de rondas." />
         )}
      </div>
    </ReportCard>
  );
};
