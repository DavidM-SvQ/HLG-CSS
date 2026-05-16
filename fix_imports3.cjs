const fs = require('fs');
let topDraft = fs.readFileSync('src/components/tabs/season/TopDraftCyclists.tsx', 'utf8');

topDraft = topDraft.replace('import { getFlagEmoji } from "../../lib/data-processing";', 'import { getFlagEmoji } from "../../../lib/data-processing";');
fs.writeFileSync('src/components/tabs/season/TopDraftCyclists.tsx', topDraft);
