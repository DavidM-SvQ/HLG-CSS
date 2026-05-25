import React from "react";
import { Copy, Maximize2, UploadCloud, ChevronDown, CheckCircle2, ClipboardList, Search, X, User } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

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
          <div className="copy-button-ignore flex flex-wrap items-center gap-2 pr-3 border-r border-neutral-200">
            <Button variant="outline" onClick={() => setIsTopCyclistsDraftExpanded(true)} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm" title="Ampliar tabla">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => handleCopyTopCyclistsDraft("full")} disabled={!!isTopCyclistsDraftCopying} className={cn("flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm border", isTopCyclistsDraftCopying === "full" ? "bg-green-50 text-green-600 border-green-200" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100")} title="Copiar tabla completa como imagen">
              {isTopCyclistsDraftCopying === "full" ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            {topCyclistsLimit > 50 && (
              <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
                {Array.from({ length: Math.ceil((topCyclistsLimit === 9999 ? 500 : topCyclistsLimit) / 50) }).map((_, i) => {
                  const s = "p" + (i + 1);
                  const start = i * 50 + 1;
                  const end = (i + 1) * 50;
                  const label = start + "-" + end;
                  const isCopyingThis = isTopCyclistsDraftCopying === s;
                  return (
                    <Button variant="outline" key={s} onClick={() => handleCopyTopCyclistsDraft(s as any)} disabled={!!isTopCyclistsDraftCopying} className={cn("px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900", isCopyingThis ? "bg-green-50 text-green-700 border-green-200" : "bg-white", isTopCyclistsDraftCopying && !isCopyingThis && "opacity-50 cursor-not-allowed")}>
                      {isCopyingThis ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {label}
                    </Button>
                  );
                })}
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={handleCopyTopCyclistsDraftText} disabled={isTopCyclistsDraftTextCopying} className={cn("px-3 h-8 text-sm font-medium rounded-lg border shadow-sm flex items-center justify-center transition-all", isTopCyclistsDraftTextCopying ? "bg-green-50 text-green-600 border-green-200" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100")} title="Copiar texto de la tabla">
              {isTopCyclistsDraftTextCopying ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <ClipboardList className="w-4 h-4 mr-1.5" />}
              Texto
            </Button>
            <Button variant="outline" onClick={() => handleDownloadTopCyclistsDraft("full")} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm" title="Descargar tabla completa como imagen">
              <UploadCloud className="w-4 h-4 rotate-180" />
            </Button>
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
            <Button variant="outline" onClick={() => setTopCyclistsLimit(25)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", topCyclistsLimit === 25 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}>Top 25</Button>
            <Button variant="outline" onClick={() => setTopCyclistsLimit(50)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", topCyclistsLimit === 50 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}>Top 50</Button>
            <Button variant="outline" onClick={() => setTopCyclistsLimit(100)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", topCyclistsLimit === 100 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}>Top 100</Button>
            <Button variant="outline" onClick={() => setTopCyclistsLimit(9999)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", topCyclistsLimit === 9999 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}>Todos</Button>
          </div>
        </div>
      </div>
    </>
  );
}