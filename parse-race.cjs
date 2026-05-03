const fs = require('fs');

const code = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const body = code.slice(3376, 4478).join('\n');
fs.writeFileSync('raceView.txt', body);
