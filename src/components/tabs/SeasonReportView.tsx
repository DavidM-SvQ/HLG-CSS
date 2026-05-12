import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";
import { domToDataUrl } from "modern-screenshot";
import { flushSync } from "react-dom";
import { useCrosshair } from '../../hooks/useCrosshair';
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
import { PanenkitaReport } from "./season_report/PanenkitaReport";
import { TopCyclistsReport } from "./season_report/TopCyclistsReport";
import { TopTeamsReport } from "./season_report/TopTeamsReport";
import { PointsPerRoundReport } from "./season_report/PointsPerRoundReport";
import { MinMaxReport } from "./season_report/MinMaxReport";
import { BestPicksReport } from "./season_report/BestPicksReport";
import { UnscoredCyclistsReport } from "./season_report/UnscoredCyclistsReport";
import { UndebutedCyclistsReport } from "./season_report/UndebutedCyclistsReport";

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

const getVal = (row: any, key: string) => {
  if (!row) return "";
  const actualKey = Object.keys(row).find(
    (k) => k.toLowerCase() === key.toLowerCase(),
  );
  return actualKey ? row[actualKey] : "";
};

const formatNumberSpanish = (val: number | string) => {
  return val.toString().replace(".", ",");
};

const getFlagEmoji = (countryName: string) => {
  if (!countryName) return "";
  const country = countryName.trim().toLowerCase();
  const flags: Record<string, string> = {
    spain: "🇪🇸",
    españa: "🇪🇸",
    france: "🇫🇷",
    francia: "🇫🇷",
    italy: "🇮🇹",
    italia: "🇮🇹",
    belgium: "🇧🇪",
    bélgica: "🇧🇪",
    netherlands: "🇳🇱",
    "países bajos": "🇳🇱",
    holanda: "🇳🇱",
    slovenia: "🇸🇮",
    eslovenia: "🇸🇮",
    denmark: "🇩🇰",
    dinamarca: "🇩🇰",
    "great britain": "🇬🇧",
    "gran bretaña": "🇬🇧",
    "united kingdom": "🇬🇧",
    "reino unido": "🇬🇧",
    australia: "🇦🇺",
    usa: "🇺🇸",
    "united states": "🇺🇸",
    eeuu: "🇺🇸",
    "estados unidos": "🇺🇸",
    colombia: "🇨🇴",
    ecuador: "🇪🇨",
    norway: "🇳🇴",
    noruega: "🇳🇴",
    germany: "🇩🇪",
    alemania: "🇩🇪",
    switzerland: "🇨🇭",
    suiza: "🇨🇭",
    portugal: "🇵🇹",
    austria: "🇦🇹",
    ireland: "🇮🇪",
    irlanda: "🇮🇪",
    canada: "🇨🇦",
    canadá: "🇨🇦",
    "new zealand": "🇳🇿",
    "nueva zelanda": "🇳🇿",
    eritrea: "🇪🇷",
    kazakhstan: "🇰🇿",
    kazajistán: "🇰🇿",
    poland: "🇵🇱",
    polonia: "🇵🇱",
    "czech republic": "🇨🇿",
    "república checa": "🇨🇿",
    slovakia: "🇸🇰",
    eslovaquia: "🇸🇰",
    hungary: "🇭🇺",
    hungría: "🇭🇺",
    luxembourg: "🇱🇺",
    luxemburgo: "🇱🇺",
    "south africa": "🇿🇦",
    sudáfrica: "🇿🇦",
    latvia: "🇱🇻",
    letonia: "🇱🇻",
    estonia: "🇪🇪",
    lithuania: "🇱🇹",
    lituania: "🇱🇹",
    israel: "🇮🇱",
    japan: "🇯🇵",
    japón: "🇯🇵",
    china: "🇨🇳",
    russia: "🇷🇺",
    rusia: "🇷🇺",
    ukraine: "🇺🇦",
    ucrania: "🇺🇦",
    belarus: "🇧🇾",
    bielorrusia: "🇧🇾",
    mexico: "🇲🇽",
    méxico: "🇲🇽",
    argentina: "🇦🇷",
    brazil: "🇧🇷",
    brasil: "🇧🇷",
    venezuela: "🇻🇪",
    "costa rica": "🇨🇷",
    panama: "🇵🇦",
    panamá: "🇵🇦",
  };
  return flags[country] || countryName;
};


const expandNodeForCapture = (element: HTMLElement) => {
  const targets = Array.from(element.querySelectorAll<HTMLElement>('.overflow-full, .overflow-y-auto, .overflow-x-auto, .overflow-hidden, .table-responsive-wrapper, [style*="max-height"], [class*="max-h-"]'));
  targets.push(element);

  const tables = Array.from(element.querySelectorAll<HTMLElement>('table'));
  const cells = Array.from(element.querySelectorAll<HTMLElement>('td, th'));

  const originalStyles = targets.map((node) => ({
    node,
    maxHeight: node.style.maxHeight,
    height: node.style.height,
    overflowY: node.style.overflowY,
    overflowX: node.style.overflowX,
    overflow: node.style.overflow,
    display: node.style.display,
    width: node.style.width,
    minWidth: node.style.minWidth,
    paddingBottom: node.style.paddingBottom,
  }));
  
  const originalTableStyles = tables.map((node) => ({
    node,
    width: node.style.width,
    minWidth: node.style.minWidth,
  }));
  
  const originalCellStyles = cells.map((node) => ({
    node,
    whiteSpace: node.style.whiteSpace,
  }));

  targets.forEach((node) => {
    node.style.setProperty('max-height', 'none', 'important');
    node.style.setProperty('height', 'auto', 'important');
    node.style.setProperty('overflow-y', 'visible', 'important');
    node.style.setProperty('overflow-x', 'visible', 'important');
    node.style.setProperty('overflow', 'visible', 'important');
  });
  
  tables.forEach((node) => {
    node.style.setProperty('width', 'max-content', 'important');
    node.style.setProperty('min-width', 'max-content', 'important');
  });
  
  cells.forEach((node) => {
    node.style.setProperty('white-space', 'nowrap', 'important');
  });

  element.style.setProperty('display', 'inline-block', 'important');
  element.style.setProperty('width', 'max-content', 'important');
  element.style.setProperty('min-width', 'max-content', 'important');
  element.style.setProperty('padding-bottom', '32px', 'important');

  return () => {
    originalStyles.forEach((styleObj) => {
      const { node, ...styles } = styleObj;
      Object.assign(node.style, styles);
    });
    originalTableStyles.forEach((styleObj) => {
      const { node, ...styles } = styleObj;
      Object.assign(node.style, styles);
    });
    originalCellStyles.forEach((styleObj) => {
      const { node, ...styles } = styleObj;
      Object.assign(node.style, styles);
    });
  };
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
      <button
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
      </button>
      
      <button
        onClick={toggleExpand}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
        title="Ampliar"
      >
        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      <button
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
      </button>

      <button
        onClick={handleDownloadImage}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
        title="Descargar imagen"
      >
        <UploadCloud className="w-4 h-4 rotate-180" />
      </button>
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

  const getVal = (row: any, key: string) => {
    if (!row) return "";
    if (row[key] !== undefined) return row[key];
    const caseInsensitiveKey = Object.keys(row).find(
      (k) => k.toLowerCase() === key.toLowerCase()
    );
    return caseInsensitiveKey ? row[caseInsensitiveKey] : "";
  };



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
  const [cyclistsSortColumn, setCyclistsSortColumn] = useState<string>("pos");
  const [cyclistsSortDirection, setCyclistsSortDirection] = useState<"asc" | "desc">("asc");

  // 1. Map races to their respective months based on "Fecha"
  const raceMonths = useMemo(() => {
    const map: Record<string, number> = {};
    if (!files?.carreras?.data) return map;
    files.carreras.data.forEach((r: any) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const fechaFin = getVal(r, "Fecha");
      if (carreraName && fechaFin) {
        const parts = fechaFin.split(/[-/]/);
        if (parts.length >= 2) {
          map[carreraName] = parseInt(parts[1], 10) - 1;
        }
      }
    });
    return map;
  }, [files]);

  const availableMonths = useMemo(() => {
    return Array.from(new Set(Object.values(raceMonths)) as Set<number>).sort(
      (a, b) => a - b,
    );
  }, [raceMonths]);

  

  const visibleRaces = useMemo(() => {
    return new Set(Object.keys(raceMonths));
  }, [raceMonths]);

  const monthReportData = useMemo(() => {
    

    const DRAFT_RANK_MAP: Record<string, string> = {
      "Xauli": "01",
      "Iker": "02",
      "Celita Líder Trek": "03",
      "King Remco": "04",
      "Javito's Cojostars": "05",
      "diegocruga": "06",
      "JF": "07",
      "Madafaca": "08",
      "Adrián M.": "09",
      "Xemita el cagalera": "10",
      "Pantic": "11",
      "carloscampas": "12",
      "Salva CSS": "13",
      "K": "14",
      "RedBluff IsraelHP": "15",
      "monty team": "16",
      "IbaiWRT": "17",
      "Osintron Fachafranco": "18",
      "Colotto": "19",
      "Pandis": "20",
    };

    const allCyclistPoints: Record<string, number> = {};
    const cyclistTeamMap: Record<string, string> = {};
    const cyclistRondaMap: Record<string, string> = {};

    leaderboard?.forEach((player) => {
      const draftRank = DRAFT_RANK_MAP[player.nombreEquipo] || "-";
      const teamNameWithDraftRank = `${player.nombreEquipo} [#${draftRank}]`;
      player?.detalles?.forEach((d) => {
        if (d.ciclista) {
          cyclistRondaMap[d.ciclista] = d.ronda || "-";
          cyclistTeamMap[d.ciclista] = teamNameWithDraftRank;
        }
      });
    });

    const draftCyclistPoints: Record<string, number> = {};
    const noDraftCyclistPoints: Record<string, number> = {};
    const teamPoints: Record<string, number> = {};
    const roundTeamPoints: Record<string, Record<string, number>> = {}; // [round][team] -> points

    const teamCyclistsPoints: Record<string, Record<string, number>> = {}; // [team][cyclist] -> points
    const teamWins: Record<string, number> = {};
    const roundCyclistsPoints: Record<string, Record<string, number>> = {}; // [round][cyclist] -> points

    const panenkitaTeamPoints: Record<string, number> = {};
    const panenkitaCyclistsPoints: Record<string, number> = {};

    Object.entries(cyclistRondaMap).forEach(([cyclist, roundStr]) => {
      const roundNum = parseInt(roundStr, 10);
      if (roundNum >= 20 && roundNum <= 25) {
        panenkitaCyclistsPoints[cyclist] = 0;
      }
    });

    const raceTeamScores: Record<string, Record<string, number>> = {}; // [race][team] -> points
    const teamMonthlyPoints: Record<string, Record<number, number>> = {}; // [team][month] -> points

    leaderboard?.forEach((player) => {
      const team = player.nombreEquipo;
      const isDraft = team !== "No draft" && team !== "No draft [99]";

      if (!teamCyclistsPoints[team]) teamCyclistsPoints[team] = {};
      if (isDraft && !teamPoints[team]) teamPoints[team] = 0;
      if (isDraft && !teamMonthlyPoints[team]) teamMonthlyPoints[team] = {};
      if (isDraft && !panenkitaTeamPoints[team]) panenkitaTeamPoints[team] = 0;

      player?.detalles?.forEach((d) => {
        if (!visibleRaces.has(d.carrera)) return;

        const isPos01 = d.posicion === "01" || d.posicion === "1";
        const isValidType = [
          "Etapa",
          "Etapa (Crono equipos)",
          "Clasificación final",
          "Clasificación final (Crono equipos)",
          "Clásica",
        ].includes(d.tipoResultado || "");

        if (isPos01 && isValidType && isDraft && team) {
          teamWins[team] = (teamWins[team] || 0) + 1;
        }

        const pts = d.puntosObtenidos;
        if (pts === 0) return;

        allCyclistPoints[d.ciclista] = (allCyclistPoints[d.ciclista] || 0) + pts;
        if (isDraft) {
          cyclistTeamMap[d.ciclista] = team;
        }

        const roundStr = d.ronda || "";
        const roundNum = parseInt(roundStr, 10);

        if (!raceTeamScores[d.carrera]) raceTeamScores[d.carrera] = {};
        if (isDraft) {
          raceTeamScores[d.carrera][team] =
            (raceTeamScores[d.carrera][team] || 0) + pts;
          
          const mIdx = raceMonths[d.carrera];
          if (mIdx !== undefined) {
            teamMonthlyPoints[team][mIdx] = (teamMonthlyPoints[team][mIdx] || 0) + pts;
          }
        }

        if (isDraft) {
          draftCyclistPoints[d.ciclista] =
            (draftCyclistPoints[d.ciclista] || 0) + pts;
          teamPoints[team] += pts;
          teamCyclistsPoints[team][d.ciclista] =
            (teamCyclistsPoints[team][d.ciclista] || 0) + pts;

          if (roundStr) {
            if (!roundTeamPoints[roundStr]) roundTeamPoints[roundStr] = {};
            roundTeamPoints[roundStr][team] =
              (roundTeamPoints[roundStr][team] || 0) + pts;

            if (!roundCyclistsPoints[roundStr])
              roundCyclistsPoints[roundStr] = {};
            roundCyclistsPoints[roundStr][d.ciclista] =
              (roundCyclistsPoints[roundStr][d.ciclista] || 0) + pts;

            if (roundNum >= 20 && roundNum <= 25) {
              panenkitaTeamPoints[team] += pts;
              panenkitaCyclistsPoints[d.ciclista] =
                (panenkitaCyclistsPoints[d.ciclista] || 0) + pts;
            }
          }
        } else {
          noDraftCyclistPoints[d.ciclista] =
            (noDraftCyclistPoints[d.ciclista] || 0) + pts;
        }
      });
    });

    const raceWinners = Object.entries(raceTeamScores)
      .filter(([race]) => {
        const hasFinalClassification = files?.resultados?.data?.some(
          (r: any) =>
            getVal(r, "Carrera") === race &&
            getVal(r, "Tipo")?.match(/Clasificación final/i),
        );
        return hasFinalClassification;
      })
      .map(([race, ptsMap]) => {
      const sorted = Object.entries(ptsMap).sort((a, b) => b[1] - a[1]);
      const winner = sorted.length > 0 ? sorted[0] : null;
      const raceData = files?.carreras?.data?.find((r: any) => getVal(r, "Carrera")?.trim() === race);
      const winnerTeamName = winner ? winner[0] : "-";
      let draftRankStr = "-";
      if (winnerTeamName !== "-") {
        draftRankStr = DRAFT_RANK_MAP[winnerTeamName] || "-";
      }
      return {
        race,
        winnerTeam: winnerTeamName,
        winnerPts: winner ? winner[1] : 0,
        fecha: raceData ? getVal(raceData, "Fecha") : "",
        categoria: raceData ? getVal(raceData, "Categoría") : "",
        draftRank: draftRankStr,
      };
    }).sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      const pa = a.fecha.split(/[-/]/);
      const pb = b.fecha.split(/[-/]/);
      let numA = 0, numB = 0;
      if (pa.length === 3) {
        numA = parseInt((pa[0].length === 4 ? pa[0] : pa[2]) + (pa[1].padStart(2, '0')) + (pa[0].length === 4 ? pa[2].padStart(2, '0') : pa[0].padStart(2, '0')));
      }
      if (pb.length === 3) {
        numB = parseInt((pb[0].length === 4 ? pb[0] : pb[2]) + (pb[1].padStart(2, '0')) + (pb[0].length === 4 ? pb[2].padStart(2, '0') : pb[0].padStart(2, '0')));
      }
      return numB - numA; // Descending
    });

    const maxWins = Math.max(0, ...raceWinners.map((rw) => rw.winnerTeam !== "-" ? 1 : 0));

    const topTeams = Object.entries(teamPoints)
      .sort((a, b) => b[1] - a[1])
      .map(([team, pts], currentPos) => {
        const draftRankNum = DRAFT_RANK_MAP[team] || "-";
        const dif = (draftRankNum !== "-" ? parseInt(draftRankNum, 10) : 999) - (currentPos + 1);
        const wins = raceWinners.filter((rw) => rw.winnerTeam === team).length;
        const stageWins = teamWins[team] || 0;
        
        return {
          team,
          pts,
          originalPos: draftRankNum,
          currentPos: currentPos + 1,
          dif,
          wins,
          stageWins,
          monthlyPoints: teamMonthlyPoints[team] || {}
        };
      });

    const teamMonthlyRankMap: Record<string, number> = {};
    topTeams.forEach(t => {
      teamMonthlyRankMap[t.team] = t.currentPos;
    });

    // Calculate extra stats for Top Cyclists
    const raceCats: Record<string, string> = {};
    const raceDays: Record<string, number> = {};
    if (files?.carreras?.data) {
      files.carreras.data.forEach((r: any) => {
        const name = getVal(r, "Carrera")?.trim();
        const cat = getVal(r, "Categoría")?.trim();
        const diasStr = getVal(r, "Días");
        if (name) {
          if (cat) raceCats[name] = cat;
          raceDays[name] = parseInt(diasStr) || 1;
        }
      });
    }

    const cyclistMetadata: Record<string, { pais: string }> = {};
    if (files?.ciclistas?.data) {
      files.ciclistas.data.forEach((c: any) => {
        const name = getVal(c, "Ciclista")?.trim();
        const pais = getVal(c, "País")?.trim();
        if (name && pais) {
          cyclistMetadata[name] = { pais };
        }
      });
    }

    const monthlyCyclistTeamMap: Record<string, string> = {};

    const cyclistStats: Record<string, any> = {};

    leaderboard?.forEach((player) => {
      const team = player.nombreEquipo;
      const isDraft = team !== "No draft" && team !== "No draft [99]";
      const draftRank = DRAFT_RANK_MAP[team] || "-";
      const teamNameWithDraftRank = isDraft ? `${team} [#${draftRank}]` : team;

      player?.detalles?.forEach((d) => {
        if (!visibleRaces.has(d.carrera)) return;

        monthlyCyclistTeamMap[d.ciclista] = teamNameWithDraftRank;

        if (isDraft) {
          if (!cyclistStats[d.ciclista]) {
            cyclistStats[d.ciclista] = {
              puntos: 0,
              equipo: teamNameWithDraftRank,
              ronda: d.ronda,
              pais: cyclistMetadata[d.ciclista]?.pais || "",
              victorias: 0,
              carreras: new Set<string>(),
              dias: 0,
            };
          }

          const stats = cyclistStats[d.ciclista];
          stats.puntos += d.puntosObtenidos;
          stats.carreras.add(d.carrera);

          const isPos01 = d.posicion === "01" || d.posicion === "1";
          const isValidType = [
            "Etapa",
            "Etapa (Crono equipos)",
            "Clasificación final",
            "Clasificación final (Crono equipos)",
            "Clásica",
          ].includes(d.tipoResultado || "");

          if (isPos01 && isValidType) {
            stats.victorias += 1;
          }
        }
      });
    });

    Object.values(cyclistStats).forEach(stats => {
      stats.carreras.forEach((carrera: string) => {
         stats.dias += raceDays[carrera] || 1;
      });
    });

    const topCyclistsStats = Object.entries(cyclistStats)
      .sort((a, b) => b[1].puntos - a[1].puntos)
      .map(([name, data], idx) => {
        const numCarreras = data.carreras.size;
        const ppc = numCarreras > 0 ? parseFloat((data.puntos / numCarreras).toFixed(1)) : 0;
        const ppd = data.dias > 0 ? parseFloat((data.puntos / data.dias).toFixed(1)) : 0;
        return {
          originalPos: idx + 1,
          name,
          data,
          numCarreras,
          ppc,
          ppd,
        };
      })
      .slice(0, 50);

    const topCyclists = topCyclistsStats;

    const minMaxTeam = Object.entries(teamCyclistsPoints)
      .filter(([team]) => team !== "No draft" && team !== "No draft [99]")
      .map(([team, cMap]) => {
        const sorted = Object.entries(cMap).sort((a, b) => b[1] - a[1]);
        const draftRank = DRAFT_RANK_MAP[team] || "-";
        const teamNameWithDraftRank = `${team} [#${draftRank}]`;
        const totalTeamPts = teamPoints[team] || 0;
        
        return {
          team: teamNameWithDraftRank,
          draftRank: draftRank !== "-" ? parseInt(draftRank, 10) : 999,
          pts: totalTeamPts,
          best: sorted.length > 0 ? [`${sorted[0][0]} <${cyclistRondaMap[sorted[0][0]] || "-"}>`, sorted[0][1]] : null,
          worst: sorted.length > 0 ? [`${sorted[sorted.length - 1][0]} <${cyclistRondaMap[sorted[sorted.length - 1][0]] || "-"}>`, sorted[sorted.length - 1][1]] : null,
        };
      })
      .sort((a, b) => a.draftRank - b.draftRank);

    const minMaxRound = Object.entries(roundCyclistsPoints)
      .map(([round, cMap]) => {
        const sorted = Object.entries(cMap).sort((a, b) => b[1] - a[1]);
        return {
          round,
          best: sorted.length > 0 ? [`${sorted[0][0]} (${monthlyCyclistTeamMap[sorted[0][0]] || ""})`, sorted[0][1]] : null,
          worst: sorted.length > 0 ? [`${sorted[sorted.length - 1][0]} (${monthlyCyclistTeamMap[sorted[sorted.length - 1][0]] || ""})`, sorted[sorted.length - 1][1]] : null,
        };
      })
      .sort((a, b) => parseInt(a.round) - parseInt(b.round));

    
    
    const bestPicksCount: Record<string, number> = {};
    if (leaderboard) {
      leaderboard?.forEach(player => {
        const team = player.nombreEquipo;
        const isDraft = team !== "No draft" && team !== "No draft [99]";
        if (isDraft) {
          const draftRank = DRAFT_RANK_MAP[team] || "-";
          const teamNameWithDraftRank = `${team} [#${draftRank}]`;
          bestPicksCount[teamNameWithDraftRank] = 0;
        }
      });
    }

    minMaxRound.forEach(r => {
      if (r.best) {
         // extract the team
         const bestCyclist = (r.best[0] as string).split(' (')[0];
         const bestTeam = monthlyCyclistTeamMap[bestCyclist];
         if (bestTeam && bestTeam.trim() !== '') {
           bestPicksCount[bestTeam] = (bestPicksCount[bestTeam] || 0) + 1;
         }
      }
    });
    const bestPicks = Object.entries(bestPicksCount)
      .map(([team, count]) => ({ team, count }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.team.localeCompare(b.team);
      });

    const topNoDraftCyclists = Object.entries(noDraftCyclistPoints)
      .filter(([_, pts]) => pts > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([cyclist, pts], idx) => {
        let eq = "-";
        let pais = "-";
        if (files?.ciclistas?.data) {
           const match = files.ciclistas.data?.find((c: any) => getVal(c, "Ciclista")?.trim() === cyclist);
           if (match) {
             const teamFromCiclistas = getVal(match, "Equipo")?.trim();
             if (teamFromCiclistas && files?.equipos?.data) {
               const teamMatch = files.equipos.data?.find((e: any) => 
                 getVal(e, "EQUIPO COMPLETO")?.trim() === teamFromCiclistas
               );
               if (teamMatch) {
                 eq = getVal(teamMatch, "EQUIPO BREVE") || "-";
               }
             }
             pais = getVal(match, "País") || "-";
           }
        }
        return {
           originalPos: idx + 1,
           cyclist,
           pts,
           eq,
           pais
        };
      });

    const panenkitaTopTeams = Object.keys(DRAFT_RANK_MAP)
      .map((team) => {
        const pts = panenkitaTeamPoints[team] || 0;
        const draftRank = DRAFT_RANK_MAP[team] || "-";
        return { 
          team: `${team} [#${draftRank}]`, 
          teamClean: team,
          pts,
          draftRankNum: draftRank !== "-" ? parseInt(draftRank, 10) : 999 
        };
      })
      .sort((a, b) => b.pts - a.pts || a.draftRankNum - b.draftRankNum);

    const panenkitaTopCyclists = Object.entries(panenkitaCyclistsPoints)
      .sort((a, b) => {
        const ptsDiff = b[1] - a[1];
        if (ptsDiff !== 0) return ptsDiff;
        const roundA = parseInt(cyclistRondaMap[a[0]] || "99", 10);
        const roundB = parseInt(cyclistRondaMap[b[0]] || "99", 10);
        const roundDiff = roundA - roundB;
        if (roundDiff !== 0) return roundDiff;
        return a[0].localeCompare(b[0]);
      })
      .slice(0, 50)
      .map(([cyclist, pts]) => {
        const round = cyclistRondaMap[cyclist] || "-";
        const teamInfo = cyclistTeamMap[cyclist] || "";
        return { cyclist, pts, round, teamInfo };
      });

    const winningTeamObj = panenkitaTopTeams.length > 0 ? panenkitaTopTeams[0] : null;
    const bestPanenkitaTeam = winningTeamObj ? winningTeamObj.team : null;
    let bestPanenkitaTeamPicks: { cyclist: string; pts: number }[] = [];

    if (winningTeamObj) {
      const player = leaderboard?.find(
        (x) => x.nombreEquipo === winningTeamObj.teamClean,
      );
      if (player) {
        const teamCyclistsRounds = new Map<string, string>();
        const teamPointsMap = new Map<string, number>();

        player?.detalles?.forEach((d) => {
          const rNum = parseInt(d.ronda || "0", 10);
          if (rNum >= 20 && rNum <= 25) {
            teamCyclistsRounds.set(d.ciclista, d.ronda || "");
            if (visibleRaces.has(d.carrera)) {
              teamPointsMap.set(d.ciclista, (teamPointsMap.get(d.ciclista) || 0) + d.puntosObtenidos);
            }
          }
        });

        bestPanenkitaTeamPicks = Array.from(teamCyclistsRounds.entries())
          .map(([name, round]) => ({
            cyclist: `${name} <${round}>`,
            pts: teamPointsMap.get(name) || 0,
            roundNum: parseInt(round)
          }))
          .sort((a, b) => a.roundNum - b.roundNum);
      }
    }

    // Grid for points by round and team
    const allRounds = Array.from(new Set(Object.keys(roundTeamPoints))).sort(
      (a, b) => parseInt(a) - parseInt(b),
    );
    
    const roundStats: Record<string, {max: number, min: number}> = {};
    allRounds.forEach(r => {
      let max = -Infinity, min = Infinity;
      Object.values(roundTeamPoints[r] || {}).forEach(pts => {
         if (pts > 0 && pts > max) max = pts;
         if (pts > 0 && pts < min) min = pts;
      });
      roundStats[r] = { max, min };
    });
    const allTeams = topTeams.map((t) => {
      const draftRank = DRAFT_RANK_MAP[t.team] || "-";
      return `${t.team} [#${draftRank}]`;
    }); 

    return {
      topTeams,
      raceWinners,
      topCyclists,
      roundTeamPoints: Object.fromEntries(
        Object.entries(roundTeamPoints).map(([round, ptsMap]) => [
          round,
          Object.fromEntries(
            Object.entries(ptsMap).map(([team, pts]) => {
              const draftRank = DRAFT_RANK_MAP[team] || "-";
              return [`${team} [#${draftRank}]`, pts];
            })
          ),
        ])
      ),
      minMaxTeam,
      minMaxRound, bestPicks,
      topNoDraftCyclists,
      panenkitaTopTeams,
      panenkitaTopCyclists,
      bestPanenkitaTeam,
      bestPanenkitaTeamPicks,
      roundStats,
      allRounds,
      allTeams,
    };
  }, [selectedMonths, leaderboard, visibleRaces, raceMonths]);

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
