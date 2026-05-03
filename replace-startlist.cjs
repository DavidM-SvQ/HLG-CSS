const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = '{publicTab === "startlist" && (';
const endMarker = '{publicTab === "draft" && (';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log('Markers not found', startIndex, endIndex);
  process.exit(1);
}

const replacementLines = [
  '            {publicTab === "startlist" && (',
  '              <StartlistView',
  '                files={files}',
  '                publicStartlistRace={publicStartlistRace}',
  '                setPublicStartlistRace={setPublicStartlistRace}',
  '                cyclistMetadata={cyclistMetadata}',
  '                cyclistRoundMap={cyclistRoundMap}',
  '                playerTeamMap={playerTeamMap}',
  '                playerOrderMap={playerOrderMap}',
  '                colorScale={colorScale}',
  '              />',
  '            )}',
  '',
  '            '
];

const newCode = code.substring(0, startIndex) + replacementLines.join('\n') + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', newCode);
console.log('App.tsx updated successfully.');
