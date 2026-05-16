const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/season/TopDraftCyclists.tsx', 'utf8');

code = code.replace(/<table className="w-full min-w-\[700px\]([^"]*)">/g, '<table className="w-full min-w-full md:min-w-[700px]$1">');

// Add hidden md:table-cell to THs
code = code.replace(/<th\s*className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"\s*onClick=\{\(\) => \{\s*if \(\s*cyclistsSortColumn === "equipo"/g, 
  '<th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" onClick={() => { if (cyclistsSortColumn === "equipo"');

code = code.replace(/<th\s*className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"\s*onClick=\{\(\) => \{\s*if \(cyclistsSortColumn === "pais/g, 
  '<th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" onClick={() => { if (cyclistsSortColumn === "pais');

code = code.replace(/<th\s*className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"\s*onClick=\{\(\) => \{\s*if \(\s*cyclistsSortColumn === "victorias/g, 
  '<th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" onClick={() => { if (cyclistsSortColumn === "victorias');

code = code.replace(/<th\s*className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"\s*onClick=\{\(\) => \{\s*if \(\s*cyclistsSortColumn === "carreras/g, 
  '<th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" onClick={() => { if (cyclistsSortColumn === "carreras');

code = code.replace(/<th\s*className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"\s*title="Días de competición"\s*onClick=\{\(\) => \{\s*if \(cyclistsSortColumn === "dias/g, 
  '<th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" title="Días de competición" onClick={() => { if (cyclistsSortColumn === "dias');

code = code.replace(/<th\s*className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"\s*title="Puntos por carreras"\s*onClick=\{\(\) => \{\s*if \(cyclistsSortColumn === "ppc/g, 
  '<th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" title="Puntos por carreras" onClick={() => { if (cyclistsSortColumn === "ppc');

code = code.replace(/<th\s*className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200"\s*title="Puntos por día de competición"\s*onClick=\{\(\) => \{\s*if \(cyclistsSortColumn === "ppd/g, 
  '<th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 hidden md:table-cell" title="Puntos por día de competición" onClick={() => { if (cyclistsSortColumn === "ppd');

fs.writeFileSync('src/components/tabs/season/TopDraftCyclists.tsx', code);
