const fs = require('fs');

['src/components/tabs/season_report/TopCyclistsReport.tsx', 'src/components/tabs/SeasonReportView.tsx'].forEach(file => {
   let text = fs.readFileSync(file, 'utf8');
   text = text.replace('import { getFlagEmoji } from ../../lib/data-processing;', 'import { getFlagEmoji } from "../../lib/data-processing";');
   fs.writeFileSync(file, text);
});
