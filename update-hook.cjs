const fs = require('fs');
let content = fs.readFileSync('src/hooks/useTableScreenshot.ts', 'utf8');

content = content.replace(
  /el\.style\.clipPath = 'none';/g,
  `el.style.clipPath = 'none';
            el.removeAttribute('mask');
            el.style.mask = 'none';
            el.style.strokeDasharray = 'none';
            el.style.strokeDashoffset = '0';`
);

content = content.replace(
  /const elementsWithClip = Array.from\(svg.querySelectorAll\('\\[clip-path\\]'\)\);/g,
  `const elementsWithClip = Array.from(svg.querySelectorAll('*'));`
);

fs.writeFileSync('src/hooks/useTableScreenshot.ts', content);
