const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

const replacement = "            if (memoizedData.filteredRows.length === 0 && memoizedData.teamRows.length === 0) return null;\n" +
"            const { filteredRows, teamRows, uniqueTeams, maxCiclistas, minCiclistas, minTeamPoints, maxTeamPoints, minTeamPointsMedios, maxTeamPointsMedios } = memoizedData;\n";

const startIdx = code.indexOf('            const selectedData = files.startlist.data?.find(');
const endIdx = code.indexOf('            const getTeamPointsColorStyle = (punt: number) => {');

if(startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
    fs.writeFileSync('src/components/tabs/StartlistView.tsx', code);
    console.log("Replaced IIFE content successful!");
} else {
    console.log("Not found");
}
