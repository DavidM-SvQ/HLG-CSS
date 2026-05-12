import { useRaceData } from "../../hooks/useRaceData";
import { RaceAdminReport } from "./race/RaceAdminReport";
import { RaceHeader } from "./race/RaceHeader";
import { RacePodium } from "./race/RacePodium";
import { RaceTeamsList } from "./race/RaceTeamsList";
import { RaceStats } from "./race/RaceStats";
import React from "react";

export interface RaceViewProps {
  files: any;
  selectedRace: string;
  setSelectedRace: (val: string) => void;
  uniqueRaces: string[];
  leaderboard: any[];
  globalTeamPartialWinsCount: { totals: Record<string, number>; byRace: Record<string, Record<string, string[]>> };
  isAdminReport?: boolean;
  raceWinners: Record<string, string>;
  globalTeamWinsCount: Record<string, number>;
  cyclistMetadata: Record<string, any>;
}

export const RaceView = (props: RaceViewProps) => {
  const { files, selectedRace, setSelectedRace, uniqueRaces, leaderboard, globalTeamPartialWinsCount, isAdminReport = false, raceWinners, globalTeamWinsCount, cyclistMetadata } = props;

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
          (() => {
            if (!raceDataObj) return null;
            const {
              raceTeams,
              rankedTeams,
              maxUniqueCyclists,
              minUniqueCyclists,
              maxRacePoints,
              minRacePoints,
              maxRacePartialWins,
              minRacePartialWins,
              allRaceResults,
              finalColumns,
              teamStagePoints,
              maxPointsByCol,
              raceCyclistsMap,
              raceCyclists,
              maxCyclistRacePoints,
              minCyclistRacePoints,
              __textValue,
              retiredCyclists
            } = raceDataObj;

            return (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <RaceAdminReport 
                  isAdminReport={isAdminReport} 
                  rankedTeams={rankedTeams} 
                  raceCyclists={raceCyclists} 
                  textValue={__textValue} 
                />

                <RacePodium rankedTeams={rankedTeams} />

                <RaceTeamsList 
                  rankedTeams={rankedTeams} 
                  maxUniqueCyclists={maxUniqueCyclists}
                  minRacePoints={minRacePoints}
                  maxRacePoints={maxRacePoints}
                  minRacePartialWins={minRacePartialWins}
                  maxRacePartialWins={maxRacePartialWins}
                />

                <RaceStats 
                  raceCyclists={raceCyclists}
                  minCyclistRacePoints={minCyclistRacePoints}
                  maxCyclistRacePoints={maxCyclistRacePoints}
                  finalColumns={finalColumns}
                  teamStagePoints={teamStagePoints}
                  maxPointsByCol={maxPointsByCol}
                  retiredCyclists={retiredCyclists}
                  raceTeams={raceTeams}
                  selectedRace={selectedRace}
                  leaderboard={leaderboard}
                />
              </div>
            );
          })()
        ) : (
          <div className="text-center py-12 text-neutral-500">
            Selecciona una carrera para ver el desglose de puntos.
          </div>
        )}
      </div>
    );
};
