const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 14370; i < 14450; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
