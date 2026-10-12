import React, { useState, useMemo } from "react";
import { cn } from "../../../lib/utils";
import { User, ChevronDown, X } from "lucide-react";
import { Button } from "../../ui/button";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { MultiSelectDropdown } from "../../ui/MultiSelectDropdown";
import { EvolutionDateFilter } from "./EvolutionDateFilter";

interface NoDraftFiltersProps {
  monthFilter: string;
  setMonthFilter: (val: string) => void;
  raceFilter?: string;
  setRaceFilter?: (val: string) => void;
  categoryFilter?: string[];
  setCategoryFilter?: (val: string[]) => void;
  minVictorias?: string; setMinVictorias?: (val: string) => void;
  minCarreras?: string; setMinCarreras?: (val: string) => void;
  minDias?: string; setMinDias?: (val: string) => void;
  minPpc?: string; setMinPpc?: (val: string) => void;
  minPpd?: string; setMinPpd?: (val: string) => void;
  minPuntos?: string; setMinPuntos?: (val: string) => void;
  topLimit: number;
  setTopLimit: (val: number) => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  isCopying: string | boolean;
  isTextCopying: boolean;
  handleCopy: (mode?: string) => void;
  handleCopyText: () => void;
  handleDownload: (mode?: string) => void;
  allStatsCount: number;
  files?: any;
  getVal?: any;
}

export function NoDraftFilters({
  monthFilter,
  setMonthFilter,
  raceFilter,
  setRaceFilter,
  categoryFilter = [],
  setCategoryFilter,
  minVictorias, setMinVictorias,
  minCarreras, setMinCarreras,
  minDias, setMinDias,
  minPpc, setMinPpc,
  minPpd, setMinPpd,
  minPuntos, setMinPuntos,
  topLimit,
  setTopLimit,
  isExpanded,
  setIsExpanded,
  isCopying,
  isTextCopying,
  handleCopy,
  handleCopyText,
  handleDownload,
  allStatsCount,
  files,
  getVal
}: NoDraftFiltersProps) {
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [isValueFiltersOpen, setIsValueFiltersOpen] = useState(false);

  const uniqueRaces = useMemo(() => {
    if (!files?.carreras?.data || !getVal) return [];
    return Array.from(
      new Set(
        files?.carreras?.data?.map((r: any) => getVal(r, "Carrera"))?.map((c: any) => c?.trim())?.filter(Boolean) as string[]
      )
    ).sort((a: string, b: string) => a.localeCompare(b));
  }, [files?.carreras?.data, getVal]);

  const uniqueCategories = useMemo(() => {
    if (!files?.carreras?.data || !getVal) return [];
    return Array.from(
      new Set(
        files?.carreras?.data?.map((r: any) => getVal(r, "Categoría"))?.map((c: any) => c?.trim())?.filter(Boolean) as string[]
      )
    ).sort((a: string, b: string) => a.localeCompare(b));
  }, [files?.carreras?.data, getVal]);

  const hasActiveValueFilters = Boolean(minVictorias || minCarreras || minDias || minPpc || minPpd || minPuntos);

  const pages = Math.ceil(allStatsCount / 50);

  return (
    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
        <User className="w-5 h-5 text-red-600" />
        Top Ciclistas No Elegidos (No draft)
      </h3>
      <p className="text-xs text-neutral-500 whitespace-nowrap">
        Corredores que han sumado puntos pero no fueron elegidos por ningún equipo.
      </p>

      <div className="flex flex-wrap items-center gap-3 mt-1">
        <div className="flex flex-wrap items-center gap-1.5 border-r border-neutral-200 pr-3 copy-button-ignore shrink-0">
          <ExportToolbar
            filename="top-ciclistas-no-draft"
            isExpanded={isExpanded}
            onExpand={() => setIsExpanded(!isExpanded)}
            onCopyImage={(range) => handleCopy(range || "full")}
            isImageCopying={isCopying}
            onDownloadImage={(range) => handleDownload(range || "full")}
            onCopyText={handleCopyText}
            isTextCopying={isTextCopying}
            textCopyLabel="Texto"
            useClipboardIconForText={true}
            numBlocks={allStatsCount > 50 ? pages : undefined}
          />
        </div>

        {/* Race Filter */}
        {setRaceFilter && (
          <div className="relative">
            <select
              value={raceFilter || "all"}
              onChange={(e) => setRaceFilter(e.target.value)}
              className="appearance-none pr-8 pl-3 py-1.5 h-8 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-w-[200px] truncate cursor-pointer hover:border-neutral-300 transition-colors"
            >
              <option value="all">Todas las carreras</option>
              {uniqueRaces.map((race) => (
                <option key={race} value={race}>
                  {race}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Category Filter Dropdown */}
        {setCategoryFilter && (
          <div className="min-w-[150px]">
            <MultiSelectDropdown
              allItems={uniqueCategories}
              selectedItems={categoryFilter}
              onChange={setCategoryFilter}
              placeholderAll="Todas las categorías"
              placeholderNone="Ninguna categoría"
              unitLabelSingular="categoría"
              unitLabelPlural="categorías"
              allCountLabel="Todas"
              className="min-w-[150px]"
            />
          </div>
        )}

        {/* Value Filters Popover */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsValueFiltersOpen(!isValueFiltersOpen)}
            className={cn(
              "flex items-center justify-between gap-2 px-3 py-1.5 h-8 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]",
              hasActiveValueFilters && "border-blue-500 bg-blue-50/50 text-blue-700 font-medium"
            )}
          >
            <span className="truncate">
              {hasActiveValueFilters ? "Valores (filtrados)" : "Filtros de valor"}
            </span>
            <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isValueFiltersOpen && "rotate-180")} />
          </Button>

          {isValueFiltersOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsValueFiltersOpen(false)} />
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] z-50 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-2 sm:pb-1 mb-1">
                  <span className="font-bold text-neutral-700 uppercase tracking-wider text-[11px] sm:text-[10px]">Valores mínimos (≥)</span>
                  <div className="flex items-center gap-2">
                    {hasActiveValueFilters && (
                      <button
                        onClick={() => {
                          setMinVictorias?.("");
                          setMinCarreras?.("");
                          setMinDias?.("");
                          setMinPpc?.("");
                          setMinPpd?.("");
                          setMinPuntos?.("");
                        }}
                        className="text-xs sm:text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer px-1 py-0.5 rounded hover:bg-blue-50"
                      >
                        Limpiar
                      </button>
                    )}
                    <button
                      onClick={() => setIsValueFiltersOpen(false)}
                      className="sm:hidden text-neutral-400 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100"
                      aria-label="Cerrar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-2">
                  <div>
                    <label className="block text-[11px] sm:text-[10px] text-neutral-500 font-semibold mb-0.5">Victorias</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ej. 1"
                      value={minVictorias || ""}
                      onChange={(e) => setMinVictorias?.(e.target.value)}
                      className="w-full px-2.5 sm:px-2 py-1.5 sm:py-1 border border-neutral-200 rounded-lg sm:rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-[10px] text-neutral-500 font-semibold mb-0.5">Carreras</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ej. 2"
                      value={minCarreras || ""}
                      onChange={(e) => setMinCarreras?.(e.target.value)}
                      className="w-full px-2.5 sm:px-2 py-1.5 sm:py-1 border border-neutral-200 rounded-lg sm:rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-[10px] text-neutral-500 font-semibold mb-0.5">Días</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ej. 5"
                      value={minDias || ""}
                      onChange={(e) => setMinDias?.(e.target.value)}
                      className="w-full px-2.5 sm:px-2 py-1.5 sm:py-1 border border-neutral-200 rounded-lg sm:rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-[10px] text-neutral-500 font-semibold mb-0.5">P/C</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Ej. 10.0"
                      value={minPpc || ""}
                      onChange={(e) => setMinPpc?.(e.target.value)}
                      className="w-full px-2.5 sm:px-2 py-1.5 sm:py-1 border border-neutral-200 rounded-lg sm:rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-[10px] text-neutral-500 font-semibold mb-0.5">P/D</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Ej. 5.0"
                      value={minPpd || ""}
                      onChange={(e) => setMinPpd?.(e.target.value)}
                      className="w-full px-2.5 sm:px-2 py-1.5 sm:py-1 border border-neutral-200 rounded-lg sm:rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-[10px] text-neutral-500 font-semibold mb-0.5">Puntos</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ej. 50"
                      value={minPuntos || ""}
                      onChange={(e) => setMinPuntos?.(e.target.value)}
                      className="w-full px-2.5 sm:px-2 py-1.5 sm:py-1 border border-neutral-200 rounded-lg sm:rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="sm:hidden pt-2 border-t border-neutral-100">
                  <Button
                    size="sm"
                    onClick={() => setIsValueFiltersOpen(false)}
                    className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <EvolutionDateFilter
            value={monthFilter}
            onChange={setMonthFilter}
          />
        </div>

        <div className="flex bg-neutral-100 p-1 rounded-lg">
          {[25, 50, 100, 9999].map((limit) => (
            <Button
              variant="outline"
              key={limit}
              onClick={() => setTopLimit(limit)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                Math.max(0, Number(topLimit) || 25) === limit
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {limit === 9999 ? "Todos" : `Top ${limit}`}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
