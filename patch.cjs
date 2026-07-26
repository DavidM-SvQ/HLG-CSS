const fs = require('fs');
const content = fs.readFileSync('src/lib/dom-utils.ts', 'utf8');

const newContent = content.replace(
  "const paths = Array.from(svg.querySelectorAll<HTMLElement>('path, .recharts-layer, .recharts-area-area, .recharts-line-curve, .recharts-area-curve, .recharts-line'));",
  "const paths = Array.from(svg.querySelectorAll<HTMLElement>('*'));"
);

fs.writeFileSync('src/lib/dom-utils.ts', newContent);
