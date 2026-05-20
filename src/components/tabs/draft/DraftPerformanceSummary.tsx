import { ReportCard } from "../../ui/ReportCard";
import React from 'react';
import { Activity, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDraftStats } from './hooks/useDraftStats';
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

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
      let valA: any = a[key as keyof typeof a] || 0;
      let valB: any = b[key as keyof typeof b] || 0;

      if (key === "eficiencia") {
        valA = a.totalPicks > 0 ? ((a.pickGanador + a.buenosPicks) / a.totalPicks) * 100 : 0;
        valB = b.totalPicks > 0 ? ((b.pickGanador + b.buenosPicks) / b.totalPicks) * 100 : 0;
      }
      
      if (key === "team") {
        valA = a.team;
        valB = b.team;
      }

      if (valA !== valB) {
        if (typeof valA === 'string' && typeof valB === 'string') {
           return draftSummarySort.order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
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

  const handleSort = (key: string) => {
    if (draftSummarySort.keys[0] === key) {
      setDraftSummarySort({
        keys: draftSummarySort.keys,
        order: draftSummarySort.order === "asc" ? "desc" : "asc"
      });
    } else {
      setDraftSummarySort({
        keys: [key, ...draftSummarySort.keys.filter(k => k !== key)],
        order: "desc"
      });
    }
  };

  const getSortIcon = (key: string) => {
    if (draftSummarySort.keys[0] === key) {
      return draftSummarySort.order === "asc" 
        ? <ChevronUp className="w-3 h-3 ml-1 inline text-blue-600" />
        : <ChevronDown className="w-3 h-3 ml-1 inline text-blue-600" />;
    }
    return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity text-neutral-300" />;
  };

  return (
    <ReportCard
      className="mb-6"
      title="Resumen de Rendimiento del Draft"
      subtitle="Clasificación de selecciones por equipo según los puntos medios conseguidos por ronda."
      icon={<Activity />}
      filename="resumen-rendimiento-draft"
      ref={draftSummaryTableRef}
      toolbarProps={{
        isExpanded: isDraftSummaryExpanded,
        onExpand: () => setIsDraftSummaryExpanded(!isDraftSummaryExpanded)
      }}
      bodyClassName="pt-6 px-6 pb-6"
    >
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="select-none">
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[10px] uppercase text-neutral-500 font-bold tracking-wider">
                <th className="px-3 py-2 border-r border-neutral-100 w-10 text-center">#</th>
                <th className="px-3 py-2 border-r border-neutral-100 min-w-[120px] cursor-pointer hover:bg-neutral-100/80 transition-colors group" onClick={() => handleSort("team")}>
                  Equipo {getSortIcon("team")}
                </th>
                <th className="px-2 py-2 text-center text-blue-800 bg-blue-50/50 cursor-pointer hover:bg-blue-100/50 transition-colors group" onClick={() => handleSort("pickGanador")}>
                  1º {getSortIcon("pickGanador")}
                </th>
                <th className="px-2 py-2 text-center text-green-800 bg-green-50/50 cursor-pointer hover:bg-green-100/50 transition-colors group" onClick={() => handleSort("buenosPicks")}>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center justify-center w-full focus:outline-none">
                        Buenos {getSortIcon("buenosPicks")}
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Ciclistas que quedaron entre los puestos 2º y 5º de su ronda.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="px-2 py-2 text-center text-yellow-800 bg-yellow-50/50 cursor-pointer hover:bg-yellow-100/50 transition-colors group" onClick={() => handleSort("normalesPicks")}>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center justify-center w-full focus:outline-none">
                        Normales {getSortIcon("normalesPicks")}
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Ciclistas que quedaron entre los puestos 6º y 14º de su ronda.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="px-2 py-2 text-center text-orange-800 bg-orange-50/50 cursor-pointer hover:bg-orange-100/50 transition-colors group" onClick={() => handleSort("malosPicks")}>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center justify-center w-full focus:outline-none">
                        Malos {getSortIcon("malosPicks")}
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Ciclistas que puntuaron, pero quedaron fuera del top 14 de su ronda.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="px-2 py-2 text-center text-red-800 bg-red-50/50 cursor-pointer hover:bg-red-100/50 transition-colors group" onClick={() => handleSort("sinPuntuar")}>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center justify-center w-full focus:outline-none">
                        Ceros {getSortIcon("sinPuntuar")}
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Ciclistas que obtuvieron cero puntos en la temporada.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="px-2 py-2 text-center text-green-800 bg-green-50/80 border-x border-neutral-100 w-24 cursor-pointer hover:bg-green-100/80 transition-colors group" onClick={() => handleSort("eficiencia")}>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center justify-center w-full focus:outline-none">
                        Eficiencia {getSortIcon("eficiencia")}
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Porcentaje de selecciones "1º" y "Buenos" (top 5) respecto al total.
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="px-3 py-2 text-right cursor-pointer hover:bg-neutral-100/80 transition-colors group" onClick={() => handleSort("totalPoints")}>
                  Pts Totales {getSortIcon("totalPoints")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sortedSummaries.map((summary, idx) => {
                const isMaxTP = summary.totalPoints === maxTotalPoints;
                const isMinTP = summary.totalPoints === minTotalPoints;
                return (
                  <tr key={summary.team} className="hover:bg-neutral-50/50 group transition-colors">
                    <td className="px-3 py-1 border-r border-neutral-100 text-neutral-400 text-xs text-center font-mono tabular-nums">
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
                    <td className="px-2 py-1 text-center bg-yellow-50/30">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-bold text-yellow-700 text-xs">
                          {summary.normalesPicks}
                        </span>
                        <span className="text-[10px] text-yellow-600/70 font-medium">
                          {summary.pctNormales?.toFixed(1) || 0}%
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
                    <td className="px-2 py-1 text-center bg-red-50/30 border-r border-neutral-100/50">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-bold text-red-700 text-xs">
                          {summary.sinPuntuar}
                        </span>
                        <span className="text-[10px] text-red-600/70 font-medium">
                          {summary.totalPicks > 0 ? ((summary.sinPuntuar / summary.totalPicks) * 100).toFixed(1) : "0.0"}%
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1 text-center text-sm font-bold text-green-800 bg-green-50 border-x border-neutral-100/80">
                      {summary.totalPicks > 0 ? ((summary.pickGanador + summary.buenosPicks) / summary.totalPicks * 100).toFixed(1) : 0}%
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
          </table>
        </div>
      </div>
    </ReportCard>
  );
};
