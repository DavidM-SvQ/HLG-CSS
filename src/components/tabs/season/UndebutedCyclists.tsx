import React, { useContext, useRef, useMemo } from "react";
import { useUrlState } from "../../../hooks/useUrlState";
import { SeasonViewContext } from "./SeasonViewContext";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { performTextCopy } from "./hooks/useExportHandlers";
import { UndebutedCyclistsFilters } from "./UndebutedCyclistsFilters";
import { UndebutedCyclistsTable } from "./UndebutedCyclistsTable";

export function UndebutedCyclists() {
  const context = useContext(SeasonViewContext)!;
  const { 
    files, playerOrderMap, leaderboard, cyclistMetadata, cyclistRoundMap, getVal,
    undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter,
    undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter,
    undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn,
    undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection
  } = context;

  const [isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen] = React.useState<boolean>(false);
  const [isUndebutedExpanded, setIsUndebutedExpanded] = React.useState(false);
  
  const [isUndebutedCopying, setIsUndebutedCopying] = React.useState<string | boolean>(false);
  const [isUndebutedTextCopying, setIsUndebutedTextCopying] = React.useState<boolean>(false);
  
  const undebutedRefContainer = useRef<HTMLDivElement>(null);
  const undebutedTableRef = useRef<HTMLDivElement>(null);
  
  const { handleCopyImage: copyUndebutedImage, handleDownloadImage: downloadUndebutedImage } = useTableScreenshot(undebutedTableRef);

  const prepareTableForCopy = (container: HTMLElement, subset?: string) => {
    const rows = container.querySelectorAll(".copy-row");
    if (subset && subset !== "full") {
      const pageNum = parseInt(subset.slice(1));
      const start = (pageNum - 1) * 50;
      const end = start + 50;
      rows.forEach((row, rIdx) => {
        if (rIdx < start || rIdx >= end) row.classList.add("hidden");
      });
    }
  };

  const resetTableAfterCopy = (container: HTMLElement) => {
    container.querySelectorAll(".copy-row").forEach((row) => row.classList.remove("hidden"));
  };

  const handleCopyUndebuted = async (mode?: string) => {
    setIsUndebutedCopying(mode || "full");
    try {
      await copyUndebutedImage({ 
        fileName: "export.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff",
        onBeforeCapture: (el) => prepareTableForCopy(el, mode),
        onAfterCapture: (el) => resetTableAfterCopy(el)
      });
    } finally {
      setIsUndebutedCopying(false);
    }
  };
  const handleCopyUndebutedText = async () => {
    performTextCopy(undebutedTableRef, setIsUndebutedTextCopying, "undebutedCyclists");
  };
  const handleDownloadUndebuted = async (mode?: string) => {
    await downloadUndebutedImage({ 
      fileName: `ciclistas-sin-debutar${mode && mode !== "full" ? `-${mode}` : ""}.png`, scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff",
      onBeforeCapture: (el) => prepareTableForCopy(el, mode),
      onAfterCapture: (el) => resetTableAfterCopy(el)
    });
  };

  const filtered = useMemo(() => {
    const raw = files.elecciones.data
      ?.map((row) => {
        const ciclista = getVal(row, "Ciclista")?.trim();
        const jugador = getVal(row, "Nombre_TG")?.trim();
        const nombreEquipo = getVal(row, "Nombre_Equipo")?.trim();
        const orden = playerOrderMap[jugador] || "";
        const ronda = cyclistRoundMap[ciclista] || "";

        const meta = cyclistMetadata[ciclista] || { carrerasDisputadas: 0, diasCompeticion: 0 };
        if (meta.diasCompeticion > 0) return null;

        return { ciclista, jugador, nombreEquipo, orden, ronda };
      })
      .filter(Boolean) as any[];

    if (!raw) return [];

    const _filtered = raw.filter((c) => {
      const teamMatch = undebutedCyclistsTeamFilter === "all" || c.nombreEquipo === undebutedCyclistsTeamFilter;
      const roundMatch = undebutedCyclistsRoundFilter.length === 0 || undebutedCyclistsRoundFilter.includes(c.ronda);
      return teamMatch && roundMatch;
    });

    _filtered.sort((a, b) => {
      let valA: any, valB: any;
      switch (undebutedCyclistsSortColumn) {
        case "jugador": valA = a.nombreEquipo; valB = b.nombreEquipo; break;
        case "ciclista": valA = a.ciclista; valB = b.ciclista; break;
        case "ronda": valA = parseInt(a.ronda) || 0; valB = parseInt(b.ronda) || 0; break;
        default: valA = parseInt(a.ronda) || 0; valB = parseInt(b.ronda) || 0; break;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return undebutedCyclistsSortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (valA < valB) return undebutedCyclistsSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return undebutedCyclistsSortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    return _filtered;
  }, [files, getVal, cyclistMetadata, cyclistRoundMap, playerOrderMap, undebutedCyclistsTeamFilter, undebutedCyclistsRoundFilter, undebutedCyclistsSortColumn, undebutedCyclistsSortDirection]);

  const numBlocks = Math.ceil(filtered.length / 50);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-8" ref={undebutedTableRef}>
      <UndebutedCyclistsFilters 
        isUndebutedExpanded={isUndebutedExpanded}
        setIsUndebutedExpanded={setIsUndebutedExpanded}
        handleCopyUndebuted={handleCopyUndebuted}
        isUndebutedCopying={isUndebutedCopying}
        handleCopyUndebutedText={handleCopyUndebutedText}
        isUndebutedTextCopying={isUndebutedTextCopying}
        handleDownloadUndebuted={handleDownloadUndebuted}
        isUndebutedRoundFilterOpen={isUndebutedRoundFilterOpen}
        setIsUndebutedRoundFilterOpen={setIsUndebutedRoundFilterOpen}
        undebutedCyclistsRoundFilter={undebutedCyclistsRoundFilter}
        setUndebutedCyclistsRoundFilter={setUndebutedCyclistsRoundFilter}
        cyclistRoundMap={cyclistRoundMap}
        undebutedCyclistsTeamFilter={undebutedCyclistsTeamFilter}
        setUndebutedCyclistsTeamFilter={setUndebutedCyclistsTeamFilter}
        leaderboard={leaderboard}
        undebutedCount={filtered.length}
        numBlocks={numBlocks}
      />
      <UndebutedCyclistsTable 
        isUndebutedExpanded={isUndebutedExpanded}
        undebutedRefContainer={undebutedRefContainer}
        undebutedCyclistsSortColumn={undebutedCyclistsSortColumn}
        setUndebutedCyclistsSortColumn={setUndebutedCyclistsSortColumn}
        undebutedCyclistsSortDirection={undebutedCyclistsSortDirection}
        setUndebutedCyclistsSortDirection={setUndebutedCyclistsSortDirection}
        filtered={filtered}
        isUndebutedCopying={isUndebutedCopying}
      />
    </div>
  );
}
