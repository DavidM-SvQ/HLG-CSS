import React, { useState, useRef } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCrosshair } from '../../hooks/useCrosshair';
import { List, Minimize2, Maximize2, Copy, CheckCircle2, UploadCloud, Search } from "lucide-react";
import { domToDataUrl } from "modern-screenshot";
import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";
import { cn } from "../../lib/utils";
import { formatNumberSpanish, getCategoryColorStyle, getVal } from "../../lib/data-processing";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { DRAFT_RANK_MAP } from "../../lib/constants";
import { useStartlistData } from "../../hooks/useStartlistData";
import { ExportToolbar } from "../ui/ExportToolbar";

export interface StartlistTeamRow {
  orden: string;
  equipo: string;
  numCiclistas: number;
  puntos: number;
  puntosMedios: number;
}

export interface StartlistViewProps {
  files: any;
  publicStartlistRace: string;
  setPublicStartlistRace: (val: string) => void;
  cyclistMetadata: Record<string, any>;
  cyclistRoundMap: Record<string, string>;
  playerTeamMap: Record<string, string>;
  playerOrderMap: Record<string, string>;
}

const colorScale = (val: number, max: number, inverted?: boolean) => {
  const t = max === 0 ? 0 : Math.max(0, Math.min(1, val / max));
  const hue = inverted ? 120 - t * 120 : t * 120; // 0=red, 120=green
  return `rgb(${Math.round(255 - t * 100)}, ${Math.round(t * 200)}, 100)`;
};

export const StartlistView: React.FC<StartlistViewProps> = ({
  files,
  publicStartlistRace,
  setPublicStartlistRace,
  cyclistMetadata,
  cyclistRoundMap,
  playerTeamMap,
  playerOrderMap,
}) => {
  const initParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initSortCol = (initParams.get("sort_col") as "jugador" | "ronda" | "puntos" | "dias") || "jugador";
  const initSortDir = (initParams.get("sort_dir") as "asc" | "desc") || "asc";
  const initTeam = initParams.get("team") || "All";
  const initRondasStr = initParams.get("rondas");
  const initRondas = initRondasStr ? initRondasStr.split(",") : [];
  const initDiasMin = initParams.get("dias_min") ? Number(initParams.get("dias_min")) : '';
  const initDiasMax = initParams.get("dias_max") ? Number(initParams.get("dias_max")) : '';
  const initDebut = initParams.get("debut") || 'Todos';
  const initPuntosMin = initParams.get("puntos_min") ? Number(initParams.get("puntos_min")) : '';
  const initPuntosMax = initParams.get("puntos_max") ? Number(initParams.get("puntos_max")) : '';

  const [startlistSortCol, setStartlistSortCol] = useState<"jugador" | "ronda" | "puntos" | "dias">(initSortCol);
  const [startlistSortDir, setStartlistSortDir] = useState<"asc" | "desc">(initSortDir);
  const [startlistFilterTeam, setStartlistFilterTeam] = useState<string>(initTeam);
  const [startlistFilterRondas, setStartlistFilterRondas] = useState<string[]>(initRondas);
  const [startlistFilterDiasMin, setStartlistFilterDiasMin] = useState<number | ''>(initDiasMin);
  const [startlistFilterDiasMax, setStartlistFilterDiasMax] = useState<number | ''>(initDiasMax);
  const [startlistFilterDebut, setStartlistFilterDebut] = useState<string>(initDebut);
  const [startlistFilterPuntosMin, setStartlistFilterPuntosMin] = useState<number | ''>(initPuntosMin);
  const [startlistFilterPuntosMax, setStartlistFilterPuntosMax] = useState<number | ''>(initPuntosMax);

  const [isStartlistTableExpanded, setIsStartlistTableExpanded] = useState(false);
  const [isStartlistTeamsTableExpanded, setIsStartlistTeamsTableExpanded] = useState(false);
  const [isStartlistCopying, setIsStartlistCopying] = useState<string | null>(null);
  const [isStartlistTeamsCopying, setIsStartlistTeamsCopying] = useState<string | null>(null);
  const [isStartlistTextCopying, setIsStartlistTextCopying] = useState(false);
  const [isStartlistTeamsTextCopying, setIsStartlistTeamsTextCopying] = useState(false);

  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  const [isPointsTextCopying, setIsPointsTextCopying] = useState(false);
  const [isPointsImageCopying, setIsPointsImageCopying] = useState<string | null>(null);

  const startlistTableRef = useRef<HTMLDivElement>(null);
  const startlistScrollRef = useRef<HTMLDivElement>(null);
  const startlistTeamsTableRef = useRef<HTMLDivElement>(null);
  const pointsTableRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (startlistSortCol !== "jugador") searchParams.set("sort_col", startlistSortCol); else searchParams.delete("sort_col");
    if (startlistSortDir !== "asc") searchParams.set("sort_dir", startlistSortDir); else searchParams.delete("sort_dir");
    if (startlistFilterTeam !== "All") searchParams.set("team", startlistFilterTeam); else searchParams.delete("team");
    if (startlistFilterRondas.length > 0) searchParams.set("rondas", startlistFilterRondas.join(",")); else searchParams.delete("rondas");
    if (startlistFilterDiasMin !== '') searchParams.set("dias_min", String(startlistFilterDiasMin)); else searchParams.delete("dias_min");
    if (startlistFilterDiasMax !== '') searchParams.set("dias_max", String(startlistFilterDiasMax)); else searchParams.delete("dias_max");
    if (startlistFilterDebut !== 'Todos') searchParams.set("debut", startlistFilterDebut); else searchParams.delete("debut");
    if (startlistFilterPuntosMin !== '') searchParams.set("puntos_min", String(startlistFilterPuntosMin)); else searchParams.delete("puntos_min");
    if (startlistFilterPuntosMax !== '') searchParams.set("puntos_max", String(startlistFilterPuntosMax)); else searchParams.delete("puntos_max");
    
    const query = searchParams.toString();
    const newUrl = query ? `?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [startlistSortCol, startlistSortDir, startlistFilterTeam, startlistFilterRondas, startlistFilterDiasMin, startlistFilterDiasMax, startlistFilterDebut, startlistFilterPuntosMin, startlistFilterPuntosMax]);

  const { startlistArray, raceCategory, racePoints, memoizedData } = useStartlistData(
    files,
    publicStartlistRace,
    setPublicStartlistRace,
    cyclistMetadata,
    cyclistRoundMap,
    playerTeamMap,
    playerOrderMap,
    {
      team: startlistFilterTeam,
      rondas: startlistFilterRondas,
      diasMin: startlistFilterDiasMin,
      diasMax: startlistFilterDiasMax,
      debut: startlistFilterDebut,
      puntosMin: startlistFilterPuntosMin,
      puntosMax: startlistFilterPuntosMax,
    },
    startlistSortCol,
    startlistSortDir
  );

  const handleCopyStartlist = async (subset?: string) => {
    if (!startlistTableRef.current || isStartlistCopying) return;
    setIsStartlistCopying(subset || 'p1');

    const processCopy = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (!startlistTableRef.current) throw new Error("No ref");
      const restore = expandNodeForCapture(startlistTableRef.current);
      try {
        const dataUrl = await domToDataUrl(startlistTableRef.current, {
          scale: 3, backgroundColor: '#ffffff', style: { overflow: "visible", textRendering: "optimizeLegibility" }
        });
        const response = await fetch(dataUrl);
        return await response.blob();
      } finally {
        restore();
      }
    };

    const suffix = subset ? `_${subset}` : '';
    await copyImageToClipboard(processCopy(), `startlist_${publicStartlistRace || 'export'}${suffix}.png`);
    setTimeout(() => setIsStartlistCopying(null), 2000);
  };

  const handleDownloadStartlist = async (subset?: string) => {
    if (!startlistTableRef.current) return;
    setIsStartlistCopying(subset || 'p1');
    setTimeout(async () => {
      try {
        const restore = expandNodeForCapture(startlistTableRef.current!);
        const dataUrl = await domToDataUrl(startlistTableRef.current!, {
          scale: 3, backgroundColor: '#ffffff', style: { overflow: "visible", textRendering: "optimizeLegibility" }
        });
        restore();
        const link = document.createElement("a");
        link.href = dataUrl;
        const suffix = subset ? `_${subset}` : '';
        link.download = `startlist_${publicStartlistRace}${suffix}.png`;
        link.click();
      } finally {
        setIsStartlistCopying(null);
      }
    }, 150);
  };

  const handleCopyStartlistText = async () => {
    if (!startlistTableRef.current || isStartlistTextCopying) return;
    setIsStartlistTextCopying(true);
    const table = startlistTableRef.current.querySelector("table");
    if (table) {
      const rows = Array.from(table.rows as HTMLCollectionOf<HTMLTableRowElement>);
      const text = rows
        .map((row) =>
          Array.from(row.cells as HTMLCollectionOf<HTMLTableCellElement>)
            .map((cell) => cell.innerText.trim())
            .join("\t"),
        )
        .join("\n");
      await copyTextToClipboard(text, `startlist_${publicStartlistRace || 'export'}.txt`);
    }
    setTimeout(() => setIsStartlistTextCopying(false), 2000);
  };

  const handleCopyStartlistTeams = async (subset?: string) => {
    if (!startlistTeamsTableRef.current || isStartlistTeamsCopying) return;
    setIsStartlistTeamsCopying(subset || 'p1');

    const processCopy = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (!startlistTeamsTableRef.current) throw new Error("No ref");
      const restore = expandNodeForCapture(startlistTeamsTableRef.current);
      try {
        const dataUrl = await domToDataUrl(startlistTeamsTableRef.current, {
          scale: 3, backgroundColor: '#ffffff', style: { overflow: "visible", textRendering: "optimizeLegibility" }
        });
        const response = await fetch(dataUrl);
        return await response.blob();
      } finally {
        restore();
      }
    };

    const suffix = subset ? `_${subset}` : '';
    await copyImageToClipboard(processCopy(), `startlist_teams_${publicStartlistRace || 'export'}${suffix}.png`);
    setTimeout(() => setIsStartlistTeamsCopying(null), 2000);
  };

  const handleDownloadStartlistTeams = async (subset?: string) => {
    if (!startlistTeamsTableRef.current) return;
    setIsStartlistTeamsCopying(subset || 'p1');
    setTimeout(async () => {
      let restore = () => {};
      try {
        if (startlistTeamsTableRef.current) {
          restore = expandNodeForCapture(startlistTeamsTableRef.current);
          const dataUrl = await domToDataUrl(startlistTeamsTableRef.current, {
            scale: 3, backgroundColor: '#ffffff', style: { overflow: "visible", textRendering: "optimizeLegibility" }
          });
          const link = document.createElement("a");
          link.href = dataUrl;
          const suffix = subset ? `_${subset}` : '';
          link.download = `startlist_teams_${publicStartlistRace || 'export'}${suffix}.png`;
          link.click();
        }
      } catch (err) {
        console.error("Download failed", err);
      } finally {
        restore();
        setIsStartlistTeamsCopying(null);
      }
    }, 150);
  };

  const handleCopyStartlistTeamsText = async () => {
    if (!startlistTeamsTableRef.current || isStartlistTeamsTextCopying) return;
    setIsStartlistTeamsTextCopying(true);
    const table = startlistTeamsTableRef.current.querySelector("table");
    if (table) {
      const rows = Array.from(table.rows as HTMLCollectionOf<HTMLTableRowElement>);
      const text = rows
        .map((row) =>
          Array.from(row.cells as HTMLCollectionOf<HTMLTableCellElement>)
            .map((cell) => cell.innerText.trim())
            .join("\t"),
        )
        .join("\n");
      await copyTextToClipboard(text, `startlist_teams_${publicStartlistRace || 'export'}.txt`);
    }
    setTimeout(() => setIsStartlistTeamsTextCopying(false), 2000);
  };

  const handleCopyPoints = async () => {
    if (!pointsTableRef.current || isPointsTextCopying) return;
    setIsPointsTextCopying(true);
    const table = pointsTableRef.current.querySelector("table");
    if (table) {
      const rows = Array.from(table.rows as HTMLCollectionOf<HTMLTableRowElement>);
      const text = rows
        .map((row) =>
          Array.from(row.cells as HTMLCollectionOf<HTMLTableCellElement>)
            .map((cell) => cell.innerText.trim())
            .join("\t"),
        )
        .join("\n");
      await copyTextToClipboard(text, `points_${publicStartlistRace || 'export'}.txt`);
    }
    setTimeout(() => setIsPointsTextCopying(false), 2000);
  };

  const handleCopyPointsImage = async (subset?: string) => {
    if (!pointsTableRef.current || isPointsImageCopying) return;
    setIsPointsImageCopying(subset || 'p1');
    const tableContainer = pointsTableRef.current;
    
    const processCopy = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const originalClass = tableContainer.className;
      tableContainer.className = originalClass.replace("overflow-x-auto", "");
      const restore = expandNodeForCapture(tableContainer);
      try {
        const dataUrl = await domToDataUrl(tableContainer, {
          scale: 3, backgroundColor: '#ffffff', style: { overflow: "visible" }
        });
        const response = await fetch(dataUrl);
        return await response.blob();
      } finally {
        restore();
        tableContainer.className = originalClass;
      }
    };

    const suffix = subset ? `_${subset}` : '';
    await copyImageToClipboard(processCopy(), `puntos_${publicStartlistRace || 'export'}${suffix}.png`);
    setTimeout(() => setIsPointsImageCopying(null), 2000);
  };

  const handleDownloadPointsImage = async (subset?: string) => {
    if (!pointsTableRef.current) return;
    setIsPointsImageCopying(subset || 'p1');
    const tableContainer = pointsTableRef.current;
    
    setTimeout(async () => {
      try {
        const originalClass = tableContainer.className;
        tableContainer.className = originalClass.replace("overflow-x-auto", "");
        const restore = expandNodeForCapture(tableContainer);
        try {
          const dataUrl = await domToDataUrl(tableContainer, {
            scale: 3, backgroundColor: '#ffffff', style: { overflow: "visible" }
          });
          const link = document.createElement("a");
          link.href = dataUrl;
          const suffix = subset ? `_${subset}` : '';
          link.download = `puntos_${publicStartlistRace}${suffix}.png`;
          link.click();
        } finally {
          restore();
          tableContainer.className = originalClass;
        }
      } finally {
        setIsPointsImageCopying(null);
      }
    }, 150);
  };

  const calculatePages = (rows: any[], targetSize: number, groupKey?: string) => {
    const pages: number[] = [];
    let currentPage = 1;
    let currentSize = 0;
    let prevGroup = null;
    rows.forEach((r) => {
      const groupVal = groupKey ? r[groupKey] : null;
      const shouldBreak = groupKey 
        ? (currentSize >= targetSize && groupVal !== prevGroup) 
        : (currentSize >= targetSize);
      if (currentSize > 0 && shouldBreak) {
        currentPage++;
        currentSize = 0;
      }
      pages.push(currentPage);
      currentSize++;
      prevGroup = groupVal;
    });
    return { pages, totalPages: Math.max(1, currentPage) };
  };

  const pointsPagination = calculatePages(racePoints, 50);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 min-h-[600px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Startlists por Carrera
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Consulta los ciclistas de la liga participantes en cada carrera.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-blue-600 hidden md:block" />
          {startlistArray.length > 0 && (
              <select
                value={publicStartlistRace}
                onChange={(e) => setPublicStartlistRace(e.target.value)}
                className="pl-3 pr-8 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Selecciona carrera --</option>
                {startlistArray
                  .filter((sl: any) => sl && sl.carrera)
                  .map((sl: any, idx: number) => (
                    <option key={idx} value={sl.carrera}>
                      {sl.carrera}
                    </option>
                  ))}
              </select>
            )}
        </div>
      </div>

      {startlistArray.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 italic">
          No hay startlists cargadas actualmente.
        </div>
      ) : !publicStartlistRace ? (
        <div className="text-center py-20 text-neutral-500 flex flex-col items-center gap-4">
          <List className="w-12 h-12 text-blue-200" />
          <p>
            Selecciona una carrera en el menú superior para ver los
            participantes.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(() => {
            if (memoizedData.filteredRows.length === 0 && memoizedData.teamRows.length === 0) return null;
            const { filteredRows, teamRows, uniqueTeams, uniqueRondas, maxCiclistas, minCiclistas, minTeamPoints, maxTeamPoints, minTeamPointsMedios, maxTeamPointsMedios } = memoizedData;
            const getTeamPointsColorStyle = (punt: number) => {
              if (punt === 0) return {};
              return {
                backgroundColor: colorScale(
                  punt - minTeamPoints,
                  maxTeamPoints - minTeamPoints,
                ).replace("rgb", "rgba").replace(")", ", 0.2)"),
                color: colorScale(
                  punt - minTeamPoints,
                  maxTeamPoints - minTeamPoints,
                  true,
                ),
              };
            };
            const getTeamPointsMediosColorStyle = (punt: number) => {
              if (punt === 0) return {};
              return {
                backgroundColor: colorScale(
                  punt - minTeamPointsMedios,
                  maxTeamPointsMedios - minTeamPointsMedios,
                ).replace("rgb", "rgba").replace(")", ", 0.2)"),
                color: colorScale(
                  punt - minTeamPointsMedios,
                  maxTeamPointsMedios - minTeamPointsMedios,
                  true,
                ),
              };
            };

            const toggleSort = (
              col: "jugador" | "ronda" | "puntos" | "dias",
            ) => {
              if (startlistSortCol === col)
                setStartlistSortDir((prev) =>
                  prev === "asc" ? "desc" : "asc",
                );
              else {
                setStartlistSortCol(col);
                setStartlistSortDir("asc");
              }
            };

            const filteredRowPagination = calculatePages(filteredRows, 50, "jugador");
            const teamRowPagination = calculatePages(teamRows, 30);

            const toggleRonda = (ronda: string) => {
              setStartlistFilterRondas((prev) => 
                prev.includes(ronda) ? prev.filter((r) => r !== ronda) : [...prev, ronda]
              );
            };

            return (
              <div className="space-y-6">
                <div
                  className={cn(
                    "relative flex flex-col bg-white border border-neutral-200 shadow-sm rounded-lg p-6",
                    isStartlistTableExpanded &&
                      "fixed inset-4 z-50 bg-white shadow-2xl overflow-y-auto max-h-none border border-neutral-200",
                  )}
                  ref={startlistTableRef}
                  style={isStartlistTableExpanded ? { width: "auto" } : {}}
                >
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-neutral-800">
                        Ciclistas Participantes ({filteredRows.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        {!isStartlistTableExpanded && (
                          <div className="copy-button-ignore">
                            <ExportToolbar 
                              isExpanded={isStartlistTableExpanded} 
                              onExpand={() => setIsStartlistTableExpanded(!isStartlistTableExpanded)} 
                              onCopyText={handleCopyStartlistText}
                              isTextCopying={isStartlistTextCopying}
                              onCopyImage={handleCopyStartlist} 
                              isImageCopying={isStartlistCopying} 
                              imagePageCount={filteredRowPagination.totalPages}
                              onDownloadImage={handleDownloadStartlist}
                            />
                          </div>
                        )}
                        {isStartlistTableExpanded && (
                          <button
                            onClick={() => setIsStartlistTableExpanded(false)}
                            className="p-2 bg-neutral-800 text-white rounded-md shadow-lg z-50 copy-button-ignore flex items-center gap-2 hover:bg-neutral-700 transition-colors"
                          >
                            <Minimize2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {!isStartlistTableExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-end copy-button-ignore bg-neutral-50 p-3 rounded-md border border-neutral-200">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-neutral-500 uppercase">Equipo</label>
                          <select
                            value={startlistFilterTeam}
                            onChange={(e) => setStartlistFilterTeam(e.target.value)}
                            className="px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none text-neutral-700 font-medium hover:border-neutral-300 transition-colors"
                          >
                            <option value="All">Todos</option>
                            {uniqueTeams.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1 relative group">
                          <label className="text-xs font-semibold text-neutral-500 uppercase">Rondas</label>
                          <div className="relative">
                            <div className="px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none text-neutral-700 font-medium min-h-[34px] flex items-center overflow-hidden cursor-pointer hover:border-neutral-300">
                              {startlistFilterRondas.length === 0 ? "Todas" : startlistFilterRondas.join(", ")}
                            </div>
                            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-neutral-200 rounded-md shadow-lg z-50 hidden group-hover:block p-2 max-h-48 overflow-y-auto">
                              <label className="flex items-center gap-2 p-1 hover:bg-neutral-50 cursor-pointer rounded">
                                <input 
                                  type="checkbox" 
                                  checked={startlistFilterRondas.length === 0} 
                                  onChange={() => setStartlistFilterRondas([])}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">Todas</span>
                              </label>
                              {uniqueRondas.map((r: string) => (
                                <label key={r} className="flex items-center gap-2 p-1 hover:bg-neutral-50 cursor-pointer rounded">
                                  <input 
                                    type="checkbox" 
                                    checked={startlistFilterRondas.includes(r)} 
                                    onChange={() => toggleRonda(r)}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm">{r}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-neutral-500 uppercase flex gap-1 items-center">
                            Días <span className="text-neutral-400 font-normal">(Min - Max)</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={startlistFilterDiasMin} 
                              onChange={(e) => setStartlistFilterDiasMin(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="Mín" 
                              className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
                            />
                            <span className="text-neutral-400">-</span>
                            <input 
                              type="number" 
                              value={startlistFilterDiasMax} 
                              onChange={(e) => setStartlistFilterDiasMax(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="Máx" 
                              className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-neutral-500 uppercase flex gap-1 items-center">
                            Puntos <span className="text-neutral-400 font-normal">(Min - Max)</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={startlistFilterPuntosMin} 
                              onChange={(e) => setStartlistFilterPuntosMin(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="Mín" 
                              className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
                            />
                            <span className="text-neutral-400">-</span>
                            <input 
                              type="number" 
                              value={startlistFilterPuntosMax} 
                              onChange={(e) => setStartlistFilterPuntosMax(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="Máx" 
                              className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-neutral-500 uppercase">Debut</label>
                          <select
                            value={startlistFilterDebut}
                            onChange={(e) => setStartlistFilterDebut(e.target.value)}
                            className="px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none text-neutral-700 font-medium hover:border-neutral-300 transition-colors"
                          >
                            <option value="Todos">Todos</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div ref={startlistScrollRef} className="table-responsive-wrapper overflow-auto border border-neutral-200 rounded-lg flex-1 crosshair-container max-h-[800px]">
                    <table className="w-full min-w-[750px] text-[13px] text-left table-fixed">
                      <thead className="text-[11px] text-neutral-500 uppercase sticky top-0 z-10 bg-neutral-50 shadow-[0_1px_0_0_#e5e5e5]">
                        <tr>
                          <th
                            className="px-3 py-2 cursor-pointer hover:bg-neutral-100 transition-colors duration-150 group w-[35%] sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5,4px_0_8px_-2px_rgba(0,0,0,0.05)]"
                            onClick={() => toggleSort("jugador")}
                          >
                            <span className="flex items-center gap-1">
                              Equipo{" "}
                              {startlistSortCol === "jugador" &&
                                (startlistSortDir === "asc"
                                  ? "↑"
                                  : "↓")}
                            </span>
                          </th>
                          <th className="px-3 py-2 w-12 text-center text-neutral-400 font-medium">
                            Dor
                          </th>
                          <th className="px-3 py-2 text-neutral-800 font-semibold w-[35%]">
                            Ciclista
                          </th>
                          <th className="px-3 py-2 text-center w-[12%]">
                            País
                          </th>
                          <th className="px-3 py-2 text-center w-[12%]">
                            Eq
                          </th>
                          <th
                            className="px-3 py-2 text-center cursor-pointer hover:bg-neutral-100 transition-colors duration-150 group w-16"
                            onClick={() => toggleSort("ronda")}
                          >
                            <span className="flex justify-center gap-1">
                              Rnd{" "}
                              {startlistSortCol === "ronda" &&
                                (startlistSortDir === "asc"
                                  ? "↑"
                                  : "↓")}
                            </span>
                          </th>
                          <th
                            className="px-3 py-2 text-center cursor-pointer hover:bg-neutral-100 transition-colors duration-150 group w-16"
                            onClick={() => toggleSort("dias")}
                            title="Días de Competición Totales"
                          >
                            <span className="flex justify-center gap-1 border-b border-dashed border-neutral-300">
                              Día{" "}
                              {startlistSortCol === "dias" &&
                                (startlistSortDir === "asc"
                                  ? "↑"
                                  : "↓")}
                            </span>
                          </th>
                          <th className="px-3 py-2 text-center w-[10%]">
                            Debut
                          </th>
                          <th
                            className="px-3 py-2 text-right cursor-pointer hover:bg-neutral-100 transition-colors duration-150 group w-20"
                            onClick={() => toggleSort("puntos")}
                            title="Puntos con los que el ciclista ha llegado a esta carrera"
                          >
                            <span className="flex justify-end gap-1 border-b border-dashed border-neutral-300">
                              Pts{" "}
                              {startlistSortCol === "puntos" &&
                                (startlistSortDir === "asc"
                                  ? "↑"
                                  : "↓")}
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredRows.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-12 border-none">
                              <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                                  <Search className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-neutral-900 mb-1">No hay resultados</h4>
                                <p className="text-sm text-neutral-500 max-w-sm mb-4">
                                  No se han encontrado ciclistas que coincidan con los filtros actuales.
                                </p>
                                <button
                                  onClick={() => {
                                    setStartlistFilterTeam("All");
                                    setStartlistFilterRondas([]);
                                    setStartlistFilterDiasMin('');
                                    setStartlistFilterDiasMax('');
                                    setStartlistFilterDebut("Todos");
                                    setStartlistFilterPuntosMin('');
                                    setStartlistFilterPuntosMax('');
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                  Limpiar filtros
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : filteredRows.map((r, i) => {
                          const page = filteredRowPagination.pages[i];
                          let isHiddenVisual = false;
                          if (isStartlistCopying) {
                            if (isStartlistCopying !== 'full' && isStartlistCopying !== `p${page}`) {
                              isHiddenVisual = true;
                            }
                          }

                          const getCyclistPointsColorStyle = (punt: number) => {
                            if (punt === 0 && memoizedData.maxCyclistPoints === 0) return {};
                            const min = memoizedData.minCyclistPoints;
                            const max = memoizedData.maxCyclistPoints;
                            const range = max - min;
                            const val = punt - min;
                            const t = range === 0 ? 1 : Math.max(0, Math.min(1, val / range));
                            return {
                              backgroundColor: `hsla(${t * 120}, 70%, 50%, 0.15)`,
                              color: `hsla(${t * 120}, 80%, 35%, 1)`
                            };
                          };

                          return (
                          <tr
                            key={i}
                            className={cn(
                              "group hover:bg-blue-50/50 transition-colors",
                              isHiddenVisual && "hidden"
                            )}
                          >
                            <td className="px-3 py-2 font-medium text-neutral-800 truncate sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5,4px_0_8px_-2px_rgba(0,0,0,0.05)] group-hover:bg-blue-50/50" title={r.jugador}>
                              {r.jugador}
                            </td>
                            <td className="px-3 py-2 text-center text-neutral-400 font-mono text-[11px]">
                              {r.dorsal}
                            </td>
                            <td className="px-3 py-2 font-semibold text-neutral-900 truncate" title={r.ciclista}>
                              {r.ciclista}
                            </td>
                            <td className="px-3 py-2 text-center truncate">
                               <span title={r.paisLetras}>{r.pais}</span>
                            </td>
                            <td className="px-3 py-2 text-center font-medium text-neutral-600 truncate" title={r.equipo}>
                              {r.equipo}
                            </td>
                            <td className={cn(
                              "px-3 py-2 text-center font-mono text-[11px]",
                              (r.ronda === "01" || r.ronda === "02" || r.ronda === "03") && "bg-yellow-100 text-yellow-800 font-bold"
                            )}>
                              {r.ronda}
                            </td>
                            <td className={cn(
                              "px-3 py-2 text-center font-mono text-[11px]",
                              r.dias === 0 && "bg-red-100 text-red-700 font-bold",
                              r.dias > 0 && r.dias === memoizedData.maxDias && "bg-green-100 text-green-700 font-bold",
                              r.dias > 0 && r.dias === memoizedData.minDias && r.dias !== memoizedData.maxDias && "bg-orange-100 text-orange-800 font-bold"
                            )}>
                              {r.dias}
                            </td>
                            <td className="px-3 py-2 text-center text-[10px] font-bold">
                              {r.debut === "Sí" && (
                                <span className="bg-blue-100 text-blue-700 border border-blue-300 shadow-sm px-1.5 py-0.5 rounded uppercase tracking-wider relative">
                                  Sí
                                </span>
                              )}
                            </td>
                            <td 
                              className="px-3 py-2 text-right font-mono text-[11px] font-bold text-neutral-700"
                              style={r.puntos > 0 ? getCyclistPointsColorStyle(r.puntos) : {}}
                            >
                              {r.puntos > 0
                                ? formatNumberSpanish(r.puntos)
                                : "-"}
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div
                  className={cn(
                    "relative flex flex-col bg-white border border-neutral-200 shadow-sm rounded-lg p-6",
                    isStartlistTeamsTableExpanded &&
                      "fixed inset-4 z-50 bg-white shadow-2xl overflow-y-auto max-h-none border border-neutral-200",
                  )}
                  ref={startlistTeamsTableRef}
                  style={
                    isStartlistTeamsTableExpanded ? { width: "auto" } : {}
                  }
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      Resumen Equipos
                    </h3>
                    <div className="flex gap-2 relative copy-button-ignore">
                      <ExportToolbar 
                        isExpanded={isStartlistTeamsTableExpanded} 
                        onExpand={() => setIsStartlistTeamsTableExpanded(!isStartlistTeamsTableExpanded)} 
                        onCopyText={handleCopyStartlistTeamsText}
                        isTextCopying={isStartlistTeamsTextCopying}
                        onCopyImage={handleCopyStartlistTeams} 
                        isImageCopying={isStartlistTeamsCopying} 
                        imagePageCount={teamRowPagination.totalPages}
                        onDownloadImage={handleDownloadStartlistTeams}
                      />
                    </div>
                  </div>
                  <div className="table-responsive-wrapper overflow-auto w-full max-h-[600px]">
                    <table className="w-full min-w-[400px] text-[13px] text-left">
                      <thead className="text-[11px] text-neutral-500 uppercase sticky top-0 z-10 bg-neutral-50 shadow-[0_1px_0_0_#e5e5e5]">
                        <tr>
                          <th className="px-2 py-1 sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5,4px_0_8px_-2px_rgba(0,0,0,0.05)]">Equipo</th>
                          <th
                            className="px-2 py-1 text-center w-px whitespace-nowrap"
                            title="Desviación respecto a la media"
                          >
                            <span className="border-b border-dashed border-neutral-300">
                              Nº cic
                            </span>
                          </th>
                          <th
                            className="px-2 py-1 text-center w-px"
                            title="Puntos Totales (Excluyendo esta carrera)"
                          >
                            <span className="border-b border-dashed border-neutral-300">
                              Pts
                            </span>
                          </th>
                          <th
                            className="px-2 py-1 text-center w-px"
                            title="Puntos Medios"
                          >
                            <span className="border-b border-dashed border-neutral-300">
                              P/C
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                      {teamRows.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-neutral-500 font-medium italic bg-neutral-50/50">
                            No hay datos de equipos con estos filtros.
                          </td>
                        </tr>
                      ) : teamRows.map((r, i) => {
                        const page = teamRowPagination.pages[i];
                        let isHiddenVisual = false;
                        if (isStartlistTeamsCopying) {
                          if (isStartlistTeamsCopying !== 'full' && isStartlistTeamsCopying !== `p${page}`) {
                            isHiddenVisual = true;
                          }
                        }
                        return (
                          <React.Fragment key={i}>
                            {r.numCiclistas === 0 && i > 0 && teamRows[i-1].numCiclistas > 0 && (
                              <tr className={cn(isHiddenVisual && "hidden")}>
                                <td colSpan={4} className="h-6 bg-neutral-100/80 border-y border-neutral-200" />
                              </tr>
                            )}
                            <tr
                              className={cn(
                                "group hover:bg-blue-50/50 transition-colors",
                                isHiddenVisual && "hidden"
                              )}
                            >
                              <td className="px-2 py-0.5 font-medium text-xs whitespace-nowrap sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5,4px_0_8px_-2px_rgba(0,0,0,0.05)] group-hover:bg-blue-50/50">
                                {r.equipo}
                              </td>
                              <td
                                className={cn(
                                  "px-2 py-0.5 text-center font-mono text-[11px] w-px",
                                  r.numCiclistas === 0
                                    ? "text-red-600 font-bold"
                                    : "",
                                  r.numCiclistas !== 0 &&
                                    r.numCiclistas === maxCiclistas
                                    ? "bg-green-100 font-bold"
                                    : "",
                                  r.numCiclistas !== 0 &&
                                    r.numCiclistas !== maxCiclistas &&
                                    r.numCiclistas === minCiclistas
                                    ? "bg-yellow-100 font-bold"
                                    : "",
                                )}
                              >
                                {r.numCiclistas}
                              </td>
                              <td
                                className="px-2 py-0.5 text-center font-mono text-[11px] font-bold text-neutral-700 w-px"
                                style={getTeamPointsColorStyle(
                                  r.puntos,
                                )}
                              >
                                <span className="font-mono tracking-tight">{formatNumberSpanish(r.puntos)}</span>
                              </td>
                              <td
                                className="px-2 py-0.5 text-center font-mono text-[11px] font-bold text-blue-800 w-px"
                                style={getTeamPointsMediosColorStyle(
                                  r.puntosMedios,
                                )}
                              >
                                <span className="font-mono tracking-tight">{formatNumberSpanish(r.puntosMedios)}</span>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                    </table></div>
                  </div>
              </div>
            );
          })()}
          
          {racePoints.length > 0 && (
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Puntuaciones ({raceCategory})</h3>
                <div className="flex items-center gap-2 copy-button-ignore">
                  <ExportToolbar 
                    isExpanded={isPointsExpanded} 
                    onExpand={() => setIsPointsExpanded(!isPointsExpanded)} 
                    onCopyText={handleCopyPoints} 
                    isTextCopying={isPointsTextCopying} 
                    onCopyImage={handleCopyPointsImage} 
                    isImageCopying={isPointsImageCopying} 
                    imagePageCount={pointsPagination.totalPages}
                    onDownloadImage={handleDownloadPointsImage} 
                  />
                </div>
              </div>
              <div 
                ref={pointsTableRef}
                className={cn(
                  "bg-white flex flex-col",
                  isPointsExpanded
                    ? "fixed inset-8 z-[100] p-6 shadow-2xl rounded-2xl overflow-y-auto border border-neutral-200"
                    : "overflow-x-auto rounded-xl border border-neutral-200 shadow-sm"
                )}
              >
                {isPointsExpanded && (
                  <div className="flex items-center justify-between mb-6 copy-button-ignore">
                     <h3 className="text-xl font-bold text-neutral-900">Puntuaciones ({raceCategory})</h3>
                    <button
                      onClick={() => setIsPointsExpanded(false)}
                      className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors"
                      title="Contraer"
                    >
                      <Minimize2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-neutral-500 uppercase sticky top-0 z-10 bg-neutral-50 shadow-[0_1px_0_0_#e5e5e5]">
                    <tr>
                      <th className="px-4 py-3 font-semibold w-1/4">Tipo</th>
                      <th className="px-4 py-3 font-semibold text-center w-1/4">Posición</th>
                      <th className="px-4 py-3 font-semibold text-right w-1/4">Puntos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {racePoints.map((p: any, idx: number) => {
                      const page = pointsPagination.pages[idx];
                      let isHiddenVisual = false;
                      if (isPointsImageCopying) {
                        if (isPointsImageCopying !== 'full' && isPointsImageCopying !== `p${page}`) {
                          isHiddenVisual = true;
                        }
                      }
                      return (
                      <tr key={idx} className={cn("hover:bg-blue-50/50 transition-colors", isHiddenVisual && "hidden")}>
                        <td className="px-4 py-2 bg-neutral-50/30">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-600">
                            {getVal(p, "Tipo")}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center text-neutral-700 font-medium font-mono text-[11px]">
                          {getVal(p, "Posición")}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-blue-600">
                          {getVal(p, "Puntos")}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
