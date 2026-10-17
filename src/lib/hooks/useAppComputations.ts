import { useEffect, useRef } from 'react';
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

interface CyclistInfo {
  pais: string;
  paisLetras: string;
  equipoBreve: string;
  nacido: string;
  fcId: string;
  foto: string;
}

interface RaceIndexedInfo {
  original: string;
  norm: string;
  canonical: string;
  categoria: string;
  fecha: string;
  timestamp: number;
}

// Global lightweight LRU-like normalization cache to avoid repeated Unicode decompositions
const globalNormCache = new Map<string, string>();
const fastNorm = (s: any): string => {
  if (!s) return "";
  const str = String(s);
  let res = globalNormCache.get(str);
  if (res === undefined) {
    res = str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    if (globalNormCache.size < 4000) {
      globalNormCache.set(str, res);
    }
  }
  return res;
};

export function useAppComputations() {
  const { files } = useDataStore();
  const setComputedData = useComputedStore((s) => s.setComputedData);
  const setIsComputing = useComputedStore((s) => s.setIsComputing);
  const lastDataSig = useRef<string>("");

  useEffect(() => {
    // Only require the strictly necessary files to start computing
    const hasMinimumFiles = 
      Array.isArray(files.resultados?.data) && 
      Array.isArray(files.equipos?.data) && 
      Array.isArray(files.puntos?.data) && 
      Array.isArray(files.elecciones?.data) &&
      Array.isArray(files.carreras?.data) &&
      Array.isArray(files.ciclistas?.data);

    if (!hasMinimumFiles) {
      return;
    }

    const currentSig = `${files.resultados?.data?.length || 0}_${files.equipos?.data?.length || 0}_${files.puntos?.data?.length || 0}_${files.elecciones?.data?.length || 0}_${files.carreras?.data?.length || 0}_${files.ciclistas?.data?.length || 0}_${files.resultados?.updatedAt || ""}`;
    if (currentSig === lastDataSig.current && lastDataSig.current !== "") {
      return;
    }

    const timer = setTimeout(() => {
      lastDataSig.current = currentSig;
      setIsComputing(true);

      requestAnimationFrame(() => {
        setTimeout(() => {
          const { carreras, puntos, elecciones, resultados } = files;

          // -----------------------------------------------------------------
          // 1. Teams Map: EQUIPO COMPLETO -> EQUIPO BREVE
          // -----------------------------------------------------------------
          const fullToBreveMap = new Map<string, string>();
          files.equipos.data?.forEach((row: any) => {
            const full = String(getVal(row, "EQUIPO COMPLETO") || "").trim().toLowerCase();
            const breve = String(getVal(row, "EQUIPO BREVE") || "").trim();
            if (full && breve) fullToBreveMap.set(full, breve);
          });

          // -----------------------------------------------------------------
          // 2. Cyclist Info Map: ciclista -> CyclistInfo
          // -----------------------------------------------------------------
          const cyclistToInfoMap = new Map<string, CyclistInfo>();
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
              cyclistToInfoMap.set(ciclista, {
                pais: pais || "",
                paisLetras: pais || "",
                equipoBreve: (full && fullToBreveMap.get(full)) || "",
                nacido: "",
                fcId,
                foto,
              });
            }
          });

          // Enrich cyclist info with additional details from resultados (Nacido, Pais, etc.)
          resultados.data?.forEach((row: any) => {
            const ciclista = String(getVal(row, "Ciclista") || "").trim();
            if (!ciclista) return;

            const full = String(getVal(row, "Equipo") || "").trim().toLowerCase();
            const nacido = String(getVal(row, "Nacido") || "").trim();
            const pais = String(getVal(row, "País") || "").trim();

            let info = cyclistToInfoMap.get(ciclista);
            if (!info) {
              info = { pais: "", equipoBreve: "", nacido: "", paisLetras: "", fcId: "", foto: "" };
              cyclistToInfoMap.set(ciclista, info);
            }
            if (full && fullToBreveMap.has(full)) {
              info.equipoBreve = fullToBreveMap.get(full)!;
            }
            if (nacido) {
              info.nacido = nacido;
            }
            if (pais) {
              info.pais = pais;
              info.paisLetras = pais;
            }
          });

          // -----------------------------------------------------------------
          // 3. Cyclist Statistics Map: ciclista -> { carreras, dias, victorias }
          // -----------------------------------------------------------------
          const cyclistStatsMap = new Map<string, { carreras: Set<string>; dias: number; victorias: number }>();
          resultados.data?.forEach((row: any) => {
            const ciclista = String(getVal(row, "Ciclista") || "").trim();
            const carrera = String(getVal(row, "Carrera") || "").trim();
            const etapa = String(getVal(row, "Etapa") || "").trim();
            const posicion = String(getVal(row, "Posición") || getVal(row, "Pos") || "").trim();

            if (ciclista && carrera) {
              let stats = cyclistStatsMap.get(ciclista);
              if (!stats) {
                stats = { carreras: new Set(), dias: 0, victorias: 0 };
                cyclistStatsMap.set(ciclista, stats);
              }
              stats.carreras.add(carrera);

              if (etapa !== "CP" && etapa !== "CM") {
                stats.dias += 1;
              }

              if (posicion === "1") {
                stats.victorias += 1;
              }
            }
          });

          // -----------------------------------------------------------------
          // 4. Initial Cyclist Metadata
          // -----------------------------------------------------------------
          const cyclistMetadata: Record<string, any> = {};
          files?.ciclistas?.data?.forEach((row: any) => {
            const ciclista = String(getVal(row, "Ciclista") || "").trim();
            if (ciclista) {
              const info = cyclistToInfoMap.get(ciclista);
              const stats = cyclistStatsMap.get(ciclista);
              cyclistMetadata[ciclista] = {
                edad: "",
                nacido: info?.nacido || "",
                pais: getFlagEmoji(info?.pais || ""),
                paisLetras: info?.paisLetras || "",
                equipoBreve: info?.equipoBreve || "",
                ronda: "",
                eleccion: 0,
                carrerasDisputadas: stats?.carreras.size || 0,
                diasCompeticion: stats?.dias || 0,
                victorias: stats?.victorias || 0,
                fcId: info?.fcId || "",
                foto: info?.foto || "",
              };
            }
          });

          // -----------------------------------------------------------------
          // 5. Elecciones (Draft) Processing with O(1) Player Index Map
          // -----------------------------------------------------------------
          const playerByCyclist: Record<string, string> = {};
          const playerOrderMap: Record<string, string> = {};
          const cyclistRoundMap: Record<string, string> = {};
          const playerTeamMap: Record<string, string> = {};
          const teamToPlayerMap: Record<string, string> = {};

          const uniquePlayersList: string[] = [];
          const playerIndexMap = new Map<string, string>();

          elecciones.data!.forEach((r) => {
            const jugador = String(getVal(r, "Nombre_TG") || getVal(r, "Jugador") || getVal(r, "Manager") || "").trim();
            if (jugador && !playerIndexMap.has(jugador)) {
              uniquePlayersList.push(jugador);
              playerIndexMap.set(jugador, String(uniquePlayersList.length).padStart(2, "0"));
            }
          });
          const numPlayers = uniquePlayersList.length;

          elecciones.data!.forEach((row: any, idx: number) => {
            const ciclista = String(getVal(row, "Ciclista") || "").trim();
            const jugador = String(getVal(row, "Nombre_TG") || getVal(row, "Jugador") || getVal(row, "Manager") || "").trim();
            const nombreEquipo = String(getVal(row, "Nombre_Equipo") || getVal(row, "Equipo") || "").trim();
            const edad = String(getVal(row, "Edad") || "").trim();
            const paisElecciones = String(getVal(row, "País") || "").trim();

            if (ciclista && jugador) {
              const paddedOrder = playerIndexMap.get(jugador) || "99";
              playerOrderMap[jugador] = paddedOrder;

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

              const info = cyclistToInfoMap.get(ciclista);
              const stats = cyclistStatsMap.get(ciclista);

              cyclistMetadata[ciclista] = {
                edad: edad || "",
                nacido: info?.nacido || "",
                pais: getFlagEmoji(paisElecciones || info?.pais || ""),
                paisLetras: paisElecciones || info?.paisLetras || "",
                equipoBreve: info?.equipoBreve || "",
                ronda: ronda || "",
                eleccion: idx + 1,
                carrerasDisputadas: stats?.carreras.size || 0,
                diasCompeticion: stats?.dias || 0,
                victorias: stats?.victorias || 0,
                fcId: info?.fcId || "",
                foto: info?.foto || "",
              };
            }
          });

          // -----------------------------------------------------------------
          // 6. Fast Multi-Indexed Race Maps (O(1) lookups for category & dates)
          // -----------------------------------------------------------------
          const puntosCategories = Array.from(
            new Set(
              puntos.data!
                .map((row: any) => String(getVal(row, "Categoría") || "").trim())
                .filter(Boolean)
            )
          );
          const vueltaCategoryInPoints = puntosCategories.find((cat) => {
            const n = fastNorm(cat);
            return n.includes("vuelta") || n.includes("vueltaciclista");
          }) || "Vuelta a España";

          // Maps for O(1) category, date and timestamp resolution
          const raceCategoryMap = new Map<string, string>();
          const raceDateMap = new Map<string, string>();
          const raceTimestampMap = new Map<string, number>();
          const carrerasList: RaceIndexedInfo[] = [];

          carreras.data!.forEach((row: any) => {
            const carrera = String(getVal(row, "Carrera") || "").trim();
            let categoria = String(getVal(row, "Categoría") || "").trim();
            const fecha = String(getVal(row, "Fecha") || "").trim();

            if (carrera) {
              const normKey = fastNorm(carrera);
              const canonicalKey = normalizeRaceName(carrera);
              const safeDate = fecha ? parseSafeDateStr(fecha) : "";

              let timestamp = 0;
              if (safeDate) {
                const parts = safeDate.split(/[-/]/);
                if (parts.length >= 2) {
                  let dObj: Date | undefined;
                  if (parts.length === 3 && parts[0].length === 4) {
                    dObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                  } else if (parts.length === 3) {
                    dObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                  }
                  if (dObj && !isNaN(dObj.getTime())) {
                    timestamp = dObj.getTime();
                  }
                }
              }

              // Guarantee Vuelta a España points category alignment
              if (canonicalKey === "vuelta a espana") {
                categoria = vueltaCategoryInPoints;
              }

              const entry: RaceIndexedInfo = {
                original: carrera,
                norm: normKey,
                canonical: canonicalKey,
                categoria,
                fecha: safeDate,
                timestamp,
              };
              carrerasList.push(entry);

              // Index race category under all common keys
              if (categoria) {
                raceCategoryMap.set(carrera, categoria);
                raceCategoryMap.set(carrera.toLowerCase(), categoria);
                raceCategoryMap.set(normKey, categoria);
                raceCategoryMap.set(canonicalKey, categoria);
              }

              // Index race date & timestamp
              if (safeDate) {
                raceDateMap.set(carrera, safeDate);
                raceDateMap.set(carrera.toLowerCase(), safeDate);
                raceDateMap.set(normKey, safeDate);
                raceDateMap.set(canonicalKey, safeDate);
              }
              if (timestamp > 0) {
                raceTimestampMap.set(carrera, timestamp);
                raceTimestampMap.set(carrera.toLowerCase(), timestamp);
                raceTimestampMap.set(normKey, timestamp);
                raceTimestampMap.set(canonicalKey, timestamp);
              }
            }
          });

          // -----------------------------------------------------------------
          // 7. Points Lookup Map & Multi-Alias Fast Pre-computation
          // -----------------------------------------------------------------
          const pointsLookupMap = new Map<string, number>();

          puntos.data!.forEach((row: any) => {
            const categoria = String(getVal(row, "Categoría") || "").trim();
            const tipo = String(getVal(row, "Tipo") || "").trim();
            const posicion = String(getVal(row, "Posición") || "").trim();
            const pts = getVal(row, "Puntos");

            if (categoria && tipo && pts !== undefined && pts !== null && pts !== "") {
              const numPts = Number(pts);
              if (!isNaN(numPts)) {
                // Direct key
                const directKey = `${fastNorm(categoria)}_${fastNorm(tipo)}_${fastNorm(posicion)}`;
                pointsLookupMap.set(directKey, numPts);

                // Multi-alias keys for robust variation coverage
                const catAliases = getCategoryAliases(categoria);
                const typeAliases = getResultTypeAliases(tipo);
                const posAliases = getPositionAliases(posicion, tipo);

                for (const cA of catAliases) {
                  for (const tA of typeAliases) {
                    for (const pA of posAliases) {
                      const aliasKey = `${cA}_${tA}_${pA}`;
                      if (!pointsLookupMap.has(aliasKey)) {
                        pointsLookupMap.set(aliasKey, numPts);
                      }
                    }
                  }
                }
              }
            }
          });

          // -----------------------------------------------------------------
          // 8. Hot Results Processing (O(1) Map lookups & memoized resolution)
          // -----------------------------------------------------------------
          const scoresMap: Record<string, any> = {};
          const cyclistPointsTotals: Record<string, number> = {};
          const cyclistPointsByRace: Record<string, Record<string, number>> = {};

          const raceCategoryResolutionCache = new Map<string, string>();
          const pointsResolutionCache = new Map<string, number>();

          const unassignedPointsLog: any[] = [];
          const assignedPointsLog: any[] = [];
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
              } else if (isNaN(parseInt(posicion, 10)) && !isNaN(parseInt(etapa, 10)) && etapa !== "") {
                if (tipoResultado?.toLowerCase().includes("clasificaci")) {
                  posicion = etapa;
                }
              }

              if (!ciclista && !carrera && !tipoResultado && !posicion) {
                if (originalIndex > resultados.data!.length - 100) {
                  unassignedPointsLog.push({
                    ciclista: "(Fila vacía)",
                    carrera: "(Fila vacía)",
                    tipoResultado: "",
                    posicion: "",
                    reason: `Fila ${originalIndex + 2} está vacía. Raw keys: ${Object.keys(row).join(',')}`,
                    timestamp: Date.now(),
                    originalIndex,
                  });
                }
                return;
              }

              if (!ciclista || !carrera || !tipoResultado) {
                unassignedPointsLog.push({
                  ciclista: ciclista || "(Vacio)",
                  carrera: carrera || "(Vacia)",
                  tipoResultado: tipoResultado || "(Vacio)",
                  posicion,
                  reason: `Faltan campos obligatorios en esta fila de Resultados. (Revisa que Ciclista, Carrera y Tipo no estén vacíos)`,
                  timestamp: Date.now(),
                  originalIndex,
                });
                return;
              }

              const jugador = playerByCyclist[ciclista] || "No draft";

              // -------------------------------------------------------------
              // Resolve tipoCarrera with fast O(1) Map check & fallback
              // -------------------------------------------------------------
              let tipoCarrera = raceCategoryResolutionCache.get(carrera);
              if (tipoCarrera === undefined) {
                const canonicalName = normalizeRaceName(carrera);
                if (
                  canonicalName === "vuelta a espana" ||
                  isSameRace(carrera, "La Vuelta ciclista a España") ||
                  isSameRace(carrera, "Vuelta a España")
                ) {
                  tipoCarrera = vueltaCategoryInPoints || "Vuelta a España";
                } else {
                  tipoCarrera =
                    raceCategoryMap.get(carrera) ||
                    raceCategoryMap.get(canonicalName) ||
                    raceCategoryMap.get(fastNorm(carrera)) ||
                    raceCategoryMap.get(carrera.toLowerCase().trim()) ||
                    "";

                  // Fallback: only if direct Map misses, check carrerasList with isSameRace
                  if (!tipoCarrera) {
                    const matched = carrerasList.find((r) => isSameRace(r.original, carrera));
                    if (matched) {
                      tipoCarrera = matched.categoria;
                      // Seed the cache with this variation for future rows
                      raceCategoryMap.set(carrera, matched.categoria);
                    }
                  }
                }
                raceCategoryResolutionCache.set(carrera, tipoCarrera);
              }

              const debugPts = (pts: number, reason: string) => {
                if (pts === 0) {
                  const raceDateStr = fechaEspecifica && fechaEspecifica.length > 0
                    ? parseSafeDateStr(fechaEspecifica)
                    : (raceDateMap.get(carrera) || raceDateMap.get(fastNorm(carrera)) || raceDateMap.get(normalizeRaceName(carrera)) || "");
                  const timestamp = raceDateStr ? new Date(raceDateStr).getTime() : 0;
                  unassignedPointsLog.push({ ciclista, carrera, tipoResultado, posicion, reason, timestamp, originalIndex });
                }
              };

              if (!tipoCarrera) {
                debugPts(0, "Carrera no encontrada en tabla de carreras (revisa el nombre exacto)");
                return;
              }

              const isOneDayRace = tipoCarrera && (
                tipoCarrera.startsWith("1.") || 
                /^mon/i.test(tipoCarrera) || 
                /monumento/i.test(tipoCarrera) ||
                /campeonato/i.test(tipoCarrera)
              );

              // -------------------------------------------------------------
              // Resolve puntosObtenidos with O(1) cache & alias fallback
              // -------------------------------------------------------------
              let puntosObtenidos = 0;
              const directPointsKey = `${fastNorm(tipoCarrera)}_${fastNorm(tipoResultado)}_${fastNorm(posicion)}`;

              const cachedPts = pointsResolutionCache.get(directPointsKey);
              if (cachedPts !== undefined) {
                puntosObtenidos = cachedPts;
              } else {
                const lookupPts = pointsLookupMap.get(directPointsKey);
                if (lookupPts !== undefined) {
                  puntosObtenidos = lookupPts;
                } else {
                  // Fallback: alias loops executed only once per unknown combination
                  const candidateCats = getCategoryAliases(tipoCarrera);
                  const candidateTypes = getResultTypeAliases(tipoResultado);
                  const candidatePositions = getPositionAliases(posicion, tipoResultado);

                  for (const cat of candidateCats) {
                    if (puntosObtenidos > 0) break;
                    for (const type of candidateTypes) {
                      if (puntosObtenidos > 0) break;
                      for (const pos of candidatePositions) {
                        const k = `${cat}_${type}_${pos}`;
                        const pVal = pointsLookupMap.get(k);
                        if (pVal !== undefined && pVal > 0) {
                          puntosObtenidos = pVal;
                          break;
                        }
                      }
                    }
                  }
                }
                pointsResolutionCache.set(directPointsKey, puntosObtenidos);
              }

              // Date resolution with O(1) Map
              const raceDateStr = fechaEspecifica && fechaEspecifica.length > 0
                ? parseSafeDateStr(fechaEspecifica)
                : (raceDateMap.get(carrera) || raceDateMap.get(fastNorm(carrera)) || raceDateMap.get(normalizeRaceName(carrera)) || "");

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
                const timestamp = raceTimestampMap.get(carrera) || (raceDateStr ? new Date(raceDateStr).getTime() : 0);
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
                  ronda: cyclistRoundMap[ciclista] || null,
                });
              }

              // Accumulate totals
              cyclistPointsTotals[ciclista] = (cyclistPointsTotals[ciclista] || 0) + puntosObtenidos;

              if (!cyclistPointsByRace[ciclista]) cyclistPointsByRace[ciclista] = {};
              cyclistPointsByRace[ciclista][carrera] = (cyclistPointsByRace[ciclista][carrera] || 0) + puntosObtenidos;

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
                fecha: raceDateStr,
              });
            } catch (e: any) {
              processingExceptions++;
              console.error(`Error processing row ${originalIndex}:`, e);
            }
          });

          if (processingExceptions > 0) {
            console.error(`Processed with ${processingExceptions} exceptions.`);
          }

          // -----------------------------------------------------------------
          // 9. Leaderboard & Cyclist Metadata finalization
          // -----------------------------------------------------------------
          const sortedLeaderboard = Object.values(scoresMap).sort((a: any, b: any) => b.puntos - a.puntos);
          sortedLeaderboard.forEach((player: any) => {
            player.detalles.sort((a: any, b: any) => b.puntosObtenidos - a.puntosObtenidos);
          });

          Object.keys(cyclistMetadata).forEach((ciclista) => {
            cyclistMetadata[ciclista].puntosTotales = cyclistPointsTotals[ciclista] || 0;
            cyclistMetadata[ciclista].puntosPorCarrera = cyclistPointsByRace[ciclista] || {};
          });

          // -----------------------------------------------------------------
          // 10. uniqueRaces (using pre-indexed race timestamps, no re-parsing)
          // -----------------------------------------------------------------
          let uniqueRaces: string[] = [];
          if (resultados.data && carreras.data) {
            uniqueRaces = [...new Set(resultados.data.map((r: any) => getVal(r, "Carrera")))].filter(Boolean) as string[];

            uniqueRaces.sort((a, b) => {
              const dateA = raceTimestampMap.get(a) || raceTimestampMap.get(fastNorm(a)) || 0;
              const dateB = raceTimestampMap.get(b) || raceTimestampMap.get(fastNorm(b)) || 0;
              return dateB - dateA;
            });
          }

          // -----------------------------------------------------------------
          // 11. Compute raceWinners in O(N)
          // -----------------------------------------------------------------
          const raceWinners: Record<string, string> = {};
          if (carreras.data && resultados.data) {
            const racesWithFinal = new Set<string>();
            resultados.data.forEach((r: any) => {
              const rTipo = String(getVal(r, "Tipo") || "").trim();
              const tipoNorm = fastNorm(rTipo);
              if (
                tipoNorm.includes("clasificacionfinal") ||
                tipoNorm.includes("generalfinal") ||
                tipoNorm.includes("clasificaciongeneral") ||
                tipoNorm === "cg" ||
                tipoNorm === "gc" ||
                tipoNorm === "final" ||
                tipoNorm === "general"
              ) {
                const rCarrera = String(getVal(r, "Carrera") || "").trim();
                if (rCarrera) {
                  racesWithFinal.add(normalizeRaceName(rCarrera));
                  racesWithFinal.add(fastNorm(rCarrera));
                }
              }
            });

            // Accumulate points per race and per team
            const raceTeamPoints: Record<string, Record<string, number>> = {};
            sortedLeaderboard.forEach((player: any) => {
              const teamName = player.nombreEquipo;
              if (!teamName || teamName === "No draft" || teamName === "No draft [99]") return;
              player.detalles?.forEach((d: any) => {
                if (!d.puntosObtenidos || !d.carrera) return;
                const canRace = normalizeRaceName(d.carrera) || fastNorm(d.carrera);
                if (!raceTeamPoints[canRace]) raceTeamPoints[canRace] = {};
                raceTeamPoints[canRace][teamName] = (raceTeamPoints[canRace][teamName] || 0) + d.puntosObtenidos;
              });
            });

            // Find winner for each race
            carreras.data.forEach((r: any) => {
              const race = String(getVal(r, "Carrera") || "").trim();
              if (!race) return;

              const canRace = normalizeRaceName(race) || fastNorm(race);
              const normRace = fastNorm(race);
              if (!racesWithFinal.has(canRace) && !racesWithFinal.has(normRace)) return;

              const teamScores = raceTeamPoints[canRace];
              if (!teamScores) return;

              let maxPoints = 0;
              let winnerTeam = "";
              for (const [teamName, pts] of Object.entries(teamScores)) {
                if (pts > maxPoints) {
                  maxPoints = pts;
                  winnerTeam = teamName;
                }
              }

              if (winnerTeam) {
                raceWinners[race] = winnerTeam;
                if (normRace) raceWinners[normRace] = winnerTeam;
                if (canRace) raceWinners[canRace] = winnerTeam;
              }
            });
          }

          // -----------------------------------------------------------------
          // 12. Compute globalTeamWinsCount
          // -----------------------------------------------------------------
          const globalTeamWinsCount: Record<string, number> = {};
          sortedLeaderboard.forEach((p: any) => {
            if (p.nombreEquipo !== "No draft" && p.nombreEquipo !== "No draft [99]") {
              globalTeamWinsCount[p.nombreEquipo] = 0;
            }
          });
          const evaluatedRaces = new Set<string>();
          Object.entries(raceWinners).forEach(([raceKey, teamName]) => {
            const canonical = normalizeRaceName(raceKey) || fastNorm(raceKey);
            if (!evaluatedRaces.has(canonical)) {
              evaluatedRaces.add(canonical);
              if (globalTeamWinsCount[teamName] !== undefined) {
                globalTeamWinsCount[teamName]++;
              }
            }
          });

          // -----------------------------------------------------------------
          // 13. Compute globalTeamPartialWinsCount
          // -----------------------------------------------------------------
          const partialWins: Record<string, number> = {};
          const byRace: Record<string, Record<string, string[]>> = {};

          if (carreras.data && resultados.data) {
            const eventPoints: Record<string, Record<string, Record<string, number>>> = {};

            sortedLeaderboard.forEach((player: any) => {
              if (player.nombreEquipo === "No draft" || player.nombreEquipo === "No draft [99]") return;
              partialWins[player.nombreEquipo] = 0;
              player.detalles?.forEach((d: any) => {
                const tipoNorm = fastNorm(d.tipoResultado || "");
                const isStage = tipoNorm.includes("etapa") || tipoNorm === "cri" || tipoNorm.includes("crono");
                const isFinal =
                  tipoNorm.includes("clasificacionfinal") ||
                  tipoNorm.includes("generalfinal") ||
                  tipoNorm.includes("clasificaciongeneral") ||
                  tipoNorm === "cg" ||
                  tipoNorm === "gc" ||
                  tipoNorm === "final" ||
                  tipoNorm === "general";
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
                ciclista: r["Ciclista"],
              })),
            ],
          });

          setIsComputing(false);
        }, 10);
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [files, setComputedData, setIsComputing]);
}
