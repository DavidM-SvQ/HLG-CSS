const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/RaceView.tsx', 'utf8');

if (!code.includes('@tanstack/react-virtual')) {
    code = "import { useVirtualizer } from '@tanstack/react-virtual';\n" + code;
}

const virtualizerHook1 = `
  const raceCyclistsParentRef = useRef<HTMLDivElement>(null);
  const raceCyclistsVirtualizer = useVirtualizer({
    count: raceCyclists.length,
    getScrollElement: () => raceCyclistsParentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });
`;

// Insert the hooks
code = code.replace(/return \(\s*<div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6">/, match => virtualizerHook1 + '\n  ' + match);

// Modify the container for the cyclists table
code = code.replace(/<div className="table-responsive-wrapper[^"]*"\s*>\s*<table className="w-full text-xs text-left border-collapse">/g, 
  '<div ref={raceCyclistsParentRef} className="table-responsive-wrapper overflow-auto w-full max-h-[600px]"><table className="w-full text-xs text-left border-collapse">');

// Find the map over raceCyclists
const tBodyRegexCyc = /<tbody className="divide-y divide-neutral-100">\s*\{raceCyclists\.map\(\(c, idx\) => \(([\s\S]*?)<\/tr>\s*\)\)\}\s*<\/tbody>/;

code = code.replace(tBodyRegexCyc, (match, bodyCyc) => {
   return `<tbody className="divide-y divide-neutral-100">
                      {raceCyclistsVirtualizer.getVirtualItems().length > 0 && (
                        <tr><td style={{ height: \`\${raceCyclistsVirtualizer.getVirtualItems()[0].start}px\` }} colSpan={10} /></tr>
                      )}
                      {raceCyclistsVirtualizer.getVirtualItems().map((virtualRow) => {
                        const c = raceCyclists[virtualRow.index];
                        const idx = virtualRow.index;
                        return (${bodyCyc}</tr>);
                      })}
                      {raceCyclistsVirtualizer.getVirtualItems().length > 0 && (
                        <tr><td style={{ height: \`\${raceCyclistsVirtualizer.getTotalSize() - raceCyclistsVirtualizer.getVirtualItems()[raceCyclistsVirtualizer.getVirtualItems().length - 1].end}px\` }} colSpan={10} /></tr>
                      )}
                    </tbody>`;
});

fs.writeFileSync('src/components/tabs/RaceView.tsx', code);
console.log("RaceView virtualized");
