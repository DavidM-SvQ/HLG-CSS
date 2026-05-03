const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf8');

code = code.replace(/const filteredData = files\.elecciones\.data\.filter\(\s*\(\s*row\s*\)\s*=>\s*\{[\s\S]*?return\s*\(\s*matchesSearch &&\s*matchesRound &&\s*matchesTeam &&\s*matchesStats\s*\);\s*}\s*,\s*\);/, 'const filteredData = draftFilteredData;');

fs.writeFileSync('src/components/tabs/DraftView.tsx', code);
console.log("Applied filteredData replace");
