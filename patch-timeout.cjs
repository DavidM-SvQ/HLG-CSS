const fs = require('fs');
let content = fs.readFileSync('src/hooks/useTableScreenshot.ts', 'utf8');

content = content.replace(/setTimeout\(resolve, 1500\)/g, 'setTimeout(resolve, 300)');

fs.writeFileSync('src/hooks/useTableScreenshot.ts', content);
