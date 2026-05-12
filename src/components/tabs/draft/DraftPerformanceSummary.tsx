import React from 'react';
import { Activity, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDraftStats } from './hooks/useDraftStats';

interface DraftPerformanceSummaryProps {
  files: any;
  leaderboard: any;
  draftDatosMonthFilter: string[];
  draftDatosCategoryFilter: string[];
  draftDatosTeamFilter: string[];
  draftSummarySort: { keys: string[]; order: "asc" | "desc" };
  setDraftSummarySort: React.Dispatch<React.SetStateAction<{keys: string[]; order: "asc" | "desc"}>>;
  isDraftSummaryExpanded: boolean;
  setIsDraftSummaryExpanded: (val: boolean) => void;
  draftSummaryTableRef: React.RefObject<HTMLDivElement>;
}

export const DraftPerformanceSummary: React.FC<DraftPerformanceSummaryProps> = ({
  files,
  leaderboard,
  draftDatosMonthFilter,
  draftDatosCategoryFilter,
  draftDatosTeamFilter,
  draftSummarySort,
  setDraftSummarySort,
  isDraftSummaryExpanded,
  setIsDraftSummaryExpanded,
  draftSummaryTableRef
}) => {
  const { teamSummaries } = useDraftStats({
    files,
    leaderboard,
    draftDatosMonthFilter,
    draftDatosCategoryFilter,
    draftDatosTeamFilter,
  });

  const sortedSummaries = [...teamSummaries].sort((a, b) => {
    for (const key of draftSummarySort.keys) {
      const valA = a[key as keyof typeof a] || 0;
      const valB = b[key as keyof typeof b] || 0;
      if (valA !== valB) {
        return draftSummarySort.order === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    }
    return 0;
  });

  if (!sortedSummaries || sortedSummaries.length === 0) return null;

  const maxTotalPoints = Math.max(...sortedSummaries.map((s) => s.totalPoints));
  const minTotalPoints = Math.min(...sortedSummaries.map((s) => s.totalPoints));

  return (
<div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-6">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <div className="min-w-0 pr-4">
      <h3 className="flex items-center gap-2 font-bold text-lg text-neutral-900 min-w-0">
        <Activity className="w-5 h-5 text-blue-600 shrink-0" />
        <span className="truncate">Resumen de Rendimiento del Draft</span>
      </h3>
      <p className="text-xs text-neutral-500 mt-0.5 truncate">
        Clasificación de selecciones por equipo según
        los puntos medios conseguidos por ronda.
      </p>
    </div>
    <div className="flex items-center gap-1.5 self-end md:self-start shrink-0 copy-button-ignore">
      <button
        onClick={() => setIsDraftSummaryExpanded(true)}
        className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white shadow-sm border border-neutral-100"
        title="Ampliar tabla"
      >
        <Activity className="w-4 h-4" />
      </button>
    </div>
  </div>

  <div
    ref={draftSummaryTableRef}
    className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden"
  >
    <div className="overflow-x-auto w-full"><table className="w-full text-left border-collapse min-w-[700px]">
      <thead>
        <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[10px] uppercase text-neutral-500 font-bold tracking-wider">
          <th className="px-3 py-2 border-r border-neutral-100 w-10 text-center">#</th>
          <th className="px-3 py-2 border-r border-neutral-100 min-w-[120px]">Equipo</th>
          <th className="px-2 py-2 text-center text-blue-800 bg-blue-50/50">1º</th>
          <th className="px-2 py-2 text-center text-green-800 bg-green-50/50">Top</th>
          <th className="px-2 py-2 text-center text-orange-800 bg-orange-50/50">Mid</th>
          <th className="px-2 py-2 text-center text-neutral-800 bg-neutral-100/50 w-20">0 pts</th>
          <th className="px-2 py-2 text-center text-green-800 bg-green-50/80 border-x border-neutral-100 w-24">Eficiencia</th>
          <th className="px-3 py-2 text-right">Pts Totales</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-100">
        {sortedSummaries.map((summary, idx) => {
          const isMaxTP = summary.totalPoints === maxTotalPoints;
          const isMinTP = summary.totalPoints === minTotalPoints;
          return (
            <tr key={summary.team} className="hover:bg-neutral-50/50 group transition-colors">
              <td className="px-3 py-1 border-r border-neutral-100 text-neutral-400 text-xs text-center font-mono">
                {idx + 1}
              </td>
              <td className="px-3 py-1 border-r border-neutral-100 font-bold text-neutral-900 text-xs">
                {summary.team}
              </td>
              <td className="px-2 py-1 text-center bg-blue-50/30">
                <div className="flex flex-col items-center justify-center">
                  <span className="font-bold text-blue-700 text-xs">
                    {summary.pickGanador}
                  </span>
                  <span className="text-[10px] text-blue-600/70 font-medium">
                    {summary.pctGanadores.toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="px-2 py-1 text-center bg-green-50/30">
                <div className="flex flex-col items-center justify-center">
                  <span className="font-bold text-green-700 text-xs">
                    {summary.buenosPicks}
                  </span>
                  <span className="text-[10px] text-green-600/70 font-medium">
                    {summary.pctBuenos.toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="px-2 py-1 text-center bg-orange-50/30">
                <div className="flex flex-col items-center justify-center">
                  <span className="font-bold text-orange-700 text-xs">
                    {summary.malosPicks}
                  </span>
                  <span className="text-[10px] text-orange-600/70 font-medium">
                    {summary.pctMalos.toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="px-2 py-1 text-center bg-neutral-50 border-x border-neutral-100/50">
                <div className="flex flex-col items-center justify-center">
                  <span className="font-medium text-neutral-500 text-xs">
                    {summary.sinPuntuar}
                  </span>
                  <span className="text-[10px] opacity-60 font-medium">
                    {summary.pctSinPuntuar.toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="px-2 py-1 text-center text-sm font-bold text-green-800 bg-green-50 border-x border-neutral-100/80">
                {summary.pctBuenos.toFixed(1)}%
              </td>
              <td
                className={cn(
                  "px-3 py-1.5 text-right tabular-nums text-sm",
                  isMaxTP
                    ? "text-green-700 font-black bg-green-50"
                    : isMinTP
                      ? "text-red-700 font-black bg-red-50"
                      : "font-bold text-neutral-900"
                )}
              >
                {summary.totalPoints.toLocaleString()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table></div>
  </div>
</div>
  );
};
