import { copyImageToClipboard, copyTextToClipboard } from "../../../lib/clipboard";
import React, { useState, useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown, ChevronUp, Copy, CheckCircle2, UploadCloud, Activity, FileText, Download, HelpCircle, ArrowUpDown, Maximize2, X, BarChart3, TrendingUp, Trophy } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getVal, getCategoryColorStyle, formatNumberSpanish } from '../../../lib/data-processing';
import { ExportToolbar } from '../../ui/ExportToolbar';
import { expandNodeForCapture } from '../../../lib/dom-utils';
import { domToDataUrl } from 'modern-screenshot';
import { DraftPointsTable } from './DraftPointsTable';
import { DraftPerformanceSummary } from './DraftPerformanceSummary';
import { DraftRoiChart } from './DraftRoiChart';

export interface DraftDatosProps {
  files: any;
  leaderboard: any;
  cyclistMetadata: any;
  teamToPlayerMap: any;
  playerOrderMap: any;
}

import { performImageCopy, performImageDownload, performTextCopy } from '../season/hooks/useExportHandlers';

export const DraftDatos: React.FC<DraftDatosProps> = ({
  files,
  leaderboard,
  cyclistMetadata,
  teamToPlayerMap,
  playerOrderMap,
}) => {
  const [draftDatosMonthFilter, setDraftDatosMonthFilter] = useState<string[]>([]);
  const [draftDatosCategoryFilter, setDraftDatosCategoryFilter] = useState<string[]>([]);
  const [draftDatosTeamFilter, setDraftDatosTeamFilter] = useState<string[]>([]);
  const [isDraftDatosMonthFilterOpen, setIsDraftDatosMonthFilterOpen] = useState(false);
  const [isDraftDatosCategoryFilterOpen, setIsDraftDatosCategoryFilterOpen] = useState(false);
  const [isDraftDatosTeamFilterOpen, setIsDraftDatosTeamFilterOpen] = useState(false);
  const [draftDatosSortColumn, setDraftDatosSortColumn] = useState<string>("Orden");
  const [draftDatosSortDirection, setDraftDatosSortDirection] = useState<"asc" | "desc">("asc");
  const [isDraftDatosTableExpanded, setIsDraftDatosTableExpanded] = useState(false);
  const [isDraftSummaryExpanded, setIsDraftSummaryExpanded] = useState(false);
  const [draftSummarySort, setDraftSummarySort] = useState<{keys: string[]; order: "asc" | "desc";}>({ keys: ["totalPoints"], order: "desc" });
  const [draftDatosTooltip, setDraftDatosTooltip] = useState<any>(null);

  const draftDatosTableRef = useRef<HTMLDivElement>(null);
  const draftSummaryTableRef = useRef<HTMLDivElement>(null);
  const draftChartRef = useRef<HTMLDivElement>(null);
  
  const [isDraftDatosTableCopying, setIsDraftDatosTableCopying] = useState<string | false>(false);
  const handleCopyDraftDatosTableImage = () => {
    performImageCopy(draftDatosTableRef, setIsDraftDatosTableCopying, true, "draftDatosTable");
  };
  const handleDownloadDraftDatosTableImage = () => {
    performImageDownload(draftDatosTableRef, "draft-datos.png", "draftDatosTable");
  };

  return (
    <>
      <div className="space-y-6">
        {!files.elecciones?.data ? (
          <div className="text-center py-20 text-neutral-500 italic">
            No hay datos del draft cargados.
          </div>
        ) : (
          <>
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm gap-2">
                          <div className="flex flex-col gap-1 w-full sm:w-auto">
                            <h3 className="font-semibold text-lg text-neutral-900 leading-tight">
                              Puntos por Ronda y Equipo
                            </h3>
                            <p className="text-xs text-neutral-500">
                              Puntos totales conseguidos por cada elección del
                              draft.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Meses Filter */}
                            <div className="relative">
                              <button
                                onClick={() => {
                                  setIsDraftDatosMonthFilterOpen(
                                    !isDraftDatosMonthFilterOpen,
                                  );
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
                              </button>
                              {isDraftDatosMonthFilterOpen && (
                                <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                                  <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                      Meses
                                    </span>
                                    {draftDatosMonthFilter.length > 0 && (
                                      <button
                                        onClick={() =>
                                          setDraftDatosMonthFilter([])
                                        }
                                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                                      >
                                        Limpiar
                                      </button>
                                    )}
                                  </div>
                                  <div className="max-h-60 overflow-y-auto">
                                    {[
                                      "Ene",
                                      "Feb",
                                      "Mar",
                                      "Abr",
                                      "May",
                                      "Jun",
                                      "Jul",
                                      "Ago",
                                      "Sep",
                                      "Oct",
                                      "Nov",
                                      "Dic",
                                    ].map((mes) => (
                                      <label
                                        key={mes}
                                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                                          checked={draftDatosMonthFilter.includes(
                                            mes,
                                          )}
                                          onChange={() => {
                                            if (
                                              draftDatosMonthFilter.includes(
                                                mes,
                                              )
                                            ) {
                                              setDraftDatosMonthFilter(
                                                draftDatosMonthFilter.filter(
                                                  (m) => m !== mes,
                                                ),
                                              );
                                            } else {
                                              setDraftDatosMonthFilter([
                                                ...draftDatosMonthFilter,
                                                mes,
                                              ]);
                                            }
                                          }}
                                        />
                                        <span className="text-sm text-neutral-700">
                                          {mes}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Categoría Filter */}
                            <div className="relative">
                              <button
                                onClick={() => {
                                  setIsDraftDatosCategoryFilterOpen(
                                    !isDraftDatosCategoryFilterOpen,
                                  );
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
                                    isDraftDatosCategoryFilterOpen &&
                                      "rotate-180",
                                  )}
                                />
                              </button>
                              {isDraftDatosCategoryFilterOpen && (
                                <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                                  <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                      Categorías
                                    </span>
                                    {draftDatosCategoryFilter.length > 0 && (
                                      <button
                                        onClick={() =>
                                          setDraftDatosCategoryFilter([])
                                        }
                                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                                      >
                                        Limpiar
                                      </button>
                                    )}
                                  </div>
                                  <div className="max-h-60 overflow-y-auto">
                                    {(() => {
                                      const raceTypeByName: Record<
                                        string,
                                        string
                                      > = {};
                                      files.carreras?.data?.forEach((row) => {
                                        const carrera = getVal(
                                          row,
                                          "Carrera",
                                        )?.trim();
                                        const categoria = getVal(
                                          row,
                                          "Categoría",
                                        )?.trim();
                                        if (carrera && categoria)
                                          raceTypeByName[carrera] = categoria;
                                      });
                                      const availableCategories =
                                        new Set<string>();
                                      leaderboard?.forEach((player) => {
                                        player?.detalles?.forEach((d) => {
                                          const cat = raceTypeByName[d.carrera];
                                          if (cat) availableCategories.add(cat);
                                        });
                                      });
                                      const items = Array.from(
                                        availableCategories,
                                      ).sort((a, b) => a.localeCompare(b));
                                      if (items.length === 0)
                                        return (
                                          <div className="px-3 py-2 text-xs text-neutral-500">
                                            Sin datos
                                          </div>
                                        );
                                      return items.map((cat) => (
                                        <label
                                          key={cat}
                                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                                            checked={draftDatosCategoryFilter.includes(
                                              cat,
                                            )}
                                            onChange={() => {
                                              if (
                                                draftDatosCategoryFilter.includes(
                                                  cat,
                                                )
                                              ) {
                                                setDraftDatosCategoryFilter(
                                                  draftDatosCategoryFilter.filter(
                                                    (c) => c !== cat,
                                                  ),
                                                );
                                              } else {
                                                setDraftDatosCategoryFilter([
                                                  ...draftDatosCategoryFilter,
                                                  cat,
                                                ]);
                                              }
                                            }}
                                          />
                                          <span className="text-sm text-neutral-700">
                                            {cat}
                                          </span>
                                        </label>
                                      ));
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Equipo Filter */}
                            <div className="relative">
                              <button
                                onClick={() => {
                                  setIsDraftDatosTeamFilterOpen(
                                    !isDraftDatosTeamFilterOpen,
                                  );
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
                              </button>
                              {isDraftDatosTeamFilterOpen && (
                                <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                                  <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                      Equipos
                                    </span>
                                    {draftDatosTeamFilter.length > 0 && (
                                      <button
                                        onClick={() =>
                                          setDraftDatosTeamFilter([])
                                        }
                                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                                      >
                                        Limpiar
                                      </button>
                                    )}
                                  </div>
                                  <div className="max-h-60 overflow-y-auto">
                                    {(() => {
                                      const availableTeams = new Set<string>();
                                      files.elecciones?.data?.forEach((row) => {
                                        const teamName =
                                          getVal(row, "Nombre_Equipo") ||
                                          getVal(row, "Nombre_TG");
                                        if (teamName)
                                          availableTeams.add(
                                            teamName as string,
                                          );
                                      });
                                      const items = Array.from(
                                        availableTeams,
                                      ).sort((a, b) => a.localeCompare(b));
                                      if (items.length === 0)
                                        return (
                                          <div className="px-3 py-2 text-xs text-neutral-500">
                                            Sin datos
                                          </div>
                                        );
                                      return items.map((team) => (
                                        <label
                                          key={team}
                                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                                            checked={draftDatosTeamFilter.includes(
                                              team,
                                            )}
                                            onChange={() => {
                                              if (
                                                draftDatosTeamFilter.includes(
                                                  team,
                                                )
                                              ) {
                                                setDraftDatosTeamFilter(
                                                  draftDatosTeamFilter.filter(
                                                    (t) => t !== team,
                                                  ),
                                                );
                                              } else {
                                                setDraftDatosTeamFilter([
                                                  ...draftDatosTeamFilter,
                                                  team,
                                                ]);
                                              }
                                            }}
                                          />
                                          <span
                                            className="text-sm text-neutral-700 truncate"
                                            title={team}
                                          >
                                            {team}
                                          </span>
                                        </label>
                                      ));
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() =>
                                setIsDraftDatosTableExpanded(
                                  !isDraftDatosTableExpanded,
                                )
                              }
                              className="p-2 ml-1 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                              title="Ampliar"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCopyDraftDatosTableImage}
                              className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                              title="Copiar como imagen"
                            >
                              {isDraftDatosTableCopying ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={handleDownloadDraftDatosTableImage}
                              className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                              title="Descargar imagen"
                            >
                              <UploadCloud className="w-4 h-4" />
                            </button>
                          </div>
                        </div>


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
