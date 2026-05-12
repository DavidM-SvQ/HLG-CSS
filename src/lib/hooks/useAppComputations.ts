import { useEffect } from 'react';
import { useDataStore } from '../stores/useDataStore';
import { useComputedStore } from '../stores/useComputedStore';
import { getVal } from '../data-processing';

const getFlagEmoji = (countryName: string) => {
  if (!countryName) return "";
  const country = countryName.trim().toLowerCase();
  const flags: Record<string, string> = {
    spain: "🇪🇸", españa: "🇪🇸", france: "🇫🇷", francia: "🇫🇷", italy: "🇮🇹", italia: "🇮🇹",
    belgium: "🇧🇪", bélgica: "🇧🇪", netherlands: "🇳🇱", "países bajos": "🇳🇱", holanda: "🇳🇱",
    slovenia: "🇸🇮", eslovenia: "🇸🇮", denmark: "🇩🇰", dinamarca: "🇩🇰", "great britain": "🇬🇧",
    "gran bretaña": "🇬🇧", "united kingdom": "🇬🇧", "reino unido": "🇬🇧", australia: "🇦🇺",
    usa: "🇺🇸", "united states": "🇺🇸", eeuu: "🇺🇸", "estados unidos": "🇺🇸", colombia: "🇨🇴",
    ecuador: "🇪🇨", norway: "🇳🇴", noruega: "🇳🇴", germany: "🇩🇪", alemania: "🇩🇪",
    switzerland: "🇨🇭", suiza: "🇨🇭", portugal: "🇵🇹", austria: "🇦🇹", ireland: "🇮🇪",
    irlanda: "🇮🇪", canada: "🇨🇦", canadá: "🇨🇦", "new zealand": "🇳🇿", "nueva zelanda": "🇳🇿",
    eritrea: "🇪🇷", kazakhstan: "🇰🇿", kazajistán: "🇰🇿", poland: "🇵🇱", polonia: "🇵🇱",
    "czech republic": "🇨🇿", "república checa": "🇨🇿", slovakia: "🇸🇰", eslovaquia: "🇸🇰",
    hungary: "🇭🇺", hungría: "🇭🇺", luxembourg: "🇱🇺", luxemburgo: "🇱🇺", "south africa": "🇿🇦",
    sudáfrica: "🇿🇦", latvia: "🇱🇻", letonia: "🇱🇻", estonia: "🇪🇪", lithuania: "🇱🇹",
    lituania: "🇱🇹", israel: "🇮🇱", japan: "🇯🇵", japón: "🇯🇵", china: "🇨🇳", russia: "🇷🇺",
    rusia: "🇷🇺", ukraine: "🇺🇦", ucrania: "🇺🇦", belarus: "🇧🇾", bielorrusia: "🇧🇾",
    mexico: "🇲🇽", méxico: "🇲🇽", argentina: "🇦🇷", brazil: "🇧🇷", brasil: "🇧🇷",
    venezuela: "🇻🇪", "costa rica": "🇨🇷", panama: "🇵🇦", panamá: "🇵🇦",
  };
  return flags[country] || countryName;
};

export function useAppComputations() {
  const { files } = useDataStore();
  const setComputedData = useComputedStore((s) => s.setComputedData);

  useEffect(() => {
    const allFilesUploaded = Object.values(files).every(
      (f) => f.data && Array.isArray(f.data) && f.data.length > 0
    );

    if (!allFilesUploaded) return;

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
      const full = getVal(row, "EQUIPO COMPLETO")?.toString().trim().toLowerCase();
      const breve = getVal(row, "EQUIPO BREVE")?.toString().trim();
      if (full && breve) fullToBreve[full] = breve;
    });

    const cyclistToInfo: Record<string, any> = {};
    files.ciclistas.data?.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista")?.toString().trim();
      const pais = getVal(row, "Pais")?.toString().trim();
      const full = getVal(row, "Equipo")?.toString().trim().toLowerCase();
      if (ciclista) {
        cyclistToInfo[ciclista] = {
          pais: pais || "",
          paisLetras: pais || "",
          equipoBreve: (full && fullToBreve[full]) || "",
          nacido: "",
        };
      }
    });

    resultados.data?.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista")?.toString().trim();
      const full = getVal(row, "Equipo")?.toString().trim().toLowerCase();
      const nacido = getVal(row, "Nacido")?.toString().trim();
      const pais = getVal(row, "País")?.toString().trim();
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
      const ciclista = getVal(row, "Ciclista")?.trim();
      const carrera = getVal(row, "Carrera")?.trim();
      const etapa = getVal(row, "Etapa")?.toString().trim();
      const posicion = getVal(row, "Posición")?.toString().trim() || getVal(row, "Pos")?.toString().trim();

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

    files.ciclistas.data?.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista")?.toString().trim();
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
        };
      }
    });

    elecciones.data!.forEach((row: any, idx: number) => {
      const ciclista = getVal(row, "Ciclista")?.trim();
      const jugador = getVal(row, "Nombre_TG")?.trim();
      const nombreEquipo = getVal(row, "Nombre_Equipo")?.trim();
      const edad = getVal(row, "Edad")?.toString().trim();
      const paisElecciones = getVal(row, "País")?.trim();

      if (ciclista && jugador) {
        const playerIdx = uniquePlayers.indexOf(jugador);
        playerOrderMap[jugador] = (playerIdx + 1).toString().padStart(2, "0");

        if (nombreEquipo) {
          playerTeamMap[jugador] = nombreEquipo;
          teamToPlayerMap[nombreEquipo] = jugador;
        }

        let ronda = getVal(row, "Ronda")?.toString().trim();
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
        };
      }
    });

    const raceTypeByName: Record<string, string> = {};
    const raceDateByName: Record<string, string> = {};
    
    function parseSafeDateStr(dStr: string) {
      if (!dStr) return "";
      let s = dStr.toString().trim();
      
      const parts = s.split(/[-/.]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else if (parts.length === 2) {
        return `${new Date().getFullYear()}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else {
        const v = parseFloat(s);
        if (!isNaN(v) && v > 10000) { // excel date
          const d = new Date((v - 25569) * 86400 * 1000);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      }
      return s;
    }

    carreras.data!.forEach((row: any) => {
      const carrera = getVal(row, "Carrera")?.trim();
      const categoria = getVal(row, "Categoría")?.trim();
      const fecha = getVal(row, "Fecha")?.trim();
      if (carrera && categoria) {
        raceTypeByName[carrera] = categoria;
      }
      if (carrera && fecha) {
        raceDateByName[carrera] = parseSafeDateStr(fecha);
      }
    });

    const pointsLookup: Record<string, number> = {};
    puntos.data!.forEach((row: any) => {
      const categoria = getVal(row, "Categoría")?.trim();
      const tipo = getVal(row, "Tipo")?.trim();
      const posicion = getVal(row, "Posición")?.toString().trim();
      const pts = getVal(row, "Puntos");

      if (categoria && tipo && posicion && pts !== undefined) {
        const key = `${categoria}_${tipo}_${posicion}`;
        pointsLookup[key] = Number(pts);
      }
    });

    const scoresMap: Record<string, any> = {};
    const cyclistPointsTotals: Record<string, number> = {};
    const cyclistPointsByRace: Record<string, Record<string, number>> = {};

    resultados.data!.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista")?.trim();
      const carrera = getVal(row, "Carrera")?.trim();
      const tipoResultado = getVal(row, "Tipo")?.trim();
      const etapa = getVal(row, "Etapa")?.toString().trim();
      const posicion = getVal(row, "Pos")?.toString().trim() || "";

      if (!ciclista || !carrera || !tipoResultado) return;

      const jugador = playerByCyclist[ciclista] || "No draft";
      const tipoCarrera = raceTypeByName[carrera];
      if (!tipoCarrera) return;

      const pointsKey = `${tipoCarrera}_${tipoResultado}_${posicion}`;
      const puntosObtenidos = pointsLookup[pointsKey] || 0;

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
        fecha: raceDateByName[carrera],
      });
    });

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
          const parts = fechaFin.toString().split(/[-/]/);
          if (parts.length === 3) {
            let date;
            if (parts[0].length === 4) {
              date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
              date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
            if (date && !isNaN(date.getTime())) raceDates[carreraName] = date.getTime();
          }
        }
      });
      uniqueRaces.sort((a, b) => {
        const dateA = raceDates[a] || 0;
        const dateB = raceDates[b] || 0;
        return dateB - dateA;
      });
    }

    // Compute raceWinners
    const raceWinners: Record<string, string> = {};
    if (carreras.data && resultados.data) {
      const races = carreras.data.map((r: any) => getVal(r, "Carrera")).filter(Boolean) as string[];
      races.forEach((race) => {
        const hasFinalClassification = resultados.data?.some(
          (r: any) => getVal(r, "Carrera") === race && getVal(r, "Tipo")?.match(/Clasificación final/i),
        );
        if (!hasFinalClassification) return;

        let maxPoints = 0;
        let winnerTeam = "";
        sortedLeaderboard.forEach((player: any) => {
          if (player.nombreEquipo === "No draft" || player.nombreEquipo === "No draft [99]") return;
          const pts = player.detalles.filter((d: any) => d.carrera === race).reduce((sum: number, d: any) => sum + d.puntosObtenidos, 0);
          if (pts > maxPoints) {
            maxPoints = pts;
            winnerTeam = player.nombreEquipo;
          }
        });
        if (winnerTeam) raceWinners[race] = winnerTeam;
      });
    }

    // Compute globalTeamWinsCount
    const globalTeamWinsCount: Record<string, number> = {};
    sortedLeaderboard.forEach((p: any) => {
      if (p.nombreEquipo !== "No draft" && p.nombreEquipo !== "No draft [99]") {
        globalTeamWinsCount[p.nombreEquipo] = 0;
      }
    });
    Object.values(raceWinners).forEach((teamName) => {
      if (globalTeamWinsCount[teamName] !== undefined) {
        globalTeamWinsCount[teamName]++;
      }
    });

    // Compute globalTeamPartialWinsCount
    let partialWins: Record<string, number> = {};
    let byRace: Record<string, Record<string, string[]>> = {};

    if (carreras.data && resultados.data) {
      const eventPoints: Record<string, Record<string, Record<string, number>>> = {};
      const validTypes = ["Etapa", "Etapa (Crono equipos)", "Clasificación final", "Clasificación final (Crono equipos)"];

      sortedLeaderboard.forEach((player: any) => {
        if (player.nombreEquipo === "No draft" || player.nombreEquipo === "No draft [99]") return;
        partialWins[player.nombreEquipo] = 0;
        player.detalles?.forEach((d: any) => {
          if (!validTypes.includes(d.tipoResultado || "")) return;
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
    });

  }, [files, setComputedData]);
}
