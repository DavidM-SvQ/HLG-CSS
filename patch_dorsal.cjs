const fs = require('fs');

const path = 'src/lib/hooks/useGestionStartlists.ts';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `        let dorsal = "";
        if (lineParts.length > 0) {
          const match = originalLine.trim().match(/^([0-9]+[a-zA-Z]?)[^\\w]/) || originalLine.trim().match(/^([0-9]+[a-zA-Z]?)$/);
          if (match) {
            dorsal = match[1];
          } else {
            // fallback, check first word
            const firstWord = lineParts[0].replace(/[^a-zA-Z0-9]/g, '');
            if (/^[0-9]+[a-zA-Z]?$/.test(firstWord)) {
              dorsal = firstWord;
            }
          }
        }`;

const replacementStr = `        let dorsal = "";
        const cleanLine = originalLine.replace(/[\\u200B-\\u200D\\uFEFF]/g, '').trim();
        const parts = cleanLine.split(/[\\s\\t]+/);
        for (const part of parts) {
            const cleanPart = part.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '');
            if (/^[0-9]{1,3}[a-zA-Z]?$/.test(cleanPart)) {
                dorsal = cleanPart;
                break;
            }
        }`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched successfully.");
} else {
    console.log("Target string not found in useGestionStartlists.ts");
}
