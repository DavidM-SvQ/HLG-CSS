const fs = require('fs');
let file = fs.readFileSync('src/components/tabs/draft/DraftRoiChart.tsx', 'utf-8');
file = file.replace(/\\\`translate\\\(\\\$\\{x\\},\\\\\\\$\\{y\\}\\\)\\\`/g, '\`translate(\${x},\${y})\`');
file = file.replace('\\`translate(\\${x},\\${y})\\`', '\`translate(\${x},\${y})\`'); // Exact match
fs.writeFileSync('src/components/tabs/draft/DraftRoiChart.tsx', file);

let file2 = fs.readFileSync('src/components/tabs/draft/DraftPointsTable.tsx', 'utf-8');
file2 = file2.replace('\\`rgba(34, 197, 94, \\${(ratio - 0.5) * 0.4})\\`', '\`rgba(34, 197, 94, ${(ratio - 0.5) * 0.4})\`');
file2 = file2.replace('\\`rgba(239, 68, 68, \\${(0.5 - ratio) * 0.2})\\`', '\`rgba(239, 68, 68, ${(0.5 - ratio) * 0.2})\`');
fs.writeFileSync('src/components/tabs/draft/DraftPointsTable.tsx', file2);
