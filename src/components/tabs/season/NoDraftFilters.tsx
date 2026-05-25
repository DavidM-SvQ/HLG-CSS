import React from "react";
import { cn } from "../../../lib/utils";
import { User, Maximize2, Minimize2, CheckCircle2, Copy, FileText, Download } from "lucide-react";
import { Button } from "../../ui/button";

interface NoDraftFiltersProps {
  monthFilter: string;
  setMonthFilter: (val: string) => void;
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
}

export function NoDraftFilters({
  monthFilter,
  setMonthFilter,
  topLimit,
  setTopLimit,
  isExpanded,
  setIsExpanded,
  isCopying,
  isTextCopying,
  handleCopy,
  handleCopyText,
  handleDownload,
  allStatsCount
}: NoDraftFiltersProps) {
  
  const [isBlocksOpen, setIsBlocksOpen] = React.useState(false);
  const blocksRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blocksRef.current && !blocksRef.current.contains(event.target as Node)) {
        setIsBlocksOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderPartialCopyButtons = () => {
    if (allStatsCount <= 50) return null;
    
    const pages = Math.ceil(allStatsCount / 50);
    return (
      <div className="relative flex items-center ml-1" ref={blocksRef}>
        <Button
          variant="outline"
          className="rounded-md border border-neutral-200 shadow-sm px-2 py-1.5 h-auto bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors flex items-center gap-1.5 text-xs"
          onClick={() => setIsBlocksOpen(!isBlocksOpen)}
          disabled={!!isCopying}
          title="Copiar por bloques"
        >
          <span>Partes</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-3.5 h-3.5 transition-transform", isBlocksOpen && "rotate-180")}><path d="m6 9 6 6 6-6"/></svg>
        </Button>
        
        {isBlocksOpen && (
          <div className="absolute top-full right-0 lg:left-0 lg:right-auto mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-1.5 border-b border-neutral-100 mb-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Copiar Partes</span>
            </div>
            <div className="max-h-60 overflow-y-auto w-full flex flex-col">
              {Array.from({ length: pages }).map((_, i) => {
                const s = "p" + (i + 1);
                const isCopyingThis = isCopying === s;
                const start = i * 50 + 1;
                const end = Math.min((i + 1) * 50, allStatsCount);
                return (
                  <button
                    key={s}
                    onClick={() => {
                      setIsBlocksOpen(false);
                      handleCopy(s);
                    }}
                    disabled={!!isCopying}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between",
                      isCopyingThis ? "bg-green-50 text-green-700" : "hover:bg-neutral-50 text-neutral-700",
                      isCopying && !isCopyingThis && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="font-mono">Rango {start}-{end}</span>
                    {isCopyingThis && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
        <User className="w-5 h-5 text-red-600" />
        Top Ciclistas No Elegidos (No draft)
      </h3>
      <p className="text-xs text-neutral-500 whitespace-nowrap">
        Corredores que han sumado puntos pero no fueron elegidos por ningún equipo.
      </p>

      <div className="flex flex-wrap gap-3 mt-1">
        <div className="flex flex-wrap items-center gap-1.5 border-r border-neutral-200 pr-3 copy-button-ignore">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
            title={isExpanded ? "Contraer tabla" : "Expandir tabla"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleCopy("full")}
            disabled={!!isCopying}
            title="Copiar imagen"
            className={cn(
              "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
              isCopying === "full" ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
              isCopying && isCopying !== "full" && "opacity-50 cursor-not-allowed"
            )}
          >
            {isCopying === "full" ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>

          {renderPartialCopyButtons()}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyText}
            disabled={isTextCopying}
            title="Copiar texto"
            className={cn(
              "px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
              isTextCopying
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            )}
          >
            {isTextCopying ? (
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
            ) : (
              <FileText className="w-4 h-4 mr-1.5" />
            )}
            Texto
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleDownload("full")}
            title="Descargar imagen"
            className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="px-3 py-1.5 h-8 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                topLimit === limit
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
