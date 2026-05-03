const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf8');

const hookInjected = `
  const draftSortedData = useMemo(() => {
    return [...draftFilteredData].sort((a, b) => {
      // Replicando la logica de sort
      if (draftSortColumn === "Puntos") {
        const ptsA = draftCyclistStats[getVal(a, "Ciclista") || ""]?.puntos || 0;
        const ptsB = draftCyclistStats[getVal(b, "Ciclista") || ""]?.puntos || 0;
        return draftSortDirection === "asc" ? ptsA - ptsB : ptsB - ptsA;
      }
      if (draftSortColumn === "V") {
        const vicA = draftCyclistStats[getVal(a, "Ciclista") || ""]?.victorias || 0;
        const vicB = draftCyclistStats[getVal(b, "Ciclista") || ""]?.victorias || 0;
        return draftSortDirection === "asc" ? vicA - vicB : vicB - vicA;
      }
      if (draftSortColumn === "C") {
        const cA = cyclistMetadata[getVal(a, "Ciclista") || ""]?.carrerasDisputadas || 0;
        const cB = cyclistMetadata[getVal(b, "Ciclista") || ""]?.carrerasDisputadas || 0;
        return draftSortDirection === "asc" ? cA - cB : cB - cA;
      }
      if (draftSortColumn === "DC") {
        const dcA = cyclistMetadata[getVal(a, "Ciclista") || ""]?.diasCompeticion || 0;
        const dcB = cyclistMetadata[getVal(b, "Ciclista") || ""]?.diasCompeticion || 0;
        return draftSortDirection === "asc" ? dcA - dcB : dcB - dcA;
      }
      const valA = getVal(a, draftSortColumn);
      const valB = getVal(b, draftSortColumn);
      if (!valA) return 1;
      if (!valB) return -1;
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return draftSortDirection === "asc" ? numA - numB : numB - numA;
      }
      return draftSortDirection === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [draftFilteredData, draftSortColumn, draftSortDirection, draftCyclistStats, cyclistMetadata]);
`;

code = code.replace(/return \(\s*<>\s*<div className="space-y-8">/, match => hookInjected + '\n  ' + match);

if (!code.includes('@tanstack/react-virtual')) {
    code = "import { useVirtualizer } from '@tanstack/react-virtual';\n" + code;
}

const virtualizerHook = `
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: draftSortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });
`;
code = code.replace(/const draftTableRef = useRef<HTMLDivElement>\(null\);/, match => virtualizerHook + '\\n  ' + match);
code = code.replace(/<div className="table-responsive-wrapper overflow-auto w-full h-full crosshair-container"><table className="w-auto text-\[11px\] text-left whitespace-nowrap border-collapse mx-auto">/, '<div ref={parentRef} className="table-responsive-wrapper overflow-auto w-full max-h-[600px] crosshair-container"><table className="w-auto text-[11px] text-left whitespace-nowrap border-collapse mx-auto">');

let tBodyIndex = code.indexOf('<tbody className="divide-y divide-neutral-100">\\n                              {filteredData');
// we know filteredData.sort(...) map ends at some point. let's find the closing of map.
// To do this simply, we replace the '{filteredData' up to the '.map((row, idx) => {' with our new logic.

const replacementStart = `
                            <tbody className="divide-y divide-neutral-100">
                              {rowVirtualizer.getVirtualItems().length > 0 && (
                                <tr><td style={{ height: \`\${rowVirtualizer.getVirtualItems()[0].start}px\` }} colSpan={15} /></tr>
                              )}
                              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const row = draftSortedData[virtualRow.index];
                                const idx = virtualRow.index;
`;

code = code.replace(/<tbody className="divide-y divide-neutral-100">\s*\{filteredData[\s\S]*?\.map\(\(row, idx\) => \{/, replacementStart);

// Now we need to find where the map ends to add the padding bottom.
// We can find where the TBody ends for THIS specific table.
// The table seems to end with: </tbody>\n                            </table>

code = code.replace(/(\s*)<\/tbody>\s*<\/table>/, match => {
   return `
                              {rowVirtualizer.getVirtualItems().length > 0 && (
                                <tr><td style={{ height: \`\${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px\` }} colSpan={15} /></tr>
                              )}
                            </tbody>
                          </table>`;
});

fs.writeFileSync('src/components/tabs/DraftView.tsx', code);
console.log("Virtualizacion completada");
