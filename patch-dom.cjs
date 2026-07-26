const fs = require('fs');
let content = fs.readFileSync('src/lib/dom-utils.ts', 'utf8');

content = content.replace(
  /node\.style\.setProperty\('min-height', '0px', 'important'\);\s*node\.style\.setProperty\('height', 'auto', 'important'\);/g,
  `if (!node.querySelector('.recharts-wrapper') && !node.closest('.recharts-wrapper') && !node.querySelector('canvas')) {
      node.style.setProperty('min-height', '0px', 'important');
      node.style.setProperty('height', 'auto', 'important');
    }`
);

fs.writeFileSync('src/lib/dom-utils.ts', content);
