import { AppState, PlayerScore, CyclistMetadata } from '../../../../lib/types';
import React, { useMemo } from "react";
import { formatNumberSpanish, getVal } from "../../../../lib/data-processing";
import { Award, Trophy, Crown, Globe, Users, Medal } from "lucide-react";
import { MILESTONE_DEFINITIONS } from '../../admin/milestonesConfigData';

export interface MilestoneItem {
  id: string;
  label: string;
  team?: string;
  cyclist?: string;
  date: string;
  icon: any;
  order: number;
  explanation: string;
  triggerDetails: string;
  details: string;
  category: 'equipos' | 'ciclistas';
  title: string;
}

export const useSeasonMilestonesLogic = ({ leaderboard, files, cyclistMetadata, raceWinners }: { leaderboard: PlayerScore[]; files: AppState; cyclistMetadata: Record<string, CyclistMetadata>; raceWinners?: Record<string, string> }) => {
  const { teamMilestones, cyclistMilestones } = useMemo(() => {
    if (!files.resultados?.data || !files.carreras?.data || !leaderboard) return { teamMilestones: [], cyclistMilestones: [] };

    const tMilestones: MilestoneItem[] = [];
    const cMilestones: MilestoneItem[] = [];

    const configuracionData = files.configuracion?.data || [];
    const isMasterEnabled = (() => {
      const item = configuracionData.find((i: any) => i.key === "milestones_master_enabled");
      return item === undefined ? true : (item.value === "true" || item.value === true);
    })();

    const isMilestoneEnabled = (id: string) => {
      if (!isMasterEnabled) return false;
      const item = configuracionData.find((i: any) => i.key === `milestone_${id}`);
      return item === undefined ? true : (item.value === "true" || item.value === true);
    };

    const seenTMilestones = new Set<string>();
    const seenCMilestones = new Set<string>();

    const normalizeMilestoneKey = (id: string, label: string) => {
      const cleanLabel = (label || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      return `${id}_${cleanLabel}`;
    };

    const pushTMilestone = (id: string, milestone: Omit<MilestoneItem, 'category'> & { category?: 'equipos' }) => {
      if (isMilestoneEnabled(id)) {
        const key = normalizeMilestoneKey(id, milestone.label);
        if (seenTMilestones.has(key)) return;
        seenTMilestones.add(key);
        tMilestones.push({ ...milestone, category: 'equipos' });
      }
    };

    const pushCMilestone = (id: string, milestone: Omit<MilestoneItem, 'category'> & { category?: 'ciclistas' }) => {
      if (isMilestoneEnabled(id)) {
        const key = normalizeMilestoneKey(id, milestone.label);
        if (seenCMilestones.has(key)) return;
        seenCMilestones.add(key);
        cMilestones.push({ ...milestone, category: 'ciclistas' });
      }
    };

    const getDef = (id: string) => MILESTONE_DEFINITIONS.find(d => d.id === id);

    // Parse all races to date, category, and officialName mapping
    const raceMeta: Record<string, { date: string; dateObj: Date; category: string; officialName: string }> = {};
    files?.carreras?.data.forEach((r: any) => {
      const name = (getVal(r, "Carrera") || getVal(r, "Prueba"))?.trim();
      const dateStr = getVal(r, "Fecha")?.trim();
      const cat = (getVal(r, "Categoría") || getVal(r, "Categoria"))?.trim();
      if (name && dateStr) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          const dObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          raceMeta[name.toLowerCase()] = { date: dateStr, dateObj: dObj, category: cat || "", officialName: name };
        }
      }
    });

    const getGtInfo = (lower: string): { key: "giro" | "tour" | "vuelta"; canonicalName: string } | null => {
      const clean = (lower || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

      // Giro d'Italia strictly (exclude any other Italian tours like Giro di Sardegna, Trentino, Sicilia, etc.)
      const isGiro = (
        clean.includes("giro d'italia") ||
        clean.includes("giro de italia") ||
        clean.includes("giro d italia") ||
        clean.includes("giro ditalia") ||
        clean === "giro"
      ) && !clean.includes("sardegna") && !clean.includes("emilia") && !clean.includes("trentino") && !clean.includes("sicilia") && !clean.includes("toscana") && !clean.includes("appennino") && !clean.includes("veneto") && !clean.includes("friuli") && !clean.includes("valle") && !clean.includes("baby") && !clean.includes("next gen");

      if (isGiro) {
        return { key: "giro", canonicalName: "Giro d'Italia" };
      }

      // Tour de France strictly (exclude Tour de Suisse, Romandie, Pologne, etc.)
      const isTour = (
        clean.includes("tour de france") ||
        clean.includes("tour de francia") ||
        clean === "tour"
      ) && !clean.includes("suisse") && !clean.includes("suiza") && !clean.includes("romandie") && !clean.includes("romandia") && !clean.includes("pologne") && !clean.includes("polonia") && !clean.includes("down under") && !clean.includes("benelux") && !clean.includes("alps") && !clean.includes("alpes") && !clean.includes("britain") && !clean.includes("oman") && !clean.includes("flanders") && !clean.includes("flandes") && !clean.includes("l'avenir") && !clean.includes("avenir") && !clean.includes("vallee");

      if (isTour) {
        return { key: "tour", canonicalName: "Tour de France" };
      }

      // Vuelta a España strictly (exclude Vuelta a Murcia, Burgos, Andalucia, Pais Vasco, etc.)
      const isVuelta = (
        clean.includes("vuelta a espana") ||
        clean.includes("vuelta ciclista a espana") ||
        clean.includes("la vuelta a espana") ||
        clean === "la vuelta" ||
        clean === "vuelta" ||
        clean === "vuelta espana"
      ) && !clean.includes("murcia") && !clean.includes("burgos") && !clean.includes("andaluc") && !clean.includes("pais vasco") && !clean.includes("valenciana") && !clean.includes("asturias") && !clean.includes("leon") && !clean.includes("castilla") && !clean.includes("rioja") && !clean.includes("madrid") && !clean.includes("mallorca") && !clean.includes("aragon") && !clean.includes("catalun") && !clean.includes("san juan") && !clean.includes("algarve") && !clean.includes("portugal") && !clean.includes("colombia") && !clean.includes("tachira") && !clean.includes("venezuela") && !clean.includes("femenina") && !clean.includes("espana f") && !clean.includes("comunidad");

      if (isVuelta) {
        return { key: "vuelta", canonicalName: "Vuelta a España" };
      }

      return null;
    };

    const getGtKey = (lower: string): string | null => getGtInfo(lower)?.key || null;
    const isGt = (lower: string) => getGtInfo(lower) !== null;

    const getMonumentInfo = (lowerName: string, lowerCat: string = ""): { key: string; canonicalName: string } | null => {
      const clean = (lowerName || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

      if (clean.includes("a traves") || clean.includes("dwars")) return null;
      if (clean.includes("milano-sanremo") || clean.includes("milano - sanremo") || clean.includes("san remo") || clean.includes("sanremo")) {
        return { key: "sanremo", canonicalName: "Milano-Sanremo" };
      }
      if (clean.includes("ronde van vlaanderen") || clean.includes("flandes") || clean.includes("vlaanderen") || clean.includes("flanders")) {
        return { key: "flandes", canonicalName: "Tour de Flandes" };
      }
      if (clean.includes("paris-roubaix") || clean.includes("paris - roubaix") || clean.includes("roubaix")) {
        return { key: "roubaix", canonicalName: "Paris-Roubaix" };
      }
      if (clean.includes("liege-bastogne-liege") || clean.includes("lieja-bastona-lieja") || clean.includes("lieja") || clean.includes("liege")) {
        return { key: "lieja", canonicalName: "Liège-Bastogne-Liège" };
      }
      if (clean.includes("lombardia") || clean.includes("lombard")) {
        return { key: "lombardia", canonicalName: "Il Lombardia" };
      }
      return null;
    };

    const getMonumentKey = (lowerName: string, lowerCat: string = ""): string | null => getMonumentInfo(lowerName, lowerCat)?.key || null;
    const isMonument = (lowerName: string, lowerCat: string = "") => getMonumentInfo(lowerName, lowerCat) !== null;

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
      const meta = (cyclistMetadata?.[cyclistName] || {}) as Partial<import("../../../../lib/types").CyclistMetadata>;
      if (meta.ronda) {
        return `${cyclistName} <${meta.ronda}> (${meta.eleccion})`;
      }
      return `${cyclistName} <Libre>`;
    };

    const allWins: { team: string, date: Date, cyclist: string, raceName: string, category: string, points: number, type?: string }[] = [];
    const allAnyWins: { team: string, date: Date, cyclist: string, raceName: string, category: string, points: number, type?: string }[] = [];
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
          let eventDateObj = meta.dateObj;
          if (typeof d.fecha === "string" && d.fecha.trim().length > 0) {
            const parts = d.fecha.split(/[-/]/);
            if (parts.length >= 3) {
              let day = parseInt(parts[0], 10);
              let month = parseInt(parts[1], 10) - 1;
              let year = parseInt(parts[2], 10);
              if (year < 100) year += 2000;
              if (parts[0].length === 4) {
                 year = parseInt(parts[0], 10);
                 day = parseInt(parts[2], 10);
              }
              const pDate = new Date(year, month, day);
              if (!isNaN(pDate.getTime())) {
                 eventDateObj = pDate;
              }
            }
          }

          teamPointsOverTime[team].push({ date: eventDateObj, pts: d.puntosObtenidos });
          allResults.push({ team: team, date: eventDateObj, cyclist: d.ciclista, points: d.puntosObtenidos, raceName: d.carrera, type: d.tipoResultado, rank: d.posicion });
          if (String(d.posicion) === '1') {
             const type = d.tipoResultado?.toLowerCase() || "";
             const isGeneral = type.includes("general");
             const isStage = !!d.etapa || type.includes("etapa");
             const isSecondary = type.includes("montaña") || type.includes("puntos") || type.includes("joven") || type.includes("regularidad");
             
             if (!isSecondary) {
               allAnyWins.push({ team: team, date: eventDateObj, cyclist: d.ciclista, raceName: d.carrera, category: meta.category, points: d.puntosObtenidos, type: type });
             }

             if (isGeneral || (!isStage && !isSecondary)) {
               allWins.push({ team: team, date: eventDateObj, cyclist: d.ciclista, raceName: d.carrera, category: meta.category, points: d.puntosObtenidos, type: type });
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
        const def = getDef("team_points_threshold");
        const dateFormatted = earliestDate.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' });
        pushTMilestone("team_points_threshold", {
          id: "team_points_threshold",
          title: def?.title || "Puntuación acumulada de Equipo",
          label: `Primer equipo en llegar a ${formatNumberSpanish(th)} puntos`,
          team: getTeamFormatted(winnerTeam),
          date: dateFormatted,
          icon: <Award className="w-5 h-5 text-purple-600 drop-shadow-sm" />,
          order: earliestDate.getTime(),
          explanation: def?.description || "Premia al primer equipo en la clasificación que alcanza barreras importantes de puntos totales acumulados.",
          triggerDetails: def?.triggerDetails || "Se activa cada 1.000 puntos alcanzados por primera vez en la temporada por un equipo.",
          details: `El equipo ${winnerTeam} alcanzó los ${formatNumberSpanish(th)} puntos acumulados el ${dateFormatted}, convirtiéndose en la primera escuadra fantasy en superar este umbral de puntos.`
        });
      }
    });

    // Sort to process chronologically
    allWins.sort((a, b) => a.date.getTime() - b.date.getTime());
    allAnyWins.sort((a, b) => a.date.getTime() - b.date.getTime());
    allResults.sort((a, b) => a.date.getTime() - b.date.getTime());

    const awardedTeamMonuments = new Set<string>();
    const awardedTeamGTs = new Set<string>();
    const awardedTeamMundial = new Set<string>();
    
    // Team Monument & GT Winners based on Fantasy Race Winners
    if (raceWinners) {
      Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
        if (!winnerTeam || winnerTeam === "No draft" || winnerTeam.includes("No draft") || winnerTeam === "Libre") return;
        const lowerName = raceName.trim().toLowerCase();
        const meta = raceMeta[lowerName];
        if (!meta) return;
        
        const officialRaceName = meta.officialName || raceName;
        const lowerCat = meta.category.toLowerCase();
        const monInfo = getMonumentInfo(lowerName, lowerCat);
        const isMundial = lowerName.includes("campeonato del mundo") || lowerCat.includes("mundial");
        const gtInfo = getGtInfo(lowerName);
        const dateFormatted = meta.dateObj.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' });

        if (monInfo) {
          if (awardedTeamMonuments.has(monInfo.key)) return;
          awardedTeamMonuments.add(monInfo.key);

          const def = getDef("team_monument");
          pushTMilestone("team_monument", {
            id: "team_monument",
            title: def?.title || "Ganador de Monumento (Equipo)",
            label: `Ganador de Monumento (${monInfo.canonicalName})`,
            team: getTeamFormatted(winnerTeam),
            date: dateFormatted,
            icon: <Crown className="w-5 h-5 text-amber-500 drop-shadow-sm" />,
            order: meta.dateObj.getTime(),
            explanation: def?.description || "Otorga un reconocimiento al equipo fantasy que gana la clasificación en un Monumento del ciclismo.",
            triggerDetails: def?.triggerDetails || "Se activa cuando se procesan los resultados de un Monumento.",
            details: `El equipo ${winnerTeam} se proclamó vencedor en el Monumento "${monInfo.canonicalName}" el ${dateFormatted}, acumulando la puntuación conjunta máxima entre todas las escuadras.`
          });
        } else if (isMundial) {
          if (awardedTeamMundial.has("mundial")) return;
          awardedTeamMundial.add("mundial");

          const def = getDef("team_world_championship");
          pushTMilestone("team_world_championship", {
            id: "team_world_championship",
            title: def?.title || "Ganador del Campeonato del Mundo (Equipo)",
            label: `Ganador del Campeonato del Mundo (${officialRaceName})`,
            team: getTeamFormatted(winnerTeam),
            date: dateFormatted,
            icon: <Globe className="w-5 h-5 text-cyan-500 drop-shadow-sm" />,
            order: meta.dateObj.getTime(),
            explanation: def?.description || "Reconoce al equipo fantasy que suma más puntos o se lleva la victoria en la prueba del Mundial.",
            triggerDetails: def?.triggerDetails || "Se activa al finalizar y computar los resultados del Campeonato del Mundo en ruta.",
            details: `El equipo ${winnerTeam} logró la primera posición en la clasificación de equipos del Campeonato del Mundo (${officialRaceName}) el ${dateFormatted}.`
          });
        } else if (gtInfo) {
          if (awardedTeamGTs.has(gtInfo.key)) return;
          awardedTeamGTs.add(gtInfo.key);

          const def = getDef("team_grand_tour");
          pushTMilestone("team_grand_tour", {
            id: "team_grand_tour",
            title: def?.title || "Ganador de Gran Vuelta (Equipo)",
            label: `Ganador de Gran Vuelta (${gtInfo.canonicalName})`,
            team: getTeamFormatted(winnerTeam),
            date: dateFormatted,
            icon: <Trophy className="w-5 h-5 text-emerald-500 drop-shadow-sm" />,
            order: meta.dateObj.getTime(),
            explanation: def?.description || "Concede el hito máximo a la escuadra que se corona en una de las tres Grandes Vueltas de 3 semanas.",
            triggerDetails: def?.triggerDetails || "Se activa al terminar el Giro d'Italia, el Tour de Francia o la Vuelta a España.",
            details: `El equipo ${winnerTeam} conquistó la victoria general en la Gran Vuelta "${gtInfo.canonicalName}" con fecha ${dateFormatted}.`
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

    const processedTeamWinRaces = new Set<string>();
    const allTeamRaceWins: { team: string; raceName: string; date: Date; category: string }[] = [];
    if (raceWinners) {
      Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
        if (!winnerTeam || winnerTeam === "No draft" || winnerTeam.includes("No draft") || winnerTeam === "Libre") return;
        const meta = raceMeta[raceName.toLowerCase()];
        if (meta) {
          const canonicalKey = (meta.officialName || raceName).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
          if (processedTeamWinRaces.has(canonicalKey)) return;
          processedTeamWinRaces.add(canonicalKey);

          allTeamRaceWins.push({
            team: winnerTeam,
            raceName: meta.officialName || raceName,
            date: meta.dateObj,
            category: meta.category
          });
        }
      });
    }
    allTeamRaceWins.sort((a, b) => a.date.getTime() - b.date.getTime());

    for (const win of allTeamRaceWins) {
      if (!teamWinsCount[win.team]) teamWinsCount[win.team] = 0;
      teamWinsCount[win.team]++;
      const dateFormatted = win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      for (const th of winThresholds) {
        if (teamWinsCount[win.team] === th && !achievedWinThresholds.has(th)) {
          achievedWinThresholds.add(th);
          const def = getDef("team_wins_threshold");
          pushTMilestone("team_wins_threshold", {
            id: "team_wins_threshold",
            title: def?.title || "Umbrales de Victorias de Equipo",
            label: `Primer equipo en alcanzar ${th} victorias`,
            team: getTeamFormatted(win.team),
            date: dateFormatted,
            icon: <Award className="w-5 h-5 text-indigo-500 drop-shadow-sm" />,
            order: win.date.getTime(),
            explanation: def?.description || "Se otorga al primer equipo que acumula una cantidad destacada de victorias globales de carreras en la temporada.",
            triggerDetails: def?.triggerDetails || "Se activa al alcanzar 5, 10, 15, 20, 25 o 30 victorias en el total de la carrera.",
            details: `El equipo ${win.team} alcanzó la cifra de ${th} victorias en la temporada el ${dateFormatted} al ganar la prueba "${win.raceName}".`
          });
          break;
        }
      }

      const lowerCat = win.category.toLowerCase();
      const isClassic = lowerCat.startsWith("1.") || lowerCat.includes("clásica");
      const isStageRace = lowerCat.startsWith("2.") || lowerCat.includes("vueltas");
      
      if (isClassic) {
          if (!teamClassicsWinCount[win.team]) teamClassicsWinCount[win.team] = 0;
          teamClassicsWinCount[win.team]++;
          if (teamClassicsWinCount[win.team] === 5 && !achievedTeamClassics5) {
              achievedTeamClassics5 = true;
              const def = getDef("team_classics_5");
              pushTMilestone("team_classics_5", {
                  id: "team_classics_5",
                  title: def?.title || "Tiranía Clasicómana (5 Clásicas)",
                  label: `Tiranía Clasicómana: Primer equipo con 5 victorias en carreras de un día`,
                  team: getTeamFormatted(win.team),
                  date: dateFormatted,
                  icon: <Trophy className="w-5 h-5 text-yellow-600 drop-shadow-sm" />,
                  order: win.date.getTime(),
                  explanation: def?.description || "Destaca al primer equipo que demuestra hegemonía total en carreras de un día.",
                  triggerDetails: def?.triggerDetails || "Se activa para el primer equipo que consigue sumar 5 victorias en carreras de categoría 1.X (Clásicas / 1 día).",
                  details: `El equipo ${win.team} fue la primera escuadra en sumar 5 victorias en clásicas / pruebas de un día, alcanzando la quinta el ${dateFormatted} en "${win.raceName}".`
              });
          }
      }
      if (isStageRace) {
          if (!teamStageWinCount[win.team]) teamStageWinCount[win.team] = 0;
          teamStageWinCount[win.team]++;
          if (teamStageWinCount[win.team] === 5 && !achievedTeamStage5) {
              achievedTeamStage5 = true;
              const def = getDef("team_stage_races_5");
              pushTMilestone("team_stage_races_5", {
                  id: "team_stage_races_5",
                  title: def?.title || "Monopolio en Vueltas (5 Vueltas Menores)",
                  label: `Monopolio en Vueltas: Primer equipo con 5 Generales de Vueltas menores`,
                  team: getTeamFormatted(win.team),
                  date: dateFormatted,
                  icon: <Award className="w-5 h-5 text-orange-500 drop-shadow-sm" />,
                  order: win.date.getTime(),
                  explanation: def?.description || "Otorga un reconocimiento al primer equipo dominante en clasificaciones generales de vueltas por etapas.",
                  triggerDetails: def?.triggerDetails || "Se activa cuando un equipo logra ganar la clasificación general de 5 vueltas por etapas menores (categoría 2.X).",
                  details: `El equipo ${win.team} conquistó la general de 5 vueltas por etapas distintas, sumando la quinta el ${dateFormatted} en "${win.raceName}".`
              });
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
        const dateFormatted = new Date(d3).toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        if (!consecutiveTeamWinFound) {
            for (const team of Array.from(teams)) {
                const teamWins1 = allTeamRaceWins.filter(w => w.date.getTime() === d1 && w.team === team);
                const teamWins2 = allTeamRaceWins.filter(w => w.date.getTime() === d2 && w.team === team);
                const teamWins3 = allTeamRaceWins.filter(w => w.date.getTime() === d3 && w.team === team);
                if (teamWins1.length > 0 && teamWins2.length > 0 && teamWins3.length > 0) {
                    consecutiveTeamWinFound = true;
                    const def = getDef("team_streak_3");
                    pushTMilestone("team_streak_3", {
                        id: "team_streak_3",
                        title: def?.title || "Rachas y Tiranías (3 Victorias Consecutivas)",
                        label: `Rachas y Tiranías: 3 victorias de equipo consecutivas`,
                        team: getTeamFormatted(team),
                        date: dateFormatted,
                        icon: <Award className="w-5 h-5 text-red-500 drop-shadow-sm" />,
                        order: d3,
                        explanation: def?.description || "Recompensa a la escuadra que domina el calendario ganando varias carreras seguidas.",
                        triggerDetails: def?.triggerDetails || "Se activa cuando el mismo equipo consigue la victoria en 3 carreras disputadas de forma consecutiva.",
                        details: `El equipo ${team} encadenó 3 triunfos consecutivos en el calendario de la temporada, cerrando la racha el ${dateFormatted}.`
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
                    const def = getDef("cyclist_streak_3");
                    pushCMilestone("cyclist_streak_3", {
                        id: "cyclist_streak_3",
                        title: def?.title || "Rachas Individuales (3 Victorias Consecutivas)",
                        label: `Rachas y Tiranías: 3 victorias consecutivas`,
                        cyclist: getCyclistFormatted(cyclist),
                        date: dateFormatted,
                        icon: <Award className="w-5 h-5 text-red-500 drop-shadow-sm" />,
                        order: d3,
                        explanation: def?.description || "Otorga el reconocimiento a un corredor en estado de gracia imbatible.",
                        triggerDetails: def?.triggerDetails || "Se activa cuando el mismo ciclista gana la clasificación general de 3 carreras consecutivas.",
                        details: `El corredor ${cyclist} estuvo imbatible y ganó la clasificación general de 3 carreras seguidas en el calendario oficial, completando el triplete el ${dateFormatted}.`
                    });
                    break;
                }
            }
        }
    }

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
    
    const lateRoundThresholds = [500, 1000];
    const achievedCyclistR10Thresholds = new Set<number>();
    const achievedCyclistR20Thresholds = new Set<number>();
    
    const draftStealCyclistsProcessed = new Set<string>();
    
    const teamScorers: Record<string, Set<string>> = {};
    let achievedDeepRoster15 = false;
    let achievedDeepRoster20 = false;
    let achievedDeepRoster25 = false;
    
    const gtStageWins: Record<string, Record<string, number>> = {};
    const achievedGTDominance = new Set<string>();

    for (const res of allResults) {
      if (!cyclistPointsCount[res.cyclist]) cyclistPointsCount[res.cyclist] = 0;
      cyclistPointsCount[res.cyclist] += res.points;
      
      if (!teamScorers[res.team]) teamScorers[res.team] = new Set();
      if (res.points > 0) {
        teamScorers[res.team].add(res.cyclist);
      }
      
      const size = teamScorers[res.team].size;
      const dateFormatted = res.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      if (size === 15 && !achievedDeepRoster15) {
         achievedDeepRoster15 = true;
         const def = getDef("team_deep_roster");
         pushTMilestone("team_deep_roster", {
            id: "team_deep_roster",
            title: def?.title || "Profundidad de Plantilla (15 ciclistas)",
            label: `Plantilla Profunda: Primer equipo con 15 ciclistas distintos que han puntuado`,
            team: getTeamFormatted(res.team),
            date: dateFormatted,
            icon: <Users className="w-5 h-5 text-emerald-600 drop-shadow-sm" />,
            order: res.date.getTime(),
            explanation: def?.description || "Premia la regularidad y trabajo coral de un equipo con muchos corredores aportando puntos.",
            triggerDetails: def?.triggerDetails || "Se activa cuando un equipo consigue que 15, 20 o 25 ciclistas hayan sumado al menos 1 punto.",
            details: `El equipo ${res.team} se convirtió el ${dateFormatted} en el primero en lograr que 15 ciclistas diferentes de su plantilla hayan aportado puntos.`
         });
      }
      
      if (size === 20 && !achievedDeepRoster20) {
         achievedDeepRoster20 = true;
         const def = getDef("team_deep_roster");
         pushTMilestone("team_deep_roster", {
            id: "team_deep_roster",
            title: def?.title || "Profundidad de Plantilla (20 ciclistas)",
            label: `Plantilla Muy Profunda: Primer equipo con 20 ciclistas distintos que han puntuado`,
            team: getTeamFormatted(res.team),
            date: dateFormatted,
            icon: <Users className="w-5 h-5 text-emerald-700 drop-shadow-sm" />,
            order: res.date.getTime(),
            explanation: def?.description || "Premia la regularidad y trabajo coral de un equipo con muchos corredores aportando puntos.",
            triggerDetails: def?.triggerDetails || "Se activa cuando un equipo consigue que 20 ciclistas de su plantilla hayan sumado puntos.",
            details: `El equipo ${res.team} se convirtió el ${dateFormatted} en el primero en conseguir que 20 ciclistas distintos hayan aportado puntos.`
         });
      }
      
      if (size === 25 && !achievedDeepRoster25) {
         achievedDeepRoster25 = true;
         const def = getDef("team_deep_roster");
         pushTMilestone("team_deep_roster", {
            id: "team_deep_roster",
            title: def?.title || "Profundidad de Plantilla (25 ciclistas - Plantilla Completa)",
            label: `Plantilla Completa: Primer equipo en puntuar con todos sus ciclistas (25)`,
            team: getTeamFormatted(res.team),
            date: dateFormatted,
            icon: <Users className="w-5 h-5 text-emerald-800 drop-shadow-sm" />,
            order: res.date.getTime(),
            explanation: def?.description || "Premia la regularidad y trabajo coral de un equipo con la totalidad de corredores aportando puntos.",
            triggerDetails: def?.triggerDetails || "Se activa cuando un equipo consigue que los 25 ciclistas de su plantilla hayan sumado puntos.",
            details: `¡Hazaña coral total! El equipo ${res.team} logró el ${dateFormatted} que la totalidad de sus 25 ciclistas hayan puntuado.`
         });
      }
      
      if (isGt(res.raceName.toLowerCase()) && String(res.rank) === "1" && res.type?.toLowerCase().includes("etapa")) {
          if (!gtStageWins[res.cyclist]) gtStageWins[res.cyclist] = {};
          if (!gtStageWins[res.cyclist][res.raceName]) gtStageWins[res.cyclist][res.raceName] = 0;
          gtStageWins[res.cyclist][res.raceName]++;
          
          if (gtStageWins[res.cyclist][res.raceName] === 3 && !achievedGTDominance.has(res.cyclist + res.raceName)) {
              achievedGTDominance.add(res.cyclist + res.raceName);
              const def = getDef("cyclist_gt_stage_dominance");
              pushCMilestone("cyclist_gt_stage_dominance", {
                 id: "cyclist_gt_stage_dominance",
                 title: def?.title || "Dominio Aplastante (3 Etapas en Gran Vuelta)",
                 label: `Dominio Aplastante: 3 victorias de etapa en ${res.raceName}`,
                 cyclist: getCyclistFormatted(res.cyclist),
                 date: dateFormatted,
                 icon: <Trophy className="w-5 h-5 text-rose-500 drop-shadow-sm" />,
                 order: res.date.getTime(),
                 explanation: def?.description || "Premia al ciclista que impone un dominio feroz en una Gran Vuelta de tres semanas.",
                 triggerDetails: def?.triggerDetails || "Se activa cuando un ciclista individual gana 3 etapas distintas dentro de la misma Gran Vuelta.",
                 details: `El ciclista ${res.cyclist} sumó su 3ª victoria de etapa en la carrera de tres semanas "${res.raceName}" el ${dateFormatted}.`
              });
          }
      }

      for (const th of cyclistPointsThresholds) {
        if (cyclistPointsCount[res.cyclist] >= th && !achievedCyclistPointsThresholds.has(th)) {
           achievedCyclistPointsThresholds.add(th);
           const def = getDef("cyclist_points_threshold");
           pushCMilestone("cyclist_points_threshold", {
             id: "cyclist_points_threshold",
             title: def?.title || "Barreras de Puntos de Ciclista",
             label: `Primer ciclista en alcanzar ${formatNumberSpanish(th)} puntos`,
             cyclist: getCyclistFormatted(res.cyclist),
             date: dateFormatted,
             icon: <Award className="w-5 h-5 text-fuchsia-600 drop-shadow-sm" />,
             order: res.date.getTime(),
             explanation: def?.description || "Pone en valor a los corredores estrella que superan marcas individuales históricas de puntos.",
             triggerDetails: def?.triggerDetails || "Se activa para el primer ciclista en alcanzar 500, 1.000, 2.000, 3.000, etc. puntos.",
             details: `El corredor ${res.cyclist} fue el primer ciclista de la temporada en superar la cifra de ${formatNumberSpanish(th)} puntos individuales acumulados, alcanzándola el ${dateFormatted}.`
           });
        }
      }
      
      for (const th of lateRoundThresholds) {
         if (cyclistPointsCount[res.cyclist] >= th) {
             const meta = (cyclistMetadata?.[res.cyclist] || {}) as Partial<import("../../../../lib/types").CyclistMetadata>;
             const isLibre = !meta.ronda || meta.ronda.toLowerCase().includes("libre");
             const rNum = meta.ronda ? parseInt(meta.ronda.replace(/\D/g, ''), 10) : 99;
             const compareNum = isNaN(rNum) ? (isLibre ? 99 : 1) : rNum;
             
             if (compareNum >= 10 && !achievedCyclistR10Thresholds.has(th)) {
                 achievedCyclistR10Thresholds.add(th);
                 const def = getDef("cyclist_late_round_points");
                 pushCMilestone("cyclist_late_round_points", {
                   id: "cyclist_late_round_points",
                   title: def?.title || "Revelaciones de Rondas Avanzadas",
                   label: `Primer ciclista de ronda >=10 en conseguir ${formatNumberSpanish(th)} puntos`,
                   cyclist: getCyclistFormatted(res.cyclist),
                   date: dateFormatted,
                   icon: <Award className="w-5 h-5 text-indigo-500 drop-shadow-sm" />,
                   order: res.date.getTime(),
                   explanation: def?.description || "Destaca a ciclistas de rondas intermedias o tardías del draft que rinden al nivel de líderes.",
                   triggerDetails: def?.triggerDetails || "Se activa cuando un ciclista drafteado en ronda >=10 alcanza 500 o 1.000 puntos.",
                   details: `Drafteado en la ronda ${meta.ronda || 'tardía'} (${meta.eleccion || 'Libre'}), el corredor ${res.cyclist} superó los ${formatNumberSpanish(th)} puntos aportados el ${dateFormatted}.`
                 });
             }
             if (compareNum >= 20 && !achievedCyclistR20Thresholds.has(th)) {
                 achievedCyclistR20Thresholds.add(th);
                 const def = getDef("cyclist_late_round_points");
                 pushCMilestone("cyclist_late_round_points", {
                   id: "cyclist_late_round_points",
                   title: def?.title || "Revelaciones de Rondas Avanzadas",
                   label: `Primer ciclista de ronda >=20 en conseguir ${formatNumberSpanish(th)} puntos`,
                   cyclist: getCyclistFormatted(res.cyclist),
                   date: dateFormatted,
                   icon: <Award className="w-5 h-5 text-purple-600 drop-shadow-sm" />,
                   order: res.date.getTime(),
                   explanation: def?.description || "Destaca a ciclistas de rondas intermedias o tardías del draft que rinden al nivel de líderes.",
                   triggerDetails: def?.triggerDetails || "Se activa cuando un ciclista drafteado en ronda >=20 alcanza 500 o 1.000 puntos.",
                   details: `Elegido en la ronda ${meta.ronda || 'muy tardía'}, ${res.cyclist} ha rendido como una verdadera estrella acumulando ${formatNumberSpanish(th)} puntos hasta el ${dateFormatted}.`
                 });
             }
         }
      }
      
      // 2. El Robo del Draft
      if (!draftStealCyclistsProcessed.has(res.cyclist) && cyclistPointsCount[res.cyclist] >= 500) {
          const meta = (cyclistMetadata?.[res.cyclist] || {}) as Partial<import("../../../../lib/types").CyclistMetadata>;
          let isLate = true;
          if (meta.ronda) {
              const rNum = parseInt(meta.ronda.replace(/\D/g, ''), 10);
              if (!isNaN(rNum) && rNum < 15) {
                  isLate = false;
              }
          }
          if (isLate) {
              draftStealCyclistsProcessed.add(res.cyclist);
              const def = getDef("cyclist_draft_steal");
              pushCMilestone("cyclist_draft_steal", {
                   id: "cyclist_draft_steal",
                   title: def?.title || "El Robo del Draft",
                   label: `El Robo del Draft: Ciclista escogido en la 15ª ronda o después que logra superar los 500 puntos`,
                   cyclist: getCyclistFormatted(res.cyclist),
                   date: dateFormatted,
                   icon: <Award className="w-5 h-5 text-blue-600 drop-shadow-sm" />,
                   order: res.date.getTime(),
                   explanation: def?.description || "Hito mítico para las mayores gangas y sorpresas de la elección del draft.",
                   triggerDetails: def?.triggerDetails || "Se activa cuando un ciclista elegido en la 15ª ronda del draft o posterior (o libre) logra superar los 500 puntos.",
                   details: `Seleccionado en la ronda ${meta.ronda || 'Libre'} (${meta.eleccion || 'Agente libre'}), ${res.cyclist} ha resultado ser la gran ganga del año superando los 500 puntos acumulados el ${dateFormatted}.`
              });
          }
      }
    }

    for (const win of allWins) {
      if (!cyclistWinCount[win.cyclist]) cyclistWinCount[win.cyclist] = 0;
      cyclistWinCount[win.cyclist]++;
      const dateFormatted = win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      const lowerCat = win.category.toLowerCase();
      const isClassic = lowerCat.startsWith("1.") || lowerCat.includes("clásica");
      const isStageRace = lowerCat.startsWith("2.") || lowerCat.includes("vueltas");
      
      if (isClassic) {
          if (!cyclistClassicsCount[win.cyclist]) cyclistClassicsCount[win.cyclist] = 0;
          cyclistClassicsCount[win.cyclist]++;
          if (cyclistClassicsCount[win.cyclist] === 5 && !achievedCyclistClassics5) {
              achievedCyclistClassics5 = true;
              const def = getDef("cyclist_classics_5");
              pushCMilestone("cyclist_classics_5", {
                  id: "cyclist_classics_5",
                  title: def?.title || "Coleccionista de Clásicas (5 Clásicas)",
                  label: `Coleccionista de Clásicas: Primer ciclista en ganar 5 carreras de un día`,
                  cyclist: getCyclistFormatted(win.cyclist),
                  date: dateFormatted,
                  icon: <Trophy className="w-5 h-5 text-yellow-500 drop-shadow-sm" />,
                  order: win.date.getTime(),
                  explanation: def?.description || "Recompensa al rey indiscutible de las carreras de un día.",
                  triggerDetails: def?.triggerDetails || "Se otorga al primer ciclista que consigue ganar 5 clásicas/carreras de un día en la temporada.",
                  details: `${win.cyclist} fue el primer ciclista en coleccionar 5 triunfos en clásicas esta temporada, logrando el quinto el ${dateFormatted} en "${win.raceName}".`
              });
          }
      }
      
      if (isStageRace) {
          if (!cyclistStageCount[win.cyclist]) cyclistStageCount[win.cyclist] = 0;
          cyclistStageCount[win.cyclist]++;
          if (cyclistStageCount[win.cyclist] === 3 && !achievedCyclistStage3) {
              achievedCyclistStage3 = true;
              const def = getDef("cyclist_stage_races_3");
              pushCMilestone("cyclist_stage_races_3", {
                  id: "cyclist_stage_races_3",
                  title: def?.title || "Especialista en Vueltas (3 Vueltas Menores)",
                  label: `Especialista en Vueltas: Primer ciclista en ganar 3 Vueltas menores`,
                  cyclist: getCyclistFormatted(win.cyclist),
                  date: dateFormatted,
                  icon: <Award className="w-5 h-5 text-orange-500 drop-shadow-sm" />,
                  order: win.date.getTime(),
                  explanation: def?.description || "Destaca al corredor más sólido en vueltas de una semana.",
                  triggerDetails: def?.triggerDetails || "Se concede al primer ciclista que gana la clasificación general de 3 vueltas por etapas menores.",
                  details: `${win.cyclist} se convirtió el ${dateFormatted} en el primer corredor en ganar la general de 3 vueltas por etapas distintas tras su victoria en "${win.raceName}".`
              });
          }
      }
      
      for (const th of cyclistWinThresholds) {
        if (cyclistWinCount[win.cyclist] === th && !achievedCyclistWinThresholds.has(th)) {
           achievedCyclistWinThresholds.add(th);
           const def = getDef("cyclist_wins_threshold");
           pushCMilestone("cyclist_wins_threshold", {
             id: "cyclist_wins_threshold",
             title: def?.title || "Umbrales de Victorias de Ciclista",
             label: `Primer ciclista en alcanzar ${th} victorias`,
             cyclist: getCyclistFormatted(win.cyclist),
             date: dateFormatted,
             icon: <Award className="w-5 h-5 text-rose-500 drop-shadow-sm" />,
             order: win.date.getTime(),
             explanation: def?.description || "Sello de victoria para los caníbales del pelotón que acumulan triunfos individuales.",
             triggerDetails: def?.triggerDetails || "Se activa cuando un ciclista es el primero en alcanzar 5, 10, 15 o 20 victorias individuales.",
             details: `${win.cyclist} fue el primer corredor de la temporada en sumar ${th} victorias individuales, logrando la número ${th} el ${dateFormatted} en "${win.raceName}".`
           });
        }
      }
    }
    
    // 3. Dobletes Legendarios
    // We can compute them by finding all cyclists who won specific pairs of races
    const cyclistGTWins = new Map<string, Set<string>>();
    const cyclistMonumentWins = new Map<string, Set<string>>();
    
    // Monument and GT Winners for Cyclists
    const awardedCyclistMonuments = new Set<string>();
    const awardedCyclistGTs = new Set<string>();
    const awardedCyclistMundial = new Set<string>();

    for (const win of allWins) {
      const lowerCat = win.category.toLowerCase();
      const lowerName = win.raceName.toLowerCase();
      const meta = raceMeta[lowerName];
      const officialRaceName = meta?.officialName || win.raceName;
      const monInfo = getMonumentInfo(lowerName, lowerCat);
      const isMundial = lowerName.includes("campeonato del mundo") || lowerCat.includes("mundial");
      const gtInfo = getGtInfo(lowerName);
      const dateFormatted = win.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' });

      if (monInfo) {
        if (awardedCyclistMonuments.has(monInfo.key)) continue;
        awardedCyclistMonuments.add(monInfo.key);

        const def = getDef("cyclist_monument");
        pushCMilestone("cyclist_monument", {
          id: "cyclist_monument",
          title: def?.title || "Ganador de Monumento (Ciclista)",
          label: `Ganador de Monumento (${monInfo.canonicalName})`,
          cyclist: getCyclistFormatted(win.cyclist),
          date: dateFormatted,
          icon: <Crown className="w-5 h-5 text-amber-500 drop-shadow-sm" />,
          order: win.date.getTime(),
          explanation: def?.description || "Consagra al vencedor de una de las cinco pruebas más prestigiosas de un día.",
          triggerDetails: def?.triggerDetails || "Se activa para el ciclista que gana en Milán-San Remo, Flandes, Roubaix, Lieja o Lombardía.",
          details: `${win.cyclist} conquistó la victoria individual absoluta en el prestigioso Monumento "${monInfo.canonicalName}" el ${dateFormatted}.`
        });
        
        if (!cyclistMonumentWins.has(win.cyclist)) cyclistMonumentWins.set(win.cyclist, new Set());
        if (monInfo.key === "flandes") {
            cyclistMonumentWins.get(win.cyclist)?.add("flandes");
        }
        if (monInfo.key === "roubaix") {
            cyclistMonumentWins.get(win.cyclist)?.add("roubaix");
        }
        const monSet = cyclistMonumentWins.get(win.cyclist);
        if (monSet && monSet.has("flandes") && monSet.has("roubaix") && !monSet.has("doblete_hecho")) {
            monSet.add("doblete_hecho");
            const defDoubles = getDef("cyclist_legendary_doubles");
            pushCMilestone("cyclist_legendary_doubles", {
                id: "cyclist_legendary_doubles",
                title: defDoubles?.title || "Dobletes Legendarios",
                label: `Doblete Legendario: Flandes y Roubaix`,
                cyclist: getCyclistFormatted(win.cyclist),
                date: dateFormatted,
                icon: <Crown className="w-5 h-5 text-yellow-500 drop-shadow-sm" />,
                order: win.date.getTime(),
                explanation: defDoubles?.description || "Reservado a las hazañas históricas dobles en una misma temporada.",
                triggerDetails: defDoubles?.triggerDetails || "Se activa cuando un mismo ciclista gana en el mismo año Flandes + Roubaix.",
                details: `${win.cyclist} firmó un doblete histórico ganando tanto el Tour de Flandes como París-Roubaix en la misma temporada, hito completado el ${dateFormatted}.`
            });
        }
      } else if (isMundial) {
        if (awardedCyclistMundial.has("mundial")) continue;
        awardedCyclistMundial.add("mundial");

        const defWorld = getDef("cyclist_world_championship");
        pushCMilestone("cyclist_world_championship", {
          id: "cyclist_world_championship",
          title: defWorld?.title || "Ganador del Campeonato del Mundo (Ciclista)",
          label: `Ganador del Campeonato del Mundo (${officialRaceName})`,
          cyclist: getCyclistFormatted(win.cyclist),
          date: dateFormatted,
          icon: <Globe className="w-5 h-5 text-cyan-500 drop-shadow-sm" />,
          order: win.date.getTime(),
          explanation: defWorld?.description || "Corona al nuevo portador del maillot arcoíris.",
          triggerDetails: defWorld?.triggerDetails || "Se activa al ciclista que vence la carrera del Campeonato del Mundo en Ruta.",
          details: `${win.cyclist} se proclamó Campeón del Mundo en ruta (${officialRaceName}) el ${dateFormatted}.`
        });
      } else if (gtInfo) {
         if (awardedCyclistGTs.has(gtInfo.key)) continue;
         awardedCyclistGTs.add(gtInfo.key);

         const defGt = getDef("cyclist_grand_tour");
         pushCMilestone("cyclist_grand_tour", {
          id: "cyclist_grand_tour",
          title: defGt?.title || "Ganador de Gran Vuelta (Ciclista)",
          label: `Ganador de Gran Vuelta (${gtInfo.canonicalName})`,
          cyclist: getCyclistFormatted(win.cyclist),
          date: dateFormatted,
          icon: <Trophy className="w-5 h-5 text-emerald-500 drop-shadow-sm" />,
          order: win.date.getTime(),
          explanation: defGt?.description || "Gloria máxima para el vencedor de las 3 semanas de Giro, Tour o Vuelta.",
          triggerDetails: defGt?.triggerDetails || "Se otorga al corredor que conquista la clasificación general final de una Gran Vuelta.",
          details: `${win.cyclist} se vistió con el jersey de líder final conquistando la Gran Vuelta "${gtInfo.canonicalName}" el ${dateFormatted}.`
        });
        
        if (!cyclistGTWins.has(win.cyclist)) cyclistGTWins.set(win.cyclist, new Set());
        cyclistGTWins.get(win.cyclist)?.add(gtInfo.key);
        
        const gtSet = cyclistGTWins.get(win.cyclist);
        if (gtSet && gtSet.has("giro") && gtSet.has("tour") && !gtSet.has("giro-tour-done")) {
            gtSet.add("giro-tour-done");
            const defDoubles = getDef("cyclist_legendary_doubles");
            pushCMilestone("cyclist_legendary_doubles", {
                id: "cyclist_legendary_doubles",
                title: defDoubles?.title || "Dobletes Legendarios",
                label: `Doblete Legendario: Giro y Tour`,
                cyclist: getCyclistFormatted(win.cyclist),
                date: dateFormatted,
                icon: <Crown className="w-5 h-5 text-yellow-500 drop-shadow-sm" />,
                order: win.date.getTime(),
                explanation: defDoubles?.description || "Reservado a las hazañas históricas dobles en una misma temporada.",
                triggerDetails: defDoubles?.triggerDetails || "Se activa cuando un mismo ciclista gana en el mismo año Giro + Tour.",
                details: `${win.cyclist} logró la gesta mítica de conquistar el Giro d'Italia y el Tour de Francia en el mismo año, certificando el doblete el ${dateFormatted}.`
            });
        }
        if (gtSet && gtSet.has("tour") && gtSet.has("vuelta") && !gtSet.has("tour-vuelta-done")) {
            gtSet.add("tour-vuelta-done");
            const defDoubles = getDef("cyclist_legendary_doubles");
            pushCMilestone("cyclist_legendary_doubles", {
                id: "cyclist_legendary_doubles",
                title: defDoubles?.title || "Dobletes Legendarios",
                label: `Doblete Legendario: Tour y Vuelta`,
                cyclist: getCyclistFormatted(win.cyclist),
                date: dateFormatted,
                icon: <Crown className="w-5 h-5 text-yellow-500 drop-shadow-sm" />,
                order: win.date.getTime(),
                explanation: defDoubles?.description || "Reservado a las hazañas históricas dobles en una misma temporada.",
                triggerDetails: defDoubles?.triggerDetails || "Se activa cuando un mismo ciclista gana en el mismo año Tour + Vuelta.",
                details: `${win.cyclist} selló el doblete legendario ganando el Tour de Francia y la Vuelta a España en la misma temporada el ${dateFormatted}.`
            });
        }
        if (gtSet && gtSet.has("giro") && gtSet.has("vuelta") && !gtSet.has("giro-vuelta-done")) {
            gtSet.add("giro-vuelta-done");
            const defDoubles = getDef("cyclist_legendary_doubles");
            pushCMilestone("cyclist_legendary_doubles", {
                id: "cyclist_legendary_doubles",
                title: defDoubles?.title || "Dobletes Legendarios",
                label: `Doblete Legendario: Giro y Vuelta`,
                cyclist: getCyclistFormatted(win.cyclist),
                date: dateFormatted,
                icon: <Crown className="w-5 h-5 text-yellow-500 drop-shadow-sm" />,
                order: win.date.getTime(),
                explanation: defDoubles?.description || "Reservado a las hazañas históricas dobles en una misma temporada.",
                triggerDetails: defDoubles?.triggerDetails || "Se activa cuando un mismo ciclista gana en el mismo año Giro + Vuelta.",
                details: `${win.cyclist} consumó el histórico doblete Giro d'Italia y Vuelta a España en la misma temporada, sellándolo el ${dateFormatted}.`
            });
        }
      }
    }

    tMilestones.sort((a, b) => a.order - b.order);
    cMilestones.sort((a, b) => a.order - b.order);
    return { teamMilestones: tMilestones, cyclistMilestones: cMilestones };
  }, [files.resultados?.data, files.carreras?.data, leaderboard, cyclistMetadata, raceWinners]);

  return { teamMilestones, cyclistMilestones };
};
