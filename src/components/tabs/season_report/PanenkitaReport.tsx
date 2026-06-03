import React, { useRef, useState } from "react";
import { Award } from "lucide-react";
import { ReportCard } from "../../ui/ReportCard";
import { cn } from "../../../lib/utils";

export const PanenkitaReport = ({ monthReportData, monthsText }: { monthReportData: any, monthsText: string }) => {
  const ref8 = useRef<HTMLDivElement>(null);
  const ref9 = useRef<HTMLDivElement>(null);
  const ref10 = useRef<HTMLDivElement>(null);
  const ref11 = useRef<HTMLDivElement>(null);

  if (!monthReportData) return null;

  return (
    <ReportCard
      title={`Premio Panenkita ${monthsText ? ` [${monthsText}]` : ""}`}
      subtitle="(Puntos con elecciones R20 - R25)"
      icon={<Award />}
      iconClassName="text-pink-500"
      filename="premio-panenkita"
      ref={ref8}
      className="mt-8 bg-pink-50 border-pink-100"
      bodyClassName="bg-transparent p-6 pt-2 border-t-0"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ReportCard
          title="Mejores Equipos (R20-25)"
          filename="mejores-equipos-panenkita"
          ref={ref9}
          className="lg:col-span-3 border-pink-200 shadow-sm"
          titleClassName="text-pink-800 text-sm"
          bodyClassName="p-0 border-t border-pink-100"
        >
          <div className="table-responsive-wrapper min-h-[300px] overflow-x-auto w-full crosshair-container">
            <table className="w-full text-sm text-left table-auto">
              <tbody>
                {monthReportData.panenkitaTopTeams.map((t: any, idx: number) => (
                  <tr key={idx} className="border-b border-pink-50 last:border-0 hover:bg-pink-50/30">
                    <td className="py-2 px-4">
                      <span className="text-pink-400 mr-2">{idx + 1}.</span>
                      {t.team}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-pink-600">
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
        </ReportCard>

        <ReportCard
          title="Top 50 Panenkitas (Ciclistas)"
          filename="top-50-panenkitas"
          ref={ref10}
          className="lg:col-span-5 border-pink-200 shadow-sm"
          titleClassName="text-pink-800 text-sm"
          bodyClassName="p-0 border-t border-pink-100 h-full"
        >
          <div className="table-responsive-wrapper min-h-[300px] overflow-y-auto w-full crosshair-container h-full">
            <table className="w-full text-sm text-left table-auto">
              <tbody>
                {monthReportData.panenkitaTopCyclists.map((c: any, idx: number) => (
                  <tr key={idx} className="border-b border-pink-50 last:border-0 hover:bg-pink-50/30">
                    <td className="py-1.5 px-4 whitespace-nowrap">
                      <span className="text-pink-400 mr-2 text-xs">
                        {idx + 1}º
                      </span>
                      {c.cyclist} &lt;{c.round}&gt; <span className="opacity-60 text-[10px] block lg:inline mt-0.5 lg:mt-0 lg:ml-1">{c.teamInfo}</span>
                    </td>
                    <td className="py-1.5 px-4 text-right font-mono tabular-nums text-xs font-bold text-pink-600">
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
        </ReportCard>

        <div className="lg:col-span-4 flex flex-col gap-6">
          {monthReportData.bestPanenkitaTeams?.map((t: any, idx: number) => (
            <ReportCard
              key={idx}
              title={`Elecciones de ${t.team || "N/A"}`}
              filename={`elecciones-equipo-panenkita-${idx}`}
              ref={idx === 0 ? ref11 : null}
              className="border-pink-200 shadow-sm"
              titleClassName="text-pink-800 text-sm truncate w-full"
              bodyClassName="p-0 border-t border-pink-100 flex flex-col"
            >
              <div className="table-responsive-wrapper overflow-y-auto w-full crosshair-container">
                <table className="w-full text-sm text-left">
                  <tbody>
                    {t.picks.map((c: any, cIdx: number) => (
                      <tr key={cIdx} className="border-b border-pink-50 last:border-0 hover:bg-pink-50/30">
                        <td className="py-1.5 px-4">{c.cyclist}</td>
                        <td className="py-1.5 px-4 w-16 whitespace-nowrap text-right font-mono tabular-nums text-xs font-bold text-pink-600">
                          +{c.pts}
                        </td>
                      </tr>
                    ))}
                    {t.picks.length === 0 && (
                      <tr>
                        <td className="py-4 text-center text-pink-400 italic">
                          Sin datos que sumar puntos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ReportCard>
          ))}
          {(!monthReportData.bestPanenkitaTeams || monthReportData.bestPanenkitaTeams.length === 0) && (
             <ReportCard
             title="Mejor Equipo Panenkita"
             className="border-pink-200 shadow-sm flex-1"
             titleClassName="text-pink-800 text-sm truncate"
             bodyClassName="p-0 border-t border-pink-100 flex flex-col"
           >
             <div className="p-4 text-center text-pink-400 italic">
               Sin datos
             </div>
           </ReportCard>
          )}
        </div>
      </div>
    </ReportCard>
  );
};
