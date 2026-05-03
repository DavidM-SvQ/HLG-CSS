const fs = require('fs');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');

const lines = appContent.split('\n');
console.log(`Total lines: ${lines.length}`);

for (let i = 0; i < 500; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
