import { useState } from 'react';
import { useUrlState } from '../../../../hooks/useUrlState';

export function useDraftElectionsState() {
  const [draftSearchTerm, setDraftSearchTerm] = useUrlState('draftSearchTerm', '');
  const [localSearch, setLocalSearch] = useState(draftSearchTerm);

  const [draftRoundFilter, setDraftRoundFilter] = useUrlState<string[]>('draftRoundFilter', []);
  const [draftTeamFilter, setDraftTeamFilter] = useUrlState<string[]>('draftTeamFilter', []);
  
  const [isDraftRoundFilterOpen, setIsDraftRoundFilterOpen] = useState(false);
  const [isDraftTeamFilterOpen, setIsDraftTeamFilterOpen] = useState(false);
  const [isDraftStatsFilterOpen, setIsDraftStatsFilterOpen] = useState(false);
  
  const [draftStatsFilters, setDraftStatsFilters] = useUrlState<Record<string, number | undefined>>('draftStatsFilters', {});
  const [localDraftStatsFilters, setLocalDraftStatsFilters] = useState<Record<string, number | undefined>>(draftStatsFilters);

  const [draftSortColumn, setDraftSortColumn] = useUrlState<string>('draftSortColumn', 'Elección');
  const [draftSortDirection, setDraftSortDirection] = useUrlState<'asc' | 'desc'>('draftSortDirection', 'asc');
  const [isDraftTableExpanded, setIsDraftTableExpanded] = useState(false);

  return {
    draftSearchTerm, setDraftSearchTerm,
    localSearch, setLocalSearch,
    draftRoundFilter, setDraftRoundFilter,
    draftTeamFilter, setDraftTeamFilter,
    isDraftRoundFilterOpen, setIsDraftRoundFilterOpen,
    isDraftTeamFilterOpen, setIsDraftTeamFilterOpen,
    isDraftStatsFilterOpen, setIsDraftStatsFilterOpen,
    draftStatsFilters, setDraftStatsFilters,
    localDraftStatsFilters, setLocalDraftStatsFilters,
    draftSortColumn, setDraftSortColumn,
    draftSortDirection, setDraftSortDirection,
    isDraftTableExpanded, setIsDraftTableExpanded,
  };
}