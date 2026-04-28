const fs = require('fs');
let code = fs.readFileSync('src/MonthlyReportView.tsx', 'utf8');

code = code.replace(/const dataUrl = await domToBlob\([\s\S]*?link\.href = dataUrl;/g, (match) => {
    return match.replace(/const dataUrl = await domToBlob/, 'const blob = await domToBlob')
                .replace(/link\.href = dataUrl;/, 'link.href = URL.createObjectURL(blob);');
});

fs.writeFileSync('src/MonthlyReportView.tsx', code);
