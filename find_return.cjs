const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

for (let i = lines.length - 2000; i < lines.length; i++) {
  if (lines[i] && lines[i].includes('return (')) {
     console.log(`Return at line ${i+1}`);
  }
}
