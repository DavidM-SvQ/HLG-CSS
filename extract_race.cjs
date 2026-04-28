const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');

const targetStart = '{publicTab === "race" && (';
let startIdx = lines.findIndex(l => l.includes(targetStart));

const targetEnd = '{publicTab === "team" && (';
const nextBlockIdx = lines.findIndex(l => l.includes(targetEnd));

let endIdx = nextBlockIdx - 1;
while(lines[endIdx].trim() === '') endIdx--;

const innerLines = lines.slice(startIdx + 1, endIdx);

const telegramUI = `
                        {isAdminReport && rankedTeams && raceCyclists && (
                          <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 mt-8 mb-12">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                              <ClipboardList className="w-5 h-5 text-blue-500" />
                              Reporte Telegram
                            </h3>
                            <textarea
                              readOnly
                              value={
\`🏁 *REPORTE DE CARRERA: \${selectedRace}* 🏁

🏆 *CLÁS. POR EQUIPOS*
\${rankedTeams.filter(t => t.totalPoints > 0).slice(0, 5).map(t => \`\${t.pos}º \${t.nombreEquipo} [\${t.totalPoints} pts]\`).join('\\n')}

🚴 *TOP CICLISTAS*
\${raceCyclists.slice(0, 5).map((c, i) => \`\${i + 1}º \${c.ciclista} (\${c.jugador}) - \${c.puntos} pts\`).join('\\n')}
\`
                              }
                              className="w-full h-48 text-sm font-mono p-4 border rounded-lg mb-4 bg-white"
                            />
                            <div className="flex gap-4">
                              <button
                                onClick={(e) => {
                                  // @ts-ignore
                                  navigator.clipboard.writeText((e.target.parentElement.previousElementSibling).value);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium transition-colors"
                              >
                                <ClipboardList className="w-4 h-4" /> Copiar para Telegram
                              </button>
                            </div>

                            <div className="mt-8 border-t border-neutral-200 pt-6">
                              <h4 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-500" /> Gráfico de Puntos
                              </h4>
                              <div className="h-64 border rounded-lg bg-white p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={rankedTeams.filter(t => t.totalPoints > 0)}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                      <XAxis dataKey="nombreEquipo" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                      <YAxis tick={{ fontSize: 11 }} />
                                      <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                      <Bar dataKey="totalPoints" fill="#3b82f6" name="Puntos" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        )}
`;

const spaceY10Line = innerLines.findIndex(l => l.includes('<div className="space-y-10">'));
if (spaceY10Line !== -1) {
    innerLines.splice(spaceY10Line + 1, 0, telegramUI);
}

const renderRaceViewCode = `  const renderRaceView = (isAdminReport: boolean = false) => {
    return (
` + innerLines.join('\n') + `
    );
  };
`;

const appReturnLineIdx = lines.findIndex(l => l.startsWith('  return ('));
lines.splice(appReturnLineIdx, 0, renderRaceViewCode);

startIdx = lines.findIndex(l => l.includes(targetStart));
let testEndIdx = lines.findIndex(l => l.includes(targetEnd)) - 1;
while(lines[testEndIdx].trim() === '') testEndIdx--;
lines.splice(startIdx, testEndIdx - startIdx + 1, '            {publicTab === "race" && renderRaceView(false)}');

const adminStartIdx = lines.findIndex(l => l.includes('{adminTab === "reporte-carrera" && ('));
// Hardcode the length to replace exactly the old block.
lines.splice(adminStartIdx, 14, '            {adminTab === "reporte-carrera" && renderRaceView(true)}');

fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log("Successfully extracted renderRaceView");
