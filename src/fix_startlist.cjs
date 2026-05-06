const fs = require('fs');

const file = 'src/components/tabs/StartlistView.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `                              {startlistSortCol === "puntos" &&
                                (startlistSortDir === "asc"
                                  ? "↑"
                                  : "↓")}
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredRows.map((r, i) => (
                          <tr
                            key={i}
                            className="group hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="px-3 py-2 font-medium text-neutral-800 truncate sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e5e5e5] group-hover:bg-blue-50/50" title={r.jugador}>
                              {r.jugador}
                            </td>
                            <td className="px-3 py-2 text-center text-neutral-400 font-mono text-[11px]">
                              {r.dorsal}
                            </td>
                            <td className="px-3 py-2 font-semibold text-neutral-900 truncate" title={r.ciclista}>
                              {r.ciclista}{" "}
                              {r.debut && (
                                <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded ml-1 font-bold uppercase tracking-wider relative -top-[1px]">
                                  Debut
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center truncate">
                               <span title={r.paisLetras}>{r.pais}</span>
                            </td>
                            <td className="px-3 py-2 text-center font-medium text-neutral-600 truncate" title={r.equipo}>
                              {r.equipo}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-[11px]">
                              {r.ronda}
                            </td>
                            <td className="px-3 py-2 text-center font-mono text-[11px]">
                              {r.dias}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-[11px] font-bold text-neutral-700">
                              {r.puntos > 0
                                ? formatNumberSpanish(r.puntos)
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div
                  className={cn(
                    "relative flex flex-col",
                    isStartlistTeamsTableExpanded &&
                      "fixed inset-4 z-50 bg-white shadow-2xl p-6 rounded-2xl overflow-y-auto max-h-none border border-neutral-200",
                  )}
                  ref={startlistTeamsTableRef}
                  style={
                    isStartlistTeamsTableExpanded ? { width: "auto" } : {}
                  }
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      Resumen Equipos
                    </h3>
                    <div className="flex gap-2 relative copy-button-ignore">
                      <ExportToolbar 
                        isExpanded={isStartlistTeamsTableExpanded} 
                        onExpand={() => setIsStartlistTeamsTableExpanded(!isStartlistTeamsTableExpanded)} 
                        onCopyImage={handleCopyStartlistTeams} 
                        isImageCopying={isStartlistTeamsCopying} 
                      />
                    </div>
                  </div>
`;

content = content.replace(/<thead className="text-\[11px\] text-neutral-500 uppercase bg-neutral-50\/80 sticky top-0 backdrop-blur-sm z-10">[\s\S]*?<th className="px-2 py-1 sticky left-0 bg-neutral-50 z-20 shadow-\[1px_0_0_0_#e5e5e5\]">Equipo<\/th>/, replacement + '\n                  <div className="table-responsive-wrapper overflow-auto w-full max-h-[600px]">\n                    <table className="w-full min-w-[400px] text-[13px] text-left">\n                      <thead className="text-[11px] text-neutral-500 uppercase bg-neutral-50/80 sticky top-0 backdrop-blur-sm z-10">\n                        <tr>\n                          <th className="px-2 py-1 sticky left-0 bg-neutral-50 z-20 shadow-[1px_0_0_0_#e5e5e5]">Equipo</th>');
fs.writeFileSync(file, content);
