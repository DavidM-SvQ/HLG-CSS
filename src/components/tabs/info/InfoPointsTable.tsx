import React from "react";
import { ChevronUp, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { getVal } from "../../../lib/data-processing";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { ReportCard } from "../../ui/ReportCard";

export function InfoPointsTable({
  setInfoSubTab,
  pointsTableRef,
  isPointsExpanded,
  setIsPointsExpanded,
  handleCopyPoints,
  isPointsTextCopying,
  handleCopyPointsImage,
  isPointsImageCopying,
  handleDownloadPointsImage,
  localRaceSearch,
  setLocalRaceSearch,
  pointsCategoryFilter,
  setPointsCategoryFilter,
  files,
  memoizedPointsData
}: any) {
  return (
    <ReportCard
      title={
        <div className="flex items-center gap-3">
          <Button variant="outline"
            onClick={() => setInfoSubTab("menu")}
            className="text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <ChevronUp className="w-5 h-5 -rotate-90" />
          </Button>
          Detalle de puntos
        </div>
      }
      filename="detalle-puntos"
      ref={pointsTableRef}
      toolbarProps={{
        isExpanded: isPointsExpanded,
        onExpand: () => setIsPointsExpanded(!isPointsExpanded),
        onCopyText: handleCopyPoints,
        isTextCopying: isPointsTextCopying,
        onCopyImage: handleCopyPointsImage,
        isImageCopying: isPointsImageCopying,
        onDownloadImage: handleDownloadPointsImage
      }}
      headerExtra={
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="text"
            placeholder="Buscar carrera..."
            value={localRaceSearch}
            onChange={(e) => setLocalRaceSearch(e.target.value)}
            className="w-48 bg-white border-neutral-300 focus-visible:ring-blue-500 rounded-lg"
          />
          <Select
            value={pointsCategoryFilter}
            onValueChange={(value) =>
              setPointsCategoryFilter(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-48 bg-white border-neutral-300 focus:ring-blue-500 rounded-lg">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {[
                ...new Set(
                  files?.puntos?.data?.map((r: any) => getVal(r, "Categoría")?.trim()),
                ),
              ]
                .filter(Boolean)
                .map((c) => (
                  <SelectItem key={c as string} value={c as string}>
                    {c as string}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div
        className={cn(
          "relative bg-white flex flex-col",
          isPointsExpanded
            ? "h-auto"
            : "h-[600px]",
        )}
      >
        {isPointsExpanded && (
          <Button variant="outline"
            onClick={() => setIsPointsExpanded(false)}
            className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
          >
            <X className="w-6 h-6" />
          </Button>
        )}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="table-responsive-wrapper min-h-[300px] overflow-auto w-full md:px-0 px-2 pt-2 h-full pb-4 max-w-full">
            <table className="w-full text-sm text-left bg-transparent md:bg-white rounded-xl shadow-sm md:shadow-none md:rounded-lg block md:table border-collapse">
              <thead className="text-xs text-neutral-500 uppercase border-b border-neutral-100 sticky top-0 z-10 shadow-sm hidden md:table-header-group bg-neutral-50 opacity-100">
                <tr className="bg-neutral-50">
                  <th className="px-6 py-3 bg-neutral-50 z-20">Categoría</th>
                  <th className="px-6 py-3 bg-neutral-50 z-20">Tipo</th>
                  <th className="px-6 py-3 bg-neutral-50 z-20">Posición</th>
                  <th className="px-6 py-3 bg-neutral-50 z-20 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody className="bg-transparent md:bg-white md:divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group">
                {memoizedPointsData.map((r: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-neutral-50 transition-colors text-[11px] md:divide-x divide-neutral-100 flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none min-h-[44px]"
                  >
                    <td className="px-4 py-3 md:py-2.5 font-medium text-neutral-900 flex justify-between items-center md:table-cell gap-2 rounded-t-xl md:rounded-none bg-neutral-50/50 md:bg-transparent">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Categoría</span>
                      <div className="text-right md:text-left text-neutral-900">{getVal(r, "Categoría")}</div>
                    </td>
                    <td className="px-4 py-3 md:py-2.5 text-neutral-600 flex justify-between items-center md:table-cell gap-2">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Tipo</span>
                      <div className="text-right md:text-left text-neutral-600">{getVal(r, "Tipo")}</div>
                    </td>
                    <td className="px-4 py-3 md:py-2.5 text-neutral-600 flex justify-between items-center md:table-cell gap-2 border-t border-neutral-100 md:border-none">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Posición</span>
                      <div className="text-right md:text-left text-neutral-600">{getVal(r, "Posición")}</div>
                    </td>
                    <td className="px-4 py-3 md:py-2.5 text-right font-bold text-blue-600 flex justify-between items-center md:table-cell gap-2 border-t border-neutral-100 md:border-none rounded-b-xl md:rounded-none bg-blue-50/30 md:bg-transparent">
                      <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Puntos</span>
                      <div className="text-right">{getVal(r, "Puntos")}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ReportCard>
  );
}
