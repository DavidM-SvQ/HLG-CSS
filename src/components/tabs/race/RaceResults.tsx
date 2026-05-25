import React from "react";
import { RaceAdminReport } from "./RaceAdminReport";
import { RacePodium } from "./RacePodium";
import { RaceTeamsList } from "./RaceTeamsList";
import { RaceStats } from "./RaceStats";

export interface RaceResultsProps {
  isAdminReport: boolean;
  selectedRace: string;
  leaderboard: any[];
  raceDataObj: any;
}

export const RaceResults = ({
  isAdminReport,
  selectedRace,
  leaderboard,
  raceDataObj,
}: RaceResultsProps) => {
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
    maxCyclistPointsByCol,
    __textValue,
    retiredCyclists,
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
        maxCyclistPointsByCol={maxCyclistPointsByCol}
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
};
