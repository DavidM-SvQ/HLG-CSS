import { ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Trophy, Calendar, Medal, Crown, TrendingUp, BarChart3, Users, LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../ui/button";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { cn } from "../../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

export function TopDraftCyclistsTable(props: any) {
  const {
    isTopCyclistsDraftExpanded, topCyclistsDraftRefContainer,
    cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection,
    sortedStats, topCyclistsLimit, maxVictorias, maxCarreras, minCarreras, maxDias, minDias,
    maxPpc, minPpc, maxPpd, minPpd, getFlagEmoji, getColorClass, getPuntosColor, formatNumberSpanish
  , isTopCyclistsDraftCopying } = props;

  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
                                <div className={cn("overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin px-2 md:px-0", isTopCyclistsDraftExpanded ? "flex-1 min-h-0" : "max-h-[750px]")}>
                                  <div ref={topCyclistsDraftRefContainer} className={cn("table-responsive-wrapper min-h-[300px] overflow-auto w-full", isTopCyclistsDraftExpanded ? "h-full" : "max-h-[600px]")}><table className="w-full block md:table">
                                    <thead className={cn("text-[10px] font-bold uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100 hidden md:table-header-group text-neutral-800")}>
                                      <tr className="divide-x divide-neutral-100">
                                        <th
                                          className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                                          onClick={() => {
                                            if (cyclistsSortColumn === "pos") {
                                              setCyclistsSortDirection((d: string) =>
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
                                              setCyclistsSortDirection((d: string) =>
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
                                              setCyclistsSortDirection((d: string) =>
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
                                        <th className="px-4 py-3 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" onClick={() => { if (cyclistsSortColumn === "pais") {
                                              setCyclistsSortDirection((d: string) =>
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
                                        <th className="px-4 py-3 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" onClick={() => { if (cyclistsSortColumn === "victorias"
                                            ) {
                                              setCyclistsSortDirection((d: string) =>
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
                                        <th className="px-4 py-3 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" onClick={() => { if (cyclistsSortColumn === "carreras"
                                            ) {
                                              setCyclistsSortDirection((d: string) =>
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
                                        <th className="px-4 py-3 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" title="Días de competición" onClick={() => { if (cyclistsSortColumn === "dias") {
                                              setCyclistsSortDirection((d: string) =>
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
                                        <th className="px-4 py-3 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" title="Puntos por carreras" onClick={() => { if (cyclistsSortColumn === "ppc") {
                                              setCyclistsSortDirection((d: string) =>
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
                                        <th className="px-4 py-3 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" title="Puntos por día de competición" onClick={() => { if (cyclistsSortColumn === "ppd") {
                                              setCyclistsSortDirection((d: string) =>
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
                                              setCyclistsSortDirection((d: string) =>
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
                                      <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group">
                                        <AnimatePresence>
                                          {(isTopCyclistsDraftCopying === "full" ? sortedStats : typeof isTopCyclistsDraftCopying === 'string' && isTopCyclistsDraftCopying.startsWith('p') ? sortedStats.slice((parseInt(isTopCyclistsDraftCopying.substring(1)) - 1) * 50, parseInt(isTopCyclistsDraftCopying.substring(1)) * 50) : sortedStats).map((s: any) => (
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
                                              isCopying={!!isTopCyclistsDraftCopying}
                                            />
                                          ))}
                                        </AnimatePresence>
                                      </tbody>
                                    ) : (
                                      <VirtualizedTableBody
                                        items={sortedStats}
                                        scrollElementRef={topCyclistsDraftRefContainer}
                                        colSpan={10}
                                        estimateSize={isMobile ? 54 : 33}
                                        className="divide-y md:divide-y md:divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group pt-2 md:pt-0 pb-4"
                                        renderRow={(s, idx) => {
                                          return (
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
                                              isCopying={false}
                                            />
                                          );
                                        }}
                                      />
                                    )}
                                  </table></div>
                                </div>
    </>
  );
}

function TopCyclistRow({ s, isHiddenVisual, maxVictorias, maxCarreras, minCarreras, maxDias, minDias, maxPpc, minPpc, maxPpd, minPpd, getFlagEmoji, getColorClass, getPuntosColor, formatNumberSpanish, isCopying }: any) {
  const [expanded, setExpanded] = React.useState(false);
  const { ciclista, nombreEquipo, ronda, orden, pais, victorias, dias, puntos, numCarreras, ppc, ppd, originalIndex } = s;

  if (isHiddenVisual) return null;

  return (
    <>
      <motion.tr layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className={cn("hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] md:divide-x divide-neutral-100 flex flex-col md:table-row cursor-pointer md:cursor-auto bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none hover:border-blue-200 md:hover:border-transparent", expanded ? "bg-neutral-50" : "")} onClick={() => window.innerWidth < 768 && setExpanded(!expanded)}>
        <td className="px-4 py-3 md:px-3 md:py-1 flex md:table-cell justify-between items-center md:text-center w-full md:w-auto hover:bg-neutral-50 md:hover:bg-transparent rounded-t-xl transition-colors">
          <div className="flex items-center gap-3 md:contents">
            <span className={cn("w-7 h-7 md:w-6 md:h-6 md:mx-auto rounded-full flex items-center justify-center text-[11px] md:text-[10px] font-black shrink-0 shadow-sm border", originalIndex === 1 ? "bg-gradient-to-br from-amber-100 to-yellow-200 text-yellow-800 border-yellow-300/50" : originalIndex === 2 ? "bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-700 border-neutral-300/50" : originalIndex === 3 ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800 border-orange-300/50" : "bg-neutral-50 text-neutral-500 border-neutral-200")}>
              {originalIndex}
            </span>
            <span className={cn("font-bold md:hidden text-sm truncate max-w-[200px] text-neutral-900")}>{ciclista}</span>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <span className="font-black font-mono tabular-nums text-sm" style={{ color: getPuntosColor(puntos) }}>{formatNumberSpanish(puntos)}</span>
            <ChevronRight className={cn("w-4 h-4 text-neutral-400 transition-transform", expanded && "rotate-90")} />
          </div>
        </td>
        <td className={cn("px-4 py-1 font-bold whitespace-nowrap hidden md:table-cell w-[250px] text-neutral-900")}>
          {isCopying ? (
            <div className="flex items-center gap-1.5 w-fit text-left text-neutral-900">
              {ciclista} <span className="text-neutral-500 font-normal text-[9px]">&lt;{ronda || "-"}&gt;</span>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1.5 cursor-help hover:text-blue-600 transition-colors w-fit text-left">
                {ciclista} <span className="text-neutral-400 font-normal text-[9px]">&lt;{ronda || "-"}&gt;</span>
              </TooltipTrigger>
              <TooltipContent className="bg-white border text-sm border-neutral-200 shadow-xl p-4 rounded-xl text-neutral-900 shadow-neutral-900/10 max-w-[240px]" side="right" sideOffset={10}>
               <div className="flex flex-col gap-2 relative z-10">
                 <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-100/50 rounded-full blur-[20px] pointer-events-none" />
                 <div className="flex items-start justify-between">
                   <p className="font-black text-base">{ciclista}</p>
                   <span className="text-xl leading-none">{getFlagEmoji(pais)}</span>
                 </div>
                 
                 <div className="flex items-center gap-2 text-xs">
                   <Users className="w-3.5 h-3.5 text-indigo-400" />
                   <span className="font-medium text-neutral-600">{nombreEquipo} {orden ? `(#${orden})` : ''}</span>
                 </div>
                 
                 <div className="flex items-center gap-2 text-xs mt-1 bg-yellow-50 text-yellow-700 py-1.5 px-2 rounded-lg border border-yellow-100/50">
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="font-bold">{formatNumberSpanish(puntos)} puntos</span>
                 </div>

                 <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-neutral-100">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block mb-0.5">Victorias</span>
                      <span className="font-mono">{victorias}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block mb-0.5">Carreras</span>
                      <span className="font-mono">{numCarreras} / {dias}d</span>
                    </div>
                 </div>
               </div>
            </TooltipContent>
          </Tooltip>
          )}
        </td>
        <td className={cn("px-4 py-2 md:py-1 whitespace-nowrap md:table-cell bg-neutral-50/50 md:bg-transparent border-t border-neutral-100 md:border-t-0 text-neutral-600", expanded ? "block" : "hidden")}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Equipo</span>
            {nombreEquipo === "No draft" ? <span className="text-neutral-500 italic text-[10px]">No elegido</span> : <span className={cn("font-semibold text-blue-700 md:text-neutral-900")}>{nombreEquipo} {orden && <span className="text-neutral-500 font-normal text-[9px]">[<span className="font-mono tabular-nums opacity-80">#{orden}</span>]</span>}</span>}
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 text-base md:text-center md:table-cell", expanded ? "block" : "hidden")}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">País</span>
            <span>{getFlagEmoji(pais)}</span>
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 md:text-center font-mono tabular-nums md:table-cell", expanded ? "block" : "hidden", getColorClass(victorias, maxVictorias, 0, true))}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">Victorias</span>
            <span className="font-mono tabular-nums tracking-tight">{formatNumberSpanish(victorias)}</span>
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 md:text-center font-mono tabular-nums md:table-cell", expanded ? "block" : "hidden", getColorClass(numCarreras, maxCarreras, minCarreras))}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">Carreras</span>
            <span className="font-mono tabular-nums tracking-tight">{formatNumberSpanish(numCarreras)}</span>
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 md:text-center font-mono tabular-nums md:table-cell", expanded ? "block" : "hidden", getColorClass(dias, maxDias, minDias))}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">Días</span>
            <span className="font-mono tabular-nums tracking-tight">{formatNumberSpanish(dias)}</span>
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 md:text-center font-mono tabular-nums md:table-cell", expanded ? "block" : "hidden", getColorClass(ppc, maxPpc, minPpc))}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">P/C</span>
            <span>{formatNumberSpanish(ppc.toFixed(1))}</span>
          </div>
        </td>
        <td className={cn("px-4 py-2 md:px-3 md:py-1 md:text-center font-mono tabular-nums md:table-cell md:border-b-0", expanded ? "block" : "hidden", getColorClass(ppd, maxPpd, minPpd))}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">P/D</span>
            <span>{formatNumberSpanish(ppd.toFixed(1))}</span>
          </div>
        </td>
        <td className="px-4 py-1 text-right font-black font-mono tabular-nums text-sm hidden md:table-cell" style={{ color: getPuntosColor(puntos) }}>
          <span className="font-mono tabular-nums tracking-tight">{formatNumberSpanish(puntos)}</span>
        </td>
      </motion.tr>
    </>
  );
}
