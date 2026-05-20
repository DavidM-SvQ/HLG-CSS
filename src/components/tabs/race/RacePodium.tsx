import React from "react";
import { Trophy } from "lucide-react";
import { cn } from "../../../lib/utils";

interface RacePodiumProps {
  rankedTeams: any[];
}

export const RacePodium = ({ rankedTeams }: RacePodiumProps) => {
  const filteredTeams = rankedTeams.filter(
    (t) => t.nombreEquipo !== "No draft" && t.nombreEquipo !== "No draft [99]"
  );

  if (!filteredTeams || filteredTeams.length === 0) return null;

  const top3 = filteredTeams.slice(0, 3);
  
  // order 2, 1, 3 for podium display
  const podiumOrder = [
    top3[1], // 2nd
    top3[0], // 1st
    top3[2], // 3rd
  ].filter(Boolean);

  return (
    <div className="mb-12 bg-gradient-to-b from-blue-50/50 to-white pt-8 pb-4 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden mt-6">
      <div className="text-center mb-8 relative z-10">
        <h3 className="text-2xl font-black text-blue-900 tracking-tight flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Podio de la Carrera
        </h3>
      </div>
      
      <div className="flex justify-center items-end gap-2 md:gap-6 h-[170px] px-4 relative z-10">
        {podiumOrder.map((team, idx) => {
           const position = top3.findIndex(t => t.jugador === team.jugador) + 1;
           const height = position === 1 ? "h-32" : position === 2 ? "h-24" : "h-20";
           const bgClass = position === 1 ? "from-yellow-200 to-yellow-100 border-yellow-300" : position === 2 ? "from-slate-200 to-slate-100 border-slate-300" : "from-orange-200 to-orange-100 border-orange-300";
           const numColor = position === 1 ? "text-yellow-600" : position === 2 ? "text-slate-500" : "text-orange-600";
           
           return (
             <div key={team.jugador} className="flex flex-col items-center w-28 md:w-36 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${position * 150}ms` }}>
                <div className="text-center mb-2 w-full">
                   <div className="font-bold text-sm md:text-base leading-tight w-full truncate px-1 text-slate-800" title={team.nombreEquipo}>{team.nombreEquipo}</div>
                   <div className="text-xs font-mono tabular-nums font-semibold text-slate-500">{team.totalPoints} pts</div>
                </div>
                <div className={cn("w-full rounded-t-xl bg-gradient-to-t border-t-2 flex flex-col justify-start items-center pt-2 shadow-inner", height, bgClass)}>
                   <span className={cn("text-3xl font-black opacity-30 mt-2", numColor)}>
                     {position}
                   </span>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};
