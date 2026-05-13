import React, { useContext, useRef } from "react";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";

import { performTextCopy } from "./hooks/useExportHandlers";

export function NoDraftCyclists() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const { cn, CyclistDetailView, files, playerTeamMap, playerByCyclist, leaderboard, cyclistMetadata, cyclistRoundMap, playerOrderMap, selectedCyclistDetail, setSelectedCyclistDetail, formatNumberSpanish, getVal } = context;

  const [noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter] = React.useState<string>("all");
  const [noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit] = React.useState<number>(10);
  const [isNoDraftCyclistsExpanded, setIsNoDraftCyclistsExpanded] = React.useState<boolean>(false);
  
  const [noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter] = React.useState<string>("all");
  const [noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn] = React.useState<string>("puntos");
  const [noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection] = React.useState<"asc"|"desc">("desc");

  const [isNoDraftCyclistsCopying, setIsNoDraftCyclistsCopying] = React.useState<string | boolean>(false);
  const [isNoDraftCyclistsTextCopying, setIsNoDraftCyclistsTextCopying] = React.useState<boolean>(false);
  const noDraftCyclistsRef = useRef<HTMLDivElement>(null);
  const noDraftCyclistsTableRef = useRef<HTMLDivElement>(null);
  const noDraftRefContainer = useRef<HTMLDivElement>(null);
  
  const { handleCopyImage: copyNoDraft, handleDownloadImage: downloadNoDraft, isCopying: noDraftIsCopyingMode } = useTableScreenshot(noDraftCyclistsTableRef);

  const handleCopyNoDraftCyclists = async (mode?: string) => {
    setIsNoDraftCyclistsCopying(mode || "full");
    try {
      await copyNoDraft({ fileName: "export.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
    } finally {
      setIsNoDraftCyclistsCopying(false);
    }
  };
  const handleCopyNoDraftCyclistsText = async () => {
    performTextCopy(noDraftCyclistsTableRef, setIsNoDraftCyclistsTextCopying, "noDraftCyclists");
  };
  const handleDownloadNoDraftCyclists = async (mode?: string) => {
    await downloadNoDraft({ fileName: `top-ciclistas-no-elegidos${mode && mode !== "full" ? `-${mode}` : ""}.png`, scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
  };

  return (
    <div className="space-y-8">
                              {/* Top Cyclists (No draft) */}
                              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
                                    <User className="w-5 h-5 text-red-600" />
                                    Top Ciclistas No Elegidos (No draft)
                                  </h3>
                                  <p className="text-xs text-neutral-500 whitespace-nowrap">
                                    Corredores que han sumado puntos pero no
                                    fueron elegidos por ningún equipo.
                                  </p>

                                  <div className="flex flex-wrap gap-3 mt-1">
                                    <div className="flex flex-wrap items-center gap-1.5 border-r border-neutral-200 pr-3 copy-button-ignore">
                                      <button
                                        onClick={() =>
                                          setIsNoDraftCyclistsExpanded(
                                            !isNoDraftCyclistsExpanded,
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
                                        title={
                                          isNoDraftCyclistsExpanded
                                            ? "Contraer tabla"
                                            : "Expandir tabla"
                                        }
                                      >
                                        {isNoDraftCyclistsExpanded ? (
                                          <Minimize2 className="w-4 h-4" />
                                        ) : (
                                          <Maximize2 className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCopyNoDraftCyclists("full")
                                        }
                                        disabled={!!isNoDraftCyclistsCopying}
                                        title="Copiar imagen"
                                        className={cn(
                                          "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                                          isNoDraftCyclistsCopying === "full"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white",
                                          isNoDraftCyclistsCopying &&
                                            isNoDraftCyclistsCopying !==
                                              "full" &&
                                            "opacity-50 cursor-not-allowed",
                                        )}
                                      >
                                        {isNoDraftCyclistsCopying === "full" ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>

                                      {(() => {
                                        // Get no draft cyclists stats
                                        const noDraftStats: Record<
                                          string,
                                          any
                                        > = {};
                                        const noDraftCyclists =
                                          new Set<string>();
                                        leaderboard?.forEach((player) => {
                                          player?.detalles?.forEach((d) => {
                                            if (
                                              d.ciclista &&
                                              d.jugador === "No elegido"
                                            ) {
                                              noDraftCyclists.add(d.ciclista);
                                            }
                                          });
                                        });
                                        files.puntos?.data?.forEach((row) => {
                                          const ciclista = getVal(
                                            row,
                                            "Ciclista",
                                          );
                                          if (
                                            ciclista &&
                                            noDraftCyclists.has(ciclista)
                                          ) {
                                            const puntos = parseFloat(
                                              getVal(row, "Puntos") || "0",
                                            );
                                            if (!noDraftStats[ciclista])
                                              noDraftStats[ciclista] = {
                                                puntos: 0,
                                              };
                                            const monthMatch =
                                              noDraftCyclistsMonthFilter ===
                                                "all" ||
                                              new Date(
                                                (parseFloat(
                                                  getVal(row, "Fecha_carrera"),
                                                ) -
                                                  25569) *
                                                  86400 *
                                                  1000,
                                              )
                                                .getMonth()
                                                .toString() ===
                                                noDraftCyclistsMonthFilter;
                                            if (monthMatch) {
                                              noDraftStats[ciclista].puntos +=
                                                puntos;
                                            }
                                          }
                                        });

                                        const allStats = Array.from(
                                          noDraftCyclists,
                                        )
                                          .filter(
                                            (name) =>
                                              noDraftStats[name]?.puntos > 0,
                                          )
                                          .map((name) => ({
                                            name,
                                            data: noDraftStats[name],
                                          }))
                                          .sort(
                                            (a, b) =>
                                              b.data.puntos - a.data.puntos,
                                          );

                                        const topScorersLimit =
                                          noDraftTopCyclistsLimit === 9999
                                            ? allStats.length
                                            : Math.min(
                                                noDraftTopCyclistsLimit,
                                                allStats.length,
                                              );

                                        if (topScorersLimit > 50) {
                                          return (
                                            <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                                              {Array.from({
                                                length: Math.ceil(
                                                  topScorersLimit / 50,
                                                ),
                                              }).map((_, i) => {
                                                const s = "p" + (i + 1);
                                                const isCopyingThis =
                                                  isNoDraftCyclistsCopying ===
                                                  s;
                                                const start = i * 50 + 1;
                                                const end = (i + 1) * 50;
                                                return (
                                                  <button
                                                    key={s}
                                                    onClick={() =>
                                                      handleCopyNoDraftCyclists(
                                                        s as any,
                                                      )
                                                    }
                                                    disabled={
                                                      !!isNoDraftCyclistsCopying
                                                    }
                                                    className={cn(
                                                      "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                                      isCopyingThis
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-white",
                                                      isNoDraftCyclistsCopying &&
                                                        !isCopyingThis &&
                                                        "opacity-50 cursor-not-allowed",
                                                    )}
                                                  >
                                                    {isCopyingThis ? (
                                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                                    ) : (
                                                      <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                    {start}-{end}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}

                                      <button
                                        onClick={handleCopyNoDraftCyclistsText}
                                        disabled={isNoDraftCyclistsTextCopying}
                                        title="Copiar texto"
                                        className={cn(
                                          "px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
                                          isNoDraftCyclistsTextCopying
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                                        )}
                                      >
                                        {isNoDraftCyclistsTextCopying ? (
                                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        ) : (
                                          <FileText className="w-4 h-4 mr-1.5" />
                                        )}
                                        Texto
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDownloadNoDraftCyclists("full")
                                        }
                                        title="Descargar imagen"
                                        className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>

                                    <select
                                      value={noDraftCyclistsMonthFilter}
                                      onChange={(e) =>
                                        setNoDraftCyclistsMonthFilter(
                                          e.target.value,
                                        )
                                      }
                                      className="px-3 py-1.5 h-8 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                      {[25, 50, 100, 9999].map((limit) => (
                                        <button
                                          key={limit}
                                          onClick={() =>
                                            setNoDraftTopCyclistsLimit(limit)
                                          }
                                          className={cn(
                                            "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                            noDraftTopCyclistsLimit === limit
                                              ? "bg-white text-blue-600 shadow-sm"
                                              : "text-neutral-500 hover:text-neutral-700",
                                          )}
                                        >
                                          {limit === 9999
                                            ? "Todos"
                                            : `Top ${limit}`}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  ref={noDraftCyclistsTableRef}
                                  className={cn(
                                    "overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 scrollbar-thin flex justify-center",
                                    isNoDraftCyclistsExpanded
                                      ? "max-h-none"
                                      : "h-[800px]",
                                  )}
                                >
                                  <div ref={noDraftRefContainer} className="table-responsive-wrapper overflow-auto w-full max-h-[600px]"><table className="w-full min-w-[700px] text-xs text-left bg-white bg-white rounded-xl shadow-sm rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
                                      <tr className="divide-x divide-neutral-100">
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (
                                              noDraftCyclistsSortColumn ===
                                              "pos"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "pos",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Pos{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "pos" &&
                                              (noDraftCyclistsSortDirection ===
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
                                              noDraftCyclistsSortColumn ===
                                              "nombre"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "nombre",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ciclista{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "nombre" &&
                                              (noDraftCyclistsSortDirection ===
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
                                              noDraftCyclistsSortColumn ===
                                              "equipo"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "equipo",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Equipo{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "equipo" &&
                                              (noDraftCyclistsSortDirection ===
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
                                              noDraftCyclistsSortColumn ===
                                              "pais"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "pais",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            País{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "pais" &&
                                              (noDraftCyclistsSortDirection ===
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
                                              noDraftCyclistsSortColumn ===
                                              "victorias"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "victorias",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Vic{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "victorias" &&
                                              (noDraftCyclistsSortDirection ===
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
                                              noDraftCyclistsSortColumn ===
                                              "carreras"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "carreras",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Carr{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "carreras" &&
                                              (noDraftCyclistsSortDirection ===
                                              "asc" ? (
                                                <ChevronUp className="w-3.5 h-3.5" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                              ))}
                                          </div>
                                        </th>
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          title="Puntos por carreras"
                                          onClick={() => {
                                            if (
                                              noDraftCyclistsSortColumn ===
                                              "ppc"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "ppc",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            P/C{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "ppc" &&
                                              (noDraftCyclistsSortDirection ===
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
                                              noDraftCyclistsSortColumn ===
                                              "puntos"
                                            ) {
                                              setNoDraftCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setNoDraftCyclistsSortColumn(
                                                "puntos",
                                              );
                                              setNoDraftCyclistsSortDirection(
                                                "desc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center justify-center gap-1">
                                            Pts{" "}
                                            {noDraftCyclistsSortColumn ===
                                              "puntos" &&
                                              (noDraftCyclistsSortDirection ===
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
                                        const noDraftPlayer = leaderboard?.find(
                                          (p) => p.jugador === "No draft",
                                        );
                                        if (!noDraftPlayer) {
                                          return (
                                            <tr>
                                              <td
                                                colSpan={8}
                                                className="px-6 py-10 text-center text-neutral-400 italic"
                                              >
                                                No hay datos de puntuación para
                                                ciclistas no elegidos.
                                              </td>
                                            </tr>
                                          );
                                        }

                                        const cyclistStats: Record<
                                          string,
                                          {
                                            puntos: number;
                                            pais: string;
                                            equipoBreve: string;
                                            victorias: number;
                                            carreras: Set<string>;
                                            dias: number;
                                          }
                                        > = {};

                                        // Map races to months
                                        const raceMonths: Record<
                                          string,
                                          number
                                        > = {};
                                        files.carreras.data?.forEach((r) => {
                                          const carreraName = getVal(
                                            r,
                                            "Carrera",
                                          )?.trim();
                                          const fechaFin = getVal(r, "Fecha");
                                          if (carreraName && fechaFin) {
                                            const parts =
                                              fechaFin.split(/[-/]/);
                                            if (parts.length >= 2) {
                                              const monthIndex =
                                                parseInt(parts[1]) - 1;
                                              raceMonths[carreraName] =
                                                monthIndex;
                                            }
                                          }
                                        });

                                        noDraftPlayer.detalles.forEach((d) => {
                                          if (
                                            noDraftCyclistsMonthFilter !==
                                              "all" &&
                                            raceMonths[d.carrera] !==
                                              parseInt(
                                                noDraftCyclistsMonthFilter,
                                              )
                                          ) {
                                            return;
                                          }

                                          if (!cyclistStats[d.ciclista]) {
                                            const meta =
                                              cyclistMetadata[d.ciclista];
                                            cyclistStats[d.ciclista] = {
                                              puntos: 0,
                                              pais: meta?.pais || "",
                                              equipoBreve:
                                                meta?.equipoBreve || "",
                                              victorias: 0,
                                              carreras: new Set(),
                                              dias: 0,
                                            };
                                          }

                                          const stats =
                                            cyclistStats[d.ciclista];
                                          stats.puntos += d.puntosObtenidos;
                                          stats.carreras.add(d.carrera);

                                          const isPos01 =
                                            d.posicion === "01" ||
                                            d.posicion === "1";
                                          const isValidType = [
                                            "Etapa",
                                            "Etapa (Crono equipos)",
                                            "Clasificación final",
                                            "Clasificación final (Crono equipos)",
                                            "Clásica",
                                          ].includes(d.tipoResultado);
                                          if (isPos01 && isValidType)
                                            stats.victorias += 1;
                                        });

                                        const allStats = Object.entries(
                                          cyclistStats,
                                        )
                                          .sort(
                                            (a, b) => b[1].puntos - a[1].puntos,
                                          )
                                          .map(([name, data], index) => {
                                            const numCarreras =
                                              data.carreras.size;
                                            const ppc =
                                              numCarreras > 0
                                                ? parseFloat(
                                                    (
                                                      data.puntos / numCarreras
                                                    ).toFixed(1),
                                                  )
                                                : 0;
                                            return {
                                              name,
                                              data,
                                              numCarreras,
                                              ppc,
                                              originalPos: index + 1,
                                            };
                                          });

                                        allStats.sort((a, b) => {
                                          let valA: any, valB: any;
                                          switch (noDraftCyclistsSortColumn) {
                                            case "pos":
                                              valA = a.originalPos;
                                              valB = b.originalPos;
                                              break;
                                            case "nombre":
                                              valA = a.name;
                                              valB = b.name;
                                              break;
                                            case "equipo":
                                              valA = a.data.equipoBreve;
                                              valB = b.data.equipoBreve;
                                              break;
                                            case "pais":
                                              valA = a.data.pais;
                                              valB = b.data.pais;
                                              break;
                                            case "victorias":
                                              valA = a.data.victorias;
                                              valB = b.data.victorias;
                                              break;
                                            case "carreras":
                                              valA = a.numCarreras;
                                              valB = b.numCarreras;
                                              break;
                                            case "ppc":
                                              valA = a.ppc;
                                              valB = b.ppc;
                                              break;
                                            case "puntos":
                                            default:
                                              valA = a.data.puntos;
                                              valB = b.data.puntos;
                                              break;
                                          }
                                          if (
                                            typeof valA === "string" &&
                                            typeof valB === "string"
                                          ) {
                                            return noDraftCyclistsSortDirection ===
                                              "asc"
                                              ? valA.localeCompare(valB)
                                              : valB.localeCompare(valA);
                                          }
                                          if (valA < valB)
                                            return noDraftCyclistsSortDirection ===
                                              "asc"
                                              ? -1
                                              : 1;
                                          if (valA > valB)
                                            return noDraftCyclistsSortDirection ===
                                              "asc"
                                              ? 1
                                              : -1;
                                          return 0;
                                        });

                                        const sortedStats = allStats.slice(
                                          0,
                                          noDraftTopCyclistsLimit,
                                        );
                                        if (sortedStats.length === 0) {
                                          return (
                                            <tr>
                                              <td
                                                colSpan={8}
                                                className="px-6 py-10 text-center text-neutral-400 italic"
                                              >
                                                No hay ciclistas no elegidos que
                                                coincidan con los criterios.
                                              </td>
                                            </tr>
                                          );
                                        }

                                        const maxPuntos =
                                          sortedStats[0].data.puntos;
                                        const minPuntos =
                                          sortedStats[sortedStats.length - 1]
                                            .data.puntos;
                                        const maxVictorias = Math.max(
                                          ...sortedStats.map(
                                            (s) => s.data.victorias,
                                          ),
                                          0,
                                        );

                                        return sortedStats.map((s) => (
                                          <tr
                                            key={s.name}
                                            className="no-draft-row hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100"
                                          >
                                            <td className="px-4 py-1 text-center">
                                              <span
                                                className={cn(
                                                  "w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[9px] font-bold",
                                                  s.originalPos === 1
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : s.originalPos === 2
                                                      ? "bg-neutral-200 text-neutral-600"
                                                      : s.originalPos === 3
                                                        ? "bg-orange-100 text-orange-700"
                                                        : "bg-neutral-100 text-neutral-500",
                                                )}
                                              >
                                                {s.originalPos}
                                              </span>
                                            </td>
                                            <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                              {s.name}
                                            </td>
                                            <td className="px-4 py-1 text-neutral-600 text-center whitespace-nowrap">
                                              {s.data.equipoBreve}
                                            </td>
                                            <td className="px-4 py-1 text-lg text-center">
                                              {s.data.pais}
                                            </td>
                                            <td
                                              className={cn(
                                                "px-4 py-1 text-center",
                                                s.data.victorias > 0
                                                  ? "text-green-600 font-bold"
                                                  : "text-neutral-400",
                                              )}
                                            >
                                              {s.data.victorias}
                                            </td>
                                            <td className="px-4 py-1 text-center text-neutral-600">
                                              {s.numCarreras}
                                            </td>
                                            <td className="px-4 py-1 text-center text-neutral-600">
                                              {s.ppc.toFixed(1)}
                                            </td>
                                            <td
                                              className="px-4 py-1 text-center font-black"
                                              style={{
                                                color: `hsl(${45 + ((s.data.puntos - minPuntos) / (maxPuntos - minPuntos || 1)) * 75}, 80%, 40%)`,
                                              }}
                                            >
                                              {s.data.puntos}
                                            </td>
                                          </tr>
                                        ));
                                      })()}
                                    </tbody>
                                  </table></div>
                                </div>
                              </div>
                            </div>
  );
}
