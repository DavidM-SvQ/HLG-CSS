import { SeasonViewContext } from "./season/SeasonViewContext";
import { SeasonCyclistsTab } from "./season/SeasonCyclistsTab";
import { SeasonWinsTab } from "./season/SeasonWinsTab";
import { SeasonPointsTab } from "./season/SeasonPointsTab";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { cn } from "../../lib/utils";
import { getVal, formatNumberSpanish } from "../../lib/data-processing";
import { domToBlob, domToDataUrl } from "modern-screenshot";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { CyclistDetailView } from "../modals/CyclistDetailView";


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
  const [evolutionMode, setEvolutionMode] = useState("mensual");
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
      if (typeof ClipboardItem !== "undefined") {
        const clipboardItem = new ClipboardItem({
          "image/png": (async () => {
            // Use domToDataUrl first as it seems more reliable for Recharts labels
            const dataUrl = await domToDataUrl(chartRef.current!, {
              scale: 3, 
        
        backgroundColor: '#ffffff',
              
              style: { overflow: "visible" },
            });

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            return blob;
          })() as Promise<Blob>,
        });

        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsCopying(false), 2000);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
      /* console.error suppressed */
      setIsCopying(false);
      // Fallback: Download
      handleDownloadChart();
      /* Alert suppressed to improve user experience in iframe */
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
      
      if (typeof ClipboardItem !== "undefined") {
        const clipboardItem = new ClipboardItem({
          "image/png": (async () => {
            const dataUrl = await domToDataUrl(evolutionChartRef.current!, {
              scale: 3, 
        
        backgroundColor: '#ffffff',
              style: { overflow: "visible" },
            });
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            return blob;
          })() as Promise<Blob>,
        });

        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsEvolutionChartCopying(false), 2000);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
      /* console.error suppressed */
      setIsEvolutionChartCopying(false);
      handleDownloadEvolutionChart();
      /* Alert suppressed to improve user experience in iframe */
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
      if (typeof ClipboardItem !== "undefined") {
        const clipboardItem = new ClipboardItem({
          "image/png": (async () => {
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
          })() as Promise<Blob>,
        });

        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsTopTeamsTableCopying(false), 2000);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
      /* console.error suppressed */
      setIsTopTeamsTableCopying(false);
      handleDownloadTopTeamsTable();
      /* Alert suppressed to improve user experience in iframe */
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
      
      if (typeof ClipboardItem !== "undefined") {
        const clipboardItem = new ClipboardItem({
          "image/png": (async () => {
            const dataUrl = await domToDataUrl(winsRankingRef.current!, {
              scale: 3, 
        
        backgroundColor: '#ffffff',
              style: { overflow: "visible" },
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>,
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsWinsRankingCopying(false), 2000);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
      /* console.error suppressed */
      setIsWinsRankingCopying(false);
      handleDownloadWinsRanking();
      /* Alert suppressed to improve user experience in iframe */
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

      if (typeof ClipboardItem !== "undefined") {
        const clipboardItem = new ClipboardItem({
          "image/png": (async () => {
            const dataUrl = await domToDataUrl(winsEvolutionRef.current!, {
              scale: 3, 
        
        backgroundColor: '#ffffff',
              style: { overflow: "visible" },
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>,
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsWinsEvolutionCopying(false), 2000);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
      /* console.error suppressed */
      setIsWinsEvolutionCopying(false);
      handleDownloadWinsEvolution();
      /* Alert suppressed to improve user experience in iframe */
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

      if (typeof ClipboardItem !== "undefined") {
        const clipboardItem = new ClipboardItem({
          "image/png": (async () => {
            const dataUrl = await domToDataUrl(tableContainer, {
              scale: 3, 
        
        backgroundColor: '#ffffff',
              
              style: { overflow: "visible" },
              
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>,
        });

        try {
          window.focus();
          await navigator.clipboard.write([clipboardItem]);
        } catch (copyErr) {
          /* console.error suppressed */
          throw copyErr;
        }
        setTimeout(() => setIsWinsHistoryCopying(null), 2000);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
      /* console.error suppressed */
      setIsWinsHistoryCopying(null);
      handleDownloadWinsHistory(subset);
      /* Alert suppressed to improve user experience in iframe */
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

    navigator.clipboard.writeText(text);
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
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, 
        
        
        
        style: {
          overflow: "visible",
          textRendering: "optimizeLegibility",
        },
        
      });

      if (typeof ClipboardItem !== "undefined") {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const clipboardItem = new ClipboardItem({ "image/png": blob });
        try {
          window.focus();
          await navigator.clipboard.write([clipboardItem]);
        } catch (copyErr) {
          /* console.error suppressed */
          // If write fails, it will fall through to the catch block and trigger download
          throw copyErr;
        }
        setTimeout(() => setIsTopCyclistsDraftCopying(null), 2000);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
      /* console.error suppressed */
      setIsTopCyclistsDraftCopying(null);
      handleDownloadTopCyclistsDraft(subset);
      /* Alert suppressed to improve user experience in iframe */
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

    navigator.clipboard.writeText(text);
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

    try {
            const dataUrl = await domToDataUrl(tableContainer, { scale: 3,   backgroundColor: "#ffffff" });
      if (typeof ClipboardItem !== "undefined") {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        try {
          window.focus();
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        } catch (e) {
          throw e;
        }
        setTimeout(() => setIsUnscoredCopying(null), 2000);
      } else throw new Error("ClipboardItem not supported");
    } catch (err) {
      setIsUnscoredCopying(null);
      handleDownloadUnscored(subset);
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
    navigator.clipboard.writeText(text);
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

    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
        
      });
      if (typeof ClipboardItem !== "undefined") {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        try {
          window.focus();
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        } catch (e) {
          throw e;
        }
        setTimeout(() => setIsUndebutedCopying(null), 2000);
      } else throw new Error("ClipboardItem not supported");
    } catch (err) {
      setIsUndebutedCopying(null);
      handleDownloadUndebuted(subset);
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
    navigator.clipboard.writeText(text);
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
      if (typeof ClipboardItem !== "undefined") {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        try {
          window.focus();
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        } catch (e) {
          throw e;
        }
        setTimeout(() => setIsNoDraftCyclistsCopying(null), 2000);
      } else throw new Error("ClipboardItem not supported");
    } catch (err) {
      setIsNoDraftCyclistsCopying(null);
      handleDownloadNoDraftCyclists(subset);
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

      await navigator.clipboard.writeText(text);
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
        {(() => {
                  const filteredLeaderboard =
                    leaderboard?.filter((p) => p.nombreEquipo !== "No draft") ||
                    [];
                  const top3 = filteredLeaderboard.slice(0, 3);

                  // Handle ties for Leader
                  const maxPoints =
                    filteredLeaderboard.length > 0
                      ? filteredLeaderboard[0].puntos
                      : 0;
                  const leaders = filteredLeaderboard.filter(
                    (p) => p.puntos === maxPoints,
                  );
                  const leaderNames = leaders
                    .map((l) => l.nombreEquipo)
                    .join(" / ");

                  // Calculate wins per team (excluding No draft)
                  const teamWinsCount: Record<string, number> = {};
                  filteredLeaderboard?.forEach((p) => {
                    if (
                      p.nombreEquipo !== "No draft" &&
                      p.nombreEquipo !== "No draft [99]"
                    ) {
                      teamWinsCount[p.nombreEquipo] = 0;
                    }
                  });
                  Object.values(raceWinners).forEach((teamName) => {
                    const name = teamName as string;
                    if (teamWinsCount[name] !== undefined) {
                      teamWinsCount[name]++;
                    }
                  });

                  const maxWins = Math.max(...Object.values(teamWinsCount), 0);
                  const topWinnerTeams = Object.keys(teamWinsCount).filter(
                    (name) => teamWinsCount[name] === maxWins,
                  );
                  const winnerNames = topWinnerTeams.join(" / ");

                  return (
                    <>
                      {/* KPIs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Carreras Terminadas
                            </p>
                            <p className="text-2xl font-bold text-neutral-900">
                              {uniqueRaces.length} <span className="text-sm font-medium text-neutral-500">/ {files?.carreras?.data?.length || 0} ({files?.carreras?.data?.length ? Math.round((uniqueRaces.length / files.carreras.data.length) * 100) : 0}%)</span>
                            </p>
                          </div>
                        </div>

                        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                            <Crown className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Líder Actual
                            </p>
                            <p className="text-xl font-bold text-neutral-900">
                              {leaderNames || "-"}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {maxPoints || 0} puntos
                            </p>
                          </div>
                        </div>

                        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <Medal className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Más Victorias
                            </p>
                            <p className="text-xl font-bold text-neutral-900">
                              {winnerNames || "-"}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {maxWins} victorias
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Virtual Podium */}
                      {top3.length > 0 && (
                        <div className="flex flex-col items-center justify-end pt-12 pb-8 bg-white border border-neutral-200 rounded-2xl shadow-sm">
                          <h3 className="text-lg font-bold mb-8 text-neutral-800 uppercase tracking-widest">
                            Podio Virtual
                          </h3>
                          <div className="flex items-end gap-2 md:gap-8">
                            {/* 2nd Place */}
                            {top3[1] && (
                              <div className="flex flex-col items-center">
                                <div className="mb-2 text-center">
                                  <p className="text-sm font-bold text-neutral-700 truncate w-24 md:w-32">
                                    {top3[1].nombreEquipo}
                                  </p>
                                  <p className="text-xs text-neutral-500">
                                    {top3[1].puntos} pts
                                  </p>
                                </div>
                                <div className="w-24 md:w-32 h-32 bg-slate-300 rounded-t-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                  <span className="text-4xl font-black text-slate-400">
                                    2
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* 1st Place */}
                            {top3[0] && (
                              <div className="flex flex-col items-center">
                                <Crown className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
                                <div className="mb-2 text-center">
                                  <p className="text-base font-black text-neutral-900 truncate w-28 md:w-40">
                                    {top3[0].nombreEquipo}
                                  </p>
                                  <p className="text-sm font-bold text-yellow-600">
                                    {top3[0].puntos} pts
                                  </p>
                                </div>
                                <div className="w-28 md:w-40 h-48 bg-yellow-400 rounded-t-xl flex items-center justify-center shadow-inner relative overflow-hidden border-x-4 border-t-4 border-yellow-300">
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                                  <span className="text-6xl font-black text-yellow-600">
                                    1
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* 3rd Place */}
                            {top3[2] && (
                              <div className="flex flex-col items-center">
                                <div className="mb-2 text-center">
                                  <p className="text-sm font-bold text-neutral-700 truncate w-24 md:w-32">
                                    {top3[2].nombreEquipo}
                                  </p>
                                  <p className="text-xs text-neutral-500">
                                    {top3[2].puntos} pts
                                  </p>
                                </div>
                                <div className="w-24 md:w-32 h-24 bg-orange-400 rounded-t-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                  <span className="text-4xl font-black text-orange-600">
                                    3
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      
        
                      </>
                  );
                })()}
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


                {seasonSubTab === "puntos" && <SeasonPointsTab />}
        {seasonSubTab === "victorias" && <SeasonWinsTab />}
        {seasonSubTab === "ciclistas" && <SeasonCyclistsTab />}
      </div>
    </SeasonViewContext.Provider>
  );
};

export default SeasonView;
