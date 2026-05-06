const fs = require('fs');
const path = './src/components/tabs/season/SeasonPointsTab.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');
const extractIndex = lines.findIndex(l => l.includes('<GeneralClassificationChart />'));
if (extractIndex !== -1) {
  const evolutionIndex = lines.findIndex(l => l.includes('{/* Monthly Evolution Chart */}'));
  if (evolutionIndex !== -1 && evolutionIndex > extractIndex) {
    lines = [...lines.slice(0, extractIndex + 1), ...lines.slice(evolutionIndex)];
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Fixed lines');
  } else {
    console.log('Evolution index not found or invalid', evolutionIndex, extractIndex);
  }
} else {
  console.log('Extract index not found');
}
