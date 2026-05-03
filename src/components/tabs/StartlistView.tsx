import React, { useState, useRef, useMemo, useEffect } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCrosshair } from '../../hooks/useCrosshair';
import { List, Minimize2, Maximize2, Copy, CheckCircle2 } from "lucide-react";
import { domToDataUrl } from "modern-screenshot";
import { cn } from "../../lib/utils";
import { formatNumberSpanish, getCategoryColorStyle } from "../../lib/data-processing";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { DRAFT_RANK_MAP } from "../../lib/constants";

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
  return `rgb($<span className="font-mono tracking-tight">{Math.round(255 - t * 100)}</span>, $<span className="font-mono tracking-tight">{Math.round(t * 200)}</span>, 100)`;
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

  const startlistTableRef = useRef<HTMLDivElement>(null);
  const startlistScrollRef = useRef<HTMLDivElement>(null);
  const startlistTeamsTableRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const startlistArray = useMemo(() => {
    if (!files?.startlist?.data) return [];
    if (Array.isArray(files.startlist.data)) return files.startlist.data;
    return [files.startlist.data];
  }, [files]);
  
  useEffect(() => {
    if (!publicStartlistRace && startlistArray.length > 0) {
      const firstValidRace = startlistArray.find((sl: any) => sl && sl.carrera);
      if (firstValidRace) {
        setPublicStartlistRace(firstValidRace.carrera);
      }
    }
  }, [publicStartlistRace, startlistArray, setPublicStartlistRace]);

  const memoizedData = useMemo(() => {
    const selectedData = startlistArray.find(
      (d: any) => d.carrera === publicStartlistRace,
    );
    if (!selectedData) return { filteredRows: [], teamRows: [], uniqueTeams: [], maxCiclistas: 0, minCiclistas: 0, minTeamPoints: 0, maxTeamPoints: 0, minTeamPointsMedios: 0, maxTeamPointsMedios: 0 };

    let rows: any[] = [];
    selectedData.resultados?.forEach((res: any) => {
      res.ciclistas?.forEach((c: any) => {
        const nombre = typeof c === "string" ? c : c.nombre;
        const dorsal = typeof c === "string" ? "" : c.dorsal;

        const jugador = res.jugador;
        const equipoManger = playerTeamMap[jugador] || jugador;
        const order = playerOrderMap[jugador] || DRAFT_RANK_MAP[jugador] || "99";
        const equipoOrdered = `${equipoManger} [#${order}]`;
        const ronda = cyclistRoundMap[nombre] || "";
        const meta = cyclistMetadata[nombre] || {};

        const totalPuntos = meta.puntosTotales || 0;
        const carreraPuntos = meta.puntosPorCarrera?.[publicStartlistRace] || 0;
        const displayPuntos = totalPuntos - carreraPuntos;
        const dias = meta.diasCompeticion || 0;
        const debut = dias === 0 ? "Sí" : "";

        rows.push({
          jugador: equipoOrdered,
          jugadorName: jugador,
          dorsal: dorsal || "",
          ciclista: nombre,
          ronda: ronda,
          pais: meta.pais || "",
          equipo: meta.equipoBreve || "",
          dias,
          puntos: displayPuntos,
          debut,
        });
      });
    });

    const uniqueTeams = Array.from(
      new Set(rows.map((r) => r.jugador)),
    ).sort() as string[];

    const filteredRows = rows.filter((r) =>
      startlistFilterTeam === "All" ? true : r.jugador === startlistFilterTeam,
    );

    const sortDirNum = startlistSortDir === "asc" ? 1 : -1;
    filteredRows.sort((a, b) => {
      if (startlistSortCol === "puntos") return (a.puntos - b.puntos) * sortDirNum;
      if (startlistSortCol === "dias") return (a.dias - b.dias) * sortDirNum;
      if (startlistSortCol === "ronda") {
        const getRondaNum = (r: string) => {
          const num = parseInt(r);
          return isNaN(num) ? 99 : num;
        };
        return ((getRondaNum(a.ronda) - getRondaNum(b.ronda)) * sortDirNum);
      }
      const valA = String(a[startlistSortCol] || "");
      const valB = String(b[startlistSortCol] || "");
      return valA.localeCompare(valB) * sortDirNum;
    });

    const teamRows: StartlistTeamRow[] = [];
    let maxCiclistas = 0;
    let minCiclistas = 999;

    const mapToUse = Object.keys(playerOrderMap).length > 0 ? playerOrderMap : DRAFT_RANK_MAP;

    Object.entries(mapToUse).forEach(([jugador, orden]) => {
      if (jugador === "No draft") return;
      const teamMembers = rows.filter((r) => r.jugadorName === jugador);
      const numCiclistas = teamMembers.length;
      if (numCiclistas > 0) {
        if (numCiclistas > maxCiclistas) maxCiclistas = numCiclistas;
        if (numCiclistas < minCiclistas) minCiclistas = numCiclistas;
      }
      const puntos = teamMembers.reduce((sum, r) => sum + r.puntos, 0);
      teamRows.push({
        orden: orden as string,
        equipo: `${playerTeamMap[jugador] || jugador} [#${orden}]`,
        numCiclistas,
        puntos,
        puntosMedios: numCiclistas ? Number((puntos / numCiclistas).toFixed(1)) : 0,
      });
    });

    teamRows.sort((a, b) => {
      if (b.numCiclistas !== a.numCiclistas) return b.numCiclistas - a.numCiclistas;
      return b.puntos - a.puntos;
    });

    const maxTeamPoints = Math.max(1, ...teamRows.map((r) => r.puntos));
    const minTeamPoints = Math.min(...teamRows.map((r) => r.puntos));
    const maxTeamPointsMedios = Math.max(1, ...teamRows.map((r) => r.puntosMedios));
    const minTeamPointsMedios = Math.min(...teamRows.map((r) => r.puntosMedios));

    return {
      filteredRows,
      teamRows,
      uniqueTeams,
      maxCiclistas,
      minCiclistas,
      minTeamPoints,
      maxTeamPoints,
      minTeamPointsMedios,
      maxTeamPointsMedios,
    };
  }, [
    files,
    publicStartlistRace,
    cyclistMetadata,
    cyclistRoundMap,
    playerTeamMap,
    playerOrderMap,
    startlistFilterTeam,
    startlistSortCol,
    startlistSortDir,
  ]);

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

  const rowVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => startlistScrollRef.current,
    estimateSize: () => 37, // Approximate height of a row
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
  const paddingBottom = virtualItems.length > 0 
    ? rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)
    : 0;

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
                        <button
                          onClick={() =>
                            setIsStartlistTableExpanded(
                              !isStartlistTableExpanded,
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                          title={
                            isStartlistTableExpanded
                              ? "Contraer tabla"
                              : "Expandir tabla"
                          }
                        >
                          {isStartlistTableExpanded ? (
                            <Minimize2 className="w-4 h-4" />
                          ) : (
                            <Maximize2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={handleCopyStartlist}
                          disabled={!!isStartlistCopying}
                          title="Copiar imagen"
                          className={cn(
                            "w-8 h-8 rounded-md border flex items-center justify-center transition-all shadow-sm",
                            isStartlistCopying
                              ? "bg-green-50 border-green-200 text-green-600"
                              : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50",
                          )}
                        >
                          {isStartlistCopying ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
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
                        {isStartlistCopying ? filteredRows.map((r, i) => (
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
                        )) : (
                          <>
                            {paddingTop > 0 && <tr><td colSpan={8} style={{ height: `${paddingTop}px` }}></td></tr>}
                            {virtualItems.map((virtualRow) => {
                              const r = filteredRows[virtualRow.index];
                              return (
                                <tr
                                  key={virtualRow.key}
                                  ref={rowVirtualizer.measureElement}
                                  data-index={virtualRow.index}
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
                              );
                            })}
                            {paddingBottom > 0 && <tr><td colSpan={8} style={{ height: `${paddingBottom}px` }}></td></tr>}
                          </>
                        )}
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
                      <button
                        onClick={() =>
                          setIsStartlistTeamsTableExpanded(
                            !isStartlistTeamsTableExpanded,
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                        title={
                          isStartlistTeamsTableExpanded
                            ? "Contraer tabla"
                            : "Expandir tabla"
                        }
                      >
                        {isStartlistTeamsTableExpanded ? (
                          <Minimize2 className="w-4 h-4" />
                        ) : (
                          <Maximize2 className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={handleCopyStartlistTeams}
                        disabled={!!isStartlistTeamsCopying}
                        title="Copiar imagen resumen de equipos"
                        className={cn(
                          "w-8 h-8 rounded-md border flex items-center justify-center transition-all shadow-sm",
                          isStartlistTeamsCopying
                            ? "bg-green-50 border-green-200 text-green-600"
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50",
                        )}
                      >
                        {isStartlistTeamsCopying ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="table-responsive-wrapper overflow-auto border border-neutral-200 rounded-lg flex-1 crosshair-container">
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
                        {teamRows.map((r, i) => (
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
                          </tr>
                        ))}
                      </tbody>
                    </table></div>
                  </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
