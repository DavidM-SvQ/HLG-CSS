import React, { useMemo, useState } from "react";
import { PlayerScore } from "../../../../lib/types";
import { parseSafeDateStr } from "../../../../lib/data-processing";

export interface DailyCyclistPoint {
  ciclista: string;
  puntos: number;
  carrera: string;
  etapa?: string;
}

export interface TeamDailyStat {
  teamKey: string;
  nombreEquipo: string;
  orden: string;
  jugador: string;
  posPrevia: number;
  posNueva: number;
  deltaPos: number; // positive = climbed, negative = dropped
  puntosDia: number;
  puntosAcumulados: number;
  difLider: number;
  difPrevio: number;
  ciclistasDia: DailyCyclistPoint[];
}

export interface DateOption {
  date: string;
  formattedDate: string;
  races: string[];
  totalPoints: number;
  label: string;
}

export function useDailyEvolutionData(
  activeTeams: PlayerScore[],
  files?: any
) {
  // Pre-normalize team details once per activeTeams change to avoid repeating parseSafeDateStr in hot loops
  const normalizedTeams = useMemo(() => {
    return activeTeams.map((team) => {
      const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
      const details = (team.detalles || []).map((d: any) => ({
        ciclista: d.ciclista,
        carrera: d.carrera || "",
        etapa: d.etapa || "",
        safeDate: d.fecha ? parseSafeDateStr(d.fecha) : "",
        pts: typeof d.puntosObtenidos === "number" ? d.puntosObtenidos : 0,
      }));
      return {
        team,
        teamKey,
        details,
      };
    });
  }, [activeTeams]);

  // 1. Gather all unique competition dates from pre-normalized details
  const { availableDates, dateRaceMap, datePointsMap } = useMemo(() => {
    const datesSet = new Set<string>();
    const dRaceMap: Record<string, Set<string>> = {};
    const dPointsMap: Record<string, number> = {};

    normalizedTeams.forEach(({ details }) => {
      details.forEach((d) => {
        if (!d.safeDate || d.safeDate.length !== 10) return;
        datesSet.add(d.safeDate);
        if (!dRaceMap[d.safeDate]) dRaceMap[d.safeDate] = new Set<string>();
        if (d.carrera) dRaceMap[d.safeDate].add(d.carrera);
        dPointsMap[d.safeDate] = (dPointsMap[d.safeDate] || 0) + d.pts;
      });
    });

    const sorted = Array.from(datesSet).sort();
    return {
      availableDates: sorted,
      dateRaceMap: dRaceMap,
      datePointsMap: dPointsMap,
    };
  }, [normalizedTeams]);

  // Format date helper (e.g. 2026-04-12 -> 12/04/2026)
  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return "";
    const p = dStr.split("-");
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return dStr;
  };

  // Build structured date options for the selector
  const dateOptions: DateOption[] = useMemo(() => {
    return availableDates.map((d) => {
      const races = Array.from(dateRaceMap[d] || []).filter(Boolean);
      const totalPoints = datePointsMap[d] || 0;
      const formattedDate = formatDisplayDate(d);
      const racesSummary = races.length > 0 ? races.slice(0, 2).join(", ") + (races.length > 2 ? ` (+${races.length - 2})` : "") : "Jornada";
      return {
        date: d,
        formattedDate,
        races,
        totalPoints,
        label: `${formattedDate} · ${racesSummary} (${totalPoints} pts)`
      };
    });
  }, [availableDates, dateRaceMap, datePointsMap]);

  // Selected date state: defaults to the most recent date available
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return availableDates.length > 0 ? availableDates[availableDates.length - 1] : "";
  });

  // Ensure selectedDate updates if availableDates changes and selectedDate is not in the list
  React.useEffect(() => {
    if (availableDates.length > 0 && (!selectedDate || !availableDates.includes(selectedDate))) {
      setSelectedDate(availableDates[availableDates.length - 1]);
    }
  }, [availableDates, selectedDate]);

  // Comparison mode: "single" day vs "range" (accumulated from start of a range up to selected date)
  const [comparisonMode, setComparisonMode] = useState<"single" | "range">("single");
  const [rangeStartDate, setRangeStartDate] = useState<string>(() => {
    return availableDates.length > 0 ? availableDates[0] : "";
  });

  // Navigation helpers
  const currentIndex = availableDates.indexOf(selectedDate);
  const hasPrevDate = currentIndex > 0;
  const hasNextDate = currentIndex >= 0 && currentIndex < availableDates.length - 1;

  const goToPrevDate = () => {
    if (hasPrevDate) {
      setSelectedDate(availableDates[currentIndex - 1]);
    }
  };

  const goToNextDate = () => {
    if (hasNextDate) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };

  // 2. Compute team daily statistics for selectedDate (or range) with O(1) date evaluations
  const dailyStats = useMemo(() => {
    if (!selectedDate || normalizedTeams.length === 0) return [];

    const isRange = comparisonMode === "range" && rangeStartDate && rangeStartDate < selectedDate;
    const effStartDate = isRange ? rangeStartDate : selectedDate;
    const effEndDate = selectedDate;

    // A. For each team, compute points in target day/range, accumulated before, and accumulated after
    const rawTeamsData = normalizedTeams.map(({ team, teamKey, details }) => {
      let ptsDia = 0;
      let accumPrevia = 0;
      let accumNueva = 0;
      const ciclistasDiaMap: Record<string, DailyCyclistPoint> = {};

      details.forEach((d) => {
        const safe = d.safeDate;
        if (!safe) return;
        const pts = d.pts;

        // Accumulated strictly before the selected date/range
        if (safe < effStartDate) {
          accumPrevia += pts;
        }

        // Within target day/range
        if (safe >= effStartDate && safe <= effEndDate) {
          ptsDia += pts;
          if (pts > 0 && d.ciclista) {
            const cKey = `${d.ciclista}_${d.carrera}`;
            if (!ciclistasDiaMap[cKey]) {
              ciclistasDiaMap[cKey] = {
                ciclista: d.ciclista,
                puntos: 0,
                carrera: d.carrera,
                etapa: d.etapa
              };
            }
            ciclistasDiaMap[cKey].puntos += pts;
          }
        }

        // Accumulated up to effEndDate inclusive
        if (safe <= effEndDate) {
          accumNueva += pts;
        }
      });

      const ciclistasDia = Object.values(ciclistasDiaMap).sort((a, b) => b.puntos - a.puntos);

      return {
        teamKey,
        nombreEquipo: team.nombreEquipo,
        orden: team.orden,
        jugador: team.jugador,
        ptsDia,
        accumPrevia,
        accumNueva,
        ciclistasDia
      };
    });

    // B. Calculate previous ranking (before effStartDate)
    const sortedByPrevia = [...rawTeamsData].sort(
      (a, b) => b.accumPrevia - a.accumPrevia || a.nombreEquipo.localeCompare(b.nombreEquipo)
    );
    const posPreviaMap: Record<string, number> = {};
    sortedByPrevia.forEach((t, idx) => {
      posPreviaMap[t.teamKey] = idx + 1;
    });

    // C. Calculate new ranking (up to effEndDate)
    const sortedByNueva = [...rawTeamsData].sort(
      (a, b) => b.accumNueva - a.accumNueva || a.nombreEquipo.localeCompare(b.nombreEquipo)
    );
    const posNuevaMap: Record<string, number> = {};
    sortedByNueva.forEach((t, idx) => {
      posNuevaMap[t.teamKey] = idx + 1;
    });

    // D. Compile final team stats with deltas and leader differences
    const maxAccum = sortedByNueva.length > 0 ? sortedByNueva[0].accumNueva : 0;

    const result: TeamDailyStat[] = sortedByNueva.map((t, idx) => {
      const posPrevia = posPreviaMap[t.teamKey] || idx + 1;
      const posNueva = posNuevaMap[t.teamKey] || idx + 1;
      const deltaPos = posPrevia - posNueva;
      const difLider = t.accumNueva - maxAccum;
      const prevTeamInRank = idx > 0 ? sortedByNueva[idx - 1] : null;
      const difPrevio = prevTeamInRank ? t.accumNueva - prevTeamInRank.accumNueva : 0;

      return {
        teamKey: t.teamKey,
        nombreEquipo: t.nombreEquipo,
        orden: t.orden,
        jugador: t.jugador,
        posPrevia,
        posNueva,
        deltaPos,
        puntosDia: t.ptsDia,
        puntosAcumulados: t.accumNueva,
        difLider,
        difPrevio,
        ciclistasDia: t.ciclistasDia
      };
    });

    return result;
  }, [normalizedTeams, selectedDate, comparisonMode, rangeStartDate]);

  // 3. Summary KPIs for the selected date
  const summaryKpis = useMemo(() => {
    if (dailyStats.length === 0) return null;

    // Top scorer team of the day
    const sortedByPoints = [...dailyStats].sort((a, b) => b.puntosDia - a.puntosDia);
    const topTeam = sortedByPoints[0]?.puntosDia > 0 ? sortedByPoints[0] : null;

    // Best climber of the day (highest positive deltaPos)
    const sortedByDelta = [...dailyStats].sort((a, b) => b.deltaPos - a.deltaPos);
    const bestClimber = sortedByDelta[0]?.deltaPos > 0 ? sortedByDelta[0] : null;

    // Total points distributed on this date
    const totalPuntosJornada = dailyStats.reduce((sum, t) => sum + t.puntosDia, 0);

    // Races active on this date
    const races = dateRaceMap[selectedDate] ? Array.from(dateRaceMap[selectedDate]) : [];

    return {
      topTeam,
      bestClimber,
      totalPuntosJornada,
      races
    };
  }, [dailyStats, selectedDate, dateRaceMap]);

  return {
    availableDates,
    dateOptions,
    selectedDate,
    setSelectedDate,
    formatDisplayDate,
    comparisonMode,
    setComparisonMode,
    rangeStartDate,
    setRangeStartDate,
    hasPrevDate,
    hasNextDate,
    goToPrevDate,
    goToNextDate,
    dailyStats,
    summaryKpis,
  };
}
