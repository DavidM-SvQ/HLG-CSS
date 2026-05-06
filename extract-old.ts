import { execSync } from 'child_process';
const oldContent = execSync('git show HEAD:src/components/tabs/DraftView.tsx').toString();
import fs from 'fs';
fs.writeFileSync('OldDraftView.tsx.copy', oldContent);
console.log("Extracted old content");
