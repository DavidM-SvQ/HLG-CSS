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
fs.writeFileSync('src/components/tabs/MonthlyReportView.tsx', code);
