import { TopDraftCyclistsFilters } from "./TopDraftCyclistsFilters";
import { TopDraftCyclistsTable } from "./TopDraftCyclistsTable";
import { getFlagEmoji } from "../../../lib/data-processing";
import React, { useContext, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { useTopDraft } from "../../../lib/hooks/useTopDraft";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { useUrlState } from "../../../hooks/useUrlState";

import { performTextCopy } from "./hooks/useExportHandlers";
import { Button } from "../../ui/button";

export function TopDraftCyclists() {
  const context = useContext(SeasonViewContext)!;
  const { 
    cn, CyclistDetailView, files, playerTeamMap, playerByCyclist, leaderboard, allCategories, cyclistMetadata, cyclistRoundMap, playerOrderMap, selectedCyclistDetail, setSelectedCyclistDetail, formatNumberSpanish, getVal,
    topCyclistsLimit, setTopCyclistsLimit,
    cyclistsMonthFilter, setCyclistsMonthFilter,
    cyclistsTeamFilter, setCyclistsTeamFilter,
    cyclistsCategoryFilter, setCyclistsCategoryFilter,
    cyclistsRoundFilter, setCyclistsRoundFilter,
    cyclistsNameSearch, setCyclistsNameSearch,
    cyclistsSortColumn, setCyclistsSortColumn,
    cyclistsSortDirection, setCyclistsSortDirection
  } = context;

  const [isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded] = React.useState(false);
  const [isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen] = React.useState(false);
  const [isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen] = React.useState(false);
  const [isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen] = React.useState(false);
  const [isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying] = React.useState<string | boolean>(false);
  const [isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying] = React.useState(false);
  const topCyclistsDraftRef = useRef<HTMLDivElement>(null);
  const topCyclistsDraftRefContainer = useRef<HTMLDivElement>(null);

  const { handleCopyImage: copyTopCyclistsImage, handleDownloadImage: downloadTopCyclistsImage, isCopying: isTopDraftCopying } = useTableScreenshot(topCyclistsDraftRef);

  const prepareTableForCopy = (container: HTMLElement, subset?: string) => {
    const rows = container.querySelectorAll(".top-cyclists-row");
    if (subset && subset !== "full") {
      const idx = parseInt(subset.slice(1)) - 1; // "p1" -> 0
      const start = idx * 50;
      const end = start + 50;
      rows.forEach((row, rIdx) => {
        if (rIdx < start || rIdx >= end) row.classList.add("hidden");
      });
    }
  };

  const resetTableAfterCopy = (container: HTMLElement) => {
    container.querySelectorAll(".top-cyclists-row").forEach((row) => row.classList.remove("hidden"));
  };

  const handleCopyTopCyclistsDraft = async (type?: string) => {
    setIsTopCyclistsDraftCopying(type || "full");
    try {
      await copyTopCyclistsImage({
        fileName: "export.png", scale: 2, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff",
        onBeforeCapture: (el) => prepareTableForCopy(el, type),
        onAfterCapture: (el) => resetTableAfterCopy(el)
      });
    } finally {
      setIsTopCyclistsDraftCopying(false);
    }
  };
  const handleCopyTopCyclistsDraftText = async () => {
    performTextCopy(topCyclistsDraftRef, setIsTopCyclistsDraftTextCopying, "topCyclistsDraft");
  };
  const handleDownloadTopCyclistsDraft = async (type?: string) => {
    await downloadTopCyclistsImage({
      fileName: `top-ciclistas-draft${type && type !== "full" ? `-${type}` : ""}.png`,
      scale: 2, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff",
      onBeforeCapture: (el) => prepareTableForCopy(el, type),
      onAfterCapture: (el) => resetTableAfterCopy(el)
    });
  };

  const { allStats } = useTopDraft(
    cyclistsMonthFilter,
    cyclistsCategoryFilter,
    cyclistsTeamFilter,
    cyclistsRoundFilter,
    topCyclistsLimit
  );

  const { sortedStats, maxVictorias, maxCarreras, minCarreras, maxDias, minDias, maxPpc, minPpc, maxPpd, minPpd, maxPuntos, minPuntos } = React.useMemo(() => {
    const topScorers = topCyclistsLimit === 9999 ? [...allStats] : allStats.slice(0, topCyclistsLimit);
    topScorers.sort((a, b) => {
      let valA: any, valB: any;
      switch (cyclistsSortColumn) {
        case "pos": valA = a.originalIndex; valB = b.originalIndex; break;
        case "nombre": valA = a.ciclista; valB = b.ciclista; break;
        case "equipo": valA = a.nombreEquipo; valB = b.nombreEquipo; break;
        case "pais": valA = a.pais; valB = b.pais; break;
        case "victorias": valA = a.victorias; valB = b.victorias; break;
        case "carreras": valA = a.numCarreras; valB = b.numCarreras; break;
        case "dias": valA = a.dias; valB = b.dias; break;
        case "ppc": valA = a.ppc; valB = b.ppc; break;
        case "ppd": valA = a.ppd; valB = b.ppd; break;
        case "puntos": default: valA = a.puntos; valB = b.puntos; break;
      }
      if (typeof valA === "string" && typeof valB === "string") {
        return cyclistsSortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (valA < valB) return cyclistsSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return cyclistsSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    let maxV = 0, maxC = 0, minC = Infinity, maxD = 0, minD = Infinity;
    let maxPc = 0, minPc = Infinity, maxPd = 0, minPd = Infinity;
    let maxPt = 0, minPt = Infinity;

    if (topScorers.length > 0) {
      maxPt = topScorers[0].puntos;
      minPt = topScorers[topScorers.length - 1].puntos;
      topScorers.forEach((s) => {
        if (s.victorias > maxV) maxV = s.victorias;
        if (s.numCarreras > maxC) maxC = s.numCarreras;
        if (s.numCarreras < minC) minC = s.numCarreras;
        if (s.dias > maxD) maxD = s.dias;
        if (s.dias < minD) minD = s.dias;
        if (s.ppc > maxPc) maxPc = s.ppc;
        if (s.ppc < minPc) minPc = s.ppc;
        if (s.ppd > maxPd) maxPd = s.ppd;
        if (s.ppd < minPd) minPd = s.ppd;
      });
    }

    return {
      sortedStats: topScorers,
      maxVictorias: maxV, maxCarreras: maxC, minCarreras: minC,
      maxDias: maxD, minDias: minD,
      maxPpc: maxPc, minPpc: minPc,
      maxPpd: maxPd, minPpd: minPd,
      maxPuntos: maxPt, minPuntos: minPt
    };
  }, [allStats, topCyclistsLimit, cyclistsSortColumn, cyclistsSortDirection]);

  const getColorClass = React.useCallback((val: number, max: number, min: number, isZeroRed: boolean = false) => {
    if (isZeroRed && val === 0) return "text-red-600 font-bold";
    if (val === max && max > 0) return "text-green-600 font-bold";
    if (val === min && min < max && !isZeroRed) return "text-yellow-600 font-bold";
    return "text-neutral-700";
  }, []);

  const getPuntosColor = React.useCallback((puntos: number) => {
    if (maxPuntos === minPuntos) return "hsl(120, 70%, 40%)";
    const ratio = (puntos - minPuntos) / (maxPuntos - minPuntos);
    const hue = 45 + ratio * 75; // 45 (yellow/orange) to 120 (green)
    return `hsl(${hue}, 80%, 40%)`;
  }, [maxPuntos, minPuntos]);

  return (
    <>
                              <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                ref={topCyclistsDraftRef as any}
                                className={cn(
                                  "bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm relative flex flex-col",
                                  isTopCyclistsDraftExpanded &&
                                    "fixed inset-4 z-50 shadow-2xl p-0",
                                )}
                              >
                                {isTopCyclistsDraftExpanded && (
                                  <Button variant="outline"
                                    onClick={() =>
                                      setIsTopCyclistsDraftExpanded(false)
                                    }
                                    className="fixed top-8 right-8 p-3 bg-neutral-800 text-white rounded-full shadow-2xl z-[60] copy-button-ignore hover:bg-neutral-700 transition-all cursor-pointer"
                                  >
                                    <X className="w-5 h-5" />
                                  </Button>
                                )}

                                                                <TopDraftCyclistsFilters
                                    isTopCyclistsDraftExpanded={isTopCyclistsDraftExpanded} setIsTopCyclistsDraftExpanded={setIsTopCyclistsDraftExpanded}
                                    handleCopyTopCyclistsDraft={handleCopyTopCyclistsDraft} isTopCyclistsDraftCopying={isTopCyclistsDraftCopying}
                                    topCyclistsLimit={topCyclistsLimit} handleCopyTopCyclistsDraftText={handleCopyTopCyclistsDraftText} isTopCyclistsDraftTextCopying={isTopCyclistsDraftTextCopying}
                                    handleDownloadTopCyclistsDraft={handleDownloadTopCyclistsDraft} isCyclistsTeamFilterOpen={isCyclistsTeamFilterOpen} setIsCyclistsTeamFilterOpen={setIsCyclistsTeamFilterOpen}
                                    cyclistsTeamFilter={cyclistsTeamFilter} setCyclistsTeamFilter={setCyclistsTeamFilter} playerTeamMap={playerTeamMap} getVal={getVal}
                                    isCyclistsCategoryFilterOpen={isCyclistsCategoryFilterOpen} setIsCyclistsCategoryFilterOpen={setIsCyclistsCategoryFilterOpen}
                                    cyclistsCategoryFilter={cyclistsCategoryFilter} setCyclistsCategoryFilter={setCyclistsCategoryFilter} allCategories={allCategories}
                                    isCyclistsRoundFilterOpen={isCyclistsRoundFilterOpen} setIsCyclistsRoundFilterOpen={setIsCyclistsRoundFilterOpen}
                                    cyclistsRoundFilter={cyclistsRoundFilter} setCyclistsRoundFilter={setCyclistsRoundFilter} cyclistsRoundMap={cyclistRoundMap}
                                    cyclistsNameSearch={cyclistsNameSearch} setCyclistsNameSearch={setCyclistsNameSearch} setTopCyclistsLimit={setTopCyclistsLimit}
                                    leaderboard={leaderboard} files={files}
                                    cyclistsMonthFilter={cyclistsMonthFilter} setCyclistsMonthFilter={setCyclistsMonthFilter}
                                />
                                <TopDraftCyclistsTable
                                    isTopCyclistsDraftExpanded={isTopCyclistsDraftExpanded} topCyclistsDraftRefContainer={topCyclistsDraftRefContainer}
                                    cyclistsSortColumn={cyclistsSortColumn} setCyclistsSortColumn={setCyclistsSortColumn} cyclistsSortDirection={cyclistsSortDirection} setCyclistsSortDirection={setCyclistsSortDirection}
                                    sortedStats={sortedStats} topCyclistsLimit={topCyclistsLimit} maxVictorias={maxVictorias} maxCarreras={maxCarreras} minCarreras={minCarreras} maxDias={maxDias} minDias={minDias}
                                    maxPpc={maxPpc} minPpc={minPpc} maxPpd={maxPpd} minPpd={minPpd} getFlagEmoji={getFlagEmoji} getColorClass={getColorClass} getPuntosColor={getPuntosColor} formatNumberSpanish={formatNumberSpanish}
                                    isTopCyclistsDraftCopying={isTopCyclistsDraftCopying}
                                />
  
                              </motion.div>
    </>
  );
}


