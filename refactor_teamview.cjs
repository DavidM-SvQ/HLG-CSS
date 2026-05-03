const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/TeamView.tsx', 'utf8');

const useMemoInjection = `
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
      ?.label.match(/\\[#(\\d+)\\]/)?.[1];
      
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
`;

code = code.replace(/return \(\s*<div/, match => useMemoInjection + '\\n  ' + match);

// Now I need to delete the inline computation and unpack the computed data.

const regex = /\{\s*selectedTeam\s*\?\s*\(\s*\(\(\)\s*=>\s*\{([\s\S]+?)return \(\s*<div className="space-y-6">/;

const dataUnpackBlock = `
        {selectedTeam && teamComputedData ? (
          (() => {
            const {
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
            } = teamComputedData;

            return (
              <div className="space-y-6">
`;

code = code.replace(regex, dataUnpackBlock);

fs.writeFileSync('src/components/tabs/TeamView.tsx', code);
console.log("TeamView Refactored");
