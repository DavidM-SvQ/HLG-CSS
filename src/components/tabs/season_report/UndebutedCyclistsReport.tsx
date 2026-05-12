import React, { useState, useRef, useMemo } from "react";
import { UserX, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { domToDataUrl } from "modern-screenshot";
import { copyImageToClipboard, copyTextToClipboard } from "../../../lib/clipboard";
import { flushSync } from "react-dom";

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
  
  const [undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn] = useState<string>("jugador");
  const [undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection] = useState<"asc" | "desc">("asc");
  const [isUndebutedExpanded, setIsUndebutedExpanded] = useState(false);
  const [isUndebutedCopying, setIsUndebutedCopying] = useState<string | null>(null);
  const [isUndebutedTextCopying, setIsUndebutedTextCopying] = useState(false);
  
  const [undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter] = useState<string>("all");
  const [undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter] = useState<string[]>([]);
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

  const handleCopyUndebuted = async (subset?: "full" | string) => {
    if (!undebutedTableRef.current || isUndebutedCopying) return;
    flushSync(() => { setIsUndebutedCopying(subset || "full"); });
    const tableContainer = undebutedTableRef.current;
    const restore = expandNodeForCapture(tableContainer);

    try {
      const processCopy = async () => {
        const dataUrl = await domToDataUrl(tableContainer, { scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),  backgroundColor: "#ffffff" });
        const response = await fetch(dataUrl);
        return await response.blob();
      };
      await copyImageToClipboard(processCopy(), "export.png");
      setTimeout(() => setIsUndebutedCopying(null), 2000);
    } catch (err) {
      console.warn("Error during copy fallback", err);
    } finally {
      restore();
    }
  };

  const handleDownloadUndebuted = async (subset?: "full" | string) => {
    if (!undebutedTableRef.current) return;
    const tableContainer = undebutedTableRef.current;
    const restore = expandNodeForCapture(tableContainer);
    try {
      const dataUrl = await domToDataUrl(tableContainer, { scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),  backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.href = dataUrl;
      const suffix = subset && subset !== "full" ? `-${subset}` : "";
      link.download = `ciclistas-sin-debutar${suffix}.png`;
      link.click();
    } catch (err) {
    } finally {
      restore();
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-8">
      <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <UserX className="w-5 h-5 text-neutral-400" />
          Ciclistas sin debutar ({countFiltered})
        </h3>
        <p className="text-xs text-neutral-500 ">
          Corredores arrastrados desde el draft que no han competido todavía
          este año.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <ExportToolbar 
            isExpanded={isUndebutedExpanded}
            onExpand={() => setIsUndebutedExpanded(!isUndebutedExpanded)}
            
            onCopyText={handleCopyUndebutedText}
            isTextCopying={isUndebutedTextCopying}
            
            onCopyImage={(range) => handleCopyUndebuted(range)}
            isImageCopying={isUndebutedCopying}
            imagePageCount={Math.ceil(countFiltered / 50)}
            
            onDownloadImage={(range) => handleDownloadUndebuted(range)}
          />

          <div className="relative">
            <button
              onClick={() => setIsUndebutedRoundFilterOpen(!isUndebutedRoundFilterOpen)}
              className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
            >
              <span className="truncate">
                {undebutedCyclistsRoundFilter.length === 0
                  ? "Todas las rondas"
                  : `${undebutedCyclistsRoundFilter.length} rondas`}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isUndebutedRoundFilterOpen && "rotate-180")} />
            </button>
            {isUndebutedRoundFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsUndebutedRoundFilterOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 py-2 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Rondas</span>
                    {undebutedCyclistsRoundFilter.length > 0 && <button onClick={() => setUndebutedCyclistsRoundFilter([])} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Limpiar</button>}
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
            className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Todos los equipos</option>
            {leaderboard?.map((p) => (
              <option key={p.nombreEquipo} value={p.nombreEquipo}>{p.nombreEquipo}</option>
            ))}
          </select>
        </div>
      </div>
      <div
        ref={undebutedTableRef}
        className={cn("overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 scrollbar-thin", isUndebutedExpanded ? "max-h-none" : "h-[800px]")}
      >
        <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container">
          <table className="min-w-full text-xs text-left bg-white rounded-xl shadow-sm rounded-lg">
            <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100">
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
            <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
              {(() => {
                if (filtered.length === 0) return <tr><td colSpan={3} className="px-6 py-10 text-center text-neutral-400 italic text-[11px]">No hay ciclistas sin debutar que coincidan con los criterios.</td></tr>;

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
                    <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100">
                      <td className="px-4 py-1 text-neutral-600 font-medium"> {c.nombreEquipo} <span className="text-neutral-400 font-normal text-[9px]"> [#{c.orden}]</span> </td>
                      <td className="px-4 py-1 font-bold text-red-700"> {c.ciclista} </td>
                      <td className={cn("px-4 py-1 text-center font-mono", ["01", "02", "03", "1", "2", "3"].includes(c.ronda) ? "bg-yellow-50 text-yellow-700 font-bold" : "text-neutral-500")}> {c.ronda} </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
