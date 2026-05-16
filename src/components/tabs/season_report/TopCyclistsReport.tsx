import { getFlagEmoji } from "../../../lib/data-processing";
import React, { useRef } from "react";
import { User, ChevronUp, ChevronDown } from "lucide-react";
import { ExportToolbar } from "../../ui/ExportToolbar";
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

  return (
    <>
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative mt-8" ref={ref3}>
        <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
              <User className="w-5 h-5 text-orange-600" />
              Top Ciclistas por Puntuación {monthsText ? ` [${monthsText}]` : ""}
            </h3>
            <p className="text-sm text-neutral-500 ">
              Top 50 ciclistas con más puntos en las carreras de este periodo.
            </p>
          </div>
          <ExportToolbar targetRef={ref3} filename="top-ciclistas" />
        </div>
        <div className="overflow-x-auto overflow-y-hidden bg-neutral-50/20 pb-8 rounded-b-2xl">
          <div ref={containerRef} className="table-responsive-wrapper overflow-auto w-full max-h-[600px] crosshair-container">
            <table className="w-full min-w-[700px] mx-auto text-xs text-left bg-white bg-white rounded-xl shadow-sm rounded-lg">
              <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
                <tr className="divide-x divide-neutral-100">
                  {['pos', 'nombre', 'equipo', 'pais', 'victorias', 'carreras', 'dias', 'ppc', 'ppd', 'puntos'].map((col) => {
                    const labelMap: Record<string, string> = { pos: 'Pos', nombre: 'Ciclista', equipo: 'Equipo', pais: 'País', victorias: 'Victorias', carreras: 'Carreras', dias: 'Días', ppc: 'P/C', ppd: 'P/D', puntos: 'Puntos' };
                    return (
                      <th
                        key={col}
                        className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
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
              <VirtualizedTableBody
                items={sortedStats}
                scrollElementRef={containerRef}
                colSpan={10}
                className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 bg-white"
                renderRow={(s) => {
                  const { name, data, numCarreras, ppc, ppd, originalPos } = s;
                  return (
                    <tr className="hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] divide-x divide-neutral-100">
                      <td className="px-3 py-1 text-center">
                        <span className={cn("w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[9px] font-bold", originalPos === 1 ? "bg-yellow-100 text-yellow-700" : originalPos === 2 ? "bg-neutral-200 text-neutral-600" : originalPos === 3 ? "bg-orange-100 text-orange-700" : "bg-neutral-100 text-neutral-500")}>
                          {originalPos}
                        </span>
                      </td>
                      <td className="px-4 py-1 font-bold text-neutral-900 ">
                        {name} <span className="text-neutral-400 font-normal text-[9px]">&lt;{data.ronda || "-"}&gt;</span>
                      </td>
                      <td className="px-4 py-1 text-neutral-600 ">
                        <span className="font-medium">{data.equipo}</span>
                      </td>
                      <td className="px-3 py-1 text-base text-center" title={data.pais}>{getFlagEmoji(data.pais)}</td>
                      <td className={cn("px-3 py-1 text-center font-mono", getColorClass(data.victorias, maxVictorias, 0, true))}>
                        <span className="font-mono tracking-tight">{formatNumberSpanish(data.victorias)}</span>
                      </td>
                      <td className={cn("px-3 py-1 text-center font-mono", getColorClass(numCarreras, maxCarreras, minCarreras))}>
                        <span className="font-mono tracking-tight">{formatNumberSpanish(numCarreras)}</span>
                      </td>
                      <td className={cn("px-3 py-1 text-center font-mono", getColorClass(data.dias, maxDias, minDias))}>
                        <span className="font-mono tracking-tight">{formatNumberSpanish(data.dias)}</span>
                      </td>
                      <td className={cn("px-3 py-1 text-center font-mono", getColorClass(ppc, maxPpc, minPpc))}>
                        {formatNumberSpanish(ppc.toFixed(1))}
                      </td>
                      <td className={cn("px-3 py-1 text-center font-mono", getColorClass(ppd, maxPpd, minPpd))}>
                        {formatNumberSpanish(ppd.toFixed(1))}
                      </td>
                      <td className="px-4 py-1 text-right font-black font-mono text-sm" style={{ color: getPuntosColor(data.puntos) }}>
                        <span className="font-mono tracking-tight">{formatNumberSpanish(data.puntos)}</span>
                      </td>
                    </tr>
                  );
                }}
              />
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative mt-8" ref={ref4}>
        <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 ">
              <User className="w-5 h-5 text-red-600" />
              Top Ciclistas No Elegidos (No draft) {monthsText ? ` [${monthsText}]` : ""}
            </h3>
            <p className="text-sm text-neutral-500 ">
              Corredores que han sumado puntos pero no fueron elegidos por ningún equipo.
            </p>
          </div>
          <ExportToolbar targetRef={ref4} filename="top-ciclistas-no-draft" />
        </div>
        <div className="overflow-x-auto overflow-y-hidden bg-neutral-50/20 pb-8 rounded-b-2xl">
          <div ref={noDraftContainerRef} className="table-responsive-wrapper overflow-auto w-full max-h-[600px] crosshair-container">
            <table className="w-full min-w-[700px] mx-auto text-xs text-left bg-white bg-white rounded-xl shadow-sm rounded-lg">
              <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
                <tr className="divide-x divide-neutral-100">
                  <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200 text-center">Pos</th>
                  <th className="sticky top-0 left-0 z-40 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200 shadow-[1px_0_0_0_#e5e5e5]">Ciclista</th>
                  <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200">EQ</th>
                  <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200 text-center">País</th>
                  <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200 text-right">Puntos</th>
                </tr>
              </thead>
              <VirtualizedTableBody
                items={monthReportData.topNoDraftCyclists}
                scrollElementRef={noDraftContainerRef}
                colSpan={5}
                className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 bg-white"
                renderRow={(s: any) => (
                  <tr className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100">
                    <td className="px-3 py-1 text-center font-bold text-neutral-400">
                      {s.originalPos}º
                    </td>
                    <td className="px-4 py-1 font-bold text-neutral-900 ">
                      {s.cyclist}
                    </td>
                    <td className="px-4 py-1 text-neutral-600 ">
                      {s.eq}
                    </td>
                    <td className="px-3 py-1 text-base text-center" title={s.pais}>
                      {getFlagEmoji(s.pais)}
                    </td>
                    <td className="px-4 py-1 text-right font-black font-mono text-sm text-red-600">
                      <span className="font-mono tracking-tight">{formatNumberSpanish(s.pts)}</span>
                    </td>
                  </tr>
                )}
              />
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
