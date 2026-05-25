import React, { useState } from "react";
import { copyTextToClipboard } from "../../../../lib/clipboard";
import { useTableScreenshot } from "../../../../hooks/useTableScreenshot";

export function useStartlistExports(
  startlistTableRef: React.RefObject<HTMLDivElement | null>,
  startlistTeamsTableRef: React.RefObject<HTMLDivElement | null>,
  pointsTableRef: React.RefObject<HTMLDivElement | null>,
  publicStartlistRace: string
) {
  const [isStartlistCopying, setIsStartlistCopying] = useState<string | null>(null);
  const [isStartlistTeamsCopying, setIsStartlistTeamsCopying] = useState<string | null>(null);
  const [isStartlistTextCopying, setIsStartlistTextCopying] = useState(false);
  const [isStartlistTeamsTextCopying, setIsStartlistTeamsTextCopying] = useState(false);
  const [isPointsTextCopying, setIsPointsTextCopying] = useState(false);
  const [isPointsImageCopying, setIsPointsImageCopying] = useState<string | null>(null);

  const { handleCopyImage: copyStartlistImage, handleDownloadImage: downloadStartlistImage } = useTableScreenshot(startlistTableRef);
  const { handleCopyImage: copyStartlistTeamsImage, handleDownloadImage: downloadStartlistTeamsImage } = useTableScreenshot(startlistTeamsTableRef);
  const { handleCopyImage: copyPointsImage, handleDownloadImage: downloadPointsImage } = useTableScreenshot(pointsTableRef);


  const handleCopyStartlist = async (subset?: string) => {
    setIsStartlistCopying(subset || "full");
    try {
      await copyStartlistImage({
        fileName: `startlist_${publicStartlistRace || "export"}${subset ? `_${subset}` : ""}.png`,
        scale: 2,
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      });
    } finally {
      setIsStartlistCopying(null);
    }
  };

  const handleDownloadStartlist = async (subset?: string) => {
    setIsStartlistCopying(subset || "full");
    try {
      await downloadStartlistImage({
        fileName: `startlist_${publicStartlistRace || "export"}${subset ? `_${subset}` : ""}.png`,
        scale: 2,
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      });
    } finally {
      setIsStartlistCopying(null);
    }
  };

  const handleCopyStartlistText = async () => {
    if (!startlistTableRef.current || isStartlistTextCopying) return;
    setIsStartlistTextCopying(true);
    const table = startlistTableRef.current.querySelector("table");
    if (table) {
      const rows = Array.from(
        (table as HTMLTableElement).rows
      );
      const text = rows
        .map((row) =>
          Array.from((row as HTMLTableRowElement).cells)
            .map((cell) => cell.innerText.trim())
            .join("\t")
        )
        .join("\n");
      await copyTextToClipboard(
        text,
        `startlist_${publicStartlistRace || "export"}.txt`
      );
    }
    setTimeout(() => setIsStartlistTextCopying(false), 2000);
  };

  const handleCopyStartlistTeams = async (subset?: string) => {
    setIsStartlistTeamsCopying(subset || "full");
    try {
      await copyStartlistTeamsImage({
        fileName: `startlist_teams_${publicStartlistRace || "export"}${subset ? `_${subset}` : ""}.png`,
        scale: 2,
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      });
    } finally {
      setIsStartlistTeamsCopying(null);
    }
  };

  const handleDownloadStartlistTeams = async (subset?: string) => {
    setIsStartlistTeamsCopying(subset || "full");
    try {
      await downloadStartlistTeamsImage({
        fileName: `startlist_teams_${publicStartlistRace || "export"}${subset ? `_${subset}` : ""}.png`,
        scale: 2,
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      });
    } finally {
      setIsStartlistTeamsCopying(null);
    }
  };

  const handleCopyStartlistTeamsText = async () => {
    if (!startlistTeamsTableRef.current || isStartlistTeamsTextCopying) return;
    setIsStartlistTeamsTextCopying(true);
    const table = startlistTeamsTableRef.current.querySelector("table");
    if (table) {
      const rows = Array.from(
        (table as HTMLTableElement).rows
      );
   const text = rows
        .map((row) =>
          Array.from((row as HTMLTableRowElement).cells)
            .map((cell) => cell.innerText.trim())
            .join("\t")
        )
        .join("\n");
      await copyTextToClipboard(
        text,
        `startlist_teams_${publicStartlistRace || "export"}.txt`
      );
    }
    setTimeout(() => setIsStartlistTeamsTextCopying(false), 2000);
  };

  const handleCopyPoints = async () => {
    if (!pointsTableRef.current || isPointsTextCopying) return;
    setIsPointsTextCopying(true);
    const table = pointsTableRef.current.querySelector("table");
    if (table) {
      const rows = Array.from(
        (table as HTMLTableElement).rows
      );
      const text = rows
        .map((row) =>
          Array.from((row as HTMLTableRowElement).cells)
            .map((cell) => cell.innerText.trim())
            .join("\t")
        )
        .join("\n");
      await copyTextToClipboard(
        text,
        `points_${publicStartlistRace || "export"}.txt`
      );
    }
    setTimeout(() => setIsPointsTextCopying(false), 2000);
  };

  const handleCopyPointsImage = async (subset?: string) => {
    setIsPointsImageCopying(subset || "full");
    try {
      await copyPointsImage({
        fileName: `puntos_${publicStartlistRace || "export"}${subset ? `_${subset}` : ""}.png`,
        scale: 2,
        style: { overflow: "visible" },
        onBeforeCapture: (el: HTMLElement) => {
          el.className = el.className.replace("overflow-x-auto", "");
        }
      });
    } finally {
      setIsPointsImageCopying(null);
    }
  };

  const handleDownloadPointsImage = async (subset?: string) => {
    setIsPointsImageCopying(subset || "full");
    try {
      await downloadPointsImage({
        fileName: `puntos_${publicStartlistRace || "export"}${subset ? `_${subset}` : ""}.png`,
        scale: 2,
        style: { overflow: "visible" },
        onBeforeCapture: (el: HTMLElement) => {
          el.className = el.className.replace("overflow-x-auto", "");
        }
      });
    } finally {
      setIsPointsImageCopying(null);
    }
  };

  return {
    isStartlistCopying,
    isStartlistTeamsCopying,
    isStartlistTextCopying,
    isStartlistTeamsTextCopying,
    isPointsTextCopying,
    isPointsImageCopying,
    handleCopyStartlist,
    handleDownloadStartlist,
    handleCopyStartlistText,
    handleCopyStartlistTeams,
    handleDownloadStartlistTeams,
    handleCopyStartlistTeamsText,
    handleCopyPoints,
    handleCopyPointsImage,
    handleDownloadPointsImage
  };
}