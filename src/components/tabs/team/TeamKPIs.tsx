import React from "react";
import { ArrowUpRight, Trophy, Users, LayoutGrid, UserMinus, Medal } from "lucide-react";
import { cn } from "../../../lib/utils";

interface TeamKPIsProps {
  teamPlayer: any;
  teamWins: number;
  teamPartialWins: number;
  avgAge: string | number;
  unscoredCount: number;
  currentPuesto: number;
  difConOrden: number;
}

export const TeamKPIs = ({
  teamPlayer,
  teamWins,
  teamPartialWins,
  avgAge,
  unscoredCount,
  currentPuesto,
  difConOrden,
}: TeamKPIsProps) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
        <Trophy className="w-4 h-4 text-blue-600 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-blue-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Puntos
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {teamPlayer?.puntos || 0}
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
        <Medal className="w-4 h-4 text-yellow-500 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-yellow-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Victorias
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {teamWins}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
        <Medal className="w-4 h-4 text-amber-500 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-amber-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Vict. Parc.
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {teamPartialWins}
        </p>
      </div>

      <div className="bg-green-50 border border-green-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
        <Users className="w-4 h-4 text-green-600 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-green-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Edad Media
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {avgAge}
        </p>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
        <UserMinus className="w-4 h-4 text-red-600 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-red-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Sin puntuar
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {unscoredCount}
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
        <LayoutGrid className="w-4 h-4 text-purple-600 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-purple-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Puesto
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {currentPuesto}
        </p>
      </div>

      <div
        className={cn(
          "border rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]",
          difConOrden > 0
            ? "bg-green-50 border-green-100"
            : difConOrden === 0
              ? "bg-yellow-50 border-yellow-100"
              : "bg-red-50 border-red-100",
        )}
      >
        <ArrowUpRight
          className={cn(
            "w-4 h-4 mb-1 shrink-0",
            difConOrden > 0
              ? "text-green-600"
              : difConOrden === 0
                ? "text-yellow-600"
                : "text-red-600",
          )}
        />
        <p
          className={cn(
            "text-[8px] font-medium uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap",
            difConOrden > 0
              ? "text-green-600"
              : difConOrden === 0
                ? "text-yellow-600"
                : "text-red-600",
          )}
        >
          Dif orden
        </p>
        <p
          className={cn(
            "text-xl font-bold leading-none text-center",
            difConOrden > 0
              ? "text-green-700"
              : difConOrden === 0
                ? "text-yellow-700"
                : "text-red-700",
          )}
        >
          {difConOrden > 0 ? `+${difConOrden}` : difConOrden}
        </p>
      </div>
    </div>
  );
};
