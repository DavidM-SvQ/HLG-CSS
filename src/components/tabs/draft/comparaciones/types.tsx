import React from "react";
import { AppState, PlayerScore, CyclistMetadata } from "../../../../lib/types";
import { getMonthIndexFromDate } from "../../../../lib/data-processing";

export interface DraftComparacionesProps {
  files: AppState;
  leaderboard: PlayerScore[];
  cyclistMetadata?: Record<string, CyclistMetadata>;
  playerTeamMap?: Record<string, string>;
  playerOrderMap?: Record<string, string>;
}

export interface AvailableTeam {
  name: string;
  jugador: string;
  puntos: number;
  orden: string;
}

export interface TeamSummary {
  name: string;
  jugador: string;
  puntos: number;
  orden?: string;
  totalPts: number;
}

export interface RoundPick {
  ciclista: string;
  puntos: number;
  eleccion: number;
}

export interface RoundComparisonItem {
  ronda: string;
  pickA: RoundPick;
  pickB: RoundPick;
  diffRound: number;
  cumulativeDiff: number;
  winner: "A" | "B" | "TIE";
  cumulativeLeader: "A" | "B" | "TIE";
}

export interface RoundRankInfo {
  rank: number;
  totalInRound: number;
  isBest: boolean;
  isWorst: boolean;
  maxPtsInRound: number;
}

export interface RadarItem {
  ronda: string;
  roundLabel: string;
  fullLabel: string;
  cyclistA: string;
  ptsA: number;
  valA: number;
  rankA: number;
  totalInRoundA: number;
  cyclistB: string;
  ptsB: number;
  valB: number;
  rankB: number;
  totalInRoundB: number;
  maxPtsInRound: number;
}

export interface MonthlyComparisonItem {
  monthIndex: number;
  month: string;
  monthFull: string;
  teamAPtsMonth: number;
  teamBPtsMonth: number;
  singleMonthRankA: number;
  singleMonthRankB: number;
  diffMonth: number;
  teamACum: number;
  teamBCum: number;
  teamARank: number;
  teamBRank: number;
  diffCum: number;
  winnerMonth: "A" | "B" | "TIE";
}

export interface CategoryComparisonItem {
  category: string;
  ptsA: number;
  ptsB: number;
  rankA: number;
  rankB: number;
  pctA: number;
  pctB: number;
  diff: number;
  racesCountA: number;
  racesCountB: number;
  totalCategoryPts: number;
  winner: "A" | "B" | "TIE";
}

export interface DraftTierItem {
  tierName: string;
  ptsA: number;
  ptsB: number;
  countA: number;
  countB: number;
  avgA: number;
  avgB: number;
  diff: number;
  bestPickA: string;
  bestPickB: string;
  winner: "A" | "B" | "TIE";
}

export interface MvpItem {
  ciclista: string;
  pts: number;
  ronda: number;
}

export const monthsFullNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const monthsShortNames = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export const getMonthIndexFromDateStr = (dateStr?: string): number => {
  return getMonthIndexFromDate(dateStr);
};

// Normalize category names and aliases (maps "MON", "MONUMENTO", "MONUMENTOS" -> "Monumentos", etc.)
export const normalizeCategoryName = (rawCat?: string): string => {
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
export const getCategoryOrderRank = (catName: string): number => {
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
export const renderRankBadge = (rank: number, total: number) => {
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
