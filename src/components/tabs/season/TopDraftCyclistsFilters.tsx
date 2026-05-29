import React from "react";
import { ChevronDown, User } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { ExportToolbar } from "../../ui/ExportToolbar";

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
    cyclistsNameSearch, setCyclistsNameSearch, setTopCyclistsLimit
  , leaderboard, files, cyclistsMonthFilter, setCyclistsMonthFilter } = props;

  const uniqueTeams = React.useMemo(() => {
    return Array.from(
      new Set(
        leaderboard?.filter((p: any) => p.jugador !== "No draft").map((p: any) => p.nombreEquipo) || []
      )
    ).filter(Boolean).sort((a: any, b: any) => (a as string).localeCompare(b as string));
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

          <div className="relative">
            <Button variant="outline" onClick={() => setIsCyclistsTeamFilterOpen(!isCyclistsTeamFilterOpen)} className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]">
              <span className="truncate">
                {cyclistsTeamFilter.length === 0 ? "Todos los equipos" : cyclistsTeamFilter.length + " equipos"}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isCyclistsTeamFilterOpen && "rotate-180")} />
            </Button>

            {isCyclistsTeamFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsCyclistsTeamFilterOpen(false)} />
                <div className="absolute right-0 mt-2 w-max max-w-[90vw] sm:max-w-xs bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Equipos</span>
                    {cyclistsTeamFilter.length > 0 && (
                      <Button variant="outline" onClick={() => setCyclistsTeamFilter([])} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Limpiar</Button>
                    )}
                  </div>
                  {uniqueTeams.map((team: any) => (
                    <label key={team} className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500" checked={cyclistsTeamFilter.includes(team)} onChange={(e) => {
                        if (e.target.checked) {
                          setCyclistsTeamFilter([...cyclistsTeamFilter, team]);
                        } else {
                          setCyclistsTeamFilter(cyclistsTeamFilter.filter((t: any) => t !== team));
                        }
                      }} />
                      <span className="ml-2 text-sm text-neutral-700 truncate">{team}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <Button variant="outline" onClick={() => setIsCyclistsCategoryFilterOpen(!isCyclistsCategoryFilterOpen)} className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[150px]">
              <span className="truncate">
                {cyclistsCategoryFilter.length === 0 ? "Todas las categorías" : cyclistsCategoryFilter.length + " categorías"}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isCyclistsCategoryFilterOpen && "rotate-180")} />
            </Button>

            {isCyclistsCategoryFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsCyclistsCategoryFilterOpen(false)} />
                <div className="absolute right-0 mt-2 w-max max-w-[90vw] sm:max-w-xs bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Categorías</span>
                    {cyclistsCategoryFilter.length > 0 && (
                      <Button variant="outline" onClick={() => setCyclistsCategoryFilter([])} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Limpiar</Button>
                    )}
                  </div>
                  {uniqueCategories.map((cat: any) => (
                    <label key={cat} className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500" checked={cyclistsCategoryFilter.includes(cat)} onChange={(e) => {
                        if (e.target.checked) {
                          setCyclistsCategoryFilter([...cyclistsCategoryFilter, cat]);
                        } else {
                          setCyclistsCategoryFilter(cyclistsCategoryFilter.filter((c: any) => c !== cat));
                        }
                      }} />
                      <span className="ml-2 text-sm text-neutral-700 truncate">{cat}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <Button variant="outline" onClick={() => setIsCyclistsRoundFilterOpen(!isCyclistsRoundFilterOpen)} className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]">
              <span className="truncate">
                {cyclistsRoundFilter.length === 0 ? "Todas las rondas" : cyclistsRoundFilter.length + " rondas"}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isCyclistsRoundFilterOpen && "rotate-180")} />
            </Button>

            {isCyclistsRoundFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsCyclistsRoundFilterOpen(false)} />
                <div className="absolute right-0 mt-2 w-max max-w-[90vw] sm:max-w-xs bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Rondas</span>
                    {cyclistsRoundFilter.length > 0 && (
                      <Button variant="outline" onClick={() => setCyclistsRoundFilter([])} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Limpiar</Button>
                    )}
                  </div>
                  {uniqueRounds.map((ronda: any) => (
                    <label key={ronda} className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500" checked={cyclistsRoundFilter.includes(ronda)} onChange={(e) => {
                        if (e.target.checked) {
                          setCyclistsRoundFilter([...cyclistsRoundFilter, ronda]);
                        } else {
                          setCyclistsRoundFilter(cyclistsRoundFilter.filter((r: any) => r !== ronda));
                        }
                      }} />
                      <span className="ml-2 text-sm text-neutral-700">Ronda {ronda}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <select value={cyclistsMonthFilter} onChange={(e) => setCyclistsMonthFilter(e.target.value)} className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
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