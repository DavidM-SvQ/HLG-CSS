const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/MonthlyReportView.tsx', 'utf8');

const hookCall = `  const { availableMonths, monthReportData } = useSeasonReportData({
    files,
    leaderboard,
    selectedMonths,
    requireSelectedMonths: true
  });\n\n`;

code = code.replace(/  const raceMonths = useMemo\(\(\) => \{[\s\S]*?(?=  \/\/ --- Cyclists sorting logic ---)/, hookCall);

code = code.replace(/const ExportToolbar = \(\{ targetRef[\s\S]*?className="w-4 h-4" \/>\n      <\/Button>\n    <\/div>\n  \);\n};\n/, "");

code = code.replace(/const formatNumberSpanish = \([\s\S]*?};\n/, "");

code = code.replace(/const getFlagEmoji = \([\s\S]*?return flags\[country\] \|\| countryName;\n};\n/, "");

code = code.replace('import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";', 'import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";\nimport { expandNodeForCapture } from "../../lib/dom-utils";\nimport { useSeasonReportData } from "./season_report/hooks/useSeasonReportData";');

code = code.replace(/const expandNodeForCapture = \([\s\S]*?};\n};\n/, "");

code = code.replace(/const getVal = \(row: any[\s\S]*?return actualKey \? row\[actualKey\] \: "";\n};\n/, "");
code = code.replace(/  const getVal = \(row: any, key: string\) => {[\s\S]*?  };\n/, "");

if (!code.includes('import { getVal')) {
    code = code.replace('import { cn } from "../../lib/utils";', 'import { cn } from "../../lib/utils";\nimport { getVal, getCategoryColorStyle, formatNumberSpanish, getFlagEmoji } from "../../lib/data-processing";\nimport { ExportToolbar } from "../ui/ExportToolbar";');
} else {
    code = code.replace('import { getVal } from "../../lib/data-processing";', 'import { getVal, getCategoryColorStyle, formatNumberSpanish, getFlagEmoji } from "../../lib/data-processing";\nimport { ExportToolbar } from "../ui/ExportToolbar";');
}

fs.writeFileSync('src/components/tabs/MonthlyReportView.tsx', code);
