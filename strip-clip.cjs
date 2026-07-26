const fs = require('fs');
const content = fs.readFileSync('src/hooks/useTableScreenshot.ts', 'utf8');

const newContent = content.replace(
  "const dataUrl = await domToDataUrl(tableContainer, {",
  `
        // Force strip clip-paths
        const svgs = Array.from(tableContainer.querySelectorAll('svg'));
        svgs.forEach(svg => {
          const elementsWithClip = Array.from(svg.querySelectorAll('[clip-path]'));
          elementsWithClip.forEach(el => {
            el.removeAttribute('clip-path');
            el.style.clipPath = 'none';
          });
        });

        const dataUrl = await domToDataUrl(tableContainer, {`
);

fs.writeFileSync('src/hooks/useTableScreenshot.ts', newContent);
