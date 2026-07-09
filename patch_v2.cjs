const fs = require('fs');

const path = 'src/components/tabs/admin/AdminDatosV2Tab.tsx';
let content = fs.readFileSync(path, 'utf8');

const subComponent = `
const TeamRow = ({ team, idx, playerByCyclist, cyclistMetadata }: any) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Agrupar puntos por ciclista
  const cyclistArr = React.useMemo(() => {
    if (!isExpanded) return [];
    const cyclistPointData: Record<string, { total: number, detalles: any[] }> = {};
    team.detalles.forEach((d: any) => {
      if (!cyclistPointData[d.ciclista]) {
        cyclistPointData[d.ciclista] = { total: 0, detalles: [] };
      }
      cyclistPointData[d.ciclista].total += d.puntosObtenidos;
      cyclistPointData[d.ciclista].detalles.push(d);
    });

    const teamCyclistsStr = Object.keys(playerByCyclist).filter(c => playerByCyclist[c] === team.jugador);
    Object.keys(cyclistPointData).forEach(c => {
       if (!teamCyclistsStr.includes(c)) teamCyclistsStr.push(c);
    });

    return teamCyclistsStr.map((name) => {
      const ptsRaw = cyclistPointData[name];
      const pts = ptsRaw?.total || 0;
      
      const detalles = ptsRaw?.detalles ? [...ptsRaw.detalles].sort((a, b) => {
        if (!a.fecha) return 1;
        if (!b.fecha) return -1;
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateB.getTime() - dateA.getTime();
      }) : [];

      const meta = cyclistMetadata[name] || {};
      const ronda = meta.ronda !== undefined ? parseInt(meta.ronda as string, 10) : 99;
      const subRonda = meta.orden !== undefined ? parseInt(meta.orden as string, 10) : 99;
      
      return {
        name,
        pts,
        detalles,
        rondaId: meta?.ronda || 'Z',
        ronda,
        subRonda,
        equipoReal: meta.equipo || "Libre"
      };
    }).sort((a, b) => {
      const rA = String(a.rondaId);
      const rB = String(b.rondaId);
      if (rA !== rB) return rA.localeCompare(rB);
      return a.subRonda - b.subRonda;
    });
  }, [team, playerByCyclist, cyclistMetadata, isExpanded]);

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
      <div 
        className="p-4 bg-neutral-50 hover:bg-neutral-100 cursor-pointer flex items-center justify-between transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            {idx + 1}
          </div>
          <div>
            <h3 className="font-bold text-neutral-900">{team.nombreEquipo}</h3>
            <p className="text-xs text-neutral-500">{team.jugador}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block font-bold text-lg text-blue-700">{team.puntos} pts</span>
          </div>
          {isExpanded ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-white border-t border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {cyclistArr.map((c: any) => (
              <div key={c.name} className="flex justify-between items-center p-2 rounded border border-neutral-100 bg-neutral-50 text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[10px] font-mono bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-600 shrink-0">
                    {c.rondaId}
                  </span>
                  <span className="font-medium truncate" title={c.name}>{c.name}</span>
                </div>
                
                {c.pts > 0 ? (
                  <Popover>
                    <PopoverTrigger className="font-bold text-indigo-600 tabular-nums shrink-0 ml-2 cursor-pointer border-b border-dotted border-indigo-300 bg-transparent p-0 m-0 border-t-0 border-x-0 outline-none">
                          {c.pts} <span className="text-xs font-normal text-neutral-400">pts</span>
                    </PopoverTrigger>
                      <PopoverContent side="top" align="center" className="w-[340px] max-w-[calc(100vw-32px)] p-0 z-[100] bg-white text-slate-800 border border-slate-200 shadow-xl overflow-hidden flex flex-col gap-0 [&>svg]:hidden [&>div.bg-foreground]:hidden">
                        <div className="bg-white border-b border-slate-100 p-2 font-semibold text-xs shadow-sm flex items-center justify-between rounded-t-lg shrink-0">
                          <span>Desglose {c.name}</span>
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px]">{c.pts} pts</span>
                        </div>
                        <div className="flex flex-col divide-y divide-slate-50 overflow-y-auto overflow-x-hidden max-h-[250px]">
                          {c.detalles.filter((d: any) => d.puntosObtenidos > 0).map((det: any, i: number) => (
                            <div key={i} className="px-3 py-2 text-xs flex justify-between items-start hover:bg-slate-50 last:mb-2">
                              <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-2">
                                <span className="font-semibold text-slate-800 break-words whitespace-normal leading-tight" title={det.carrera}>{det.carrera}</span>
                                <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                                  {det.fecha && <span className="whitespace-nowrap">{det.fecha}</span>}
                                  {det.tipoResultado && (
                                    <span className="uppercase text-[9px] font-bold text-slate-400">
                                      {det.tipoResultado.toLowerCase() === 'etapa' && det.etapa
                                         ? \`Etapa \${det.etapa.replace(/etapa/i, '').trim()}\`
                                        : det.tipoResultado}
                                      {det.tipoResultado.toLowerCase() !== 'etapa' && det.etapa && det.etapa.toLowerCase() !== 'cg' && det.etapa.toLowerCase() !== 'gc'
                                        ? \` (Etapa \${det.etapa.replace(/etapa/i, '').trim()})\`
                                        : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end shrink-0">
                                <span className="font-bold text-indigo-600">{det.puntosObtenidos}</span>
                                {det.posicion && <span className="text-[10px] text-slate-400">Pos: {det.posicion}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                  </Popover>
                ) : (
                  <span className="font-bold text-neutral-400 tabular-nums shrink-0 ml-2">
                    0 <span className="text-xs font-normal text-neutral-300">pts</span>
                  </span>
                )}
              </div>
            ))}
          </div>
          {cyclistArr.length === 0 && (
            <p className="text-sm text-neutral-500 italic text-center py-4">No hay ciclistas en la plantilla.</p>
          )}
        </div>
      )}
    </div>
  );
};
`;

content = content.replace('export const AdminDatosV2Tab = () => {', subComponent + '\nexport const AdminDatosV2Tab = () => {');

// Now replace the map block
const startBlock = '{leaderboard.map((team, idx) => {';
const endBlock = '</div>\n              );\n            })}';

const startIndex = content.indexOf(startBlock);
const endIndex = content.indexOf(endBlock, startIndex) + endBlock.length;

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find the map block to replace");
    process.exit(1);
}

const replacement = '{leaderboard.map((team, idx) => (\n              <TeamRow key={team.nombreEquipo} team={team} idx={idx} playerByCyclist={playerByCyclist} cyclistMetadata={cyclistMetadata} />\n            ))}';

const finalContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync(path, finalContent, 'utf8');
console.log("Patched successfully.");
