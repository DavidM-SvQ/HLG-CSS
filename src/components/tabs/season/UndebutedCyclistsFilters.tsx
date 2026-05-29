import React from "react";
import { ChevronDown, UserMinus } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { ExportToolbar } from "../../ui/ExportToolbar";

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
          <ExportToolbar
            isExpanded={isUndebutedExpanded}
            onExpand={() => setIsUndebutedExpanded(!isUndebutedExpanded)}
            onCopyImage={(range) => handleCopyUndebuted(range || "full")}
            isImageCopying={isUndebutedCopying}
            onDownloadImage={(range) => handleDownloadUndebuted(range || "full")}
            onCopyText={handleCopyUndebutedText}
            isTextCopying={isUndebutedTextCopying}
            textCopyLabel="Texto"
            useClipboardIconForText={true}
            numBlocks={numBlocks}
          />
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
