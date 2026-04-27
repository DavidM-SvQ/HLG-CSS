import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const startStr = "{/* Resumen de Rendimiento */}";
const endStrRe = "</div>\n                            );\n                          })()}\n                        </div>";

const startIndex = content.indexOf(startStr);
if (startIndex !== -1) {
    const fromStart = content.substring(startIndex);
    let endIndexOffset = fromStart.indexOf("})()}\n                        </div>");
    
    if (endIndexOffset !== -1) {
        const fullEnd = "})()}\n                        </div>";
        const totalLen = endIndexOffset + fullEnd.length;
        
        let tableStr = content.substring(startIndex, startIndex + totalLen);
        
        // Remove preceding spaces for clean extraction
        let realStart = content.lastIndexOf("\n", startIndex);
        if (realStart !== -1) tableStr = content.substring(realStart, startIndex + totalLen);

        content = content.replace(tableStr, '');
        
        // Find draftDatosTableRef end
        const refStartStr = "ref={draftDatosTableRef}";
        const refStartIndex = content.indexOf(refStartStr);
        if (refStartIndex !== -1) {
            const fromRefStart = content.substring(refStartIndex);
            let refEndOffset = fromRefStart.indexOf("})()}\n                        </div>");
            if (refEndOffset !== -1) {
                const refFullEnd = "})()}\n                        </div>";
                const insertPos = refStartIndex + refEndOffset + refFullEnd.length;
                
                content = content.substring(0, insertPos) + "\n\n" + tableStr + content.substring(insertPos);
                
                fs.writeFileSync('src/App.tsx', content, 'utf-8');
                console.log('Successfully moved the table.');
            } else {
                 console.log('draftDatos end not found');
            }
        } else {
            console.log('draftDatos start not found');
        }
    } else {
        console.log('Resumen table end not found.');
    }
} else {
    console.log('Resumen table start not found.');
}
