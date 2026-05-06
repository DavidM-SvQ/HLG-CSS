import { useMemo, useEffect } from 'react';
import { DRAFT_RANK_MAP } from '../lib/constants';
import { getVal } from '../lib/data-processing';

export interface StartlistTeamRow {
  orden: string;
  equipo: string;
  numCiclistas: number;
  puntos: number;
  puntosMedios: number;
}

export interface StartlistFilters {
  team: string;
  rondas: string[];
  diasMin: number | '';
  diasMax: number | '';
  debut: string; // 'Todos' | 'Sí' | 'No'
  puntosMin: number | '';
  puntosMax: number | '';
}

export function useStartlistData(
  files: any,
  publicStartlistRace: string,
  setPublicStartlistRace: (val: string) => void,
  cyclistMetadata: Record<string, any>,
  cyclistRoundMap: Record<string, string>,
  playerTeamMap: Record<string, string>,
  playerOrderMap: Record<string, string>,
  filters: StartlistFilters,
  startlistSortCol: string,
  startlistSortDir: string
) {
  const startlistArray = useMemo(() => {
    if (!files?.startlist?.data) return [];
    if (Array.isArray(files.startlist.data)) return files.startlist.data;
    return [files.startlist.data];
  }, [files]);
  
  useEffect(() => {
    if (!publicStartlistRace && startlistArray.length > 0) {
      const firstValidRace = startlistArray.find((sl: any) => sl && getVal(sl, "carrera"));
      if (firstValidRace) {
        setPublicStartlistRace(getVal(firstValidRace, "carrera") || "");
      }
    }
  }, [publicStartlistRace, startlistArray, setPublicStartlistRace]);

  const raceCategory = useMemo(() => {
    if (!publicStartlistRace || !files?.carreras?.data) return "";
    const raceObj = files.carreras.data.find((c: any) => getVal(c, "Carrera") === publicStartlistRace);
    return raceObj ? getVal(raceObj, "Categoría") || "" : "";
  }, [publicStartlistRace, files?.carreras?.data]);

  const racePoints = useMemo(() => {
    if (!raceCategory || !files?.puntos?.data) return [];
    return files.puntos.data.filter((p: any) => getVal(p, "Categoría") === raceCategory);
  }, [raceCategory, files?.puntos?.data]);

  const memoizedData = useMemo(() => {
    const selectedData = startlistArray.find(
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
        const equipoOrdered = `${equipoManger} [#${order}]`;
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

    const uniqueRondas = Array.from(
      new Set(rows.map((r) => r.ronda).filter(Boolean)),
    ).sort() as string[];

    const filteredRows = rows.filter((r) => {
      if (filters.team !== "All" && r.jugador !== filters.team) return false;
      if (filters.rondas.length > 0 && !filters.rondas.includes(r.ronda)) return false;
      
      if (filters.diasMin !== '' && r.dias < filters.diasMin) return false;
      if (filters.diasMax !== '' && r.dias > filters.diasMax) return false;
      
      if (filters.puntosMin !== '' && r.puntos < filters.puntosMin) return false;
      if (filters.puntosMax !== '' && r.puntos > filters.puntosMax) return false;
      
      if (filters.debut === 'Sí' && r.debut !== 'Sí') return false;
      if (filters.debut === 'No' && r.debut === 'Sí') return false;
      
      return true;
    });

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

    const maxDias = Math.max(0, ...filteredRows.map((r) => r.dias));
    const nonZeroDias = filteredRows.map((r) => r.dias).filter(d => d > 0);
    const minDias = nonZeroDias.length > 0 ? Math.min(...nonZeroDias) : 0;

    const teamRows: StartlistTeamRow[] = [];
    let maxCiclistas = 0;
    let minCiclistas = 999;

    const mapToUse = Object.keys(playerOrderMap).length > 0 ? playerOrderMap : DRAFT_RANK_MAP;

    Object.entries(mapToUse).forEach(([jugador, orden]) => {
      if (jugador === "No draft") return;
      const teamMembers = rows.filter((r) => r.jugadorName === jugador);
      const numCiclistas = teamMembers.length;
      if (numCiclistas > 0) {
        if (numCiclistas > maxCiclistas) maxCiclistas = numCiclistas;
        if (numCiclistas < minCiclistas) minCiclistas = numCiclistas;
      }
      const puntos = teamMembers.reduce((sum, r) => sum + r.puntos, 0);
      teamRows.push({
        orden: orden as string,
        equipo: `${playerTeamMap[jugador] || jugador} [#${orden}]`,
        numCiclistas,
        puntos,
        puntosMedios: numCiclistas ? Number((puntos / numCiclistas).toFixed(1)) : 0,
      });
    });

    teamRows.sort((a, b) => b.puntosMedios - a.puntosMedios);

    const maxTeamPoints = Math.max(1, ...teamRows.map((r) => r.puntos));
    const minTeamPoints = Math.min(...teamRows.map((r) => r.puntos));
    const maxTeamPointsMedios = Math.max(1, ...teamRows.map((r) => r.puntosMedios));
    const minTeamPointsMedios = Math.min(...teamRows.map((r) => r.puntosMedios));
    const maxCyclistPoints = Math.max(1, ...filteredRows.map((r) => r.puntos));
    const minCyclistPoints = Math.min(...filteredRows.map((r) => r.puntos));

    return {
      filteredRows,
      teamRows,
      uniqueTeams,
      uniqueRondas,
      maxCiclistas,
      minCiclistas,
      minTeamPoints,
      maxTeamPoints,
      minTeamPointsMedios,
      maxTeamPointsMedios,
      maxCyclistPoints,
      minCyclistPoints,
      maxDias,
      minDias,
    };
  }, [
    startlistArray,
    publicStartlistRace,
    cyclistMetadata,
    cyclistRoundMap,
    playerTeamMap,
    playerOrderMap,
    filters,
    startlistSortCol,
    startlistSortDir,
  ]);
  
  return {
    startlistArray,
    raceCategory,
    racePoints,
    memoizedData
  };
}
