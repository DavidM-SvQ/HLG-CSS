import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getVal } from '../../../lib/data-processing';
import { ExportToolbar } from '../../ui/ExportToolbar';
import { useDebounce } from '../../../lib/hooks/useDebounce';

export interface DraftElectionsProps {
  files: any;
  cyclistMetadata: any;
  leaderboard: any;
  getFlagEmoji: any;
  teamTotalPoints: Record<string, number>;
  draftCyclistStats: Record<string, { puntos: number; victorias: number }>;
  draftComputedData: {
    maxPuntos: number;
    minCarreras: number;
    minDc: number;
    minPpc: number;
    minPpd: number;
    minPct: number;
  };
}

import { performImageCopy, performImageDownload, performTextCopy } from '../season/hooks/useExportHandlers';

export const DraftElections: React.FC<DraftElectionsProps> = ({
  files,
  cyclistMetadata,
  getFlagEmoji,
  teamTotalPoints,
  draftCyclistStats,
  draftComputedData,
}) => {
  const [draftSearchTerm, setDraftSearchTerm] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  
  useEffect(() => {
    setLocalSearch(draftSearchTerm);
  }, [draftSearchTerm]);
  
  const debouncedSearch = useDebounce(localSearch, 300);
  
  useEffect(() => {
    if (debouncedSearch !== draftSearchTerm) {
      setDraftSearchTerm(debouncedSearch);
    }
  }, [debouncedSearch, draftSearchTerm]);

  const [draftRoundFilter, setDraftRoundFilter] = useState<string[]>([]);
  const [draftTeamFilter, setDraftTeamFilter] = useState<string[]>([]);
  const [isDraftRoundFilterOpen, setIsDraftRoundFilterOpen] = useState(false);
  const [isDraftTeamFilterOpen, setIsDraftTeamFilterOpen] = useState(false);
  const [draftStatsFilters, setDraftStatsFilters] = useState<{ minPuntos?: number; minVictorias?: number; maxPuntos?: number; maxVictorias?: number; }>({});
  const [isDraftStatsFilterOpen, setIsDraftStatsFilterOpen] = useState(false);
  const [draftSortColumn, setDraftSortColumn] = useState<string>("Elección");
  const [draftSortDirection, setDraftSortDirection] = useState<"asc" | "desc">("asc");
  const [isDraftTableExpanded, setIsDraftTableExpanded] = useState(false);

  const draftTableRef = useRef<HTMLDivElement>(null);
  const [isDraftTableCopying, setIsDraftTableCopying] = useState<string | false>(false);
  const handleCopyDraftTableImage = (part?: any) => {
    performImageCopy(draftTableRef, setIsDraftTableCopying, part || true, "draftElectionsTable");
  };
  const handleDownloadDraftTableImage = (part?: any) => {
    performImageDownload(draftTableRef, `draft-elecciones${part && part !== true ? `-${part}` : ""}.png`, "draftElectionsTable");
  };

  const draftFilteredData = useMemo(() => {
    if (!files?.elecciones?.data) return [];
    return files.elecciones.data.filter((row: any) => {
      const ciclista = getVal(row, "Ciclista") as string;
      const matchesSearch = ciclista
        ?.toLowerCase()
        .includes(draftSearchTerm.toLowerCase());
      const matchesRound =
        draftRoundFilter.length === 0 ||
        draftRoundFilter.includes(String(getVal(row, "Ronda")));
      const matchesTeam =
        draftTeamFilter.length === 0 ||
        draftTeamFilter.includes(
          String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG"))
        );

      let matchesStats = true;
      if (ciclista) {
        const stats = draftCyclistStats[ciclista] || { puntos: 0, victorias: 0 };
        const puntos = stats.puntos;
        const victorias = stats.victorias;

        if (draftStatsFilters.minPuntos !== undefined && puntos < draftStatsFilters.minPuntos)
          matchesStats = false;
        if (draftStatsFilters.minVictorias !== undefined && victorias < draftStatsFilters.minVictorias)
          matchesStats = false;
      }

      return matchesSearch && matchesRound && matchesTeam && matchesStats;
    });
  }, [files?.elecciones?.data, draftSearchTerm, draftRoundFilter, draftTeamFilter, draftStatsFilters, draftCyclistStats, cyclistMetadata]);

  const draftSortedData = useMemo(() => {
    return [...draftFilteredData].sort((a, b) => {
      if (draftSortColumn === "Puntos") {
        const ptsA = draftCyclistStats[getVal(a, "Ciclista") || ""]?.puntos || 0;
        const ptsB = draftCyclistStats[getVal(b, "Ciclista") || ""]?.puntos || 0;
        return draftSortDirection === "asc" ? ptsA - ptsB : ptsB - ptsA;
      }
      if (draftSortColumn === "V") {
        const vicA = draftCyclistStats[getVal(a, "Ciclista") || ""]?.victorias || 0;
        const vicB = draftCyclistStats[getVal(b, "Ciclista") || ""]?.victorias || 0;
        return draftSortDirection === "asc" ? vicA - vicB : vicB - vicA;
      }
      if (draftSortColumn === "C") {
        const cA = cyclistMetadata[getVal(a, "Ciclista") || ""]?.carrerasDisputadas || 0;
        const cB = cyclistMetadata[getVal(b, "Ciclista") || ""]?.carrerasDisputadas || 0;
        return draftSortDirection === "asc" ? cA - cB : cB - cA;
      }
      if (draftSortColumn === "DC") {
        const dcA = cyclistMetadata[getVal(a, "Ciclista") || ""]?.diasCompeticion || 0;
        const dcB = cyclistMetadata[getVal(b, "Ciclista") || ""]?.diasCompeticion || 0;
        return draftSortDirection === "asc" ? dcA - dcB : dcB - dcA;
      }
      const valA = getVal(a, draftSortColumn);
      const valB = getVal(b, draftSortColumn);
      if (!valA) return 1;
      if (!valB) return -1;
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return draftSortDirection === "asc" ? numA - numB : numB - numA;
      }
      return draftSortDirection === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [draftFilteredData, draftSortColumn, draftSortDirection, draftCyclistStats, cyclistMetadata]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: draftSortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const { maxPuntos, minCarreras, minDc, minPpc, minPpd, minPct } = draftComputedData;
  const numBlocks = Math.ceil(draftFilteredData.length / 50);

  if (!files?.elecciones?.data) {
    return (
      <div className="text-center py-20 text-neutral-500 italic">
        No hay datos del draft cargados.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar ciclista..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => {
                  setIsDraftRoundFilterOpen(!isDraftRoundFilterOpen);
                  setIsDraftTeamFilterOpen(false);
                  setIsDraftStatsFilterOpen(false);
                }}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[140px] justify-between cursor-pointer"
              >
                <span className="text-neutral-700">
                  {draftRoundFilter.length === 0 ? "Todas las rondas" : `${draftRoundFilter.length} rondas`}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isDraftRoundFilterOpen && "rotate-180")} />
              </button>

              {isDraftRoundFilterOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Rondas</span>
                    {draftRoundFilter.length > 0 && (
                      <button onClick={() => setDraftRoundFilter([])} className="text-[10px] text-blue-600 hover:text-blue-700 font-bold">Limpiar</button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {Array.from(new Set(files.elecciones.data.map((d: any) => String(getVal(d, "Ronda"))).filter(Boolean)))
                      .sort((a, b) => parseInt(a as string) - parseInt(b as string))
                      .map((ronda) => (
                        <label key={ronda as string} className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer">
                          <input type="checkbox" className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20" checked={draftRoundFilter.includes(ronda as string)} onChange={() => {
                            if (draftRoundFilter.includes(ronda as string)) {
                                setDraftRoundFilter(draftRoundFilter.filter((r) => r !== ronda));
                            } else {
                                setDraftRoundFilter([...draftRoundFilter, ronda as string]);
                            }
                          }} />
                          <span className="text-sm text-neutral-700">Ronda {ronda as string}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setIsDraftTeamFilterOpen(!isDraftTeamFilterOpen);
                  setIsDraftRoundFilterOpen(false);
                  setIsDraftStatsFilterOpen(false);
                }}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[160px] justify-between cursor-pointer"
              >
                <span className="text-neutral-700">
                  {draftTeamFilter.length === 0 ? "Todos los equipos" : `${draftTeamFilter.length} equipos`}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isDraftTeamFilterOpen && "rotate-180")} />
              </button>

              {isDraftTeamFilterOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Equipos</span>
                    {draftTeamFilter.length > 0 && (
                      <button onClick={() => setDraftTeamFilter([])} className="text-[10px] text-blue-600 hover:text-blue-700 font-bold">Limpiar</button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {Array.from(new Set(files.elecciones.data.map((d: any) => String(getVal(d, "Nombre_Equipo") || getVal(d, "Nombre_TG"))).filter(Boolean)))
                      .sort()
                      .map((team) => (
                        <label key={team as string} className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer">
                          <input type="checkbox" className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20" checked={draftTeamFilter.includes(team as string)} onChange={() => {
                            if (draftTeamFilter.includes(team as string)) {
                                setDraftTeamFilter(draftTeamFilter.filter((t) => t !== team));
                            } else {
                                setDraftTeamFilter([...draftTeamFilter, team as string]);
                            }
                          }} />
                          <span className="text-sm text-neutral-700">{team as string}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setIsDraftStatsFilterOpen(!isDraftStatsFilterOpen);
                  setIsDraftTeamFilterOpen(false);
                  setIsDraftRoundFilterOpen(false);
                }}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[140px] justify-between cursor-pointer"
              >
                <span className="text-neutral-700">
                  {Object.values(draftStatsFilters).some((v) => v !== undefined && String(v) !== "") ? "Est. activas" : "Estadísticas"}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isDraftStatsFilterOpen && "rotate-180")} />
              </button>
              {isDraftStatsFilterOpen && (
                <div className="absolute top-full left-0 mt-1 w-96 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2 mb-3">
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Filtros de Estadísticas</span>
                    {Object.values(draftStatsFilters).some((v) => v !== undefined && String(v) !== "") && (
                      <button onClick={() => setDraftStatsFilters({})} className="text-[10px] text-blue-600 hover:text-blue-700 font-bold">Limpiar todo</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                    {[
                      { key: "Points", label: "Puntos" },
                      { key: "Wins", label: "Victorias (V)" },
                      { key: "Carr", label: "Carreras (C)" },
                      { key: "Dc", label: "Días Comp. (DC)" },
                      { key: "Ppc", label: "Pto/Carrera (P/C)" },
                      { key: "Ppd", label: "Pto/Día (P/D)" },
                    ].map((stat) => (
                      <div key={stat.key} className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase">{stat.label}</label>
                        <div className="flex items-center gap-2">
                          <input type="number" placeholder="Min" className="w-full px-2 py-1 text-xs border rounded bg-neutral-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" value={(draftStatsFilters as any)[`min${stat.key}`] ?? ""} onChange={(e) => setDraftStatsFilters((prev) => ({ ...prev, [`min${stat.key}`]: e.target.value ? Number(e.target.value) : undefined }))} />
                          <span className="text-neutral-400">-</span>
                          <input type="number" placeholder="Max" className="w-full px-2 py-1 text-xs border rounded bg-neutral-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" value={(draftStatsFilters as any)[`max${stat.key}`] ?? ""} onChange={(e) => setDraftStatsFilters((prev) => ({ ...prev, [`max${stat.key}`]: e.target.value ? Number(e.target.value) : undefined }))} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <ExportToolbar
            isExpanded={isDraftTableExpanded}
            onExpand={() => setIsDraftTableExpanded(!isDraftTableExpanded)}
            onCopyImage={() => handleCopyDraftTableImage()}
            isImageCopying={isDraftTableCopying === "full"}
            onDownloadImage={() => handleDownloadDraftTableImage()}
          />
        </div>
        
        {(draftRoundFilter.length > 0 || draftTeamFilter.length > 0 || Object.values(draftStatsFilters).some((v) => v !== undefined && String(v) !== "")) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
            <span className="text-xs text-neutral-500 font-medium mr-1">Filtros activos:</span>
            {draftRoundFilter.map(r => (
              <span key={'r'+r} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                 Ronda {r}
                 <button onClick={() => setDraftRoundFilter(draftRoundFilter.filter(x => x !== r))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
              </span>
            ))}
            {draftTeamFilter.map(t => (
              <span key={'t'+t} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                 {t}
                 <button onClick={() => setDraftTeamFilter(draftTeamFilter.filter(x => x !== t))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
              </span>
            ))}
            {Object.entries(draftStatsFilters).map(([k, v]) => {
              if (v === undefined || String(v) === "") return null;
              const label = k.replace('min', 'Min ').replace('max', 'Max ');
              return (
                <span key={'s'+k} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                   {label} {v}
                   <button onClick={() => {
                      const newStats = { ...draftStatsFilters };
                      delete (newStats as any)[k];
                      setDraftStatsFilters(newStats);
                   }} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                </span>
              );
            })}
            <button 
               onClick={() => { setDraftRoundFilter([]); setDraftTeamFilter([]); setDraftStatsFilters({}); }}
               className="text-[11px] text-neutral-500 hover:text-neutral-800 underline ml-2 transition-colors"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {numBlocks > 1 && (
        <div className="flex flex-col gap-2 mt-4 copy-button-ignore">
          <div className="flex items-center justify-end">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Copiar bloques de imagen ({draftFilteredData.length} ciclistas):</span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {Array.from({ length: numBlocks }).map((_, i) => {
              const s = `p${i + 1}`; const start = i * 50 + 1; const end = Math.min((i + 1) * 50, draftFilteredData.length);
              const label = `${start}-${end}`; const isCopyingThis = isDraftTableCopying === s;
              return (
                <button key={s} onClick={() => handleCopyDraftTableImage(s)} className={cn("px-2.5 py-1 text-[10px] rounded border font-bold transition-all shadow-sm active:scale-95", isCopyingThis ? "bg-green-600 border-green-600 text-white" : "bg-white text-blue-600 border-neutral-200 hover:bg-blue-50 hover:text-blue-700")} title={`Copiar bloque ${start}-${end}`}>{label}</button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-4">
        <div ref={draftTableRef} className={cn("bg-white border border-neutral-200 rounded-xl overflow-hidden relative max-h-[1200px] shadow-sm inline-block max-w-full", isDraftTableExpanded ? "fixed inset-4 z-50 max-h-none" : "")}>
          {isDraftTableExpanded && (
            <button onClick={() => setIsDraftTableExpanded(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore">
              <X className="w-6 h-6" />
            </button>
          )}
          <div ref={parentRef} className="table-responsive-wrapper overflow-auto w-full max-h-[600px] crosshair-container">
            <table className="w-full min-w-[1000px] text-[11px] text-left whitespace-nowrap border-collapse mx-auto">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase text-[10px] tracking-wider sticky top-0 z-10">
                <tr>
                  {["Elección", "Nombre_Equipo", "Orden_Draft", "Ronda", "Ciclista", "Edad", "País", "Eq_Comp", "Puntos", "V", "C", "DC", "P/C", "P/D", "%"].map((col) => {
                    let colTitle = col;
                    if (col === "V") colTitle = "Victorias"; if (col === "C") colTitle = "Carreras Disputadas"; if (col === "DC") colTitle = "Días de Competición"; if (col === "P/C") colTitle = "Puntos por Carrera"; if (col === "P/D") colTitle = "Puntos por Día"; if (col === "%") colTitle = "% de puntos del equipo";
                    return (
                      <th key={col} className={`${"px-2 py-1.5 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors text-center"} ${(col === "Ciclista" || col === "Nombre_Equipo") ? "sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]" : ""}`} title={colTitle} onClick={() => {
                        if (draftSortColumn === col) { setDraftSortDirection((prev) => prev === "asc" ? "desc" : "asc"); } else { setDraftSortColumn(col); setDraftSortDirection("asc"); }
                      }}>
                        <div className="flex items-center justify-center gap-1">
                          {col === "Eq_Comp" ? "EQ BREVE" : col.replace("_", " ")}
                          {draftSortColumn === col && <span className="text-blue-600">{draftSortDirection === "asc" ? "↑" : "↓"}</span>}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                {rowVirtualizer.getVirtualItems().length > 0 && <tr><td style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} colSpan={15} /></tr>}
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = draftSortedData[virtualRow.index]; const idx = virtualRow.index;
                  const ciclista = getVal(row, "Ciclista") || "";
                  const stats = draftCyclistStats[ciclista] || { puntos: 0, victorias: 0 };
                  let pointsStyle = {};
                  if (stats.puntos === 0) { pointsStyle = { backgroundColor: "#fee2e2", color: "#b91c1c" }; } else { const ratio = stats.puntos / maxPuntos; const hue = 45 + ratio * (142 - 45); pointsStyle = { backgroundColor: `hsl(${hue}, 80%, 85%)`, color: `hsl(${hue}, 90%, 25%)` }; }

                  return (
                    <tr key={idx} className="draft-row hover:bg-neutral-50 transition-colors h-6">
                      <td className="px-1 py-0.5 font-medium text-neutral-900 text-center">{getVal(row, "Elección")}</td>
                      <td className="px-1 py-0.5 text-left min-w-0 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">{getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG")}</td>
                      <td className="px-1 py-0.5 text-center">{getVal(row, "Orden_Draft")}</td>
                      <td className="px-1 py-0.5 text-center"><span className="inline-flex items-center justify-center bg-neutral-100 text-neutral-600 px-1 py-px rounded text-[9px] font-bold">{getVal(row, "Ronda")}</span></td>
                      <td className="px-1 py-0.5 font-medium text-blue-600 text-[10px] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">{ciclista}</td>
                      <td className="px-1 py-0.5 text-center">{getVal(row, "Edad")}</td>
                      <td className="px-1 py-0.5 text-center" title={getVal(row, "País")}><span className="text-xs">{getFlagEmoji(getVal(row, "País"))}</span></td>
                      <td className="px-1 py-0.5 text-center text-neutral-500 min-w-0">{cyclistMetadata[ciclista]?.equipoBreve || getVal(row, "Eq_Comp")}</td>
                      <td className="px-1 py-0.5 text-center"><span className="inline-flex items-center justify-center px-1 py-0.5 rounded font-bold min-w-[2.5rem] tracking-tight text-[10px]" style={pointsStyle}>{stats.puntos}</span></td>
                      <td className="px-1 py-0.5 text-center">{stats.victorias > 0 ? <span className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 px-1 py-px rounded text-[9px] font-bold tracking-tight">{stats.victorias}</span> : <span className="text-neutral-300">-</span>}</td>
                      <td className={cn("px-1 py-0.5 text-center font-mono", (cyclistMetadata[ciclista]?.carrerasDisputadas || 0) === 0 ? "text-red-500" : cyclistMetadata[ciclista]?.carrerasDisputadas === minCarreras ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.carrerasDisputadas || 0}</td>
                      <td className={cn("px-1 py-0.5 text-center font-mono", (cyclistMetadata[ciclista]?.diasCompeticion || 0) === 0 ? "text-red-500" : cyclistMetadata[ciclista]?.diasCompeticion === minDc ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.diasCompeticion || 0}</td>
                      <td className={cn("px-1 py-0.5 text-center font-mono", (cyclistMetadata[ciclista]?.carrerasDisputadas > 0 ? stats.puntos / cyclistMetadata[ciclista].carrerasDisputadas : 0) === 0 ? "text-red-500" : stats.puntos / cyclistMetadata[ciclista].carrerasDisputadas === minPpc ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.carrerasDisputadas > 0 ? (stats.puntos / cyclistMetadata[ciclista].carrerasDisputadas).toFixed(1) : "0.0"}</td>
                      <td className={cn("px-1 py-0.5 text-center font-mono", (cyclistMetadata[ciclista]?.diasCompeticion > 0 ? stats.puntos / cyclistMetadata[ciclista].diasCompeticion : 0) === 0 ? "text-red-500" : stats.puntos / cyclistMetadata[ciclista].diasCompeticion === minPpd ? "text-orange-500 font-bold" : "")}>{cyclistMetadata[ciclista]?.diasCompeticion > 0 ? (stats.puntos / cyclistMetadata[ciclista].diasCompeticion).toFixed(1) : "0.0"}</td>
                      <td className={cn("px-1 py-0.5 text-center font-mono", (() => { const eq = getVal(row, "Nombre_Equipo") || (getVal(row, "Nombre_TG") as string); const pct = eq && teamTotalPoints[eq] > 0 ? (stats.puntos / teamTotalPoints[eq]) * 100 : 0; if (pct === 0) return "text-red-500"; if (pct === minPct) return "text-orange-500 font-bold"; return ""; })())}>
                        {(() => { const eq = getVal(row, "Nombre_Equipo") || (getVal(row, "Nombre_TG") as string); const pct = eq && teamTotalPoints[eq] > 0 ? (stats.puntos / teamTotalPoints[eq]) * 100 : 0; return pct.toFixed(1) + "%"; })()}
                      </td>
                    </tr>
                  );
                })}
                {rowVirtualizer.getVirtualItems().length > 0 && <tr><td style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }} colSpan={15} /></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
