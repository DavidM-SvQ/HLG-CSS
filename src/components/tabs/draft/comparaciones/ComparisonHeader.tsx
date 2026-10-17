import React from "react";
import {
  ArrowLeftRight,
  Camera,
  Check,
  CloudDownload,
  ClipboardList,
  Share2,
  Grid,
  BarChart2,
  TrendingUp,
  Award,
  Layers,
  Trophy,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import { Button } from "../../../ui/button";
import { AvailableTeam, TeamSummary } from "./types";

export interface ComparisonHeaderProps {
  availableTeams: AvailableTeam[];
  teamA: string;
  teamB: string;
  onSelectTeamA: (team: string) => void;
  onSelectTeamB: (team: string) => void;
  onSwap: () => void;
  activeViewMode: "all" | "rondas" | "meses" | "categorias" | "draft";
  onSelectViewMode: (mode: "all" | "rondas" | "meses" | "categorias" | "draft") => void;
  isCopying: boolean;
  onCopyImage: () => void;
  onDownloadImage: () => void;
  onCopyText: () => void;
  isTextCopied: boolean;
  onShareLink: () => void;
  isLinkCopied: boolean;
  summaryA: TeamSummary | null;
  summaryB: TeamSummary | null;
  roundsWonA: number;
  roundsWonB: number;
  ties: number;
  finalCumulativeDiff: number;
}

export const ComparisonHeader: React.FC<ComparisonHeaderProps> = ({
  availableTeams,
  teamA,
  teamB,
  onSelectTeamA,
  onSelectTeamB,
  onSwap,
  activeViewMode,
  onSelectViewMode,
  isCopying,
  onCopyImage,
  onDownloadImage,
  onCopyText,
  isTextCopied,
  onShareLink,
  isLinkCopied,
  summaryA,
  summaryB,
  roundsWonA,
  roundsWonB,
  ties,
  finalCumulativeDiff,
}) => {
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
              onChange={(e) => onSelectTeamA(e.target.value)}
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
            onClick={onSwap}
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
              onChange={(e) => onSelectTeamB(e.target.value)}
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
              onClick={onCopyImage}
              disabled={isCopying}
              className="flex items-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs"
            >
              {isCopying ? <Check className="w-4 h-4 text-green-400" /> : <Camera className="w-4 h-4" />}
              <span>{isCopying ? "Copiando..." : "Copiar Imagen"}</span>
            </Button>

            <Button
              variant="outline"
              onClick={onDownloadImage}
              className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl px-4 py-2 text-xs font-medium transition-colors"
            >
              <CloudDownload className="w-4 h-4" />
              <span>Descargar Imagen</span>
            </Button>

            <Button
              variant="outline"
              onClick={onCopyText}
              className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl px-4 py-2 text-xs font-medium transition-colors"
            >
              {isTextCopied ? <Check className="w-4 h-4 text-green-600" /> : <ClipboardList className="w-4 h-4" />}
              <span>{isTextCopied ? "Texto copiado" : "Copiar Texto"}</span>
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={onShareLink}
            className="flex items-center gap-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-xl px-4 py-2 text-xs font-bold transition-colors w-full sm:w-auto justify-center"
          >
            {isLinkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-orange-600" />}
            <span>{isLinkCopied ? "Enlace copiado" : "Compartir Enlace Comparativa"}</span>
          </Button>
        </div>

        {/* Segmented Section View Switcher Bar */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => onSelectViewMode("all")}
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
            onClick={() => onSelectViewMode("rondas")}
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
            onClick={() => onSelectViewMode("meses")}
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
            onClick={() => onSelectViewMode("categorias")}
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
            onClick={() => onSelectViewMode("draft")}
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

      {/* Head-to-Head Comparison Summary Cards */}
      {summaryA && summaryB && (
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
      )}
    </div>
  );
};
