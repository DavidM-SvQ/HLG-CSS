const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

const targetCode = '          {(() => {\\n            const selectedData = files.startlist.data?.find(\\n              (d: any) => d.carrera === publicStartlistRace,\\n            );\\n            if (!selectedData) return null;';

const replacement = '          {(() => {\\n            if (memoizedData.filteredRows.length === 0 && memoizedData.teamRows.length === 0) return null;\\n            const { filteredRows, teamRows, uniqueTeams, maxCiclistas, minCiclistas, minTeamPoints, maxTeamPoints, minTeamPointsMedios, maxTeamPointsMedios } = memoizedData;\\n';

// Since the newlines might not match exactly, I'll use regex or simple indices.

const startIdx = code.indexOf('          {(() => {\\n            const selectedData');
const endIdx = code.indexOf('            const getTeamPointsColorStyle = (punt: number) => {');

if(startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
    fs.writeFileSync('src/components/tabs/StartlistView.tsx', code);
    console.log("Replaced IIFE content");
} else {
    console.log("Not found");
}
