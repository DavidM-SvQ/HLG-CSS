const fs = require('fs');
let file = fs.readFileSync('src/components/tabs/draft/DraftRoiChart.tsx', 'utf-8');
file = file.replace(/\\\`\\\$\\{s\\.team\\} \\[#\\\$\\{order\\}\\]\\\`/g, '\`${s.team} [#${order}]\`');
// Wait, wait, let me use exact substring matching!
file = file.replace('\\`\\${s.team} [#\\${order}]\\`', '\`${s.team} [#${order}]\`');
file = file.replace('\\`rentabilidad-picks-\\${new Date().toISOString().split("T")[0]}.png\\`', '\`rentabilidad-picks-${new Date().toISOString().split("T")[0]}.png\`');
fs.writeFileSync('src/components/tabs/draft/DraftRoiChart.tsx', file);

let file2 = fs.readFileSync('src/components/tabs/draft/DraftPointsTable.tsx', 'utf-8');
file2 = file2.replace(/\\\`R\\\$\\{r\\}\\\`/g, '\`R${r}\`');
fs.writeFileSync('src/components/tabs/draft/DraftPointsTable.tsx', file2);
