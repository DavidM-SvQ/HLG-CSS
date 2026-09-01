import { useEffect } from 'react';
import { useDataStore } from '../stores/useDataStore';
import { useComputedStore } from '../stores/useComputedStore';
import {
  getVal,
  getFlagEmoji,
  parseSafeDateStr,
  normalizeRaceName,
  isSameRace,
  getCategoryAliases,
  getResultTypeAliases,
  getPositionAliases,
} from '../data-processing';

export function useAppComputations() {
  const { files } = useDataStore();
  const setComputedData = useComputedStore((s) => s.setComputedData);
  const setIsComputing = useComputedStore((s) => s.setIsComputing);

  useEffect(() => {
    // Only require the strictly necessary files to start computing
    const hasMinimumFiles = 
      files.resultados?.data && 
      files.equipos?.data && 
      files.puntos?.data && 
      files.elecciones?.data &&
      files.carreras?.data &&
      files.ciclistas?.data;

    if (!hasMinimumFiles) {
      console.warn("Faltan archivos mínimos para computar", {
        res: !!files.resultados?.data?.length,
        eq: !!files.equipos?.data?.length,
        pt: !!files.puntos?.data?.length,
        el: !!files.elecciones?.data?.length,
        car: !!files.carreras?.data?.length,
        cic: !!files.ciclistas?.data?.length
      });
      return;
    }

    const timer = setTimeout(() => {
      setIsComputing(true);

      requestAnimationFrame(() => {
        setTimeout(() => {
          const { carreras, puntos, elecciones, resultados } = files;

        const playerByCyclist: Record<string, string> = {};
        const playerOrderMap: Record<string, string> = {};
        const cyclistRoundMap: Record<string, string> = {};
        const playerTeamMap: Record<string, string> = {};
        const teamToPlayerMap: Record<string, string> = {};
        const cyclistMetadata: Record<string, any> = {};

    const uniquePlayers = [
      ...new Set(
        elecciones.data!.map((r) => getVal(r, "Nombre_TG")?.trim()).filter(Boolean)
      ),
    ] as string[];
    const numPlayers = uniquePlayers.length;

    const fullToBreve: Record<string, string> = {};
    files.equipos.data?.forEach((row: any) => {
      const full = String(getVal(row, "EQUIPO COMPLETO") || "").trim().toLowerCase();
      const breve = String(getVal(row, "EQUIPO BREVE") || "").trim();
      if (full && breve) fullToBreve[full] = breve;
    });

    const cyclistToInfo: Record<string, any> = {};
    files?.ciclistas?.data?.forEach((row: any) => {
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      const pais = String(getVal(row, "Pais") || "").trim();
      const full = String(getVal(row, "Equipo") || "").trim().toLowerCase();
      const url = String(getVal(row, "URL") || getVal(row, "Link") || "").trim();
      let fcId = "";
      let foto = "";
      if (url && url.includes("firstcycling.com")) {
          const match = url.match(/rider\.php\?r=(\d+)/);
          if (match) {
              fcId = match[1];
              foto = `https://firstcycling.com/img/riders/${fcId}.jpg`;
          }
      }
      
      if (ciclista) {
        cyclistToInfo[ciclista] = {
          pais: pais || "",
          paisLetras: pais || "",
          equipoBreve: (full && fullToBreve[full]) || "",
          nacido: "",
          fcId,
          foto
        };
      }
    });

    resultados.data?.forEach((row: any) => {
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      const full = String(getVal(row, "Equipo") || "").trim().toLowerCase();
      const nacido = String(getVal(row, "Nacido") || "").trim();
      const pais = String(getVal(row, "País") || "").trim();
      if (ciclista) {
        if (!cyclistToInfo[ciclista])
          cyclistToInfo[ciclista] = { pais: "", equipoBreve: "", nacido: "", paisLetras: "" };
        if (full && fullToBreve[full]) {
          cyclistToInfo[ciclista].equipoBreve = fullToBreve[full];
        }
        if (nacido) {
          cyclistToInfo[ciclista].nacido = nacido;
        }
        if (pais) {
          cyclistToInfo[ciclista].pais = pais;
          cyclistToInfo[ciclista].paisLetras = pais;
        }
      }
    });

    const cyclistStats: Record<string, { carreras: Set<string>; dias: number; victorias: number }> = {};
    resultados.data?.forEach((row: any) => {
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      const carrera = String(getVal(row, "Carrera") || "").trim();
      const etapa = String(getVal(row, "Etapa") || "").trim();
      const posicion = String(getVal(row, "Posición") || getVal(row, "Pos") || "").trim();

      if (ciclista && carrera) {
        if (!cyclistStats[ciclista]) {
          cyclistStats[ciclista] = { carreras: new Set(), dias: 0, victorias: 0 };
        }
        cyclistStats[ciclista].carreras.add(carrera);

        if (etapa !== "CP" && etapa !== "CM") {
          cyclistStats[ciclista].dias += 1;
        }

        if (posicion === "1") {
          cyclistStats[ciclista].victorias += 1;
        }
      }
    });

    files?.ciclistas?.data?.forEach((row: any) => {
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      if (ciclista) {
        cyclistMetadata[ciclista] = {
          edad: "",
          nacido: cyclistToInfo[ciclista]?.nacido || "",
          pais: getFlagEmoji(cyclistToInfo[ciclista]?.pais || ""),
          paisLetras: cyclistToInfo[ciclista]?.paisLetras || "",
          equipoBreve: cyclistToInfo[ciclista]?.equipoBreve || "",
          ronda: "",
          eleccion: 0,
          carrerasDisputadas: cyclistStats[ciclista]?.carreras.size || 0,
          diasCompeticion: cyclistStats[ciclista]?.dias || 0,
          victorias: cyclistStats[ciclista]?.victorias || 0,
          fcId: cyclistToInfo[ciclista]?.fcId || "",
          foto: cyclistToInfo[ciclista]?.foto || "",
        };
      }
    });

    elecciones.data!.forEach((row: any, idx: number) => {
      const ciclista = String(getVal(row, "Ciclista") || "").trim();
      const jugador = String(getVal(row, "Nombre_TG") || getVal(row, "Jugador") || getVal(row, "Manager") || "").trim();
      const nombreEquipo = String(getVal(row, "Nombre_Equipo") || getVal(row, "Equipo") || "").trim();
      const edad = String(getVal(row, "Edad") || "").trim();
      const paisElecciones = String(getVal(row, "País") || "").trim();

      if (ciclista && jugador) {
        const playerIdx = uniquePlayers.indexOf(jugador);
        playerOrderMap[jugador] = (playerIdx + 1).toString().padStart(2, "0");

        if (nombreEquipo) {
          playerTeamMap[jugador] = nombreEquipo;
          teamToPlayerMap[nombreEquipo] = jugador;
        }

        let ronda = String(getVal(row, "Ronda") || "").trim();
        if (!ronda && numPlayers > 0) {
          ronda = (Math.floor(idx / numPlayers) + 1).toString().padStart(2, "0");
        } else if (ronda) {
          ronda = ronda.padStart(2, "0");
        }

        playerByCyclist[ciclista] = jugador;
        cyclistRoundMap[ciclista] = ronda || "";

        cyclistMetadata[ciclista] = {
          edad: edad || "",
          nacido: cyclistToInfo[ciclista]?.nacido || "",
          pais: getFlagEmoji(paisElecciones || cyclistToInfo[ciclista]?.pais || ""),
          paisLetras: paisElecciones || cyclistToInfo[ciclista]?.paisLetras || "",
          equipoBreve: cyclistToInfo[ciclista]?.equipoBreve || "",
          ronda: ronda || "",
          eleccion: idx + 1,
          carrerasDisputadas: cyclistStats[ciclista]?.carreras.size || 0,
          diasCompeticion: cyclistStats[ciclista]?.dias || 0,
          victorias: cyclistStats[ciclista]?.victorias || 0,
          fcId: cyclistToInfo[ciclista]?.fcId || "",
          foto: cyclistToInfo[ciclista]?.foto || "",
        };
      }
    });

    const norm = (s: any): string => {
        if (!s) return "";
        return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    };
    
    const raceTypeByName: Record<string, string> = {};
    const raceDateByName: Record<string, string> = {};
    const carrerasList: Array<{ original: string; norm: string; canonical: string; categoria: string; fecha: string }> = [];

    const puntosCategories = Array.from(
      new Set(
        puntos.data!
          .map((row: any) => String(getVal(row, "Categoría") || "").trim())
          .filter(Boolean)
      )
    );
    const vueltaCategoryInPoints = puntosCategories.find((cat) => {
      const n = norm(cat);
      return n.includes("vuelta") || n.includes("vueltaciclista");
    }) || "Vuelta a España";

    carreras.data!.forEach((row: any) => {
      const carrera = String(getVal(row, "Carrera") || "").trim();
      let categoria = String(getVal(row, "Categoría") || "").trim();
      const fecha = String(getVal(row, "Fecha") || "").trim();
      if (carrera) {
        const normKey = norm(carrera);
        const canonicalKey = normalizeRaceName(carrera);
        const safeDate = fecha ? parseSafeDateStr(fecha) : "";

        // Strictly ensure "La Vuelta ciclista a España" / "Vuelta a España" uses "Vuelta a España" points category
        if (canonicalKey === "vuelta a espana") {
          categoria = vueltaCategoryInPoints;
        }

        if (categoria) {
          raceTypeByName[normKey] = categoria;
          raceTypeByName[canonicalKey] = categoria;
          raceTypeByName[carrera] = categoria;
          raceTypeByName[carrera.toLowerCase()] = categoria;
        }
        if (fecha) {
          raceDateByName[normKey] = safeDate;
          raceDateByName[canonicalKey] = safeDate;
          raceDateByName[carrera] = safeDate;
          raceDateByName[carrera.toLowerCase()] = safeDate;
        }

        carrerasList.push({
          original: carrera,
          norm: normKey,
          canonical: canonicalKey,
          categoria,
          fecha: safeDate
        });
      }
    });

    const pointsLookup: Record<string, number> = {};
    puntos.data!.forEach((row: any) => {
      const categoria = String(getVal(row, "Categoría") || "").trim();
      const tipo = String(getVal(row, "Tipo") || "").trim();
      const posicion = String(getVal(row, "Posición") || "").trim();
      const pts = getVal(row, "Puntos");

      if (categoria && tipo && pts !== undefined && pts !== null && pts !== "") {
        const numPts = Number(pts);
        if (!isNaN(numPts)) {
          // Direct base key
          const key = `${norm(categoria)}_${norm(tipo)}_${norm(posicion)}`;
          pointsLookup[key] = numPts;

          // Multi-alias keys for robust lookup across variations
          const catAliases = getCategoryAliases(categoria);
          const typeAliases = getResultTypeAliases(tipo);
          const posAliases = getPositionAliases(posicion, tipo);

          for (const cA of catAliases) {
            for (const tA of typeAliases) {
              for (const pA of posAliases) {
                const aliasKey = `${cA}_${tA}_${pA}`;
                if (pointsLookup[aliasKey] === undefined) {
                  pointsLookup[aliasKey] = numPts;
                }
              }
            }
          }
        }
      }
    });

    const scoresMap: Record<string, any> = {};
    const cyclistPointsTotals: Record<string, number> = {};
    const cyclistPointsByRace: Record<string, Record<string, number>> = {};

    let unassignedPointsLog: any[] = [];
    let assignedPointsLog: any[] = [];
    let processingExceptions = 0;
    resultados.data!.forEach((row: any, originalIndex: number) => {
      try {
        const ciclista = String(getVal(row, "Ciclista") || "").trim();
        const carrera = String(getVal(row, "Carrera") || "").trim();
        let tipoResultado = String(getVal(row, "Tipo") || "").trim();
        let etapa = String(getVal(row, "Etapa") || "").trim();
        let posicion = String(getVal(row, "Posición") || getVal(row, "Pos") || "").trim();
        const fechaEspecifica = String(getVal(row, "Fecha") || "").trim();

      // Heuristic to fix FirstCycling shifted columns for General Classification
      if ((posicion.toLowerCase() === "cg" || posicion.toLowerCase() === "gc") && !isNaN(parseInt(etapa, 10))) {
          const temp = posicion;
          posicion = etapa;
          etapa = temp;
      } else if ((etapa.toLowerCase() === "cg" || etapa.toLowerCase() === "gc") && !isNaN(parseInt(posicion, 10))) {
          // It's correct natively
      } else if (isNaN(parseInt(posicion, 10)) && !isNaN(parseInt(etapa, 10)) && etapa !== "") {
          // Another type of shift: Pos is text, and Etapa has the number. Swap them if Tipo means it shouldn't be Etapa.
          if (tipoResultado?.toLowerCase().includes("clasificaci")) {
              posicion = etapa;
          }
      }

      if (!ciclista && !carrera && !tipoResultado && !posicion) {
          // Si son las últimas filas, lo registramos para ver por qué fallan
          if (originalIndex > resultados.data!.length - 100) {
              unassignedPointsLog.push({
                ciclista: "(Fila vacía)",
                carrera: "(Fila vacía)", 
                tipoResultado: "", 
                posicion: "", 
                reason: `Fila ${originalIndex+2} está vacía. Raw keys: ${Object.keys(row).join(',')}`, 
                timestamp: Date.now(),
                originalIndex
              });
          }
          return; // Ignorar filas completamente vacías
      }

      if (!ciclista || !carrera || !tipoResultado) {
          unassignedPointsLog.push({
            ciclista: ciclista || "(Vacio)", 
            carrera: carrera || "(Vacia)", 
            tipoResultado: tipoResultado || "(Vacio)", 
            posicion: posicion, 
            reason: `Faltan campos obligatorios en esta fila de Resultados. (Revisa que Ciclista, Carrera y Tipo no estén vacíos)`, 
            timestamp: Date.now(),
            originalIndex
          });
          return;
      }

      const jugador = playerByCyclist[ciclista] || "No draft";
      
      // Resolve tipoCarrera with robust multi-layer fallback
      const isVueltaRace =
        normalizeRaceName(carrera) === "vuelta a espana" ||
        isSameRace(carrera, "La Vuelta ciclista a España") ||
        isSameRace(carrera, "Vuelta a España");

      let tipoCarrera = isVueltaRace
        ? (vueltaCategoryInPoints || "Vuelta a España")
        : (
            raceTypeByName[carrera] ||
            raceTypeByName[normalizeRaceName(carrera)] ||
            raceTypeByName[norm(carrera)] ||
            raceTypeByName[carrera.toLowerCase().trim()]
          );

      if (!tipoCarrera) {
        const matched = carrerasList.find((r) => isSameRace(r.original, carrera));
        if (matched) {
          tipoCarrera = matched.categoria;
        }
      }

      if (isVueltaRace && vueltaCategoryInPoints) {
        tipoCarrera = vueltaCategoryInPoints;
      }
      
      const debugPts = (pts: number, reason: string) => {
          if (pts === 0) {
              const raceDateStr = fechaEspecifica && fechaEspecifica.length > 0 ? parseSafeDateStr(fechaEspecifica) : (raceDateByName[carrera] || raceDateByName[norm(carrera)] || raceDateByName[normalizeRaceName(carrera)]);
              const timestamp = raceDateStr ? new Date(raceDateStr).getTime() : 0;
              unassignedPointsLog.push({ciclista, carrera, tipoResultado, posicion, reason, timestamp, originalIndex});
          }
      };

      if (!tipoCarrera) {
          debugPts(0, "Carrera no encontrada en tabla de carreras (revisa el nombre exacto)");
          return;
      }

      // Check if it is a one-day race to aid in diagnosing data issues
      const isOneDayRace = tipoCarrera && (
          tipoCarrera.startsWith("1.") || 
          /^mon/i.test(tipoCarrera) || 
          /monumento/i.test(tipoCarrera) ||
          /campeonato/i.test(tipoCarrera)
      );

      // Points resolution with aliases fallback
      let puntosObtenidos = 0;
      const directPointsKey = `${norm(tipoCarrera)}_${norm(tipoResultado)}_${norm(posicion)}`;
      if (pointsLookup[directPointsKey] !== undefined) {
        puntosObtenidos = pointsLookup[directPointsKey];
      } else {
        const candidateCats = getCategoryAliases(tipoCarrera);
        const candidateTypes = getResultTypeAliases(tipoResultado);
        const candidatePositions = getPositionAliases(posicion, tipoResultado);

        for (const cat of candidateCats) {
          if (puntosObtenidos > 0) break;
          for (const type of candidateTypes) {
            if (puntosObtenidos > 0) break;
            for (const pos of candidatePositions) {
              const k = `${cat}_${type}_${pos}`;
              if (pointsLookup[k] !== undefined && pointsLookup[k] > 0) {
                puntosObtenidos = pointsLookup[k];
                break;
              }
            }
          }
        }
      }

      if (puntosObtenidos === 0) {
          const isRetired = ["DNF", "DNS", "OTL", "DSQ", "OOT"].includes(posicion.toString().trim().toUpperCase());
          if (!isRetired) {
            let errorMsg = `No se encontraron puntos para la combinación: Categoría = ${tipoCarrera}, Tipo = ${tipoResultado}, Posición = ${posicion}`;
            if (isOneDayRace && (tipoResultado === "Etapa" || tipoResultado.toLowerCase().includes("etapa"))) {
                errorMsg += ` [AVISO: Esta es una carrera de un día pero se ha subido con el tipo "${tipoResultado}". Las carreras de un día deben registrarse con el tipo "Clasificación final" en el excel de resultados]`;
            }
            debugPts(0, errorMsg);
          }
      } else {
          const raceDateStr = fechaEspecifica && fechaEspecifica.length > 0 ? parseSafeDateStr(fechaEspecifica) : (raceDateByName[carrera] || raceDateByName[norm(carrera)] || raceDateByName[normalizeRaceName(carrera)]);
          const timestamp = raceDateStr ? new Date(raceDateStr).getTime() : 0;
          assignedPointsLog.push({
            ciclista, 
            carrera, 
            tipoResultado, 
            posicion, 
            etapa, 
            fecha: raceDateStr, 
            puntos: puntosObtenidos, 
            timestamp, 
            originalIndex,
            nombreEquipo: jugador === "No draft" ? null : (playerTeamMap[jugador] || jugador),
            orden: jugador === "No draft" ? null : playerOrderMap[jugador],
            ronda: cyclistRoundMap[ciclista] || null
          });
      }

      if (!cyclistPointsTotals[ciclista]) cyclistPointsTotals[ciclista] = 0;
      cyclistPointsTotals[ciclista] += puntosObtenidos;

      if (!cyclistPointsByRace[ciclista]) cyclistPointsByRace[ciclista] = {};
      if (!cyclistPointsByRace[ciclista][carrera])
        cyclistPointsByRace[ciclista][carrera] = 0;
      cyclistPointsByRace[ciclista][carrera] += puntosObtenidos;

      if (!scoresMap[jugador]) {
        scoresMap[jugador] = {
          jugador,
          nombreEquipo: jugador === "No draft" ? "No draft" : playerTeamMap[jugador] || jugador,
          orden: jugador === "No draft" ? "99" : playerOrderMap[jugador] || "",
          puntos: 0,
          detalles: [],
        };
      }

      scoresMap[jugador].puntos += puntosObtenidos;

      scoresMap[jugador].detalles.push({
        ciclista,
        ronda: cyclistRoundMap[ciclista] || "",
        carrera,
        tipoResultado,
        etapa,
        posicion,
        puntosObtenidos,
        fecha: fechaEspecifica && fechaEspecifica.length > 0 ? parseSafeDateStr(fechaEspecifica) : raceDateByName[norm(carrera)],
      });
      } catch (e: any) {
        processingExceptions++;
        console.error(`Error processing row ${originalIndex}:`, e);
      }
    });

    if (processingExceptions > 0) {
      console.error(`Processed with ${processingExceptions} exceptions.`);
    }

    const sortedLeaderboard = Object.values(scoresMap).sort((a: any, b: any) => b.puntos - a.puntos);
    sortedLeaderboard.forEach((player: any) => {
      player.detalles.sort((a: any, b: any) => b.puntosObtenidos - a.puntosObtenidos);
    });

    Object.keys(cyclistMetadata).forEach((ciclista) => {
      cyclistMetadata[ciclista].puntosTotales = cyclistPointsTotals[ciclista] || 0;
      cyclistMetadata[ciclista].puntosPorCarrera = cyclistPointsByRace[ciclista] || {};
    });

    // Compute uniqueRaces
    let uniqueRaces: string[] = [];
    if (resultados.data && carreras.data) {
      uniqueRaces = [...new Set(resultados.data.map((r: any) => getVal(r, "Carrera")))].filter(Boolean) as string[];

      const raceDates: Record<string, number> = {};
      carreras.data.forEach((r: any) => {
        const carreraName = getVal(r, "Carrera")?.trim();
        const fechaFin = getVal(r, "Fecha");
        if (carreraName && fechaFin) {
          const parsedStr = parseSafeDateStr(fechaFin);
          const parts = parsedStr.split(/[-/]/);
          if (parts.length >= 2) {
            let date;
            if (parts.length === 3 && parts[0].length === 4) {
              date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else if (parts.length === 3) {
              date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
            if (date && !isNaN(date.getTime())) raceDates[norm(carreraName)] = date.getTime();
          }
        }
      });
      uniqueRaces.sort((a, b) => {
        const dateA = raceDates[norm(a)] || 0;
        const dateB = raceDates[norm(b)] || 0;
        return dateB - dateA;
      });
    }

    // Compute raceWinners
    const raceWinners: Record<string, string> = {};
    if (carreras.data && resultados.data) {
      const races = carreras.data.map((r: any) => getVal(r, "Carrera")).filter(Boolean) as string[];
      races.forEach((race) => {
        const hasFinalClassification = resultados.data?.some((r: any) => {
          const rCarrera = getVal(r, "Carrera");
          const rTipo = getVal(r, "Tipo");
          return isSameRace(rCarrera, race) && getResultTypeAliases(rTipo).includes("clasificacionfinal");
        });
        if (!hasFinalClassification) return;

        let maxPoints = 0;
        let winnerTeam = "";
        sortedLeaderboard.forEach((player: any) => {
          if (player.nombreEquipo === "No draft" || player.nombreEquipo === "No draft [99]") return;
          const pts = player.detalles
            .filter((d: any) => isSameRace(d.carrera, race))
            .reduce((sum: number, d: any) => sum + d.puntosObtenidos, 0);
          if (pts > maxPoints) {
            maxPoints = pts;
            winnerTeam = player.nombreEquipo;
          }
        });
        if (winnerTeam) {
          raceWinners[race] = winnerTeam;
          const normKey = norm(race);
          if (normKey) raceWinners[normKey] = winnerTeam;
          const canonicalKey = normalizeRaceName(race);
          if (canonicalKey) raceWinners[canonicalKey] = winnerTeam;
        }
      });
    }

    // Compute globalTeamWinsCount
    const globalTeamWinsCount: Record<string, number> = {};
    sortedLeaderboard.forEach((p: any) => {
      if (p.nombreEquipo !== "No draft" && p.nombreEquipo !== "No draft [99]") {
        globalTeamWinsCount[p.nombreEquipo] = 0;
      }
    });
    // Count wins using distinct races
    const evaluatedRaces = new Set<string>();
    Object.entries(raceWinners).forEach(([raceKey, teamName]) => {
      const canonical = normalizeRaceName(raceKey) || norm(raceKey);
      if (!evaluatedRaces.has(canonical)) {
        evaluatedRaces.add(canonical);
        if (globalTeamWinsCount[teamName] !== undefined) {
          globalTeamWinsCount[teamName]++;
        }
      }
    });

    // Compute globalTeamPartialWinsCount
    let partialWins: Record<string, number> = {};
    let byRace: Record<string, Record<string, string[]>> = {};

    if (carreras.data && resultados.data) {
      const eventPoints: Record<string, Record<string, Record<string, number>>> = {};

      sortedLeaderboard.forEach((player: any) => {
        if (player.nombreEquipo === "No draft" || player.nombreEquipo === "No draft [99]") return;
        partialWins[player.nombreEquipo] = 0;
        player.detalles?.forEach((d: any) => {
          const tipoNorm = norm(d.tipoResultado || "");
          const isStage = tipoNorm.includes("etapa") || tipoNorm === "cri" || tipoNorm.includes("crono");
          const isFinal = getResultTypeAliases(d.tipoResultado || "").includes("clasificacionfinal");
          const isLeaderOrSpecial = tipoNorm.includes("lider") || tipoNorm.includes("regularidad") || tipoNorm.includes("montana") || tipoNorm.includes("joven");
          
          if (!isStage && !isFinal && !isLeaderOrSpecial) return;

          const raceName = d.carrera || "";
          const eventKey = `${d.tipoResultado}_${d.etapa || ""}`;
          if (!eventPoints[raceName]) eventPoints[raceName] = {};
          if (!eventPoints[raceName][eventKey]) eventPoints[raceName][eventKey] = {};
          if (!eventPoints[raceName][eventKey][player.nombreEquipo]) eventPoints[raceName][eventKey][player.nombreEquipo] = 0;
          eventPoints[raceName][eventKey][player.nombreEquipo] += d.puntosObtenidos;
        });
      });

      Object.entries(eventPoints).forEach(([raceName, raceEvents]) => {
        byRace[raceName] = {};
        Object.entries(raceEvents).forEach(([eventKey, teamPts]) => {
          let maxPts = 0;
          let winnerTeams: string[] = [];
          Object.entries(teamPts).forEach(([team, pts]) => {
            if (pts > maxPts) {
              maxPts = pts;
              winnerTeams = [team];
            } else if (pts === maxPts && pts > 0) {
              winnerTeams.push(team);
            }
          });
          byRace[raceName][eventKey] = winnerTeams;
          winnerTeams.forEach((team) => {
            if (partialWins[team] !== undefined) partialWins[team]++;
          });
        });
      });
    }

    const globalTeamPartialWinsCount = { totals: partialWins, byRace };

    setComputedData({
      leaderboard: sortedLeaderboard,
      cyclistMetadata,
      playerOrderMap,
      playerByCyclist,
      playerTeamMap,
      teamToPlayerMap,
      cyclistRoundMap,
      uniqueRaces,
      raceWinners,
      globalTeamWinsCount,
      globalTeamPartialWinsCount,
      unassignedPointsLog: unassignedPointsLog.sort((a, b) => {
        return (b.originalIndex || 0) - (a.originalIndex || 0);
      }),
      assignedPointsLog: assignedPointsLog.sort((a, b) => {
        return (b.originalIndex || 0) - (a.originalIndex || 0);
      }),
      debugLastRows: [
        { info: `Total rows in resultados.data: ${resultados.data ? resultados.data.length : 0}` },
        ...(resultados.data || []).slice(resultados.data!.length - 10).map((r, i) => ({
        originalIndex: (resultados.data!.length - 10) + i,
        rawKeys: Object.keys(r).join(', '),
        carrera: r["Carrera"],
        ciclista: r["Ciclista"]
      }))]
    });
    
    setIsComputing(false);
        }, 10);
      });
    }, 500); // Debounce delay

    return () => clearTimeout(timer);
  }, [files, setComputedData, setIsComputing]);
}
