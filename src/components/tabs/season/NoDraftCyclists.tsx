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
    noDraftCyclistsRaceFilter: raceFilter, setNoDraftCyclistsRaceFilter: setRaceFilter,
    noDraftCyclistsCategoryFilter: categoryFilter, setNoDraftCyclistsCategoryFilter: setCategoryFilter,
    noDraftMinVictorias: minVictorias, setNoDraftMinVictorias: setMinVictorias,
    noDraftMinCarreras: minCarreras, setNoDraftMinCarreras: setMinCarreras,
    noDraftMinDias: minDias, setNoDraftMinDias: setMinDias,
    noDraftMinPpc: minPpc, setNoDraftMinPpc: setMinPpc,
    noDraftMinPpd: minPpd, setNoDraftMinPpd: setMinPpd,
    noDraftMinPuntos: minPuntos, setNoDraftMinPuntos: setMinPuntos,
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

    // Map races to months and categories
    const raceMonths: Record<string, number> = {};
    const raceCats: Record<string, string> = {};
    files?.carreras?.data?.forEach((r: any) => {
      const carreraName = getVal(r, "Carrera")?.toString().trim();
      const fechaFin = getVal(r, "Fecha")?.toString().trim();
      const cat = getVal(r, "Categoría")?.toString().trim();
      if (carreraName) {
        if (cat) raceCats[carreraName] = cat;
        if (fechaFin) {
          const parts = fechaFin.split(/[-/]/);
          if (parts.length >= 2) {
            raceMonths[carreraName] = parseInt(parts[1]) - 1;
          }
        }
      }
    });

    const cyclistStats: Record<string, any> = {};

    noDraftPlayer.detalles.forEach((d: any) => {
      if (raceFilter && raceFilter !== "all" && d.carrera !== raceFilter) {
        return;
      }
      if (monthFilter !== "all" && raceMonths[d.carrera] !== parseInt(monthFilter)) {
        return;
      }
      if (categoryFilter && categoryFilter.length > 0) {
        const cat = raceCats[d.carrera];
        if (!cat || !categoryFilter.includes(cat)) return;
      }

      if (!cyclistStats[d.ciclista]) {
        const meta = cyclistMetadata[d.ciclista];
        cyclistStats[d.ciclista] = {
          puntos: 0,
          pais: meta?.pais || "",
          equipoBreve: meta?.equipoBreve || "",
          victorias: 0,
          carreras: new Set<string>(),
          dias: 0,
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

      const raceData = files?.carreras?.data?.find((r: any) => getVal(r, "Carrera")?.trim() === d.carrera);
      if (raceData) {
        const diasStr = getVal(raceData, "Días");
        stats.dias += diasStr ? (parseInt(diasStr) || 1) : 1;
      } else {
        stats.dias += 1;
      }
    });

    const allStats = Object.entries(cyclistStats)
      .filter(([_, data]: [string, any]) => {
        if (raceFilter && raceFilter !== "all" && data.carreras.size === 0) return false;
        const numCarreras = data.carreras.size;
        const ppc = numCarreras > 0 ? parseFloat((data.puntos / numCarreras).toFixed(1)) : 0;
        const ppd = data.dias > 0 ? parseFloat((data.puntos / data.dias).toFixed(1)) : 0;

        if (minVictorias !== undefined && String(minVictorias) !== "" && data.victorias < Number(minVictorias)) return false;
        if (minCarreras !== undefined && String(minCarreras) !== "" && numCarreras < Number(minCarreras)) return false;
        if (minDias !== undefined && String(minDias) !== "" && data.dias < Number(minDias)) return false;
        if (minPpc !== undefined && String(minPpc) !== "" && ppc < Number(minPpc)) return false;
        if (minPpd !== undefined && String(minPpd) !== "" && ppd < Number(minPpd)) return false;
        if (minPuntos !== undefined && String(minPuntos) !== "" && data.puntos < Number(minPuntos)) return false;

        return true;
      })
      .sort((a, b) => b[1].puntos - a[1].puntos)
      .map(([name, data]: [string, any], index) => {
        const numCarreras = data.carreras.size;
        return {
          name,
          data,
          numCarreras,
          dias: data.dias,
          ppc: numCarreras > 0 ? parseFloat((data.puntos / numCarreras).toFixed(1)) : 0,
          ppd: data.dias > 0 ? parseFloat((data.puntos / data.dias).toFixed(1)) : 0,
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
        case "dias": valA = a.dias; valB = b.dias; break;
        case "ppc": valA = a.ppc; valB = b.ppc; break;
        case "ppd": valA = a.ppd; valB = b.ppd; break;
        case "puntos":
        default: valA = a.data.puntos; valB = b.data.puntos; break;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === "asc" ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });

    const limit = Math.max(0, Number(topLimit) || 25);
    const limitedStats = allStats.slice(0, limit);
    const maxPuntosVal = limitedStats.length > 0 ? Math.max(...limitedStats.map(s => s.data.puntos)) : 0;
    const minPuntosVal = limitedStats.length > 0 ? Math.min(...limitedStats.map(s => s.data.puntos)) : 0;

    return { 
      sortedStats: limitedStats, 
      allStatsCount: allStats.length,
      maxPuntos: maxPuntosVal,
      minPuntos: minPuntosVal
    };
  }, [
    leaderboard, monthFilter, raceFilter, categoryFilter,
    minVictorias, minCarreras, minDias, minPpc, minPpd, minPuntos,
    sortColumn, sortDirection, topLimit, files?.carreras?.data, cyclistMetadata, getVal
  ]);

  return (
    <div className="space-y-8">
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <NoDraftFilters 
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          raceFilter={raceFilter}
          setRaceFilter={setRaceFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          minVictorias={minVictorias} setMinVictorias={setMinVictorias}
          minCarreras={minCarreras} setMinCarreras={setMinCarreras}
          minDias={minDias} setMinDias={setMinDias}
          minPpc={minPpc} setMinPpc={setMinPpc}
          minPpd={minPpd} setMinPpd={setMinPpd}
          minPuntos={minPuntos} setMinPuntos={setMinPuntos}
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
          files={files}
          getVal={getVal}
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
