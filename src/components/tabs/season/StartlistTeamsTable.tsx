import React from "react";
import {
  Copy,
  Maximize2,
  Minimize2,
  UploadCloud,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { formatNumberSpanish } from "../../../lib/data-processing";

export function StartlistTeamsTable(props: any) {
  const {
    isStartlistTeamsTableExpanded, setIsStartlistTeamsTableExpanded,
    startlistTeamsTableRef, handleCopyStartlistTeamsText, isStartlistTeamsTextCopying,
    handleCopyStartlistTeams, isStartlistTeamsCopying, teamRowPagination, handleDownloadStartlistTeams,
    teamRows, getTeamPointsColorStyle, getTeamPointsMediosColorStyle, maxCiclistas, minCiclistas, formatNumberSpanish
  } = props;

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col bg-white border border-neutral-200 shadow-sm rounded-lg p-6",
          isStartlistTeamsTableExpanded &&
            "fixed inset-4 z-50 bg-white shadow-2xl overflow-y-auto max-h-none border border-neutral-200",
        )}
        ref={startlistTeamsTableRef}
        style={isStartlistTeamsTableExpanded ? { width: "auto" } : {}}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">
            Resumen Equipos
          </h3>
          <div className="flex gap-2 relative copy-button-ignore">
            <ExportToolbar
              isExpanded={isStartlistTeamsTableExpanded}
              onExpand={() =>
                setIsStartlistTeamsTableExpanded(!isStartlistTeamsTableExpanded)
              }
              onCopyText={handleCopyStartlistTeamsText}
              isTextCopying={isStartlistTeamsTextCopying}
              onCopyImage={handleCopyStartlistTeams}
              isImageCopying={isStartlistTeamsCopying}
              imagePageCount={teamRowPagination.totalPages}
              onDownloadImage={handleDownloadStartlistTeams}
            />
          </div>
        </div>
        <div className="table-responsive-wrapper overflow-auto w-full max-h-[600px]">
          <table className="w-full min-w-[400px] text-[13px] text-left">
            <thead className="text-[11px] text-neutral-500 uppercase sticky top-0 z-10 bg-neutral-50 shadow-[0_1px_0_0_#e5e5e5]">
              <tr>
                <th className="px-2 py-1 sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5,4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                  Equipo
                </th>
                <th
                  className="px-2 py-1 text-center w-px whitespace-nowrap"
                  title="Desviación respecto a la media"
                >
                  <span className="border-b border-dashed border-neutral-300">
                    Nº cic
                  </span>
                </th>
                <th
                  className="px-2 py-1 text-center w-px"
                  title="Puntos Totales (Excluyendo esta carrera)"
                >
                  <span className="border-b border-dashed border-neutral-300">
                    Pts
                  </span>
                </th>
                <th
                  className="px-2 py-1 text-center w-px"
                  title="Puntos Medios"
                >
                  <span className="border-b border-dashed border-neutral-300">
                    P/C
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
              {teamRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-neutral-500 font-medium italic bg-neutral-50/50"
                  >
                    No hay datos de equipos con estos filtros.
                  </td>
                </tr>
              ) : (
                teamRows.map((r, i) => {
                  const page = teamRowPagination.pages[i];
                  let isHiddenVisual = false;
                  if (isStartlistTeamsCopying) {
                    if (
                      isStartlistTeamsCopying !== "full" &&
                      isStartlistTeamsCopying !== `p${page}`
                    ) {
                      isHiddenVisual = true;
                    }
                  }
                  return (
                    <React.Fragment key={i}>
                      {r.numCiclistas === 0 &&
                        i > 0 &&
                        teamRows[i - 1].numCiclistas > 0 && (
                          <tr className={cn(isHiddenVisual && "hidden")}>
                            <td
                              colSpan={4}
                              className="h-6 bg-neutral-100/80 border-y border-neutral-200"
                            />
                          </tr>
                        )}
                      <tr
                        className={cn(
                          "group hover:bg-blue-50/50 transition-colors",
                          isHiddenVisual && "hidden",
                        )}
                      >
                        <td className="px-2 py-0.5 font-medium text-xs whitespace-nowrap sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5,4px_0_8px_-2px_rgba(0,0,0,0.05)] group-hover:bg-blue-50/50">
                          {r.equipo}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-0.5 text-center font-mono text-[11px] w-px",
                            r.numCiclistas === 0
                              ? "text-red-600 font-bold"
                              : "",
                            r.numCiclistas !== 0 &&
                              r.numCiclistas === maxCiclistas
                              ? "bg-green-100 font-bold"
                              : "",
                            r.numCiclistas !== 0 &&
                              r.numCiclistas !== maxCiclistas &&
                              r.numCiclistas === minCiclistas
                              ? "bg-yellow-100 font-bold"
                              : "",
                          )}
                        >
                          {r.numCiclistas}
                        </td>
                        <td
                          className="px-2 py-0.5 text-center font-mono text-[11px] font-bold text-neutral-700 w-px"
                          style={getTeamPointsColorStyle(r.puntos)}
                        >
                          <span className="font-mono tracking-tight">
                            {formatNumberSpanish(r.puntos)}
                          </span>
                        </td>
                        <td
                          className="px-2 py-0.5 text-center font-mono text-[11px] font-bold text-blue-800 w-px"
                          style={getTeamPointsMediosColorStyle(r.puntosMedios)}
                        >
                          <span className="font-mono tracking-tight">
                            {formatNumberSpanish(r.puntosMedios)}
                          </span>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
