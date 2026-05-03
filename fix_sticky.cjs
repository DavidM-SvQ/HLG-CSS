const fs = require('fs');

async function fixSticky() {
  const draftViewPath = 'src/components/tabs/DraftView.tsx';
  let draft = fs.readFileSync(draftViewPath, 'utf8');

  // We want to make the column sticky left-0 for "Ciclista" or "Equipo"
  // Let's find: `return ( <th key={col} className="px-2 py-1.5 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors text-center"`
  draft = draft.replace(
    /return \(\s*<th\s*key=\{col\}\s*className="([^"]+)"/,
    (match, p1) => {
      return `return (\n                                    <th\n                                      key={col}\n                                      className={\`\${"${p1}"} \${(col === "Ciclista" || col === "Nombre_Equipo") ? "sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]" : ""}\`}`;
    }
  );

  // Now for the body
  draft = draft.replace(
    /<td className="px-1 py-0\.5 text-left truncate max-w-\[100px\]">/g,
    `<td className="px-1 py-0.5 text-left truncate max-w-[100px] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">`
  );

  draft = draft.replace(
    /<td className="px-1 py-0\.5 font-medium text-blue-600 text-\[10px\]">/g,
    `<td className="px-1 py-0.5 font-medium text-blue-600 text-[10px] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">`
  );


  // For Draft Summary Table:
  draft = draft.replace(
    /<th className="px-3 py-2\.5 font-bold border-b border-neutral-200">/,
    `<th className="px-3 py-2.5 font-bold border-b border-neutral-200 sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]">`
  );

  // Draft Summary Table body
  draft = draft.replace(
    /<td className="px-3 py-2 text-neutral-900 font-semibold border-b border-neutral-100">/g,
    `<td className="px-3 py-2 text-neutral-900 font-semibold border-b border-neutral-100 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">`
  );

  // Draft Best/Worst Table header
  draft = draft.replace(
    /<th className="px-6 py-4 font-bold border-b border-neutral-100">/g,
    `<th className="px-6 py-4 font-bold border-b border-neutral-100 sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]">`
  );

  // Best/worst body
  draft = draft.replace(
    /<td className="px-6 py-4 font-bold border-b border-neutral-50">/g,
    `<td className="px-6 py-4 font-bold border-b border-neutral-50 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">`
  );



  fs.writeFileSync(draftViewPath, draft);

  // STARTLISTVIEW
  const startlistViewPath = 'src/components/tabs/StartlistView.tsx';
  let startlist = fs.readFileSync(startlistViewPath, 'utf8');

  // Equipo
  startlist = startlist.replace(
    /<th\s*className="px-3 py-2 cursor-pointer hover:bg-neutral-100 transition-colors duration-150 group w-\[35%\]"/,
    `<th\n                            className="px-3 py-2 cursor-pointer hover:bg-neutral-100 transition-colors duration-150 group w-[35%] sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]"`
  );

  // Equipo body
  startlist = startlist.replace(
    /<td className="px-3 py-[2px] font-semibold text-neutral-800 tracking-tight">/g,
    `<td className="px-3 py-[2px] font-semibold text-neutral-800 tracking-tight sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">`
  );


  // Small Table
  startlist = startlist.replace(
    /<th className="px-2 py-1">Equipo<\/th>/g,
    `<th className="px-2 py-1 sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]">Equipo</th>`
  );

  startlist = startlist.replace(
    /<td className="px-2 py-1 font-semibold text-neutral-800">/g,
    `<td className="px-2 py-1 font-semibold text-neutral-800 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">`
  );

  fs.writeFileSync(startlistViewPath, startlist);
  console.log("Done");
}

fixSticky();

