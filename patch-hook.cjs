const fs = require('fs');
let content = fs.readFileSync('src/hooks/useTableScreenshot.ts', 'utf8');

// The replacement logic:
const stripLogic = `
        // Force strip clip-paths
        const svgs = Array.from(tableContainer.querySelectorAll('svg'));
        svgs.forEach(svg => {
          const elementsWithClip = Array.from(svg.querySelectorAll('[clip-path]'));
          elementsWithClip.forEach(el => {
            el.removeAttribute('clip-path');
            el.style.clipPath = 'none';
          });
        });

        const dataUrl = await domToDataUrl(tableContainer, {`;

// Replace all occurrences where it's just const dataUrl = await domToDataUrl(tableContainer, {
content = content.replace(/const dataUrl = await domToDataUrl\(tableContainer, \{/g, stripLogic);

fs.writeFileSync('src/hooks/useTableScreenshot.ts', content);
