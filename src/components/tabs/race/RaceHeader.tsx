import { AppState } from '../../../lib/types';
import React from "react";
import { PublishedRacesTracker } from "./PublishedRacesTracker";
import { SearchableRaceSelect } from "../../ui/SearchableRaceSelect";
import { getRaceTag, RaceTagInfo } from "../../../lib/utils/themeUtils";
import { getVal, isSameRace } from "../../../lib/data-processing";

interface RaceHeaderProps {
  isAdminReport: boolean;
  files: AppState;
  uniqueRaces: string[];
  selectedRace: string;
  setSelectedRace: (val: string) => void;
  tagInfo?: RaceTagInfo | null;
}

export const RaceHeader = ({ isAdminReport, files, uniqueRaces, selectedRace, setSelectedRace, tagInfo }: RaceHeaderProps) => {
  const currentTag = tagInfo || React.useMemo(() => {
    if (!selectedRace) return null;
    const match = files?.carreras?.data?.find((r: any) => isSameRace(getVal(r, "Carrera"), selectedRace));
    const cat = match ? getVal(match, "Categoría") : undefined;
    return getRaceTag(selectedRace, cat);
  }, [selectedRace, files?.carreras?.data]);

  return (
    <>
      {isAdminReport && (
        <PublishedRacesTracker files={files} uniqueRaces={uniqueRaces} />
      )}

      <div className="max-w-md mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-neutral-700">
            Selecciona una carrera
          </label>
          {currentTag && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs shadow-2xs ${currentTag.badgeClasses}`}>
              {currentTag.icon && <span>{currentTag.icon}</span>}
              <span>{currentTag.label}</span>
            </span>
          )}
        </div>

        <SearchableRaceSelect
          races={uniqueRaces}
          selectedRace={selectedRace}
          onSelectRace={setSelectedRace}
          files={files}
          placeholder="-- Seleccionar o buscar carrera --"
          showTagInTrigger={false}
        />
      </div>
    </>
  );
};
