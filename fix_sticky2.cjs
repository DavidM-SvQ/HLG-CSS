const fs = require('fs');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace th with Ciclista
  content = content.replace(
    /<th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200">Ciclista<\/th>/g,
    '<th className="sticky top-0 left-0 z-40 bg-neutral-50 px-3 py-2 font-bold border-b border-neutral-200 shadow-[1px_0_0_0_#e5e5e5]">Ciclista</th>'
  );

  // Replace th with Equipo (Monthly)
  content = content.replace(
    /<th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold  border-b border-neutral-100">Equipo<\/th>/g,
    '<th className="sticky top-0 left-0 z-40 bg-neutral-50 px-4 py-2 font-bold border-b border-neutral-100 shadow-[1px_0_0_0_#e5e5e5]">Equipo</th>'
  );

  // Replace th with Equipo (Season)
  content = content.replace(
    /<th className="sticky top-0 z-30 bg-neutral-50 px-2 py-1\.5 font-semibold  border-b border-neutral-100">Equipo<\/th>/g,
    '<th className="sticky top-0 left-0 z-40 bg-neutral-50 px-2 py-1.5 font-semibold border-b border-neutral-100 shadow-[1px_0_0_0_#e5e5e5]">Equipo</th>'
  );

  // For Ciclista td (font-semibold text-blue-600)
  content = content.replace(
    /<td className="px-3 py-[2px] font-semibold text-blue-600">/g,
    '<td className="px-3 py-[2px] font-semibold text-blue-600 sticky left-0 bg-white z-20 shadow-[1px_0_0_0_#e5e5e5]">'
  );

  // For Equipo td 
  content = content.replace(
    /<td className="px-4 py-1\.5 font-semibold text-neutral-800 border-b border-neutral-50">/g,
    '<td className="px-4 py-1.5 font-semibold text-neutral-800 border-b border-neutral-50 sticky left-0 bg-white z-20 shadow-[1px_0_0_0_#e5e5e5]">'
  );
  
  content = content.replace(
    /<td className="px-2 py-[2px] font-semibold text-neutral-800 border-b border-neutral-50 truncate max-w-\[120px\]" title=\{equipo\}>/g,
    '<td className="px-2 py-[2px] font-semibold text-neutral-800 border-b border-neutral-50 truncate max-w-[120px] sticky left-0 bg-white z-20 shadow-[1px_0_0_0_#e5e5e5]" title={equipo}>'
  );

  fs.writeFileSync(filePath, content);
}

processFile('src/MonthlyReportView.tsx');
processFile('src/SeasonReportView.tsx');
console.log("Done");
