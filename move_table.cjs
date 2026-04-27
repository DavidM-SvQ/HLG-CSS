const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /(\s*\{\/\* Resumen de Rendimiento \*\/\}\s*<div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-6">[\s\S]*?<\/div>\r?\n\s*\)\(\)\}\r?\n\s*<\/div>)/;
const match = content.match(regex);

if (match) {
    const tableStr = match[0];
    content = content.replace(tableStr, '');
    
    // Find the end of draftDatosTableRef div.
    // It's line 17855 approx. We can find the closing of draftDatosTableRef by regex:
    const draftDatosRegex = /(<div\s+ref=\{draftDatosTableRef\}[\s\S]*?<\/table>\s*<\/div>\s*\);\s*\)\(\)\}\s*<\/div>)/;
    const match2 = content.match(draftDatosRegex);
    if(match2) {
      content = content.replace(match2[0], match2[0] + "\n\n" + tableStr);
      fs.writeFileSync('src/App.tsx', content, 'utf-8');
      console.log('Successfully moved the table.');
    } else {
      console.log('draftDatosTableRef not found');
    }
} else {
    console.log('Resumen table not found.');
}
