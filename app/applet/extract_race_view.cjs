const fs = require('fs');

const lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');

// 12425 is: {publicTab === "race" && (
const raceBlockLines = lines.slice(12425, 13488); // 12426 to 13488

// Make renderRaceView:
const renderRaceViewCode = `
  const renderRaceView = (isAdminReport: boolean = false) => {
    return (
${raceBlockLines.join('\n')}
    );
  };
`;

const appReturnLineIdx = lines.findIndex(l => l.startsWith('  return ('));
if (appReturnLineIdx === -1) {
  console.log("Could not find 'return ('");
  process.exit(1);
}

// Insert renderRaceView just before return (
lines.splice(appReturnLineIdx, 0, renderRaceViewCode);

// Replace 12425 block with renderRaceView(false)
// Note: we added renderRaceViewCode which is some lines, so the index 12425 is shifted.
const shiftedRaceStart = 12425 + renderRaceViewCode.split('\n').length - 1;

// lines[shiftedRaceStart] will be {publicTab === "race" && (
// lines.splice(shiftedRaceStart, 13488 - 12425 + 1) -> Replace with {publicTab === "race" && renderRaceView(false)}

lines.splice(shiftedRaceStart, 13488 - 12425 + 1, '            {publicTab === "race" && renderRaceView(false)}');

// Find admin reporte-carrera block
// 4776: {adminTab === "reporte-carrera" && (
const adminStartIdx = lines.findIndex(l => l.includes('{adminTab === "reporte-carrera" && ('));
const adminEndIdx = adminStartIdx + 13; // ends with )}

lines.splice(adminStartIdx, adminEndIdx - adminStartIdx + 1, '            {adminTab === "reporte-carrera" && renderRaceView(true)}');

fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log("Replaced correctly!");
