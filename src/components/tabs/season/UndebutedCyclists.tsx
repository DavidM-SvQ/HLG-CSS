import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import React, { useContext, useRef } from "react";
import { useUrlState } from "../../../hooks/useUrlState";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History , ChevronRight} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";

import { performTextCopy } from "./hooks/useExportHandlers";
import { Button } from "../../ui/button";

export function UndebutedCyclists() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const { cn, files, playerTeamMap, playerByCyclist, leaderboard, cyclistMetadata, cyclistRoundMap, playerOrderMap, getVal } = context;

  const [undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter] = useUrlState<string>("undebutedCyclistsTeamFilter", "all");
  const [undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter] = useUrlState<string[]>("undebutedCyclistsRoundFilter", []);
  const [isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen] = React.useState<boolean>(false);
  const [undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn] = useUrlState<string>("undebutedCyclistsSortColumn", "pos");
  const [undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection] = useUrlState<"asc"|"desc">("undebutedCyclistsSortDirection", "asc");
  const [isUndebutedExpanded, setIsUndebutedExpanded] = React.useState(false);
  
  const [isUndebutedCopying, setIsUndebutedCopying] = React.useState<string | boolean>(false);
  const [isUndebutedTextCopying, setIsUndebutedTextCopying] = React.useState<boolean>(false);
  
  const undebutedRef = useRef<HTMLDivElement>(null);
  const undebutedRefContainer = useRef<HTMLDivElement>(null);
  const undebutedTableRef = useRef<HTMLDivElement>(null);
  
  const { handleCopyImage: copyUndebutedImage, handleDownloadImage: downloadUndebutedImage, isCopying: isUndebutedTableCopyingState } = useTableScreenshot(undebutedTableRef);

  const handleCopyUndebuted = async (mode?: string) => {
    setIsUndebutedCopying(mode || "full");
    try {
      await copyUndebutedImage({ fileName: "export.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
    } finally {
      setIsUndebutedCopying(false);
    }
  };
  const handleCopyUndebutedText = async () => {
    performTextCopy(undebutedTableRef, setIsUndebutedTextCopying, "undebutedCyclists");
  };
  const handleDownloadUndebuted = async (mode?: string) => {
    await downloadUndebutedImage({ fileName: `ciclistas-sin-debutar${mode && mode !== "full" ? `-${mode}` : ""}.png`, scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
  };

  return (
    <>
                              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-8">
                                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
                                    <UserMinus className="w-5 h-5 text-neutral-400" />
                                    Ciclistas sin debutar (
                                    {(() => {
                                      const undebuted = files.elecciones.data
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
                                          const ronda =
                                            cyclistRoundMap[ciclista] || "";
                                          const meta = cyclistMetadata[
                                            ciclista
                                          ] || {
                                            carrerasDisputadas: 0,
                                            diasCompeticion: 0,
                                          };

                                          if (meta.diasCompeticion > 0)
                                            return null;

                                          return { nombreEquipo, ronda };
                                        })
                                        .filter(Boolean) as any[];

                                      const filtered = undebuted.filter((c) => {
                                        const teamMatch =
                                          undebutedCyclistsTeamFilter ===
                                            "all" ||
                                          c.nombreEquipo ===
                                            undebutedCyclistsTeamFilter;
                                        const roundMatch =
                                          undebutedCyclistsRoundFilter.length ===
                                            0 ||
                                          undebutedCyclistsRoundFilter.includes(
                                            c.ronda,
                                          );
                                        return teamMatch && roundMatch;
                                      });

                                      return filtered.length;
                                    })()}
                                    )
                                  </h3>
                                  <p className="text-xs text-neutral-500 whitespace-nowrap">
                                    Corredores elegidos en el draft que aún no
                                    han disputado ninguna carrera (días = 0).
                                  </p>
                                  <div className="flex flex-wrap gap-3 mt-1">
                                    <div className="flex flex-wrap items-center gap-1.5 border-r border-neutral-200 pr-3 copy-button-ignore">
                                      <Button variant="outline"
                                        onClick={() =>
                                          setIsUndebutedExpanded(
                                            !isUndebutedExpanded,
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
                                        title={
                                          isUndebutedExpanded
                                            ? "Contraer tabla"
                                            : "Expandir tabla"
                                        }
                                      >
                                        {isUndebutedExpanded ? (
                                          <Minimize2 className="w-4 h-4" />
                                        ) : (
                                          <Maximize2 className="w-4 h-4" />
                                        )}
                                      </Button>
                                      <Button variant="outline"
                                        onClick={() =>
                                          handleCopyUndebuted("full")
                                        }
                                        disabled={!!isUndebutedCopying}
                                        title="Copiar imagen"
                                        className={cn(
                                          "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                                          isUndebutedCopying === "full"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white",
                                          isUndebutedCopying &&
                                            isUndebutedCopying !== "full" &&
                                            "opacity-50 cursor-not-allowed",
                                        )}
                                      >
                                        {isUndebutedCopying === "full" ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </Button>

                                      {(() => {
                                        const undebutedCount =
                                          (files.elecciones.data
                                            ?.map((row) => {
                                              const ciclista = getVal(
                                                row,
                                                "Ciclista",
                                              )?.trim();
                                              const meta = cyclistMetadata[
                                                ciclista
                                              ] || {
                                                carrerasDisputadas: 0,
                                                diasCompeticion: 0,
                                              };
                                              if (meta.diasCompeticion > 0)
                                                return null;
                                              return {
                                                nombreEquipo: getVal(
                                                  row,
                                                  "Nombre_Equipo",
                                                )?.trim(),
                                                ronda:
                                                  cyclistRoundMap[ciclista] ||
                                                  "",
                                              };
                                            })
                                            .filter(Boolean) as any[]) || [];
                                        const count = undebutedCount.filter(
                                          (c) => {
                                            const teamMatch =
                                              undebutedCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                undebutedCyclistsTeamFilter;
                                            const roundMatch =
                                              undebutedCyclistsRoundFilter.length ===
                                                0 ||
                                              undebutedCyclistsRoundFilter.includes(
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
                                                  isUndebutedCopying === s;
                                                return (
                                                  <Button variant="outline"
                                                    key={s}
                                                    onClick={() =>
                                                      handleCopyUndebuted(
                                                        s as any,
                                                      )
                                                    }
                                                    disabled={
                                                      !!isUndebutedCopying
                                                    }
                                                    className={cn(
                                                      "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                                      isCopyingThis
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-white",
                                                      isUndebutedCopying &&
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
                                                  </Button>
                                                );
                                              })}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}

                                      <Button variant="ghost" size="icon"
                                        onClick={handleCopyUndebutedText}
                                        disabled={isUndebutedTextCopying}
                                        title="Copiar texto"
                                        className={cn(
                                          "px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
                                          isUndebutedTextCopying
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                                        )}
                                      >
                                        {isUndebutedTextCopying ? (
                                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        ) : (
                                          <FileText className="w-4 h-4 mr-1.5" />
                                        )}
                                        Texto
                                      </Button>
                                      <Button variant="outline"
                                        onClick={() =>
                                          handleDownloadUndebuted("full")
                                        }
                                        title="Descargar imagen"
                                        className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
                                      >
                                        <Download className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <div className="relative">
                                      <Button variant="outline"
                                        onClick={() =>
                                          setIsUndebutedRoundFilterOpen(
                                            !isUndebutedRoundFilterOpen,
                                          )
                                        }
                                        className={cn(
                                          "flex items-center gap-2 px-3 py-2 text-sm border rounded-md shadow-sm transition-all",
                                          undebutedCyclistsRoundFilter.length >
                                            0
                                            ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                                            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                                        )}
                                      >
                                        {undebutedCyclistsRoundFilter.length ===
                                        0
                                          ? "Todas las rondas"
                                          : `${undebutedCyclistsRoundFilter.length} ${undebutedCyclistsRoundFilter.length === 1 ? "ronda" : "rondas"}`}
                                        <ChevronDown
                                          className={cn(
                                            "w-4 h-4 transition-transform",
                                            isUndebutedRoundFilterOpen &&
                                              "rotate-180",
                                          )}
                                        />
                                      </Button>

                                      {isUndebutedRoundFilterOpen && (
                                        <>
                                          <div
                                            className="fixed inset-0 z-[40]"
                                            onClick={() =>
                                              setIsUndebutedRoundFilterOpen(
                                                false,
                                              )
                                            }
                                          />
                                          <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-[50] py-1 max-h-64 overflow-y-auto">
                                            <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                                Filtrar por ronda
                                              </span>
                                              {undebutedCyclistsRoundFilter.length >
                                                0 && (
                                                <Button variant="outline"
                                                  onClick={() =>
                                                    setUndebutedCyclistsRoundFilter(
                                                      [],
                                                    )
                                                  }
                                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                  Limpiar
                                                </Button>
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
                                                    checked={undebutedCyclistsRoundFilter.includes(
                                                      ronda,
                                                    )}
                                                    onChange={(e) => {
                                                      if (e.target.checked) {
                                                        setUndebutedCyclistsRoundFilter(
                                                          [
                                                            ...undebutedCyclistsRoundFilter,
                                                            ronda,
                                                          ],
                                                        );
                                                      } else {
                                                        setUndebutedCyclistsRoundFilter(
                                                          undebutedCyclistsRoundFilter.filter(
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
                                      value={undebutedCyclistsTeamFilter}
                                      onChange={(e) =>
                                        setUndebutedCyclistsTeamFilter(
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
                                  ref={undebutedTableRef}
                                  className={cn(
                                    "overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin",
                                    isUndebutedExpanded
                                      ? "max-h-none"
                                      : "max-h-[750px]",
                                  )}
                                >
                                  <div ref={undebutedRefContainer} className="table-responsive-wrapper overflow-auto w-full max-h-[600px]"><table className="min-w-full text-xs text-left bg-white bg-white rounded-xl shadow-sm rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
                                      <tr className="divide-x divide-neutral-100">
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap"
                                          onClick={() => {
                                            if (
                                              undebutedCyclistsSortColumn ===
                                              "jugador"
                                            ) {
                                              setUndebutedCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUndebutedCyclistsSortColumn(
                                                "jugador",
                                              );
                                              setUndebutedCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Jugador{" "}
                                            {undebutedCyclistsSortColumn ===
                                              "jugador" &&
                                              (undebutedCyclistsSortDirection ===
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
                                              undebutedCyclistsSortColumn ===
                                              "ciclista"
                                            ) {
                                              setUndebutedCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUndebutedCyclistsSortColumn(
                                                "ciclista",
                                              );
                                              setUndebutedCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ciclista{" "}
                                            {undebutedCyclistsSortColumn ===
                                              "ciclista" &&
                                              (undebutedCyclistsSortDirection ===
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
                                              undebutedCyclistsSortColumn ===
                                              "ronda"
                                            ) {
                                              setUndebutedCyclistsSortDirection(
                                                (d) =>
                                                  d === "asc" ? "desc" : "asc",
                                              );
                                            } else {
                                              setUndebutedCyclistsSortColumn(
                                                "ronda",
                                              );
                                              setUndebutedCyclistsSortDirection(
                                                "asc",
                                              );
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            Ronda{" "}
                                            {undebutedCyclistsSortColumn ===
                                              "ronda" &&
                                              (undebutedCyclistsSortDirection ===
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
                                        const undebuted = files.elecciones.data
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

                                            // Get metadata
                                            const meta = cyclistMetadata[
                                              ciclista
                                            ] || {
                                              carrerasDisputadas: 0,
                                              diasCompeticion: 0,
                                            };

                                            if (meta.diasCompeticion > 0)
                                              return null;

                                            return {
                                              ciclista,
                                              jugador,
                                              nombreEquipo,
                                              orden,
                                              ronda,
                                            };
                                          })
                                          .filter(Boolean) as any[];

                                        // Filter by team and round
                                        const filtered = undebuted.filter(
                                          (c) => {
                                            const teamMatch =
                                              undebutedCyclistsTeamFilter ===
                                                "all" ||
                                              c.nombreEquipo ===
                                                undebutedCyclistsTeamFilter;
                                            const roundMatch =
                                              undebutedCyclistsRoundFilter.length ===
                                                0 ||
                                              undebutedCyclistsRoundFilter.includes(
                                                c.ronda,
                                              );
                                            return teamMatch && roundMatch;
                                          },
                                        );

                                        // Sort
                                        filtered.sort((a, b) => {
                                          let valA: any, valB: any;
                                          switch (undebutedCyclistsSortColumn) {
                                            case "jugador":
                                              valA = a.nombreEquipo;
                                              valB = b.nombreEquipo;
                                              break;
                                            case "ciclista":
                                              valA = a.ciclista;
                                              valB = b.ciclista;
                                              break;
                                            case "ronda":
                                              valA = parseInt(a.ronda) || 0;
                                              valB = parseInt(b.ronda) || 0;
                                              break;
                                            default:
                                              valA = parseInt(a.ronda) || 0;
                                              valB = parseInt(b.ronda) || 0;
                                              break;
                                          }

                                          if (
                                            typeof valA === "string" &&
                                            typeof valB === "string"
                                          ) {
                                            return undebutedCyclistsSortDirection ===
                                              "asc"
                                              ? valA.localeCompare(valB)
                                              : valB.localeCompare(valA);
                                          }

                                          if (valA < valB)
                                            return undebutedCyclistsSortDirection ===
                                              "asc"
                                              ? -1
                                              : 1;
                                          if (valA > valB)
                                            return undebutedCyclistsSortDirection ===
                                              "asc"
                                              ? 1
                                              : -1;
                                          return 0;
                                        });

                                        if (filtered.length === 0) {
                                          return (
                                            <tr>
                                              <td
                                                colSpan={3}
                                                className="px-6 py-10 text-center text-neutral-400 italic text-[11px]"
                                              >
                                                No hay ciclistas sin debutar que
                                                coincidan con los filtros.
                                              </td>
                                            </tr>
                                          );
                                        }

                                        return filtered.map((c, idx) => {
                                          let isHiddenVisual = false;
                                          if (isUndebutedCopying) {
                                            if (isUndebutedCopying === "full")
                                              isHiddenVisual = false;
                                            else {
                                              const pageNum = parseInt(
                                                (isUndebutedCopying as string).substring(1),
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
                                            isUndebutedCopying
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


function UndebutedCyclistRow({ s, isHiddenVisual, getFlagEmoji }: any) {
  const [expanded, setExpanded] = React.useState(false);
  const { ciclista, equipo, pais, draftInfo, rank } = s;

  if (isHiddenVisual) return null;

  return (
    <>
      <motion.tr layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className={cn("hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] divide-x divide-neutral-100 flex flex-col md:table-row cursor-pointer md:cursor-auto", expanded ? "bg-neutral-50" : "")} onClick={() => window.innerWidth < 768 && setExpanded(!expanded)}>
        <td className="px-4 py-3 md:px-4 md:py-1 flex md:table-cell justify-between items-center w-full md:w-auto md:text-center text-neutral-400 font-medium whitespace-nowrap">
          <div className="flex items-center gap-2 md:contents">
            <span className="w-5 h-5 md:mx-auto rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 bg-neutral-100 text-neutral-500">
              {rank}
            </span>
            <span className="font-bold text-neutral-900 md:hidden">{ciclista}</span>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <ChevronRight className={cn("w-4 h-4 text-neutral-400 transition-transform", expanded && "rotate-90")} />
          </div>
        </td>
        <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap hidden md:table-cell">
          {ciclista}
        </td>
        <td className={cn("px-4 py-2 md:py-1 text-neutral-600 whitespace-nowrap md:table-cell", expanded ? "block" : "hidden")}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Equipo</span>
            {equipo === "No draft" ? <span className="text-neutral-400 italic text-[10px]">No elegido</span> : <span className="font-medium">{equipo}</span>}
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 text-base md:text-center md:table-cell border-b border-neutral-100 md:border-b-0", expanded ? "block" : "hidden")}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">País</span>
            <span>{getFlagEmoji(pais)}</span>
          </div>
        </td>
        <td className={cn("px-4 py-2 md:py-1 whitespace-nowrap md:table-cell hidden md:table-cell", expanded ? "block" : "hidden")}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Draft</span>
            {draftInfo ? <span className="text-neutral-600"><span className="font-medium whitespace-nowrap">{draftInfo.equipo}</span> <span className="text-neutral-400 font-normal text-[9px] ml-1">&lt;R{draftInfo.ronda} - #{draftInfo.orden}&gt;</span></span> : <span className="text-neutral-400 italic text-[10px]">No elegido</span>}
          </div>
        </td>
      </motion.tr>
      {expanded && <tr className="md:hidden"><td colSpan={5} className="h-2 bg-neutral-100/50"></td></tr>}
    </>
  );
}
