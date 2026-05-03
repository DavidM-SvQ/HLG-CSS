const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const startIndex = code.findIndex(l => l.includes('{publicTab === "draft" && ('));
const endIndex = code.findIndex(l => l.includes('{publicTab === "info" && ('));

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries");
  process.exit(1);
}

const replacement = [
  '            {publicTab === "draft" && (',
  '              <DraftView',
  '                files={files}',
  '                draftCyclistStats={draftCyclistStats}',
  '                cyclistMetadata={cyclistMetadata}',
  '                playerTeamMap={playerTeamMap}',
  '                getStatColor={getStatColor}',
  '                monthColors={monthColors}',
  '                monthOrder={monthOrder}',
  '                allRaces={allRaces}',
  '              />',
  '            )}',
  ''
];

const newCode = code.slice(0, startIndex).concat(replacement).concat(code.slice(endIndex)).join('\n');
fs.writeFileSync('src/App.tsx', newCode);
console.log('App.tsx updated effectively.');
