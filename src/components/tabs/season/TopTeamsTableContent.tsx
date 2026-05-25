import React, { useRef, useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";

export function TopTeamRow({ 
  team, idx, getPuntosColor, formatNumberSpanish, sortedTeams,
  maxWins, minWins,
  maxPartialWins, minPartialWins,
  maxCarreras, minCarreras,
  maxPpc, minPpc,
  maxDays, minDays,
  maxPpd, minPpd,
  hideDifColumn,
  hidePointsDiff,
  showDraftPos
}: any) {
  const diff = team.diff;
  
  const prevTeam = idx > 0 ? sortedTeams[idx - 1] : null;
  const pointsDiff = prevTeam ? prevTeam.puntos - team.puntos : 0;
  const isClose = pointsDiff > 0 && pointsDiff < 50;

  const getStatColor = (val: number, max: number, min: number, isReverse: boolean = false) => {
    if (max === min) return "text-neutral-500";
    if (val === max) return isReverse ? "text-red-800 font-bold md:bg-red-100" : "text-green-800 font-bold md:bg-green-100";
    if (val === min && val > 0) return isReverse ? "text-green-800 font-bold md:bg-green-100" : "text-red-800 font-bold md:bg-red-100";
    if (val === min && val === 0) return "text-red-800 font-bold md:bg-red-100"; // Red if zero
    return "text-neutral-500";
  };

  return (
    <>
      <td className="px-4 py-3 text-center whitespace-nowrap bg-neutral-50/50">
        <div className="flex items-center justify-center">
          <span className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border border-neutral-100",
            idx === 0 ? "bg-yellow-400 text-white border-yellow-500" : 
            idx === 1 ? "bg-neutral-300 text-neutral-700" : 
            idx === 2 ? "bg-orange-300 text-white border-orange-400" : 
            "bg-white text-neutral-500"
          )}>
            {idx + 1}
          </span>
        </div>
      </td>
      <td className="px-4 py-2 font-bold text-neutral-900 group-hover/row:text-blue-700 transition-colors text-sm">
        {team.nombreEquipo} {showDraftPos && <span className="text-xs text-neutral-400 font-normal ml-1">[<span className="font-mono tabular-nums opacity-60">#{}</span>]</span>}
      </td>
      {!hideDifColumn && (
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
          diff > 0 ? "bg-green-100 text-green-700" : 
          diff < 0 ? "bg-red-100 text-red-700" : 
          "bg-neutral-100 text-neutral-500"
        )}>
          {diff > 0 ? `+${diff}` : diff === 0 ? "0" : diff}
        </span>
      </td>
      )}
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <span className={cn("font-mono tabular-nums text-sm", getStatColor(team.wins, maxWins, minWins))}>
          {team.wins}
        </span>
      </td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <span className={cn("font-mono tabular-nums text-sm", getStatColor(team.partialWins, maxPartialWins, minPartialWins))}>
          {team.partialWins}
        </span>
      </td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <span className={cn("font-mono tabular-nums text-sm", getStatColor(team.numCarreras, maxCarreras, minCarreras))}>
          {team.numCarreras}
        </span>
      </td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <span className={cn("font-mono tabular-nums text-sm", getStatColor(team.ppc, maxPpc, minPpc))}>
          {team.ppc.toFixed(1)}
        </span>
      </td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <span className={cn("font-mono tabular-nums text-sm", getStatColor(team.totalDays, maxDays, minDays))}>
          {team.totalDays}
        </span>
      </td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <span className={cn("font-mono tabular-nums text-sm", getStatColor(team.ppd, maxPpd, minPpd))}>
          {team.ppd.toFixed(1)}
        </span>
      </td>
      <td className="px-4 py-2 text-right bg-blue-50/20">
        <div className="flex flex-col items-end">
          <span 
            className="font-black font-mono tabular-nums text-sm tracking-tight"
            style={{ color: getPuntosColor(team.puntos) }}
          >
            {formatNumberSpanish(team.puntos)}
          </span>
          {!hidePointsDiff && isClose && (
            <span className="text-[10px] text-red-500 font-bold leading-none mt-0.5">
              -{formatNumberSpanish(pointsDiff)} pts
            </span>
          )}
        </div>
      </td>
    </>
  );
}

export function TopTeamsTableContent({ 
  topTeamsSortColumn,
  topTeamsSortDirection,
  handleTeamsSort,
  sortedTeams,
  getPuntosColor,
  formatNumberSpanish,
  maxWins, minWins,
  maxPartialWins, minPartialWins,
  maxCarreras, minCarreras,
  maxPpc, minPpc,
  maxDays, minDays,
  maxPpd, minPpd,
  dense = false,
  scrollRef,
  hideDifColumn = false,
  hidePointsDiff = false,
  showDraftPos = false,
  isExpanded = false
}: any) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  const getSortIcon = (column: string) => {
    if (topTeamsSortColumn !== column) return null;
    return topTeamsSortDirection === "desc" ? (
      <ChevronDown className="w-4 h-4" />
    ) : (
      <ChevronUp className="w-4 h-4" />
    );
  };

  const pxClass = dense ? "px-6 py-3" : "px-6 py-4";
  const internalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollRef || internalRef} className={cn("table-responsive-wrapper min-h-[300px] overflow-auto w-full scrollbar-thin px-2 md:px-0", isExpanded ? "max-h-none" : dense ? "max-h-[80vh]" : "max-h-[600px]")}>
    <table className="w-full min-w-[900px] text-sm text-left border-collapse">
      <thead className="sticky top-0 z-10 bg-neutral-50 shadow-sm border-b-2 border-neutral-200">
        <tr>
          <th
            className={`${pxClass} text-center cursor-pointer hover:bg-neutral-100 transition-colors ${dense ? 'w-24' : 'rounded-tl-xl w-20'}`}
            onClick={() => handleTeamsSort("originalPos")}
          >
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Pos
              {getSortIcon("originalPos")}
            </div>
          </th>
          <th
            className={`${pxClass} text-left cursor-pointer hover:bg-neutral-100 transition-colors`}
            onClick={() => handleTeamsSort("nombreEquipo")}
          >
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Equipo
              {getSortIcon("nombreEquipo")}
            </div>
          </th>
          {!hideDifColumn && (
          <th
            className={`${pxClass} text-center cursor-pointer hover:bg-neutral-100 transition-colors ${dense ? 'w-24' : 'w-20'} whitespace-nowrap`}
            onClick={() => handleTeamsSort("diff")}
            title="Diferencia de posiciones respecto al orden del draft"
          >
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Dif
              {getSortIcon("diff")}
            </div>
          </th>
          )}
          <th
            className={`${pxClass} text-center cursor-pointer hover:bg-neutral-100 transition-colors ${dense ? 'w-32' : 'w-24'} whitespace-nowrap`}
            onClick={() => handleTeamsSort("wins")}
            title="Carreras ganadas (equipo con más puntos en la prueba)"
          >
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Vic
              {getSortIcon("wins")}
            </div>
          </th>
          <th
            className={`${pxClass} text-center cursor-pointer hover:bg-neutral-100 transition-colors ${dense ? 'w-32' : 'w-24'} whitespace-nowrap`}
            onClick={() => handleTeamsSort("partialWins")}
            title="Clasificaciones Parciales (Etapas, etc)"
          >
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Parc
              {getSortIcon("partialWins")}
            </div>
          </th>
          <th
            className={`${pxClass} text-center cursor-pointer hover:bg-neutral-100 transition-colors ${dense ? 'w-32' : 'w-24'} whitespace-nowrap`}
            onClick={() => handleTeamsSort("numCarreras")}
          >
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Carr
              {getSortIcon("numCarreras")}
            </div>
          </th>
          <th
            className={`${pxClass} text-center cursor-pointer hover:bg-neutral-100 transition-colors ${dense ? 'w-32' : 'w-24'} whitespace-nowrap`}
            onClick={() => handleTeamsSort("ppc")}
          >
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              P/C
              {getSortIcon("ppc")}
            </div>
          </th>
          <th
            className={`${pxClass} text-center cursor-pointer hover:bg-neutral-100 transition-colors ${dense ? 'w-32' : 'w-24'} whitespace-nowrap`}
            onClick={() => handleTeamsSort("totalDays")}
          >
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Días
              {getSortIcon("totalDays")}
            </div>
          </th>
          <th
            className={`${pxClass} text-center cursor-pointer hover:bg-neutral-100 transition-colors ${dense ? 'w-32' : 'w-24'} whitespace-nowrap`}
            onClick={() => handleTeamsSort("ppd")}
          >
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              P/D
              {getSortIcon("ppd")}
            </div>
          </th>
          <th
            className={`${pxClass} text-right cursor-pointer hover:bg-neutral-100 transition-colors ${dense ? 'w-32' : 'rounded-tr-xl w-32'} whitespace-nowrap`}
            onClick={() => handleTeamsSort("puntos")}
          >
            <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-neutral-800 uppercase tracking-wider">
              Puntos
              {getSortIcon("puntos")}
            </div>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 pb-4">
        {sortedTeams.map((team: any, idx: number) => (
          <motion.tr 
            layout 
            key={team.nombreEquipo}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.2 }} 
            className="hover:bg-blue-50/30 transition-colors group/row"
          >
            <TopTeamRow
              team={team}
              idx={idx}
              getPuntosColor={getPuntosColor}
              formatNumberSpanish={formatNumberSpanish}
              sortedTeams={sortedTeams}
              maxWins={maxWins}
              minWins={minWins}
              maxPartialWins={maxPartialWins}
              minPartialWins={minPartialWins}
              maxCarreras={maxCarreras}
              minCarreras={minCarreras}
              maxPpc={maxPpc}
              minPpc={minPpc}
              maxDays={maxDays}
              minDays={minDays}
              maxPpd={maxPpd}
              minPpd={minPpd}
              hideDifColumn={hideDifColumn}
              hidePointsDiff={hidePointsDiff}
              showDraftPos={showDraftPos}
            />
          </motion.tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
