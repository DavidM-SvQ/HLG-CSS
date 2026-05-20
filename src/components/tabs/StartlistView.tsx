import { StartlistFilters } from "./season/StartlistFilters";
import { StartlistTable } from "./season/StartlistTable";
import { StartlistTeamsTable } from "./season/StartlistTeamsTable";
import { StartlistPointsTable } from "./season/StartlistPointsTable";
import React, { useState, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCrosshair } from "../../hooks/useCrosshair";
import {
  List,
  Minimize2,
  Maximize2,
  Copy,
  CheckCircle2,
  UploadCloud,
  Search,
} from "lucide-react";
import { useTableScreenshot } from "../../hooks/useTableScreenshot";
import { copyTextToClipboard } from "../../lib/clipboard";
import { cn } from "../../lib/utils";
import {
  formatNumberSpanish,
  getCategoryColorStyle,
  getVal,
} from "../../lib/data-processing";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { DRAFT_RANK_MAP } from "../../lib/constants";
import { useStartlistData } from "../../hooks/useStartlistData";
import { useUrlState } from "../../hooks/useUrlState";
import { Button } from "../ui/button";
import { ReportCard } from "../ui/ReportCard";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";

export interface StartlistTeamRow {
  orden: string;
  equipo: string;
  numCiclistas: number;
  puntos: number;
  puntosMedios: number;
}

const colorScale = (val: number, max: number, inverted?: boolean) => {
  const t = max === 0 ? 0 : Math.max(0, Math.min(1, val / max));
  const hue = inverted ? 120 - t * 120 : t * 120; // 0=red, 120=green
  return `rgb(${Math.round(255 - t * 100)}, ${Math.round(t * 200)}, 100)`;
};

export const StartlistView = () => {
  const { files } = useDataStore();
  const { 
    cyclistMetadata,
    cyclistRoundMap,
    playerTeamMap,
    playerOrderMap
  } = useComputedStore();

  const [publicStartlistRace, setPublicStartlistRace] = useUrlState<string>("startlist_race", "");

  const [startlistSortCol, setStartlistSortCol] = useUrlState<
    "jugador" | "ronda" | "puntos" | "dias"
  >("sort_col", "jugador");
  const [startlistSortDir, setStartlistSortDir] = useUrlState<"asc" | "desc">(
    "sort_dir",
    "asc",
  );
  const [startlistFilterTeam, setStartlistFilterTeam] = useUrlState<string>(
    "team",
    "All",
  );
  const [startlistFilterRondas, setStartlistFilterRondas] = useUrlState<
    string[]
  >("rondas", []);
  const [startlistFilterDiasMin, setStartlistFilterDiasMin] = useUrlState<
    number | ""
  >("dias_min", "");
  const [startlistFilterDiasMax, setStartlistFilterDiasMax] = useUrlState<
    number | ""
  >("dias_max", "");
  const [startlistFilterDebut, setStartlistFilterDebut] = useUrlState<string>(
    "debut",
    "Todos",
  );
  const [startlistFilterPuntosMin, setStartlistFilterPuntosMin] = useUrlState<
    number | ""
  >("puntos_min", "");
  const [startlistFilterPuntosMax, setStartlistFilterPuntosMax] = useUrlState<
    number | ""
  >("puntos_max", "");

  const [isStartlistTableExpanded, setIsStartlistTableExpanded] =
    useState(false);
  const [isStartlistTeamsTableExpanded, setIsStartlistTeamsTableExpanded] =
    useState(false);
  const [isStartlistCopying, setIsStartlistCopying] = useState<string | null>(
    null,
  );
  const [isStartlistTeamsCopying, setIsStartlistTeamsCopying] = useState<
    string | null
  >(null);
  const [isStartlistTextCopying, setIsStartlistTextCopying] = useState(false);
  const [isStartlistTeamsTextCopying, setIsStartlistTeamsTextCopying] =
    useState(false);

  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  const [isPointsTextCopying, setIsPointsTextCopying] = useState(false);
  const [isPointsImageCopying, setIsPointsImageCopying] = useState<
    string | null
  >(null);

  const startlistTableRef = useRef<HTMLDivElement>(null);
  const startlistScrollRef = useRef<HTMLDivElement>(null);
  const startlistTeamsTableRef = useRef<HTMLDivElement>(null);
  const pointsTableRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  
  const { handleCopyImage: copyStartlistImage, handleDownloadImage: downloadStartlistImage } = useTableScreenshot(startlistTableRef);
  const { handleCopyImage: copyStartlistTeamsImage, handleDownloadImage: downloadStartlistTeamsImage } = useTableScreenshot(startlistTeamsTableRef);
  const { handleCopyImage: copyPointsImage, handleDownloadImage: downloadPointsImage } = useTableScreenshot(pointsTableRef);

  const { startlistArray, raceCategory, racePoints, memoizedData } =
    useStartlistData(
      files,
      publicStartlistRace,
      setPublicStartlistRace,
      cyclistMetadata,
      cyclistRoundMap,
      playerTeamMap,
      playerOrderMap,
      startlistFilterTeam,
      startlistFilterRondas,
      startlistFilterDiasMin,
      startlistFilterDiasMax,
      startlistFilterDebut,
      startlistFilterPuntosMin,
      startlistFilterPuntosMax,
      startlistSortCol,
      startlistSortDir,
    );

  const handleCopyStartlist = async (subset?: string) => {
    setIsStartlistCopying(subset || "p1");
    try {
      await copyStartlistImage({
        fileName: `startlist_${publicStartlistRace || "export"}${subset ? `_${subset}` : ""}.png`,
        scale: 3,
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      });
    } finally {
      setIsStartlistCopying(null);
    }
  };

  const handleDownloadStartlist = async (subset?: string) => {
    try {
      await downloadStartlistImage({
        fileName: `startlist_${publicStartlistRace}${subset ? `_${subset}` : ""}.png`,
        scale: 3,
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      });
    } finally {
      setIsStartlistCopying(null);
    }
  };

  const handleCopyStartlistText = async () => {
    if (!startlistTableRef.current || isStartlistTextCopying) return;
    setIsStartlistTextCopying(true);
    const table = startlistTableRef.current.querySelector("table");
    if (table) {
      const rows = Array.from(
        table.rows as HTMLCollectionOf<HTMLTableRowElement>,
      );
      const text = rows
        .map((row) =>
          Array.from(row.cells as HTMLCollectionOf<HTMLTableCellElement>)
            .map((cell) => cell.innerText.trim())
            .join("\t"),
        )
        .join("\n");
      await copyTextToClipboard(
        text,
        `startlist_${publicStartlistRace || "export"}.txt`,
      );
    }
    setTimeout(() => setIsStartlistTextCopying(false), 2000);
  };

  const handleCopyStartlistTeams = async (subset?: string) => {
    setIsStartlistTeamsCopying(subset || "p1");
    try {
      await copyStartlistTeamsImage({
        fileName: `startlist_teams_${publicStartlistRace || "export"}${subset ? `_${subset}` : ""}.png`,
        scale: 3,
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      });
    } finally {
      setIsStartlistTeamsCopying(null);
    }
  };

  const handleDownloadStartlistTeams = async (subset?: string) => {
    try {
      await downloadStartlistTeamsImage({
        fileName: `startlist_teams_${publicStartlistRace || "export"}${subset ? `_${subset}` : ""}.png`,
        scale: 3,
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      });
    } finally {
      setIsStartlistTeamsCopying(null);
    }
  };

  const handleCopyStartlistTeamsText = async () => {
    if (!startlistTeamsTableRef.current || isStartlistTeamsTextCopying) return;
    setIsStartlistTeamsTextCopying(true);
    const table = startlistTeamsTableRef.current.querySelector("table");
    if (table) {
      const rows = Array.from(
        table.rows as HTMLCollectionOf<HTMLTableRowElement>,
      );
      const text = rows
        .map((row) =>
          Array.from(row.cells as HTMLCollectionOf<HTMLTableCellElement>)
            .map((cell) => cell.innerText.trim())
            .join("\t"),
        )
        .join("\n");
      await copyTextToClipboard(
        text,
        `startlist_teams_${publicStartlistRace || "export"}.txt`,
      );
    }
    setTimeout(() => setIsStartlistTeamsTextCopying(false), 2000);
  };

  const handleCopyPoints = async () => {
    if (!pointsTableRef.current || isPointsTextCopying) return;
    setIsPointsTextCopying(true);
    const table = pointsTableRef.current.querySelector("table");
    if (table) {
      const rows = Array.from(
        table.rows as HTMLCollectionOf<HTMLTableRowElement>,
      );
      const text = rows
        .map((row) =>
          Array.from(row.cells as HTMLCollectionOf<HTMLTableCellElement>)
            .map((cell) => cell.innerText.trim())
            .join("\t"),
        )
        .join("\n");
      await copyTextToClipboard(
        text,
        `points_${publicStartlistRace || "export"}.txt`,
      );
    }
    setTimeout(() => setIsPointsTextCopying(false), 2000);
  };

  const handleCopyPointsImage = async (subset?: string) => {
    setIsPointsImageCopying(subset || "p1");
    try {
      await copyPointsImage({
        fileName: `puntos_${publicStartlistRace || "export"}${subset ? `_${subset}` : ""}.png`,
        scale: 3,
        style: { overflow: "visible" },
        onBeforeCapture: (el: HTMLElement) => {
          el.className = el.className.replace("overflow-x-auto", "");
        }
      });
    } finally {
      setIsPointsImageCopying(null);
    }
  };

  const handleDownloadPointsImage = async (subset?: string) => {
    try {
      await downloadPointsImage({
        fileName: `puntos_${publicStartlistRace || "export"}${subset ? `_${subset}` : ""}.png`,
        scale: 3,
        style: { overflow: "visible" },
        onBeforeCapture: (el: HTMLElement) => {
          el.className = el.className.replace("overflow-x-auto", "");
        }
      });
    } finally {
      setIsPointsImageCopying(null);
    }
  };

  const calculatePages = (
    rows: any[],
    targetSize: number,
    groupKey?: string,
  ) => {
    const pages: number[] = [];
    let currentPage = 1;
    let currentSize = 0;
    let prevGroup = null;
    rows.forEach((r) => {
      const groupVal = groupKey && r ? r[groupKey] : null;
      const shouldBreak = groupKey
        ? currentSize >= targetSize && groupVal !== prevGroup
        : currentSize >= targetSize;
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
            if (
              memoizedData.filteredRows.length === 0 &&
              memoizedData.teamRows.length === 0
            )
              return null;
            const {
              filteredRows,
              teamRows,
              uniqueTeams,
              uniqueRondas,
              maxCiclistas,
              minCiclistas,
              minTeamPoints,
              maxTeamPoints,
              minTeamPointsMedios,
              maxTeamPointsMedios,
            } = memoizedData;
            const getTeamPointsColorStyle = (punt: number) => {
              if (punt === 0) return {};
              return {
                backgroundColor: colorScale(
                  punt - minTeamPoints,
                  maxTeamPoints - minTeamPoints,
                )
                  .replace("rgb", "rgba")
                  .replace(")", ", 0.2)"),
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
                )
                  .replace("rgb", "rgba")
                  .replace(")", ", 0.2)"),
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

            const filteredRowPagination = calculatePages(
              filteredRows,
              50,
              "jugador",
            );
            const teamRowPagination = calculatePages(teamRows, 30);

            const toggleRonda = (ronda: string) => {
              setStartlistFilterRondas((prev) =>
                prev.includes(ronda)
                  ? prev.filter((r) => r !== ronda)
                  : [...prev, ronda],
              );
            };

            return (
              <div className="space-y-6">
                <ReportCard
                  title={`Ciclistas Participantes (${filteredRows.length})`}
                  filename="startlist-ciclistas"
                  ref={startlistTableRef}
                  className={cn(
                    isStartlistTableExpanded &&
                      "fixed inset-4 z-50 shadow-2xl overflow-y-auto"
                  )}
                  style={isStartlistTableExpanded ? { width: "auto", maxHeight: "none" } : {}}
                  toolbarProps={{
                    isExpanded: isStartlistTableExpanded,
                    onExpand: () => setIsStartlistTableExpanded(!isStartlistTableExpanded),
                    onCopyText: handleCopyStartlistText,
                    isTextCopying: isStartlistTextCopying,
                    onCopyImage: handleCopyStartlist,
                    isImageCopying: isStartlistCopying,
                    imagePageCount: filteredRowPagination.totalPages,
                    onDownloadImage: handleDownloadStartlist
                  }}
                  bodyClassName="p-0 border-t border-neutral-100"
                  headerExtra={
                    !isStartlistTableExpanded && (
                      <StartlistFilters
                        startlistFilterTeam={startlistFilterTeam}
                        setStartlistFilterTeam={setStartlistFilterTeam}
                        uniqueTeams={uniqueTeams}
                        startlistFilterRondas={startlistFilterRondas}
                        setStartlistFilterRondas={setStartlistFilterRondas}
                        uniqueRondas={uniqueRondas}
                        toggleRonda={toggleRonda}
                        startlistFilterDiasMin={startlistFilterDiasMin}
                        setStartlistFilterDiasMin={setStartlistFilterDiasMin}
                        startlistFilterDiasMax={startlistFilterDiasMax}
                        setStartlistFilterDiasMax={setStartlistFilterDiasMax}
                        startlistFilterPuntosMin={startlistFilterPuntosMin}
                        setStartlistFilterPuntosMin={
                          setStartlistFilterPuntosMin
                        }
                        startlistFilterPuntosMax={startlistFilterPuntosMax}
                        setStartlistFilterPuntosMax={
                          setStartlistFilterPuntosMax
                        }
                        startlistFilterDebut={startlistFilterDebut}
                        setStartlistFilterDebut={setStartlistFilterDebut}
                      />
                    )
                  }
                >
                  <StartlistTable
                    startlistScrollRef={startlistScrollRef}
                    startlistSortCol={startlistSortCol}
                    startlistSortDir={startlistSortDir}
                    toggleSort={toggleSort}
                    filteredRowPagination={filteredRowPagination}
                    filteredRows={filteredRows}
                    memoizedData={memoizedData}
                    setStartlistFilterTeam={setStartlistFilterTeam}
                    setStartlistFilterRondas={setStartlistFilterRondas}
                    setStartlistFilterDiasMin={setStartlistFilterDiasMin}
                    setStartlistFilterDiasMax={setStartlistFilterDiasMax}
                    setStartlistFilterDebut={setStartlistFilterDebut}
                    setStartlistFilterPuntosMin={setStartlistFilterPuntosMin}
                    setStartlistFilterPuntosMax={setStartlistFilterPuntosMax}
                    isStartlistCopying={isStartlistCopying}
                    formatNumberSpanish={formatNumberSpanish}
                    isExpanded={isStartlistTableExpanded}
                  />
                </ReportCard>

                <StartlistTeamsTable
                  isStartlistTeamsTableExpanded={isStartlistTeamsTableExpanded}
                  setIsStartlistTeamsTableExpanded={
                    setIsStartlistTeamsTableExpanded
                  }
                  startlistTeamsTableRef={startlistTeamsTableRef}
                  handleCopyStartlistTeamsText={handleCopyStartlistTeamsText}
                  isStartlistTeamsTextCopying={isStartlistTeamsTextCopying}
                  handleCopyStartlistTeams={handleCopyStartlistTeams}
                  isStartlistTeamsCopying={isStartlistTeamsCopying}
                  teamRowPagination={teamRowPagination}
                  handleDownloadStartlistTeams={handleDownloadStartlistTeams}
                  teamRows={teamRows}
                  getTeamPointsColorStyle={getTeamPointsColorStyle}
                  getTeamPointsMediosColorStyle={getTeamPointsMediosColorStyle}
                  maxCiclistas={memoizedData?.maxCiclistas}
                  minCiclistas={memoizedData?.minCiclistas}
                  formatNumberSpanish={formatNumberSpanish}
                />
              </div>
            );
          })()}
          <StartlistPointsTable
            racePoints={racePoints}
            raceCategory={raceCategory}
            isPointsExpanded={isPointsExpanded}
            setIsPointsExpanded={setIsPointsExpanded}
            handleCopyPoints={handleCopyPoints}
            isPointsTextCopying={isPointsTextCopying}
            handleCopyPointsImage={handleCopyPointsImage}
            isPointsImageCopying={isPointsImageCopying}
            pointsPagination={pointsPagination}
            handleDownloadPointsImage={handleDownloadPointsImage}
            pointsTableRef={pointsTableRef}
          />
        </div>
      )}
    </div>
  );
};
