const fs = require('fs');
const path = './src/components/tabs/season/SeasonPointsTab.tsx';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

// Ensure we find the import block to add
const importText = `import { MonthlyEvolutionChart } from "./MonthlyEvolutionChart";`;
if (!content.includes(importText)) {
  const importIndex = lines.findIndex(l => l.includes('import { GeneralClassificationChart }'));
  if (importIndex !== -1) {
    lines.splice(importIndex + 1, 0, importText);
  }
}

const startIndex = lines.findIndex(l => l.includes('{/* Monthly Evolution Chart */}'));
const endIndex = lines.findIndex(l => l.includes('{/* Top Teams Table */}'));

if (startIndex !== -1 && endIndex !== -1) {
  // We want to keep lines up to startIndex-1
  // Insert <MonthlyEvolutionChart />
  // Keep lines from endIndex to end
  const before = lines.slice(0, startIndex);
  const after = lines.slice(endIndex);
  
  lines = [...before, '                          <MonthlyEvolutionChart />', ...after];
  
  fs.writeFileSync(path, lines.join('\n'));
  console.log('Replaced EvolutionChart properly');
} else {
  console.log('Not found:', startIndex, endIndex);
}
