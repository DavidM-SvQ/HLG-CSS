import React from "react";
import { Target } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip as RechartsTooltip,
} from "recharts";
import { ReportCard } from "../../../ui/ReportCard";
import { TeamComparisonCaptureHeader } from "./TeamComparisonCaptureHeader";
import { CustomRadarTooltip } from "./ComparisonTooltips";
import { RadarItem, TeamSummary } from "./types";

export interface RadarComparisonCardProps {
  radarData: RadarItem[];
  teamA: string;
  teamB: string;
  summaryA: TeamSummary | null;
  summaryB: TeamSummary | null;
  finalCumulativeDiff: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const RadarComparisonCard: React.FC<RadarComparisonCardProps> = ({
  radarData,
  teamA,
  teamB,
  summaryA,
  summaryB,
  finalCumulativeDiff,
  isExpanded,
  onToggleExpand,
}) => {
  if (!radarData || radarData.length === 0) return null;

  return (
    <ReportCard
      title={
        <span className="flex items-center gap-2 flex-wrap">
          <span>Radar Comparativo de 20 Picks:</span>
          <span className="text-orange-600 font-extrabold">{summaryA?.name || teamA}</span>
          <span className="text-neutral-400 font-bold text-xs uppercase">vs</span>
          <span className="text-purple-600 font-extrabold">{summaryB?.name || teamB}</span>
        </span>
      }
      subtitle="Escala normalizada (0% a 100%) donde cada radio toma como referencia el mejor ciclista de toda la liga en esa ronda."
      icon={<Target className="w-5 h-5 text-orange-600" />}
      filename={`radar-20-picks-${teamA.toLowerCase()}-vs-${teamB.toLowerCase()}`}
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
              <RechartsTooltip
                content={
                  <CustomRadarTooltip
                    teamA={summaryA?.name || teamA}
                    teamB={summaryB?.name || teamB}
                  />
                }
              />
              <Legend
                wrapperStyle={{ paddingTop: "12px", fontSize: "12px", fontWeight: "bold" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ReportCard>
  );
};
