const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = content.indexOf('  const renderRaceView = (isAdminReport: boolean = false) => {');

// Find the matching closing brace.
let openCount = 0;
let endIndex = -1;
let started = false;

for (let i = startIndex; i < content.length; i++) {
   if (content[i] === '{') {
      openCount++;
      started = true;
   }
   if (content[i] === '}') {
      openCount--;
      if (started && openCount === 0) {
         endIndex = i;
         break;
      }
   }
}

const renderFunction = content.substring(startIndex, endIndex + 1);

// Save to test
fs.writeFileSync('race_tmp.txt', renderFunction);
console.log("Extracted bounds: ", startIndex, endIndex);
