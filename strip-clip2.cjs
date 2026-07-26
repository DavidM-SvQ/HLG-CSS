const fs = require('fs');
let content = fs.readFileSync('src/hooks/useTableScreenshot.ts', 'utf8');

// Replace all remaining occurrences
content = content.replace(
  /const dataUrl = await domToDataUrl\(tableContainer, \{/g,
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

// We need to deduplicate because the first one was already replaced, so it will have it twice now.
// Let's just restore the file from scratch using a sed or reset it.
