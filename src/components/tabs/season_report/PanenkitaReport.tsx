import React, { useRef } from "react";
import { Award } from "lucide-react";
import { ExportToolbar } from "../../ui/ExportToolbar";

export const PanenkitaReport = ({ monthReportData, monthsText }: { monthReportData: any, monthsText: string }) => {
  const ref8 = useRef<HTMLDivElement>(null);
  const ref9 = useRef<HTMLDivElement>(null);
  const ref10 = useRef<HTMLDivElement>(null);
  const ref11 = useRef<HTMLDivElement>(null);

  if (!monthReportData) return null;

  return (
    <div className="space-y-6 bg-pink-50 p-6 -mx-6 rounded-xl border-y border-pink-100" ref={ref8}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start pb-2 gap-4">
        <h3 className="text-xl font-bold text-pink-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-pink-500" /> Premio Panenkita {monthsText ? ` [${monthsText}]` : ""}
          (Puntos con elecciones R20 - R25)
        </h3>
        <ExportToolbar targetRef={ref8} filename="premio-panenkita" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm lg:col-span-3" ref={ref9}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start border-b border-pink-100 pb-2 mb-3 gap-3">
            <h4 className="font-bold text-pink-800 text-sm">
              Mejores Equipos (R20-25)
            </h4>
            <ExportToolbar targetRef={ref9} filename="mejores-equipos-panenkita" />
          </div>
          <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container">
            <table className="w-full text-sm text-left table-fixed">
              <tbody>
                {monthReportData.panenkitaTopTeams.map((t: any, idx: number) => (
                  <tr key={idx} className="border-b border-pink-50 last:border-0">
                    <td className="py-2">
                      <span className="text-pink-400 mr-2">{idx + 1}.</span>
                      {t.team}
                    </td>
                    <td className="py-2 text-right font-bold text-pink-600">
                      {t.pts} pts
                    </td>
                  </tr>
                ))}
                {monthReportData.panenkitaTopTeams.length === 0 && (
                  <tr>
                    <td className="py-4 text-center text-pink-400 italic">
                      Sin datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm lg:col-span-5" ref={ref10}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start border-b border-pink-100 pb-2 mb-3 gap-3">
            <h4 className="font-bold text-pink-800 text-sm">
              Top 50 Panenkitas (Ciclistas)
            </h4>
            <ExportToolbar targetRef={ref10} filename="top-50-panenkitas" />
          </div>
          <div className="">
            <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container">
              <table className="w-full text-sm text-left table-fixed">
                <tbody>
                  {monthReportData.panenkitaTopCyclists.map((c: any, idx: number) => (
                    <tr key={idx} className="border-b border-pink-50 last:border-0">
                      <td className="py-1.5 whitespace-nowrap">
                        <span className="text-pink-400 mr-2 text-xs">
                          {idx + 1}º
                        </span>
                        {c.cyclist} <span className="opacity-60 text-[10px]">&lt;{c.round}&gt; {c.teamInfo}</span>
                      </td>
                      <td className="py-1.5 text-right font-mono text-xs font-bold text-pink-600">
                        {c.pts}
                      </td>
                    </tr>
                  ))}
                  {monthReportData.panenkitaTopCyclists.length === 0 && (
                    <tr>
                      <td className="py-4 text-center text-pink-400 italic">
                        Sin datos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm lg:col-span-4" ref={ref11}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start border-b border-pink-100 pb-2 mb-3 gap-3">
            <h4 className="font-bold text-pink-800 text-sm truncate" title={monthReportData.bestPanenkitaTeam || "N/A"}>
              Elecciones de {monthReportData.bestPanenkitaTeam || "N/A"}
            </h4>
            <ExportToolbar targetRef={ref11} filename="elecciones-equipo-panenkita" />
          </div>
          <div className="overflow-full max-h-[250px]">
            <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container">
              <table className="w-full text-sm text-left table-fixed">
                <tbody>
                  {monthReportData.bestPanenkitaTeamPicks.map((c: any, idx: number) => (
                    <tr key={idx} className="border-b border-pink-50 last:border-0">
                      <td className="py-1.5 truncate">{c.cyclist}</td>
                      <td className="py-1.5 text-right font-mono text-xs font-bold text-pink-600">
                        +{c.pts}
                      </td>
                    </tr>
                  ))}
                  {monthReportData.bestPanenkitaTeamPicks.length === 0 && (
                    <tr>
                      <td className="py-4 text-center text-pink-400 italic">
                        Sin datos que sumar puntos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
