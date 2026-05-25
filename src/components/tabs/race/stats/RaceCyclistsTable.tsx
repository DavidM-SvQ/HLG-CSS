import React from "react";
import { Users, X } from "lucide-react";
import { ReportCard } from "../../../ui/ReportCard";
import { Button } from "../../../ui/button";
import { cn } from "../../../../lib/utils";

export const RaceCyclistsTable = ({
  raceCyclists,
  minCyclistRacePoints,
  maxCyclistRacePoints,
  finalColumns,
  maxPointsByCol,
  isExpanded,
  setIsExpanded,
  onCopyImage,
  isCopying,
  onDownloadImage,
  tableRef,
}: any) => {
  const maxVictorias = React.useMemo(() => {
    return Math.max(...(raceCyclists || []).map((c: any) => c.victorias || 0), 0);
  }, [raceCyclists]);

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
            "overflow-hidden relative max-h-[75vh] w-full max-w-full",
            isExpanded ? "max-h-none" : ""
          )}
        >
          <div className="table-responsive-wrapper min-h-[300px] overflow-auto w-full h-full crosshair-container">
            <table className="w-full min-w-[600px] text-[10px] text-left whitespace-nowrap border-collapse mx-auto">
              <thead className="bg-[#1e293b] text-white uppercase text-[9px] font-bold tracking-tight sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 min-w-[140px] sticky left-0 bg-[#1e293b] z-20 border-r border-slate-700">Ciclista</th>
                  <th className="px-4 py-3 w-48 sticky left-[140px] bg-[#1e293b] z-20 border-r border-slate-700">
                    Equipo [#Orden]
                  </th>
                  <th className="px-4 py-3 text-center border-r border-slate-700 min-w-[50px]">Vict.</th>
                  {finalColumns?.map((col: any) => (
                    <th
                      key={col.formatted}
                      className="px-1.5 py-1.5 text-center font-bold border-r border-slate-700"
                    >
                      {col.formatted}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-bold sticky right-0 bg-[#1e293b] z-20 border-l border-slate-700 min-w-[50px]">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 italic md:not-italic">
                {raceCyclists.slice(0, 50).map((c: any, idx: number) => {
                  return (
                    <tr
                      key={c.ciclista}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-blue-50 border-r border-neutral-100 z-10 min-w-[140px]">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900 leading-tight text-xs truncate">
                            {c.ciclista}{" "}
                            <span className="text-neutral-400 font-normal">
                              &lt;{c.ronda}&gt;
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 pr-8 sticky left-[140px] bg-white group-hover:bg-blue-50 border-r border-neutral-100 z-10 text-[11px] w-48 truncate">
                        <div className="flex flex-col">
                          <span className="text-neutral-700 font-bold leading-tight">
                            {c.jugador} [<span className="font-mono tabular-nums opacity-60">#{c.orden}</span>]
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center border-r border-neutral-100">
                        {c.victorias > 0 ? (
                          <span className={cn(
                            "inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold",
                            c.victorias === maxVictorias ? "bg-orange-100 text-orange-800" : "bg-neutral-100 text-neutral-700"
                          )}>
                            {c.victorias}
                          </span>
                        ) : (
                          <span className="text-neutral-300">-</span>
                        )}
                      </td>
                      {finalColumns?.map((col: any) => {
                        const pts = c.pointsByCol ? (c.pointsByCol[col.formatted] || 0) : 0;
                        const isMax = pts > 0 && maxPointsByCol && pts === maxPointsByCol[col.formatted];
                        return (
                          <td
                            key={col.formatted}
                            className="px-1.5 py-1.5 text-center tabular-nums font-mono border-r border-neutral-100 min-w-[36px]"
                          >
                            {pts > 0 ? (
                              <span className={cn("inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded text-[9px] font-bold shadow-sm",
                                isMax ? "bg-yellow-100 text-yellow-800" : "bg-neutral-100 text-neutral-700"
                              )}>
                                {pts}
                              </span>
                            ) : (
                              <span className="text-neutral-200">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td
                        className="px-4 py-3 text-center font-mono tabular-nums font-bold text-blue-600 text-[11px] sticky right-0 z-10 bg-white group-hover:bg-blue-50 border-l border-neutral-100"
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
                              : "white",
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
