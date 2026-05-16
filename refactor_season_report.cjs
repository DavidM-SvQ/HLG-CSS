const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/SeasonReportView.tsx', 'utf8');

const hookCall = `  const selectedMonths: number[] = [];
  const [cyclistsSortColumn, setCyclistsSortColumn] = useUrlState<string>("seasonCyclistsSortColumn", "pos");
  const [cyclistsSortDirection, setCyclistsSortDirection] = useUrlState<"asc" | "desc">("seasonCyclistsSortDirection", "asc");

  const { availableMonths, monthReportData } = useSeasonReportData({ files, leaderboard, selectedMonths });\n\n`;

code = code.replace(/  const selectedMonths: number\[\] = \[\];[\s\S]*?(?=  \/\/ --- Cyclists sorting logic ---)/, hookCall);

// Remove ExportToolbar definition
code = code.replace(/const ExportToolbar = \(\{ targetRef[\s\S]*?className="w-4 h-4" \/>}\n      <\/Button>\n    <\/div>\n  \);\n};\n/, "");

// Remove expandNodeForCapture
code = code.replace(/const expandNodeForCapture = \([\s\S]*?};\n};\n/, "");

// Import expandNodeForCapture and useSeasonReportData
code = code.replace('import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";\n', 'import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";\nimport { expandNodeForCapture } from "../../lib/dom-utils";\nimport { useSeasonReportData } from "./season_report/hooks/useSeasonReportData";\n');

// Remove global getVal
code = code.replace(/const getVal = \(row: any[\s\S]*?return actualKey \? row\[actualKey\] \: "";\n};\n/, "");
// Remove local getVal
code = code.replace(/  const getVal = \(row: any, key: string\) => {[\s\S]*?  };\n\n\n/, "");

// Add getVal import
code = code.replace('import { cn } from "../../lib/utils";', 'import { cn } from "../../lib/utils";\nimport { getVal } from "../../lib/data-processing";');

fs.writeFileSync('src/components/tabs/SeasonReportView.tsx', code);
