const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/className="text-sm border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"/g, 'className="px-3 py-2 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"');

fs.writeFileSync('src/App.tsx', code);
