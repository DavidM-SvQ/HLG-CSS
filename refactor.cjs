const fs = require('fs');

const file = fs.readFileSync('src/components/tabs/season/SeasonMilestones.tsx', 'utf8');

const useMemoStart = file.indexOf('  const { teamMilestones, cyclistMilestones } = useMemo(() => {');
const useMemoEnd = file.indexOf('  }, [files.resultados?.data, files.carreras?.data, leaderboard, cyclistMetadata]);') + '  }, [files.resultados?.data, files.carreras?.data, leaderboard, cyclistMetadata]);'.length;

const useMemoCode = file.substring(useMemoStart, useMemoEnd);

const hookContent = `import React, { useMemo } from "react";
import { formatNumberSpanish, getVal } from "../../../../lib/data-processing";
import { Award, Trophy, Crown, Globe, Users, Medal } from "lucide-react";

export const useSeasonMilestonesLogic = ({ leaderboard, files, cyclistMetadata, raceWinners }: any) => {
${useMemoCode}

  return { teamMilestones, cyclistMilestones };
};
`;

fs.mkdirSync('src/components/tabs/season/hooks', { recursive: true });
fs.writeFileSync('src/components/tabs/season/hooks/useSeasonMilestonesLogic.tsx', hookContent);

const newComponentCode = file.substring(0, useMemoStart) + `  const { teamMilestones, cyclistMilestones } = useSeasonMilestonesLogic({ leaderboard, files, cyclistMetadata, raceWinners });\n` + file.substring(useMemoEnd);

const finalComponentCode = `import { useSeasonMilestonesLogic } from "./hooks/useSeasonMilestonesLogic";\n` + newComponentCode;

fs.writeFileSync('src/components/tabs/season/SeasonMilestones.tsx', finalComponentCode);
