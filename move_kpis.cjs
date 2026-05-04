const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/SeasonView.tsx', 'utf8');

const startIndex = code.indexOf('      {(() => {');
const endIndex = code.indexOf('                })()}', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const kpis = code.substring(startIndex, endIndex + 21); // include `})()}\n`
    code = code.substring(0, startIndex) + code.substring(endIndex + 21);
    
    code = code.replace('{/* Sub-tabs Navigation */}', kpis + '\n  {/* Sub-tabs Navigation */}');
    fs.writeFileSync('src/components/tabs/SeasonView.tsx', code);
    console.log("Replaced");
} else {
    console.log("Not found indexes");
}
