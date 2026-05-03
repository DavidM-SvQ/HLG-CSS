const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf8');

// ==== ELECCIONES PILLS ====
const eleccionesContainerStartRegex = /<div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">\s*<div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">/;
const newEleccionesStart = `<div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">`;

const eleccionesContainerEndRegex = />\s*<Maximize2 className="w-4 h-4" \/>\s*<\/button>\s*<button(.*?)>\s*<Copy className="w-4 h-4"(.*?)\/>\s*<\/button>\s*<\/div>\s*<\/div>/;

const newEleccionesEndStr = `>
                  <Copy className="w-4 h-4"$2/>
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


// ==== DATOS PILLS ====
const datosContainerStartRegex = /<div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm gap-2">/;
const newDatosStart = `<div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">`;

const datosContainerEndRegex = />\s*<Copy className="w-4 h-4"(.*?)\/>\s*<\/button>\s*<\/div>\s*<\/div>/;

const newDatosEndStr = `>
                  <Copy className="w-4 h-4"$1/>
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
          </div>`;


code = code.replace(eleccionesContainerStartRegex, newEleccionesStart);
code = code.replace(eleccionesContainerEndRegex, newEleccionesEndStr);

code = code.replace(datosContainerStartRegex, newDatosStart);
code = code.replace(datosContainerEndRegex, newDatosEndStr);

fs.writeFileSync('src/components/tabs/DraftView.tsx', code);
console.log("Pills injected");
