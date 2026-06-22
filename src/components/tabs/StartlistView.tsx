import { StartlistTeamRow } from '../../lib/types';
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
import { calculatePages } from "./season/hooks/useStartlistUtils";
import { useStartlistExports } from "./season/hooks/useStartlistExports";
import { DRAFT_RANK_MAP } from "../../lib/constants";
import { useStartlistData } from "../../hooks/useStartlistData";
import { useStartlistState } from "./season/hooks/useStartlistState";
import { Button } from "../ui/button";
import { ReportCard } from "../ui/ReportCard";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";


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

  const {
    publicStartlistRace, setPublicStartlistRace,
    startlistSortCol, setStartlistSortCol,
    startlistSortDir, setStartlistSortDir,
    startlistFilterTeam, setStartlistFilterTeam,
    startlistFilterRondas, setStartlistFilterRondas,
    startlistFilterDiasMin, setStartlistFilterDiasMin,
    startlistFilterDiasMax, setStartlistFilterDiasMax,
    startlistFilterDebut, setStartlistFilterDebut,
    startlistFilterPuntosMin, setStartlistFilterPuntosMin,
    startlistFilterPuntosMax, setStartlistFilterPuntosMax,
    isStartlistTableExpanded, setIsStartlistTableExpanded,
    isStartlistTeamsTableExpanded, setIsStartlistTeamsTableExpanded,
    isPointsExpanded, setIsPointsExpanded
  } = useStartlistState();

  const { startlistArray, raceCategory, racePoints, memoizedData } = useStartlistData(
    files,
    publicStartlistRace, setPublicStartlistRace,
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
    startlistSortDir
  );



  const startlistTableRef = useRef<HTMLDivElement>(null);
  const startlistScrollRef = useRef<HTMLDivElement>(null);
  const startlistTeamsTableRef = useRef<HTMLDivElement>(null);
  const pointsTableRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  
  const {
    isStartlistCopying,
    isStartlistTeamsCopying,
    isStartlistTextCopying,
    isStartlistTeamsTextCopying,
    isPointsTextCopying,
    isPointsImageCopying,
    handleCopyStartlist,
    handleDownloadStartlist,
    handleCopyStartlistText,
    handleCopyStartlistTeams,
    handleDownloadStartlistTeams,
    handleCopyStartlistTeamsText,
    handleCopyPoints,
    handleCopyPointsImage,
    handleDownloadPointsImage
  } = useStartlistExports(
    startlistTableRef,
    startlistTeamsTableRef,
    pointsTableRef,
    publicStartlistRace
  );

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

                <div className={cn("copy-button-ignore", isStartlistTableExpanded && "hidden")}>
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
                    setStartlistFilterPuntosMin={setStartlistFilterPuntosMin}
                    startlistFilterPuntosMax={startlistFilterPuntosMax}
                    setStartlistFilterPuntosMax={setStartlistFilterPuntosMax}
                    startlistFilterDebut={startlistFilterDebut}
                    setStartlistFilterDebut={setStartlistFilterDebut}
                  />
                </div>
                <ReportCard
                  title={`[${publicStartlistRace}] Ciclistas participantes (${filteredRows.length})`}
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
                    onDownloadImage: handleDownloadStartlist,
                    numBlocks: filteredRowPagination.totalPages
                  }}
                  bodyClassName="p-0 border-t border-neutral-100"
                  
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
