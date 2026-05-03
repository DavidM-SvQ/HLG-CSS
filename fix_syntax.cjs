const fs = require('fs');
let draftCode = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf8');

// The file likely ends with
//              </div>
//            )}
//     </>
//   );
// };
draftCode = draftCode.replace(/            \)}\n    <\/>/g, "              </div>\n    </>");
draftCode = draftCode.replace(/\)}\n    <\/>/g, "\n    </>");

fs.writeFileSync('src/components/tabs/DraftView.tsx', draftCode);
console.log('Fixed syntax error.');
