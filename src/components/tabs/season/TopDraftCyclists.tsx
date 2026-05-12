import React, { useContext, useRef } from "react";
import { motion } from "motion/react";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { useTopDraft } from "../../../lib/hooks/useTopDraft";


import { performImageCopy, performImageDownload, performTextCopy } from "./hooks/useExportHandlers";

export function TopDraftCyclists() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const { cn, CyclistDetailView, files, playerTeamMap, playerByCyclist, leaderboard, cyclistMetadata, cyclistRoundMap, playerOrderMap, selectedCyclistDetail, setSelectedCyclistDetail, formatNumberSpanish, getVal } = context;

  const [topCyclistsLimit, setTopCyclistsLimit] = React.useState(10);
  const [cyclistsMonthFilter, setCyclistsMonthFilter] = React.useState<string>("all");
  const [cyclistsTeamFilter, setCyclistsTeamFilter] = React.useState<string[]>([]);
  const [cyclistsCategoryFilter, setCyclistsCategoryFilter] = React.useState<string[]>([]);
  const [cyclistsRoundFilter, setCyclistsRoundFilter] = React.useState<string[]>([]);
  const [cyclistsNameSearch, setCyclistsNameSearch] = React.useState<string>("");
  
  const [isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded] = React.useState(false);
  const [isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen] = React.useState(false);
  const [isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen] = React.useState(false);
  const [isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen] = React.useState(false);
  
  const [cyclistsSortColumn, setCyclistsSortColumn] = React.useState<string>("puntos");
  const [cyclistsSortDirection, setCyclistsSortDirection] = React.useState<"asc" | "desc">("desc");

  const [isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying] = React.useState<string | boolean>(false);
  const [isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying] = React.useState(false);
  const topCyclistsDraftRef = useRef<HTMLDivElement>(null);
  const topCyclistsDraftRefContainer = useRef<HTMLDivElement>(null);

  const handleCopyTopCyclistsDraft = async (type?: string) => {
    performImageCopy(topCyclistsDraftRef, setIsTopCyclistsDraftCopying, type || "full", "topCyclistsDraft");
  };
  const handleCopyTopCyclistsDraftText = async () => {
    performTextCopy(topCyclistsDraftRef, setIsTopCyclistsDraftTextCopying, "topCyclistsDraft");
  };
  const handleDownloadTopCyclistsDraft = async (type?: string) => {
    performImageDownload(topCyclistsDraftRef, `top-ciclistas-draft${type && type !== "full" ? `-${type}` : ""}.png`, "topCyclistsDraft");
  };

  const { allStats } = useTopDraft(
    cyclistsMonthFilter,
    cyclistsCategoryFilter,
    cyclistsTeamFilter,
    cyclistsRoundFilter,
    topCyclistsLimit
  );

  return (
    <>
                              <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                ref={topCyclistsDraftRef as any}
                                className={cn(
                                  "bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm relative flex flex-col",
                                  isTopCyclistsDraftExpanded &&
                                    "fixed inset-4 z-50 shadow-2xl p-0",
                                )}
                              >
                                {isTopCyclistsDraftExpanded && (
                                  <button
                                    onClick={() =>
                                      setIsTopCyclistsDraftExpanded(false)
                                    }
                                    className="fixed top-8 right-8 p-3 bg-neutral-800 text-white rounded-full shadow-2xl z-[60] copy-button-ignore hover:bg-neutral-700 transition-all cursor-pointer"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                )}
                                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
                                    <User className="w-5 h-5 text-orange-600" />
                                    Top Ciclistas por Puntuación
                                  </h3>
                                  <p className="text-xs text-neutral-500 whitespace-nowrap">
                                    Ranking individual de todos los corredores
                                    con puntos.
                                  </p>

                                  <div className="flex flex-wrap items-center gap-3 mt-1">
                                    <div className="copy-button-ignore flex flex-wrap items-center gap-2 pr-3 border-r border-neutral-200">
                                      <button
                                        onClick={() =>
                                          setIsTopCyclistsDraftExpanded(true)
                                        }
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Ampliar tabla"
                                      >
                                        <Maximize2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCopyTopCyclistsDraft("full")
                                        }
                                        disabled={!!isTopCyclistsDraftCopying}
                                        className={cn(
                                          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm border",
                                          isTopCyclistsDraftCopying === "full"
                                            ? "bg-green-50 text-green-600 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100",
                                        )}
                                        title="Copiar tabla completa como imagen"
                                      >
                                        {isTopCyclistsDraftCopying ===
                                        "full" ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                      {topCyclistsLimit > 50 && (
                                        <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                                          {Array.from({
                                            length: Math.ceil(
                                              (topCyclistsLimit === 9999
                                                ? 500
                                                : topCyclistsLimit) / 50,
                                            ),
                                          }).map((_, i) => {
                                            const s = `p${i + 1}`;
                                            const start = i * 50 + 1;
                                            const end = (i + 1) * 50;
                                            const label = `${start}-${end}`;
                                            const isCopyingThis =
                                              isTopCyclistsDraftCopying === s;
                                            return (
                                              <button
                                                key={s}
                                                onClick={() =>
                                                  handleCopyTopCyclistsDraft(
                                                    s as any,
                                                  )
                                                }
                                                disabled={
                                                  !!isTopCyclistsDraftCopying
                                                }
                                                className={cn(
                                                  "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                                  isCopyingThis
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-white",
                                                  isTopCyclistsDraftCopying &&
                                                    !isCopyingThis &&
                                                    "opacity-50 cursor-not-allowed",
                                                )}
                                              >
                                                {isCopyingThis ? (
                                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                                ) : (
                                                  <Copy className="w-3.5 h-3.5" />
                                                )}
                                                {label}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                      <button
                                        onClick={handleCopyTopCyclistsDraftText}
                                        disabled={isTopCyclistsDraftTextCopying}
                                        className={cn(
                                          "px-3 h-8 text-sm font-medium rounded-lg border shadow-sm flex items-center justify-center transition-all",
                                          isTopCyclistsDraftTextCopying
                                            ? "bg-green-50 text-green-600 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100",
                                        )}
                                        title="Copiar texto de la tabla"
                                      >
                                        {isTopCyclistsDraftTextCopying ? (
                                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        ) : (
                                          <ClipboardList className="w-4 h-4 mr-1.5" />
                                        )}
                                        Texto
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadTopCyclistsDraft("full")
                                        }
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Descargar tabla completa como imagen"
                                      >
                                        <UploadCloud className="w-4 h-4 rotate-180" />
                                      </button>
                                    </div>

                                    {/* Teams Multi-select Filter */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setIsCyclistsTeamFilterOpen(
                                            !isCyclistsTeamFilterOpen,
                                          )
                                        }
                                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
                                      >
                                        <span className="truncate">
                                          {cyclistsTeamFilter.length === 0
                                            ? "Todos los equipos"
                                            : `${cyclistsTeamFilter.length} equipos`}
                                        </span>
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 text-neutral-400 transition-transform",
                                            isCyclistsTeamFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </button>

                                      {isCyclistsTeamFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                              setIsCyclistsTeamFilterOpen(false)
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                Equipos
                                              </span>
                                              {cyclistsTeamFilter.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    setCyclistsTeamFilter([])
                                                  }
                                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                  Limpiar
                                                </button>
                                              )}
                                            </div>
                                            {Array.from(
                                              new Set(
                                                leaderboard
                                                  ?.filter(
                                                    (p) =>
                                                      p.jugador !== "No draft",
                                                  )
                                                  .map((p) => p.nombreEquipo) ||
                                                  [],
                                              ),
                                            )
                                              .filter(Boolean)
                                              .sort((a, b) =>
                                                (a as string).localeCompare(
                                                  b as string,
                                                ),
                                              )
                                              .map((team: any) => (
                                                <label
                                                  key={team}
                                                  className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                    checked={cyclistsTeamFilter.includes(
                                                      team,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setCyclistsTeamFilter([
                                                          ...cyclistsTeamFilter,
                                                          team,
                                                        ]);
                                                      } else {
                                                        setCyclistsTeamFilter(
                                                          cyclistsTeamFilter.filter(
                                                            (t) => t !== team,
                                                          ),
                                                        );
                                                      }
                                                    }}
                                                  />
                                                  <span className="ml-2 text-sm text-neutral-700 truncate">
                                                    {team}
                                                  </span>
                                                </label>
                                              ))}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {/* Category Multi-select Filter */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setIsCyclistsCategoryFilterOpen(
                                            !isCyclistsCategoryFilterOpen,
                                          )
                                        }
                                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[150px]"
                                      >
                                        <span className="truncate">
                                          {cyclistsCategoryFilter.length === 0
                                            ? "Todas las categorías"
                                            : `${cyclistsCategoryFilter.length} categorías`}
                                        </span>
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 text-neutral-400 transition-transform",
                                            isCyclistsCategoryFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </button>

                                      {isCyclistsCategoryFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                              setIsCyclistsCategoryFilterOpen(
                                                false,
                                              )
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                Categorías
                                              </span>
                                              {cyclistsCategoryFilter.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    setCyclistsCategoryFilter(
                                                      [],
                                                    )
                                                  }
                                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                  Limpiar
                                                </button>
                                              )}
                                            </div>
                                            {Array.from(
                                              new Set(
                                                files.carreras.data
                                                  ?.map((r) =>
                                                    getVal(r, "Categoría"),
                                                  )
                                                  .map((c) => c?.trim())
                                                  .filter(Boolean) as string[],
                                              ),
                                            )
                                              .sort((a, b) =>
                                                a.localeCompare(b),
                                              )
                                              .map((cat) => (
                                                <label
                                                  key={cat}
                                                  className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                    checked={cyclistsCategoryFilter.includes(
                                                      cat,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setCyclistsCategoryFilter(
                                                          [
                                                            ...cyclistsCategoryFilter,
                                                            cat,
                                                          ],
                                                        );
                                                      } else {
                                                        setCyclistsCategoryFilter(
                                                          cyclistsCategoryFilter.filter(
                                                            (c) => c !== cat,
                                                          ),
                                                        );
                                                      }
                                                    }}
                                                  />
                                                  <span className="ml-2 text-sm text-neutral-700 truncate">
                                                    {cat}
                                                  </span>
                                                </label>
                                              ))}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {/* Round Multi-select Filter */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setIsCyclistsRoundFilterOpen(
                                            !isCyclistsRoundFilterOpen,
                                          )
                                        }
                                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
                                      >
                                        <span className="truncate">
                                          {cyclistsRoundFilter.length === 0
                                            ? "Todas las rondas"
                                            : `${cyclistsRoundFilter.length} rondas`}
                                        </span>
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 text-neutral-400 transition-transform",
                                            isCyclistsRoundFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </button>

                                      {isCyclistsRoundFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                              setIsCyclistsRoundFilterOpen(
                                                false,
                                              )
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                Rondas
                                              </span>
                                              {cyclistsRoundFilter.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    setCyclistsRoundFilter([])
                                                  }
                                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                  Limpiar
                                                </button>
                                              )}
                                            </div>
                                            {Array.from(
                                              new Set(
                                                Object.values(
                                                  cyclistRoundMap,
                                                ) as string[],
                                              ),
                                            )
                                              .filter(Boolean)
                                              .sort((a, b) =>
                                                a.localeCompare(b),
                                              )
                                              .map((ronda) => (
                                                <label
                                                  key={ronda}
                                                  className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                    checked={cyclistsRoundFilter.includes(
                                                      ronda,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setCyclistsRoundFilter([
                                                          ...cyclistsRoundFilter,
                                                          ronda,
                                                        ]);
                                                      } else {
                                                        setCyclistsRoundFilter(
                                                          cyclistsRoundFilter.filter(
                                                            (r) => r !== ronda,
                                                          ),
                                                        );
                                                      }
                                                    }}
                                                  />
                                                  <span className="ml-2 text-sm text-neutral-700">
                                                    Ronda {ronda}
                                                  </span>
                                                </label>
                                              ))}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    <select
                                      value={cyclistsMonthFilter}
                                      onChange={(e) =>
                                        setCyclistsMonthFilter(e.target.value)
                                      }
                                      className="px-3 py-2 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                      <option value="all">
                                        Todos los meses
                                      </option>
                                      <option value="0">Enero</option>
                                      <option value="1">Febrero</option>
                                      <option value="2">Marzo</option>
                                      <option value="3">Abril</option>
                                      <option value="4">Mayo</option>
                                      <option value="5">Junio</option>
                                      <option value="6">Julio</option>
                                      <option value="7">Agosto</option>
                                      <option value="8">Septiembre</option>
                                      <option value="9">Octubre</option>
                                      <option value="10">Noviembre</option>
                                      <option value="11">Diciembre</option>
                                    </select>
                                    <div className="flex bg-neutral-100 p-1 rounded-lg">
                                      <button
                                        onClick={() => setTopCyclistsLimit(25)}
                                        className={cn(
                                          "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                          topCyclistsLimit === 25
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-700",
                                        )}
                                      >
                                        Top 25
                                      </button>
                                      <button
                                        onClick={() => setTopCyclistsLimit(50)}
                                        className={cn(
                                          "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                          topCyclistsLimit === 50
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-700",
                                        )}
                                      >
                                        Top 50
                                      </button>
                                      <button
                                        onClick={() => setTopCyclistsLimit(100)}
                                        className={cn(
                                          "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                          topCyclistsLimit === 100
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-700",
                                        )}
                                      >
                                        Top 100
                                      </button>
                                      <button
                                        onClick={() =>
                                          setTopCyclistsLimit(9999)
                                        }
                                        className={cn(
                                          "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                          topCyclistsLimit === 9999
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-700",
                                        )}
                                      >
                                        Todos
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className={cn("overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin", isTopCyclistsDraftExpanded ? "flex-1 min-h-0" : "max-h-[750px]")}>
                                  <div ref={topCyclistsDraftRefContainer} className={cn("table-responsive-wrapper overflow-auto w-full", isTopCyclistsDraftExpanded ? "h-full" : "max-h-[600px]")}><table className="w-full min-w-[700px] text-xs text-left bg-white bg-white rounded-xl shadow-sm rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
                                      <tr className="divide-x divide-neutral-100">
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (cyclistsSortColumn === "pos") {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("pos");
                                              setCyclistsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Pos{" "}
                                            {cyclistsSortColumn === "pos" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              cyclistsSortColumn === "nombre"
                                            ) {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("nombre");
                                              setCyclistsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ciclista{" "}
                                            {cyclistsSortColumn === "nombre" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              cyclistsSortColumn === "equipo"
                                            ) {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("equipo");
                                              setCyclistsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Equipo{" "}
                                            {cyclistsSortColumn === "equipo" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (cyclistsSortColumn === "pais") {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("pais");
                                              setCyclistsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            País{" "}
                                            {cyclistsSortColumn === "pais" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              cyclistsSortColumn === "victorias"
                                            ) {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn(
                                                "victorias",
                                              );
                                              setCyclistsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Victorias{" "}
                                            {cyclistsSortColumn ===
                                              "victorias" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              cyclistsSortColumn === "carreras"
                                            ) {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("carreras");
                                              setCyclistsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Carreras{" "}
                                            {cyclistsSortColumn ===
                                              "carreras" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          title="Días de competición"
                                          onClick={() => {
                                            if (cyclistsSortColumn === "dias") {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("dias");
                                              setCyclistsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Días{" "}
                                            {cyclistsSortColumn === "dias" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          title="Puntos por carreras"
                                          onClick={() => {
                                            if (cyclistsSortColumn === "ppc") {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("ppc");
                                              setCyclistsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            P/C{" "}
                                            {cyclistsSortColumn === "ppc" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          title="Puntos por día de competición"
                                          onClick={() => {
                                            if (cyclistsSortColumn === "ppd") {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("ppd");
                                              setCyclistsSortDirection("asc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            P/D{" "}
                                            {cyclistsSortColumn === "ppd" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              cyclistsSortColumn === "puntos"
                                            ) {
                                              setCyclistsSortDirection((d) =>
                                                d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setCyclistsSortColumn("puntos");
                                              setCyclistsSortDirection("desc");
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-end gap-1">
                                            Puntos{" "}
                                            {cyclistsSortColumn === "puntos" &&
                                              (cyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                                      {(() => {
                                        // Tomamos el top N primero para mantener siempre los corredores con más puntos
                                        const topScorers = topCyclistsLimit === 9999 ? [...allStats] : allStats.slice(0, topCyclistsLimit);

                                        // Sort the array by column AFTER slicing
                                        topScorers.sort((a, b) => {
    let valA: any, valB: any;
    switch (cyclistsSortColumn) {
      case "pos": valA = a.originalIndex; valB = b.originalIndex; break;
      case "nombre": valA = a.ciclista; valB = b.ciclista; break;
      case "equipo": valA = a.nombreEquipo; valB = b.nombreEquipo; break;
      case "pais": valA = a.pais; valB = b.pais; break;
      case "victorias": valA = a.victorias; valB = b.victorias; break;
      case "carreras": valA = a.numCarreras; valB = b.numCarreras; break;
      case "dias": valA = a.dias; valB = b.dias; break;
      case "ppc": valA = a.ppc; valB = b.ppc; break;
      case "ppd": valA = a.ppd; valB = b.ppd; break;
      case "puntos": default: valA = a.puntos; valB = b.puntos; break;
    }

    if (typeof valA === "string" && typeof valB === "string") {
      return cyclistsSortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (valA < valB) return cyclistsSortDirection === "asc" ? -1 : 1;
    if (valA > valB) return cyclistsSortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const sortedStats = topScorers;

  let maxVictorias = 0;
                                        let maxCarreras = 0,
                                          minCarreras = Infinity;
                                        let maxDias = 0,
                                          minDias = Infinity;
                                        let maxPpc = 0,
                                          minPpc = Infinity;
                                        let maxPpd = 0,
                                          minPpd = Infinity;
                                        let maxPuntos = 0,
                                          minPuntos = Infinity;

                                        if (sortedStats.length > 0) {
                                          maxPuntos =
                                            sortedStats[0].puntos;
                                          minPuntos =
                                            sortedStats[sortedStats.length - 1]
                                              .puntos;

                                          sortedStats.forEach((s) => {
                                            if (s.victorias > maxVictorias)
                                              maxVictorias = s.victorias;
                                            if (s.numCarreras > maxCarreras)
                                              maxCarreras = s.numCarreras;
                                            if (s.numCarreras < minCarreras)
                                              minCarreras = s.numCarreras;
                                            if (s.dias > maxDias)
                                              maxDias = s.dias;
                                            if (s.dias < minDias)
                                              minDias = s.dias;
                                            if (s.ppc > maxPpc) maxPpc = s.ppc;
                                            if (s.ppc < minPpc) minPpc = s.ppc;
                                            if (s.ppd > maxPpd) maxPpd = s.ppd;
                                            if (s.ppd < minPpd) minPpd = s.ppd;
                                          });
                                        }

                                        const getColorClass = (
                                          val: number,
                                          max: number,
                                          min: number,
                                          isZeroRed: boolean = false,
                                        ) => {
                                          if (isZeroRed && val === 0)
                                            return "text-red-600 font-bold";
                                          if (val === max && max > 0)
                                            return "text-green-600 font-bold";
                                          if (
                                            val === min &&
                                            min < max &&
                                            !isZeroRed
                                          )
                                            return "text-yellow-600 font-bold";
                                          return "text-neutral-700";
                                        };

                                        const getPuntosColor = (
                                          puntos: number,
                                        ) => {
                                          if (maxPuntos === minPuntos)
                                            return "hsl(120, 70%, 40%)";
                                          const ratio =
                                            (puntos - minPuntos) /
                                            (maxPuntos - minPuntos);
                                          const hue = 45 + ratio * 75; // 45 (yellow/orange) to 120 (green)
                                          return `hsl(${hue}, 80%, 40%)`;
                                        };

                                        return sortedStats.map((s, idx) => {
                                          const {
                                            ciclista,
                                            nombreEquipo,
                                            ronda,
                                            orden,
                                            pais,
                                            victorias,
                                            dias,
                                            puntos,
                                            numCarreras,
                                            ppc,
                                            ppd,
                                            originalIndex,
                                          } = s;

                                          let isHiddenVisual = false;
                                          if (isTopCyclistsDraftCopying) {
                                            if (
                                              isTopCyclistsDraftCopying ===
                                              "full"
                                            )
                                              isHiddenVisual = false;
                                            else {
                                              const pageNum = parseInt(
                                                (isTopCyclistsDraftCopying as string).substring(
                                                  1,
                                                ),
                                              );
                                              const start = (pageNum - 1) * 50;
                                              const end = start + 50;
                                              isHiddenVisual = !(
                                                idx >= start && idx < end
                                              );
                                            }
                                          }

                                          if (
                                            isHiddenVisual &&
                                            isTopCyclistsDraftCopying
                                          )
                                            return null;

                                          return (
                                            <tr
                                              key={ciclista}
                                              className={cn(
                                                "hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] divide-x divide-neutral-100",
                                                isHiddenVisual && "hidden",
                                              )}
                                            >
                                              <td className="px-3 py-1 text-center">
                                                <span
                                                  className={cn(
                                                    "w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[9px] font-bold",
                                                    originalIndex === 1
                                                      ? "bg-yellow-100 text-yellow-700"
                                                      : originalIndex === 2
                                                        ? "bg-neutral-200 text-neutral-600"
                                                        : originalIndex === 3
                                                          ? "bg-orange-100 text-orange-700"
                                                          : "bg-neutral-100 text-neutral-500",
                                                  )}
                                                >
                                                  {originalIndex}
                                                </span>
                                              </td>
                                              <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                                {ciclista}{" "}
                                                <span className="text-neutral-400 font-normal text-[9px]">
                                                  &lt;{ronda || "-"}&gt;
                                                </span>
                                              </td>
                                              <td className="px-4 py-1 text-neutral-600 whitespace-nowrap">
                                                {nombreEquipo ===
                                                "No draft" ? (
                                                  <span className="text-neutral-400 italic text-[10px]">
                                                    No elegido
                                                  </span>
                                                ) : (
                                                  <span className="font-medium">
                                                    {nombreEquipo}{" "}
                                                    <span className="text-neutral-400 font-normal text-[9px]">
                                                      [#{orden}]
                                                    </span>
                                                  </span>
                                                )}
                                              </td>
                                              <td className="px-3 py-1 text-base text-center">
                                                {pais}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-3 py-1 text-center font-mono",
                                                  getColorClass(
                                                    victorias,
                                                    maxVictorias,
                                                    0,
                                                    true,
                                                  ),
                                                )}
                                              >
                                                <span className="font-mono tracking-tight">{formatNumberSpanish(
                                                  victorias,
                                                )}</span>
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-3 py-1 text-center font-mono",
                                                  getColorClass(
                                                    numCarreras,
                                                    maxCarreras,
                                                    minCarreras,
                                                  ),
                                                )}
                                              >
                                                <span className="font-mono tracking-tight">{formatNumberSpanish(
                                                  numCarreras,
                                                )}</span>
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-3 py-1 text-center font-mono",
                                                  getColorClass(
                                                    dias,
                                                    maxDias,
                                                    minDias,
                                                  ),
                                                )}
                                              >
                                                <span className="font-mono tracking-tight">{formatNumberSpanish(dias)}</span>
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-3 py-1 text-center font-mono",
                                                  getColorClass(
                                                    ppc,
                                                    maxPpc,
                                                    minPpc,
                                                  ),
                                                )}
                                              >
                                                {formatNumberSpanish(
                                                  ppc.toFixed(1),
                                                )}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-3 py-1 text-center font-mono",
                                                  getColorClass(
                                                    ppd,
                                                    maxPpd,
                                                    minPpd,
                                                  ),
                                                )}
                                              >
                                                {formatNumberSpanish(
                                                  ppd.toFixed(1),
                                                )}
                                              </td>
                                              <td
                                                className="px-4 py-1 text-right font-black font-mono text-sm"
                                                style={{
                                                  color: getPuntosColor(
                                                    puntos,
                                                  ),
                                                }}
                                              >
                                                <span className="font-mono tracking-tight">{formatNumberSpanish(
                                                  puntos,
                                                )}</span>
                                              </td>
                                            </tr>
                                          );
                                        });
                                      })()}
                                    </tbody>
                                  </table></div>
                                </div>
                              </motion.div>
    </>
  );
}
