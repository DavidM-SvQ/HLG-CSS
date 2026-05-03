import fs from 'fs';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import t from '@babel/types';

function fixFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');
  console.log("Analyzing", filepath);
  
  // Actually we need to make sure we don't break things. 
  // Maybe just return some diagnostics about where filter is called?
}

// Since AST rewriting of JSX with state variables is tricky (figuring out dependencies),
// let's do a more guided custom refactor or just read the lines that have `.filter`.
const lines = code => code.split('\n').map((l, i) => `${i+1}: ${l}`);
["src/components/tabs/DraftView.tsx", "src/components/tabs/TeamView.tsx", "src/components/tabs/RaceView.tsx"].forEach(f => {
    let matches = lines(fs.readFileSync(f, 'utf8')).filter(l => l.includes('.filter('));
    console.log(`\n\n--- ${f} ---`);
    console.log(matches.join('\n'));
});
