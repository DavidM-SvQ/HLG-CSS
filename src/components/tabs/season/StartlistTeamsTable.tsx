import React from "react";
import {
  Copy,
  Maximize2,
  Minimize2,
  UploadCloud,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { ReportCard } from "../../ui/ReportCard";
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
    <ReportCard
      title="Resumen Equipos"
      filename="resumen-equipos"
      ref={startlistTeamsTableRef}
      toolbarProps={{
        isExpanded: isStartlistTeamsTableExpanded,
        onExpand: () => setIsStartlistTeamsTableExpanded(!isStartlistTeamsTableExpanded),
        onCopyText: handleCopyStartlistTeamsText,
        isTextCopying: isStartlistTeamsTextCopying,
        onCopyImage: handleCopyStartlistTeams,
        isImageCopying: isStartlistTeamsCopying,
        onDownloadImage: handleDownloadStartlistTeams
      }}
      bodyClassName="p-0 border-t border-neutral-100"
    >
      <div
        className={cn(
          "table-responsive-wrapper min-h-[300px] overflow-auto w-full px-2 md:px-0 pb-4 md:pb-0",
          isStartlistTeamsTableExpanded ? "max-h-none" : "max-h-[600px]"
        )}
      >
        <table className="w-full text-[13px] text-left block md:table min-w-0 md:min-w-[400px] mt-2 md:mt-0">
          <thead className="text-[11px] text-neutral-500 uppercase sticky top-0 z-10 bg-neutral-50 shadow-[0_1px_0_0_#e5e5e5] hidden md:table-header-group">
            <tr>
              <th className="px-4 py-3 sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5,4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                Equipo
              </th>
              <th
                className="px-4 py-3 text-center w-px whitespace-nowrap"
                title="Ciclistas participantes"
              >
                <span className="border-b border-dashed border-neutral-300">
                  Nº Ciclistas
                </span>
              </th>
              <th
                className="px-4 py-3 text-center w-px"
                title="Puntos Totales (Excluyendo esta carrera)"
              >
                <span className="border-b border-dashed border-neutral-300">
                  Ptos
                </span>
              </th>
              <th
                className="px-4 py-3 text-center w-px"
                title="Puntos Medios por ciclista"
              >
                <span className="border-b border-dashed border-neutral-300">
                  P/C
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y md:divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group">
            {teamRows.length === 0 ? (
              <tr className="block">
                <td
                  colSpan={4}
                  className="py-8 text-center text-neutral-500 font-medium italic bg-neutral-50/50 block w-full"
                >
                  No hay datos de equipos con estos filtros.
                </td>
              </tr>
            ) : (
              teamRows.map((r: any, i: number) => {
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
                        <tr className={cn("hidden md:table-row", isHiddenVisual && "hidden")}>
                          <td
                            colSpan={4}
                            className="h-6 bg-neutral-100/80 border-y border-neutral-200"
                          />
                        </tr>
                      )}
                    <tr
                      className={cn(
                        "group hover:bg-blue-50/50 transition-colors bg-white border-b border-neutral-200 md:border-none",
                        isHiddenVisual && "hidden",
                      )}
                    >
                      <td className="px-5 py-3 md:px-4 md:py-2.5 font-medium text-sm md:text-sm md:whitespace-nowrap sticky left-0 bg-neutral-50/50 md:bg-white z-10 md:shadow-[1px_0_0_0_#e5e5e5,4px_0_8px_-2px_rgba(0,0,0,0.05)] group-hover:bg-blue-50/50">
                        <span className="font-bold text-neutral-900 md:font-semibold md:text-current">{r.equipo}</span>
                      </td>
                      
                      <td
                        className={cn(
                          "px-4 py-3 md:px-4 md:py-2.5 text-center font-mono tabular-nums text-sm md:text-xs border-r md:border-r-0 border-neutral-100",
                          r.numCiclistas === 0 && "text-red-600 font-bold bg-white md:bg-transparent",
                          r.numCiclistas !== 0 && r.numCiclistas === maxCiclistas && "bg-green-100 font-bold",
                          r.numCiclistas !== 0 && r.numCiclistas !== maxCiclistas && r.numCiclistas === minCiclistas && "bg-yellow-100 font-bold",
                          r.numCiclistas !== 0 && r.numCiclistas !== maxCiclistas && r.numCiclistas !== minCiclistas && "bg-white md:bg-transparent"
                        )}
                      >
                        <span className={cn(r.numCiclistas !== 0 && r.numCiclistas !== maxCiclistas && r.numCiclistas !== minCiclistas && r.numCiclistas !== 0 && "text-neutral-700 md:text-current")}>{r.numCiclistas}</span>
                      </td>
                      <td
                        className="px-4 py-3 md:px-4 md:py-2.5 text-center font-mono tabular-nums text-sm md:text-xs font-bold text-neutral-700 border-r md:border-r-0 border-neutral-100 bg-white md:bg-transparent"
                        style={getTeamPointsColorStyle(r.puntos)}
                      >
                        <span className="font-mono tabular-nums tracking-tight">
                          {formatNumberSpanish(r.puntos)}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 md:px-4 md:py-2.5 text-center font-mono tabular-nums text-sm md:text-xs font-bold text-blue-800 bg-white md:bg-transparent"
                        style={getTeamPointsMediosColorStyle(r.puntosMedios)}
                      >
                        <span className="font-mono tabular-nums tracking-tight hover:text-blue-600">
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
    </ReportCard>
  );
}
