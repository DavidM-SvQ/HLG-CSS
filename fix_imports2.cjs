const fs = require('fs');
let topDraft = fs.readFileSync('src/components/tabs/season/TopDraftCyclists.tsx', 'utf8');

if (!topDraft.includes('getFlagEmoji }')) {
    topDraft = 'import { getFlagEmoji } from "../../lib/data-processing";\n' + topDraft;
    fs.writeFileSync('src/components/tabs/season/TopDraftCyclists.tsx', topDraft);
}
