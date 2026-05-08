import React, { useContext, useMemo, useState, useRef } from "react";
import { SeasonViewContext } from "./SeasonViewContext";
import { getVal } from "../../../lib/data-processing";
import { Copy, Download, Maximize2, Minimize2 } from "lucide-react";
import { domToBlob } from "modern-screenshot";
import { expandNodeForCapture } from "../../../lib/dom-utils";
import { copyImageToClipboard } from "../../../lib/clipboard";

export function HotStreakCyclists() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const { files, cyclistMetadata, playerTeamMap, playerOrderMap, cyclistRoundMap, cn } = context;

  const chartRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const [hotStreakMinPoints, setHotStreakMinPoints] = useState<number | "">(1);
  const [hotStreakMaxPoints, setHotStreakMaxPoints] = useState<number | "">("");
  const [hotStreakLastNWeeks, setHotStreakLastNWeeks] = useState<number>(4);
  const [hotStreakCyclistsLimit, setHotStreakCyclistsLimit] = useState<number>(10);

  const handleCopy = async () => {
    if (!chartRef.current || isCopying) return;
    setIsCopying(true);
    let restore = () => {};
    try {
      restore = expandNodeForCapture(chartRef.current);
      await new Promise((resolve) => setTimeout(resolve, 50));
      const blobPromise = domToBlob(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        style: {
          fontFamily: "Inter, sans-serif",
          padding: "24px",
          borderRadius: "16px",
        },
      }).then(blob => {
        if (!blob) throw new Error("Could not generate image");
        return blob;
      });
      await copyImageToClipboard(blobPromise, "rachas-puntos-ciclistas.png");
    } catch (e) {
      console.error(e);
    } finally {
      restore();
      setIsCopying(false);
    }
  };

  const handleDownload = async () => {
    if (!chartRef.current || isCopying) return;
    setIsCopying(true);
    let restore = () => {};
    try {
      restore = expandNodeForCapture(chartRef.current);
      await new Promise((resolve) => setTimeout(resolve, 50));
      const blob = await domToBlob(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        style: {
          fontFamily: "Inter, sans-serif",
          padding: "24px",
          borderRadius: "16px",
        },
      });
      if (!blob) throw new Error("no blob generated");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rachas-puntos-ciclistas.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      restore();
      setIsCopying(false);
    }
  };

  const hotStreaksData = useMemo(() => {
    if (!files.carreras?.data || !files.resultados?.data) return { cyclists: [], totalActiveWeeks: 0 };

    const getISOWeekString = (date: Date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
      return `${d.getUTCFullYear()}-W${week.toString().padStart(2, '0')}`;
    };

    const raceWeeks: Record<string, string> = {};
    const weeksWithResults = new Set<string>();

    files.carreras.data.forEach((r: any) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const fechaFin = getVal(r, "Fecha");
      if (carreraName && fechaFin) {
        const parts = fechaFin.toString().split(/[-/]/);
        let dateObj;
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          } else {
            dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
          if (dateObj && !isNaN(dateObj.getTime())) {
             raceWeeks[carreraName] = getISOWeekString(dateObj);
          }
        }
      }
    });

    const cyclistToJugador: Record<string, string> = {};
    if (files.elecciones?.data) {
       files.elecciones.data.forEach((row: any) => {
         const c = (row["Ciclista"] || "").toString().trim();
         const j = (row["Jugador"] || row["Nombre_TG"] || "").toString().trim();
         if (c && j && j !== "No draft" && j !== "Libre") {
           cyclistToJugador[c] = j;
         }
       });
    }

    const cyclistWeeklyPoints: Record<string, Record<string, number>> = {};

    Object.entries(cyclistMetadata || {}).forEach(([ciclista, meta]: [string, any]) => {
      if (!cyclistWeeklyPoints[ciclista]) cyclistWeeklyPoints[ciclista] = {};
      
      const jugador = cyclistToJugador[ciclista];
      const team = jugador ? (playerTeamMap[jugador] || jugador) : null;
      if (!team) return; // ONLY CONSIDER CYCLISTS WITH TEAM per the requirement

      if (meta.puntosPorCarrera) {
        Object.entries(meta.puntosPorCarrera).forEach(([race, pts]) => {
          const points = pts as number;
          if (points > 0) {
             const w = raceWeeks[race];
             if (w) {
               cyclistWeeklyPoints[ciclista][w] = (cyclistWeeklyPoints[ciclista][w] || 0) + points;
               weeksWithResults.add(w);
             }
          }
        });
      }
    });

    const sortedActiveWeeks = Array.from(weeksWithResults).sort();
    const recentWeeks = hotStreakLastNWeeks > 0 ? sortedActiveWeeks.slice(-hotStreakLastNWeeks) : sortedActiveWeeks;

    const cStreaks = Object.entries(cyclistWeeklyPoints).filter(([name]) => cyclistToJugador[name]).map(([name, wMap]) => {
      const ronda = cyclistRoundMap[name] || "0";
      const jugador = cyclistToJugador[name];
      const team = jugador ? (playerTeamMap[jugador] || jugador) : "?";
      const order = playerOrderMap[jugador] || "?";
      const pointsPerWeek = recentWeeks.map(w => wMap[w] || 0);
      return {
        name: `${name} <${ronda.toString().padStart(2, '0')}>`,
        team: `${team} [#${order}]`,
        pointsInPeriod: pointsPerWeek.reduce((a, b) => a + b, 0),
        pointsPerWeek
      };
    });

    const minP = typeof hotStreakMinPoints === "number" ? hotStreakMinPoints : -Infinity;
    const maxP = typeof hotStreakMaxPoints === "number" ? hotStreakMaxPoints : Infinity;

    const filteredCyclists = cStreaks.filter(x => x.pointsInPeriod >= minP && x.pointsInPeriod <= maxP);
    filteredCyclists.sort((a,b) => b.pointsInPeriod - a.pointsInPeriod);

    return { 
      cyclists: filteredCyclists.slice(0, hotStreakCyclistsLimit), 
      totalActiveWeeks: recentWeeks.length 
    };
  }, [files.carreras, files.resultados, files.elecciones, cyclistMetadata, playerTeamMap, hotStreakMinPoints, hotStreakMaxPoints, hotStreakCyclistsLimit, hotStreakLastNWeeks, playerOrderMap, cyclistRoundMap]);

  if (!hotStreaksData || hotStreaksData.cyclists.length === 0) return null;

  return (
    <div className={cn("bg-white border border-neutral-200 rounded-2xl shadow-sm flex flex-col mt-6", isExpanded ? "fixed inset-4 z-50 overflow-hidden shadow-2xl" : "h-auto")} ref={chartRef}>
      <div className="px-6 py-5 border-b border-neutral-100 flex flex-col gap-4 bg-neutral-50/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <span role="img" aria-label="fire">🔥</span> Rachas de puntos - Ciclistas
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Top Ciclistas con más puntos sumados en el periodo seleccionado.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-neutral-200 shadow-sm relative z-10 hidden sm:flex">
             <button onClick={handleCopy} className={cn("p-1.5 rounded-md transition-colors", isCopying ? "bg-green-50 text-green-600" : "hover:bg-neutral-100 text-neutral-500")} title="Copiar al portapapeles">
               <Copy className="w-4 h-4" />
             </button>
             <button onClick={handleDownload} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 transition-colors" title="Descargar ranking">
               <Download className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-neutral-300 mx-1"></div>
             <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 transition-colors" title={isExpanded ? "Contraer" : "Expandir"}>
               {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
             </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
           <div className="flex flex-col gap-1 w-full sm:w-auto">
             <label className="text-xs font-semibold text-neutral-500 uppercase">Período</label>
             <select
               className="text-sm border-neutral-300 rounded focus:ring-rose-500 focus:border-rose-500"
               value={hotStreakLastNWeeks}
               onChange={(e) => setHotStreakLastNWeeks(Number(e.target.value))}
             >
               <option value={2}>Últimas 2 semanas</option>
               <option value={4}>Últimas 4 semanas</option>
               <option value={8}>Últimas 8 semanas</option>
             </select>
           </div>
           
           <div className="flex flex-col gap-1 w-full sm:w-auto">
             <label className="text-xs font-semibold text-neutral-500 uppercase">Puntos sumados</label>
             <div className="flex items-center gap-2">
               <input
                 type="number"
                 placeholder="Min (1)"
                 className="text-sm border-neutral-300 rounded focus:ring-rose-500 focus:border-rose-500 w-24"
                 value={hotStreakMinPoints === "" ? "" : hotStreakMinPoints}
                 onChange={(e) => setHotStreakMinPoints(e.target.value === "" ? "" : Number(e.target.value))}
               />
               <span className="text-neutral-400">-</span>
               <input
                 type="number"
                 placeholder="Max (∞)"
                 className="text-sm border-neutral-300 rounded focus:ring-rose-500 focus:border-rose-500 w-24"
                 value={hotStreakMaxPoints === "" ? "" : hotStreakMaxPoints}
                 onChange={(e) => setHotStreakMaxPoints(e.target.value === "" ? "" : Number(e.target.value))}
               />
             </div>
           </div>

           <div className="flex flex-col gap-1 w-full sm:w-auto">
             <label className="text-xs font-semibold text-neutral-500 uppercase">Top Ciclistas</label>
             <select
               className="text-sm border-neutral-300 rounded focus:ring-rose-500 focus:border-rose-500"
               value={hotStreakCyclistsLimit}
               onChange={(e) => setHotStreakCyclistsLimit(Number(e.target.value))}
             >
               <option value={5}>Top 5</option>
               <option value={10}>Top 10</option>
               <option value={20}>Top 20</option>
               <option value={50}>Top 50</option>
             </select>
           </div>
        </div>
      </div>
      
      <div className={cn("p-6 flex-1 overflow-auto", isExpanded ? "h-0" : "")}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {hotStreaksData.cyclists.length > 0 ? hotStreaksData.cyclists.map((c, i) => (
            <div key={i} className="flex flex-col bg-neutral-50 border border-neutral-100 p-2.5 rounded-xl gap-2">
              <div className="flex items-start gap-2">
                <span className="font-black text-orange-500 bg-orange-50 w-6 h-6 flex items-center justify-center rounded-full text-[10px] shrink-0 mt-0.5">{i+1}</span>
                <div className="flex flex-col flex-grow min-w-0">
                   <div className="flex justify-between items-start">
                     <div className="flex flex-col min-w-0">
                        <span className="font-bold text-neutral-800 text-sm line-clamp-1" title={c.name}>{c.name}</span>
                        <span className="text-[11px] text-neutral-500 line-clamp-1" title={c.team}>{c.team}</span>
                     </div>
                     <span className="font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-neutral-200 text-neutral-700 text-xs whitespace-nowrap ml-2">{Math.round(c.pointsInPeriod)} pts</span>
                   </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-1 pl-8">
               {c.pointsPerWeek.map((pts: number, idx: number) => {
                  const qualifies = pts > 0;
                  return (
                    <div key={idx} className={`w-8 text-center text-[10px] py-0.5 rounded ${qualifies ? 'bg-orange-100 text-orange-700 font-bold' : 'bg-neutral-200 text-neutral-500'}`} title={`Semana ${idx + 1}: ${pts} pts`}>
                      {pts}
                    </div>
                  );
               })}
             </div>
            </div>
          )) : (
            <div className="text-neutral-400 italic text-sm py-4 col-span-full">No hay datos suficientes recientes o no cumplen los filtros de puntos.</div>
          )}
        </div>
      </div>
    </div>
  );
}
