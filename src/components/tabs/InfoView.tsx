import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";
import React, { useState, useMemo, useRef } from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, FileSpreadsheet, Flag, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { ExportToolbar } from "../ui/ExportToolbar";
import { getVal, formatNumberSpanish } from "../../lib/data-processing";
import { domToBlob, domToDataUrl } from "modern-screenshot";
import { expandNodeForCapture } from "../../lib/dom-utils";

export interface InfoViewProps {
  raceWinners: Record<string, string>;
  files: any;
  infoSubTab: string;
  setInfoSubTab: (val: string) => void;
  memoizedPointsData?: any;
  memoizedRacesData?: any;
}

export const InfoView = (props: InfoViewProps) => {
  const { files, infoSubTab, setInfoSubTab, memoizedPointsData, memoizedRacesData, raceWinners } = props;

  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  const [isPointsTextCopying, setIsPointsTextCopying] = useState(false);
  const [isRacesExpanded, setIsRacesExpanded] = useState(false);
  const [isRacesTextCopying, setIsRacesTextCopying] = useState(false);
  const racesTableRef = useRef<HTMLDivElement>(null);


  const [pointsCategoryFilter, setPointsCategoryFilter] = useState<string>("");
  const [pointsRaceSearch, setPointsRaceSearch] = useState<string>("");
  const [isPointsCopying, setIsPointsCopying] = useState(false);
  const [isPointsImageCopying, setIsPointsImageCopying] = useState(false);

  const [infoCarrerasSortColumn, setInfoCarrerasSortColumn] = useState<string>("fecha");
  const [infoCarrerasSortDir, setInfoCarrerasSortDir] = useState<"asc" | "desc">("asc");
  const [racesFilter, setRacesFilter] = useState<string>("all"); // all, finished, upcoming
  const [racesCategoryFilter, setRacesCategoryFilter] = useState<string>("");
  const [racesMonthFilter, setRacesMonthFilter] = useState<string>("");
  const [isRacesCopying, setIsRacesCopying] = useState(false);
  const [isRacesImageCopying, setIsRacesImageCopying] = useState(false);

  const pointsTableRef = useRef<HTMLDivElement>(null);
  const infoCarrerasTableRef = useRef<HTMLDivElement>(null);

  const handleCopyPoints = async () => {
    const table = document.querySelector("table");
    if (!table || isPointsTextCopying) return;
    setIsPointsTextCopying(true);
    const rows = Array.from(table.rows);
    const text = rows
      .map((row) =>
        Array.from(row.cells)
          .map((cell) => cell.innerText.trim())
          .join("\t"),
      )
      .join("\n");
    await copyTextToClipboard(text, 'export.txt');
    setTimeout(() => setIsPointsTextCopying(false), 2000);
  };

  const handleCopyPointsImage = async () => {
    if (!pointsTableRef.current || isPointsImageCopying) return;
    setIsPointsImageCopying(true);
    const tableContainer = pointsTableRef.current;
    const originalClass = tableContainer.className;
    tableContainer.className = originalClass
      .replace("max-h-[600px]", "")
      .replace("overflow-y-auto", "")
      .replace("overflow-x-auto", "");
    const restore = expandNodeForCapture(tableContainer);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const elHeight = tableContainer.scrollHeight;
      const elWidth = tableContainer.scrollWidth;
      
              {
                const processCopy = async () => {
                  const dataUrl = await domToDataUrl(tableContainer, {
          scale: 3, 
          
          width: elWidth,
          height: elHeight,
          style: { overflow: "visible", margin: "0" },
          
        });
        const response = await fetch(dataUrl);
        return await response.blob();
                };
                await copyImageToClipboard(processCopy(), "export.png");
                setTimeout(() => setIsPointsImageCopying(false), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
      tableContainer.className = originalClass;
    }
  };

  const handleDownloadPointsImage = async () => {
    if (!pointsTableRef.current) return;
    const tableContainer = pointsTableRef.current;
    const originalClass = tableContainer.className;
    tableContainer.className = originalClass
      .replace("max-h-[600px]", "")
      .replace("overflow-y-auto", "")
      .replace("overflow-x-auto", "");
    const restore = expandNodeForCapture(tableContainer);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const elHeight = tableContainer.scrollHeight;
      const elWidth = tableContainer.scrollWidth;
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, 
        
        width: elWidth,
        height: elHeight,
        style: { overflow: "visible", margin: "0" },
        
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "detalle-puntos.png";
      link.click();
    } catch (err) {
      console.error("Error downloading table:", err);
    } finally {
      restore();
      tableContainer.className = originalClass;
    }
  };

  const handleCopyRaces = async () => {
    const table = document.querySelector("table");
    if (!table || isRacesTextCopying) return;
    setIsRacesTextCopying(true);
    const rows = Array.from(table.rows);
    const text = rows
      .map((row) =>
        Array.from(row.cells)
          .map((cell) => cell.innerText.trim())
          .join("\t"),
      )
      .join("\n");
    await copyTextToClipboard(text, 'export.txt');
    setTimeout(() => setIsRacesTextCopying(false), 2000);
  };

  const handleCopyRacesImage = async () => {
    if (!racesTableRef.current || isRacesImageCopying) return;
    setIsRacesImageCopying(true);
    const restore = expandNodeForCapture(racesTableRef.current);
    try {
      
              {
                const processCopy = async () => {
                  const dataUrl = await domToDataUrl(racesTableRef.current!, {
              scale: 3, 

        backgroundColor: '#ffffff',
              style: { overflow: "hidden" },
              
            });
            const response = await fetch(dataUrl);
            return await response.blob();
                };
                await copyImageToClipboard(processCopy(), "export.png");
                setTimeout(() => setIsRacesImageCopying(false), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
    }
  };

  const handleDownloadRacesImage = async () => {
    if (!racesTableRef.current) return;
    const restore = expandNodeForCapture(racesTableRef.current);
    try {
      const dataUrl = await domToDataUrl(racesTableRef.current, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        style: { overflow: "hidden" },
        
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "detalle-carreras.png";
      link.click();
    } catch (err) {
      console.error("Error downloading table:", err);
    } finally {
      restore();
    }
  };

  

  return (
              <div className="space-y-8">
                {infoSubTab === "menu" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
                    <button
                      onClick={() => setInfoSubTab("puntuaciones")}
                      className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileSpreadsheet className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900">
                        Puntuaciones
                      </h3>
                      <p className="text-neutral-500 text-center text-sm">
                        Consulta los puntos que otorga cada carrera según su
                        categoría y tipo de resultado.
                      </p>
                    </button>

                    <button
                      onClick={() => setInfoSubTab("carreras")}
                      className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Flag className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900">
                        Carreras
                      </h3>
                      <p className="text-neutral-500 text-center text-sm">
                        Calendario de carreras, estado actual y ganadores de las
                        pruebas ya disputadas.
                      </p>
                    </button>
                  </div>
                )}

                {infoSubTab === "puntuaciones" && (
                  <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setInfoSubTab("menu")}
                          className="text-neutral-400 hover:text-neutral-900 transition-colors"
                        >
                          <ChevronUp className="w-5 h-5 -rotate-90" />
                        </button>
                        <h3 className="font-semibold text-lg text-neutral-900">
                          Detalle de puntos
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <ExportToolbar 
                          isExpanded={isPointsExpanded} 
                          onExpand={() => setIsPointsExpanded(!isPointsExpanded)} 
                          onCopyText={handleCopyPoints} 
                          isTextCopying={isPointsTextCopying} 
                          onCopyImage={handleCopyPointsImage} 
                          isImageCopying={isPointsImageCopying} 
                          onDownloadImage={handleDownloadPointsImage} 
                        />
                        <input
                          type="text"
                          placeholder="Buscar carrera..."
                          value={pointsRaceSearch}
                          onChange={(e) => setPointsRaceSearch(e.target.value)}
                          className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <select
                          value={pointsCategoryFilter}
                          onChange={(e) =>
                            setPointsCategoryFilter(e.target.value)
                          }
                          className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Todas las categorías</option>
                          {[
                            ...new Set(
                              files.puntos.data?.map((r) => r.Categoría),
                            ),
                          ]
                            .filter(Boolean)
                            .map((c) => (
                              <option key={c as string} value={c as string}>
                                {c as string}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div
                      ref={pointsTableRef}
                      className={cn(
                        "relative bg-white flex flex-col",
                        isPointsExpanded
                          ? "fixed inset-4 z-50 p-4 shadow-2xl rounded-xl m-0 h-auto"
                          : "h-[600px]",
                      )}
                    >
                      {isPointsExpanded && (
                        <button
                          onClick={() => setIsPointsExpanded(false)}
                          className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      )}
                      <div className="flex-1 min-h-0 overflow-hidden">
                        <div className="table-responsive-wrapper overflow-y-auto w-full h-full pb-4">
                          <table className="w-full min-w-[600px] text-sm text-left">
                          <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b border-neutral-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                              <th className="px-6 py-3">Categoría</th>
                              <th className="px-6 py-3">Tipo</th>
                              <th className="px-6 py-3">Posición</th>
                              <th className="px-6 py-3 text-right">Puntos</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {(() => {
                              const displayPoints = memoizedPointsData;

                              return displayPoints.map((r, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b border-neutral-100 hover:bg-neutral-50"
                                >
                                  <td className="px-6 py-2.5 font-medium text-neutral-900">
                                    {getVal(r, "Categoría")}
                                  </td>
                                  <td className="px-6 py-2.5 text-neutral-600">
                                    {getVal(r, "Tipo")}
                                  </td>
                                  <td className="px-6 py-2.5 text-neutral-600">
                                    {getVal(r, "Posición")}
                                  </td>
                                  <td className="px-6 py-2.5 text-right font-bold text-blue-600">
                                    {getVal(r, "Puntos")}
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {infoSubTab === "carreras" && (
                  <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setInfoSubTab("menu")}
                          className="text-neutral-400 hover:text-neutral-900 transition-colors"
                        >
                          <ChevronUp className="w-5 h-5 -rotate-90" />
                        </button>
                        <h3 className="font-semibold text-lg text-neutral-900">
                          Detalle de carreras
                        </h3>
                      </div>
                      <select
                        value={racesFilter}
                        onChange={(e) => setRacesFilter(e.target.value as any)}
                        className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="all">Todas las carreras</option>
                        <option value="finished">Ya disputadas</option>
                        <option value="upcoming">Por disputar</option>
                      </select>
                      <select
                        value={racesCategoryFilter}
                        onChange={(e) => setRacesCategoryFilter(e.target.value)}
                        className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Todas las categorías</option>
                        {[
                          ...new Set(
                            files.carreras.data?.map((r) =>
                              getVal(r, "Categoría"),
                            ),
                          ),
                        ]
                          .filter(Boolean)
                          .map((c) => (
                            <option key={c as string} value={c as string}>
                              {c as string}
                            </option>
                          ))}
                      </select>
                      <select
                        value={racesMonthFilter}
                        onChange={(e) => setRacesMonthFilter(e.target.value)}
                        className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Todos los meses</option>
                        {[
                          "Enero",
                          "Febrero",
                          "Marzo",
                          "Abril",
                          "Mayo",
                          "Junio",
                          "Julio",
                          "Agosto",
                          "Septiembre",
                          "Octubre",
                          "Noviembre",
                          "Diciembre",
                        ].map((m, i) => (
                          <option
                            key={m}
                            value={(i + 1).toString().padStart(2, "0")}
                          >
                            {m}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <ExportToolbar 
                          isExpanded={isRacesExpanded} 
                          onExpand={() => setIsRacesExpanded(!isRacesExpanded)} 
                          onCopyText={handleCopyRaces} 
                          isTextCopying={isRacesTextCopying} 
                          onCopyImage={handleCopyRacesImage} 
                          isImageCopying={isRacesImageCopying} 
                          onDownloadImage={handleDownloadRacesImage} 
                        />
                      </div>
                    </div>
                    <div
                      ref={racesTableRef}
                      className={cn(
                        "relative bg-white flex flex-col",
                        isRacesExpanded
                          ? "fixed inset-4 z-50 p-4 shadow-2xl rounded-xl m-0 h-auto"
                          : "h-[600px]",
                      )}
                    >
                      {isRacesExpanded && (
                        <button
                          onClick={() => setIsRacesExpanded(false)}
                          className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      )}
                      <div className="flex-1 min-h-0 overflow-hidden">
                        <div className="table-responsive-wrapper overflow-y-auto w-full h-full pb-4">
                          <table className="w-full min-w-[600px] text-sm text-left">
                          <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b border-neutral-100 sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="px-6 py-3">Carrera</th>
                            <th className="px-6 py-3">Categoría</th>
                            <th 
                              className="px-6 py-3 cursor-pointer hover:bg-neutral-100 select-none transition-colors"
                              onClick={() => setInfoCarrerasSortDir(d => d === "asc" ? "desc" : "asc")}
                            >
                              Fecha <span className="text-neutral-400">{infoCarrerasSortDir === "asc" ? "↑" : "↓"}</span>
                            </th>
                            <th className="px-6 py-3 text-right">Ganador</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {(() => {
                            const now = new Date().getTime();

                            const resultObj = memoizedRacesData;

                            return resultObj
                              ?.map((r, idx) => {
                                const fechaFin = getVal(r, "Fecha");
                                const parts = fechaFin?.toString().split(/[-/]/) || [];
                                let date: Date | null = null;
                                let isFinished = false;
                                if (parts.length === 3) {
                                  if (parts[0].length === 4) {
                                    date = new Date(
                                      parseInt(parts[0]),
                                      parseInt(parts[1]) - 1,
                                      parseInt(parts[2]),
                                    );
                                  } else {
                                    date = new Date(
                                      parseInt(parts[2]),
                                      parseInt(parts[1]) - 1,
                                      parseInt(parts[0]),
                                    );
                                  }
                                  isFinished = date.getTime() < now;
                                }
                                const raceName = getVal(r, "Carrera");
                                const winner = raceWinners[raceName];

                                return (
                                  <tr
                                    key={idx}
                                    className={cn(
                                      "border-b border-neutral-100 hover:bg-neutral-50",
                                      isFinished
                                        ? "bg-neutral-50/50 text-neutral-400"
                                        : "",
                                    )}
                                  >
                                    <td
                                      className={cn(
                                        "px-6 py-2.5 font-medium",
                                        isFinished
                                          ? "text-neutral-500"
                                          : "text-neutral-900",
                                      )}
                                    >
                                      {raceName}
                                    </td>
                                    <td className="px-6 py-2.5">
                                      <span
                                        className={cn(
                                          "px-2 py-1 rounded-md text-xs font-semibold",
                                          isFinished
                                            ? "bg-neutral-200 text-neutral-500"
                                            : "bg-neutral-100 text-neutral-600",
                                        )}
                                      >
                                        {getVal(r, "Categoría")}
                                      </span>
                                    </td>
                                    <td className="px-6 py-2.5 font-mono text-sm">{fechaFin}</td>
                                    <td className="px-6 py-2.5 text-right font-bold text-blue-600">
                                      {winner || "-"}
                                    </td>
                                  </tr>
                                );
                              });
                          })()}
                        </tbody>
                      </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
  );
};
