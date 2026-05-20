import React, { useRef, useState } from "react";
import { Medal, Star } from "lucide-react";
import { ReportCard } from "../../ui/ReportCard";
import { cn } from "../../../lib/utils";

interface MinMaxReportProps {
  monthReportData: any;
  monthsText: string;
}

export const MinMaxReport: React.FC<MinMaxReportProps> = ({
  monthReportData,
  monthsText,
}) => {
  const ref6 = useRef<HTMLDivElement>(null);
  const ref7 = useRef<HTMLDivElement>(null);
  const [isTeamExpanded, setIsTeamExpanded] = useState(false);
  const [isRoundExpanded, setIsRoundExpanded] = useState(false);

  if (!monthReportData) return null;

  return (
    <div className="space-y-8">
      <ReportCard
        title={`Mejores y Peores Ciclistas por Equipo ${monthsText ? ` [${monthsText}]` : ""}`}
        icon={<Medal />}
        filename="mejores-peores-equipo"
        ref={ref6}
        toolbarProps={{
          isExpanded: isTeamExpanded,
          onExpand: () => setIsTeamExpanded(!isTeamExpanded)
        }}
        bodyClassName="p-0 border-t border-neutral-100"
      >
        <div className={cn("table-responsive-wrapper w-full crosshair-container", !isTeamExpanded && "overflow-auto max-h-[600px]", isTeamExpanded && "overflow-x-auto")}>
          <table className="w-full min-w-[600px] text-xs text-left whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-neutral-50 shadow-sm border-b border-neutral-100">
              <tr className="border-b">
                <th className="py-2 pl-4">Equipo</th>
                <th className="py-2 text-green-700">Mejor Ciclista</th>
                <th className="py-2 text-red-600">
                  Peor Ciclista (<span className="text-[10px]">&gt;0 pts</span>)
                </th>
                <th className="py-2 text-neutral-500 text-center pr-4">
                  Con Cero Puntos
                </th>
              </tr>
            </thead>
            <tbody>
              {monthReportData.minMaxTeam.map((t: any, idx: number) => {
                const maxZeros = Math.max(...monthReportData.minMaxTeam.map((x: any) => x.zeroPoints || 0));
                const minZeros = Math.min(...monthReportData.minMaxTeam.map((x: any) => x.zeroPoints || 0));
                
                let hue = 120;
                if (maxZeros > minZeros) {
                  hue = Math.round(120 * ((maxZeros - t.zeroPoints) / (maxZeros - minZeros)));
                }

                return (
                <tr key={idx} className="border-b last:border-0 hover:bg-neutral-50">
                  <td
                    className="py-2.5 pl-4 font-bold truncate max-w-[120px]"
                    title={t.team?.toString()}
                  >
                    {t.team}
                  </td>
                  <td className="py-2.5 text-green-700 truncate max-w-[150px]">
                    {t.best ? (
                      <span title={t.best[0]?.toString()} className="flex items-center gap-1">
                        <span className="truncate">{t.best[0]}</span>
                        <span className="shrink-0 bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono tabular-nums font-bold">
                          {t.best[1]}
                        </span>
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-2.5 text-red-600 truncate max-w-[150px]">
                    {t.worst ? (
                      <span title={t.worst[0]?.toString()} className="flex items-center gap-1">
                        <span className="truncate">{t.worst[0]}</span>
                        <span className="shrink-0 bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono tabular-nums font-bold">
                          {t.worst[1]}
                        </span>
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-2.5 text-center pr-4 font-mono tabular-nums">
                    <span 
                      className="px-2 py-1 rounded-md text-xs font-bold"
                      style={{ backgroundColor: `hsl(${hue}, 85%, 90%)`, color: `hsl(${hue}, 85%, 25%)` }}
                    >
                      {t.zeroPoints || 0}
                    </span>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </ReportCard>

      <ReportCard
        title={`Mejores y Peores Ciclistas por Ronda ${monthsText ? ` [${monthsText}]` : ""}`}
        icon={<Star />}
        filename="mejores-peores-ronda"
        ref={ref7}
        toolbarProps={{
          isExpanded: isRoundExpanded,
          onExpand: () => setIsRoundExpanded(!isRoundExpanded)
        }}
        bodyClassName="p-0 border-t border-neutral-100"
      >
        <div className={cn("table-responsive-wrapper w-full crosshair-container", !isRoundExpanded && "overflow-auto max-h-[600px]", isRoundExpanded && "overflow-x-auto")}>
          <table className="w-full min-w-[600px] text-sm text-left">
            <thead className="sticky top-0 z-20 bg-neutral-50 shadow-sm border-b border-neutral-100">
              <tr className="border-b">
                <th className="py-2 pl-4">Ronda</th>
                <th className="py-2 text-green-700">Mejor Ciclista</th>
                <th className="py-2 text-red-600">
                  Peor Ciclista (<span className="text-[10px]">&gt;0 pts</span>)
                </th>
                <th className="py-2 text-neutral-500 text-center pr-4">
                  Con Cero Puntos
                </th>
              </tr>
            </thead>
            <tbody>
              {monthReportData.minMaxRound.map((r: any, idx: number) => {
                const maxZeros = Math.max(...monthReportData.minMaxRound.map((x: any) => x.zeroPoints || 0));
                const minZeros = Math.min(...monthReportData.minMaxRound.map((x: any) => x.zeroPoints || 0));
                
                let hue = 120;
                if (maxZeros > minZeros) {
                  hue = Math.round(120 * ((maxZeros - r.zeroPoints) / (maxZeros - minZeros)));
                }

                return (
                <tr
                  key={idx}
                  className="border-b last:border-0 hover:bg-neutral-50 "
                >
                  <td className="py-2.5 pl-4 font-bold text-neutral-500 w-16 text-center">
                    R{r.round}
                  </td>
                  <td className="py-2.5 text-green-700">
                    {r.best ? (
                      <span className="flex items-center gap-1">
                        <span className="truncate">{r.best[0]}</span>
                        <span className="shrink-0 bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono tabular-nums font-bold">
                          +{r.best[1]}
                        </span>
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-2.5 text-red-600">
                    {r.worst ? (
                      <span className="flex items-center gap-1">
                        <span className="truncate">{r.worst[0]}</span>
                        <span className="shrink-0 bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono tabular-nums font-bold">
                          +{r.worst[1]}
                        </span>
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-2.5 text-center pr-4 font-mono tabular-nums">
                    <span 
                      className="px-2 py-1 rounded-md text-xs font-bold"
                      style={{ backgroundColor: `hsl(${hue}, 85%, 90%)`, color: `hsl(${hue}, 85%, 25%)` }}
                    >
                      {r.zeroPoints || 0}
                    </span>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </ReportCard>
    </div>
  );
};
