const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes("import html2canvas")) {
    code = `import html2canvas from 'html2canvas';\n` + code;
}

// target `handleCopyCyclists` and replace
// target `handleDownloadCyclists` and replace
// target `handleCopyUnscored` and `handleDownloadUnscored`

fs.writeFileSync('src/App.tsx', code);
