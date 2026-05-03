const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "                allRaces={allRaces}",
  "                allRaces={allRaces}\n                leaderboard={leaderboard}\n                getFlagEmoji={getFlagEmoji}\n                teamToPlayerMap={teamToPlayerMap}\n                playerOrderMap={playerOrderMap}"
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx props fixed.');
