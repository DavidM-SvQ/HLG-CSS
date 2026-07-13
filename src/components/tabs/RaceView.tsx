import { useRaceData } from "../../hooks/useRaceData";
import { RaceHeader } from "./race/RaceHeader";
import { RaceResults } from "./race/RaceResults";
import React from "react";
import { useUrlState } from "../../hooks/useUrlState";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";
import { getRaceTheme } from "../../lib/utils/themeUtils";

export interface RaceViewProps {
  isAdminReport?: boolean;
}

import { ErrorBoundary } from "../ErrorBoundary";

export const RaceView = (props: RaceViewProps) => {
  const { isAdminReport = false } = props;
  const { files } = useDataStore();
  const { 
    leaderboard, 
    raceWinners, 
    uniqueRaces, 
    cyclistMetadata,
    globalTeamPartialWinsCount,
    globalTeamWinsCount
  } = useComputedStore();

  const [selectedRace, setSelectedRace] = useUrlState<string>("race", "");

  const raceDataObj = useRaceData(
    selectedRace, 
    leaderboard, 
    globalTeamPartialWinsCount, 
    globalTeamWinsCount, 
    raceWinners, 
    files,
    cyclistMetadata
  );

  const configuracionData = files.configuracion?.data || [];
  const initialThemesEnabled = configuracionData.find((item: any) => item.key === "themes_enabled")?.value;
  const isThemesEnabled = initialThemesEnabled !== undefined ? (initialThemesEnabled === "true" || initialThemesEnabled === true) : true;

  const { containerClasses, themeBadge } = getRaceTheme(selectedRace, isThemesEnabled);

  return (
    <ErrorBoundary>
      <div className={`border rounded-2xl shadow-sm p-6 relative transition-colors duration-500 ${containerClasses}`}>
        {themeBadge}
        <div className="relative z-10">
          <RaceHeader 
            isAdminReport={isAdminReport} 
            files={files} 
            uniqueRaces={uniqueRaces} 
            selectedRace={selectedRace} 
            setSelectedRace={setSelectedRace} 
          />

          {selectedRace ? (
            <RaceResults 
              isAdminReport={isAdminReport}
              selectedRace={selectedRace}
              leaderboard={leaderboard}
              raceDataObj={raceDataObj}
            />
          ) : (
            <div className="text-center py-12 text-neutral-500">
              Selecciona una carrera para ver el desglose de puntos.
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
