import React, { useState, useRef } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCrosshair } from '../../hooks/useCrosshair';
import { List, Minimize2, Maximize2, Copy, CheckCircle2, UploadCloud } from "lucide-react";
import { domToDataUrl } from "modern-screenshot";
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
  const [startlistSortCol, setStartlistSortCol] = useState<"jugador" | "ronda" | "puntos" | "dias">("jugador");
  const [startlistSortDir, setStartlistSortDir] = useState<"asc" | "desc">("asc");
  const [startlistFilterTeam, setStartlistFilterTeam] = useState<string>("All");

  const [isStartlistTableExpanded, setIsStartlistTableExpanded] = useState(false);
  const [isStartlistTeamsTableExpanded, setIsStartlistTeamsTableExpanded] = useState(false);
  const [isStartlistCopying, setIsStartlistCopying] = useState(false);
  const [isStartlistTeamsCopying, setIsStartlistTeamsCopying] = useState(false);

  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  const [isPointsTextCopying, setIsPointsTextCopying] = useState(false);
  const [isPointsImageCopying, setIsPointsImageCopying] = useState(false);

  const startlistTableRef = useRef<HTMLDivElement>(null);
  const startlistScrollRef = useRef<HTMLDivElement>(null);
  const startlistTeamsTableRef = useRef<HTMLDivElement>(null);
  const pointsTableRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const { startlistArray, raceCategory, racePoints, memoizedData } = useStartlistData(
    files,
    publicStartlistRace,
    setPublicStartlistRace,
    cyclistMetadata,
    cyclistRoundMap,
    playerTeamMap,
    playerOrderMap,
    startlistFilterTeam,
    startlistSortCol,
    startlistSortDir
  );

  const handleCopyStartlist = async () => {
    if (!startlistTableRef.current || isStartlistCopying) return;
    setIsStartlistCopying(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const restore = expandNodeForCapture(startlistTableRef.current);
    try {
      const options = {
        scale: 3, 
        backgroundColor: '#ffffff',
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      };
      
      const dataUrlPromise = domToDataUrl(startlistTableRef.current, options);
      const dataUrl = await dataUrlPromise;

      if (typeof ClipboardItem !== "undefined") {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        try {
          window.focus();
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        } catch (e) {
          throw e; // throw inner
        }
        setTimeout(() => setIsStartlistCopying(false), 2000);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
      setIsStartlistCopying(false);
      try {
         const options = {
          scale: 3, 
          backgroundColor: '#ffffff',
          style: { overflow: "visible", textRendering: "optimizeLegibility" },
        };
        const dataUrl = await domToDataUrl(startlistTableRef.current, options);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `startlist_${publicStartlistRace}.png`;
        link.click();
      } catch (fallbackErr) {}
    } finally {
      restore();
    }
  };

  const handleCopyStartlistTeams = async () => {
    if (!startlistTeamsTableRef.current || isStartlistTeamsCopying) return;
    setIsStartlistTeamsCopying(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const restore = expandNodeForCapture(startlistTeamsTableRef.current);
    try {
      const options = {
        scale: 3, 
        backgroundColor: '#ffffff',
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      };
      
      const dataUrlPromise = domToDataUrl(
        startlistTeamsTableRef.current,
        options,
      );
      const dataUrl = await dataUrlPromise;

      if (typeof ClipboardItem !== "undefined") {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        try {
          window.focus();
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        } catch (e) {
          throw e;
        }
        setTimeout(() => setIsStartlistTeamsCopying(false), 2000);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
      setIsStartlistTeamsCopying(false);
      try {
        const options = {
          scale: 3, 
          backgroundColor: '#ffffff',
          style: { overflow: "visible", textRendering: "optimizeLegibility" },
        };
        const dataUrl = await domToDataUrl(
          startlistTeamsTableRef.current,
          options,
        );
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `startlist_teams_${publicStartlistRace}.png`;
        link.click();
      } catch (fallbackErr) {}
    } finally {
      restore();
    }
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
            .join("\\t"),
        )
        .join("\\n");
      navigator.clipboard.writeText(text);
    }
    setTimeout(() => setIsPointsTextCopying(false), 2000);
  };

  const handleCopyPointsImage = async () => {
    if (!pointsTableRef.current || isPointsImageCopying) return;
    setIsPointsImageCopying(true);
    const tableContainer = pointsTableRef.current;
    const originalClass = tableContainer.className;
    tableContainer.className = originalClass.replace("overflow-x-auto", "");
    const restore = expandNodeForCapture(tableContainer);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (typeof ClipboardItem !== "undefined") {
        const clipboardItem = new ClipboardItem({
          "image/png": (async () => {
            const dataUrl = await domToDataUrl(tableContainer, {
              scale: 3, 
              backgroundColor: '#ffffff',
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>,
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsPointsImageCopying(false), 2000);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
       console.error(err);
       setIsPointsImageCopying(false);
    } finally {
      restore();
      tableContainer.className = originalClass;
    }
  };

  const handleDownloadPointsImage = async () => {
    if (!pointsTableRef.current) return;
    const tableContainer = pointsTableRef.current;
    const originalClass = tableContainer.className;
    tableContainer.className = originalClass.replace("overflow-x-auto", "");
    const restore = expandNodeForCapture(tableContainer);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, 
        backgroundColor: '#ffffff',
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `puntos_${publicStartlistRace}.png`;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      restore();
      tableContainer.className = originalClass;
    }
  };

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
            const { filteredRows, teamRows, uniqueTeams, maxCiclistas, minCiclistas, minTeamPoints, maxTeamPoints, minTeamPointsMedios, maxTeamPointsMedios } = memoizedData;
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

            return (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div
                  className={cn(
                    "xl:col-span-2 relative flex flex-col",
                    isStartlistTableExpanded &&
                      "fixed inset-4 z-50 bg-white shadow-2xl p-6 rounded-2xl overflow-y-auto max-h-none border border-neutral-200",
                  )}
                  ref={startlistTableRef}
                  style={isStartlistTableExpanded ? { width: "auto" } : {}}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      Ciclistas Participantes ({filteredRows.length})
                    </h3>
                    {!isStartlistTableExpanded && (
                      <div className="flex gap-2 relative copy-button-ignore">
                        <select
                          value={startlistFilterTeam}
                          onChange={(e) =>
                            setStartlistFilterTeam(e.target.value)
                          }
                          className="pl-2 pr-8 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md text-sm outline-none text-neutral-700 font-medium z-10 hover:border-neutral-300 transition-colors"
                        >
                          <option value="All">
                            Todos los equipos
                          </option>
                          {uniqueTeams.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}

                        </select>
                        <ExportToolbar 
                          isExpanded={isStartlistTableExpanded} 
                          onExpand={() => setIsStartlistTableExpanded(!isStartlistTableExpanded)} 
                          onCopyImage={handleCopyStartlist} 
                          isImageCopying={isStartlistCopying} 
                        />
                      </div>
                    )}
                    {isStartlistTableExpanded && (
                      <button
                        onClick={() => setIsStartlistTableExpanded(false)}
                        className="fixed top-8 right-8 p-2 bg-neutral-800 text-white rounded-full shadow-lg z-50 copy-button-ignore"
                      >
                        <Minimize2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div ref={startlistScrollRef} className="table-responsive-wrapper overflow-auto border border-neutral-200 rounded-lg flex-1 crosshair-container max-h-[800px]">
                    <table className="w-full min-w-[750px] text-[13px] text-left table-fixed">
                      <thead className="text-[11px] text-neutral-500 uppercase bg-neutral-50/80 sticky top-0 backdrop-blur-sm z-10">
                        <tr>
                          <th
                            className="px-3 py-2 cursor-pointer hover:bg-neutral-100 transition-colors duration-150 group w-[35%] sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]"
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
                        {filteredRows.map((r, i) => (
                          <tr
                            key={i}
                            className="group hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="px-3 py-2 font-medium text-neutral-800 truncate sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5] group-hover:bg-blue-50/50" title={r.jugador}>
                              {r.jugador}
                            </td>
                            <td className="px-3 py-2 text-center text-neutral-400 font-mono text-[11px]">
                              {r.dorsal}
                            </td>
                            <td className="px-3 py-2 font-semibold text-neutral-900 truncate" title={r.ciclista}>
                              {r.ciclista}{" "}
                              {r.debut && (
                                <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded ml-1 font-bold uppercase tracking-wider relative -top-[1px]">
                                  Debut
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center truncate">
                               <span title={r.paisLetras}>{r.pais}</span>
                            </td>
                            <td className="px-3 py-2 text-center font-medium text-neutral-600 truncate" title={r.equipo}>
                              {r.equipo}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-[11px]">
                              {r.ronda}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-[11px]">
                              {r.dias}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-[11px] font-bold text-neutral-700">
                              {r.puntos > 0
                                ? formatNumberSpanish(r.puntos)
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div
                  className={cn(
                    "relative flex flex-col",
                    isStartlistTeamsTableExpanded &&
                      "fixed inset-4 z-50 bg-white shadow-2xl p-6 rounded-2xl overflow-y-auto max-h-none border border-neutral-200",
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
                        onCopyImage={handleCopyStartlistTeams} 
                        isImageCopying={isStartlistTeamsCopying} 
                      />
                    </div>
                  </div>
                  <div className="table-responsive-wrapper overflow-auto w-full max-h-[600px]">
                    <table className="w-full min-w-[400px] text-[13px] text-left">
                      <thead className="text-[11px] text-neutral-500 uppercase bg-neutral-50/80 sticky top-0 backdrop-blur-sm z-10">
                        <tr>
                          <th className="px-2 py-1 sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]">Equipo</th>
                          <th
                            className="px-2 py-1 text-center w-px"
                            title="Desviación respecto a la media"
                          >
                            <span className="border-b border-dashed border-neutral-300">
                              C.
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
                      {teamRows.map((r, i) => {
                        return (
                          <tr
                            key={i}
                            className="group hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="px-2 py-0.5 font-medium text-xs whitespace-nowrap sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5] group-hover:bg-blue-50/50">
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
                          </tr>);
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
                  <thead className="text-xs text-neutral-500 uppercase bg-neutral-50/80 sticky top-0 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-3 font-semibold w-1/4">Tipo</th>
                      <th className="px-4 py-3 font-semibold text-center w-1/4">Posición</th>
                      <th className="px-4 py-3 font-semibold text-right w-1/4">Puntos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {racePoints.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
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
                    ))}
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
