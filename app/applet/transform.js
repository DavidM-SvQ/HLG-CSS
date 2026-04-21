const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// The marker where we want to insert the logic
const startMarker = `{cyclistsSubTab === 'draft' ? (
                            <>
                              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">`;

// The tbody marker
const tbodyMarker = `<tbody className="divide-y divide-neutral-100">
                                    {(() => {`;

// First, extract the logic.
// The logic starts right after "const cyclistStats" and ends before "return sortedStats.map"
const logicStart = code.indexOf('const cyclistStats: Record<string, {');
if (logicStart === -1) throw new Error('Could not find logic start');

// Find where "return sortedStats.map" starts
const logicEnd = code.indexOf('return sortedStats.map((s, idx) => {', logicStart);
if (logicEnd === -1) throw new Error('Could not find logic end');

const logicBlock = code.substring(logicStart, logicEnd);

// Now, remove the logic from tbody
const tbodyEnd = code.indexOf('})()}', logicEnd);

const insideTbodyReturn = code.substring(logicEnd, tbodyEnd);

// Create the new tbody content
const newTbody = `<tbody className="divide-y divide-neutral-100">
                                    {` + insideTbodyReturn + `}`;

// Replace the old tbody with the new one
const tbodyBlockStart = code.lastIndexOf('<tbody', logicStart);
const tbodyBlockEnd = tbodyEnd + 5; // "})()}".length

code = code.substring(0, tbodyBlockStart) + newTbody + code.substring(tbodyBlockEnd);

// Now insert the logic at the start.
const newStart = `{cyclistsSubTab === 'draft' ? (() => {
${logicBlock}                            
                            const numBlocks = Math.ceil(sortedStats.length / 50);

                            return (
                              <div className="flex flex-col gap-4">
                                {numBlocks > 1 && (
                                  <div className="flex flex-col gap-2 copy-button-ignore">
                                    <div className="flex items-center justify-end">
                                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Copiar bloques de imagen ({sortedStats.length} ciclistas):</span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                                      {Array.from({ length: numBlocks }).map((_, i) => {
                                        const s = 'p' + (i + 1);
                                        const start = i * 50 + 1;
                                        const end = Math.min((i + 1) * 50, sortedStats.length);
                                        const label = start + '-' + end;
                                        const isCopyingThis = isTopCyclistsDraftCopying === s;
                                        return (
                                          <button 
                                            key={s}
                                            onClick={() => handleCopyTopCyclistsDraft(s as any)} 
                                            disabled={!!isTopCyclistsDraftCopying}
                                            className={['px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all',
                                              isCopyingThis ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900',
                                              (isTopCyclistsDraftCopying && !isCopyingThis) ? 'opacity-50 cursor-not-allowed' : ''
                                            ].filter(Boolean).join(' ')}
                                          >
                                            {isCopyingThis ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              <div ref={topCyclistsDraftRef} className={['bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm group relative', isTopCyclistsDraftExpanded ? 'fixed inset-4 z-50 overflow-y-auto max-h-none' : ''].filter(Boolean).join(' ')}>
`;

code = code.replace(startMarker, newStart);

// We need to also add the main copy buttons to the header!
// We find `<h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">` inside that block
// and add the buttons.

// Let's do string replacement for the buttons:
const targetHeader = `<h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-orange-600" />
                                    Top Ciclistas por Puntuación
                                  </h3>`;
const buttonsHtml = `<div className="flex items-center gap-4">
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-orange-600" />
                                    Top Ciclistas por Puntuación
                                  </h3>
                                  <div className="copy-button-ignore flex items-center gap-2">
                                    <button
                                      onClick={() => setIsTopCyclistsDraftExpanded(true)}
                                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                      title="Ampliar tabla"
                                    >
                                      <Maximize2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={handleCopyTopCyclistsDraftText}
                                      disabled={isTopCyclistsDraftTextCopying}
                                      className={['px-2 py-1.5 text-xs font-semibold rounded-lg border shadow-sm flex items-center gap-1.5 transition-all',
                                        isTopCyclistsDraftTextCopying ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                                      ].filter(Boolean).join(' ')}
                                      title="Copiar texto de la tabla"
                                    >
                                      {isTopCyclistsDraftTextCopying ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                      Texto
                                    </button>
                                    <button
                                      onClick={() => handleCopyTopCyclistsDraft('full')}
                                      disabled={!!isTopCyclistsDraftCopying}
                                      className={['flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm border',
                                        isTopCyclistsDraftCopying === 'full' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                                      ].filter(Boolean).join(' ')}
                                      title="Copiar tabla completa como imagen"
                                    >
                                      {isTopCyclistsDraftCopying === 'full' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => handleDownloadTopCyclistsDraft('full')}
                                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                      title="Descargar tabla completa como imagen"
                                    >
                                      <UploadCloud className="w-4 h-4 rotate-180" />
                                    </button>
                                  </div>
                                </div>
                                {isTopCyclistsDraftExpanded && (
                                  <button onClick={() => setIsTopCyclistsDraftExpanded(false)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md z-50 copy-button-ignore hover:bg-neutral-100">
                                    <X className="w-5 h-5" />
                                  </button>
                                )}`;

if (!code.includes(targetHeader)) throw new Error('Target header not found: ' + targetHeader);
code = code.replace(targetHeader, buttonsHtml);

// Wrap end with ')() :'
const endMatch = `                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        ) : cyclistsSubTab === 'no-draft' ? (`;

const replaceEnd = `                                  </tbody>
                                </table>
                              </div>
                            </div>
                            </div>
                          );
                        })() : cyclistsSubTab === 'no-draft' ? (`;

if (code.includes(endMatch)) {
  code = code.replace(endMatch, replaceEnd);
} else {
  // It's possible the indentation is slightly different.
  const endMatchFallbackStart = `                                </table>
                              </div>
                            </div>`;
  const endFallbackIndex = code.indexOf(endMatchFallbackStart, logicStart);
  if (endFallbackIndex === -1) throw new Error('End fallback not found');
  
  // Find ') : cyclistsSubTab'
  const nextConditionIndex = code.indexOf(") : cyclistsSubTab === 'no-draft'", endFallbackIndex);
  if (nextConditionIndex !== -1) {
    const stringToReplace = code.substring(endFallbackIndex, nextConditionIndex);
    const replaced = `                                </table>
                              </div>
                            </div>
                            </div>
                          );
                        }`;
    code = code.substring(0, endFallbackIndex) + replaced + code.substring(nextConditionIndex);
  } else {
    throw new Error('Next condition not found');
  }
}

fs.writeFileSync('src/App.tsx', code);
console.log('Done!');
