import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const importRecharts = `import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, ComposedChart, Scatter, ScatterChart, ZAxis } from "recharts";\n`;

// Make sure Recharts is imported
if (!content.includes('import { BarChart')) {
  content = content.replace(/(import React, [^\n]+;\n)/, "$1" + importRecharts);
}

const pruebasCode = `
            {publicTab === "pruebas" && (
              <div className="space-y-8">
                <div className="bg-white border text-center border-neutral-200 rounded-xl p-6 shadow-sm mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">Pruebas y Análisis Visual</h2>
                  <p className="text-neutral-500">
                    Aquí se presentan diferentes sugerencias visuales sobre el rendimiento del draft.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Gráfico 1: Rentabilidad de Picks */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg text-neutral-900 mb-4">Rentabilidad de Picks por Equipo</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="equipo" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip cursor={{fill: 'transparent'}} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar dataKey="ganador" stackId="a" fill="#15803d" name="Picks Ganadores" />
                          <Bar dataKey="bueno" stackId="a" fill="#4ade80" name="Picks Buenos" />
                          <Bar dataKey="malo" stackId="a" fill="#fb923c" name="Picks Malos" />
                          <Bar dataKey="nulo" stackId="a" fill="#d4d4d8" name="Sin Puntuar" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-neutral-500 mt-4">
                      Sugerencia 1: Un gráfico de barras apilado para ver rápidamente qué mánager es más eficiente con sus selecciones, más allá de los puntos brutos.
                    </p>
                  </div>

                  {/* Gráfico 2: Curva de valor del Draft */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg text-neutral-900 mb-4">Curva de Valor del Draft (Media por ronda)</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="ronda" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip cursor={{fill: '#f4f4f5'}} />
                          <Line type="monotone" dataKey="media" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} name="Media Puntos" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-neutral-500 mt-4">
                      Sugerencia 2: Observar la caída de los puntos esperados a medida que avanzan las rondas permite detectar dónde está el "caos" del draft.
                    </p>
                  </div>

                  {/* Gráfico 3: ROI del Draft vs No Draft */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg text-neutral-900 mb-4">Puntos: Draft vs No Draft (Agentes Libres)</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[]} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis dataKey="categoria" type="category" fontSize={12} tickLine={false} axisLine={false} width={80} />
                          <RechartsTooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="puntos" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Puntos Totales" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-neutral-500 mt-4">
                      Sugerencia 3: Comparar el volumen de puntos generados por corredores del Draft inicial frente a los conseguidos por los repescados en el mercado.
                    </p>
                  </div>

                  {/* Gráfico 4: Puntos Totales por Equipo Breakdown */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg text-neutral-900 mb-4">Composición de Puntos Top de Equipo</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="equipo" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="topPick" stackId="1" stroke="#ec4899" fill="#fbcfe8" name="Top 3 Picks" />
                          <Area type="monotone" dataKey="resto" stackId="1" stroke="#64748b" fill="#e2e8f0" name="Resto de Picks" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-neutral-500 mt-4">
                      Sugerencia 4: Mostrar cuánto de los puntos de un equipo dependen de sus 3 mejores corredores vs el fondo de armario.
                    </p>
                  </div>

                  {/* Gráfico 5: Puntos vs Edad Scatter Plot */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm md:col-span-2">
                    <h3 className="font-semibold text-lg text-neutral-900 mb-4">Relación Puntos vs Días de Competición</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" dataKey="dias" name="Días de Competición" fontSize={12} />
                          <YAxis type="number" dataKey="puntos" name="Puntos" fontSize={12} />
                          <ZAxis type="number" range={[50, 400]} />
                          <RechartsTooltip cursor={{strokeDasharray: '3 3'}} />
                          <Scatter name="Ciclistas Draft" data={[]} fill="#3b82f6" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-neutral-500 mt-4">
                      Sugerencia 5: Un gráfico de dispersión para detectar a los ciclistas más eficientes (alta puntuación con pocos días, esquina superior izquierda) frente a los que más desgastan (muchos días pero pocos puntos, esquina inferior derecha).
                    </p>
                  </div>
                </div>
              </div>
            )}
`;

const insertIndex = content.indexOf('            {publicTab === "info" && (');
if (insertIndex !== -1) {
    const EndInfoPattern = /          <\/div>\s*\)\}\s*<\/main>/;
    const match = content.match(EndInfoPattern);
  
    if (match) {
        content = content.replace(EndInfoPattern, pruebasCode + "\n$&\n");
        fs.writeFileSync('src/App.tsx', content, 'utf-8');
        console.log("Successfully inserted Pruebas tab code.");
    } else {
        console.log("Could not find the end wrapper of main");
    }
} else {
    console.log("Could not find publicTab info");
}
