const fs = require('fs');
const path = './src/components/tabs/season/SeasonPointsTab.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('{/* ')) {
    console.log(`${i}: ${l.trim()}`);
  }
});
