const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

const lines = content.split('\n');

// Print out JSX boundaries (e.g. return (<div>..)) and large objects/arrays
let inArray = false;
let arrayStart = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export default function App()')) {
      console.log(`App function starts at line ${i+1}`);
  }
  if (lines[i].includes('return') && lines[i].includes('(') && i > 500) {
      // Could be the main return
      // console.log(`Return at line ${i+1}`);
  }
}

// Let's check lines 250 to 500 to see what's in App.tsx
for (let i = 240; i < 500; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
