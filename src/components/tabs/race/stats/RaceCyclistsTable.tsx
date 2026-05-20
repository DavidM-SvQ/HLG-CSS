import React from "react";
import { Users, X } from "lucide-react";
import { ReportCard } from "../../../ui/ReportCard";
import { Button } from "../../../ui/button";
import { cn } from "../../../../lib/utils";

export const RaceCyclistsTable = ({
  raceCyclists,
  minCyclistRacePoints,
  maxCyclistRacePoints,
  isExpanded,
  setIsExpanded,
  onCopyImage,
  isCopying,
  onDownloadImage,
  tableRef,
}: any) => {
  return (
    <ReportCard
      title="Clasificación de Ciclistas"
      icon={<Users />}
      iconClassName="text-blue-600"
      filename="clasificacion-ciclistas"
      ref={tableRef}
      className="mt-12"
      toolbarProps={{
        isExpanded: isExpanded,
        onExpand: () => setIsExpanded(!isExpanded),
        onCopyImage: onCopyImage,
        isImageCopying: isCopying,
        onDownloadImage: onDownloadImage
      }}
      bodyClassName="p-0 border-t border-neutral-100"
    >
      <div className="flex justify-center w-full bg-neutral-50/30">
        <div
          id="cyclists-classification-table"
          className={cn(
            "overflow-hidden relative max-h-[75vh] w-full",
            isExpanded ? "max-h-none" : ""
          )}
        >
          <div className="table-responsive-wrapper overflow-auto w-full h-full crosshair-container">
            <table className="w-full min-w-[600px] text-sm text-left border-collapse mx-auto">
              <thead className="bg-[#1e293b] text-white border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-1.5 min-w-[140px]">Ciclista</th>
                  <th className="px-3 py-1.5 min-w-[140px]">
                    Nombre_Equipo [#Orden]
                  </th>
                  <th className="px-3 py-1.5 text-center">Vict.</th>
                  <th className="px-3 py-1.5 text-center">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {raceCyclists.slice(0, 50).map((c: any, idx: number) => {
                  return (
                    <tr
                      key={c.ciclista}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-3 py-1.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900 leading-tight text-xs">
                            {c.ciclista}{" "}
                            <span className="text-neutral-400 font-normal">
                              &lt;{c.ronda}&gt;
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 pr-8">
                        <div className="flex flex-col">
                          <span className="text-neutral-700 font-medium leading-tight text-xs">
                            {c.jugador} [#{c.orden}]
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {c.victorias > 0 ? (
                          <span className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 w-4 h-4 rounded text-[10px] font-bold">
                            {c.victorias}
                          </span>
                        ) : (
                          <span className="text-neutral-300">-</span>
                        )}
                      </td>
                      <td
                        className="px-3 py-1.5 text-center font-mono tabular-nums font-bold text-blue-600 text-xs"
                        style={{
                          backgroundColor:
                            c.puntos > 0
                              ? `rgba(34, 197, 94, ${
                                  0.03 +
                                  ((c.puntos - minCyclistRacePoints) /
                                    (maxCyclistRacePoints -
                                      minCyclistRacePoints || 1)) *
                                    0.15
                                })`
                              : "transparent",
                        }}
                      >
                        {c.puntos}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ReportCard>
  );
};
