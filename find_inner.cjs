const fs = require('fs');
const file = 'src/components/tabs/DraftView.tsx';
let source = fs.readFileSync(file, 'utf8');

// There are probably a few big IIFEs
// Let's find "{(() => {"
const parts = source.split('{(() => {');
console.log(`Found ${parts.length - 1} IIFEs`);

// If we find them, we can try to extract the block
for(let i = 1; i < parts.length; i++) {
  // how many closing brackets until the IIFE finishes?
  // It ends with "})()}"
  let endIdx = parts[i].indexOf('})()}');
  if (endIdx > -1) {
    console.log(`IIFE ${i} length is approx ${endIdx}`);
  } else {
    // maybe "})()}" 
    let match = parts[i].match(/\}\)\(\)\}/);
    console.log(`IIFE ${i} has match?`, !!match);
  }
}
