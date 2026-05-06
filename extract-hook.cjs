const fs = require('fs');

const content = fs.readFileSync('src/components/tabs/RaceView.tsx', 'utf8');
const startIdx = content.indexOf('const raceTeams =');
const endIdx = content.indexOf('return (', startIdx);
const before = content.slice(0, startIdx);
const logic = content.slice(startIdx, endIdx);
const after = content.slice(endIdx);

const hookCode = `import { useMemo } from 'react';
import { getVal } from '../lib/data-processing';

export function useRaceData(
  selectedRace: string,
  leaderboard: any[],
  globalTeamPartialWinsCount: Record<string, any>,
  globalTeamWinsCount: Record<string, number>,
  raceWinners: Record<string, string>,
  files: any
) {
  return useMemo(() => {
    if (!selectedRace) return null;

${logic.replace(/^/gm, '    ')}

    return {
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
      __textValue
    };
  }, [selectedRace, leaderboard, globalTeamPartialWinsCount, globalTeamWinsCount, raceWinners, files]);
}
`;

fs.writeFileSync('src/hooks/useRaceData.ts', hookCode);

const updatedRaceView = before + `const raceDataObj = useRaceData(selectedRace, leaderboard, globalTeamPartialWinsCount, globalTeamWinsCount, raceWinners, files);

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
              __textValue
            } = raceDataObj;

            ` + after;

// Also add import for useRaceData at the top of RaceView.tsx
const importStatement = `import { useRaceData } from "../../hooks/useRaceData";\n`;
const finalRaceView = importStatement + updatedRaceView;

fs.writeFileSync('src/components/tabs/RaceView.tsx', finalRaceView);
console.log('Extraction complete');
