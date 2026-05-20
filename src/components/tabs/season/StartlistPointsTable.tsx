import React from "react";
import {
  Copy,
  Maximize2,
  Minimize2,
  UploadCloud,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { ReportCard } from "../../ui/ReportCard";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

export function StartlistPointsTable(props: any) {
  const getVal = (p: any, key: string) => {
    return p ? p[key] ?? 0 : 0;
  };
  const {
    racePoints,
    raceCategory,
    isPointsExpanded,
    setIsPointsExpanded,
    handleCopyPoints,
    isPointsTextCopying,
    handleCopyPointsImage,
    isPointsImageCopying,
    pointsPagination,
    handleDownloadPointsImage,
    pointsTableRef,
  } = props;

  return (
    <>
      {racePoints.length > 0 && (
        <ReportCard
          title={`Puntuaciones (${raceCategory})`}
          titleClassName="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          filename={`puntuaciones-${raceCategory}`}
          ref={pointsTableRef}
          className="mt-8"
          toolbarProps={{
            isExpanded: isPointsExpanded,
            onExpand: () => setIsPointsExpanded(!isPointsExpanded),
            onCopyText: handleCopyPoints,
            isTextCopying: isPointsTextCopying,
            onCopyImage: handleCopyPointsImage,
            isImageCopying: isPointsImageCopying,
            imagePageCount: pointsPagination.totalPages,
            onDownloadImage: handleDownloadPointsImage
          }}
          bodyClassName="p-0 border-t border-neutral-100"
        >
          <div
            className={cn(
              "bg-white flex flex-col",
              isPointsExpanded
                ? "max-h-none"
                : "overflow-x-auto",
            )}
          >
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase sticky top-0 z-10 bg-neutral-50 shadow-[0_1px_0_0_#e5e5e5]">
                <tr>
                  <th className="px-4 py-3 font-semibold w-1/4">Tipo</th>
                  <th className="px-4 py-3 font-semibold text-center w-1/4">
                    Posición
                  </th>
                  <th className="px-4 py-3 font-semibold text-right w-1/4">
                    Puntos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {racePoints.map((p: any, idx: number) => {
                  const page = pointsPagination.pages[idx];
                  let isHiddenVisual = false;
                  if (isPointsImageCopying) {
                    if (
                      isPointsImageCopying !== "full" &&
                      isPointsImageCopying !== `p${page}`
                    ) {
                      isHiddenVisual = true;
                    }
                  }
                  return (
                    <tr
                      key={idx}
                      className={cn(
                        "hover:bg-blue-50/50 transition-colors",
                        isHiddenVisual && "hidden",
                      )}
                    >
                      <td className="px-4 py-2 bg-neutral-50/30">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-600">
                          {getVal(p, "Tipo")}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center text-neutral-700 font-medium font-mono tabular-nums text-[11px]">
                        {getVal(p, "Posición")}
                      </td>
                      <td className="px-4 py-2 text-right font-mono tabular-nums font-bold text-blue-600">
                        {getVal(p, "Puntos")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ReportCard>
      )}
    </>
  );
}
