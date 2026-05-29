import React from "react";
import { ArrowUpRight, Trophy, Users, LayoutGrid, UserMinus, Medal, Bike } from "lucide-react";
import { cn } from "../../../lib/utils";

interface TeamKPIsProps {
  teamPlayer: any;
  teamWins: number;
  teamPartialWins: number;
  avgAge: string | number;
  unscoredCount: number;
  undebutedCount: number;
  currentPuesto: number;
  difConOrden: number;
}

export const TeamKPIs = ({
  teamPlayer,
  teamWins,
  teamPartialWins,
  avgAge,
  unscoredCount,
  undebutedCount,
  currentPuesto,
  difConOrden,
}: TeamKPIsProps) => {
  const commonDivClass = "bg-white border rounded-xl p-3 shadow-sm flex flex-col items-center justify-center min-h-[64px] min-w-[90px] flex-1 max-w-[140px] group-[.is-exporting]:flex-none group-[.is-exporting]:w-[calc(25%-6px)]";
  
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto w-full group-[.is-exporting]:max-w-[700px] group-[.is-exporting]:gap-2">
      {/* 1. Puntos */}
      <div className={cn(commonDivClass, "bg-blue-50 border-blue-100")}>
        <Trophy className="w-4 h-4 text-blue-600 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-blue-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Puntos
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {teamPlayer?.puntos || 0}
        </p>
      </div>

      {/* 2. Puesto */}
      <div className={cn(commonDivClass, "bg-purple-50 border-purple-100")}>
        <LayoutGrid className="w-4 h-4 text-purple-600 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-purple-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Puesto
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {currentPuesto}
        </p>
      </div>

      {/* 3. Dif Orden */}
      <div
        className={cn(
          commonDivClass,
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

      {/* 4. Edad media */}
      <div className={cn(commonDivClass, "bg-emerald-50 border-emerald-100")}>
        <Users className="w-4 h-4 text-emerald-600 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-emerald-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Edad Media
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {avgAge}
        </p>
      </div>

      {/* 5. Victorias */}
      <div className={cn(commonDivClass, "bg-yellow-50 border-yellow-100")}>
        <Medal className="w-4 h-4 text-yellow-500 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-yellow-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Victorias
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {teamWins}
        </p>
      </div>

      {/* 6. Victorias parciales */}
      <div className={cn(commonDivClass, "bg-amber-50 border-amber-100")}>
        <Medal className="w-4 h-4 text-amber-500 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-amber-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Vict. Parc.
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {teamPartialWins}
        </p>
      </div>

      {/* 7. Sin puntuar */}
      <div className={cn(commonDivClass, "bg-red-50 border-red-100")}>
        <UserMinus className="w-4 h-4 text-red-600 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-red-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Sin puntuar
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {unscoredCount}
        </p>
      </div>

      {/* 8. Sin debutar */}
      <div className={cn(commonDivClass, "bg-slate-50 border-slate-200")}>
        <Bike className="w-4 h-4 text-slate-500 mb-1 shrink-0" />
        <p className="text-[8px] font-medium text-slate-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
          Sin debutar
        </p>
        <p className="text-xl font-bold text-neutral-900 leading-none text-center">
          {undebutedCount}
        </p>
      </div>
    </div>
  );
};
