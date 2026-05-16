import React from "react";
import { Users, X } from "lucide-react";
import { ExportToolbar } from "../../../ui/ExportToolbar";
import { Button } from "../../../ui/button";
import { cn } from "../../../../lib/utils";

export const RaceRetiredCyclists = ({
  retiredCyclists,
  isExpanded,
  setIsExpanded,
  onCopyImage,
  isCopying,
  onDownloadImage,
  tableRef,
}: any) => {
  if (!retiredCyclists || retiredCyclists.length === 0) return null;

  const maxRetiredPoints = Math.max(...retiredCyclists.map((c: any) => c.racePoints), 1);
  const getRetiredPointsColor = (points: number) => {
    if (points === 0) return { bg: '#fee2e2', text: '#991b1b' };
    if (maxRetiredPoints <= 1) return { bg: `hsl(30, 80%, 75%)`, text: "#000000" };
    const ratio = (points - 1) / (maxRetiredPoints - 1);
    const hue = 30 + ratio * 90;
    return { bg: `hsl(${hue}, 80%, 75%)`, text: "#000000" };
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-red-600" />
          Ciclistas Retirados
        </h3>
        <ExportToolbar
          isExpanded={isExpanded}
          onExpand={() => setIsExpanded(!isExpanded)}
          onCopyImage={onCopyImage}
          isImageCopying={isCopying}
          onDownloadImage={onDownloadImage}
        />
      </div>
      <div className="flex justify-center w-full">
        <div
          id="retired-cyclists-table"
          ref={tableRef}
          className={cn(
            "bg-white border border-neutral-200 rounded-xl overflow-hidden relative max-h-[75vh] shadow-sm w-full",
            isExpanded ? "fixed inset-4 z-50 max-h-none" : ""
          )}
        >
          {isExpanded && (
            <Button variant="outline"
              onClick={() => setIsExpanded(false)}
              className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
            >
              <X className="w-6 h-6" />
            </Button>
          )}
          <div className="table-responsive-wrapper overflow-auto w-full h-full">
            <table className="w-full min-w-[600px] text-sm text-left border-collapse mx-auto">
              <thead className="bg-[#1e293b] text-white border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-1.5 min-w-[140px]">Ciclista &lt;Ronda&gt;</th>
                  <th className="px-3 py-1.5 min-w-[140px]">Equipo [#Orden]</th>
                  <th className="px-3 py-1.5 text-center">Estado</th>
                  <th className="px-3 py-1.5 text-center">Ptos Temp.</th>
                  <th className="px-3 py-1.5 text-center">Ptos Carrera</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {retiredCyclists.map((c: any, idx: number) => {
                  const ptosColor = getRetiredPointsColor(typeof c.racePoints === 'number' ? c.racePoints : 0);
                  return (
                    <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-3 py-1.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900 leading-tight text-xs">
                            {c.ciclista}{" "}
                            <span className="text-neutral-400 font-normal">
                              &lt;{c.ronda}&gt;
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 pr-8">
                        <div className="flex flex-col">
                          <span className="text-neutral-700 font-medium leading-tight text-xs">
                            {c.equipo} [#{c.orden}]
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <span className="inline-flex items-center justify-center bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {c.status}
                        </span>
                        {c.etapa && <span className="text-[10px] text-neutral-500 ml-1">({c.etapa})</span>}
                      </td>
                      <td className="px-3 py-1.5 text-center font-mono font-bold text-neutral-600 text-xs">
                        {c.tempPoints}
                      </td>
                      <td 
                        className="px-3 py-1.5 text-center font-mono font-bold text-xs"
                        style={{ backgroundColor: ptosColor.bg, color: ptosColor.text }}
                      >
                        {c.racePoints}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
