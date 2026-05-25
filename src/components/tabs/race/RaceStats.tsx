import { PlayerScore } from '../../../lib/types';
import React, { useRef, useState } from "react";
import { copyTextToClipboard } from "../../../lib/clipboard";
import { cn } from "../../../lib/utils";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { RaceCyclistsTable } from "./stats/RaceCyclistsTable";
import { RaceStageBreakdown } from "./stats/RaceStageBreakdown";
import { RaceRetiredCyclists } from "./stats/RaceRetiredCyclists";
import { RaceDetailedBreakdown } from "./stats/RaceDetailedBreakdown";

interface RaceStatsProps {
  raceCyclists: any[];
  minCyclistRacePoints: number;
  maxCyclistRacePoints: number;
  maxCyclistPointsByCol: any;
  finalColumns: any[];
  teamStagePoints: any[];
  maxPointsByCol: any;
  retiredCyclists: any[];
  raceTeams: any[];
  selectedRace: string;
  leaderboard: PlayerScore[];
}

export const RaceStats = ({
  raceCyclists,
  minCyclistRacePoints,
  maxCyclistRacePoints,
  maxCyclistPointsByCol,
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

  const [isDetailedBreakdownCopying, setIsDetailedBreakdownCopying] = useState<"full" | "first" | "second" | "third" | null>(null);
  const [isDetailedBreakdownTextCopying, setIsDetailedBreakdownTextCopying] = useState(false);

  const cyclistsTableRef = useRef<HTMLDivElement>(null);
  const raceBreakdownTableRef = useRef<HTMLDivElement>(null);
  const retiredTableRef = useRef<HTMLDivElement>(null);
  const detailedBreakdownRef = useRef<HTMLDivElement>(null);

  const { handleCopyImage: copyCyclists, handleDownloadImage: downloadCyclists, isCopying: isCyclistsCopying } = useTableScreenshot(cyclistsTableRef);
  const { handleCopyImage: copyRaceBreakdown, handleDownloadImage: downloadRaceBreakdown, isCopying: isRaceBreakdownCopying } = useTableScreenshot(raceBreakdownTableRef);
  const { handleCopyImage: copyRetired, handleDownloadImage: downloadRetired, isCopying: isRetiredCopying } = useTableScreenshot(retiredTableRef);
  const { handleCopyImage: copyDetailedBreakdown, handleDownloadImage: downloadDetailedBreakdown } = useTableScreenshot(detailedBreakdownRef);

  const handleCopyCyclists = () => copyCyclists({ fileName: "export.png", scale: 3, style: { backgroundColor: "#ffffff" } });
  const handleDownloadCyclists = () => downloadCyclists({ fileName: "clasificacion-ciclistas.png", scale: 3, style: { backgroundColor: "#ffffff" } });

  const handleCopyRaceBreakdownImage = () => copyRaceBreakdown({ fileName: "export.png", scale: 3, style: { backgroundColor: "#ffffff", overflow: "visible" } });
  const handleDownloadRaceBreakdownImage = () => downloadRaceBreakdown({ fileName: `clasificacion-etapas-${selectedRace.replace(/\s+/g, "-").toLowerCase()}.png`, scale: 3, style: { backgroundColor: "#ffffff", overflow: "visible" } });

  const getRetiredOptions = (fileName: string) => ({
    fileName,
    scale: 1.5,
    style: { backgroundColor: "#ffffff", overflow: "visible", margin: "0" },
    onBeforeCapture: (el: HTMLElement) => {
      el.className = el.className.replace("max-h-[75vh]", "").replace("overflow-y-auto", "").replace("overflow-x-auto", "");
    },
    onAfterCapture: (el: HTMLElement) => {
    }
  });

  const handleCopyRetiredImage = () => copyRetired({ ...getRetiredOptions("abandonos.png") });
  const handleDownloadRetiredImage = () => downloadRetired({ ...getRetiredOptions(`abandonos-${selectedRace.replace(/\s+/g, "-").toLowerCase()}.png`) });

  const handleCopyDetailedBreakdownImage = async (subset?: "full" | "first" | "second" | "third") => {
    setIsDetailedBreakdownCopying(subset || "full");
    try {
      await copyDetailedBreakdown({
        fileName: "export.png",
        scale: 3,
        style: { textRendering: "optimizeLegibility" },
        onBeforeCapture: (container) => {
          const cards = container.querySelectorAll("[data-team-card]");
          if (subset) {
            cards.forEach((card) => {
              const num = parseInt(card.getAttribute("data-team-index") || "0");
              if (subset === "first" && num > 12) card.classList.add("hidden");
              if (subset === "second" && (num <= 12 || num > 24)) card.classList.add("hidden");
              if (subset === "third" && num <= 24) card.classList.add("hidden");
            });
          }
        },
        onAfterCapture: (container) => {
          const cards = container.querySelectorAll("[data-team-card]");
          cards.forEach((card) => {
            card.classList.remove("hidden");
          });
        }
      });
    } finally {
      setIsDetailedBreakdownCopying(null);
    }
  };

  const handleDownloadDetailedBreakdownImage = async (subset?: "full" | "first" | "second" | "third") => {
    try {
      await downloadDetailedBreakdown({
        fileName: `desglose-equipos-${selectedRace.replace(/\s+/g, "-").toLowerCase()}${subset ? `-${subset}` : ""}.png`,
        scale: 3,
        style: { textRendering: "optimizeLegibility" },
        onBeforeCapture: (container) => {
          const cards = container.querySelectorAll("[data-team-card]");
          if (subset) {
            cards.forEach((card) => {
              const num = parseInt(card.getAttribute("data-team-index") || "0");
              if (subset === "first" && num > 12) card.classList.add("hidden");
              if (subset === "second" && (num <= 12 || num > 24)) card.classList.add("hidden");
              if (subset === "third" && num <= 24) card.classList.add("hidden");
            });
          }
        },
        onAfterCapture: (container) => {
          const cards = container.querySelectorAll("[data-team-card]");
          cards.forEach((card) => {
            card.classList.remove("hidden");
          });
        }
      });
    } finally {
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
      <RaceCyclistsTable
        raceCyclists={raceCyclists}
        minCyclistRacePoints={minCyclistRacePoints}
        maxCyclistRacePoints={maxCyclistRacePoints}
        finalColumns={finalColumns}
        maxPointsByCol={maxCyclistPointsByCol}
        isExpanded={isCyclistsExpanded}
        setIsExpanded={setIsCyclistsExpanded}
        onCopyImage={handleCopyCyclists}
        isCopying={isCyclistsCopying}
        onDownloadImage={handleDownloadCyclists}
        tableRef={cyclistsTableRef}
      />

      <RaceStageBreakdown
        finalColumns={finalColumns}
        teamStagePoints={teamStagePoints}
        maxPointsByCol={maxPointsByCol}
        isExpanded={isStageExpanded}
        setIsExpanded={setIsStageExpanded}
        onCopyImage={handleCopyRaceBreakdownImage}
        isCopying={isRaceBreakdownCopying}
        onDownloadImage={handleDownloadRaceBreakdownImage}
        tableRef={raceBreakdownTableRef}
      />

      <RaceRetiredCyclists
        retiredCyclists={retiredCyclists}
        isExpanded={isRetiredExpanded}
        setIsExpanded={setIsRetiredExpanded}
        onCopyImage={handleCopyRetiredImage}
        isCopying={isRetiredCopying}
        onDownloadImage={handleDownloadRetiredImage}
        tableRef={retiredTableRef}
      />

      <RaceDetailedBreakdown
        raceTeams={raceTeams}
        isExpanded={isDetailedBreakdownExpanded}
        setIsExpanded={setIsDetailedBreakdownExpanded}
        onCopyText={handleCopyDetailedBreakdownText}
        isTextCopying={isDetailedBreakdownTextCopying}
        onCopyImage={handleCopyDetailedBreakdownImage}
        isImageCopying={isDetailedBreakdownCopying}
        onDownloadImage={handleDownloadDetailedBreakdownImage}
        tableRef={detailedBreakdownRef}
      />
    </>
  );
};
