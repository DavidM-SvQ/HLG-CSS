import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useState, useRef, useMemo } from 'react';
import { useCrosshair } from '../../hooks/useCrosshair';
import { Search, Minimize2, Maximize2, X, Filter } from 'lucide-react';
import { ChevronDown, ChevronUp, Copy, CheckCircle2, UploadCloud, Activity, FileText, Download, HelpCircle, ArrowUpDown, BarChart3, TrendingUp, Trophy } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Bar } from 'recharts';
import { expandNodeForCapture } from '../../lib/dom-utils';
import { domToDataUrl } from 'modern-screenshot';
import { DraftElections } from './draft/DraftElections';
import { DraftDatos } from './draft/DraftDatos';
import { cn } from '../../lib/utils';
import { getVal, getCategoryColorStyle, formatNumberSpanish } from '../../lib/data-processing';

export interface DraftViewProps {
  leaderboard: any;
  getFlagEmoji: any;
  teamToPlayerMap: any;
  playerOrderMap: any;
  files: any;
    cyclistMetadata: any;
  playerTeamMap: any;
        }

export const DraftView: React.FC<DraftViewProps> = ({
  files,
    cyclistMetadata,
  playerTeamMap,
          leaderboard,
  getFlagEmoji,
  teamToPlayerMap,
  playerOrderMap
}) => {
  const [draftSubTab, setDraftSubTab] = useState<"elecciones" | "datos">("elecciones");
  const [draftSearchTerm, setDraftSearchTerm] = useState("");
  const [draftRoundFilter, setDraftRoundFilter] = useState<string[]>([]);
  const [draftTeamFilter, setDraftTeamFilter] = useState<string[]>([]);
  const [isDraftRoundFilterOpen, setIsDraftRoundFilterOpen] = useState(false);
  const [isDraftTeamFilterOpen, setIsDraftTeamFilterOpen] = useState(false);
  const [draftStatsFilters, setDraftStatsFilters] = useState<{ minPuntos: number; minVictorias: number; }>({ minPuntos: 0, minVictorias: 0 });
  const [isDraftStatsFilterOpen, setIsDraftStatsFilterOpen] = useState(false);
  const [draftDatosTooltip, setDraftDatosTooltip] = useState<any>(null);
  const [draftDatosMonthFilter, setDraftDatosMonthFilter] = useState<string[]>([]);
  const [draftDatosCategoryFilter, setDraftDatosCategoryFilter] = useState<string[]>([]);
  const [draftDatosTeamFilter, setDraftDatosTeamFilter] = useState<string[]>([]);
  const [isDraftDatosMonthFilterOpen, setIsDraftDatosMonthFilterOpen] = useState(false);
  const [isDraftDatosCategoryFilterOpen, setIsDraftDatosCategoryFilterOpen] = useState(false);
  const [isDraftDatosTeamFilterOpen, setIsDraftDatosTeamFilterOpen] = useState(false);
  const [draftSortColumn, setDraftSortColumn] = useState<string>("Elección");
  const [draftSortDirection, setDraftSortDirection] = useState<"asc" | "desc">("asc");
  const [draftDatosSortColumn, setDraftDatosSortColumn] = useState<string>("Orden");
  const [draftDatosSortDirection, setDraftDatosSortDirection] = useState<"asc" | "desc">("asc");
  const [isDraftTableExpanded, setIsDraftTableExpanded] = useState(false);
  const [isDraftDatosTableExpanded, setIsDraftDatosTableExpanded] = useState(false);
  const [isDraftSummaryExpanded, setIsDraftSummaryExpanded] = useState(false);
  const [draftSummarySort, setDraftSummarySort] = useState<{keys: string[]; order: "asc" | "desc";}>({ keys: ["totalPoints"], order: "desc" });

  
  const draftTableRef = useRef<HTMLDivElement>(null);
  const draftDatosTableRef = useRef<HTMLDivElement>(null);
  const draftSummaryTableRef = useRef<HTMLDivElement>(null);
  const draftChartRef = useRef<HTMLDivElement>(null);

  // Mocks for missing functions that were handled in App.tsx
  const [isDraftTableCopying, setIsDraftTableCopying] = useState<string | false>(false);
  const handleCopyDraftTableImage = (part?: any) => {};

  const [isDraftDatosTableCopying, setIsDraftDatosTableCopying] = useState<string | false>(false);
  const handleCopyDraftDatosTableImage = () => {};
  const handleDownloadDraftDatosTableImage = () => {};
  const handleDownloadDraftTableImage = (part?: any) => {};
  
  const getStatColor = (val: number, max: number, min: number = 0, inverted: boolean = false, allowZero: boolean = false, minNonZero: number = 0) => {
    if (val === 0 && !allowZero) return "";
    let t = 0;
    if (max > min) {
      const effectMin = allowZero ? min : minNonZero;
      t = Math.max(0, Math.min(1, (val - effectMin) / (max - effectMin)));
    }
    t = Number.isNaN(t) ? 0 : t;
    const hue = inverted ? 120 - t * 120 : t * 120; // 0=red, 120=green
    return `bg-[${"hsl(" + hue + ", 80%, 45%)"}] text-white`;
  };
 
  
  
  const raceTypeByName = useMemo(() => {
    const map: Record<string, string> = {};
    files?.carreras?.data?.forEach((row: any) => {
      const carrera = getVal(row, "Carrera")?.trim();
      const categoria = getVal(row, "Categoría")?.trim();
      if (carrera && categoria) map[carrera] = categoria;
    });
    return map;
  }, [files?.carreras?.data]);

  const raceDateByName = useMemo(() => {
    const map: Record<string, string> = {};
    files?.carreras?.data?.forEach((row: any) => {
      const carrera = getVal(row, "Carrera")?.trim();
      const fecha = getVal(row, "Fecha")?.trim();
      if (carrera && fecha) map[carrera] = fecha;
    });
    return map;
  }, [files?.carreras?.data]);

  const draftCyclistStats = useMemo(() => {
    const stats: Record<string, { puntos: number; victorias: number }> = {};
    leaderboard?.forEach((player: any) => {
      player?.detalles?.forEach((d: any) => {
        if (!stats[d.ciclista]) {
          stats[d.ciclista] = { puntos: 0, victorias: 0 };
        }
        stats[d.ciclista].puntos += d.puntosObtenidos;

        const isPos01 = d.posicion === "01" || d.posicion === "1";
        const isValidType = [
          "Etapa",
          "Etapa (Crono equipos)",
          "Clasificación final",
          "Clasificación final (Crono equipos)",
          "Clásica",
        ].includes(d.tipoResultado);

        if (isPos01 && isValidType) {
          stats[d.ciclista].victorias += 1;
        }
      });
    });
    return stats;
  }, [leaderboard]);

  const teamTotalPoints = useMemo(() => {
    const totals: Record<string, number> = {};
    files.elecciones?.data?.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista") as string;
      const equipo = getVal(row, "Nombre_Equipo") || (getVal(row, "Nombre_TG") as string);
      const pts = draftCyclistStats[ciclista]?.puntos || 0;
      if (equipo) {
        totals[equipo] = (totals[equipo] || 0) + pts;
      }
    });
    return totals;
  }, [files?.elecciones?.data, draftCyclistStats]);

  
  const draftComputedData = useMemo(() => {
    let minCarreras = Infinity;
    let minDc = Infinity;
    let minPpc = Infinity;
    let minPpd = Infinity;
    let minPct = Infinity;

    const maxPuntos = Math.max(
      1,
      ...Object.values(draftCyclistStats as Record<string, any>).map((s) => s.puntos)
    );

    files?.elecciones?.data?.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista") as string;
      if (!ciclista) return;
      const stats = draftCyclistStats[ciclista] || {
        puntos: 0,
        victorias: 0,
      };
      const meta = cyclistMetadata[ciclista] || {
        carrerasDisputadas: 0,
        diasCompeticion: 0,
      };

      const carr = meta.carrerasDisputadas;
      const dc = meta.diasCompeticion;
      const ppc = carr > 0 ? stats.puntos / carr : 0;
      const ppd = dc > 0 ? stats.puntos / dc : 0;

      const equipo =
        getVal(row, "Nombre_Equipo") ||
        (getVal(row, "Nombre_TG") as string);
      const pct =
        equipo && teamTotalPoints[equipo] > 0
          ? (stats.puntos / teamTotalPoints[equipo]) * 100
          : 0;

      if (carr > 0 && carr < minCarreras) minCarreras = carr;
      if (dc > 0 && dc < minDc) minDc = dc;
      if (ppc > 0 && ppc < minPpc) minPpc = ppc;
      if (ppd > 0 && ppd < minPpd) minPpd = ppd;
      if (pct > 0 && pct < minPct) minPct = pct;
    });

    return { maxPuntos, minCarreras, minDc, minPpc, minPpd, minPct };
  }, [files?.elecciones?.data, draftCyclistStats, cyclistMetadata, teamTotalPoints]);

  const draftFilteredData = useMemo(() => {
    if (!files?.elecciones?.data) return [];
    return files.elecciones.data.filter((row: any) => {
      const ciclista = getVal(row, "Ciclista") as string;
      const matchesSearch = ciclista
        ?.toLowerCase()
        .includes(draftSearchTerm.toLowerCase());
      const matchesRound =
        draftRoundFilter.length === 0 ||
        draftRoundFilter.includes(String(getVal(row, "Ronda")));
      const matchesTeam =
        draftTeamFilter.length === 0 ||
        draftTeamFilter.includes(
          String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG"))
        );

      let matchesStats = true;
      if (ciclista) {
        const stats = draftCyclistStats[ciclista] || {
          puntos: 0,
          victorias: 0,
        };
        const meta = cyclistMetadata[ciclista] || {
          carrerasDisputadas: 0,
          diasCompeticion: 0,
        };
        const puntos = stats.puntos;
        const victorias = stats.victorias;
        const carr = meta.carrerasDisputadas;
        const dc = meta.diasCompeticion;
        const ppc = carr > 0 ? puntos / carr : 0;
        const ppd = dc > 0 ? puntos / dc : 0;

        if (
          draftStatsFilters.minPuntos !== undefined &&
          puntos < draftStatsFilters.minPuntos
        )
          matchesStats = false;
        if (
          draftStatsFilters.minVictorias !== undefined &&
          victorias < draftStatsFilters.minVictorias
        )
          matchesStats = false;
        // ignoring the max filters if they're not in the state right now, but let's just copy them as they were.
        // Wait, draftStatsFilters only has minPuntos and minVictorias! The other ones were unused or custom.
      }

      return matchesSearch && matchesRound && matchesTeam && matchesStats;
    });
  }, [files?.elecciones?.data, draftSearchTerm, draftRoundFilter, draftTeamFilter, draftStatsFilters, draftCyclistStats, cyclistMetadata]);

  
  const draftSortedData = useMemo(() => {
    return [...draftFilteredData].sort((a, b) => {
      // Replicando la logica de sort
      if (draftSortColumn === "Puntos") {
        const ptsA = draftCyclistStats[getVal(a, "Ciclista") || ""]?.puntos || 0;
        const ptsB = draftCyclistStats[getVal(b, "Ciclista") || ""]?.puntos || 0;
        return draftSortDirection === "asc" ? ptsA - ptsB : ptsB - ptsA;
      }
      if (draftSortColumn === "V") {
        const vicA = draftCyclistStats[getVal(a, "Ciclista") || ""]?.victorias || 0;
        const vicB = draftCyclistStats[getVal(b, "Ciclista") || ""]?.victorias || 0;
        return draftSortDirection === "asc" ? vicA - vicB : vicB - vicA;
      }
      if (draftSortColumn === "C") {
        const cA = cyclistMetadata[getVal(a, "Ciclista") || ""]?.carrerasDisputadas || 0;
        const cB = cyclistMetadata[getVal(b, "Ciclista") || ""]?.carrerasDisputadas || 0;
        return draftSortDirection === "asc" ? cA - cB : cB - cA;
      }
      if (draftSortColumn === "DC") {
        const dcA = cyclistMetadata[getVal(a, "Ciclista") || ""]?.diasCompeticion || 0;
        const dcB = cyclistMetadata[getVal(b, "Ciclista") || ""]?.diasCompeticion || 0;
        return draftSortDirection === "asc" ? dcA - dcB : dcB - dcA;
      }
      const valA = getVal(a, draftSortColumn);
      const valB = getVal(b, draftSortColumn);
      if (!valA) return 1;
      if (!valB) return -1;
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return draftSortDirection === "asc" ? numA - numB : numB - numA;
      }
      return draftSortDirection === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [draftFilteredData, draftSortColumn, draftSortDirection, draftCyclistStats, cyclistMetadata]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: draftSortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  return (
    <>

  <div className="space-y-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">
          Draft 2026
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Información y resultados del draft.
        </p>
      </div>
      <div className="flex bg-neutral-100 p-1 rounded-lg self-start">
        <button
          onClick={() => setDraftSubTab("elecciones")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            draftSubTab === "elecciones"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          Elecciones
        </button>
        <button
          onClick={() => setDraftSubTab("datos")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            draftSubTab === "datos"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          Datos
        </button>
      </div>
    </div>

        {draftSubTab === "elecciones" && (
      <DraftElections 
        files={files}
        cyclistMetadata={cyclistMetadata}
        leaderboard={leaderboard}
        getFlagEmoji={getFlagEmoji}
        teamTotalPoints={teamTotalPoints}
        draftCyclistStats={draftCyclistStats}
        draftComputedData={draftComputedData}
      />
    )}

    {draftSubTab === "datos" && (
      <DraftDatos 
        files={files}
        leaderboard={leaderboard}
        cyclistMetadata={cyclistMetadata}
        teamToPlayerMap={teamToPlayerMap}
        playerOrderMap={playerOrderMap}
      />
    )}
  </div>
    </>
  );
};
