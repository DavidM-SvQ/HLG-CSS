const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/season/SeasonCyclistsTab.tsx', 'utf8');

// Top Cyclists Draft
code = code.replace(
  /return topCyclistsDraft\.slice\(0, limit\)\.map\(\(s, idx\) => \(([\s\S]*?)\);\n\s*}\);/,
  "return <VirtualizedTableBody scrollElementRef={topCyclistsDraftRefContainer} items={topCyclistsDraft.slice(0, limit)} renderRow={(s, idx) => ($1)} />;"
);

// Unscored
code = code.replace(
  /return unscored\.map\(\(s, idx\) => \(([\s\S]*?)\);\n\s*}\);/,
  "return <VirtualizedTableBody scrollElementRef={unscoredRefContainer} items={unscored} renderRow={(s, idx) => ($1)} />;"
);

// Undebuted
code = code.replace(
  /return undebuted\.map\(\(s, idx\) => \(([\s\S]*?)\);\n\s*}\);/,
  "return <VirtualizedTableBody scrollElementRef={undebutedRefContainer} items={undebuted} renderRow={(s, idx) => ($1)} />;"
);

// No Draft Cyclists
code = code.replace(
  /return noDraftCyclists\.slice\(0, limit\)\.map\(\(s, idx\) => \(([\s\S]*?)\);\n\s*}\);/,
  "return <VirtualizedTableBody scrollElementRef={noDraftRefContainer} items={noDraftCyclists.slice(0, limit)} renderRow={(s, idx) => ($1)} />;"
);

// We need to remove the <tbody> tags that wrap the IIFE, since VirtualizedTableBody outputs the <tbody>.
// But the simplest way is to just let VirtualizedTableBody output <tbody> and remove the existing ones.
code = code.replace(/<tbody className="divide-y divide-neutral-100">\s*\{\(\(\) => \{/g, '{(() => {');
code = code.replace(/\}\)\(\)\}\s*<\/tbody>/g, '})()}');

fs.writeFileSync('src/components/tabs/season/SeasonCyclistsTab.tsx', code);
console.log("SeasonCyclistsTab virtualized.");
