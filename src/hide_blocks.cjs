const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// For Unscored
const unscoredBlockContainer = `<div className="flex flex-col gap-2 p-4 copy-button-ignore border-b border-neutral-100 bg-neutral-50/30">
                                <div className="flex items-center justify-end">
                                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Copiar bloques de imagen:</span>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-1.5">
                                  {Array.from({ length: Math.ceil(((() => {`;

const unscoredBlockContainerNew = `{((() => {
  const unscoredCount = files.elecciones.data?.map(row => {
    const ciclista = getVal(row, 'Ciclista')?.trim();
    const jugador = getVal(row, 'Nombre_TG')?.trim();
    let points = 0;
    leaderboard?.forEach(p => {
      if (p.jugador === jugador) {
        p.detalles.forEach(d => { if (d.ciclista === ciclista) points += d.puntosObtenidos; });
      }
    });
    if (points > 0) return null;
    return { ciclista, ronda: cyclistRoundMap[ciclista] || '', nombreEquipo: getVal(row, 'Nombre_Equipo')?.trim() };
  }).filter(Boolean) as any[] || [];
  return unscoredCount.filter(c => {
    const teamMatch = unscoredCyclistsTeamFilter === 'all' || c.nombreEquipo === unscoredCyclistsTeamFilter;
    const roundMatch = unscoredCyclistsRoundFilter.length === 0 || unscoredCyclistsRoundFilter.includes(c.ronda);
    return teamMatch && roundMatch;
  }).length;
})()) > 50) && (
<div className="flex flex-col gap-2 p-4 copy-button-ignore border-b border-neutral-100 bg-neutral-50/30">
                                <div className="flex items-center justify-end">
                                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Copiar bloques de imagen:</span>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-1.5">
                                  {Array.from({ length: Math.ceil(((() => {`;

code = code.replace(unscoredBlockContainer, unscoredBlockContainerNew);

// Since I opened a JSX block \`{ ... && (\`, I must close it.
const unscoredBlockClose = `                                  })}
                                </div>
                              </div>
                              <div ref={unscoredTableRef}`;

const unscoredBlockCloseNew = `                                  })}
                                </div>
                              </div>
)}
                              <div ref={unscoredTableRef}`;

code = code.replace(unscoredBlockClose, unscoredBlockCloseNew);

// For Undebuted
const undebutedBlockContainer = `<div className="flex flex-col gap-2 p-4 copy-button-ignore border-b border-neutral-100 bg-neutral-50/30">
                                <div className="flex items-center justify-end">
                                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Copiar bloques de imagen:</span>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-1.5">
                                  {Array.from({ length: Math.ceil(((() => {`;

const undebutedBlockContainerNew = `{((() => {
  const undebutedCount = files.elecciones.data?.map(row => {
    const ciclista = getVal(row, 'Ciclista')?.trim();
    const meta = cyclistMetadata[ciclista] || { carrerasDisputadas: 0, diasCompeticion: 0 };
    if (meta.diasCompeticion > 0) return null;
    return { nombreEquipo: getVal(row, 'Nombre_Equipo')?.trim(), ronda: cyclistRoundMap[ciclista] || '' };
  }).filter(Boolean) as any[] || [];
  return undebutedCount.filter(c => {
    const teamMatch = undebutedCyclistsTeamFilter === 'all' || c.nombreEquipo === undebutedCyclistsTeamFilter;
    const roundMatch = undebutedCyclistsRoundFilter.length === 0 || undebutedCyclistsRoundFilter.includes(c.ronda);
    return teamMatch && roundMatch;
  }).length;
})()) > 50) && (
<div className="flex flex-col gap-2 p-4 copy-button-ignore border-b border-neutral-100 bg-neutral-50/30">
                                <div className="flex items-center justify-end">
                                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Copiar bloques de imagen:</span>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-1.5">
                                  {Array.from({ length: Math.ceil(((() => {`;

code = code.replace(undebutedBlockContainer, undebutedBlockContainerNew);

const undebutedBlockClose = `                                  })}
                                </div>
                              </div>
                              <div ref={undebutedTableRef}`;

const undebutedBlockCloseNew = `                                  })}
                                </div>
                              </div>
)}
                              <div ref={undebutedTableRef}`;

code = code.replace(undebutedBlockClose, undebutedBlockCloseNew);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed block visibility.');
