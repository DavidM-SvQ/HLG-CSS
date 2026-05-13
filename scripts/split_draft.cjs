const fs = require('fs');

const content = fs.readFileSync('src/components/tabs/draft/DraftDatos.tsx', 'utf-8');
const lines = content.split('\n');

const imports = lines.slice(0, 11).join('\n');
const startBlock = lines.slice(11, 56).join('\n');

const pointsTable = lines.slice(56, 900).join('\n');
const performanceSummary = lines.slice(901, 1789).join('\n');
const roiChart = lines.slice(1789, 2291).join('\n');
const endBlock = lines.slice(2291).join('\n');

fs.writeFileSync('src/components/tabs/draft/DraftDatos_points.tsx', pointsTable);
fs.writeFileSync('src/components/tabs/draft/DraftDatos_summary.tsx', performanceSummary);
fs.writeFileSync('src/components/tabs/draft/DraftDatos_chart.tsx', roiChart);

console.log('Successfully split DraftDatos.tsx');
