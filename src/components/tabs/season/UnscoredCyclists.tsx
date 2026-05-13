import React, { useContext, useRef } from "react";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";

import { performTextCopy } from "./hooks/useExportHandlers";

export function UnscoredCyclists() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;

  const { cn, files, playerTeamMap, playerByCyclist, leaderboard, cyclistMetadata, cyclistRoundMap, playerOrderMap, getVal } = context;

  const [unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter] = React.useState<string>("all");
  const [unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter] = React.useState<string[]>([]);
  const [isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen] = React.useState<boolean>(false);
  const [unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn] = React.useState<string>("pos");
  const [unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection] = React.useState<"asc"|"desc">("asc");
  const [isUnscoredExpanded, setIsUnscoredExpanded] = React.useState(false);
  
  const [isUnscoredCopying, setIsUnscoredCopying] = React.useState<string | boolean>(false);
  const [isUnscoredTextCopying, setIsUnscoredTextCopying] = React.useState<boolean>(false);
  
  const unscoredRef = useRef<HTMLDivElement>(null);
  const unscoredRefContainer = useRef<HTMLDivElement>(null);
  const unscoredTableRef = useRef<HTMLDivElement>(null);

  const { handleCopyImage: copyUnscoredImage, handleDownloadImage: downloadUnscoredImage, isCopying: isUnscoredTableCopying } = useTableScreenshot(unscoredTableRef);

  const handleCopyUnscored = async (mode?: string) => {
    setIsUnscoredCopying(mode || "full");
    try {
      await copyUnscoredImage({ fileName: "export.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
    } finally {
      setIsUnscoredCopying(false);
    }
  };
  const handleCopyUnscoredText = async () => {
    performTextCopy(unscoredTableRef, setIsUnscoredTextCopying, "unscoredCyclists");
  };
  const handleDownloadUnscored = async (mode?: string) => {
    await downloadUnscoredImage({ fileName: `ciclistas-sin-puntuar${mode && mode !== "full" ? `-${mode}` : ""}.png`, scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
  };

  return (
    <>
                              {/* Unscored Cyclists Table */}
                              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-8">
                                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
                                    <UserMinus className="w-5 h-5 text-neutral-400" />
                                    Ciclistas sin puntuar (
                                    {(() => {
                                      // Get all cyclists from elecciones
                                      const unscored = files.elecciones.data
                                        ?.map((row) => {
                                          const ciclista = getVal(
                                            row,
                                            "Ciclista",
                                          )?.trim();
                                          const jugador = getVal(
                                            row,
                                            "Nombre_TG",
                                          )?.trim();

                                          // Calculate points
                                          let points = 0;
                                          leaderboard?.forEach((p) => {
                                            if (p.jugador === jugador) {
                                              p?.detalles?.forEach((d) => {
                                                if (d.ciclista === ciclista) {
                                                  points += d.puntosObtenidos;
                                                }
                                              });
                                            }
                                          });

                                          if (points > 0) return null;
                                          return {
                                            ciclista,
                                            ronda:
                                              cyclistRoundMap[ciclista] || "",
                                            nombreEquipo: getVal(
                                              row,
                                              "Nombre_Equipo",
                                            )?.trim(),
                                          };
                                        })
                                        .filter(Boolean) as any[];

                                      // Filter by team and round
                                      return unscored.filter((c) => {
                                        const teamMatch =
                                          unscoredCyclistsTeamFilter ===
                                            "all" ||
                                          c.nombreEquipo ===
                                            unscoredCyclistsTeamFilter;
                                        const roundMatch =
                                          unscoredCyclistsRoundFilter.length ===
                                            0 ||
                                          unscoredCyclistsRoundFilter.includes(
                                            c.ronda,
                                          );
                                        return teamMatch && roundMatch;
                                      }).length;
                                    })()}
                                    )
                                  </h3>
                                  <p className="text-xs text-neutral-500 whitespace-nowrap">
                                    Corredores elegidos en el draft que aún no
                                    han sumado puntos.
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 mt-1">
                                    <div className="flex flex-wrap items-center gap-1.5 pr-3 border-r border-neutral-200 copy-button-ignore">
                                      <button
                                        onClick={() =>
                                          setIsUnscoredExpanded(
                                            !isUnscoredExpanded,
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
                                        title={
                                          isUnscoredExpanded
                                            ? "Contraer tabla"
                                            : "Expandir tabla"
                                        }
                                      >
                                        {isUnscoredExpanded ? (
                                          <Minimize2 className="w-4 h-4" />
                                        ) : (
                                          <Maximize2 className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCopyUnscored("full")
                                        }
                                        disabled={!!isUnscoredCopying}
                                        title="Copiar imagen"
                                        className={cn(
                                          "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                                          isUnscoredCopying === "full"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white",
                                          isUnscoredCopying &&
                                            isUnscoredCopying !== "full" &&
                                            "opacity-50 cursor-not-allowed",
                                        )}
                                      >
                                        {isUnscoredCopying === "full" ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>

                                      {(() => {
                                        const unscoredCount =
                                          (files.elecciones.data
                                            ?.map((row) => {
                                              const ciclista = getVal(
                                                row,
                                                "Ciclista",
                                              )?.trim();
                                              const jugador = getVal(
                                                row,
                                                "Nombre_TG",
                                              )?.trim();
                                              let points = 0;
                                              leaderboard?.forEach((p) => {
                                                if (p.jugador === jugador) {
                                                  p?.detalles?.forEach((d) => {
                                                    if (d.ciclista === ciclista)
                                                      points +=
                                                        d.puntosObtenidos;
                                                  });
                                                }
                                              });
                                              if (points > 0) return null;
                                              return {
                                                ciclista,
                                                ronda:
                                                  cyclistRoundMap[ciclista] ||
                                                  "",
                                                nombreEquipo: getVal(
                                                  row,
                                                  "Nombre_Equipo",
                                                )?.trim(),
                                              };
                                            })
                                            .filter(Boolean) as any[]) || [];
                                        const count = unscoredCount.filter(
                                          (c) => {
                                            const teamMatch =
                                              unscoredCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                unscoredCyclistsTeamFilter;
                                            const roundMatch =
                                              unscoredCyclistsRoundFilter.length ===
                                                0 ||
                                              unscoredCyclistsRoundFilter.includes(
                                                c.ronda,
                                              );
                                            return teamMatch && roundMatch;
                                          },
                                        ).length;

                                        if (count > 50) {
                                          return (
                                            <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                                              {Array.from({
                                                length: Math.ceil(count / 50),
                                              }).map((_, i) => {
                                                const s = "p" + (i + 1);
                                                const isCopyingThis =
                                                  isUnscoredCopying === s;
                                                return (
                                                  <button
                                                    key={s}
                                                    onClick={() =>
                                                      handleCopyUnscored(
                                                        s as any,
                                                      )
                                                    }
                                                    disabled={
                                                      !!isUnscoredCopying
                                                    }
                                                    className={cn(
                                                      "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                                      isCopyingThis
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-white",
                                                      isUnscoredCopying &&
                                                        !isCopyingThis &&
                                                        "opacity-50 cursor-not-allowed",
                                                    )}
                                                  >
                                                    {isCopyingThis ? (
                                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                                    ) : (
                                                      <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                    {i * 50 + 1}-{(i + 1) * 50}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}

                                      <button
                                        onClick={handleCopyUnscoredText}
                                        disabled={isUnscoredTextCopying}
                                        title="Copiar texto"
                                        className={cn(
                                          "px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
                                          isUnscoredTextCopying
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                                        )}
                                      >
                                        {isUnscoredTextCopying ? (
                                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        ) : (
                                          <FileText className="w-4 h-4 mr-1.5" />
                                        )}
                                        Texto
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadUnscored("full")
                                        }
                                        title="Descargar imagen"
                                        className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Round Multi-select Filter */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setIsUnscoredRoundFilterOpen(
                                            !isUnscoredRoundFilterOpen,
                                          )
                                        }
                                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
                                      >
                                        <span className="truncate">
                                          {unscoredCyclistsRoundFilter.length ===
                                          0
                                            ? "Todas las rondas"
                                            : `${unscoredCyclistsRoundFilter.length} rondas`}
                                        </span>
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 text-neutral-400 transition-transform",
                                            isUnscoredRoundFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </button>

                                      {isUnscoredRoundFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                              setIsUnscoredRoundFilterOpen(
                                                false,
                                              )
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 py-2 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                Rondas
                                              </span>
                                              {unscoredCyclistsRoundFilter.length >
                                                0 && (
                                                <button
                                                  onClick={() =>
                                                    setUnscoredCyclistsRoundFilter(
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
                                                    checked={unscoredCyclistsRoundFilter.includes(
                                                      ronda,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setUnscoredCyclistsRoundFilter(
                                                          [
                                                            ...unscoredCyclistsRoundFilter,
                                                            ronda,
                                                          ],
                                                        );
                                                      } else {
                                                        setUnscoredCyclistsRoundFilter(
                                                          unscoredCyclistsRoundFilter.filter(
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
                                      value={unscoredCyclistsTeamFilter}
                                      onChange={(e) =>
                                        setUnscoredCyclistsTeamFilter(
                                          e.target.value,
                                        )
                                      }
                                      className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                      <option value="all">
                                        Todos los equipos
                                      </option>
                                      {leaderboard?.map((p) => (
                                        <option
                                          key={p.nombreEquipo}
                                          value={p.nombreEquipo}
                                        >
                                          {p.nombreEquipo}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div
                                  ref={unscoredTableRef}
                                  className={cn(
                                    "overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 scrollbar-thin",
                                    isUnscoredExpanded
                                      ? "max-h-none"
                                      : "h-[800px]",
                                  )}
                                >
                                  <div ref={unscoredRefContainer} className="table-responsive-wrapper overflow-auto w-full max-h-[600px]"><table className="min-w-full text-xs text-left bg-white bg-white rounded-xl shadow-sm rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
                                      <tr className="divide-x divide-neutral-100">
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "jugador"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "jugador",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Jugador{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "jugador" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "ciclista"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "ciclista",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ciclista{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "ciclista" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "ronda"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "ronda",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1 text-center justify-center">
                                            Ronda{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "ronda" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          title="Carreras disputadas"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "carreras"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "carreras",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Carreras{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "carreras" &&
                                              (unscoredCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          title="Días de competición"
                                          onClick={() => {
                                            if (
                                              unscoredCyclistsSortColumn ===
                                              "dias"
                                            ) {
                                              setUnscoredCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUnscoredCyclistsSortColumn(
                                                "dias",
                                              );
                                              setUnscoredCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Días{" "}
                                            {unscoredCyclistsSortColumn ===
                                              "dias" &&
                                              (unscoredCyclistsSortDirection ===
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
                                        // Get all cyclists from elecciones
                                        const unscored = files.elecciones.data
                                          ?.map((row) => {
                                            const ciclista = getVal(
                                              row,
                                              "Ciclista",
                                            )?.trim();
                                            const jugador = getVal(
                                              row,
                                              "Nombre_TG",
                                            )?.trim();
                                            const nombreEquipo = getVal(
                                              row,
                                              "Nombre_Equipo",
                                            )?.trim();
                                            const orden =
                                              playerOrderMap[jugador] || "";
                                            const ronda =
                                              cyclistRoundMap[ciclista] || "";

                                            // Calculate points
                                            let points = 0;
                                            leaderboard?.forEach((p) => {
                                              if (p.jugador === jugador) {
                                                p?.detalles?.forEach((d) => {
                                                  if (d.ciclista === ciclista) {
                                                    points += d.puntosObtenidos;
                                                  }
                                                });
                                              }
                                            });

                                            if (points > 0) return null;

                                            // Get metadata
                                            const meta = cyclistMetadata[
                                              ciclista
                                            ] || {
                                              carrerasDisputadas: 0,
                                              diasCompeticion: 0,
                                            };

                                            return {
                                              ciclista,
                                              jugador,
                                              nombreEquipo,
                                              orden,
                                              ronda,
                                              carreras: meta.carrerasDisputadas,
                                              dias: meta.diasCompeticion,
                                            };
                                          })
                                          .filter(Boolean) as any[];

                                        // Filter by team and round
                                        const filtered = unscored.filter(
                                          (c) => {
                                            const teamMatch =
                                              unscoredCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                unscoredCyclistsTeamFilter;
                                            const roundMatch =
                                              unscoredCyclistsRoundFilter.length ===
                                                0 ||
                                              unscoredCyclistsRoundFilter.includes(
                                                c.ronda,
                                              );
                                            return teamMatch && roundMatch;
                                          },
                                        );

                                        // Sort
                                        filtered.sort((a, b) => {
                                          let valA: any, valB: any;
                                          switch (unscoredCyclistsSortColumn) {
                                            case "jugador":
                                              valA = a.nombreEquipo;
                                              valB = b.nombreEquipo;
                                              break;
                                            case "ciclista":
                                              valA = a.ciclista;
                                              valB = b.ciclista;
                                              break;
                                            case "ronda":
                                              valA = a.ronda;
                                              valB = b.ronda;
                                              break;
                                            case "carreras":
                                              valA = a.carreras;
                                              valB = b.carreras;
                                              break;
                                            case "dias":
                                              valA = a.dias;
                                              valB = b.dias;
                                              break;
                                            default:
                                              valA = a.ronda;
                                              valB = b.ronda;
                                              break;
                                          }

                                          if (
                                            typeof valA === "string" &&
                                            typeof valB === "string"
                                          ) {
                                            return unscoredCyclistsSortDirection ===
                                              "asc"
                                              ? valA.localeCompare(valB)
                                              : valB.localeCompare(valA);
                                          }

                                          if (valA < valB)
                                            return unscoredCyclistsSortDirection ===
                                              "asc"
                                              ? -1
                                              : 1;
                                          if (valA > valB)
                                            return unscoredCyclistsSortDirection ===
                                              "asc"
                                              ? 1
                                              : -1;
                                          return 0;
                                        });

                                        // Calculate max values for conditional formatting
                                        const maxCarreras = Math.max(
                                          ...filtered.map((c) => c.carreras),
                                          0,
                                        );
                                        const maxDias = Math.max(
                                          ...filtered.map((c) => c.dias),
                                          0,
                                        );

                                        if (filtered.length === 0) {
                                          return (
                                            <tr>
                                              <td
                                                colSpan={5}
                                                className="px-6 py-10 text-center text-neutral-400 italic text-[11px]"
                                              >
                                                No hay ciclistas sin puntuar que
                                                coincidan con los criterios.
                                              </td>
                                            </tr>
                                          );
                                        }

                                        return filtered.map((c, idx) => {
                                          let isHiddenVisual = false;
                                          if (isUnscoredCopying) {
                                            if (isUnscoredCopying === "full")
                                              isHiddenVisual = false;
                                            else {
                                              const pageNum = parseInt(
                                                (isUnscoredCopying as string).substring(1),
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
                                            isUnscoredCopying
                                          )
                                            return null;

                                          return (
                                            <tr
                                              key={idx}
                                              className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100"
                                            >
                                              <td className="px-4 py-1 text-neutral-600 whitespace-nowrap">
                                                <span className="font-medium">
                                                  {c.nombreEquipo}
                                                </span>{" "}
                                                <span className="text-neutral-400 font-normal text-[9px]">
                                                  [#{c.orden}]
                                                </span>
                                              </td>
                                              <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                                {c.ciclista}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-4 py-1 text-center font-mono whitespace-nowrap",
                                                  [
                                                    "01",
                                                    "02",
                                                    "03",
                                                    "1",
                                                    "2",
                                                    "3",
                                                  ].includes(c.ronda)
                                                    ? "bg-yellow-50 text-yellow-700 font-bold"
                                                    : "text-neutral-500",
                                                )}
                                              >
                                                {c.ronda}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-4 py-1 text-center font-mono whitespace-nowrap",
                                                  c.carreras === 0
                                                    ? "text-red-600 font-bold"
                                                    : c.carreras ===
                                                          maxCarreras &&
                                                        maxCarreras > 0
                                                      ? "text-green-600 font-bold"
                                                      : "text-neutral-600",
                                                )}
                                              >
                                                {c.carreras}
                                              </td>
                                              <td
                                                className={cn(
                                                  "px-4 py-1 text-center font-mono whitespace-nowrap",
                                                  c.dias === 0
                                                    ? "text-red-600 font-bold"
                                                    : c.dias === maxDias &&
                                                        maxDias > 0
                                                      ? "text-green-600 font-bold"
                                                      : "text-neutral-600",
                                                )}
                                              >
                                                {c.dias}
                                              </td>
                                            </tr>
                                          );
                                        });
                                      })()}
                                    </tbody>
                                  </table></div>
                                </div>
                              </div>

    </>
  );
}
