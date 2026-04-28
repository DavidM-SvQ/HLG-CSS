const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { MonthlyReportView }")) {
    // Add import right after normal imports
    code = code.replace(/from "lucide-react";/, 'from "lucide-react";\nimport { MonthlyReportView } from "./MonthlyReportView";');
}

const replacement = `{adminTab === "reporte-mes" && (
              <MonthlyReportView files={files} leaderboard={leaderboard} />
            )}`;

code = code.replace(/\{adminTab === "reporte-mes" && \([\s\S]*?<p className="text-neutral-500 max-w-sm mt-2">[\s\S]*?<\/p>\n *<\/div>\n *\)\}/, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("MonthlyReportView injected!");
