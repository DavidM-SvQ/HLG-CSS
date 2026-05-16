import { getFlagEmoji } from "../../lib/data-processing";
import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { useSeasonReportData } from "./season_report/hooks/useSeasonReportData";
import { domToDataUrl } from "modern-screenshot";
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

interface ScoreDetail {
  carrera: string;
  ciclista: string;
  posicion: string | number;
  puntosObtenidos: number;
  tipoResultado?: string;
  etapa?: string;
  ronda?: string;
}

interface PlayerScore {
  pos?: number;
  jugador: string;
  nombreEquipo: string;
  puntos: number;
  detalles: ScoreDetail[];
}

interface SeasonReportViewProps {
  files: {
    carreras: any;
    puntos: any;
    elecciones: any;
    resultados: any;
    ciclistas?: any;
    equipos?: any;
    startlist?: any;
  };
  leaderboard: any[] | null;
  cyclistRoundMap?: Record<string, string>;
  cyclistMetadata?: Record<string, any>;
  playerOrderMap?: Record<string, string>;
}

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




const ExportToolbar = ({ targetRef, filename }: { targetRef: React.RefObject<HTMLElement>, filename: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isCopyingText, setIsCopyingText] = useState(false);

  const toggleExpand = () => {
    if (!targetRef.current) return;
    const scrollContainers = targetRef.current.querySelectorAll('.overflow-full, .overflow-y-auto, .overflow-x-auto, [style*="max-height"]');
    scrollContainers.forEach((node: any) => {
      if (isExpanded) {
        node.style.maxHeight = node.dataset.originalMaxHeight || '';
        node.style.overflowY = node.dataset.originalOverflowY || '';
        node.style.overflowX = node.dataset.originalOverflowX || '';
        node.dataset.expanded = 'false';
      } else {
        node.dataset.originalMaxHeight = node.style.maxHeight;
        node.dataset.originalOverflowY = node.style.overflowY;
        node.dataset.originalOverflowX = node.style.overflowX;
        node.style.setProperty('max-height', 'none', 'important');
        node.style.setProperty('overflow-y', 'visible', 'important');
        node.style.setProperty('overflow-x', 'visible', 'important');
        node.dataset.expanded = 'true';
      }
    });
    setIsExpanded(!isExpanded);
  };

  const handleCopyText = async () => {
    if (!targetRef.current) return;
    setIsCopyingText(true);
    let text = "";
    const tables = targetRef.current.querySelectorAll("table");
    if (tables.length > 0) {
      tables.forEach(table => {
        const rows = table.querySelectorAll("tr");
        rows.forEach(row => {
          const cols = row.querySelectorAll("th, td");
          const rowData = Array.from(cols).map((c: any) => c.innerText.trim()).join("\t");
          text += rowData + "\n";
        });
        text += "\n";
      });
    } else {
      text = targetRef.current.innerText;
    }
    try {
      await await copyTextToClipboard(text, 'export.txt');
    } catch(e) {}
    setTimeout(() => setIsCopyingText(false), 2000);
  };

  const handleCopyImage = async () => {
    if (!targetRef.current) return;
    setIsCopyingImage(true);
    const container = targetRef.current;
    
    // Si ya está expandido manualmente por el botón "Ampliar", lo dejamos
    // Puesto que expandNodeForCapture expande "a lo bestia" todo
    let restore = () => {};
    if (!isExpanded) {
        restore = expandNodeForCapture(container);
    }

    try {
      
              {
                const processCopy = async () => {
                  const dataUrl = await domToDataUrl(container, { scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),  backgroundColor: "#ffffff" });
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return blob;
                };
                await copyImageToClipboard(processCopy(), "export.png");
                
              }
              
    } catch(e) {
        console.error(e);
    } finally {
      if (!isExpanded) {
         restore();
      }
      setTimeout(() => setIsCopyingImage(false), 2000);
    }
  };

  const handleDownloadImage = async () => {
    if (!targetRef.current) return;
    const container = targetRef.current;
    let restore = () => {};
    if (!isExpanded) {
        restore = expandNodeForCapture(container);
    }

    try {
      const dataUrl = await domToDataUrl(container, { scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),  backgroundColor: "#ffffff" });
            const response = await fetch(dataUrl);
            const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename + ".png";
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      if (!isExpanded) {
         restore();
      }
    }
  };

  return (
    <div className="flex items-center gap-1.5 ml-auto shrink-0 copy-button-ignore">
      <Button variant="ghost" size="icon"
        onClick={handleCopyText}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm border",
          isCopyingText
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
        )}
        title="Copiar texto"
      >
        {isCopyingText ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <ClipboardList className="w-4 h-4" />}
      </Button>
      
      <Button variant="ghost" size="sm"
        onClick={toggleExpand}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
        title="Ampliar"
      >
        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </Button>

      <Button variant="ghost" size="icon"
        onClick={handleCopyImage}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm border",
          isCopyingImage
            ? "bg-green-50 text-green-600 border-green-200"
            : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
        )}
        title="Copiar imagen"
      >
        {isCopyingImage ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </Button>

      <Button variant="ghost" size="sm"
        onClick={handleDownloadImage}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
        title="Descargar imagen"
      >
        <UploadCloud className="w-4 h-4 rotate-180" />
      </Button>
    </div>
  );
};
export const SeasonReportView: React.FC<SeasonReportViewProps> = ({
  cyclistRoundMap = {},
  cyclistMetadata = {},
  playerOrderMap = {},
  files,
  leaderboard,
}) => {
  
  const ref1 = React.useRef<HTMLDivElement>(null);
  const ref2 = React.useRef<HTMLDivElement>(null);
  const ref3 = React.useRef<HTMLDivElement>(null);
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
    if (!ref2.current || isHistoryCopying) return;
    
    flushSync(() => {
      setIsHistoryCopying(subset || "full");
    });
    
    const tableContainer = ref2.current;
    const restore = expandNodeForCapture(tableContainer);

    try {
      
              {
                const processCopy = async () => {
                  const dataUrl = await domToDataUrl(tableContainer, {
          scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
          backgroundColor: '#ffffff',
          style: { overflow: "visible", textRendering: "optimizeLegibility" },
        });
        const response = await fetch(dataUrl);
        return await response.blob();
                };
                await copyImageToClipboard(processCopy(), "export.png");
                setTimeout(() => setIsHistoryCopying(null), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
    }
  };

  const handleDownloadHistory = async (subset?: "full" | string) => {
    if (!ref2.current) return;
    const tableContainer = ref2.current;
    const restore = expandNodeForCapture(tableContainer);
    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        backgroundColor: '#ffffff',
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      const suffix = subset && subset !== "full" ? `-${subset}` : "";
      link.download = `historial-ganadores${suffix}.png`;
      link.click();
    } catch (err) {
    } finally {
      restore();
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
            monthsText={monthsText}
            availableMonths={availableMonths}
            monthNames={monthNames}
            maxTeamStageWins={maxTeamStageWins}
            getTeamPuntosColor={getTeamPuntosColor}
            formatNumberSpanish={formatNumberSpanish as any}
            isHistoryExpanded={isHistoryExpanded}
            setIsHistoryExpanded={setIsHistoryExpanded}
            isHistoryCopying={isHistoryCopying}
            handleCopyHistory={handleCopyHistory}
            isHistoryTextCopying={isHistoryTextCopying}
            handleCopyHistoryText={handleCopyHistoryText}
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
