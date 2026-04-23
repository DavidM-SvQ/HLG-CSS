const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I also missed removing the hidden logic in handleDownloadTopCyclistsDraft entirely earlier, which throws a wrench since 'hidden' won't be cleared!
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

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed download fallback sync.');
