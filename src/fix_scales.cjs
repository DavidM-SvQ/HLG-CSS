const fs = require('fs');

function fixScales(filename) {
    let code = fs.readFileSync(filename, 'utf8');
    
    // Specifically target subsets and messy logic first
    code = code.replace(/scale:\s*subset === "full"\s*\?\s*[\d.]+\s*:\s*[\d.]+,?/g, 'scale: 2,');
    
    // Replace any leftover scale: ...
    code = code.replace(/scale:\s*[\d.]+,/g, 'scale: 2,');
    
    fs.writeFileSync(filename, code);
}

fixScales('src/App.tsx');
fixScales('src/MonthlyReportView.tsx');
