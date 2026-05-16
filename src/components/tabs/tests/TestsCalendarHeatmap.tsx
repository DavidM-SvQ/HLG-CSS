import React, { useMemo, useState } from 'react';
import { Button } from "../../ui/button";

// Utility to get ISO week number
function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}

interface TestsCalendarHeatmapProps {
  files: any;
  playerTeamMap: Record<string, string>;
  leaderboard?: any[];
}

export function TestsCalendarHeatmap({ leaderboard }: TestsCalendarHeatmapProps) {
  const [viewMode, setViewMode] = useState<"teams" | "cyclists">("teams");

  const [heatmapData, activeYear] = useMemo(() => {
    if (!leaderboard) return [{ map: new Map<string, Map<number, number>>(), maxScore: 0, targets: []}, new Date().getFullYear()];

    let activeYearTmp = new Date().getFullYear();
    const scores = new Map<string, Map<number, number>>();
    let globalMax = 0;

    leaderboard.forEach((player) => {
      const team = player.nombreEquipo;
      if (team === "No draft" || team === "Libre") return;

      player.detalles.forEach((d: any) => {
        if (d.puntosObtenidos > 0 && d.fecha) {
          // d.fecha is guaranteed to be YYYY-MM-DD from the hook fix
          const parts = d.fecha.split('-');
          if (parts.length === 3) {
             const year = parseInt(parts[0]);
             const month = parseInt(parts[1]) - 1;
             const day = parseInt(parts[2]);
             const dateObj = new Date(year, month, day);
           
             activeYearTmp = year; // simplistic, assume most dates are in season year
             const weekNum = getISOWeek(dateObj);
             
             const target = viewMode === "teams" ? team : d.ciclista;
             
             if (!scores.has(target)) {
               scores.set(target, new Map());
             }
             
             const current = scores.get(target)!.get(weekNum) || 0;
             const newScore = current + d.puntosObtenidos;
             scores.get(target)!.set(weekNum, newScore);
          }
        }
      });
    });

    const targetTotals = Array.from(scores.entries()).map(([target, weekMap]) => {
      let total = 0;
      weekMap.forEach(v => total += v);
      return { target, total };
    });

    targetTotals.sort((a,b) => b.total - a.total);
    const finalTargets = targetTotals.map(t => t.target).slice(0, viewMode === "teams" ? 100 : 50);

    finalTargets.forEach(t => {
      scores.get(t)?.forEach(s => {
        if (s > globalMax) globalMax = s;
      });
    });

    return [{ map: scores, maxScore: globalMax, targets: finalTargets }, activeYearTmp];
  }, [leaderboard, viewMode]);

  const getColor = (score: number) => {
    if (score === 0) return "bg-neutral-50";
    if (heatmapData.maxScore === 0) return "bg-blue-100";
    const ratio = score / heatmapData.maxScore;
    if (ratio < 0.2) return "bg-blue-200";
    if (ratio < 0.4) return "bg-blue-400";
    if (ratio < 0.6) return "bg-blue-600";
    if (ratio < 0.8) return "bg-blue-700";
    return "bg-blue-900";
  };

  const weeks = Array.from({length: 52}, (_, i) => i + 1);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden p-6 w-full col-span-1 xl:col-span-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Heatmap Semanal ({activeYear})</h2>
          <p className="text-sm text-neutral-500 mt-1">Intensidad de puntos generados por cada semana del año.</p>
        </div>
        
        <div className="flex gap-2">
           <Button variant="outline"
             onClick={() => setViewMode("teams")}
             className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${viewMode === 'teams' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
           >
             Equipos
           </Button>
           <Button variant="outline"
             onClick={() => setViewMode("cyclists")}
             className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${viewMode === 'cyclists' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
           >
             Top 50 Ciclistas
           </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[1000px] flex">
           {/* Left Labels */}
           <div className="flex flex-col pr-4 flex-shrink-0 w-36">
             <div className="h-6 mb-2"></div> {/* Header spacing */}
             {heatmapData.targets.map(t => (
               <div key={t} className="h-6 flex items-center text-xs text-neutral-600 font-medium truncate" title={t}>
                 {t}
               </div>
             ))}
           </div>
           
           {/* Heatmap Grid */}
           <div className="flex-1 overflow-x-auto flex flex-col">
             {/* Header Weeks */}
             <div className="flex mb-2">
               {weeks.map(w => (
                 <div key={w} className="w-6 flex-shrink-0 flex items-center justify-center text-[10px] text-neutral-400">
                   {w % 5 === 0 || w === 1 ? `S${w}` : ''}
                 </div>
               ))}
             </div>
             
             {/* Rows */}
             {heatmapData.targets.map(target => (
               <div key={target} className="flex">
                 {weeks.map(w => {
                   const score = heatmapData.map.get(target)?.get(w) || 0;
                   return (
                     <div key={w} className="w-6 h-6 p-0.5 flex-shrink-0">
                       <div 
                         className={`w-full h-full rounded-[3px] transition-all hover:ring-2 hover:ring-black hover:ring-offset-1 cursor-crosshair ${getColor(score)}`}
                         title={`${target} - Sem ${w}: ${Math.round(score)} pts`}
                       />
                     </div>
                   );
                 })}
               </div>
             ))}
           </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 items-center mt-4 text-xs text-neutral-500">
        <span>Menos puntos</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-sm bg-neutral-50 border border-neutral-100" />
          <div className="w-4 h-4 rounded-sm bg-blue-200" />
          <div className="w-4 h-4 rounded-sm bg-blue-400" />
          <div className="w-4 h-4 rounded-sm bg-blue-600" />
          <div className="w-4 h-4 rounded-sm bg-blue-700" />
          <div className="w-4 h-4 rounded-sm bg-blue-900" />
        </div>
        <span>Más puntos</span>
      </div>
    </div>
  );
}

