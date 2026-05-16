import React from "react";
import {
  Copy,
  Maximize2,
  Minimize2,
  UploadCloud,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

export function StartlistPointsTable(props: any) {
  const getVal = (p: any, key: string) => {
    return p[key] ?? 0;
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
        <div className="mt-8 border-t border-neutral-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Puntuaciones ({raceCategory})
            </h3>
            <div className="flex items-center gap-2 copy-button-ignore">
              <ExportToolbar
                isExpanded={isPointsExpanded}
                onExpand={() => setIsPointsExpanded(!isPointsExpanded)}
                onCopyText={handleCopyPoints}
                isTextCopying={isPointsTextCopying}
                onCopyImage={handleCopyPointsImage}
                isImageCopying={isPointsImageCopying}
                imagePageCount={pointsPagination.totalPages}
                onDownloadImage={handleDownloadPointsImage}
              />
            </div>
          </div>
          <div
            ref={pointsTableRef}
            className={cn(
              "bg-white flex flex-col",
              isPointsExpanded
                ? "fixed inset-8 z-[100] p-6 shadow-2xl rounded-2xl overflow-y-auto border border-neutral-200"
                : "overflow-x-auto rounded-xl border border-neutral-200 shadow-sm",
            )}
          >
            {isPointsExpanded && (
              <div className="flex items-center justify-between mb-6 copy-button-ignore">
                <h3 className="text-xl font-bold text-neutral-900">
                  Puntuaciones ({raceCategory})
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setIsPointsExpanded(false)}
                  className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors"
                  title="Contraer"
                >
                  <Minimize2 className="w-5 h-5" />
                </Button>
              </div>
            )}
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
                      <td className="px-4 py-2 text-center text-neutral-700 font-medium font-mono text-[11px]">
                        {getVal(p, "Posición")}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-blue-600">
                        {getVal(p, "Puntos")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
