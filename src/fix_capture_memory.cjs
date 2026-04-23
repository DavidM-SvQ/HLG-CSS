const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove DOM omitting in row mapping to speed up capture (avoid 500 hidden nodes crashing html-to-image)
const mapRowOld = `                                        let isHiddenVisual = false;
                                        if (isTopCyclistsDraftCopying) {
                                            if (isTopCyclistsDraftCopying === 'full') isHiddenVisual = false;
                                            else {
                                                const pageNum = parseInt(isTopCyclistsDraftCopying.substring(1));
                                                const start = (pageNum - 1) * 50;
                                                const end = start + 50;
                                                isHiddenVisual = !(idx >= start && idx < end);
                                            }
                                        }

                                        return (
                                          <tr key={name}`;

const mapRowNew = `                                        let isHiddenVisual = false;
                                        if (isTopCyclistsDraftCopying) {
                                            if (isTopCyclistsDraftCopying === 'full') isHiddenVisual = false;
                                            else {
                                                const pageNum = parseInt(isTopCyclistsDraftCopying.substring(1));
                                                const start = (pageNum - 1) * 50;
                                                const end = start + 50;
                                                isHiddenVisual = !(idx >= start && idx < end);
                                            }
                                        }

                                        if (isHiddenVisual && isTopCyclistsDraftCopying) return null;

                                        return (
                                          <tr key={name}`;

code = code.replace(mapRowOld, mapRowNew);

// 2. Change the scale to ensure canvas dimensions do not exceed browser hardware limits
// and use subset scale 0.9 for full (500 rows is ~16,000 pixels).
code = code.replace(/scale: subset === 'full'\s*\?\s*1\.5\s*:\s*4,/g, "scale: subset === 'full' ? 0.9 : 3,");


// 3. For the UI copy button loop, we don't need row.classList.add('hidden') anymore.
const handleCopyDraftOld1 = `        rows.forEach((row, idx) => {
          const num = idx + 1;
          if (num <= start || num > end) row.classList.add('hidden');
        });`;
code = code.replace(handleCopyDraftOld1, '');
code = code.replace(handleCopyDraftOld1, ''); // twice, handleCopy and handleDownload

// remove the restore cleanup of hidden class
const restoreOld1 = `      restore();
      rows.forEach(row => row.classList.remove('hidden'));`;
const restoreNew1 = `      restore();`;
code = code.replace(restoreOld1, restoreNew1);
code = code.replace(restoreOld1, restoreNew1);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed memory issues.');
