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
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 opacity-20 text-[10px]">↕</span>;
    }
    return sortConfig.direction === "asc" ? (
      <span className="ml-1 text-[10px] text-blue-400">↑</span>
    ) : (
      <span className="ml-1 text-[10px] text-blue-400">↓</span>
    );
  };

  const sortedRetiredCyclists = React.useMemo(() => {
    if (!retiredCyclists) return [];
    if (!sortConfig) return retiredCyclists;

    const list = [...retiredCyclists];
    list.sort((a, b) => {
      let aVal: any;
      let bVal: any;
      if (sortConfig.key === "ciclista") {
        aVal = a.ciclista || "";
        bVal = b.ciclista || "";
      } else if (sortConfig.key === "equipo") {
        aVal = a.equipo || "";
        bVal = b.equipo || "";
      } else if (sortConfig.key === "status") {
        aVal = a.status || "";
        bVal = b.status || "";
      } else if (sortConfig.key === "tempPoints") {
        aVal = a.tempPoints || 0;
        bVal = b.tempPoints || 0;
      } else if (sortConfig.key === "racePoints") {
        aVal = a.racePoints || 0;
        bVal = b.racePoints || 0;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === "asc"
        ? (aVal < bVal ? -1 : 1)
        : (aVal > bVal ? -1 : 1);
    });
    return list;
  }, [retiredCyclists, sortConfig]);

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
              <thead className="bg-[#1e293b] text-white border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10 select-none">
                <tr>
                  <th 
                    className="px-4 py-3 min-w-[140px] cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("ciclista")}
                  >
                    Ciclista &lt;Ronda&gt; {getSortIcon("ciclista")}
                  </th>
                  <th 
                    className="px-4 py-3 min-w-[140px] cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("equipo")}
                  >
                    Equipo [#Orden] {getSortIcon("equipo")}
                  </th>
                  <th 
                    className="px-4 py-3 text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("status")}
                  >
                    Estado {getSortIcon("status")}
                  </th>
                  <th 
                    className="px-4 py-3 text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("tempPoints")}
                  >
                    Ptos Temp. {getSortIcon("tempPoints")}
                  </th>
                  <th 
                    className="px-4 py-3 text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("racePoints")}
                  >
                    Ptos Carrera {getSortIcon("racePoints")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {(!sortedRetiredCyclists || sortedRetiredCyclists.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 font-medium text-sm">
                      No hay abandonos en esta carrera
                    </td>
                  </tr>
                )}
                {sortedRetiredCyclists && sortedRetiredCyclists.map((c: any, idx: number) => {
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
