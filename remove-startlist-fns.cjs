const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const newCode = code.slice(0, 1826).concat(code.slice(2318)).join('\n');
fs.writeFileSync('src/App.tsx', newCode);
console.log('App.tsx updated effectively.');
