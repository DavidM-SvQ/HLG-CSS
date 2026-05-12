import React, { useRef } from "react";
import { Medal, Star } from "lucide-react";
import { ExportToolbar } from "../../ui/ExportToolbar";
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

  if (!monthReportData) return null;

  return (
    <div className="space-y-8">
      <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto" ref={ref6}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start mb-4 gap-4">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Medal className="w-5 h-5 text-purple-600" /> Mejores y Peores
            Ciclistas por Equipo {monthsText ? ` [${monthsText}]` : ""}
          </h3>
          <ExportToolbar targetRef={ref6} filename="mejores-peores-equipo" />
        </div>
        <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container"><table className="w-full min-w-[600px] text-xs text-left whitespace-nowrap">
          <thead className="sticky top-0 z-20 bg-neutral-50 shadow-sm border-b border-neutral-100">
            <tr className="border-b">
              <th className="pb-2">Equipo</th>
              <th className="pb-2 text-green-700">Mejor Ciclista</th>
              <th className="pb-2 text-red-600">
                Peor Ciclista (
                <span className="text-[10px]">&gt;0 pts</span>)
              </th>
            </tr>
          </thead>
          <tbody>
            {monthReportData.minMaxTeam.map((t: any, idx: number) => (
              <tr key={idx} className="border-b last:border-0">
                <td
                  className="py-2.5 font-bold truncate max-w-[120px]"
                  title={t.team?.toString()}
                >
                  {t.team}
                </td>
                <td className="py-2.5 text-green-700 truncate max-w-[150px]">
                  {t.best ? (
                    <span title={t.best[0]?.toString()} className="flex items-center gap-1">
                      <span className="truncate">{t.best[0]}</span>
                      <span className="shrink-0 bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold">
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
                      <span className="shrink-0 bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold">
                        {t.worst[1]}
                      </span>
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto" ref={ref7}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start mb-4 gap-4">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-500" /> Mejores y Peores
            Ciclistas por Ronda {monthsText ? ` [${monthsText}]` : ""}
          </h3>
          <ExportToolbar targetRef={ref7} filename="mejores-peores-ronda" />
        </div>
        <div className="">
          <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container"><table className="w-full min-w-[600px] text-sm text-left">
            <thead className="sticky top-0 z-20 bg-neutral-50 shadow-sm border-b border-neutral-100">
              <tr className="border-b">
                <th className="pb-2">Ronda</th>
                <th className="pb-2 text-green-700">Mejor Ciclista</th>
                <th className="pb-2 text-red-600">
                  Peor Ciclista (
                  <span className="text-[10px]">&gt;0 pts</span>)
                </th>
              </tr>
            </thead>
            <tbody>
              {monthReportData.minMaxRound.map((r: any, idx: number) => (
                <tr
                  key={idx}
                  className="border-b last:border-0 hover:bg-neutral-100 "
                >
                  <td className="py-2.5 font-bold text-neutral-500 w-16 text-center">
                    R{r.round}
                  </td>
                  <td className="py-2.5 text-green-700">
                    {r.best ? (
                      <span className="flex items-center gap-1">
                        <span className="truncate">{r.best[0]}</span>
                        <span className="shrink-0 bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold">
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
                        <span className="shrink-0 bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold">
                          +{r.worst[1]}
                        </span>
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
};
