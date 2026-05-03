const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const sIdx = content.indexOf('{/* Admin Tabs Navigation */}');
const eIdx = content.indexOf('            {adminTab === "datos" && (');

console.log(content.substring(sIdx, eIdx));
