const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/MonthlyReportView.tsx', 'utf8');

const regex = /\{monthReportData \? \([\s\S]*?\)\s*:\s*\(/;

const newJSX = `{monthReportData ? (
        <div className="space-y-12">
          <TopTeamsReport monthReportData={monthReportData} titleSuffix={monthsText ? \` [\${monthsText}]\` : ""} />
          <TopCyclistsReport 
            monthReportData={monthReportData} 
            cyclistsSortColumn={cyclistsSortColumn}
            setCyclistsSortColumn={setCyclistsSortColumn}
            cyclistsSortDirection={cyclistsSortDirection}
            setCyclistsSortDirection={setCyclistsSortDirection}
            titleSuffix={monthsText ? \` [\${monthsText}]\` : ""}
            isNoDraft={false}
          />
          <TopCyclistsReport 
            monthReportData={monthReportData} 
            cyclistsSortColumn={cyclistsSortColumn}
            setCyclistsSortColumn={setCyclistsSortColumn}
            cyclistsSortDirection={cyclistsSortDirection}
            setCyclistsSortDirection={setCyclistsSortDirection}
            titleSuffix={monthsText ? \` [\${monthsText}]\` : ""}
            isNoDraft={true}
          />
          <PointsPerRoundReport monthReportData={monthReportData} titleSuffix={monthsText ? \` [\${monthsText}]\` : ""} />
          <MinMaxReport monthReportData={monthReportData} titleSuffix={monthsText ? \` [\${monthsText}]\` : ""} />
          <PanenkitaReport monthReportData={monthReportData} titleSuffix={monthsText ? \` [\${monthsText}]\` : ""} />
        </div>
      ) : (`;

code = code.replace(regex, newJSX);

// Add component imports
const imports = `import { TopTeamsReport } from "./season_report/TopTeamsReport";
import { TopCyclistsReport } from "./season_report/TopCyclistsReport";
import { PointsPerRoundReport } from "./season_report/PointsPerRoundReport";
import { MinMaxReport } from "./season_report/MinMaxReport";
import { PanenkitaReport } from "./season_report/PanenkitaReport";`;

code = code.replace('import { ExportToolbar }', imports + '\nimport { ExportToolbar }');

// Remove the refs
code = code.replace(/  const ref\d+ = React\.useRef<HTMLDivElement>\(null\);\n/g, "");
code = code.replace(/  const containerRef = React\.useRef<HTMLDivElement>\(null\);\n/, "");
code = code.replace(/  const noDraftContainerRef = React\.useRef<HTMLDivElement>\(null\);\n/, "");

fs.writeFileSync('src/components/tabs/MonthlyReportView.tsx', code);
