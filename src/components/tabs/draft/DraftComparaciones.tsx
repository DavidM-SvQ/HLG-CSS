import React, { useMemo, useRef } from "react";
import { AppState, PlayerScore, CyclistMetadata } from "../../../lib/types";
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
  Crown,
  TrendingUp,
  Sparkles,
  Zap,
  Grid,
  Target,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { getVal } from "../../../lib/data-processing";
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
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

export interface DraftComparacionesProps {
  files: AppState;
  leaderboard: PlayerScore[];
  cyclistMetadata?: Record<string, CyclistMetadata>;
  playerTeamMap?: Record<string, string>;
  playerOrderMap?: Record<string, string>;
}

const monthsFullNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const monthsShortNames = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const getMonthIndexFromDateStr = (dateStr?: string): number => {
  if (!dateStr) return -1;
  const match = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) {
    const month = parseInt(match[2], 10) - 1;
    if (month >= 0 && month <= 11) return month;
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.getMonth();
  }
  return -1;
};

// Normalize category names and aliases (maps "MON", "MONUMENTO", "MONUMENTOS" -> "Monumentos", etc.)
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

// Helper for rendering short rank badges with symbols for first and last
const renderRankBadge = (rank: number, total: number) => {
  if (rank === 1) {
    return (
      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded shrink-0" title="1º de la liga">
        👑 1º
      </span>
    );
  }
  if (rank === total) {
    return (
      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded shrink-0" title="Último de la liga">
        🔻 {rank}º
      </span>
    );
  }
  return (
    <span className="text-[10px] font-normal text-neutral-500 shrink-0">
      {rank}º
    </span>
  );
};

// Custom Tooltip for Monthly Position Chart
const CustomPositionTooltip = ({ active, payload, teamA, teamB }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 text-white p-3 rounded-xl shadow-lg border border-neutral-700 text-xs space-y-1.5 z-50">
        <p className="font-bold text-neutral-300 border-b border-neutral-800 pb-1">{data.monthFull}</p>
        <div className="flex items-center justify-between gap-4 text-orange-400 font-medium">
          <span>🟠 {teamA}:</span>
          <span className="font-bold">{data.teamARank}º puesto en Liga</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-purple-400 font-medium">
          <span>🟣 {teamB}:</span>
          <span className="font-bold">{data.teamBRank}º puesto en Liga</span>
        </div>
        <div className="pt-1 text-[10px] text-neutral-400 border-t border-neutral-800 font-mono">
          {data.teamARank < data.teamBRank
            ? `Ventaja de ${data.teamBRank - data.teamARank} pos. para ${teamA}`
            : data.teamBRank < data.teamARank
            ? `Ventaja de ${data.teamARank - data.teamBRank} pos. para ${teamB}`
            : "Misma posición en liga"}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Monthly Cumulative Points Chart
const CustomPointsTooltip = ({ active, payload, teamA, teamB }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 text-white p-3 rounded-xl shadow-lg border border-neutral-700 text-xs space-y-1.5 z-50">
        <p className="font-bold text-neutral-300 border-b border-neutral-800 pb-1">{data.monthFull}</p>
        <div className="flex items-center justify-between gap-4 text-orange-400 font-medium">
          <span>🟠 {teamA}:</span>
          <span className="font-bold">
            {data.teamACum.toLocaleString()} pts <span className="text-[10px] opacity-75">(+{data.teamAPtsMonth} en {data.month})</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-purple-400 font-medium">
          <span>🟣 {teamB}:</span>
          <span className="font-bold">
            {data.teamBCum.toLocaleString()} pts <span className="text-[10px] opacity-75">(+{data.teamBPtsMonth} en {data.month})</span>
          </span>
        </div>
        <div className="pt-1 text-[10px] text-neutral-400 border-t border-neutral-800 font-mono">
          {data.diffCum > 0
            ? `+${data.diffCum.toLocaleString()} pts acum. para ${teamA}`
            : data.diffCum < 0
            ? `+${Math.abs(data.diffCum).toLocaleString()} pts acum. para ${teamB}`
            : "Misma puntuación acumulada"}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Radar Chart comparing 20 Picks (normalized 0-100% per round)
const CustomRadarTooltip = ({ active, payload, teamA, teamB }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 text-white p-3.5 rounded-xl shadow-xl border border-neutral-700 text-xs space-y-2 z-50 min-w-[260px]">
        <div className="border-b border-neutral-800 pb-1.5 flex items-center justify-between gap-2">
          <span className="font-bold text-neutral-200">Ronda {data.ronda} (Pick #{parseInt(data.ronda, 10)})</span>
          <span className="text-[10px] text-amber-400 font-mono bg-amber-950/80 border border-amber-800/80 px-1.5 py-0.5 rounded">
            Máx Liga: {data.maxPtsInRound.toLocaleString()} pts
          </span>
        </div>

        {/* Team A */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-orange-400 font-bold">
            <span className="truncate max-w-[150px]">🟠 {teamA}:</span>
            <span className="font-mono">{data.ptsA.toLocaleString()} pts</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-300">
            <span className="truncate text-neutral-400 max-w-[130px]">{data.cyclistA}</span>
            <span className="font-mono shrink-0 ml-2">
              <span className="text-amber-300 font-semibold">{data.rankA === 1 ? "👑 1º" : `${data.rankA}º`}/{data.totalInRoundA}</span>
              <span className="text-neutral-400 text-[10px] ml-1">({data.valA}%)</span>
            </span>
          </div>
        </div>

        {/* Team B */}
        <div className="space-y-0.5 pt-1 border-t border-neutral-800/60">
          <div className="flex items-center justify-between text-purple-400 font-bold">
            <span className="truncate max-w-[150px]">🟣 {teamB}:</span>
            <span className="font-mono">{data.ptsB.toLocaleString()} pts</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-300">
            <span className="truncate text-neutral-400 max-w-[130px]">{data.cyclistB}</span>
            <span className="font-mono shrink-0 ml-2">
              <span className="text-purple-300 font-semibold">{data.rankB === 1 ? "👑 1º" : `${data.rankB}º`}/{data.totalInRoundB}</span>
              <span className="text-neutral-400 text-[10px] ml-1">({data.valB}%)</span>
            </span>
          </div>
        </div>

        <div className="pt-1.5 text-[10px] text-neutral-400 border-t border-neutral-800 font-mono flex items-center justify-between">
          <span>Diferencia pick:</span>
          <span className="font-bold text-white">
            {data.ptsA > data.ptsB
              ? `+${(data.ptsA - data.ptsB).toLocaleString()} pts para ${teamA}`
              : data.ptsB > data.ptsA
              ? `+${(data.ptsB - data.ptsA).toLocaleString()} pts para ${teamB}`
              : "Empate en este pick"}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const DraftComparaciones: React.FC<DraftComparacionesProps> = ({
  files,
  leaderboard,
}) => {
  // Extract all team/player names from leaderboard
  const availableTeams = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return [];
    return leaderboard
      .filter((p) => p.jugador !== "No draft" && p.nombreEquipo !== "No draft")
      .map((p) => ({
        name: p.nombreEquipo || p.jugador,
        jugador: p.jugador,
        puntos: p.puntos || 0,
        orden: p.orden || "-",
      }));
  }, [leaderboard]);

  // URL state for selected teams to allow sharing comparison links
  const [compTeamA, setCompTeamA] = useUrlState<string>("compTeamA", "");
  const [compTeamB, setCompTeamB] = useUrlState<string>("compTeamB", "");
  const [activeViewMode, setActiveViewMode] = useUrlState<"all" | "rondas" | "meses" | "categorias" | "draft">("compView", "all");

  // Fallback defaults to top 2 teams if not in URL or invalid
  const teamA = useMemo(() => {
    if (compTeamA && availableTeams.some((t) => t.name === compTeamA)) {
      return compTeamA;
    }
    return availableTeams[0]?.name || "";
  }, [compTeamA, availableTeams]);

  const teamB = useMemo(() => {
    if (compTeamB && availableTeams.some((t) => t.name === compTeamB) && compTeamB !== teamA) {
      return compTeamB;
    }
    const defaultB = availableTeams.find((t) => t.name !== teamA)?.name || availableTeams[0]?.name || "";
    return defaultB;
  }, [compTeamB, teamA, availableTeams]);

  const comparisonContainerRef = useRef<HTMLDivElement>(null);
  const [isExpandedRounds, setIsExpandedRounds] = React.useState(false);
  const [isExpandedMonths, setIsExpandedMonths] = React.useState(false);
  const [isExpandedCategory, setIsExpandedCategory] = React.useState(false);
  const [isExpandedCharts, setIsExpandedCharts] = React.useState(false);
  const [isExpandedTiers, setIsExpandedTiers] = React.useState(false);
  const [isExpandedMVPs, setIsExpandedMVPs] = React.useState(false);
  const [isExpandedRadar, setIsExpandedRadar] = React.useState(false);

  const [isLinkCopied, setIsLinkCopied] = React.useState(false);
  const [isTextCopied, setIsTextCopied] = React.useState(false);

  // Table Screenshot Hook
  const { handleCopyImage, handleDownloadImage, isCopying } = useTableScreenshot(comparisonContainerRef);

  // Swap teams
  const handleSwap = () => {
    const nextA = teamB;
    const nextB = teamA;
    setCompTeamA(nextA);
    setCompTeamB(nextB);
  };

  // Share direct URL link
  const handleShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("publicTab", "draft");
    url.searchParams.set("draftSubTab", "comparaciones");
    if (teamA) url.searchParams.set("compTeamA", teamA);
    if (teamB) url.searchParams.set("compTeamB", teamB);
    url.searchParams.set("compView", activeViewMode);

    navigator.clipboard.writeText(url.toString());
    setIsLinkCopied(true);
    toast.success("Enlace de comparativa copiado", {
      description: `Se ha generado el enlace directo para la comparativa: ${teamA} vs ${teamB}`,
    });
    setTimeout(() => setIsLinkCopied(false), 2500);
  };

  // Compute total points gained by each cyclist across the entire league
  const cyclistTotalPoints = useMemo(() => {
    const map: Record<string, number> = {};
    leaderboard?.forEach((player) => {
      player.detalles?.forEach((d: any) => {
        if (d.ciclista) {
          map[d.ciclista] = (map[d.ciclista] || 0) + (d.puntosObtenidos || 0);
        }
      });
    });
    return map;
  }, [leaderboard]);

  // Compute round ranks for ALL draft picks in each round across all teams in the league
  const roundPicksMap = useMemo(() => {
    if (!files?.elecciones?.data) return {};

    const byRound: Record<string, { ciclista: string; pts: number }[]> = {};

    files.elecciones.data.forEach((row: any) => {
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      let rStr = String(getVal(row, "Ronda") || "").trim();
      if (!rStr) rStr = "1";
      const ronda = rStr.padStart(2, "0");

      if (ciclista) {
        if (!byRound[ronda]) byRound[ronda] = [];
        const pts = cyclistTotalPoints[ciclista] || 0;
        byRound[ronda].push({ ciclista, pts });
      }
    });

    const rankMap: Record<string, { rank: number; totalInRound: number; isBest: boolean; isWorst: boolean; maxPtsInRound: number }> = {};

    Object.entries(byRound).forEach(([ronda, cyclists]) => {
      const sorted = [...cyclists].sort((a, b) => b.pts - a.pts);
      const totalInRound = sorted.length;
      const maxPts = sorted[0]?.pts || 0;
      const minPts = sorted[sorted.length - 1]?.pts || 0;

      sorted.forEach((item, index) => {
        const rank = index + 1;
        const isBest = item.pts === maxPts && maxPts > 0;
        const isWorst = item.pts === minPts && totalInRound > 1;

        rankMap[`${ronda}_${item.ciclista}`] = {
          rank,
          totalInRound,
          isBest,
          isWorst,
          maxPtsInRound: maxPts,
        };
      });
    });

    return rankMap;
  }, [files?.elecciones?.data, cyclistTotalPoints]);

  // Build round-by-round comparison data for teamA and teamB
  const comparisonData = useMemo(() => {
    if (!files?.elecciones?.data || !teamA || !teamB) {
      return { rounds: [], summaryA: null, summaryB: null, roundsWonA: 0, roundsWonB: 0, ties: 0, finalCumulativeDiff: 0 };
    }

    const picksA: Record<string, { ciclista: string; puntos: number; eleccion: number }> = {};
    const picksB: Record<string, { ciclista: string; puntos: number; eleccion: number }> = {};
    const roundSet = new Set<string>();

    files.elecciones.data.forEach((row: any, idx: number) => {
      const teamName = String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG") || "").trim();
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      let rStr = String(getVal(row, "Ronda") || "").trim();
      if (!rStr) rStr = "1";
      const ronda = rStr.padStart(2, "0");

      if (teamName && ciclista) {
        roundSet.add(ronda);
        const pts = cyclistTotalPoints[ciclista] || 0;

        if (teamName === teamA) {
          picksA[ronda] = { ciclista, puntos: pts, eleccion: idx + 1 };
        }
        if (teamName === teamB) {
          picksB[ronda] = { ciclista, puntos: pts, eleccion: idx + 1 };
        }
      }
    });

    const roundList = Array.from(roundSet).sort((a, b) => a.localeCompare(b));

    let cumulativeDiff = 0;
    let roundsWonA = 0;
    let roundsWonB = 0;
    let ties = 0;

    const rounds = roundList.map((ronda) => {
      const pickA = picksA[ronda] || { ciclista: "-", puntos: 0, eleccion: 0 };
      const pickB = picksB[ronda] || { ciclista: "-", puntos: 0, eleccion: 0 };

      const diffRound = pickA.puntos - pickB.puntos;
      cumulativeDiff += diffRound;

      if (diffRound > 0) roundsWonA++;
      else if (diffRound < 0) roundsWonB++;
      else ties++;

      return {
        ronda,
        pickA,
        pickB,
        diffRound,
        cumulativeDiff,
        winner: diffRound > 0 ? "A" : diffRound < 0 ? "B" : "TIE",
        cumulativeLeader: cumulativeDiff > 0 ? "A" : cumulativeDiff < 0 ? "B" : "TIE",
      };
    });

    const infoA = availableTeams.find((t) => t.name === teamA);
    const infoB = availableTeams.find((t) => t.name === teamB);

    const totalPtsA = rounds.reduce((sum, r) => sum + r.pickA.puntos, 0);
    const totalPtsB = rounds.reduce((sum, r) => sum + r.pickB.puntos, 0);

    return {
      rounds,
      summaryA: { ...infoA, totalPts: totalPtsA },
      summaryB: { ...infoB, totalPts: totalPtsB },
      roundsWonA,
      roundsWonB,
      ties,
      finalCumulativeDiff: cumulativeDiff,
    };
  }, [files, teamA, teamB, availableTeams, cyclistTotalPoints]);

  // Compute radar chart data for comparing the 20 picks (scaled 0-100% per round)
  const radarData = useMemo(() => {
    if (!comparisonData?.rounds || comparisonData.rounds.length === 0) return [];
    return comparisonData.rounds.map((r) => {
      const infoA = roundPicksMap[`${r.ronda}_${r.pickA.ciclista}`];
      const infoB = roundPicksMap[`${r.ronda}_${r.pickB.ciclista}`];
      const maxPtsInRound = infoA?.maxPtsInRound ?? infoB?.maxPtsInRound ?? Math.max(r.pickA.puntos, r.pickB.puntos, 1);

      const valA = maxPtsInRound > 0 ? Math.round((r.pickA.puntos / maxPtsInRound) * 1000) / 10 : 0;
      const valB = maxPtsInRound > 0 ? Math.round((r.pickB.puntos / maxPtsInRound) * 1000) / 10 : 0;

      return {
        ronda: r.ronda,
        roundLabel: `R${parseInt(r.ronda, 10)}`,
        fullLabel: `Ronda ${r.ronda}`,
        cyclistA: r.pickA.ciclista,
        ptsA: r.pickA.puntos,
        valA, // 0 - 100%
        rankA: infoA?.rank || 0,
        totalInRoundA: infoA?.totalInRound || 1,

        cyclistB: r.pickB.ciclista,
        ptsB: r.pickB.puntos,
        valB, // 0 - 100%
        rankB: infoB?.rank || 0,
        totalInRoundB: infoB?.totalInRound || 1,

        maxPtsInRound,
      };
    });
  }, [comparisonData, roundPicksMap]);

  // Copy plain text summary to clipboard
  const handleCopyText = () => {
    if (!comparisonData.rounds || comparisonData.rounds.length === 0) return;

    let text = `⚔️ COMPARATIVA DRAFT ⚔️\n`;
    text += `🟠 ${teamA}: ${comparisonData.summaryA?.totalPts} pts\n`;
    text += `🟣 ${teamB}: ${comparisonData.summaryB?.totalPts} pts\n`;
    text += `Diferencia Total: ${comparisonData.finalCumulativeDiff > 0 ? `+${comparisonData.finalCumulativeDiff} pts (${teamA})` : comparisonData.finalCumulativeDiff < 0 ? `+${Math.abs(comparisonData.finalCumulativeDiff)} pts (${teamB})` : "Empate"}\n\n`;
    text += `Desglose por Ronda:\n`;

    comparisonData.rounds.forEach((r) => {
      const diffStr = r.diffRound > 0 ? `+${r.diffRound} A` : r.diffRound < 0 ? `+${Math.abs(r.diffRound)} B` : "0";
      text += `• R${r.ronda}: ${r.pickA.ciclista} (${r.pickA.puntos}p) vs ${r.pickB.ciclista} (${r.pickB.puntos}p) => Dif: ${diffStr} | Acum: ${r.cumulativeDiff > 0 ? `+${r.cumulativeDiff} (A)` : r.cumulativeDiff < 0 ? `+${Math.abs(r.cumulativeDiff)} (B)` : "0"}\n`;
    });

    navigator.clipboard.writeText(text);
    setIsTextCopied(true);
    toast.success("Resumen en texto copiado al portapapeles");
    setTimeout(() => setIsTextCopied(false), 2500);
  };

  // Compute monthly data: including single-month rank and cumulative rank with month closed
  const monthlyData = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0)
      return { monthlyChartData: [], activeMonthsCount: 0, totalTeamsInLeague: 1 };

    const allTeams = leaderboard.filter((t) => t.jugador !== "No draft" && t.nombreEquipo !== "No draft");
    const teamCount = allTeams.length || 1;

    const monthlyPtsByTeam: Record<string, number[]> = {};
    allTeams.forEach((t) => {
      const tName = t.nombreEquipo || t.jugador;
      monthlyPtsByTeam[tName] = new Array(12).fill(0);
      t.detalles?.forEach((d) => {
        const mIdx = getMonthIndexFromDateStr(d.fecha);
        if (mIdx >= 0 && mIdx < 12) {
          monthlyPtsByTeam[tName][mIdx] += (d.puntosObtenidos || 0);
        }
      });
    });

    let maxMonthWithPoints = 0;
    allTeams.forEach((t) => {
      const tName = t.nombreEquipo || t.jugador;
      const ptsArr = monthlyPtsByTeam[tName];
      ptsArr.forEach((pts, mIdx) => {
        if (pts > 0 && mIdx > maxMonthWithPoints) {
          maxMonthWithPoints = mIdx;
        }
      });
    });

    const currentMonth = new Date().getMonth();
    const endMonthIdx = Math.max(maxMonthWithPoints, Math.min(currentMonth, 11));

    const cumPtsTracker: Record<string, number> = {};
    allTeams.forEach((t) => {
      cumPtsTracker[t.nombreEquipo || t.jugador] = 0;
    });

    const monthlyChartData = [];

    for (let m = 0; m <= endMonthIdx; m++) {
      // 1. Single month points & ranking
      const singleMonthScores = allTeams.map((t) => {
        const tName = t.nombreEquipo || t.jugador;
        return { tName, pts: monthlyPtsByTeam[tName][m] };
      }).sort((a, b) => b.pts - a.pts);

      const singleMonthRankMap: Record<string, number> = {};
      singleMonthScores.forEach((item, idx) => {
        singleMonthRankMap[item.tName] = idx + 1;
      });

      // 2. Cumulative points & ranking
      allTeams.forEach((t) => {
        const tName = t.nombreEquipo || t.jugador;
        cumPtsTracker[tName] += monthlyPtsByTeam[tName][m];
      });

      const cumScores = allTeams.map((t) => {
        const tName = t.nombreEquipo || t.jugador;
        return { tName, pts: cumPtsTracker[tName] };
      }).sort((a, b) => b.pts - a.pts);

      const cumRankMap: Record<string, number> = {};
      cumScores.forEach((item, idx) => {
        cumRankMap[item.tName] = idx + 1;
      });

      const ptsA_Month = teamA ? (monthlyPtsByTeam[teamA]?.[m] || 0) : 0;
      const ptsB_Month = teamB ? (monthlyPtsByTeam[teamB]?.[m] || 0) : 0;

      const singleMonthRankA = teamA ? (singleMonthRankMap[teamA] || teamCount) : 0;
      const singleMonthRankB = teamB ? (singleMonthRankMap[teamB] || teamCount) : 0;

      const cumA = teamA ? cumPtsTracker[teamA] || 0 : 0;
      const cumB = teamB ? cumPtsTracker[teamB] || 0 : 0;

      const rankA = teamA ? (cumRankMap[teamA] || teamCount) : 0;
      const rankB = teamB ? (cumRankMap[teamB] || teamCount) : 0;

      monthlyChartData.push({
        monthIndex: m,
        month: monthsShortNames[m],
        monthFull: monthsFullNames[m],
        teamAPtsMonth: ptsA_Month,
        teamBPtsMonth: ptsB_Month,
        singleMonthRankA,
        singleMonthRankB,
        diffMonth: ptsA_Month - ptsB_Month,
        teamACum: cumA,
        teamBCum: cumB,
        teamARank: rankA,
        teamBRank: rankB,
        diffCum: cumA - cumB,
        winnerMonth: ptsA_Month > ptsB_Month ? "A" : ptsB_Month > ptsA_Month ? "B" : "TIE",
      });
    }

    return { monthlyChartData, activeMonthsCount: endMonthIdx + 1, totalTeamsInLeague: teamCount };
  }, [leaderboard, teamA, teamB]);

  // Compute breakdown by race category with rank among all 20 teams in the league
  const categoryComparisonData = useMemo(() => {
    if (!teamA || !teamB || !leaderboard) return { categories: [], totalA: 0, totalB: 0, totalTeamsInLeague: 1 };

    const allTeams = leaderboard.filter((t) => t.jugador !== "No draft" && t.nombreEquipo !== "No draft");
    const totalTeamsInLeague = allTeams.length || 1;

    // Build race to category mapping with alias normalization
    const raceToCat: Record<string, string> = {};

    const processCatRow = (r: any) => {
      const c = getVal(r, "Carrera")?.trim();
      const rawCat = getVal(r, "Categoría")?.trim();
      if (c && rawCat) {
        const cat = normalizeCategoryName(rawCat);
        raceToCat[c] = cat;
        raceToCat[c.toLowerCase()] = cat;
      }
    };

    if (files?.carreras?.data) {
      files.carreras.data.forEach(processCatRow);
    }
    if (files?.puntos?.data) {
      files.puntos.data.forEach(processCatRow);
    }

    // Calculate points in each category for ALL teams in the league
    const teamCatPtsMap: Record<string, Record<string, number>> = {};
    const teamCatRacesMap: Record<string, Record<string, Set<string>>> = {};

    allTeams.forEach((t) => {
      const tName = t.nombreEquipo || t.jugador;
      teamCatPtsMap[tName] = {};
      teamCatRacesMap[tName] = {};

      t.detalles?.forEach((d: any) => {
        const raceName = d.carrera;
        const rawCat = raceToCat[raceName] || raceToCat[raceName?.toLowerCase()] || "Otras / Sin Categoría";
        const cat = normalizeCategoryName(rawCat);

        if (!teamCatPtsMap[tName][cat]) teamCatPtsMap[tName][cat] = 0;
        teamCatPtsMap[tName][cat] += (d.puntosObtenidos || 0);

        if (!teamCatRacesMap[tName][cat]) teamCatRacesMap[tName][cat] = new Set();
        if (raceName) teamCatRacesMap[tName][cat].add(raceName);
      });
    });

    // Collect all unique categories that have AT LEAST 1 point scored by ANY team in the league
    const activeCategories = new Set<string>();
    Object.values(teamCatPtsMap).forEach((catPts) => {
      Object.entries(catPts).forEach(([cat, pts]) => {
        if (pts > 0) activeCategories.add(cat);
      });
    });

    const teamAPlayer = leaderboard.find((p) => (p.nombreEquipo || p.jugador) === teamA);
    const teamBPlayer = leaderboard.find((p) => (p.nombreEquipo || p.jugador) === teamB);

    const totalA = teamAPlayer?.puntos || 1;
    const totalB = teamBPlayer?.puntos || 1;

    // Build ranking for each category across all teams in league
    const categories = Array.from(activeCategories).map((cat) => {
      const sortedTeamsForCat = [...allTeams].map((t) => {
        const tName = t.nombreEquipo || t.jugador;
        return { tName, pts: teamCatPtsMap[tName]?.[cat] || 0 };
      }).sort((a, b) => b.pts - a.pts);

      const catRankMap: Record<string, number> = {};
      sortedTeamsForCat.forEach((item, idx) => {
        catRankMap[item.tName] = idx + 1;
      });

      const ptsA = teamCatPtsMap[teamA]?.[cat] || 0;
      const ptsB = teamCatPtsMap[teamB]?.[cat] || 0;

      const rankA = catRankMap[teamA] || totalTeamsInLeague;
      const rankB = catRankMap[teamB] || totalTeamsInLeague;

      const racesCountA = teamCatRacesMap[teamA]?.[cat]?.size || 0;
      const racesCountB = teamCatRacesMap[teamB]?.[cat]?.size || 0;

      const diff = ptsA - ptsB;
      const pctA = Math.round((ptsA / totalA) * 100);
      const pctB = Math.round((ptsB / totalB) * 100);

      return {
        category: cat,
        ptsA,
        ptsB,
        rankA,
        rankB,
        pctA,
        pctB,
        diff,
        racesCountA,
        racesCountB,
        totalCategoryPts: ptsA + ptsB,
        winner: ptsA > ptsB ? "A" : ptsB > ptsA ? "B" : "TIE",
      };
    }).sort((a, b) => {
      const rankA = getCategoryOrderRank(a.category);
      const rankB = getCategoryOrderRank(b.category);
      if (rankA !== rankB) return rankA - rankB;
      return b.totalCategoryPts - a.totalCategoryPts;
    });

    return { categories, totalA, totalB, totalTeamsInLeague };
  }, [leaderboard, teamA, teamB, files]);

  // Extra Insight 1: Efficiency by Draft Tiers
  const draftTiersData = useMemo(() => {
    if (!files?.elecciones?.data || !teamA || !teamB) return [];

    const tiers = [
      { name: "Primeras Espadas (Rondas 1-5)", minR: 1, maxR: 5 },
      { name: "Bloque Medio (Rondas 6-12)", minR: 6, maxR: 12 },
      { name: "Fondo de Armario (Rondas 13+)", minR: 13, maxR: 999 },
    ];

    const teamAPicks: { ronda: number; ciclista: string; pts: number }[] = [];
    const teamBPicks: { ronda: number; ciclista: string; pts: number }[] = [];

    files.elecciones.data.forEach((row: any) => {
      const tName = String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG") || "").trim();
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      const rNum = parseInt(String(getVal(row, "Ronda") || "1"), 10) || 1;
      const pts = cyclistTotalPoints[ciclista] || 0;

      if (tName === teamA && ciclista) {
        teamAPicks.push({ ronda: rNum, ciclista, pts });
      }
      if (tName === teamB && ciclista) {
        teamBPicks.push({ ronda: rNum, ciclista, pts });
      }
    });

    return tiers.map((tier) => {
      const picksA = teamAPicks.filter((p) => p.ronda >= tier.minR && p.ronda <= tier.maxR);
      const picksB = teamBPicks.filter((p) => p.ronda >= tier.minR && p.ronda <= tier.maxR);

      const ptsA = picksA.reduce((sum, p) => sum + p.pts, 0);
      const ptsB = picksB.reduce((sum, p) => sum + p.pts, 0);

      const countA = picksA.length || 1;
      const countB = picksB.length || 1;

      const avgA = Math.round(ptsA / countA);
      const avgB = Math.round(ptsB / countB);

      const bestPickA = [...picksA].sort((a, b) => b.pts - a.pts)[0];
      const bestPickB = [...picksB].sort((a, b) => b.pts - a.pts)[0];

      return {
        tierName: tier.name,
        ptsA,
        ptsB,
        countA: picksA.length,
        countB: picksB.length,
        avgA,
        avgB,
        diff: ptsA - ptsB,
        bestPickA: bestPickA ? `${bestPickA.ciclista} (${bestPickA.pts}p)` : "-",
        bestPickB: bestPickB ? `${bestPickB.ciclista} (${bestPickB.pts}p)` : "-",
        winner: ptsA > ptsB ? "A" : ptsB > ptsA ? "B" : "TIE",
      };
    });
  }, [files?.elecciones?.data, teamA, teamB, cyclistTotalPoints]);

  // Extra Insight 2: Top 3 MVPs Head to Head
  const mvpData = useMemo(() => {
    if (!files?.elecciones?.data || !teamA || !teamB) return { mvpA: [], mvpB: [] };

    const teamAPicks: { ciclista: string; pts: number; ronda: number }[] = [];
    const teamBPicks: { ciclista: string; pts: number; ronda: number }[] = [];

    files.elecciones.data.forEach((row: any) => {
      const tName = String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG") || "").trim();
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      const rNum = parseInt(String(getVal(row, "Ronda") || "1"), 10) || 1;
      const pts = cyclistTotalPoints[ciclista] || 0;

      if (tName === teamA && ciclista) {
        teamAPicks.push({ ciclista, pts, ronda: rNum });
      }
      if (tName === teamB && ciclista) {
        teamBPicks.push({ ciclista, pts, ronda: rNum });
      }
    });

    const mvpA = teamAPicks.sort((a, b) => b.pts - a.pts).slice(0, 3);
    const mvpB = teamBPicks.sort((a, b) => b.pts - a.pts).slice(0, 3);

    return { mvpA, mvpB };
  }, [files?.elecciones?.data, teamA, teamB, cyclistTotalPoints]);

  if (!availableTeams || availableTeams.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500 bg-white rounded-2xl border border-neutral-200 shadow-sm">
        No hay datos suficientes del draft para realizar comparativas.
      </div>
    );
  }

  const { rounds, summaryA, summaryB, roundsWonA, roundsWonB, ties, finalCumulativeDiff } = comparisonData;
  const { monthlyChartData, totalTeamsInLeague } = monthlyData;
  const { categories, totalTeamsInLeague: totalTeamsCategory } = categoryComparisonData;

  const showRondas = activeViewMode === "all" || activeViewMode === "rondas";
  const showMeses = activeViewMode === "all" || activeViewMode === "meses";
  const showCategorias = activeViewMode === "all" || activeViewMode === "categorias";
  const showDraft = activeViewMode === "all" || activeViewMode === "draft";

  return (
    <div className="space-y-6">
      {/* Team Selection and Share Controls Header Bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Team A Picker (Orange) */}
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
              Equipo 1 (A)
            </label>
            <select
              value={teamA}
              onChange={(e) => setCompTeamA(e.target.value)}
              className="w-full bg-orange-50/60 border border-orange-200 rounded-xl px-4 py-2.5 text-sm font-bold text-orange-900 focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
            >
              {availableTeams.map((t) => (
                <option key={t.name} value={t.name} disabled={t.name === teamB}>
                  {t.name} ({t.jugador}) - {t.puntos} pts
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <Button
            variant="outline"
            onClick={handleSwap}
            className="self-center p-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-transform active:scale-95 shadow-xs mt-2 md:mt-5"
            title="Intercambiar Equipos A <-> B"
          >
            <ArrowLeftRight className="w-5 h-5 text-neutral-700" />
          </Button>

          {/* Team B Picker (Purple) */}
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
              Equipo 2 (B)
            </label>
            <select
              value={teamB}
              onChange={(e) => setCompTeamB(e.target.value)}
              className="w-full bg-purple-50/60 border border-purple-200 rounded-xl px-4 py-2.5 text-sm font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
            >
              {availableTeams.map((t) => (
                <option key={t.name} value={t.name} disabled={t.name === teamA}>
                  {t.name} ({t.jugador}) - {t.puntos} pts
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
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
                  fileName: `comparativa-${teamA.replace(/\s+/g, "-").toLowerCase()}-vs-${teamB.replace(/\s+/g, "-").toLowerCase()}.png`,
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

        {/* Segmented Section View Switcher Bar */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveViewMode("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeViewMode === "all"
                ? "bg-neutral-900 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Ver Todo</span>
          </button>

          <button
            onClick={() => setActiveViewMode("rondas")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeViewMode === "rondas"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Cara a Cara por Ronda</span>
          </button>

          <button
            onClick={() => setActiveViewMode("meses")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeViewMode === "meses"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Evolución Mensual</span>
          </button>

          <button
            onClick={() => setActiveViewMode("categorias")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeViewMode === "categorias"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Por Categorías</span>
          </button>

          <button
            onClick={() => setActiveViewMode("draft")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0",
              activeViewMode === "draft"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bloques Draft & MVPs</span>
          </button>
        </div>
      </div>

      {teamA && teamB && summaryA && summaryB && (
        <div ref={comparisonContainerRef} className="space-y-6 bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 shadow-xs">
          {/* Head-to-Head Comparison Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Team A Card (Orange Theme) */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-3 top-3 opacity-10">
                <Trophy className="w-24 h-24" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-400/30 px-2 py-0.5 rounded text-orange-100 inline-block mb-2">
                  Equipo A
                </span>
                <h3 className="text-lg font-black truncate">{summaryA.name}</h3>
                <p className="text-xs text-orange-100">{summaryA.jugador}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-orange-400/30 flex justify-between items-end">
                <div>
                  <span className="text-2xl font-black">{summaryA.totalPts.toLocaleString()}</span>
                  <span className="text-xs text-orange-200 ml-1">pts</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-orange-800/60 px-2.5 py-1 rounded">
                    🏆 {roundsWonA} rondas ganadas
                  </span>
                </div>
              </div>
            </div>

            {/* VS Status Indicator */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
                Diferencia Total
              </span>
              <div
                className={cn(
                  "text-3xl font-black font-mono tracking-tight my-1",
                  finalCumulativeDiff > 0
                    ? "text-orange-600"
                    : finalCumulativeDiff < 0
                    ? "text-purple-600"
                    : "text-neutral-700"
                )}
              >
                {finalCumulativeDiff > 0
                  ? `+${finalCumulativeDiff.toLocaleString()} A`
                  : finalCumulativeDiff < 0
                  ? `+${Math.abs(finalCumulativeDiff).toLocaleString()} B`
                  : "Empate"}
              </div>
              <p className="text-xs font-medium text-neutral-500 mt-1">
                {finalCumulativeDiff > 0 ? (
                  <span className="text-orange-700 font-bold">Ventaja para {summaryA.name}</span>
                ) : finalCumulativeDiff < 0 ? (
                  <span className="text-purple-700 font-bold">Ventaja para {summaryB.name}</span>
                ) : (
                  "Misma puntuación global"
                )}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-neutral-500 bg-neutral-50 px-3 py-1 rounded-full border border-neutral-200">
                <span>Rondas: A ({roundsWonA})</span>
                <span>•</span>
                <span>Empates ({ties})</span>
                <span>•</span>
                <span>B ({roundsWonB})</span>
              </div>
            </div>

            {/* Team B Card (Purple Theme) */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-3 top-3 opacity-10">
                <Trophy className="w-24 h-24" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-400/30 px-2 py-0.5 rounded text-purple-100 inline-block mb-2">
                  Equipo B
                </span>
                <h3 className="text-lg font-black truncate">{summaryB.name}</h3>
                <p className="text-xs text-purple-100">{summaryB.jugador}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-400/30 flex justify-between items-end">
                <div>
                  <span className="text-2xl font-black">{summaryB.totalPts.toLocaleString()}</span>
                  <span className="text-xs text-purple-200 ml-1">pts</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-purple-900/60 px-2.5 py-1 rounded">
                    🏆 {roundsWonB} rondas ganadas
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RADAR CHART: 20 PICKS COMPARISON (Placed immediately after KPIs) */}
          {(activeViewMode === "all" || activeViewMode === "rondas" || activeViewMode === "draft") && radarData.length > 0 && (
            <ReportCard
              title="Radar Comparativo de los 20 Picks del Draft"
              subtitle="Escala normalizada (0% a 100%) donde cada radio toma como referencia el mejor ciclista de toda la liga en esa ronda."
              icon={<Target className="w-5 h-5 text-orange-600" />}
              filename={`radar-20-picks-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
              toolbarProps={{
                isExpanded: isExpandedRadar,
                onExpand: () => setIsExpandedRadar(!isExpandedRadar),
              }}
              bodyClassName="p-6 pt-2"
            >
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                <div className="h-[380px] sm:h-[420px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="roundLabel"
                        tick={{ fill: "#374151", fontSize: 11, fontWeight: 700 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tickFormatter={(val) => `${val}%`}
                        stroke="#9ca3af"
                        tick={{ fill: "#6b7280", fontSize: 10 }}
                      />
                      <Radar
                        name={summaryA?.name || teamA}
                        dataKey="valA"
                        stroke="#ea580c"
                        fill="#ea580c"
                        fillOpacity={0.35}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                      <Radar
                        name={summaryB?.name || teamB}
                        dataKey="valB"
                        stroke="#9333ea"
                        fill="#9333ea"
                        fillOpacity={0.35}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                      <RechartsTooltip content={<CustomRadarTooltip teamA={summaryA?.name || teamA} teamB={summaryB?.name || teamB} />} />
                      <Legend
                        wrapperStyle={{ paddingTop: "12px", fontSize: "12px", fontWeight: "bold" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ReportCard>
          )}

          {/* SECTION 1: ROUND BY ROUND COMPARISON TABLE */}
          {showRondas && (
            <ReportCard
              title="Cara a Cara por Ronda y Diferencia Acumulada"
              subtitle="Puntos e impacto de cada elección en su ronda, con la posición del ciclista entre todas las elecciones de esa ronda."
              icon={<BarChart2 className="w-5 h-5 text-orange-600" />}
              filename={`comparacion-rondas-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
              toolbarProps={{
                isExpanded: isExpandedRounds,
                onExpand: () => setIsExpandedRounds(!isExpandedRounds),
              }}
              bodyClassName="p-6 pt-2"
            >
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[850px] text-xs">
                    <thead className="select-none">
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                        <th className="px-3 py-3 border-r border-neutral-200 w-16 text-center">Ronda</th>
                        <th className="px-4 py-3 bg-orange-50/50 text-orange-950 border-r border-orange-100 min-w-[240px]">
                          Pick Equipo A: {summaryA.name}
                        </th>
                        <th className="px-4 py-3 bg-purple-50/50 text-purple-900 border-r border-purple-100 min-w-[240px]">
                          Pick Equipo B: {summaryB.name}
                        </th>
                        <th className="px-3 py-3 text-center border-r border-neutral-200 min-w-[120px] bg-neutral-100/50">
                          Dif. Ronda
                        </th>
                        <th className="px-4 py-3 text-center bg-amber-50/60 text-amber-900 font-bold min-w-[160px]">
                          Diferencia Acumulada
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {rounds.map((r) => {
                        const isAWinner = r.winner === "A";
                        const isBWinner = r.winner === "B";

                        const infoA = roundPicksMap[`${r.ronda}_${r.pickA.ciclista}`];
                        const infoB = roundPicksMap[`${r.ronda}_${r.pickB.ciclista}`];

                        return (
                          <tr key={r.ronda} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="px-3 py-2.5 text-center border-r border-neutral-200 font-mono font-bold text-neutral-600 bg-neutral-50">
                              Ronda {r.ronda}
                            </td>

                            {/* Pick Team A (Orange) */}
                            <td className={cn("px-4 py-2.5 border-r border-neutral-100", isAWinner ? "bg-orange-50/60 font-medium" : "bg-white")}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <span className={cn("truncate", isAWinner ? "font-bold text-orange-900" : "text-neutral-700")} title={r.pickA.ciclista}>
                                    {r.pickA.ciclista}
                                  </span>

                                  {/* Round Rank Indicator */}
                                  {infoA && (
                                    <span className="shrink-0">
                                      {infoA.isBest ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300" title="¡El mejor pick de esta ronda en toda la liga!">
                                          👑 {infoA.rank}º/{infoA.totalInRound}
                                        </span>
                                      ) : infoA.isWorst ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200" title="El pick con menos puntos de esta ronda">
                                          🔻 {infoA.rank}º/{infoA.totalInRound}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-mono text-neutral-400 font-medium" title={`Puesto ${infoA.rank} de ${infoA.totalInRound} en esta ronda`}>
                                          #{infoA.rank}/{infoA.totalInRound}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>

                                <span className={cn("font-mono tabular-nums px-2 py-0.5 rounded text-xs shrink-0 font-bold", isAWinner ? "bg-orange-200/70 text-orange-900" : "bg-neutral-100 text-neutral-600")}>
                                  {r.pickA.puntos} pts
                                </span>
                              </div>
                            </td>

                            {/* Pick Team B (Purple) */}
                            <td className={cn("px-4 py-2.5 border-r border-neutral-100", isBWinner ? "bg-purple-50/60 font-medium" : "bg-white")}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <span className={cn("truncate", isBWinner ? "font-bold text-purple-900" : "text-neutral-700")} title={r.pickB.ciclista}>
                                    {r.pickB.ciclista}
                                  </span>

                                  {/* Round Rank Indicator */}
                                  {infoB && (
                                    <span className="shrink-0">
                                      {infoB.isBest ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300" title="¡El mejor pick de esta ronda en toda la liga!">
                                          👑 {infoB.rank}º/{infoB.totalInRound}
                                        </span>
                                      ) : infoB.isWorst ? (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200" title="El pick con menos puntos de esta ronda">
                                          🔻 {infoB.rank}º/{infoB.totalInRound}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-mono text-neutral-400 font-medium" title={`Puesto ${infoB.rank} de ${infoB.totalInRound} en esta ronda`}>
                                          #{infoB.rank}/{infoB.totalInRound}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>

                                <span className={cn("font-mono tabular-nums px-2 py-0.5 rounded text-xs shrink-0 font-bold", isBWinner ? "bg-purple-200/70 text-purple-900" : "bg-neutral-100 text-neutral-600")}>
                                  {r.pickB.puntos} pts
                                </span>
                              </div>
                            </td>

                            <td className="px-3 py-2.5 text-center border-r border-neutral-200 bg-neutral-50/30">
                              <span className={cn("inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-mono font-bold tabular-nums", r.diffRound > 0 ? "bg-orange-100 text-orange-900" : r.diffRound < 0 ? "bg-purple-100 text-purple-800" : "bg-neutral-200 text-neutral-600")}>
                                {r.diffRound > 0 ? `+${r.diffRound} (A)` : r.diffRound < 0 ? `+${Math.abs(r.diffRound)} (B)` : "0"}
                              </span>
                            </td>

                            <td className={cn("px-4 py-2.5 text-center font-mono font-black tabular-nums text-xs", r.cumulativeDiff > 0 ? "bg-orange-50 text-orange-900" : r.cumulativeDiff < 0 ? "bg-purple-50 text-purple-900" : "bg-neutral-100 text-neutral-700")}>
                              <div className="flex items-center justify-center gap-1.5">
                                <span>
                                  {r.cumulativeDiff > 0 ? `+${r.cumulativeDiff}` : r.cumulativeDiff < 0 ? `+${Math.abs(r.cumulativeDiff)}` : "0"}
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-white/80 border border-neutral-200/80 shadow-2xs">
                                  {r.cumulativeLeader === "A" ? `Líder: A` : r.cumulativeLeader === "B" ? `Líder: B` : "Empate"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot className="bg-neutral-100 border-t-2 border-neutral-300 font-bold text-xs">
                      <tr>
                        <td className="px-3 py-3 text-center text-neutral-600">TOTAL</td>
                        <td className="px-4 py-3 bg-orange-100/70 text-orange-950 font-black text-right pr-6">
                          {summaryA.totalPts.toLocaleString()} pts
                        </td>
                        <td className="px-4 py-3 bg-purple-100/70 text-purple-950 font-black text-right pr-6">
                          {summaryB.totalPts.toLocaleString()} pts
                        </td>
                        <td className="px-3 py-3 text-center text-neutral-500 font-mono">
                          Rondas: {roundsWonA}A - {roundsWonB}B
                        </td>
                        <td className={cn("px-4 py-3 text-center font-black font-mono text-sm", finalCumulativeDiff > 0 ? "bg-orange-200 text-orange-900" : finalCumulativeDiff < 0 ? "bg-purple-200 text-purple-900" : "bg-neutral-200 text-neutral-800")}>
                          {finalCumulativeDiff > 0 ? `+${finalCumulativeDiff} (A Gana)` : finalCumulativeDiff < 0 ? `+${Math.abs(finalCumulativeDiff)} (B Gana)` : "Empate Final"}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </ReportCard>
          )}

          {/* SECTION 2: MONTHLY EVOLUTION CHARTS & TABLE */}
          {showMeses && (
            <div className="space-y-6 pt-2">
              <ReportCard
                title="Evolución de Posiciones y Puntos Mensuales"
                subtitle="Gráficas de trayectoria de puesto oficial en la liga y aceleración de puntos acumulados mes a mes."
                icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                filename={`evolucion-graficas-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
                toolbarProps={{
                  isExpanded: isExpandedCharts,
                  onExpand: () => setIsExpandedCharts(!isExpandedCharts),
                }}
                bodyClassName="p-6 pt-2"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 1: Monthly Ranking Evolution in League */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-orange-600" />
                          Evolución de Posiciones Mensual en Liga
                        </h4>
                        <p className="text-[10px] text-neutral-500">
                          Puesto oficial en la liga al final de cada mes (el puesto 1º se sitúa arriba).
                        </p>
                      </div>
                      <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200">
                        {totalTeamsInLeague} equipos
                      </span>
                    </div>

                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                          <YAxis
                            reversed={true}
                            domain={[1, Math.max(totalTeamsInLeague, 2)]}
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickFormatter={(v) => `${v}º`}
                          />
                          <RechartsTooltip content={<CustomPositionTooltip teamA={teamA} teamB={teamB} />} />
                          <Line
                            type="monotone"
                            dataKey="teamARank"
                            name={teamA}
                            stroke="#ea580c"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#ea580c", strokeWidth: 2, stroke: "#ffffff" }}
                            activeDot={{ r: 7 }}
                            isAnimationActive={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="teamBRank"
                            name={teamB}
                            stroke="#9333ea"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#9333ea", strokeWidth: 2, stroke: "#ffffff" }}
                            activeDot={{ r: 7 }}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-1 border-t border-neutral-100">
                      <span className="flex items-center gap-1.5 text-orange-700">
                        <span className="w-3 h-3 rounded-full bg-orange-600 inline-block" />
                        {teamA}
                      </span>
                      <span className="flex items-center gap-1.5 text-purple-700">
                        <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
                        {teamB}
                      </span>
                    </div>
                  </div>

                  {/* Chart 2: Monthly Cumulative Points Evolution */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                          <BarChart2 className="w-4 h-4 text-purple-600" />
                          Evolución de Puntos Acumulados Mensuales
                        </h4>
                        <p className="text-[10px] text-neutral-500">
                          Crecimiento progresivo de la puntuación total mes a mes.
                        </p>
                      </div>
                    </div>

                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                          <RechartsTooltip content={<CustomPointsTooltip teamA={teamA} teamB={teamB} />} />
                          <Area
                            type="monotone"
                            dataKey="teamACum"
                            name={teamA}
                            stroke="#ea580c"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorA)"
                            isAnimationActive={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="teamBCum"
                            name={teamB}
                            stroke="#9333ea"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorB)"
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-1 border-t border-neutral-100">
                      <span className="flex items-center gap-1.5 text-orange-700">
                        <span className="w-3 h-3 rounded-full bg-orange-600 inline-block" />
                        {teamA}
                      </span>
                      <span className="flex items-center gap-1.5 text-purple-700">
                        <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
                        {teamB}
                      </span>
                    </div>
                  </div>
                </div>
              </ReportCard>

              {/* Monthly Comparison Table with selective bold and short rank badge */}
              <ReportCard
                title="Comparativa de puntos y posiciones por meses"
                subtitle="Muestra los puntos ganados en el mes y el acumulado. Resaltado en negrita solo el valor máximo de cada duelo."
                icon={<Calendar className="w-5 h-5 text-orange-600" />}
                filename={`comparacion-meses-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
                toolbarProps={{
                  isExpanded: isExpandedMonths,
                  onExpand: () => setIsExpandedMonths(!isExpandedMonths),
                }}
                bodyClassName="p-6 pt-2"
              >
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[850px] text-xs">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider select-none">
                          <th className="px-3 py-3 border-r border-neutral-200 w-28 text-center">Mes</th>
                          <th className="px-4 py-3 bg-orange-50/50 text-orange-950 border-r border-orange-100 min-w-[140px]">
                            Puntos Mes {teamA}
                          </th>
                          <th className="px-4 py-3 bg-purple-50/50 text-purple-900 border-r border-purple-100 min-w-[140px]">
                            Puntos Mes {teamB}
                          </th>
                          <th className="px-3 py-3 text-center border-r border-neutral-200 min-w-[100px] bg-neutral-100/50">
                            Dif. Mes
                          </th>
                          <th className="px-4 py-3 bg-orange-100/30 text-orange-950 border-r border-orange-100 min-w-[140px]">
                            Acum. {teamA}
                          </th>
                          <th className="px-4 py-3 bg-purple-100/30 text-purple-950 border-r border-purple-100 min-w-[140px]">
                            Acum. {teamB}
                          </th>
                          <th className="px-4 py-3 text-center bg-amber-50/60 text-amber-900 font-bold min-w-[130px] border-r border-neutral-200">
                            Dif. Acumulada
                          </th>
                          <th className="px-3 py-3 text-center bg-neutral-50 min-w-[100px]">
                            Duelo Pos. (A vs B)
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-neutral-100 text-xs">
                        {monthlyChartData.map((m) => {
                          const isPtsAMax = m.teamAPtsMonth > m.teamBPtsMonth;
                          const isPtsBMax = m.teamBPtsMonth > m.teamAPtsMonth;

                          const isCumAMax = m.teamACum > m.teamBCum;
                          const isCumBMax = m.teamBCum > m.teamACum;

                          return (
                            <tr key={m.monthIndex} className="hover:bg-neutral-50/80 transition-colors">
                              <td className="px-3 py-2.5 text-center border-r border-neutral-200 font-medium text-neutral-800 bg-neutral-50">
                                {m.monthFull}
                              </td>

                              {/* Puntos Mes Team A (bold only if max) */}
                              <td className={cn("px-4 py-2.5 border-r border-neutral-100", isPtsAMax ? "bg-orange-50/40" : "bg-white")}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className={cn("font-mono", isPtsAMax ? "font-bold text-orange-950" : "font-normal text-neutral-600")}>
                                    +{m.teamAPtsMonth.toLocaleString()} pts
                                  </span>
                                  {renderRankBadge(m.singleMonthRankA, totalTeamsInLeague)}
                                </div>
                              </td>

                              {/* Puntos Mes Team B (bold only if max) */}
                              <td className={cn("px-4 py-2.5 border-r border-neutral-100", isPtsBMax ? "bg-purple-50/40" : "bg-white")}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className={cn("font-mono", isPtsBMax ? "font-bold text-purple-950" : "font-normal text-neutral-600")}>
                                    +{m.teamBPtsMonth.toLocaleString()} pts
                                  </span>
                                  {renderRankBadge(m.singleMonthRankB, totalTeamsInLeague)}
                                </div>
                              </td>

                              {/* Dif. Mes (unbolded) */}
                              <td className="px-3 py-2.5 text-center border-r border-neutral-200 bg-neutral-50/30 font-mono font-normal">
                                <span className={cn("px-2 py-0.5 rounded text-xs", m.diffMonth > 0 ? "bg-orange-100 text-orange-900" : m.diffMonth < 0 ? "bg-purple-100 text-purple-800" : "bg-neutral-200 text-neutral-600")}>
                                  {m.diffMonth > 0 ? `+${m.diffMonth} (A)` : m.diffMonth < 0 ? `+${Math.abs(m.diffMonth)} (B)` : "0"}
                                </span>
                              </td>

                              {/* Acum. Team A (bold only if max) */}
                              <td className={cn("px-4 py-2.5 border-r border-orange-100", isCumAMax ? "bg-orange-50/50" : "bg-white")}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className={cn("font-mono", isCumAMax ? "font-bold text-orange-950" : "font-normal text-neutral-600")}>
                                    {m.teamACum.toLocaleString()} pts
                                  </span>
                                  {renderRankBadge(m.teamARank, totalTeamsInLeague)}
                                </div>
                              </td>

                              {/* Acum. Team B (bold only if max) */}
                              <td className={cn("px-4 py-2.5 border-r border-purple-100", isCumBMax ? "bg-purple-50/50" : "bg-white")}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className={cn("font-mono", isCumBMax ? "font-bold text-purple-950" : "font-normal text-neutral-600")}>
                                    {m.teamBCum.toLocaleString()} pts
                                  </span>
                                  {renderRankBadge(m.teamBRank, totalTeamsInLeague)}
                                </div>
                              </td>

                              {/* Dif. Acumulada (unbolded) */}
                              <td className={cn("px-4 py-2.5 text-center font-mono font-normal text-xs border-r border-neutral-200", m.diffCum > 0 ? "bg-orange-100/40 text-orange-950" : m.diffCum < 0 ? "bg-purple-100/40 text-purple-900" : "bg-neutral-100 text-neutral-700")}>
                                {m.diffCum > 0 ? `+${m.diffCum.toLocaleString()} (A)` : m.diffCum < 0 ? `+${Math.abs(m.diffCum).toLocaleString()} (B)` : "0"}
                              </td>

                              {/* Duelo Posiciones */}
                              <td className="px-3 py-2.5 text-center font-mono font-normal text-xs bg-neutral-50">
                                <span className="text-orange-700 font-medium">{m.teamARank}º</span>
                                <span className="text-neutral-400 mx-1">vs</span>
                                <span className="text-purple-700 font-medium">{m.teamBRank}º</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </ReportCard>
            </div>
          )}

          {/* SECTION 3: RACE CATEGORY COMPARISON TABLE */}
          {showCategorias && (
            <ReportCard
              title="Comparativa de Puntos por Categoría de Carrera"
              subtitle="Ordenado por jerarquía oficial: Tour, Giro, Vuelta, Mundiales, Monumentos, Europeos, UWT, Pro (.Pro), .1 y .2. Negrita únicamente en la cifra más alta de cada duelo."
              icon={<Award className="w-5 h-5 text-emerald-600" />}
              filename={`comparacion-categorias-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
              toolbarProps={{
                isExpanded: isExpandedCategory,
                onExpand: () => setIsExpandedCategory(!isExpandedCategory),
              }}
              bodyClassName="p-6 pt-2"
            >
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[850px] text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-bold text-neutral-500 tracking-wider select-none">
                        <th className="px-4 py-3 border-r border-neutral-200 min-w-[180px]">Categoría</th>
                        <th className="px-4 py-3 bg-orange-50/50 text-orange-950 border-r border-orange-100 min-w-[180px]">
                          Puntos {teamA} (Puesto / {totalTeamsCategory})
                        </th>
                        <th className="px-4 py-3 bg-purple-50/50 text-purple-900 border-r border-purple-100 min-w-[180px]">
                          Puntos {teamB} (Puesto / {totalTeamsCategory})
                        </th>
                        <th className="px-3 py-3 text-center border-r border-neutral-200 min-w-[110px] bg-neutral-100/50">
                          Dif. Categoría
                        </th>
                        <th className="px-4 py-3 text-center min-w-[180px] bg-neutral-50">
                          Distribución A vs B
                        </th>
                        <th className="px-3 py-3 text-center bg-amber-50/60 text-amber-900 font-bold min-w-[120px]">
                          Dominador
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {categories.map((cat) => {
                        const totalCatPts = cat.ptsA + cat.ptsB || 1;
                        const barPctA = Math.round((cat.ptsA / totalCatPts) * 100);
                        const barPctB = 100 - barPctA;

                        const isCatAMax = cat.ptsA > cat.ptsB;
                        const isCatBMax = cat.ptsB > cat.ptsA;

                        return (
                          <tr key={cat.category} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="px-4 py-3 border-r border-neutral-200 font-medium text-neutral-900 bg-neutral-50/50">
                              <div className="text-xs">{cat.category}</div>
                              <div className="text-[10px] text-neutral-400 font-normal mt-0.5">
                                {cat.racesCountA} carreras scored A • {cat.racesCountB} carreras scored B
                              </div>
                            </td>

                            {/* Puntos Team A (bold only if highest) */}
                            <td className={cn("px-4 py-3 border-r border-neutral-100", isCatAMax ? "bg-orange-50/40" : "bg-white")}>
                              <div className="flex items-center justify-between gap-2">
                                <span className={cn("font-mono text-sm", isCatAMax ? "font-bold text-orange-950" : "font-normal text-neutral-600")}>
                                  {cat.ptsA.toLocaleString()} pts
                                </span>
                                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200 shrink-0" title={`Posición de ${teamA} entre los ${totalTeamsCategory} equipos de la liga en ${cat.category}`}>
                                  {cat.rankA === 1 ? `👑 1º / ${totalTeamsCategory}` : cat.rankA === totalTeamsCategory ? `🔻 ${cat.rankA}º / ${totalTeamsCategory}` : `${cat.rankA}º / ${totalTeamsCategory}`}
                                </span>
                              </div>
                              <div className="text-[10px] text-neutral-500 font-normal mt-1">
                                {cat.pctA}% de los pts de {teamA}
                              </div>
                            </td>

                            {/* Puntos Team B (bold only if highest) */}
                            <td className={cn("px-4 py-3 border-r border-neutral-100", isCatBMax ? "bg-purple-50/40" : "bg-white")}>
                              <div className="flex items-center justify-between gap-2">
                                <span className={cn("font-mono text-sm", isCatBMax ? "font-bold text-purple-950" : "font-normal text-neutral-600")}>
                                  {cat.ptsB.toLocaleString()} pts
                                </span>
                                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200 shrink-0" title={`Posición de ${teamB} entre los ${totalTeamsCategory} equipos de la liga en ${cat.category}`}>
                                  {cat.rankB === 1 ? `👑 1º / ${totalTeamsCategory}` : cat.rankB === totalTeamsCategory ? `🔻 ${cat.rankB}º / ${totalTeamsCategory}` : `${cat.rankB}º / ${totalTeamsCategory}`}
                                </span>
                              </div>
                              <div className="text-[10px] text-neutral-500 font-normal mt-1">
                                {cat.pctB}% de los pts de {teamB}
                              </div>
                            </td>

                            <td className="px-3 py-3 text-center border-r border-neutral-200 bg-neutral-50/30 font-mono font-normal">
                              <span className={cn("px-2 py-0.5 rounded text-xs", cat.diff > 0 ? "bg-orange-100 text-orange-900" : cat.diff < 0 ? "bg-purple-100 text-purple-800" : "bg-neutral-200 text-neutral-600")}>
                                {cat.diff > 0 ? `+${cat.diff.toLocaleString()} (A)` : cat.diff < 0 ? `+${Math.abs(cat.diff).toLocaleString()} (B)` : "0"}
                              </span>
                            </td>

                            <td className="px-4 py-3 bg-neutral-50">
                              <div className="w-full bg-neutral-200 rounded-full h-3 flex overflow-hidden p-0.5 border border-neutral-300">
                                <div
                                  style={{ width: `${barPctA}%` }}
                                  className="bg-orange-600 h-full rounded-l-full transition-all"
                                  title={`${teamA}: ${barPctA}%`}
                                />
                                <div
                                  style={{ width: `${barPctB}%` }}
                                  className="bg-purple-600 h-full rounded-r-full transition-all"
                                  title={`${teamB}: ${barPctB}%`}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] font-medium mt-1 text-neutral-500">
                                <span className="text-orange-700">{barPctA}%</span>
                                <span className="text-purple-700">{barPctB}%</span>
                              </div>
                            </td>

                            <td className="px-3 py-3 text-center bg-amber-50/30">
                              <span className={cn("inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", cat.winner === "A" ? "bg-orange-100 text-orange-950 border border-orange-200" : cat.winner === "B" ? "bg-purple-100 text-purple-900 border border-purple-200" : "bg-neutral-100 text-neutral-700")}>
                                {cat.winner === "A" ? `Líder: ${teamA}` : cat.winner === "B" ? `Líder: ${teamB}` : "Empate"}
                              </span>
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

          {/* SECTION 4: DRAFT TIERS & MVPS HEAD TO HEAD */}
          {showDraft && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Draft Tiers Performance Breakdown */}
              <ReportCard
                title="Eficiencia por Tramos del Draft"
                subtitle="Rendimiento comparativo entre las primeras elecciones y el bloque medio/fondo de armario."
                icon={<Layers className="w-5 h-5 text-amber-600" />}
                filename={`eficiencia-tramos-draft-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
                toolbarProps={{
                  isExpanded: isExpandedTiers,
                  onExpand: () => setIsExpandedTiers(!isExpandedTiers),
                }}
                bodyClassName="p-6 pt-2"
              >
                <div className="space-y-3">
                  {draftTiersData.map((tier) => (
                    <div key={tier.tierName} className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800">{tier.tierName}</span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", tier.winner === "A" ? "bg-orange-100 text-orange-900" : tier.winner === "B" ? "bg-purple-100 text-purple-800" : "bg-neutral-200 text-neutral-700")}>
                          {tier.winner === "A" ? `Gana ${teamA}` : tier.winner === "B" ? `Gana ${teamB}` : "Empate"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-orange-50/70 p-2.5 rounded-lg border border-orange-100">
                          <div className="text-[10px] text-orange-700 font-bold uppercase">{teamA}</div>
                          <div className="text-sm font-black text-orange-950 mt-0.5">{tier.ptsA.toLocaleString()} pts</div>
                          <div className="text-[10px] text-neutral-500 mt-1">Mejor: <span className="font-semibold text-neutral-700">{tier.bestPickA}</span></div>
                        </div>

                        <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-100">
                          <div className="text-[10px] text-purple-700 font-bold uppercase">{teamB}</div>
                          <div className="text-sm font-black text-purple-950 mt-0.5">{tier.ptsB.toLocaleString()} pts</div>
                          <div className="text-[10px] text-neutral-500 mt-1">Mejor: <span className="font-semibold text-neutral-700">{tier.bestPickB}</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ReportCard>

              {/* Top 3 MVPs Head to Head */}
              <ReportCard
                title="Duelo de MVPs: Top 3 Ciclistas"
                subtitle="Los 3 mayores anotadores de puntos en la plantilla de cada equipo."
                icon={<Crown className="w-5 h-5 text-yellow-500" />}
                filename={`duelo-mvps-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
                toolbarProps={{
                  isExpanded: isExpandedMVPs,
                  onExpand: () => setIsExpandedMVPs(!isExpandedMVPs),
                }}
                bodyClassName="p-6 pt-2"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Team A MVPs (Orange Theme) */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-black text-orange-900 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 flex items-center justify-between">
                      <span className="truncate">{teamA}</span>
                      <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    </div>

                    {mvpData.mvpA.map((cic, idx) => (
                      <div key={cic.ciclista} className="bg-orange-50/40 border border-orange-100 p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div className="truncate mr-2">
                          <span className="text-[10px] font-bold text-orange-600 mr-1.5">#{idx + 1}</span>
                          <span className="font-bold text-neutral-800 truncate" title={cic.ciclista}>
                            {cic.ciclista}
                          </span>
                          <div className="text-[9px] text-neutral-400">Ronda {cic.ronda}</div>
                        </div>
                        <span className="font-mono font-black text-orange-900 bg-orange-100/80 px-2 py-0.5 rounded shrink-0">
                          {cic.pts}p
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Team B MVPs (Purple Theme) */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-black text-purple-900 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 flex items-center justify-between">
                      <span className="truncate">{teamB}</span>
                      <Zap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    </div>

                    {mvpData.mvpB.map((cic, idx) => (
                      <div key={cic.ciclista} className="bg-purple-50/40 border border-purple-100 p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div className="truncate mr-2">
                          <span className="text-[10px] font-bold text-purple-600 mr-1.5">#{idx + 1}</span>
                          <span className="font-bold text-neutral-800 truncate" title={cic.ciclista}>
                            {cic.ciclista}
                          </span>
                          <div className="text-[9px] text-neutral-400">Ronda {cic.ronda}</div>
                        </div>
                        <span className="font-mono font-black text-purple-900 bg-purple-100/80 px-2 py-0.5 rounded shrink-0">
                          {cic.pts}p
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ReportCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
