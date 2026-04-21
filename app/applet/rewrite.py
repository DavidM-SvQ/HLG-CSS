import sys

with open("src/App.tsx", "r") as f:
    code = f.read()

start_marker = "{cyclistsSubTab === 'draft' ? ("
start_idx = code.find(start_marker)

tbody_marker = """<tbody className="divide-y divide-neutral-100">
                                    {(() => {"""
tbody_idx = code.find(tbody_marker, start_idx)

logic_start_str = """const cyclistStats: Record<string, {"""
logic_idx = code.find(logic_start_str, tbody_idx)

logic_end_str = "return sortedStats.map((s, idx) => {"
end_idx = code.find(logic_end_str, logic_idx)

logic_block = code[logic_idx:end_idx]

# Remove logic from tbody
tbody_end_idx = code.find("})()}", end_idx) + 5
inside_return = code[end_idx:tbody_end_idx-5]

new_tbody = '<tbody className="divide-y divide-neutral-100">\n                                    {' + inside_return + '}'

# Replace tbody part
tbody_block_start = code.rfind('<tbody', 0, logic_idx)
code = code[:tbody_block_start] + new_tbody + code[tbody_end_idx:]

new_start = '''{cyclistsSubTab === 'draft' ? (() => {
                                      ''' + logic_block + '''
                                      const numBlocks = Math.ceil(sortedStats.length / 50);
                                      return (
                                        <div className="flex flex-col gap-4">
                                          {numBlocks > 1 && (
                                            <div className="flex flex-col gap-2 copy-button-ignore mt-8">
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
                                                      ].filter(bool => bool).join(' ')}
                                                    >
                                                      {isCopyingThis ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                      {label}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                          <div ref={topCyclistsDraftRef} className={['bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm group relative', isTopCyclistsDraftExpanded ? 'fixed inset-4 z-50 overflow-y-auto max-h-none' : ''].filter(bool => bool).join(' ')}>
'''

code = code.replace(start_marker, new_start)

# Add expanding buttons over the header
target_header = """<h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-orange-600" />
                                    Top Ciclistas por Puntuación
                                  </h3>"""
buttons_html = """<div className="flex items-center gap-4">
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
                                      <span className="sr-only sm:not-sr-only">Texto</span>
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
                                )}"""

code = code.replace(target_header, buttons_html)

# Now fix the end wrapper
end_match = """                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        ) : cyclistsSubTab === 'no-draft' ? ("""

replace_end = """                                  </tbody>
                                </table>
                              </div>
                            </div>
                            </div>
                          );
                        })() : cyclistsSubTab === 'no-draft' ? ("""

code = code.replace(end_match, replace_end)

# Let's also add the "Todos" filter.
todos_replace = """                                    <button 
                                      onClick={() => setTopCyclistsLimit(100)}
                                      className={cn(
                                        "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                        topCyclistsLimit === 100 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                      )}
                                    >
                                      Top 100
                                    </button>"""
todos_new = todos_replace + """
                                    <button 
                                      onClick={() => setTopCyclistsLimit(9999)}
                                      className={cn(
                                        "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                        topCyclistsLimit === 9999 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                      )}
                                    >
                                      Todos
                                    </button>"""
code = code.replace(todos_replace, todos_new)
code = code.replace("const sortedStats = allStats.slice(0, topCyclistsLimit);", "const sortedStats = topCyclistsLimit === 9999 ? allStats : allStats.slice(0, topCyclistsLimit);")
code = code.replace('className="hover:bg-neutral-50 transition-colors"', 'className="hover:bg-neutral-50 transition-colors top-cyclists-row"')

with open("src/App.tsx", "w") as f:
    f.write(code)

print("Done python!")
