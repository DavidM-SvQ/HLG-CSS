import React, { useMemo, useRef, useState } from "react";
import { AppState, CyclistMetadata, PlayerScore } from "../../../lib/types";
import { ReportCard } from "../../ui/ReportCard";
import {
  ArrowLeftRight,
  Trophy,
  BarChart2,
  Share2,
  Check,
  Camera,
  CloudDownload,
  ClipboardList,
  Calendar,
  Award,
  Layers,
  TrendingUp,
  Search,
  User,
  Activity,
  Flame,
  Grid,
  ChevronDown,
  Swords,
  Flag,
  Filter,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { getVal, normalizeRaceName, isSameRace, getMonthIndexFromDate } from "../../../lib/data-processing";
import { useComputedStore } from "../../../lib/stores/useComputedStore";
import { Button } from "../../ui/button";
import { useUrlState } from "../../../hooks/useUrlState";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

export interface CyclistComparacionesProps {
  files: AppState;
  cyclistMetadata?: Record<string, CyclistMetadata>;
  playerByCyclist?: Record<string, string>;
  playerTeamMap?: Record<string, string>;
  cyclistRoundMap?: Record<string, string>;
  leaderboard?: PlayerScore[];
}

const monthsFullNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const monthsShortNames = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const getMonthIndexFromDateStr = (dateStr?: string, raceName?: string): number => {
  const m = getMonthIndexFromDate(dateStr);
  if (m >= 0) return m;
  if (raceName) {
    const lower = raceName.toLowerCase();
    if (lower.includes("tour de france")) return 6; // Julio
    if (lower.includes("giro")) return 4; // Mayo
    if (lower.includes("vuelta")) return 7; // Agosto
  }
  return -1;
};

// Normalize category names and aliases (consistent with team comparison)
const normalizeCategoryName = (rawCat?: string): string => {
  if (!rawCat) return "Otras / Sin Categoría";
  const s = rawCat.trim();
  const lower = s.toLowerCase();

  if (lower === "mon" || lower === "monumento" || lower === "monumentos") return "Monumentos";
  if (lower.includes("tour de france") || lower === "tour") return "Tour de France";
  if (lower.includes("giro d'italia") || lower === "giro") return "Giro d'Italia";
  if (lower.includes("vuelta a españa") || lower === "vuelta") return "Vuelta a España";
  if (lower.includes("mundial") || lower.includes("world champ")) return "Mundiales";
  if (lower.includes("europeo") || lower.includes("european champ")) return "Europeos";
  if (lower === "uwt" || lower.includes("worldtour") || lower.includes("wt")) return "WorldTour (UWT)";
  if (lower === "pro" || lower.includes("proseries") || lower.includes(".pro") || lower.includes("1.pro") || lower.includes("2.pro")) return "ProSeries (.Pro)";
  if (lower === ".1" || lower.includes("1.1") || lower.includes("2.1")) return "Categoría .1";
  if (lower === ".2" || lower.includes("1.2") || lower.includes("2.2")) return "Categoría .2";

  return s;
};

// Strict ordering required:
// 0: Tour, 1: Giro, 2: Vuelta, 3: Mundiales, 4: Monumentos, 5: Europeos, 6: UWT, 7: Pro, 8: .1, 9: .2
const getCategoryOrderRank = (catName: string): number => {
  const norm = catName.toLowerCase().trim();
  if (norm.includes("tour") && !norm.includes("worldtour") && !norm.includes("uwt")) return 0;
  if (norm.includes("giro")) return 1;
  if (norm.includes("vuelta")) return 2;
  if (norm.includes("mundial") || norm.includes("world champ")) return 3;
  if (norm.includes("monumento") || norm.includes("monument") || norm === "mon") return 4;
  if (norm.includes("europeo") || norm.includes("european champ")) return 5;
  if (norm.includes("uwt") || norm.includes("worldtour") || norm.includes("wt")) return 6;
  if (norm.includes("pro") || norm.includes("proseries") || norm.includes(".pro")) return 7;
  if (norm.includes(".1")) return 8;
  if (norm.includes(".2")) return 9;
  return 99;
};

// Custom Tooltip for Monthly Evolution Chart
const CustomCyclistPointsTooltip = ({ active, payload, nameA, nameB }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 text-white p-3 rounded-xl shadow-lg border border-neutral-700 text-xs space-y-1.5 z-50">
        <p className="font-bold text-neutral-300 border-b border-neutral-800 pb-1">{data.monthFull}</p>
        <div className="flex items-center justify-between gap-4 text-orange-400 font-medium">
          <span>🟠 {nameA}:</span>
          <span className="font-bold">
            {data.ptsA.toLocaleString()} pts <span className="text-[10px] opacity-75">(Acum: {data.cumA.toLocaleString()})</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-purple-400 font-medium">
          <span>🟣 {nameB}:</span>
          <span className="font-bold">
            {data.ptsB.toLocaleString()} pts <span className="text-[10px] opacity-75">(Acum: {data.cumB.toLocaleString()})</span>
          </span>
        </div>
        <div className="pt-1 text-[10px] text-neutral-400 border-t border-neutral-800 font-mono">
          {data.ptsA > data.ptsB
            ? `+${(data.ptsA - data.ptsB).toLocaleString()} pts en el mes para ${nameA}`
            : data.ptsB > data.ptsA
            ? `+${(data.ptsB - data.ptsA).toLocaleString()} pts en el mes para ${nameB}`
            : "Misma puntuación en el mes"}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Multidimensional Radar Chart
const CustomRadarMetricsTooltip = ({ active, payload, nameA, nameB }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 text-white p-3.5 rounded-xl shadow-xl border border-neutral-700 text-xs space-y-1.5 z-50 min-w-[220px]">
        <p className="font-bold text-neutral-200 border-b border-neutral-800 pb-1">{data.metric}</p>
        <div className="flex items-center justify-between gap-4 text-orange-400 font-medium">
          <span>🟠 {nameA}:</span>
          <span className="font-bold font-mono">
            {data.rawA?.toLocaleString?.() ?? data.rawA} {data.unit || ""} <span className="text-[10px] opacity-70">({data.valA}%)</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-purple-400 font-medium">
          <span>🟣 {nameB}:</span>
          <span className="font-bold font-mono">
            {data.rawB?.toLocaleString?.() ?? data.rawB} {data.unit || ""} <span className="text-[10px] opacity-70">({data.valB}%)</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Reusable, homogeneous comparison header badge for section cards and captures
interface CyclistComparisonCaptureHeaderProps {
  infoA: any;
  infoB: any;
  totalPointsDiff: number;
  className?: string;
}

const CyclistComparisonCaptureHeader: React.FC<CyclistComparisonCaptureHeaderProps> = ({
  infoA,
  infoB,
  totalPointsDiff,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-neutral-200/90 p-3 mb-4 shadow-2xs overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Ciclista A (Naranja) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            {infoA.flag || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-sm sm:text-base text-neutral-900 truncate">
                {infoA.name}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded">
                A
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1.5 mt-0.5">
              <span className="font-medium">{infoA.proTeam}</span>
              <span>•</span>
              <span className="font-mono font-black text-orange-700">
                {infoA.puntos.toLocaleString()} pts
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">🏆 {infoA.victorias} vic.</span>
            </div>
          </div>
        </div>

        {/* Central VS Badge */}
        <div className="flex flex-col items-center justify-center shrink-0 px-1 sm:px-3">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-neutral-600 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full shadow-2xs">
            VS
          </span>
          <span
            className={cn(
              "text-[10px] font-mono font-bold mt-1 px-1.5 py-0.5 rounded",
              totalPointsDiff > 0
                ? "text-orange-800 bg-orange-50 border border-orange-200"
                : totalPointsDiff < 0
                ? "text-purple-800 bg-purple-50 border border-purple-200"
                : "text-neutral-600 bg-neutral-100"
            )}
          >
            {totalPointsDiff > 0
              ? `+${totalPointsDiff.toLocaleString()} A`
              : totalPointsDiff < 0
              ? `+${Math.abs(totalPointsDiff).toLocaleString()} B`
              : "Empate"}
          </span>
        </div>

        {/* Ciclista B (Morado) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end text-right">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 justify-end flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                B
              </span>
              <span className="font-black text-sm sm:text-base text-neutral-900 truncate">
                {infoB.name}
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 truncate flex items-center justify-end gap-1.5 mt-0.5">
              <span className="hidden sm:inline">🏆 {infoB.victorias} vic.</span>
              <span className="hidden sm:inline">•</span>
              <span className="font-mono font-black text-purple-700">
                {infoB.puntos.toLocaleString()} pts
              </span>
              <span>•</span>
              <span className="font-medium">{infoB.proTeam}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            {infoB.flag || "B"}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CyclistComparaciones: React.FC<CyclistComparacionesProps> = ({
  files,
  cyclistMetadata = {},
  playerByCyclist = {},
  playerTeamMap = {},
  cyclistRoundMap = {},
  leaderboard = [],
}) => {
  // Pre-calculate race category map
  const raceToCatMap = useMemo(() => {
    const map: Record<string, string> = {};
    const processRow = (r: any) => {
      const c = getVal(r, "Carrera")?.toString().trim();
      const cat = getVal(r, "Categoría")?.toString().trim();
      if (c && cat) {
        const norm = normalizeCategoryName(cat);
        map[c] = norm;
        map[c.toLowerCase()] = norm;
      }
    };
    files?.carreras?.data?.forEach(processRow);
    files?.puntos?.data?.forEach(processRow);
    return map;
  }, [files?.carreras?.data, files?.puntos?.data]);

  const assignedPointsLog = useComputedStore((s) => s.assignedPointsLog);

  // Map original row index to officially assigned points
  const pointsByRowIndex = useMemo(() => {
    const map = new Map<number, number>();
    if (Array.isArray(assignedPointsLog)) {
      assignedPointsLog.forEach((item) => {
        if (item.originalIndex !== undefined && item.puntos !== undefined) {
          map.set(item.originalIndex, item.puntos);
        }
      });
    }
    return map;
  }, [assignedPointsLog]);

  // Points lookup key with both raw and normalized category aliases
  const pointsLookup = useMemo(() => {
    const map: Record<string, number> = {};
    files?.puntos?.data?.forEach((row: any) => {
      const cat = getVal(row, "Categoría")?.toString().trim();
      const tip = getVal(row, "Tipo")?.toString().trim();
      const pos = getVal(row, "Posición")?.toString().trim();
      const pt = getVal(row, "Puntos");
      if (cat && tip && pos && pt !== undefined) {
        const numPt = Number(pt);
        map[`${cat}_${tip}_${pos}`] = numPt;
        map[`${normalizeCategoryName(cat)}_${tip}_${pos}`] = numPt;
      }
    });
    return map;
  }, [files?.puntos?.data]);

  // Compute all scores per cyclist across files.resultados
  const cyclistResultsMap = useMemo(() => {
    const map: Record<
      string,
      {
        carrera: string;
        categoria: string;
        fecha: string;
        tipo: string;
        etapa: string;
        posicion: string;
        puntos: number;
      }[]
    > = {};

    files?.resultados?.data?.forEach((r: any, idx: number) => {
      const ciclista = getVal(r, "Ciclista")?.toString().trim();
      if (!ciclista) return;

      const carrera = getVal(r, "Carrera")?.toString().trim() || "";
      const rawCat = getVal(r, "Categoría")?.toString().trim() || raceToCatMap[carrera] || "";
      const categoria = normalizeCategoryName(rawCat);
      const fecha = getVal(r, "Fecha")?.toString().trim() || "";
      const tipo = getVal(r, "Tipo")?.toString().trim() || "";
      const etapa = getVal(r, "Etapa")?.toString().trim() || "";
      const posicion = getVal(r, "Posición")?.toString().trim() || getVal(r, "Pos")?.toString().trim() || "";

      let puntos = 0;
      if (pointsByRowIndex.has(idx)) {
        puntos = pointsByRowIndex.get(idx)!;
      } else {
        const pointsKey = `${categoria}_${tipo}_${posicion}`;
        puntos = pointsLookup[pointsKey] || pointsLookup[`${rawCat}_${tipo}_${posicion}`] || 0;
      }

      if (!map[ciclista]) map[ciclista] = [];
      map[ciclista].push({ carrera, categoria, fecha, tipo, etapa, posicion, puntos });
    });

    return map;
  }, [files?.resultados?.data, raceToCatMap, pointsLookup, pointsByRowIndex]);

  // List of all cyclists with statistics, sorted by total points descending
  const availableCyclists = useMemo(() => {
    const namesSet = new Set<string>();

    Object.keys(cyclistMetadata).forEach((c) => namesSet.add(c));
    Object.keys(cyclistResultsMap).forEach((c) => namesSet.add(c));
    files?.ciclistas?.data?.forEach((r: any) => {
      const c = getVal(r, "Ciclista")?.toString().trim() || getVal(r, "Nombre")?.toString().trim();
      if (c) namesSet.add(c);
    });

    const list = Array.from(namesSet).map((name) => {
      const meta = cyclistMetadata[name];
      const results = cyclistResultsMap[name] || [];
      const computedTotalPts = results.reduce((sum, r) => sum + r.puntos, 0);
      const totalPts = meta?.puntosTotales !== undefined ? meta.puntosTotales : computedTotalPts;

      const jugador = playerByCyclist[name] || "No draft";
      const fantasyTeam = jugador !== "No draft" ? playerTeamMap[jugador] || jugador : "Sin equipo";
      const proTeam = meta?.equipoBreve || "-";
      const flag = meta?.pais || "";
      const victorias = meta?.victorias || results.filter((r) => r.posicion === "1").length;
      const carreras = meta?.carrerasDisputadas || new Set(results.map((r) => r.carrera)).size;
      const dias = meta?.diasCompeticion || results.length;
      const ronda = cyclistRoundMap[name] || "-";

      return {
        name,
        puntos: totalPts,
        victorias,
        carreras,
        dias,
        proTeam,
        fantasyTeam,
        jugador,
        flag,
        ronda,
        nacido: meta?.nacido || "",
        foto: meta?.foto || "",
      };
    });

    return list.sort((a, b) => b.puntos - a.puntos || a.name.localeCompare(b.name));
  }, [cyclistMetadata, cyclistResultsMap, files?.ciclistas?.data, playerByCyclist, playerTeamMap, cyclistRoundMap]);

  // URL state for sharing comparison links
  const [compCyclistA, setCompCyclistA] = useUrlState<string>("compCyclistA", "");
  const [compCyclistB, setCompCyclistB] = useUrlState<string>("compCyclistB", "");
  const [activeViewMode, setActiveViewMode] = useUrlState<"all" | "kpis" | "radar" | "meses" | "categorias" | "carreras">("cyclistCompView", "all");

  // Fallback defaults to top 2 cyclists in the league
  const cyclistA = useMemo(() => {
    if (compCyclistA && availableCyclists.some((c) => c.name === compCyclistA)) {
      return compCyclistA;
    }
    return availableCyclists[0]?.name || "";
  }, [compCyclistA, availableCyclists]);

  const cyclistB = useMemo(() => {
    if (compCyclistB && availableCyclists.some((c) => c.name === compCyclistB) && compCyclistB !== cyclistA) {
      return compCyclistB;
    }
    const defaultB = availableCyclists.find((c) => c.name !== cyclistA)?.name || availableCyclists[1]?.name || "";
    return defaultB;
  }, [compCyclistB, cyclistA, availableCyclists]);

  const infoA = useMemo(() => availableCyclists.find((c) => c.name === cyclistA), [availableCyclists, cyclistA]);
  const infoB = useMemo(() => availableCyclists.find((c) => c.name === cyclistB), [availableCyclists, cyclistB]);

  // Dropdown states for searchable selects
  const [searchQueryA, setSearchQueryA] = useState("");
  const [isDropdownAOpen, setIsDropdownAOpen] = useState(false);
  const [searchQueryB, setSearchQueryB] = useState("");
  const [isDropdownBOpen, setIsDropdownBOpen] = useState(false);

  const filteredCyclistsA = useMemo(() => {
    if (!searchQueryA.trim()) return availableCyclists.slice(0, 50);
    const q = searchQueryA.toLowerCase();
    return availableCyclists.filter((c) => c.name.toLowerCase().includes(q) || c.proTeam.toLowerCase().includes(q) || c.fantasyTeam.toLowerCase().includes(q)).slice(0, 50);
  }, [availableCyclists, searchQueryA]);

  const filteredCyclistsB = useMemo(() => {
    if (!searchQueryB.trim()) return availableCyclists.slice(0, 50);
    const q = searchQueryB.toLowerCase();
    return availableCyclists.filter((c) => c.name.toLowerCase().includes(q) || c.proTeam.toLowerCase().includes(q) || c.fantasyTeam.toLowerCase().includes(q)).slice(0, 50);
  }, [availableCyclists, searchQueryB]);

  // Screenshot and expansion state
  const comparisonContainerRef = useRef<HTMLDivElement>(null);
  const { handleCopyImage, handleDownloadImage, isCopying } = useTableScreenshot(comparisonContainerRef);

  const [isExpandedRadar, setIsExpandedRadar] = useState(false);
  const [isExpandedMonths, setIsExpandedMonths] = useState(false);
  const [isExpandedCategory, setIsExpandedCategory] = useState(false);
  const [isExpandedRaces, setIsExpandedRaces] = useState(false);
  const [raceFilter, setRaceFilter] = useState<"all" | "together" | "points">("all");

  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isTextCopied, setIsTextCopied] = useState(false);

  // Swap cyclists
  const handleSwap = () => {
    const nextA = cyclistB;
    const nextB = cyclistA;
    setCompCyclistA(nextA);
    setCompCyclistB(nextB);
  };

  // Share direct URL link
  const handleShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("cyclistsSubTab", "comparaciones");
    if (cyclistA) url.searchParams.set("compCyclistA", cyclistA);
    if (cyclistB) url.searchParams.set("compCyclistB", cyclistB);
    url.searchParams.set("cyclistCompView", activeViewMode);

    navigator.clipboard.writeText(url.toString());
    setIsLinkCopied(true);
    toast.success("Enlace de comparativa copiado", {
      description: `Se ha generado el enlace directo: ${cyclistA} vs ${cyclistB}`,
    });
    setTimeout(() => setIsLinkCopied(false), 2500);
  };

  // Results for Cyclist A and B
  const resultsA = useMemo(() => cyclistResultsMap[cyclistA] || [], [cyclistResultsMap, cyclistA]);
  const resultsB = useMemo(() => cyclistResultsMap[cyclistB] || [], [cyclistResultsMap, cyclistB]);

  // Monthly points breakdown
  const monthlyData = useMemo(() => {
    const ptsA_Months = new Array(12).fill(0);
    const ptsB_Months = new Array(12).fill(0);

    resultsA.forEach((r) => {
      const mIdx = getMonthIndexFromDateStr(r.fecha, r.carrera);
      if (mIdx >= 0 && mIdx < 12) {
        ptsA_Months[mIdx] += r.puntos;
      }
    });

    resultsB.forEach((r) => {
      const mIdx = getMonthIndexFromDateStr(r.fecha, r.carrera);
      if (mIdx >= 0 && mIdx < 12) {
        ptsB_Months[mIdx] += r.puntos;
      }
    });

    let maxMonthWithPoints = 0;
    for (let m = 0; m < 12; m++) {
      if (ptsA_Months[m] > 0 || ptsB_Months[m] > 0) {
        maxMonthWithPoints = m;
      }
    }

    // Cycling season runs from January (0) to October (9).
    // Cap at month 9 (October) so November (10) and December (11) never display unless there are actual races in those months.
    const currentMonth = new Date().getMonth();
    const endMonthIdx = Math.min(Math.max(maxMonthWithPoints, Math.min(currentMonth, 9)), 9);

    let cumA = 0;
    let cumB = 0;
    const chartData = [];

    for (let m = 0; m <= endMonthIdx; m++) {
      cumA += ptsA_Months[m];
      cumB += ptsB_Months[m];

      chartData.push({
        monthIndex: m,
        month: monthsShortNames[m],
        monthFull: monthsFullNames[m],
        ptsA: ptsA_Months[m],
        ptsB: ptsB_Months[m],
        diffMonth: ptsA_Months[m] - ptsB_Months[m],
        cumA,
        cumB,
        diffCum: cumA - cumB,
        winner: ptsA_Months[m] > ptsB_Months[m] ? "A" : ptsB_Months[m] > ptsA_Months[m] ? "B" : "TIE",
      });
    }

    return chartData;
  }, [resultsA, resultsB]);

  // Race Category Comparison
  const categoryData = useMemo(() => {
    const catsMap: Record<string, { cat: string; ptsA: number; ptsB: number; racesCountA: number; racesCountB: number }> = {};

    resultsA.forEach((r) => {
      const cat = r.categoria || "Otras";
      if (!catsMap[cat]) catsMap[cat] = { cat, ptsA: 0, ptsB: 0, racesCountA: 0, racesCountB: 0 };
      catsMap[cat].ptsA += r.puntos;
      catsMap[cat].racesCountA++;
    });

    resultsB.forEach((r) => {
      const cat = r.categoria || "Otras";
      if (!catsMap[cat]) catsMap[cat] = { cat, ptsA: 0, ptsB: 0, racesCountA: 0, racesCountB: 0 };
      catsMap[cat].ptsB += r.puntos;
      catsMap[cat].racesCountB++;
    });

    const list = Object.values(catsMap).filter((item) => item.ptsA > 0 || item.ptsB > 0);

    return list.sort((a, b) => {
      const rankA = getCategoryOrderRank(a.cat);
      const rankB = getCategoryOrderRank(b.cat);
      if (rankA !== rankB) return rankA - rankB;
      return (b.ptsA + b.ptsB) - (a.ptsA + a.ptsB);
    });
  }, [resultsA, resultsB]);

  // Head-to-Head Common / All Races Breakdown
  const raceBreakdown = useMemo(() => {
    const raceMap: Record<
      string,
      {
        carrera: string;
        categoria: string;
        fecha: string;
        ptsA: number;
        ptsB: number;
        bestPosA: string;
        bestPosB: string;
        ranA: boolean;
        ranB: boolean;
      }
    > = {};

    resultsA.forEach((r) => {
      const c = r.carrera?.trim();
      if (!c) return;
      const key = normalizeRaceName(c) || c.toLowerCase();
      if (!raceMap[key]) {
        raceMap[key] = {
          carrera: c,
          categoria: r.categoria,
          fecha: r.fecha,
          ptsA: 0,
          ptsB: 0,
          bestPosA: "-",
          bestPosB: "-",
          ranA: true,
          ranB: false,
        };
      }
      raceMap[key].ranA = true;
      raceMap[key].ptsA += r.puntos;
      if (r.fecha && !raceMap[key].fecha) raceMap[key].fecha = r.fecha;
      if (r.categoria && (!raceMap[key].categoria || raceMap[key].categoria === "Otras / Sin Categoría")) {
        raceMap[key].categoria = r.categoria;
      }
      if (r.posicion) {
        const numPos = parseInt(r.posicion, 10);
        const currNum = parseInt(raceMap[key].bestPosA, 10);
        if (!isNaN(numPos) && (isNaN(currNum) || numPos < currNum)) {
          raceMap[key].bestPosA = r.posicion;
        } else if (raceMap[key].bestPosA === "-") {
          raceMap[key].bestPosA = r.posicion;
        }
      }
    });

    resultsB.forEach((r) => {
      const c = r.carrera?.trim();
      if (!c) return;
      const key = normalizeRaceName(c) || c.toLowerCase();
      if (!raceMap[key]) {
        raceMap[key] = {
          carrera: c,
          categoria: r.categoria,
          fecha: r.fecha,
          ptsA: 0,
          ptsB: 0,
          bestPosA: "-",
          bestPosB: "-",
          ranA: false,
          ranB: true,
        };
      }
      raceMap[key].ranB = true;
      raceMap[key].ptsB += r.puntos;
      if (r.fecha && !raceMap[key].fecha) raceMap[key].fecha = r.fecha;
      if (r.categoria && (!raceMap[key].categoria || raceMap[key].categoria === "Otras / Sin Categoría")) {
        raceMap[key].categoria = r.categoria;
      }
      if (r.posicion) {
        const numPos = parseInt(r.posicion, 10);
        const currNum = parseInt(raceMap[key].bestPosB, 10);
        if (!isNaN(numPos) && (isNaN(currNum) || numPos < currNum)) {
          raceMap[key].bestPosB = r.posicion;
        } else if (raceMap[key].bestPosB === "-") {
          raceMap[key].bestPosB = r.posicion;
        }
      }
    });

    // Also check files.startlist if available
    if (files?.startlist?.data) {
      const slList = Array.isArray(files.startlist.data) ? files.startlist.data : [files.startlist.data];
      slList.forEach((sl: any) => {
        const c = sl?.carrera?.trim();
        if (!c) return;
        const key = normalizeRaceName(c) || c.toLowerCase();

        let inSlA = false;
        let inSlB = false;

        if (Array.isArray(sl.resultados)) {
          sl.resultados.forEach((res: any) => {
            if (Array.isArray(res.ciclistas)) {
              res.ciclistas.forEach((cyclistObj: any) => {
                const name = typeof cyclistObj === "string" ? cyclistObj : cyclistObj?.nombre;
                if (name === cyclistA) inSlA = true;
                if (name === cyclistB) inSlB = true;
              });
            }
          });
        }
        if (sl.rawText && typeof sl.rawText === "string") {
          if (sl.rawText.includes(cyclistA)) inSlA = true;
          if (sl.rawText.includes(cyclistB)) inSlB = true;
        }

        if (inSlA || inSlB) {
          if (!raceMap[key]) {
            raceMap[key] = {
              carrera: c,
              categoria: raceToCatMap[c] || "Otras",
              fecha: "",
              ptsA: 0,
              ptsB: 0,
              bestPosA: "-",
              bestPosB: "-",
              ranA: inSlA,
              ranB: inSlB,
            };
          } else {
            if (inSlA) raceMap[key].ranA = true;
            if (inSlB) raceMap[key].ranB = true;
          }
        }
      });
    }

    const sorted = Object.values(raceMap).sort((a, b) => {
      if (a.fecha && b.fecha) return a.fecha.localeCompare(b.fecha);
      return (b.ptsA + b.ptsB) - (a.ptsA + a.ptsB);
    });

    let cumulativeDiff = 0;
    return sorted.map((item) => {
      const diff = item.ptsA - item.ptsB;
      cumulativeDiff += diff;
      const ranTogether = item.ranA && item.ranB;
      return {
        ...item,
        diff,
        cumulativeDiff,
        ranTogether,
        winner: diff > 0 ? "A" : diff < 0 ? "B" : "TIE",
      };
    });
  }, [resultsA, resultsB, files?.startlist?.data, cyclistA, cyclistB, raceToCatMap]);

  // Head-to-Head Duelos Stats
  const duelosStats = useMemo(() => {
    const racesTogether = raceBreakdown.filter((r) => r.ranTogether);
    const totalJuntos = racesTogether.length;
    const neitherScored = racesTogether.filter((r) => r.ptsA === 0 && r.ptsB === 0);
    const scoredRaces = racesTogether.filter((r) => r.ptsA > 0 || r.ptsB > 0);
    const winsA = racesTogether.filter((r) => r.ptsA > r.ptsB).length;
    const winsB = racesTogether.filter((r) => r.ptsB > r.ptsA).length;
    const tiesWithPoints = racesTogether.filter((r) => r.ptsA === r.ptsB && r.ptsA > 0).length;

    return {
      totalJuntos,
      racesTogether,
      neitherScoredCount: neitherScored.length,
      scoredCount: scoredRaces.length,
      winsA,
      winsB,
      tiesWithPoints,
      onlyRanA: raceBreakdown.filter((r) => r.ranA && !r.ranB).length,
      onlyRanB: raceBreakdown.filter((r) => !r.ranA && r.ranB).length,
    };
  }, [raceBreakdown]);

  // Multidimensional Radar Metrics
  const radarMetricsData = useMemo(() => {
    if (!infoA || !infoB) return [];

    const gtCats = ["Tour de France", "Giro d'Italia", "Vuelta a España"];
    const ptsGtA = resultsA.filter((r) => gtCats.includes(r.categoria)).reduce((s, r) => s + r.puntos, 0);
    const ptsGtB = resultsB.filter((r) => gtCats.includes(r.categoria)).reduce((s, r) => s + r.puntos, 0);

    const classicsCats = ["Monumentos", "Mundiales", "Europeos", "WorldTour (UWT)"];
    const ptsClassicsA = resultsA.filter((r) => classicsCats.includes(r.categoria)).reduce((s, r) => s + r.puntos, 0);
    const ptsClassicsB = resultsB.filter((r) => classicsCats.includes(r.categoria)).reduce((s, r) => s + r.puntos, 0);

    const ppcA = infoA.carreras > 0 ? Math.round((infoA.puntos / infoA.carreras) * 10) / 10 : 0;
    const ppcB = infoB.carreras > 0 ? Math.round((infoB.puntos / infoB.carreras) * 10) / 10 : 0;

    const ppdA = infoA.dias > 0 ? Math.round((infoA.puntos / infoA.dias) * 10) / 10 : 0;
    const ppdB = infoB.dias > 0 ? Math.round((infoB.puntos / infoB.dias) * 10) / 10 : 0;

    const metrics = [
      { metric: "Puntos Totales", rawA: infoA.puntos, rawB: infoB.puntos, unit: "pts" },
      { metric: "Victorias", rawA: infoA.victorias, rawB: infoB.victorias, unit: "victorias" },
      { metric: "Carreras Disputadas", rawA: infoA.carreras, rawB: infoB.carreras, unit: "carreras" },
      { metric: "Días Competición", rawA: infoA.dias, rawB: infoB.dias, unit: "días" },
      { metric: "Puntos / Carrera", rawA: ppcA, rawB: ppcB, unit: "pts/carrera" },
      { metric: "Puntos / Día", rawA: ppdA, rawB: ppdB, unit: "pts/día" },
      { metric: "Grandes Vueltas", rawA: ptsGtA, rawB: ptsGtB, unit: "pts" },
      { metric: "Clásicas / WT", rawA: ptsClassicsA, rawB: ptsClassicsB, unit: "pts" },
    ];

    return metrics.map((m) => {
      const maxVal = Math.max(m.rawA, m.rawB, 1);
      const valA = Math.round((m.rawA / maxVal) * 100);
      const valB = Math.round((m.rawB / maxVal) * 100);
      return {
        metric: m.metric,
        rawA: m.rawA,
        rawB: m.rawB,
        valA,
        valB,
        unit: m.unit,
      };
    });
  }, [infoA, infoB, resultsA, resultsB]);

  // Plain-text summary for clipboard
  const handleCopyText = () => {
    if (!infoA || !infoB) return;
    let text = `⚔️ COMPARATIVA DE CICLISTAS ⚔️\n`;
    text += `🟠 ${infoA.name} (${infoA.proTeam}): ${infoA.puntos} pts | ${infoA.victorias} vic | ${infoA.carreras} carreras\n`;
    text += `🟣 ${infoB.name} (${infoB.proTeam}): ${infoB.puntos} pts | ${infoB.victorias} vic | ${infoB.carreras} carreras\n`;
    const diff = (infoA.puntos || 0) - (infoB.puntos || 0);
    text += `Diferencia: ${diff > 0 ? `+${diff} pts (${infoA.name})` : diff < 0 ? `+${Math.abs(diff)} pts (${infoB.name})` : "Empate"}\n\n`;
    text += `Duelos directos (carreras juntos): ${duelosStats.totalJuntos}\n`;
    text += `• ${infoA.name} > ${infoB.name}: ${duelosStats.winsA} carreras\n`;
    text += `• ${infoB.name} > ${infoA.name}: ${duelosStats.winsB} carreras\n`;
    text += `• Sin puntuar ninguno: ${duelosStats.neitherScoredCount} carreras\n`;
    if (duelosStats.tiesWithPoints > 0) {
      text += `• Empate con puntos: ${duelosStats.tiesWithPoints} carreras\n`;
    }
    text += `\nEvolución Mensual:\n`;
    monthlyData.forEach((m) => {
      text += `• ${m.month}: ${infoA.name} ${m.ptsA}p vs ${infoB.name} ${m.ptsB}p => Dif: ${m.diffMonth > 0 ? `+${m.diffMonth} A` : m.diffMonth < 0 ? `+${Math.abs(m.diffMonth)} B` : "0"}\n`;
    });

    navigator.clipboard.writeText(text);
    setIsTextCopied(true);
    toast.success("Resumen de comparativa copiado");
    setTimeout(() => setIsTextCopied(false), 2500);
  };

  const totalPointsDiff = (infoA?.puntos || 0) - (infoB?.puntos || 0);

  const showKPIs = activeViewMode === "all" || activeViewMode === "kpis";
  const showRadar = activeViewMode === "all" || activeViewMode === "radar";
  const showMeses = activeViewMode === "all" || activeViewMode === "meses";
  const showCategorias = activeViewMode === "all" || activeViewMode === "categorias";
  const showCarreras = activeViewMode === "all" || activeViewMode === "carreras";

  return (
    <div className="space-y-6">
      {/* Top Header Card & Selector Controls */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-neutral-900 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-orange-600" />
              Comparativa Cara a Cara de Ciclistas
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Enfrenta a dos ciclistas para analizar su rendimiento, desglose mensual, categorías de carrera y duelo directo.
            </p>
          </div>
        </div>

        {/* Cyclist Selection Row */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Cyclist A Picker (Orange Theme) */}
          <div className="flex-1 w-full relative">
            <label className="text-xs font-bold text-orange-700 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
              <span>🟠 Ciclista 1 (A)</span>
              {infoA && <span className="font-mono text-orange-900 font-bold">{infoA.puntos.toLocaleString()} pts</span>}
            </label>
            <div className="relative">
              <div
                onClick={() => setIsDropdownAOpen(!isDropdownAOpen)}
                className="w-full bg-orange-50/60 border border-orange-200 rounded-xl px-4 py-2.5 text-sm font-bold text-orange-950 flex items-center justify-between cursor-pointer hover:bg-orange-100/50 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{infoA?.flag || "🚴"}</span>
                  <span className="truncate">{cyclistA || "Seleccionar ciclista"}</span>
                  <span className="text-xs text-orange-700 font-normal opacity-80">({infoA?.proTeam || "-"})</span>
                </div>
                <ChevronDown className="w-4 h-4 text-orange-600 shrink-0" />
              </div>

              {isDropdownAOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-2 space-y-1.5 max-h-72 overflow-hidden flex flex-col">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar ciclista A..."
                      value={searchQueryA}
                      onChange={(e) => setSearchQueryA(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto space-y-0.5 flex-1 max-h-56">
                    {filteredCyclistsA.map((c) => (
                      <div
                        key={c.name}
                        onClick={() => {
                          setCompCyclistA(c.name);
                          setIsDropdownAOpen(false);
                          setSearchQueryA("");
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors",
                          c.name === cyclistA ? "bg-orange-100 text-orange-950 font-bold" : "hover:bg-neutral-100 text-neutral-800",
                          c.name === cyclistB && "opacity-40 pointer-events-none"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{c.flag || "🚴"}</span>
                          <span className="truncate">{c.name}</span>
                          <span className="text-[10px] text-neutral-400">({c.proTeam})</span>
                        </div>
                        <span className="font-mono text-neutral-600 font-bold shrink-0">{c.puntos} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <Button
            variant="outline"
            onClick={handleSwap}
            className="self-center p-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-transform active:scale-95 shadow-xs mt-2 md:mt-5"
            title="Intercambiar Ciclistas A <-> B"
          >
            <ArrowLeftRight className="w-5 h-5 text-neutral-700" />
          </Button>

          {/* Cyclist B Picker (Purple Theme) */}
          <div className="flex-1 w-full relative">
            <label className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
              <span>🟣 Ciclista 2 (B)</span>
              {infoB && <span className="font-mono text-purple-900 font-bold">{infoB.puntos.toLocaleString()} pts</span>}
            </label>
            <div className="relative">
              <div
                onClick={() => setIsDropdownBOpen(!isDropdownBOpen)}
                className="w-full bg-purple-50/60 border border-purple-200 rounded-xl px-4 py-2.5 text-sm font-bold text-purple-950 flex items-center justify-between cursor-pointer hover:bg-purple-100/50 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{infoB?.flag || "🚴"}</span>
                  <span className="truncate">{cyclistB || "Seleccionar ciclista"}</span>
                  <span className="text-xs text-purple-700 font-normal opacity-80">({infoB?.proTeam || "-"})</span>
                </div>
                <ChevronDown className="w-4 h-4 text-purple-600 shrink-0" />
              </div>

              {isDropdownBOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-2 space-y-1.5 max-h-72 overflow-hidden flex flex-col">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar ciclista B..."
                      value={searchQueryB}
                      onChange={(e) => setSearchQueryB(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto space-y-0.5 flex-1 max-h-56">
                    {filteredCyclistsB.map((c) => (
                      <div
                        key={c.name}
                        onClick={() => {
                          setCompCyclistB(c.name);
                          setIsDropdownBOpen(false);
                          setSearchQueryB("");
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors",
                          c.name === cyclistB ? "bg-purple-100 text-purple-950 font-bold" : "hover:bg-neutral-100 text-neutral-800",
                          c.name === cyclistA && "opacity-40 pointer-events-none"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{c.flag || "🚴"}</span>
                          <span className="truncate">{c.name}</span>
                          <span className="text-[10px] text-neutral-400">({c.proTeam})</span>
                        </div>
                        <span className="font-mono text-neutral-600 font-bold shrink-0">{c.puntos} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleCopyImage()}
              disabled={isCopying}
              className="flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs"
            >
              {isCopying ? <Check className="w-4 h-4 text-green-400" /> : <Camera className="w-4 h-4" />}
              <span>{isCopying ? "Copiando..." : "Copiar Imagen"}</span>
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                handleDownloadImage({
                  fileName: `comparativa-ciclistas-${cyclistA.replace(/\s+/g, "-").toLowerCase()}-vs-${cyclistB.replace(/\s+/g, "-").toLowerCase()}.png`,
                })
              }
              className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl px-4 py-2 text-xs font-medium transition-colors"
            >
              <CloudDownload className="w-4 h-4" />
              <span>Descargar Imagen</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleCopyText}
              className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl px-4 py-2 text-xs font-medium transition-colors"
            >
              {isTextCopied ? <Check className="w-4 h-4 text-green-600" /> : <ClipboardList className="w-4 h-4" />}
              <span>{isTextCopied ? "Texto copiado" : "Copiar Texto"}</span>
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleShareLink}
            className="flex items-center gap-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-xl px-4 py-2 text-xs font-bold transition-colors w-full sm:w-auto justify-center"
          >
            {isLinkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-orange-600" />}
            <span>{isLinkCopied ? "Enlace copiado" : "Compartir Enlace Comparativa"}</span>
          </Button>
        </div>

        {/* Segmented Section View Switcher */}
        <div className="pt-3 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveViewMode("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeViewMode === "all" ? "bg-neutral-900 text-white shadow-xs" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Ver Todo</span>
          </button>

          <button
            onClick={() => setActiveViewMode("kpis")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeViewMode === "kpis" ? "bg-orange-600 text-white shadow-xs" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Resumen KPIs</span>
          </button>

          <button
            onClick={() => setActiveViewMode("radar")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeViewMode === "radar" ? "bg-amber-600 text-white shadow-xs" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Radar Métricas</span>
          </button>

          <button
            onClick={() => setActiveViewMode("meses")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeViewMode === "meses" ? "bg-purple-600 text-white shadow-xs" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Evolución Mensual</span>
          </button>

          <button
            onClick={() => setActiveViewMode("categorias")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeViewMode === "categorias" ? "bg-emerald-600 text-white shadow-xs" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Por Categorías</span>
          </button>

          <button
            onClick={() => setActiveViewMode("carreras")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeViewMode === "carreras" ? "bg-blue-600 text-white shadow-xs" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Duelo por Carreras</span>
          </button>
        </div>
      </div>

      {infoA && infoB && (
        <div ref={comparisonContainerRef} className="space-y-6 bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 shadow-xs">
          {/* Header Banner with compared cyclists for screenshots */}
          <CyclistComparisonCaptureHeader infoA={infoA} infoB={infoB} totalPointsDiff={totalPointsDiff} />

          {/* Head-to-Head Comparison Summary Cards */}
          {showKPIs && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cyclist A Card (Orange Theme) */}
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-3 top-3 opacity-10">
                  <User className="w-24 h-24" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-400/30 px-2 py-0.5 rounded text-orange-100 inline-block">
                      Ciclista A
                    </span>
                    <span className="text-sm">{infoA.flag}</span>
                  </div>
                  <h3 className="text-xl font-black truncate">{infoA.name}</h3>
                  <div className="text-xs text-orange-100 mt-0.5 space-x-1.5">
                    <span className="font-semibold">{infoA.proTeam}</span>
                    <span>•</span>
                    <span className="opacity-90">{infoA.fantasyTeam}</span>
                    {infoA.ronda !== "-" && <span className="opacity-80">({infoA.ronda})</span>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-orange-400/30 flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-black">{infoA.puntos.toLocaleString()}</span>
                    <span className="text-xs text-orange-200 ml-1 font-bold">pts</span>
                  </div>
                  <div className="text-right text-[11px] font-bold space-y-0.5">
                    <div className="bg-orange-800/60 px-2.5 py-0.5 rounded">
                      🏆 {infoA.victorias} vic.
                    </div>
                    <div className="text-orange-200 text-[10px]">
                      {infoA.carreras} carreras • {infoA.dias} días
                    </div>
                  </div>
                </div>
              </div>

              {/* VS Status Indicator */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-between text-center">
                <div className="w-full">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1 block">
                    Diferencia Total
                  </span>
                  <div
                    className={cn(
                      "text-3xl font-black font-mono tracking-tight my-1",
                      totalPointsDiff > 0 ? "text-orange-600" : totalPointsDiff < 0 ? "text-purple-600" : "text-neutral-700"
                    )}
                  >
                    {totalPointsDiff > 0
                      ? `+${totalPointsDiff.toLocaleString()} A`
                      : totalPointsDiff < 0
                      ? `+${Math.abs(totalPointsDiff).toLocaleString()} B`
                      : "Empate"}
                  </div>
                  <p className="text-xs font-medium text-neutral-500 mt-0.5">
                    {totalPointsDiff > 0 ? (
                      <span className="text-orange-700 font-bold">Ventaja para {infoA.name}</span>
                    ) : totalPointsDiff < 0 ? (
                      <span className="text-purple-700 font-bold">Ventaja para {infoB.name}</span>
                    ) : (
                      "Misma puntuación de temporada"
                    )}
                  </p>
                </div>

                {/* Duelos Carrera - Detailed Breakdown requested by user */}
                <div className="mt-4 pt-3 border-t border-neutral-100 w-full space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs px-0.5">
                    <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Duelos carrera:</span>
                    </span>
                    <span className="font-extrabold font-mono text-blue-900 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full text-[11px]">
                      {duelosStats.totalJuntos} {duelosStats.totalJuntos === 1 ? "carrera juntos" : "carreras juntos"}
                    </span>
                  </div>

                  {duelosStats.totalJuntos > 0 ? (
                    <div className="space-y-1.5">
                      {/* Carreras puntuadas: nº de veces que A sacó más puntos que B o al revés */}
                      <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-200/80 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-0.5 flex items-center justify-between">
                          <span>Puntuaron ({duelosStats.scoredCount} {duelosStats.scoredCount === 1 ? "carrera" : "carreras"}):</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div
                            className={cn(
                              "flex items-center justify-between px-2 py-1.5 rounded-lg border shadow-2xs",
                              duelosStats.winsA > duelosStats.winsB
                                ? "bg-orange-50 border-orange-300 text-orange-950 font-bold"
                                : "bg-white border-neutral-200 text-neutral-700 font-medium"
                            )}
                            title={`Veces que ${infoA.name} ha sacado más puntos que ${infoB.name}`}
                          >
                            <span className="text-[11px] truncate">
                              🟠 {infoA.name.split(" ")[0]} &gt; {infoB.name.split(" ")[0]}
                            </span>
                            <span className="font-mono font-black text-orange-700 ml-1 shrink-0 text-xs">
                              {duelosStats.winsA} {duelosStats.winsA === 1 ? "vez" : "veces"}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "flex items-center justify-between px-2 py-1.5 rounded-lg border shadow-2xs",
                              duelosStats.winsB > duelosStats.winsA
                                ? "bg-purple-50 border-purple-300 text-purple-950 font-bold"
                                : "bg-white border-neutral-200 text-neutral-700 font-medium"
                            )}
                            title={`Veces que ${infoB.name} ha sacado más puntos que ${infoA.name}`}
                          >
                            <span className="text-[11px] truncate">
                              🟣 {infoB.name.split(" ")[0]} &gt; {infoA.name.split(" ")[0]}
                            </span>
                            <span className="font-mono font-black text-purple-700 ml-1 shrink-0 text-xs">
                              {duelosStats.winsB} {duelosStats.winsB === 1 ? "vez" : "veces"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sin puntuar ninguno */}
                      <div className="bg-neutral-50/80 rounded-lg px-2.5 py-1.5 border border-neutral-200 flex items-center justify-between text-[11px] text-neutral-600">
                        <span className="font-medium">Sin puntuar ninguno:</span>
                        <span className="font-mono font-bold text-neutral-800">
                          {duelosStats.neitherScoredCount} {duelosStats.neitherScoredCount === 1 ? "carrera" : "carreras"}
                        </span>
                      </div>

                      {duelosStats.tiesWithPoints > 0 && (
                        <div className="bg-neutral-50/80 rounded-lg px-2.5 py-1.5 border border-neutral-200 flex items-center justify-between text-[11px] text-neutral-600">
                          <span className="font-medium">Empate con puntos:</span>
                          <span className="font-mono font-bold text-neutral-800">
                            {duelosStats.tiesWithPoints} {duelosStats.tiesWithPoints === 1 ? "carrera" : "carreras"}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-neutral-400 bg-neutral-50 px-2.5 py-2 rounded-xl border border-neutral-200 text-center">
                      No han competido en la misma carrera esta temporada
                    </div>
                  )}
                </div>
              </div>

              {/* Cyclist B Card (Purple Theme) */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-3 top-3 opacity-10">
                  <User className="w-24 h-24" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-400/30 px-2 py-0.5 rounded text-purple-100 inline-block">
                      Ciclista B
                    </span>
                    <span className="text-sm">{infoB.flag}</span>
                  </div>
                  <h3 className="text-xl font-black truncate">{infoB.name}</h3>
                  <div className="text-xs text-purple-100 mt-0.5 space-x-1.5">
                    <span className="font-semibold">{infoB.proTeam}</span>
                    <span>•</span>
                    <span className="opacity-90">{infoB.fantasyTeam}</span>
                    {infoB.ronda !== "-" && <span className="opacity-80">({infoB.ronda})</span>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-400/30 flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-black">{infoB.puntos.toLocaleString()}</span>
                    <span className="text-xs text-purple-200 ml-1 font-bold">pts</span>
                  </div>
                  <div className="text-right text-[11px] font-bold space-y-0.5">
                    <div className="bg-purple-900/60 px-2.5 py-0.5 rounded">
                      🏆 {infoB.victorias} vic.
                    </div>
                    <div className="text-purple-200 text-[10px]">
                      {infoB.carreras} carreras • {infoB.dias} días
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RADAR CHART: MULTIDIMENSIONAL PROFILE */}
          {showRadar && radarMetricsData.length > 0 && (
            <ReportCard
              title={
                <span className="flex items-center gap-2 flex-wrap">
                  <span>Radar de Perfil y Eficiencia:</span>
                  <span className="text-orange-600 font-extrabold">{infoA.name}</span>
                  <span className="text-neutral-400 font-bold text-xs uppercase">vs</span>
                  <span className="text-purple-600 font-extrabold">{infoB.name}</span>
                </span>
              }
              subtitle="Comparación multidimensional relativa (0% a 100%) en métricas clave de competición de ambos ciclistas."
              icon={<Activity className="w-5 h-5 text-amber-600" />}
              filename={`radar-ciclistas-${infoA.name.toLowerCase()}-vs-${infoB.name.toLowerCase()}`}
              toolbarProps={{
                isExpanded: isExpandedRadar,
                onExpand: () => setIsExpandedRadar(!isExpandedRadar),
              }}
              bodyClassName="p-6 pt-2"
            >
              <CyclistComparisonCaptureHeader infoA={infoA} infoB={infoB} totalPointsDiff={totalPointsDiff} />
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                <div className="h-[360px] sm:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarMetricsData}>
                      <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: "#374151", fontSize: 11, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(val) => `${val}%`} stroke="#9ca3af" tick={{ fill: "#6b7280", fontSize: 10 }} />
                      <Radar
                        name={infoA.name}
                        dataKey="valA"
                        stroke="#ea580c"
                        fill="#ea580c"
                        fillOpacity={0.35}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                      <Radar
                        name={infoB.name}
                        dataKey="valB"
                        stroke="#9333ea"
                        fill="#9333ea"
                        fillOpacity={0.35}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                      <RechartsTooltip content={<CustomRadarMetricsTooltip nameA={infoA.name} nameB={infoB.name} />} />
                      <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px", fontWeight: "bold" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ReportCard>
          )}

          {/* SECTION: MONTHLY EVOLUTION */}
          {showMeses && (
            <div className="space-y-6 pt-2">
              <ReportCard
                title={
                  <span className="flex items-center gap-2 flex-wrap">
                    <span>Evolución de Puntos por Meses:</span>
                    <span className="text-orange-600 font-extrabold">{infoA.name}</span>
                    <span className="text-neutral-400 font-bold text-xs uppercase">vs</span>
                    <span className="text-purple-600 font-extrabold">{infoB.name}</span>
                  </span>
                }
                subtitle="Trayectoria del aporte de puntos a lo largo de los meses de competición de la temporada."
                icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                filename={`evolucion-meses-${infoA.name.toLowerCase()}-vs-${infoB.name.toLowerCase()}`}
                toolbarProps={{
                  isExpanded: isExpandedMonths,
                  onExpand: () => setIsExpandedMonths(!isExpandedMonths),
                }}
                bodyClassName="p-6 pt-2"
              >
                <div className="space-y-6">
                  <CyclistComparisonCaptureHeader infoA={infoA} infoB={infoB} totalPointsDiff={totalPointsDiff} />
                  {/* Chart */}
                  <div className="h-64 w-full bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="cyclistColorA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ea580c" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="cyclistColorB" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                        <RechartsTooltip content={<CustomCyclistPointsTooltip nameA={infoA.name} nameB={infoB.name} />} />
                        <Area
                          type="monotone"
                          dataKey="cumA"
                          name={infoA.name}
                          stroke="#ea580c"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#cyclistColorA)"
                          isAnimationActive={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="cumB"
                          name={infoB.name}
                          stroke="#9333ea"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#cyclistColorB)"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Monthly Table */}
                  <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                            <th className="px-4 py-3 border-r border-neutral-200">Mes</th>
                            <th className="px-4 py-3 bg-orange-50/50 text-orange-950 border-r border-orange-100 text-right">
                              Puntos {infoA.name}
                            </th>
                            <th className="px-4 py-3 bg-purple-50/50 text-purple-900 border-r border-purple-100 text-right">
                              Puntos {infoB.name}
                            </th>
                            <th className="px-4 py-3 text-center border-r border-neutral-200">Diferencia Mes</th>
                            <th className="px-4 py-3 bg-orange-50/30 text-right text-orange-900 border-r border-neutral-200">Acumulado A</th>
                            <th className="px-4 py-3 bg-purple-50/30 text-right text-purple-900 border-r border-neutral-200">Acumulado B</th>
                            <th className="px-4 py-3 text-center">Ganador</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 font-normal">
                          {monthlyData.map((m) => {
                            const maxMonthPts = Math.max(m.ptsA, m.ptsB);
                            const maxCumPts = Math.max(m.cumA, m.cumB);
                            return (
                              <tr key={m.month} className="hover:bg-neutral-50/80 transition-colors">
                                <td className="px-4 py-2.5 font-bold text-neutral-700 border-r border-neutral-200 bg-neutral-50/50">
                                  {m.monthFull}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono border-r border-neutral-100">
                                  <span className={cn(m.ptsA === maxMonthPts && m.ptsA > 0 ? "font-extrabold text-orange-700" : "font-normal text-neutral-600")}>
                                    {m.ptsA.toLocaleString()} pts
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono border-r border-neutral-100">
                                  <span className={cn(m.ptsB === maxMonthPts && m.ptsB > 0 ? "font-extrabold text-purple-700" : "font-normal text-neutral-600")}>
                                    {m.ptsB.toLocaleString()} pts
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-center font-mono font-bold border-r border-neutral-200">
                                  {m.diffMonth > 0 ? (
                                    <span className="text-orange-700">+{m.diffMonth} A</span>
                                  ) : m.diffMonth < 0 ? (
                                    <span className="text-purple-700">+{Math.abs(m.diffMonth)} B</span>
                                  ) : (
                                    <span className="text-neutral-400">0</span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono border-r border-neutral-200 bg-orange-50/20">
                                  <span className={cn(m.cumA === maxCumPts && m.cumA > 0 ? "font-extrabold text-orange-800" : "font-normal text-neutral-600")}>
                                    {m.cumA.toLocaleString()} pts
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono border-r border-neutral-200 bg-purple-50/20">
                                  <span className={cn(m.cumB === maxCumPts && m.cumB > 0 ? "font-extrabold text-purple-800" : "font-normal text-neutral-600")}>
                                    {m.cumB.toLocaleString()} pts
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-center text-xs">
                                  {m.winner === "A" ? (
                                    <span className="font-bold text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded text-[11px]">🟠 {infoA.name.split(" ")[0]}</span>
                                  ) : m.winner === "B" ? (
                                    <span className="font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded text-[11px]">🟣 {infoB.name.split(" ")[0]}</span>
                                  ) : (
                                    <span className="text-neutral-400 text-[11px]">Empate</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        {monthlyData.length > 0 && (() => {
                          const lastM = monthlyData[monthlyData.length - 1];
                          const totalPtsA = lastM ? lastM.cumA : 0;
                          const totalPtsB = lastM ? lastM.cumB : 0;
                          const diff = totalPtsA - totalPtsB;
                          return (
                            <tfoot>
                              <tr className="bg-neutral-100/90 font-bold border-t-2 border-neutral-300 text-neutral-800">
                                <td className="px-4 py-3 border-r border-neutral-200 uppercase text-[11px] font-black">
                                  Total Temporada
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-black text-orange-800 border-r border-orange-200 bg-orange-100/40">
                                  {totalPtsA.toLocaleString()} pts
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-black text-purple-800 border-r border-purple-200 bg-purple-100/40">
                                  {totalPtsB.toLocaleString()} pts
                                </td>
                                <td className="px-4 py-3 text-center font-mono font-black border-r border-neutral-200">
                                  {diff > 0 ? (
                                    <span className="text-orange-700">+{diff.toLocaleString()} A</span>
                                  ) : diff < 0 ? (
                                    <span className="text-purple-700">+{Math.abs(diff).toLocaleString()} B</span>
                                  ) : (
                                    <span className="text-neutral-500">0</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-black text-orange-900 border-r border-neutral-200 bg-orange-100/50">
                                  {totalPtsA.toLocaleString()} pts
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-black text-purple-900 border-r border-neutral-200 bg-purple-100/50">
                                  {totalPtsB.toLocaleString()} pts
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {diff > 0 ? (
                                    <span className="font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded text-[11px]">🟠 {infoA.name.split(" ")[0]}</span>
                                  ) : diff < 0 ? (
                                    <span className="font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-[11px]">🟣 {infoB.name.split(" ")[0]}</span>
                                  ) : (
                                    <span className="text-neutral-500 text-[11px]">Empate</span>
                                  )}
                                </td>
                              </tr>
                            </tfoot>
                          );
                        })()}
                      </table>
                    </div>
                  </div>
                </div>
              </ReportCard>
            </div>
          )}

          {/* SECTION: RACE CATEGORIES BREAKDOWN */}
          {showCategorias && (
            <ReportCard
              title={
                <span className="flex items-center gap-2 flex-wrap">
                  <span>Comparativa por Categorías:</span>
                  <span className="text-orange-600 font-extrabold">{infoA.name}</span>
                  <span className="text-neutral-400 font-bold text-xs uppercase">vs</span>
                  <span className="text-purple-600 font-extrabold">{infoB.name}</span>
                </span>
              }
              subtitle="Desglose por tipo de prueba según orden jerárquico oficial (Grandes Vueltas, Monumentos, etc.)."
              icon={<Award className="w-5 h-5 text-emerald-600" />}
              filename={`categorias-ciclistas-${infoA.name.toLowerCase()}-vs-${infoB.name.toLowerCase()}`}
              toolbarProps={{
                isExpanded: isExpandedCategory,
                onExpand: () => setIsExpandedCategory(!isExpandedCategory),
              }}
              bodyClassName="p-6 pt-2"
            >
              <CyclistComparisonCaptureHeader infoA={infoA} infoB={infoB} totalPointsDiff={totalPointsDiff} />
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                        <th className="px-4 py-3 border-r border-neutral-200">Categoría</th>
                        <th className="px-4 py-3 bg-orange-50/50 text-orange-950 border-r border-orange-100 text-right">
                          {infoA.name}
                        </th>
                        <th className="px-4 py-3 bg-purple-50/50 text-purple-900 border-r border-purple-100 text-right">
                          {infoB.name}
                        </th>
                        <th className="px-4 py-3 text-center border-r border-neutral-200 min-w-[120px]">Diferencia</th>
                        <th className="px-4 py-3 text-center min-w-[140px] border-r border-neutral-200">Distribución</th>
                        <th className="px-4 py-3 text-center">Dominador</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-normal">
                      {categoryData.map((c) => {
                        const totalCat = c.ptsA + c.ptsB;
                        const pctA = totalCat > 0 ? Math.round((c.ptsA / totalCat) * 100) : 50;
                        const pctB = 100 - pctA;
                        const diff = c.ptsA - c.ptsB;
                        const isMaxA = c.ptsA > c.ptsB;
                        const isMaxB = c.ptsB > c.ptsA;

                        return (
                          <tr key={c.cat} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="px-4 py-3 font-bold text-neutral-800 border-r border-neutral-200 bg-neutral-50/40">
                              {c.cat}
                            </td>
                            <td className="px-4 py-3 text-right font-mono border-r border-neutral-100">
                              <span className={cn(isMaxA ? "font-extrabold text-orange-700" : "font-normal text-neutral-600")}>
                                {c.ptsA.toLocaleString()} pts
                              </span>
                              <span className="text-[10px] text-neutral-400 block">
                                {infoA.puntos > 0 ? `${Math.round((c.ptsA / infoA.puntos) * 100)}% de sus pts` : "0%"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono border-r border-neutral-100">
                              <span className={cn(isMaxB ? "font-extrabold text-purple-700" : "font-normal text-neutral-600")}>
                                {c.ptsB.toLocaleString()} pts
                              </span>
                              <span className="text-[10px] text-neutral-400 block">
                                {infoB.puntos > 0 ? `${Math.round((c.ptsB / infoB.puntos) * 100)}% de sus pts` : "0%"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center font-mono font-bold border-r border-neutral-200">
                              {diff > 0 ? (
                                <span className="text-orange-700">+{diff.toLocaleString()} A</span>
                              ) : diff < 0 ? (
                                <span className="text-purple-700">+{Math.abs(diff).toLocaleString()} B</span>
                              ) : (
                                <span className="text-neutral-400">0</span>
                              )}
                            </td>
                            <td className="px-4 py-3 border-r border-neutral-200">
                              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden flex">
                                <div style={{ width: `${pctA}%` }} className="bg-orange-500 h-full transition-all" />
                                <div style={{ width: `${pctB}%` }} className="bg-purple-600 h-full transition-all" />
                              </div>
                              <div className="flex justify-between text-[9px] text-neutral-400 mt-0.5 font-mono">
                                <span>{pctA}%</span>
                                <span>{pctB}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {diff > 0 ? (
                                <span className="text-[11px] font-bold text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded">
                                  🟠 {infoA.name.split(" ")[0]}
                                </span>
                              ) : diff < 0 ? (
                                <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
                                  🟣 {infoB.name.split(" ")[0]}
                                </span>
                              ) : (
                                <span className="text-[11px] text-neutral-400">Empate</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </ReportCard>
          )}

          {/* SECTION: HEAD TO HEAD RACES */}
          {showCarreras && (
            <ReportCard
              title={
                <span className="flex items-center gap-2 flex-wrap">
                  <span>Duelo Directo por Carreras:</span>
                  <span className="text-orange-600 font-extrabold">{infoA.name}</span>
                  <span className="text-neutral-400 font-bold text-xs uppercase">vs</span>
                  <span className="text-purple-600 font-extrabold">{infoB.name}</span>
                </span>
              }
              subtitle="Desglose carrera a carrera con puntos y resultados obtenidos por cada ciclista."
              icon={<BarChart2 className="w-5 h-5 text-blue-600" />}
              filename={`duelo-carreras-${infoA.name.toLowerCase()}-vs-${infoB.name.toLowerCase()}`}
              toolbarProps={{
                isExpanded: isExpandedRaces,
                onExpand: () => setIsExpandedRaces(!isExpandedRaces),
              }}
              bodyClassName="p-6 pt-2"
            >
              <div className="space-y-4">
                <CyclistComparisonCaptureHeader infoA={infoA} infoB={infoB} totalPointsDiff={totalPointsDiff} />
                {/* Duelos Summary Strip & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50/80 p-3.5 rounded-xl border border-neutral-200">
                  {/* Summary indicators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                      <Swords className="w-4 h-4 text-blue-600" />
                      <span>Carreras juntos:</span>
                    </span>
                    <span className="font-mono font-black text-blue-900 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-md">
                      {duelosStats.totalJuntos}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-orange-800 bg-orange-100/70 border border-orange-200/80 px-2 py-0.5 rounded-md font-bold text-[11px]">
                      🟠 {infoA.name.split(" ")[0]} sacó más: <strong className="font-mono">{duelosStats.winsA}</strong>
                    </span>
                    <span className="text-purple-800 bg-purple-100/70 border border-purple-200/80 px-2 py-0.5 rounded-md font-bold text-[11px]">
                      🟣 {infoB.name.split(" ")[0]} sacó más: <strong className="font-mono">{duelosStats.winsB}</strong>
                    </span>
                    <span className="text-neutral-600 bg-neutral-200/60 border border-neutral-300/60 px-2 py-0.5 rounded-md font-medium text-[11px]">
                      ⚪ Sin puntuar ninguno: <strong className="font-mono font-bold text-neutral-800">{duelosStats.neitherScoredCount}</strong>
                    </span>
                    {duelosStats.tiesWithPoints > 0 && (
                      <span className="text-amber-800 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        Empate con pts: <strong className="font-mono font-bold">{duelosStats.tiesWithPoints}</strong>
                      </span>
                    )}
                  </div>

                  {/* Filter segmented buttons */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-neutral-200 text-xs shrink-0 self-start md:self-auto">
                    <button
                      onClick={() => setRaceFilter("all")}
                      className={cn(
                        "px-2.5 py-1 rounded-md font-bold transition-all",
                        raceFilter === "all" ? "bg-neutral-900 text-white shadow-2xs" : "text-neutral-600 hover:bg-neutral-100"
                      )}
                    >
                      Todas ({raceBreakdown.length})
                    </button>
                    <button
                      onClick={() => setRaceFilter("together")}
                      className={cn(
                        "px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1",
                        raceFilter === "together" ? "bg-blue-600 text-white shadow-2xs" : "text-neutral-600 hover:bg-neutral-100"
                      )}
                    >
                      <Swords className="w-3 h-3" />
                      <span>Solo juntos ({duelosStats.totalJuntos})</span>
                    </button>
                    <button
                      onClick={() => setRaceFilter("points")}
                      className={cn(
                        "px-2.5 py-1 rounded-md font-bold transition-all",
                        raceFilter === "points" ? "bg-amber-600 text-white shadow-2xs" : "text-neutral-600 hover:bg-neutral-100"
                      )}
                    >
                      Con puntos ({duelosStats.scoredCount})
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[750px] text-xs">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                          <th className="px-4 py-3 border-r border-neutral-200">Carrera</th>
                          <th className="px-3 py-3 border-r border-neutral-200">Categoría</th>
                          <th className="px-3 py-3 border-r border-neutral-200 text-center">Coincidencia</th>
                          <th className="px-4 py-3 bg-orange-50/50 text-orange-950 border-r border-orange-100 text-right">
                            {infoA.name}
                          </th>
                          <th className="px-4 py-3 bg-purple-50/50 text-purple-900 border-r border-purple-100 text-right">
                            {infoB.name}
                          </th>
                          <th className="px-4 py-3 text-center border-r border-neutral-200">Dif. Carrera</th>
                          <th className="px-4 py-3 text-center bg-amber-50/60 text-amber-900 font-bold">Diferencia Acumulada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-normal">
                        {raceBreakdown
                          .filter((r) => {
                            if (raceFilter === "together") return r.ranTogether;
                            if (raceFilter === "points") return r.ptsA > 0 || r.ptsB > 0;
                            return true;
                          })
                          .map((r) => {
                            const isAWinner = r.winner === "A";
                            const isBWinner = r.winner === "B";
                            return (
                              <tr key={r.carrera} className="hover:bg-neutral-50/80 transition-colors">
                                <td className="px-4 py-2.5 font-bold text-neutral-800 border-r border-neutral-200">
                                  <div className="truncate max-w-[200px]" title={r.carrera}>
                                    {r.carrera}
                                  </div>
                                  {r.fecha && <div className="text-[10px] text-neutral-400 font-normal">{r.fecha}</div>}
                                </td>
                                <td className="px-3 py-2.5 border-r border-neutral-200 text-neutral-600 text-[11px]">
                                  {r.categoria}
                                </td>
                                <td className="px-3 py-2.5 border-r border-neutral-200 text-center">
                                  {r.ranTogether ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                      <Swords className="w-2.5 h-2.5" />
                                      Juntos
                                    </span>
                                  ) : r.ranA ? (
                                    <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                                      Solo {infoA.name.split(" ")[0]}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                                      Solo {infoB.name.split(" ")[0]}
                                    </span>
                                  )}
                                </td>
                                <td className={cn("px-4 py-2.5 text-right font-mono border-r border-neutral-100", isAWinner ? "bg-orange-50/50 font-bold text-orange-950" : "text-neutral-600 font-normal")}>
                                  {!r.ranA ? (
                                    <span className="text-neutral-400 italic font-sans text-[11px]">No disputada</span>
                                  ) : (
                                    <>
                                      <span>{r.ptsA.toLocaleString()} pts</span>
                                      {r.bestPosA !== "-" && <span className="text-[10px] text-neutral-400 block font-normal">(Pos #{r.bestPosA})</span>}
                                    </>
                                  )}
                                </td>
                                <td className={cn("px-4 py-2.5 text-right font-mono border-r border-neutral-100", isBWinner ? "bg-purple-50/50 font-bold text-purple-950" : "text-neutral-600 font-normal")}>
                                  {!r.ranB ? (
                                    <span className="text-neutral-400 italic font-sans text-[11px]">No disputada</span>
                                  ) : (
                                    <>
                                      <span>{r.ptsB.toLocaleString()} pts</span>
                                      {r.bestPosB !== "-" && <span className="text-[10px] text-neutral-400 block font-normal">(Pos #{r.bestPosB})</span>}
                                    </>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-center font-mono font-bold border-r border-neutral-200">
                                  {r.ranTogether ? (
                                    r.ptsA === 0 && r.ptsB === 0 ? (
                                      <span className="text-neutral-400 font-bold bg-neutral-100 px-2 py-0.5 rounded text-[10px]">
                                        Sin puntos (0-0)
                                      </span>
                                    ) : r.diff > 0 ? (
                                      <span className="text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded text-[11px]">
                                        +{r.diff.toLocaleString()} A
                                      </span>
                                    ) : r.diff < 0 ? (
                                      <span className="text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[11px]">
                                        +{Math.abs(r.diff).toLocaleString()} B
                                      </span>
                                    ) : (
                                      <span className="text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                                        Empate ({r.ptsA}p)
                                      </span>
                                    )
                                  ) : r.ranA ? (
                                    <span className="text-orange-700/80 text-[11px] font-normal">
                                      +{r.ptsA.toLocaleString()} A (solitario)
                                    </span>
                                  ) : (
                                    <span className="text-purple-700/80 text-[11px] font-normal">
                                      +{r.ptsB.toLocaleString()} B (solitario)
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-center font-mono font-bold bg-amber-50/30">
                                  {r.cumulativeDiff > 0 ? (
                                    <span className="text-orange-800">+{r.cumulativeDiff.toLocaleString()} A</span>
                                  ) : r.cumulativeDiff < 0 ? (
                                    <span className="text-purple-800">+{Math.abs(r.cumulativeDiff).toLocaleString()} B</span>
                                  ) : (
                                    <span className="text-neutral-400 font-normal">0</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                      <tfoot className="bg-neutral-100 border-t-2 border-neutral-300 font-bold text-xs">
                        <tr>
                          <td className="px-4 py-3 text-neutral-600" colSpan={3}>
                            TOTAL EN {raceBreakdown.length} CARRERAS ({duelosStats.totalJuntos} JUNTOS)
                          </td>
                          <td className="px-4 py-3 bg-orange-100/70 text-orange-950 font-black text-right">
                            {infoA.puntos.toLocaleString()} pts
                          </td>
                          <td className="px-4 py-3 bg-purple-100/70 text-purple-950 font-black text-right">
                            {infoB.puntos.toLocaleString()} pts
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-neutral-500" colSpan={2}>
                            {totalPointsDiff > 0 ? (
                              <span className="text-orange-800 font-black">+{totalPointsDiff.toLocaleString()} pts ({infoA.name})</span>
                            ) : totalPointsDiff < 0 ? (
                              <span className="text-purple-800 font-black">+{Math.abs(totalPointsDiff).toLocaleString()} pts ({infoB.name})</span>
                            ) : (
                              "Empate Total"
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </ReportCard>
          )}
        </div>
      )}
    </div>
  );
};

export default CyclistComparaciones;

