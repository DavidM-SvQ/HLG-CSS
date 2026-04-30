import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/filter: \(node: any\) => \!\(node\.classList && node\.classList\.contains\("copy-button-ignore"\)\),?/g, '');
content = content.replace(/filter: \(node: any\) => \!\(node\.classList && node\.classList\.contains\("copy-button-ignore"\)\)/g, '');

content = content.replace(/[ \t]*width: targetWidth,\n/g, '');
content = content.replace(/[ \t]*const targetWidth = Math\.max\(.*\);\n/g, '');
content = content.replace(/[ \t]*let originalTargetWidth = "";\n/g, '');
content = content.replace(/[ \t]*let originalTargetMinWidth = "";\n/g, '');
content = content.replace(/[ \t]*originalTargetWidth = .*;\n/g, '');
content = content.replace(/[ \t]*originalTargetMinWidth = .*;\n/g, '');
content = content.replace(/[ \t]*const scrollWidth = .*;\n/g, '');

content = content.replace(/[ \t]*.*\.style\.setProperty\("width", `\$\{targetWidth\}px`, "important"\);\n/g, '');
content = content.replace(/[ \t]*.*\.style\.setProperty\("min-width", `\$\{targetWidth\}px`, "important"\);\n/g, '');
content = content.replace(/[ \t]*if \(.*\) \{\n[ \t]*.*\.style\.width = originalTargetWidth;\n[ \t]*.*\.style\.minWidth = originalTargetMinWidth;\n[ \t]*\}\n/g, '');

fs.writeFileSync('src/App.tsx', content);
