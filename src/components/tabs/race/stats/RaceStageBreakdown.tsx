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
          <div className="table-responsive-wrapper overflow-auto w-full h-full crosshair-container">
            <table className="w-full min-w-[600px] text-[10px] text-left whitespace-nowrap border-collapse mx-auto">
              <thead className={cn("bg-[#1e293b] text-white uppercase text-[9px] font-bold tracking-tight sticky top-0 z-10")}>
                <tr>
                  <th className="px-2 py-1.5 font-bold sticky left-0 bg-[#1e293b] z-20 border-r border-slate-700 text-center min-w-[32px]">
                    Pos
                  </th>
                  <th className="px-2 py-1.5 font-bold sticky left-[32px] bg-[#1e293b] z-20 border-r border-slate-700">
                    Equipo
                  </th>
                  {finalColumns.map((col: any) => (
                    <th
                      key={col.formatted}
                      className="px-1.5 py-1.5 text-center font-bold border-r border-slate-700"
                    >
                      {col.formatted}
                    </th>
                  ))}
                  <th className="px-2 py-1.5 text-center font-bold sticky right-0 bg-[#1e293b] z-20 border-l border-slate-700 min-w-[50px]">
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
                        <td className="px-2 py-1 text-center font-mono tabular-nums text-xs text-neutral-400 sticky left-0 bg-white group-hover:bg-blue-50 border-r border-neutral-100 z-10 min-w-[32px]">
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
                      <td className="px-2 py-1 font-bold text-neutral-900 sticky left-[32px] bg-white group-hover:bg-blue-50 border-r border-neutral-100 z-10 text-[11px]">
                        <span>
                          {team.nombreEquipo} [#{team.orden}]
                        </span>
                      </td>
                      {finalColumns.map((col: any) => {
                        const pts = team.pointsByCol[col.formatted] || 0;
                        const isMax =
                          pts > 0 && pts === maxPointsByCol[col.formatted];
                        return (
                          <td
                            key={col.formatted}
                            className={cn(
                              "px-1.5 py-1 text-center font-mono tabular-nums border-r border-neutral-50 text-[10px]",
                              isMax
                                ? "bg-yellow-100 font-bold text-yellow-800"
                                : pts > 0
                                ? "text-neutral-700"
                                : "text-neutral-200"
                            )}
                          >
                            {pts > 0 ? pts : "-"}
                          </td>
                        );
                      })}
                      <td
                        className="px-2 py-1 text-center font-mono tabular-nums font-bold sticky right-0 z-10 border-l border-neutral-100 text-[11px]"
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
