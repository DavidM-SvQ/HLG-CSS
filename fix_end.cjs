const fs = require('fs');
let draftCode = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf8');

const lines = draftCode.split('\n');
const newLines = lines.slice(0, lines.length - 6);
newLines.push('    </>');
newLines.push('  );');
newLines.push('};');
newLines.push('');

fs.writeFileSync('src/components/tabs/DraftView.tsx', newLines.join('\n'));
console.log('Fixed end of file');
