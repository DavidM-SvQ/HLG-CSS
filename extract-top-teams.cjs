const fs = require('fs');
const path = './src/components/tabs/season/SeasonPointsTab.tsx';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

const startIndex = lines.findIndex(l => l.includes('{/* Top Teams Table */}'));
// Since it goes until the end of the file or just before the final `</>` and `</div>`, let's just write everything from startIndex to end.

if (startIndex !== -1) {
  const extractedLines = lines.slice(startIndex, lines.length - 6); // remove the closing tags of SeasonPointsTab
  fs.writeFileSync('./TopTeams_raw.txt', extractedLines.join('\n'));
  console.log('Extracted max lines:', extractedLines.length);
} else {
  console.log('Not found:', startIndex);
}
