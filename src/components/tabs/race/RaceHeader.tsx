import React from "react";
import { PublishedRacesTracker } from "./PublishedRacesTracker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

interface RaceHeaderProps {
  isAdminReport: boolean;
  files: any;
  uniqueRaces: string[];
  selectedRace: string;
  setSelectedRace: (val: string) => void;
}

export const RaceHeader = ({ isAdminReport, files, uniqueRaces, selectedRace, setSelectedRace }: RaceHeaderProps) => {
  return (
    <>
      {isAdminReport && (
        <PublishedRacesTracker files={files} uniqueRaces={uniqueRaces} />
      )}

      <div className="max-w-md mb-8">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Selecciona una carrera
        </label>
        <Select value={selectedRace} onValueChange={(value) => setSelectedRace(value)}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="-- Seleccionar Carrera --" />
          </SelectTrigger>
          <SelectContent>
            {uniqueRaces.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
