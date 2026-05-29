import React from "react";
import { cn } from "../../../lib/utils";
import { User, Maximize2, Minimize2, CheckCircle2, Camera, FileText, CloudDownload } from "lucide-react";
import { Button } from "../../ui/button";
import { ExportToolbar } from "../../ui/ExportToolbar";

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

      <div className="flex flex-wrap gap-3 mt-1">
        <div className="flex flex-wrap items-center gap-1.5 border-r border-neutral-200 pr-3 copy-button-ignore shrink-0">
          <ExportToolbar
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
