const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The cleanup rows loop was removed inside handleCopyTopCyclistsDraft but STILL LEFT in the download fallback, which could cause errors when calling classList.remove because it wasn't added by the script.
// Wait, actually I removed `rows.forEach((..., add('hidden')))` but NOT in handleDownloadTopCyclistsDraft.
const handleDownloadOld = `      if (subset && subset !== 'full') {
        const pages = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p20'];
        const start = pages.indexOf(subset) * 50;
        const end = start + 50;
        rows.forEach((row, idx) => {
          const num = idx + 1;
          if (num <= start || num > end) row.classList.add('hidden');
        });
      }`;
code = code.replace(handleDownloadOld, '');

const handleDownloadRestoreOld = `    } finally {
      restore();
      rows.forEach(row => row.classList.remove('hidden'));
    }`;
const handleDownloadRestoreNew = `    } finally {
      restore();
    }`;
code = code.replace(handleDownloadRestoreOld, handleDownloadRestoreNew);

// Also I'll remove the remaining one in handleCopy
const handleCopyRestoreOld = `    } finally {
      restore();
      rows.forEach(row => row.classList.remove('hidden'));
    }`;
const handleCopyRestoreNew = `    } finally {
      restore();
    }`;
code = code.replace(handleCopyRestoreOld, handleCopyRestoreNew);


fs.writeFileSync('src/App.tsx', code);
console.log('Fixed cleanup.');
