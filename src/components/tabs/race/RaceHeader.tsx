import React from "react";
import { PublishedRacesTracker } from "./PublishedRacesTracker";

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
        <select
          value={selectedRace}
          onChange={(e) => setSelectedRace(e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">-- Seleccionar Carrera --</option>
          {uniqueRaces.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};
