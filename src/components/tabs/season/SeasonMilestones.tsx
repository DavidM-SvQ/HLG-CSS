import React, { useMemo, useRef, useState } from "react";
import { formatNumberSpanish, getVal } from "../../../lib/data-processing";
import { Award, Trophy, Crown, Flag, Maximize2, Minimize2, Copy, Download, Globe, Users, Medal, CheckCircle2 } from "lucide-react";
import { expandNodeForCapture } from "../../../lib/dom-utils";
import { cn } from "../../../lib/utils";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";

export const SeasonMilestones = ({ leaderboard, files, cyclistMetadata, raceWinners }: { leaderboard: any[]; files: any; cyclistMetadata: any; raceWinners?: Record<string, string> }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleCopyImage, handleDownloadImage, isCopying } = useTableScreenshot(containerRef);

  const { teamMilestones, cyclistMilestones } = useMemo(() => {
    if (!files.resultados?.data || !files.carreras?.data || !leaderboard) return { teamMilestones: [], cyclistMilestones: [] };

    const tMilestones: { label: string; team: string; date: string; icon: any; order: number }[] = [];
    const cMilestones: { label: string; cyclist: string; date: string; icon: any; order: number }[] = [];

    // Parse all races to date and category mapping
    const raceMeta: Record<string, { date: string; dateObj: Date; category: string }> = {};
    files.carreras.data.forEach((r: any) => {
      const name = (getVal(r, "Carrera") || getVal(r, "Prueba"))?.trim();
      const dateStr = getVal(r, "Fecha")?.trim();
      const cat = (getVal(r, "Categoría") || getVal(r, "Categoria"))?.trim();
      if (name && dateStr) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          const dObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          raceMeta[name.toLowerCase()] = { date: dateStr, dateObj: dObj, category: cat || "" };
        }
      }
    });

    const isGt = (lower: string) => {
      return (
        lower.includes("tour de france") || lower.includes("tour de francia") ||
        lower.includes("giro d'italia") || lower.includes("giro de italia") ||
        lower.includes("vuelta a españa") || lower.includes("vuelta ciclista a españa")
      );
    };

    const isMonument = (lowerName: string, lowerCat: string) => {
      if (lowerCat.includes("monumento")) return true;
      
      if (lowerName.includes("a través") || lowerName.includes("a traves") || lowerName.includes("dwars")) return false;
      
      const monNames = [
        "milano-sanremo", "milán-san remo", "milan-san remo", "milan - san remo", "milán - san remo", "milano - sanremo", "milan san remo", "milan sanremo",
        "ronde van vlaanderen", "tour de flandes", "tour des flandres", "tour of flanders",
        "paris-roubaix", "parís-roubaix", "parís - roubaix", "paris - roubaix", "paris roubaix",
        "liège-bastogne-liège", "lieja-bastoña-lieja", "lieja - bastoña - lieja", "liege-bastogne-liege", "liege - bastogne - liege", "liege bastogne liege", "liège - bastogne - liège",
        "il lombardia", "giro de lombardía", "giro di lombardia", "giro de lombardia"
      ];
      return monNames.some(m => lowerName.includes(m));
    };

    const teamPointsOverTime: Record<string, { date: Date; pts: number }[]> = {};
    const teams = new Set<string>();

    const getTeamFormatted = (teamName: string) => {
      const teamObj = leaderboard.find((l) => l.nombreEquipo === teamName);
      if (teamObj?.orden && teamObj.orden !== "99") {
        return `${teamName} [#${teamObj.orden}]`;
      }
      return teamName;
    };

    const getCyclistFormatted = (cyclistName: string) => {
      const meta = cyclistMetadata?.[cyclistName] || {};
      if (meta.ronda) {
        return `${cyclistName} <${meta.ronda}> (${meta.eleccion})`;
      }
      return `${cyclistName} <Libre>`;
    };

    const allWins: { team: string, date: Date, cyclist: string, raceName: string, category: string, points: number, type?: string }[] = [];
    const allResults: { team: string, date: Date, cyclist: string, points: number, raceName: string, type?: string, rank?: number }[] = [];

    leaderboard.forEach(p => {
      const team = p.nombreEquipo;
      if (team === "No draft" || team.includes("No draft") || team === "Libre") return;
      teams.add(team);
      if (!teamPointsOverTime[team]) teamPointsOverTime[team] = [];

      p.detalles.forEach((d: any) => {
        const carreraKey = d.carrera?.trim().toLowerCase();
        const meta = raceMeta[carreraKey];
        if (meta) {
          teamPointsOverTime[team].push({ date: meta.dateObj, pts: d.puntosObtenidos });
          allResults.push({ team: team, date: meta.dateObj, cyclist: d.ciclista, points: d.puntosObtenidos, raceName: d.carrera, type: d.tipoResultado, rank: d.posicion });
          if (String(d.posicion) === '1') {
             const type = d.tipoResultado?.toLowerCase() || "";
             const isGeneral = type.includes("general");
             const isStage = !!d.etapa || type.includes("etapa");
             const isSecondary = type.includes("montaña") || type.includes("puntos") || type.includes("joven") || type.includes("regularidad");
             
             if (isGeneral || (!isStage && !isSecondary)) {
               allWins.push({ team: team, date: meta.dateObj, cyclist: d.ciclista, raceName: d.carrera, category: meta.category, points: d.puntosObtenidos, type: type });
             }
          }
        }
      });
    });

    const maxPointsReached = Math.max(...leaderboard.map(l => l.puntos));
    const thresholds = [];
    for (let i = 1000; i <= maxPointsReached; i += 1000) { thresholds.push(i); }

    const teamTimelines: Record<string, { date: Date; total: number }[]> = {};
    Array.from(teams).forEach(team => {
      const events = teamPointsOverTime[team].sort((a, b) => a.date.getTime() - b.date.getTime());
      let currentPts = 0;
      teamTimelines[team] = [];
      events.forEach(e => {
        currentPts += e.pts;
        teamTimelines[team].push({ date: e.date, total: currentPts });
      });
    });

    thresholds.forEach(th => {
      let earliestDate: Date | null = null;
      let winnerTeam = "";
      Array.from(teams).forEach(team => {
        const trn = teamTimelines[team].find(t => t.total >= th);
        if (trn) {
          if (!earliestDate || trn.date < earliestDate) { earliestDate = trn.date; winnerTeam = team; }
        }
      });

      if (winnerTeam && earliestDate) {
        tMilestones.push({
          label: `Primer equipo en llegar a ${formatNumberSpanish(th)} puntos`,
          team: getTeamFormatted(winnerTeam),
          date: earliestDate.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
          icon: <Award className="w-5 h-5 text-purple-600 drop-shadow-sm" />,
          order: earliestDate.getTime()
        });
      }
    });

    // Sort to process chronologically
    allWins.sort((a, b) => a.date.getTime() - b.date.getTime());
    allResults.sort((a, b) => a.date.getTime() - b.date.getTime());

    const raceNamesProcessed = new Set<string>();
    const cyclistRaceNamesProcessed = new Set<string>();
    
    // Team Monument & GT Winners based on Fantasy Race Winners
    if (raceWinners) {
      Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
        const meta = raceMeta[raceName.toLowerCase()];
        if (!meta) return;
        
        const lowerCat = meta.category.toLowerCase();
        const lowerName = raceName.toLowerCase();
        const isMon = isMonument(lowerName, lowerCat);
        const isMundial = lowerName.includes("campeonato del mundo") || lowerCat.includes("mundial");

        if (isMon) {
          tMilestones.push({
            label: `Ganador de Monumento (${raceName})`,
            team: getTeamFormatted(winnerTeam),
            date: meta.dateObj.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
            icon: <Crown className="w-5 h-5 text-amber-500 drop-shadow-sm" />,
            order: meta.dateObj.getTime()
          });
        } else if (isMundial) {
          tMilestones.push({
            label: `Ganador del Campeonato del Mundo (${raceName})`,
            team: getTeamFormatted(winnerTeam),
            date: meta.dateObj.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
            icon: <Globe className="w-5 h-5 text-cyan-500 drop-shadow-sm" />,
            order: meta.dateObj.getTime()
          });
        } else if (isGt(lowerName)) {
           tMilestones.push({
            label: `Ganador de Gran Vuelta (${raceName})`,
            team: getTeamFormatted(winnerTeam),
            date: meta.dateObj.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
            icon: <Trophy className="w-5 h-5 text-emerald-500 drop-shadow-sm" />,
            order: meta.dateObj.getTime()
          });
        }
      });
    }

    const teamWinsCount: Record<string, number> = {};
    const teamClassicsWinCount: Record<string, number> = {};
    const teamStageWinCount: Record<string, number> = {};
    
    const winThresholds = [5, 10, 15, 20, 25, 30];
    const achievedWinThresholds = new Set<number>();
    
    let achievedTeamClassics5 = false;
    let achievedTeamStage5 = false;

    for (const win of allWins) {
      if (!teamWinsCount[win.team]) teamWinsCount[win.team] = 0;
      teamWinsCount[win.team]++;
      
      const lowerCat = win.category.toLowerCase();
      const isClassic = lowerCat.startsWith("1.") || lowerCat.includes("clásica");
      const isStageRace = lowerCat.startsWith("2.") || lowerCat.includes("vueltas");
      
      if (isClassic) {
          if (!teamClassicsWinCount[win.team]) teamClassicsWinCount[win.team] = 0;
          teamClassicsWinCount[win.team]++;
          if (teamClassicsWinCount[win.team] === 5 && !achievedTeamClassics5) {
              achievedTeamClassics5 = true;
              tMilestones.push({
                  label: `Tiranía Clasicómana: Primer equipo con 5 victorias en carreras de un día`,
                  team: getTeamFormatted(win.team),
                  date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                  icon: <Trophy className="w-5 h-5 text-yellow-600 drop-shadow-sm" />,
                  order: win.date.getTime()
              });
          }
      }
      if (isStageRace) {
          if (!teamStageWinCount[win.team]) teamStageWinCount[win.team] = 0;
          teamStageWinCount[win.team]++;
          if (teamStageWinCount[win.team] === 5 && !achievedTeamStage5) {
              achievedTeamStage5 = true;
              tMilestones.push({
                  label: `Monopolio en Vueltas: Primer equipo con 5 Generales de Vueltas menores`,
                  team: getTeamFormatted(win.team),
                  date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                  icon: <Award className="w-5 h-5 text-orange-500 drop-shadow-sm" />,
                  order: win.date.getTime()
              });
          }
      }

      for (const th of winThresholds) {
        if (teamWinsCount[win.team] === th && !achievedWinThresholds.has(th)) {
          achievedWinThresholds.add(th);
          tMilestones.push({
            label: `Primer equipo en alcanzar ${th} victorias`,
            team: getTeamFormatted(win.team),
            date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
            icon: <Award className="w-5 h-5 text-indigo-500 drop-shadow-sm" />,
            order: win.date.getTime()
          });
          break;
        }
      }
    }

    // 1. Rachas y Tiranías (3 carreras consecutivas del calendario)
    // Needs to look at all unique race dates and see if a team won 3 in a row
    const uniqueRaceDates = Array.from(new Set(Object.values(raceMeta).map(rm => rm.dateObj.getTime()))).sort((a,b) => a - b);
    let consecutiveTeamWinFound = false;
    let consecutiveCyclistWinFound = false;
    for (let i = 0; i < uniqueRaceDates.length - 2; i++) {
        const d1 = uniqueRaceDates[i];
        const d2 = uniqueRaceDates[i+1];
        const d3 = uniqueRaceDates[i+2];
        const wins1 = allWins.filter(w => w.date.getTime() === d1);
        const wins2 = allWins.filter(w => w.date.getTime() === d2);
        const wins3 = allWins.filter(w => w.date.getTime() === d3);
        
        if (!consecutiveTeamWinFound) {
            for (const team of Array.from(teams)) {
                if (wins1.some(w => w.team === team) && wins2.some(w => w.team === team) && wins3.some(w => w.team === team)) {
                    consecutiveTeamWinFound = true;
                    tMilestones.push({
                        label: `Rachas y Tiranías: 3 victorias de equipo consecutivas`,
                        team: getTeamFormatted(team),
                        date: new Date(d3).toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                        icon: <Award className="w-5 h-5 text-red-500 drop-shadow-sm" />,
                        order: d3
                    });
                    break;
                }
            }
        }
        
        if (!consecutiveCyclistWinFound) {
            const tempCyclists = new Set(wins1.map(w => w.cyclist));
            for (const cyclist of Array.from(tempCyclists)) {
                if (wins1.some(w => w.cyclist === cyclist) && wins2.some(w => w.cyclist === cyclist) && wins3.some(w => w.cyclist === cyclist)) {
                    consecutiveCyclistWinFound = true;
                    cMilestones.push({
                        label: `Rachas y Tiranías: 3 victorias consecutivas`,
                        cyclist: getCyclistFormatted(cyclist),
                        date: new Date(d3).toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                        icon: <Award className="w-5 h-5 text-red-500 drop-shadow-sm" />,
                        order: d3
                    });
                    break;
                }
            }
        }
    }

    // 4. Reyes Secundarios: "Ganador de la Clasificación de la Montaña (o por Puntos) de una Gran Vuelta"
    const secondaryClassifications = allResults.filter(d => 
        isGt(d.raceName.toLowerCase()) && 
        String(d.rank) === "1" && 
        d.type && (d.type.toLowerCase().includes("montaña") || d.type.toLowerCase().includes("puntos") || d.type.toLowerCase().includes("joven"))
    );
    const secondaryProcessed = new Set<string>();
    secondaryClassifications.forEach(d => {
        const key = `${d.raceName}-${d.type}`;
        if (!secondaryProcessed.has(key)) {
            secondaryProcessed.add(key);
            cMilestones.push({
                label: `Reyes Secundarios: ${d.type} en ${d.raceName}`,
                cyclist: getCyclistFormatted(d.cyclist),
                date: d.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                icon: <Medal className="w-5 h-5 text-pink-500 drop-shadow-sm" />,
                order: d.date.getTime()
            });
        }
    });

    // Cyclist Milestones
    const cyclistPointsCount: Record<string, number> = {};
    const cyclistWinCount: Record<string, number> = {};
    const cyclistClassicsCount: Record<string, number> = {};
    const cyclistStageCount: Record<string, number> = {};
    
    let achievedCyclistClassics5 = false;
    let achievedCyclistStage3 = false;

    const cyclistPointsThresholds = [500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
    const achievedCyclistPointsThresholds = new Set<number>();
    const cyclistWinThresholds = [5, 10, 15, 20];
    const achievedCyclistWinThresholds = new Set<number>();
    
    const lateRoundThresholds = [1000, 2000, 3000];
    const achievedCyclistR10Thresholds = new Set<number>();
    const achievedCyclistR20Thresholds = new Set<number>();
    
    let draftStealFound = false;
    
    const teamScorers: Record<string, Set<string>> = {};
    let achievedDeepRoster10 = false;
    let achievedDeepRoster15 = false;
    let achievedDeepRosterAll = false;
    
    const gtStageWins: Record<string, Record<string, number>> = {};
    const achievedGTDominance = new Set<string>();

    for (const res of allResults) {
      if (!cyclistPointsCount[res.cyclist]) cyclistPointsCount[res.cyclist] = 0;
      cyclistPointsCount[res.cyclist] += res.points;
      
      if (!teamScorers[res.team]) teamScorers[res.team] = new Set();
      teamScorers[res.team].add(res.cyclist);
      const size = teamScorers[res.team].size;
      
      if (size === 10 && !achievedDeepRoster10) {
         achievedDeepRoster10 = true;
         tMilestones.push({
            label: `Plantilla Profunda: Primer equipo con 10 ciclistas distintos que han puntuado`,
            team: getTeamFormatted(res.team),
            date: res.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
            icon: <Users className="w-5 h-5 text-emerald-500 drop-shadow-sm" />,
            order: res.date.getTime()
         });
      }
      
      if (size === 15 && !achievedDeepRoster15) {
         achievedDeepRoster15 = true;
         tMilestones.push({
            label: `Plantilla Profunda: Primer equipo con 15 ciclistas distintos que han puntuado`,
            team: getTeamFormatted(res.team),
            date: res.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
            icon: <Users className="w-5 h-5 text-emerald-600 drop-shadow-sm" />,
            order: res.date.getTime()
         });
      }
      
      if (size === 30 && !achievedDeepRosterAll) {
         achievedDeepRosterAll = true;
         tMilestones.push({
            label: `Plantilla Completa: Primer equipo en puntuar con 30 ciclistas distintos`,
            team: getTeamFormatted(res.team),
            date: res.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
            icon: <Users className="w-5 h-5 text-emerald-700 drop-shadow-sm" />,
            order: res.date.getTime()
         });
      }
      
      if (isGt(res.raceName.toLowerCase()) && String(res.rank) === "1" && res.type?.toLowerCase().includes("etapa")) {
          if (!gtStageWins[res.cyclist]) gtStageWins[res.cyclist] = {};
          if (!gtStageWins[res.cyclist][res.raceName]) gtStageWins[res.cyclist][res.raceName] = 0;
          gtStageWins[res.cyclist][res.raceName]++;
          
          if (gtStageWins[res.cyclist][res.raceName] === 3 && !achievedGTDominance.has(res.cyclist + res.raceName)) {
              achievedGTDominance.add(res.cyclist + res.raceName);
              cMilestones.push({
                 label: `Dominio Aplastante: 3 victorias de etapa en ${res.raceName}`,
                 cyclist: getCyclistFormatted(res.cyclist),
                 date: res.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                 icon: <Trophy className="w-5 h-5 text-rose-500 drop-shadow-sm" />,
                 order: res.date.getTime()
              });
          }
      }

      for (const th of cyclistPointsThresholds) {
        if (cyclistPointsCount[res.cyclist] >= th && !achievedCyclistPointsThresholds.has(th)) {
           achievedCyclistPointsThresholds.add(th);
           cMilestones.push({
             label: `Primer ciclista en alcanzar ${formatNumberSpanish(th)} puntos`,
             cyclist: getCyclistFormatted(res.cyclist),
             date: res.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
             icon: <Award className="w-5 h-5 text-fuchsia-600 drop-shadow-sm" />,
             order: res.date.getTime()
           });
        }
      }
      
      for (const th of lateRoundThresholds) {
         if (cyclistPointsCount[res.cyclist] >= th) {
             const meta = cyclistMetadata?.[res.cyclist] || {};
             const isLibre = !meta.ronda || meta.ronda.toLowerCase().includes("libre");
             const rNum = meta.ronda ? parseInt(meta.ronda.replace(/\D/g, ''), 10) : 99; // 99 for libre
             const compareNum = isNaN(rNum) ? (isLibre ? 99 : 1) : rNum;
             
             if (compareNum > 10 && !achievedCyclistR10Thresholds.has(th)) {
                 achievedCyclistR10Thresholds.add(th);
                 cMilestones.push({
                   label: `Primer ciclista de ronda >10 en conseguir ${formatNumberSpanish(th)} puntos`,
                   cyclist: getCyclistFormatted(res.cyclist),
                   date: res.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                   icon: <Award className="w-5 h-5 text-indigo-500 drop-shadow-sm" />,
                   order: res.date.getTime()
                 });
             }
             if (compareNum > 20 && !achievedCyclistR20Thresholds.has(th)) {
                 achievedCyclistR20Thresholds.add(th);
                 cMilestones.push({
                   label: `Primer ciclista de ronda >20 en conseguir ${formatNumberSpanish(th)} puntos`,
                   cyclist: getCyclistFormatted(res.cyclist),
                   date: res.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                   icon: <Award className="w-5 h-5 text-purple-600 drop-shadow-sm" />,
                   order: res.date.getTime()
                 });
             }
         }
      }
      
      // 2. El Robo del Draft
      if (!draftStealFound && cyclistPointsCount[res.cyclist] >= 2000) {
          const meta = cyclistMetadata?.[res.cyclist] || {};
          let isLate = true;
          if (meta.ronda) {
              const rNum = parseInt(meta.ronda.replace(/\D/g, ''), 10);
              if (!isNaN(rNum) && rNum <= 15) {
                  isLate = false;
              }
          }
          if (isLate) {
              draftStealFound = true;
              cMilestones.push({
                   label: `El Robo del Draft: Alcanzó los 2.000 puntos`,
                   cyclist: getCyclistFormatted(res.cyclist),
                   date: res.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                   icon: <Award className="w-5 h-5 text-blue-600 drop-shadow-sm" />,
                   order: res.date.getTime()
              });
          }
      }
    }

    for (const win of allWins) {
      if (!cyclistWinCount[win.cyclist]) cyclistWinCount[win.cyclist] = 0;
      cyclistWinCount[win.cyclist]++;
      
      const lowerCat = win.category.toLowerCase();
      const isClassic = lowerCat.startsWith("1.") || lowerCat.includes("clásica");
      const isStageRace = lowerCat.startsWith("2.") || lowerCat.includes("vueltas");
      
      if (isClassic) {
          if (!cyclistClassicsCount[win.cyclist]) cyclistClassicsCount[win.cyclist] = 0;
          cyclistClassicsCount[win.cyclist]++;
          if (cyclistClassicsCount[win.cyclist] === 5 && !achievedCyclistClassics5) {
              achievedCyclistClassics5 = true;
              cMilestones.push({
                  label: `Coleccionista de Clásicas: Primer ciclista en ganar 5 carreras de un día`,
                  cyclist: getCyclistFormatted(win.cyclist),
                  date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                  icon: <Trophy className="w-5 h-5 text-yellow-500 drop-shadow-sm" />,
                  order: win.date.getTime()
              });
          }
      }
      
      if (isStageRace) {
          if (!cyclistStageCount[win.cyclist]) cyclistStageCount[win.cyclist] = 0;
          cyclistStageCount[win.cyclist]++;
          if (cyclistStageCount[win.cyclist] === 3 && !achievedCyclistStage3) {
              achievedCyclistStage3 = true;
              cMilestones.push({
                  label: `Especialista en Vueltas: Primer ciclista en ganar 3 Vueltas menores`,
                  cyclist: getCyclistFormatted(win.cyclist),
                  date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                  icon: <Award className="w-5 h-5 text-orange-500 drop-shadow-sm" />,
                  order: win.date.getTime()
              });
          }
      }
      
      for (const th of cyclistWinThresholds) {
        if (cyclistWinCount[win.cyclist] === th && !achievedCyclistWinThresholds.has(th)) {
           achievedCyclistWinThresholds.add(th);
           cMilestones.push({
             label: `Primer ciclista en alcanzar ${th} victorias`,
             cyclist: getCyclistFormatted(win.cyclist),
             date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
             icon: <Award className="w-5 h-5 text-rose-500 drop-shadow-sm" />,
             order: win.date.getTime()
           });
        }
      }
    }
    
    // 3. Dobletes Legendarios
    // We can compute them by finding all cyclists who won specific pairs of races
    const cyclistGTWins = new Map<string, Set<string>>();
    const cyclistMonumentWins = new Map<string, Set<string>>();
    
    // Monument and GT Winners for Cyclists
    cyclistRaceNamesProcessed.clear();
    for (const win of allWins) {
      if (cyclistRaceNamesProcessed.has(win.raceName)) continue;
      cyclistRaceNamesProcessed.add(win.raceName);
      
      const lowerCat = win.category.toLowerCase();
      const lowerName = win.raceName.toLowerCase();
      const isMon = isMonument(lowerName, lowerCat);
      const isMundial = lowerName.includes("campeonato del mundo") || lowerCat.includes("mundial");

      if (isMon) {
        cMilestones.push({
          label: `Ganador de Monumento (${win.raceName})`,
          cyclist: getCyclistFormatted(win.cyclist),
          date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
          icon: <Crown className="w-5 h-5 text-amber-500 drop-shadow-sm" />,
          order: win.date.getTime()
        });
        
        if (!cyclistMonumentWins.has(win.cyclist)) cyclistMonumentWins.set(win.cyclist, new Set());
        if (lowerName.includes("flandes") || lowerName.includes("flanders") || lowerName.includes("vlaanderen")) {
            cyclistMonumentWins.get(win.cyclist)?.add("flandes");
        }
        if (lowerName.includes("roubaix")) {
            cyclistMonumentWins.get(win.cyclist)?.add("roubaix");
        }
        const monSet = cyclistMonumentWins.get(win.cyclist);
        if (monSet && monSet.has("flandes") && monSet.has("roubaix") && !monSet.has("doblete_hecho")) {
            monSet.add("doblete_hecho");
            cMilestones.push({
                label: `Doblete Legendario: Flandes y Roubaix`,
                cyclist: getCyclistFormatted(win.cyclist),
                date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                icon: <Crown className="w-5 h-5 text-yellow-500 drop-shadow-sm" />,
                order: win.date.getTime()
            });
        }
      } else if (isMundial) {
        cMilestones.push({
          label: `Ganador del Campeonato del Mundo (${win.raceName})`,
          cyclist: getCyclistFormatted(win.cyclist),
          date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
          icon: <Globe className="w-5 h-5 text-cyan-500 drop-shadow-sm" />,
          order: win.date.getTime()
        });
      } else if (isGt(lowerName)) {
         cMilestones.push({
          label: `Ganador de Gran Vuelta (${win.raceName})`,
          cyclist: getCyclistFormatted(win.cyclist),
          date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
          icon: <Trophy className="w-5 h-5 text-emerald-500 drop-shadow-sm" />,
          order: win.date.getTime()
        });
        
        if (!cyclistGTWins.has(win.cyclist)) cyclistGTWins.set(win.cyclist, new Set());
        if (lowerName.includes("tour")) cyclistGTWins.get(win.cyclist)?.add("tour");
        if (lowerName.includes("giro")) cyclistGTWins.get(win.cyclist)?.add("giro");
        if (lowerName.includes("vuelta")) cyclistGTWins.get(win.cyclist)?.add("vuelta");
        
        const gtSet = cyclistGTWins.get(win.cyclist);
        if (gtSet && gtSet.has("giro") && gtSet.has("tour") && !gtSet.has("giro-tour-done")) {
            gtSet.add("giro-tour-done");
            cMilestones.push({
                label: `Doblete Legendario: Giro y Tour`,
                cyclist: getCyclistFormatted(win.cyclist),
                date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                icon: <Crown className="w-5 h-5 text-yellow-500 drop-shadow-sm" />,
                order: win.date.getTime()
            });
        }
        if (gtSet && gtSet.has("tour") && gtSet.has("vuelta") && !gtSet.has("tour-vuelta-done")) {
            gtSet.add("tour-vuelta-done");
            cMilestones.push({
                label: `Doblete Legendario: Tour y Vuelta`,
                cyclist: getCyclistFormatted(win.cyclist),
                date: win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                icon: <Crown className="w-5 h-5 text-yellow-500 drop-shadow-sm" />,
                order: win.date.getTime()
            });
        }
      }
    }

    tMilestones.sort((a, b) => a.order - b.order);
    cMilestones.sort((a, b) => a.order - b.order);
    return { teamMilestones: tMilestones, cyclistMilestones: cMilestones };
  }, [files.resultados?.data, files.carreras?.data, leaderboard, cyclistMetadata]);

  const handleCopy = async () => {
    await handleCopyImage({ scale: 3, backgroundColor: "#ffffff", style: { overflow: "visible" }, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")) });
  };

  const handleDownload = async () => {
    await handleDownloadImage({ fileName: "hitos_temporada.png", scale: 3, backgroundColor: "#ffffff", style: { overflow: "visible" }, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")) });
  };

  if (teamMilestones.length === 0 && cyclistMilestones.length === 0) return null;

  return (
    <div className={cn("mt-12 w-full mx-auto", isExpanded ? "fixed inset-4 z-50 overflow-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-4 sm:p-8" : "max-w-7xl")}>
      <div className="bg-white border flex flex-col border-neutral-200 rounded-xl overflow-hidden shadow-sm" ref={containerRef}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center hide-on-copy">
              <Flag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-neutral-900">Hitos de la Temporada</h3>
              <p className="text-sm text-neutral-500 font-medium">Momentos clave de equipos y ciclistas</p>
            </div>
          </div>
          <div className="flex items-center gap-2 copy-button-ignore">
            <button onClick={handleDownload} disabled={isCopying} className="p-2 sm:px-4 sm:py-2 flex items-center justify-center gap-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-semibold">Descargar</span>
            </button>
            <button onClick={handleCopy} disabled={isCopying} className="p-2 sm:px-4 sm:py-2 flex items-center justify-center gap-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors">
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-semibold">{isCopying ? "Copiando..." : "Copiar"}</span>
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-colors">
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="overflow-auto bg-neutral-50/20">
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start min-w-[700px]">
            {/* Team Milestones */}
            <div className="flex flex-col">
              <h4 className="font-bold text-neutral-800 text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Equipos
              </h4>
              <div className="border border-neutral-200/60 rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-neutral-100 bg-white">
                  {teamMilestones.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-neutral-50/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                          {m.icon}
                        </div>
                        <div>
                          <h5 className="font-bold text-neutral-900 text-sm leading-tight group-hover:text-blue-700 transition-colors">{m.label}</h5>
                          <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100">
                            {m.team}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-neutral-400 font-medium whitespace-nowrap ml-4">
                        {m.date}
                      </div>
                    </div>
                  ))}
                  {teamMilestones.length === 0 && (
                    <div className="p-8 text-center text-neutral-400">
                      Aún no hay hitos de equipos.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cyclist Milestones */}
            <div className="flex flex-col">
              <h4 className="font-bold text-neutral-800 text-lg mb-4 flex items-center gap-2">
                <Medal className="w-5 h-5 text-rose-500" /> Ciclistas
              </h4>
              <div className="border border-neutral-200/60 rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-neutral-100 bg-white">
                  {cyclistMilestones.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-neutral-50/50 transition-colors group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                          {m.icon}
                         </div>
                         <div>
                          <h5 className="font-bold text-neutral-900 text-sm leading-tight group-hover:text-amber-700 transition-colors">{m.label}</h5>
                          <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-100">
                            {m.cyclist}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-neutral-400 font-medium whitespace-nowrap ml-4">
                        {m.date}
                      </div>
                    </div>
                  ))}
                  {cyclistMilestones.length === 0 && (
                    <div className="p-8 text-center text-neutral-400">
                      Aún no hay hitos de ciclistas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
