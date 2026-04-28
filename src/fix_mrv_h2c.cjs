const fs = require('fs');
let code = fs.readFileSync('src/MonthlyReportView.tsx', 'utf8');

code = code.replace(
  /const blob = await domToBlob\(container, \{[\s\S]*?\}\);/g,
  `const canvas = await html2canvas(container, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
            const dataUrl = canvas.toDataURL("image/png");
            const response = await fetch(dataUrl);
            const blob = await response.blob();`
);

fs.writeFileSync('src/MonthlyReportView.tsx', code);
