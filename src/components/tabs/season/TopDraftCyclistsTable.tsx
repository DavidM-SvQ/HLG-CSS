import { ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Trophy, Calendar, Medal, Crown, TrendingUp, BarChart3, Users, LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../ui/button";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { cn } from "../../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

import { useDataStore } from "../../../lib/stores/useDataStore";

import { getCyclistAvatar } from "../../../lib/utils/teamColors";

export function TopDraftCyclistsTable(props: any) {
  const {
    isTopCyclistsDraftExpanded, topCyclistsDraftRefContainer,
    cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection,
    sortedStats, topCyclistsLimit, maxVictorias, maxCarreras, minCarreras, maxDias, minDias,
    maxPpc, minPpc, maxPpd, minPpd, getFlagEmoji, getColorClass, getPuntosColor, formatNumberSpanish,
    isTopCyclistsDraftCopying, tableDensity = "compact"
  } = props;

  const [isMobile, setIsMobile] = useState(false);
  const { files } = useDataStore();
  const configuracionData = files.configuracion?.data || [];
  
  const getValue = (key: string, defaultValue: any) => {
    const item = configuracionData.find((item: any) => item.key === key);
    if (item === undefined) return defaultValue;
    if (item.value === "true") return true;
    if (item.value === "false") return false;
    return item.value;
  };
  const animationsEnabled = getValue("animations_enabled", true);
  const fantasyCardsEnabled = getValue("fantasy_cards_enabled", true);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isCompact = tableDensity === "compact" || !!isTopCyclistsDraftCopying;

  return (
    <>
      <div className={cn("overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin px-2 md:px-0", isTopCyclistsDraftExpanded ? "flex-1 min-h-0" : "max-h-[750px]")}>
        <div ref={topCyclistsDraftRefContainer} className={cn("table-responsive-wrapper min-h-[300px] overflow-auto w-full", isTopCyclistsDraftExpanded ? "h-full" : "max-h-[600px]")}>
          <table className="w-full block md:table">
            <thead className={cn("font-bold uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-200 hidden md:table-header-group text-neutral-800", isCompact ? "text-[9.5px]" : "text-[10px]")}>
              <tr className="divide-x divide-neutral-100">
                <th
                  className={cn("sticky top-0 z-30 bg-neutral-50 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 text-center", isCompact ? "px-2 py-1.5" : "px-3 py-2")}
                  onClick={() => {
                    if (cyclistsSortColumn === "pos") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("pos");
                      setCyclistsSortDirection("asc");
                    }
                  }}
                  title="Posición general"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    Pos{" "}
                    {cyclistsSortColumn === "pos" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
                <th
                  className={cn("sticky top-0 z-30 bg-neutral-50 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200", isCompact ? "px-2.5 py-1.5" : "px-4 py-2")}
                  onClick={() => {
                    if (cyclistsSortColumn === "nombre") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("nombre");
                      setCyclistsSortDirection("asc");
                    }
                  }}
                  title="Nombre del ciclista"
                >
                  <div className="flex items-center gap-1">
                    Ciclista{" "}
                    {cyclistsSortColumn === "nombre" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
                <th
                  className={cn("sticky top-0 z-30 bg-neutral-50 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell text-center", isCompact ? "px-2 py-1.5" : "px-3 py-2")}
                  onClick={() => {
                    if (cyclistsSortColumn === "ronda") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("ronda");
                      setCyclistsSortDirection("asc");
                    }
                  }}
                  title="Ronda del Draft en la que fue elegido (pincha para ordenar)"
                >
                  <div className="flex items-center justify-center gap-1">
                    Ronda{" "}
                    {cyclistsSortColumn === "ronda" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
                <th
                  className={cn("sticky top-0 z-30 bg-neutral-50 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell text-center", isCompact ? "px-2 py-1.5" : "px-3 py-2")}
                  onClick={() => {
                    if (cyclistsSortColumn === "posRonda") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("posRonda");
                      setCyclistsSortDirection("asc");
                    }
                  }}
                  title="Posición que ocupa el ciclista dentro de su ronda de draft según los puntos (pincha para ordenar)"
                >
                  <div className="flex items-center justify-center gap-1">
                    Pos Ronda{" "}
                    {cyclistsSortColumn === "posRonda" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
                <th
                  className={cn("sticky top-0 z-30 bg-neutral-50 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell", isCompact ? "px-2 py-1.5" : "px-3.5 py-2")}
                  onClick={() => {
                    if (cyclistsSortColumn === "equipo") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("equipo");
                      setCyclistsSortDirection("asc");
                    }
                  }}
                  title="Equipo Fantasy"
                >
                  <div className="flex items-center gap-1">
                    Equipo{" "}
                    {cyclistsSortColumn === "equipo" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
                <th
                  className={cn("font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell text-center", isCompact ? "px-1.5 py-1.5" : "px-3 py-2")}
                  onClick={() => {
                    if (cyclistsSortColumn === "pais") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("pais");
                      setCyclistsSortDirection("asc");
                    }
                  }}
                  title="País"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    País{" "}
                    {cyclistsSortColumn === "pais" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
                <th
                  className={cn("font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell text-center", isCompact ? "px-1.5 py-1.5" : "px-3 py-2")}
                  onClick={() => {
                    if (cyclistsSortColumn === "victorias") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("victorias");
                      setCyclistsSortDirection("desc");
                    }
                  }}
                  title="Victorias en la temporada"
                >
                  <div className="flex items-center justify-center gap-1">
                    Victorias{" "}
                    {cyclistsSortColumn === "victorias" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
                <th
                  className={cn("font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell text-center", isCompact ? "px-1.5 py-1.5" : "px-3 py-2")}
                  onClick={() => {
                    if (cyclistsSortColumn === "carreras") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("carreras");
                      setCyclistsSortDirection("desc");
                    }
                  }}
                  title="Carreras disputadas"
                >
                  <div className="flex items-center justify-center gap-1">
                    Carreras{" "}
                    {cyclistsSortColumn === "carreras" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
                <th
                  className={cn("font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell text-center", isCompact ? "px-1.5 py-1.5" : "px-3 py-2")}
                  title="Días de competición"
                  onClick={() => {
                    if (cyclistsSortColumn === "dias") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("dias");
                      setCyclistsSortDirection("desc");
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-1">
                    Días{" "}
                    {cyclistsSortColumn === "dias" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
                <th
                  className={cn("font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell text-center", isCompact ? "px-1.5 py-1.5" : "px-3 py-2")}
                  title="Puntos por carrera disputada"
                  onClick={() => {
                    if (cyclistsSortColumn === "ppc") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("ppc");
                      setCyclistsSortDirection("desc");
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-1">
                    P/C{" "}
                    {cyclistsSortColumn === "ppc" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
                <th
                  className={cn("font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell text-center", isCompact ? "px-1.5 py-1.5" : "px-3 py-2")}
                  title="Puntos por día de competición"
                  onClick={() => {
                    if (cyclistsSortColumn === "ppd") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("ppd");
                      setCyclistsSortDirection("desc");
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-1">
                    P/D{" "}
                    {cyclistsSortColumn === "ppd" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
                <th
                  className={cn("sticky top-0 z-30 bg-neutral-50 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 text-right", isCompact ? "px-2.5 py-1.5" : "px-4 py-2")}
                  onClick={() => {
                    if (cyclistsSortColumn === "puntos") {
                      setCyclistsSortDirection((d: string) => d === "asc" ? "desc" : "asc");
                    } else {
                      setCyclistsSortColumn("puntos");
                      setCyclistsSortDirection("desc");
                    }
                  }}
                  title="Puntos totales conseguidos"
                >
                  <div className="flex items-center justify-end gap-1">
                    Puntos{" "}
                    {cyclistsSortColumn === "puntos" && (cyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                  </div>
                </th>
              </tr>
            </thead>
            {isTopCyclistsDraftCopying ? (
              <tbody className="divide-y divide-neutral-100 block md:table-row-group bg-white">
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
                      isCopying={true}
                      tableDensity={tableDensity}
                      animationsEnabled={animationsEnabled}
                      fantasyCardsEnabled={fantasyCardsEnabled}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            ) : (
              <VirtualizedTableBody
                items={sortedStats}
                scrollElementRef={topCyclistsDraftRefContainer}
                colSpan={12}
                estimateSize={isMobile ? 54 : (isCompact ? 36 : 46)}
                className="divide-y md:divide-y md:divide-neutral-100 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group pt-1 md:pt-0 pb-4 bg-white"
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
                      tableDensity={tableDensity}
                      animationsEnabled={animationsEnabled}
                      fantasyCardsEnabled={fantasyCardsEnabled}
                    />
                  );
                }}
              />
            )}
          </table>
        </div>
      </div>
    </>
  );
}

function TopCyclistRow({ s, isHiddenVisual, maxVictorias, maxCarreras, minCarreras, maxDias, minDias, maxPpc, minPpc, maxPpd, minPpd, getFlagEmoji, getColorClass, getPuntosColor, formatNumberSpanish, isCopying, tableDensity, animationsEnabled, fantasyCardsEnabled }: any) {
  const [expanded, setExpanded] = React.useState(false);
  const { ciclista, nombreEquipo, ronda, posRonda, orden, pais, victorias, dias, puntos, numCarreras, ppc, ppd, originalIndex } = s;

  if (isHiddenVisual) return null;

  const isCompact = tableDensity === "compact" || isCopying;

  const RowComponent = animationsEnabled && !isCopying ? motion.tr : "tr";
  const rowProps = (animationsEnabled && !isCopying) ? {
    layout: true,
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15 }
  } : {};

  return (
    <>
      <RowComponent
        {...rowProps as any}
        className={cn(
          "hover:bg-neutral-50/80 transition-colors top-cyclists-row md:divide-x divide-neutral-100 flex flex-col md:table-row cursor-pointer md:cursor-auto bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-2 md:mb-0 shadow-xs md:shadow-none",
          isCompact ? "text-[11px]" : "text-xs",
          expanded ? "bg-neutral-50" : ""
        )}
        onClick={() => window.innerWidth < 768 && setExpanded(!expanded)}
      >
        {/* Posición General */}
        <td className={cn(
          "flex md:table-cell justify-between items-center md:text-center w-full md:w-auto hover:bg-neutral-50 md:hover:bg-transparent rounded-t-xl transition-colors",
          isCompact ? "px-2 py-1 md:px-2 md:py-1" : "px-4 py-2.5 md:px-3 md:py-2"
        )}>
          <div className="flex items-center gap-3 md:contents">
            <span className={cn(
              "rounded-full flex items-center justify-center font-black shrink-0 shadow-2xs border md:mx-auto",
              isCompact ? "w-5 h-5 text-[9.5px]" : "w-6 h-6 text-[10px]",
              originalIndex === 1
                ? "bg-gradient-to-br from-amber-100 to-yellow-200 text-yellow-800 border-yellow-300/50"
                : originalIndex === 2
                ? "bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-700 border-neutral-300/50"
                : originalIndex === 3
                ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800 border-orange-300/50"
                : "bg-neutral-50 text-neutral-500 border-neutral-200"
            )}>
              {originalIndex}
            </span>
            <span className="font-bold md:hidden text-sm truncate max-w-[200px] text-neutral-900">{ciclista}</span>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <span className="font-black font-mono tabular-nums text-sm" style={{ color: getPuntosColor(puntos) }}>{formatNumberSpanish(puntos)}</span>
            <ChevronRight className={cn("w-4 h-4 text-neutral-400 transition-transform", expanded && "rotate-90")} />
          </div>
        </td>

        {/* Ciclista */}
        <td className={cn(
          "font-bold whitespace-nowrap hidden md:table-cell text-neutral-900",
          isCompact ? "px-2 py-1 max-w-[210px]" : "px-3.5 py-2 max-w-[250px]"
        )}>
          {isCopying ? (
            <div className="flex items-center gap-1.5 w-fit text-left text-neutral-900">
              {fantasyCardsEnabled && (
                <img src={getCyclistAvatar(ciclista)} alt={ciclista} className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-200 shrink-0 object-cover" />
              )}
              <span className="truncate">{ciclista}</span>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-2 cursor-help hover:text-blue-600 transition-colors w-fit text-left">
                {fantasyCardsEnabled && (
                  <img src={getCyclistAvatar(ciclista)} alt={ciclista} className={cn("rounded-full bg-neutral-100 border border-neutral-200 shrink-0 object-cover", isCompact ? "w-6 h-6" : "w-7 h-7")} loading="lazy" />
                )}
                <div className="flex flex-col text-left">
                  <span className="truncate">{ciclista}</span>
                </div>
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

                 {ronda && (
                   <div className="flex items-center justify-between text-xs bg-blue-50/70 text-blue-800 py-1 px-2 rounded-md border border-blue-100">
                     <span>Ronda: <strong>R{parseInt(ronda, 10) || ronda}</strong></span>
                     {posRonda ? <span>Pos ronda: <strong>#{posRonda}</strong></span> : null}
                   </div>
                 )}
                 
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

        {/* Columna Ronda */}
        <td className={cn(
          "whitespace-nowrap md:table-cell text-center hidden md:table-cell",
          isCompact ? "px-1.5 py-1" : "px-3 py-2",
          expanded ? "block" : "hidden"
        )}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ronda</span>
            {ronda ? (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-blue-50/80 text-blue-700 border border-blue-200/80 text-[10px] font-mono font-bold shadow-2xs">
                R{parseInt(ronda, 10) || ronda}
              </span>
            ) : (
              <span className="text-neutral-400 font-mono text-[10px]">-</span>
            )}
          </div>
        </td>

        {/* Columna Pos Ronda */}
        <td className={cn(
          "whitespace-nowrap md:table-cell text-center hidden md:table-cell",
          isCompact ? "px-1.5 py-1" : "px-3 py-2",
          expanded ? "block" : "hidden"
        )}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Pos Ronda</span>
            {posRonda ? (
              <span className={cn(
                "inline-flex items-center justify-center px-1.5 py-0.5 rounded font-mono font-black text-[10px] border shadow-2xs",
                posRonda === 1
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : posRonda === 2
                  ? "bg-neutral-200 text-neutral-800 border-neutral-300"
                  : posRonda === 3
                  ? "bg-orange-100 text-orange-900 border-orange-300"
                  : "bg-neutral-50 text-neutral-600 border-neutral-200"
              )}>
                #{posRonda}
              </span>
            ) : (
              <span className="text-neutral-400 font-mono text-[10px]">-</span>
            )}
          </div>
        </td>

        {/* Equipo */}
        <td className={cn(
          "whitespace-nowrap md:table-cell bg-neutral-50/50 md:bg-transparent border-t border-neutral-100 md:border-t-0 text-neutral-600",
          isCompact ? "px-2 py-1 max-w-[140px] truncate" : "px-3.5 py-2",
          expanded ? "block" : "hidden"
        )}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Equipo</span>
            {nombreEquipo === "No draft" ? (
              <span className="text-neutral-500 italic text-[10px]">No elegido</span>
            ) : (
              <span className="font-semibold text-neutral-900 truncate block">
                {nombreEquipo} {orden && <span className="text-neutral-400 font-normal text-[9px]">[#{orden}]</span>}
              </span>
            )}
          </div>
        </td>

        {/* País */}
        <td className={cn(
          "md:text-center md:table-cell",
          isCompact ? "px-1 py-1 text-sm" : "px-3 py-1.5 text-base",
          expanded ? "block" : "hidden"
        )}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider">País</span>
            <span>{getFlagEmoji(pais)}</span>
          </div>
        </td>

        {/* Victorias */}
        <td className={cn(
          "md:text-center font-mono tabular-nums md:table-cell",
          isCompact ? "px-1.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
          expanded ? "block" : "hidden",
          getColorClass(victorias, maxVictorias, 0, true)
        )}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">Victorias</span>
            <span className="font-mono tabular-nums tracking-tight">{formatNumberSpanish(victorias)}</span>
          </div>
        </td>

        {/* Carreras */}
        <td className={cn(
          "md:text-center font-mono tabular-nums md:table-cell",
          isCompact ? "px-1.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
          expanded ? "block" : "hidden",
          getColorClass(numCarreras, maxCarreras, minCarreras)
        )}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">Carreras</span>
            <span className="font-mono tabular-nums tracking-tight">{formatNumberSpanish(numCarreras)}</span>
          </div>
        </td>

        {/* Días */}
        <td className={cn(
          "md:text-center font-mono tabular-nums md:table-cell",
          isCompact ? "px-1.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
          expanded ? "block" : "hidden",
          getColorClass(dias, maxDias, minDias)
        )}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">Días</span>
            <span className="font-mono tabular-nums tracking-tight">{formatNumberSpanish(dias)}</span>
          </div>
        </td>

        {/* P/C */}
        <td className={cn(
          "md:text-center font-mono tabular-nums md:table-cell",
          isCompact ? "px-1.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
          expanded ? "block" : "hidden",
          getColorClass(ppc, maxPpc, minPpc)
        )}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">P/C</span>
            <span>{formatNumberSpanish(ppc.toFixed(1))}</span>
          </div>
        </td>

        {/* P/D */}
        <td className={cn(
          "md:text-center font-mono tabular-nums md:table-cell md:border-b-0",
          isCompact ? "px-1.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
          expanded ? "block" : "hidden",
          getColorClass(ppd, maxPpd, minPpd)
        )}>
          <div className="flex justify-between items-center md:contents">
            <span className="text-xs font-semibold text-neutral-400 uppercase md:hidden tracking-wider font-sans">P/D</span>
            <span>{formatNumberSpanish(ppd.toFixed(1))}</span>
          </div>
        </td>

        {/* Puntos */}
        <td className={cn(
          "text-right font-black font-mono tabular-nums hidden md:table-cell",
          isCompact ? "px-2.5 py-1 text-xs md:text-sm" : "px-4 py-1.5 text-sm"
        )} style={{ color: getPuntosColor(puntos) }}>
          <span className="font-mono tabular-nums tracking-tight">{formatNumberSpanish(puntos)}</span>
        </td>

        {/* Fila extra para móviles cuando se expande */}
        {expanded && (
          <div className="md:hidden p-3 bg-neutral-50/80 border-t border-neutral-100 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Ronda / Posición en Ronda:</span>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                  {ronda ? `Ronda ${parseInt(ronda, 10) || ronda}` : "Sin ronda"}
                </span>
                {posRonda ? (
                  <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-300 text-[11px] font-mono font-bold">
                    #{posRonda} de su ronda
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </RowComponent>
    </>
  );
}
