import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";
import React, { useState, useRef, useEffect } from "react";
import { User, Search, Minimize2, Maximize2, Copy, CheckCircle2, FileText, X, ChevronDown, Trophy, ChevronsUp, Minus, ChevronsDown, AlertTriangle, Download } from "lucide-react";
import { domToDataUrl } from "modern-screenshot";
import { cn } from "../../lib/utils";
import { getVal, getCategoryColorStyle } from "../../lib/data-processing";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { DRAFT_RANK_MAP } from "../../lib/constants";

function MultiSelect({ options, value, onChange, placeholder }: { options: {value: string, label: string}[], value: string[], onChange: (v: string[]) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)} className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 flex items-center justify-between min-w-[150px] shadow-sm hover:bg-neutral-50">
        <span className="truncate">{value.length === 0 ? placeholder : `${placeholder} (${value.length})`}</span>
        <ChevronDown className="w-4 h-4 ml-2 text-neutral-400" />
      </button>
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-full min-w-[200px] bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 flex flex-col gap-1">
             <label className="flex items-center gap-2 p-1.5 hover:bg-neutral-50 rounded cursor-pointer">
               <input type="checkbox" checked={value.length === 0} onChange={() => onChange([])} className="rounded text-blue-600 focus:ring-blue-500" />
               <span className="text-sm font-medium">Todos</span>
             </label>
             <div className="h-px bg-neutral-100 my-1"></div>
             {options.map(opt => (
               <label key={opt.value} className="flex items-center gap-2 p-1.5 hover:bg-neutral-50 rounded cursor-pointer">
                 <input type="checkbox" checked={value.includes(opt.value)} onChange={(e) => {
                   if (e.target.checked) onChange([...value, opt.value]);
                   else onChange(value.filter(v => v !== opt.value));
                 }} className="rounded text-blue-600 focus:ring-blue-500" />
                 <span className="text-sm truncate">{opt.label}</span>
               </label>
             ))}
          </div>
        </div>
      )}
    </div>
  )
}

export interface CyclistDetailViewProps {
  files: any;
  selectedCyclistDetail: string;
  setSelectedCyclistDetail: (val: string) => void;
  cyclistMetadata: Record<string, any>;
  cyclistRoundMap: Record<string, string>;
  playerByCyclist: Record<string, string>;
  playerOrderMap: Record<string, string>;
  playerTeamMap: Record<string, string>;
}

export const CyclistDetailView: React.FC<CyclistDetailViewProps> = ({
  files,
  selectedCyclistDetail,
  setSelectedCyclistDetail,
  cyclistMetadata,
  cyclistRoundMap,
  playerByCyclist,
  playerOrderMap,
  playerTeamMap,
}) => {
  const [cyclistSearchTerm, setCyclistSearchTerm] = useState("");
  
  useEffect(() => {
    if (selectedCyclistDetail && selectedCyclistDetail !== cyclistSearchTerm) {
      setCyclistSearchTerm(selectedCyclistDetail);
    }
  }, [selectedCyclistDetail]);

  const [isCyclistDetailExpanded, setIsCyclistDetailExpanded] = useState(false);
  const [cyclistDetailSortCol, setCyclistDetailSortCol] = useState<"fecha"|"carrera"|"categoria"|"tipo"|"etapa"|"posicion"|"puntos"|"ciclistaText"|"eqText"|"pos">("fecha");
  const [cyclistDetailSortDir, setCyclistDetailSortDir] = useState<"asc"|"desc">("asc");
  const [filterMode, setFilterMode] = useState<"quick" | "daily" | "monthly" | "yearly">("quick");
  const [dateRange, setDateRange] = useState<"all" | "24h" | "7d" | "30d" | "year">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [cyclistDetailCategoryFilter, setCyclistDetailCategoryFilter] = useState<string[]>([]);
  const [cyclistDetailTypeFilter, setCyclistDetailTypeFilter] = useState<string[]>([]);
  const [cyclistDetailPosFilter, setCyclistDetailPosFilter] = useState<{ op: string; val: string }>({ op: "<=", val: "" });
  const [cyclistDetailPointsFilterAdv, setCyclistDetailPointsFilterAdv] = useState<{ op: string; val: string }>({ op: ">=", val: "" });
  const [isCyclistDetailCopying, setIsCyclistDetailCopying] = useState(false);
  const [isCyclistDetailDownloading, setIsCyclistDetailDownloading] = useState(false);
  const [isCyclistDetailTextCopying, setIsCyclistDetailTextCopying] = useState(false);
  const cyclistDetailRef = useRef<HTMLDivElement>(null);

  const handleCopyCyclistDetail = async () => {
    if (!cyclistDetailRef.current || isCyclistDetailCopying) return;
    setIsCyclistDetailCopying(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const tableContainer = cyclistDetailRef.current;
    if (!tableContainer) return;
    const restore = expandNodeForCapture(tableContainer);
    try 
  {
    const processCopy = async () => {
      const dataUrl = await domToDataUrl(tableContainer, {
          scale: 3, 
          backgroundColor: '#ffffff',
          style: { overflow: "visible", textRendering: "optimizeLegibility" },
        });
      return await (await fetch(dataUrl)).blob();
    };
    await copyImageToClipboard(processCopy(), "export.png");
    setTimeout(() => setIsCyclistDetailCopying(false), 2000);
  }
                           catch (err) {
      setIsCyclistDetailCopying(false);
      try {
        const dataUrl = await domToDataUrl(tableContainer, {
          scale: 3,
          backgroundColor: '#ffffff',
          style: { overflow: "visible", textRendering: "optimizeLegibility" },
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `detalle_${selectedCyclistDetail}.png`;
        link.click();
      } catch (fallbackErr) {}
    } finally {
      restore();
    }
  };

  const handleCopyCyclistDetailText = async () => {
    if (!cyclistDetailRef.current) return;
    setIsCyclistDetailTextCopying(true);
    try {
      const table = cyclistDetailRef.current.querySelector("table");
      if (!table) return;
      const ths = Array.from(table.querySelectorAll("th")).map((th) => (th as HTMLElement).textContent?.trim() || "");
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      const lines = [ths.join("\t")];
      rows.forEach((row) => {
        if ((row as HTMLElement).classList.contains("hidden")) return;
        const tds = Array.from((row as HTMLElement).querySelectorAll("td")).map((td) => (td as HTMLElement).textContent?.trim() || "");
        if (tds.length === 1) return;
        lines.push(tds.join("\t"));
      });
      const text = lines.join("\n");
      await await copyTextToClipboard(text, 'export.txt');
      setTimeout(() => setIsCyclistDetailTextCopying(false), 2000);
    } catch (err) {
      setIsCyclistDetailTextCopying(false);
    }
  };

  const handleDownloadCyclistDetailImage = async () => {
    if (!cyclistDetailRef.current || isCyclistDetailDownloading) return;
    setIsCyclistDetailDownloading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const tableContainer = cyclistDetailRef.current;
    if (!tableContainer) return;
    const restore = expandNodeForCapture(tableContainer);
    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3,
        backgroundColor: '#ffffff',
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      });
      const link = document.createElement("a");
      link.download = `detalle_${selectedCyclistDetail}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => setIsCyclistDetailDownloading(false), 2000);
    } catch (err) {
      console.error(err);
      setIsCyclistDetailDownloading(false);
    } finally {
      restore();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
            <User className="w-5 h-5 text-blue-600" />
            Detalle de Ciclista
          </h3>
          <p className="text-sm text-neutral-500 whitespace-nowrap">
            Busca un ciclista para ver todo su detalle de puntos a lo largo de la temporada.
          </p>
        </div>

        <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row gap-4 items-center bg-neutral-50/20">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Buscar ciclista..." 
              list="all-cyclists-list" 
              className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={cyclistSearchTerm}
              onChange={(e) => {
                setCyclistSearchTerm(e.target.value);
                const valid = cyclistMetadata[e.target.value];
                if (valid) {
                  setSelectedCyclistDetail(e.target.value);
                  setCyclistDetailSortCol("fecha");
                  setCyclistDetailSortDir("asc");
                }
              }}
            />
            <datalist id="all-cyclists-list">
              {Object.keys(cyclistMetadata).sort().map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        {selectedCyclistDetail && (() => {
          const ciclista = selectedCyclistDetail;
          const meta = cyclistMetadata[ciclista] || { puntosTotales: 0, carrerasDisputadas: 0, diasCompeticion: 0, victorias: 0, pais: "", equipoBreve: "" };
          const ronda = cyclistRoundMap[ciclista] || "-";
          const currentJugador = playerByCyclist[ciclista];
          let eqText = "No elegido";
          if (currentJugador && currentJugador !== "No draft") {
            const draftRank = playerOrderMap[currentJugador] || DRAFT_RANK_MAP[currentJugador] || "-";
            const equipoStr = playerTeamMap[currentJugador] || currentJugador;
            eqText = `${equipoStr} [#${draftRank}]`;
          }
          const ciclistaText = `${ciclista} <${ronda}>`;
          
          let roundRankText = "-";
          let roundRankColor = "text-neutral-800";
          let roundRankIcon = null;
          if (ronda !== "-") {
            const cyclistsInRound = Object.keys(cyclistRoundMap).filter(c => cyclistRoundMap[c] === ronda);
            if (cyclistsInRound.length > 0) {
              const sortedByPoints = cyclistsInRound.sort((a, b) => {
                const ptsA = (cyclistMetadata[a]?.puntosTotales) || 0;
                const ptsB = (cyclistMetadata[b]?.puntosTotales) || 0;
                return ptsB - ptsA;
              });
              const idx = sortedByPoints.indexOf(ciclista);
              if (idx !== -1) {
                const rank = idx + 1;
                roundRankText = `${rank} de ${cyclistsInRound.length}`;
                if (rank === 1) {
                  roundRankColor = "text-yellow-500";
                  roundRankIcon = <Trophy className="w-5 h-5 fill-yellow-500" />;
                } else if (rank >= 2 && rank <= 5) {
                  roundRankColor = "text-emerald-500";
                  roundRankIcon = <ChevronsUp className="w-5 h-5" />;
                } else if (rank >= 6 && rank <= 14) {
                  roundRankColor = "text-neutral-400";
                  roundRankIcon = <Minus className="w-5 h-5" />;
                } else if (rank >= 15 && rank <= 19) {
                  roundRankColor = "text-orange-500";
                  roundRankIcon = <ChevronsDown className="w-5 h-5" />;
                } else {
                  roundRankColor = "text-red-500";
                  roundRankIcon = <AlertTriangle className="w-5 h-5" />;
                }
              }
            }
          }
          
          const raceTypeByName: Record<string, string> = {};
          files.carreras.data?.forEach((row: any) => {
            const c = getVal(row, "Carrera")?.trim();
            const cat = getVal(row, "Categoría")?.trim();
            if (c && cat) raceTypeByName[c] = cat;
          });

          const pointsLookup: Record<string, number> = {};
          files.puntos.data?.forEach((row: any) => {
            const cat = getVal(row, "Categoría")?.trim();
            const tip = getVal(row, "Tipo")?.trim();
            const pos = getVal(row, "Posición")?.toString().trim();
            const pt = getVal(row, "Puntos");
            if (cat && tip && pos && pt !== undefined) {
              pointsLookup[`${cat}_${tip}_${pos}`] = Number(pt);
            }
          });

          const items = (files.resultados.data || []).map((r: any) => {
            if (getVal(r, "Ciclista")?.toString().trim() !== ciclista) return null;
            const carrera = getVal(r, "Carrera")?.toString().trim() || "";
            const categoria = getVal(r, "Categoría")?.toString().trim() || raceTypeByName[carrera] || "";
            const fecha = getVal(r, "Fecha")?.toString().trim() || "";
            const tipo = getVal(r, "Tipo")?.toString().trim() || "";
            const etapa = getVal(r, "Etapa")?.toString().trim() || "";
            const posicion = getVal(r, "Posición")?.toString().trim() || getVal(r, "Pos")?.toString().trim() || "";
            
            const pointsKey = `${categoria}_${tipo}_${posicion}`;
            const puntos = pointsLookup[pointsKey] || 0;
            return { ciclistaText, eqText, carrera, categoria, fecha, tipo, etapa, pos: posicion, puntos };
          }).filter(Boolean);

          const allItems = (items as NonNullable<typeof items[0]>[]);
          let filteredItems = allItems.filter(it => {
            const parseDateFilters = (d: string) => {
              if (!d) return new Date(0);
              const p = d.split(/[-/]/);
              if (p.length !== 3) return new Date(0);
              return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
            };
            const eventDate = parseDateFilters(it.fecha);

            if (filterMode === "quick" && dateRange !== "all") {
              const diffMs = Date.now() - eventDate.getTime();
              const diffDays = diffMs / (1000 * 60 * 60 * 24);
              switch (dateRange) {
                case "24h": if (diffDays > 1) return false; break;
                case "7d": if (diffDays > 7) return false; break;
                case "30d": if (diffDays > 30) return false; break;
                case "year": if (eventDate.getFullYear() !== new Date().getFullYear()) return false; break;
              }
            } else if (filterMode === "daily") {
              if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (eventDate < start) return false;
              }
              if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (eventDate > end) return false;
              }
            } else if (filterMode === "monthly" && selectedMonth) {
              const [year, month] = selectedMonth.split('-');
              if (eventDate.getFullYear() !== parseInt(year) || (eventDate.getMonth() + 1) !== parseInt(month)) return false;
            } else if (filterMode === "yearly" && selectedYear) {
              if (eventDate.getFullYear() !== parseInt(selectedYear)) return false;
            }

            if (cyclistDetailCategoryFilter.length > 0 && !cyclistDetailCategoryFilter.includes(it.categoria)) return false;
            if (cyclistDetailTypeFilter.length > 0 && !cyclistDetailTypeFilter.includes(it.tipo)) return false;
            if (cyclistDetailPosFilter.val !== "") {
              const posVal = parseFloat(it.pos);
              const filterVal = parseFloat(cyclistDetailPosFilter.val);
              if (!isNaN(posVal) && !isNaN(filterVal)) {
                if (cyclistDetailPosFilter.op === "=" && posVal !== filterVal) return false;
                if (cyclistDetailPosFilter.op === "<" && posVal >= filterVal) return false;
                if (cyclistDetailPosFilter.op === ">" && posVal <= filterVal) return false;
                if (cyclistDetailPosFilter.op === "<=" && posVal > filterVal) return false;
                if (cyclistDetailPosFilter.op === ">=" && posVal < filterVal) return false;
              } else if (it.pos !== cyclistDetailPosFilter.val) return false;
            }
            if (cyclistDetailPointsFilterAdv.val !== "") {
              const filterVal = parseFloat(cyclistDetailPointsFilterAdv.val);
              if (!isNaN(filterVal)) {
                if (cyclistDetailPointsFilterAdv.op === "=" && it.puntos !== filterVal) return false;
                if (cyclistDetailPointsFilterAdv.op === "<" && it.puntos >= filterVal) return false;
                if (cyclistDetailPointsFilterAdv.op === ">" && it.puntos <= filterVal) return false;
                if (cyclistDetailPointsFilterAdv.op === "<=" && it.puntos > filterVal) return false;
                if (cyclistDetailPointsFilterAdv.op === ">=" && it.puntos < filterVal) return false;
              }
            }
            return true;
          });

          const maxPointsInList = Math.max(1, ...filteredItems.map(i => i.puntos));

          const filterOptionsCat = Array.from(new Set(allItems.map(i => i.categoria).filter(Boolean))).sort().map(c => ({value: c, label: c}));
          const filterOptionsType = Array.from(new Set(allItems.map(i => i.tipo).filter(Boolean))).sort().map(t => ({value: t, label: t}));

          const sortDirNum = cyclistDetailSortDir === "asc" ? 1 : -1;
          filteredItems.sort((a, b) => {
            if (cyclistDetailSortCol === "fecha") {
              const parseDate = (d: string) => {
                if (!d) return 0;
                const p = d.split(/[-/]/);
                if (p.length !== 3) return 0;
                return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0])).getTime();
              };
              return (parseDate(a!.fecha) - parseDate(b!.fecha)) * sortDirNum;
            }
            if (cyclistDetailSortCol === "puntos") return (a!.puntos - b!.puntos) * sortDirNum;
            const valA = (a as any)[cyclistDetailSortCol] || "";
            const valB = (b as any)[cyclistDetailSortCol] || "";
            return valA.toString().localeCompare(valB.toString()) * sortDirNum;
          });

          const handleSort = (col: string) => {
            if (cyclistDetailSortCol === col) { setCyclistDetailSortDir(prev => prev === "asc" ? "desc" : "asc"); }
            else { setCyclistDetailSortCol(col as any); setCyclistDetailSortDir("asc"); }
          };

          return (
            <div 
              className={cn(
                "p-6 flex flex-col gap-6 relative",
                isCyclistDetailExpanded && "fixed inset-4 z-50 overflow-y-auto max-h-none shadow-2xl p-6 bg-white border border-neutral-200 rounded-2xl"
              )} 
              ref={cyclistDetailRef}
            >
              {isCyclistDetailExpanded && (
                <button
                  onClick={() => setIsCyclistDetailExpanded(false)}
                  className="fixed top-8 right-8 p-3 bg-neutral-800 text-white rounded-full shadow-2xl z-[60] copy-button-ignore hover:bg-neutral-700 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {!isCyclistDetailExpanded && (
                <div className="absolute top-4 right-4 flex gap-2 z-10 copy-button-ignore">
                  <button
                    onClick={() =>
                      setIsCyclistDetailExpanded(
                        !isCyclistDetailExpanded,
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
                    title={
                      isCyclistDetailExpanded
                        ? "Contraer tabla"
                        : "Expandir tabla"
                    }
                  >
                    {isCyclistDetailExpanded ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={handleCopyCyclistDetail}
                    disabled={!!isCyclistDetailCopying}
                    title="Copiar imagen"
                    className={cn(
                      "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                      isCyclistDetailCopying
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-white",
                    )}
                  >
                    {isCyclistDetailCopying ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={handleDownloadCyclistDetailImage}
                    disabled={isCyclistDetailDownloading}
                    title="Descargar imagen"
                    className={cn(
                      "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                      isCyclistDetailDownloading
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-white",
                    )}
                  >
                    {isCyclistDetailDownloading ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={handleCopyCyclistDetailText}
                    disabled={isCyclistDetailTextCopying}
                    title="Copiar texto"
                    className={cn(
                      "px-3 h-8 text-sm font-medium rounded-md border shadow-sm flex items-center justify-center transition-all",
                      isCyclistDetailTextCopying
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                    )}
                  >
                    {isCyclistDetailTextCopying ? (
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    ) : (
                      <FileText className="w-4 h-4 mr-1.5" />
                    )}
                    Texto
                  </button>
                </div>
              )}
              <div className="flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm mt-6">
                <div className="flex flex-wrap items-center justify-between gap-6 p-4 bg-neutral-50/50 border-b border-neutral-100">
                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Ciclista</span>
                      <span className="text-base font-black text-neutral-900 tracking-tight">{ciclista}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">País</span>
                      <span className="text-sm font-semibold text-neutral-900 flex items-center gap-1" title={meta.paisLetras}>{meta.pais} {meta.paisLetras}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Nacido</span>
                      <span className="text-sm font-semibold text-neutral-900">{meta.nacido || meta.edad}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Eq breve</span>
                      <span className="text-sm font-semibold text-neutral-900">{meta.equipoBreve}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Equipo</span>
                      <span className="text-sm font-semibold text-neutral-900">{eqText}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-0.5 text-right">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Ronda</span>
                      <span className="text-sm font-bold bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 text-yellow-800 self-end shadow-sm">{meta.ronda || "No draft"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Elección</span>
                      <span className="text-sm font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 self-end">{meta.eleccion || "-"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap p-4 gap-x-12 gap-y-4 bg-white">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Puntos Totales</span>
                    <span className="text-2xl font-black text-blue-600 tracking-tighter leading-none">{meta.puntosTotales || 0}</span>
                  </div>
                  
                  <div className="h-10 w-px bg-neutral-200 hidden sm:block"></div>
                  
                  <div className="flex gap-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Victorias</span>
                      <span className="text-lg font-bold text-neutral-800 leading-none">{meta.victorias || 0}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Carreras</span>
                      <span className="text-lg font-bold text-neutral-800 leading-none">{meta.carrerasDisputadas || 0}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider text-nowrap">Días Comp.</span>
                      <span className="text-lg font-bold text-neutral-800 leading-none">{meta.diasCompeticion || 0}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider text-nowrap">Ranking Ronda</span>
                      <div className="flex items-center gap-1">
                        {roundRankIcon}
                        <span className={cn("text-lg font-bold leading-none", roundRankColor)}>{roundRankText}</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-neutral-200 hidden md:block"></div>

                  <div className="flex gap-10">
                    <div className="flex flex-col gap-1" title="Puntos por carrera">
                      <span className="text-[10px] border-b border-dashed border-neutral-400 text-neutral-500 uppercase font-bold tracking-wider cursor-help">P/C</span>
                      <span className="text-lg font-bold text-neutral-600 leading-none">{(meta.carrerasDisputadas > 0 ? ((meta.puntosTotales || 0) / meta.carrerasDisputadas).toFixed(1) : "0.0")}</span>
                    </div>
                    <div className="flex flex-col gap-1" title="Puntos por día de competición">
                      <span className="text-[10px] border-b border-dashed border-neutral-400 text-neutral-500 uppercase font-bold tracking-wider cursor-help">P/D</span>
                      <span className="text-lg font-bold text-neutral-600 leading-none">{(meta.diasCompeticion > 0 ? ((meta.puntosTotales || 0) / meta.diasCompeticion).toFixed(1) : "0.0")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100 mt-6 mb-4">
                <div className="flex flex-wrap items-center gap-4 border-b border-neutral-200 pb-4">
                  <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Fecha (Compuesto)</span>
                    <div className="flex bg-neutral-200/50 p-1 rounded-lg w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <button onClick={() => setFilterMode("quick")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap", filterMode === "quick" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900")}>Atajos</button>
                      <button onClick={() => setFilterMode("daily")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap", filterMode === "daily" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900")}>Diario</button>
                      <button onClick={() => setFilterMode("monthly")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap", filterMode === "monthly" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900")}>Mensual</button>
                      <button onClick={() => setFilterMode("yearly")} className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap", filterMode === "yearly" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900")}>Anual</button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:gap-4 items-center w-full sm:w-auto mt-2 sm:mt-5">
                    {filterMode === "quick" && (
                      <select 
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none hover:border-neutral-300 transition-colors"
                      >
                        <option value="24h">Últimas 24h</option>
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d">Últimos 30 días</option>
                        <option value="year">Este año</option>
                        <option value="all">Histórico completo</option>
                      </select>
                    )}

                    {filterMode === "daily" && (
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <input 
                          type="date" 
                          value={startDate} 
                          onChange={e => setStartDate(e.target.value)} 
                          className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none hover:border-neutral-300 transition-colors flex-1 md:flex-none min-w-[120px]" 
                        />
                        <span className="text-neutral-500 text-xs font-medium">hasta</span>
                        <input 
                          type="date" 
                          value={endDate} 
                          onChange={e => setEndDate(e.target.value)} 
                          className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none hover:border-neutral-300 transition-colors flex-1 md:flex-none min-w-[120px]" 
                        />
                      </div>
                    )}

                    {filterMode === "monthly" && (
                      <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={e => setSelectedMonth(e.target.value)} 
                        className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none hover:border-neutral-300 transition-colors" 
                      />
                    )}

                    {filterMode === "yearly" && (
                      <select 
                        value={selectedYear} 
                        onChange={e => setSelectedYear(e.target.value)} 
                        className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none hover:border-neutral-300 transition-colors"
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                          <option key={y} value={y.toString()}>{y}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Categoría</span>
                  <MultiSelect options={filterOptionsCat} value={cyclistDetailCategoryFilter} onChange={setCyclistDetailCategoryFilter} placeholder="Categorías" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Tipo</span>
                  <MultiSelect options={filterOptionsType} value={cyclistDetailTypeFilter} onChange={setCyclistDetailTypeFilter} placeholder="Tipos" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Posición</span>
                  <div className="flex items-center shadow-sm rounded-md">
                    <select value={cyclistDetailPosFilter.op} onChange={(e) => setCyclistDetailPosFilter({ ...cyclistDetailPosFilter, op: e.target.value })} className="px-2 py-1.5 border border-r-0 border-neutral-200 rounded-l-md text-sm bg-neutral-50 text-neutral-700 focus:outline-none focus:bg-white w-12 hover:bg-neutral-100 cursor-pointer">
                      <option value="=">=</option>
                      <option value="<">&lt;</option>
                      <option value=">">&gt;</option>
                      <option value="<=">&le;</option>
                      <option value=">=">&ge;</option>
                    </select>
                    <input type="text" value={cyclistDetailPosFilter.val} onChange={(e) => setCyclistDetailPosFilter({ ...cyclistDetailPosFilter, val: e.target.value })} placeholder="Ej: 1" className="px-3 py-1.5 border border-neutral-200 rounded-r-md text-sm w-20 outline-none focus:ring-2 focus:ring-blue-500 hover:border-neutral-300" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Puntos</span>
                  <div className="flex items-center shadow-sm rounded-md">
                    <select value={cyclistDetailPointsFilterAdv.op} onChange={(e) => setCyclistDetailPointsFilterAdv({ ...cyclistDetailPointsFilterAdv, op: e.target.value })} className="px-2 py-1.5 border border-r-0 border-neutral-200 rounded-l-md text-sm bg-neutral-50 text-neutral-700 focus:outline-none focus:bg-white w-12 hover:bg-neutral-100 cursor-pointer">
                      <option value="=">=</option>
                      <option value="<">&lt;</option>
                      <option value=">">&gt;</option>
                      <option value="<=">&le;</option>
                      <option value=">=">&ge;</option>
                    </select>
                    <input type="number" value={cyclistDetailPointsFilterAdv.val} onChange={(e) => setCyclistDetailPointsFilterAdv({ ...cyclistDetailPointsFilterAdv, val: e.target.value })} placeholder="Ej: 10" className="px-3 py-1.5 border border-neutral-200 rounded-r-md text-sm w-20 outline-none focus:ring-2 focus:ring-blue-500 hover:border-neutral-300" />
                  </div>
                </div>
                <div className="ml-auto flex items-center">
                  <button onClick={() => {
                    setFilterMode("quick");
                    setDateRange("all");
                    setStartDate("");
                    setEndDate("");
                    setSelectedMonth("");
                    setSelectedYear(new Date().getFullYear().toString());
                    setCyclistDetailCategoryFilter([]);
                    setCyclistDetailTypeFilter([]);
                    setCyclistDetailPosFilter({ op: "<=", val: "" });
                    setCyclistDetailPointsFilterAdv({ op: ">=", val: "" });
                  }} className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-200 bg-white px-4 py-1.5 rounded-md hover:bg-neutral-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">Limpiar Filtros</button>
                </div>
              </div>
            </div>

              <div className="table-responsive-wrapper overflow-auto w-full h-full bg-white border border-neutral-200 rounded-lg">
                <table className="w-full text-sm text-left table-fixed min-w-[900px]">
                  <thead className="text-xs text-neutral-500 uppercase bg-neutral-100/80 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 cursor-pointer hover:bg-neutral-200 w-44" onClick={() => handleSort("ciclistaText")}>Ciclista {cyclistDetailSortCol === "ciclistaText" && (cyclistDetailSortDir === "asc" ? "↑" : "↓")}</th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-neutral-200 w-36" onClick={() => handleSort("eqText")}>Equipo {cyclistDetailSortCol === "eqText" && (cyclistDetailSortDir === "asc" ? "↑" : "↓")}</th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-neutral-200 w-24" onClick={() => handleSort("fecha")}>Fecha {cyclistDetailSortCol === "fecha" && (cyclistDetailSortDir === "asc" ? "↑" : "↓")}</th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-neutral-200 w-52" onClick={() => handleSort("carrera")}>Carrera {cyclistDetailSortCol === "carrera" && (cyclistDetailSortDir === "asc" ? "↑" : "↓")}</th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-neutral-200 w-24" onClick={() => handleSort("categoria")}>Categoría {cyclistDetailSortCol === "categoria" && (cyclistDetailSortDir === "asc" ? "↑" : "↓")}</th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-neutral-200 w-24" onClick={() => handleSort("tipo")}>Tipo {cyclistDetailSortCol === "tipo" && (cyclistDetailSortDir === "asc" ? "↑" : "↓")}</th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-neutral-200 w-20 text-center" onClick={() => handleSort("etapa")}>Etapa {cyclistDetailSortCol === "etapa" && (cyclistDetailSortDir === "asc" ? "↑" : "↓")}</th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-neutral-200 w-20 text-center" onClick={() => handleSort("pos")}>Posición {cyclistDetailSortCol === "pos" && (cyclistDetailSortDir === "asc" ? "↑" : "↓")}</th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-neutral-200 w-24 text-right" onClick={() => handleSort("puntos")}>Puntos {cyclistDetailSortCol === "puntos" && (cyclistDetailSortDir === "asc" ? "↑" : "↓")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredItems.length === 0 ? (
                      <tr><td colSpan={9} className="px-4 py-8 text-center text-neutral-400 italic">No hay resultados con estos filtros.</td></tr>
                    ) : filteredItems.map((it, idx) => {
                      const posNumber = parseInt(it!.pos);
                      let medal = "";
                      const isNumericPos = /^\d+$/.test(it!.pos);
                      if (posNumber === 1 && isNumericPos) medal = "🥇";
                      else if (posNumber === 2 && isNumericPos) medal = "🥈";
                      else if (posNumber === 3 && isNumericPos) medal = "🥉";

                      const pointsBg = `rgba(34, 197, 94, ${0.1 + ((it!.puntos) / maxPointsInList) * 0.4})`;

                      return (
                      <tr key={idx} className="transition-colors group text-neutral-800 hover:brightness-95" style={getCategoryColorStyle(it!.categoria)}>
                        <td className="px-4 py-2.5 text-[11px] truncate font-medium" title={it!.ciclistaText}>{it!.ciclistaText}</td>
                        <td className="px-4 py-2.5 text-[11px] truncate text-neutral-600 font-medium" title={it!.eqText}>{it!.eqText}</td>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-neutral-600 whitespace-nowrap font-medium">{it!.fecha}</td>
                        <td className="px-4 py-2.5 truncate text-[11px] font-semibold text-neutral-800" title={it!.carrera}>{it!.carrera}</td>
                        <td className="px-4 py-2.5 text-[10px] text-neutral-700 whitespace-nowrap font-bold tracking-tight">{it!.categoria}</td>
                        <td className="px-4 py-2.5 text-[10px] text-neutral-600 truncate font-medium" title={it!.tipo}>{it!.tipo}</td>
                        <td className="px-4 py-2.5 text-[10px] text-center text-neutral-600 font-medium">{it!.etapa || "-"}</td>
                        <td className="px-4 py-2.5 text-[11px] text-center font-mono font-bold">
                          <div className="flex items-center justify-center gap-1">
                            <span>{it!.pos}</span>
                            {medal && <span className="text-[12px] leading-none drop-shadow-sm">{medal}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-[13px] text-right font-mono text-green-900 font-bold" style={{ backgroundColor: it!.puntos > 0 ? pointsBg : "transparent" }}>
                          {it!.puntos > 0 ? it!.puntos : "-"}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
