import React, { useMemo } from 'react';
import { Button } from "../../../ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { getVal, normalizeRaceName } from '../../../../lib/data-processing';
import { MultiSelect } from "../../../ui/multi-select";

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
  const categoryOptions = useMemo(() => {
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
    return Array.from(availableCategories).sort().map(cat => ({ value: cat, label: cat }));
  }, [files?.carreras?.data, leaderboard]);

  const teamOptions = useMemo(() => {
    const availableTeams = new Set<string>();
    files?.elecciones?.data?.forEach((row: any) => {
      const teamName = getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG");
      if (teamName) availableTeams.add(teamName as string);
    });
    return Array.from(availableTeams).sort().map(team => ({ value: team, label: team }));
  }, [files?.elecciones?.data]);

  const monthOptions = MONTHS.map(m => ({ value: m, label: m }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[140px]">
        <MultiSelect 
          options={monthOptions} 
          value={draftDatosMonthFilter} 
          onChange={setDraftDatosMonthFilter} 
          placeholder="Meses" 
        />
      </div>
      <div className="min-w-[140px]">
        <MultiSelect 
          options={categoryOptions} 
          value={draftDatosCategoryFilter} 
          onChange={setDraftDatosCategoryFilter} 
          placeholder="Categorías" 
        />
      </div>
      <div className="min-w-[140px]">
        <MultiSelect 
          options={teamOptions} 
          value={draftDatosTeamFilter} 
          onChange={setDraftDatosTeamFilter} 
          placeholder="Equipos" 
        />
      </div>
    </div>
  );
};
