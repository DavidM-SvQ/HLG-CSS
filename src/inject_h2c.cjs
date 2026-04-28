const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import html2canvas from 'html2canvas'")) {
    code = "import html2canvas from 'html2canvas';\n" + code;
}

function replaceBetween(str, startRegex, endRegex, replacement) {
  const parts = str.split('handleDownloadUnscored');
  // Just use targeted replaces for now, simpler
}

// 1. handleCopyCyclists
code = code.replace(
    /const dataUrl = await domToDataUrl\(cyclistsTableRef\.current!, \{[\s\S]*?\}\);/g,
    `const canvas = await html2canvas(cyclistsTableRef.current!, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });\n            const dataUrl = canvas.toDataURL("image/png");`
);

// 2. handleDownloadCyclists
code = code.replace(
    /const dataUrl = await domToDataUrl\(cyclistsTableRef\.current, \{[\s\S]*?\}\);/g,
    `const canvas = await html2canvas(cyclistsTableRef.current!, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });\n      const dataUrl = canvas.toDataURL("image/png");`
);

// We need to carefully target handleCopyUnscored and handleDownloadUnscored
// Let's use a replacer function for handleCopyUnscored
code = code.replace(
  /const handleCopyUnscored = async \([\s\S]*?try \{([\s\S]*?)if \(typeof/m,
  (match, p1) => {
    return match.replace(p1, `\n      const canvas = await html2canvas(tableContainer, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });\n      const dataUrl = canvas.toDataURL("image/png");\n      `);
  }
);

code = code.replace(
  /const handleDownloadUnscored = async \([\s\S]*?try \{([\s\S]*?)const link = document.createElement/m,
  (match, p1) => {
    return match.replace(p1, `\n      const canvas = await html2canvas(tableContainer, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });\n      const dataUrl = canvas.toDataURL("image/png");\n      `);
  }
);


fs.writeFileSync('src/App.tsx', code);
