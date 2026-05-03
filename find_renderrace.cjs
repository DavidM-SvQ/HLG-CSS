const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

let insideRenderRace = false;
let openBraces = 0;
for (let i = 3377; i < 4500; i++) {
  if (lines[i].includes('const renderRaceView =')) {
     insideRenderRace = true;
  }
  if (insideRenderRace) {
     for (let char of lines[i]) {
         if (char === '{') openBraces++;
         if (char === '}') openBraces--;
     }
     if (openBraces === 0) {
        console.log(`Ends at line ${i+1}`);
        break;
     }
  }
}
