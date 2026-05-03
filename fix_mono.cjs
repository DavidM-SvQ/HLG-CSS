const fs = require('fs');

function makeMono(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\{formatNumberSpanish\(([^)]+)\)\}/g, '<span className="font-mono tracking-tight">{formatNumberSpanish($1)}</span>');
  content = content.replace(/\{Math\.round\(([^)]+)\)\}/g, '<span className="font-mono tracking-tight">{Math.round($1)}</span>');
  fs.writeFileSync(file, content);
}

['src/App.tsx', 'src/MonthlyReportView.tsx', 'src/SeasonReportView.tsx', 'src/components/tabs/DraftView.tsx', 'src/components/tabs/StartlistView.tsx'].forEach(makeMono);
