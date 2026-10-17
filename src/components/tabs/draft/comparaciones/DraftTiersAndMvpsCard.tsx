import React from "react";
import { Layers, Crown, Sparkles, Zap } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { ReportCard } from "../../../ui/ReportCard";
import { TeamComparisonCaptureHeader } from "./TeamComparisonCaptureHeader";
import { DraftTierItem, MvpItem, TeamSummary } from "./types";

export interface DraftTiersAndMvpsCardProps {
  draftTiersData: DraftTierItem[];
  mvpData: { mvpA: MvpItem[]; mvpB: MvpItem[] };
  teamA: string;
  teamB: string;
  summaryA: TeamSummary | null;
  summaryB: TeamSummary | null;
  finalCumulativeDiff: number;
  isExpandedTiers: boolean;
  onToggleExpandTiers: () => void;
  isExpandedMVPs: boolean;
  onToggleExpandMVPs: () => void;
}

export const DraftTiersAndMvpsCard: React.FC<DraftTiersAndMvpsCardProps> = ({
  draftTiersData,
  mvpData,
  teamA,
  teamB,
  summaryA,
  summaryB,
  finalCumulativeDiff,
  isExpandedTiers,
  onToggleExpandTiers,
  isExpandedMVPs,
  onToggleExpandMVPs,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
      {/* Draft Tiers Performance Breakdown */}
      <ReportCard
        title={
          <span className="flex items-center gap-2 flex-wrap">
            <span>Eficiencia por Tramos del Draft:</span>
            <span className="text-orange-600 font-extrabold">{summaryA?.name || teamA}</span>
            <span className="text-neutral-400 font-bold text-xs uppercase">vs</span>
            <span className="text-purple-600 font-extrabold">{summaryB?.name || teamB}</span>
          </span>
        }
        subtitle="Rendimiento comparativo entre las primeras elecciones y el bloque medio/fondo de armario."
        icon={<Layers className="w-5 h-5 text-amber-600" />}
        filename={`eficiencia-tramos-draft-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
        toolbarProps={{
          isExpanded: isExpandedTiers,
          onExpand: onToggleExpandTiers,
        }}
        bodyClassName="p-6 pt-2"
      >
        <TeamComparisonCaptureHeader
          summaryA={summaryA}
          summaryB={summaryB}
          teamA={teamA}
          teamB={teamB}
          totalPointsDiff={finalCumulativeDiff}
        />
        <div className="space-y-3">
          {draftTiersData.map((tier) => (
            <div
              key={tier.tierName}
              className="p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">{tier.tierName}</span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    tier.winner === "A"
                      ? "bg-orange-100 text-orange-900"
                      : tier.winner === "B"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-neutral-200 text-neutral-700"
                  )}
                >
                  {tier.winner === "A"
                    ? `Gana ${teamA}`
                    : tier.winner === "B"
                    ? `Gana ${teamB}`
                    : "Empate"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-orange-50/70 p-2.5 rounded-lg border border-orange-100">
                  <div className="text-[10px] text-orange-700 font-bold uppercase">{teamA}</div>
                  <div className="text-sm font-black text-orange-950 mt-0.5">
                    {tier.ptsA.toLocaleString()} pts
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">
                    Mejor: <span className="font-semibold text-neutral-700">{tier.bestPickA}</span>
                  </div>
                </div>

                <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-100">
                  <div className="text-[10px] text-purple-700 font-bold uppercase">{teamB}</div>
                  <div className="text-sm font-black text-purple-950 mt-0.5">
                    {tier.ptsB.toLocaleString()} pts
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">
                    Mejor: <span className="font-semibold text-neutral-700">{tier.bestPickB}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ReportCard>

      {/* Top 3 MVPs Head to Head */}
      <ReportCard
        title={
          <span className="flex items-center gap-2 flex-wrap">
            <span>Duelo de MVPs (Top 3):</span>
            <span className="text-orange-600 font-extrabold">{summaryA?.name || teamA}</span>
            <span className="text-neutral-400 font-bold text-xs uppercase">vs</span>
            <span className="text-purple-600 font-extrabold">{summaryB?.name || teamB}</span>
          </span>
        }
        subtitle="Los 3 mayores anotadores de puntos en la plantilla de cada equipo."
        icon={<Crown className="w-5 h-5 text-yellow-500" />}
        filename={`duelo-mvps-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
        toolbarProps={{
          isExpanded: isExpandedMVPs,
          onExpand: onToggleExpandMVPs,
        }}
        bodyClassName="p-6 pt-2"
      >
        <TeamComparisonCaptureHeader
          summaryA={summaryA}
          summaryB={summaryB}
          teamA={teamA}
          teamB={teamB}
          totalPointsDiff={finalCumulativeDiff}
        />
        <div className="grid grid-cols-2 gap-4">
          {/* Team A MVPs (Orange Theme) */}
          <div className="space-y-2.5">
            <div className="text-xs font-black text-orange-900 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 flex items-center justify-between">
              <span className="truncate">{teamA}</span>
              <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            </div>

            {mvpData.mvpA.map((cic, idx) => (
              <div
                key={cic.ciclista}
                className="bg-orange-50/40 border border-orange-100 p-2.5 rounded-xl flex items-center justify-between text-xs"
              >
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
              <div
                key={cic.ciclista}
                className="bg-purple-50/40 border border-purple-100 p-2.5 rounded-xl flex items-center justify-between text-xs"
              >
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
  );
};
