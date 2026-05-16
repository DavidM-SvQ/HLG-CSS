import { ChevronRight } from "lucide-react";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Trophy, Calendar, Medal, Crown, TrendingUp, BarChart3, Users, LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../ui/button";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { cn } from "../../../lib/utils";

export function TopDraftCyclistsTable(props: any) {
  const {
    isTopCyclistsDraftExpanded, topCyclistsDraftRefContainer,
    cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection,
    sortedStats, topCyclistsLimit, maxVictorias, maxCarreras, minCarreras, maxDias, minDias,
    maxPpc, minPpc, maxPpd, minPpd, getFlagEmoji, getColorClass, getPuntosColor, formatNumberSpanish
  , isTopCyclistsDraftCopying } = props;

  return (
    <>
                                <div className={cn("overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin", isTopCyclistsDraftExpanded ? "flex-1 min-h-0" : "max-h-[750px]")}>
                                  <div ref={topCyclistsDraftRefContainer} className={cn("table-responsive-wrapper overflow-auto w-full", isTopCyclistsDraftExpanded ? "h-full" : "max-h-[600px]")}><table className="w-full min-w-full md:min-w-[700px]">
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
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" onClick={() => { if (cyclistsSortColumn === "equipo"
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
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" onClick={() => { if (cyclistsSortColumn === "pais") {
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
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" onClick={() => { if (cyclistsSortColumn === "victorias"
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
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" onClick={() => { if (cyclistsSortColumn === "carreras"
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
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" title="Días de competición" onClick={() => { if (cyclistsSortColumn === "dias") {
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
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" title="Puntos por carreras" onClick={() => { if (cyclistsSortColumn === "ppc") {
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
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" title="Puntos por día de competición" onClick={() => { if (cyclistsSortColumn === "ppd") {
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
                                    {isTopCyclistsDraftCopying ? (
                                      <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                                        <AnimatePresence>
                                          {sortedStats.slice(0, 50).map((s: any) => (
                                            <TopCyclistRow
                                              key={s.ciclista}
                                              s={s}
                                              maxVictorias={maxVictorias}
                                              maxCarreras={maxCarreras}
                                              minCarreras={minCarreras}
                                              maxDias={maxDias}
                                              minDias={minDias}
                                              maxPpc={maxPpc}
                                              minPpc={minPpc}
                                              maxPpd={maxPpd}
                                              minPpd={minPpd}
                                              getFlagEmoji={getFlagEmoji}
                                              getColorClass={getColorClass}
                                              getPuntosColor={getPuntosColor}
                                              formatNumberSpanish={formatNumberSpanish}
                                            />
                                          ))}
                                        </AnimatePresence>
                                      </tbody>
                                    ) : (
                                      <VirtualizedTableBody
                                        items={sortedStats}
                                        scrollElementRef={topCyclistsDraftRefContainer}
                                        colSpan={10}
                                        className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50"
                                        renderRow={(s, idx) => {
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
                                          return (
                                            <tr
                                              key={ciclista}
                                              className="hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] divide-x divide-neutral-100"
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
                                              <td className="px-4 py-1 text-neutral-600 whitespace-nowrap hidden md:table-cell">
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
                                              <td className="px-3 py-1 text-base text-center hidden md:table-cell">{getFlagEmoji(pais)}</td>
                                              <td className={cn("px-3 py-1 text-center font-mono hidden md:table-cell",
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
                                              <td className={cn("px-3 py-1 text-center font-mono hidden md:table-cell",
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
                                              <td className={cn("px-3 py-1 text-center font-mono hidden md:table-cell",
                                                  getColorClass(
                                                    dias,
                                                    maxDias,
                                                    minDias,
                                                  ),
                                                )}
                                              >
                                                <span className="font-mono tracking-tight">{formatNumberSpanish(dias)}</span>
                                              </td>
                                              <td className={cn("px-3 py-1 text-center font-mono hidden md:table-cell",
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
                                              <td className={cn("px-3 py-1 text-center font-mono hidden md:table-cell",
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
                                        }}
                                      />
                                    )}
                                  </table></div>
                                </div>
    </>
  );
}

function TopCyclistRow({ s, isHiddenVisual, maxVictorias, maxCarreras, minCarreras, maxDias, minDias, maxPpc, minPpc, maxPpd, minPpd, getFlagEmoji, getColorClass, getPuntosColor, formatNumberSpanish }: any) {
  const [expanded, setExpanded] = React.useState(false);
  const { ciclista, nombreEquipo, ronda, orden, pais, victorias, dias, puntos, numCarreras, ppc, ppd, originalIndex } = s;

  if (isHiddenVisual) return null;

  return (
    <>
      <motion.tr layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className={cn("hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] divide-x divide-neutral-100 flex flex-col md:table-row cursor-pointer md:cursor-auto", expanded ? "bg-neutral-50" : "")} onClick={() => window.innerWidth < 768 && setExpanded(!expanded)}>
        <td className="px-4 py-3 md:px-3 md:py-1 flex md:table-cell justify-between items-center md:text-center w-full md:w-auto">
          <div className="flex items-center gap-2 md:contents">
            <span className={cn("w-5 h-5 md:mx-auto rounded-full flex items-center justify-center text-[9px] font-bold shrink-0", originalIndex === 1 ? "bg-yellow-100 text-yellow-700" : originalIndex === 2 ? "bg-neutral-200 text-neutral-600" : originalIndex === 3 ? "bg-orange-100 text-orange-700" : "bg-neutral-100 text-neutral-500")}>
              {originalIndex}
            </span>
            <span className="font-bold text-neutral-900 md:hidden">{ciclista}</span>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <span className="font-black font-mono text-sm" style={{ color: getPuntosColor(puntos) }}>{formatNumberSpanish(puntos)}</span>
            <ChevronRight className={cn("w-4 h-4 text-neutral-400 transition-transform", expanded && "rotate-90")} />
          </div>
        </td>
        <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap hidden md:table-cell">
          {ciclista} <span className="text-neutral-400 font-normal text-[9px]">&lt;{ronda || "-"}&gt;</span>
        </td>
        <td className={cn("px-4 py-2 md:py-1 text-neutral-600 whitespace-nowrap md:table-cell", expanded ? "block" : "hidden")}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Equipo</span>
            {nombreEquipo === "No draft" ? <span className="text-neutral-400 italic text-[10px]">No elegido</span> : <span className="font-medium">{nombreEquipo} <span className="text-neutral-400 font-normal text-[9px]">[#{orden}]</span></span>}
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 text-base md:text-center md:table-cell", expanded ? "block" : "hidden")}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">País</span>
            <span>{getFlagEmoji(pais)}</span>
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 md:text-center font-mono md:table-cell", expanded ? "block" : "hidden", getColorClass(victorias, maxVictorias, 0, true))}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">Victorias</span>
            <span className="font-mono tracking-tight">{formatNumberSpanish(victorias)}</span>
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 md:text-center font-mono md:table-cell", expanded ? "block" : "hidden", getColorClass(numCarreras, maxCarreras, minCarreras))}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">Carreras</span>
            <span className="font-mono tracking-tight">{formatNumberSpanish(numCarreras)}</span>
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 md:text-center font-mono md:table-cell", expanded ? "block" : "hidden", getColorClass(dias, maxDias, minDias))}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">Días</span>
            <span className="font-mono tracking-tight">{formatNumberSpanish(dias)}</span>
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 md:text-center font-mono md:table-cell", expanded ? "block" : "hidden", getColorClass(ppc, maxPpc, minPpc))}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">P/C</span>
            <span>{formatNumberSpanish(ppc.toFixed(1))}</span>
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 md:text-center font-mono md:table-cell border-b border-neutral-100 md:border-b-0", expanded ? "block" : "hidden", getColorClass(ppd, maxPpd, minPpd))}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">P/D</span>
            <span>{formatNumberSpanish(ppd.toFixed(1))}</span>
          </div>
        </td>
        <td className="px-4 py-1 text-right font-black font-mono text-sm hidden md:table-cell" style={{ color: getPuntosColor(puntos) }}>
          <span className="font-mono tracking-tight">{formatNumberSpanish(puntos)}</span>
        </td>
      </motion.tr>
      {expanded && <tr className="md:hidden"><td colSpan={10} className="h-2 bg-neutral-100/50"></td></tr>}
    </>
  );
}
