import { getFlagEmoji } from "../../../lib/data-processing";
import React, { useRef, useState, useEffect } from "react";
import { User, ChevronUp, ChevronDown } from "lucide-react";
import { ReportCard } from "../../ui/ReportCard";
import { cn } from "../../../lib/utils";

import { VirtualizedTableBody } from '../../ui/VirtualizedTableBody';

interface TopCyclistsReportProps {
  sortedStats: any[];
  monthReportData: any;
  monthsText: string;
  cyclistsSortColumn: string;
  setCyclistsSortColumn: (col: string) => void;
  cyclistsSortDirection: string;
  setCyclistsSortDirection: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  getColorClass: (val: number, max: number, min: number, isZeroRed?: boolean) => string;
  getPuntosColor: (pts: number) => string;
  getFlagEmoji: (country: string) => string;
  formatNumberSpanish: (num: number) => string;
  maxVictorias: number;
  maxCarreras: number;
  minCarreras: number;
  maxDias: number;
  minDias: number;
  maxPpc: number;
  minPpc: number;
  maxPpd: number;
  minPpd: number;
}

export const TopCyclistsReport: React.FC<TopCyclistsReportProps> = ({
  sortedStats,
  monthReportData,
  monthsText,
  cyclistsSortColumn,
  setCyclistsSortColumn,
  cyclistsSortDirection,
  setCyclistsSortDirection,
  getColorClass,
  getPuntosColor,
  getFlagEmoji,
  formatNumberSpanish,
  maxVictorias,
  maxCarreras,
  minCarreras,
  maxDias,
  minDias,
  maxPpc,
  minPpc,
  maxPpd,
  minPpd,
}) => {
  const ref3 = useRef<HTMLDivElement>(null);
  const ref4 = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const noDraftContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTopCyclistsExpanded, setIsTopCyclistsExpanded] = useState(false);
  const [isNoDraftExpanded, setIsNoDraftExpanded] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <ReportCard
        title={`Top Ciclistas por Puntuación ${monthsText ? ` [${monthsText}]` : ""}`}
        subtitle="Top 50 ciclistas con más puntos en las carreras de este periodo."
        icon={<User />}
        iconClassName="text-orange-600"
        filename="top-ciclistas"
        ref={ref3}
        className="mt-8"
        toolbarProps={{
          isExpanded: isTopCyclistsExpanded,
          onExpand: () => setIsTopCyclistsExpanded(!isTopCyclistsExpanded)
        }}
        bodyClassName="p-0 border-t border-neutral-100"
      >
        <div className="overflow-x-auto overflow-y-hidden bg-neutral-50/20 pb-8 rounded-b-2xl">
          <div ref={containerRef} className={cn("table-responsive-wrapper min-h-[300px] overflow-auto w-full crosshair-container pb-4 px-2 md:px-0 mt-2 md:mt-0", !isTopCyclistsExpanded && "max-h-[600px]")}>
            <table className="w-full text-xs text-left block md:table min-w-0 md:min-w-[700px] mx-auto bg-transparent md:bg-white rounded-xl shadow-sm md:shadow-none rounded-lg border-collapse">
              <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100 hidden md:table-header-group">
                <tr className="divide-x divide-neutral-100">
                  {['pos', 'nombre', 'equipo', 'pais', 'victorias', 'carreras', 'dias', 'ppc', 'ppd', 'puntos'].map((col) => {
                    const labelMap: Record<string, string> = { pos: 'Pos', nombre: 'Ciclista', equipo: 'Equipo', pais: 'País', victorias: 'Victorias', carreras: 'Carreras', dias: 'Días', ppc: 'P/C', ppd: 'P/D', puntos: 'Puntos' };
                    let alignClass = "text-center";
                    if (col === 'nombre' || col === 'equipo') alignClass = "text-left";
                    if (col === 'puntos') alignClass = "text-right";
                    
                    return (
                      <th
                        key={col}
                        className={cn("sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200", alignClass)}
                        onClick={() => {
                          if (cyclistsSortColumn === col) {
                            setCyclistsSortDirection((d: "asc" | "desc") => d === 'asc' ? 'desc' : 'asc');
                          } else {
                            setCyclistsSortColumn(col);
                            setCyclistsSortDirection(col === 'puntos' ? 'desc' : 'asc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {labelMap[col]}
                          {cyclistsSortColumn === col && (
                            cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y md:divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 bg-transparent md:bg-white block md:table-row-group">
                {sortedStats.map((s: any, idx: number) => {
                  const { name, data, numCarreras, ppc, ppd, originalPos } = s;
                  return (
                    <tr key={idx} className="hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] md:divide-x md:divide-neutral-100 flex flex-row flex-wrap md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 divide-neutral-100 items-stretch">
                      <td className="w-1/6 md:w-[50px] px-4 py-3 md:px-3 md:py-1 flex md:table-cell items-center justify-between md:justify-center border-b border-neutral-100 md:border-none bg-neutral-50/50 md:bg-transparent rounded-t-xl md:rounded-none">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider"></span>
                        <span className={cn("w-6 h-6 md:w-5 md:h-5 md:mx-auto rounded-full flex items-center justify-center text-[10px] md:text-[9px] font-bold shadow-sm md:shadow-none bg-white md:bg-transparent", originalPos === 1 ? "bg-yellow-100 text-yellow-700 border border-yellow-200 md:border-none" : originalPos === 2 ? "bg-neutral-200 text-neutral-600 border border-neutral-300 md:border-none" : originalPos === 3 ? "bg-orange-100 text-orange-700 border border-orange-200 md:border-none" : "bg-neutral-100 text-neutral-500 border border-neutral-200 md:border-none")}>
                          {originalPos}
                        </span>
                      </td>
                      <td className="w-5/6 md:w-auto px-4 py-3 md:px-4 md:py-1 font-bold text-neutral-900 flex flex-col gap-1 justify-center md:table-cell md:whitespace-nowrap rounded-tr-xl md:rounded-none bg-neutral-50/50 md:bg-transparent border-b border-neutral-100 md:border-none">
                        <div className="flex items-center gap-1 md:inline">
                          <span className="text-[15px] md:text-[11px]">{name}</span> <span className="text-neutral-400 font-normal text-[11px] md:text-[9px]">&lt;{data.ronda || "-"}&gt;</span>
                        </div>
                      </td>
                      <td className="w-1/2 md:w-auto px-4 py-3 md:px-4 md:py-1 text-neutral-600 flex flex-col justify-center items-start md:table-cell text-left md:whitespace-nowrap border-r md:border-none border-neutral-100">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider mb-1">Equipo</span>
                        <span className="font-medium text-[13px] md:text-[11px] truncate w-full">{data.equipo}</span>
                      </td>
                      <td className="w-1/2 md:w-auto px-4 py-2 md:px-3 md:py-1 text-base flex flex-col justify-center items-center md:table-cell md:text-center text-center" title={data.pais}>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider mb-1">País</span>
                        <span className="text-xl md:text-base">{getFlagEmoji(data.pais)}</span>
                      </td>
                      
                      <td className={cn("w-1/5 md:w-auto px-1 py-1 md:px-3 md:py-1 flex flex-col items-center justify-center md:table-cell text-center font-mono tabular-nums border-r md:border-r-0 border-neutral-100 bg-neutral-50/30 md:bg-transparent", getColorClass(data.victorias, maxVictorias, 0, true))}>
                        <span className="text-[9px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider mb-1" style={{color: "inherit", opacity: 0.6}}>Vic</span>
                        <span className="font-mono tabular-nums tracking-tight text-sm md:text-[11px]">{formatNumberSpanish(data.victorias)}</span>
                      </td>
                      <td className={cn("w-1/5 md:w-auto px-1 py-1 md:px-3 md:py-1 flex flex-col items-center justify-center md:table-cell text-center font-mono tabular-nums border-r md:border-r-0 border-neutral-100 bg-neutral-50/30 md:bg-transparent", getColorClass(numCarreras, maxCarreras, minCarreras))}>
                        <span className="text-[9px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider mb-1" style={{color: "inherit", opacity: 0.6}}>Car</span>
                        <span className="font-mono tabular-nums tracking-tight text-sm md:text-[11px]">{formatNumberSpanish(numCarreras)}</span>
                      </td>
                      <td className={cn("w-1/5 md:w-auto px-1 py-1 md:px-3 md:py-1 flex flex-col items-center justify-center md:table-cell text-center font-mono tabular-nums border-r md:border-r-0 border-neutral-100 bg-neutral-50/30 md:bg-transparent", getColorClass(data.dias, maxDias, minDias))}>
                        <span className="text-[9px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider mb-1" style={{color: "inherit", opacity: 0.6}}>Día</span>
                        <span className="font-mono tabular-nums tracking-tight text-sm md:text-[11px]">{formatNumberSpanish(data.dias)}</span>
                      </td>
                      <td className={cn("w-1/5 md:w-auto px-1 py-1 md:px-3 md:py-1 flex flex-col items-center justify-center md:table-cell text-center font-mono tabular-nums border-r md:border-r-0 border-neutral-100 bg-neutral-50/30 md:bg-transparent", getColorClass(ppc, maxPpc, minPpc))}>
                        <span className="text-[9px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider mb-1" style={{color: "inherit", opacity: 0.6}}>P/C</span>
                        <span className="text-sm md:text-[11px]">{formatNumberSpanish(ppc.toFixed(1))}</span>
                      </td>
                      <td className={cn("w-1/5 md:w-auto px-1 py-1 md:px-3 md:py-1 flex flex-col items-center justify-center md:table-cell text-center font-mono tabular-nums bg-neutral-50/30 md:bg-transparent", getColorClass(ppd, maxPpd, minPpd))}>
                        <span className="text-[9px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider mb-1" style={{color: "inherit", opacity: 0.6}}>P/D</span>
                        <span className="text-sm md:text-[11px]">{formatNumberSpanish(ppd.toFixed(1))}</span>
                      </td>
                      
                      <td className="w-full md:w-[60px] px-4 py-3 md:px-4 md:py-1 flex justify-between items-center md:table-cell text-right font-black font-mono tabular-nums text-lg md:text-sm bg-blue-50/20 md:bg-transparent rounded-b-xl md:rounded-none border-t border-neutral-100 md:border-none" style={{ color: getPuntosColor(data.puntos) }}>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider" style={{color: "inherit", opacity: 0.7}}>Puntos Totales</span>
                        <span className="font-mono tabular-nums tracking-tight">{formatNumberSpanish(data.puntos)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </ReportCard>

      <ReportCard
        title={`Top Ciclistas No Elegidos (No draft) ${monthsText ? ` [${monthsText}]` : ""}`}
        subtitle="Corredores que han sumado puntos pero no fueron elegidos por ningún equipo."
        icon={<User />}
        iconClassName="text-red-600"
        filename="top-ciclistas-no-draft"
        ref={ref4}
        className="mt-8"
        toolbarProps={{
          isExpanded: isNoDraftExpanded,
          onExpand: () => setIsNoDraftExpanded(!isNoDraftExpanded)
        }}
        bodyClassName="p-0 border-t border-neutral-100"
      >
        <div className="overflow-x-auto overflow-y-hidden bg-neutral-50/20 pb-8 rounded-b-2xl">
          <div ref={noDraftContainerRef} className={cn("table-responsive-wrapper min-h-[300px] overflow-auto w-full crosshair-container px-2 md:px-0 mt-2 md:mt-0 pb-4", !isNoDraftExpanded && "max-h-[600px]")}>
            <table className="w-full text-xs text-left bg-transparent md:bg-white rounded-xl shadow-sm md:shadow-none rounded-lg block md:table min-w-0 md:min-w-[700px] mx-auto border-collapse">
              <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100 hidden md:table-header-group">
                <tr className="divide-x divide-neutral-100">
                  <th className="px-4 py-3 font-bold border-b border-neutral-200 text-center">Pos</th>
                  <th className="px-4 py-3 font-bold border-b border-neutral-200 shadow-[1px_0_0_0_#e5e5e5]">Ciclista</th>
                  <th className="px-4 py-3 font-bold border-b border-neutral-200">EQ</th>
                  <th className="px-4 py-3 font-bold border-b border-neutral-200 text-center">País</th>
                  <th className="px-4 py-3 font-bold border-b border-neutral-200 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y md:divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 bg-transparent md:bg-white block md:table-row-group">
                {monthReportData.topNoDraftCyclists?.map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] md:divide-x md:divide-neutral-100 flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 divide-neutral-100">
                    <td className="px-4 py-3 md:px-3 md:py-1 flex justify-between items-center md:table-cell text-center font-bold text-neutral-400 bg-neutral-50/50 md:bg-transparent rounded-t-xl md:rounded-none">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Posición</span>
                      {s.originalPos}º
                    </td>
                    <td className="px-4 py-3 md:px-4 md:py-1 font-bold text-neutral-900 flex flex-col md:table-cell gap-1">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ciclista</span>
                      <span className="text-sm md:text-[11px]">{s.cyclist}</span>
                    </td>
                    <td className="px-4 py-3 md:px-4 md:py-1 text-neutral-600 flex justify-between items-center md:table-cell">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Equipo</span>
                      {s.eq}
                    </td>
                    <td className="px-4 py-3 md:px-3 md:py-1 text-base flex justify-between items-center md:table-cell md:text-center" title={s.pais}>
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">País</span>
                      <span className="text-xl md:text-base">{getFlagEmoji(s.pais)}</span>
                    </td>
                    <td className="px-4 py-3 md:px-4 md:py-1 text-right font-black font-mono tabular-nums text-base md:text-sm text-red-600 flex justify-between items-center md:table-cell bg-red-50/30 md:bg-transparent rounded-b-xl md:rounded-none">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider" style={{color: "inherit", opacity: 0.7}}>Puntos</span>
                      <span className="font-mono tabular-nums tracking-tight">{formatNumberSpanish(s.pts)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ReportCard>
    </>
  );
};
