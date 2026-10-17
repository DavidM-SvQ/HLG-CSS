import React from "react";

// Custom Tooltip for Monthly Position Chart
export const CustomPositionTooltip = ({ active, payload, teamA, teamB }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 text-white p-3 rounded-xl shadow-lg border border-neutral-700 text-xs space-y-1.5 z-50">
        <p className="font-bold text-neutral-300 border-b border-neutral-800 pb-1">{data.monthFull}</p>
        <div className="flex items-center justify-between gap-4 text-orange-400 font-medium">
          <span>🟠 {teamA}:</span>
          <span className="font-bold">{data.teamARank}º puesto en Liga</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-purple-400 font-medium">
          <span>🟣 {teamB}:</span>
          <span className="font-bold">{data.teamBRank}º puesto en Liga</span>
        </div>
        <div className="pt-1 text-[10px] text-neutral-400 border-t border-neutral-800 font-mono">
          {data.teamARank < data.teamBRank
            ? `Ventaja de ${data.teamBRank - data.teamARank} pos. para ${teamA}`
            : data.teamBRank < data.teamARank
            ? `Ventaja de ${data.teamARank - data.teamBRank} pos. para ${teamB}`
            : "Misma posición en liga"}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Monthly Cumulative Points Chart
export const CustomPointsTooltip = ({ active, payload, teamA, teamB }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 text-white p-3 rounded-xl shadow-lg border border-neutral-700 text-xs space-y-1.5 z-50">
        <p className="font-bold text-neutral-300 border-b border-neutral-800 pb-1">{data.monthFull}</p>
        <div className="flex items-center justify-between gap-4 text-orange-400 font-medium">
          <span>🟠 {teamA}:</span>
          <span className="font-bold">
            {data.teamACum.toLocaleString()} pts <span className="text-[10px] opacity-75">(+{data.teamAPtsMonth} en {data.month})</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-purple-400 font-medium">
          <span>🟣 {teamB}:</span>
          <span className="font-bold">
            {data.teamBCum.toLocaleString()} pts <span className="text-[10px] opacity-75">(+{data.teamBPtsMonth} en {data.month})</span>
          </span>
        </div>
        <div className="pt-1 text-[10px] text-neutral-400 border-t border-neutral-800 font-mono">
          {data.diffCum > 0
            ? `+${data.diffCum.toLocaleString()} pts acum. para ${teamA}`
            : data.diffCum < 0
            ? `+${Math.abs(data.diffCum).toLocaleString()} pts acum. para ${teamB}`
            : "Misma puntuación acumulada"}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Radar Chart comparing 20 Picks (normalized 0-100% per round)
export const CustomRadarTooltip = ({ active, payload, teamA, teamB }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 text-white p-3.5 rounded-xl shadow-xl border border-neutral-700 text-xs space-y-2 z-50 min-w-[260px]">
        <div className="border-b border-neutral-800 pb-1.5 flex items-center justify-between gap-2">
          <span className="font-bold text-neutral-200">Ronda {data.ronda} (Pick #{parseInt(data.ronda, 10)})</span>
          <span className="text-[10px] text-amber-400 font-mono bg-amber-950/80 border border-amber-800/80 px-1.5 py-0.5 rounded">
            Máx Liga: {data.maxPtsInRound.toLocaleString()} pts
          </span>
        </div>

        {/* Team A */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-orange-400 font-bold">
            <span className="truncate max-w-[150px]">🟠 {teamA}:</span>
            <span className="font-mono">{data.ptsA.toLocaleString()} pts</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-300">
            <span className="truncate text-neutral-400 max-w-[130px]">{data.cyclistA}</span>
            <span className="font-mono shrink-0 ml-2">
              <span className="text-amber-300 font-semibold">{data.rankA === 1 ? "👑 1º" : `${data.rankA}º`}/{data.totalInRoundA}</span>
              <span className="text-neutral-400 text-[10px] ml-1">({data.valA}%)</span>
            </span>
          </div>
        </div>

        {/* Team B */}
        <div className="space-y-0.5 pt-1 border-t border-neutral-800/60">
          <div className="flex items-center justify-between text-purple-400 font-bold">
            <span className="truncate max-w-[150px]">🟣 {teamB}:</span>
            <span className="font-mono">{data.ptsB.toLocaleString()} pts</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-300">
            <span className="truncate text-neutral-400 max-w-[130px]">{data.cyclistB}</span>
            <span className="font-mono shrink-0 ml-2">
              <span className="text-purple-300 font-semibold">{data.rankB === 1 ? "👑 1º" : `${data.rankB}º`}/{data.totalInRoundB}</span>
              <span className="text-neutral-400 text-[10px] ml-1">({data.valB}%)</span>
            </span>
          </div>
        </div>

        <div className="pt-1.5 text-[10px] text-neutral-400 border-t border-neutral-800 font-mono flex items-center justify-between">
          <span>Diferencia pick:</span>
          <span className="font-bold text-white">
            {data.ptsA > data.ptsB
              ? `+${(data.ptsA - data.ptsB).toLocaleString()} pts para ${teamA}`
              : data.ptsB > data.ptsA
              ? `+${(data.ptsB - data.ptsA).toLocaleString()} pts para ${teamB}`
              : "Empate en este pick"}
          </span>
        </div>
      </div>
    );
  }
  return null;
};
