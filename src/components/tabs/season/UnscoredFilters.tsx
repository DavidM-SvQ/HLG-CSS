import { PlayerScore } from '../../../lib/types';
import React from "react";
import { cn } from "../../../lib/utils";
import { UserMinus, Maximize2, Minimize2, CheckCircle2, Copy, FileText, Download, ChevronDown } from "lucide-react";
import { Button } from "../../ui/button";

interface UnscoredFiltersProps {
  unscoredCount: number;
  unscoredCyclistsTeamFilter: string;
  setUnscoredCyclistsTeamFilter: (val: string) => void;
  unscoredCyclistsRoundFilter: string[];
  setUnscoredCyclistsRoundFilter: (val: string[]) => void;
  isUnscoredRoundFilterOpen: boolean;
  setIsUnscoredRoundFilterOpen: (val: boolean) => void;
  isUnscoredExpanded: boolean;
  setIsUnscoredExpanded: (val: boolean) => void;
  isUnscoredCopying: string | boolean;
  isUnscoredTextCopying: boolean;
  handleCopyUnscored: (mode?: string) => void;
  handleCopyUnscoredText: () => void;
  handleDownloadUnscored: (mode?: string) => void;
  leaderboard: PlayerScore[];
  cyclistRoundMap: Record<string, string>;
}

export function UnscoredFilters({
  unscoredCount,
  unscoredCyclistsTeamFilter,
  setUnscoredCyclistsTeamFilter,
  unscoredCyclistsRoundFilter,
  setUnscoredCyclistsRoundFilter,
  isUnscoredRoundFilterOpen,
  setIsUnscoredRoundFilterOpen,
  isUnscoredExpanded,
  setIsUnscoredExpanded,
  isUnscoredCopying,
  isUnscoredTextCopying,
  handleCopyUnscored,
  handleCopyUnscoredText,
  handleDownloadUnscored,
  leaderboard,
  cyclistRoundMap
}: UnscoredFiltersProps) {

  const renderPartialCopyButtons = () => {
    if (unscoredCount <= 50) return null;

    const pages = Math.ceil(unscoredCount / 50);
    return (
      <div className="flex items-center gap-1.5 px-2 border-l border-neutral-200 ml-1">
        {Array.from({ length: pages }).map((_, i) => {
          const s = "p" + (i + 1);
          const isCopyingThis = isUnscoredCopying === s;
          const start = i * 50 + 1;
          const end = (i + 1) * 50;
          return (
            <Button
              variant="outline"
              key={s}
              onClick={() => handleCopyUnscored(s)}
              disabled={!!isUnscoredCopying}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                isCopyingThis
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-white",
                isUnscoredCopying && !isCopyingThis && "opacity-50 cursor-not-allowed"
              )}
            >
              {isCopyingThis ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {start}-{end > unscoredCount ? unscoredCount : end}
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
        <UserMinus className="w-5 h-5 text-neutral-400" />
        Ciclistas sin puntuar ({unscoredCount})
      </h3>
      <p className="text-xs text-neutral-500 whitespace-nowrap">
        Corredores elegidos en el draft que aún no han sumado puntos.
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-1">
        <div className="flex flex-wrap items-center gap-1.5 pr-3 border-r border-neutral-200 copy-button-ignore">
          <Button
            variant="outline"
            onClick={() => setIsUnscoredExpanded(!isUnscoredExpanded)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
            title={isUnscoredExpanded ? "Contraer tabla" : "Expandir tabla"}
          >
            {isUnscoredExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleCopyUnscored("full")}
            disabled={!!isUnscoredCopying}
            title="Copiar imagen"
            className={cn(
              "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
              isUnscoredCopying === "full" ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
              isUnscoredCopying && isUnscoredCopying !== "full" && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUnscoredCopying === "full" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>

          {renderPartialCopyButtons()}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyUnscoredText}
            disabled={isUnscoredTextCopying}
            title="Copiar texto"
            className={cn(
              "px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
              isUnscoredTextCopying
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            )}
          >
            {isUnscoredTextCopying ? (
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
            ) : (
              <FileText className="w-4 h-4 mr-1.5" />
            )}
            Texto
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleDownloadUnscored("full")}
            title="Descargar imagen"
            className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Round Multi-select Filter */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsUnscoredRoundFilterOpen(!isUnscoredRoundFilterOpen)}
            className="flex items-center justify-between gap-2 px-3 py-2 h-8 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
          >
            <span className="truncate">
              {unscoredCyclistsRoundFilter.length === 0
                ? "Todas las rondas"
                : `${unscoredCyclistsRoundFilter.length} rondas`}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-neutral-400 transition-transform",
                isUnscoredRoundFilterOpen && "rotate-180"
              )}
            />
          </Button>

          {isUnscoredRoundFilterOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsUnscoredRoundFilterOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 py-2 max-h-64 overflow-y-auto">
                <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">
                    Rondas
                  </span>
                  {unscoredCyclistsRoundFilter.length > 0 && (
                    <Button
                      variant="ghost"
                      onClick={() => setUnscoredCyclistsRoundFilter([])}
                      className="h-auto p-0 text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
                {Array.from(new Set(Object.values(cyclistRoundMap) as string[]))
                  .filter(Boolean)
                  .sort((a, b) => a.localeCompare(b))
                  .map((ronda) => (
                    <label
                      key={ronda}
                      className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                        checked={unscoredCyclistsRoundFilter.includes(ronda)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUnscoredCyclistsRoundFilter([...unscoredCyclistsRoundFilter, ronda]);
                          } else {
                            setUnscoredCyclistsRoundFilter(
                              unscoredCyclistsRoundFilter.filter((r) => r !== ronda)
                            );
                          }
                        }}
                      />
                      <span className="ml-2 text-sm text-neutral-700">
                        Ronda {ronda}
                      </span>
                    </label>
                  ))}
              </div>
            </>
          )}
        </div>

        <select
          value={unscoredCyclistsTeamFilter}
          onChange={(e) => setUnscoredCyclistsTeamFilter(e.target.value)}
          className="px-3 py-2 h-8 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">Todos los equipos</option>
          {leaderboard?.map((p) => (
            <option key={p.nombreEquipo} value={p.nombreEquipo}>
              {p.nombreEquipo}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
