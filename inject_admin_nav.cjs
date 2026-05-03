const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

const sIdx = content.indexOf('{/* Admin Tabs Navigation */}');
const eIdx = content.indexOf('            {adminTab === "datos" && (');

const componentCall = `<AdminNav adminTab={adminTab} setAdminTab={setAdminTab} />\n`;

let newContent = content.substring(0, sIdx) + componentCall + content.substring(eIdx);

newContent = newContent.replace(
  /import \{ AppHeader \} from "\.\/components\/AppHeader";/,
  'import { AppHeader } from "./components/AppHeader";\nimport { AdminNav } from "./components/AdminNav";'
);

fs.writeFileSync('src/App.tsx', newContent);
console.log("AdminNav extracted successfully!");
