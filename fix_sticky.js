const fs = require('fs');

async function fixSticky() {
  const draftViewPath = 'src/components/tabs/DraftView.tsx';
  let draft = fs.readFileSync(draftViewPath, 'utf8');

  // Table 1: Draft Data
  // Change column order so Ciclista is first
  draft = draft.replace(
    /(\[\s*)"Elección",\s*"Nombre_Equipo",\s*"Orden_Draft",\s*"Ronda",\s*"Ciclista",/g,
    '$1"Ciclista",\n"Elección",\n"Nombre_Equipo",\n"Orden_Draft",\n"Ronda",'
  );

  // Now change the <td> order for Draft Data
  const oldTDOrder = `
                                      <td className="px-1 py-0.5 font-medium text-neutral-900 text-center">
                                        {getVal(row, "Elección")}
                                      </td>
                                      <td className="px-1 py-0.5 text-left truncate max-w-\\[100px\\]">
                                        {getVal(
                                          row,
                                          "Nombre_Equipo",
                                        ) \\|\\|
                                          getVal(row, "Nombre_TG")}
                                      </td>
                                      <td className="px-1 py-0.5 text-center">
                                        {getVal(row, "Orden_Draft")}
                                      </td>
                                      <td className="px-1 py-0.5 text-center">
                                        <span className="inline-flex items-center justify-center bg-neutral-100 text-neutral-600 px-1 py-px rounded text-\\[9px\\] font-bold">
                                          {getVal(row, "Ronda")}
                                        </span>
                                      </td>
                                      <td className="px-1 py-0.5 font-medium text-blue-600 text-\\[10px\\]">
                                        {ciclista}
                                      </td>`;
  
  const newTDOrder = `
                                      <td className="px-1 py-0.5 font-medium text-blue-600 text-[10px] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5]">
                                        {ciclista}
                                      </td>
                                      <td className="px-1 py-0.5 font-medium text-neutral-900 text-center">
                                        {getVal(row, "Elección")}
                                      </td>
                                      <td className="px-1 py-0.5 text-left truncate max-w-[100px]">
                                        {getVal(
                                          row,
                                          "Nombre_Equipo",
                                        ) ||
                                          getVal(row, "Nombre_TG")}
                                      </td>
                                      <td className="px-1 py-0.5 text-center">
                                        {getVal(row, "Orden_Draft")}
                                      </td>
                                      <td className="px-1 py-0.5 text-center">
                                        <span className="inline-flex items-center justify-center bg-neutral-100 text-neutral-600 px-1 py-px rounded text-[9px] font-bold">
                                          {getVal(row, "Ronda")}
                                        </span>
                                      </td>`;

  // We should do it with string replacement, maybe regex is too sensitive for whitespace
}

fixSticky();

