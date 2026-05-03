import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useState, useRef, useMemo } from 'react';
import { useCrosshair } from '../../hooks/useCrosshair';
import { Search, Minimize2, Maximize2, X, Filter } from 'lucide-react';
import { ChevronDown, ChevronUp, Copy, CheckCircle2, UploadCloud, Activity, FileText, Download, HelpCircle, ArrowUpDown, BarChart3, TrendingUp, Trophy } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Bar } from 'recharts';
import { expandNodeForCapture } from '../../lib/dom-utils';
import { domToDataUrl } from 'modern-screenshot';

import { cn } from '../../lib/utils';
import { getVal, getCategoryColorStyle, formatNumberSpanish } from '../../lib/data-processing';

export interface DraftViewProps {
  leaderboard: any;
  getFlagEmoji: any;
  teamToPlayerMap: any;
  playerOrderMap: any;
  files: any;
    cyclistMetadata: any;
  playerTeamMap: any;
        }

export const DraftView: React.FC<DraftViewProps> = ({
  files,
    cyclistMetadata,
  playerTeamMap,
          leaderboard,
  getFlagEmoji,
  teamToPlayerMap,
  playerOrderMap
}) => {
  const [draftSubTab, setDraftSubTab] = useState<"elecciones" | "datos">("elecciones");
  const [draftSearchTerm, setDraftSearchTerm] = useState("");
  const [draftRoundFilter, setDraftRoundFilter] = useState<string[]>([]);
  const [draftTeamFilter, setDraftTeamFilter] = useState<string[]>([]);
  const [isDraftRoundFilterOpen, setIsDraftRoundFilterOpen] = useState(false);
  const [isDraftTeamFilterOpen, setIsDraftTeamFilterOpen] = useState(false);
  const [draftStatsFilters, setDraftStatsFilters] = useState<{ minPuntos: number; minVictorias: number; }>({ minPuntos: 0, minVictorias: 0 });
  const [isDraftStatsFilterOpen, setIsDraftStatsFilterOpen] = useState(false);
  const [draftDatosTooltip, setDraftDatosTooltip] = useState<any>(null);
  const [draftDatosMonthFilter, setDraftDatosMonthFilter] = useState<string[]>([]);
  const [draftDatosCategoryFilter, setDraftDatosCategoryFilter] = useState<string[]>([]);
  const [draftDatosTeamFilter, setDraftDatosTeamFilter] = useState<string[]>([]);
  const [isDraftDatosMonthFilterOpen, setIsDraftDatosMonthFilterOpen] = useState(false);
  const [isDraftDatosCategoryFilterOpen, setIsDraftDatosCategoryFilterOpen] = useState(false);
  const [isDraftDatosTeamFilterOpen, setIsDraftDatosTeamFilterOpen] = useState(false);
  const [draftSortColumn, setDraftSortColumn] = useState<string>("Elección");
  const [draftSortDirection, setDraftSortDirection] = useState<"asc" | "desc">("asc");
  const [draftDatosSortColumn, setDraftDatosSortColumn] = useState<string>("Orden");
  const [draftDatosSortDirection, setDraftDatosSortDirection] = useState<"asc" | "desc">("asc");
  const [isDraftTableExpanded, setIsDraftTableExpanded] = useState(false);
  const [isDraftDatosTableExpanded, setIsDraftDatosTableExpanded] = useState(false);
  const [isDraftSummaryExpanded, setIsDraftSummaryExpanded] = useState(false);
  const [draftSummarySort, setDraftSummarySort] = useState<{keys: string[]; order: "asc" | "desc";}>({ keys: ["totalPoints"], order: "desc" });

  
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: draftSortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });
  const draftTableRef = useRef<HTMLDivElement>(null);
  const draftDatosTableRef = useRef<HTMLDivElement>(null);
  const draftSummaryTableRef = useRef<HTMLDivElement>(null);
  const draftChartRef = useRef<HTMLDivElement>(null);

  // Mocks for missing functions that were handled in App.tsx
  const [isDraftTableCopying, setIsDraftTableCopying] = useState<string | false>(false);
  const handleCopyDraftTableImage = (part?: any) => {};

  const [isDraftDatosTableCopying, setIsDraftDatosTableCopying] = useState<string | false>(false);
  const handleCopyDraftDatosTableImage = () => {};
  const handleDownloadDraftDatosTableImage = () => {};
  const handleDownloadDraftTableImage = (part?: any) => {};
  
  const getStatColor = (val: number, max: number, min: number = 0, inverted: boolean = false, allowZero: boolean = false, minNonZero: number = 0) => {
    if (val === 0 && !allowZero) return "";
    let t = 0;
    if (max > min) {
      const effectMin = allowZero ? min : minNonZero;
      t = Math.max(0, Math.min(1, (val - effectMin) / (max - effectMin)));
    }
    t = Number.isNaN(t) ? 0 : t;
    const hue = inverted ? 120 - t * 120 : t * 120; // 0=red, 120=green
    return `bg-[${"hsl(" + hue + ", 80%, 45%)"}] text-white`;
  };
 
  
  
  const raceTypeByName = useMemo(() => {
    const map: Record<string, string> = {};
    files?.carreras?.data?.forEach((row: any) => {
      const carrera = getVal(row, "Carrera")?.trim();
      const categoria = getVal(row, "Categoría")?.trim();
      if (carrera && categoria) map[carrera] = categoria;
    });
    return map;
  }, [files?.carreras?.data]);

  const raceDateByName = useMemo(() => {
    const map: Record<string, string> = {};
    files?.carreras?.data?.forEach((row: any) => {
      const carrera = getVal(row, "Carrera")?.trim();
      const fecha = getVal(row, "Fecha")?.trim();
      if (carrera && fecha) map[carrera] = fecha;
    });
    return map;
  }, [files?.carreras?.data]);

  const draftCyclistStats = useMemo(() => {
    const stats: Record<string, { puntos: number; victorias: number }> = {};
    leaderboard?.forEach((player: any) => {
      player?.detalles?.forEach((d: any) => {
        if (!stats[d.ciclista]) {
          stats[d.ciclista] = { puntos: 0, victorias: 0 };
        }
        stats[d.ciclista].puntos += d.puntosObtenidos;

        const isPos01 = d.posicion === "01" || d.posicion === "1";
        const isValidType = [
          "Etapa",
          "Etapa (Crono equipos)",
          "Clasificación final",
          "Clasificación final (Crono equipos)",
          "Clásica",
        ].includes(d.tipoResultado);

        if (isPos01 && isValidType) {
          stats[d.ciclista].victorias += 1;
        }
      });
    });
    return stats;
  }, [leaderboard]);

  const teamTotalPoints = useMemo(() => {
    const totals: Record<string, number> = {};
    files.elecciones?.data?.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista") as string;
      const equipo = getVal(row, "Nombre_Equipo") || (getVal(row, "Nombre_TG") as string);
      const pts = draftCyclistStats[ciclista]?.puntos || 0;
      if (equipo) {
        totals[equipo] = (totals[equipo] || 0) + pts;
      }
    });
    return totals;
  }, [files?.elecciones?.data, draftCyclistStats]);

  
  const draftComputedData = useMemo(() => {
    let minCarreras = Infinity;
    let minDc = Infinity;
    let minPpc = Infinity;
    let minPpd = Infinity;
    let minPct = Infinity;

    const maxPuntos = Math.max(
      1,
      ...Object.values(draftCyclistStats).map((s) => s.puntos)
    );

    files?.elecciones?.data?.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista") as string;
      if (!ciclista) return;
      const stats = draftCyclistStats[ciclista] || {
        puntos: 0,
        victorias: 0,
      };
      const meta = cyclistMetadata[ciclista] || {
        carrerasDisputadas: 0,
        diasCompeticion: 0,
      };

      const carr = meta.carrerasDisputadas;
      const dc = meta.diasCompeticion;
      const ppc = carr > 0 ? stats.puntos / carr : 0;
      const ppd = dc > 0 ? stats.puntos / dc : 0;

      const equipo =
        getVal(row, "Nombre_Equipo") ||
        (getVal(row, "Nombre_TG") as string);
      const pct =
        equipo && teamTotalPoints[equipo] > 0
          ? (stats.puntos / teamTotalPoints[equipo]) * 100
          : 0;

      if (carr > 0 && carr < minCarreras) minCarreras = carr;
      if (dc > 0 && dc < minDc) minDc = dc;
      if (ppc > 0 && ppc < minPpc) minPpc = ppc;
      if (ppd > 0 && ppd < minPpd) minPpd = ppd;
      if (pct > 0 && pct < minPct) minPct = pct;
    });

    return { maxPuntos, minCarreras, minDc, minPpc, minPpd, minPct };
  }, [files?.elecciones?.data, draftCyclistStats, cyclistMetadata, teamTotalPoints]);

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
        const stats = draftCyclistStats[ciclista] || {
          puntos: 0,
          victorias: 0,
        };
        const meta = cyclistMetadata[ciclista] || {
          carrerasDisputadas: 0,
          diasCompeticion: 0,
        };
        const puntos = stats.puntos;
        const victorias = stats.victorias;
        const carr = meta.carrerasDisputadas;
        const dc = meta.diasCompeticion;
        const ppc = carr > 0 ? puntos / carr : 0;
        const ppd = dc > 0 ? puntos / dc : 0;

        if (
          draftStatsFilters.minPuntos !== undefined &&
          puntos < draftStatsFilters.minPuntos
        )
          matchesStats = false;
        if (
          draftStatsFilters.minVictorias !== undefined &&
          victorias < draftStatsFilters.minVictorias
        )
          matchesStats = false;
        // ignoring the max filters if they're not in the state right now, but let's just copy them as they were.
        // Wait, draftStatsFilters only has minPuntos and minVictorias! The other ones were unused or custom.
      }

      return matchesSearch && matchesRound && matchesTeam && matchesStats;
    });
  }, [files?.elecciones?.data, draftSearchTerm, draftRoundFilter, draftTeamFilter, draftStatsFilters, draftCyclistStats, cyclistMetadata]);

  
  const draftSortedData = useMemo(() => {
    return [...draftFilteredData].sort((a, b) => {
      // Replicando la logica de sort
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

  return (
    <>

  <div className="space-y-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">
          Draft 2026
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Información y resultados del draft.
        </p>
      </div>
      <div className="flex bg-neutral-100 p-1 rounded-lg self-start">
        <button
          onClick={() => setDraftSubTab("elecciones")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            draftSubTab === "elecciones"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          Elecciones
        </button>
        <button
          onClick={() => setDraftSubTab("datos")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            draftSubTab === "datos"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          Datos
        </button>
      </div>
    </div>

    {draftSubTab === "elecciones" && (
      <div className="space-y-6">
        {!files.elecciones.data ? (
          <div className="text-center py-20 text-neutral-500 italic">
            No hay datos del draft cargados.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar ciclista..."
                    value={draftSearchTerm}
                    onChange={(e) =>
                      setDraftSearchTerm(e.target.value)
                    }
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsDraftRoundFilterOpen(
                        !isDraftRoundFilterOpen,
                      );
                      setIsDraftTeamFilterOpen(false);
                      setIsDraftStatsFilterOpen(false);
                    }}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[140px] justify-between cursor-pointer"
                  >
                    <span className="text-neutral-700">
                      {draftRoundFilter.length === 0
                        ? "Todas las rondas"
                        : `${draftRoundFilter.length} rondas`}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-neutral-400 transition-transform",
                        isDraftRoundFilterOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isDraftRoundFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                          Rondas
                        </span>
                        {draftRoundFilter.length > 0 && (
                          <button
                            onClick={() => setDraftRoundFilter([])}
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {Array.from(
                          new Set(
                            files.elecciones.data
                              .map((d) =>
                                String(getVal(d, "Ronda")),
                              )
                              .filter(Boolean),
                          ),
                        )
                          .sort(
                            (a, b) =>
                              parseInt(a as string) -
                              parseInt(b as string),
                          )
                          .map((ronda) => (
                            <label
                              key={ronda}
                              className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                                checked={draftRoundFilter.includes(
                                  ronda,
                                )}
                                onChange={() => {
                                  if (
                                    draftRoundFilter.includes(ronda)
                                  ) {
                                    setDraftRoundFilter(
                                      draftRoundFilter.filter(
                                        (r) => r !== ronda,
                                      ),
                                    );
                                  } else {
                                    setDraftRoundFilter([
                                      ...draftRoundFilter,
                                      ronda,
                                    ]);
                                  }
                                }}
                              />
                              <span className="text-sm text-neutral-700">
                                Ronda {ronda}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsDraftTeamFilterOpen(
                        !isDraftTeamFilterOpen,
                      );
                      setIsDraftRoundFilterOpen(false);
                      setIsDraftStatsFilterOpen(false);
                    }}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[160px] justify-between cursor-pointer"
                  >
                    <span className="text-neutral-700">
                      {draftTeamFilter.length === 0
                        ? "Todos los equipos"
                        : `${draftTeamFilter.length} equipos`}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-neutral-400 transition-transform",
                        isDraftTeamFilterOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isDraftTeamFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Equipos
                        </span>
                        {draftTeamFilter.length > 0 && (
                          <button
                            onClick={() => setDraftTeamFilter([])}
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {Array.from(
                          new Set(
                            files.elecciones.data
                              .map((d) =>
                                String(
                                  getVal(d, "Nombre_Equipo") ||
                                    getVal(d, "Nombre_TG"),
                                ),
                              )
                              .filter(Boolean),
                          ),
                        )
                          .sort()
                          .map((team) => (
                            <label
                              key={team}
                              className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                                checked={draftTeamFilter.includes(
                                  team,
                                )}
                                onChange={() => {
                                  if (
                                    draftTeamFilter.includes(team)
                                  ) {
                                    setDraftTeamFilter(
                                      draftTeamFilter.filter(
                                        (t) => t !== team,
                                      ),
                                    );
                                  } else {
                                    setDraftTeamFilter([
                                      ...draftTeamFilter,
                                      team,
                                    ]);
                                  }
                                }}
                              />
                              <span className="text-sm text-neutral-700">
                                {team}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsDraftStatsFilterOpen(
                        !isDraftStatsFilterOpen,
                      );
                      setIsDraftTeamFilterOpen(false);
                      setIsDraftRoundFilterOpen(false);
                    }}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[140px] justify-between cursor-pointer"
                  >
                    <span className="text-neutral-700">
                      {Object.values(draftStatsFilters).some(
                        (v) => v !== undefined && v !== "",
                      )
                        ? "Estadísticas activas"
                        : "Estadísticas"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-neutral-400 transition-transform",
                        isDraftStatsFilterOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isDraftStatsFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-96 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2 mb-3">
                        <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                          Filtros de Estadísticas
                        </span>
                        {Object.values(draftStatsFilters).some(
                          (v) =>
                            v !== undefined && String(v) !== "",
                        ) && (
                          <button
                            onClick={() => setDraftStatsFilters({})}
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                          >
                            Limpiar todo
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                        {[
                          { key: "Points", label: "Puntos" },
                          { key: "Wins", label: "Victorias (V)" },
                          { key: "Carr", label: "Carreras (C)" },
                          { key: "Dc", label: "Días Comp. (DC)" },
                          {
                            key: "Ppc",
                            label: "Pto/Carrera (P/C)",
                          },
                          { key: "Ppd", label: "Pto/Día (P/D)" },
                        ].map((stat) => (
                          <div key={stat.key} className="space-y-1">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase">
                              {stat.label}
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Min"
                                className="w-full px-2 py-1 text-xs border rounded bg-neutral-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                                value={
                                  (draftStatsFilters as any)[
                                    `min${stat.key}`
                                  ] ?? ""
                                }
                                onChange={(e) =>
                                  setDraftStatsFilters((prev) => ({
                                    ...prev,
                                    [`min${stat.key}`]: e.target
                                      .value
                                      ? Number(e.target.value)
                                      : undefined,
                                  }))
                                }
                              />
                              <span className="text-neutral-400">
                                -
                              </span>
                              <input
                                type="number"
                                placeholder="Max"
                                className="w-full px-2 py-1 text-xs border rounded bg-neutral-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                                value={
                                  (draftStatsFilters as any)[
                                    `max${stat.key}`
                                  ] ?? ""
                                }
                                onChange={(e) =>
                                  setDraftStatsFilters((prev) => ({
                                    ...prev,
                                    [`max${stat.key}`]: e.target
                                      .value
                                      ? Number(e.target.value)
                                      : undefined,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setIsDraftTableExpanded(!isDraftTableExpanded)
                  }
                  className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                  title="Ampliar"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopyDraftTableImage()}
                  className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                  title="Copiar como imagen completa"
                >
                  {isDraftTableCopying === "full" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDownloadDraftTableImage()}
                  className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                  title="Descargar imagen completa"
                >
                  <UploadCloud className="w-4 h-4" />
                </button>
              </div>
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

            {(() => {
              /* removed draftCyclistStats init */
              /* removed draftCyclistStats calc */

              /* rem maxPuntos */ const maxPuntos = draftComputedData.maxPuntos;

              // Calculate min values for coloring
              /* rem min variables */ const minCarreras=draftComputedData.minCarreras;
const minDc=draftComputedData.minDc;
const minPpc=draftComputedData.minPpc;
const minPpd=draftComputedData.minPpd;
const minPct=draftComputedData.minPct;

              // We need team total points first for % calculation
              /* removed teamTotalPoints init */
              /* removed teamTotalPoints calc */

              /* removed min mappings */

              const filteredData = draftFilteredData;

              const numBlocks = Math.ceil(filteredData.length / 50);

              return (
                <>
                  {numBlocks > 1 && (
                    <div className="flex flex-col gap-2 mt-4 copy-button-ignore">
                      <div className="flex items-center justify-end">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">
                          Copiar bloques de imagen (
                          {filteredData.length} ciclistas):
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {Array.from({ length: numBlocks }).map(
                          (_, i) => {
                            const s = `p${i + 1}`;
                            const start = i * 50 + 1;
                            const end = Math.min(
                              (i + 1) * 50,
                              filteredData.length,
                            );
                            const label = `${start}-${end}`;
                            const isCopyingThis =
                              isDraftTableCopying === s;
                            return (
                              <button
                                key={s}
                                onClick={() =>
                                  handleCopyDraftTableImage(
                                    s as any,
                                  )
                                }
                                className={cn(
                                  "px-2.5 py-1 text-[10px] rounded border font-bold transition-all shadow-sm active:scale-95",
                                  isCopyingThis
                                    ? "bg-green-600 border-green-600 text-white"
                                    : "bg-white text-blue-600 border-neutral-200 hover:bg-blue-50 hover:text-blue-700",
                                )}
                                title={`Copiar bloque ${start}-${end}`}
                              >
                                {label}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center mt-4">
                    <div
                      ref={draftTableRef}
                      className={cn(
                        "bg-white border border-neutral-200 rounded-xl overflow-hidden relative max-h-[1200px] shadow-sm inline-block max-w-full",
                        isDraftTableExpanded
                          ? "fixed inset-4 z-50 max-h-none"
                          : "",
                      )}
                    >
                      {isDraftTableExpanded && (
                        <button
                          onClick={() =>
                            setIsDraftTableExpanded(false)
                          }
                          className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      )}
                      {(() => {
                        return (
                          <div ref={parentRef} className="table-responsive-wrapper overflow-auto w-full max-h-[600px] crosshair-container"><table className="w-auto text-[11px] text-left whitespace-nowrap border-collapse mx-auto">
                            <thead
                              className={cn(
                                "bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase text-[10px] tracking-wider sticky top-0 z-10",
                              )}
                            >
                              <tr>
                                {[
                                  "Elección",
                                  "Nombre_Equipo",
                                  "Orden_Draft",
                                  "Ronda",
                                  "Ciclista",
                                  "Edad",
                                  "País",
                                  "Eq_Comp",
                                  "Puntos",
                                  "V",
                                  "C",
                                  "DC",
                                  "P/C",
                                  "P/D",
                                  "%",
                                ].map((col) => {
                                  let colTitle = col;
                                  if (col === "V")
                                    colTitle = "Victorias";
                                  if (col === "C")
                                    colTitle =
                                      "Carreras Disputadas";
                                  if (col === "DC")
                                    colTitle =
                                      "Días de Competición";
                                  if (col === "P/C")
                                    colTitle = "Puntos por Carrera";
                                  if (col === "P/D")
                                    colTitle = "Puntos por Día";
                                  if (col === "%")
                                    colTitle =
                                      "% de puntos del equipo";
                                  return (
                                    <th
                                      key={col}
                                      className={`${"px-2 py-1.5 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors text-center"} ${(col === "Ciclista" || col === "Nombre_Equipo") ? "sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]" : ""}`}
                                      title={colTitle}
                                      onClick={() => {
                                        if (
                                          draftSortColumn === col
                                        ) {
                                          setDraftSortDirection(
                                            (prev) =>
                                              prev === "asc"
                                                ? "desc"
                                                : "asc",
                                          );
                                        } else {
                                          setDraftSortColumn(col);
                                          setDraftSortDirection(
                                            "asc",
                                          );
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        {col === "Eq_Comp"
                                          ? "EQ BREVE"
                                          : col.replace("_", " ")}
                                        {draftSortColumn ===
                                          col && (
                                          <span className="text-blue-600">
                                            {draftSortDirection ===
                                            "asc"
                                              ? "↑"
                                              : "↓"}
                                          </span>
                                        )}
                                      </div>
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-neutral-100">
                              {rowVirtualizer.getVirtualItems().length > 0 && (
                                <tr><td style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} colSpan={15} /></tr>
                              )}
                              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const row = draftSortedData[virtualRow.index];
                                const idx = virtualRow.index;

                                  const ciclista =
                                    getVal(row, "Ciclista") || "";
                                  const stats = draftCyclistStats[
                                    ciclista
                                  ] || { puntos: 0, victorias: 0 };

                                  let pointsStyle = {};
                                  if (stats.puntos === 0) {
                                    pointsStyle = {
                                      backgroundColor: "#fee2e2",
                                      color: "#b91c1c",
                                    }; // red-100, red-700
                                  } else {
                                    const ratio =
                                      stats.puntos / maxPuntos;
                                    // Hue from 45 (yellow) to 142 (green)
                                    const hue =
                                      45 + ratio * (142 - 45);
                                    pointsStyle = {
                                      backgroundColor: `hsl(${hue}, 80%, 85%)`,
                                      color: `hsl(${hue}, 90%, 25%)`,
                                    };
                                  }

                                  return (
                                    <tr
                                      key={idx}
                                      className="draft-row hover:bg-neutral-50 transition-colors h-6"
                                    >
                                      <td className="px-1 py-0.5 font-medium text-neutral-900 text-center">
                                        {getVal(row, "Elección")}
                                      </td>
                                      <td className="px-1 py-0.5 text-left truncate max-w-[100px] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">
                                        {getVal(
                                          row,
                                          "Nombre_Equipo",
                                        ) ||
                                          getVal(row, "Nombre_TG")}
                                      </td>
                                      <td className="px-1 py-0.5 text-center">
                                        {getVal(row, "Orden_Draft")}
                                      </td>
                                      <td className="px-1 py-0.5 text-center">
                                        <span className="inline-flex items-center justify-center bg-neutral-100 text-neutral-600 px-1 py-px rounded text-[9px] font-bold">
                                          {getVal(row, "Ronda")}
                                        </span>
                                      </td>
                                      <td className="px-1 py-0.5 font-medium text-blue-600 text-[10px] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">
                                        {ciclista}
                                      </td>
                                      <td className="px-1 py-0.5 text-center">
                                        {getVal(row, "Edad")}
                                      </td>
                                      <td
                                        className="px-1 py-0.5 text-center"
                                        title={getVal(row, "País")}
                                      >
                                        <span className="text-xs">
                                          {getFlagEmoji(
                                            getVal(row, "País"),
                                          )}
                                        </span>
                                      </td>
                                      <td className="px-1 py-0.5 text-center text-neutral-500 truncate max-w-[80px]">
                                        {cyclistMetadata[ciclista]
                                          ?.equipoBreve ||
                                          getVal(row, "Eq_Comp")}
                                      </td>
                                      <td className="px-1 py-0.5 text-center">
                                        <span
                                          className="inline-flex items-center justify-center px-1 py-0.5 rounded font-bold min-w-[2.5rem] tracking-tight text-[10px]"
                                          style={pointsStyle}
                                        >
                                          {stats.puntos}
                                        </span>
                                      </td>
                                      <td className="px-1 py-0.5 text-center">
                                        {stats.victorias > 0 ? (
                                          <span className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 px-1 py-px rounded text-[9px] font-bold tracking-tight">
                                            {stats.victorias}
                                          </span>
                                        ) : (
                                          <span className="text-neutral-300">
                                            -
                                          </span>
                                        )}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-1 py-0.5 text-center font-mono",
                                          (cyclistMetadata[ciclista]
                                            ?.carrerasDisputadas ||
                                            0) === 0
                                            ? "text-red-500"
                                            : cyclistMetadata[
                                                  ciclista
                                                ]
                                                  ?.carrerasDisputadas ===
                                                minCarreras
                                              ? "text-orange-500 font-bold"
                                              : "",
                                        )}
                                      >
                                        {cyclistMetadata[ciclista]
                                          ?.carrerasDisputadas || 0}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-1 py-0.5 text-center font-mono",
                                          (cyclistMetadata[ciclista]
                                            ?.diasCompeticion ||
                                            0) === 0
                                            ? "text-red-500"
                                            : cyclistMetadata[
                                                  ciclista
                                                ]
                                                  ?.diasCompeticion ===
                                                minDc
                                              ? "text-orange-500 font-bold"
                                              : "",
                                        )}
                                      >
                                        {cyclistMetadata[ciclista]
                                          ?.diasCompeticion || 0}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-1 py-0.5 text-center font-mono",
                                          (cyclistMetadata[ciclista]
                                            ?.carrerasDisputadas > 0
                                            ? stats.puntos /
                                              cyclistMetadata[
                                                ciclista
                                              ].carrerasDisputadas
                                            : 0) === 0
                                            ? "text-red-500"
                                            : stats.puntos /
                                                  cyclistMetadata[
                                                    ciclista
                                                  ]
                                                    .carrerasDisputadas ===
                                                minPpc
                                              ? "text-orange-500 font-bold"
                                              : "",
                                        )}
                                      >
                                        {cyclistMetadata[ciclista]
                                          ?.carrerasDisputadas > 0
                                          ? (
                                              stats.puntos /
                                              cyclistMetadata[
                                                ciclista
                                              ].carrerasDisputadas
                                            ).toFixed(1)
                                          : "0.0"}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-1 py-0.5 text-center font-mono",
                                          (cyclistMetadata[ciclista]
                                            ?.diasCompeticion > 0
                                            ? stats.puntos /
                                              cyclistMetadata[
                                                ciclista
                                              ].diasCompeticion
                                            : 0) === 0
                                            ? "text-red-500"
                                            : stats.puntos /
                                                  cyclistMetadata[
                                                    ciclista
                                                  ]
                                                    .diasCompeticion ===
                                                minPpd
                                              ? "text-orange-500 font-bold"
                                              : "",
                                        )}
                                      >
                                        {cyclistMetadata[ciclista]
                                          ?.diasCompeticion > 0
                                          ? (
                                              stats.puntos /
                                              cyclistMetadata[
                                                ciclista
                                              ].diasCompeticion
                                            ).toFixed(1)
                                          : "0.0"}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-1 py-0.5 text-center font-mono",
                                          (() => {
                                            const eq =
                                              getVal(
                                                row,
                                                "Nombre_Equipo",
                                              ) ||
                                              (getVal(
                                                row,
                                                "Nombre_TG",
                                              ) as string);
                                            const pct =
                                              eq &&
                                              teamTotalPoints[eq] >
                                                0
                                                ? (stats.puntos /
                                                    teamTotalPoints[
                                                      eq
                                                    ]) *
                                                  100
                                                : 0;
                                            if (pct === 0)
                                              return "text-red-500";
                                            if (pct === minPct)
                                              return "text-orange-500 font-bold";
                                            return "";
                                          })(),
                                        )}
                                      >
                                        {(() => {
                                          const eq =
                                            getVal(
                                              row,
                                              "Nombre_Equipo",
                                            ) ||
                                            (getVal(
                                              row,
                                              "Nombre_TG",
                                            ) as string);
                                          const pct =
                                            eq &&
                                            teamTotalPoints[eq] > 0
                                              ? (stats.puntos /
                                                  teamTotalPoints[
                                                    eq
                                                  ]) *
                                                100
                                              : 0;
                                          return (
                                            pct.toFixed(1) + "%"
                                          );
                                        })()}
                                      </td>
                                    </tr>
                                  );
                                })}
                              {rowVirtualizer.getVirtualItems().length > 0 && (
                                <tr><td style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }} colSpan={15} /></tr>
                              )}
                            </tbody>
                          </table></div>
                        );
                      })()}
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>
    )}

    {draftSubTab === "datos" && (
      <div className="space-y-6">
        {!files.elecciones.data ? (
          <div className="text-center py-20 text-neutral-500 italic">
            No hay datos del draft cargados.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <h3 className="font-semibold text-lg text-neutral-900 leading-tight">
                  Puntos por Ronda y Equipo
                </h3>
                <p className="text-xs text-neutral-500">
                  Puntos totales conseguidos por cada elección del
                  draft.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Meses Filter */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsDraftDatosMonthFilterOpen(
                        !isDraftDatosMonthFilterOpen,
                      );
                      setIsDraftDatosCategoryFilterOpen(false);
                      setIsDraftDatosTeamFilterOpen(false);
                    }}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[120px] justify-between cursor-pointer"
                  >
                    <span className="text-neutral-700">
                      {draftDatosMonthFilter.length === 0
                        ? "Meses"
                        : `${draftDatosMonthFilter.length} meses`}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-neutral-400 transition-transform",
                        isDraftDatosMonthFilterOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isDraftDatosMonthFilterOpen && (
                    <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                          Meses
                        </span>
                        {draftDatosMonthFilter.length > 0 && (
                          <button
                            onClick={() =>
                              setDraftDatosMonthFilter([])
                            }
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {[
                          "Ene",
                          "Feb",
                          "Mar",
                          "Abr",
                          "May",
                          "Jun",
                          "Jul",
                          "Ago",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dic",
                        ].map((mes) => (
                          <label
                            key={mes}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                              checked={draftDatosMonthFilter.includes(
                                mes,
                              )}
                              onChange={() => {
                                if (
                                  draftDatosMonthFilter.includes(
                                    mes,
                                  )
                                ) {
                                  setDraftDatosMonthFilter(
                                    draftDatosMonthFilter.filter(
                                      (m) => m !== mes,
                                    ),
                                  );
                                } else {
                                  setDraftDatosMonthFilter([
                                    ...draftDatosMonthFilter,
                                    mes,
                                  ]);
                                }
                              }}
                            />
                            <span className="text-sm text-neutral-700">
                              {mes}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Categoría Filter */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsDraftDatosCategoryFilterOpen(
                        !isDraftDatosCategoryFilterOpen,
                      );
                      setIsDraftDatosMonthFilterOpen(false);
                      setIsDraftDatosTeamFilterOpen(false);
                    }}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[120px] justify-between cursor-pointer"
                  >
                    <span className="text-neutral-700">
                      {draftDatosCategoryFilter.length === 0
                        ? "Categoría"
                        : `${draftDatosCategoryFilter.length} categorías`}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-neutral-400 transition-transform",
                        isDraftDatosCategoryFilterOpen &&
                          "rotate-180",
                      )}
                    />
                  </button>
                  {isDraftDatosCategoryFilterOpen && (
                    <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                          Categorías
                        </span>
                        {draftDatosCategoryFilter.length > 0 && (
                          <button
                            onClick={() =>
                              setDraftDatosCategoryFilter([])
                            }
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {(() => {
                          /* removed smaller raceTypeByName */
                          const availableCategories =
                            new Set<string>();
                          leaderboard?.forEach((player) => {
                            player?.detalles?.forEach((d) => {
                              const cat = raceTypeByName[d.carrera];
                              if (cat) availableCategories.add(cat);
                            });
                          });
                          const items = Array.from(
                            availableCategories,
                          ).sort((a, b) => a.localeCompare(b));
                          if (items.length === 0)
                            return (
                              <div className="px-3 py-2 text-xs text-neutral-500">
                                Sin datos
                              </div>
                            );
                          return items.map((cat) => (
                            <label
                              key={cat}
                              className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                                checked={draftDatosCategoryFilter.includes(
                                  cat,
                                )}
                                onChange={() => {
                                  if (
                                    draftDatosCategoryFilter.includes(
                                      cat,
                                    )
                                  ) {
                                    setDraftDatosCategoryFilter(
                                      draftDatosCategoryFilter.filter(
                                        (c) => c !== cat,
                                      ),
                                    );
                                  } else {
                                    setDraftDatosCategoryFilter([
                                      ...draftDatosCategoryFilter,
                                      cat,
                                    ]);
                                  }
                                }}
                              />
                              <span className="text-sm text-neutral-700">
                                {cat}
                              </span>
                            </label>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Equipo Filter */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsDraftDatosTeamFilterOpen(
                        !isDraftDatosTeamFilterOpen,
                      );
                      setIsDraftDatosMonthFilterOpen(false);
                      setIsDraftDatosCategoryFilterOpen(false);
                    }}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[120px] justify-between cursor-pointer"
                  >
                    <span className="text-neutral-700">
                      {draftDatosTeamFilter.length === 0
                        ? "Equipo"
                        : `${draftDatosTeamFilter.length} equipos`}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-neutral-400 transition-transform",
                        isDraftDatosTeamFilterOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isDraftDatosTeamFilterOpen && (
                    <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                          Equipos
                        </span>
                        {draftDatosTeamFilter.length > 0 && (
                          <button
                            onClick={() =>
                              setDraftDatosTeamFilter([])
                            }
                            className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {(() => {
                          const availableTeams = new Set<string>();
                          files.elecciones?.data?.forEach((row) => {
                            const teamName =
                              getVal(row, "Nombre_Equipo") ||
                              getVal(row, "Nombre_TG");
                            if (teamName)
                              availableTeams.add(
                                teamName as string,
                              );
                          });
                          const items = Array.from(
                            availableTeams,
                          ).sort((a, b) => a.localeCompare(b));
                          if (items.length === 0)
                            return (
                              <div className="px-3 py-2 text-xs text-neutral-500">
                                Sin datos
                              </div>
                            );
                          return items.map((team) => (
                            <label
                              key={team}
                              className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                                checked={draftDatosTeamFilter.includes(
                                  team,
                                )}
                                onChange={() => {
                                  if (
                                    draftDatosTeamFilter.includes(
                                      team,
                                    )
                                  ) {
                                    setDraftDatosTeamFilter(
                                      draftDatosTeamFilter.filter(
                                        (t) => t !== team,
                                      ),
                                    );
                                  } else {
                                    setDraftDatosTeamFilter([
                                      ...draftDatosTeamFilter,
                                      team,
                                    ]);
                                  }
                                }}
                              />
                              <span
                                className="text-sm text-neutral-700 truncate"
                                title={team}
                              >
                                {team}
                              </span>
                            </label>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() =>
                    setIsDraftDatosTableExpanded(
                      !isDraftDatosTableExpanded,
                    )
                  }
                  className="p-2 ml-1 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                  title="Ampliar"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyDraftDatosTableImage}
                  className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                  title="Copiar como imagen"
                >
                  {isDraftDatosTableCopying ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={handleDownloadDraftDatosTableImage}
                  className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                  title="Descargar imagen"
                >
                  
<UploadCloud className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {(draftDatosMonthFilter.length > 0 || draftDatosCategoryFilter.length > 0 || draftDatosTeamFilter.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
                <span className="text-xs text-neutral-500 font-medium mr-1">Filtros activos:</span>
                {draftDatosMonthFilter.map(m => (
                  <span key={'m'+m} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                     {m}
                     <button onClick={() => setDraftDatosMonthFilter(draftDatosMonthFilter.filter(x => x !== m))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {draftDatosCategoryFilter.map(c => (
                  <span key={'c'+c} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                     {c}
                     <button onClick={() => setDraftDatosCategoryFilter(draftDatosCategoryFilter.filter(x => x !== c))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {draftDatosTeamFilter.map(t => (
                  <span key={'dt'+t} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                     {t}
                     <button onClick={() => setDraftDatosTeamFilter(draftDatosTeamFilter.filter(x => x !== t))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </span>
                ))}

                <button 
                   onClick={() => { setDraftDatosMonthFilter([]); setDraftDatosCategoryFilter([]); setDraftDatosTeamFilter([]); }}
                   className="text-[11px] text-neutral-500 hover:text-neutral-800 underline ml-2 transition-colors"
                >
                  Limpiar todo
                </button>
              </div>
            )}
          </div>

            <div
              ref={draftDatosTableRef}
              className={cn(
                "bg-white border border-neutral-200 rounded-xl overflow-hidden relative max-h- shadow-sm",
                isDraftDatosTableExpanded
                  ? "fixed inset-4 z-50 p-6 shadow-2xl m-0"
                  : "",
              )}
            >
              {isDraftDatosTableExpanded && (
                <button
                  onClick={() =>
                    setIsDraftDatosTableExpanded(false)
                  }
                  className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
              {(() => {
                // Compute race properties
                /* removed raceTypeByName init */
                /* removed raceDateByName init */
                /* removed race mappings calc */

                const availableMonths = new Set<string>();
                const availableCategories = new Set<string>();
                const availableTeams = new Set<string>();

                leaderboard?.forEach((player) => {
                  player?.detalles?.forEach((d) => {
                    const dateStr =
                      raceDateByName[d.carrera] || d.fecha;
                    if (dateStr) {
                      const monthStr = dateStr.split("/")[1];
                      if (monthStr) {
                        const monthNames = [
                          "Ene",
                          "Feb",
                          "Mar",
                          "Abr",
                          "May",
                          "Jun",
                          "Jul",
                          "Ago",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dic",
                        ];
                        availableMonths.add(
                          monthNames[parseInt(monthStr, 10) - 1],
                        );
                      }
                    }
                    const cat = raceTypeByName[d.carrera];
                    if (cat) availableCategories.add(cat);
                  });
                });

                files.elecciones?.data?.forEach((row) => {
                  const teamName =
                    getVal(row, "Nombre_Equipo") ||
                    getVal(row, "Nombre_TG");
                  if (teamName)
                    availableTeams.add(teamName as string);
                });

                // Pre-calculate cyclist points
                const cyclistPoints: Record<string, number> = {};
                const cyclistWins: Record<string, number> = {};
                leaderboard?.forEach((player) => {
                  player?.detalles?.forEach((d) => {
                    const dateStr =
                      raceDateByName[d.carrera] || d.fecha;
                    let matchesMonth = true;
                    if (draftDatosMonthFilter.length > 0) {
                      if (!dateStr) matchesMonth = false;
                      else {
                        const monthStr = dateStr.split("/")[1];
                        if (monthStr) {
                          const monthNames = [
                            "Ene",
                            "Feb",
                            "Mar",
                            "Abr",
                            "May",
                            "Jun",
                            "Jul",
                            "Ago",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dic",
                          ];
                          const mName =
                            monthNames[parseInt(monthStr, 10) - 1];
                          if (
                            !draftDatosMonthFilter.includes(mName)
                          )
                            matchesMonth = false;
                        } else matchesMonth = false;
                      }
                    }

                    let matchesCategory = true;
                    if (draftDatosCategoryFilter.length > 0) {
                      const cat = raceTypeByName[d.carrera];
                      if (
                        !cat ||
                        !draftDatosCategoryFilter.includes(cat)
                      )
                        matchesCategory = false;
                    }

                    if (matchesMonth && matchesCategory) {
                      cyclistPoints[d.ciclista] =
                        (cyclistPoints[d.ciclista] || 0) +
                        d.puntosObtenidos;

                      const isPos01 =
                        d.posicion === "01" || d.posicion === "1";
                      const isValidType = [
                        "Etapa",
                        "Etapa (Crono equipos)",
                        "Clasificación final",
                        "Clasificación final (Crono equipos)",
                        "Clásica",
                      ].includes(d.tipoResultado);

                      if (isPos01 && isValidType) {
                        cyclistWins[d.ciclista] =
                          (cyclistWins[d.ciclista] || 0) + 1;
                      }
                    }
                  });
                });

                // Map teams, rounds and orders
                const teamRoundData: Record<
                  string,
                  Record<number, number>
                > = {};
                const teamRoundCyclist: Record<
                  string,
                  Record<number, any>
                > = {};
                const teamOrderMap: Record<string, string> = {};
                const teamsSet = new Set<string>();

                files.elecciones?.data?.forEach((row) => {
                  const teamName = (getVal(row, "Nombre_Equipo") ||
                    getVal(row, "Nombre_TG")) as string;
                  const round = parseInt(getVal(row, "Ronda"));
                  const cyclist = getVal(row, "Ciclista") as string;
                  const order = getVal(row, "Orden_Draft");

                  if (teamName && !isNaN(round)) {
                    if (
                      draftDatosTeamFilter.length === 0 ||
                      draftDatosTeamFilter.includes(teamName)
                    ) {
                      teamsSet.add(teamName);
                      if (!teamRoundData[teamName]) {
                        teamRoundData[teamName] = {};
                        teamRoundCyclist[teamName] = {};
                      }
                      teamRoundData[teamName][round] =
                        cyclistPoints[cyclist] || 0;
                      teamRoundCyclist[teamName][round] = row;
                      if (order) teamOrderMap[teamName] = order;
                    }
                  }
                });

                const sortedTeams = Array.from(teamsSet).sort(
                  (a, b) => {
                    if (draftDatosSortColumn === "Orden") {
                      const orderA = parseInt(
                        teamOrderMap[a] || "0",
                      );
                      const orderB = parseInt(
                        teamOrderMap[b] || "0",
                      );
                      return draftDatosSortDirection === "asc"
                        ? orderA - orderB
                        : orderB - orderA;
                    }
                    if (draftDatosSortColumn === "TOTAL") {
                      const totalA = rounds.reduce(
                        (sum, r) =>
                          sum + (teamRoundData[a][r] || 0),
                        0,
                      );
                      const totalB = rounds.reduce(
                        (sum, r) =>
                          sum + (teamRoundData[b][r] || 0),
                        0,
                      );
                      return draftDatosSortDirection === "asc"
                        ? totalA - totalB
                        : totalB - totalA;
                    }
                    if (draftDatosSortColumn.startsWith("R")) {
                      const round = parseInt(
                        draftDatosSortColumn.substring(1),
                      );
                      const ptsA = teamRoundData[a][round] || 0;
                      const ptsB = teamRoundData[b][round] || 0;
                      return draftDatosSortDirection === "asc"
                        ? ptsA - ptsB
                        : ptsB - ptsA;
                    }
                    // Default sort by order
                    const orderA = parseInt(teamOrderMap[a] || "0");
                    const orderB = parseInt(teamOrderMap[b] || "0");
                    return orderA - orderB;
                  },
                );
                const rounds = Array.from(
                  { length: 25 },
                  (_, i) => i + 1,
                );

                // 3. Calculate max and min (min > 0) per round
                const roundStats: Record<
                  number,
                  { max: number; min: number }
                > = {};
                rounds.forEach((r) => {
                  const pointsInRound = sortedTeams.map(
                    (t) => teamRoundData[t][r] || 0,
                  );
                  const positivePoints = pointsInRound.filter(
                    (p) => p > 0,
                  );
                  roundStats[r] = {
                    max: Math.max(...pointsInRound),
                    min:
                      positivePoints.length > 0
                        ? Math.min(...positivePoints)
                        : 0,
                  };
                });

                return (
                  <div className="table-responsive-wrapper overflow-auto w-full h-full crosshair-container"><table className="w-full min-w-[600px] text-xs text-left whitespace-nowrap border-collapse">
                    <thead
                      className={cn(
                        "bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase text-[10px] tracking-wider sticky top-0 z-10",
                      )}
                    >
                      <tr>
                        <th
                          className="px-4 py-3 font-bold text-neutral-900 border-r border-neutral-200 bg-neutral-50 sticky left-0 z-20 cursor-pointer hover:bg-neutral-100"
                          onClick={() => {
                            if (draftDatosSortColumn === "Orden") {
                              setDraftDatosSortDirection((prev) =>
                                prev === "asc" ? "desc" : "asc",
                              );
                            } else {
                              setDraftDatosSortColumn("Orden");
                              setDraftDatosSortDirection("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            Equipo{" "}
                            {draftDatosSortColumn === "Orden" &&
                              (draftDatosSortDirection === "asc"
                                ? "↑"
                                : "↓")}
                          </div>
                        </th>
                        {rounds.map((r) => (
                          <th
                            key={r}
                            className="px-2 py-3 text-center font-bold text-neutral-500 border-r border-neutral-100 min-w-[3rem] cursor-pointer hover:bg-neutral-100"
                            onClick={() => {
                              const col = `R${r}`;
                              if (draftDatosSortColumn === col) {
                                setDraftDatosSortDirection(
                                  (prev) =>
                                    prev === "asc" ? "desc" : "asc",
                                );
                              } else {
                                setDraftDatosSortColumn(col);
                                setDraftDatosSortDirection("desc");
                              }
                            }}
                          >
                            <div className="flex items-center justify-center gap-1">
                              R{r}{" "}
                              {draftDatosSortColumn === `R${r}` &&
                                (draftDatosSortDirection === "asc"
                                  ? "↑"
                                  : "↓")}
                            </div>
                          </th>
                        ))}
                        <th
                          className="px-4 py-3 text-right font-bold text-blue-600 bg-blue-50/50 cursor-pointer hover:bg-blue-100/50"
                          onClick={() => {
                            if (draftDatosSortColumn === "TOTAL") {
                              setDraftDatosSortDirection((prev) =>
                                prev === "asc" ? "desc" : "asc",
                              );
                            } else {
                              setDraftDatosSortColumn("TOTAL");
                              setDraftDatosSortDirection("desc");
                            }
                          }}
                        >
                          <div className="flex items-center justify-end gap-1">
                            TOTAL{" "}
                            {draftDatosSortColumn === "TOTAL" &&
                              (draftDatosSortDirection === "asc"
                                ? "↑"
                                : "↓")}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {sortedTeams.map((team) => {
                        let teamTotal = 0;
                        const teamOrder = teamOrderMap[team] || "?";
                        return (
                          <tr
                            key={team}
                            className="hover:bg-neutral-50 transition-colors"
                          >
                            <td className="px-4 py-2 font-medium text-neutral-900 border-r border-neutral-200 bg-white sticky left-0 z-10">
                              {team}{" "}
                              <span className="text-[10px] text-neutral-400 font-normal">
                                [#{teamOrder}]
                              </span>
                            </td>
                            {rounds.map((r) => {
                              const pts =
                                teamRoundData[team][r] || 0;
                              teamTotal += pts;

                              const isMax =
                                pts > 0 &&
                                pts === roundStats[r].max;
                              const isMin =
                                pts > 0 &&
                                pts === roundStats[r].min;
                              const isZero = pts === 0;

                              let cellStyle = {};
                              if (isZero) {
                                cellStyle = {
                                  backgroundColor: "#fee2e2",
                                }; // red-100
                              } else if (isMax) {
                                cellStyle = {
                                  backgroundColor: "#dcfce7",
                                  color: "#166534",
                                  fontWeight: "bold",
                                }; // green-100, green-800
                              } else if (isMin) {
                                cellStyle = {
                                  backgroundColor: "#fef9c3",
                                  color: "#854d0e",
                                }; // yellow-100, yellow-800
                              }

                              const cyclistRow =
                                teamRoundCyclist[team][r];
                              const cyclistName = cyclistRow
                                ? getVal(cyclistRow, "Ciclista")
                                : undefined;
                              const eqComp = cyclistRow
                                ? getVal(cyclistRow, "Eq_Comp")
                                : undefined;
                              const order = cyclistRow
                                ? getVal(cyclistRow, "Orden_Draft")
                                : undefined;
                              const wins = cyclistName
                                ? cyclistWins[cyclistName] || 0
                                : 0;
                              const meta = cyclistName
                                ? cyclistMetadata[cyclistName] || {
                                    carrerasDisputadas: 0,
                                    diasCompeticion: 0,
                                  }
                                : {
                                    carrerasDisputadas: 0,
                                    diasCompeticion: 0,
                                  };
                              const ppc =
                                meta.carrerasDisputadas > 0
                                  ? pts / meta.carrerasDisputadas
                                  : 0;
                              const ppdc =
                                meta.diasCompeticion > 0
                                  ? pts / meta.diasCompeticion
                                  : 0;

                              return (
                                <td
                                  key={r}
                                  className={cn(
                                    "px-2 py-2 text-center border-r border-neutral-100",
                                    isZero
                                      ? "text-red-400"
                                      : "text-neutral-900",
                                  )}
                                  style={cellStyle}
                                  onMouseEnter={(e) => {
                                    if (cyclistName) {
                                      setDraftDatosTooltip({
                                        show: true,
                                        x: e.clientX,
                                        y: e.clientY,
                                        data: {
                                          cyclistName,
                                          eqComp,
                                          r,
                                          order,
                                          wins,
                                          pts,
                                          meta,
                                          ppc,
                                          ppdc,
                                        },
                                      });
                                    }
                                  }}
                                  onMouseMove={(e) => {
                                    if (
                                      cyclistName &&
                                      draftDatosTooltip
                                    ) {
                                      setDraftDatosTooltip(
                                        (prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                x: e.clientX,
                                                y: e.clientY,
                                              }
                                            : null,
                                      );
                                    }
                                  }}
                                  onMouseLeave={() =>
                                    setDraftDatosTooltip(null)
                                  }
                                >
                                  <span className="cursor-default">
                                    {pts > 0 ? pts : "0"}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="px-4 py-2 text-right font-bold text-blue-700 bg-blue-50/30">
                              {teamTotal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table></div>
                );
              })()}
            </div>

            {/* Resumen de Rendimiento */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="min-w-0 pr-4">
                  <h3 className="flex items-center gap-2 font-bold text-lg text-neutral-900 min-w-0">
                    <Activity className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="truncate">Resumen de Rendimiento del Draft</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">
                    Clasificación de selecciones por equipo según
                    los puntos medios conseguidos por ronda.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-end md:self-start shrink-0 copy-button-ignore">
                  <button
                    onClick={() => setIsDraftSummaryExpanded(true)}
                    className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white shadow-sm border border-neutral-100"
                    title="Ampliar tabla"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (draftSummaryTableRef.current) {
                        let restore = () => {};
                        try {
                          
                          
                          
                          restore = expandNodeForCapture(draftSummaryTableRef.current);
                          const dataUrl = await domToDataUrl(
                            draftSummaryTableRef.current,
                            {
                              scale: 3, 
        
        backgroundColor: '#ffffff',
                              style: { overflow: "visible" },
                            },
                          );
                          const blob = await (
                            await fetch(dataUrl)
                          ).blob();
                          if (typeof ClipboardItem !== "undefined") {
                            const clipboardItem = new ClipboardItem({
                              [blob.type]: blob,
                            });
                            await navigator.clipboard.write([
                              clipboardItem,
                            ]);
                          }
                        } catch (err) {
                          console.error(
                            "Error al copiar imagen:",
                            err,
                          );
                        } finally {
                          restore();
                        }
                      }
                    }}
                    className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white shadow-sm border border-neutral-100"
                    title="Copiar como imagen"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      // Logic to copy table as text
                      const table =
                        draftSummaryTableRef.current?.querySelector(
                          "table",
                        );
                      if (table) {
                        let text = "";
                        const rows = table.querySelectorAll("tr");
                        rows.forEach((row) => {
                          const cols =
                            row.querySelectorAll("th, td");
                          const rowData = Array.from(cols)
                            .map(
                              (col) =>
                                (
                                  col as HTMLElement
                                ).textContent?.trim() || "",
                            )
                            .join("\t");
                          text += rowData + "\n";
                        });
                        navigator.clipboard.writeText(text);
                      }
                    }}
                    className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white shadow-sm border border-neutral-100"
                    title="Copiar como texto (Excel)"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (draftSummaryTableRef.current) {
                        let restore = () => {};
                        try {
                          
                          
                          
                          restore = expandNodeForCapture(draftSummaryTableRef.current);
                          const dataUrl = await domToDataUrl(
                            draftSummaryTableRef.current,
                            {
                              scale: 3, 
        
        backgroundColor: '#ffffff',
                              style: { overflow: "visible" },
                            },
                          );
                          const link = document.createElement("a");
                          link.download = `resumen-draft-${new Date().toISOString().split("T")[0]}.png`;
                          link.href = dataUrl;
                          link.click();
                        } catch (err) {
                          console.error(
                            "Error al descargar imagen:",
                            err,
                          );
                        } finally {
                          restore();
                        }
                      }
                    }}
                    className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white shadow-sm border border-neutral-100"
                    title="Descargar imagen"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <div className="relative group ml-1">
                    <button className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white shadow-sm border border-neutral-100">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 invisible group-hover:visible translate-y-1 group-hover:translate-y-0 transition-all opacity-0 group-hover:opacity-100 ring-1 ring-black/5 pointer-events-none group-hover:pointer-events-auto">
                      <h4 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2 mb-3 text-sm">
                        Criterios de Clasificación
                      </h4>
                      <ul className="space-y-3 text-xs text-neutral-600">
                        <li className="flex gap-3">
                          <span className="w-5 h-5 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold shadow-sm">
                            G
                          </span>
                          <span>
                            <strong className="text-blue-700">
                              Ganador:
                            </strong>{" "}
                            Selección con la puntuación máxima
                            absoluta en su ronda.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-5 h-5 rounded-lg bg-green-100 text-green-700 flex items-center justify-center shrink-0 font-bold shadow-sm">
                            B
                          </span>
                          <span>
                            <strong className="text-green-700">
                              Buenos:
                            </strong>{" "}
                            Selección igual o superior a la media de
                            su ronda.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-5 h-5 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 font-bold shadow-sm">
                            M
                          </span>
                          <span>
                            <strong className="text-orange-700">
                              Malos:
                            </strong>{" "}
                            Selección por debajo de la media de su
                            ronda.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-5 h-5 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 font-bold shadow-sm">
                            S
                          </span>
                          <span>
                            <strong className="text-neutral-900">
                              Sin Puntos:
                            </strong>{" "}
                            Ciclistas que no han sumado puntos (0
                            pts).
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-5 h-5 rounded-lg bg-green-50 bg-opacity-50 border border-green-200 text-green-700 flex items-center justify-center shrink-0 font-bold shadow-sm">
                            %
                          </span>
                          <span>
                            <strong className="text-green-700">
                              Eficiencia:
                            </strong>{" "}
                            Porcentaje de picks buenos sobre el
                            total de las elecciones de ese equipo.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {(() => {
                // Points extraction (no changes here logically, but re-structured for clarity)
                /* removed raceTypeByName init */
                /* removed raceDateByName init */
                /* removed race mappings calc */

                const cyclistPointsQ: Record<string, number> = {};
                leaderboard?.forEach((player) => {
                  player?.detalles?.forEach((d) => {
                    const dateStr =
                      raceDateByName[d.carrera] || d.fecha;
                    let matchesMonth = true;
                    if (draftDatosMonthFilter.length > 0) {
                      if (!dateStr) matchesMonth = false;
                      else {
                        const monthStr = dateStr.split("/")[1];
                        if (monthStr) {
                          const monthNames = [
                            "Ene",
                            "Feb",
                            "Mar",
                            "Abr",
                            "May",
                            "Jun",
                            "Jul",
                            "Ago",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dic",
                          ];
                          const mName =
                            monthNames[parseInt(monthStr, 10) - 1];
                          if (
                            !draftDatosMonthFilter.includes(mName)
                          )
                            matchesMonth = false;
                        } else matchesMonth = false;
                      }
                    }

                    let matchesCategory = true;
                    if (draftDatosCategoryFilter.length > 0) {
                      const cat = raceTypeByName[d.carrera];
                      if (
                        !cat ||
                        !draftDatosCategoryFilter.includes(cat)
                      )
                        matchesCategory = false;
                    }

                    if (matchesMonth && matchesCategory) {
                      cyclistPointsQ[d.ciclista] =
                        (cyclistPointsQ[d.ciclista] || 0) +
                        d.puntosObtenidos;
                    }
                  });
                });

                const statsArray: any[] = [];
                files.elecciones?.data?.forEach((row) => {
                  const teamName = (getVal(row, "Nombre_Equipo") ||
                    getVal(row, "Nombre_TG")) as string;
                  const ronda = parseInt(getVal(row, "Ronda"));
                  const ciclista = getVal(
                    row,
                    "Ciclista",
                  ) as string;

                  if (teamName && !isNaN(ronda)) {
                    if (
                      draftDatosTeamFilter.length === 0 ||
                      draftDatosTeamFilter.includes(teamName)
                    ) {
                      const pts = cyclistPointsQ[ciclista] || 0;
                      statsArray.push({
                        ciclista,
                        equipo: teamName,
                        ronda,
                        puntos: pts,
                      });
                    }
                  }
                });

                if (statsArray.length === 0) {
                  return (
                    <div className="text-sm text-neutral-500 italic">
                      No hay suficientes datos.
                    </div>
                  );
                }

                const teamData: Record<
                  string,
                  Record<
                    number,
                    { ciclista: string; puntos: number }[]
                  >
                > = {};
                const roundPoints: Record<number, number[]> = {};
                const allTeamsSet = new Set<string>();

                statsArray.forEach((s) => {
                  allTeamsSet.add(s.equipo);
                  if (!teamData[s.equipo]) teamData[s.equipo] = {};
                  if (!teamData[s.equipo][s.ronda])
                    teamData[s.equipo][s.ronda] = [];
                  teamData[s.equipo][s.ronda].push({
                    ciclista: s.ciclista,
                    puntos: s.puntos,
                  });

                  if (!roundPoints[s.ronda])
                    roundPoints[s.ronda] = [];
                  roundPoints[s.ronda].push(s.puntos);
                });

                const roundStats: Record<
                  number,
                  { max: number; avg: number }
                > = {};
                const roundsList = Object.keys(roundPoints).map(
                  (r) => parseInt(r),
                );
                roundsList.forEach((r) => {
                  const pts = roundPoints[r];
                  roundStats[r] = {
                    max: Math.max(...pts),
                    avg:
                      pts.reduce((sum, val) => sum + val, 0) /
                      pts.length,
                  };
                });

                const teamSummaries = Array.from(allTeamsSet).map(
                  (team) => {
                    let pickGanador = 0;
                    let buenosPicks = 0;
                    let malosPicks = 0;
                    let sinPuntuar = 0;
                    let totalPoints = 0;
                    let totalPicks = 0;

                    const ganadoresList: string[] = [];
                    const buenosList: string[] = [];
                    const malosList: string[] = [];
                    const sinPuntuarList: string[] = [];

                    roundsList.forEach((r) => {
                      const ptsArray = teamData[team]?.[r] || [];
                      ptsArray.forEach((item) => {
                        const pts = item.puntos;
                        const name = item.ciclista;
                        totalPoints += pts;
                        totalPicks++;
                        if (pts === 0) {
                          sinPuntuar++;
                          sinPuntuarList.push(name);
                          malosPicks++;
                        } else if (
                          pts === roundStats[r].max &&
                          roundStats[r].max > 0
                        ) {
                          pickGanador++;
                          ganadoresList.push(name);
                          // Also counted as "bueno" for the table percentage
                          buenosPicks++;
                        } else if (pts >= roundStats[r].avg) {
                          buenosPicks++;
                          buenosList.push(name);
                        } else {
                          malosPicks++;
                          malosList.push(name);
                        }
                      });
                    });

                    return {
                      team,
                      pickGanador,
                      buenosPicks,
                      malosPicks,
                      sinPuntuar,
                      totalPoints,
                      totalPicks,
                      ganadoresList,
                      buenosList,
                      malosList,
                      sinPuntuarList,
                      pctGanadores:
                        totalPicks > 0
                          ? (pickGanador / totalPicks) * 100
                          : 0,
                      pctBuenos:
                        totalPicks > 0
                          ? (buenosPicks / totalPicks) * 100
                          : 0,
                      pctMalos:
                        totalPicks > 0
                          ? (malosPicks / totalPicks) * 100
                          : 0,
                      pctSinPuntuar:
                        totalPicks > 0
                          ? (sinPuntuar / totalPicks) * 100
                          : 0,
                    };
                  },
                );

                // Ordenación dinámica
                const sortedSummaries = [...teamSummaries].sort(
                  (a: any, b: any) => {
                    const getVal = (item: any) =>
                      draftSummarySort.keys.reduce(
                        (sum, k) => sum + (Number(item[k]) || 0),
                        0,
                      );
                    const valA = getVal(a);
                    const valB = getVal(b);
                    if (draftSummarySort.order === "asc")
                      return valA > valB ? 1 : -1;
                    return valA < valB ? 1 : -1;
                  },
                );

                // Cálculo de máximos y mínimos para el coloreado
                const maxPickGanador = Math.max(
                  ...teamSummaries.map((t) => t.pickGanador),
                );
                const minPickGanador = Math.min(
                  ...teamSummaries.map((t) => t.pickGanador),
                );

                const maxBuenosPicks = Math.max(
                  ...teamSummaries.map((t) => t.buenosPicks),
                );
                const minBuenosPicks = Math.min(
                  ...teamSummaries.map((t) => t.buenosPicks),
                );

                const maxMalosPicks = Math.max(
                  ...teamSummaries.map((t) => t.malosPicks),
                );
                const minMalosPicks = Math.min(
                  ...teamSummaries.map((t) => t.malosPicks),
                );

                const maxSinPuntuar = Math.max(
                  ...teamSummaries.map((t) => t.sinPuntuar),
                );
                const minSinPuntuar = Math.min(
                  ...teamSummaries.map((t) => t.sinPuntuar),
                );

                const maxTotalPoints = Math.max(
                  ...teamSummaries.map((t) => t.totalPoints),
                );
                const minTotalPoints = Math.min(
                  ...teamSummaries.map((t) => t.totalPoints),
                );

                const toggleSort = (key: string) => {
                  setDraftSummarySort((prev) => {
                    const isSingleMatch =
                      prev.keys.length === 1 &&
                      prev.keys[0] === key;
                    return {
                      keys: [key],
                      order: isSingleMatch
                        ? prev.order === "asc"
                          ? "desc"
                          : "asc"
                        : "desc",
                    };
                  });
                };

                const SortIcon = ({ col }: { col: string }) => {
                  const isActive =
                    draftSummarySort.keys.length === 1 &&
                    draftSummarySort.keys[0] === col;
                  if (!isActive)
                    return (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    );
                  return draftSummarySort.order === "asc" ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  );
                };

                // Data for Chart
                const chartData = sortedSummaries.map((s) => {
                  const jugador = teamToPlayerMap[s.team] || s.team;
                  const order = playerOrderMap[jugador];
                  const equipoVisual = order
                    ? `${s.team} [#${order}]`
                    : s.team;
                  return {
                    equipo: equipoVisual,
                    fullEquipo: s.team,
                    ganador: s.pickGanador,
                    bueno: s.buenosPicks - s.pickGanador, // Stacked independent
                    malo: s.malosPicks - s.sinPuntuar,
                    nulo: s.sinPuntuar,
                    totalPicks: s.totalPicks,
                    ganadorList: s.ganadoresList,
                    buenoList: s.buenosList,
                    maloList: s.malosList,
                    nuloList: s.sinPuntuarList,
                    pctBuenos: s.pctBuenos.toFixed(1),
                    pctGanadores: s.pctGanadores.toFixed(1),
                  };
                });

                const CustomDraftTooltip = ({
                  active,
                  payload,
                  label,
                }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-2xl text-xs max-w-xs ring-1 ring-black/5">
                        <div className="font-bold border-b border-neutral-100 pb-2 mb-3 text-sm text-neutral-900 truncate">
                          {data.fullEquipo}
                        </div>
                        <div className="space-y-4">
                          {payload.map((entry: any) => {
                            const list =
                              data[entry.dataKey + "List"] || [];
                            if (
                              entry.value === 0 &&
                              list.length === 0
                            )
                              return null;

                            // Label adjustment for "bueno" vs "buenosPicks"
                            let displayLabel = entry.name;
                            let displayValue = entry.value;
                            if (entry.dataKey === "bueno") {
                              displayValue =
                                data.ganador + data.bueno;
                              displayLabel =
                                "Picks Buenos (incl. ganadores)";
                            }

                            return (
                              <div key={entry.dataKey}>
                                <div className="flex items-center justify-between gap-4 mb-1">
                                  <div
                                    className="flex items-center gap-1.5 font-bold"
                                    style={{ color: entry.fill }}
                                  >
                                    <div
                                      className="w-2.5 h-2.5 rounded-sm"
                                      style={{
                                        backgroundColor: entry.fill,
                                      }}
                                    />
                                    {entry.name}
                                  </div>
                                  <div className="font-mono bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-100 text-neutral-600">
                                    {entry.value} (
                                    {(
                                      (entry.value /
                                        data.totalPicks) *
                                      100
                                    ).toFixed(0)}
                                    %)
                                  </div>
                                </div>
                                {list.length > 0 && (
                                  <div className="pl-4 text-neutral-500 leading-relaxed italic border-l-2 border-neutral-100 ml-1.25 py-0.5">
                                    {list.join(", ")}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 pt-2 border-t border-neutral-100 flex justify-between items-center text-[10px] text-neutral-400 font-medium">
                          <span>
                            Total Picks: {data.totalPicks}
                          </span>
                          <span className="text-green-600">
                            Eficiencia: {data.pctBuenos}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                };

                return (
                  <div className="space-y-8">
                    <div
                      className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm bg-white"
                      ref={draftSummaryTableRef}
                    >
                      <div className="table-responsive-wrapper overflow-auto w-full h-full crosshair-container"><table className="w-full min-w-[600px] text-sm text-left border-collapse">
                        <thead className="text-[10px] text-neutral-500 uppercase bg-neutral-50/80 backdrop-blur sticky top-0 z-10">
                          <tr>
                            <th className="px-3 py-2.5 font-bold border-b border-neutral-200 sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]">
                              Equipo
                            </th>
                            <th
                              className="px-3 py-2.5 font-bold border-b border-neutral-200 text-center cursor-pointer hover:bg-blue-100/50 transition-colors"
                              onClick={() =>
                                toggleSort("pctGanadores")
                              }
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-blue-700">
                                  Ganadores
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="normal-case font-medium text-[9px] opacity-70">
                                    %
                                  </span>
                                  <SortIcon col="pctGanadores" />
                                </div>
                              </div>
                            </th>
                            <th
                              className="px-3 py-2.5 font-bold border-b border-neutral-200 text-center cursor-pointer hover:bg-green-100/50 transition-colors"
                              onClick={() =>
                                toggleSort("pctBuenos")
                              }
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-green-700">
                                  Buenos
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="normal-case font-medium text-[9px] opacity-70">
                                    %
                                  </span>
                                  <SortIcon col="pctBuenos" />
                                </div>
                              </div>
                            </th>
                            <th
                              className="px-3 py-2.5 font-bold border-b border-neutral-200 text-center cursor-pointer hover:bg-orange-100/50 transition-colors"
                              onClick={() => toggleSort("pctMalos")}
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-orange-700">
                                  Malos
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="normal-case font-medium text-[9px] opacity-70">
                                    %
                                  </span>
                                  <SortIcon col="pctMalos" />
                                </div>
                              </div>
                            </th>
                            <th
                              className="px-3 py-2.5 font-bold border-b border-neutral-200 text-center cursor-pointer hover:bg-neutral-200 transition-colors"
                              onClick={() =>
                                toggleSort("pctSinPuntuar")
                              }
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-neutral-700">
                                  Sin Puntos
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="normal-case font-medium text-[9px] opacity-70">
                                    %
                                  </span>
                                  <SortIcon col="pctSinPuntuar" />
                                </div>
                              </div>
                            </th>
                            <th
                              className="px-3 py-2.5 font-bold border-b border-neutral-200 text-center cursor-pointer hover:bg-green-100/50 transition-colors"
                              onClick={() =>
                                toggleSort("pctBuenos")
                              }
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-green-800">
                                  Eficiencia
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="normal-case font-medium text-[9px] opacity-70">
                                    %
                                  </span>
                                  <SortIcon col="pctBuenos" />
                                </div>
                              </div>
                            </th>
                            <th
                              className="px-3 py-2.5 font-bold border-b border-neutral-200 text-right cursor-pointer hover:bg-neutral-100 transition-colors"
                              onClick={() =>
                                toggleSort("totalPoints")
                              }
                            >
                              <div className="flex items-center justify-end gap-1.5">
                                <span>Total Pts</span>
                                <SortIcon col="totalPoints" />
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {sortedSummaries.map((summary, idx) => {
                            const jugador =
                              teamToPlayerMap[summary.team] ||
                              summary.team;
                            const order = playerOrderMap[jugador];
                            const teamFormatted = order
                              ? `${summary.team} [#${order}]`
                              : summary.team;

                            const isMaxPG =
                              summary.pickGanador ===
                                maxPickGanador &&
                              maxPickGanador !== minPickGanador;
                            const isMinPG =
                              summary.pickGanador ===
                                minPickGanador &&
                              maxPickGanador !== minPickGanador;

                            const isMaxBP =
                              summary.buenosPicks ===
                                maxBuenosPicks &&
                              maxBuenosPicks !== minBuenosPicks;
                            const isMinBP =
                              summary.buenosPicks ===
                                minBuenosPicks &&
                              maxBuenosPicks !== minBuenosPicks;

                            const isMaxMP =
                              summary.malosPicks ===
                                maxMalosPicks &&
                              maxMalosPicks !== minMalosPicks;
                            const isMinMP =
                              summary.malosPicks ===
                                minMalosPicks &&
                              maxMalosPicks !== minMalosPicks;

                            const isMaxSP =
                              summary.sinPuntuar ===
                                maxSinPuntuar &&
                              maxSinPuntuar !== minSinPuntuar;
                            const isMinSP =
                              summary.sinPuntuar ===
                                minSinPuntuar &&
                              maxSinPuntuar !== minSinPuntuar;

                            const isMaxTP =
                              summary.totalPoints ===
                                maxTotalPoints &&
                              maxTotalPoints !== minTotalPoints;
                            const isMinTP =
                              summary.totalPoints ===
                                minTotalPoints &&
                              maxTotalPoints !== minTotalPoints;

                            return (
                              <tr
                                key={summary.team}
                                className="hover:bg-neutral-50/80 transition-colors"
                              >
                                <td className="px-3 py-1.5 font-medium text-neutral-900 border-r border-neutral-100 flex items-center gap-2">
                                  <div className="w-4 h-4 rounded flex items-center justify-center bg-neutral-100/80 text-[9px] text-neutral-500 shrink-0 select-none">
                                    {idx + 1}
                                  </div>
                                  <span
                                    className="truncate max-w-[140px]"
                                    title={summary.team}
                                  >
                                    {teamFormatted}
                                  </span>
                                </td>
                                <td
                                  className={cn(
                                    "px-2 py-1 text-center text-sm font-bold",
                                    isMaxPG
                                      ? "text-green-700 bg-green-100/80"
                                      : isMinPG
                                        ? "text-red-700 bg-red-100/80"
                                        : "text-blue-700 bg-blue-50/30",
                                  )}
                                >
                                  <div className="flex flex-col">
                                    <span>
                                      {summary.pickGanador}
                                    </span>
                                    <span className="text-[10px] opacity-60 font-medium">
                                      {summary.pctGanadores.toFixed(
                                        1,
                                      )}
                                      %
                                    </span>
                                  </div>
                                </td>
                                <td
                                  className={cn(
                                    "px-2 py-1 text-center text-sm font-semibold",
                                    isMaxBP
                                      ? "text-green-700 bg-green-100/80"
                                      : isMinBP
                                        ? "text-red-700 bg-red-100/80"
                                        : "text-green-700 bg-green-50/30",
                                  )}
                                >
                                  <div className="flex flex-col">
                                    <span>
                                      {summary.buenosPicks}
                                    </span>
                                    <span className="text-[10px] opacity-60 font-medium">
                                      {summary.pctBuenos.toFixed(1)}
                                      %
                                    </span>
                                  </div>
                                </td>
                                <td
                                  className={cn(
                                    "px-2 py-1 text-center text-sm font-medium",
                                    isMaxMP
                                      ? "text-red-700 bg-red-100/80"
                                      : isMinMP
                                        ? "text-green-700 bg-green-100/80"
                                        : "text-orange-700 bg-orange-50/30",
                                  )}
                                >
                                  <div className="flex flex-col">
                                    <span>
                                      {summary.malosPicks}
                                    </span>
                                    <span className="text-[10px] opacity-60 font-medium">
                                      {summary.pctMalos.toFixed(1)}%
                                    </span>
                                  </div>
                                </td>
                                <td
                                  className={cn(
                                    "px-2 py-1 text-center text-sm font-medium",
                                    isMaxSP
                                      ? "text-red-700 bg-red-100/80"
                                      : isMinSP
                                        ? "text-green-700 bg-green-100/80"
                                        : "text-neutral-600 bg-neutral-100/30 font-medium",
                                  )}
                                >
                                  <div className="flex flex-col">
                                    <span>
                                      {summary.sinPuntuar}
                                    </span>
                                    <span className="text-[10px] opacity-60 font-medium">
                                      {summary.pctSinPuntuar.toFixed(
                                        1,
                                      )}
                                      %
                                    </span>
                                  </div>
                                </td>
                                <td className="px-2 py-1 text-center text-sm font-bold text-green-800 bg-green-50 border-x border-neutral-100/80">
                                  {summary.pctBuenos.toFixed(1)}%
                                </td>
                                <td
                                  className={cn(
                                    "px-3 py-1.5 text-right tabular-nums text-sm",
                                    isMaxTP
                                      ? "text-green-700 font-black bg-green-50"
                                      : isMinTP
                                        ? "text-red-700 font-black bg-red-50"
                                        : "font-bold text-neutral-900",
                                  )}
                                >
                                  {summary.totalPoints.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table></div>
                    </div>

                    <div
                      className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm overflow-hidden"
                      ref={draftChartRef}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="min-w-0 pr-4">
                          <h3 className="font-semibold text-lg text-neutral-900 flex items-center gap-2 min-w-0">
                            <BarChart3 className="w-5 h-5 text-blue-600 shrink-0" />
                            <span className="truncate">Rentabilidad de Picks por Equipo</span>
                          </h3>
                          <p className="text-xs text-neutral-500 mt-1 truncate">
                            Eficiencia relativa según segmentación
                            de rendimiento por ronda
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0 copy-button-ignore">
                          <div className="flex items-center gap-1 bg-neutral-50 p-1 rounded-lg border border-neutral-100">
                            <span className="text-[10px] text-neutral-400 font-bold px-2 uppercase tracking-wider">
                              Ordenar por:
                            </span>
                            <details className="relative group">
                              <summary className="text-xs bg-white border border-neutral-200 rounded-md px-3 py-1.5 outline-none font-medium flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                <span>
                                  Opciones (
                                  {draftSummarySort.keys.length})
                                </span>
                                <ChevronDown className="w-3 h-3" />
                              </summary>
                              <div className="absolute right-0 top-full mt-1 w-48 p-2 bg-white border border-neutral-200 rounded-xl shadow-xl z-[100] flex flex-col gap-1">
                                {[
                                  {
                                    id: "pctGanadores",
                                    label: "% Ganadores",
                                  },
                                  {
                                    id: "pctBuenos",
                                    label: "% Buenos",
                                  },
                                  {
                                    id: "pctMalos",
                                    label: "% Malos",
                                  },
                                  {
                                    id: "pctSinPuntuar",
                                    label: "% Sin Puntos",
                                  },
                                  {
                                    id: "totalPoints",
                                    label: "Puntos Totales",
                                  },
                                ].map((opt) => (
                                  <label
                                    key={opt.id}
                                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                      checked={draftSummarySort.keys.includes(
                                        opt.id,
                                      )}
                                      onChange={(e) => {
                                        setDraftSummarySort(
                                          (prev) => {
                                            const keys = e.target
                                              .checked
                                              ? [
                                                  ...prev.keys,
                                                  opt.id,
                                                ]
                                              : prev.keys.filter(
                                                  (k) =>
                                                    k !== opt.id,
                                                );
                                            return {
                                              ...prev,
                                              keys: keys.length
                                                ? keys
                                                : prev.keys,
                                            };
                                          },
                                        );
                                      }}
                                    />
                                    <span className="text-xs text-neutral-700 font-medium">
                                      {opt.label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </details>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={async () => {
                                if (draftChartRef.current) {
                                  let restore = () => {};
                                  try {
                                    
                                    
                                    
                                    restore = expandNodeForCapture(draftChartRef.current);
                                    const dataUrl =
                                      await domToDataUrl(
                                        draftChartRef.current,
                                        {
                                          scale: 3, 
        
        backgroundColor: '#ffffff',
                                          style: { overflow: "visible" },
                                        },
                                      );
                                    const blob = await (
                                      await fetch(dataUrl)
                                    ).blob();
                                    if (typeof ClipboardItem !== "undefined") {
                                      const clipboardItem =
                                        new ClipboardItem({
                                          [blob.type]: blob,
                                        });
                                      await navigator.clipboard.write(
                                        [clipboardItem],
                                      );
                                    }
                                  } catch (err) {
                                    console.error(
                                      "Error al copiar imagen:",
                                      err,
                                    );
                                  } finally {
                                    restore();
                                  }
                                }
                              }}
                              className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white shadow-sm border border-neutral-100"
                              title="Copiar gráfico como imagen"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (draftChartRef.current) {
                                  let restore = () => {};
                                  try {
                                    
                                    
                                    
                                    restore = expandNodeForCapture(draftChartRef.current);
                                    const dataUrl =
                                      await domToDataUrl(
                                        draftChartRef.current,
                                        {
                                          scale: 3, 
        
        backgroundColor: '#ffffff',
                                          style: { overflow: "visible" },
                                        },
                                      );
                                    const link =
                                      document.createElement("a");
                                    link.download = `rentabilidad-picks-${new Date().toISOString().split("T")[0]}.png`;
                                    link.href = dataUrl;
                                    link.click();
                                  } catch (err) {
                                    console.error(
                                      "Error al descargar gráfico:",
                                      err,
                                    );
                                  } finally {
                                    restore();
                                  }
                                }
                              }}
                              className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white shadow-sm border border-neutral-100"
                              title="Descargar gráfico"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="h-[500px]">
                        <div className="w-full overflow-x-auto pb-4 h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{
                              top: 10,
                              right: 30,
                              left: 20,
                              bottom: 0,
                            }}
                            barSize={20}
                          >
                            <CartesianGrid
                              strokeDasharray="2 2"
                              horizontal={false}
                              stroke="#f0f0f0"
                            />
                            <XAxis
                              type="number"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              stroke="#9ca3af"
                            />
                            <YAxis
                              dataKey="equipo"
                              type="category"
                              tickLine={false}
                              axisLine={false}
                              width={220}
                              stroke="#4b5563"
                              interval={0}
                              tick={({ x, y, payload }) => (
                                <g
                                  transform={`translate(${x},${y})`}
                                >
                                  <text
                                    x={0}
                                    y={0}
                                    dy={4}
                                    textAnchor="end"
                                    fill="#4b5563"
                                    fontSize={11}
                                    fontWeight={600}
                                  >
                                    {payload.value}
                                  </text>
                                </g>
                              )}
                            />
                            <RechartsTooltip
                              content={<CustomDraftTooltip />}
                              cursor={{
                                fill: "#f8fafc",
                                opacity: 0.5,
                              }}
                            />
                            <Legend
                              verticalAlign="top"
                              align="right"
                              iconType="square"
                              wrapperStyle={{
                                fontSize: "11px",
                                paddingBottom: "20px",
                                fontWeight: "500",
                              }}
                            />
                            <Bar
                              dataKey="ganador"
                              stackId="a"
                              fill="#15803d"
                              name="Ganadores"
                              radius={[0, 0, 0, 0]}
                            />
                            <Bar
                              dataKey="bueno"
                              stackId="a"
                              fill="#4ade80"
                              name="Buenos"
                              radius={[0, 0, 0, 0]}
                            />
                            <Bar
                              dataKey="malo"
                              stackId="a"
                              fill="#fb923c"
                              name="Malos"
                              radius={[0, 0, 0, 0]}
                            />
                            <Bar
                              dataKey="nulo"
                              stackId="a"
                              fill="#d4d4d8"
                              name="Sin Puntos"
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer></div></div>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-6 text-center italic">
                        * Pasa el ratón sobre las barras para ver
                        los nombres de los ciclistas de cada
                        categoría.
                      </p>
                    </div>

                    {/* Modal de expansión del Resumen del Draft */}
                    {isDraftSummaryExpanded && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-200">
                          <div className="p-6 md:p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/30">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <Activity className="w-6 h-6" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                                  Análisis de Rendimiento (Draft)
                                </h2>
                                <p className="text-sm text-neutral-500 font-medium">
                                  Visualización detallada y
                                  comparativa de selecciones
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setIsDraftSummaryExpanded(false)
                              }
                              className="w-12 h-12 flex items-center justify-center hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-900 transition-all active:scale-95"
                            >
                              <X className="w-6 h-6" />
                            </button>
                          </div>

                          <div className="flex-1 overflow-auto p-4 md:p-8 bg-neutral-50/30">
                            <div className="space-y-8 max-w-5xl mx-auto">
                              {/* Re-using the table in extreme detail */}
                              <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden overflow-x-auto ring-1 ring-black/5">
                                <div className="table-responsive-wrapper overflow-auto w-full h-full crosshair-container"><table className="min-w-[800px] w-full text-sm text-left border-collapse">
                                  <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-50/80 backdrop-blur sticky top-0 z-10">
                                    <tr>
                                      <th className="px-6 py-4 font-bold border-b border-neutral-100 sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]">
                                        Pos.
                                      </th>
                                      <th className="px-6 py-4 font-bold border-b border-neutral-100 sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]">
                                        Equipo Manager
                                      </th>
                                      <th className="px-4 py-4 font-bold border-b border-neutral-100 text-center">
                                        Ganadores
                                      </th>
                                      <th className="px-4 py-4 font-bold border-b border-neutral-100 text-center">
                                        Buenos
                                      </th>
                                      <th className="px-4 py-4 font-bold border-b border-neutral-100 text-center">
                                        Malos
                                      </th>
                                      <th className="px-4 py-4 font-bold border-b border-neutral-100 text-center">
                                        Sin Puntos
                                      </th>
                                      <th className="px-4 py-4 font-bold border-b border-neutral-100 text-center text-green-700">
                                        Eficiencia
                                      </th>
                                      <th className="px-6 py-4 font-bold border-b border-neutral-100 text-right">
                                        Puntos Totales
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-50">
                                    {sortedSummaries.map(
                                      (summary, idx) => (
                                        <tr
                                          key={summary.team}
                                          className="hover:bg-neutral-50/50 transition-colors group"
                                        >
                                          <td className="px-3 py-1.5 border-r border-neutral-50 font-mono text-neutral-300">
                                            {idx + 1 < 10
                                              ? `0${idx + 1}`
                                              : idx + 1}
                                          </td>
                                          <td className="px-3 py-1.5 border-r border-neutral-50 font-bold text-neutral-900">
                                            {summary.team}
                                          </td>
                                          <td className="px-2 py-1.5 text-center">
                                            <div className="flex flex-col">
                                              <span className="font-black text-blue-600">
                                                {
                                                  summary.pickGanador
                                                }
                                              </span>
                                              <span className="text-[10px] text-neutral-400 font-medium">
                                                {summary.pctGanadores.toFixed(
                                                  1,
                                                )}
                                                %
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-2 py-1.5 text-center bg-green-50/30">
                                            <div className="flex flex-col">
                                              <span className="font-black text-green-600">
                                                {
                                                  summary.buenosPicks
                                                }
                                              </span>
                                              <span className="text-[10px] text-neutral-400 font-medium bg-white px-1 py-0.5 rounded shadow-sm border border-neutral-100 inline-block mx-auto">
                                                {summary.pctBuenos.toFixed(
                                                  1,
                                                )}
                                                %
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-2 py-1.5 text-center bg-orange-50/30">
                                            <div className="flex flex-col">
                                              <span className="font-black text-orange-600">
                                                {summary.malosPicks}
                                              </span>
                                              <span className="text-[10px] text-neutral-400 font-medium bg-white px-1 py-0.5 rounded shadow-sm border border-neutral-100 inline-block mx-auto">
                                                {summary.pctMalos.toFixed(
                                                  1,
                                                )}
                                                %
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-2 py-1.5 text-center">
                                            <div className="flex flex-col">
                                              <span className="font-black text-neutral-500">
                                                {summary.sinPuntuar}
                                              </span>
                                              <span className="text-[10px] text-neutral-400 font-medium">
                                                {summary.pctSinPuntuar.toFixed(
                                                  1,
                                                )}
                                                %
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-2 py-1.5 text-center bg-green-50 border-x border-neutral-100/50">
                                            <span className="font-black text-green-700">
                                              {summary.pctBuenos.toFixed(
                                                1,
                                              )}
                                              %
                                            </span>
                                          </td>
                                          <td className="px-3 py-1.5 text-right tabular-nums font-black text-neutral-900 bg-neutral-50/30">
                                            {summary.totalPoints.toLocaleString()}
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                </table></div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6">
                                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Top Eficiencia (Picks Buenos)
                                  </h4>
                                  <div className="space-y-3">
                                    {[...teamSummaries]
                                      .sort(
                                        (a, b) =>
                                          b.pctBuenos - a.pctBuenos,
                                      )
                                      .slice(0, 3)
                                      .map((t, i) => (
                                        <div
                                          key={t.team}
                                          className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100/50 shadow-sm"
                                        >
                                          <span className="font-bold text-neutral-700">
                                            {i + 1}. {t.team}
                                          </span>
                                          <span className="text-blue-600 font-black">
                                            {t.pctBuenos.toFixed(1)}
                                            %
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                                <div className="bg-green-50/50 border border-green-100 rounded-3xl p-6">
                                  <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                                    <Trophy className="w-5 h-5" />
                                    Top Ganadores (Picks #1)
                                  </h4>
                                  <div className="space-y-3">
                                    {[...teamSummaries]
                                      .sort(
                                        (a, b) =>
                                          b.pickGanador -
                                          a.pickGanador,
                                      )
                                      .slice(0, 3)
                                      .map((t, i) => (
                                        <div
                                          key={t.team}
                                          className="flex items-center justify-between bg-white p-3 rounded-xl border border-green-100/50 shadow-sm"
                                        >
                                          <span className="font-bold text-neutral-700">
                                            {i + 1}. {t.team}
                                          </span>
                                          <span className="text-green-600 font-black">
                                            {t.pickGanador}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 bg-neutral-900 text-white flex items-center justify-between">
                            <div className="text-xs text-neutral-400 font-medium uppercase tracking-widest">
                              Sistema de Auditoría de Draft v2.0
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold bg-neutral-800 px-3 py-1.5 rounded-full border border-neutral-700">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              Datos Sincronizados
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    )}
  </div>
    </>
  );
};
