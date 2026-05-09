import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";
import { SeasonViewContext } from "./season/SeasonViewContext";
import { SeasonHighlights } from "./season/SeasonHighlights";
import { SeasonCyclistsTab } from "./season/SeasonCyclistsTab";
import { SeasonWinsTab } from "./season/SeasonWinsTab";
import { SeasonPointsTab } from "./season/SeasonPointsTab";
import { SeasonMilestones } from "./season/SeasonMilestones";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { cn } from "../../lib/utils";
import { getVal, formatNumberSpanish } from "../../lib/data-processing";
import { domToBlob, domToDataUrl } from "modern-screenshot";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import React, { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";

const CyclistDetailView = lazy(() => import("../modals/CyclistDetailView").then(m => ({ default: m.CyclistDetailView })));


export interface SeasonViewProps {
  playerTeamMap: Record<string, string>;
  playerByCyclist: Record<string, string>;
  uniqueRaces: string[];
  files: any;
  leaderboard: any[];
  raceWinners: Record<string, string>;
  globalTeamPartialWinsCount: any;
  globalTeamWinsCount: any;
  cyclistMetadata: any;
  cyclistRoundMap: Record<string, string>;
  playerOrderMap: Record<string, string>;
}

export const SeasonView = (props: SeasonViewProps) => {
  const { files, playerTeamMap, playerByCyclist, uniqueRaces, leaderboard, raceWinners, globalTeamPartialWinsCount, globalTeamWinsCount, cyclistMetadata, cyclistRoundMap, playerOrderMap } = props;

  const [seasonSubTab, setSeasonSubTab] = useState("puntos");
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [evolutionMode, setEvolutionMode] = useState("acumulado");
  const [evolutionTimeFilter, setEvolutionTimeFilter] = useState("all");
  const [isEvolutionChartExpanded, setIsEvolutionChartExpanded] = useState(false);
  const [teamsSortColumn, setTeamsSortColumn] = useState("totalPoints");
  const [teamsSortDirection, setTeamsSortDirection] = useState("desc");
  const [isTopTeamsTableExpanded, setIsTopTeamsTableExpanded] = useState(false);
  const [isTopTeamsTableCopying, setIsTopTeamsTableCopying] = useState(false);
  const [isWinsRankingExpanded, setIsWinsRankingExpanded] = useState(false);
  const [winsChartType, setWinsChartType] = useState("wins");
  const [historyTeamFilter, setHistoryTeamFilter] = useState("all");
  const [historySortColumn, setHistorySortColumn] = useState("fecha");
  const [historySortDirection, setHistorySortDirection] = useState("desc");
  const [cyclistsSubTab, setCyclistsSubTab] = useState("draft");
  const [cyclistsMonthFilter, setCyclistsMonthFilter] = useState("all");
  const [isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen] = useState(false);
  const [isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen] = useState(false);
  const [isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen] = useState(false);
  const [isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded] = useState(false);
  const [topCyclistsLimit, setTopCyclistsLimit] = useState(10);
  const [isUnscoredExpanded, setIsUnscoredExpanded] = useState(false);
  const [isUndebutedExpanded, setIsUndebutedExpanded] = useState(false);
  const [noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter] = useState("all");
  const [isNoDraftCyclistsExpanded, setIsNoDraftCyclistsExpanded] = useState(false);
  const [noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit] = useState(10);
  const [selectedCyclistDetail, setSelectedCyclistDetail] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  const winsRankingRef = useRef<HTMLDivElement>(null);
  const winsHistoryRef = useRef<HTMLDivElement>(null);
  const unscoredTableRef = useRef<HTMLDivElement>(null);
  const undebutedTableRef = useRef<HTMLDivElement>(null);
  const noDraftCyclistsTableRef = useRef<HTMLDivElement>(null);

  const LINE_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0284c7", "#ea580c", "#c026d3", "#059669", "#4f46e5", "#b91c1c", "#0891b2", "#84cc16", "#db2777", "#f59e0b", "#65a30d", "#8b5cf6", "#14b8a6", "#ec4899", "#f97316"];



  const [topTeamsSortColumn, setTopTeamsSortColumn] = useState<string>("pos");
  const [topTeamsSortDirection, setTopTeamsSortDirection] = useState<"asc" | "desc">("asc");
  const [winsHistorySortColumn, setWinsHistorySortColumn] = useState<string>("carrera");
  const [winsHistorySortDirection, setWinsHistorySortDirection] = useState<"asc" | "desc">("asc");
  const [cyclistsSortColumn, setCyclistsSortColumn] = useState<string>("puntos");
  const [cyclistsSortDirection, setCyclistsSortDirection] = useState<"asc" | "desc">("desc");
  const [unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn] = useState<string>("pos");
  const [unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection] = useState<"asc" | "desc">("asc");
  const [undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn] = useState<string>("pos");
  const [undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection] = useState<"asc" | "desc">("asc");
  const [noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn] = useState<string>("puntos");
  const [noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection] = useState<"asc" | "desc">("desc");

  const [teamsMonthFilter, setTeamsMonthFilter] = useState<string>("all");
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>("all");

  const [cyclistsTeamFilter, setCyclistsTeamFilter] = useState<string[]>([]);
  const [isTeamFilterOpen, setIsTeamFilterOpen] = useState(false);
  const [cyclistsCategoryFilter, setCyclistsCategoryFilter] = useState<string[]>([]);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [cyclistsRoundFilter, setCyclistsRoundFilter] = useState<string[]>([]);
  const [isRoundFilterOpen, setIsRoundFilterOpen] = useState(false);
  const [cyclistsNameSearch, setCyclistsNameSearch] = useState<string>("");

  const [unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter] = useState<string>("all");
  const [unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter] = useState<string[]>([]);
  const [isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen] = useState(false);
  
  const [undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter] = useState<string>("all");
  const [undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter] = useState<string[]>([]);
  const [isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen] = useState(false);

  const [noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter] = useState<string>("all");

  // Copy States
  const [isChartCopying, setIsChartCopying] = useState(false);
  const [isEvolutionChartCopying, setIsEvolutionChartCopying] = useState(false);
  const [isTopTeamsCopying, setIsTopTeamsCopying] = useState(false);
  const [isWinsRankingCopying, setIsWinsRankingCopying] = useState(false);
  const [isWinsEvolutionCopying, setIsWinsEvolutionCopying] = useState(false);
  const [isWinsHistoryCopying, setIsWinsHistoryCopying] = useState(false);
  const [isWinsHistoryTextCopying, setIsWinsHistoryTextCopying] = useState(false);
  const [isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying] = useState(false);
  const [isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying] = useState(false);
  const [isUnscoredCopying, setIsUnscoredCopying] = useState(false);
  const [isUnscoredTextCopying, setIsUnscoredTextCopying] = useState(false);
  const [isUndebutedCopying, setIsUndebutedCopying] = useState(false);
  const [isUndebutedTextCopying, setIsUndebutedTextCopying] = useState(false);
  const [isNoDraftCyclistsCopying, setIsNoDraftCyclistsCopying] = useState(false);
  const [isNoDraftCyclistsTextCopying, setIsNoDraftCyclistsTextCopying] = useState(false);

  // Refs
  const chartRef = useRef<HTMLDivElement>(null);
  const evolutionChartRef = useRef<HTMLDivElement>(null);
  const topTeamsTableRef = useRef<HTMLDivElement>(null);
  const winsRankingTableRef = useRef<HTMLDivElement>(null);
  const winsEvolutionRef = useRef<HTMLDivElement>(null);
  const winsHistoryTableRef = useRef<HTMLDivElement>(null);
  const topCyclistsDraftRef = useRef<HTMLDivElement>(null);
  const unscoredRef = useRef<HTMLDivElement>(null);
  const undebutedRef = useRef<HTMLDivElement>(null);
  const noDraftCyclistsRef = useRef<HTMLDivElement>(null);

  const [selectedEvolutionTeams, setSelectedEvolutionTeams] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEvolutionExpanded, setIsEvolutionExpanded] = useState(false);
  const [isWinsExpanded, setIsWinsExpanded] = useState(false);
  const [isWinsEvolutionExpanded, setIsWinsEvolutionExpanded] = useState(false);
  const [isWinsHistoryExpanded, setIsWinsHistoryExpanded] = useState(false);

  const [leaderboardTeamsSearch, setLeaderboardTeamsSearch] = useState("");
  const [winsSearch, setWinsSearch] = useState("");
  const [winsHistorySearch, setWinsHistorySearch] = useState("");

  const handleCopyChart = async () => {
    if (!chartRef.current || isCopying) return;

    setIsCopying(true);
    let restore = () => {};
    
    
    
    try {
      
      
      
      
      
      
      
      restore = expandNodeForCapture(chartRef.current);
      
      // Check if ClipboardItem is supported
      
              {
                const processCopy = async () => {
                  // Use domToDataUrl first as it seems more reliable for Recharts labels
            const dataUrl = await domToDataUrl(chartRef.current!, {
              scale: 3, 

        backgroundColor: '#ffffff',
              
              style: { overflow: "visible" },
            });

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            return blob;
                };
                await copyImageToClipboard(processCopy(), "export.png");
                setTimeout(() => setIsCopying(false), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
      
    }
  };

  const handleDownloadChart = async () => {
    if (!chartRef.current) return;
    
    let restore = () => {};
    
    try {
      
      
      
      restore = expandNodeForCapture(chartRef.current);
      
      const dataUrl = await domToDataUrl(chartRef.current, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        style: { overflow: "visible" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "clasificacion-general.png";
      link.click();
    } catch (err) {
      console.error("Error downloading chart:", err);
    } finally {
      restore();
    }
  };

  const handleCopyEvolutionChart = async () => {
    if (!evolutionChartRef.current || isEvolutionChartCopying) return;

    setIsEvolutionChartCopying(true);
    let restore = () => {};
    
    try {
      
      
      
      restore = expandNodeForCapture(evolutionChartRef.current);
      
      
              {
                const processCopy = async () => {
                  const dataUrl = await domToDataUrl(evolutionChartRef.current!, {
              scale: 3, 

        backgroundColor: '#ffffff',
              style: { overflow: "visible" },
            });
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            return blob;
                };
                await copyImageToClipboard(processCopy(), "export.png");
                setTimeout(() => setIsEvolutionChartCopying(false), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
    }
  };

  const handleDownloadEvolutionChart = async () => {
    if (!evolutionChartRef.current) return;
    
    let restore = () => {};
    
    try {
      
      
      
      restore = expandNodeForCapture(evolutionChartRef.current);
      
      const dataUrl = await domToDataUrl(evolutionChartRef.current, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        style: { overflow: "visible" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "evolucion-mensual.png";
      link.click();
    } catch (err) {
      console.error("Error downloading chart:", err);
    } finally {
      restore();
    }
  };

  const handleCopyTopTeamsTable = async () => {
    if (!topTeamsTableRef.current || isTopTeamsTableCopying) return;

    setIsTopTeamsTableCopying(true);
    let restore = () => {};
    try {
      
              {
                const processCopy = async () => {
                  restore = expandNodeForCapture(topTeamsTableRef.current!);
            try {
              const dataUrl = await domToDataUrl(topTeamsTableRef.current!, {
                scale: 3, 

        backgroundColor: '#ffffff',
                
                style: { overflow: "visible" },
                
              });
              const response = await fetch(dataUrl);
              const blob = await response.blob();
              return blob;
            } finally {
              restore();
            }
                };
                await copyImageToClipboard(processCopy(), "export.png");
                setTimeout(() => setIsTopTeamsTableCopying(false), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  }
  };

  const handleDownloadTopTeamsTable = async () => {
    if (!topTeamsTableRef.current) return;
    const restore = expandNodeForCapture(topTeamsTableRef.current);
    try {
      const dataUrl = await domToDataUrl(topTeamsTableRef.current, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        
        style: { overflow: "visible" },
        
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "top-equipos-puntuacion.png";
      link.click();
    } catch (err) {
      console.error("Error downloading table:", err);
    } finally {
      restore();
    }
  };

  const handleCopyWinsRanking = async () => {
    if (!winsRankingRef.current || isWinsRankingCopying) return;
    setIsWinsRankingCopying(true);
    let restore = () => {};
    try {
      
      
      
      restore = expandNodeForCapture(winsRankingRef.current);
      
      
              {
                const processCopy = async () => {
                  const dataUrl = await domToDataUrl(winsRankingRef.current!, {
              scale: 3, 

        backgroundColor: '#ffffff',
              style: { overflow: "visible" },
            });
            const response = await fetch(dataUrl);
            return await response.blob();
                };
                await copyImageToClipboard(processCopy(), "export.png");
                setTimeout(() => setIsWinsRankingCopying(false), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
    }
  };

  const handleDownloadWinsRanking = async () => {
    if (!winsRankingRef.current) return;
    let restore = () => {};
    try {
      
      
      
      restore = expandNodeForCapture(winsRankingRef.current);
      
      const dataUrl = await domToDataUrl(winsRankingRef.current, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        style: { overflow: "visible" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "ranking-victorias.png";
      link.click();
    } catch (err) {
      console.error("Error downloading chart:", err);
    } finally {
      restore();
    }
  };

  const handleCopyWinsEvolution = async () => {
    if (!winsEvolutionRef.current || isWinsEvolutionCopying) return;
    setIsWinsEvolutionCopying(true);
    let restore = () => {};
    try {
      
      
      
      restore = expandNodeForCapture(winsEvolutionRef.current);

      
              {
                const processCopy = async () => {
                  const dataUrl = await domToDataUrl(winsEvolutionRef.current!, {
              scale: 3, 

        backgroundColor: '#ffffff',
              style: { overflow: "visible" },
            });
            const response = await fetch(dataUrl);
            return await response.blob();
                };
                await copyImageToClipboard(processCopy(), "export.png");
                setTimeout(() => setIsWinsEvolutionCopying(false), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
    }
  };

  const handleDownloadWinsEvolution = async () => {
    if (!winsEvolutionRef.current) return;
    let restore = () => {};
    try {
      
      
      
      restore = expandNodeForCapture(winsEvolutionRef.current);

      const dataUrl = await domToDataUrl(winsEvolutionRef.current, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        style: { overflow: "visible" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "evolucion-victorias.png";
      link.click();
    } catch (err) {
      console.error("Error downloading chart:", err);
    } finally {
      restore();
    }
  };

  const handleCopyWinsHistory = async (
    subset?:
      | "full"
      | "p1"
      | "p2"
      | "p3"
      | "p4"
      | "p5"
      | "p6"
      | "p7"
      | "p8"
      | "p9"
      | "p10",
  ) => {
    if (!winsHistoryRef.current || isWinsHistoryCopying) return;
    setIsWinsHistoryCopying(subset || "full");

    const tableContainer = winsHistoryRef.current;
    const rows = tableContainer.querySelectorAll(".wins-history-row");
    const restore = expandNodeForCapture(tableContainer);

    try {
      if (subset && subset !== "full") {
        const start =
          ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"].indexOf(
            subset,
          ) * 50;
        const end = start + 50;
      }

      
              {
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
                setTimeout(() => setIsWinsHistoryCopying(null), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
    }
  };

  const handleCopyWinsHistoryText = async () => {
    if (!winsHistoryRef.current || isWinsHistoryTextCopying) return;
    setIsWinsHistoryTextCopying(true);

    // Extracción de datos de la UI
    const table = winsHistoryRef.current.querySelector("table");
    if (!table) {
      setIsWinsHistoryTextCopying(false);
      return;
    }

    const rows = Array.from(table.rows);
    const text = rows
      .map((row: any) =>
        Array.from(row.cells)
          .map((cell: any) => cell.innerText.trim())
          .join("\t"),
      )
      .join("\n");

    await copyTextToClipboard(text, 'export.txt');
    setTimeout(() => setIsWinsHistoryTextCopying(false), 2000);
  };

  const handleDownloadWinsHistory = async (
    subset?:
      | "full"
      | "p1"
      | "p2"
      | "p3"
      | "p4"
      | "p5"
      | "p6"
      | "p7"
      | "p8"
      | "p9"
      | "p10",
  ) => {
    if (!winsHistoryRef.current) return;

    const tableContainer = winsHistoryRef.current;
    const rows = tableContainer.querySelectorAll(".wins-history-row");
    const restore = expandNodeForCapture(tableContainer);

    try {
      if (subset && subset !== "full") {
        const start =
          ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"].indexOf(
            subset,
          ) * 50;
        const end = start + 50;
      }

      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        
        style: { overflow: "visible" },
        
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      const suffix = subset && subset !== "full" ? `-${subset}` : "";
      link.download = `historial-ganadores${suffix}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading table:", err);
    } finally {
      restore();
    }
  };

  const handleCopyTopCyclistsDraft = async (
    subset?:
      | "full"
      | "p1"
      | "p2"
      | "p3"
      | "p4"
      | "p5"
      | "p6"
      | "p7"
      | "p8"
      | "p9"
      | "p10"
      | "p11"
      | "p12"
      | "p13"
      | "p14"
      | "p15"
      | "p16"
      | "p17"
      | "p18"
      | "p19"
      | "p20",
  ) => {
    if (!topCyclistsDraftRef.current || isTopCyclistsDraftCopying) return;
    setIsTopCyclistsDraftCopying(subset || "full");

    // Wait for React to re-render the button states before capturing
    await new Promise((resolve) => setTimeout(resolve, 200));

    const tableContainer = topCyclistsDraftRef.current;
    if (!tableContainer) return;
    const rows = tableContainer.querySelectorAll(".top-cyclists-row");
    const restore = expandNodeForCapture(tableContainer);

    try {
      const processCopy = async () => {
        const dataUrl = await domToDataUrl(tableContainer, {
          scale: 3,
          backgroundColor: '#ffffff',
          style: {
            overflow: "visible",
            textRendering: "optimizeLegibility",
          },
        });
        return await (await fetch(dataUrl)).blob();
      };
      const suffix = subset && subset !== 'full' ? `_${subset}` : '';
      await copyImageToClipboard(processCopy(), `top_cyclists_draft${suffix}.png`);
      setTimeout(() => setIsTopCyclistsDraftCopying(null), 2000);
    } catch (err) {
      console.warn("Error during copy fallback", err);
    } finally {
      restore();
    }
  };

  const handleCopyTopCyclistsDraftText = async () => {
    if (!topCyclistsDraftRef.current || isTopCyclistsDraftTextCopying) return;
    setIsTopCyclistsDraftTextCopying(true);

    const table = topCyclistsDraftRef.current.querySelector("table");
    if (!table) {
      setIsTopCyclistsDraftTextCopying(false);
      return;
    }

    const rows = Array.from(table.rows);
    const text = rows
      .map((row: any) =>
        Array.from(row.cells)
          .map((cell: any) => cell.innerText.trim())
          .join("\t"),
      )
      .join("\n");

    await copyTextToClipboard(text, 'export.txt');
    setTimeout(() => setIsTopCyclistsDraftTextCopying(false), 2000);
  };

  const handleDownloadTopCyclistsDraft = async (
    subset?:
      | "full"
      | "p1"
      | "p2"
      | "p3"
      | "p4"
      | "p5"
      | "p6"
      | "p7"
      | "p8"
      | "p9"
      | "p10"
      | "p11"
      | "p12"
      | "p13"
      | "p14"
      | "p15"
      | "p16"
      | "p17"
      | "p18"
      | "p19"
      | "p20",
  ) => {
    if (!topCyclistsDraftRef.current) return;

    const tableContainer = topCyclistsDraftRef.current;
    const rows = tableContainer.querySelectorAll(".top-cyclists-row");
    const restore = expandNodeForCapture(tableContainer);

    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, 
        
        
        
        style: {
          overflow: "visible",
          textRendering: "optimizeLegibility",
        },
        
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      const suffix = subset && subset !== "full" ? `-${subset}` : "";
      link.download = `top-ciclistas-draft${suffix}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading table:", err);
    } finally {
      restore();
    }
  };

  const handleCopyUnscored = async (
    subset?: "full" | "p1" | "p2" | "p3" | "p4",
  ) => {
    if (!unscoredTableRef.current || isUnscoredCopying) return;
    setIsUnscoredCopying(subset || "full");
    await new Promise((resolve) => setTimeout(resolve, 200));
    const tableContainer = unscoredTableRef.current;
    if (!tableContainer) return;
    const restore = expandNodeForCapture(tableContainer);

    try 
  {
    const processCopy = async () => {
      const dataUrl = await domToDataUrl(tableContainer, { scale: 3,   backgroundColor: "#ffffff" });
      return await (await fetch(dataUrl)).blob();
    };
    await copyImageToClipboard(processCopy(), "export.png");
    setTimeout(() => setIsUnscoredCopying(null), 2000);
  }
                           catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
    }
  };

  const handleCopyUnscoredText = async () => {
    if (!unscoredTableRef.current || isUnscoredTextCopying) return;
    setIsUnscoredTextCopying(true);
    const table = unscoredTableRef.current.querySelector("table");
    if (!table) {
      setIsUnscoredTextCopying(false);
      return;
    }
    const rows = Array.from(table.rows);
    const text = rows
      .map((row: any) =>
        Array.from(row.cells)
          .map((cell: any) => cell.innerText.trim())
          .join("\t"),
      )
      .join("\n");
    await copyTextToClipboard(text, 'export.txt');
    setTimeout(() => setIsUnscoredTextCopying(false), 2000);
  };

  const handleDownloadUnscored = async (
    subset?: "full" | "p1" | "p2" | "p3" | "p4",
  ) => {
    if (!unscoredTableRef.current) return;
    const tableContainer = unscoredTableRef.current;
    const restore = expandNodeForCapture(tableContainer);
    try {
      const dataUrl = await domToDataUrl(tableContainer, { scale: 3,   backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.href = dataUrl;
      const suffix = subset && subset !== "full" ? `-${subset}` : "";
      link.download = `ciclistas-sin-puntuar${suffix}.png`;
      link.click();
    } catch (err) {
    } finally {
      restore();
    }
  };

  const handleCopyUndebuted = async (subset?: "full" | "p1" | "p2") => {
    if (!undebutedTableRef.current || isUndebutedCopying) return;
    setIsUndebutedCopying(subset || "full");
    await new Promise((resolve) => setTimeout(resolve, 200));
    const tableContainer = undebutedTableRef.current;
    if (!tableContainer) return;
    const restore = expandNodeForCapture(tableContainer);

    try 
  {
    const processCopy = async () => {
      const dataUrl = await domToDataUrl(tableContainer, {
          scale: 3, 
          
          backgroundColor: '#ffffff',
          
          style: { overflow: "visible", textRendering: "optimizeLegibility" },
          
        });
      return await (await fetch(dataUrl)).blob();
    };
    await copyImageToClipboard(processCopy(), "export.png");
    setTimeout(() => setIsUndebutedCopying(null), 2000);
  }
                           catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
    }
  };

  const handleCopyUndebutedText = async () => {
    if (!undebutedTableRef.current || isUndebutedTextCopying) return;
    setIsUndebutedTextCopying(true);
    const table = undebutedTableRef.current.querySelector("table");
    if (!table) {
      setIsUndebutedTextCopying(false);
      return;
    }
    const rows = Array.from(table.rows);
    const text = rows
      .map((row: any) =>
        Array.from(row.cells)
          .map((cell: any) => cell.innerText.trim())
          .join("\t"),
      )
      .join("\n");
    await copyTextToClipboard(text, 'export.txt');
    setTimeout(() => setIsUndebutedTextCopying(false), 2000);
  };

  const handleDownloadUndebuted = async (subset?: "full" | "p1" | "p2") => {
    if (!undebutedTableRef.current) return;
    const tableContainer = undebutedTableRef.current;
    const restore = expandNodeForCapture(tableContainer);
    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
        
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      const suffix = subset && subset !== "full" ? `-${subset}` : "";
      link.download = `ciclistas-sin-debutar${suffix}.png`;
      link.click();
    } catch (err) {
    } finally {
      restore();
    }
  };

  const handleCopyNoDraftCyclists = async (subset?: "full" | "p1" | "p2") => {
    if (!noDraftCyclistsTableRef.current || isNoDraftCyclistsCopying) return;
    setIsNoDraftCyclistsCopying(subset || "full");
    await new Promise((resolve) => setTimeout(resolve, 200));
    const tableContainer = noDraftCyclistsTableRef.current;
    if (!tableContainer) return;

    const rows = tableContainer.querySelectorAll(".no-draft-row");
    const restore = expandNodeForCapture(tableContainer);

    try 
  {
    const processCopy = async () => {
      const dataUrl = await domToDataUrl(tableContainer, {
          scale: 3, 
          
          backgroundColor: '#ffffff',
          
          style: { overflow: "visible", textRendering: "optimizeLegibility" },
          
        });
      return await (await fetch(dataUrl)).blob();
    };
    await copyImageToClipboard(processCopy(), "export.png");
    setTimeout(() => setIsNoDraftCyclistsCopying(null), 2000);
  }
                           catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
      rows.forEach((row) => row.classList.remove("hidden"));
    }
  };

  const handleCopyNoDraftCyclistsText = async () => {
    if (!leaderboard) return;
    setIsNoDraftCyclistsTextCopying(true);

    try {
      const noDraftPlayer = leaderboard?.find((p) => p.jugador === "No draft");
      if (!noDraftPlayer) return;

      const cyclistStats: Record<string, any> = {};
      const raceMonths: Record<string, number> = {};
      files.carreras.data?.forEach((r) => {
        const name = getVal(r, "Carrera")?.trim();
        const fecha = getVal(r, "Fecha");
        if (name && fecha) {
          const parts = fecha.toString().split(/[-/]/);
          if (parts.length >= 2) raceMonths[name] = parseInt(parts[1]) - 1;
        }
      });

      noDraftPlayer.detalles.forEach((d) => {
        if (
          noDraftCyclistsMonthFilter !== "all" &&
          raceMonths[d.carrera] !== parseInt(noDraftCyclistsMonthFilter)
        )
          return;
        if (!cyclistStats[d.ciclista]) {
          const meta = cyclistMetadata[d.ciclista];
          cyclistStats[d.ciclista] = {
            puntos: 0,
            pais: meta?.pais || "",
            equipo: meta?.equipoBreve || "",
            victorias: 0,
            carreras: new Set(),
          };
        }
        const s = cyclistStats[d.ciclista];
        s.puntos += d.puntosObtenidos;
        s.carreras.add(d.carrera);
        const isPos01 = d.posicion === "01" || d.posicion === "1";
        const isValidType = [
          "Etapa",
          "Etapa (Crono equipos)",
          "Clasificación final",
          "Clasificación final (Crono equipos)",
          "Clásica",
        ].includes(d.tipoResultado);
        if (isPos01 && isValidType) s.victorias++;
      });

      const sorted = Object.entries(cyclistStats)
        .map(([name, data]) => ({
          name,
          data,
          numCarreras: data.carreras.size,
        }))
        .sort((a, b) => b.data.puntos - a.data.puntos)
        .slice(0, noDraftTopCyclistsLimit);

      let text = "🏆 TOP CICLISTAS NO ELEGIDOS (NO DRAFT)\n\n";
      sorted.forEach((s, i) => {
        text += `${i + 1}. ${s.name} (${s.data.equipo}) - ${s.data.puntos} pts\n`;
      });

      await await copyTextToClipboard(text, 'export.txt');
      setTimeout(() => setIsNoDraftCyclistsTextCopying(false), 2000);
    } catch (err) {
      setIsNoDraftCyclistsTextCopying(false);
    }
  };

  const handleDownloadNoDraftCyclists = async (
    subset?: "full" | "p1" | "p2",
  ) => {
    if (!noDraftCyclistsTableRef.current) return;
    const tableContainer = noDraftCyclistsTableRef.current;
    const rows = tableContainer.querySelectorAll(".no-draft-row");
    const restore = expandNodeForCapture(tableContainer);
    try {
      if (subset && subset !== "full") {
        const page = parseInt(subset.slice(1)) - 1;
        const start = page * 50;
        const end = start + 50;
        rows.forEach((row, idx) => {
          if (idx < start || idx >= end) row.classList.add("hidden");
        });
      }

      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
        
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      const suffix = subset && subset !== "full" ? `-${subset}` : "";
      link.download = `top-ciclistas-no-elegidos${suffix}.png`;
      link.click();
    } catch (err) {
    } finally {
      restore();
      rows.forEach((row) => row.classList.remove("hidden"));
    }
  };

  

  const { filteredLeaderboard, teamWinsCount } = useMemo(() => {
    const filteredLeaderboard = leaderboard?.filter((p) => p.nombreEquipo !== "No draft") || [];
    const teamWinsCount: Record<string, number> = {};
    filteredLeaderboard?.forEach((p) => {
      if (p.nombreEquipo !== "No draft" && p.nombreEquipo !== "No draft [99]") {
        teamWinsCount[p.nombreEquipo] = 0;
      }
    });
    Object.values(raceWinners).forEach((teamName) => {
      const name = teamName as string;
      if (teamWinsCount[name] !== undefined) {
        teamWinsCount[name]++;
      }
    });
    return { filteredLeaderboard, teamWinsCount };
  }, [leaderboard, raceWinners]);

  return (
    <SeasonViewContext.Provider value={{cn, CyclistDetailView, files, playerTeamMap, playerByCyclist, uniqueRaces, leaderboard, raceWinners, globalTeamPartialWinsCount, globalTeamWinsCount, cyclistMetadata, cyclistRoundMap, playerOrderMap, seasonSubTab, setSeasonSubTab, isChartExpanded, setIsChartExpanded, evolutionMode, setEvolutionMode, evolutionTimeFilter, setEvolutionTimeFilter, isEvolutionChartExpanded, setIsEvolutionChartExpanded, teamsSortColumn, setTeamsSortColumn, teamsSortDirection, setTeamsSortDirection, isTopTeamsTableExpanded, setIsTopTeamsTableExpanded, isTopTeamsTableCopying, setIsTopTeamsTableCopying, isWinsRankingExpanded, setIsWinsRankingExpanded, winsChartType, setWinsChartType, historyTeamFilter, setHistoryTeamFilter, historySortColumn, setHistorySortColumn, historySortDirection, setHistorySortDirection, cyclistsSubTab, setCyclistsSubTab, cyclistsMonthFilter, setCyclistsMonthFilter, isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen, isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen, isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen, isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded, topCyclistsLimit, setTopCyclistsLimit, isUnscoredExpanded, setIsUnscoredExpanded, isUndebutedExpanded, setIsUndebutedExpanded, noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter, isNoDraftCyclistsExpanded, setIsNoDraftCyclistsExpanded, noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit, selectedCyclistDetail, setSelectedCyclistDetail, isCopying, setIsCopying, winsRankingRef, winsHistoryRef, unscoredTableRef, undebutedTableRef, noDraftCyclistsTableRef, LINE_COLORS, topTeamsSortColumn, setTopTeamsSortColumn, topTeamsSortDirection, setTopTeamsSortDirection, winsHistorySortColumn, setWinsHistorySortColumn, winsHistorySortDirection, setWinsHistorySortDirection, cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection, unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn, unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection, undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn, undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection, noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn, noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection, teamsMonthFilter, setTeamsMonthFilter, historyMonthFilter, setHistoryMonthFilter, cyclistsTeamFilter, setCyclistsTeamFilter, isTeamFilterOpen, setIsTeamFilterOpen, cyclistsCategoryFilter, setCyclistsCategoryFilter, isCategoryFilterOpen, setIsCategoryFilterOpen, cyclistsRoundFilter, setCyclistsRoundFilter, isRoundFilterOpen, setIsRoundFilterOpen, cyclistsNameSearch, setCyclistsNameSearch, unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter, unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter, isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen, undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter, undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter, isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen, noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter, isChartCopying, setIsChartCopying, isEvolutionChartCopying, setIsEvolutionChartCopying, isTopTeamsCopying, setIsTopTeamsCopying, isWinsRankingCopying, setIsWinsRankingCopying, isWinsEvolutionCopying, setIsWinsEvolutionCopying, isWinsHistoryCopying, setIsWinsHistoryCopying, isWinsHistoryTextCopying, setIsWinsHistoryTextCopying, isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying, isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying, isUnscoredCopying, setIsUnscoredCopying, isUnscoredTextCopying, setIsUnscoredTextCopying, isUndebutedCopying, setIsUndebutedCopying, isUndebutedTextCopying, setIsUndebutedTextCopying, isNoDraftCyclistsCopying, setIsNoDraftCyclistsCopying, isNoDraftCyclistsTextCopying, setIsNoDraftCyclistsTextCopying, chartRef, evolutionChartRef, topTeamsTableRef, winsRankingTableRef, winsEvolutionRef, winsHistoryTableRef, topCyclistsDraftRef, unscoredRef, undebutedRef, noDraftCyclistsRef, selectedEvolutionTeams, setSelectedEvolutionTeams, isExpanded, setIsExpanded, isEvolutionExpanded, setIsEvolutionExpanded, isWinsExpanded, setIsWinsExpanded, isWinsEvolutionExpanded, setIsWinsEvolutionExpanded, isWinsHistoryExpanded, setIsWinsHistoryExpanded, leaderboardTeamsSearch, setLeaderboardTeamsSearch, winsSearch, setWinsSearch, winsHistorySearch, setWinsHistorySearch, handleCopyChart, handleDownloadChart, handleCopyEvolutionChart, handleDownloadEvolutionChart, handleCopyTopTeamsTable, handleDownloadTopTeamsTable, handleCopyWinsRanking, handleDownloadWinsRanking, handleCopyWinsEvolution, handleDownloadWinsEvolution, handleCopyWinsHistory, handleCopyWinsHistoryText, handleDownloadWinsHistory, handleCopyTopCyclistsDraft, handleCopyTopCyclistsDraftText, handleDownloadTopCyclistsDraft, handleCopyUnscored, handleCopyUnscoredText, handleDownloadUnscored, handleCopyUndebuted, handleCopyUndebutedText, handleDownloadUndebuted, handleCopyNoDraftCyclists, handleCopyNoDraftCyclistsText, handleDownloadNoDraftCyclists, formatNumberSpanish, getVal, filteredLeaderboard, teamWinsCount}}>
          <div className="space-y-8">
            <SeasonHighlights 
              leaderboard={leaderboard} 
              raceWinners={raceWinners} 
              uniqueRaces={uniqueRaces} 
              files={files} 
            />
  {/* Sub-tabs Navigation */}
  <div className="flex justify-center mb-8">
    <div className="flex bg-neutral-100 p-1.5 rounded-xl shadow-inner">
      {[
        { id: "puntos", label: "Puntos", icon: BarChart3 },
        { id: "victorias", label: "Victorias", icon: Trophy },
        { id: "ciclistas", label: "Ciclistas", icon: Users },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setSeasonSubTab(tab.id as any)}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200",
            seasonSubTab === tab.id
              ? "bg-white text-blue-600 shadow-md transform scale-105"
              : "text-neutral-500 hover:text-neutral-700 hover:bg-white/50"
          )}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  </div>

  <AnimatePresence mode="wait">
    {seasonSubTab === "puntos" && (
      <motion.div
        key="puntos"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <SeasonPointsTab />
      </motion.div>
    )}
    {seasonSubTab === "victorias" && (
      <motion.div
        key="victorias"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <SeasonWinsTab />
      </motion.div>
    )}
    {seasonSubTab === "ciclistas" && (
      <motion.div
        key="ciclistas"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <SeasonCyclistsTab />
      </motion.div>
    )}
  </AnimatePresence>

  <SeasonMilestones leaderboard={leaderboard} files={files} />
</div>
    </SeasonViewContext.Provider>
  );
};

export default SeasonView;
