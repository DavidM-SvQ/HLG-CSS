import React from "react";
import { Users, X } from "lucide-react";
import { ExportToolbar } from "../../../ui/ExportToolbar";
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
    <div className="mt-12">
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Clasificación de Ciclistas
        </h3>
        <ExportToolbar
          isExpanded={isExpanded}
          onExpand={() => setIsExpanded(!isExpanded)}
          onCopyImage={onCopyImage}
          isImageCopying={isCopying}
          onDownloadImage={onDownloadImage}
        />
      </div>
      <div className="flex justify-center w-full">
        <div
          id="cyclists-classification-table"
          ref={tableRef}
          className={cn(
            "bg-white border border-neutral-200 rounded-xl overflow-hidden relative max-h-[75vh] shadow-sm w-full",
            isExpanded ? "fixed inset-4 z-50 max-h-none" : ""
          )}
        >
          {isExpanded && (
            <Button variant="outline"
              onClick={() => setIsExpanded(false)}
              className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
            >
              <X className="w-6 h-6" />
            </Button>
          )}
          <div className="table-responsive-wrapper overflow-auto w-full h-full">
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
                {raceCyclists.map((c: any, idx: number) => {
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
                        className="px-3 py-1.5 text-center font-mono font-bold text-blue-600 text-xs"
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
    </div>
  );
};
