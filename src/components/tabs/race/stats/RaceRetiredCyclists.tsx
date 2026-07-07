import React from "react";
import { Users, X } from "lucide-react";
import { ReportCard } from "../../../ui/ReportCard";
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
  // Always render the table so it's visible even when empty
  // if (!retiredCyclists || retiredCyclists.length === 0) return null;

  const maxRetiredPoints = retiredCyclists && retiredCyclists.length > 0 ? Math.max(...retiredCyclists.map((c: any) => c.racePoints), 1) : 1;
  const getRetiredPointsColor = (points: number) => {
    if (points === 0) return { bg: '#fee2e2', text: '#991b1b' };
    if (maxRetiredPoints <= 1) return { bg: `hsl(30, 80%, 75%)`, text: "#000000" };
    const ratio = (points - 1) / (maxRetiredPoints - 1);
    const hue = 30 + ratio * 90;
    return { bg: `hsl(${hue}, 80%, 75%)`, text: "#000000" };
  };

  return (
    <ReportCard
      title="Ciclistas Retirados"
      icon={<Users />}
      iconClassName="text-red-600"
      filename="ciclistas-retirados"
      ref={tableRef}
      className="mt-12"
      toolbarProps={{
        isExpanded: isExpanded,
        onExpand: () => setIsExpanded(!isExpanded),
        onCopyImage: onCopyImage,
        isImageCopying: isCopying,
        onDownloadImage: onDownloadImage
      }}
      bodyClassName="p-0 border-t border-neutral-100"
    >
      <div className="flex justify-center w-full bg-neutral-50/30">
        <div
          id="retired-cyclists-table"
          className={cn(
            "overflow-hidden relative max-h-[75vh] w-full",
            isExpanded ? "max-h-none" : ""
          )}
        >
          <div className="table-responsive-wrapper min-h-[300px] overflow-auto w-full h-full crosshair-container">
            <table className="w-full min-w-[600px] text-sm text-left border-collapse mx-auto">
              <thead className="bg-[#1e293b] text-white border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 min-w-[140px]">Ciclista &lt;Ronda&gt;</th>
                  <th className="px-4 py-3 min-w-[140px]">Equipo [#Orden]</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Ptos Temp.</th>
                  <th className="px-4 py-3 text-center">Ptos Carrera</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {(!retiredCyclists || retiredCyclists.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 font-medium text-sm">
                      No hay abandonos en esta carrera
                    </td>
                  </tr>
                )}
                {retiredCyclists && retiredCyclists.map((c: any, idx: number) => {
                  const ptosColor = getRetiredPointsColor(typeof c.racePoints === 'number' ? c.racePoints : 0);
                  return (
                    <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900 leading-tight text-xs">
                            {c.ciclista}{" "}
                            <span className="text-neutral-400 font-normal">
                              &lt;{c.ronda}&gt;
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 pr-8">
                        <div className="flex flex-col">
                          <span className="text-neutral-700 font-medium leading-tight text-xs">
                            {c.equipo} [<span className="font-mono tabular-nums opacity-60">#{c.orden}</span>]
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {c.status}
                        </span>
                        {c.etapa && <span className="text-[10px] text-neutral-500 ml-1">({c.etapa})</span>}
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums font-bold text-neutral-600 text-xs">
                        {c.tempPoints}
                      </td>
                      <td 
                        className="px-3 py-1.5 text-center font-mono tabular-nums font-bold text-xs"
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
    </ReportCard>
  );
};
