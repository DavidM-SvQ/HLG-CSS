import React from "react";
import { ChevronDown, User, X } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { MultiSelectDropdown } from "../../ui/MultiSelectDropdown";
import { EvolutionDateFilter } from "./EvolutionDateFilter";

export function TopDraftCyclistsFilters(props: any) {
  const {
    isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded,
    handleCopyTopCyclistsDraft, isTopCyclistsDraftCopying,
    topCyclistsLimit, handleCopyTopCyclistsDraftText, isTopCyclistsDraftTextCopying,
    handleDownloadTopCyclistsDraft, isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen,
    cyclistsTeamFilter, setCyclistsTeamFilter, playerTeamMap, getVal,
    isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen,
    cyclistsCategoryFilter, setCyclistsCategoryFilter, allCategories,
    isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen,
    cyclistsRoundFilter, setCyclistsRoundFilter, cyclistsRoundMap,
    cyclistsRaceFilter, setCyclistsRaceFilter,
    cyclistsMinVictorias, setCyclistsMinVictorias,
    cyclistsMinCarreras, setCyclistsMinCarreras,
    cyclistsMinDias, setCyclistsMinDias,
    cyclistsMinPpc, setCyclistsMinPpc,
    cyclistsMinPpd, setCyclistsMinPpd,
    cyclistsMinPuntos, setCyclistsMinPuntos,
    cyclistsNameSearch, setCyclistsNameSearch, setTopCyclistsLimit
  , leaderboard, files, cyclistsMonthFilter, setCyclistsMonthFilter } = props;

  const [isValueFiltersOpen, setIsValueFiltersOpen] = React.useState(false);

  const uniqueTeams = React.useMemo(() => {
    return (Array.from(
      new Set(
        leaderboard?.filter((p: any) => p.jugador !== "No draft").map((p: any) => p.nombreEquipo) || []
      )
    ).filter(Boolean) as string[]).sort((a: string, b: string) => a.localeCompare(b));
  }, [leaderboard]);

  const uniqueCategories = React.useMemo(() => {
    return Array.from(
      new Set(
        files?.carreras?.data?.map((r: any) => getVal(r, "Categoría")).map((c: any) => c?.trim()).filter(Boolean) as string[]
      )
    ).sort((a: string, b: string) => a.localeCompare(b));
  }, [files?.carreras?.data, getVal]);

  const uniqueRounds = React.useMemo(() => {
    return Array.from(
      new Set(
        Object.values(cyclistsRoundMap || {}) as string[]
      )
    ).filter(Boolean).sort((a: string, b: string) => a.localeCompare(b));
  }, [cyclistsRoundMap]);

  const uniqueRaces = React.useMemo(() => {
    return Array.from(
      new Set(
        files?.carreras?.data?.map((r: any) => getVal(r, "Carrera"))?.map((c: any) => c?.trim())?.filter(Boolean) as string[]
      )
    ).sort((a: string, b: string) => a.localeCompare(b));
  }, [files?.carreras?.data, getVal]);

  const hasActiveValueFilters = Boolean(cyclistsMinVictorias || cyclistsMinCarreras || cyclistsMinDias || cyclistsMinPpc || cyclistsMinPpd || cyclistsMinPuntos);

  const limit = Math.max(0, Number(topCyclistsLimit) || 25);
  const count = limit === 9999 ? (leaderboard?.length || 0) : limit;
  const pages = Math.ceil(count / 50);
  const numBlocks = limit > 50 && pages > 1 ? pages : undefined;

  return (
    <>
      <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
          <User className="w-5 h-5 text-orange-600" />
          Top Ciclistas por Puntuación
        </h3>
        <p className="text-xs text-neutral-500 whitespace-nowrap">
          Ranking individual de todos los corredores con puntos.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-1">
          <div className="copy-button-ignore pr-3 border-r border-neutral-200 shrink-0">
            <ExportToolbar
              filename="top-ciclistas"
              isExpanded={isTopCyclistsDraftExpanded}
              onExpand={() => setIsTopCyclistsDraftExpanded(!isTopCyclistsDraftExpanded)}
              onCopyImage={(range) => handleCopyTopCyclistsDraft(range || "full")}
              isImageCopying={isTopCyclistsDraftCopying}
              onDownloadImage={(range) => handleDownloadTopCyclistsDraft(range || "full")}
              onCopyText={handleCopyTopCyclistsDraftText}
              isTextCopying={isTopCyclistsDraftTextCopying}
              textCopyLabel="Texto"
              useClipboardIconForText={true}
              numBlocks={numBlocks}
            />
          </div>

          {/* Race Filter */}
          <div className="relative">
            <select
              value={cyclistsRaceFilter || "all"}
              onChange={(e) => setCyclistsRaceFilter(e.target.value)}
              className="appearance-none pr-8 pl-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-w-[200px] truncate cursor-pointer hover:border-neutral-300 transition-colors"
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

          {/* Team Filter */}
          <div className="min-w-[150px]">
            <MultiSelectDropdown
              allItems={uniqueTeams}
              selectedItems={cyclistsTeamFilter}
              onChange={setCyclistsTeamFilter}
              placeholderAll="Todos los equipos"
              placeholderNone="Ningún equipo"
              unitLabelSingular="equipo"
              unitLabelPlural="equipos"
              allCountLabel="Todos"
              className="min-w-[150px]"
            />
          </div>

          <div className="min-w-[150px]">
            <MultiSelectDropdown
              allItems={uniqueCategories}
              selectedItems={cyclistsCategoryFilter}
              onChange={setCyclistsCategoryFilter}
              placeholderAll="Todas las categorías"
              placeholderNone="Ninguna categoría"
              unitLabelSingular="categoría"
              unitLabelPlural="categorías"
              allCountLabel="Todas"
              className="min-w-[150px]"
            />
          </div>

          {/* Round Filter */}
          <div className="min-w-[140px]">
            <MultiSelectDropdown
              allItems={uniqueRounds}
              selectedItems={cyclistsRoundFilter}
              onChange={setCyclistsRoundFilter}
              placeholderAll="Todas las rondas"
              placeholderNone="Ninguna ronda"
              unitLabelSingular="ronda"
              unitLabelPlural="rondas"
              allCountLabel="Todas"
              formatItemLabel={(r) => (r.toLowerCase().startsWith("ronda") ? r : `Ronda ${r}`)}
              className="min-w-[140px]"
            />
          </div>

          {/* Value Filters Popover */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsValueFiltersOpen(!isValueFiltersOpen)}
              className={cn(
                "flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]",
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
                            setCyclistsMinVictorias("");
                            setCyclistsMinCarreras("");
                            setCyclistsMinDias("");
                            setCyclistsMinPpc("");
                            setCyclistsMinPpd("");
                            setCyclistsMinPuntos("");
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
                        value={cyclistsMinVictorias || ""}
                        onChange={(e) => setCyclistsMinVictorias(e.target.value)}
                        className="w-full px-2.5 sm:px-2 py-1.5 sm:py-1 border border-neutral-200 rounded-lg sm:rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-[10px] text-neutral-500 font-semibold mb-0.5">Carreras</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej. 2"
                        value={cyclistsMinCarreras || ""}
                        onChange={(e) => setCyclistsMinCarreras(e.target.value)}
                        className="w-full px-2.5 sm:px-2 py-1.5 sm:py-1 border border-neutral-200 rounded-lg sm:rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-[10px] text-neutral-500 font-semibold mb-0.5">Días</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej. 5"
                        value={cyclistsMinDias || ""}
                        onChange={(e) => setCyclistsMinDias(e.target.value)}
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
                        value={cyclistsMinPpc || ""}
                        onChange={(e) => setCyclistsMinPpc(e.target.value)}
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
                        value={cyclistsMinPpd || ""}
                        onChange={(e) => setCyclistsMinPpd(e.target.value)}
                        className="w-full px-2.5 sm:px-2 py-1.5 sm:py-1 border border-neutral-200 rounded-lg sm:rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-[10px] text-neutral-500 font-semibold mb-0.5">Puntos</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej. 50"
                        value={cyclistsMinPuntos || ""}
                        onChange={(e) => setCyclistsMinPuntos(e.target.value)}
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
              value={cyclistsMonthFilter}
              onChange={setCyclistsMonthFilter}
            />
          </div>

          <div className="flex bg-neutral-100 p-1 rounded-lg">
            <Button variant="outline" onClick={() => setTopCyclistsLimit(25)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", (Number(topCyclistsLimit) || 25) === 25 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}>Top 25</Button>
            <Button variant="outline" onClick={() => setTopCyclistsLimit(50)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", Number(topCyclistsLimit) === 50 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}>Top 50</Button>
            <Button variant="outline" onClick={() => setTopCyclistsLimit(100)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", Number(topCyclistsLimit) === 100 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}>Top 100</Button>
            <Button variant="outline" onClick={() => setTopCyclistsLimit(9999)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", Number(topCyclistsLimit) === 9999 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}>Todos</Button>
          </div>
        </div>
      </div>
    </>
  );
}