const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 240; i < lines.length; i++) {
  if (lines[i] && lines[i].startsWith('  return (')) {
     console.log(`Main return at line ${i+1}`);
     break;
  }
}
