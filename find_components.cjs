const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

const lines = content.split('\n');

// Find all function declarations in the file that are exported or top-level consts that render JSX
const componentsRegex = /function\s+([A-Z][A-Za-z0-9_]+)\s*\(/g;
let match;
while ((match = componentsRegex.exec(content)) !== null) {
  console.log(`Found function component: ${match[1]}`);
}

const customHooks = /function\s+(use[A-Z][A-Za-z0-9_]+)\s*\(/g;
while ((match = customHooks.exec(content)) !== null) {
  console.log(`Found custom hook: ${match[1]}`);
}
