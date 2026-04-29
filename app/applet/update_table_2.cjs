const fs = require('fs');

const replacement = `                  <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50">
                    <tr>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-2 py-1.5 font-bold whitespace-nowrap border-b border-neutral-100">Pos</th>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-2 py-1.5 font-bold whitespace-nowrap border-b border-neutral-100">Equipo</th>
                      <th className="sticky top-0 z-30 bg-neutral-50 px-2 py-1.5 font-bold whitespace-nowrap border-b border-neutral-100 text-right w-24">Puntos totales</th>
                      {availableMonths.map((mIdx: number) => (
                        <th key={mIdx} className="sticky top-0 z-30 bg-neutral-50 px-2 py-1.5 font-bold whitespace-nowrap border-b border-neutral-100 text-right w-20">
                          {monthNames[mIdx]}
                        </th>
                      ))}
                      <th className="sticky top-0 z-30 bg-neutral-50 px-2 py-1.5 font-bold whitespace-nowrap border-b border-neutral-100 text-center w-24">Meses ganados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(() => {
                      const maxs: Record<number, number> = {};
                      const mins: Record<number, number> = {};
                      
                      // First calculate maxs and mins considering only positive points for counting max? No, max of all points. min of all points.
                      availableMonths.forEach((mIdx: number) => {
                          const allPoints = monthReportData.topTeams.map((t: any) => t.monthlyPoints[mIdx] || 0);
                          maxs[mIdx] = allPoints.length > 0 ? Math.max(...allPoints) : 0;
                          mins[mIdx] = allPoints.length > 0 ? Math.min(...allPoints) : 0;
                      });

                      return monthReportData.topTeams.map((team, idx) => {
                        const posColor = team.currentPos === 1 ? "text-yellow-600 bg-yellow-50/50" : team.currentPos === 2 ? "text-neutral-500 bg-neutral-50/50" : team.currentPos === 3 ? "text-amber-700 bg-amber-50/50" : "text-neutral-400";
                        let mesesGanados = 0;
                        availableMonths.forEach((mIdx: number) => {
                            const pts = team.monthlyPoints[mIdx] || 0;
                            if (pts > 0 && pts === maxs[mIdx]) mesesGanados++;
                        });
                        return (
                          <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-2 py-1 whitespace-nowrap font-medium text-center relative max-w-[50px]">
                              <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold", posColor)}>
                                {team.currentPos}
                              </span>
                            </td>
                            <td className="px-2 py-1 font-semibold text-neutral-800 whitespace-nowrap">
                              {team.team} <span className="text-xs text-neutral-400 ml-1 font-normal">[#{team.originalPos}]</span>
                            </td>
                            <td className="px-2 py-1 text-right font-bold text-neutral-900 whitespace-nowrap">
                              {team.pts.toLocaleString()}
                            </td>
                            {availableMonths.map((mIdx: number) => {
                              const pts = team.monthlyPoints[mIdx] || 0;
                              const isMax = maxs[mIdx] > 0 && pts === maxs[mIdx];
                              const isMin = pts === mins[mIdx];
                              const bgColorStyles = isMax ? "bg-green-100 text-green-800 font-bold" : isMin ? "bg-red-100 text-red-800" : "text-neutral-700 font-medium";
                              return (
                                <td key={mIdx} className={cn("px-2 py-1 text-right whitespace-nowrap", bgColorStyles)}>
                                  {pts > 0 ? pts.toLocaleString() : "-"}
                                </td>
                              );
                            })}
                            <td className="px-2 py-1 text-center font-bold text-neutral-900 whitespace-nowrap">
                              {mesesGanados}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>`;

let code = fs.readFileSync('src/SeasonReportView.tsx', 'utf8');

const theadStart = code.indexOf('<thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50">');
const tbodyStart = code.indexOf('<tbody className="divide-y divide-neutral-100">', theadStart);
const tbodyEnd = code.indexOf('</tbody>', tbodyStart) + 8; // '</tbody>'.length

if(theadStart !== -1 && tbodyStart !== -1 && tbodyEnd !== -1) {
   const before = code.substring(0, theadStart);
   const after = code.substring(tbodyEnd);
   code = before + replacement + after;
   fs.writeFileSync('src/SeasonReportView.tsx', code);
   console.log('Replaced successfully');
} else {
   console.log('Could not find start/end bounds', { theadStart, tbodyStart, tbodyEnd });
}
