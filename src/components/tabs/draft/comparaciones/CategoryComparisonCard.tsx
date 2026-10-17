import React from "react";
import { Award } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { ReportCard } from "../../../ui/ReportCard";
import { TeamComparisonCaptureHeader } from "./TeamComparisonCaptureHeader";
import { CategoryComparisonItem, TeamSummary } from "./types";

export interface CategoryComparisonCardProps {
  categories: CategoryComparisonItem[];
  totalTeamsCategory: number;
  teamA: string;
  teamB: string;
  summaryA: TeamSummary | null;
  summaryB: TeamSummary | null;
  finalCumulativeDiff: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const CategoryComparisonCard: React.FC<CategoryComparisonCardProps> = ({
  categories,
  totalTeamsCategory,
  teamA,
  teamB,
  summaryA,
  summaryB,
  finalCumulativeDiff,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <ReportCard
      title={
        <span className="flex items-center gap-2 flex-wrap">
          <span>Puntos por Categoría de Carrera:</span>
          <span className="text-orange-600 font-extrabold">{summaryA?.name || teamA}</span>
          <span className="text-neutral-400 font-bold text-xs uppercase">vs</span>
          <span className="text-purple-600 font-extrabold">{summaryB?.name || teamB}</span>
        </span>
      }
      subtitle="Ordenado por jerarquía oficial: Tour, Giro, Vuelta, Mundiales, Monumentos, Europeos, UWT, Pro (.Pro), .1 y .2. Negrita únicamente en la cifra más alta de cada duelo."
      icon={<Award className="w-5 h-5 text-emerald-600" />}
      filename={`comparacion-categorias-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
      toolbarProps={{
        isExpanded,
        onExpand: onToggleExpand,
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
                    <td
                      className={cn(
                        "px-4 py-3 border-r border-neutral-100",
                        isCatAMax ? "bg-orange-50/40" : "bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "font-mono text-sm",
                            isCatAMax ? "font-bold text-orange-950" : "font-normal text-neutral-600"
                          )}
                        >
                          {cat.ptsA.toLocaleString()} pts
                        </span>
                        <span
                          className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200 shrink-0"
                          title={`Posición de ${teamA} entre los ${totalTeamsCategory} equipos de la liga en ${cat.category}`}
                        >
                          {cat.rankA === 1
                            ? `👑 1º / ${totalTeamsCategory}`
                            : cat.rankA === totalTeamsCategory
                            ? `🔻 ${cat.rankA}º / ${totalTeamsCategory}`
                            : `${cat.rankA}º / ${totalTeamsCategory}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-normal mt-1">
                        {cat.pctA}% de los pts de {teamA}
                      </div>
                    </td>

                    {/* Puntos Team B (bold only if highest) */}
                    <td
                      className={cn(
                        "px-4 py-3 border-r border-neutral-100",
                        isCatBMax ? "bg-purple-50/40" : "bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "font-mono text-sm",
                            isCatBMax ? "font-bold text-purple-950" : "font-normal text-neutral-600"
                          )}
                        >
                          {cat.ptsB.toLocaleString()} pts
                        </span>
                        <span
                          className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200 shrink-0"
                          title={`Posición de ${teamB} entre los ${totalTeamsCategory} equipos de la liga en ${cat.category}`}
                        >
                          {cat.rankB === 1
                            ? `👑 1º / ${totalTeamsCategory}`
                            : cat.rankB === totalTeamsCategory
                            ? `🔻 ${cat.rankB}º / ${totalTeamsCategory}`
                            : `${cat.rankB}º / ${totalTeamsCategory}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-normal mt-1">
                        {cat.pctB}% de los pts de {teamB}
                      </div>
                    </td>

                    <td className="px-3 py-3 text-center border-r border-neutral-200 bg-neutral-50/30 font-mono font-normal">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs",
                          cat.diff > 0
                            ? "bg-orange-100 text-orange-900"
                            : cat.diff < 0
                            ? "bg-purple-100 text-purple-800"
                            : "bg-neutral-200 text-neutral-600"
                        )}
                      >
                        {cat.diff > 0
                          ? `+${cat.diff.toLocaleString()} (A)`
                          : cat.diff < 0
                          ? `+${Math.abs(cat.diff).toLocaleString()} (B)`
                          : "0"}
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
                      <span
                        className={cn(
                          "inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          cat.winner === "A"
                            ? "bg-orange-100 text-orange-950 border border-orange-200"
                            : cat.winner === "B"
                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                            : "bg-neutral-100 text-neutral-700"
                        )}
                      >
                        {cat.winner === "A"
                          ? `Líder: ${teamA}`
                          : cat.winner === "B"
                          ? `Líder: ${teamB}`
                          : "Empate"}
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
  );
};
