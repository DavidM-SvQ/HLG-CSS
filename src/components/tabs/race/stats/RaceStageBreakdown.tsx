import React from "react";
import { Flag, X } from "lucide-react";
import { ExportToolbar } from "../../../ui/ExportToolbar";
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
    <div className="mt-12">
      <div className="flex items-center justify-between border-b pb-3 mb-6">
        <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
          <Flag className="w-5 h-5 text-blue-600" />
          Clasificación por Etapas / Conceptos
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
          id="race-breakdown-table"
          ref={tableRef}
          className={cn(
            "bg-white border border-neutral-200 rounded-xl overflow-hidden relative max-h-[75vh] shadow-sm w-full max-w-full",
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
                {teamStagePoints.map((team: any) => {
                  const maxTotal = Math.max(
                    ...teamStagePoints.map((t: any) => t.total)
                  );
                  const minTotal = Math.min(
                    ...teamStagePoints.map((t: any) => t.total)
                  );

                  return (
                    <tr
                      key={team.jugador}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-2 py-1 text-center font-mono text-xs text-neutral-400 sticky left-0 bg-white group-hover:bg-blue-50 border-r border-neutral-100 z-10 min-w-[32px]">
                        {team.total > 0
                          ? team.pos === 1
                            ? "🥇"
                            : team.pos === 2
                            ? "🥈"
                            : team.pos === 3
                            ? "🥉"
                            : team.pos
                          : team.pos}
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
                              "px-1.5 py-1 text-center font-mono border-r border-neutral-50 text-[10px]",
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
                        className="px-2 py-1 text-center font-mono font-bold sticky right-0 z-10 border-l border-neutral-100 text-[11px]"
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
