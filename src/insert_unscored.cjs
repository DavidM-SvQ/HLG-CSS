const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const unscoredActionsStr = `
                                </div>
                              </div>
                              <div className="flex bg-neutral-50/50 border-b border-neutral-100 p-2 gap-2 justify-end items-center copy-button-ignore">
                                <button
                                  onClick={() => setIsUnscoredExpanded(!isUnscoredExpanded)}
                                  className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-sm"
                                  title={isUnscoredExpanded ? "Contraer tabla" : "Expandir tabla"}
                                >
                                  {isUnscoredExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                                <button
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
                                </button>
                              </div>
                              <div className="flex flex-col gap-2 p-4 copy-button-ignore border-b border-neutral-100 bg-neutral-50/30">
                                <div className="flex items-center justify-end">
                                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Copiar bloques de imagen:</span>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-1.5">
                                  {['p1', 'p2', 'p3', 'p4'].map((s, i) => {
                                    const isCopyingThis = isUnscoredCopying === s;
                                    return (
                                      <button 
                                        key={s}
                                        onClick={() => handleCopyUnscored(s as any)} 
                                        disabled={!!isUnscoredCopying}
                                        className={cn(
                                          "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                          isCopyingThis ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
                                          (isUnscoredCopying && !isCopyingThis) && "opacity-50 cursor-not-allowed"
                                        )}
                                      >
                                        {isCopyingThis ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {(i * 50) + 1}-{(i + 1) * 50}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div ref={unscoredTableRef} className={cn("overflow-x-auto overflow-y-auto bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin", isUnscoredExpanded ? "max-h-none" : "max-h-[1050px]")}>
`;

code = code.replace(
  `                                </div>
                              </div>
                              <div className="overflow-x-auto overflow-y-auto max-h-[900px] bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin">`,
  unscoredActionsStr
);


fs.writeFileSync('src/App.tsx', code);
console.log('Unscored logic inserted.');
