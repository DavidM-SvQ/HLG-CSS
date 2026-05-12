import React, { useRef, useState } from "react";
import { Users, Flag, Copy, CheckCircle2, X } from "lucide-react";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { copyImageToClipboard, copyTextToClipboard } from "../../../lib/clipboard";
import { domToDataUrl } from "modern-screenshot";
import { expandNodeForCapture } from "../../../lib/dom-utils";
import { cn } from "../../../lib/utils";

interface RaceStatsProps {
  raceCyclists: any[];
  minCyclistRacePoints: number;
  maxCyclistRacePoints: number;
  finalColumns: any[];
  teamStagePoints: any[];
  maxPointsByCol: any;
  retiredCyclists: any[];
  raceTeams: any[];
  selectedRace: string;
  leaderboard: any[];
}

export const RaceStats = ({
  raceCyclists,
  minCyclistRacePoints,
  maxCyclistRacePoints,
  finalColumns,
  teamStagePoints,
  maxPointsByCol,
  retiredCyclists,
  raceTeams,
  selectedRace,
  leaderboard,
}: RaceStatsProps) => {
  const [isCyclistsExpanded, setIsCyclistsExpanded] = useState(false);
  const [isStageExpanded, setIsStageExpanded] = useState(false);
  const [isRetiredExpanded, setIsRetiredExpanded] = useState(false);
  const [isDetailedBreakdownExpanded, setIsDetailedBreakdownExpanded] = useState(false);

  const [isCyclistsCopying, setIsCyclistsCopying] = useState(false);
  const [isRaceBreakdownCopying, setIsRaceBreakdownCopying] = useState(false);
  const [isRetiredCopying, setIsRetiredCopying] = useState(false);
  const [isDetailedBreakdownCopying, setIsDetailedBreakdownCopying] = useState<"full" | "first" | "second" | "third" | null>(null);
  const [isDetailedBreakdownTextCopying, setIsDetailedBreakdownTextCopying] = useState(false);

  const cyclistsTableRef = useRef<HTMLDivElement>(null);
  const raceBreakdownTableRef = useRef<HTMLDivElement>(null);
  const retiredTableRef = useRef<HTMLDivElement>(null);
  const detailedBreakdownRef = useRef<HTMLDivElement>(null);

  const handleCopyCyclists = async () => {
    if (!cyclistsTableRef.current || isCyclistsCopying) return;
    setIsCyclistsCopying(true);
    const restore = expandNodeForCapture(cyclistsTableRef.current);
    try {
      const processCopy = async () => {
        const dataUrl = await domToDataUrl(cyclistsTableRef.current!, { scale: 3, backgroundColor: "#ffffff" });
        const response = await fetch(dataUrl);
        return await response.blob();
      };
      await copyImageToClipboard(processCopy(), "export.png");
      setTimeout(() => setIsCyclistsCopying(false), 2000);
    } catch (err) {
      console.warn("Error during copy fallback", err);
    } finally {
      restore();
    }
  };

  const handleDownloadCyclists = async () => {
    if (!cyclistsTableRef.current) return;
    const restore = expandNodeForCapture(cyclistsTableRef.current);
    try {
      const dataUrl = await domToDataUrl(cyclistsTableRef.current!, { scale: 3, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "clasificacion-ciclistas.png";
      link.click();
    } catch (err) {
      console.error("Error downloading table:", err);
    } finally {
      restore();
    }
  };

  const handleCopyRaceBreakdownImage = async () => {
    if (!raceBreakdownTableRef.current || isRaceBreakdownCopying) return;
    setIsRaceBreakdownCopying(true);

    const tableContainer = raceBreakdownTableRef.current;
    const restore = expandNodeForCapture(tableContainer);

    try {
      const processCopy = async () => {
        const dataUrl = await domToDataUrl(tableContainer, {
          scale: 3,
          backgroundColor: '#ffffff',
          style: { overflow: "visible" },
        });
        const response = await fetch(dataUrl);
        return await response.blob();
      };
      await copyImageToClipboard(processCopy(), "export.png");
      setTimeout(() => setIsRaceBreakdownCopying(false), 2000);
    } catch (err) {
      console.warn("Error during copy fallback", err);
    } finally {
      restore();
    }
  };

  const handleDownloadRaceBreakdownImage = async () => {
    if (!raceBreakdownTableRef.current) return;

    const tableContainer = raceBreakdownTableRef.current;
    const restore = expandNodeForCapture(tableContainer);

    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3,
        backgroundColor: '#ffffff',
        style: { overflow: "visible" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `clasificacion-etapas-${selectedRace.replace(/\\s+/g, "-").toLowerCase()}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading race breakdown image:", err);
    } finally {
      restore();
    }
  };

  const handleCopyRetiredImage = async () => {
    if (!retiredTableRef.current || isRetiredCopying) return;
    setIsRetiredCopying(true);
    const tableContainer = retiredTableRef.current;
    const originalClass = tableContainer.className;
    tableContainer.className = originalClass
      .replace("max-h-[75vh]", "")
      .replace("overflow-y-auto", "")
      .replace("overflow-x-auto", "");
    const restore = expandNodeForCapture(tableContainer);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const elHeight = tableContainer.scrollHeight;
      const elWidth = tableContainer.scrollWidth;
      
      const dataUrlPromise = domToDataUrl(tableContainer, {
        scale: 1.5,
        width: elWidth,
        height: elHeight,
        backgroundColor: '#ffffff',
        style: { overflow: "visible", margin: "0" },
      });
      const blobPromise = dataUrlPromise.then(url => fetch(url).then(r => r.blob()));
      await copyImageToClipboard(blobPromise, "abandonos.png", dataUrlPromise);
    } catch (err) {
      console.warn("Error copying abandoned list", err);
    } finally {
      setTimeout(() => setIsRetiredCopying(false), 1000);
      restore();
      tableContainer.className = originalClass;
    }
  };

  const handleDownloadRetiredImage = async () => {
    if (!retiredTableRef.current) return;
    const tableContainer = retiredTableRef.current;
    const originalClass = tableContainer.className;
    tableContainer.className = originalClass
      .replace("max-h-[75vh]", "")
      .replace("overflow-y-auto", "")
      .replace("overflow-x-auto", "");
    const restore = expandNodeForCapture(tableContainer);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const elHeight = tableContainer.scrollHeight;
      const elWidth = tableContainer.scrollWidth;
      
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 1.5,
        width: elWidth,
        height: elHeight,
        backgroundColor: '#ffffff',
        style: { overflow: "visible", margin: "0" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `abandonos-${selectedRace.replace(/\\s+/g, "-").toLowerCase()}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading retired image:", err);
    } finally {
      restore();
      tableContainer.className = originalClass;
    }
  };

  const handleCopyDetailedBreakdownImage = async (
    subset?: "full" | "first" | "second" | "third",
  ) => {
    if (!detailedBreakdownRef.current || isDetailedBreakdownCopying) return;
    setIsDetailedBreakdownCopying(subset || "full");

    const container = detailedBreakdownRef.current;
    const originalClass = container.className;
    const cards = container.querySelectorAll(".team-card-breakdown");

    try {
      if (subset) {
        cards.forEach((card, idx) => {
          const num = idx + 1;
          if (subset === "first" && num > 12) card.classList.add("hidden");
          if (subset === "second" && (num <= 12 || num > 24))
            card.classList.add("hidden");
          if (subset === "third" && num <= 24) card.classList.add("hidden");
        });
      }

      container.className = cn(
        "grid grid-cols-3 gap-5 bg-white p-6 rounded-xl w-[1200px]",
        subset ? "" : "grid-cols-3",
      );

      const processCopy = async () => {
        const dataUrl = await domToDataUrl(container, {
          scale: 3,
          style: {
            textRendering: "optimizeLegibility",
          },
        });
        const response = await fetch(dataUrl);
        return await response.blob();
      };
      await copyImageToClipboard(processCopy(), "export.png");
      setTimeout(() => setIsDetailedBreakdownCopying(null), 2000);
    } catch (err) {
      console.warn("Error during copy fallback", err);
    } finally {
      container.className = originalClass;
      cards.forEach((card) => card.classList.remove("hidden"));
    }
  };

  const handleDownloadDetailedBreakdownImage = async (
    subset?: "full" | "first" | "second" | "third",
  ) => {
    if (!detailedBreakdownRef.current) return;

    const container = detailedBreakdownRef.current;
    const originalClass = container.className;
    const cards = container.querySelectorAll(".team-card-breakdown");

    try {
      if (subset) {
        cards.forEach((card, idx) => {
          const num = idx + 1;
          if (subset === "first" && num > 12) card.classList.add("hidden");
          if (subset === "second" && (num <= 12 || num > 24))
            card.classList.add("hidden");
          if (subset === "third" && num <= 24) card.classList.add("hidden");
        });
      }

      container.className = cn(
        "grid grid-cols-3 gap-5 bg-white p-6 rounded-xl w-[1200px]",
        subset ? "" : "grid-cols-3",
      );

      const dataUrl = await domToDataUrl(container, {
        scale: 3,
        style: {
          textRendering: "optimizeLegibility",
        },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      const suffix = subset ? `-${subset}` : "";
      link.download = `desglose-equipos-${selectedRace.replace(/\\s+/g, "-").toLowerCase()}${suffix}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading detailed breakdown image:", err);
    } finally {
      container.className = originalClass;
      cards.forEach((card) => card.classList.remove("hidden"));
    }
  };

  const handleCopyDetailedBreakdownText = async () => {
    if (!selectedRace || !leaderboard) return;
    setIsDetailedBreakdownTextCopying(true);

    const teams = leaderboard
      ?.map((player) => {
        const details = player.detalles.filter(
          (d: any) => d.carrera === selectedRace,
        );
        const totalPoints = details.reduce(
          (sum: any, d: any) => sum + d.puntosObtenidos,
          0,
        );
        return {
          nombreEquipo: player.nombreEquipo,
          orden: player.orden,
          totalPoints,
          details,
        };
      })
      .filter(
        (t) =>
          t.nombreEquipo !== "No draft" && t.nombreEquipo !== "No draft [99]",
      )
      .sort((a, b) => b.totalPoints - a.totalPoints);

    let text = `🏆 DESGLOSE POR EQUIPO - ${selectedRace}\n\n`;

    teams.forEach((team) => {
      if (team.totalPoints === 0) return;
      text += `--- ${team.nombreEquipo} [#${team.orden}] (${team.totalPoints} pts) ---\n`;

      const cyclistMap = new Map<string, { total: number; concepts: any[] }>();
      team?.details?.forEach((d: any) => {
        if (!cyclistMap.has(d.ciclista)) {
          cyclistMap.set(d.ciclista, { total: 0, concepts: [] });
        }
        const c = cyclistMap.get(d.ciclista)!;
        c.total += d.puntosObtenidos;
        if (d.puntosObtenidos > 0) {
          c.concepts.push(d);
        }
      });

      const sortedCyclists = Array.from(cyclistMap.entries())
        .filter(([_, data]) => data.total > 0)
        .sort((a, b) => b[1].total - a[1].total);

      sortedCyclists.forEach(([ciclista, data]) => {
        text += `📍 ${ciclista}: +${data.total} pts\n`;
        data.concepts.forEach((c) => {
          text += `   • ${c.tipoResultado} ${c.posicion ? `(Pos ${c.posicion.toString().replace(/^p/i, "")})` : ""}: +${c.puntosObtenidos}\n`;
        });
        text += `\n`;
      });
      text += `\n`;
    });

    await copyTextToClipboard(text, 'export.txt');
    setTimeout(() => setIsDetailedBreakdownTextCopying(false), 2000);
  };

  return (
    <>
      {/* Cyclists Table */}
      <div className="mt-12">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Clasificación de Ciclistas
          </h3>
          <ExportToolbar
            isExpanded={isCyclistsExpanded}
            onExpand={() => setIsCyclistsExpanded(!isCyclistsExpanded)}
            onCopyImage={handleCopyCyclists}
            isImageCopying={false}
            onDownloadImage={handleDownloadCyclists}
          />
        </div>
        <div className="flex justify-center w-full">
          <div
            id="cyclists-classification-table"
            ref={cyclistsTableRef}
            className={cn(
              "bg-white border border-neutral-200 rounded-xl overflow-hidden relative max-h-[75vh] shadow-sm w-full",
              isCyclistsExpanded ? "fixed inset-4 z-50 max-h-none" : ""
            )}
          >
            {isCyclistsExpanded && (
              <button
                onClick={() => setIsCyclistsExpanded(false)}
                className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
              >
                <X className="w-6 h-6" />
              </button>
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
                  {raceCyclists.map((c, idx) => {
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

      {/* Stage Breakdown (if multiple types or stage race) */}
      {(finalColumns.length > 1 ||
        finalColumns.some((c) => /^\\d+/.test(c.formatted))) && (
        <div className="mt-12">
          <div className="flex items-center justify-between border-b pb-3 mb-6">
            <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
              <Flag className="w-5 h-5 text-blue-600" />
              Clasificación por Etapas / Conceptos
            </h3>
            <ExportToolbar
              isExpanded={isStageExpanded}
              onExpand={() => setIsStageExpanded(!isStageExpanded)}
              onCopyImage={handleCopyRaceBreakdownImage}
              isImageCopying={isRaceBreakdownCopying}
              onDownloadImage={handleDownloadRaceBreakdownImage}
            />
          </div>
          <div className="flex justify-center w-full">
            <div
              id="race-breakdown-table"
              ref={raceBreakdownTableRef}
              className={cn(
                "bg-white border border-neutral-200 rounded-xl overflow-hidden relative max-h-[75vh] shadow-sm w-full max-w-full",
                isStageExpanded ? "fixed inset-4 z-50 max-h-none" : ""
              )}
            >
              {isStageExpanded && (
                <button
                  onClick={() => setIsStageExpanded(false)}
                  className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
                >
                  <X className="w-6 h-6" />
                </button>
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
                      {finalColumns.map((col) => (
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
                    {teamStagePoints.map((team, idx) => {
                      const maxTotal = Math.max(
                        ...teamStagePoints.map((t) => t.total)
                      );
                      const minTotal = Math.min(
                        ...teamStagePoints.map((t) => t.total)
                      );
                      const totalRange = maxTotal - minTotal || 1;

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
                          {finalColumns.map((col) => {
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
      )}

      {/* Cyclists Abandoned Table */}
      {retiredCyclists && retiredCyclists.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              Ciclistas Retirados
            </h3>
            <ExportToolbar
              isExpanded={isRetiredExpanded}
              onExpand={() => setIsRetiredExpanded(!isRetiredExpanded)}
              onCopyImage={handleCopyRetiredImage}
              isImageCopying={isRetiredCopying}
              onDownloadImage={handleDownloadRetiredImage}
            />
          </div>
          <div className="flex justify-center w-full">
            {(() => {
              const maxRetiredPoints = Math.max(...retiredCyclists.map(c => c.racePoints), 1);
              const getRetiredPointsColor = (points: number) => {
                if (points === 0) return { bg: '#fee2e2', text: '#991b1b' };
                if (maxRetiredPoints <= 1) return { bg: `hsl(30, 80%, 75%)`, text: "#000000" };
                const ratio = (points - 1) / (maxRetiredPoints - 1);
                const hue = 30 + ratio * 90;
                return { bg: `hsl(${hue}, 80%, 75%)`, text: "#000000" };
              };
              return (
                <div
                  id="retired-cyclists-table"
                  ref={retiredTableRef}
                  className={cn(
                    "bg-white border border-neutral-200 rounded-xl overflow-hidden relative max-h-[75vh] shadow-sm w-full",
                    isRetiredExpanded ? "fixed inset-4 z-50 max-h-none" : ""
                  )}
                >
                  {isRetiredExpanded && (
                    <button
                      onClick={() => setIsRetiredExpanded(false)}
                      className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                  <div className="table-responsive-wrapper overflow-auto w-full h-full">
                    <table className="w-full min-w-[600px] text-sm text-left border-collapse mx-auto">
                      <thead className="bg-[#1e293b] text-white border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-1.5 min-w-[140px]">Ciclista &lt;Ronda&gt;</th>
                          <th className="px-3 py-1.5 min-w-[140px]">Equipo [#Orden]</th>
                          <th className="px-3 py-1.5 text-center">Estado</th>
                          <th className="px-3 py-1.5 text-center">Ptos Temp.</th>
                          <th className="px-3 py-1.5 text-center">Ptos Carrera</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                        {retiredCyclists.map((c: any, idx: number) => {
                          const ptosColor = getRetiredPointsColor(typeof c.racePoints === 'number' ? c.racePoints : 0);
                          return (
                            <tr key={idx} className="hover:bg-red-50/30 transition-colors">
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
                                    {c.equipo} [#{c.orden}]
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                <span className="inline-flex items-center justify-center bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                  {c.status}
                                </span>
                                {c.etapa && <span className="text-[10px] text-neutral-500 ml-1">({c.etapa})</span>}
                              </td>
                              <td className="px-3 py-1.5 text-center font-mono font-bold text-neutral-600 text-xs">
                                {c.tempPoints}
                              </td>
                              <td 
                                className="px-3 py-1.5 text-center font-mono font-bold text-xs"
                                style={{ backgroundColor: ptosColor.bg, color: ptosColor.text }}
                              >
                                {c.racePoints}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="mt-12">
        <div className="flex items-center justify-between border-b pb-3 mb-6">
          <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Desglose por Equipo
          </h3>
          <div className="flex items-center gap-1.5">
            <ExportToolbar 
              isExpanded={isDetailedBreakdownExpanded} 
              onExpand={() => setIsDetailedBreakdownExpanded(!isDetailedBreakdownExpanded)} 
              onCopyText={handleCopyDetailedBreakdownText} 
              isTextCopying={isDetailedBreakdownTextCopying} 
              useClipboardIconForText={true} 
              textCopyLabel="" 
              onCopyImage={() => handleCopyDetailedBreakdownImage("full")} 
              isImageCopying={isDetailedBreakdownCopying === "full"} 
              onDownloadImage={handleDownloadDetailedBreakdownImage} 
            />
            {raceTeams.length > 12 && (
              <div className="flex border-l border-neutral-200 pl-2 gap-1.5 ml-1">
                <button
                  onClick={() => handleCopyDetailedBreakdownImage("first")}
                  disabled={!!isDetailedBreakdownCopying}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all copy-button-ignore",
                    isDetailedBreakdownCopying === "first"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                    isDetailedBreakdownCopying && isDetailedBreakdownCopying !== "first" && "opacity-50 cursor-not-allowed"
                  )}
                  title="Copiar equipos 1-12"
                >
                  {isDetailedBreakdownCopying === "first" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  1-12
                </button>
                <button
                  onClick={() => handleCopyDetailedBreakdownImage("second")}
                  disabled={!!isDetailedBreakdownCopying}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all copy-button-ignore",
                    isDetailedBreakdownCopying === "second"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                    isDetailedBreakdownCopying && isDetailedBreakdownCopying !== "second" && "opacity-50 cursor-not-allowed"
                  )}
                  title="Copiar equipos 13-24"
                >
                  {isDetailedBreakdownCopying === "second" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  13-24
                </button>
                {raceTeams.length > 24 && (
                  <button
                    onClick={() => handleCopyDetailedBreakdownImage("third")}
                    disabled={!!isDetailedBreakdownCopying}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all copy-button-ignore",
                      isDetailedBreakdownCopying === "third"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                      isDetailedBreakdownCopying && isDetailedBreakdownCopying !== "third" && "opacity-50 cursor-not-allowed"
                    )}
                    title="Copiar equipos 25+"
                  >
                    {isDetailedBreakdownCopying === "third" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    25+
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div
          id="detailed-team-breakdown"
          ref={detailedBreakdownRef}
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-2 -mx-2 rounded-xl",
            isDetailedBreakdownExpanded ? "fixed inset-4 z-50 overflow-auto p-6 shadow-2xl m-0" : ""
          )}
        >
          {isDetailedBreakdownExpanded && (
            <button
              onClick={() => setIsDetailedBreakdownExpanded(false)}
              className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          {raceTeams.map((team) => {
            const cyclistMap = new Map<string, { ronda: string; total: number; concepts: any[]; }>();
            team?.details?.forEach((d: any) => {
              if (!cyclistMap.has(d.ciclista)) {
                cyclistMap.set(d.ciclista, { ronda: d.ronda, total: 0, concepts: [] });
              }
              const c = cyclistMap.get(d.ciclista)!;
              c.total += d.puntosObtenidos;
              c.concepts.push(d);
            });

            const sortedCyclists = Array.from(cyclistMap.entries())
              .filter(([_, data]) => team.jugador !== "No draft" || data.total > 0)
              .sort((a, b) => b[1].total - a[1].total);

            if (sortedCyclists.length === 0) return null;

            return (
              <div
                key={team.jugador}
                className="team-card-breakdown bg-neutral-50 rounded-lg p-4 border border-neutral-200 flex flex-col h-full min-w-[240px]"
              >
                <div className="flex justify-between items-center mb-2 border-b border-neutral-200 pb-1.5 gap-4">
                  <span className="font-bold text-neutral-900 text-base whitespace-nowrap">
                    {team.nombreEquipo} [#{team.orden}]
                  </span>
                  <span className="font-mono font-bold text-blue-600 text-base whitespace-nowrap">
                    {team.totalPoints} pts
                  </span>
                </div>
                <div className="space-y-1.5 flex-1">
                  {sortedCyclists.map(([ciclista, data], idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-neutral-100 shadow-sm">
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <span className="font-bold text-neutral-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                          {ciclista} &lt;{data.ronda}&gt;
                        </span>
                        <span
                          className={cn(
                            "font-mono font-bold px-2 py-0.5 rounded text-xs whitespace-nowrap shrink-0",
                            data.total > 0 ? "text-green-700 bg-green-50" : "text-neutral-400 bg-neutral-50"
                          )}
                        >
                          {data.total > 0 ? `+${data.total}` : "0"}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {data.concepts
                          .filter((c) => c.puntosObtenidos > 0)
                          .map((c, cIdx) => (
                            <div
                              key={cIdx}
                              className="flex justify-between items-center text-[12px] mt-1 text-neutral-500 pl-2 border-l-2 border-neutral-200 gap-2"
                            >
                              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                {c.tipoResultado} {c.posicion ? `(Pos ${c.posicion.toString().replace(/^p/i, "")})` : ""}
                              </span>
                              <span className="font-mono text-[11px] whitespace-nowrap shrink-0">
                                {c.puntosObtenidos > 0 ? `+${c.puntosObtenidos}` : "0"}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
