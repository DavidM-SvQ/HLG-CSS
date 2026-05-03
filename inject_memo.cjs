const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

const useMemoLogic = `
  const memoizedData = useMemo(() => {
    const selectedData = files.startlist.data?.find(
      (d: any) => d.carrera === publicStartlistRace,
    );
    if (!selectedData) return { filteredRows: [], teamRows: [], uniqueTeams: [], maxCiclistas: 0, minCiclistas: 0, minTeamPoints: 0, maxTeamPoints: 0, minTeamPointsMedios: 0, maxTeamPointsMedios: 0 };

    let rows: any[] = [];
    selectedData.resultados?.forEach((res: any) => {
      res.ciclistas?.forEach((c: any) => {
        const nombre = typeof c === "string" ? c : c.nombre;
        const dorsal = typeof c === "string" ? "" : c.dorsal;

        const jugador = res.jugador;
        const equipoManger = playerTeamMap[jugador] || jugador;
        const order = playerOrderMap[jugador] || DRAFT_RANK_MAP[jugador] || "99";
        const equipoOrdered = \`\${equipoManger} [#\${order}]\`;
        const ronda = cyclistRoundMap[nombre] || "";
        const meta = cyclistMetadata[nombre] || {};

        const totalPuntos = meta.puntosTotales || 0;
        const carreraPuntos = meta.puntosPorCarrera?.[publicStartlistRace] || 0;
        const displayPuntos = totalPuntos - carreraPuntos;
        const dias = meta.diasCompeticion || 0;
        const debut = dias === 0 ? "Sí" : "";

        rows.push({
          jugador: equipoOrdered,
          jugadorName: jugador,
          dorsal: dorsal || "",
          ciclista: nombre,
          ronda: ronda,
          pais: meta.pais || "",
          equipo: meta.equipoBreve || "",
          dias,
          puntos: displayPuntos,
          debut,
        });
      });
    });

    const uniqueTeams = Array.from(
      new Set(rows.map((r) => r.jugador)),
    ).sort() as string[];

    const filteredRows = rows.filter((r) =>
      startlistFilterTeam === "All" ? true : r.jugador === startlistFilterTeam,
    );

    const sortDirNum = startlistSortDir === "asc" ? 1 : -1;
    filteredRows.sort((a, b) => {
      if (startlistSortCol === "puntos") return (a.puntos - b.puntos) * sortDirNum;
      if (startlistSortCol === "dias") return (a.dias - b.dias) * sortDirNum;
      if (startlistSortCol === "ronda") {
        const getRondaNum = (r: string) => {
          const num = parseInt(r);
          return isNaN(num) ? 99 : num;
        };
        return ((getRondaNum(a.ronda) - getRondaNum(b.ronda)) * sortDirNum);
      }
      const valA = String(a[startlistSortCol] || "");
      const valB = String(b[startlistSortCol] || "");
      return valA.localeCompare(valB) * sortDirNum;
    });

    const teamRows: StartlistTeamRow[] = [];
    let maxCiclistas = 0;
    let minCiclistas = 999;

    Object.entries(DRAFT_RANK_MAP).forEach(([jugador, orden]) => {
      if (jugador === "No draft") return;
      const teamMembers = rows.filter((r) => r.jugadorName === jugador);
      const numCiclistas = teamMembers.length;
      if (numCiclistas > 0) {
        if (numCiclistas > maxCiclistas) maxCiclistas = numCiclistas;
        if (numCiclistas < minCiclistas) minCiclistas = numCiclistas;
      }
      const puntos = teamMembers.reduce((sum, r) => sum + r.puntos, 0);
      teamRows.push({
        orden,
        equipo: playerTeamMap[jugador] || jugador,
        numCiclistas,
        puntos,
        puntosMedios: numCiclistas ? Number((puntos / numCiclistas).toFixed(1)) : 0,
      });
    });

    teamRows.sort((a, b) => {
      if (b.numCiclistas !== a.numCiclistas) return b.numCiclistas - a.numCiclistas;
      return b.puntos - a.puntos;
    });

    const maxTeamPoints = Math.max(1, ...teamRows.map((r) => r.puntos));
    const minTeamPoints = Math.min(...teamRows.map((r) => r.puntos));
    const maxTeamPointsMedios = Math.max(1, ...teamRows.map((r) => r.puntosMedios));
    const minTeamPointsMedios = Math.min(...teamRows.map((r) => r.puntosMedios));

    return {
      filteredRows,
      teamRows,
      uniqueTeams,
      maxCiclistas,
      minCiclistas,
      minTeamPoints,
      maxTeamPoints,
      minTeamPointsMedios,
      maxTeamPointsMedios,
    };
  }, [
    files,
    publicStartlistRace,
    cyclistMetadata,
    cyclistRoundMap,
    playerTeamMap,
    playerOrderMap,
    startlistFilterTeam,
    startlistSortCol,
    startlistSortDir,
  ]);

  const rowVirtualizer = useVirtualizer({
    count: memoizedData.filteredRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  });
`;

code = code.replace(
  "  const handleCopyStartlist = async () => {",
  useMemoLogic + "\n  const handleCopyStartlist = async () => {"
);

fs.writeFileSync('src/components/tabs/StartlistView.tsx', code);
