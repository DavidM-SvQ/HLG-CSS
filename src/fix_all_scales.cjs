const fs = require('fs');

function fixScales(filename) {
    let code = fs.readFileSync(filename, 'utf8');
    code = code.replace(/scale:\s*4,/g, 'scale: 3,');
    code = code.replace(/scale:\s*2,/g, 'scale: 3,');
    fs.writeFileSync(filename, code);
}

fixScales('src/App.tsx');
fixScales('src/MonthlyReportView.tsx');
