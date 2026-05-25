import { useRaceData } from "../../hooks/useRaceData";
import { RaceHeader } from "./race/RaceHeader";
import { RaceResults } from "./race/RaceResults";
import React from "react";
import { useUrlState } from "../../hooks/useUrlState";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";

export interface RaceViewProps {
  isAdminReport?: boolean;
}

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

  return (
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6">
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
    );
};
