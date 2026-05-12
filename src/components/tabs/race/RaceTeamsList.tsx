import React, { useRef, useState } from "react";
import { Trophy, X } from "lucide-react";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { cn } from "../../../lib/utils";
import { expandNodeForCapture } from "../../../lib/dom-utils";
import { domToDataUrl } from "modern-screenshot";
import { copyImageToClipboard } from "../../../lib/clipboard";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    if (!tableRef.current || isCopying) return;
    setIsCopying(true);
    const restore = expandNodeForCapture(tableRef.current);
    try {
      const processCopy = async () => {
        const dataUrl = await domToDataUrl(tableRef.current!, {
          scale: 3,
          backgroundColor: "#ffffff",
          style: { overflow: "hidden" },
        });
        const response = await fetch(dataUrl);
        return await response.blob();
      };
      await copyImageToClipboard(processCopy(), "export.png");
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      console.warn("Error during copy", err);
    } finally {
      restore();
    }
  };

  const handleDownload = async () => {
    if (!tableRef.current) return;
    const restore = expandNodeForCapture(tableRef.current);
    try {
      const dataUrl = await domToDataUrl(tableRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        style: { overflow: "hidden" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "clasificacion-carrera.png";
      link.click();
    } catch (err) {
      console.error("Error downloading table:", err);
    } finally {
      restore();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2 whitespace-nowrap">
          <Trophy className="w-5 h-5 text-blue-600" />
          Clasificación de la Carrera
        </h3>
        <ExportToolbar
          isExpanded={isExpanded}
          onExpand={() => setIsExpanded(!isExpanded)}
          onCopyImage={handleCopy}
          isImageCopying={isCopying}
          onDownloadImage={handleDownload}
        />
      </div>
      <div className="flex justify-center w-full">
        <div
          id="race-classification-table"
          ref={tableRef}
          className={cn(
            "bg-white border border-neutral-200 rounded-xl overflow-hidden relative max-h-[75vh] shadow-sm w-full",
            isExpanded ? "fixed inset-4 z-50 max-h-none" : ""
          )}
        >
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          <div className="table-responsive-wrapper overflow-auto w-full h-full">
            <table className="w-full min-w-[600px] text-sm text-left border-collapse mx-auto">
              <thead className="bg-[#1e293b] text-white border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-1.5 w-8 text-center">Pos</th>
                  <th className="px-2 py-1.5 min-w-[120px]">Equipo</th>
                  <th className="px-2 py-1.5 w-10 text-center">Cicl</th>
                  <th className="px-2 py-1.5 w-16 text-center">Puntos</th>
                  <th className="px-2 py-1.5 w-20 text-center">Ptos por cic</th>
                  <th className="px-2 py-1.5 w-16 text-center">Vict parc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {rankedTeams
                  .filter(
                    (t) =>
                      t.nombreEquipo !== "No draft" &&
                      t.nombreEquipo !== "No draft [99]"
                  )
                  .map((team) => (
                    <tr
                      key={team.jugador}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-3 py-1.5 text-center font-mono text-xs text-neutral-400">
                        {team.totalPoints > 0
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
                            {team.nombreEquipo} [#{team.orden}]
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
                        className="px-3 py-1.5 text-center font-mono font-bold text-black text-xs border-l border-neutral-100"
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
                      <td className="px-3 py-1.5 text-center font-mono text-xs border-l border-neutral-100 text-neutral-600">
                        {team.uniqueCyclists > 0
                          ? (team.totalPoints / team.uniqueCyclists).toFixed(1)
                          : "0.0"}
                      </td>
                      <td
                        className="px-3 py-1.5 text-center font-mono font-bold text-xs border-l border-neutral-100"
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
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
