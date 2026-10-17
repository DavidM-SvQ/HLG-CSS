import React, { useState, useRef, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Flag,
  User,
  Table as TableIcon,
  X
} from "lucide-react";
import { PlayerScore } from "../../../lib/types";
import { cn } from "../../../lib/utils";
import { formatNumberSpanish } from "../../../lib/data-processing";
import { useDailyEvolutionData } from "./hooks/useDailyEvolutionData";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { copyTextToClipboard } from "../../../lib/clipboard";
import { toast } from "sonner";

function getTeamOrderFormatted(nombreEquipo: string, orden?: string) {
  const clean = (nombreEquipo || "").replace(/\s*\[#\d+\]$/, "").trim();
  const rawO = orden || (nombreEquipo ? nombreEquipo.match(/\[#(\d+)\]/)?.[1] : "") || "";
  const o = rawO ? String(rawO).replace(/^#/, "").padStart(2, "0") : "";
  return {
    cleanName: clean,
    order: o,
    fullName: o ? `${clean} [#${o}]` : clean,
  };
}

interface DailyPointsComparisonTableProps {
  activeTeams: PlayerScore[];
  files?: any;
  teamColors?: Record<string, string>;
  selectedEvolutionTeams?: string[];
}

export function DailyPointsComparisonTable({
  activeTeams,
  files,
  teamColors,
  selectedEvolutionTeams = [],
}: DailyPointsComparisonTableProps) {
  const fullContentRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Hook for Full Content (KPIs + Table)
  const {
    handleCopyImage: copyFullImage,
    handleDownloadImage: downloadFullImage,
    isCopying: isFullCopying,
  } = useTableScreenshot(fullContentRef);

  // Hook for Table Only
  const {
    handleCopyImage: copyTableImage,
    handleDownloadImage: downloadTableImage,
    isCopying: isTableCopying,
  } = useTableScreenshot(tableContainerRef);

  const [isFullTextCopying, setIsFullTextCopying] = useState(false);
  const [isTableTextCopying, setIsTableTextCopying] = useState(false);

  const {
    availableDates,
    dateOptions,
    selectedDate,
    setSelectedDate,
    formatDisplayDate,
    comparisonMode,
    setComparisonMode,
    rangeStartDate,
    setRangeStartDate,
    hasPrevDate,
    hasNextDate,
    goToPrevDate,
    goToNextDate,
    dailyStats,
    summaryKpis,
  } = useDailyEvolutionData(activeTeams, files);

  // Search & filter states
  const [teamSearch, setTeamSearch] = useState("");
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");
  const [expandedTeamKey, setExpandedTeamKey] = useState<string | null>(null);

  // Sorting
  const [sortColumn, setSortColumn] = useState<
    "posNueva" | "posPrevia" | "deltaPos" | "puntosDia" | "puntosAcumulados" | "difLider" | "nombreEquipo"
  >("posNueva");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (col: typeof sortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      // Default directions
      if (col === "puntosDia" || col === "puntosAcumulados" || col === "deltaPos") {
        setSortDirection("desc");
      } else {
        setSortDirection("asc");
      }
    }
  };

  // Filtered and sorted stats
  const processedStats = useMemo(() => {
    let list = [...dailyStats];

    // Filter by global team selection if active
    if (selectedEvolutionTeams.length > 0) {
      list = list.filter((t) =>
        selectedEvolutionTeams.some(
          (sel) => sel === t.teamKey || sel.includes(t.nombreEquipo)
        )
      );
    }

    // Filter by text search
    if (teamSearch.trim()) {
      const q = teamSearch.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.nombreEquipo.toLowerCase().includes(q) ||
          t.jugador.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA: any = a[sortColumn];
      let valB: any = b[sortColumn];

      if (sortColumn === "nombreEquipo") {
        return sortDirection === "asc"
          ? a.nombreEquipo.localeCompare(b.nombreEquipo)
          : b.nombreEquipo.localeCompare(a.nombreEquipo);
      }

      if (valA === valB) {
        // secondary sort by puntosAcumulados
        return b.puntosAcumulados - a.puntosAcumulados;
      }

      return sortDirection === "asc" ? valA - valB : valB - valA;
    });

    return list;
  }, [dailyStats, selectedEvolutionTeams, teamSearch, sortColumn, sortDirection]);

  // Formatted Text Copy for Full Content (KPIs + Table)
  const handleCopyFullText = async () => {
    setIsFullTextCopying(true);
    try {
      const dateTitle = comparisonMode === "range"
        ? `Período del ${formatDisplayDate(rangeStartDate)} al ${formatDisplayDate(selectedDate)}`
        : `Jornada del ${formatDisplayDate(selectedDate)}`;

      const kpiLines = summaryKpis ? [
        `🏆 Equipo de la jornada: ${summaryKpis.topTeam ? `${getTeamOrderFormatted(summaryKpis.topTeam.nombreEquipo, summaryKpis.topTeam.orden).fullName} (+${summaryKpis.topTeam.puntosDia} pts)` : "Sin puntos"}`,
        `📈 Mayor escalada: ${summaryKpis.bestClimber ? `${getTeamOrderFormatted(summaryKpis.bestClimber.nombreEquipo, summaryKpis.bestClimber.orden).fullName} (+${summaryKpis.bestClimber.deltaPos} pos)` : "Sin cambios"}`,
        `🏁 Carreras y puntos: ${summaryKpis.races.join(", ") || "General"} (${summaryKpis.totalPuntosJornada} pts en total)`
      ] : [];

      const header = ["Pos Ant", "Equipo", "Pts Jornada", "Nueva Pos", "Δ Pos", "Pts Totales", "Dif Líder"].join("\t");
      const rows = processedStats.map((t) => [
        `${t.posPrevia}º`,
        getTeamOrderFormatted(t.nombreEquipo, t.orden).fullName,
        `+${t.puntosDia}`,
        `${t.posNueva}º`,
        t.deltaPos > 0 ? `+${t.deltaPos}` : `${t.deltaPos}`,
        t.puntosAcumulados,
        t.difLider === 0 ? "Líder" : t.difLider
      ].join("\t"));

      const fullText = [
        `=== RESUMEN PUNTOS POR DÍA: ${dateTitle} ===`,
        ...kpiLines,
        "",
        header,
        ...rows
      ].join("\n");

      await copyTextToClipboard(fullText, "resumen-jornada.txt");
      toast.success("Resumen completo (KPIs + Tabla) copiado al portapapeles");
    } catch (e) {
      console.error(e);
      toast.error("Error al copiar texto");
    } finally {
      setTimeout(() => setIsFullTextCopying(false), 1500);
    }
  };

  // Formatted Text Copy for Table Only
  const handleCopyTableText = async () => {
    setIsTableTextCopying(true);
    try {
      const header = ["Pos Ant", "Equipo", "Pts Jornada", "Nueva Pos", "Δ Pos", "Pts Totales", "Dif Líder"].join("\t");
      const rows = processedStats.map((t) => [
        `${t.posPrevia}º`,
        getTeamOrderFormatted(t.nombreEquipo, t.orden).fullName,
        `+${t.puntosDia}`,
        `${t.posNueva}º`,
        t.deltaPos > 0 ? `+${t.deltaPos}` : `${t.deltaPos}`,
        t.puntosAcumulados,
        t.difLider === 0 ? "Líder" : t.difLider
      ].join("\t"));

      const tableText = [header, ...rows].join("\n");
      await copyTextToClipboard(tableText, "tabla-jornada.txt");
      toast.success("Tabla copiada al portapapeles");
    } catch (e) {
      console.error(e);
      toast.error("Error al copiar tabla");
    } finally {
      setTimeout(() => setIsTableTextCopying(false), 1500);
    }
  };

  const isCompact = density === "compact";

  return (
    <div className="space-y-5 w-full max-w-full min-w-0">
      {/* 1. Header & Date Controls Card (Clean, uncluttered, wraps naturally) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200 shadow-2xs w-full max-w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Selector with Navigation Buttons and Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200">
              <button
                type="button"
                onClick={goToPrevDate}
                disabled={!hasPrevDate}
                className="p-1.5 rounded-md hover:bg-white text-neutral-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Día de competición anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative">
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-2.5 pr-8 py-1 bg-white border border-neutral-200 rounded-md text-xs sm:text-sm font-semibold text-neutral-800 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {dateOptions.map((opt) => (
                    <option key={opt.date} value={opt.date}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={goToNextDate}
                disabled={!hasNextDate}
                className="p-1.5 rounded-md hover:bg-white text-neutral-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Día de competición siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Comparison Mode Toggle */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
              <button
                type="button"
                onClick={() => setComparisonMode("single")}
                className={cn(
                  "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-[11px]",
                  comparisonMode === "single"
                    ? "bg-white text-neutral-900 shadow-2xs font-bold"
                    : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                Jornada individual
              </button>
              <button
                type="button"
                onClick={() => setComparisonMode("range")}
                className={cn(
                  "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-[11px]",
                  comparisonMode === "range"
                    ? "bg-white text-neutral-900 shadow-2xs font-bold"
                    : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                Comparar con fecha inicio
              </button>
            </div>

            {/* Range start selector if range mode */}
            {comparisonMode === "range" && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 animate-in fade-in">
                <span className="text-[11px] font-medium text-neutral-500">Desde:</span>
                <select
                  value={rangeStartDate}
                  onChange={(e) => setRangeStartDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-neutral-200 rounded-md text-xs font-medium text-neutral-800 shadow-2xs cursor-pointer"
                >
                  {availableDates
                    .filter((d) => d <= selectedDate)
                    .map((d) => (
                      <option key={d} value={d}>
                        {formatDisplayDate(d)}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Full Content Container (Ref captures both KPIs and Table) */}
      <div ref={fullContentRef} className="space-y-4 w-full max-w-full min-w-0">
        {/* Summary Header with Dedicated KPIs + Table Export (Never overflows) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 border border-blue-200/60">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-neutral-900 text-sm sm:text-base leading-tight truncate">
                  {comparisonMode === "range"
                    ? `Resumen de Puntos: ${formatDisplayDate(rangeStartDate)} al ${formatDisplayDate(selectedDate)}`
                    : `Resumen de Puntos: ${formatDisplayDate(selectedDate)}`}
                </h4>
                {comparisonMode === "range" && (
                  <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                    Período Acumulado
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 truncate">
                Puntos por día de competición y variación en la clasificación general
              </p>
            </div>
          </div>

          {/* Export Toolbar: KPIs + Tabla */}
          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 px-2.5 py-1.5 rounded-lg shadow-2xs copy-button-ignore shrink-0 ml-auto sm:ml-0">
            <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>KPIs + Tabla:</span>
            </span>
            <ExportToolbar
              filename={`jornada-completa-${selectedDate || "resumen"}`}
              onCopyImage={() => copyFullImage({ fileName: `jornada-completa-${selectedDate || "resumen"}` })}
              isImageCopying={isFullCopying}
              onDownloadImage={() => downloadFullImage({ fileName: `jornada-completa-${selectedDate || "resumen"}` })}
              onCopyText={handleCopyFullText}
              isTextCopying={isFullTextCopying}
              textCopyLabel="Texto"
              useClipboardIconForText={true}
            />
          </div>
        </div>

        {/* 3. Top Summary KPI Cards */}
        {summaryKpis && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            {/* Top Scorer */}
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium text-neutral-500 block truncate">
                  Equipo de la Jornada
                </span>
                <span className="text-sm font-bold text-neutral-900 truncate block">
                  {summaryKpis.topTeam ? getTeamOrderFormatted(summaryKpis.topTeam.nombreEquipo, summaryKpis.topTeam.orden).fullName : "Sin puntos"}
                </span>
                <span className="text-xs text-amber-600 font-semibold font-mono tabular-nums">
                  {summaryKpis.topTeam ? `+${summaryKpis.topTeam.puntosDia} pts` : "0 pts"}
                </span>
              </div>
            </div>

            {/* Best Climber */}
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium text-neutral-500 block truncate">
                  Mayor Escalada
                </span>
                <span className="text-sm font-bold text-neutral-900 truncate block">
                  {summaryKpis.bestClimber ? getTeamOrderFormatted(summaryKpis.bestClimber.nombreEquipo, summaryKpis.bestClimber.orden).fullName : "Sin cambios"}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">
                  {summaryKpis.bestClimber
                    ? `+${summaryKpis.bestClimber.deltaPos} posiciones (${summaryKpis.bestClimber.posPrevia}º → ${summaryKpis.bestClimber.posNueva}º)`
                    : "Mantiene posiciones"}
                </span>
              </div>
            </div>

            {/* Races & Total Points */}
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60">
                <Flag className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium text-neutral-500 block truncate">
                  Carreras y Puntos Repartidos
                </span>
                <span className="text-sm font-bold text-neutral-900 truncate block">
                  {summaryKpis.races.length > 0
                    ? summaryKpis.races.slice(0, 2).join(", ") +
                      (summaryKpis.races.length > 2 ? ` (+${summaryKpis.races.length - 2})` : "")
                    : "Prueba sin clasificar"}
                </span>
                <span className="text-xs text-blue-600 font-semibold font-mono tabular-nums">
                  {summaryKpis.totalPuntosJornada} pts en total
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. The Comparison Table Card (Ref captures Table Only) */}
        <div
          ref={tableContainerRef}
          className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden w-full max-w-full min-w-0"
        >
          {/* Table Header: Title + Export Solo Tabla */}
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-neutral-200 bg-neutral-50/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <TableIcon className="w-4 h-4 text-neutral-600 shrink-0" />
              <span className="font-bold text-sm text-neutral-800">
                Clasificación {comparisonMode === "range" ? "acumulada en el período" : "tras la jornada"}
              </span>
              <span className="text-xs text-neutral-500 font-medium shrink-0">
                ({processedStats.length} equipos)
              </span>
            </div>

            {/* Export Toolbar: Solo Tabla */}
            <div className="flex items-center gap-1.5 shrink-0 bg-white px-2 py-1 rounded-lg border border-neutral-200 shadow-2xs copy-button-ignore ml-auto sm:ml-0">
              <span className="text-[11px] font-semibold text-neutral-600 whitespace-nowrap">
                Solo Tabla:
              </span>
              <ExportToolbar
                filename={`tabla-jornada-${selectedDate || "clasificacion"}`}
                onCopyImage={() => copyTableImage({ fileName: `tabla-jornada-${selectedDate || "clasificacion"}` })}
                isImageCopying={isTableCopying}
                onDownloadImage={() => downloadTableImage({ fileName: `tabla-jornada-${selectedDate || "clasificacion"}` })}
                onCopyText={handleCopyTableText}
                isTextCopying={isTableTextCopying}
                textCopyLabel="Texto"
                useClipboardIconForText={true}
              />
            </div>
          </div>

          {/* Sub-bar for Search & View Density (Never overflows) */}
          <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-neutral-200 bg-white flex flex-wrap items-center justify-between gap-3 copy-button-ignore">
            {/* Quick search input */}
            <div className="relative w-full sm:w-64 max-w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Buscar equipo..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-neutral-800 shadow-2xs placeholder:text-neutral-400 font-medium"
              />
              {teamSearch && (
                <button
                  type="button"
                  onClick={() => setTeamSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Density toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-medium text-neutral-500 hidden sm:inline">
                Densidad:
              </span>
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
                <button
                  type="button"
                  onClick={() => setDensity("compact")}
                  className={cn(
                    "px-3 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer",
                    isCompact
                      ? "bg-white text-neutral-900 shadow-2xs font-bold"
                      : "text-neutral-600 hover:text-neutral-900"
                  )}
                  title="Vista condensada para exportación óptima"
                >
                  Condensada
                </button>
                <button
                  type="button"
                  onClick={() => setDensity("comfortable")}
                  className={cn(
                    "px-3 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer",
                    !isCompact
                      ? "bg-white text-neutral-900 shadow-2xs font-bold"
                      : "text-neutral-600 hover:text-neutral-900"
                  )}
                  title="Vista amplia"
                >
                  Amplia
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 text-xs font-semibold select-none">
                  {/* Pos Previa */}
                  <th
                    onClick={() => handleSort("posPrevia")}
                    className={cn(
                      "cursor-pointer hover:bg-neutral-100 transition-colors text-center shrink-0",
                      isCompact ? "py-2 px-2" : "py-3 px-3"
                    )}
                    title="Posición antes de esta jornada (clic para ordenar)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Pos Anterior</span>
                      {sortColumn === "posPrevia" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        ))}
                    </div>
                  </th>

                  {/* Team */}
                  <th
                    onClick={() => handleSort("nombreEquipo")}
                    className={cn(
                      "cursor-pointer hover:bg-neutral-100 transition-colors",
                      isCompact ? "py-2 px-3" : "py-3 px-4"
                    )}
                    title="Equipo Fantasy (clic para ordenar)"
                  >
                    <div className="flex items-center gap-1">
                      <span>Equipo [#Orden]</span>
                      {sortColumn === "nombreEquipo" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        ))}
                    </div>
                  </th>

                  {/* Puntos Día */}
                  <th
                    onClick={() => handleSort("puntosDia")}
                    className={cn(
                      "cursor-pointer hover:bg-neutral-100 transition-colors text-right",
                      isCompact ? "py-2 px-3" : "py-3 px-4"
                    )}
                    title="Puntos sumados exclusivamente en esta fecha (clic para ordenar)"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Pts Jornada</span>
                      {sortColumn === "puntosDia" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        ))}
                    </div>
                  </th>

                  {/* Nueva Pos */}
                  <th
                    onClick={() => handleSort("posNueva")}
                    className={cn(
                      "cursor-pointer hover:bg-neutral-100 transition-colors text-center shrink-0",
                      isCompact ? "py-2 px-2.5" : "py-3 px-3.5"
                    )}
                    title="Nueva posición en la clasificación general (clic para ordenar)"
                  >
                    <div className="flex items-center justify-center gap-1 font-bold text-neutral-900">
                      <span>Nueva Pos</span>
                      {sortColumn === "posNueva" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        ))}
                    </div>
                  </th>

                  {/* Delta Posición */}
                  <th
                    onClick={() => handleSort("deltaPos")}
                    className={cn(
                      "cursor-pointer hover:bg-neutral-100 transition-colors text-center",
                      isCompact ? "py-2 px-2.5" : "py-3 px-3.5"
                    )}
                    title="Cambio de posición tras la jornada (clic para ordenar)"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Δ Pos</span>
                      {sortColumn === "deltaPos" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        ))}
                    </div>
                  </th>

                  {/* Puntos Acumulados */}
                  <th
                    onClick={() => handleSort("puntosAcumulados")}
                    className={cn(
                      "cursor-pointer hover:bg-neutral-100 transition-colors text-right",
                      isCompact ? "py-2 px-3" : "py-3 px-4"
                    )}
                    title="Puntos acumulados totales hasta esta fecha (clic para ordenar)"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Pts Totales</span>
                      {sortColumn === "puntosAcumulados" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        ))}
                    </div>
                  </th>

                  {/* Dif. Líder */}
                  <th
                    onClick={() => handleSort("difLider")}
                    className={cn(
                      "cursor-pointer hover:bg-neutral-100 transition-colors text-right hidden sm:table-cell",
                      isCompact ? "py-2 px-2.5" : "py-3 px-3"
                    )}
                    title="Diferencia de puntos con el líder (clic para ordenar)"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Dif. Líder</span>
                      {sortColumn === "difLider" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        ))}
                    </div>
                  </th>

                  {/* Detalle Ciclistas */}
                  <th
                    className={cn(
                      "text-center",
                      isCompact ? "py-2 px-3" : "py-3 px-4"
                    )}
                  >
                    <span>Corredores</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 text-xs sm:text-sm">
                {processedStats.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-400">
                      No se encontraron equipos para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  processedStats.map((team, idx) => {
                    const hasPoints = team.puntosDia > 0;
                    const isExpanded = expandedTeamKey === team.teamKey;
                    const teamColor = teamColors?.[team.teamKey];

                    return (
                      <React.Fragment key={team.teamKey}>
                        <tr
                          className={cn(
                            "transition-colors hover:bg-neutral-50/70",
                            idx % 2 === 1 ? "bg-neutral-50/30" : "bg-white",
                            hasPoints && "font-medium"
                          )}
                        >
                          {/* Pos Previa */}
                          <td
                            className={cn(
                              "text-center text-neutral-500 font-mono tabular-nums",
                              isCompact ? "py-1.5 px-2 text-xs" : "py-2.5 px-3 text-sm"
                            )}
                          >
                            {team.posPrevia}º
                          </td>

                          {/* Equipo */}
                          <td
                            className={cn(
                              "text-neutral-900 whitespace-nowrap",
                              isCompact ? "py-1.5 px-3 text-xs" : "py-2.5 px-4 text-sm"
                            )}
                          >
                            {(() => {
                              const { cleanName, order, fullName } = getTeamOrderFormatted(team.nombreEquipo, team.orden);
                              return (
                                <div className="flex items-center gap-2 min-w-0">
                                  {teamColor && (
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: teamColor }}
                                    />
                                  )}
                                  <span
                                    className="font-semibold text-neutral-900 truncate inline-flex items-center gap-1.5"
                                    title={`${fullName}${team.jugador ? ` (${team.jugador})` : ""}`}
                                  >
                                    <span>{cleanName}</span>
                                    {order && (
                                      <span className="font-mono text-neutral-400 font-normal text-[11px] sm:text-xs">
                                        [#{order}]
                                      </span>
                                    )}
                                  </span>
                                </div>
                              );
                            })()}
                          </td>

                          {/* Pts Día */}
                          <td
                            className={cn(
                              "text-right font-mono tabular-nums font-bold",
                              isCompact ? "py-1.5 px-3 text-xs" : "py-2.5 px-4 text-sm",
                              hasPoints ? "text-emerald-700" : "text-neutral-400 font-normal"
                            )}
                          >
                            {hasPoints ? (
                              <span className="inline-block bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                                +{formatNumberSpanish(team.puntosDia)}
                              </span>
                            ) : (
                              "0"
                            )}
                          </td>

                          {/* Nueva Pos */}
                          <td
                            className={cn(
                              "text-center font-bold font-mono tabular-nums",
                              isCompact ? "py-1.5 px-2.5 text-xs" : "py-2.5 px-3.5 text-sm",
                              team.posNueva === 1
                                ? "text-amber-600 font-black text-sm"
                                : team.posNueva <= 3
                                ? "text-neutral-900 font-black"
                                : "text-neutral-800"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-flex items-center justify-center rounded-md px-1.5 py-0.5",
                                team.posNueva === 1
                                  ? "bg-amber-100 text-amber-900"
                                  : team.posNueva === 2
                                  ? "bg-slate-200 text-slate-800"
                                  : team.posNueva === 3
                                  ? "bg-orange-100 text-orange-900"
                                  : ""
                              )}
                            >
                              {team.posNueva}º
                            </span>
                          </td>

                          {/* Delta Posición */}
                          <td
                            className={cn(
                              "text-center font-mono tabular-nums",
                              isCompact ? "py-1.5 px-2.5 text-xs" : "py-2.5 px-3.5 text-sm"
                            )}
                          >
                            {team.deltaPos > 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <TrendingUp className="w-3.5 h-3.5" />
                                +{team.deltaPos}
                              </span>
                            ) : team.deltaPos < 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                <TrendingDown className="w-3.5 h-3.5" />
                                {team.deltaPos}
                              </span>
                            ) : (
                              <span className="text-neutral-400 inline-flex items-center gap-0.5">
                                <Minus className="w-3 h-3" />
                              </span>
                            )}
                          </td>

                          {/* Pts Totales */}
                          <td
                            className={cn(
                              "text-right font-mono tabular-nums font-semibold text-neutral-900",
                              isCompact ? "py-1.5 px-3 text-xs" : "py-2.5 px-4 text-sm"
                            )}
                          >
                            {formatNumberSpanish(team.puntosAcumulados)}
                          </td>

                          {/* Dif Líder */}
                          <td
                            className={cn(
                              "text-right font-mono tabular-nums text-neutral-500 hidden sm:table-cell text-xs",
                              isCompact ? "py-1.5 px-2.5" : "py-2.5 px-3"
                            )}
                          >
                            {team.difLider === 0 ? (
                              <span className="text-amber-600 font-semibold">Líder</span>
                            ) : (
                              `${formatNumberSpanish(team.difLider)}`
                            )}
                          </td>

                          {/* Ciclistas Button */}
                          <td
                            className={cn(
                              "text-center",
                              isCompact ? "py-1.5 px-3" : "py-2.5 px-4"
                            )}
                          >
                            {team.ciclistasDia.length > 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedTeamKey(isExpanded ? null : team.teamKey)
                                }
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
                                  isExpanded
                                    ? "bg-blue-600 text-white"
                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                )}
                                title="Ver corredores que puntuaron hoy"
                              >
                                <User className="w-3 h-3" />
                                <span>{team.ciclistasDia.length}</span>
                              </button>
                            ) : (
                              <span className="text-neutral-300 text-xs">-</span>
                            )}
                          </td>
                        </tr>

                        {/* Expandable Cyclist Breakdown Row */}
                        {isExpanded && team.ciclistasDia.length > 0 && (
                          <tr className="bg-blue-50/40 border-b border-blue-100">
                            <td colSpan={8} className="p-3 pl-8">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                                  Corredores de {getTeamOrderFormatted(team.nombreEquipo, team.orden).fullName} que puntuaron el {formatDisplayDate(selectedDate)}:
                                </span>
                                <div className="flex flex-wrap gap-2 pt-0.5">
                                  {team.ciclistasDia.map((c, cIdx) => (
                                    <div
                                      key={cIdx}
                                      className="bg-white border border-blue-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs flex items-center gap-1.5"
                                    >
                                      <span className="font-semibold text-neutral-800">
                                        {c.ciclista}
                                      </span>
                                      <span className="text-[11px] text-neutral-500">
                                        ({c.carrera} {c.etapa ? `· ${c.etapa}` : ""})
                                      </span>
                                      <span className="font-mono tabular-nums font-bold text-emerald-700 ml-1">
                                        +{c.puntos} pts
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
