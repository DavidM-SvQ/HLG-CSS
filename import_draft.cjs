const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { DraftView }')) {
  code = code.replace(
    'import { StartlistView } from "./components/tabs/StartlistView";',
    'import { StartlistView } from "./components/tabs/StartlistView";\nimport { DraftView } from "./components/tabs/DraftView";'
  );
  fs.writeFileSync('src/App.tsx', code);
}
