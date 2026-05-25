import { AppState, PlayerScore, CyclistMetadata } from '../../../lib/types';
import React, { useState, useRef, useMemo } from 'react';
import { useUrlState } from '../../../hooks/useUrlState';
import { BarChart3, Database } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ReportCard } from '../../ui/ReportCard';
import { EmptyState } from "../../ui/EmptyState";
import { DraftPointsTable } from './DraftPointsTable';
import { DraftPerformanceSummary } from './DraftPerformanceSummary';
import { DraftRoiChart } from './DraftRoiChart';
import { DraftDatosFilters } from './components/DraftDatosFilters';
import { Button } from "../../ui/button";

export interface DraftDatosProps {
  files: AppState;
  leaderboard: PlayerScore[];
  cyclistMetadata: Record<string, CyclistMetadata>;
  teamToPlayerMap: any;
  playerOrderMap: any;
}

export const DraftDatos: React.FC<DraftDatosProps> = ({
  files,
  leaderboard,
  cyclistMetadata,
  teamToPlayerMap,
  playerOrderMap,
}) => {
  const [draftDatosMonthFilter, setDraftDatosMonthFilter] = useUrlState<string[]>("draftDatosMonthFilter", []);
  const [draftDatosCategoryFilter, setDraftDatosCategoryFilter] = useUrlState<string[]>("draftDatosCategoryFilter", []);
  const [draftDatosTeamFilter, setDraftDatosTeamFilter] = useUrlState<string[]>("draftDatosTeamFilter", []);
  const [draftDatosSortColumn, setDraftDatosSortColumn] = useUrlState<string>("draftDatosSortColumn", "Orden");
  const [draftDatosSortDirection, setDraftDatosSortDirection] = useUrlState<"asc" | "desc">("draftDatosSortDirection", "asc");
  const [isDraftDatosTableExpanded, setIsDraftDatosTableExpanded] = useState(false);
  const [isDraftSummaryExpanded, setIsDraftSummaryExpanded] = useState(false);
  const [draftSummarySort, setDraftSummarySort] = useUrlState<{keys: string[]; order: "asc" | "desc";}>("draftSummarySort", { keys: ["totalPoints"], order: "desc" });
  const [draftDatosTooltip, setDraftDatosTooltip] = useState<any>(null);

  const draftDatosTableRef = useRef<HTMLDivElement>(null);
  const draftSummaryTableRef = useRef<HTMLDivElement>(null);
  const draftChartRef = useRef<HTMLDivElement>(null);

  const filtersUI = (
    <DraftDatosFilters 
      files={files}
      leaderboard={leaderboard}
      draftDatosMonthFilter={draftDatosMonthFilter}
      setDraftDatosMonthFilter={setDraftDatosMonthFilter}
      draftDatosCategoryFilter={draftDatosCategoryFilter}
      setDraftDatosCategoryFilter={setDraftDatosCategoryFilter}
      draftDatosTeamFilter={draftDatosTeamFilter}
      setDraftDatosTeamFilter={setDraftDatosTeamFilter}
    />
  );

  return (
    <>
      <div className="space-y-6">
        {!files.elecciones?.data ? (
          <EmptyState icon={Database} title="Sin datos de draft" description="No hay datos del draft cargados para visualizar los datos estadísticos." />
        ) : (
          <>
            <ReportCard
              title="Puntos por Ronda y Equipo"
              subtitle="Puntos totales conseguidos por cada elección del draft."
              icon={<BarChart3 />}
              filename="draft-datos"
              ref={draftDatosTableRef}
              headerExtra={filtersUI}
              toolbarProps={{
                isExpanded: isDraftDatosTableExpanded,
                onExpand: () => setIsDraftDatosTableExpanded(!isDraftDatosTableExpanded)
              }}
              bodyClassName="p-6 pt-2"
            >
              <DraftPointsTable
                files={files}
                leaderboard={leaderboard}
                draftDatosMonthFilter={draftDatosMonthFilter}
                draftDatosCategoryFilter={draftDatosCategoryFilter}
                draftDatosTeamFilter={draftDatosTeamFilter}
                draftDatosSortColumn={draftDatosSortColumn}
                setDraftDatosSortColumn={setDraftDatosSortColumn}
                draftDatosSortDirection={draftDatosSortDirection}
                setDraftDatosSortDirection={setDraftDatosSortDirection}
                isDraftDatosTableExpanded={isDraftDatosTableExpanded}
                setIsDraftDatosTableExpanded={setIsDraftDatosTableExpanded}
                draftDatosTableRef={draftDatosTableRef}
                draftDatosTooltip={draftDatosTooltip}
                setDraftDatosTooltip={setDraftDatosTooltip}
                playerOrderMap={playerOrderMap}
                teamToPlayerMap={teamToPlayerMap}
              />
            </ReportCard>

            <DraftPerformanceSummary
              files={files}
              leaderboard={leaderboard}
              draftDatosMonthFilter={draftDatosMonthFilter}
              draftDatosCategoryFilter={draftDatosCategoryFilter}
              draftDatosTeamFilter={draftDatosTeamFilter}
              draftSummarySort={draftSummarySort}
              setDraftSummarySort={setDraftSummarySort}
              isDraftSummaryExpanded={isDraftSummaryExpanded}
              setIsDraftSummaryExpanded={setIsDraftSummaryExpanded}
              draftSummaryTableRef={draftSummaryTableRef}
            />

            <DraftRoiChart
              files={files}
              leaderboard={leaderboard}
              draftDatosMonthFilter={draftDatosMonthFilter}
              draftDatosCategoryFilter={draftDatosCategoryFilter}
              draftDatosTeamFilter={draftDatosTeamFilter}
              draftSummarySort={draftSummarySort}
              setDraftSummarySort={setDraftSummarySort}
              draftChartRef={draftChartRef}
              isDraftSummaryExpanded={isDraftSummaryExpanded}
              setIsDraftSummaryExpanded={setIsDraftSummaryExpanded}
            />
          </>
        )}
      </div>
    </>
  );
};
