const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf8');

// For elecciones, find:
// <UploadCloud className="w-4 h-4" />
// </button>
// </div>
// </div>
const eleccionesEndRegex = /<UploadCloud className="w-4 h-4" \/>\s*<\/button>\s*<\/div>\s*<\/div>/;
const newEleccionesEndStr = `<UploadCloud className="w-4 h-4" />
                </button>
              </div>
            </div>
            {(draftRoundFilter.length > 0 || draftTeamFilter.length > 0 || Object.values(draftStatsFilters).some((v) => v !== undefined && String(v) !== "")) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
                <span className="text-xs text-neutral-500 font-medium mr-1">Filtros activos:</span>
                {draftRoundFilter.map(r => (
                  <span key={'r'+r} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                     Ronda {r}
                     <button onClick={() => setDraftRoundFilter(draftRoundFilter.filter(x => x !== r))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {draftTeamFilter.map(t => (
                  <span key={'t'+t} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                     {t}
                     <button onClick={() => setDraftTeamFilter(draftTeamFilter.filter(x => x !== t))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {Object.entries(draftStatsFilters).map(([k, v]) => {
                  if (v === undefined || String(v) === "") return null;
                  const label = k.replace('min', 'Min ').replace('max', 'Max ');
                  return (
                    <span key={'s'+k} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                       {label} {v}
                       <button onClick={() => {
                          const newStats = { ...draftStatsFilters };
                          delete (newStats as any)[k];
                          setDraftStatsFilters(newStats);
                       }} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                  );
                })}

                <button 
                   onClick={() => { setDraftRoundFilter([]); setDraftTeamFilter([]); setDraftStatsFilters({}); }}
                   className="text-[11px] text-neutral-500 hover:text-neutral-800 underline ml-2 transition-colors"
                >
                  Limpiar todo
                </button>
              </div>
            )}
          </div>`;

// For datos, let's find:
// <UploadCloud className="w-4 h-4" />
// </button>
// </div>
// </div>
// BUT wait, Datos has identical structure. Let's make sure we find the SECOND one.
// Let's just use string.replace on the EXACT text.
const endBlock = `<UploadCloud className="w-4 h-4" />\n                </button>\n              </div>\n            </div>`;

const parts = code.split(endBlock);
// parts[0] + endBlock + parts[1] (elecciones) + endBlock + parts[2] (datos) + ...

if (parts.length >= 3) { // It should be exactly 3 parts in the original file
  code = parts[0] + newEleccionesEndStr + parts[1] + `
<UploadCloud className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {(draftDatosMonthFilter.length > 0 || draftDatosCategoryFilter.length > 0 || draftDatosTeamFilter.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
                <span className="text-xs text-neutral-500 font-medium mr-1">Filtros activos:</span>
                {draftDatosMonthFilter.map(m => (
                  <span key={'m'+m} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                     {m}
                     <button onClick={() => setDraftDatosMonthFilter(draftDatosMonthFilter.filter(x => x !== m))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {draftDatosCategoryFilter.map(c => (
                  <span key={'c'+c} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                     {c}
                     <button onClick={() => setDraftDatosCategoryFilter(draftDatosCategoryFilter.filter(x => x !== c))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {draftDatosTeamFilter.map(t => (
                  <span key={'dt'+t} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full border border-blue-100">
                     {t}
                     <button onClick={() => setDraftDatosTeamFilter(draftDatosTeamFilter.filter(x => x !== t))} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                  </span>
                ))}

                <button 
                   onClick={() => { setDraftDatosMonthFilter([]); setDraftDatosCategoryFilter([]); setDraftDatosTeamFilter([]); }}
                   className="text-[11px] text-neutral-500 hover:text-neutral-800 underline ml-2 transition-colors"
                >
                  Limpiar todo
                </button>
              </div>
            )}
          </div>` + parts[2];

  fs.writeFileSync('src/components/tabs/DraftView.tsx', code);
  console.log("Pills closing tags injected");
} else {
  console.log("Could not find 2 blocks");
}
