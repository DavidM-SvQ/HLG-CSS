import React, { useState, useRef, useMemo } from "react";
import { useUrlState } from "../../../hooks/useUrlState";
import { UserMinus, ChevronDown, ChevronUp, Copy, CheckCircle2, Minimize2, Maximize2, Download, FileText } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ReportCard } from "../../ui/ReportCard";
import { copyImageToClipboard, copyTextToClipboard } from "../../../lib/clipboard";
import { flushSync } from "react-dom";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { Button } from "../../ui/button";

interface UnscoredCyclistsReportProps {
  files: any;
  leaderboard: any[] | null;
  cyclistRoundMap: Record<string, string>;
  cyclistMetadata: Record<string, any>;
  playerOrderMap: Record<string, string>;
  getVal: (row: any, key: string) => string;
  expandNodeForCapture: (element: HTMLElement) => () => void;
}

export const UnscoredCyclistsReport: React.FC<UnscoredCyclistsReportProps> = ({
  files,
  leaderboard,
  cyclistRoundMap,
  cyclistMetadata,
  playerOrderMap,
  getVal,
  expandNodeForCapture
}) => {
  const unscoredTableRef = useRef<HTMLDivElement>(null);
  const { handleCopyImage: copyUnscoredImage, handleDownloadImage: downloadUnscoredImage, isCopying: isUnscoredTableCopyingState } = useTableScreenshot(unscoredTableRef);
  
  const [unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn] = useUrlState<string>("unscoredSort", "jugador");
  const [unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection] = useUrlState<"asc" | "desc">("unscoredDir", "asc");
  const [isUnscoredExpanded, setIsUnscoredExpanded] = useState(false);
  const [isUnscoredCopying, setIsUnscoredCopying] = useState<string | null>(null);
  const [isUnscoredTextCopying, setIsUnscoredTextCopying] = useState(false);
  
  const [unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter] = useUrlState<string>("unscoredTeam", "all");
  const [unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter] = useUrlState<string[]>("unscoredRounds", []);
  const [isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen] = useState(false);

  const unscoredList = useMemo(() => {
    return files.elecciones.data?.map((row: any) => {
      const ciclista = getVal(row, "Ciclista")?.trim();
      const jugador = getVal(row, "Nombre_TG")?.trim();
      const nombreEquipo = getVal(row, "Nombre_Equipo")?.trim();
      const orden = playerOrderMap[jugador] || "";
      const ronda = cyclistRoundMap[ciclista] || "";

      let points = 0;
      leaderboard?.forEach((p) => {
        if (p.jugador === jugador) {
          p?.detalles?.forEach((d: any) => {
            if (d.ciclista === ciclista) points += d.puntosObtenidos;
          });
        }
      });

      if (points > 0) return null;

      const meta = cyclistMetadata[ciclista] || { carrerasDisputadas: 0, diasCompeticion: 0 };
      return { ciclista, jugador, nombreEquipo, orden, ronda, carreras: meta.carrerasDisputadas, dias: meta.diasCompeticion, };
    }).filter(Boolean) as any[] || [];
  }, [files, leaderboard, cyclistRoundMap, cyclistMetadata, playerOrderMap, getVal]);

  const filtered = useMemo(() => {
    const data = unscoredList.filter((c) => {
      const teamMatch = unscoredCyclistsTeamFilter === "all" || c.nombreEquipo === unscoredCyclistsTeamFilter;
      const roundMatch = unscoredCyclistsRoundFilter.length === 0 || unscoredCyclistsRoundFilter.includes(c.ronda);
      return teamMatch && roundMatch;
    });

    data.sort((a, b) => {
      let valA: any, valB: any;
      switch (unscoredCyclistsSortColumn) {
        case "jugador": valA = a.nombreEquipo; valB = b.nombreEquipo; break;
        case "ciclista": valA = a.ciclista; valB = b.ciclista; break;
        case "ronda": valA = a.ronda; valB = b.ronda; break;
        case "carreras": valA = a.carreras; valB = b.carreras; break;
        case "dias": valA = a.dias; valB = b.dias; break;
        default: valA = a.ronda; valB = b.ronda; break;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return unscoredCyclistsSortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (valA < valB) return unscoredCyclistsSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return unscoredCyclistsSortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    return data;
  }, [unscoredList, unscoredCyclistsTeamFilter, unscoredCyclistsRoundFilter, unscoredCyclistsSortColumn, unscoredCyclistsSortDirection]);

  const countFiltered = filtered.length;

  const handleCopyUnscoredText = async () => {
    if (!unscoredTableRef.current || isUnscoredTextCopying) return;
    setIsUnscoredTextCopying(true);
    const table = unscoredTableRef.current.querySelector("table");
    if (!table) {
      setIsUnscoredTextCopying(false);
      return;
    }
    const rows = Array.from(table.rows);
    const text = rows
      .map((row: any) =>
        Array.from(row.cells)
          .map((cell: any) => cell.innerText.trim())
          .join("\t"),
      )
      .join("\n");
    await copyTextToClipboard(text, 'export.txt');
    setTimeout(() => setIsUnscoredTextCopying(false), 2000);
  };

  const handleCopyUnscored = async (
    subset?: "full" | string,
  ) => {
    if (isUnscoredCopying) return;
    flushSync(() => {
      setIsUnscoredCopying(subset || "full");
    });
    try {
      await copyUnscoredImage({
        fileName: "export.png",
        scale: 3,
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        backgroundColor: "#ffffff",
      });
    } finally {
      setIsUnscoredCopying(null);
    }
  };

  const handleDownloadUnscored = async (
    subset?: "full" | string,
  ) => {
    const suffix = subset && subset !== "full" ? `-${subset}` : "";
    await downloadUnscoredImage({
      fileName: `ciclistas-sin-puntuar${suffix}.png`,
      scale: 3,
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      backgroundColor: "#ffffff",
    });
  };

  const filtersUI = (
    <div className="flex flex-wrap items-center gap-3 mt-1">
      {/* Round Multi-select Filter */}
      <div className="relative">
        <Button variant="outline"
          onClick={() => setIsUnscoredRoundFilterOpen(!isUnscoredRoundFilterOpen)}
          className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
        >
          <span className="truncate">
            {unscoredCyclistsRoundFilter.length === 0
              ? "Todas las rondas"
              : `${unscoredCyclistsRoundFilter.length} rondas`}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-neutral-400 transition-transform",
              isUnscoredRoundFilterOpen && "rotate-180",
            )}
          />
        </Button>

        {isUnscoredRoundFilterOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsUnscoredRoundFilterOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 py-2 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">
                  Rondas
                </span>
                {unscoredCyclistsRoundFilter.length > 0 && (
                  <Button variant="outline"
                    onClick={() => setUnscoredCyclistsRoundFilter([])}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-medium border-none p-0 h-auto bg-transparent"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
              {Array.from(new Set(Object.values(cyclistRoundMap) as string[]))
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b))
                .map((ronda) => (
                  <label
                    key={ronda}
                    className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      checked={unscoredCyclistsRoundFilter.includes(ronda)}
                      onChange={(e) => {
                        if (e.target.checked) setUnscoredCyclistsRoundFilter([...unscoredCyclistsRoundFilter, ronda,]);
                        else setUnscoredCyclistsRoundFilter(unscoredCyclistsRoundFilter.filter((r) => r !== ronda));
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
        value={unscoredCyclistsTeamFilter}
        onChange={(e) => setUnscoredCyclistsTeamFilter(e.target.value)}
        className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="all">Todos los equipos</option>
        {leaderboard?.map((p) => (
          <option key={p.nombreEquipo} value={p.nombreEquipo}>{p.nombreEquipo}</option>
        ))}
      </select>
    </div>
  );

  return (
    <ReportCard
      title={`Ciclistas sin puntuar (${countFiltered})`}
      subtitle="Corredores elegidos en el draft que aún no han sumado puntos."
      icon={<UserMinus />}
      filename="ciclistas-sin-puntuar"
      ref={unscoredTableRef}
      headerExtra={filtersUI}
      toolbarProps={{
        isExpanded: isUnscoredExpanded,
        onExpand: () => setIsUnscoredExpanded(!isUnscoredExpanded),
        onCopyText: handleCopyUnscoredText,
        isTextCopying: isUnscoredTextCopying,
        onCopyImage: handleCopyUnscored,
        isImageCopying: isUnscoredCopying,
        imagePageCount: Math.ceil(countFiltered / 50),
        onDownloadImage: handleDownloadUnscored
      }}
      bodyClassName="p-0 border-t border-neutral-100"
      className="mt-8"
    >
      <div
        className={cn(
          "overflow-x-auto overflow-y-auto bg-white scrollbar-thin",
          isUnscoredExpanded ? "max-h-none" : "h-[800px]",
        )}
      >
        <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container md:px-0 px-2 pt-2">
          <table className="w-full text-xs text-left bg-transparent md:bg-white rounded-xl shadow-sm md:shadow-none md:rounded-lg block md:table border-collapse">
            <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50 shadow-sm border-b border-neutral-100 hidden md:table-header-group">
              <tr className="divide-x divide-neutral-100">
                <th
                  className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                  onClick={() => {
                    if (unscoredCyclistsSortColumn === "jugador") setUnscoredCyclistsSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                    else { setUnscoredCyclistsSortColumn("jugador"); setUnscoredCyclistsSortDirection("asc"); }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Jugador {unscoredCyclistsSortColumn === "jugador" && (unscoredCyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th
                  className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                  onClick={() => {
                    if (unscoredCyclistsSortColumn === "ciclista") setUnscoredCyclistsSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                    else { setUnscoredCyclistsSortColumn("ciclista"); setUnscoredCyclistsSortDirection("asc"); }
                  }}
                >
                  <div className="flex items-center gap-1">
                    Ciclista {unscoredCyclistsSortColumn === "ciclista" && (unscoredCyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th
                  className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                  onClick={() => {
                    if (unscoredCyclistsSortColumn === "ronda") setUnscoredCyclistsSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                    else { setUnscoredCyclistsSortColumn("ronda"); setUnscoredCyclistsSortDirection("asc"); }
                  }}
                >
                  <div className="flex items-center gap-1 text-center justify-center">
                    Ronda {unscoredCyclistsSortColumn === "ronda" && (unscoredCyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th
                  className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                  onClick={() => {
                    if (unscoredCyclistsSortColumn === "carreras") setUnscoredCyclistsSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                    else { setUnscoredCyclistsSortColumn("carreras"); setUnscoredCyclistsSortDirection("desc"); }
                  }}
                  title="Carreras disputadas"
                >
                  <div className="flex items-center justify-center gap-1">
                    Carreras {unscoredCyclistsSortColumn === "carreras" && (unscoredCyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th
                  className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"
                  onClick={() => {
                    if (unscoredCyclistsSortColumn === "dias") setUnscoredCyclistsSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                    else { setUnscoredCyclistsSortColumn("dias"); setUnscoredCyclistsSortDirection("desc"); }
                  }}
                  title="Días de competición"
                >
                  <div className="flex items-center justify-center gap-1">
                    Días {unscoredCyclistsSortColumn === "dias" && (unscoredCyclistsSortDirection === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="md:divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 block md:table-row-group">
              {(() => {
                const maxCarreras = Math.max(...filtered.map((c) => c.carreras), 0);
                const maxDias = Math.max(...filtered.map((c) => c.dias), 0);

                if (filtered.length === 0) return <tr className="block md:table-row"><td colSpan={5} className="px-6 py-10 text-center text-neutral-400 italic text-[11px] block md:table-cell w-full">No hay ciclistas sin puntuar que coincidan con los criterios.</td></tr>;

                return filtered.map((c, idx) => {
                  let isHiddenVisual = false;
                  if (isUnscoredCopying) {
                    if (isUnscoredCopying === "full") isHiddenVisual = false;
                    else {
                      const pageNum = parseInt(isUnscoredCopying.substring(1));
                      const start = (pageNum - 1) * 50;
                      const end = start + 50;
                      isHiddenVisual = !(idx >= start && idx < end);
                    }
                  }

                  if (isHiddenVisual && isUnscoredCopying) return null;

                  return (
                    <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] md:divide-x divide-neutral-100 flex flex-col md:table-row bg-white border border-neutral-200 md:border-none rounded-xl md:rounded-none mb-3 md:mb-0 shadow-sm md:shadow-none divide-y md:divide-y-0 group/row">
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell gap-2 rounded-t-xl md:rounded-none bg-neutral-50/50 md:bg-transparent">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Jugador</span>
                        <div className="text-right md:text-left text-neutral-600"><span className="font-medium">{c.nombreEquipo}</span> <span className="text-neutral-400 font-normal text-[9px]">[#{c.orden}]</span></div>
                      </td>
                      <td className="px-4 py-3 md:py-1 flex justify-between items-center md:table-cell gap-2">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ciclista</span>
                        <div className="font-bold text-neutral-900 text-right md:text-left text-[12px] md:text-[11px]">{c.ciclista}</div>
                      </td>
                      <td className={cn("px-4 py-3 md:py-1 flex justify-between items-center md:table-cell text-center font-mono tabular-nums", ["01", "02", "03", "1", "2", "3"].includes(c.ronda) ? "bg-yellow-50 text-yellow-700 font-bold" : "text-neutral-500 bg-neutral-50 md:bg-transparent border-t border-neutral-100 md:border-none")}>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Ronda</span>
                        <div className="text-right md:text-center text-[13px] md:text-[11px]">{c.ronda}</div>
                      </td>
                      <td className={cn("px-4 py-3 md:py-1 flex justify-between items-center md:table-cell text-center font-mono tabular-nums", c.carreras === 0 ? "text-red-600 font-bold" : c.carreras === maxCarreras && maxCarreras > 0 ? "text-green-600 font-bold" : "text-neutral-600 bg-neutral-50 md:bg-transparent border-t border-neutral-100 md:border-none")}>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Carreras</span>
                        <div className="text-right md:text-center text-[13px] md:text-[11px]">{c.carreras}</div>
                      </td>
                      <td className={cn("px-4 py-3 md:py-1 flex justify-between items-center md:table-cell text-center font-mono tabular-nums rounded-b-xl md:rounded-none", c.dias === 0 ? "text-red-600 font-bold" : c.dias === maxDias && maxDias > 0 ? "text-green-600 font-bold" : "text-neutral-600 bg-neutral-50 md:bg-transparent border-t border-neutral-100 md:border-none")}>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase md:hidden tracking-wider">Días</span>
                        <div className="text-right md:text-center text-[13px] md:text-[11px]">{c.dias}</div>
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
