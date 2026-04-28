const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace team card padding
code = code.replace(/className="team-card-breakdown bg-neutral-50 rounded-lg p-3 border border-neutral-200 flex flex-col h-full min-w-\[240px\]"/g, 'className="team-card-breakdown bg-neutral-50 rounded-lg p-4 border border-neutral-200 flex flex-col h-full min-w-[240px]"');

// Team name size
code = code.replace(/text-\[13px\]/g, 'text-base');

// Points
code = code.replace(/text-sm whitespace-nowrap">\n *\{team.totalPoints\} pts/g, 'text-base whitespace-nowrap">\n                              {team.totalPoints} pts');

// Cyclist card padding
code = code.replace(/className="bg-white p-2 rounded border border-neutral-100 shadow-sm"/g, 'className="bg-white p-3 rounded border border-neutral-100 shadow-sm"');

// Cyclist Name
code = code.replace(/text-\[11px\]/g, 'text-sm');

// Cyclist Points
code = code.replace(/font-mono font-bold px-1\.5 py-0\.5 rounded text-\[10px\] whitespace-nowrap shrink-0/g, 'font-mono font-bold px-2 py-0.5 rounded text-xs whitespace-nowrap shrink-0');

// Concept Row
code = code.replace(/text-\[9px\] text-neutral-500 pl-1\.5 border-l border-neutral-200 gap-2/g, 'text-[11px] mt-1 text-neutral-500 pl-2 border-l-2 border-neutral-200 gap-2');

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
