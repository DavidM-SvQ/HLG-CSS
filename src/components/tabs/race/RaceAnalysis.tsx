import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Award, 
  Zap, 
  UserX, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Check, 
  TrendingUp, 
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  Image,
  Download,
  Calendar,
  Layers,
  Crown,
  Flame
} from "lucide-react";
import { toast } from "sonner";
import { useComputedStore } from "../../../lib/stores/useComputedStore";
import { domToDataUrl } from "modern-screenshot";
import { copyImageToClipboard } from "../../../lib/clipboard";

export interface RaceAnalysisProps {
  raceDataObj: any;
  selectedRace: string;
  leaderboard?: any[];
}

export const RaceAnalysis = ({ raceDataObj, selectedRace, leaderboard: propLeaderboard }: RaceAnalysisProps) => {
  const [activeTab, setActiveTab] = useState<"auto" | "ai" | "infographic">("auto");
  const [aiNarrative, setAiNarrative] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const infographicRef = useRef<HTMLDivElement>(null);
  const [isCopyingInfographic, setIsCopyingInfographic] = useState(false);
  const [isDownloadingInfographic, setIsDownloadingInfographic] = useState(false);

  const { raceWinners, leaderboard: storeLeaderboard } = useComputedStore();
  const leaderboard = propLeaderboard || storeLeaderboard;

  const isFinished = Object.keys(raceWinners || {}).includes(selectedRace || "");

  if (!raceDataObj) return null;

  const {
    rankedTeams = [],
    finalColumns = [],
    teamStagePoints = [],
    retiredCyclists = [],
    raceCyclists = [],
  } = raceDataObj;

  // Clear narrative when race changes
  useEffect(() => {
    setAiNarrative("");
    setErrorMsg("");
  }, [selectedRace]);

  // Helper to format team and manager name ALWAYS as Jugador [#Orden]
  const getTeamLabel = (t: any) => {
    if (!t) return "N/A";
    const jugadorStr = t.jugador || t.nombreEquipo || "N/A";
    const ordenStr = t.orden ? `#${t.orden}` : "?";
    return `${jugadorStr} [${ordenStr}]`;
  };

  // Automated computations for the "Instant Analysis" tab
  const totalTeams = rankedTeams.length;
  const winnerTeam = rankedTeams[0];
  const runnerUpTeam = rankedTeams[1];
  const thirdPlaceTeam = rankedTeams[2];

  const totalPointsAwarded = rankedTeams.reduce((sum: number, t: any) => sum + (t.totalPoints || 0), 0);
  const avgPointsPerTeam = totalTeams > 0 ? Math.round(totalPointsAwarded / totalTeams) : 0;
  
  // Find team with most retired riders
  const retiredCountsByTeam = retiredCyclists.reduce((acc: Record<string, number>, c: any) => {
    if (c.equipo && c.equipo !== "Libre") {
      acc[c.equipo] = (acc[c.equipo] || 0) + 1;
    }
    return acc;
  }, {});

  // Sorted list of managers with retired riders, descending by count always
  const sortedRetiredTeams = Object.entries(retiredCountsByTeam)
    .map(([equipo, count]) => {
      // Find matching player in leaderboard
      const p = leaderboard?.find((p: any) => p.nombreEquipo === equipo || p.jugador === equipo);
      const label = p ? `${p.jugador} [#${p.orden}]` : `${equipo} [#?]`;
      return {
        team: label,
        count: count as number,
      };
    })
    .sort((a, b) => b.count - a.count);

  let mostRetiredTeam = "Ninguno";
  let mostRetiredCount = 0;
  if (sortedRetiredTeams.length > 0) {
    mostRetiredTeam = sortedRetiredTeams[0].team;
    mostRetiredCount = sortedRetiredTeams[0].count;
  }

  // Calculate top scoring cyclists in this race using "puntos" (not racePoints)
  const topCyclists = [...raceCyclists]
    .sort((a: any, b: any) => (b.puntos || 0) - (a.puntos || 0))
    .slice(0, 5);

  // Identify dominant concepts/stages
  const stageWinnerSummary = finalColumns.map((col: any) => {
    // Find who scored the highest points in this column
    let maxPoints = 0;
    let winningTeamName = "Nadie";
    let winningTeamObj: any = null;
    let topCyclistName = "";
    let topCyclistPoints = 0;
    
    teamStagePoints.forEach((teamPoints: any) => {
      const pts = teamPoints.pointsByCol[col.formatted] || 0;
      if (pts > maxPoints) {
        maxPoints = pts;
        winningTeamName = getTeamLabel(teamPoints);
        winningTeamObj = teamPoints;

        // Extract top cyclist from pointsDetailByCol
        const details = teamPoints.pointsDetailByCol?.[col.formatted];
        if (details && details.length > 0) {
          const cName = details[0].ciclista || "";
          const cyclistObj = raceCyclists.find((rc: any) => {
            const rcName = (rc.nombre || rc.ciclista || "").trim().toLowerCase();
            const detailsName = cName.trim().toLowerCase();
            return rcName === detailsName || rcName.includes(detailsName) || detailsName.includes(rcName);
          });
          const rondaStr = cyclistObj?.ronda || "Libre";
          topCyclistName = `${cName} <${rondaStr}>`;
          topCyclistPoints = details[0].puntos;
        } else {
          topCyclistName = "";
          topCyclistPoints = 0;
        }
      }
    });

    return {
      colName: col.formatted,
      colKey: col.formatted,
      maxPoints,
      winnerTeam: winningTeamName,
      winnerTeamObj: winningTeamObj,
      topCyclistName,
      topCyclistPoints
    };
  }).filter((s) => s.maxPoints > 0);

  // Helper to format cyclist ALWAYS as Ciclista <Ronda> (Equipo)
  const getCyclistLabel = (c: any) => {
    if (!c) return "N/A";
    const name = c.nombre || c.ciclista || "N/A";
    const rondaStr = c.ronda || "Libre";
    const teamName = c.equipo || c.jugador || c.manager || "Libre";
    
    // Find player order from leaderboard
    const p = leaderboard?.find((p: any) => p.nombreEquipo === teamName || p.jugador === teamName);
    const orderStr = p?.orden || c.orden;
    const teamFormatted = orderStr ? `${teamName} [#${orderStr}]` : teamName;
    
    return `${name} <${rondaStr}> (${teamFormatted})`;
  };

  // Advanced calculations for streaks, drought, never scored, and draft performance
  const stageCols = finalColumns.filter((col: any) => /^\d+[a-zA-Z]?(\s*\(CRE\))?$/.test(col.formatted));
  
  // 1. Teams that scored in all stages
  const teamsScoredAllStages = teamStagePoints.filter((team: any) => {
    if (stageCols.length === 0) return false;
    return stageCols.every((col: any) => (team.pointsByCol[col.formatted] || 0) > 0);
  });

  // 2. Longest scoring streak
  const teamsStreak = teamStagePoints.map((team: any) => {
    let maxStreak = 0;
    let currentStreak = 0;
    stageCols.forEach((col: any) => {
      const pts = team.pointsByCol[col.formatted] || 0;
      if (pts > 0) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });
    return { team, maxStreak };
  });
  const maxStreakVal = stageCols.length > 0 ? Math.max(...teamsStreak.map(t => t.maxStreak), 0) : 0;
  const teamsWithMaxStreak = maxStreakVal > 0 ? teamsStreak.filter(t => t.maxStreak === maxStreakVal).map(t => t.team) : [];

  // 3. Longest active scoring streak (consecutive stages with points > 0 ending at the last stage backward)
  const teamsActiveStreak = teamStagePoints.map((team: any) => {
    let activeStreak = 0;
    for (let i = stageCols.length - 1; i >= 0; i--) {
      const col = stageCols[i];
      const pts = team.pointsByCol[col.formatted] || 0;
      if (pts > 0) {
        activeStreak++;
      } else {
        break;
      }
    }
    return { team, activeStreak };
  });
  const maxActiveStreakVal = stageCols.length > 0 ? Math.max(...teamsActiveStreak.map(t => t.activeStreak), 0) : 0;
  const teamsWithMaxActiveStreak = maxActiveStreakVal > 0 ? teamsActiveStreak.filter(t => t.activeStreak === maxActiveStreakVal).map(t => t.team) : [];

  // 4. Teams that never scored in any stage
  const teamsNeverScored = teamStagePoints.filter((team: any) => {
    if (stageCols.length === 0) return false;
    return stageCols.every((col: any) => (team.pointsByCol[col.formatted] || 0) === 0);
  });

  // 5. Longest active scoring drought (consecutive zeros from the last stage backwards), EXCLUDING those who never scored!
  const teamsDrought = teamStagePoints.map((team: any) => {
    let drought = 0;
    for (let i = stageCols.length - 1; i >= 0; i--) {
      const col = stageCols[i];
      const pts = team.pointsByCol[col.formatted] || 0;
      if (pts === 0) {
        drought++;
      } else {
        break;
      }
    }
    return { team, drought };
  });
  const droughtFiltered = teamsDrought.filter((item) => {
    return !teamsNeverScored.some((ns) => (ns.jugador || ns.nombreEquipo) === (item.team.jugador || item.team.nombreEquipo));
  });
  const maxDroughtVal = stageCols.length > 0 && droughtFiltered.length > 0 ? Math.max(...droughtFiltered.map(t => t.drought), 0) : 0;
  const teamsWithMaxDrought = maxDroughtVal > 0 ? droughtFiltered.filter(t => t.drought === maxDroughtVal).map(t => t.team) : [];

  // 6. Cyclist performance draft: low round (Rondas 1-3) but scored low points (Fiascos/Desilusiones)
  const getRondaNum = (r: string) => {
    if (!r) return 99;
    const clean = r.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 99;
  };

  const earlyDraftLowScores = [...raceCyclists]
    .filter((c: any) => {
      const roundNum = getRondaNum(c.ronda);
      return roundNum >= 1 && roundNum <= 3;
    })
    .sort((a: any, b: any) => (a.puntos || 0) - (b.puntos || 0));

  // 7. Cyclist performance draft: late round (Rondas 6+ or Libre) but scored high points (Chollos/Robos)
  const lateDraftHighScores = [...raceCyclists]
    .filter((c: any) => {
      const roundNum = getRondaNum(c.ronda);
      return roundNum >= 6 && roundNum <= 99;
    })
    .sort((a: any, b: any) => (b.puntos || 0) - (a.puntos || 0));

  // Copy to clipboard handler
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copiado al portapapeles correctamente");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Error al copiar al portapapeles");
    }
  };

  const handleCopyInfographic = async () => {
    if (!infographicRef.current || isCopyingInfographic) return;
    setIsCopyingInfographic(true);
    toast.info("Generando imagen de la infografía...");
    
    // Slight delay to ensure rendering is settled
    await new Promise((resolve) => setTimeout(resolve, 350));
    
    try {
      const el = infographicRef.current;
      const width = el.offsetWidth || 1000;
      const height = el.offsetHeight || 800;
      
      const dataUrl = await domToDataUrl(el, {
        scale: 2.5, // Crisp high-res export
        backgroundColor: '#020617', // Slate 950 color matches the background
        style: { overflow: "visible" },
        width,
        height,
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const safeName = `infografia-${selectedRace.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      await copyImageToClipboard(Promise.resolve(blob), safeName);
    } catch (err) {
      console.error(err);
      toast.error("Error al copiar la infografía al portapapeles");
    } finally {
      setIsCopyingInfographic(false);
    }
  };

  const handleDownloadInfographic = async () => {
    if (!infographicRef.current || isDownloadingInfographic) return;
    setIsDownloadingInfographic(true);
    toast.info("Preparando descarga de infografía...");
    
    await new Promise((resolve) => setTimeout(resolve, 350));
    
    try {
      const el = infographicRef.current;
      const width = el.offsetWidth || 1000;
      const height = el.offsetHeight || 800;
      
      const dataUrl = await domToDataUrl(el, {
        scale: 2.5,
        backgroundColor: '#020617',
        style: { overflow: "visible" },
        width,
        height,
      });
      
      const link = document.createElement("a");
      link.download = `infografia-${selectedRace.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Infografía descargada correctamente como PNG");
    } catch (err) {
      console.error(err);
      toast.error("Error al descargar la infografía");
    } finally {
      setIsDownloadingInfographic(false);
    }
  };

  // Generate AI narrative
  const handleGenerateNarrative = async () => {
    setIsGenerating(true);
    setErrorMsg("");
    setAiNarrative("");

    const teamsPayload = rankedTeams.map((t: any) => ({
      nombre: getTeamLabel(t),
      pos: t.pos,
      puntos: t.totalPoints,
      ciclistasScoredCount: t.details?.filter((d: any) => d.puntosObtenidos > 0).length || 0,
    }));

    const stagesPayload = stageWinnerSummary.map((s) => ({
      colName: s.colName,
      maxPoints: s.maxPoints,
      winnerTeam: s.winnerTeam,
    }));

    const retiredPayload = retiredCyclists.map((c: any) => ({
      ciclista: c.ciclista,
      team: c.equipo,
      status: c.status,
      stage: c.etapa || "N/A",
    }));

    const streaksAndStatsPayload = {
      puntuaronTodasEtapas: teamsScoredAllStages.map(t => getTeamLabel(t)),
      mejorRacha: {
        largo: maxStreakVal,
        equipos: teamsWithMaxStreak.map(t => getTeamLabel(t))
      },
      rachaActual: {
        largo: maxActiveStreakVal,
        equipos: teamsWithMaxActiveStreak.map(t => getTeamLabel(t))
      },
      nuncaPuntuaron: teamsNeverScored.map(t => getTeamLabel(t)),
      peorSequiaActual: {
        largo: maxDroughtVal,
        equipos: teamsWithMaxDrought.map(t => getTeamLabel(t))
      }
    };

    const draftPicksPayload = {
      earlyLowScores: earlyDraftLowScores.slice(0, 4).map(c => ({
        ciclista: c.ciclista,
        ronda: c.ronda,
        puntos: c.puntos,
        manager: c.jugador
      })),
      lateHighScores: lateDraftHighScores.slice(0, 4).map(c => ({
        ciclista: c.ciclista,
        ronda: c.ronda,
        puntos: c.puntos,
        manager: c.jugador
      }))
    };

    try {
      const response = await fetch("/api/generate-narrative", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raceName: selectedRace,
          teamsData: teamsPayload,
          stagesData: stagesPayload,
          retiredData: retiredPayload,
          streaksAndStatsData: streaksAndStatsPayload,
          draftPicksData: draftPicksPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar la narrativa");
      }

      setAiNarrative(data.narrative);
      toast.success("¡Crónica de la carrera generada con éxito por la IA!");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "No se pudo conectar con el servidor para generar la crónica con IA.");
      toast.error("Error al conectar con el servidor de IA");
    } finally {
      setIsGenerating(false);
    }
  };

  // Simple and highly effective custom markdown parser to render in Tailwind nicely
  const renderMarkdown = (md: string) => {
    if (!md) return null;
    
    const lines = md.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-2xl md:text-3xl font-extrabold text-neutral-900 mt-6 mb-4 leading-tight">{line.substring(2)}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-xl md:text-2xl font-bold text-neutral-800 mt-5 mb-3 border-b border-neutral-100 pb-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-lg font-bold text-neutral-800 mt-4 mb-2">{line.substring(4)}</h3>;
      }
      
      // Lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        // Parse simple inline bolding
        const content = line.substring(2);
        return (
          <li key={idx} className="ml-5 list-disc text-neutral-600 mb-2 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }

      // Empty space
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }

      // Normal paragraph
      return (
        <p key={idx} className="text-neutral-600 mb-3 leading-relaxed text-sm md:text-base">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  // Helper to parse simple bold text e.g. **text**
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-neutral-900">{part}</strong> : part);
  };

  return (
    <div id="race-report-analysis" className="bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold tracking-wider uppercase mb-1">
            <FileText className="w-4 h-4" />
            Análisis de Rendimiento
          </div>
          <h3 className="text-xl md:text-2xl font-black text-neutral-900">
            Crónica y Análisis del Reporte
          </h3>
          <p className="text-neutral-500 text-xs md:text-sm mt-0.5">
            Evaluación dinámica de la clasificación de equipos, conceptos clave y abandonos de {selectedRace}.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-neutral-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("auto")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
              activeTab === "auto"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Análisis de Datos
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
              activeTab === "ai"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Crónica con IA
          </button>
          <button
            onClick={() => setActiveTab("infographic")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
              activeTab === "infographic"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Image className="w-4 h-4 text-purple-500" />
            Infografía
          </button>
        </div>
      </div>

      {/* AUTO TAB */}
      {activeTab === "auto" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {!isFinished && (
            <div className="flex items-start gap-3 bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl text-xs md:text-sm text-amber-800 shadow-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold text-amber-900 block">Carrera en Curso</strong>
                <p className="mt-0.5 leading-relaxed text-neutral-600">
                  Este reporte corresponde a una carrera que aún no ha concluido oficialmente. Todos los datos, estadísticas, estrellas de la carrera y análisis mostrados a continuación son provisionales y se actualizarán dinámicamente según se registren nuevos resultados.
                </p>
              </div>
            </div>
          )}

          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-neutral-400 text-xs font-semibold uppercase">Puntos Totales Repartidos</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-neutral-900">{totalPointsAwarded}</span>
                <span className="text-xs text-neutral-500 font-medium">pts</span>
              </div>
              <span className="text-neutral-400 text-[10px] mt-1">Promedio de {avgPointsPerTeam} pts por equipo</span>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-blue-600 text-xs font-semibold uppercase">
                  {isFinished ? "Equipo Ganador" : "Líder Provisional"}
                </span>
                <Award className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm md:text-base font-extrabold text-blue-900 block truncate">{getTeamLabel(winnerTeam)}</span>
                <span className="text-xs text-blue-700 font-medium mt-1 block">{winnerTeam?.totalPoints || 0} puntos</span>
              </div>
            </div>

            <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-red-600 text-xs font-semibold uppercase">Golpeado por Abandonos</span>
                <UserX className="w-4 h-4 text-red-500" />
              </div>
              <div className="mt-2">
                <span className="text-sm md:text-base font-extrabold text-red-900 block truncate">{mostRetiredTeam}</span>
                <span className="text-xs text-red-700 font-medium mt-1 block">{mostRetiredCount || 0} abandonos</span>
              </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-amber-700 text-xs font-semibold uppercase">Ciclistas Retirados</span>
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-extrabold text-amber-950">{retiredCyclists.length}</span>
                <span className="text-xs text-amber-700 font-medium mt-1 block">Rendimiento mermado</span>
              </div>
            </div>
          </div>

          {/* Deep Analytical Insight Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Narrative Block */}
            <div className="lg:col-span-8 space-y-6">
              {/* Classification Summary */}
              <div className="space-y-2">
                <h4 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  {isFinished ? "Clasificación de Equipos & Batalla de Managers" : "Clasificación Provisional & Batalla de Managers"}
                </h4>
                <div className="text-neutral-600 text-sm leading-relaxed space-y-3">
                  {isFinished ? (
                    <p>
                      La victoria de la carrera se la adjudica el manager de <strong className="text-neutral-950">{getTeamLabel(winnerTeam)}</strong> logrando un imponente puntaje acumulado de <strong className="text-neutral-950">{winnerTeam?.totalPoints || 0} puntos</strong>. 
                      {runnerUpTeam && (
                        <span>
                          {" "}Superando a <strong className="text-neutral-950">{getTeamLabel(runnerUpTeam)}</strong> (quien finaliza en segundo lugar con {runnerUpTeam.totalPoints} puntos) por una diferencia de <strong className="text-blue-600 font-bold">{winnerTeam.totalPoints - runnerUpTeam.totalPoints} puntos</strong>, marcando el ritmo estratégico de este reporte.
                        </span>
                      )}
                      {thirdPlaceTeam && (
                        <span>
                          {" "}Completando el podio se sitúa <strong className="text-neutral-950">{getTeamLabel(thirdPlaceTeam)}</strong> con {thirdPlaceTeam.totalPoints} puntos.
                        </span>
                      )}
                    </p>
                  ) : (
                    <p>
                      La carrera se encuentra actualmente <strong className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200/50 inline-block align-middle">En Curso</strong>. 
                      Lidera provisionalmente la clasificación el manager de <strong className="text-neutral-950">{getTeamLabel(winnerTeam)}</strong> con un puntaje acumulado de <strong className="text-neutral-950">{winnerTeam?.totalPoints || 0} puntos</strong>.
                      {runnerUpTeam && (
                        <span>
                          {" "}Seguido muy de cerca por <strong className="text-neutral-950">{getTeamLabel(runnerUpTeam)}</strong> (quien marcha en segundo lugar con {runnerUpTeam.totalPoints} puntos) con una diferencia provisional de <strong className="text-blue-600 font-bold">{winnerTeam.totalPoints - runnerUpTeam.totalPoints} puntos</strong>.
                        </span>
                      )}
                      {thirdPlaceTeam && (
                        <span>
                          {" "}En tercera posición provisional se encuentra <strong className="text-neutral-950">{getTeamLabel(thirdPlaceTeam)}</strong> con {thirdPlaceTeam.totalPoints} puntos.
                        </span>
                      )}
                    </p>
                  )}
                  <p>
                    El rendimiento de los líderes se sustenta en su alta efectividad y en esquivar con éxito las temidas caídas y descalificaciones. Los managers del podio demostraron una soberbia composición de filas en este evento.
                  </p>
                </div>
              </div>

              {/* Stage & Concept Summary */}
              <div className="space-y-2">
                <h4 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Clasificación por Etapas y Conceptos Especiales
                </h4>
                <div className="text-neutral-600 text-sm leading-relaxed space-y-3">
                  <p>
                    Un pilar clave para el desenlace ha sido el reparto de puntos a través de las diferentes etapas y conceptos puntuados en este reporte ({finalColumns.length} columnas en total). 
                    {stageWinnerSummary.length > 0 ? (
                      <span> Los managers que lograron copar los máximos puntajes individuales de cada columna aceleraron notablemente sus opciones. Por ejemplo:</span>
                    ) : (
                      <span> No se registran picos aislados dominantes en este reparto, mostrando un comportamiento muy coral.</span>
                    )}
                  </p>
                  {stageWinnerSummary.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {stageWinnerSummary.slice(0, 4).map((s, i) => (
                        <div key={i} className="bg-neutral-50 border border-neutral-100 p-3 rounded-xl flex items-start gap-2.5 text-xs">
                          <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-neutral-800 block truncate">{s.colName}</span>
                            <span className="text-neutral-500 block">Máximo: <strong className="text-neutral-700">{s.maxPoints} pts</strong></span>
                            <span className="text-neutral-400 block truncate text-xs">Logrado por: {s.winnerTeam}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Consistencia & Rachas de Mánagers */}
              <div className="space-y-2">
                <h4 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Consistencia & Rachas de Mánagers (Etapas)
                </h4>
                <div className="text-neutral-600 text-sm leading-relaxed space-y-3">
                  <p>
                    La regularidad en todas las etapas marca la diferencia entre un gran estratega y la mediocridad. Al analizar las puntuaciones obtenidas en las {stageCols.length} etapas disputadas de este reporte, observamos patrones de consistencia muy definidos:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-2">
                    {/* Puntuó en todas */}
                    <div className="bg-emerald-50/40 border border-emerald-100 p-3 rounded-xl text-xs space-y-1">
                      <div className="font-extrabold text-emerald-800 flex items-center gap-1 uppercase tracking-wider text-[9px]">
                        <Layers className="w-3 h-3 text-emerald-600" />
                        Puntuó en Todas
                      </div>
                      <div className="text-neutral-800 font-bold mt-1 text-xs truncate" title={teamsScoredAllStages.length > 0 ? teamsScoredAllStages.map(t => getTeamLabel(t)).join(", ") : "Ninguno"}>
                        {teamsScoredAllStages.length > 0 ? (
                          teamsScoredAllStages.map(t => getTeamLabel(t)).join(", ")
                        ) : (
                          <span className="text-neutral-500 font-medium">Ninguno</span>
                        )}
                      </div>
                      <p className="text-neutral-500 text-[9px] leading-tight mt-0.5">Suma puntos en todas las etapas disputadas.</p>
                    </div>

                    {/* Mayor racha sumando */}
                    <div className="bg-blue-50/40 border border-blue-100 p-3 rounded-xl text-xs space-y-1">
                      <div className="font-extrabold text-blue-800 flex items-center gap-1 uppercase tracking-wider text-[9px]">
                        <Flame className="w-3 h-3 text-blue-600" />
                        Mayor Racha Sumando
                      </div>
                      <div className="text-neutral-800 font-bold mt-1 text-xs truncate" title={maxStreakVal > 0 ? `${teamsWithMaxStreak.map(t => getTeamLabel(t)).join(", ")} (${maxStreakVal} et.)` : "N/A"}>
                        {maxStreakVal > 0 ? (
                          <span>
                            {teamsWithMaxStreak.map(t => getTeamLabel(t)).join(", ")}{" "}
                            <span className="text-[10px] font-normal text-blue-600">({maxStreakVal} et.)</span>
                          </span>
                        ) : (
                          <span className="text-neutral-500 font-medium">N/A</span>
                        )}
                      </div>
                      <p className="text-neutral-500 text-[9px] leading-tight mt-0.5">Racha histórica consecutiva sumando puntos.</p>
                    </div>

                    {/* Mayor racha actual */}
                    <div className="bg-cyan-50/40 border border-cyan-100 p-3 rounded-xl text-xs space-y-1">
                      <div className="font-extrabold text-cyan-800 flex items-center gap-1 uppercase tracking-wider text-[9px]">
                        <Zap className="w-3 h-3 text-cyan-600" />
                        Mayor Racha Actual
                      </div>
                      <div className="text-neutral-800 font-bold mt-1 text-xs truncate" title={maxActiveStreakVal > 0 ? `${teamsWithMaxActiveStreak.map(t => getTeamLabel(t)).join(", ")} (${maxActiveStreakVal} et.)` : "Ninguna"}>
                        {maxActiveStreakVal > 0 ? (
                          <span>
                            {teamsWithMaxActiveStreak.map(t => getTeamLabel(t)).join(", ")}{" "}
                            <span className="text-[10px] font-normal text-cyan-600">({maxActiveStreakVal} et.)</span>
                          </span>
                        ) : (
                          <span className="text-neutral-500 font-medium">Ninguna</span>
                        )}
                      </div>
                      <p className="text-neutral-500 text-[9px] leading-tight mt-0.5">Racha consecutiva sumando puntos activa hasta hoy.</p>
                    </div>

                    {/* Sin puntuar jamás */}
                    <div className="bg-red-50/40 border border-red-100 p-3 rounded-xl text-xs space-y-1">
                      <div className="font-extrabold text-red-800 flex items-center gap-1 uppercase tracking-wider text-[9px]">
                        <UserX className="w-3 h-3 text-red-600" />
                        Sin Puntuar Jamás
                      </div>
                      <div className="text-neutral-800 font-bold mt-1 text-xs truncate" title={teamsNeverScored.length > 0 ? teamsNeverScored.map(t => getTeamLabel(t)).join(", ") : "Ninguno"}>
                        {teamsNeverScored.length > 0 ? (
                          teamsNeverScored.map(t => getTeamLabel(t)).join(", ")
                        ) : (
                          <span className="text-neutral-500 font-medium">Ninguno</span>
                        )}
                      </div>
                      <p className="text-neutral-500 text-[9px] leading-tight mt-0.5">Mánagers que no han puntuado en ninguna de las etapas.</p>
                    </div>

                    {/* Mayor sequía actual */}
                    <div className="bg-amber-50/40 border border-amber-100 p-3 rounded-xl text-xs space-y-1">
                      <div className="font-extrabold text-amber-800 flex items-center gap-1 uppercase tracking-wider text-[9px]">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        Mayor Sequía Actual
                      </div>
                      <div className="text-neutral-800 font-bold mt-1 text-xs truncate" title={maxDroughtVal > 0 ? `${teamsWithMaxDrought.map(t => getTeamLabel(t)).join(", ")} (${maxDroughtVal} et.)` : "Ninguna"}>
                        {maxDroughtVal > 0 ? (
                          <span>
                            {teamsWithMaxDrought.map(t => getTeamLabel(t)).join(", ")}{" "}
                            <span className="text-[10px] font-normal text-amber-600">({maxDroughtVal} et.)</span>
                          </span>
                        ) : (
                          <span className="text-neutral-500 font-medium">Ninguna</span>
                        )}
                      </div>
                      <p className="text-neutral-500 text-[9px] leading-tight mt-0.5">Etapas consecutivas sin sumar activas hoy (excluye sin puntuar).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rendimiento del Draft: Aciertos y Decepciones */}
              <div className="space-y-2">
                <h4 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Rendimiento del Draft: Aciertos de Oro vs. Bajo Retorno
                </h4>
                <div className="text-neutral-600 text-sm leading-relaxed space-y-3">
                  <p>
                    El draft define el éxito en el fantasy. Analizamos los aciertos de bajo coste (chollos) y las elecciones tempranas de rondas altas que no han devuelto el rendimiento esperado en esta carrera:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {/* Chollos */}
                    <div className="bg-purple-50/30 border border-purple-100 p-4 rounded-2xl text-xs space-y-2">
                      <div className="font-extrabold text-purple-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <Crown className="w-3.5 h-3.5 text-purple-600" />
                        Chollos del Draft (Rondas 6+ o Libres)
                      </div>
                      {lateDraftHighScores.length > 0 && lateDraftHighScores.filter(c => c.puntos > 0).length > 0 ? (
                        <div className="space-y-2">
                          {lateDraftHighScores.filter(c => c.puntos > 0).slice(0, 3).map((c: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between bg-white border border-purple-100/50 p-2 rounded-xl shadow-sm">
                              <div className="truncate pr-2">
                                <span className="font-bold text-neutral-800 block truncate" title={getCyclistLabel(c)}>{getCyclistLabel(c)}</span>
                              </div>
                               <span className="font-black text-purple-700 bg-purple-50 px-2 py-1 rounded text-xs shrink-0">+{c.puntos} pts</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-neutral-500 text-center py-4">No se registran chollos puntuando en este rango.</div>
                      )}
                      <p className="text-neutral-500 text-[10px] leading-tight">Ciclistas elegidos tarde (ronda tardía) que aportan gran volumen de puntos.</p>
                    </div>

                    {/* Fiascos */}
                    <div className="bg-red-50/10 border border-red-100/50 p-4 rounded-2xl text-xs space-y-2">
                      <div className="font-extrabold text-red-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <UserX className="w-3.5 h-3.5 text-red-600" />
                        Bajo Retorno de Inversión (Rondas 1-3)
                      </div>
                      {earlyDraftLowScores.length > 0 ? (
                        <div className="space-y-2">
                          {earlyDraftLowScores.slice(0, 3).map((c: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between bg-white border border-red-100/40 p-2 rounded-xl shadow-sm">
                              <div className="truncate pr-2">
                                <span className="font-bold text-neutral-800 block truncate" title={getCyclistLabel(c)}>{getCyclistLabel(c)}</span>
                              </div>
                              <span className="font-black text-red-600 bg-red-50 px-2 py-1 rounded text-xs shrink-0">{c.puntos || 0} pts</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-neutral-500 text-center py-4">No se registran elecciones en rondas 1-3.</div>
                      )}
                      <p className="text-neutral-500 text-[10px] leading-tight">Ciclistas estrella seleccionados temprano que no sumaron o aportaron un puntaje bajo.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retired Riders Impact */}
              <div className="space-y-2">
                <h4 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Impacto Crítico de los Ciclistas Retirados
                </h4>
                <div className="text-neutral-600 text-sm leading-relaxed space-y-3">
                  {retiredCyclists.length > 0 ? (
                    <>
                      <p>
                        Un total de <strong className="text-red-600 font-bold">{retiredCyclists.length} corredores</strong> se vieron forzados a abandonar el pelotón debido a percances, enfermedades o fuera de control (status {Array.from(new Set(retiredCyclists.map((c: any) => c.status))).join(", ")}). 
                        Estos incidentes debilitaron profundamente la estructura táctica de varias plantillas.
                      </p>
                      <p>
                        El equipo más mermado en profundidad de plantel fue <strong className="text-neutral-900">{mostRetiredTeam}</strong>, registrando <strong className="text-red-600 font-bold">{mostRetiredCount} bajas</strong> en este reporte. 
                        Este escenario de desgaste resulta devastador para la consistencia y exigirá movimientos ágiles en futuros drafts o planificaciones.
                      </p>
                    </>
                  ) : (
                    <p>
                      ¡Excelente noticia para el pelotón! No se ha registrado ningún ciclista retirado (DNF/DNS/DSQ) entre los corredores elegidos por los managers en este reporte. La carrera transcurrió de forma limpia permitiendo a todas las plantillas exprimir sus recursos a pleno rendimiento de principio a fin.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar stats */}
            <div className="lg:col-span-4 bg-neutral-50 border border-neutral-150 p-5 rounded-2xl space-y-5 h-fit">
              <div>
                <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-3">
                  Estrellas de la Carrera
                </h4>
                {topCyclists.length > 0 ? (
                  <div className="space-y-3">
                    {topCyclists.map((c: any, index: number) => (
                      <div key={index} className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-neutral-100 shadow-sm text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-5 h-5 flex items-center justify-center rounded-full font-bold text-[10px] ${
                            index === 0 ? "bg-amber-100 text-amber-700" :
                            index === 1 ? "bg-neutral-200 text-neutral-700" :
                            index === 2 ? "bg-orange-100 text-orange-700" :
                            "bg-neutral-100 text-neutral-500"
                          }`}>
                            {index + 1}
                          </span>
                          <span className="font-semibold text-neutral-800 truncate" title={getCyclistLabel(c)}>
                            {getCyclistLabel(c)}
                          </span>
                        </div>
                        <span className="font-bold text-blue-600 shrink-0">{c.puntos || 0} pts</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-xs">No hay datos de rendimiento individual de ciclistas.</p>
                )}
              </div>

              {retiredCyclists.length > 0 && (
                <div className="border-t border-neutral-200/60 pt-4">
                  <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Abandonos por Manager</span>
                    <span className="text-[10px] font-medium text-neutral-400 normal-case">(Orden descendente)</span>
                  </h4>
                  <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold">
                          <th className="p-2 pl-3">Manager</th>
                          <th className="p-2 text-right pr-3">Abandonos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-150">
                        {sortedRetiredTeams.map((item, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="p-2 pl-3 font-medium text-neutral-700 truncate max-w-[130px]" title={item.team}>
                              {item.team}
                            </td>
                            <td className="p-2 text-right pr-3 font-bold text-red-600 bg-red-50/20">
                              {item.count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI TAB */}
      {activeTab === "ai" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {aiNarrative ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span className="text-xs md:text-sm text-amber-900 font-semibold">Crónica generada por Inteligencia Artificial</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(aiNarrative)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 text-xs text-neutral-700 font-bold transition shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                  <button
                    onClick={handleGenerateNarrative}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerar
                  </button>
                </div>
              </div>

              {/* Render Narrative Content */}
              <div className="bg-neutral-50 border border-neutral-150 p-6 md:p-8 rounded-3xl max-h-[500px] overflow-y-auto shadow-inner text-neutral-800 prose prose-neutral max-w-none prose-sm md:prose-base">
                {renderMarkdown(aiNarrative)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50 space-y-4">
              {isGenerating ? (
                <div className="space-y-4 py-4">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <Sparkles className="w-5 h-5 text-amber-500 absolute animate-bounce" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-neutral-800 text-base">Redactando Crónica con IA...</h5>
                    <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                      Analizando la clasificación de los managers, recopilando los puntos por etapa e interpretando el drama de los abandonos de la carrera.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-amber-100 p-4 rounded-full">
                    <Sparkles className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="max-w-md">
                    <h4 className="font-extrabold text-neutral-900 text-lg">Crónica Narrativa Periodística con IA</h4>
                    <p className="text-neutral-500 text-sm mt-1">
                      Genera un artículo de opinión y análisis periodístico completo de la carrera utilizando Gemini. Narrará la batalla de puntos entre managers, destacará los vencedores por etapa y analizará el impacto de las retiradas de ciclistas.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 p-4 rounded-2xl max-w-lg text-left text-xs text-red-800">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-red-900 mb-1">No se pudo generar la crónica</span>
                        <p className="leading-relaxed">{errorMsg}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGenerateNarrative}
                    className="flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl transition shadow-md hover:shadow-lg text-sm"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Generar Crónica Periodística
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* INFOGRAPHIC TAB */}
      {activeTab === "infographic" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
            <div className="text-left">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-purple-600" />
                Infografía de Rendimiento Visual
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                Hemos diseñado un póster de estadísticas premium optimizado para compartir en grupos de WhatsApp o redes sociales. Usa el botón de copiar para enviarla directamente o descargarla en alta definición.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyInfographic}
                disabled={isCopyingInfographic}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
              >
                {isCopyingInfographic ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {isCopyingInfographic ? "Generando..." : "Copiar Imagen"}
              </button>
              <button
                onClick={handleDownloadInfographic}
                disabled={isDownloadingInfographic}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
              >
                {isDownloadingInfographic ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {isDownloadingInfographic ? "Descargando..." : "Descargar PNG"}
              </button>
            </div>
          </div>

          {/* Infographic Container */}
          <div className="w-full rounded-3xl border border-slate-200 shadow-md">
            <div 
              id="race-infographic-export" 
              ref={infographicRef} 
              className="w-full bg-slate-950 text-slate-100 p-8 font-sans relative flex flex-col gap-6 select-none"
              style={{ minHeight: "650px" }}
            >
              {/* Background Decorative Accents (Pure CSS, won't block screenshot) */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

              {/* Header section */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                    <Layers className="w-3.5 h-3.5" />
                    Fantasy Cycling • Reporte Visual
                  </div>
                  <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
                    {selectedRace}
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">
                    Análisis estadístico oficial y rendimiento de managers
                  </p>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date().toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  {isFinished ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
                      Carrera Finalizada
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800/50 px-2.5 py-0.5 rounded-full animate-pulse">
                      Carrera en Curso
                    </span>
                  )}
                </div>
              </div>

              {/* Core Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/60 p-3 rounded-2xl text-center">
                  <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Puntos Totales</div>
                  <div className="text-xl font-black text-white mt-0.5">{totalPointsAwarded}</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/60 p-3 rounded-2xl text-center">
                  <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Managers</div>
                  <div className="text-xl font-black text-blue-400 mt-0.5">{totalTeams}</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/60 p-3 rounded-2xl text-center">
                  <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Media Puntos</div>
                  <div className="text-xl font-black text-purple-400 mt-0.5">{avgPointsPerTeam}</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/60 p-3 rounded-2xl text-center">
                  <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Abandonos Totales</div>
                  <div className="text-xl font-black text-red-500 mt-0.5">{retiredCyclists.length}</div>
                </div>
              </div>

              {/* Main Split Columns (Podium vs. Stars & Retires) */}
              <div className="grid grid-cols-12 gap-5 items-stretch">
                
                {/* Left side: Manager Battle & Podium (Col-span 7) */}
                <div className="col-span-7 bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      {isFinished ? "Podio Oficial de Managers" : "Clasificación Provisional de la Carrera"}
                    </h3>

                    {/* CSS Visual Podium */}
                    <div className="flex items-end justify-center gap-2 pt-4 pb-2">
                      
                      {/* 2nd Place (Silver) */}
                      {runnerUpTeam ? (
                        <div className="flex flex-col items-center w-1/3">
                          <span className="text-[10px] font-extrabold text-slate-300 mb-1 truncate w-full text-center" title={getTeamLabel(runnerUpTeam)}>
                            {getTeamLabel(runnerUpTeam)}
                          </span>
                          <span className="text-xs font-black text-slate-400 mb-2">{runnerUpTeam.totalPoints || 0} pts</span>
                          <div className="w-full h-24 bg-gradient-to-t from-slate-900 to-slate-800/80 border-t-2 border-slate-400 rounded-t-xl flex items-center justify-center shadow-lg">
                            <span className="text-lg font-black text-slate-400">2</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-1/3" />
                      )}

                      {/* 1st Place (Gold) */}
                      {winnerTeam ? (
                        <div className="flex flex-col items-center w-1/3 z-10 scale-105">
                          <Crown className="w-5 h-5 text-amber-400 mb-1 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-bounce" />
                          <span className="text-xs font-black text-amber-400 truncate w-full text-center" title={getTeamLabel(winnerTeam)}>
                            {getTeamLabel(winnerTeam)}
                          </span>
                          <span className="text-sm font-black text-white mb-2">{winnerTeam.totalPoints || 0} pts</span>
                          <div className="w-full h-32 bg-gradient-to-t from-amber-950/40 via-slate-900 to-slate-800/95 border-t-4 border-amber-500 rounded-t-xl flex items-center justify-center shadow-2xl relative">
                            <span className="text-2xl font-black text-amber-500">1</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-1/3" />
                      )}

                      {/* 3rd Place (Bronze) */}
                      {thirdPlaceTeam ? (
                        <div className="flex flex-col items-center w-1/3">
                          <span className="text-[10px] font-extrabold text-amber-700 mb-1 truncate w-full text-center" title={getTeamLabel(thirdPlaceTeam)}>
                            {getTeamLabel(thirdPlaceTeam)}
                          </span>
                          <span className="text-xs font-black text-amber-600 mb-2">{thirdPlaceTeam.totalPoints || 0} pts</span>
                          <div className="w-full h-20 bg-gradient-to-t from-slate-900 to-slate-800/80 border-t-2 border-amber-700 rounded-t-xl flex items-center justify-center shadow-lg">
                            <span className="text-base font-black text-amber-700">3</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-1/3" />
                      )}
                    </div>
                  </div>

                  {/* Visual list for other managers */}
                  {rankedTeams.length > 3 && (
                    <div className="border-t border-slate-800/80 pt-4 mt-3">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resto de Clasificación:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {rankedTeams.slice(3, 7).map((team: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-slate-900/30 px-2.5 py-1.5 rounded-lg border border-slate-800/40">
                            <span className="text-slate-300 font-medium truncate max-w-[130px]">{i + 4}º {getTeamLabel(team)}</span>
                            <span className="font-bold text-slate-400">{team.totalPoints || 0} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side: Star Cyclists (Col-span 5) */}
                <div className="col-span-5 flex flex-col gap-4">
                  
                  {/* Top Cyclists Block */}
                  <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 flex-1">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3.5 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Estrellas de la Carrera
                    </h3>

                    {topCyclists.length > 0 ? (
                      <div className="space-y-3.5">
                        {topCyclists.slice(0, 5).map((c: any, i: number) => {
                          const maxPts = topCyclists[0]?.puntos || 1;
                          const percentage = Math.max(12, Math.round(((c.puntos || 0) / maxPts) * 100));
                          
                          const name = c.ciclista || c.nombre || "N/A";
                          const rondaStr = c.ronda || "Libre";
                          const victoriasCount = c.victorias || 0;
                          
                          const teamName = c.equipo || c.jugador || c.manager || "Libre";
                          const p = leaderboard?.find((p: any) => p.nombreEquipo === teamName || p.jugador === teamName);
                          const orderStr = p?.orden || c.orden;
                          const teamFormatted = orderStr ? `${teamName} [#${orderStr}]` : teamName;

                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex items-start justify-between text-xs gap-3 w-full">
                                <div className="flex items-start gap-2 min-w-0 flex-1">
                                  <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-slate-800 text-[10px] font-bold text-slate-400 rounded-full mt-0.5">
                                    {i + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-slate-200 truncate" title={name}>
                                      {name} &lt;{rondaStr}&gt; - Victorias: {victoriasCount}
                                    </div>
                                    <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
                                      {teamFormatted}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-extrabold text-blue-400 whitespace-nowrap">{c.puntos || 0} pts</span>
                                </div>
                              </div>
                              {/* Custom graphic point representation bar */}
                              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No hay datos de ciclistas disponibles.
                      </div>
                    )}
                  </div>

                  {/* Mini-Bajas Block */}
                  <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                      <UserX className="w-4 h-4 text-red-500" />
                      Abandonos
                    </h3>
                    {retiredCyclists.length > 0 ? (
                      <div className="space-y-1.5 max-h-[110px] overflow-hidden">
                        {sortedRetiredTeams.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-red-950/10 border border-red-900/20 px-2.5 py-1 rounded-lg">
                            <span className="text-slate-300 font-medium truncate max-w-[160px]">{item.team}</span>
                            <span className="font-bold text-red-400 bg-red-950 px-1.5 py-0.5 rounded text-[10px] border border-red-900/40">
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-xs py-2 text-center font-medium">
                        ¡Fila intacta! Ningún manager ha registrado bajas.
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* ADVANCED STATS ROW */}
              <div className="grid grid-cols-12 gap-4">
                {/* Left card: Consistencia & Rachas */}
                <div className="col-span-12 md:col-span-7 bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Consistencia y Rachas de Mánagers
                    </h3>
                    <div className="space-y-2.5">
                      {/* Puntuó todas las etapas */}
                      <div className="flex justify-between items-start text-xs border-b border-slate-800/50 pb-1.5">
                        <span className="text-slate-400">Puntuó en todas:</span>
                        <span className="font-extrabold text-right text-emerald-400 max-w-[280px] truncate" title={teamsScoredAllStages.length > 0 ? teamsScoredAllStages.map(t => getTeamLabel(t)).join(", ") : "Ninguno"}>
                          {teamsScoredAllStages.length > 0 
                            ? teamsScoredAllStages.map(t => getTeamLabel(t)).join(", ") 
                            : "Ninguno"}
                        </span>
                      </div>
                      
                      {/* Mejor racha */}
                      <div className="flex justify-between items-center text-xs border-b border-slate-800/50 pb-1.5">
                        <span className="text-slate-400">Mayor racha sumando:</span>
                        <span className="font-extrabold text-blue-400 text-right truncate max-w-[280px]" title={maxStreakVal > 0 ? `${teamsWithMaxStreak.map(t => getTeamLabel(t)).join(", ")} (${maxStreakVal} etapas de racha)` : "N/A"}>
                          {maxStreakVal > 0 
                            ? `${teamsWithMaxStreak.map(t => getTeamLabel(t)).join(", ")} (${maxStreakVal} etapas de racha)` 
                            : "N/A"}
                        </span>
                      </div>

                      {/* Mayor racha actual */}
                      <div className="flex justify-between items-center text-xs border-b border-slate-800/50 pb-1.5">
                        <span className="text-slate-400">Mayor racha actual:</span>
                        <span className="font-extrabold text-cyan-400 text-right truncate max-w-[280px]" title={maxActiveStreakVal > 0 ? `${teamsWithMaxActiveStreak.map(t => getTeamLabel(t)).join(", ")} (${maxActiveStreakVal} etapas seguidas)` : "Ninguna"}>
                          {maxActiveStreakVal > 0 
                            ? `${teamsWithMaxActiveStreak.map(t => getTeamLabel(t)).join(", ")} (${maxActiveStreakVal} etapas seguidas)` 
                            : "Ninguna"}
                        </span>
                      </div>

                      {/* Sin puntuar jamás */}
                      <div className="flex justify-between items-center text-xs border-b border-slate-800/50 pb-1.5">
                        <span className="text-slate-400">Sin puntuar jamás:</span>
                        <span className="font-extrabold text-red-400 text-right max-w-[280px] truncate" title={teamsNeverScored.length > 0 ? teamsNeverScored.map(t => getTeamLabel(t)).join(", ") : "Ninguno"}>
                          {teamsNeverScored.length > 0 
                            ? teamsNeverScored.map(t => getTeamLabel(t)).join(", ") 
                            : "Ninguno"}
                        </span>
                      </div>

                      {/* Mayor sequía actual */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Mayor sequía actual:</span>
                        <span className="font-extrabold text-amber-500 text-right truncate max-w-[280px]" title={maxDroughtVal > 0 ? `${teamsWithMaxDrought.map(t => getTeamLabel(t)).join(", ")} (${maxDroughtVal} etapas de sequía)` : "Ninguna"}>
                          {maxDroughtVal > 0 
                            ? `${teamsWithMaxDrought.map(t => getTeamLabel(t)).join(", ")} (${maxDroughtVal} etapas de sequía)` 
                            : "Ninguna"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right card: Rentabilidad del Draft */}
                <div className="col-span-12 md:col-span-5 bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-purple-400" />
                      Rentabilidad de Fichajes (Draft)
                    </h3>
                    <div className="space-y-2.5">
                      {/* Chollos */}
                      <div className="space-y-1">
                        <div className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">
                          Chollo del Draft (R. Tardía / Libre):
                        </div>
                        {lateDraftHighScores.length > 0 && lateDraftHighScores.filter(c => c.puntos > 0).length > 0 ? (() => {
                          const c = lateDraftHighScores.filter(c => c.puntos > 0)[0];
                          const name = c.nombre || c.ciclista || "N/A";
                          const rondaStr = c.ronda || "Libre";
                          const teamName = c.equipo || c.jugador || c.manager || "Libre";
                          const p = leaderboard?.find((pl: any) => pl.nombreEquipo === teamName || pl.jugador === teamName);
                          const orderStr = p?.orden || c.orden;
                          const teamFormatted = orderStr ? `${teamName} [#${orderStr}]` : teamName;
                          return (
                            <div className="flex items-center justify-between text-xs bg-purple-950/20 border border-purple-900/30 px-2.5 py-1.5 rounded-xl">
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="font-bold text-slate-200 truncate">{name} &lt;{rondaStr}&gt;</div>
                                <div className="text-[11px] text-slate-300 font-semibold mt-0.5 truncate">{teamFormatted}</div>
                              </div>
                              <span className="font-black text-purple-400 shrink-0">
                                +{c.puntos} pts
                              </span>
                            </div>
                          );
                        })() : (
                          <div className="text-[10px] text-slate-500 italic">No hay registros</div>
                        )}
                      </div>

                      {/* Decepciones */}
                      <div className="space-y-1">
                        <div className="text-[9px] font-bold text-red-400 uppercase tracking-widest">
                          Bajo Retorno de Inversión (Rondas 1-3):
                        </div>
                        {earlyDraftLowScores.length > 0 ? (() => {
                          const c = earlyDraftLowScores[0];
                          const name = c.nombre || c.ciclista || "N/A";
                          const rondaStr = c.ronda || "Libre";
                          const teamName = c.equipo || c.jugador || c.manager || "Libre";
                          const p = leaderboard?.find((pl: any) => pl.nombreEquipo === teamName || pl.jugador === teamName);
                          const orderStr = p?.orden || c.orden;
                          const teamFormatted = orderStr ? `${teamName} [#${orderStr}]` : teamName;
                          return (
                            <div className="flex items-center justify-between text-xs bg-red-950/20 border border-red-900/30 px-2.5 py-1.5 rounded-xl">
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="font-bold text-slate-200 truncate">{name} &lt;{rondaStr}&gt;</div>
                                <div className="text-[11px] text-slate-300 font-semibold mt-0.5 truncate">{teamFormatted}</div>
                              </div>
                              <span className="font-black text-red-400 shrink-0">
                                {c.puntos || 0} pts
                              </span>
                            </div>
                          );
                        })() : (
                          <div className="text-[10px] text-slate-500 italic">No hay registros</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ganadores de etapas e hitos (Visual Descending Bar Chart) */}
              {stageWinnerSummary.length > 0 && (() => {
                const stageWinsByTeamMap: Record<string, { teamObj: any; label: string; count: number; wins: string[] }> = {};
                stageWinnerSummary.forEach((s) => {
                  if (s.winnerTeamObj) {
                    const label = getTeamLabel(s.winnerTeamObj);
                    if (!stageWinsByTeamMap[label]) {
                      stageWinsByTeamMap[label] = { teamObj: s.winnerTeamObj, label, count: 0, wins: [] };
                    }
                    stageWinsByTeamMap[label].count += 1;
                    stageWinsByTeamMap[label].wins.push(s.colName);
                  }
                });

                const sortedStageWins = Object.values(stageWinsByTeamMap)
                  .sort((a, b) => b.count - a.count);

                return (
                  <div className="bg-slate-900/20 border border-slate-800/40 rounded-2xl p-4">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Ganadores de etapas e hitos
                    </h3>
                    
                    {/* Gráfico de barras simplificado */}
                    <div className="space-y-1.5 mb-6">
                      {sortedStageWins.map((item, idx) => {
                        const maxWins = sortedStageWins[0]?.count || 1;
                        const pct = Math.max(10, Math.round((item.count / maxWins) * 100));
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-300 w-24 truncate" title={item.label}>{item.label}</span>
                            <div className="flex-1 h-3.5 bg-slate-950 rounded-sm overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-sm flex items-center px-1" 
                                style={{ width: `${pct}%` }}
                              >
                                <span className="text-[8px] font-black text-slate-900 leading-none">{item.count}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desglose por etapa */}
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 border-b border-slate-800/50 pb-1.5 mt-6">Desglose por Etapa</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                      {stageWinnerSummary.map((s, i) => (
                        <div key={i} className="flex flex-col justify-between bg-slate-950/40 border border-slate-800/50 rounded-lg p-2 relative overflow-hidden group hover:border-slate-700/50 transition-colors">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-slate-200 pr-1 whitespace-normal break-words">{s.colName}</span>
                            <span className="text-[9px] font-bold text-yellow-500 shrink-0 bg-yellow-500/10 px-1 rounded">{s.maxPoints} pts</span>
                          </div>
                          <div className="text-[9px] text-slate-300 font-semibold flex items-center gap-1 mb-1.5 whitespace-normal break-words">
                            <Crown className="w-2.5 h-2.5 text-yellow-500/70 shrink-0" />
                            <span className="whitespace-normal break-words">{s.winnerTeam}</span>
                          </div>
                          {s.topCyclistName ? (
                            <div className="text-[8px] text-slate-400 flex flex-col gap-0.5 border-t border-slate-800/60 pt-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-slate-300 whitespace-normal break-words" title={s.topCyclistName}>{s.topCyclistName}</span>
                                <span className="font-mono text-[8px] text-slate-500 shrink-0">{s.topCyclistPoints} pts</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[8px] text-slate-600 italic border-t border-slate-800/60 pt-1.5">Sin datos</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Footer Watermark */}
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 text-[9px] text-slate-500 font-medium">
                <div>Generado dinámicamente con AI Studio Fantasy Cycling</div>
                <div className="font-mono text-slate-600">ID: {selectedRace.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-report</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
