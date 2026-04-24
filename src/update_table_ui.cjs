const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Unscored Actions Strip Text
const unscoredBtnOld = `                                <button
                                  onClick={() => handleCopyUnscored('full')}
                                  disabled={!!isUnscoredCopying}
                                  className={cn(
                                    "px-3 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                    isUnscoredCopying === 'full' ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
                                    (isUnscoredCopying && isUnscoredCopying !== 'full') && "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {isUnscoredCopying === 'full' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                  {isUnscoredCopying === 'full' ? "Copiando..." : "Copiar imagen"}
                                </button>
                                <button
                                  onClick={() => handleDownloadUnscored('full')}
                                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" /> Descargar
                                </button>
                                <button 
                                  onClick={handleCopyUnscoredText}
                                  disabled={isUnscoredTextCopying}
                                  className={cn(
                                    "px-3 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all",
                                    isUnscoredTextCopying ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                                  )}
                                >
                                  {isUnscoredTextCopying ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                  {isUnscoredTextCopying ? '¡Copiado!' : 'Copiar texto'}
                                </button>`;

const unscoredBtnNew = `                                <button
                                  onClick={() => handleCopyUnscored('full')}
                                  disabled={!!isUnscoredCopying}
                                  title="Copiar imagen"
                                  className={cn(
                                    "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                                    isUnscoredCopying === 'full' ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
                                    (isUnscoredCopying && isUnscoredCopying !== 'full') && "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {isUnscoredCopying === 'full' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleDownloadUnscored('full')}
                                  title="Descargar imagen"
                                  className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={handleCopyUnscoredText}
                                  disabled={isUnscoredTextCopying}
                                  title="Copiar texto"
                                  className={cn(
                                    "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all w-8",
                                    isUnscoredTextCopying ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                                  )}
                                >
                                  {isUnscoredTextCopying ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                </button>`;

code = code.replace(unscoredBtnOld, unscoredBtnNew);

// 2. Unscored dynamic blocks length logic
const unscoredBlockOld = `                                  {['p1', 'p2', 'p3', 'p4'].map((s, i) => {
                                    const isCopyingThis = isUnscoredCopying === s;
                                    return (
                                      <button 
                                        key={s}`;

const unscoredBlockNew = `                                  {Array.from({ length: Math.ceil(((() => {
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
                                  })()) / 50) }).map((_, i) => {
                                    const s = 'p' + (i + 1);
                                    const isCopyingThis = isUnscoredCopying === s;
                                    return (
                                      <button 
                                        key={s}`;

code = code.replace(unscoredBlockOld, unscoredBlockNew);


// 3. Undebuted Actions Strip Text
const undebutedBtnOld = `                                <button
                                  onClick={() => handleCopyUndebuted('full')}
                                  disabled={!!isUndebutedCopying}
                                  className={cn(
                                    "px-3 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                    isUndebutedCopying === 'full' ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
                                    (isUndebutedCopying && isUndebutedCopying !== 'full') && "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {isUndebutedCopying === 'full' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                  {isUndebutedCopying === 'full' ? "Copiando..." : "Copiar imagen"}
                                </button>
                                <button
                                  onClick={() => handleDownloadUndebuted('full')}
                                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" /> Descargar
                                </button>
                                <button 
                                  onClick={handleCopyUndebutedText}
                                  disabled={isUndebutedTextCopying}
                                  className={cn(
                                    "px-3 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all",
                                    isUndebutedTextCopying ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                                  )}
                                >
                                  {isUndebutedTextCopying ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                  {isUndebutedTextCopying ? '¡Copiado!' : 'Copiar texto'}
                                </button>`;

const undebutedBtnNew = `                                <button
                                  onClick={() => handleCopyUndebuted('full')}
                                  disabled={!!isUndebutedCopying}
                                  title="Copiar imagen"
                                  className={cn(
                                    "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-8",
                                    isUndebutedCopying === 'full' ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
                                    (isUndebutedCopying && isUndebutedCopying !== 'full') && "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {isUndebutedCopying === 'full' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleDownloadUndebuted('full')}
                                  title="Descargar imagen"
                                  className="px-2 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-md shadow-sm text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors w-8"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={handleCopyUndebutedText}
                                  disabled={isUndebutedTextCopying}
                                  title="Copiar texto"
                                  className={cn(
                                    "px-2 py-1.5 text-xs font-semibold rounded-md border shadow-sm flex items-center justify-center transition-all w-8",
                                    isUndebutedTextCopying ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                                  )}
                                >
                                  {isUndebutedTextCopying ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                </button>`;

code = code.replace(undebutedBtnOld, undebutedBtnNew);

// 4. Undebuted dynamic blocks length logic
const undebutedBlockOld = `                                  {['p1', 'p2'].map((s, i) => {
                                    const isCopyingThis = isUndebutedCopying === s;
                                    return (
                                      <button 
                                        key={s}`;

const undebutedBlockNew = `                                  {Array.from({ length: Math.ceil(((() => {
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
                                  })()) / 50) }).map((_, i) => {
                                    const s = 'p' + (i + 1);
                                    const isCopyingThis = isUndebutedCopying === s;
                                    return (
                                      <button 
                                        key={s}`;

code = code.replace(undebutedBlockOld, undebutedBlockNew);

// 5. Change max-h-[1050px] to max-h-[750px]
code = code.replaceAll('max-h-[1050px]', 'max-h-[750px]');

// 6. Scale for unscored copying: change from 1.5 to 0.9 for 'full'
code = code.replace(`scale: subset === 'full' ? 1.5 : 3,`, `scale: subset === 'full' ? 0.9 : 3,`);

fs.writeFileSync('src/App.tsx', code);
console.log('Done script.');
