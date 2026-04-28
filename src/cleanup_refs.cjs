const fs = require('fs');
let code = fs.readFileSync('src/MonthlyReportView.tsx', 'utf8');

// restore standard header text classes and remove broken wrappers
code = code.replace(/ref=\{ref\d+\}/g, '');
code = code.replace(/<ExportToolbar[^>]+>/g, '');
code = code.replace(/<div className="flex justify-between items-center mb-4 w-full gap-4">.*?<h3/gs, '<h3');
code = code.replace(/<div className="flex justify-between items-center pb-2 w-full gap-4">.*?<h3/gs, '<h3');
code = code.replace(/<div className="flex justify-between items-center border-b border-pink-100 pb-2 mb-3 w-full gap-4">.*?<h4/gs, '<h4');

// Some headers might end with </h3>\n</div> because of my bad replace
code = code.replace(/<\/h3>\\n<\/div>/g, '</h3>');
code = code.replace(/<\/h4>\\n<\/div>/g, '</h4>');

code = code.replace(/<h3 className="text-lg font-bold text-neutral-900"/g, '<h3 className="text-lg font-bold text-neutral-900 mb-4"');
code = code.replace(/<h3 className="text-xl font-bold text-pink-900 flex items-center gap-2"/g, '<h3 className="text-xl font-bold text-pink-900 flex items-center gap-2 pb-2"');
code = code.replace(/<h4 className="font-bold text-pink-800 text-sm"/g, '<h4 className="font-bold text-pink-800 border-b border-pink-100 pb-2 mb-3 text-sm"');

// Fix multiple empty ref=
code = code.replace(/ ref=\{ref\d+\}/g, '');

fs.writeFileSync('src/MonthlyReportView.tsx', code);
console.log('Cleanup done');
