const fs = require('fs');
let content = fs.readFileSync('src/hooks/useTableScreenshot.ts', 'utf8');

// Just remove all occurrences of the strip logic, then add it exactly once where needed
const stripLogicRegex = /\s*\/\/ Force strip clip-paths[\s\S]*?el\.style\.clipPath = 'none';\s*}\);\s*}\);/g;
content = content.replace(stripLogicRegex, '');

// Now it should be back to just having 'const dataUrl = await domToDataUrl(tableContainer, {'
const stripLogic = `
        // Force strip clip-paths
        const svgs = Array.from(tableContainer.querySelectorAll('svg'));
        svgs.forEach(svg => {
          const elementsWithClip = Array.from(svg.querySelectorAll('[clip-path]'));
          elementsWithClip.forEach(el => {
            el.removeAttribute('clip-path');
            el.style.clipPath = 'none';
          });
        });`;

content = content.replace(/const dataUrl = await domToDataUrl\(tableContainer, \{/g, stripLogic + '\n        const dataUrl = await domToDataUrl(tableContainer, {');

fs.writeFileSync('src/hooks/useTableScreenshot.ts', content);
