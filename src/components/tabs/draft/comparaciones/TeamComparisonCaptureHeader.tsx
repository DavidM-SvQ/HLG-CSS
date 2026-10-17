import React from "react";
import { cn } from "../../../../lib/utils";

export interface TeamComparisonCaptureHeaderProps {
  summaryA: any;
  summaryB: any;
  teamA: string;
  teamB: string;
  totalPointsDiff: number;
  className?: string;
}

export const TeamComparisonCaptureHeader: React.FC<TeamComparisonCaptureHeaderProps> = ({
  summaryA,
  summaryB,
  teamA,
  teamB,
  totalPointsDiff,
  className,
}) => {
  const nameA = summaryA?.name || teamA;
  const nameB = summaryB?.name || teamB;
  const userA = summaryA?.jugador || "";
  const userB = summaryB?.jugador || "";
  const ptsA = summaryA?.totalPts ?? summaryA?.puntos ?? 0;
  const ptsB = summaryB?.totalPts ?? summaryB?.puntos ?? 0;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-neutral-200/90 p-3 mb-4 shadow-2xs overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Equipo A */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            🛡️
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-sm sm:text-base text-neutral-900 truncate">
                {nameA}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded">
                A
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1.5 mt-0.5">
              {userA && <span className="font-medium">👤 {userA}</span>}
              {userA && <span>•</span>}
              <span className="font-mono font-black text-orange-700">
                {ptsA.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>

        {/* VS Badge */}
        <div className="flex flex-col items-center justify-center shrink-0 px-1 sm:px-3">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full shadow-2xs">
            VS
          </span>
          <span
            className={cn(
              "text-[10px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded",
              totalPointsDiff > 0
                ? "text-orange-800 bg-orange-50 border border-orange-200"
                : totalPointsDiff < 0
                ? "text-purple-800 bg-purple-50 border border-purple-200"
                : "text-neutral-600 bg-neutral-100"
            )}
          >
            {totalPointsDiff > 0
              ? `+${totalPointsDiff.toLocaleString()} A`
              : totalPointsDiff < 0
              ? `+${Math.abs(totalPointsDiff).toLocaleString()} B`
              : "Empate"}
          </span>
        </div>

        {/* Equipo B */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end text-right">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 justify-end flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                B
              </span>
              <span className="font-black text-sm sm:text-base text-neutral-900 truncate">
                {nameB}
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 truncate flex items-center justify-end gap-1.5 mt-0.5">
              <span className="font-mono font-black text-purple-700">
                {ptsB.toLocaleString()} pts
              </span>
              {userB && <span>•</span>}
              {userB && <span className="font-medium">👤 {userB}</span>}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            🛡️
          </div>
        </div>
      </div>
    </div>
  );
};
