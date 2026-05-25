import { PlayerScore, PlayerScoreDetail } from '../../lib/types';
import { getFlagEmoji } from "../../lib/data-processing";
import { copyTextToClipboard } from "../../lib/clipboard";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { useSeasonReportData } from "./season_report/hooks/useSeasonReportData";
import { useTableScreenshot } from "../../hooks/useTableScreenshot";
import { flushSync } from "react-dom";
import { useCrosshair } from '../../hooks/useCrosshair';
import { useUrlState } from "../../hooks/useUrlState";
import React, { useState, useRef, useMemo } from "react";
import {
  Trophy,
  BarChart3,
  Users,
  User,
  Crown,
  Medal,
  Award,
  Star,
  List,
  Calendar,
  Grid,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Copy, UserMinus, FileText, Download, CheckCircle2, Maximize2, Minimize2, ClipboardList, UploadCloud } from "lucide-react";

import { cn } from "../../lib/utils";
import { getVal } from "../../lib/data-processing";
import { PanenkitaReport } from "./season_report/PanenkitaReport";
import { TopCyclistsReport } from "./season_report/TopCyclistsReport";
import { TopTeamsReport } from "./season_report/TopTeamsReport";
import { PointsPerRoundReport } from "./season_report/PointsPerRoundReport";
import { MinMaxReport } from "./season_report/MinMaxReport";
import { BestPicksReport } from "./season_report/BestPicksReport";
import { UnscoredCyclistsReport } from "./season_report/UnscoredCyclistsReport";
import { UndebutedCyclistsReport } from "./season_report/UndebutedCyclistsReport";
import { Button } from "../ui/button";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";



const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];


const formatNumberSpanish = (val: number | string) => {
  return val.toString().replace(".", ",");
};

export const SeasonReportView = () => {
  const { files } = useDataStore();
  const { 
    leaderboard,
    cyclistRoundMap,
    cyclistMetadata,
    playerOrderMap
  } = useComputedStore();
  
  const ref1 = React.useRef<HTMLDivElement>(null);
  const ref2 = React.useRef<HTMLDivElement>(null);
  const ref3 = React.useRef<HTMLDivElement>(null);
  
  const { handleCopyImage: copyHistoryImage, handleDownloadImage: downloadHistoryImage } = useTableScreenshot(ref2);
  const ref4 = React.useRef<HTMLDivElement>(null);
  const ref5 = React.useRef<HTMLDivElement>(null);
  const ref6 = React.useRef<HTMLDivElement>(null);
  const ref7 = React.useRef<HTMLDivElement>(null);
  const ref8 = React.useRef<HTMLDivElement>(null);
  const ref9 = React.useRef<HTMLDivElement>(null);
  const ref10 = React.useRef<HTMLDivElement>(null);
  const ref11 = React.useRef<HTMLDivElement>(null);
  const ref12 = React.useRef<HTMLDivElement>(null);
  const ref13 = React.useRef<HTMLDivElement>(null);


  const [isHistoryCopying, setIsHistoryCopying] = useState<string | null>(null);
  const [isHistoryTextCopying, setIsHistoryTextCopying] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const handleCopyHistoryText = async () => {
    if (!ref2.current || isHistoryTextCopying) return;
    setIsHistoryTextCopying(true);
    const table = ref2.current.querySelector("table");
    if (!table) {
      setIsHistoryTextCopying(false);
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
    setTimeout(() => setIsHistoryTextCopying(false), 2000);
  };

  const handleCopyHistory = async (subset?: "full" | string) => {
    try {
      setIsHistoryCopying(subset || "p1");
      await copyHistoryImage({
        scale: 3,
        backgroundColor: "#ffffff",
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      });
    } finally {
      setIsHistoryCopying(null);
    }
  };

  const handleDownloadHistory = async (subset?: "full" | string) => {
    try {
      setIsHistoryCopying(subset || "p1");
      await downloadHistoryImage({
        fileName: `historial-ganadores${subset && subset !== "full" ? `-${subset}` : ""}.png`,
        scale: 3,
        backgroundColor: "#ffffff",
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      });
    } finally {
      setIsHistoryCopying(null);
    }
  };


  const selectedMonths: number[] = [];
  const [cyclistsSortColumn, setCyclistsSortColumn] = useUrlState<string>("seasonCyclistsSortColumn", "pos");
  const [cyclistsSortDirection, setCyclistsSortDirection] = useUrlState<"asc" | "desc">("seasonCyclistsSortDirection", "asc");

  const { availableMonths, monthReportData } = useSeasonReportData({ files, leaderboard, selectedMonths });

  // --- Cyclists sorting logic ---
  const sortedStats = useMemo(() => {
    if (!monthReportData?.topCyclists) return [];
    
    const stats = [...monthReportData.topCyclists];
    stats.sort((a, b) => {
      let valA: any, valB: any;
      switch (cyclistsSortColumn) {
        case "pos": valA = a.originalPos; valB = b.originalPos; break;
        case "nombre": valA = a.name; valB = b.name; break;
        case "equipo": valA = a.data.equipo; valB = b.data.equipo; break;
        case "pais": valA = a.data.pais; valB = b.data.pais; break;
        case "victorias": valA = a.data.victorias; valB = b.data.victorias; break;
        case "carreras": valA = a.numCarreras; valB = b.numCarreras; break;
        case "dias": valA = a.data.dias; valB = b.data.dias; break;
        case "ppc": valA = a.ppc; valB = b.ppc; break;
        case "ppd": valA = a.ppd; valB = b.ppd; break;
        case "puntos":
        default: valA = a.data.puntos; valB = b.data.puntos; break;
      }
      if (typeof valA === "string" && typeof valB === "string") {
        return cyclistsSortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (valA < valB) return cyclistsSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return cyclistsSortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return stats;
  }, [monthReportData, cyclistsSortColumn, cyclistsSortDirection]);

  const { maxVictorias, maxCarreras, minCarreras, maxDias, minDias, maxPpc, minPpc, maxPpd, minPpd, maxPuntos, minPuntos } = useMemo(() => {
    let maxV = 0, maxC = 0, minC = Infinity, maxD = 0, minD = Infinity, maxPC = 0, minPC = Infinity, maxPD = 0, minPD = Infinity, maxP = 0, minP = Infinity;
    if (sortedStats.length > 0) {
       let allPuntos = sortedStats.map(s => s.data.puntos);
       maxP = Math.max(...allPuntos);
       minP = Math.min(...allPuntos);
       sortedStats.forEach(s => {
         if (s.data.victorias > maxV) maxV = s.data.victorias;
         if (s.numCarreras > maxC) maxC = s.numCarreras;
         if (s.numCarreras < minC) minC = s.numCarreras;
         if (s.data.dias > maxD) maxD = s.data.dias;
         if (s.data.dias < minD) minD = s.data.dias;
         if (s.ppc > maxPC) maxPC = s.ppc;
         if (s.ppc < minPC) minPC = s.ppc;
         if (s.ppd > maxPD) maxPD = s.ppd;
         if (s.ppd < minPD) minPD = s.ppd;
       });
    }
    return { maxVictorias: maxV, maxCarreras: maxC, minCarreras: minC, maxDias: maxD, minDias: minD, maxPpc: maxPC, minPpc: minPC, maxPpd: maxPD, minPpd: minPD, maxPuntos: maxP, minPuntos: minP };
  }, [sortedStats]);

  const maxTeamWins = useMemo(() => {
    return monthReportData?.topTeams.length > 0 ? Math.max(...monthReportData.topTeams.map(t => t.wins)) : 0;
  }, [monthReportData]);

  const maxTeamStageWins = useMemo(() => {
    return monthReportData?.topTeams.length > 0 ? Math.max(...monthReportData.topTeams.map(t => t.stageWins)) : 0;
  }, [monthReportData]);

  const { maxTeamPuntos, minTeamPuntos } = useMemo(() => {
    let maxP = 0, minP = Infinity;
    if (monthReportData && monthReportData.topTeams.length > 0) {
       let allPuntos = monthReportData.topTeams.map(s => s.pts);
       maxP = Math.max(...allPuntos);
       minP = Math.min(...allPuntos);
    }
    return { maxTeamPuntos: maxP, minTeamPuntos: minP };
  }, [monthReportData]);

  const getTeamPuntosColor = (puntos: number) => {
    if (maxTeamPuntos === minTeamPuntos) return "hsl(120, 70%, 40%)";
    const ratio = (puntos - minTeamPuntos) / (maxTeamPuntos - minTeamPuntos);
    const hue = 45 + ratio * 75; // Red (lower) is ~45 and Green (higher) is ~120
    return `hsl(${hue}, 80%, 40%)`;
  };

  const getColorClass = (val: number, max: number, min: number, isZeroRed: boolean = false) => {
    if (isZeroRed && val === 0) return "text-red-600 font-bold";
    if (val === max && max > 0) return "text-green-600 font-bold";
    if (val === min && min < max && !isZeroRed) return "text-yellow-600 font-bold";
    return "text-neutral-700";
  };
  const getPuntosColor = (puntos: number) => {
    if (maxPuntos === minPuntos) return "hsl(120, 70%, 40%)";
    const ratio = (puntos - minPuntos) / (maxPuntos - minPuntos);
    const hue = 45 + ratio * 75;
    return `hsl(${hue}, 80%, 40%)`;
  };

  const monthsText = "Temporada";

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 w-full">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Reporte Temporada
          </h2>
          <p className="text-sm text-neutral-500">
            Informe global con todos los datos de la temporada
          </p>
        </div>
      </div>

      

      {monthReportData ? (
        <div className="space-y-12">
                    <TopTeamsReport
            monthReportData={monthReportData}
            availableMonths={availableMonths}
            monthsText={monthsText}
          />

                    <TopCyclistsReport
            sortedStats={sortedStats}
            monthReportData={monthReportData}
            monthsText={monthsText}
            cyclistsSortColumn={cyclistsSortColumn}
            setCyclistsSortColumn={setCyclistsSortColumn}
            cyclistsSortDirection={cyclistsSortDirection as "asc" | "desc"}
            setCyclistsSortDirection={setCyclistsSortDirection as any}
            getColorClass={getColorClass}
            getPuntosColor={getPuntosColor}
            getFlagEmoji={getFlagEmoji}
            formatNumberSpanish={formatNumberSpanish as any}
            maxVictorias={maxVictorias}
            maxCarreras={maxCarreras}
            minCarreras={minCarreras}
            maxDias={maxDias}
            minDias={minDias}
            maxPpc={maxPpc}
            minPpc={minPpc}
            maxPpd={maxPpd}
            minPpd={minPpd}
          />

          
          <PointsPerRoundReport monthReportData={monthReportData} monthsText={monthsText} />
          <MinMaxReport monthReportData={monthReportData} monthsText={monthsText} />
          <BestPicksReport monthReportData={monthReportData} monthsText={monthsText} />

          
          <UnscoredCyclistsReport files={files} leaderboard={leaderboard} cyclistRoundMap={cyclistRoundMap} cyclistMetadata={cyclistMetadata} playerOrderMap={playerOrderMap} getVal={getVal} expandNodeForCapture={expandNodeForCapture} />
          <UndebutedCyclistsReport files={files} leaderboard={leaderboard} cyclistRoundMap={cyclistRoundMap} cyclistMetadata={cyclistMetadata} playerOrderMap={playerOrderMap} getVal={getVal} expandNodeForCapture={expandNodeForCapture} />
<PanenkitaReport monthReportData={monthReportData} monthsText={monthsText} />
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200 border-dashed">
          <Calendar className="w-8 h-8 mx-auto text-neutral-300 mb-3" />
          <p className="text-neutral-500">
            Selecciona al menos un mes para ver el reporte interactivo.
          </p>
        </div>
      )}
    </div>
  );
};
