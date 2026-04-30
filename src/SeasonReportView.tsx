import { domToDataUrl } from "modern-screenshot";
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

import { cn } from "./lib/utils";

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
  const targets = Array.from(element.querySelectorAll<HTMLElement>('.overflow-auto, .overflow-y-auto, .overflow-x-auto, .overflow-hidden, .table-responsive-wrapper, [style*="max-height"], [class*="max-h-"]'));
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
    const scrollContainers = targetRef.current.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-x-auto, [style*="max-height"]');
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
      await navigator.clipboard.writeText(text);
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
      if (typeof ClipboardItem !== "undefined") {
        const clipboardItem = new ClipboardItem({
          "image/png": (async () => {
            const dataUrl = await domToDataUrl(container, { scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),  backgroundColor: "#ffffff" });
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            return blob;
          })() as Promise<Blob>,
        });
        await navigator.clipboard.write([clipboardItem]);
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

  const [unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter] = useState<string>("all");
  const [unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter] = useState<string[]>([]);
  const [isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen] = useState(false);
  const [unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn] = useState<string>("pos");
  const [unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection] = useState<"asc" | "desc">("asc");
  
  const [undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn] = useState<string>("pos");
  const [undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection] = useState<"asc" | "desc">("asc");
  const [undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter] = useState<string>("all");
  const [undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter] = useState<string[]>([]);
  const [isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen] = useState(false);

  const [isUnscoredCopying, setIsUnscoredCopying] = useState<string | null>(null);
  const [isUnscoredTextCopying, setIsUnscoredTextCopying] = useState(false);
  const [isUndebutedCopying, setIsUndebutedCopying] = useState<string | null>(null);
  const [isUndebutedTextCopying, setIsUndebutedTextCopying] = useState(false);

  const [isUnscoredExpanded, setIsUnscoredExpanded] = useState(false);
  const [isUndebutedExpanded, setIsUndebutedExpanded] = useState(false);

  const unscoredTableRef = useRef<HTMLDivElement>(null);
  const undebutedTableRef = useRef<HTMLDivElement>(null);


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
            const dataUrl = await domToDataUrl(tableContainer, { scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),  backgroundColor: "#ffffff" });
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

  const handleDownloadUnscored = async (
    subset?: "full" | "p1" | "p2" | "p3" | "p4",
  ) => {
    if (!unscoredTableRef.current) return;
    const tableContainer = unscoredTableRef.current;
    const restore = expandNodeForCapture(tableContainer);
    try {
      const dataUrl = await domToDataUrl(tableContainer, { scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),  backgroundColor: "#ffffff" });
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

  const handleCopyUndebuted = async (subset?: "full" | "p1" | "p2") => {
    if (!undebutedTableRef.current || isUndebutedCopying) return;
    setIsUndebutedCopying(subset || "full");
    await new Promise((resolve) => setTimeout(resolve, 200));
    const tableContainer = undebutedTableRef.current;
    if (!tableContainer) return;
    const restore = expandNodeForCapture(tableContainer);

    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        
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

  const handleDownloadUndebuted = async (subset?: "full" | "p1" | "p2") => {
    if (!undebutedTableRef.current) return;
    const tableContainer = undebutedTableRef.current;
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
      link.download = `ciclistas-sin-debutar${suffix}.png`;
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
      return numA - numB;
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
          {/* SECTION 1: Top Teams and Race Winners */}
          <div className="space-y-8">
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative" ref={ref1}>
              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
                    <Grid className="w-5 h-5 text-blue-600" />
                    Top Equipos por Puntuación {monthsText ? ` [${monthsText}]` : ""}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5 ">
                    Ranking de los equipos fantasy por puntuación en este periodo.
                  </p>
                </div>
                <ExportToolbar targetRef={ref1} filename="top-equipos" />
              </div>
              <div className="overflow-x-auto flex justify-center bg-neutral-50/20 pb-8 relative mt-2 text-sm">
                <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="w-auto min-w-[600px] text-sm text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-100 rounded-lg">
                  <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50">
                    <tr>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold  border-b border-neutral-100">Pos</th>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold  border-b border-neutral-100">Equipo</th>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold  border-b border-neutral-100 text-center">Victorias eq.</th>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold  border-b border-neutral-100 text-center">Victorias parc.</th>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold  border-b border-neutral-100 text-right">Puntos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(() => {
                      const maxWins = monthReportData.topTeams.length > 0 ? Math.max(...monthReportData.topTeams.map(t => t.wins)) : 0;
                      const minWins = monthReportData.topTeams.length > 0 ? Math.min(...monthReportData.topTeams.map(t => t.wins)) : 0;
                      return monthReportData.topTeams.map((team) => {
                        const posColor = team.currentPos === 1 ? "text-yellow-600 bg-yellow-50/50" : team.currentPos === 2 ? "text-neutral-500 bg-neutral-50/50" : team.currentPos === 3 ? "text-amber-700 bg-amber-50/50" : "text-neutral-400";
                        const winsColor = team.wins === 0 ? "text-red-600 font-bold" : (team.wins === maxWins && maxWins > 0) ? "text-green-600 font-bold" : (team.wins === minWins && minWins < maxWins) ? "text-yellow-600 font-bold" : "text-neutral-700";
                        const stageWinsColor = team.stageWins === 0 ? "text-red-600 font-bold" : (team.stageWins === maxTeamStageWins && maxTeamStageWins > 0) ? "text-green-600 font-bold" : "text-neutral-700";
                        const difColor = team.dif > 0 ? "text-green-600 bg-green-50/50" : team.dif < 0 ? "text-red-600 bg-red-50/50" : "text-neutral-400 bg-neutral-50/50";
                        return (
                          <tr key={team.team} className="hover:bg-blue-50/30 transition-colors text-xs">
                            <td className={cn("px-4 py-1 font-bold text-center ", posColor)}>
                              <div className="flex items-center justify-center gap-1 text-[11px]">{team.currentPos === 1 ? (<Crown className="w-3 h-3 text-yellow-600" />) : team.currentPos === 2 ? (<Medal className="w-3 h-3 text-neutral-400" />) : team.currentPos === 3 ? (<Medal className="w-3 h-3 text-amber-700" />) : null}{team.currentPos}º</div>
                            </td>
                            <td className="px-4 py-1 font-bold text-neutral-900 border-l border-neutral-100/50">{team.team} [#{team.originalPos}]</td>
                            <td className="px-4 py-1 text-center font-mono border-l border-neutral-100/50">
                              <span className={winsColor}>{formatNumberSpanish(team.wins)}</span>
                            </td>
                            <td className="px-4 py-1 text-center font-mono border-l border-neutral-100/50">
                              <span className={stageWinsColor}>{formatNumberSpanish(team.stageWins)}</span>
                            </td>
                            <td className="px-4 py-1 text-right font-mono font-bold bg-blue-50/30 border-l border-neutral-100/50 text-[13px]" style={{ color: getTeamPuntosColor(team.pts) }}>{formatNumberSpanish(team.pts)}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table></div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative mt-8 w-full min-w-0" ref={ref13}>
              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
                    <Grid className="w-5 h-5 text-indigo-600" />
                    Puntos por meses {monthsText ? ` [${monthsText}]` : ""}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5 ">
                    Puntos acumulados por cada equipo, desglosados mes a mes.
                  </p>
                </div>
                <ExportToolbar targetRef={ref13} filename="puntos-meses" />
              </div>
              <div className="overflow-x-auto bg-neutral-50/20 pb-8 relative mt-2 text-sm w-full min-w-0">
                <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="w-full min-w-[800px] text-sm text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-100 rounded-lg">
                  <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50">
                    <tr>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-2 py-1.5 font-semibold  border-b border-neutral-100">Pos</th>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-2 py-1.5 font-semibold  border-b border-neutral-100">Equipo</th>
                      <th className="sticky top-0 z-30 bg-neutral-100 px-2 py-1.5 font-bold  border-b border-neutral-200 text-center w-24">Puntos totales</th>
                      {availableMonths.map((mIdx: number) => (
                        <th key={mIdx} className="sticky top-0 z-30 bg-neutral-50 px-2 py-1.5 font-semibold  border-b border-neutral-100 text-center w-20">
                          {monthNames[mIdx]}
                        </th>
                      ))}
                      <th className="sticky top-0 z-30 bg-neutral-100 px-2 py-1.5 font-bold  border-b border-neutral-200 text-center w-24">Meses ganados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(() => {
                      const maxs: Record<number, number> = {};
                      const mins: Record<number, number> = {};
                      
                      // First calculate maxs and mins considering only positive points
                      availableMonths.forEach((mIdx: number) => {
                          const allPoints = monthReportData.topTeams.map((t: any) => t.monthlyPoints[mIdx] || 0);
                          const allPositive = allPoints.filter((p: number) => p > 0);
                          maxs[mIdx] = allPositive.length > 0 ? Math.max(...allPositive) : 0;
                          mins[mIdx] = allPositive.length > 0 ? Math.min(...allPositive) : 0;
                      });

                      const teamsGanados = monthReportData.topTeams.map((team: any) => {
                          let ganados = 0;
                          availableMonths.forEach((mIdx: number) => {
                              const pts = team.monthlyPoints[mIdx] || 0;
                              if (pts > 0 && pts === maxs[mIdx]) ganados++;
                          });
                          return ganados;
                      });
                      const maxMesesGanados = teamsGanados.length > 0 ? Math.max(...teamsGanados) : 0;

                      return monthReportData.topTeams.map((team, idx) => {
                        const posColor = team.currentPos === 1 ? "text-yellow-600 bg-yellow-50/50" : team.currentPos === 2 ? "text-neutral-500 bg-neutral-50/50" : team.currentPos === 3 ? "text-amber-700 bg-amber-50/50" : "text-neutral-400";
                        const mesesGanados = teamsGanados[idx];
                        
                        return (
                          <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-2 py-1  font-medium text-center relative max-w-[50px]">
                              <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold", posColor)}>
                                {team.currentPos}
                              </span>
                            </td>
                            <td className="px-2 py-1 font-semibold text-neutral-800 ">
                              {team.team} <span className="text-xs text-neutral-400 ml-1 font-normal">[#{team.originalPos}]</span>
                            </td>
                            <td className="px-2 py-1 text-center font-bold text-neutral-900 bg-neutral-100  border-l border-r border-neutral-200">
                              {team.pts.toLocaleString()}
                            </td>
                            {availableMonths.map((mIdx: number) => {
                              const pts = team.monthlyPoints[mIdx] || 0;
                              const isMax = maxs[mIdx] > 0 && pts === maxs[mIdx];
                              const isMin = pts > 0 && pts === mins[mIdx];
                              const bgColorStyles = isMax ? "bg-green-100 text-green-800" : isMin ? "bg-red-100 text-red-800" : "text-neutral-600 font-normal";
                              return (
                                <td key={mIdx} className={cn("px-2 py-1 text-center ", bgColorStyles)}>
                                  {pts > 0 ? pts.toLocaleString() : "-"}
                                </td>
                              );
                            })}
                            <td className={cn("px-2 py-1 text-center font-bold  border-l border-neutral-200", maxMesesGanados > 0 && mesesGanados === maxMesesGanados ? "bg-yellow-100 text-yellow-800" : "bg-neutral-100 text-neutral-900")}>
                              {mesesGanados}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table></div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative mt-8" ref={ref2}>
              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
                    <History className="w-5 h-5 text-purple-600" />
                    Historial de Ganadores por Carrera {monthsText ? ` [${monthsText}]` : ""}
                  </h3>
                  <p className="text-sm text-neutral-500 ">
                    Relación cronológica de las victorias obtenidas por los equipos en cada carrera.
                  </p>
                </div>
                <ExportToolbar targetRef={ref2} filename="historial-ganadores" />
              </div>
              <div className="overflow-x-auto bg-neutral-50/20 pb-8 rounded-b-2xl">
                <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="w-full min-w-[600px] text-sm text-left">
                  <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10 border-b border-neutral-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold ">Fecha</th>
                      <th className="px-6 py-3 font-semibold ">Carrera</th>
                      <th className="px-6 py-3 font-semibold ">Categoría</th>
                      <th className="px-6 py-3 font-semibold  text-center">Ganador</th>
                      <th className="px-6 py-3 font-semibold  text-right">Puntos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {monthReportData.raceWinners.map((r, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/30 transition-colors group">
                        <td className="px-6 py-2.5  font-mono text-xs text-neutral-500">{r.fecha}</td>
                        <td className="px-6 py-2.5 font-medium text-neutral-900 max-w-[200px] truncate" title={r.race}>{r.race}</td>
                        <td className="px-6 py-2.5">
                          {r.categoria ? <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-neutral-100 text-neutral-600 tracking-wider uppercase">{r.categoria}</span> : null}
                        </td>
                        <td className="px-6 py-2.5">
                          <div className="flex justify-center">
                            {r.winnerTeam !== "-" ? (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full font-bold text-xs ring-1 ring-yellow-600/20 shadow-sm">
                                <Crown className="w-3 h-3 text-yellow-600" />
                                {r.winnerTeam} [#{r.draftRank}]
                              </div>
                            ) : (
                              <span className="text-neutral-400 font-mono">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-2.5 text-right font-mono font-bold text-blue-600">{r.winnerPts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Top Cyclists */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative mt-8" ref={ref3}>
            <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
                  <User className="w-5 h-5 text-orange-600" />
                  Top Ciclistas por Puntuación {monthsText ? ` [${monthsText}]` : ""}
                </h3>
                <p className="text-sm text-neutral-500 ">
                  Top 50 ciclistas con más puntos en las carreras de este periodo.
                </p>
              </div>
              <ExportToolbar targetRef={ref3} filename="top-ciclistas" />
            </div>
            <div className="overflow-x-auto overflow-y-hidden bg-neutral-50/20 pb-8 rounded-b-2xl">
              <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="w-auto min-w-[700px] mx-auto text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-100 rounded-lg">
                <thead className="text-[10px] text-neutral-500 uppercase z-20">
                  <tr className="divide-x divide-neutral-100">
                    {['pos', 'nombre', 'equipo', 'pais', 'victorias', 'carreras', 'dias', 'ppc', 'ppd', 'puntos'].map((col) => {
                      const labelMap: Record<string, string> = { pos: 'Pos', nombre: 'Ciclista', equipo: 'Equipo', pais: 'País', victorias: 'Victorias', carreras: 'Carreras', dias: 'Días', ppc: 'P/C', ppd: 'P/D', puntos: 'Puntos' };
                      return (
                        <th
                          key={col}
                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                          onClick={() => {
                            if (cyclistsSortColumn === col) {
                              setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                            } else {
                              setCyclistsSortColumn(col);
                              setCyclistsSortDirection(col === 'puntos' ? 'desc' : 'asc');
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {labelMap[col]}
                            {cyclistsSortColumn === col && (
                              cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {sortedStats.map((s) => {
                    const { name, data, numCarreras, ppc, ppd, originalPos } = s;
                    return (
                      <tr key={name} className="hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] divide-x divide-neutral-100">
                        <td className="px-3 py-1 text-center">
                          <span className={cn("w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[9px] font-bold", originalPos === 1 ? "bg-yellow-100 text-yellow-700" : originalPos === 2 ? "bg-neutral-200 text-neutral-600" : originalPos === 3 ? "bg-orange-100 text-orange-700" : "bg-neutral-100 text-neutral-500")}>
                            {originalPos}
                          </span>
                        </td>
                        <td className="px-4 py-1 font-bold text-neutral-900 ">
                          {name} <span className="text-neutral-400 font-normal text-[9px]">&lt;{data.ronda || "-"}&gt;</span>
                        </td>
                        <td className="px-4 py-1 text-neutral-600 ">
                          <span className="font-medium">{data.equipo}</span>
                        </td>
                        <td className="px-3 py-1 text-base text-center" title={data.pais}>{getFlagEmoji(data.pais)}</td>
                        <td className={cn("px-3 py-1 text-center font-mono", getColorClass(data.victorias, maxVictorias, 0, true))}>
                          {formatNumberSpanish(data.victorias)}
                        </td>
                        <td className={cn("px-3 py-1 text-center font-mono", getColorClass(numCarreras, maxCarreras, minCarreras))}>
                          {formatNumberSpanish(numCarreras)}
                        </td>
                        <td className={cn("px-3 py-1 text-center font-mono", getColorClass(data.dias, maxDias, minDias))}>
                          {formatNumberSpanish(data.dias)}
                        </td>
                        <td className={cn("px-3 py-1 text-center font-mono", getColorClass(ppc, maxPpc, minPpc))}>
                          {formatNumberSpanish(ppc.toFixed(1))}
                        </td>
                        <td className={cn("px-3 py-1 text-center font-mono", getColorClass(ppd, maxPpd, minPpd))}>
                          {formatNumberSpanish(ppd.toFixed(1))}
                        </td>
                        <td className="px-4 py-1 text-right font-black font-mono text-sm" style={{ color: getPuntosColor(data.puntos) }}>
                          {formatNumberSpanish(data.puntos)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table></div>
            </div>
          </div>

          {/* SECTION: Top No Draft Cyclists */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative mt-8" ref={ref4}>
            <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
                  <User className="w-5 h-5 text-red-600" />
                  Top Ciclistas No Elegidos (No draft) {monthsText ? ` [${monthsText}]` : ""}
                </h3>
                <p className="text-sm text-neutral-500 ">
                  Corredores que han sumado puntos pero no fueron elegidos por ningún equipo.
                </p>
              </div>
              <ExportToolbar targetRef={ref4} filename="top-ciclistas-no-draft" />
            </div>
            <div className="overflow-x-auto overflow-y-hidden bg-neutral-50/20 pb-8 rounded-b-2xl">
              <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="w-auto min-w-[700px] mx-auto text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-100 rounded-lg">
                <thead className="text-[10px] text-neutral-500 uppercase z-20">
                  <tr className="divide-x divide-neutral-100">
                    <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200 text-center">Pos</th>
                    <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200">Ciclista</th>
                    <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200">EQ</th>
                    <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200 text-center">País</th>
                    <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200 text-right">Puntos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {monthReportData.topNoDraftCyclists.map((s) => (
                    <tr key={s.cyclist} className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100">
                      <td className="px-3 py-1 text-center font-bold text-neutral-400">
                        {s.originalPos}º
                      </td>
                      <td className="px-4 py-1 font-bold text-neutral-900 ">
                        {s.cyclist}
                      </td>
                      <td className="px-4 py-1 text-neutral-600 ">
                        {s.eq}
                      </td>
                      <td className="px-3 py-1 text-base text-center" title={s.pais}>
                        {getFlagEmoji(s.pais)}
                      </td>
                      <td className="px-4 py-1 text-right font-black font-mono text-sm text-red-600">
                        {formatNumberSpanish(s.pts)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          </div>

          
          {/* SECTION 2: Points per Round and Team Matrix */}
          <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto" ref={ref5}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start mb-4 gap-4">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Grid className="w-5 h-5 text-indigo-600" /> Puntos por Ronda y Equipo {monthsText ? ` [${monthsText}]` : ""}
              </h3>
              <ExportToolbar targetRef={ref5} filename="puntos-ronda-equipo" />
            </div>
            <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="w-full min-w-[600px] text-xs text-left whitespace-nowrap border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="pb-2 sticky left-0 bg-neutral-50 z-20 border-r border-b border-neutral-200 pr-2 shadow-sm font-bold">
                    Equipo
                  </th>
                  {monthReportData.allRounds.map((r) => (
                    <th
                      key={r}
                      className="pb-2 px-2 text-center font-bold text-neutral-500 w-10 border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10"
                    >
                      R{r}
                    </th>
                  ))}
                  <th className="pb-2 px-4 text-right font-bold text-blue-600 bg-blue-50/50 sticky top-0 z-10 border-b border-neutral-200">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {monthReportData.allTeams.map((team) => {
                  let teamTotal = 0;
                  return (
                    <tr
                      key={team}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td
                        className="px-4 py-2 font-medium text-neutral-900 border-r border-neutral-200 bg-white sticky left-0 z-10"
                        title={team}
                      >
                        {team}
                      </td>
                      {monthReportData.allRounds.map((round) => {
                        const pts = monthReportData.roundTeamPoints[round]?.[team] || 0;
                        teamTotal += pts;

                        const isMax = pts > 0 && pts === monthReportData.roundStats[round]?.max;
                        const isMin = pts > 0 && pts === monthReportData.roundStats[round]?.min;
                        const isZero = pts === 0;

                        let cellStyle = {};
                        if (isZero) {
                          cellStyle = { backgroundColor: '#fee2e2' }; // red-100
                        } else if (isMax) {
                          cellStyle = {
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            fontWeight: 'bold',
                          }; // green-100, green-800
                        } else if (isMin) {
                          cellStyle = {
                            backgroundColor: '#fef9c3',
                            color: '#854d0e',
                          }; // yellow-100, yellow-800
                        }

                        return (
                          <td
                            key={round}
                            className={cn(
                              "px-2 py-2 text-center border-r border-neutral-100",
                              isZero ? "text-red-400" : "text-neutral-900"
                            )}
                            style={cellStyle}
                          >
                            <span className="cursor-default">
                              {pts > 0 ? pts : "0"}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-4 py-2 text-right font-bold text-blue-700 bg-blue-50/30">
                        {teamTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          </div>

          {/* SECTION 4: Min/Max by Team and Round */}
          <div className="space-y-8">
            <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto" ref={ref6}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start mb-4 gap-4">
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Medal className="w-5 h-5 text-purple-600" /> Mejores y Peores
                  Ciclistas por Equipo {monthsText ? ` [${monthsText}]` : ""}
                </h3>
                <ExportToolbar targetRef={ref6} filename="mejores-peores-equipo" />
              </div>
              <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="w-full min-w-[600px] text-xs text-left whitespace-nowrap">
                <thead className="sticky top-0 bg-neutral-50">
                  <tr className="border-b">
                    <th className="pb-2">Equipo</th>
                    <th className="pb-2 text-green-700">Mejor Ciclista</th>
                    <th className="pb-2 text-red-600">
                      Peor Ciclista (
                      <span className="text-[10px]">&gt;0 pts</span>)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthReportData.minMaxTeam.map((t, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td
                        className="py-2.5 font-bold truncate max-w-[120px]"
                        title={t.team}
                      >
                        {t.team}
                      </td>
                      <td className="py-2.5 text-green-700 truncate max-w-[150px]">
                        {t.best ? (
                          <span title={t.best[0]} className="flex items-center gap-1">
                            <span className="truncate">{t.best[0]}</span>
                            <span className="shrink-0 bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold">
                              {t.best[1]}
                            </span>
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2.5 text-red-600 truncate max-w-[150px]">
                        {t.worst ? (
                          <span title={t.worst[0]} className="flex items-center gap-1">
                            <span className="truncate">{t.worst[0]}</span>
                            <span className="shrink-0 bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold">
                              {t.worst[1]}
                            </span>
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>

            <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto" ref={ref7}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start mb-4 gap-4">
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-500" /> Mejores y Peores
                  Ciclistas por Ronda {monthsText ? ` [${monthsText}]` : ""}
                </h3>
                <ExportToolbar targetRef={ref7} filename="mejores-peores-ronda" />
              </div>
              <div className="">
                <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="w-full min-w-[600px] text-sm text-left">
                  <thead className="sticky top-0 bg-neutral-50 shadow-sm">
                    <tr className="border-b">
                      <th className="pb-2">Ronda</th>
                      <th className="pb-2 text-green-700">Mejor Ciclista</th>
                      <th className="pb-2 text-red-600">
                        Peor Ciclista (
                        <span className="text-[10px]">&gt;0 pts</span>)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthReportData.minMaxRound.map((r, idx) => (
                      <tr
                        key={idx}
                        className="border-b last:border-0 hover:bg-neutral-100 "
                      >
                        <td className="py-2.5 font-bold text-neutral-500 w-16 text-center">
                          R{r.round}
                        </td>
                        <td className="py-2.5 text-green-700">
                          {r.best ? (
                            <span className="flex items-center gap-1">
                              <span className="truncate">{r.best[0]}</span>
                              <span className="shrink-0 bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold">
                                +{r.best[1]}
                              </span>
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-2.5 text-red-600">
                          {r.worst ? (
                            <span className="flex items-center gap-1">
                              <span className="truncate">{r.worst[0]}</span>
                              <span className="shrink-0 bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold">
                                +{r.worst[1]}
                              </span>
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto" ref={ref12}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start mb-6 gap-4">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" /> Mejores picks por equipo {monthsText ? ` [${monthsText}]` : ""}
              </h3>
              <ExportToolbar targetRef={ref12} filename="mejores-picks" />
            </div>
            
            <div className="space-y-3 max-w-3xl">
               {monthReportData.bestPicks.map((p, idx) => {
                 const maxPicks = monthReportData.bestPicks[0]?.count || 1;
                 const width = `${(p.count / maxPicks) * 100}%`;
                 return (
                   <div key={idx} className="flex items-center gap-4">
                     <div className="w-40 text-sm font-semibold text-neutral-700 truncate text-right" title={p.team}>
                       {p.team}
                     </div>
                     <div className="flex-1 bg-neutral-200 h-7 rounded-md overflow-hidden relative flex items-center">
                       <div 
                         className="bg-yellow-400 h-full transition-all duration-1000 flex items-center absolute left-0 top-0" 
                         style={{ width }}
                       >
                       </div>
                       <span className={cn("text-xs font-bold  z-10", (p.count / maxPicks) < 0.1 ? "text-yellow-600 ml-3" : "text-yellow-900 ml-3")}>
                           {p.count} {p.count === 1 ? "pick" : "picks"}
                       </span>
                     </div>
                   </div>
                 );
               })}
               {monthReportData.bestPicks.length === 0 && (
                 <p className="text-sm text-neutral-500 italic">No hay datos suficientes de rondas.</p>
               )}
            </div>
          </div>

          
{/* Unscored Cyclists Table */}
                              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-8">
                                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
                                    <UserMinus className="w-5 h-5 text-neutral-400" />
                                    Ciclistas sin puntuar (
                                    {(() => {
                                      // Get all cyclists from elecciones
                                      const unscored = files.elecciones.data
                                        ?.map((row) => {
                                          const ciclista = getVal(
                                            row,
                                            "Ciclista",
                                          )?.trim();
                                          const jugador = getVal(
                                            row,
                                            "Nombre_TG",
                                          )?.trim();

                                          // Calculate points
                                          let points = 0;
                                          leaderboard?.forEach((p) => {
                                            if (p.jugador === jugador) {
                                              p?.detalles?.forEach((d) => {
                                                if (d.ciclista === ciclista) {
                                                  points += d.puntosObtenidos;
                                                }
                                              });
                                            }
                                          });

                                          if (points > 0) return null;
                                          return {
                                            ciclista,
                                            ronda:
                                              cyclistRoundMap[ciclista] || "",
                                            nombreEquipo: getVal(
                                              row,
                                              "Nombre_Equipo",
                                            )?.trim(),
                                          };
                                        })
                                        .filter(Boolean) as any[];

                                      // Filter by team and round
                                      return unscored.filter((c) => {
                                        const teamMatch =
                                          unscoredCyclistsTeamFilter ===
                                            "all" ||
                                          c.nombreEquipo ===
                                            unscoredCyclistsTeamFilter;
                                        const roundMatch =
                                          unscoredCyclistsRoundFilter.length ===
                                            0 ||
                                          unscoredCyclistsRoundFilter.includes(
                                            c.ronda,
                                          );
                                        return teamMatch && roundMatch;
                                      }).length;
                                    })()}
                                    )
                                  </h3>
                                  <p className="text-xs text-neutral-500 ">
                                    Corredores elegidos en el draft que aún no
                                    han sumado puntos.
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 mt-1">
                                    <div className="flex flex-wrap items-center gap-1.5 pr-3 border-r border-neutral-200 copy-button-ignore">
                                      <button
                                        onClick={() =>
                                          setIsUnscoredExpanded(
                                            !isUnscoredExpanded,
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
                                        title={
                                          isUnscoredExpanded
                                            ? "Contraer tabla"
                                            : "Expandir tabla"
                                        }
                                      >
                                        {isUnscoredExpanded ? (
                                          <Minimize2 className="w-4 h-4" />
                                        ) : (
                                          <Maximize2 className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCopyUnscored("full")
                                        }
                                        disabled={!!isUnscoredCopying}
                                        title="Copiar imagen"
                                        className={cn(
                                          "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                                          isUnscoredCopying === "full"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white",
                                          isUnscoredCopying &&
                                            isUnscoredCopying !== "full" &&
                                            "opacity-50 cursor-not-allowed",
                                        )}
                                      >
                                        {isUnscoredCopying === "full" ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>

                                      {(() => {
                                        const unscoredCount =
                                          (files.elecciones.data
                                            ?.map((row) => {
                                              const ciclista = getVal(
                                                row,
                                                "Ciclista",
                                              )?.trim();
                                              const jugador = getVal(
                                                row,
                                                "Nombre_TG",
                                              )?.trim();
                                              let points = 0;
                                              leaderboard?.forEach((p) => {
                                                if (p.jugador === jugador) {
                                                  p?.detalles?.forEach((d) => {
                                                    if (d.ciclista === ciclista)
                                                      points +=
                                                        d.puntosObtenidos;
                                                  });
                                                }
                                              });
                                              if (points > 0) return null;
                                              return {
                                                ciclista,
                                                ronda:
                                                  cyclistRoundMap[ciclista] ||
                                                  "",
                                                nombreEquipo: getVal(
                                                  row,
                                                  "Nombre_Equipo",
                                                )?.trim(),
                                              };
                                            })
                                            .filter(Boolean) as any[]) || [];
                                        const count = unscoredCount.filter(
                                          (c) => {
                                            const teamMatch =
                                              unscoredCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                unscoredCyclistsTeamFilter;
                                            const roundMatch =
                                              unscoredCyclistsRoundFilter.length ===
                                                0 ||
                                              unscoredCyclistsRoundFilter.includes(
                                                c.ronda,
                                              );
                                            return teamMatch && roundMatch;
                                          },
                                        ).length;

                                        if (count > 50) {
                                          return (
                                            <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                                              {Array.from({
                                                length: Math.ceil(count / 50),
                                              }).map((_, i) => {
                                                const s = "p" + (i + 1);
                                                const isCopyingThis =
                                                  isUnscoredCopying === s;
                                                return (
                                                  <button
                                                    key={s}
                                                    onClick={() =>
                                                      handleCopyUnscored(
                                                        s as any,
                                                      )
                                                    }
                                                    disabled={
                                                      !!isUnscoredCopying
                                                    }
                                                    className={cn(
                                                      "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                                      isCopyingThis
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-white",
                                                      isUnscoredCopying &&
                                                        !isCopyingThis &&
                                                        "opacity-50 cursor-not-allowed",
                                                    )}
                                                  >
                                                    {isCopyingThis ? (
                                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                                    ) : (
                                                      <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                    {i * 50 + 1}-{(i + 1) * 50}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}

                                      <button
                                        onClick={handleCopyUnscoredText}
                                        disabled={isUnscoredTextCopying}
                                        title="Copiar texto"
                                        className={cn(
                                          "px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
                                          isUnscoredTextCopying
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                                        )}
                                      >
                                        {isUnscoredTextCopying ? (
                                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        ) : (
                                          <FileText className="w-4 h-4 mr-1.5" />
                                        )}
                                        Texto
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadUnscored("full")
                                        }
                                        title="Descargar imagen"
                                        className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Round Multi-select Filter */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setIsUnscoredRoundFilterOpen(
                                            !setIsUnscoredRoundFilterOpen,
                                          )
                                        }
                                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
                                      >
                                        <span className="truncate">
                                          {unscoredCyclistsRoundFilter.length ===
                                          0
                                            ? "Todas las rondas"
                                            : `${unscoredCyclistsRoundFilter.length} rondas`}
                                        </span>
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 text-neutral-400 transition-transform",
                                            isUnscoredRoundFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </button>

                                      {isUnscoredRoundFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                              setIsUnscoredRoundFilterOpen(
                                                false,
                                              )
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 py-2 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                Rondas
                                              </span>
                                              {unscoredCyclistsRoundFilter.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    setUnscoredCyclistsRoundFilter(
                                                      [],
                                                    )
                                                  }
                                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                  Limpiar
                                                </button>
                                              )}
                                            </div>
                                            {Array.from(
                                              new Set(
                                                Object.values(
                                                  cyclistRoundMap,
                                                ) as string[],
                                              ),
                                            )
                                              .filter(Boolean)
                                              .sort((a, b) =>
                                                a.localeCompare(b),
                                              )
                                              .map((ronda) => (
                                                <label
                                                  key={ronda}
                                                  className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                    checked={unscoredCyclistsRoundFilter.includes(
                                                      ronda,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setUnscoredCyclistsRoundFilter(
                                                          [
                                                            ...unscoredCyclistsRoundFilter,
                                                            ronda,
                                                          ],
                                                        );
                                                      } else {
                                                        setUnscoredCyclistsRoundFilter(
                                                          unscoredCyclistsRoundFilter.filter(
                                                            (r) => r !== ronda,
                                                          ),
                                                        );
                                                      }
                                                    }}
                                                  />
                                                  <span className="ml-2 text-sm text-neutral-700">
                                                    Ronda {ronda}
                                                  </span>
                                                </label>
                                              ))}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    <select
                                      value={unscoredCyclistsTeamFilter}
                                      onChange={(e) =>
                                        setUnscoredCyclistsTeamFilter(
                                          e.target.value,
                                        )
                                      }
                                      className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                      <option value="all">
                                        Todos los equipos
                                      </option>
                                      {leaderboard?.map((p) => (
                                        <option
                                          key={p.nombreEquipo}
                                          value={p.nombreEquipo}
                                        >
                                          {p.nombreEquipo}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div
                                  ref={unscoredTableRef}
                                  className={cn(
                                    "overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 scrollbar-thin",
                                    isUnscoredExpanded
                                      ? "max-h-none"
                                      : "h-[800px]",
                                  )}
                                >
                                  <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="min-w-full text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-200 rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20">
                                      <tr className="divide-x divide-neutral-100">
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 "
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "jugador"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "jugador",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Jugador{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "jugador" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 "
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "ciclista"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "ciclista",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ciclista{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "ciclista" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 "
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "ronda"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "ronda",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1 text-center justify-center">
                                            Ronda{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "ronda" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 "
                                          title="Carreras disputadas"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "carreras"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "carreras",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Carreras{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "carreras" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 "
                                          title="Días de competición"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "dias"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "dias",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Días{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "dias" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                      {(() => {
                                        // Get all cyclists from elecciones
                                        const unscored = files.elecciones.data
                                          ?.map((row) => {
                                            const ciclista = getVal(
                                              row,
                                              "Ciclista",
                                            )?.trim();
                                            const jugador = getVal(
                                              row,
                                              "Nombre_TG",
                                            )?.trim();
                                            const nombreEquipo = getVal(
                                              row,
                                              "Nombre_Equipo",
                                            )?.trim();
                                            const orden =
                                              playerOrderMap[jugador] || "";
                                            const ronda =
                                              cyclistRoundMap[ciclista] || "";

                                            // Calculate points
                                            let points = 0;
                                            leaderboard?.forEach((p) => {
                                              if (p.jugador === jugador) {
                                                p?.detalles?.forEach((d) => {
                                                  if (d.ciclista === ciclista) {
                                                    points += d.puntosObtenidos;
                                                  }
                                                });
                                              }
                                            });

                                            if (points > 0) return null;

                                            // Get metadata
                                            const meta = cyclistMetadata[
                                              ciclista
                                            ] || {
                                              carrerasDisputadas: 0,
                                              diasCompeticion: 0,
                                            };

                                            return {
                                              ciclista,
                                              jugador,
                                              nombreEquipo,
                                              orden,
                                              ronda,
                                              carreras: meta.carrerasDisputadas,
                                              dias: meta.diasCompeticion,
                                            };
                                          })
                                          .filter(Boolean) as any[];

                                        // Filter by team and round
                                        const filtered = unscored.filter(
                                          (c) => {
                                            const teamMatch =
                                              unscoredCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                unscoredCyclistsTeamFilter;
                                            const roundMatch =
                                              unscoredCyclistsRoundFilter.length ===
                                                0 ||
                                              unscoredCyclistsRoundFilter.includes(
                                                c.ronda,
                                              );
                                            return teamMatch && roundMatch;
                                          },
                                        );

                                        // Sort
                                        filtered.sort((a, b) => {
                                          let valA: any, valB: any;
                                          switch (unscoredCyclistsSortColumn) {
                                            case "jugador":
                                              valA = a.nombreEquipo;
                                              valB = b.nombreEquipo;
                                              break;
                                            case "ciclista":
                                              valA = a.ciclista;
                                              valB = b.ciclista;
                                              break;
                                            case "ronda":
                                              valA = a.ronda;
                                              valB = b.ronda;
                                              break;
                                            case "carreras":
                                              valA = a.carreras;
                                              valB = b.carreras;
                                              break;
                                            case "dias":
                                              valA = a.dias;
                                              valB = b.dias;
                                              break;
                                            default:
                                              valA = a.ronda;
                                              valB = b.ronda;
                                              break;
                                          }

                                          if (
                                            typeof valA === "string" &&
                                            typeof valB === "string"
                                          ) {
                                            return unscoredCyclistsSortDirection ===
                                              "asc"
                                              ? valA.localeCompare(valB)
                                              : valB.localeCompare(valA);
                                          }

                                          if (valA < valB)
                                            return unscoredCyclistsSortDirection ===
                                              "asc"
                                              ? -1
                                              : 1;
                                          if (valA > valB)
                                            return unscoredCyclistsSortDirection ===
                                              "asc"
                                              ? 1
                                              : -1;
                                          return 0;
                                        });

                                        // Calculate max values for conditional formatting
                                        const maxCarreras = Math.max(
                                          ...filtered.map((c) => c.carreras),
                                          0,
                                        );
                                        const maxDias = Math.max(
                                          ...filtered.map((c) => c.dias),
                                          0,
                                        );

                                        if (filtered.length === 0) {
                                          return (
                                            <tr>
                                              <td
                                                colSpan={5}
                                                className="px-6 py-10 text-center text-neutral-400 italic text-[11px]"
                                              >
                                                No hay ciclistas sin puntuar que
                                                coincidan con los criterios.
                                              </td>
                                            </tr>
                                          );
                                        }

                                        return filtered.map((c, idx) => {
                                          let isHiddenVisual = false;
                                          if (isUnscoredCopying) {
                                            if (isUnscoredCopying === "full")
                                              isHiddenVisual = false;
                                            else {
                                              const pageNum = parseInt(
                                                isUnscoredCopying.substring(1),
                                              );
                                              const start = (pageNum - 1) * 50;
                                              const end = start + 50;
                                              isHiddenVisual = !(
                                                idx >= start && idx < end
                                              );
                                            }
                                          }

                                          if (
                                            isHiddenVisual &&
                                            isUnscoredCopying
                                          )
                                            return null;

                                          return (
                                            <tr
                                              key={idx}
                                              className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100"
                                            >
                                              <td className="px-4 py-1 text-neutral-600 ">
                                                <span className="font-medium">
                                                  {c.nombreEquipo}
                                                </span>{" "}
                                                <span className="text-neutral-400 font-normal text-[9px]">
                                                  [#{c.orden}]
                                                </span>
                                              </td>
                                              <td className="px-4 py-1 font-bold text-neutral-900 ">
                                                {c.ciclista}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-4 py-1 text-center font-mono ",
                                                  [
                                                    "01",
                                                    "02",
                                                    "03",
                                                    "1",
                                                    "2",
                                                    "3",
                                                  ].includes(c.ronda)
                                                    ? "bg-yellow-50 text-yellow-700 font-bold"
                                                    : "text-neutral-500",
                                                )}
                                              >
                                                {c.ronda}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-4 py-1 text-center font-mono ",
                                                  c.carreras === 0
                                                    ? "text-red-600 font-bold"
                                                    : c.carreras ===
                                                          maxCarreras &&
                                                        maxCarreras > 0
                                                      ? "text-green-600 font-bold"
                                                      : "text-neutral-600",
                                                )}
                                              >
                                                {c.carreras}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-4 py-1 text-center font-mono ",
                                                  c.dias === 0
                                                    ? "text-red-600 font-bold"
                                                    : c.dias === maxDias &&
                                                        maxDias > 0
                                                      ? "text-green-600 font-bold"
                                                      : "text-neutral-600",
                                                )}
                                              >
                                                {c.dias}
                                              </td>
                                            </tr>
                                          );
                                        });
                                      })()}
                                    </tbody>
                                  </table></div>
                                </div>
                              </div>

                              {/* Undebuted Cyclists Table */}
                              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-8">
                                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
                                    <UserMinus className="w-5 h-5 text-neutral-400" />
                                    Ciclistas sin debutar (
                                    {(() => {
                                      const undebuted = files.elecciones.data
                                        ?.map((row) => {
                                          const ciclista = getVal(
                                            row,
                                            "Ciclista",
                                          )?.trim();
                                          const jugador = getVal(
                                            row,
                                            "Nombre_TG",
                                          )?.trim();
                                          const nombreEquipo = getVal(
                                            row,
                                            "Nombre_Equipo",
                                          )?.trim();
                                          const ronda =
                                            cyclistRoundMap[ciclista] || "";
                                          const meta = cyclistMetadata[
                                            ciclista
                                          ] || {
                                            carrerasDisputadas: 0,
                                            diasCompeticion: 0,
                                          };

                                          if (meta.diasCompeticion > 0)
                                            return null;

                                          return { nombreEquipo, ronda };
                                        })
                                        .filter(Boolean) as any[];

                                      const filtered = undebuted.filter((c) => {
                                        const teamMatch =
                                          undebutedCyclistsTeamFilter ===
                                            "all" ||
                                          c.nombreEquipo ===
                                            undebutedCyclistsTeamFilter;
                                        const roundMatch =
                                          undebutedCyclistsRoundFilter.length ===
                                            0 ||
                                          undebutedCyclistsRoundFilter.includes(
                                            c.ronda,
                                          );
                                        return teamMatch && roundMatch;
                                      });

                                      return filtered.length;
                                    })()}
                                    )
                                  </h3>
                                  <p className="text-xs text-neutral-500 ">
                                    Corredores elegidos en el draft que aún no
                                    han disputado ninguna carrera (días = 0).
                                  </p>
                                  <div className="flex flex-wrap gap-3 mt-1">
                                    <div className="flex flex-wrap items-center gap-1.5 border-r border-neutral-200 pr-3 copy-button-ignore">
                                      <button
                                        onClick={() =>
                                          setIsUndebutedExpanded(
                                            !isUndebutedExpanded,
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
                                        title={
                                          isUndebutedExpanded
                                            ? "Contraer tabla"
                                            : "Expandir tabla"
                                        }
                                      >
                                        {isUndebutedExpanded ? (
                                          <Minimize2 className="w-4 h-4" />
                                        ) : (
                                          <Maximize2 className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCopyUndebuted("full")
                                        }
                                        disabled={!!isUndebutedCopying}
                                        title="Copiar imagen"
                                        className={cn(
                                          "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                                          isUndebutedCopying === "full"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white",
                                          isUndebutedCopying &&
                                            isUndebutedCopying !== "full" &&
                                            "opacity-50 cursor-not-allowed",
                                        )}
                                      >
                                        {isUndebutedCopying === "full" ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>

                                      {(() => {
                                        const undebutedCount =
                                          (files.elecciones.data
                                            ?.map((row) => {
                                              const ciclista = getVal(
                                                row,
                                                "Ciclista",
                                              )?.trim();
                                              const meta = cyclistMetadata[
                                                ciclista
                                              ] || {
                                                carrerasDisputadas: 0,
                                                diasCompeticion: 0,
                                              };
                                              if (meta.diasCompeticion > 0)
                                                return null;
                                              return {
                                                nombreEquipo: getVal(
                                                  row,
                                                  "Nombre_Equipo",
                                                )?.trim(),
                                                ronda:
                                                  cyclistRoundMap[ciclista] ||
                                                  "",
                                              };
                                            })
                                            .filter(Boolean) as any[]) || [];
                                        const count = undebutedCount.filter(
                                          (c) => {
                                            const teamMatch =
                                              undebutedCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                undebutedCyclistsTeamFilter;
                                            const roundMatch =
                                              undebutedCyclistsRoundFilter.length ===
                                                0 ||
                                              undebutedCyclistsRoundFilter.includes(
                                                c.ronda,
                                              );
                                            return teamMatch && roundMatch;
                                          },
                                        ).length;

                                        if (count > 50) {
                                          return (
                                            <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                                              {Array.from({
                                                length: Math.ceil(count / 50),
                                              }).map((_, i) => {
                                                const s = "p" + (i + 1);
                                                const isCopyingThis =
                                                  isUndebutedCopying === s;
                                                return (
                                                  <button
                                                    key={s}
                                                    onClick={() =>
                                                      handleCopyUndebuted(
                                                        s as any,
                                                      )
                                                    }
                                                    disabled={
                                                      !!isUndebutedCopying
                                                    }
                                                    className={cn(
                                                      "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                                      isCopyingThis
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-white",
                                                      isUndebutedCopying &&
                                                        !isCopyingThis &&
                                                        "opacity-50 cursor-not-allowed",
                                                    )}
                                                  >
                                                    {isCopyingThis ? (
                                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                                    ) : (
                                                      <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                    {i * 50 + 1}-{(i + 1) * 50}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}

                                      <button
                                        onClick={handleCopyUndebutedText}
                                        disabled={isUndebutedTextCopying}
                                        title="Copiar texto"
                                        className={cn(
                                          "px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
                                          isUndebutedTextCopying
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                                        )}
                                      >
                                        {isUndebutedTextCopying ? (
                                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        ) : (
                                          <FileText className="w-4 h-4 mr-1.5" />
                                        )}
                                        Texto
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadUndebuted("full")
                                        }
                                        title="Descargar imagen"
                                        className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setIsUndebutedRoundFilterOpen(
                                            !isUndebutedRoundFilterOpen,
                                          )
                                        }
                                        className={cn(
                                          "flex items-center gap-2 px-3 py-2 text-sm border rounded-md shadow-sm transition-all",
                                          undebutedCyclistsRoundFilter.length >
                                            0
                                            ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                                            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                                        )}
                                      >
                                        {undebutedCyclistsRoundFilter.length ===
                                        0
                                          ? "Todas las rondas"
                                          : `${undebutedCyclistsRoundFilter.length} ${undebutedCyclistsRoundFilter.length === 1 ? "ronda" : "rondas"}`}
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 transition-transform",
                                            isUndebutedRoundFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </button>

                                      {isUndebutedRoundFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-[40]"
                                            onClick={() =>
                                              setIsUndebutedRoundFilterOpen(
                                                false,
                                              )
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-[50] py-1 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                                Filtrar por ronda
                                              </span>
                                              {undebutedCyclistsRoundFilter.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    setUndebutedCyclistsRoundFilter(
                                                      [],
                                                    )
                                                  }
                                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                  Limpiar
                                                </button>
                                              )}
                                            </div>
                                            {Array.from(
                                              new Set(
                                                Object.values(
                                                  cyclistRoundMap,
                                                ) as string[],
                                              ),
                                            )
                                              .filter(Boolean)
                                              .sort((a, b) =>
                                                a.localeCompare(b),
                                              )
                                              .map((ronda) => (
                                                <label
                                                  key={ronda}
                                                  className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                    checked={undebutedCyclistsRoundFilter.includes(
                                                      ronda,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setUndebutedCyclistsRoundFilter(
                                                          [
                                                            ...undebutedCyclistsRoundFilter,
                                                            ronda,
                                                          ],
                                                        );
                                                      } else {
                                                        setUndebutedCyclistsRoundFilter(
                                                          undebutedCyclistsRoundFilter.filter(
                                                            (r) => r !== ronda,
                                                          ),
                                                        );
                                                      }
                                                    }}
                                                  />
                                                  <span className="ml-2 text-sm text-neutral-700">
                                                    Ronda {ronda}
                                                  </span>
                                                </label>
                                              ))}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    <select
                                      value={undebutedCyclistsTeamFilter}
                                      onChange={(e) =>
                                        setUndebutedCyclistsTeamFilter(
                                          e.target.value,
                                        )
                                      }
                                      className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                      <option value="all">
                                        Todos los equipos
                                      </option>
                                      {leaderboard?.map((p) => (
                                        <option
                                          key={p.nombreEquipo}
                                          value={p.nombreEquipo}
                                        >
                                          {p.nombreEquipo}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div
                                  ref={undebutedTableRef}
                                  className={cn(
                                    "overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin",
                                    isUndebutedExpanded
                                      ? "max-h-none"
                                      : "max-h-[750px]",
                                  )}
                                >
                                  <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="min-w-full text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-200 rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20">
                                      <tr className="divide-x divide-neutral-100">
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 "
                                          onClick={() => {
                                            if (
                                              undebutedCyclistsSortColumn ===
                                              "jugador"
                                            ) {
                                              setUndebutedCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUndebutedCyclistsSortColumn(
                                                "jugador",
                                              );
                                              setUndebutedCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Jugador{" "}
                                            {undebutedCyclistsSortColumn ===
                                              "jugador" &&
                                              (undebutedCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 "
                                          onClick={() => {
                                            if (
                                              undebutedCyclistsSortColumn ===
                                              "ciclista"
                                            ) {
                                              setUndebutedCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUndebutedCyclistsSortColumn(
                                                "ciclista",
                                              );
                                              setUndebutedCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ciclista{" "}
                                            {undebutedCyclistsSortColumn ===
                                              "ciclista" &&
                                              (undebutedCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 "
                                          onClick={() => {
                                            if (
                                              undebutedCyclistsSortColumn ===
                                              "ronda"
                                            ) {
                                              setUndebutedCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUndebutedCyclistsSortColumn(
                                                "ronda",
                                              );
                                              setUndebutedCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ronda{" "}
                                            {undebutedCyclistsSortColumn ===
                                              "ronda" &&
                                              (undebutedCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                      {(() => {
                                        // Get all cyclists from elecciones
                                        const undebuted = files.elecciones.data
                                          ?.map((row) => {
                                            const ciclista = getVal(
                                              row,
                                              "Ciclista",
                                            )?.trim();
                                            const jugador = getVal(
                                              row,
                                              "Nombre_TG",
                                            )?.trim();
                                            const nombreEquipo = getVal(
                                              row,
                                              "Nombre_Equipo",
                                            )?.trim();
                                            const orden =
                                              playerOrderMap[jugador] || "";
                                            const ronda =
                                              cyclistRoundMap[ciclista] || "";

                                            // Get metadata
                                            const meta = cyclistMetadata[
                                              ciclista
                                            ] || {
                                              carrerasDisputadas: 0,
                                              diasCompeticion: 0,
                                            };

                                            if (meta.diasCompeticion > 0)
                                              return null;

                                            return {
                                              ciclista,
                                              jugador,
                                              nombreEquipo,
                                              orden,
                                              ronda,
                                            };
                                          })
                                          .filter(Boolean) as any[];

                                        // Filter by team and round
                                        const filtered = undebuted.filter(
                                          (c) => {
                                            const teamMatch =
                                              undebutedCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                undebutedCyclistsTeamFilter;
                                            const roundMatch =
                                              undebutedCyclistsRoundFilter.length ===
                                                0 ||
                                              undebutedCyclistsRoundFilter.includes(
                                                c.ronda,
                                              );
                                            return teamMatch && roundMatch;
                                          },
                                        );

                                        // Sort
                                        filtered.sort((a, b) => {
                                          let valA: any, valB: any;
                                          switch (undebutedCyclistsSortColumn) {
                                            case "jugador":
                                              valA = a.nombreEquipo;
                                              valB = b.nombreEquipo;
                                              break;
                                            case "ciclista":
                                              valA = a.ciclista;
                                              valB = b.ciclista;
                                              break;
                                            case "ronda":
                                              valA = parseInt(a.ronda) || 0;
                                              valB = parseInt(b.ronda) || 0;
                                              break;
                                            default:
                                              valA = parseInt(a.ronda) || 0;
                                              valB = parseInt(b.ronda) || 0;
                                              break;
                                          }

                                          if (
                                            typeof valA === "string" &&
                                            typeof valB === "string"
                                          ) {
                                            return undebutedCyclistsSortDirection ===
                                              "asc"
                                              ? valA.localeCompare(valB)
                                              : valB.localeCompare(valA);
                                          }

                                          if (valA < valB)
                                            return undebutedCyclistsSortDirection ===
                                              "asc"
                                              ? -1
                                              : 1;
                                          if (valA > valB)
                                            return undebutedCyclistsSortDirection ===
                                              "asc"
                                              ? 1
                                              : -1;
                                          return 0;
                                        });

                                        if (filtered.length === 0) {
                                          return (
                                            <tr>
                                              <td
                                                colSpan={3}
                                                className="px-6 py-10 text-center text-neutral-400 italic text-[11px]"
                                              >
                                                No hay ciclistas sin debutar que
                                                coincidan con los filtros.
                                              </td>
                                            </tr>
                                          );
                                        }

                                        return filtered.map((c, idx) => {
                                          let isHiddenVisual = false;
                                          if (isUndebutedCopying) {
                                            if (isUndebutedCopying === "full")
                                              isHiddenVisual = false;
                                            else {
                                              const pageNum = parseInt(
                                                isUndebutedCopying.substring(1),
                                              );
                                              const start = (pageNum - 1) * 50;
                                              const end = start + 50;
                                              isHiddenVisual = !(
                                                idx >= start && idx < end
                                              );
                                            }
                                          }

                                          if (
                                            isHiddenVisual &&
                                            isUndebutedCopying
                                          )
                                            return null;

                                          return (
                                            <tr
                                              key={idx}
                                              className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100"
                                            >
                                              <td className="px-4 py-1 text-neutral-600 ">
                                                <span className="font-medium">
                                                  {c.nombreEquipo}
                                                </span>{" "}
                                                <span className="text-neutral-400 font-normal text-[9px]">
                                                  [#{c.orden}]
                                                </span>
                                              </td>
                                              <td className="px-4 py-1 font-bold text-neutral-900 ">
                                                {c.ciclista}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-4 py-1 text-center font-mono ",
                                                  [
                                                    "01",
                                                    "02",
                                                    "03",
                                                    "1",
                                                    "2",
                                                    "3",
                                                  ].includes(c.ronda)
                                                    ? "bg-yellow-50 text-yellow-700 font-bold"
                                                    : "text-neutral-500",
                                                )}
                                              >
                                                {c.ronda}
                                              </td>
                                            </tr>
                                          );
                                        });
                                      })()}
                                    </tbody>
                                  </table></div>
                                
</div></div>
{/* SECTION 5: Premio Panenkita {monthsText ? ` [${monthsText}]` : ""} */}
          <div className="space-y-6 bg-pink-50 p-6 -mx-6 rounded-xl border-y border-pink-100" ref={ref8} >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start pb-2 gap-4">
              <h3 className="text-xl font-bold text-pink-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-pink-500" /> Premio Panenkita {monthsText ? ` [${monthsText}]` : ""}
                (Puntos con elecciones R20 - R25)
              </h3>
              <ExportToolbar targetRef={ref8} filename="premio-panenkita" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm lg:col-span-3" ref={ref9} >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start border-b border-pink-100 pb-2 mb-3 gap-3">
                  <h4 className="font-bold text-pink-800 text-sm">
                    Mejores Equipos (R20-25)
                  </h4>
                  <ExportToolbar targetRef={ref9} filename="mejores-equipos-panenkita" />
                </div>
                <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="w-full text-sm text-left table-fixed">
                  <tbody>
                    {monthReportData.panenkitaTopTeams.map((t, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-pink-50 last:border-0"
                      >
                        <td className="py-2">
                          <span className="text-pink-400 mr-2">{idx + 1}.</span>
                          {t.team}
                        </td>
                        <td className="py-2 text-right font-bold text-pink-600">
                          {t.pts} pts
                        </td>
                      </tr>
                    ))}
                    {monthReportData.panenkitaTopTeams.length === 0 && (
                      <tr>
                        <td className="py-4 text-center text-pink-400 italic">
                          Sin datos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table></div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm lg:col-span-5" ref={ref10}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start border-b border-pink-100 pb-2 mb-3 gap-3">
                  <h4 className="font-bold text-pink-800 text-sm">
                    Top 50 Panenkitas (Ciclistas)
                  </h4>
                  <ExportToolbar targetRef={ref10} filename="top-50-panenkitas" />
                </div>
                <div className="">
                  <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="w-full text-sm text-left table-fixed">
                    <tbody>
                      {monthReportData.panenkitaTopCyclists.map((c, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-pink-50 last:border-0"
                        >
                          <td className="py-1.5 whitespace-nowrap">
                            <span className="text-pink-400 mr-2 text-xs">
                              {idx + 1}º
                            </span>
                            {c.cyclist} <span className="opacity-60 text-[10px]">&lt;{c.round}&gt; {c.teamInfo}</span>
                          </td>
                          <td className="py-1.5 text-right font-mono text-xs font-bold text-pink-600">
                            {c.pts}
                          </td>
                        </tr>
                      ))}
                      {monthReportData.panenkitaTopCyclists.length === 0 && (
                        <tr>
                          <td className="py-4 text-center text-pink-400 italic">
                            Sin datos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm lg:col-span-4" ref={ref11}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start border-b border-pink-100 pb-2 mb-3 gap-3">
                  <h4
                    className="font-bold text-pink-800 text-sm truncate"
                    title={monthReportData.bestPanenkitaTeam || "N/A"}
                  >
                    Elecciones de {monthReportData.bestPanenkitaTeam || "N/A"}
                  </h4>
                  <ExportToolbar targetRef={ref11} filename="elecciones-equipo-panenkita" />
                </div>
                <div className="overflow-auto max-h-[250px]">
                  <div className="table-responsive-wrapper overflow-x-auto w-full"><table className="w-full text-sm text-left table-fixed">
                    <tbody>
                      {monthReportData.bestPanenkitaTeamPicks.map((c, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-pink-50 last:border-0"
                        >
                          <td className="py-1.5 truncate">{c.cyclist}</td>
                          <td className="py-1.5 text-right font-mono text-xs font-bold text-pink-600">
                            +{c.pts}
                          </td>
                        </tr>
                      ))}
                      {monthReportData.bestPanenkitaTeamPicks.length === 0 && (
                        <tr>
                          <td className="py-4 text-center text-pink-400 italic">
                            Sin datos que sumar puntos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table></div>
                </div>
              </div>
            </div>
          </div>
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
