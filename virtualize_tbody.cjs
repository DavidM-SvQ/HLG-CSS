const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

const tBodyStartStr = '{filteredRows.map((r, i) => (';
const tBodyEndStr = '                        ))}';
const tBodyReplacement = `
                        {rowVirtualizer.getVirtualItems().length > 0 && (
                          <tr>
                            <td colSpan={8} style={{ height: rowVirtualizer.getVirtualItems()[0].start }} />
                          </tr>
                        )}
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                          const i = virtualRow.index;
                          const r = filteredRows[i];
                          return (
`;

const closeReplacement = `
                          );
                        })}
                        {rowVirtualizer.getVirtualItems().length > 0 && (
                          <tr>
                            <td colSpan={8} style={{ height: rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end }} />
                          </tr>
                        )}
`;

code = code.replace(tBodyStartStr, tBodyReplacement);
code = code.replace(tBodyEndStr, closeReplacement);

fs.writeFileSync('src/components/tabs/StartlistView.tsx', code);
console.log("Virtualized table body successful!");
