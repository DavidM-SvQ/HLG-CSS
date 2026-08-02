import React, { useState, useMemo } from "react";
import { cn } from "../../../lib/utils";
import { User, ChevronDown } from "lucide-react";
import { Button } from "../../ui/button";
import { ExportToolbar } from "../../ui/ExportToolbar";

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
          <select
            value={raceFilter || "all"}
            onChange={(e) => setRaceFilter(e.target.value)}
            className="px-3 py-1.5 h-8 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 max-w-[200px] truncate cursor-pointer"
          >
            <option value="all">Todas las carreras</option>
            {uniqueRaces.map((race) => (
              <option key={race} value={race}>
                {race}
              </option>
            ))}
          </select>
        )}

        {/* Category Filter Dropdown */}
        {setCategoryFilter && (
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
              className="flex items-center justify-between gap-2 px-3 py-1.5 h-8 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[150px]"
            >
              <span className="truncate">
                {categoryFilter.length === 0 ? "Todas las categorías" : `${categoryFilter.length} categorías`}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isCategoryFilterOpen && "rotate-180")} />
            </Button>

            {isCategoryFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsCategoryFilterOpen(false)} />
                <div className="absolute right-0 mt-2 w-max max-w-[90vw] sm:max-w-xs bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Categorías</span>
                    {categoryFilter.length > 0 && (
                      <Button variant="outline" onClick={() => setCategoryFilter([])} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Limpiar</Button>
                    )}
                  </div>
                  {uniqueCategories.map((cat: string) => (
                    <label key={cat} className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                        checked={categoryFilter.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCategoryFilter([...categoryFilter, cat]);
                          } else {
                            setCategoryFilter(categoryFilter.filter((c) => c !== cat));
                          }
                        }}
                      />
                      <span className="ml-2 text-sm text-neutral-700 truncate">{cat}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
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
              <div className="fixed inset-0 z-10" onClick={() => setIsValueFiltersOpen(false)} />
              <div className="absolute right-0 mt-2 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-1 mb-2">
                  <span className="font-bold text-neutral-700 uppercase tracking-wider text-[10px]">Valores mínimos (≥)</span>
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
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">Victorias</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ej. 1"
                      value={minVictorias || ""}
                      onChange={(e) => setMinVictorias?.(e.target.value)}
                      className="w-full px-2 py-1 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">Carreras</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ej. 2"
                      value={minCarreras || ""}
                      onChange={(e) => setMinCarreras?.(e.target.value)}
                      className="w-full px-2 py-1 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">Días</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ej. 5"
                      value={minDias || ""}
                      onChange={(e) => setMinDias?.(e.target.value)}
                      className="w-full px-2 py-1 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">P/C</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Ej. 10.0"
                      value={minPpc || ""}
                      onChange={(e) => setMinPpc?.(e.target.value)}
                      className="w-full px-2 py-1 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">P/D</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Ej. 5.0"
                      value={minPpd || ""}
                      onChange={(e) => setMinPpd?.(e.target.value)}
                      className="w-full px-2 py-1 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">Puntos</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ej. 50"
                      value={minPuntos || ""}
                      onChange={(e) => setMinPuntos?.(e.target.value)}
                      className="w-full px-2 py-1 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="px-3 py-1.5 h-8 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">Todos los meses</option>
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
