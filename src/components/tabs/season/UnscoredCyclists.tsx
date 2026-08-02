import React, { useContext, useRef, useMemo, useState } from "react";
import { SeasonViewContext } from "./SeasonViewContext";
import { useUrlState } from "../../../hooks/useUrlState";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { performTextCopy } from "./hooks/useExportHandlers";
import { UnscoredFilters } from "./UnscoredFilters";
import { UnscoredTable } from "./UnscoredTable";

export function UnscoredCyclists() {
  const context = useContext(SeasonViewContext)!;
  const { 
    files, 
    leaderboard, 
    cyclistMetadata, 
    cyclistRoundMap, 
    playerOrderMap, 
    getVal,
    unscoredCyclistsTeamFilter: teamFilter, setUnscoredCyclistsTeamFilter: setTeamFilter,
    unscoredCyclistsRoundFilter: roundFilter, setUnscoredCyclistsRoundFilter: setRoundFilter,
    unscoredCyclistsSortColumn: sortColumn, setUnscoredCyclistsSortColumn: setSortColumn,
    unscoredCyclistsSortDirection: sortDirection, setUnscoredCyclistsSortDirection: setSortDirection
  } = context;

  // Local States
  const [isRoundFilterOpen, setIsRoundFilterOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState<string | boolean>(false);
  const [isTextCopying, setIsTextCopying] = useState<boolean>(false);

  // Refs
  const tableRef = useRef<HTMLDivElement>(null);

  // Screenshot hook
  const { handleCopyImage, handleDownloadImage } = useTableScreenshot(tableRef);

  // Handlers
  const handleCopy = async (mode?: string) => {
    setIsCopying(mode || "full");
    try {
      await handleCopyImage({ 
        fileName: "unscored-export.png", 
        scale: 2, 
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), 
        backgroundColor: "#ffffff" 
      });
    } finally {
      setIsCopying(false);
    }
  };

  const handleCopyText = async () => {
    performTextCopy(tableRef, setIsTextCopying, "unscoredCyclists");
  };

  const handleDownload = async (mode?: string) => {
    await handleDownloadImage({ 
      fileName: `ciclistas-sin-puntuar${mode && mode !== "full" ? `-${mode}` : ""}.png`, 
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
      setSortDirection(col === "carreras" || col === "dias" ? "desc" : "asc");
    }
  };

  // Data Processing
  const processedData = useMemo(() => {
    // Get all cyclists from elecciones
    const unscored = files?.elecciones?.data?.map((row: any) => {
      const ciclista = getVal(row, "Ciclista")?.trim();
      const jugador = getVal(row, "Nombre_TG")?.trim();
      const nombreEquipo = getVal(row, "Nombre_Equipo")?.trim();
      const orden = playerOrderMap[jugador] || "";
      const ronda = cyclistRoundMap[ciclista] || "";

      // Calculate points
      let points = 0;
      leaderboard?.forEach((p: any) => {
        if (p.jugador === jugador) {
          p?.detalles?.forEach((d: any) => {
            if (d.ciclista === ciclista) {
              points += d.puntosObtenidos;
            }
          });
        }
      });

      if (points > 0) return null;

      // Get metadata
      const meta = cyclistMetadata[ciclista] || {
        carrerasDisputadas: 0,
        diasCompeticion: 0,
      };

      return {
        ciclista,
        jugador,
        nombreEquipo,
        orden,
        ronda,
        carreras: meta.carrerasDisputadas,
        dias: meta.diasCompeticion,
      };
    }).filter(Boolean) as any[];

    // Filter by team and round
    const filtered = unscored.filter((c) => {
      const teamMatch = teamFilter === "all" || c.nombreEquipo === teamFilter;
      const roundMatch = roundFilter.length === 0 || roundFilter.includes(c.ronda);
      return teamMatch && roundMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortColumn) {
        case "jugador": valA = a.nombreEquipo; valB = b.nombreEquipo; break;
        case "ciclista": valA = a.ciclista; valB = b.ciclista; break;
        case "ronda": valA = a.ronda; valB = b.ronda; break;
        case "carreras": valA = a.carreras; valB = b.carreras; break;
        case "dias": valA = a.dias; valB = b.dias; break;
        default: valA = a.ronda; valB = b.ronda; break;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === "asc" ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });

    const maxCarreras = filtered.length > 0 ? Math.max(...filtered.map(c => c.carreras)) : 0;
    const maxDias = filtered.length > 0 ? Math.max(...filtered.map(c => c.dias)) : 0;

    return { 
      filtered,
      maxCarreras,
      maxDias
    };
  }, [files?.elecciones?.data, teamFilter, roundFilter, sortColumn, sortDirection, playerOrderMap, cyclistRoundMap, leaderboard, cyclistMetadata, getVal]);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-8">
      <UnscoredFilters 
        unscoredCount={processedData?.filtered?.length || 0}
        unscoredCyclistsTeamFilter={teamFilter}
        setUnscoredCyclistsTeamFilter={setTeamFilter}
        unscoredCyclistsRoundFilter={roundFilter}
        setUnscoredCyclistsRoundFilter={setRoundFilter}
        isUnscoredRoundFilterOpen={isRoundFilterOpen}
        setIsUnscoredRoundFilterOpen={setIsRoundFilterOpen}
        isUnscoredExpanded={isExpanded}
        setIsUnscoredExpanded={setIsExpanded}
        isUnscoredCopying={isCopying}
        isUnscoredTextCopying={isTextCopying}
        handleCopyUnscored={handleCopy}
        handleCopyUnscoredText={handleCopyText}
        handleDownloadUnscored={handleDownload}
        leaderboard={leaderboard}
        cyclistRoundMap={cyclistRoundMap}
      />
      
      <UnscoredTable 
        tableRef={tableRef}
        isUnscoredExpanded={isExpanded}
        unscoredCyclistsSortColumn={sortColumn}
        unscoredCyclistsSortDirection={sortDirection}
        onSort={onSort}
        filteredAndSortedData={processedData?.filtered || []}
        maxCarreras={processedData?.maxCarreras || 0}
        maxDias={processedData?.maxDias || 0}
        isUnscoredCopying={isCopying}
      />
    </div>
  );
}
