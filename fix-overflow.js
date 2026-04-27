const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/style: \{ overflow: "hidden" \}/g, 'style: { overflow: "visible", paddingBottom: "4px" }');
fs.writeFileSync('src/App.tsx', code);
