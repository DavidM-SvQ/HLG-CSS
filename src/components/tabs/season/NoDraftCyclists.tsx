import React, { useContext, useRef, useMemo, useState } from "react";
import { SeasonViewContext } from "./SeasonViewContext";
import { useUrlState } from "../../../hooks/useUrlState";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { performTextCopy } from "./hooks/useExportHandlers";
import { NoDraftFilters } from "./NoDraftFilters";
import { NoDraftTable } from "./NoDraftTable";

export function NoDraftCyclists() {
  const context = useContext(SeasonViewContext)!;
  const { 
    files, 
    leaderboard, 
    cyclistMetadata, 
    getVal,
    noDraftCyclistsMonthFilter: monthFilter, setNoDraftCyclistsMonthFilter: setMonthFilter,
    noDraftCyclistsSortColumn: sortColumn, setNoDraftCyclistsSortColumn: setSortColumn,
    noDraftCyclistsSortDirection: sortDirection, setNoDraftCyclistsSortDirection: setSortDirection,
    noDraftCyclistsTeamFilter, setNoDraftCyclistsTeamFilter
  } = context;

  // Local States
  const [topLimit, setTopLimit] = useUrlState<number>("noDraftTopLimit", 25);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState<string | boolean>(false);
  const [isTextCopying, setIsTextCopying] = useState<boolean>(false);

  // Refs
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Screenshot hook
  const { handleCopyImage, handleDownloadImage } = useTableScreenshot(tableContainerRef);

  // Export handlers
  const handleCopy = async (mode?: string) => {
    setIsCopying(mode || "full");
    try {
      await handleCopyImage({ 
        fileName: "no-draft-export.png", 
        scale: 2, 
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), 
        backgroundColor: "#ffffff" 
      });
    } finally {
      setIsCopying(false);
    }
  };

  const handleCopyText = async () => {
    performTextCopy(tableContainerRef, setIsTextCopying, "noDraftCyclists");
  };

  const handleDownload = async (mode?: string) => {
    await handleDownloadImage({ 
      fileName: `top-ciclistas-no-elegidos${mode && mode !== "full" ? `-${mode}` : ""}.png`, 
      scale: 2, 
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), 
      backgroundColor: "#ffffff" 
    });
  };

  const onSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection(col === "nombre" || col === "equipo" || col === "pais" || col === "pos" ? "asc" : "desc");
    }
  };

  // Data Processing
  const processedData = useMemo(() => {
    const noDraftPlayer = leaderboard?.find((p: any) => p.jugador === "No draft");
    if (!noDraftPlayer) return { sortedStats: [], allStatsCount: 0, maxPuntos: 0, minPuntos: 0 };

    // Map races to months
    const raceMonths: Record<string, number> = {};
    files.carreras.data?.forEach((r: any) => {
      const carreraName = getVal(r, "Carrera")?.toString().trim();
      const fechaFin = getVal(r, "Fecha")?.toString().trim();
      if (carreraName && fechaFin) {
        const parts = fechaFin.split(/[-/]/);
        if (parts.length >= 2) {
          raceMonths[carreraName] = parseInt(parts[1]) - 1;
        }
      }
    });

    const cyclistStats: Record<string, any> = {};

    noDraftPlayer.detalles.forEach((d: any) => {
      if (monthFilter !== "all" && raceMonths[d.carrera] !== parseInt(monthFilter)) {
        return;
      }

      if (!cyclistStats[d.ciclista]) {
        const meta = cyclistMetadata[d.ciclista];
        cyclistStats[d.ciclista] = {
          puntos: 0,
          pais: meta?.pais || "",
          equipoBreve: meta?.equipoBreve || "",
          victorias: 0,
          carreras: new Set<string>(),
        };
      }

      const stats = cyclistStats[d.ciclista];
      stats.puntos += d.puntosObtenidos;
      stats.carreras.add(d.carrera);

      const isPos01 = d.posicion === "01" || d.posicion === "1";
      const isValidType = [
        "Etapa", "Etapa (Crono equipos)", "Clasificación final",
        "Clasificación final (Crono equipos)", "Clásica"
      ].includes(d.tipoResultado);
      if (isPos01 && isValidType) stats.victorias += 1;
    });

    const allStats = Object.entries(cyclistStats)
      .sort((a, b) => b[1].puntos - a[1].puntos)
      .map(([name, data]: [string, any], index) => {
        const numCarreras = data.carreras.size;
        return {
          name,
          data,
          numCarreras,
          ppc: numCarreras > 0 ? parseFloat((data.puntos / numCarreras).toFixed(1)) : 0,
          originalPos: index + 1,
        };
      });

    // Handle Sorting
    allStats.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortColumn) {
        case "pos": valA = a.originalPos; valB = b.originalPos; break;
        case "nombre": valA = a.name; valB = b.name; break;
        case "equipo": valA = a.data.equipoBreve; valB = b.data.equipoBreve; break;
        case "pais": valA = a.data.pais; valB = b.data.pais; break;
        case "victorias": valA = a.data.victorias; valB = b.data.victorias; break;
        case "carreras": valA = a.numCarreras; valB = b.numCarreras; break;
        case "ppc": valA = a.ppc; valB = b.ppc; break;
        case "puntos":
        default: valA = a.data.puntos; valB = b.data.puntos; break;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === "asc" ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });

    const limitedStats = allStats.slice(0, topLimit);
    const maxPuntos = limitedStats.length > 0 ? Math.max(...limitedStats.map(s => s.data.puntos)) : 0;
    const minPuntos = limitedStats.length > 0 ? Math.min(...limitedStats.map(s => s.data.puntos)) : 0;

    return { 
      sortedStats: limitedStats, 
      allStatsCount: allStats.length,
      maxPuntos,
      minPuntos
    };
  }, [leaderboard, monthFilter, sortColumn, sortDirection, topLimit, files.carreras.data, cyclistMetadata, getVal]);

  return (
    <div className="space-y-8">
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <NoDraftFilters 
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          topLimit={topLimit}
          setTopLimit={setTopLimit}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          isCopying={isCopying}
          isTextCopying={isTextCopying}
          handleCopy={handleCopy}
          handleCopyText={handleCopyText}
          handleDownload={handleDownload}
          allStatsCount={processedData.allStatsCount}
        />
        
        <NoDraftTable 
          tableRef={tableContainerRef}
          isExpanded={isExpanded}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={onSort}
          sortedStats={processedData.sortedStats}
          maxPuntos={processedData.maxPuntos}
          minPuntos={processedData.minPuntos}
          isCopying={isCopying}
        />
      </div>
    </div>
  );
}
