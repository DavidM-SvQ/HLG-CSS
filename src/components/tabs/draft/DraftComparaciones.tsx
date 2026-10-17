import React, { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useUrlState } from "../../../hooks/useUrlState";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import {
  DraftComparacionesProps,
  ComparisonHeader,
  TeamComparisonCaptureHeader,
  RadarComparisonCard,
  RoundComparisonCard,
  MonthlyComparisonCard,
  CategoryComparisonCard,
  DraftTiersAndMvpsCard,
  useDraftComparacionesData,
} from "./comparaciones";

export type { DraftComparacionesProps };

export const DraftComparaciones: React.FC<DraftComparacionesProps> = ({
  files,
  leaderboard,
  cyclistMetadata,
}) => {
  // URL state for selected teams to allow sharing comparison links
  const [compTeamA, setCompTeamA] = useUrlState<string>("compTeamA", "");
  const [compTeamB, setCompTeamB] = useUrlState<string>("compTeamB", "");
  const [activeViewMode, setActiveViewMode] = useUrlState<
    "all" | "rondas" | "meses" | "categorias" | "draft"
  >("compView", "all");

  // Initial pass to derive available team names for fallback defaults
  const basicTeams = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return [];
    return leaderboard
      .filter((p) => p.jugador !== "No draft" && p.nombreEquipo !== "No draft")
      .map((p) => p.nombreEquipo || p.jugador);
  }, [leaderboard]);

  const teamA = useMemo(() => {
    if (compTeamA && basicTeams.includes(compTeamA)) {
      return compTeamA;
    }
    return basicTeams[0] || "";
  }, [compTeamA, basicTeams]);

  const teamB = useMemo(() => {
    if (compTeamB && basicTeams.includes(compTeamB) && compTeamB !== teamA) {
      return compTeamB;
    }
    return basicTeams.find((t) => t !== teamA) || basicTeams[0] || "";
  }, [compTeamB, teamA, basicTeams]);

  const comparisonContainerRef = useRef<HTMLDivElement>(null);
  const [isExpandedRounds, setIsExpandedRounds] = useState(false);
  const [isExpandedMonths, setIsExpandedMonths] = useState(false);
  const [isExpandedCategory, setIsExpandedCategory] = useState(false);
  const [isExpandedCharts, setIsExpandedCharts] = useState(false);
  const [isExpandedTiers, setIsExpandedTiers] = useState(false);
  const [isExpandedMVPs, setIsExpandedMVPs] = useState(false);
  const [isExpandedRadar, setIsExpandedRadar] = useState(false);

  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isTextCopied, setIsTextCopied] = useState(false);

  // Table Screenshot Hook
  const { handleCopyImage, handleDownloadImage, isCopying } =
    useTableScreenshot(comparisonContainerRef);

  // Computed comparison domain data
  const {
    availableTeams,
    roundPicksMap,
    comparisonData,
    radarData,
    monthlyData,
    categoryComparisonData,
    draftTiersData,
    mvpData,
  } = useDraftComparacionesData({
    files,
    leaderboard,
    cyclistMetadata,
    teamA,
    teamB,
  });

  const { rounds, summaryA, summaryB, roundsWonA, roundsWonB, ties, finalCumulativeDiff } =
    comparisonData;
  const { monthlyChartData, totalTeamsInLeague } = monthlyData;
  const { categories, totalTeamsInLeague: totalTeamsCategory } = categoryComparisonData;

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

  // Copy plain text summary to clipboard
  const handleCopyText = () => {
    if (!comparisonData.rounds || comparisonData.rounds.length === 0) return;

    let text = `⚔️ COMPARATIVA DRAFT ⚔️\n`;
    text += `🟠 ${teamA}: ${comparisonData.summaryA?.totalPts} pts\n`;
    text += `🟣 ${teamB}: ${comparisonData.summaryB?.totalPts} pts\n`;
    text += `Diferencia Total: ${
      comparisonData.finalCumulativeDiff > 0
        ? `+${comparisonData.finalCumulativeDiff} pts (${teamA})`
        : comparisonData.finalCumulativeDiff < 0
        ? `+${Math.abs(comparisonData.finalCumulativeDiff)} pts (${teamB})`
        : "Empate"
    }\n\n`;
    text += `Desglose por Ronda:\n`;

    comparisonData.rounds.forEach((r) => {
      const diffStr =
        r.diffRound > 0 ? `+${r.diffRound} A` : r.diffRound < 0 ? `+${Math.abs(r.diffRound)} B` : "0";
      text += `• R${r.ronda}: ${r.pickA.ciclista} (${r.pickA.puntos}p) vs ${r.pickB.ciclista} (${
        r.pickB.puntos
      }p) => Dif: ${diffStr} | Acum: ${
        r.cumulativeDiff > 0
          ? `+${r.cumulativeDiff} (A)`
          : r.cumulativeDiff < 0
          ? `+${Math.abs(r.cumulativeDiff)} (B)`
          : "0"
      }\n`;
    });

    navigator.clipboard.writeText(text);
    setIsTextCopied(true);
    toast.success("Resumen en texto copiado al portapapeles");
    setTimeout(() => setIsTextCopied(false), 2500);
  };

  if (!availableTeams || availableTeams.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500 bg-white rounded-2xl border border-neutral-200 shadow-sm">
        No hay datos suficientes del draft para realizar comparativas.
      </div>
    );
  }

  const showRondas = activeViewMode === "all" || activeViewMode === "rondas";
  const showMeses = activeViewMode === "all" || activeViewMode === "meses";
  const showCategorias = activeViewMode === "all" || activeViewMode === "categorias";
  const showDraft = activeViewMode === "all" || activeViewMode === "draft";

  return (
    <div className="space-y-6">
      {/* Team Selection, Global Toolbar, Segmented View Tabs, and Summary KPI Cards */}
      <ComparisonHeader
        availableTeams={availableTeams}
        teamA={teamA}
        teamB={teamB}
        onSelectTeamA={setCompTeamA}
        onSelectTeamB={setCompTeamB}
        onSwap={handleSwap}
        activeViewMode={activeViewMode}
        onSelectViewMode={setActiveViewMode}
        isCopying={isCopying}
        onCopyImage={() => handleCopyImage()}
        onDownloadImage={() =>
          handleDownloadImage({
            fileName: `comparativa-${teamA.replace(/\s+/g, "-").toLowerCase()}-vs-${teamB
              .replace(/\s+/g, "-")
              .toLowerCase()}.png`,
          })
        }
        onCopyText={handleCopyText}
        isTextCopied={isTextCopied}
        onShareLink={handleShareLink}
        isLinkCopied={isLinkCopied}
        summaryA={summaryA}
        summaryB={summaryB}
        roundsWonA={roundsWonA}
        roundsWonB={roundsWonB}
        ties={ties}
        finalCumulativeDiff={finalCumulativeDiff}
      />

      {teamA && teamB && summaryA && summaryB && (
        <div
          ref={comparisonContainerRef}
          className="space-y-6 bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 shadow-xs"
        >
          {/* Header Banner with compared teams for complete page captures */}
          <TeamComparisonCaptureHeader
            summaryA={summaryA}
            summaryB={summaryB}
            teamA={teamA}
            teamB={teamB}
            totalPointsDiff={finalCumulativeDiff}
          />

          {/* Radar Chart: 20 Picks Comparison */}
          {(activeViewMode === "all" || activeViewMode === "rondas" || activeViewMode === "draft") &&
            radarData.length > 0 && (
              <RadarComparisonCard
                radarData={radarData}
                teamA={teamA}
                teamB={teamB}
                summaryA={summaryA}
                summaryB={summaryB}
                finalCumulativeDiff={finalCumulativeDiff}
                isExpanded={isExpandedRadar}
                onToggleExpand={() => setIsExpandedRadar(!isExpandedRadar)}
              />
            )}

          {/* Section 1: Round by Round Comparison Table */}
          {showRondas && (
            <RoundComparisonCard
              rounds={rounds}
              roundPicksMap={roundPicksMap}
              teamA={teamA}
              teamB={teamB}
              summaryA={summaryA}
              summaryB={summaryB}
              roundsWonA={roundsWonA}
              roundsWonB={roundsWonB}
              finalCumulativeDiff={finalCumulativeDiff}
              isExpanded={isExpandedRounds}
              onToggleExpand={() => setIsExpandedRounds(!isExpandedRounds)}
            />
          )}

          {/* Section 2: Monthly Evolution Charts & Table */}
          {showMeses && (
            <MonthlyComparisonCard
              monthlyChartData={monthlyChartData}
              totalTeamsInLeague={totalTeamsInLeague}
              teamA={teamA}
              teamB={teamB}
              summaryA={summaryA}
              summaryB={summaryB}
              finalCumulativeDiff={finalCumulativeDiff}
              isExpandedCharts={isExpandedCharts}
              onToggleExpandCharts={() => setIsExpandedCharts(!isExpandedCharts)}
              isExpandedMonths={isExpandedMonths}
              onToggleExpandMonths={() => setIsExpandedMonths(!isExpandedMonths)}
            />
          )}

          {/* Section 3: Race Category Comparison Table */}
          {showCategorias && (
            <CategoryComparisonCard
              categories={categories}
              totalTeamsCategory={totalTeamsCategory}
              teamA={teamA}
              teamB={teamB}
              summaryA={summaryA}
              summaryB={summaryB}
              finalCumulativeDiff={finalCumulativeDiff}
              isExpanded={isExpandedCategory}
              onToggleExpand={() => setIsExpandedCategory(!isExpandedCategory)}
            />
          )}

          {/* Section 4: Draft Tiers & MVPs Head to Head */}
          {showDraft && (
            <DraftTiersAndMvpsCard
              draftTiersData={draftTiersData}
              mvpData={mvpData}
              teamA={teamA}
              teamB={teamB}
              summaryA={summaryA}
              summaryB={summaryB}
              finalCumulativeDiff={finalCumulativeDiff}
              isExpandedTiers={isExpandedTiers}
              onToggleExpandTiers={() => setIsExpandedTiers(!isExpandedTiers)}
              isExpandedMVPs={isExpandedMVPs}
              onToggleExpandMVPs={() => setIsExpandedMVPs(!isExpandedMVPs)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DraftComparaciones;
