const fs = require('fs');

const replacement = `                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative mt-8" ref={ref13}>
              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 whitespace-nowrap">
                    <Grid className="w-5 h-5 text-indigo-600" />
                    Puntos por meses {monthsText ? \` [\${monthsText}]\` : ""}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5 whitespace-nowrap">
                    Puntos acumulados por cada equipo, desglosados mes a mes.
                  </p>
                </div>
                <ExportToolbar targetRef={ref13} filename="puntos-meses" />
              </div>
              <div className="overflow-x-auto flex justify-center bg-neutral-50/20 pb-8 relative mt-2 text-sm">
                <table className="w-auto min-w-[700px] text-sm text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-100 rounded-lg">
                  <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50">
                    <tr>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold whitespace-nowrap border-b border-neutral-100">Pos</th>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold whitespace-nowrap border-b border-neutral-100">Equipo</th>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold whitespace-nowrap border-b border-neutral-100 text-right w-24">Puntos totales</th>
                      {availableMonths.map((mIdx: number) => (
                        <th key={mIdx} className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold whitespace-nowrap border-b border-neutral-100 text-right w-20">
                          {monthNames[mIdx]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {monthReportData.topTeams.map((team, idx) => {
                      const posColor = team.currentPos === 1 ? "text-yellow-600 bg-yellow-50/50" : team.currentPos === 2 ? "text-neutral-500 bg-neutral-50/50" : team.currentPos === 3 ? "text-amber-700 bg-amber-50/50" : "text-neutral-400";
                      return (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-center relative max-w-[50px]">
                            <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold", posColor)}>
                              {team.currentPos}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-neutral-800 whitespace-nowrap">
                            {team.team}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-neutral-900 whitespace-nowrap">
                            {team.pts.toLocaleString()}
                          </td>
                          {availableMonths.map((mIdx: number) => {
                            const pts = team.monthlyPoints[mIdx] || 0;
                            return (
                              <td key={mIdx} className="px-4 py-3 text-right text-neutral-700 font-medium whitespace-nowrap">
                                {pts > 0 ? pts.toLocaleString() : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative mt-8" ref={ref2}>`;

let code = fs.readFileSync('src/SeasonReportView.tsx', 'utf8');

code = code.replace('const ref12 = React.useRef<HTMLDivElement>(null);', 'const ref12 = React.useRef<HTMLDivElement>(null);\n  const ref13 = React.useRef<HTMLDivElement>(null);');

const anchor = `                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative mt-8" ref={ref2}>`;

code = code.replace(anchor, replacement);
fs.writeFileSync('src/SeasonReportView.tsx', code);
console.log('done via JS file');
