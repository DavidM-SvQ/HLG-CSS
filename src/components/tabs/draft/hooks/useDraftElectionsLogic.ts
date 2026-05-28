import { useMemo } from 'react';
import { getVal } from '../../../../lib/data-processing';
import { AppState, CyclistMetadata } from '../../../../lib/types';

export function useDraftElectionsLogic(
  files: AppState,
  draftSearchTerm: string,
  draftRoundFilter: string[],
  draftTeamFilter: string[],
  draftStatsFilters: Record<string, number | string | undefined>,
  draftCyclistStats: Record<string, { puntos: number; victorias: number }>,
  cyclistMetadata: Record<string, CyclistMetadata>,
  draftSortColumn: string,
  draftSortDirection: 'asc' | 'desc'
) {
  const draftFilteredData = useMemo(() => {
    if (!files?.elecciones?.data) return [];
    return files.elecciones.data.filter((row: any) => {
      const ciclista = getVal(row, 'Ciclista') as string;
      const matchesSearch = ciclista
        ?.toLowerCase()
        .includes(draftSearchTerm.toLowerCase());
      const matchesRound =
        draftRoundFilter.length === 0 ||
        draftRoundFilter.includes(String(getVal(row, 'Ronda')));
      const matchesTeam =
        draftTeamFilter.length === 0 ||
        draftTeamFilter.includes(
          String(getVal(row, 'Nombre_Equipo') || getVal(row, 'Nombre_TG'))
        );

      let matchesStats = true;
      if (ciclista) {
        const stats = draftCyclistStats[ciclista] || { puntos: 0, victorias: 0 };
        const meta = cyclistMetadata[ciclista] || { carrerasDisputadas: 0, diasCompeticion: 0 };
        
        const puntos = stats.puntos;
        const victorias = stats.victorias;
        const carr = meta.carrerasDisputadas;
        const dc = meta.diasCompeticion;
        const ppc = carr > 0 ? puntos / carr : 0;
        const ppd = dc > 0 ? puntos / dc : 0;

        if (draftStatsFilters.minPuntos !== undefined && draftStatsFilters.minPuntos !== '' as any && puntos < Number(draftStatsFilters.minPuntos))
          matchesStats = false;
        if (draftStatsFilters.maxPuntos !== undefined && draftStatsFilters.maxPuntos !== '' as any && puntos > Number(draftStatsFilters.maxPuntos))
          matchesStats = false;
        if (draftStatsFilters.minVictorias !== undefined && draftStatsFilters.minVictorias !== '' as any && victorias < Number(draftStatsFilters.minVictorias))
          matchesStats = false;
        if (draftStatsFilters.maxVictorias !== undefined && draftStatsFilters.maxVictorias !== '' as any && victorias > Number(draftStatsFilters.maxVictorias))
          matchesStats = false;
        if (draftStatsFilters.minCarr !== undefined && draftStatsFilters.minCarr !== '' as any && carr < Number(draftStatsFilters.minCarr))
          matchesStats = false;
        if (draftStatsFilters.maxCarr !== undefined && draftStatsFilters.maxCarr !== '' as any && carr > Number(draftStatsFilters.maxCarr))
          matchesStats = false;
        if (draftStatsFilters.minDc !== undefined && draftStatsFilters.minDc !== '' as any && dc < Number(draftStatsFilters.minDc))
          matchesStats = false;
        if (draftStatsFilters.maxDc !== undefined && draftStatsFilters.maxDc !== '' as any && dc > Number(draftStatsFilters.maxDc))
          matchesStats = false;
        if (draftStatsFilters.minPpc !== undefined && draftStatsFilters.minPpc !== '' as any && ppc < Number(draftStatsFilters.minPpc))
          matchesStats = false;
        if (draftStatsFilters.maxPpc !== undefined && draftStatsFilters.maxPpc !== '' as any && ppc > Number(draftStatsFilters.maxPpc))
          matchesStats = false;
        if (draftStatsFilters.minPpd !== undefined && draftStatsFilters.minPpd !== '' as any && ppd < Number(draftStatsFilters.minPpd))
          matchesStats = false;
        if (draftStatsFilters.maxPpd !== undefined && draftStatsFilters.maxPpd !== '' as any && ppd > Number(draftStatsFilters.maxPpd))
          matchesStats = false;
      }

      return matchesSearch && matchesRound && matchesTeam && matchesStats;
    });
  }, [files?.elecciones?.data, draftSearchTerm, draftRoundFilter, draftTeamFilter, draftStatsFilters, draftCyclistStats, cyclistMetadata]);

  const draftSortedData = useMemo(() => {
    return [...draftFilteredData].sort((a, b) => {
      if (draftSortColumn === 'Puntos') {
        const ptsA = draftCyclistStats[getVal(a, 'Ciclista') || '']?.puntos || 0;
        const ptsB = draftCyclistStats[getVal(b, 'Ciclista') || '']?.puntos || 0;
        return draftSortDirection === 'asc' ? ptsA - ptsB : ptsB - ptsA;
      }
      if (draftSortColumn === 'V') {
        const vicA = draftCyclistStats[getVal(a, 'Ciclista') || '']?.victorias || 0;
        const vicB = draftCyclistStats[getVal(b, 'Ciclista') || '']?.victorias || 0;
        return draftSortDirection === 'asc' ? vicA - vicB : vicB - vicA;
      }
      if (draftSortColumn === 'C') {
        const cA = cyclistMetadata[getVal(a, 'Ciclista') || '']?.carrerasDisputadas || 0;
        const cB = cyclistMetadata[getVal(b, 'Ciclista') || '']?.carrerasDisputadas || 0;
        return draftSortDirection === 'asc' ? cA - cB : cB - cA;
      }
      if (draftSortColumn === 'DC') {
        const dcA = cyclistMetadata[getVal(a, 'Ciclista') || '']?.diasCompeticion || 0;
        const dcB = cyclistMetadata[getVal(b, 'Ciclista') || '']?.diasCompeticion || 0;
        return draftSortDirection === 'asc' ? dcA - dcB : dcB - dcA;
      }
      const valA = getVal(a, draftSortColumn);
      const valB = getVal(b, draftSortColumn);
      if (!valA) return 1;
      if (!valB) return -1;
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return draftSortDirection === 'asc' ? numA - numB : numB - numA;
      }
      return draftSortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [draftFilteredData, draftSortColumn, draftSortDirection, draftCyclistStats, cyclistMetadata]);

  return { draftFilteredData, draftSortedData };
}
