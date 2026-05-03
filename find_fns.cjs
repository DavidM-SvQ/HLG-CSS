const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('const') && lines[i].includes('=')) {
     if (lines[i].includes('(') && lines[i].includes('=>')) {
        // console.log(`Arrow function at ${i+1}: ${lines[i].substring(0, 50)}`);
     }
  }
  if (lines[i].startsWith('function ')) {
       console.log(`function at ${i+1}: ${lines[i].substring(0, 50)}`);
  }
}
