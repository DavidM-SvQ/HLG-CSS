import React from "react";
import { Maximize2, Minimize2, Copy, CheckCircle2, FileText, Download, UserMinus, ChevronDown } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

export function UndebutedCyclistsFilters({
  isUndebutedExpanded, setIsUndebutedExpanded,
  handleCopyUndebuted, isUndebutedCopying,
  handleCopyUndebutedText, isUndebutedTextCopying,
  handleDownloadUndebuted,
  isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen,
  undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter,
  cyclistRoundMap,
  undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter,
  leaderboard,
  undebutedCount,
  numBlocks,
}: any) {
  return (
    <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
        <UserMinus className="w-5 h-5 text-neutral-400" />
        Ciclistas sin debutar ({undebutedCount})
      </h3>
      <p className="text-xs text-neutral-500 whitespace-nowrap">
        Corredores elegidos en el draft que aún no han disputado ninguna carrera (días = 0).
      </p>
      <div className="flex flex-wrap gap-3 mt-1">
        <div className="flex flex-wrap items-center gap-1.5 border-r border-neutral-200 pr-3 copy-button-ignore shrink-0">
          <Button variant="outline" onClick={() => setIsUndebutedExpanded(!isUndebutedExpanded)}
            className="w-8 h-8 p-0 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
            title={isUndebutedExpanded ? "Contraer tabla" : "Expandir tabla"}>
            {isUndebutedExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button variant="outline" onClick={() => handleCopyUndebuted("full")} disabled={!!isUndebutedCopying} title="Copiar imagen"
            className={cn("p-0 h-8 font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
              isUndebutedCopying === "full" ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
              isUndebutedCopying && isUndebutedCopying !== "full" && "opacity-50 cursor-not-allowed")}>
            {isUndebutedCopying === "full" ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>

          {numBlocks > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
              {Array.from({ length: numBlocks }).map((_, i) => {
                const s = "p" + (i + 1);
                const isCopyingThis = isUndebutedCopying === s;
                return (
                  <Button variant="outline" key={s} onClick={() => handleCopyUndebuted(s)} disabled={!!isUndebutedCopying}
                    className={cn("px-2.5 h-8 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                      isCopyingThis ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
                      isUndebutedCopying && !isCopyingThis && "opacity-50 cursor-not-allowed")}>
                    {isCopyingThis ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {i * 50 + 1}-{(i + 1) * 50}
                  </Button>
                );
              })}
            </div>
          )}

          <Button variant="ghost" onClick={handleCopyUndebutedText} disabled={isUndebutedTextCopying} title="Copiar texto"
            className={cn("px-3 h-8 w-auto text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
              isUndebutedTextCopying ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50")}>
            {isUndebutedTextCopying ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <FileText className="w-4 h-4 mr-1.5" />} Texto
          </Button>
          <Button variant="outline" onClick={() => handleDownloadUndebuted("full")} title="Descargar imagen"
            className="p-0 h-8 bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8">
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative">
          <Button variant="outline" onClick={() => setIsUndebutedRoundFilterOpen(!isUndebutedRoundFilterOpen)}
            className={cn("flex items-center gap-2 px-3 py-2 text-sm border rounded-md shadow-sm transition-all",
              undebutedCyclistsRoundFilter.length > 0 ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50")}>
            {undebutedCyclistsRoundFilter.length === 0 ? "Todas las rondas" : `${undebutedCyclistsRoundFilter.length} ${undebutedCyclistsRoundFilter.length === 1 ? "ronda" : "rondas"}`}
            <ChevronDown className={cn("w-4 h-4 transition-transform", isUndebutedRoundFilterOpen && "rotate-180")} />
          </Button>

          {isUndebutedRoundFilterOpen && (
            <>
              <div className="fixed inset-0 z-[40]" onClick={() => setIsUndebutedRoundFilterOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-[50] py-1 max-h-64 overflow-y-auto">
                <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Filtrar por ronda</span>
                  {undebutedCyclistsRoundFilter.length > 0 && (
                    <Button variant="outline" onClick={() => setUndebutedCyclistsRoundFilter([])} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium border-x-0 border-y-0 border-transparent shadow-none bg-transparent">
                      Limpiar
                    </Button>
                  )}
                </div>
                {Array.from(new Set(Object.values(cyclistRoundMap) as string[])).filter(Boolean).sort((a, b) => a.localeCompare(b)).map((ronda) => (
                  <label key={ronda} className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      checked={undebutedCyclistsRoundFilter.includes(ronda)}
                      onChange={(e) => {
                        if (e.target.checked) setUndebutedCyclistsRoundFilter([...undebutedCyclistsRoundFilter, ronda]);
                        else setUndebutedCyclistsRoundFilter(undebutedCyclistsRoundFilter.filter((r: string) => r !== ronda));
                      }} />
                    <span className="ml-2 text-sm text-neutral-700">Ronda {ronda}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <select value={undebutedCyclistsTeamFilter} onChange={(e) => setUndebutedCyclistsTeamFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <option value="all">Todos los equipos</option>
          {leaderboard?.map((p: any) => (
            <option key={p.nombreEquipo} value={p.nombreEquipo}>{p.nombreEquipo}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
