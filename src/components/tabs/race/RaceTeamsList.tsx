import React, { useRef, useState } from "react";
import { Trophy, X } from "lucide-react";
import { ReportCard } from "../../ui/ReportCard";
import { cn } from "../../../lib/utils";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { Button } from "../../ui/button";

interface RaceTeamsListProps {
  rankedTeams: any[];
  maxUniqueCyclists: number;
  minRacePoints: number;
  maxRacePoints: number;
  minRacePartialWins: number;
  maxRacePartialWins: number;
}

export const RaceTeamsList = ({
  rankedTeams,
  maxUniqueCyclists,
  minRacePoints,
  maxRacePoints,
  minRacePartialWins,
  maxRacePartialWins,
}: RaceTeamsListProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const { 
    isExpanded, 
    setIsExpanded, 
    isCopying, 
    handleCopyImage, 
    handleDownloadImage,
    handleCopyText,
    isTextCopying
  } = useTableScreenshot(tableRef);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const sortedTeams = React.useMemo(() => {
    let sortableItems = [...rankedTeams].filter(
      (t) => t.nombreEquipo !== "No draft" && t.nombreEquipo !== "No draft [99]"
    );
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === "ptosPorCic") {
           aValue = a.uniqueCyclists > 0 ? a.totalPoints / a.uniqueCyclists : 0;
           bValue = b.uniqueCyclists > 0 ? b.totalPoints / b.uniqueCyclists : 0;
        } else if (sortConfig.key === "racePartialWins") {
           aValue = a.racePartialWins || 0;
           bValue = b.racePartialWins || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [rankedTeams, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 opacity-20 text-[10px]">↕</span>;
    }
    return sortConfig.direction === "asc" ? (
      <span className="ml-1 text-[10px] text-blue-400">↑</span>
    ) : (
      <span className="ml-1 text-[10px] text-blue-400">↓</span>
    );
  };

  return (
    <ReportCard
      title="Clasificación Equipos"
      icon={<Trophy />}
      iconClassName="text-blue-600"
      filename="clasificacion-equipos"
      ref={tableRef}
      toolbarProps={{
        isExpanded: isExpanded,
        onExpand: () => setIsExpanded(!isExpanded),
        onCopyImage: () => handleCopyImage({ fileName: 'export.png', scale: 3, style: { backgroundColor: '#ffffff', overflow: 'hidden' }, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")) }),
        isImageCopying: isCopying,
        onDownloadImage: () => handleDownloadImage({ fileName: 'clasificacion-carrera.png', scale: 3, style: { backgroundColor: '#ffffff', overflow: 'hidden' }, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")) }),
        onCopyText: handleCopyText,
        isTextCopying: isTextCopying,
        useClipboardIconForText: true,
        textCopyLabel: ""
      }}
      bodyClassName="p-0 border-t border-neutral-100"
    >
      <div className="flex justify-center w-full bg-neutral-50/30">
        <div
          id="race-classification-table"
          className={cn(
            "overflow-hidden relative max-h-[75vh] w-full",
            isExpanded ? "max-h-none" : ""
          )}
        >
          <div className="table-responsive-wrapper overflow-auto w-full h-full crosshair-container px-2 md:px-0">
            <table className="w-full min-w-[500px] text-sm text-left border-collapse mx-auto">
              <thead className="bg-[#1e293b] text-white border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10 select-none">
                <tr>
                  <th 
                    className="px-2 py-1.5 w-8 text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("pos")}
                  >
                    Pos {getSortIcon("pos")}
                  </th>
                  <th 
                    className="px-2 py-1.5 min-w-[120px] cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("nombreEquipo")}
                  >
                    Equipo {getSortIcon("nombreEquipo")}
                  </th>
                  <th 
                    className="px-2 py-1.5 w-10 text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("uniqueCyclists")}
                  >
                    Cicl {getSortIcon("uniqueCyclists")}
                  </th>
                  <th 
                    className="px-2 py-1.5 w-16 text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("racePartialWins")}
                  >
                    <span className="md:hidden">Vic parc</span>
                    <span className="hidden md:inline">Vict parc</span> {getSortIcon("racePartialWins")}
                  </th>
                  <th 
                    className="px-2 py-1.5 w-20 text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("ptosPorCic")}
                  >
                    <span className="md:hidden">P/C</span>
                    <span className="hidden md:inline">Ptos/Cic</span> {getSortIcon("ptosPorCic")}
                  </th>
                  <th 
                    className="px-2 py-1.5 w-16 text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("totalPoints")}
                  >
                    <span className="md:hidden">Pts</span>
                    <span className="hidden md:inline">Puntos</span> {getSortIcon("totalPoints")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {sortedTeams
                  .map((team, index) => {
                    const isNonParticipant = team.uniqueCyclists === 0;
                    const showDivider = isNonParticipant && index > 0 && sortedTeams[index - 1].uniqueCyclists > 0;
                    
                    return (
                      <React.Fragment key={team.jugador}>
                        {showDivider && (
                          <tr className="bg-neutral-100/50 h-6 pointer-events-none shadow-inner border-y-[6px] border-white copy-button-ignore">
                            <td colSpan={6}></td>
                          </tr>
                        )}
                        <tr
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="px-3 py-1.5 text-center font-mono tabular-nums text-xs text-neutral-400">
                            {isNonParticipant 
                              ? "-" 
                              : team.totalPoints > 0
                              ? team.pos === 1
                                ? "🥇"
                                : team.pos === 2
                                ? "🥈"
                                : team.pos === 3
                                ? "🥉"
                                : team.pos
                              : team.pos}
                          </td>
                      <td className="px-3 py-1.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900 leading-tight text-xs">
                            {team.nombreEquipo} <span className="text-neutral-500 font-normal">#{team.orden}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                            team.uniqueCyclists === 0
                              ? "bg-red-50 text-red-500"
                              : team.uniqueCyclists === maxUniqueCyclists
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-100 text-neutral-600"
                          )}
                        >
                          {team.uniqueCyclists}
                        </span>
                      </td>
                      <td
                        className="px-3 py-1.5 text-center font-mono tabular-nums font-bold text-xs border-l border-neutral-100"
                        style={
                          (team as any).racePartialWins > 0
                            ? {
                                backgroundColor: `hsl(45, 100%, ${Math.max(
                                  40,
                                  95 -
                                    (((team as any).racePartialWins -
                                      minRacePartialWins) /
                                      Math.max(
                                        maxRacePartialWins - minRacePartialWins,
                                        1
                                      )) *
                                      45
                                )}%)`,
                                color: "#78350f",
                              }
                            : { color: "#d4d4d8" }
                        }
                      >
                        {(team as any).racePartialWins > 0
                          ? (team as any).racePartialWins
                          : "-"}
                      </td>
                      <td className="px-3 py-1.5 text-center font-mono tabular-nums text-xs border-l border-neutral-100 text-neutral-600">
                        {team.uniqueCyclists > 0
                          ? (team.totalPoints / team.uniqueCyclists).toFixed(1)
                          : "0.0"}
                      </td>
                      <td
                        className="px-3 py-1.5 text-center font-mono tabular-nums font-bold text-black text-xs border-l border-neutral-100"
                        style={{
                          backgroundColor: `hsl(${Math.max(
                            0,
                            Math.min(
                              1,
                              (team.totalPoints - minRacePoints) /
                                (maxRacePoints - minRacePoints || 1)
                            )
                          ) * 120}, 70%, 75%)`,
                          color: "#000000",
                        }}
                      >
                        {team.totalPoints}
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
