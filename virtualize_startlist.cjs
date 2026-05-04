const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

if (!code.includes('@tanstack/react-virtual')) {
    code = "import { useVirtualizer } from '@tanstack/react-virtual';\n" + code;
}

const virtualizerHook = `
  const startlistParentRef = useRef<HTMLDivElement>(null);
  const startlistVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => startlistParentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const teamParentRef = useRef<HTMLDivElement>(null);
  const teamVirtualizer = useVirtualizer({
    count: teamRows.length,
    getScrollElement: () => teamParentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });
`;

code = code.replace(/return \(\s*<div className="space-y-6">/, match => virtualizerHook + '\n  ' + match);

// Modify the container for the first table
code = code.replace(/<div className="table-responsive-wrapper[^"]*"\s*>/, '<div ref={startlistParentRef} className="table-responsive-wrapper overflow-auto w-full max-h-[600px]">');

// Virtualize the filteredRows map
const tBodyRegex1 = /<tbody className="divide-y divide-neutral-100">\s*\{isStartlistCopying \? filteredRows\.map\(\(r, i\) => \(([\s\S]*?)<\/tr>\s*\)\) : filteredRows\.map\(\(r, i\) => \(([\s\S]*?)<\/tr>\s*\)\)\}\s*<\/tbody>/;

code = code.replace(tBodyRegex1, (match, bodyCopy, bodyRegular) => {
   return `<tbody className="divide-y divide-neutral-100">
                      {startlistVirtualizer.getVirtualItems().length > 0 && (
                        <tr><td style={{ height: \`\${startlistVirtualizer.getVirtualItems()[0].start}px\` }} colSpan={10} /></tr>
                      )}
                      
                      {isStartlistCopying ? filteredRows.map((r, i) => (${bodyCopy}</tr>)) : startlistVirtualizer.getVirtualItems().map((virtualRow) => {
                        const r = filteredRows[virtualRow.index];
                        const i = virtualRow.index;
                        return (${bodyRegular}</tr>);
                      })}
                      
                      {startlistVirtualizer.getVirtualItems().length > 0 && (
                        <tr><td style={{ height: \`\${startlistVirtualizer.getTotalSize() - startlistVirtualizer.getVirtualItems()[startlistVirtualizer.getVirtualItems().length - 1].end}px\` }} colSpan={10} /></tr>
                      )}
                    </tbody>`;
});


// Modify the container for the second table
code = code.replace(/<div className="table-responsive-wrapper[^"]*">/, '<div ref={teamParentRef} className="table-responsive-wrapper overflow-auto w-full max-h-[600px]">');

const tBodyRegex2 = /<tbody className="divide-y divide-neutral-100">\s*\{teamRows\.map\(\(r, i\) => \(([\s\S]*?)<\/tr>\s*\)\)\}\s*<\/tbody>/;

code = code.replace(tBodyRegex2, (match, bodyTeam) => {
   return `<tbody className="divide-y divide-neutral-100">
                      {teamVirtualizer.getVirtualItems().length > 0 && (
                        <tr><td style={{ height: \`\${teamVirtualizer.getVirtualItems()[0].start}px\` }} colSpan={10} /></tr>
                      )}
                      {teamVirtualizer.getVirtualItems().map((virtualRow) => {
                        const r = teamRows[virtualRow.index];
                        const i = virtualRow.index;
                        return (${bodyTeam}</tr>);
                      })}
                      {teamVirtualizer.getVirtualItems().length > 0 && (
                        <tr><td style={{ height: \`\${teamVirtualizer.getTotalSize() - teamVirtualizer.getVirtualItems()[teamVirtualizer.getVirtualItems().length - 1].end}px\` }} colSpan={10} /></tr>
                      )}
                    </tbody>`;
});

fs.writeFileSync('src/components/tabs/StartlistView.tsx', code);
console.log("StartlistView virtualized");
