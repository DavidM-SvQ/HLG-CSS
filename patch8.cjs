const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/race/stats/RaceDetailedBreakdown.tsx', 'utf8');

code = code.replace(
  /cyclistMap\.set\(d\.ciclista, \{ ronda: d\.ronda, total: 0, concepts: \[\] \}\);/g,
  'cyclistMap.set(d.ciclista, { ronda: (d.ronda === undefined || d.ronda === null || d.ronda === "") ? "FA" : d.ronda, total: 0, concepts: [] });'
);

fs.writeFileSync('src/components/tabs/race/stats/RaceDetailedBreakdown.tsx', code);
