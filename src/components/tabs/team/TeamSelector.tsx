import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

interface TeamSelectorProps {
  selectedTeam: string;
  setSelectedTeam: (val: string) => void;
  formattedTeams: { label: string; value: string }[];
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  selectedTeam,
  setSelectedTeam,
  formattedTeams,
}) => {
  return (
    <div className="max-w-md mb-8">
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        Selecciona tu equipo
      </label>
      <Select value={selectedTeam} onValueChange={(value) => setSelectedTeam(value)}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="-- Seleccionar Equipo --" />
        </SelectTrigger>
        <SelectContent>
          {formattedTeams.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
