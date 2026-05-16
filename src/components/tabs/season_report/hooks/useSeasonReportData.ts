import { useMemo } from "react";

export const getVal = (row: any, key: string) => {
  if (!row) return "";
  if (row[key] !== undefined) return row[key];
  const caseInsensitiveKey = Object.keys(row).find(
    (k) => k.toLowerCase() === key.toLowerCase()
  );
  return caseInsensitiveKey ? row[caseInsensitiveKey] : "";
};

export function useSeasonReportData({ files, leaderboard, selectedMonths, requireSelectedMonths }: any) {
  const raceMonths = useMemo(() => {
    const map: Record<string, number> = {};
    if (!files?.carreras?.data) return map;
    files.carreras.data.forEach((r: any) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const fechaFin = getVal(r, "Fecha");
      if (carreraName && fechaFin) {
        const parts = fechaFin.split(/[-/]/);
        if (parts.length >= 2) {
          map[carreraName] = parseInt(parts[1], 10) - 1;
        }
      }
    });
    return map;
  }, [files]);

  const availableMonths = useMemo(() => {
    return Array.from(new Set(Object.values(raceMonths)) as Set<number>).sort(
      (a, b) => a - b,
    );
  }, [raceMonths]);

  const visibleRaces = useMemo(() => {
    if (requireSelectedMonths && (!selectedMonths || selectedMonths.length === 0)) {
      return new Set<string>();
    }
    if (selectedMonths && selectedMonths.length > 0) {
      return new Set(Object.keys(raceMonths).filter(race => selectedMonths.includes(raceMonths[race])));
    }
    return new Set(Object.keys(raceMonths));
  }, [raceMonths, selectedMonths, requireSelectedMonths]);

  const monthReportData = useMemo(() => {
    if (requireSelectedMonths && (!selectedMonths || selectedMonths.length === 0)) return null;
    

    const DRAFT_RANK_MAP: Record<string, string> = {
      "Xauli": "01",
      "Iker": "02",
      "Celita Líder Trek": "03",
      "King Remco": "04",
      "Javito's Cojostars": "05",
      "diegocruga": "06",
      "JF": "07",
      "Madafaca": "08",
      "Adrián M.": "09",
      "Xemita el cagalera": "10",
      "Pantic": "11",
      "carloscampas": "12",
      "Salva CSS": "13",
      "K": "14",
      "RedBluff IsraelHP": "15",
      "monty team": "16",
      "IbaiWRT": "17",
      "Osintron Fachafranco": "18",
      "Colotto": "19",
      "Pandis": "20",
    };

    const allCyclistPoints: Record<string, number> = {};
    const cyclistTeamMap: Record<string, string> = {};
    const cyclistRondaMap: Record<string, string> = {};

    leaderboard?.forEach((player) => {
      const draftRank = DRAFT_RANK_MAP[player.nombreEquipo] || "-";
      const teamNameWithDraftRank = `${player.nombreEquipo} [#${draftRank}]`;
      player?.detalles?.forEach((d) => {
        if (d.ciclista) {
          cyclistRondaMap[d.ciclista] = d.ronda || "-";
          cyclistTeamMap[d.ciclista] = teamNameWithDraftRank;
        }
      });
    });

    const draftCyclistPoints: Record<string, number> = {};
    const noDraftCyclistPoints: Record<string, number> = {};
    const teamPoints: Record<string, number> = {};
    const roundTeamPoints: Record<string, Record<string, number>> = {}; // [round][team] -> points

    const teamCyclistsPoints: Record<string, Record<string, number>> = {}; // [team][cyclist] -> points
    const teamWins: Record<string, number> = {};
    const roundCyclistsPoints: Record<string, Record<string, number>> = {}; // [round][cyclist] -> points

    const panenkitaTeamPoints: Record<string, number> = {};
    const panenkitaCyclistsPoints: Record<string, number> = {};

    Object.entries(cyclistRondaMap).forEach(([cyclist, roundStr]) => {
      const roundNum = parseInt(roundStr, 10);
      if (roundNum >= 20 && roundNum <= 25) {
        panenkitaCyclistsPoints[cyclist] = 0;
      }
    });

    const raceTeamScores: Record<string, Record<string, number>> = {}; // [race][team] -> points
    const teamMonthlyPoints: Record<string, Record<number, number>> = {}; // [team][month] -> points

    leaderboard?.forEach((player) => {
      const team = player.nombreEquipo;
      const isDraft = team !== "No draft" && team !== "No draft [99]";

      if (!teamCyclistsPoints[team]) teamCyclistsPoints[team] = {};
      if (isDraft && !teamPoints[team]) teamPoints[team] = 0;
      if (isDraft && !teamMonthlyPoints[team]) teamMonthlyPoints[team] = {};
      if (isDraft && !panenkitaTeamPoints[team]) panenkitaTeamPoints[team] = 0;

      player?.detalles?.forEach((d) => {
        if (!visibleRaces.has(d.carrera)) return;

        const isPos01 = d.posicion === "01" || d.posicion === "1";
        const isValidType = [
          "Etapa",
          "Etapa (Crono equipos)",
          "Clasificación final",
          "Clasificación final (Crono equipos)",
          "Clásica",
        ].includes(d.tipoResultado || "");

        if (isPos01 && isValidType && isDraft && team) {
          teamWins[team] = (teamWins[team] || 0) + 1;
        }

        const pts = d.puntosObtenidos;
        if (pts === 0) return;

        allCyclistPoints[d.ciclista] = (allCyclistPoints[d.ciclista] || 0) + pts;
        if (isDraft) {
          cyclistTeamMap[d.ciclista] = team;
        }

        const roundStr = d.ronda || "";
        const roundNum = parseInt(roundStr, 10);

        if (!raceTeamScores[d.carrera]) raceTeamScores[d.carrera] = {};
        if (isDraft) {
          raceTeamScores[d.carrera][team] =
            (raceTeamScores[d.carrera][team] || 0) + pts;
          
          const mIdx = raceMonths[d.carrera];
          if (mIdx !== undefined) {
            teamMonthlyPoints[team][mIdx] = (teamMonthlyPoints[team][mIdx] || 0) + pts;
          }
        }

        if (isDraft) {
          draftCyclistPoints[d.ciclista] =
            (draftCyclistPoints[d.ciclista] || 0) + pts;
          teamPoints[team] += pts;
          teamCyclistsPoints[team][d.ciclista] =
            (teamCyclistsPoints[team][d.ciclista] || 0) + pts;

          if (roundStr) {
            if (!roundTeamPoints[roundStr]) roundTeamPoints[roundStr] = {};
            roundTeamPoints[roundStr][team] =
              (roundTeamPoints[roundStr][team] || 0) + pts;

            if (!roundCyclistsPoints[roundStr])
              roundCyclistsPoints[roundStr] = {};
            roundCyclistsPoints[roundStr][d.ciclista] =
              (roundCyclistsPoints[roundStr][d.ciclista] || 0) + pts;

            if (roundNum >= 20 && roundNum <= 25) {
              panenkitaTeamPoints[team] += pts;
              panenkitaCyclistsPoints[d.ciclista] =
                (panenkitaCyclistsPoints[d.ciclista] || 0) + pts;
            }
          }
        } else {
          noDraftCyclistPoints[d.ciclista] =
            (noDraftCyclistPoints[d.ciclista] || 0) + pts;
        }
      });
    });

    const raceWinners = Object.entries(raceTeamScores)
      .filter(([race]) => {
        const hasFinalClassification = files?.resultados?.data?.some(
          (r: any) =>
            getVal(r, "Carrera") === race &&
            getVal(r, "Tipo")?.match(/Clasificación final/i),
        );
        return hasFinalClassification;
      })
      .map(([race, ptsMap]) => {
      const sorted = Object.entries(ptsMap).sort((a, b) => b[1] - a[1]);
      const winner = sorted.length > 0 ? sorted[0] : null;
      const raceData = files?.carreras?.data?.find((r: any) => getVal(r, "Carrera")?.trim() === race);
      const winnerTeamName = winner ? winner[0] : "-";
      let draftRankStr = "-";
      if (winnerTeamName !== "-") {
        draftRankStr = DRAFT_RANK_MAP[winnerTeamName] || "-";
      }
      return {
        race,
        winnerTeam: winnerTeamName,
        winnerPts: winner ? winner[1] : 0,
        fecha: raceData ? getVal(raceData, "Fecha") : "",
        categoria: raceData ? getVal(raceData, "Categoría") : "",
        draftRank: draftRankStr,
      };
    }).sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      const pa = a.fecha.split(/[-/]/);
      const pb = b.fecha.split(/[-/]/);
      let numA = 0, numB = 0;
      if (pa.length === 3) {
        numA = parseInt((pa[0].length === 4 ? pa[0] : pa[2]) + (pa[1].padStart(2, '0')) + (pa[0].length === 4 ? pa[2].padStart(2, '0') : pa[0].padStart(2, '0')));
      }
      if (pb.length === 3) {
        numB = parseInt((pb[0].length === 4 ? pb[0] : pb[2]) + (pb[1].padStart(2, '0')) + (pb[0].length === 4 ? pb[2].padStart(2, '0') : pb[0].padStart(2, '0')));
      }
      return numB - numA; // Descending
    });

    const maxWins = Math.max(0, ...raceWinners.map((rw) => rw.winnerTeam !== "-" ? 1 : 0));

    const topTeams = Object.entries(teamPoints)
      .sort((a, b) => b[1] - a[1])
      .map(([team, pts], currentPos) => {
        const draftRankNum = DRAFT_RANK_MAP[team] || "-";
        const dif = (draftRankNum !== "-" ? parseInt(draftRankNum, 10) : 999) - (currentPos + 1);
        const wins = raceWinners.filter((rw) => rw.winnerTeam === team).length;
        const stageWins = teamWins[team] || 0;
        
        return {
          team,
          pts,
          originalPos: draftRankNum,
          currentPos: currentPos + 1,
          dif,
          wins,
          stageWins,
          monthlyPoints: teamMonthlyPoints[team] || {}
        };
      });

    const teamMonthlyRankMap: Record<string, number> = {};
    topTeams.forEach(t => {
      teamMonthlyRankMap[t.team] = t.currentPos;
    });

    // Calculate extra stats for Top Cyclists
    const raceCats: Record<string, string> = {};
    const raceDays: Record<string, number> = {};
    if (files?.carreras?.data) {
      files.carreras.data.forEach((r: any) => {
        const name = getVal(r, "Carrera")?.trim();
        const cat = getVal(r, "Categoría")?.trim();
        const diasStr = getVal(r, "Días");
        if (name) {
          if (cat) raceCats[name] = cat;
          raceDays[name] = parseInt(diasStr) || 1;
        }
      });
    }

    const cyclistMetadata: Record<string, { pais: string }> = {};
    if (files?.ciclistas?.data) {
      files.ciclistas.data.forEach((c: any) => {
        const name = getVal(c, "Ciclista")?.trim();
        const pais = getVal(c, "País")?.trim();
        if (name && pais) {
          cyclistMetadata[name] = { pais };
        }
      });
    }

    const monthlyCyclistTeamMap: Record<string, string> = {};

    const cyclistStats: Record<string, any> = {};

    leaderboard?.forEach((player) => {
      const team = player.nombreEquipo;
      const isDraft = team !== "No draft" && team !== "No draft [99]";
      const draftRank = DRAFT_RANK_MAP[team] || "-";
      const teamNameWithDraftRank = isDraft ? `${team} [#${draftRank}]` : team;

      player?.detalles?.forEach((d) => {
        if (!visibleRaces.has(d.carrera)) return;

        monthlyCyclistTeamMap[d.ciclista] = teamNameWithDraftRank;

        if (isDraft) {
          if (!cyclistStats[d.ciclista]) {
            cyclistStats[d.ciclista] = {
              puntos: 0,
              equipo: teamNameWithDraftRank,
              ronda: d.ronda,
              pais: cyclistMetadata[d.ciclista]?.pais || "",
              victorias: 0,
              carreras: new Set<string>(),
              dias: 0,
            };
          }

          const stats = cyclistStats[d.ciclista];
          stats.puntos += d.puntosObtenidos;
          stats.carreras.add(d.carrera);

          const isPos01 = d.posicion === "01" || d.posicion === "1";
          const isValidType = [
            "Etapa",
            "Etapa (Crono equipos)",
            "Clasificación final",
            "Clasificación final (Crono equipos)",
            "Clásica",
          ].includes(d.tipoResultado || "");

          if (isPos01 && isValidType) {
            stats.victorias += 1;
          }
        }
      });
    });

    Object.values(cyclistStats).forEach(stats => {
      stats.carreras.forEach((carrera: string) => {
         stats.dias += raceDays[carrera] || 1;
      });
    });

    const topCyclistsStats = Object.entries(cyclistStats)
      .sort((a, b) => b[1].puntos - a[1].puntos)
      .map(([name, data], idx) => {
        const numCarreras = data.carreras.size;
        const ppc = numCarreras > 0 ? parseFloat((data.puntos / numCarreras).toFixed(1)) : 0;
        const ppd = data.dias > 0 ? parseFloat((data.puntos / data.dias).toFixed(1)) : 0;
        return {
          originalPos: idx + 1,
          name,
          data,
          numCarreras,
          ppc,
          ppd,
        };
      })
      .slice(0, 50);

    const topCyclists = topCyclistsStats;

    const minMaxTeam = Object.entries(teamCyclistsPoints)
      .filter(([team]) => team !== "No draft" && team !== "No draft [99]")
      .map(([team, cMap]) => {
        const sorted = Object.entries(cMap).sort((a, b) => b[1] - a[1]);
        const draftRank = DRAFT_RANK_MAP[team] || "-";
        const teamNameWithDraftRank = `${team} [#${draftRank}]`;
        const totalTeamPts = teamPoints[team] || 0;
        
        return {
          team: teamNameWithDraftRank,
          draftRank: draftRank !== "-" ? parseInt(draftRank, 10) : 999,
          pts: totalTeamPts,
          best: sorted.length > 0 ? [`${sorted[0][0]} <${cyclistRondaMap[sorted[0][0]] || "-"}>`, sorted[0][1]] : null,
          worst: sorted.length > 0 ? [`${sorted[sorted.length - 1][0]} <${cyclistRondaMap[sorted[sorted.length - 1][0]] || "-"}>`, sorted[sorted.length - 1][1]] : null,
        };
      })
      .sort((a, b) => a.draftRank - b.draftRank);

    const minMaxRound = Object.entries(roundCyclistsPoints)
      .map(([round, cMap]) => {
        const sorted = Object.entries(cMap).sort((a, b) => b[1] - a[1]);
        return {
          round,
          best: sorted.length > 0 ? [`${sorted[0][0]} (${monthlyCyclistTeamMap[sorted[0][0]] || ""})`, sorted[0][1]] : null,
          worst: sorted.length > 0 ? [`${sorted[sorted.length - 1][0]} (${monthlyCyclistTeamMap[sorted[sorted.length - 1][0]] || ""})`, sorted[sorted.length - 1][1]] : null,
        };
      })
      .sort((a, b) => parseInt(a.round) - parseInt(b.round));

    
    
    const bestPicksCount: Record<string, number> = {};
    if (leaderboard) {
      leaderboard?.forEach(player => {
        const team = player.nombreEquipo;
        const isDraft = team !== "No draft" && team !== "No draft [99]";
        if (isDraft) {
          const draftRank = DRAFT_RANK_MAP[team] || "-";
          const teamNameWithDraftRank = `${team} [#${draftRank}]`;
          bestPicksCount[teamNameWithDraftRank] = 0;
        }
      });
    }

    minMaxRound.forEach(r => {
      if (r.best) {
         // extract the team
         const bestCyclist = (r.best[0] as string).split(' (')[0];
         const bestTeam = monthlyCyclistTeamMap[bestCyclist];
         if (bestTeam && bestTeam.trim() !== '') {
           bestPicksCount[bestTeam] = (bestPicksCount[bestTeam] || 0) + 1;
         }
      }
    });
    const bestPicks = Object.entries(bestPicksCount)
      .map(([team, count]) => ({ team, count }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.team.localeCompare(b.team);
      });

    const topNoDraftCyclists = Object.entries(noDraftCyclistPoints)
      .filter(([_, pts]) => pts > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([cyclist, pts], idx) => {
        let eq = "-";
        let pais = "-";
        if (files?.ciclistas?.data) {
           const match = files.ciclistas.data?.find((c: any) => getVal(c, "Ciclista")?.trim() === cyclist);
           if (match) {
             const teamFromCiclistas = getVal(match, "Equipo")?.trim();
             if (teamFromCiclistas && files?.equipos?.data) {
               const teamMatch = files.equipos.data?.find((e: any) => 
                 getVal(e, "EQUIPO COMPLETO")?.trim() === teamFromCiclistas
               );
               if (teamMatch) {
                 eq = getVal(teamMatch, "EQUIPO BREVE") || "-";
               }
             }
             pais = getVal(match, "País") || "-";
           }
        }
        return {
           originalPos: idx + 1,
           cyclist,
           pts,
           eq,
           pais
        };
      });

    const panenkitaTopTeams = Object.keys(DRAFT_RANK_MAP)
      .map((team) => {
        const pts = panenkitaTeamPoints[team] || 0;
        const draftRank = DRAFT_RANK_MAP[team] || "-";
        return { 
          team: `${team} [#${draftRank}]`, 
          teamClean: team,
          pts,
          draftRankNum: draftRank !== "-" ? parseInt(draftRank, 10) : 999 
        };
      })
      .sort((a, b) => b.pts - a.pts || a.draftRankNum - b.draftRankNum);

    const panenkitaTopCyclists = Object.entries(panenkitaCyclistsPoints)
      .sort((a, b) => {
        const ptsDiff = b[1] - a[1];
        if (ptsDiff !== 0) return ptsDiff;
        const roundA = parseInt(cyclistRondaMap[a[0]] || "99", 10);
        const roundB = parseInt(cyclistRondaMap[b[0]] || "99", 10);
        const roundDiff = roundA - roundB;
        if (roundDiff !== 0) return roundDiff;
        return a[0].localeCompare(b[0]);
      })
      .slice(0, 50)
      .map(([cyclist, pts]) => {
        const round = cyclistRondaMap[cyclist] || "-";
        const teamInfo = cyclistTeamMap[cyclist] || "";
        return { cyclist, pts, round, teamInfo };
      });

    const winningTeamObj = panenkitaTopTeams.length > 0 ? panenkitaTopTeams[0] : null;
    const bestPanenkitaTeam = winningTeamObj ? winningTeamObj.team : null;
    let bestPanenkitaTeamPicks: { cyclist: string; pts: number }[] = [];

    if (winningTeamObj) {
      const player = leaderboard?.find(
        (x) => x.nombreEquipo === winningTeamObj.teamClean,
      );
      if (player) {
        const teamCyclistsRounds = new Map<string, string>();
        const teamPointsMap = new Map<string, number>();

        player?.detalles?.forEach((d) => {
          const rNum = parseInt(d.ronda || "0", 10);
          if (rNum >= 20 && rNum <= 25) {
            teamCyclistsRounds.set(d.ciclista, d.ronda || "");
            if (visibleRaces.has(d.carrera)) {
              teamPointsMap.set(d.ciclista, (teamPointsMap.get(d.ciclista) || 0) + d.puntosObtenidos);
            }
          }
        });

        bestPanenkitaTeamPicks = Array.from(teamCyclistsRounds.entries())
          .map(([name, round]) => ({
            cyclist: `${name} <${round}>`,
            pts: teamPointsMap.get(name) || 0,
            roundNum: parseInt(round)
          }))
          .sort((a, b) => a.roundNum - b.roundNum);
      }
    }

    // Grid for points by round and team
    const allRounds = Array.from(new Set(Object.keys(roundTeamPoints))).sort(
      (a, b) => parseInt(a) - parseInt(b),
    );
    
    const roundStats: Record<string, {max: number, min: number}> = {};
    allRounds.forEach(r => {
      let max = -Infinity, min = Infinity;
      Object.values(roundTeamPoints[r] || {}).forEach(pts => {
         if (pts > 0 && pts > max) max = pts;
         if (pts > 0 && pts < min) min = pts;
      });
      roundStats[r] = { max, min };
    });
    const allTeams = topTeams.map((t) => {
      const draftRank = DRAFT_RANK_MAP[t.team] || "-";
      return `${t.team} [#${draftRank}]`;
    }); 

    return {
      topTeams,
      raceWinners,
      topCyclists,
      roundTeamPoints: Object.fromEntries(
        Object.entries(roundTeamPoints).map(([round, ptsMap]) => [
          round,
          Object.fromEntries(
            Object.entries(ptsMap).map(([team, pts]) => {
              const draftRank = DRAFT_RANK_MAP[team] || "-";
              return [`${team} [#${draftRank}]`, pts];
            })
          ),
        ])
      ),
      minMaxTeam,
      minMaxRound, bestPicks,
      topNoDraftCyclists,
      panenkitaTopTeams,
      panenkitaTopCyclists,
      bestPanenkitaTeam,
      bestPanenkitaTeamPicks,
      roundStats,
      allRounds,
      allTeams,
    };
  }, [selectedMonths, leaderboard, visibleRaces, raceMonths]);
  return { availableMonths, monthReportData };
}
