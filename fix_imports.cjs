const fs = require('fs');

let topCyclist = fs.readFileSync('src/components/tabs/season_report/TopCyclistsReport.tsx', 'utf8');
topCyclist = topCyclist.replace('import { getFlagEmoji } from "../../lib/data-processing";', 'import { getFlagEmoji } from "../../../lib/data-processing";');
fs.writeFileSync('src/components/tabs/season_report/TopCyclistsReport.tsx', topCyclist);

let topDraft = fs.readFileSync('src/components/tabs/season/TopDraftCyclists.tsx', 'utf8');
if (!topDraft.includes('getFlagEmoji')) {
   topDraft = topDraft.replace(/import \{ getVal, getCategoryColorStyle, formatNumberSpanish \} from '..\/..\/lib\/data-processing';/, "import { getVal, getCategoryColorStyle, formatNumberSpanish, getFlagEmoji } from '../../lib/data-processing';");
   fs.writeFileSync('src/components/tabs/season/TopDraftCyclists.tsx', topDraft);
}
