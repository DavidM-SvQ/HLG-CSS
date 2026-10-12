import React, { useMemo } from 'react';
import { getVal, normalizeRaceName } from '../../../../lib/data-processing';
import { MultiSelectDropdown } from "../../../ui/MultiSelectDropdown";
import { Button } from "../../../ui/button";
import { RotateCcw } from "lucide-react";

export interface DraftDatosFiltersProps {
  files: any;
  leaderboard: any[];
  draftDatosMonthFilter: string[];
  setDraftDatosMonthFilter: (val: string[]) => void;
  draftDatosCategoryFilter: string[];
  setDraftDatosCategoryFilter: (val: string[]) => void;
  draftDatosTeamFilter: string[];
  setDraftDatosTeamFilter: (val: string[]) => void;
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export const DraftDatosFilters: React.FC<DraftDatosFiltersProps> = ({
  files,
  leaderboard,
  draftDatosMonthFilter,
  setDraftDatosMonthFilter,
  draftDatosCategoryFilter,
  setDraftDatosCategoryFilter,
  draftDatosTeamFilter,
  setDraftDatosTeamFilter
}) => {
  const categoryNames = useMemo(() => {
    const raceTypeByName: Record<string, string> = {};
    files?.carreras?.data?.forEach((row: any) => {
      const carrera = getVal(row, "Carrera")?.trim();
      const categoria = getVal(row, "Categoría")?.trim();
      if (carrera && categoria) {
        raceTypeByName[carrera] = categoria;
        raceTypeByName[normalizeRaceName(carrera)] = categoria;
      }
    });
    const availableCategories = new Set<string>();
    leaderboard?.forEach((player: any) => {
      player?.detalles?.forEach((d: any) => {
        const cat = raceTypeByName[d.carrera] || raceTypeByName[normalizeRaceName(d.carrera)];
        if (cat) availableCategories.add(cat);
      });
    });
    return Array.from(availableCategories).sort();
  }, [files?.carreras?.data, leaderboard]);

  const teamNames = useMemo(() => {
    const availableTeams = new Set<string>();
    files?.elecciones?.data?.forEach((row: any) => {
      const teamName = getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG");
      if (teamName) availableTeams.add(teamName as string);
    });
    return Array.from(availableTeams).sort();
  }, [files?.elecciones?.data]);

  const hasActiveFilters = useMemo(() => {
    const isMonthsActive = draftDatosMonthFilter.length > 0 && 
      !draftDatosMonthFilter.includes("All") && 
      !draftDatosMonthFilter.includes("Todos");
    const isCategoriesActive = draftDatosCategoryFilter.length > 0 && 
      !draftDatosCategoryFilter.includes("All") && 
      !draftDatosCategoryFilter.includes("Todas");
    const isTeamsActive = draftDatosTeamFilter.length > 0 && 
      !draftDatosTeamFilter.includes("All") && 
      !draftDatosTeamFilter.includes("Todos");
    return isMonthsActive || isCategoriesActive || isTeamsActive;
  }, [draftDatosMonthFilter, draftDatosCategoryFilter, draftDatosTeamFilter]);

  const handleClearAll = () => {
    setDraftDatosMonthFilter([]);
    setDraftDatosCategoryFilter([]);
    setDraftDatosTeamFilter([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[140px]">
        <MultiSelectDropdown
          allItems={MONTHS}
          selectedItems={draftDatosMonthFilter}
          onChange={setDraftDatosMonthFilter}
          placeholderAll="Todos los meses"
          placeholderNone="Ningún mes"
          unitLabelSingular="mes"
          unitLabelPlural="meses"
          allCountLabel="Todos"
          className="min-w-[140px]"
          buttonClassName="bg-white/90 border-neutral-200"
        />
      </div>

      <div className="min-w-[160px]">
        <MultiSelectDropdown
          allItems={categoryNames}
          selectedItems={draftDatosCategoryFilter}
          onChange={setDraftDatosCategoryFilter}
          placeholderAll="Todas las categorías"
          placeholderNone="Ninguna categoría"
          unitLabelSingular="categoría"
          unitLabelPlural="categorías"
          allCountLabel="Todas"
          className="min-w-[160px]"
          buttonClassName="bg-white/90 border-neutral-200"
        />
      </div>

      <div className="min-w-[170px]">
        <MultiSelectDropdown
          allItems={teamNames}
          selectedItems={draftDatosTeamFilter}
          onChange={setDraftDatosTeamFilter}
          placeholderAll="Todos los equipos"
          placeholderNone="Ningún equipo"
          unitLabelSingular="equipo"
          unitLabelPlural="equipos"
          allCountLabel="Todos"
          className="min-w-[170px]"
          buttonClassName="bg-white/90 border-neutral-200"
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-9 px-2 text-xs text-neutral-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors"
          title="Limpiar todos los filtros"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpiar</span>
        </Button>
      )}
    </div>
  );
};
