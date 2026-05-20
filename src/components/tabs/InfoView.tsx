import { InfoPointsTable } from "./info/InfoPointsTable";
import { InfoRacesTable } from "./info/InfoRacesTable";
import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useUrlState } from "../../hooks/useUrlState";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, FileSpreadsheet, Flag, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { ReportCard } from "../ui/ReportCard";
import { getVal, formatNumberSpanish } from "../../lib/data-processing";
import { domToBlob, domToDataUrl } from "modern-screenshot";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { useDebounce } from "../../lib/hooks/useDebounce";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useTableScreenshot } from "../../hooks/useTableScreenshot";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";

export const InfoView = () => {
  const { files } = useDataStore();
  const { raceWinners } = useComputedStore();

  const [infoSubTab, setInfoSubTab] = useUrlState<"menu" | "puntuaciones" | "carreras">("infoSubTab", "menu");

  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  const [isPointsTextCopying, setIsPointsTextCopying] = useState(false);
  const [isRacesExpanded, setIsRacesExpanded] = useState(false);
  const [isRacesTextCopying, setIsRacesTextCopying] = useState(false);
  const racesTableRef = useRef<HTMLDivElement>(null);


  const [pointsCategoryFilter, setPointsCategoryFilter] = useUrlState<string>("pointsCategoryFilter", "");
  const [pointsRaceSearch, setPointsRaceSearch] = useUrlState<string>("pointsRaceSearch", "");
  const [localRaceSearch, setLocalRaceSearch] = useState<string>("");
  
  useEffect(() => {
    if (pointsRaceSearch !== localRaceSearch) {
      setLocalRaceSearch(pointsRaceSearch);
    }
  }, [pointsRaceSearch, localRaceSearch]);
  
  const debouncedRaceSearch = useDebounce(localRaceSearch, 300);
  
  useEffect(() => {
    if (debouncedRaceSearch !== pointsRaceSearch) {
      setPointsRaceSearch(debouncedRaceSearch);
    }
  }, [debouncedRaceSearch, pointsRaceSearch, setPointsRaceSearch]);
  
  const [isPointsCopying, setIsPointsCopying] = useState(false);
  const [isPointsImageCopying, setIsPointsImageCopying] = useState(false);

  const [infoCarrerasSortColumn, setInfoCarrerasSortColumn] = useUrlState<string>("infoCarrerasSortColumn", "fecha");
  const [infoCarrerasSortDir, setInfoCarrerasSortDir] = useUrlState<"asc" | "desc">("infoCarrerasSortDir", "asc");
  const [racesFilter, setRacesFilter] = useUrlState<string>("racesFilter", "all"); // all, finished, upcoming
  const [racesCategoryFilter, setRacesCategoryFilter] = useUrlState<string>("racesCategoryFilter", "");
  const [racesMonthFilter, setRacesMonthFilter] = useUrlState<string>("racesMonthFilter", "");
  const [isRacesCopying, setIsRacesCopying] = useState(false);
  const [isRacesImageCopying, setIsRacesImageCopying] = useState(false);

  const pointsTableRef = useRef<HTMLDivElement>(null);
  const infoCarrerasTableRef = useRef<HTMLDivElement>(null);
  
  const { handleCopyImage: copyPointsImageOrig, handleDownloadImage: downloadPointsImageOrig, isCopying: isPointsImageCopyingHook } = useTableScreenshot(pointsTableRef);
  const { handleCopyImage: copyRacesImageOrig, handleDownloadImage: downloadRacesImageOrig, isCopying: isRacesImageCopyingHook } = useTableScreenshot(racesTableRef);

  useEffect(() => {
    setIsPointsImageCopying(!!isPointsImageCopyingHook);
  }, [isPointsImageCopyingHook]);

  useEffect(() => {
    setIsRacesImageCopying(!!isRacesImageCopyingHook);
  }, [isRacesImageCopyingHook]);

  const memoizedPointsData = React.useMemo(() => {
    let filteredPoints = files.puntos?.data || [];

    if (pointsRaceSearch.trim()) {
      const searchLower = pointsRaceSearch.toLowerCase();
      const matchedRaces = files.carreras?.data?.filter((r: any) =>
        getVal(r, "Carrera")?.toLowerCase().includes(searchLower)
      ) || [];
      const matchedCategories = new Set(
        matchedRaces.map((r: any) => getVal(r, "Categoría")?.trim())
      );
      filteredPoints = filteredPoints.filter((p: any) =>
        matchedCategories.has(getVal(p, "Categoría")?.trim())
      );
    } else if (pointsCategoryFilter) {
      filteredPoints = filteredPoints.filter(
        (p: any) => getVal(p, "Categoría")?.trim() === pointsCategoryFilter.trim()
      );
    }
    
    return filteredPoints;
  }, [files.puntos?.data, files.carreras?.data, pointsRaceSearch, pointsCategoryFilter]);

  const memoizedRacesData = React.useMemo(() => {
    const now = new Date().getTime();
    const resultObj = files.carreras?.data?.filter((r: any) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const isFinished = Object.keys(raceWinners).includes(carreraName || "");

      if (racesFilter === "finished" && !isFinished) return false;
      if (racesFilter === "upcoming" && isFinished) return false;
      if (racesCategoryFilter) {
        if (getVal(r, "Categoría")?.trim() !== racesCategoryFilter.trim()) return false;
      }
      if (racesMonthFilter) {
        let dateObj: Date | null = null;
        const fecha = getVal(r, "Fecha");
        if (fecha) {
          const parts = fecha.toString().split(/[-/]/);
          if (parts.length === 3) {
            if (parts[0].length === 4) {
              dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
              dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
          }
        }
        if (dateObj) {
          if ((dateObj.getMonth() + 1).toString().padStart(2, "0") !== racesMonthFilter) {
            return false;
          }
        } else {
          return false;
        }
      }
      return true;
    });

    if (resultObj) {
      const parseDate = (dStr: string | null | undefined) => {
        if (!dStr) return 0;
        const p = dStr.toString().split(/[-/]/);
        if (p.length === 3) {
          if (p[0].length === 4) return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2])).getTime();
          return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0])).getTime();
        }
        return 0;
      };

      resultObj.sort((a: any, b: any) => {
        let valA: any = null, valB: any = null;
        if (infoCarrerasSortColumn === "fecha") {
          valA = parseDate(getVal(a, "Fecha"));
          valB = parseDate(getVal(b, "Fecha"));
        } else if (infoCarrerasSortColumn === "puntos") {
          valA = parseInt(getVal(a, "Puntos") || "0");
          valB = parseInt(getVal(b, "Puntos") || "0");
        } else if (infoCarrerasSortColumn === "carrera") {
          valA = getVal(a, "Carrera");
          valB = getVal(b, "Carrera");
        } else if (infoCarrerasSortColumn === "categoria") {
          valA = getVal(a, "Categoría");
          valB = getVal(b, "Categoría");
        }

        if (valA < valB) return infoCarrerasSortDir === "asc" ? -1 : 1;
        if (valA > valB) return infoCarrerasSortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return resultObj || [];
  }, [files.carreras?.data, raceWinners, racesFilter, racesCategoryFilter, racesMonthFilter, infoCarrerasSortColumn, infoCarrerasSortDir]);

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
    await copyPointsImageOrig({
        fileName: "detalle-puntos.png",
        scale: 3,
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        backgroundColor: "#ffffff",
    });
  };

  const handleDownloadPointsImage = async () => {
    await downloadPointsImageOrig({
        fileName: "detalle-puntos.png",
        scale: 3,
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        backgroundColor: "#ffffff",
    });
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
    await copyRacesImageOrig({
        fileName: "detalle-carreras.png",
        scale: 3,
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        backgroundColor: "#ffffff",
    });
  };

  const handleDownloadRacesImage = async () => {
    await downloadRacesImageOrig({
        fileName: "detalle-carreras.png",
        scale: 3,
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        backgroundColor: "#ffffff",
    });
  };

  

  return (
              <div className="space-y-8">
                {infoSubTab === "menu" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
                    <button
                      onClick={() => setInfoSubTab("puntuaciones")}
                      className="h-auto whitespace-normal bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group text-left w-full"
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
                      className="h-auto whitespace-normal bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group text-left w-full"
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
                  <InfoPointsTable
                    setInfoSubTab={setInfoSubTab}
                    pointsTableRef={pointsTableRef}
                    isPointsExpanded={isPointsExpanded}
                    setIsPointsExpanded={setIsPointsExpanded}
                    handleCopyPoints={handleCopyPoints}
                    isPointsTextCopying={isPointsTextCopying}
                    handleCopyPointsImage={handleCopyPointsImage}
                    isPointsImageCopying={isPointsImageCopying}
                    handleDownloadPointsImage={handleDownloadPointsImage}
                    localRaceSearch={localRaceSearch}
                    setLocalRaceSearch={setLocalRaceSearch}
                    pointsCategoryFilter={pointsCategoryFilter}
                    setPointsCategoryFilter={setPointsCategoryFilter}
                    files={files}
                    memoizedPointsData={memoizedPointsData}
                  />
                )}

                {infoSubTab === "carreras" && (
                  <InfoRacesTable
                    setInfoSubTab={setInfoSubTab}
                    racesTableRef={racesTableRef}
                    isRacesExpanded={isRacesExpanded}
                    setIsRacesExpanded={setIsRacesExpanded}
                    handleCopyRaces={handleCopyRaces}
                    isRacesTextCopying={isRacesTextCopying}
                    handleCopyRacesImage={handleCopyRacesImage}
                    isRacesImageCopying={isRacesImageCopying}
                    handleDownloadRacesImage={handleDownloadRacesImage}
                    racesFilter={racesFilter}
                    setRacesFilter={setRacesFilter}
                    racesCategoryFilter={racesCategoryFilter}
                    setRacesCategoryFilter={setRacesCategoryFilter}
                    racesMonthFilter={racesMonthFilter}
                    setRacesMonthFilter={setRacesMonthFilter}
                    files={files}
                    setInfoCarrerasSortDir={setInfoCarrerasSortDir}
                    infoCarrerasSortDir={infoCarrerasSortDir}
                    memoizedRacesData={memoizedRacesData}
                    raceWinners={raceWinners}
                    now={new Date().getTime()}
                  />
                )}
              </div>
  );
};
