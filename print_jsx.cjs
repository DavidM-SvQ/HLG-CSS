const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 4480; i < 4600; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
