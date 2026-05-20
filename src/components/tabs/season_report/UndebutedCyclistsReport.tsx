import React, { useState, useRef, useMemo } from "react";
import { useUrlState } from "../../../hooks/useUrlState";
import { UserX, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../../lib/utils";
import { copyImageToClipboard, copyTextToClipboard } from "../../../lib/clipboard";
import { flushSync } from "react-dom";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { Button } from "../../ui/button";
import { ReportCard } from "../../ui/ReportCard";

interface UndebutedCyclistsReportProps {
  files: any;
  leaderboard: any[] | null;
  cyclistRoundMap: Record<string, string>;
  cyclistMetadata: Record<string, any>;
  playerOrderMap: Record<string, string>;
  getVal: (row: any, key: string) => string;
  expandNodeForCapture: (element: HTMLElement) => () => void;
}

export const UndebutedCyclistsReport: React.FC<UndebutedCyclistsReportProps> = ({
  files,
  leaderboard,
  cyclistRoundMap,
  cyclistMetadata,
  playerOrderMap,
  getVal,
  expandNodeForCapture
}) => {
  const undebutedTableRef = useRef<HTMLDivElement>(null);
  const { handleCopyImage: copyUndebutedImage, handleDownloadImage: downloadUndebutedImage, isCopying: isUndebutedTableCopyingState } = useTableScreenshot(undebutedTableRef);
  
  const [undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn] = useUrlState<string>("undebutedSort", "jugador");
  const [undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection] = useUrlState<"asc" | "desc">("undebutedDir", "asc");
  const [isUndebutedExpanded, setIsUndebutedExpanded] = useState(false);
  const [isUndebutedCopying, setIsUndebutedCopying] = useState<string | null>(null);
  const [isUndebutedTextCopying, setIsUndebutedTextCopying] = useState(false);
  
  const [undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter] = useUrlState<string>("undebutedTeam", "all");
  const [undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter] = useUrlState<string[]>("undebutedRounds", []);
  const [isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen] = useState(false);

  const undebutedList = useMemo(() => {
    return files.elecciones.data?.map((row: any) => {
      const ciclista = getVal(row, "Ciclista")?.trim();
      if (!ciclista) return null;
      const meta = cyclistMetadata[ciclista];
      if (meta && meta.diasCompeticion > 0) return null;
      const jugador = getVal(row, "Nombre_TG")?.trim();
      const nombreEquipo = getVal(row, "Nombre_Equipo")?.trim();
      const orden = playerOrderMap[jugador] || "";
      const ronda = cyclistRoundMap[ciclista] || "";
      return { ciclista, jugador, nombreEquipo, orden, ronda };
    }).filter(Boolean) as any[] || [];
  }, [files, cyclistRoundMap, cyclistMetadata, playerOrderMap, getVal]);

  const filtered = useMemo(() => {
    const data = undebutedList.filter((c) => {
      const teamMatch = undebutedCyclistsTeamFilter === "all" || c.nombreEquipo === undebutedCyclistsTeamFilter;
      const roundMatch = undebutedCyclistsRoundFilter.length === 0 || undebutedCyclistsRoundFilter.includes(c.ronda);
      return teamMatch && roundMatch;
    });

    data.sort((a, b) => {
      let valA: any, valB: any;
      switch (undebutedCyclistsSortColumn) {
        case "jugador": valA = a.nombreEquipo; valB = b.nombreEquipo; break;
        case "ciclista": valA = a.ciclista; valB = b.ciclista; break;
        case "ronda": valA = a.ronda; valB = b.ronda; break;
      }
      if (typeof valA === "string" && typeof valB === "string") return undebutedCyclistsSortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      if (valA < valB) return undebutedCyclistsSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return undebutedCyclistsSortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [undebutedList, undebutedCyclistsTeamFilter, undebutedCyclistsRoundFilter, undebutedCyclistsSortColumn, undebutedCyclistsSortDirection]);

  const countFiltered = filtered.length;

  const handleCopyUndebutedText = async () => {
    if (!undebutedTableRef.current || isUndebutedTextCopying) return;
    setIsUndebutedTextCopying(true);
    const table = undebutedTableRef.current.querySelector("table");
    if (!table) {
      setIsUndebutedTextCopying(false);
      return;
    }
    const rows = Array.from(table.rows);
    const text = rows.map((row: any) => Array.from(row.cells).map((cell: any) => cell.innerText.trim()).join("\t")).join("\n");
    await copyTextToClipboard(text, 'export.txt');
    setTimeout(() => setIsUndebutedTextCopying(false), 2000);
  };

  const prepareTableForCopy = (container: HTMLElement, subset?: string) => {
    if (subset && subset !== "full") {
      const pageNum = parseInt(subset.slice(1));
      const startIdx = (pageNum - 1) * 50;
      const endIdx = startIdx + 50;
      
      const rows = container.querySelectorAll("tbody tr");
      rows.forEach((row, i) => {
        if (i < startIdx || i >= endIdx) {
          row.classList.add("hidden");
        } else {
          row.classList.remove("hidden");
        }
      });
    } else {
      const rows = container.querySelectorAll("tbody tr");
      rows.forEach((row) => row.classList.remove("hidden"));
    }
  };

  const handleCopyUndebuted = async (subset?: "full" | string) => {
    if (isUndebutedCopying) return;
    flushSync(() => { setIsUndebutedCopying(subset || "full"); });
    try {
      await copyUndebutedImage({
        fileName: "export.png",
        scale: 3,
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        backgroundColor: "#ffffff",
        onBeforeCapture: (el: HTMLElement) => prepareTableForCopy(el, subset),
      });
    } finally {
      setIsUndebutedCopying(null);
    }
  };

  const handleDownloadUndebuted = async (subset?: "full" | string) => {
    const suffix = subset && subset !== "full" ? `-${subset}` : "";
    await downloadUndebutedImage({
      fileName: `ciclistas-sin-debutar${suffix}.png`,
      scale: 3,
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      backgroundColor: "#ffffff",
      onBeforeCapture: (el: HTMLElement) => prepareTableForCopy(el, subset),
    });
  };

  return (
    <ReportCard
      title={`Ciclistas sin debutar (${countFiltered})`}
      subtitle="Corredores arrastrados desde el draft que no han competido todavía este año."
      icon={<UserX />}
      iconClassName="text-neutral-400"
      filename="ciclistas-sin-debutar"
      ref={undebutedTableRef}
      className="mt-8"
      toolbarProps={{
        isExpanded: isUndebutedExpanded,
        onExpand: () => setIsUndebutedExpanded(!isUndebutedExpanded),
        onCopyText: handleCopyUndebutedText,
        isTextCopying: isUndebutedTextCopying,
        onCopyImage: handleCopyUndebuted,
        isImageCopying: isUndebutedCopying,
        imagePageCount: Math.ceil(countFiltered / 50),
        onDownloadImage: handleDownloadUndebuted,
        customFilters: (
          <div className="flex flex-wrap items-center gap-1.5 ml-1 pt-1 sm:pt-0">
            <div className="relative">
              <Button variant="outline"
                onClick={() => setIsUndebutedRoundFilterOpen(!isUndebutedRoundFilterOpen)}
                className="flex items-center justify-between gap-2 px-3 h-8 text-[11px] font-semibold bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[120px] copy-button-ignore text-neutral-600"
              >
                <span className="truncate">
                  {undebutedCyclistsRoundFilter.length === 0
                    ? "Todas las rondas"
                    : `${undebutedCyclistsRoundFilter.length} rondas`}
                </span>
                <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-400 transition-transform", isUndebutedRoundFilterOpen && "rotate-180")} />
              </Button>
              {isUndebutedRoundFilterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUndebutedRoundFilterOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 py-2 max-h-64 overflow-y-auto">
                    <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Rondas</span>
                      {undebutedCyclistsRoundFilter.length > 0 && <Button variant="ghost" size="sm" onClick={() => setUndebutedCyclistsRoundFilter([])} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Limpiar</Button>}
                    </div>
                    {Array.from(new Set(Object.values(cyclistRoundMap) as string[])).filter(Boolean).sort((a, b) => a.localeCompare(b)).map((ronda) => (
                      <label key={ronda} className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                          checked={undebutedCyclistsRoundFilter.includes(ronda)}
                          onChange={(e) => {
                            if (e.target.checked) setUndebutedCyclistsRoundFilter([...undebutedCyclistsRoundFilter, ronda,]);
                            else setUndebutedCyclistsRoundFilter(undebutedCyclistsRoundFilter.filter((r) => r !== ronda));
                          }}
                        />
                        <span className="ml-2 text-sm text-neutral-700">Ronda {ronda}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            <select
              value={undebutedCyclistsTeamFilter}
              onChange={(e) => setUndebutedCyclistsTeamFilter(e.target.value)}
              className="px-3 h-8 text-[11px] font-semibold bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 copy-button-ignore text-neutral-600"
            >
              <option value="all">Todos los equipos</option>
              {leaderboard?.map((p) => (
                <option key={p.nombreEquipo} value={p.nombreEquipo}>{p.nombreEquipo}</option>
              ))}
            </select>
          </div>
        )
      }}
      bodyClassName="p-0 border-t border-neutral-100"
    >
      <div
        className={cn("overflow-x-auto overflow-y-auto bg-white scrollbar-thin rounded-b-xl", isUndebutedExpanded ? "max-h-none" : "h-[800px]")}
      >
        <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container md:px-0 px-2 pt-2">
          <table className="w-full text-xs text-left bg-transparent md:bg-white rounded-xl shadow-sm md:shadow-none md:rounded-lg block md:table border-collapse">
            <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100 hidden md:table-header-group">
              <tr className="divide-x divide-neutral-100">
                <th
                  className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                  onClick={() => {
                    if (undebutedCyclistsSortColumn === "jugador") setUndebutedCyclistsSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                    else { setUndebutedCyclistsSortColumn("jugador"); setUndebutedCyclistsSortDirection("asc"); }
                  }}
                >
                  <div className="flex items-center gap-1"> Jugador {undebutedCyclistsSortColumn === "jugador" && (undebutedCyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)} </div>
                </th>
                <th
                  className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                  onClick={() => {
                    if (undebutedCyclistsSortColumn === "ciclista") setUndebutedCyclistsSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                    else { setUndebutedCyclistsSortColumn("ciclista"); setUndebutedCyclistsSortDirection("asc"); }
                  }}
                >
                  <div className="flex items-center gap-1"> Ciclista {undebutedCyclistsSortColumn === "ciclista" && (undebutedCyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)} </div>
                </th>
                <th
                  className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                  onClick={() => {
                    if (undebutedCyclistsSortColumn === "ronda") setUndebutedCyclistsSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                    else { setUndebutedCyclistsSortColumn("ronda"); setUndebutedCyclistsSortDirection("asc");}
                  }}
                >
                  <div className="flex items-center gap-1 justify-center text-center"> Ronda {undebutedCyclistsSortColumn === "ronda" && (undebutedCyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)} </div>
                </th>
              </tr>
            </thead>
            <tbody className="md:divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group">
              {(() => {
                if (filtered.length === 0) return <tr className="block md:table-row"><td colSpan={3} className="px-6 py-10 text-center text-neutral-400 italic text-[11px] block md:table-cell w-full">No hay ciclistas sin debutar que coincidan con los criterios.</td></tr>;

                return filtered.map((c, idx) => {
                  let isHiddenVisual = false;
                  if (isUndebutedCopying) {
                    if (isUndebutedCopying === "full") isHiddenVisual = false;
                    else {
                      const pageNum = parseInt(isUndebutedCopying.substring(1));
                      const start = (pageNum - 1) * 50;
                      const end = start + 50;
                      isHiddenVisual = !(idx >= start && idx < end);
                    }
                  }

                  if (isHiddenVisual && isUndebutedCopying) return null;

                  return (
                    <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] md:divide-x divide-neutral-100 flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 group/row">
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell gap-2 rounded-t-xl md:rounded-none bg-neutral-50/50 md:bg-transparent">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Jugador</span>
                        <div className="text-right md:text-left text-neutral-600 font-medium"> {c.nombreEquipo} <span className="text-neutral-400 font-normal text-[9px]"> [#{c.orden}]</span> </div>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell gap-2">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ciclista</span>
                        <div className="font-bold text-red-700 text-right md:text-left text-[12px] md:text-[11px]"> {c.ciclista} </div>
                      </td>
                      <td className={cn("px-4 py-3 md:py-1 flex justify-between items-center md:table-cell text-center font-mono tabular-nums rounded-b-xl md:rounded-none", ["01", "02", "03", "1", "2", "3"].includes(c.ronda) ? "bg-yellow-50 text-yellow-700 font-bold" : "text-neutral-500 bg-neutral-50 md:bg-transparent border-t border-neutral-100 md:border-none")}>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ronda</span>
                        <div className="text-right md:text-center text-[13px] md:text-[11px]"> {c.ronda} </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </ReportCard>
  );
};