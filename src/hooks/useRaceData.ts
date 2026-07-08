import { AppState, PlayerScore } from '../lib/types';
import { useMemo } from 'react';
import { getVal } from '../lib/data-processing';

export function useRaceData(
  selectedRace: string,
  leaderboard: PlayerScore[],
  globalTeamPartialWinsCount: Record<string, any>,
  globalTeamWinsCount: Record<string, number>,
  raceWinners: Record<string, string>,
  files: AppState,
  cyclistMetadata?: Record<string, any>
) {
  return useMemo(() => {
    if (!selectedRace) return null;

    const raceTeams =
                  leaderboard
                    ?.map((player) => {
                      const details = player.detalles.filter(
                        (d) => d.carrera === selectedRace,
                      );
                      const totalPoints = details.reduce(
                        (sum, d) => sum + d.puntosObtenidos,
                        0,
                      );
                      const uniqueCyclists = new Set(details.map((d) => d.ciclista))
                        .size;
                      return {
                        jugador: player.jugador,
                        nombreEquipo: player.nombreEquipo,
                        orden: player.orden,
                        totalPoints,
                        uniqueCyclists,
                        details,
                      };
                    })
                    .filter(
                      (t) =>
                        t.nombreEquipo !== "No draft" &&
                        t.nombreEquipo !== "No draft [99]",
                    ) || [];
    
                // Calculate partial wins in this race
                raceTeams.forEach((team) => {
                  let partials = 0;
                  const raceEvents =
                    globalTeamPartialWinsCount.byRace[selectedRace] || {};
                  Object.values(raceEvents).forEach((winnerTeams) => {
                    if ((winnerTeams as string[]).includes(team.nombreEquipo)) {
                      partials++;
                    }
                  });
                  (team as any).racePartialWins = partials;
                });
    
                // Sort: 0 cyclists at bottom, then points desc, then cyclists asc
                raceTeams.sort((a, b) => {
                  if (a.uniqueCyclists === 0 && b.uniqueCyclists !== 0) return 1;
                  if (a.uniqueCyclists !== 0 && b.uniqueCyclists === 0) return -1;
                  if (b.totalPoints !== a.totalPoints)
                    return b.totalPoints - a.totalPoints;
                  return a.uniqueCyclists - b.uniqueCyclists;
                });
    
                // Pre-calculate positions
                const rankedTeams = raceTeams.map((team, idx, arr) => {
                  // Find the first team with the same points to determine position
                  const firstInGroup = arr.findIndex(
                    (t) => t.totalPoints === team.totalPoints,
                  );
                  const pos = firstInGroup + 1;
    
                  // Check if this position is tied by counting how many have the same points
                  const countInGroup = arr.filter(
                    (t) => t.totalPoints === team.totalPoints,
                  ).length;
    
                  return { ...team, pos, isTied: countInGroup > 1 };
                });
                const maxUniqueCyclists = Math.max(
                  ...rankedTeams.map((t) => t.uniqueCyclists),
                  0,
                );
                const minUniqueCyclists = Math.min(
                  ...rankedTeams.map((t) => t.uniqueCyclists),
                  0,
                );
                const maxRacePoints = Math.max(
                  ...rankedTeams.map((t) => t.totalPoints),
                  0,
                );
                const minRacePoints = Math.min(
                  ...rankedTeams.map((t) => t.totalPoints),
                  0,
                );
                const maxRacePartialWins = Math.max(
                  ...rankedTeams.map((t) => (t as any).racePartialWins || 0),
                  0,
                );
                const minRacePartialWins = Math.min(
                  ...rankedTeams.map((t) => (t as any).racePartialWins || 0),
                  0,
                );
    
                const allRaceResults =
                  files.resultados.data?.filter(
                    (r) => getVal(r, "Carrera")?.toString().trim() === selectedRace,
                  ) || [];
    
                const formatTipoResultado = (tipo: string) => {
                  const etapaMatch = tipo.match(/Etapa\s+(\d+[a-zA-Z]?)/i);
                  if (etapaMatch) return etapaMatch[1];
                  if (tipo.match(/Clasificación General|CG|Clasificación final/i))
                    return "CG";
                  if (tipo.match(/Clasificación.*Montaña|CM|Montaña final/i))
                    return "CM";
                  if (tipo.match(/Clasificación.*Puntos|CP|Regularidad final/i))
                    return "CP";
                  if (tipo.match(/Clasificación.*Jóvenes|CJ/i)) return "CJ";
                  return tipo;
                };
    
                const columnDefinitions = new Map<
                  string,
                  {
                    originalTipo: string;
                    originalEtapa?: string;
                    formatted: string;
                  }
                >();
    
                allRaceResults.forEach((r) => {
                  const tipo = getVal(r, "Tipo")?.trim();
                  const etapa = getVal(r, "Etapa")?.toString().trim();
    
                  if (!tipo) return;
    
                  const formatted = formatTipoResultado(tipo);
                  const isStage =
                    /^\d+[a-zA-Z]?$/.test(formatted) ||
                    tipo.toLowerCase() === "etapa" ||
                    tipo.toLowerCase().startsWith("etapa");
    
                  if (isStage) {
                    let stageNum = etapa || formatted;
                    if (tipo.toLowerCase().includes("crono") && tipo.toLowerCase().includes("equipo")) {
                      if (etapa) {
                        stageNum = `${etapa} (CRE)`;
                      }
                    }
                    const key = `Stage_${stageNum}`;
                    if (!columnDefinitions.has(key)) {
                      columnDefinitions.set(key, {
                        originalTipo: tipo,
                        originalEtapa: etapa,
                        formatted: stageNum,
                      });
                    }
                  } else {
                    if (!columnDefinitions.has(formatted)) {
                      columnDefinitions.set(formatted, {
                        originalTipo: tipo,
                        formatted: formatted,
                      });
                    }
                  }
                });
    
                const typesWithPoints = new Set<string>();
                raceTeams.forEach((team) =>
                  team?.details?.forEach((d) => {
                    if (d.puntosObtenidos > 0) {
                      const dFormatted = formatTipoResultado(d.tipoResultado);
                      const isDStage =
                        /^\d+[a-zA-Z]?$/.test(dFormatted) ||
                        d.tipoResultado.toLowerCase() === "etapa" ||
                        d.tipoResultado.toLowerCase().startsWith("etapa");
                      if (isDStage) {
                        let finalStageNum = d.etapa || dFormatted;
                        if (d.tipoResultado.toLowerCase().includes("crono") && d.tipoResultado.toLowerCase().includes("equipo")) {
                          if (d.etapa) {
                            finalStageNum = `${d.etapa} (CRE)`;
                          }
                        }
                        typesWithPoints.add(finalStageNum);
                      } else {
                        typesWithPoints.add(dFormatted);
                      }
                    }
                  }),
                );
    
                // Filter out CM/CP if no points
                const finalColumns = Array.from(columnDefinitions.values()).filter(
                  (col) => {
                    if (col.formatted === "CM" || col.formatted === "CP") {
                      return typesWithPoints.has(col.formatted);
                    }
                    return true;
                  },
                );
    
                finalColumns.sort((a, b) => {
                  const isNumA = /^\d+[a-zA-Z]?(\s*\(CRE\))?$/.test(a.formatted);
                  const isNumB = /^\d+[a-zA-Z]?(\s*\(CRE\))?$/.test(b.formatted);
                  if (isNumA && isNumB) {
                    const valA = parseInt(a.formatted.replace(/\s*\(CRE\)/i, '')) || 0;
                    const valB = parseInt(b.formatted.replace(/\s*\(CRE\)/i, '')) || 0;
                    return valA - valB;
                  }
                  if (isNumA) return -1;
                  if (isNumB) return 1;
    
                  const order = ["CG", "CP", "CM", "CJ"];
                  const idxA = order.indexOf(a.formatted);
                  const idxB = order.indexOf(b.formatted);
                  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                  if (idxA !== -1) return -1;
                  if (idxB !== -1) return 1;
                  return a.formatted.localeCompare(b.formatted);
                });
    
                const teamStagePoints = rankedTeams
                  .map((team) => {
                    const pointsByCol: Record<string, number> = {};
                    finalColumns.forEach((col) => {
                      pointsByCol[col.formatted] = team.details
                        .filter((d) => {
                          const dFormatted = formatTipoResultado(d.tipoResultado);
                          const dStageNum = d.etapa || dFormatted;
                          
                          const colIsStage = /^\d+[a-zA-Z]?(\s*\(CRE\))?$/.test(col.formatted);
                          const dIsStage = /^\d+[a-zA-Z]?$/.test(dFormatted) || d.tipoResultado.toLowerCase() === "etapa" || d.tipoResultado.toLowerCase().startsWith("etapa");
    
                          if (colIsStage && dIsStage) {
                            const colBase = col.formatted.replace(/\s*\(CRE\)/i, '').trim();
                            const dBase = dStageNum.toString().trim();
                            return dBase === colBase;
                          }
                          
                          return dFormatted.toString().trim() === col.formatted.toString().trim() || 
                                 d.tipoResultado.toString().trim() === col.originalTipo?.toString().trim();
                        })
                        .reduce((sum, d) => sum + d.puntosObtenidos, 0);
                    });
                    return {
                      jugador: team.jugador,
                      nombreEquipo: team.nombreEquipo,
                      orden: team.orden,
                      total: team.totalPoints,
                      pos: team.pos,
                      isTied: team.isTied,
                      uniqueCyclists: team.uniqueCyclists,
                      pointsByCol,
                    };
                  })
                  .filter(
                    (t) =>
                      t.nombreEquipo !== "No draft" &&
                      t.nombreEquipo !== "No draft [99]",
                  );
    
                const maxPointsByCol: Record<string, number> = {};
                finalColumns.forEach((col) => {
                  maxPointsByCol[col.formatted] = Math.max(
                    ...teamStagePoints.map(
                      (t) => t.pointsByCol[col.formatted] || 0,
                    ),
                  );
                });
    
                const raceCyclistsMap = new Map<
                  string,
                  {
                    ciclista: string;
                    ronda: string;
                    jugador: string;
                    orden: string;
                    puntos: number;
                    victorias: number;
                    pointsByCol: Record<string, number>;
                  }
                >();
    
                raceTeams.forEach((team) => {
                  team?.details?.forEach((d) => {
                    if (!raceCyclistsMap.has(d.ciclista)) {
                      raceCyclistsMap.set(d.ciclista, {
                        ciclista: d.ciclista,
                        ronda: d.ronda,
                        jugador: team.nombreEquipo,
                        orden: team.orden,
                        puntos: 0,
                        victorias: 0,
                        pointsByCol: {}
                      });
                    }
                    const c = raceCyclistsMap.get(d.ciclista)!;
                    c.jugador = team.nombreEquipo; // Ensure it uses the team name if updated
                    c.puntos += d.puntosObtenidos;

                    const dFormatted = formatTipoResultado(d.tipoResultado);
                    const dStageNum = d.etapa || dFormatted;
                    finalColumns.forEach(col => {
                      const colIsStage = /^\d+[a-zA-Z]?(\s*\(CRE\))?$/.test(col.formatted);
                      const dIsStage = /^\d+[a-zA-Z]?$/.test(dFormatted) || d.tipoResultado.toLowerCase() === "etapa" || d.tipoResultado.toLowerCase().startsWith("etapa");
                      if (colIsStage && dIsStage) {
                        const colBase = col.formatted.replace(/\s*\(CRE\)/i, '').trim();
                        const dBase = dStageNum.toString().trim();
                        if (dBase === colBase) {
                          c.pointsByCol[col.formatted] = (c.pointsByCol[col.formatted] || 0) + d.puntosObtenidos;
                        }
                      } else {
                        if (dFormatted.toString().trim() === col.formatted.toString().trim() || d.tipoResultado.toString().trim() === col.originalTipo?.toString().trim()) {
                          c.pointsByCol[col.formatted] = (c.pointsByCol[col.formatted] || 0) + d.puntosObtenidos;
                        }
                      }
                    });
    
                    const isVictory =
                      (d.posicion === "1" || d.posicion === "01") &&
                      d.tipoResultado !== "Montaña final" &&
                      d.tipoResultado !== "Regularidad final";
                    if (isVictory) {
                      c.victorias += 1;
                    }
                  });
                });
    
                const raceCyclists = Array.from(raceCyclistsMap.values())
                  .filter((c) => c.puntos > 0 || c.victorias > 0)
                  .sort((a, b) => b.puntos - a.puntos);
    
                const maxCyclistRacePoints = Math.max(
                  ...raceCyclists.map((c) => c.puntos),
                  0,
                );
                const minCyclistRacePoints = Math.min(
                  ...raceCyclists.map((c) => c.puntos),
                  0,
                );
    
                const maxCyclistPointsByCol: Record<string, number> = {};
                finalColumns.forEach((col) => {
                  maxCyclistPointsByCol[col.formatted] = Math.max(
                    ...raceCyclists.map(
                      (c) => c.pointsByCol[col.formatted] || 0,
                    ),
                    0
                  );
                });
    
                const __raceWinnerTeam = raceWinners?.[selectedRace];
                const __winnerPlayer = __raceWinnerTeam
                  ? leaderboard?.find((p) => p.nombreEquipo === __raceWinnerTeam)
                  : null;
                const __winnerNombreTG = __winnerPlayer
                  ? __winnerPlayer.nombreEquipo
                  : "...";
                const __winnerWins =
                  __raceWinnerTeam && globalTeamWinsCount
                    ? globalTeamWinsCount[__raceWinnerTeam] || 1
                    : 1;
    
                const __bestCyclist =
                  raceCyclists.length > 0 ? raceCyclists[0] : null;
                const __bestCyclistName = __bestCyclist
                  ? __bestCyclist.ciclista
                  : "...";
                const __bestCyclistPoints = __bestCyclist
                  ? __bestCyclist.puntos
                  : 0;
    
                const __eventsInfo =
                  globalTeamPartialWinsCount?.byRace?.[selectedRace] || {};
                const __stageWinsByUser: Record<string, number> = {};
                let __generalWinners: string[] = [];
                let __pointsWinners: string[] = [];
                let __mountainWinners: string[] = [];
                let __hasEtapas = false;
                
                let __isOneDayRace = false;
                if (files?.carreras?.data) {
                  const currRace = files.carreras.data.find((c: any) => getVal(c, "Carrera")?.trim() === selectedRace.trim());
                  if (currRace) {
                    const cat = getVal(currRace, "Categoría") || "";
                    __isOneDayRace = cat.startsWith("1.") || /^mon/i.test(cat) || /monumento/i.test(cat) || /campeonato/i.test(cat) || /ruta/i.test(cat);
                  }
                }
    
                Object.entries(__eventsInfo).forEach(([eventKey, _teams]) => {
                  const teams = _teams as string[];
                  if (eventKey.startsWith("Etapa")) {
                    __hasEtapas = true;
                    teams.forEach((t) => {
                      const p = leaderboard?.find((p) => p.nombreEquipo === t);
                      const tName = p ? p.nombreEquipo : t;
                      __stageWinsByUser[tName] =
                        (__stageWinsByUser[tName] || 0) + 1;
                    });
                  }
                });

                // Scan all player records to find winners of key classifications in selectedRace
                leaderboard?.forEach((player) => {
                  if (player.nombreEquipo === "No draft" || player.nombreEquipo === "No draft [99]") return;
                  player.detalles?.forEach((d) => {
                    if (d.carrera !== selectedRace) return;
                    const pos = String(d.posicion || "").trim();
                    if (pos === "1" || pos === "01") {
                      const tipoLower = String(d.tipoResultado || "").toLowerCase();
                      
                      // General
                      if (
                        tipoLower.includes("clasificación final") || 
                        tipoLower.includes("clasificación general") || 
                        tipoLower === "cg" || 
                        d.tipoResultado === "Clasificación final (Crono equipos)"
                      ) {
                        if (!__generalWinners.includes(player.nombreEquipo)) {
                          __generalWinners.push(player.nombreEquipo);
                        }
                      }
                      
                      // Puntos
                      if (
                        tipoLower.includes("regularidad final") || 
                        tipoLower.includes("puntos final") || 
                        tipoLower.includes("puntos") || 
                        tipoLower === "cp"
                      ) {
                        if (d.puntosObtenidos > 0 && !__pointsWinners.includes(player.nombreEquipo)) {
                          __pointsWinners.push(player.nombreEquipo);
                        }
                      }
                      
                      // Montaña
                      if (
                        tipoLower.includes("montaña final") || 
                        tipoLower.includes("montaña") || 
                        tipoLower === "cm"
                      ) {
                        if (d.puntosObtenidos > 0 && !__mountainWinners.includes(player.nombreEquipo)) {
                          __mountainWinners.push(player.nombreEquipo);
                        }
                      }
                    }
                  });
                });

                const formatListSpanish = (items: string[]) => {
                  if (items.length === 0) return "";
                  if (items.length === 1) return items[0];
                  const butLast = items.slice(0, -1).join(", ");
                  const last = items[items.length - 1];
                  return `${butLast} y ${last}`;
                };
    
                // Group stage winners by win count
                const __groupedByCount: Record<number, string[]> = {};
                Object.entries(__stageWinsByUser).forEach(([user, count]) => {
                  if (!__groupedByCount[count]) {
                    __groupedByCount[count] = [];
                  }
                  __groupedByCount[count].push(user);
                });

                // Sort counts descending
                const __sortedCounts = Object.keys(__groupedByCount)
                  .map(Number)
                  .sort((a, b) => b - a);

                const __etapasStr = __sortedCounts
                  .map((count) => {
                    const trophies = "🏆".repeat(count);
                    const teamsFormatted = formatListSpanish(__groupedByCount[count]);
                    return `${trophies} ${teamsFormatted}`;
                  })
                  .join("\n");

                let __extraClassifications = "";
                if (__generalWinners.length > 0 && !__isOneDayRace) {
                  __extraClassifications += `\n🏆 ${formatListSpanish(__generalWinners)} se lleva la clasificación general`;
                }
                if (__pointsWinners.length > 0) {
                  __extraClassifications += `\n🏆 ${formatListSpanish(__pointsWinners)} gana la clasificación por puntos`;
                }
                if (__mountainWinners.length > 0) {
                  __extraClassifications += `\n🏆 ${formatListSpanish(__mountainWinners)} gana la clasificación de la montaña`;
                }
    
                const __textValue =
                  `🏁 **CARRERA FINALIZADA: ${selectedRace}** 🏁
Victoria para ${__winnerNombreTG} (${__winnerWins}ª de la temporada)
    
🚴‍♂️ ${__bestCyclistName} con ${__bestCyclistPoints} es el ciclista con más puntos.` +
                  (__hasEtapas
                    ? `\n\nGanadores de etapa:\n${__etapasStr}\n${__extraClassifications}`
                    : __extraClassifications ? `\n\n${__extraClassifications.trim()}` : "");
    
                const cyclistToInfo = new Map<string, { equipo: string, orden: string, ronda: string, tempPoints: number, racePoints: number }>();
                leaderboard?.forEach(player => {
                  const teamName = player.nombreEquipo;
                  const orden = player.orden;
                  
                  const tempPointsByCyc = new Map<string, number>();
                  const racePointsByCyc = new Map<string, number>();
                  const rondaByCyc = new Map<string, string>();

                  player.detalles?.forEach((d: any) => {
                      tempPointsByCyc.set(d.ciclista, (tempPointsByCyc.get(d.ciclista) || 0) + d.puntosObtenidos);
                      if(d.carrera === selectedRace) {
                          racePointsByCyc.set(d.ciclista, (racePointsByCyc.get(d.ciclista) || 0) + d.puntosObtenidos);
                      }
                      if(d.ronda) {
                          rondaByCyc.set(d.ciclista, d.ronda);
                      }
                  });

                  for(const [cyc, totalPts] of tempPointsByCyc.entries()) {
                      cyclistToInfo.set(cyc, {
                          equipo: teamName,
                          orden: orden,
                          ronda: rondaByCyc.get(cyc) || "Libre",
                          tempPoints: totalPts,
                          racePoints: racePointsByCyc.get(cyc) || 0
                      });
                  }
                });

                if (cyclistMetadata) {
                  Object.entries(cyclistMetadata).forEach(([cyc, meta]: [string, any]) => {
                    const equipo = meta.equipo || "Libre";
                    if (!cyclistToInfo.has(cyc)) {
                      cyclistToInfo.set(cyc, {
                        equipo: equipo,
                        orden: meta.playerOrder || "",
                        ronda: meta.ronda || "Libre",
                        tempPoints: 0,
                        racePoints: 0
                      });
                    }
                  });
                }

                const retiredStrings = ["DNF", "DNS", "OOT", "DSQ", "OTL"];
                const isStageRace = finalColumns.some((c) => /^\d+/.test(c.formatted)) || finalColumns.length > 1;
                const retiredCyclists: { ciclista: string, status: string, etapa: string, ronda: string, equipo: string, orden: string, tempPoints: number, racePoints: number }[] = [];
                
                const uniquePlayers = [
                  ...new Set(
                    files.elecciones?.data
                      ?.map((r: any) => getVal(r, "Nombre_TG")?.trim())
                      .filter(Boolean)
                  )
                ] as string[];
                const numPlayers = uniquePlayers.length;

                const playerInfoMap = new Map<string, { nombreEquipo: string, orden: string }>();
                leaderboard?.forEach((p) => {
                  playerInfoMap.set(p.jugador, {
                    nombreEquipo: p.nombreEquipo,
                    orden: p.orden
                  });
                });

                const cyclistDraftInfo = new Map<string, { equipo: string, orden: string, ronda: string }>();
                files.elecciones?.data?.forEach((row: any, idx: number) => {
                    const ciclista = String(getVal(row, "Ciclista") || "").trim();
                    const jugador = String(getVal(row, "Nombre_TG") || getVal(row, "Jugador") || getVal(row, "Manager") || "").trim();
                    
                    if (ciclista && jugador) {
                        let ronda = String(getVal(row, "Ronda") || "").trim();
                        if (!ronda && numPlayers > 0) {
                            ronda = (Math.floor(idx / numPlayers) + 1).toString().padStart(2, "0");
                        } else if (ronda) {
                            ronda = ronda.padStart(2, "0");
                        }

                        const pInfo = playerInfoMap.get(jugador);
                        const equipo = pInfo?.nombreEquipo || String(getVal(row, "Nombre_Equipo") || getVal(row, "Equipo") || jugador).trim();
                        const orden = pInfo?.orden || (uniquePlayers.indexOf(jugador) + 1).toString().padStart(2, "0");

                        if (equipo && equipo !== "No draft" && equipo !== "No draft [99]" && !equipo.toLowerCase().includes("libre")) {
                            cyclistDraftInfo.set(ciclista, { equipo, orden, ronda });
                        }
                    }
                });

                const processed = new Set();
                allRaceResults.forEach(r => {
                    const posStr = (getVal(r, "Pos") || getVal(r, "Posición"))?.toString().trim().toUpperCase() || "";
                    const isRetired = retiredStrings.some(rs => posStr.includes(rs));
                    const cyclistName = getVal(r, "Ciclista")?.toString().trim();
                    const statusVal = retiredStrings.find(rs => posStr.includes(rs)) || posStr;
                    
                    if (isRetired && cyclistName && !processed.has(cyclistName)) {
                      const draftInfo = cyclistDraftInfo.get(cyclistName);
                      const equipo = draftInfo?.equipo || "Libre";
                      const info = cyclistToInfo.get(cyclistName) || { tempPoints: 0, racePoints: 0 };
                      
                      if (equipo !== "Libre" && equipo !== "No draft") {
                        retiredCyclists.push({
                            ciclista: cyclistName,
                            ronda: draftInfo?.ronda || "Libre",
                            equipo: draftInfo?.equipo || "Libre",
                            orden: draftInfo?.orden || "99",
                            tempPoints: info.tempPoints || 0,
                            racePoints: info.racePoints || 0,
                            status: statusVal,
                            etapa: getVal(r, "Etapa")?.toString() || ""
                        });
                      }
                      processed.add(cyclistName);
                    }
                });
                retiredCyclists.sort((a,b) => a.equipo.localeCompare(b.equipo));

    return {
      raceTeams,
      rankedTeams,
      maxUniqueCyclists,
      minUniqueCyclists,
      maxRacePoints,
      minRacePoints,
      maxRacePartialWins,
      minRacePartialWins,
      allRaceResults,
      finalColumns,
      teamStagePoints,
      maxPointsByCol,
      raceCyclistsMap,
      raceCyclists,
      maxCyclistRacePoints,
      minCyclistRacePoints,
      maxCyclistPointsByCol,
      __textValue,
      retiredCyclists
    };
  }, [selectedRace, leaderboard, globalTeamPartialWinsCount, globalTeamWinsCount, raceWinners, files, cyclistMetadata]);
}
