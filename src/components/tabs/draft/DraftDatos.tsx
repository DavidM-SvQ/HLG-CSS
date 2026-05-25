import { AppState, PlayerScore, CyclistMetadata } from '../../../lib/types';
import React, { useState, useRef, useMemo } from 'react';
import { useUrlState } from '../../../hooks/useUrlState';
import { ChevronDown, BarChart3, Database } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getVal } from '../../../lib/data-processing';
import { ReportCard } from '../../ui/ReportCard';
import { EmptyState } from "../../ui/EmptyState";
import { DraftPointsTable } from './DraftPointsTable';
import { DraftPerformanceSummary } from './DraftPerformanceSummary';
import { DraftRoiChart } from './DraftRoiChart';
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
  const [isDraftDatosMonthFilterOpen, setIsDraftDatosMonthFilterOpen] = useState(false);
  const [isDraftDatosCategoryFilterOpen, setIsDraftDatosCategoryFilterOpen] = useState(false);
  const [isDraftDatosTeamFilterOpen, setIsDraftDatosTeamFilterOpen] = useState(false);
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
    <div className="flex flex-wrap items-center gap-2">
      {/* Meses Filter */}
      <div className="relative">
        <Button variant="outline"
          onClick={() => {
            setIsDraftDatosMonthFilterOpen(!isDraftDatosMonthFilterOpen);
            setIsDraftDatosCategoryFilterOpen(false);
            setIsDraftDatosTeamFilterOpen(false);
          }}
          className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[120px] justify-between cursor-pointer"
        >
          <span className="text-neutral-700">
            {draftDatosMonthFilter.length === 0
              ? "Meses"
              : `${draftDatosMonthFilter.length} meses`}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-neutral-400 transition-transform",
              isDraftDatosMonthFilterOpen && "rotate-180",
            )}
          />
        </Button>
        {isDraftDatosMonthFilterOpen && (
          <div className="absolute top-full right-0 mt-1 w-max max-w-[90vw] sm:max-w-xs bg-white border border-neutral-200 rounded-xl shadow-xl z-[100] py-2 animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                Meses
              </span>
              {draftDatosMonthFilter.length > 0 && (
                <Button variant="outline"
                  onClick={() =>
                    setDraftDatosMonthFilter([])
                  }
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-bold border-none bg-transparent"
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {[
                "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
              ].map((mes) => (
                <label
                  key={mes}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                    checked={draftDatosMonthFilter.includes(mes)}
                    onChange={() => {
                      if (draftDatosMonthFilter.includes(mes)) {
                        setDraftDatosMonthFilter(draftDatosMonthFilter.filter((m) => m !== mes));
                      } else {
                        setDraftDatosMonthFilter([...draftDatosMonthFilter, mes]);
                      }
                    }}
                  />
                  <span className="text-sm text-neutral-700">{mes}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categoría Filter */}
      <div className="relative">
        <Button variant="outline"
          onClick={() => {
            setIsDraftDatosCategoryFilterOpen(!isDraftDatosCategoryFilterOpen);
            setIsDraftDatosMonthFilterOpen(false);
            setIsDraftDatosTeamFilterOpen(false);
          }}
          className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[120px] justify-between cursor-pointer"
        >
          <span className="text-neutral-700">
            {draftDatosCategoryFilter.length === 0
              ? "Categoría"
              : `${draftDatosCategoryFilter.length} categorías`}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-neutral-400 transition-transform",
              isDraftDatosCategoryFilterOpen && "rotate-180",
            )}
          />
        </Button>
        {isDraftDatosCategoryFilterOpen && (
          <div className="absolute top-full right-0 mt-1 w-max max-w-[90vw] sm:max-w-xs bg-white border border-neutral-200 rounded-xl shadow-xl z-[100] py-2 animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                Categorías
              </span>
              {draftDatosCategoryFilter.length > 0 && (
                <Button variant="outline"
                  onClick={() => setDraftDatosCategoryFilter([])}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-bold border-none bg-transparent"
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {(() => {
                const raceTypeByName: Record<string, string> = {};
                files.carreras?.data?.forEach((row: any) => {
                  const carrera = getVal(row, "Carrera")?.trim();
                  const categoria = getVal(row, "Categoría")?.trim();
                  if (carrera && categoria) raceTypeByName[carrera] = categoria;
                });
                const availableCategories = new Set<string>();
                leaderboard?.forEach((player: any) => {
                  player?.detalles?.forEach((d: any) => {
                    const cat = raceTypeByName[d.carrera];
                    if (cat) availableCategories.add(cat);
                  });
                });
                const items = Array.from(availableCategories).sort((a, b) => a.localeCompare(b));
                if (items.length === 0)
                  return <div className="px-3 py-2 text-xs text-neutral-500">Sin datos</div>;
                return items.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                      checked={draftDatosCategoryFilter.includes(cat)}
                      onChange={() => {
                        if (draftDatosCategoryFilter.includes(cat)) {
                          setDraftDatosCategoryFilter(draftDatosCategoryFilter.filter((c) => c !== cat));
                        } else {
                          setDraftDatosCategoryFilter([...draftDatosCategoryFilter, cat]);
                        }
                      }}
                    />
                    <span className="text-sm text-neutral-700">{cat}</span>
                  </label>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Equipo Filter */}
      <div className="relative">
        <Button variant="outline"
          onClick={() => {
            setIsDraftDatosTeamFilterOpen(!isDraftDatosTeamFilterOpen);
            setIsDraftDatosMonthFilterOpen(false);
            setIsDraftDatosCategoryFilterOpen(false);
          }}
          className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[120px] justify-between cursor-pointer"
        >
          <span className="text-neutral-700">
            {draftDatosTeamFilter.length === 0
              ? "Equipo"
              : `${draftDatosTeamFilter.length} equipos`}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-neutral-400 transition-transform",
              isDraftDatosTeamFilterOpen && "rotate-180",
            )}
          />
        </Button>
        {isDraftDatosTeamFilterOpen && (
          <div className="absolute top-full right-0 mt-1 w-max max-w-[90vw] sm:max-w-xs bg-white border border-neutral-200 rounded-xl shadow-xl z-[100] py-2 animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                Equipos
              </span>
              {draftDatosTeamFilter.length > 0 && (
                <Button variant="outline"
                  onClick={() => setDraftDatosTeamFilter([])}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-bold border-none bg-transparent"
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {(() => {
                const availableTeams = new Set<string>();
                files.elecciones?.data?.forEach((row: any) => {
                  const teamName = getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG");
                  if (teamName) availableTeams.add(teamName as string);
                });
                const items = Array.from(availableTeams).sort((a, b) => a.localeCompare(b));
                if (items.length === 0)
                  return <div className="px-3 py-2 text-xs text-neutral-500">Sin datos</div>;
                return items.map((team) => (
                  <label
                    key={team}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                      checked={draftDatosTeamFilter.includes(team)}
                      onChange={() => {
                        if (draftDatosTeamFilter.includes(team)) {
                          setDraftDatosTeamFilter(draftDatosTeamFilter.filter((t) => t !== team));
                        } else {
                          setDraftDatosTeamFilter([...draftDatosTeamFilter, team]);
                        }
                      }}
                    />
                    <span className="text-sm text-neutral-700 truncate" title={team}>
                      {team}
                    </span>
                  </label>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
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
