import React, { useState, useMemo, useRef } from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, Medal, UserMinus, LayoutGrid } from "lucide-react";
import { cn } from "../../lib/utils";
import { getVal, formatNumberSpanish } from "../../lib/data-processing";
import { domToBlob, domToDataUrl } from "modern-screenshot";
import { expandNodeForCapture } from "../../lib/dom-utils";

export interface TeamViewProps {
  files: any;
  selectedTeam: string;
  setSelectedTeam: (val: string) => void;
  formattedTeams: any[];
  leaderboard: any[];
  raceWinners: Record<string, string>;
  globalTeamPartialWinsCount: any;
  cyclistMetadata: any;
}

export const TeamView = (props: TeamViewProps) => {
  const { files, selectedTeam, setSelectedTeam, formattedTeams, leaderboard, raceWinners, globalTeamPartialWinsCount, cyclistMetadata } = props;

  const [teamCyclistsSortColumn, setTeamCyclistsSortColumn] = useState<string>("puntos");
  const [teamCyclistsSortDirection, setTeamCyclistsSortDirection] = useState<"asc" | "desc">("desc");
  const [isTeamGlobalCopying, setIsTeamGlobalCopying] = useState(false);
  
  const teamGlobalRef = useRef<HTMLDivElement>(null);

  const handleCopyTeamGlobalImage = async () => {
    if (!teamGlobalRef.current || isTeamGlobalCopying) return;
    setIsTeamGlobalCopying(true);

    const tableElement = teamGlobalRef.current.querySelector('table');
    const targetWidth = tableElement ? Math.max(tableElement.scrollWidth + 64, 800) : 1000;

    const restore = expandNodeForCapture(teamGlobalRef.current);

    // Prevent flex/grid items from causing max-content to become a single unbounded row
    teamGlobalRef.current.style.setProperty("display", "block", "important");

    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      if (typeof ClipboardItem !== "undefined") {
        const clipboardItem = new ClipboardItem({
          "image/png": (async () => {
            const dataUrl = await domToDataUrl(teamGlobalRef.current!, {
              scale: 3, 
        
        backgroundColor: '#ffffff',
              style: { overflow: "visible" },
              
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>,
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsTeamGlobalCopying(false), 2000);
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (err) {
      /* console.error suppressed */
      setIsTeamGlobalCopying(false);
      handleDownloadTeamGlobalImage();
      /* Alert suppressed to improve user experience in iframe */
    } finally {
      restore();
    }
  };

  const handleDownloadTeamGlobalImage = async () => {
    if (!teamGlobalRef.current) return;

    const tableElement = teamGlobalRef.current.querySelector('table');
    const targetWidth = tableElement ? Math.max(tableElement.scrollWidth + 64, 800) : 1000;

    const restore = expandNodeForCapture(teamGlobalRef.current);

    // Prevent flex/grid items from causing max-content to become a single unbounded row
    teamGlobalRef.current.style.setProperty("display", "block", "important");

    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const dataUrl = await domToDataUrl(teamGlobalRef.current, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        style: { overflow: "visible" },
        
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `equipo-${selectedTeam.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading team image:", err);
    } finally {
      restore();
    }
  };

  
  const teamComputedData = useMemo(() => {
    if (!selectedTeam) return null;

    const teamPlayer = leaderboard?.find((p) => p.nombreEquipo === selectedTeam);
    const teamWins = Object.values(raceWinners).filter((w) => w === selectedTeam).length;
    const teamPartialWins = globalTeamPartialWinsCount.totals[selectedTeam] || 0;

    const teamCyclistsData = files.elecciones.data?.filter(
        (r) => (getVal(r, "Nombre_Equipo") || getVal(r, "Nombre_TG")) === selectedTeam,
    ) || [];

    const ages = teamCyclistsData
      .map((c) => parseInt(getVal(c, "Edad")))
      .filter((a) => !isNaN(a));
      
    const avgAge = ages.length > 0 ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : "-";

    const currentPuesto = leaderboard
      ? leaderboard?.findIndex((p) => p.nombreEquipo === selectedTeam) + 1
      : 0;
      
    const draftOrder = formattedTeams
      .find((t) => t.value === selectedTeam)
      ?.label.match(/\[#(\d+)\]/)?.[1];
      
    const draftOrderNum = draftOrder ? parseInt(draftOrder) : 0;
    const difConOrden = draftOrderNum - currentPuesto;

    const cyclistStats = teamCyclistsData
      .map((c) => {
        const ciclista = getVal(c, "Ciclista");
        const details = teamPlayer?.detalles.filter((d) => d.ciclista === ciclista) || [];

        const puntos = details.reduce((sum, d) => sum + d.puntosObtenidos, 0);

        const victorias = details.filter((d) => {
          const isPos01 = d.posicion === "01" || d.posicion === "1";
          const isValidType = [
            "Etapa",
            "Etapa (Crono equipos)",
            "Clasificación final",
            "Clasificación final (Crono equipos)",
          ].includes(d.tipoResultado);
          return isPos01 && isValidType;
        }).length;

        const metadata = cyclistMetadata[ciclista] || {
          edad: "-",
          pais: "-",
          equipoBreve: "-",
          ronda: "-",
          carrerasDisputadas: 0,
          diasCompeticion: 0,
        };

        return {
          ciclista,
          ronda: metadata.ronda,
          edad: metadata.edad || getVal(c, "Edad") || "-",
          pais: metadata.pais,
          equipoBreve: metadata.equipoBreve,
          puntos,
          victorias,
          carrerasDisputadas: metadata.carrerasDisputadas,
          diasCompeticion: metadata.diasCompeticion,
          puntosPorCarrera: metadata.carrerasDisputadas > 0 ? (puntos / metadata.carrerasDisputadas).toFixed(1) : "0.0",
          puntosPorDia: metadata.diasCompeticion > 0 ? (puntos / metadata.diasCompeticion).toFixed(1) : "0.0",
          pointsPct: (teamPlayer?.puntos || 0) > 0 ? (puntos / teamPlayer!.puntos) * 100 : 0,
        };
      })
      .sort((a, b) => {
        let valA: any, valB: any;
        switch (teamCyclistsSortColumn) {
          case "ronda": valA = a.ronda; valB = b.ronda; break;
          case "ciclista": valA = a.ciclista; valB = b.ciclista; break;
          case "edad": valA = a.edad === "-" ? 0 : parseInt(a.edad); valB = b.edad === "-" ? 0 : parseInt(b.edad); break;
          case "pais": valA = a.pais; valB = b.pais; break;
          case "equipo": valA = a.equipoBreve; valB = b.equipoBreve; break;
          case "puntos": valA = a.puntos; valB = b.puntos; break;
          case "victorias": valA = a.victorias; valB = b.victorias; break;
          case "carreras": valA = a.carrerasDisputadas; valB = b.carrerasDisputadas; break;
          case "dias": valA = a.diasCompeticion; valB = b.diasCompeticion; break;
          case "ppc": valA = parseFloat(a.puntosPorCarrera); valB = parseFloat(b.puntosPorCarrera); break;
          case "ppd": valA = parseFloat(a.puntosPorDia); valB = parseFloat(b.puntosPorDia); break;
          case "pct": valA = a.pointsPct; valB = b.pointsPct; break;
          default: valA = a.puntos; valB = b.puntos; break;
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return teamCyclistsSortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        if (valA < valB) return teamCyclistsSortDirection === "asc" ? -1 : 1;
        if (valA > valB) return teamCyclistsSortDirection === "asc" ? 1 : -1;
        return 0;
      });

    const maxVict = Math.max(0, ...cyclistStats.map((c) => c.victorias));
    const minVict = Math.min(0, ...cyclistStats.map((c) => c.victorias));
    const maxCarr = Math.max(0, ...cyclistStats.map((c) => c.carrerasDisputadas));
    const minCarr = Math.min(0, ...cyclistStats.map((c) => c.carrerasDisputadas));
    const maxDc = Math.max(0, ...cyclistStats.map((c) => c.diasCompeticion));
    const minDc = Math.min(0, ...cyclistStats.map((c) => c.diasCompeticion));

    // Stats distribution logic over month/week etc.
    // Wait, the stats distribution might be large. Let's pull stats variables too.
    const weeklyPoints: Record<string, number> = {};
    const categoryPoints: Record<string, number> = {};
    const runnerPoints: Record<string, number> = {};

    teamPlayer?.detalles.forEach((d) => {
      // category
      const cat = d.categoria || "Otras";
      categoryPoints[cat] = (categoryPoints[cat] || 0) + d.puntosObtenidos;

      // runner
      runnerPoints[d.ciclista] = (runnerPoints[d.ciclista] || 0) + d.puntosObtenidos;
    });

    return {
      teamPlayer,
      teamWins,
      teamPartialWins,
      avgAge,
      currentPuesto,
      draftOrderNum,
      difConOrden,
      cyclistStats,
      maxVict, minVict, maxCarr, minCarr, maxDc, minDc,
      categoryPoints,
      runnerPoints
    };
  }, [
    selectedTeam,
    leaderboard,
    raceWinners,
    globalTeamPartialWinsCount,
    files,
    formattedTeams,
    cyclistMetadata,
    teamCyclistsSortColumn,
    teamCyclistsSortDirection,
  ]);

  return (
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6">
                <div className="max-w-md mb-8">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Selecciona tu equipo
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">-- Seleccionar Equipo --</option>
                    {formattedTeams.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTeam ? (
                  (() => {
                    const teamPlayer = leaderboard?.find(
                      (p) => p.nombreEquipo === selectedTeam,
                    );
                    const teamWins = Object.values(raceWinners).filter(
                      (w) => w === selectedTeam,
                    ).length;
                    const teamPartialWins =
                      globalTeamPartialWinsCount.totals[selectedTeam] || 0;

                    const teamCyclistsData =
                      files.elecciones.data?.filter(
                        (r) =>
                          (getVal(r, "Nombre_Equipo") ||
                            getVal(r, "Nombre_TG")) === selectedTeam,
                      ) || [];
                    const ages = teamCyclistsData
                      .map((c) => parseInt(getVal(c, "Edad")))
                      .filter((a) => !isNaN(a));
                    const avgAge =
                      ages.length > 0
                        ? (
                            ages.reduce((a, b) => a + b, 0) / ages.length
                          ).toFixed(1)
                        : "-";

                    // New KPIs: Puesto and Dif con orden
                    const currentPuesto = leaderboard
                      ? leaderboard?.findIndex(
                          (p) => p.nombreEquipo === selectedTeam,
                        ) + 1
                      : 0;
                    const draftOrder = formattedTeams
                      .find((t) => t.value === selectedTeam)
                      ?.label.match(/\[#(\d+)\]/)?.[1];
                    const draftOrderNum = draftOrder ? parseInt(draftOrder) : 0;
                    const difConOrden = draftOrderNum - currentPuesto;

                    const cyclistStats = teamCyclistsData
                      .map((c) => {
                        const ciclista = getVal(c, "Ciclista");
                        const details =
                          teamPlayer?.detalles.filter(
                            (d) => d.ciclista === ciclista,
                          ) || [];

                        const puntos = details.reduce(
                          (sum, d) => sum + d.puntosObtenidos,
                          0,
                        );

                        const victorias = details.filter((d) => {
                          const isPos01 =
                            d.posicion === "01" || d.posicion === "1";
                          const isValidType = [
                            "Etapa",
                            "Etapa (Crono equipos)",
                            "Clasificación final",
                            "Clasificación final (Crono equipos)",
                          ].includes(d.tipoResultado);
                          return isPos01 && isValidType;
                        }).length;

                        const metadata = cyclistMetadata[ciclista] || {
                          edad: "-",
                          pais: "-",
                          equipoBreve: "-",
                          ronda: "-",
                          carrerasDisputadas: 0,
                          diasCompeticion: 0,
                        };

                        return {
                          ciclista,
                          ronda: metadata.ronda,
                          edad: metadata.edad || getVal(c, "Edad") || "-",
                          pais: metadata.pais,
                          equipoBreve: metadata.equipoBreve,
                          puntos,
                          victorias,
                          carrerasDisputadas: metadata.carrerasDisputadas,
                          diasCompeticion: metadata.diasCompeticion,
                          puntosPorCarrera:
                            metadata.carrerasDisputadas > 0
                              ? (puntos / metadata.carrerasDisputadas).toFixed(
                                  1,
                                )
                              : "0.0",
                          puntosPorDia:
                            metadata.diasCompeticion > 0
                              ? (puntos / metadata.diasCompeticion).toFixed(1)
                              : "0.0",
                          pointsPct:
                            (teamPlayer?.puntos || 0) > 0
                              ? (puntos / teamPlayer!.puntos) * 100
                              : 0,
                        };
                      })
                      .sort((a, b) => {
                        let valA: any, valB: any;
                        switch (teamCyclistsSortColumn) {
                          case "ronda":
                            valA = a.ronda;
                            valB = b.ronda;
                            break;
                          case "ciclista":
                            valA = a.ciclista;
                            valB = b.ciclista;
                            break;
                          case "edad":
                            valA = a.edad === "-" ? 0 : parseInt(a.edad);
                            valB = b.edad === "-" ? 0 : parseInt(b.edad);
                            break;
                          case "pais":
                            valA = a.pais;
                            valB = b.pais;
                            break;
                          case "equipo":
                            valA = a.equipoBreve;
                            valB = b.equipoBreve;
                            break;
                          case "puntos":
                            valA = a.puntos;
                            valB = b.puntos;
                            break;
                          case "victorias":
                            valA = a.victorias;
                            valB = b.victorias;
                            break;
                          case "carreras":
                            valA = a.carrerasDisputadas;
                            valB = b.carrerasDisputadas;
                            break;
                          case "dias":
                            valA = a.diasCompeticion;
                            valB = b.diasCompeticion;
                            break;
                          case "ppc":
                            valA = parseFloat(a.puntosPorCarrera);
                            valB = parseFloat(b.puntosPorCarrera);
                            break;
                          case "ppd":
                            valA = parseFloat(a.puntosPorDia);
                            valB = parseFloat(b.puntosPorDia);
                            break;
                          case "pct":
                            valA = a.pointsPct;
                            valB = b.pointsPct;
                            break;
                          default:
                            valA = a.puntos;
                            valB = b.puntos;
                            break;
                        }

                        if (
                          typeof valA === "string" &&
                          typeof valB === "string"
                        ) {
                          return teamCyclistsSortDirection === "asc"
                            ? valA.localeCompare(valB)
                            : valB.localeCompare(valA);
                        }

                        if (valA < valB)
                          return teamCyclistsSortDirection === "asc" ? -1 : 1;
                        if (valA > valB)
                          return teamCyclistsSortDirection === "asc" ? 1 : -1;
                        return 0;
                      });

                    // Calculate max/min values for conditional formatting
                    const maxVict = Math.max(
                      ...cyclistStats.map((c) => c.victorias),
                    );
                    const minVict = Math.min(
                      ...cyclistStats.map((c) => c.victorias),
                    );
                    const maxCarr = Math.max(
                      ...cyclistStats.map((c) => c.carrerasDisputadas),
                    );
                    const minCarr = Math.min(
                      ...cyclistStats.map((c) => c.carrerasDisputadas),
                    );
                    const maxDias = Math.max(
                      ...cyclistStats.map((c) => c.diasCompeticion),
                    );
                    const minDias = Math.min(
                      ...cyclistStats.map((c) => c.diasCompeticion),
                    );
                    const maxPpc = Math.max(
                      ...cyclistStats.map((c) =>
                        parseFloat(c.puntosPorCarrera),
                      ),
                    );
                    const minPpc = Math.min(
                      ...cyclistStats.map((c) =>
                        parseFloat(c.puntosPorCarrera),
                      ),
                    );
                    const maxPpd = Math.max(
                      ...cyclistStats.map((c) => parseFloat(c.puntosPorDia)),
                    );
                    const minPpd = Math.min(
                      ...cyclistStats.map((c) => parseFloat(c.puntosPorDia)),
                    );
                    const maxPct = Math.max(
                      ...cyclistStats.map((c) => c.pointsPct),
                    );
                    const maxPoints = Math.max(
                      ...cyclistStats.map((c) => c.puntos),
                    );
                    const minPoints = Math.min(
                      ...cyclistStats.map((c) => c.puntos),
                    );
                    const unscoredCount = cyclistStats.filter(
                      (c) => c.puntos === 0,
                    ).length;

                    const getMinNonZero = (arr: number[]) => {
                      const nonZero = arr.filter((v) => v > 0);
                      return nonZero.length > 0 ? Math.min(...nonZero) : null;
                    };
                    const minNonZeroCarr = getMinNonZero(
                      cyclistStats.map((c) => c.carrerasDisputadas),
                    );
                    const minNonZeroDias = getMinNonZero(
                      cyclistStats.map((c) => c.diasCompeticion),
                    );
                    const minNonZeroPpc = getMinNonZero(
                      cyclistStats.map((c) => parseFloat(c.puntosPorCarrera)),
                    );
                    const minNonZeroPpd = getMinNonZero(
                      cyclistStats.map((c) => parseFloat(c.puntosPorDia)),
                    );
                    const minNonZeroPct = getMinNonZero(
                      cyclistStats.map((c) => c.pointsPct),
                    );

                    const getStatColor = (
                      val: number,
                      max: number,
                      min: number,
                      zeroIsRed: boolean = true,
                      onlyMax: boolean = false,
                      minNonZero: number | null = null,
                    ) => {
                      if (zeroIsRed && val === 0)
                        return "text-red-600 font-bold";
                      if (val === max && max > 0)
                        return "text-green-600 font-bold";
                      if (
                        minNonZero !== null &&
                        val === minNonZero &&
                        val < max
                      )
                        return "text-orange-500 font-bold";
                      if (!onlyMax && val === min && min < max && min !== 0)
                        return "text-yellow-600 font-bold";
                      return "text-neutral-600";
                    };

                    const getPointsBg = (puntos: number) => {
                      if (puntos === 0) return "transparent";
                      if (maxPoints === minPoints)
                        return "rgba(34, 197, 94, 0.1)";
                      const ratio =
                        (puntos - minPoints) / (maxPoints - minPoints);
                      return `rgba(34, 197, 94, ${0.05 + ratio * 0.2})`; // Light green scale
                    };

                    return (
                      <div className="space-y-4">
                        <div className="flex justify-end mb-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleCopyTeamGlobalImage}
                              className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                              title="Copiar imagen"
                            >
                              {isTeamGlobalCopying ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                              Copiar Imagen
                            </button>
                            <button
                              onClick={handleDownloadTeamGlobalImage}
                              className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                              title="Descargar"
                            >
                              <UploadCloud className="w-4 h-4" />
                              Descargar
                            </button>
                          </div>
                        </div>
                        <div
                          ref={teamGlobalRef}
                          className="space-y-8 bg-white p-6 -mx-6 -mt-6 sm:mx-0 sm:mt-0 sm:p-6 sm:bg-white sm:border sm:border-neutral-200 sm:shadow-sm rounded-2xl"
                        >
                          {/* Title for image */}
                          <div className="text-center mb-2">
                            <h2 className="text-2xl font-bold text-neutral-900">
                              {selectedTeam}
                            </h2>
                            <p className="text-sm text-neutral-500">
                              Resumen de la temporada
                            </p>
                          </div>
                          {/* KPIs */}
                          <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
                              <Trophy className="w-4 h-4 text-blue-600 mb-1 shrink-0" />
                              <p className="text-[8px] font-medium text-blue-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
                                Puntos
                              </p>
                              <p className="text-xl font-bold text-neutral-900 leading-none text-center">
                                {teamPlayer?.puntos || 0}
                              </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
                              <Medal className="w-4 h-4 text-yellow-500 mb-1 shrink-0" />
                              <p className="text-[8px] font-medium text-yellow-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
                                Victorias
                              </p>
                              <p className="text-xl font-bold text-neutral-900 leading-none text-center">
                                {teamWins}
                              </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
                              <Medal className="w-4 h-4 text-amber-500 mb-1 shrink-0" />
                              <p className="text-[8px] font-medium text-amber-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
                                Vict. Parc.
                              </p>
                              <p className="text-xl font-bold text-neutral-900 leading-none text-center">
                                {teamPartialWins}
                              </p>
                            </div>

                            <div className="bg-green-50 border border-green-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
                              <Users className="w-4 h-4 text-green-600 mb-1 shrink-0" />
                              <p className="text-[8px] font-medium text-green-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
                                Edad Media
                              </p>
                              <p className="text-xl font-bold text-neutral-900 leading-none text-center">
                                {avgAge}
                              </p>
                            </div>

                            <div className="bg-red-50 border border-red-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
                              <UserMinus className="w-4 h-4 text-red-600 mb-1 shrink-0" />
                              <p className="text-[8px] font-medium text-red-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
                                Sin puntuar
                              </p>
                              <p className="text-xl font-bold text-neutral-900 leading-none text-center">
                                {unscoredCount}
                              </p>
                            </div>

                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
                              <LayoutGrid className="w-4 h-4 text-purple-600 mb-1 shrink-0" />
                              <p className="text-[8px] font-medium text-purple-600 uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap">
                                Puesto
                              </p>
                              <p className="text-xl font-bold text-neutral-900 leading-none text-center">
                                {currentPuesto}
                              </p>
                            </div>

                            <div
                              className={cn(
                                "border rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]",
                                difConOrden > 0
                                  ? "bg-green-50 border-green-100"
                                  : difConOrden === 0
                                    ? "bg-yellow-50 border-yellow-100"
                                    : "bg-red-50 border-red-100",
                              )}
                            >
                              <ArrowUpRight
                                className={cn(
                                  "w-4 h-4 mb-1 shrink-0",
                                  difConOrden > 0
                                    ? "text-green-600"
                                    : difConOrden === 0
                                      ? "text-yellow-600"
                                      : "text-red-600",
                                )}
                              />
                              <p
                                className={cn(
                                  "text-[8px] font-medium uppercase tracking-tight leading-tight mb-1 text-center whitespace-nowrap",
                                  difConOrden > 0
                                    ? "text-green-600"
                                    : difConOrden === 0
                                      ? "text-yellow-600"
                                      : "text-red-600",
                                )}
                              >
                                Dif orden
                              </p>
                              <p
                                className={cn(
                                  "text-xl font-bold leading-none text-center",
                                  difConOrden > 0
                                    ? "text-green-700"
                                    : difConOrden === 0
                                      ? "text-yellow-700"
                                      : "text-red-700",
                                )}
                              >
                                {difConOrden > 0
                                  ? `+${difConOrden}`
                                  : difConOrden}
                              </p>
                            </div>
                          </div>

                          {/* Cyclists Table */}
                          <div>
                            {/* Sala de Trofeos */}
                            <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 mb-6">
                              <h3 className="text-xs font-bold text-neutral-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <Trophy className="w-3 h-3 text-yellow-500" />
                                Sala de Trofeos ({teamWins})
                              </h3>
                              {teamWins > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(raceWinners)
                                    .filter(
                                      ([_, winner]) => winner === selectedTeam,
                                    )
                                    .map(([race]) => {
                                      // Sum points for all cyclists of the team in this specific race
                                      const points =
                                        teamPlayer?.detalles
                                          ?.filter((d) => d.carrera === race)
                                          ?.reduce(
                                            (sum, d) => sum + d.puntosObtenidos,
                                            0,
                                          ) || 0;

                                      // Calculate total points for the race category to determine importance
                                      const raceData =
                                        files.carreras.data?.find(
                                          (r) => getVal(r, "Carrera") === race,
                                        );
                                      const category = raceData
                                        ? getVal(raceData, "Categoría")
                                        : null;
                                      const totalRacePoints = category
                                        ? files.puntos.data
                                            ?.filter(
                                              (p) =>
                                                getVal(p, "Categoría") ===
                                                category,
                                            )
                                            ?.reduce(
                                              (sum, p) =>
                                                sum +
                                                (parseInt(
                                                  getVal(p, "Puntos"),
                                                ) || 0),
                                              0,
                                            ) || 0
                                        : 0;

                                      return { race, points, totalRacePoints };
                                    })
                                    .sort(
                                      (a, b) =>
                                        b.totalRacePoints - a.totalRacePoints,
                                    )
                                    .map(({ race, points }) => (
                                      <div
                                        key={race}
                                        className="bg-white border border-neutral-200 rounded-lg px-3 py-2 flex items-center gap-2.5 shadow-sm"
                                      >
                                        <Trophy className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                                        <span className="text-xs font-medium text-neutral-800 whitespace-nowrap">
                                          {race}
                                        </span>
                                        <span className="text-xs font-bold text-blue-600 flex-shrink-0 whitespace-nowrap">
                                          {points} pts
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <p className="text-xs text-neutral-400 italic">
                                  Aún no hay victorias...
                                </p>
                              )}
                            </div>

                            <h3 className="font-semibold text-xl text-neutral-900 border-b pb-3 mb-4 flex items-center gap-2">
                              <Users className="w-5 h-5 text-blue-600" />
                              Plantilla del Equipo
                            </h3>
                            <div className="table-container-for-capture bg-white border border-neutral-200 rounded-xl overflow-x-auto overflow-y-auto shadow-sm flex justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                              <div className="table-responsive-wrapper overflow-auto w-full h-full"><table className="w-auto text-xs text-left whitespace-nowrap border-collapse mx-auto">
                                <thead className="bg-[#1e293b] text-white border-b border-neutral-100 text-[9px] tracking-tight uppercase font-bold sticky top-0 z-10">
                                  <tr>
                                    <th
                                      className="px-2 py-2 text-center cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      title="Ronda de elección"
                                      onClick={() => {
                                        if (
                                          teamCyclistsSortColumn === "ronda"
                                        ) {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn("ronda");
                                          setTeamCyclistsSortDirection("asc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        Rnd{" "}
                                        {teamCyclistsSortColumn === "ronda" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                    <th
                                      className="px-3 py-2 font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      onClick={() => {
                                        if (
                                          teamCyclistsSortColumn === "ciclista"
                                        ) {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn("ciclista");
                                          setTeamCyclistsSortDirection("asc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center gap-1">
                                        Ciclista{" "}
                                        {teamCyclistsSortColumn ===
                                          "ciclista" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                    <th
                                      className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      onClick={() => {
                                        if (teamCyclistsSortColumn === "edad") {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn("edad");
                                          setTeamCyclistsSortDirection("asc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        Ed.{" "}
                                        {teamCyclistsSortColumn === "edad" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                    <th
                                      className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      onClick={() => {
                                        if (teamCyclistsSortColumn === "pais") {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn("pais");
                                          setTeamCyclistsSortDirection("asc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        País{" "}
                                        {teamCyclistsSortColumn === "pais" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                    <th
                                      className="px-3 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      onClick={() => {
                                        if (
                                          teamCyclistsSortColumn === "equipo"
                                        ) {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn("equipo");
                                          setTeamCyclistsSortDirection("asc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        Equipo{" "}
                                        {teamCyclistsSortColumn === "equipo" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                    <th
                                      className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      onClick={() => {
                                        if (
                                          teamCyclistsSortColumn === "puntos"
                                        ) {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn("puntos");
                                          setTeamCyclistsSortDirection("desc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        Pts{" "}
                                        {teamCyclistsSortColumn === "puntos" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                    <th
                                      className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      title="Victorias"
                                      onClick={() => {
                                        if (
                                          teamCyclistsSortColumn === "victorias"
                                        ) {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn(
                                            "victorias",
                                          );
                                          setTeamCyclistsSortDirection("desc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        V.{" "}
                                        {teamCyclistsSortColumn ===
                                          "victorias" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                    <th
                                      className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      title="Carreras"
                                      onClick={() => {
                                        if (
                                          teamCyclistsSortColumn === "carreras"
                                        ) {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn("carreras");
                                          setTeamCyclistsSortDirection("desc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        C.{" "}
                                        {teamCyclistsSortColumn ===
                                          "carreras" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                    <th
                                      className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      title="Días de competición"
                                      onClick={() => {
                                        if (teamCyclistsSortColumn === "dias") {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn("dias");
                                          setTeamCyclistsSortDirection("desc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        DC{" "}
                                        {teamCyclistsSortColumn === "dias" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                    <th
                                      className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      title="Puntos por carreras"
                                      onClick={() => {
                                        if (teamCyclistsSortColumn === "ppc") {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn("ppc");
                                          setTeamCyclistsSortDirection("desc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        P/C{" "}
                                        {teamCyclistsSortColumn === "ppc" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                    <th
                                      className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      title="Puntos por día de competición"
                                      onClick={() => {
                                        if (teamCyclistsSortColumn === "ppd") {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn("ppd");
                                          setTeamCyclistsSortDirection("asc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        P/D{" "}
                                        {teamCyclistsSortColumn === "ppd" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                    <th
                                      className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors"
                                      title="% de puntos sobre el total del equipo"
                                      onClick={() => {
                                        if (teamCyclistsSortColumn === "pct") {
                                          setTeamCyclistsSortDirection((d) =>
                                            d === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setTeamCyclistsSortColumn("pct");
                                          setTeamCyclistsSortDirection("desc");
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        %{" "}
                                        {teamCyclistsSortColumn === "pct" &&
                                          (teamCyclistsSortDirection ===
                                          "asc" ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          ))}
                                      </div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                  {cyclistStats.map((c, idx) => (
                                    <tr
                                      key={idx}
                                      className="hover:bg-neutral-50 transition-colors"
                                    >
                                      <td
                                        className={cn(
                                          "px-2 py-1.5 text-center font-mono text-[10px]",
                                          [
                                            "01",
                                            "02",
                                            "03",
                                            "1",
                                            "2",
                                            "3",
                                          ].includes(c.ronda)
                                            ? "bg-yellow-50 text-yellow-700 font-bold"
                                            : "text-neutral-500",
                                        )}
                                      >
                                        {c.ronda}
                                      </td>
                                      <td className="px-3 py-1.5 font-bold text-neutral-900 text-[11px]">
                                        {c.ciclista}
                                      </td>
                                      <td className="px-2 py-1.5 text-center text-neutral-600 text-[10px]">
                                        {c.edad}
                                      </td>
                                      <td className="px-2 py-1.5 text-center text-neutral-600 text-[10px]">
                                        {c.pais}
                                      </td>
                                      <td className="px-3 py-1.5 text-center text-neutral-600 text-[9px]">
                                        {c.equipoBreve}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-2 py-1.5 text-center font-bold text-[10px]",
                                          c.puntos === 0
                                            ? "text-red-600"
                                            : "text-blue-600",
                                        )}
                                        style={{
                                          backgroundColor: getPointsBg(
                                            c.puntos,
                                          ),
                                        }}
                                      >
                                        {c.puntos}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-2 py-1.5 text-center text-[10px]",
                                          getStatColor(
                                            c.victorias,
                                            maxVict,
                                            minVict,
                                          ),
                                        )}
                                      >
                                        {c.victorias}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-2 py-1.5 text-center text-[10px]",
                                          getStatColor(
                                            c.carrerasDisputadas,
                                            maxCarr,
                                            minCarr,
                                            true,
                                            false,
                                            minNonZeroCarr,
                                          ),
                                        )}
                                      >
                                        {c.carrerasDisputadas}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-2 py-1.5 text-center text-[10px]",
                                          getStatColor(
                                            c.diasCompeticion,
                                            maxDias,
                                            minDias,
                                            true,
                                            false,
                                            minNonZeroDias,
                                          ),
                                        )}
                                      >
                                        {c.diasCompeticion}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-2 py-1.5 text-center font-mono text-[10px]",
                                          getStatColor(
                                            parseFloat(c.puntosPorCarrera),
                                            maxPpc,
                                            minPpc,
                                            true,
                                            true,
                                            minNonZeroPpc,
                                          ),
                                        )}
                                      >
                                        {c.puntosPorCarrera}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-2 py-1.5 text-center font-mono text-[10px]",
                                          getStatColor(
                                            parseFloat(c.puntosPorDia),
                                            maxPpd,
                                            minPpd,
                                            true,
                                            true,
                                            minNonZeroPpd,
                                          ),
                                        )}
                                      >
                                        {c.puntosPorDia}
                                      </td>
                                      <td
                                        className={cn(
                                          "px-2 py-1.5 text-center font-mono text-[10px]",
                                          getStatColor(
                                            c.pointsPct,
                                            maxPct,
                                            0,
                                            true,
                                            true,
                                            minNonZeroPct,
                                          ),
                                        )}
                                      >
                                        {c.pointsPct.toFixed(1)}%
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    Selecciona un equipo para ver sus estadísticas y plantilla.
                  </div>
                )}
              </div>
  );
};
