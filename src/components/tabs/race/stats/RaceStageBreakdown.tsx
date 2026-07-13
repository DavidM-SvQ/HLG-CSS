import React from "react";
import { Flag, X } from "lucide-react";
import { ReportCard } from "../../../ui/ReportCard";
import { Button } from "../../../ui/button";
import { cn } from "../../../../lib/utils";

export const RaceStageBreakdown = ({
  finalColumns,
  teamStagePoints,
  maxPointsByCol,
  isExpanded,
  setIsExpanded,
  onCopyImage,
  isCopying,
  onDownloadImage,
  tableRef,
}: any) => {
  if (!(finalColumns.length > 1 || finalColumns.some((c: any) => /^\d+/.test(c.formatted)))) return null;

  return (
    <ReportCard
      title="Clasificación por Etapas / Conceptos"
      icon={<Flag />}
      iconClassName="text-blue-600"
      filename="etapas-conceptos"
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
          id="race-breakdown-table"
          className={cn(
            "overflow-hidden relative max-h-[75vh] w-full max-w-full",
            isExpanded ? "max-h-none" : ""
          )}
        >
          <div className="table-responsive-wrapper min-h-[300px] overflow-auto w-full h-full crosshair-container">
            <table className="w-full min-w-[600px] text-[10px] text-left whitespace-nowrap border-collapse mx-auto">
              <thead className={cn("bg-[#1e293b] text-white uppercase text-[9px] font-bold tracking-tight sticky top-0 z-10")}>
                <tr>
                  <th className="px-4 py-3.5 font-bold sticky left-0 bg-[#1e293b] z-20 border-r border-slate-700 text-center min-w-[32px]">
                    Pos
                  </th>
                  <th className="px-4 py-3.5 font-bold sticky left-[32px] bg-[#1e293b] z-20 border-r border-slate-700 w-48">
                    Equipo [#Orden]
                  </th>
                  {finalColumns.map((col: any) => (
                    <th
                      key={col.formatted}
                      className="px-1.5 py-1.5 text-center font-bold border-r border-slate-700"
                    >
                      {col.formatted}
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-center font-bold sticky right-0 bg-[#1e293b] z-20 border-l border-slate-700 min-w-[50px]">
                    Puntos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 italic md:not-italic">
                {teamStagePoints.map((team: any, index: number) => {
                  const maxTotal = Math.max(
                    ...teamStagePoints.map((t: any) => t.total)
                  );
                  const minTotal = Math.min(
                    ...teamStagePoints.map((t: any) => t.total)
                  );

                  const prevTeam = index > 0 ? teamStagePoints[index - 1] : null;
                  const showSeparator = prevTeam && prevTeam.uniqueCyclists > 0 && team.uniqueCyclists === 0;

                  return (
                    <React.Fragment key={team.jugador}>
                      {showSeparator && (
                        <tr className="bg-neutral-100/50 hover:bg-neutral-100/50" key={`separator-${team.jugador}`}>
                          <td colSpan={finalColumns.length + 3} className="h-4 border-y border-neutral-200"></td>
                        </tr>
                      )}
                      <tr
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="px-4 py-3 text-center font-mono tabular-nums text-xs text-neutral-400 sticky left-0 bg-white group-hover:bg-blue-50 border-r border-neutral-100 z-10 min-w-[32px]">
                          {team.uniqueCyclists > 0
                            ? team.total > 0
                              ? team.pos === 1
                                ? "🥇"
                                : team.pos === 2
                                ? "🥈"
                                : team.pos === 3
                                ? "🥉"
                                : team.pos
                              : team.pos
                            : "-"}
                        </td>
                      <td className="px-4 py-3 font-bold text-neutral-900 sticky left-[32px] bg-white group-hover:bg-blue-50 border-r border-neutral-100 z-10 text-[11px] w-48 truncate">
                        <span>
                          {team.nombreEquipo} [<span className="font-mono tabular-nums opacity-60">#{team.orden}</span>]
                        </span>
                      </td>
                      {finalColumns.map((col: any) => {
                        const pts = team.pointsByCol[col.formatted] || 0;
                        const isMax =
                          pts > 0 && pts === maxPointsByCol[col.formatted];
                        const details = team.pointsDetailByCol?.[col.formatted] || [];
                        return (
                          <td
                            key={col.formatted}
                            className={cn(
                              "relative px-1.5 py-1 text-center font-mono tabular-nums border-r border-neutral-50 text-[10px]",
                              pts > 0 ? "cursor-pointer group/cell" : "",
                              isMax
                                ? "bg-yellow-100 font-bold text-yellow-800"
                                : pts > 0
                                ? "text-neutral-700 hover:bg-neutral-100"
                                : "text-neutral-200"
                            )}
                          >
                            {pts > 0 ? (
                              <>
                                <span>{pts}</span>
                                {details.length > 0 && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-30 bg-neutral-900 text-neutral-100 p-2.5 rounded-lg shadow-xl text-xs font-sans tracking-normal font-normal text-left min-w-[200px] border border-neutral-700 pointer-events-none">
                                    <div className="font-semibold text-[11px] text-neutral-300 border-b border-neutral-700 pb-1 mb-1.5 flex justify-between gap-2">
                                      <span>{col.formatted}</span>
                                      <span className="text-amber-400 font-mono">+{pts} pts</span>
                                    </div>
                                    <div className="space-y-1 max-h-48 overflow-y-auto">
                                      {details.map((d: any, dIdx: number) => (
                                        <div key={dIdx} className="flex justify-between items-center gap-3 text-[10px]">
                                          <span className="truncate max-w-[130px] font-medium text-white">
                                            {d.ciclista}
                                          </span>
                                          <span className="font-mono text-[9px] text-neutral-400 shrink-0">
                                            {d.posicion ? `Pos ${d.posicion}` : ""} (+{d.puntos})
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-neutral-900 rotate-45 border-r border-b border-neutral-700"></div>
                                  </div>
                                )}
                              </>
                            ) : (
                              "-"
                            )}
                          </td>
                        );
                      })}
                      <td
                        className="px-3 py-2 text-center font-mono tabular-nums font-bold sticky right-0 z-10 border-l border-neutral-100 text-[11px]"
                        style={{
                          backgroundColor: `hsl(${Math.max(
                            0,
                            Math.min(
                              1,
                              (team.total - minTotal) /
                                (maxTotal - minTotal || 1)
                            )
                          ) * 120}, 70%, 75%)`,
                          color: "#000000",
                        }}
                      >
                        {team.total}
                      </td>
                    </tr>
                    </React.Fragment>
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
