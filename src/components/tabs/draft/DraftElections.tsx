import { AppState, PlayerScore, CyclistMetadata } from '../../../lib/types';
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, ChevronDown, X, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getVal } from '../../../lib/data-processing';
import { ReportCard } from '../../ui/ReportCard';
import { useDebounce } from '../../../lib/hooks/useDebounce';
import { useTableScreenshot } from '../../../hooks/useTableScreenshot';
import { useUrlState } from '../../../hooks/useUrlState';
import { useDraftElectionsState, DEFAULT_DRAFT_COLS } from './hooks/useDraftElectionsState';
import { useDraftElectionsExports } from './hooks/useDraftElectionsExports';
import { useDraftElectionsLogic } from './hooks/useDraftElectionsLogic';
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";

export interface DraftElectionsProps {
  files: AppState;
  cyclistMetadata: Record<string, CyclistMetadata>;
  leaderboard: PlayerScore[];
  getFlagEmoji: any;
  teamTotalPoints: Record<string, number>;
  draftCyclistStats: Record<string, { puntos: number; victorias: number }>;
  draftComputedData: {
    maxPuntos: number;
    minCarreras: number;
    minDc: number;
    minPpc: number;
    minPpd: number;
    minPct: number;
  };
}

export const DraftElections: React.FC<DraftElectionsProps> = ({
  files,
  cyclistMetadata,
  getFlagEmoji,
  teamTotalPoints,
  draftCyclistStats,
  draftComputedData,
}) => {
  
  const {
    draftSearchTerm, setDraftSearchTerm,
    localSearch, setLocalSearch,
    draftRoundFilter, setDraftRoundFilter,
    draftTeamFilter, setDraftTeamFilter,
    isDraftRoundFilterOpen, setIsDraftRoundFilterOpen,
    isDraftTeamFilterOpen, setIsDraftTeamFilterOpen,
    isDraftStatsFilterOpen, setIsDraftStatsFilterOpen,
    isDraftColsFilterOpen, setIsDraftColsFilterOpen,
    draftStatsFilters, setDraftStatsFilters,
    localDraftStatsFilters, setLocalDraftStatsFilters,
    draftSortColumn, setDraftSortColumn,
    draftSortDirection, setDraftSortDirection,
    isDraftTableExpanded, setIsDraftTableExpanded,
    draftVisibleCols, setDraftVisibleCols,
  } = useDraftElectionsState();

  const debouncedSearch = useDebounce(localSearch, 300);
  useEffect(() => {
    if (debouncedSearch !== draftSearchTerm) {
      setDraftSearchTerm(debouncedSearch);
    }
  }, [debouncedSearch, draftSearchTerm, setDraftSearchTerm]);

  useEffect(() => {
    if (draftSearchTerm !== localSearch) {
      setLocalSearch(draftSearchTerm);
    }
  }, [draftSearchTerm, localSearch, setLocalSearch]);

  const debouncedDraftStatsFilters = useDebounce(localDraftStatsFilters, 500);
  useEffect(() => {
    if (JSON.stringify(debouncedDraftStatsFilters) !== JSON.stringify(draftStatsFilters)) {
      setDraftStatsFilters(debouncedDraftStatsFilters);
    }
  }, [debouncedDraftStatsFilters, draftStatsFilters, setDraftStatsFilters]);
  
  useEffect(() => {
    if (JSON.stringify(draftStatsFilters) !== JSON.stringify(localDraftStatsFilters)) {
      setLocalDraftStatsFilters(draftStatsFilters);
    }
  }, [draftStatsFilters, localDraftStatsFilters, setLocalDraftStatsFilters]);

  const draftTableRef = useRef<HTMLDivElement>(null);

  const {
    isDraftTableCopyingState,
    isDraftTableCopying, setIsDraftTableCopying,
    handleCopyDraftTableImage,
    handleDownloadDraftTableImage
  } = useDraftElectionsExports(draftTableRef);

  const { draftFilteredData, draftSortedData } = useDraftElectionsLogic(
    files,
    draftSearchTerm,
    draftRoundFilter,
    draftTeamFilter,
    draftStatsFilters,
    draftCyclistStats,
    cyclistMetadata,
    draftSortColumn,
    draftSortDirection
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: draftSortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const { maxPuntos, minCarreras, minDc, minPpc, minPpd, minPct } = draftComputedData;
  const numBlocks = Math.ceil(draftFilteredData.length / 50);

  if (!files?.elecciones?.data) {
    return (
      <div className="text-center py-20 text-neutral-500 italic">
        No hay datos del draft cargados.
      </div>
    );
  }

  const filtersUI = (
    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
      <div className="relative flex-1 sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar ciclista..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>
      
      <div className="relative">
        <Popover open={isDraftRoundFilterOpen} onOpenChange={isOpen => {
          if (isOpen) {
            setIsDraftRoundFilterOpen(true);
            setIsDraftTeamFilterOpen(false);
            setIsDraftStatsFilterOpen(false);
            setIsDraftColsFilterOpen(false);
          } else {
            setIsDraftRoundFilterOpen(false);
          }
        }}>
          <PopoverTrigger render={
            <Button variant="outline"
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[140px] justify-between cursor-pointer"
            >
              <span className="text-neutral-700">
                {draftRoundFilter.length === 0 ? "Todas las rondas" : `${draftRoundFilter.length} rondas`}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isDraftRoundFilterOpen && "rotate-180")} />
            </Button>
          } />
          <PopoverContent className="w-[calc(100vw-2rem)] max-w-xs sm:w-56 p-0 rounded-xl shadow-xl z-50 py-2">
            <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Rondas</span>
              {draftRoundFilter.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setDraftRoundFilter([])} className="text-[10px] text-blue-600 hover:text-blue-700 font-bold">Limpiar</Button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {Array.from(new Set(files.elecciones.data.map((d: any) => String(getVal(d, "Ronda"))).filter(Boolean)))
                .sort((a, b) => parseInt(a as string) - parseInt(b as string))
                .map((ronda) => (
                  <label key={ronda as string} className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer">
                    <input type="checkbox" className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20" checked={draftRoundFilter.includes(ronda as string)} onChange={() => {
                      if (draftRoundFilter.includes(ronda as string)) {
                          setDraftRoundFilter(draftRoundFilter.filter((r) => r !== ronda));
                      } else {
                          setDraftRoundFilter([...draftRoundFilter, ronda as string]);
                      }
                    }} />
                    <span className="text-sm text-neutral-700">Ronda {ronda as string}</span>
                  </label>
                ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative">
        <Popover open={isDraftTeamFilterOpen} onOpenChange={isOpen => {
          if (isOpen) {
            setIsDraftTeamFilterOpen(true);
            setIsDraftRoundFilterOpen(false);
            setIsDraftStatsFilterOpen(false);
            setIsDraftColsFilterOpen(false);
          } else {
            setIsDraftTeamFilterOpen(false);
          }
        }}>
          <PopoverTrigger render={
            <Button variant="outline"
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[160px] justify-between cursor-pointer"
            >
              <span className="text-neutral-700">
                {draftTeamFilter.length === 0 ? "Todos los equipos" : `${draftTeamFilter.length} equipos`}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isDraftTeamFilterOpen && "rotate-180")} />
            </Button>
          } />
          <PopoverContent className="w-[calc(100vw-2rem)] max-w-sm sm:w-64 p-0 rounded-xl shadow-xl z-50 py-2">
            <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Equipos</span>
              {draftTeamFilter.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setDraftTeamFilter([])} className="text-[10px] text-blue-600 hover:text-blue-700 font-bold">Limpiar</Button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {Array.from(new Set(files.elecciones.data.map((d: any) => String(getVal(d, "Nombre_Equipo") || getVal(d, "Nombre_TG"))).filter(Boolean)))
                .sort()
                .map((team) => (
                  <label key={team as string} className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer">
                    <input type="checkbox" className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20" checked={draftTeamFilter.includes(team as string)} onChange={() => {
                      if (draftTeamFilter.includes(team as string)) {
                          setDraftTeamFilter(draftTeamFilter.filter((t) => t !== team));
                      } else {
                          setDraftTeamFilter([...draftTeamFilter, team as string]);
                      }
                    }} />
                    <span className="text-sm text-neutral-700">{team as string}</span>
                  </label>
                ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative">
        <Popover open={isDraftStatsFilterOpen} onOpenChange={isOpen => {
          if (isOpen) {
            setIsDraftStatsFilterOpen(true);
            setIsDraftTeamFilterOpen(false);
            setIsDraftRoundFilterOpen(false);
            setIsDraftColsFilterOpen(false);
          } else {
            setIsDraftStatsFilterOpen(false);
          }
        }}>
          <PopoverTrigger render={
            <Button variant="outline"
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[140px] justify-between cursor-pointer"
            >
              <span className="text-neutral-700">
                {Object.values(localDraftStatsFilters).some((v) => v !== undefined && String(v) !== "") ? "Est. activas" : "Estadísticas"}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isDraftStatsFilterOpen && "rotate-180")} />
            </Button>
          } />
          <PopoverContent className="w-[calc(100vw-2rem)] max-w-sm sm:w-80 md:w-96 p-4 rounded-xl shadow-xl z-50">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-2 mb-3">
              <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Filtros de Estadísticas</span>
              {Object.values(localDraftStatsFilters).some((v) => v !== undefined && String(v) !== "") && (
                <Button variant="ghost" size="sm" onClick={() => setLocalDraftStatsFilters({})} className="text-[10px] text-blue-600 hover:text-blue-700 font-bold">Limpiar todo</Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {[
                { key: "Puntos", label: "Puntos" },
                { key: "Victorias", label: "Victorias (V)" },
                { key: "Carr", label: "Carreras (C)" },
                { key: "Dc", label: "Días Comp. (DC)" },
                { key: "Ppc", label: "Pto/Carrera (P/C)" },
                { key: "Ppd", label: "Pto/Día (P/D)" },
              ].map((stat) => (
                <div key={stat.key} className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">{stat.label}</label>
                  <div className="flex items-center gap-1.5">
                    <input type="text" inputMode="decimal" placeholder="Min" className="flex-1 w-0 min-w-0 px-2 py-1.5 text-xs text-center border rounded bg-neutral-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" value={(localDraftStatsFilters as any)[`min${stat.key}`] ?? ""} onChange={(e) => setLocalDraftStatsFilters((prev) => ({ ...prev, [`min${stat.key}`]: e.target.value === "" ? undefined : e.target.value }))} />
                    <span className="text-neutral-400 shrink-0">-</span>
                    <input type="text" inputMode="decimal" placeholder="Max" className="flex-1 w-0 min-w-0 px-2 py-1.5 text-xs text-center border rounded bg-neutral-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" value={(localDraftStatsFilters as any)[`max${stat.key}`] ?? ""} onChange={(e) => setLocalDraftStatsFilters((prev) => ({ ...prev, [`max${stat.key}`]: e.target.value === "" ? undefined : e.target.value }))} />
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative">
        <Popover open={isDraftColsFilterOpen} onOpenChange={isOpen => {
          if (isOpen) {
            setIsDraftColsFilterOpen(true);
            setIsDraftStatsFilterOpen(false);
            setIsDraftTeamFilterOpen(false);
            setIsDraftRoundFilterOpen(false);
          } else {
            setIsDraftColsFilterOpen(false);
          }
        }}>
          <PopoverTrigger render={
            <Button variant="outline"
              className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[120px] justify-between cursor-pointer"
            >
              <span className="text-neutral-700">Columnas</span>
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isDraftColsFilterOpen && "rotate-180")} />
            </Button>
          } />
          <PopoverContent className="w-[calc(100vw-2rem)] max-w-sm sm:w-64 p-0 rounded-xl shadow-xl z-50 py-2">
            <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Columnas Visibles</span>
              {draftVisibleCols.length !== DEFAULT_DRAFT_COLS.length && (
                <Button variant="ghost" size="sm" onClick={() => setDraftVisibleCols(DEFAULT_DRAFT_COLS)} className="text-[10px] text-blue-600 hover:text-blue-700 font-bold">Por defecto</Button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {DEFAULT_DRAFT_COLS.map((col) => (
                <label key={col} className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer">
                  <input type="checkbox" className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20" checked={draftVisibleCols.includes(col)} onChange={() => {
                    if (draftVisibleCols.includes(col)) {
                        setDraftVisibleCols(draftVisibleCols.filter((c) => c !== col));
                    } else {
                        const newCols = [...draftVisibleCols, col];
                        // sort to match default order
                        newCols.sort((a,b) => DEFAULT_DRAFT_COLS.indexOf(a) - DEFAULT_DRAFT_COLS.indexOf(b));
                        setDraftVisibleCols(newCols);
                    }
                  }} />
                  <span className="text-sm text-neutral-700">{col.replace("_", " ")}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <ReportCard
      title="Elecciones del Draft"
      subtitle="Catálogo completo de elecciones con estadísticas detalladas por ciclista en esta temporada."
      icon={<Users />}
      filename="draft-elecciones"
      ref={draftTableRef}
      toolbarProps={{
        isExpanded: isDraftTableExpanded,
        onExpand: () => setIsDraftTableExpanded(!isDraftTableExpanded),
        onCopyImage: handleCopyDraftTableImage,
        isImageCopying: isDraftTableCopying,
        onDownloadImage: handleDownloadDraftTableImage,
        numBlocks
      }}
      bodyClassName="p-0 border-t border-neutral-100"
    >
      <div className={cn("copy-button-ignore py-4 px-6 border-b border-neutral-100", isDraftTableExpanded && "hidden")}>
        {filtersUI}
      </div>
      <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
        {(draftRoundFilter.length > 0 || draftTeamFilter.length > 0 || Object.values(draftStatsFilters).some((v) => v !== undefined && String(v) !== "")) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium mr-1">Filtros activos:</span>
            {draftRoundFilter.map(r => (
              <span key={'r'+r} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                 Ronda {r}
                 <Button variant="outline" onClick={() => setDraftRoundFilter(draftRoundFilter.filter(x => x !== r))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></Button>
              </span>
            ))}
            {draftTeamFilter.map(t => (
              <span key={'t'+t} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                 {t}
                 <Button variant="outline" onClick={() => setDraftTeamFilter(draftTeamFilter.filter(x => x !== t))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></Button>
              </span>
            ))}
            {Object.entries(draftStatsFilters).map(([k, v]) => {
              if (v === undefined || String(v) === "") return null;
              const label = k.replace('min', 'Min ').replace('max', 'Max ');
              return (
                <span key={'s'+k} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                   {label} {v}
                   <Button variant="outline" onClick={() => {
                      const newStats = { ...draftStatsFilters };
                      delete (newStats as any)[k];
                      setDraftStatsFilters(newStats);
                   }} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></Button>
                </span>
              );
            })}
            <Button variant="outline" 
               onClick={() => { setDraftRoundFilter([]); setDraftTeamFilter([]); setDraftStatsFilters({}); }}
               className="text-[11px] text-neutral-500 hover:text-neutral-800 underline ml-2 transition-colors border-none bg-transparent"
            >
              Limpiar todo
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-center bg-neutral-50/30">
        <div className={cn("w-full relative", isDraftTableExpanded || isDraftTableCopyingState ? "max-h-none overflow-visible" : "overflow-hidden max-h-[1200px]")}>
          <div ref={parentRef} className={cn("table-responsive-wrapper min-h-[300px] w-full crosshair-container", isDraftTableExpanded || isDraftTableCopyingState ? "max-h-none h-auto overflow-visible" : "overflow-auto max-h-[800px]")}>
            <table className="w-full min-w-[1000px] text-[11px] text-left whitespace-nowrap border-collapse mx-auto">

              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase text-[10px] tracking-wider sticky top-0 z-10">
                <tr>
                  {DEFAULT_DRAFT_COLS.filter(col => draftVisibleCols.includes(col)).map((col) => {
                    let colTitle = col;
                    if (col === "V") colTitle = "Victorias"; if (col === "C") colTitle = "Carreras Disputadas"; if (col === "DC") colTitle = "Días de Competición"; if (col === "P/C") colTitle = "Puntos por Carrera"; if (col === "P/D") colTitle = "Puntos por Día"; if (col === "%") colTitle = "% de puntos del equipo";
                    return (
                      <th key={col} className={`${"px-2 py-1.5 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors text-center"} ${col === "Nombre_Equipo" ? "sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]" : ""}`} title={colTitle} onClick={() => {
                        if (draftSortColumn === col) { setDraftSortDirection((prev) => prev === "asc" ? "desc" : "asc"); } else { setDraftSortColumn(col); setDraftSortDirection("asc"); }
                      }}>
                        <div className="flex items-center justify-center gap-1">
                          {col === "Eq_Comp" ? "EQ BREVE" : col.replace("_", " ")}
                          {draftSortColumn === col && <span className="text-blue-600">{draftSortDirection === "asc" ? "↑" : "↓"}</span>}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {isDraftTableCopyingState ? (
                  // BYPASS VIRTUALIZER PARA LA CAPTURA DE IMAGEN
                  (() => {
                    let itemsToRender = draftSortedData;
                    if (typeof isDraftTableCopying === 'string' && isDraftTableCopying.startsWith('p')) {
                      itemsToRender = draftSortedData.slice((parseInt(isDraftTableCopying.substring(1)) - 1) * 50, parseInt(isDraftTableCopying.substring(1)) * 50);
                    }
                    return itemsToRender.map((row, idx) => {
                      const ciclista = getVal(row, "Ciclista") || "";
                      const stats = draftCyclistStats[ciclista] || { puntos: 0, victorias: 0 };
                      let pointsStyle = {};
                      if (stats.puntos === 0) { pointsStyle = { backgroundColor: "#fee2e2", color: "#b91c1c" }; } else { const ratio = stats.puntos / maxPuntos; const hue = 45 + ratio * (142 - 45); pointsStyle = { backgroundColor: `hsl(${hue}, 80%, 85%)`, color: `hsl(${hue}, 90%, 25%)` }; }

                      return (
                        <tr key={idx} className="draft-row bg-white h-6">
                          {draftVisibleCols.includes("Elección") && <td className="px-1 py-0.5 font-medium text-neutral-900 text-center">{getVal(row, "Elección")}</td>}
                          {draftVisibleCols.includes("Nombre_Equipo") && <td className="px-1 py-0.5 text-left min-w-0 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">{getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG")}</td>}
                          {draftVisibleCols.includes("Orden_Draft") && <td className="px-1 py-0.5 text-center">{getVal(row, "Orden_Draft")}</td>}
                          {draftVisibleCols.includes("Ronda") && <td className="px-1 py-0.5 text-center"><span className="inline-flex items-center justify-center bg-neutral-100 text-neutral-600 px-1 py-px rounded text-[9px] font-bold">{getVal(row, "Ronda")}</span></td>}
                          {draftVisibleCols.includes("Ciclista") && <td className="px-1 py-0.5 font-medium text-blue-600 text-[10px]">{ciclista}</td>}
                          {draftVisibleCols.includes("Edad") && <td className="px-1 py-0.5 text-center">{getVal(row, "Edad")}</td>}
                          {draftVisibleCols.includes("País") && <td className="px-1 py-0.5 text-center" title={getVal(row, "País")}><span className="text-xs">{getFlagEmoji(getVal(row, "País"))}</span></td>}
                          {draftVisibleCols.includes("Eq_Comp") && <td className="px-1 py-0.5 text-center text-neutral-500 min-w-0">{cyclistMetadata[ciclista]?.equipoBreve || getVal(row, "Eq_Comp")}</td>}
                          {draftVisibleCols.includes("Puntos") && <td className="px-1 py-0.5 text-center"><span className="inline-flex items-center justify-center px-1 py-0.5 rounded font-bold min-w-[2.5rem] tracking-tight text-[10px]" style={pointsStyle}>{stats.puntos}</span></td>}
                          {draftVisibleCols.includes("V") && <td className="px-1 py-0.5 text-center">{stats.victorias > 0 ? <span className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 px-1 py-px rounded text-[9px] font-bold tracking-tight">{stats.victorias}</span> : <span className="text-neutral-300">-</span>}</td>}
                          {draftVisibleCols.includes("C") && <td className={cn("px-1 py-0.5 text-center font-mono tabular-nums", (cyclistMetadata[ciclista]?.carrerasDisputadas || 0) === 0 ? "text-red-500" : cyclistMetadata[ciclista]?.carrerasDisputadas === minCarreras ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.carrerasDisputadas || 0}</td>}
                          {draftVisibleCols.includes("DC") && <td className={cn("px-1 py-0.5 text-center font-mono tabular-nums", (cyclistMetadata[ciclista]?.diasCompeticion || 0) === 0 ? "text-red-500" : cyclistMetadata[ciclista]?.diasCompeticion === minDc ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.diasCompeticion || 0}</td>}
                          {draftVisibleCols.includes("P/C") && <td className={cn("px-1 py-0.5 text-center font-mono tabular-nums", (cyclistMetadata[ciclista]?.carrerasDisputadas > 0 ? stats.puntos / cyclistMetadata[ciclista].carrerasDisputadas : 0) === 0 ? "text-red-500" : stats.puntos / cyclistMetadata[ciclista].carrerasDisputadas === minPpc ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.carrerasDisputadas > 0 ? (stats.puntos / cyclistMetadata[ciclista].carrerasDisputadas).toFixed(1) : "0.0"}</td>}
                          {draftVisibleCols.includes("P/D") && <td className={cn("px-1 py-0.5 text-center font-mono tabular-nums", (cyclistMetadata[ciclista]?.diasCompeticion > 0 ? stats.puntos / cyclistMetadata[ciclista].diasCompeticion : 0) === 0 ? "text-red-500" : stats.puntos / cyclistMetadata[ciclista].diasCompeticion === minPpd ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.diasCompeticion > 0 ? (stats.puntos / cyclistMetadata[ciclista].diasCompeticion).toFixed(1) : "0.0"}</td>}
                          {draftVisibleCols.includes("%") && <td className={cn("px-1 py-0.5 text-center font-mono tabular-nums", (() => { const eq = getVal(row, "Nombre_Equipo") || (getVal(row, "Nombre_TG") as string); const pct = eq && teamTotalPoints[eq] > 0 ? (stats.puntos / teamTotalPoints[eq]) * 100 : 0; if (pct === 0) return "text-red-500"; if (pct === minPct) return "text-orange-500 font-bold"; return ""; })())}>
                            {(() => { const eq = getVal(row, "Nombre_Equipo") || (getVal(row, "Nombre_TG") as string); const pct = eq && teamTotalPoints[eq] > 0 ? (stats.puntos / teamTotalPoints[eq]) * 100 : 0; return pct.toFixed(1) + "%"; })()}
                          </td>}
                        </tr>
                      );
                    });
                  })()
                ) : (
                  <>
                    {rowVirtualizer.getVirtualItems().length > 0 && <tr><td style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} colSpan={draftVisibleCols.length} /></tr>}
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const row = draftSortedData[virtualRow.index]; const idx = virtualRow.index;
                      const ciclista = getVal(row, "Ciclista") || "";
                      const stats = draftCyclistStats[ciclista] || { puntos: 0, victorias: 0 };
                      let pointsStyle = {};
                      if (stats.puntos === 0) { pointsStyle = { backgroundColor: "#fee2e2", color: "#b91c1c" }; } else { const ratio = stats.puntos / maxPuntos; const hue = 45 + ratio * (142 - 45); pointsStyle = { backgroundColor: `hsl(${hue}, 80%, 85%)`, color: `hsl(${hue}, 90%, 25%)` }; }

                      return (
                        <tr key={idx} className="draft-row hover:bg-neutral-50 transition-colors h-6">
                          {draftVisibleCols.includes("Elección") && <td className="px-1 py-0.5 font-medium text-neutral-900 text-center">{getVal(row, "Elección")}</td>}
                          {draftVisibleCols.includes("Nombre_Equipo") && <td className="px-1 py-0.5 text-left min-w-0 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">{getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG")}</td>}
                          {draftVisibleCols.includes("Orden_Draft") && <td className="px-1 py-0.5 text-center">{getVal(row, "Orden_Draft")}</td>}
                          {draftVisibleCols.includes("Ronda") && <td className="px-1 py-0.5 text-center"><span className="inline-flex items-center justify-center bg-neutral-100 text-neutral-600 px-1 py-px rounded text-[9px] font-bold">{getVal(row, "Ronda")}</span></td>}
                          {draftVisibleCols.includes("Ciclista") && <td className="px-1 py-0.5 font-medium text-blue-600 text-[10px]">{ciclista}</td>}
                          {draftVisibleCols.includes("Edad") && <td className="px-1 py-0.5 text-center">{getVal(row, "Edad")}</td>}
                          {draftVisibleCols.includes("País") && <td className="px-1 py-0.5 text-center" title={getVal(row, "País")}><span className="text-xs">{getFlagEmoji(getVal(row, "País"))}</span></td>}
                          {draftVisibleCols.includes("Eq_Comp") && <td className="px-1 py-0.5 text-center text-neutral-500 min-w-0">{cyclistMetadata[ciclista]?.equipoBreve || getVal(row, "Eq_Comp")}</td>}
                          {draftVisibleCols.includes("Puntos") && <td className="px-1 py-0.5 text-center"><span className="inline-flex items-center justify-center px-1 py-0.5 rounded font-bold min-w-[2.5rem] tracking-tight text-[10px]" style={pointsStyle}>{stats.puntos}</span></td>}
                          {draftVisibleCols.includes("V") && <td className="px-1 py-0.5 text-center">{stats.victorias > 0 ? <span className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 px-1 py-px rounded text-[9px] font-bold tracking-tight">{stats.victorias}</span> : <span className="text-neutral-300">-</span>}</td>}
                          {draftVisibleCols.includes("C") && <td className={cn("px-1 py-0.5 text-center font-mono tabular-nums", (cyclistMetadata[ciclista]?.carrerasDisputadas || 0) === 0 ? "text-red-500" : cyclistMetadata[ciclista]?.carrerasDisputadas === minCarreras ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.carrerasDisputadas || 0}</td>}
                          {draftVisibleCols.includes("DC") && <td className={cn("px-1 py-0.5 text-center font-mono tabular-nums", (cyclistMetadata[ciclista]?.diasCompeticion || 0) === 0 ? "text-red-500" : cyclistMetadata[ciclista]?.diasCompeticion === minDc ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.diasCompeticion || 0}</td>}
                          {draftVisibleCols.includes("P/C") && <td className={cn("px-1 py-0.5 text-center font-mono tabular-nums", (cyclistMetadata[ciclista]?.carrerasDisputadas > 0 ? stats.puntos / cyclistMetadata[ciclista].carrerasDisputadas : 0) === 0 ? "text-red-500" : stats.puntos / cyclistMetadata[ciclista].carrerasDisputadas === minPpc ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.carrerasDisputadas > 0 ? (stats.puntos / cyclistMetadata[ciclista].carrerasDisputadas).toFixed(1) : "0.0"}</td>}
                          {draftVisibleCols.includes("P/D") && <td className={cn("px-1 py-0.5 text-center font-mono tabular-nums", (cyclistMetadata[ciclista]?.diasCompeticion > 0 ? stats.puntos / cyclistMetadata[ciclista].diasCompeticion : 0) === 0 ? "text-red-500" : stats.puntos / cyclistMetadata[ciclista].diasCompeticion === minPpd ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.diasCompeticion > 0 ? (stats.puntos / cyclistMetadata[ciclista].diasCompeticion).toFixed(1) : "0.0"}</td>}
                          {draftVisibleCols.includes("%") && <td className={cn("px-1 py-0.5 text-center font-mono tabular-nums", (() => { const eq = getVal(row, "Nombre_Equipo") || (getVal(row, "Nombre_TG") as string); const pct = eq && teamTotalPoints[eq] > 0 ? (stats.puntos / teamTotalPoints[eq]) * 100 : 0; if (pct === 0) return "text-red-500"; if (pct === minPct) return "text-orange-500 font-bold"; return ""; })())}>
                            {(() => { const eq = getVal(row, "Nombre_Equipo") || (getVal(row, "Nombre_TG") as string); const pct = eq && teamTotalPoints[eq] > 0 ? (stats.puntos / teamTotalPoints[eq]) * 100 : 0; return pct.toFixed(1) + "%"; })()}
                          </td>}
                        </tr>
                      );
                    })}
                    {rowVirtualizer.getVirtualItems().length > 0 && <tr><td style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }} colSpan={draftVisibleCols.length} /></tr>}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ReportCard>
  );
};
