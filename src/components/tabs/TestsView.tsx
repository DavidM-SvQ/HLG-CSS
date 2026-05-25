import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, BarChart, Bar, Legend } from 'recharts';
import { cn } from '../../lib/utils';
import { ChartTooltip } from '../ui/ChartTooltip';
import { TestsIdeasTracker } from './tests/TestsIdeasTracker';

import { TestsCalendarHeatmap } from './tests/TestsCalendarHeatmap';
import { EmptyState } from '../ui/EmptyState';
import { useDataStore } from '../../lib/stores/useDataStore';
import { useComputedStore } from '../../lib/stores/useComputedStore';
import { useTestsViewData } from './tests/hooks/useTestsViewData';


export function TestsView() {
  const { files } = useDataStore();
  const { 
    leaderboard,
    cyclistMetadata,
    playerOrderMap,
    playerTeamMap,
    cyclistRoundMap
  } = useComputedStore();
  
  const [dependencyTopCount, setDependencyTopCount] = useState<number>(3);
  const [teamA, setTeamA] = useState<string>("");
  const [teamB, setTeamB] = useState<string>("");
  
  const {
    draftData,
    teamDependencyData,
    trendingData,
    teamsList,
    h2hData
  } = useTestsViewData(
    files, 
    cyclistMetadata, 
    playerOrderMap, 
    playerTeamMap, 
    cyclistRoundMap,
    dependencyTopCount,
    teamA,
    teamB
  );

  React.useEffect(() => {
    if (teamsList.length >= 2 && !teamA && !teamB) {
      setTeamA(teamsList[0]);
      setTeamB(teamsList[1]);
    }
  }, [teamsList, teamA, teamB]);

  return (
    <div className="space-y-6">
      <TestsIdeasTracker />
      
      

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TestsCalendarHeatmap files={files} playerTeamMap={playerTeamMap} leaderboard={leaderboard} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
         <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="text-lg font-semibold text-neutral-900">
              Rendimiento Oculto (Draft Scouter/ROI)
            </h2>
            <p className="text-sm text-neutral-500 mt-1">Busca los s "Robos" del draft (elegido muy tarde y con muchos puntos) y las "Decepciones" (elegido top 10 y con 0 puntos).</p>
         </div>
         <div className="p-6">
            <div className="h-[600px] w-full">
              {draftData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis 
                      type="number" 
                      dataKey="pickOrder" 
                      name="Orden Draft" 
                      label={{ value: 'Orden de Draft', position: 'insideBottom', offset: -10 }} 
                      domain={['auto', 'auto']}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="puntos" 
                      name="Puntos" 
                      label={{ value: 'Puntos Totales', angle: -90, position: 'insideLeft' }} 
                    />
                    <ZAxis type="number" range={[50, 50]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={(props) => (
                        <ChartTooltip 
                          {...props}
                          formatter={(value, name, item) => (
                            <div className="mt-2 space-y-1 text-sm text-neutral-600">
                              <p><span className="font-medium">Orden Draft:</span> {item.payload.pickOrder}</p>
                              <p><span className="font-medium">Puntos Totales:</span> {Math.round(item.payload.puntos)}</p>
                            </div>
                          )}
                          labelFormatter={() => null}
                          title={props.payload?.[0]?.payload?.ciclista}
                        />
                      )}
                    />
                    <Scatter name="Ciclistas" data={draftData} fill="#3b82f6" fillOpacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-neutral-400 italic">No hay datos de elecciones cargados</div>
              )}
            </div>
         </div>
      </div>
      
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
         <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Dependencia Estrella vs. Bloque (Desigualdad)
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Porcentaje de puntos aportados por el Top N de ciclistas con más puntos en la temporada frente al resto del bloque.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
               <span className="text-sm font-semibold text-neutral-700 whitespace-nowrap">Top Estrellas:</span>
               <select 
                 value={dependencyTopCount}
                 onChange={(e) => setDependencyTopCount(Number(e.target.value))}
                 className="bg-white border border-neutral-200 text-neutral-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
               >
                 <option value={1}>Top 1</option>
                 <option value={3}>Top 3</option>
                 <option value={5}>Top 5</option>
               </select>
            </div>
         </div>
         <div className="p-6">
            <div className="h-[800px] w-full">
              {teamDependencyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={teamDependencyData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#e5e5e5" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis dataKey="teamName" type="category" width={140} tick={{fontSize: 12}} />
                    <Tooltip 
                      content={(props) => (
                        <ChartTooltip 
                          {...props}
                          formatter={(value, name, item) => {
                            const data = item.payload;
                            const isTop = name === "topPercent";
                            return (
                              <div className="space-y-1">
                                <p>
                                  <span className={cn("font-semibold", isTop ? "text-indigo-600" : "text-emerald-500")}>
                                    {isTop ? `Estrellas (Top ${dependencyTopCount}):` : "Resto del Bloque:"}
                                  </span>{" "}
                                  {Math.round(isTop ? data.topPoints : data.restPoints)} pts ({value.toFixed(1)}%)
                                </p>
                                {isTop && data.topNames && data.topNames.map((n: string, i: number) => (
                                  <p key={i} className="text-[10px] text-neutral-500 pl-2 leading-tight">- {n}</p>
                                ))}
                                {!isTop && (
                                  <p className="border-t border-neutral-100 mt-2 pt-2 font-bold text-neutral-800">
                                    Total: {Math.round(data.totalPoints)} pts
                                  </p>
                                )}
                              </div>
                            );
                          }}
                          labelFormatter={(label) => label}
                        />
                      )}
                    />
                    <Legend />
                    <Bar dataKey="topPercent" name={`Top ${dependencyTopCount} Estrellas`} stackId="a" fill="#4f46e5" />
                    <Bar dataKey="restPercent" name="Resto del Bloque" stackId="a" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-neutral-400 italic">No hay datos de elecciones cargados</div>
              )}
            </div>
         </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
          <h2 className="text-lg font-semibold text-neutral-900">
            Análisis de Estado de Forma (Trending Window)
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Los 5 ciclistas y equipos más en forma tomando exclusivamente los puntos conseguidos en las últimas 3 semanas ({trendingData.recentRaces.length} carreras recientes).
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4 border-b border-neutral-100 pb-2">Top 5 Ciclistas (Últimas 3 Semanas)</h3>
              <div className="space-y-3">
                {trendingData.cyclists.length > 0 ? trendingData.cyclists.map((c, i) => (
                  <div key={i} className="flex justify-between items-center bg-neutral-50 border border-neutral-100 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-rose-500 bg-rose-50 w-6 h-6 flex items-center justify-center rounded-full text-xs">{i+1}</span>
                      <span className="font-bold text-neutral-800">{c.name}</span>
                    </div>
                    <span className="font-bold bg-white px-2 py-1 rounded shadow-sm border border-neutral-200 text-neutral-700">{Math.round(c.points)} pts</span>
                  </div>
                )) : (
                  <EmptyState title="Sin ciclistas en forma" description="No hay datos suficientes recientes." />
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4 border-b border-neutral-100 pb-2">Top 5 Equipos (Últimas 3 Semanas)</h3>
              <div className="space-y-3">
                {trendingData.teams.length > 0 ? trendingData.teams.map((t, i) => (
                  <div key={i} className="flex justify-between items-center bg-neutral-50 border border-neutral-100 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-blue-500 bg-blue-50 w-6 h-6 flex items-center justify-center rounded-full text-xs">{i+1}</span>
                      <span className="font-bold text-neutral-800">{t.name}</span>
                    </div>
                    <span className="font-bold bg-white px-2 py-1 rounded shadow-sm border border-neutral-200 text-neutral-700">{Math.round(t.points)} pts</span>
                  </div>
                )) : (
                  <EmptyState title="Sin equipos en forma" description="No hay datos suficientes recientes." />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {h2hData && (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Súper-Comparador "Cara a Cara" (H2H)
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Compara a dos equipos de tu liga en métricas clave.
              </p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <select 
                value={teamA} 
                onChange={e => setTeamA(e.target.value)}
                className="bg-white border border-neutral-200 text-neutral-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 max-w-[200px]"
              >
                {teamsList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <span className="font-black text-neutral-400 italic">VS</span>
              <select 
                value={teamB} 
                onChange={e => setTeamB(e.target.value)}
                className="bg-white border border-neutral-200 text-neutral-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 max-w-[200px]"
              >
                {teamsList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
               {/* Team A header */}
               <div className="p-4 text-center bg-blue-50">
                 <h3 className="font-bold text-blue-900 text-lg">{h2hData.A.name}</h3>
               </div>
               {/* Center header */}
               <div className="p-4 text-center bg-neutral-100 border-l border-r border-neutral-200 flex items-center justify-center">
                 <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Métrica</span>
               </div>
               {/* Team B header */}
               <div className="p-4 text-center bg-rose-50">
                 <h3 className="font-bold text-rose-900 text-lg">{h2hData.B.name}</h3>
               </div>

               {/* Metric: Puntos */}
               <div className={`p-4 text-center text-lg font-black border-t border-neutral-200 ${h2hData.A.points >= h2hData.B.points ? 'text-blue-700' : 'text-neutral-500'}`}>
                 {Math.round(h2hData.A.points)}
               </div>
               <div className="p-4 text-center border-t border-neutral-200 border-l border-r bg-white font-medium text-neutral-600">
                 Puntos Totales
               </div>
               <div className={`p-4 text-center text-lg font-black border-t border-neutral-200 ${h2hData.B.points >= h2hData.A.points ? 'text-rose-700' : 'text-neutral-500'}`}>
                 {Math.round(h2hData.B.points)}
               </div>

               {/* Metric: Días competidos */}
               <div className={`p-4 text-center text-lg font-bold border-t border-neutral-200 ${h2hData.A.days >= h2hData.B.days ? 'text-blue-700' : 'text-neutral-500'}`}>
                 {h2hData.A.days}
               </div>
               <div className="p-4 text-center border-t border-neutral-200 border-l border-r bg-white font-medium text-neutral-600">
                 Días de Competición
               </div>
               <div className={`p-4 text-center text-lg font-bold border-t border-neutral-200 ${h2hData.B.days >= h2hData.A.days ? 'text-rose-700' : 'text-neutral-500'}`}>
                 {h2hData.B.days}
               </div>
               
               {/* Metric: Top 10s */}
               <div className={`p-4 text-center text-lg font-bold border-t border-neutral-200 ${h2hData.A.top10s >= h2hData.B.top10s ? 'text-blue-700' : 'text-neutral-500'}`}>
                 {h2hData.A.top10s}
               </div>
               <div className="p-4 text-center border-t border-neutral-200 border-l border-r bg-white font-medium text-neutral-600">
                 Veces en el Top 10
               </div>
               <div className={`p-4 text-center text-lg font-bold border-t border-neutral-200 ${h2hData.B.top10s >= h2hData.A.top10s ? 'text-rose-700' : 'text-neutral-500'}`}>
                 {h2hData.B.top10s}
               </div>

               {/* Metric: Puntos p/corredor */}
               <div className={`p-4 text-center text-lg font-bold border-t border-neutral-200 ${h2hData.A.ptsPerRide >= h2hData.B.ptsPerRide ? 'text-blue-700' : 'text-neutral-500'}`}>
                 {h2hData.A.ptsPerRide.toFixed(1)}
               </div>
               <div className="p-4 text-center border-t border-neutral-200 border-l border-r bg-white font-medium text-neutral-600">
                 Promedio Puntos / Ciclista
               </div>
               <div className={`p-4 text-center text-lg font-bold border-t border-neutral-200 ${h2hData.B.ptsPerRide >= h2hData.A.ptsPerRide ? 'text-rose-700' : 'text-neutral-500'}`}>
                 {h2hData.B.ptsPerRide.toFixed(1)}
               </div>

               {/* Metric: Edad media */}
               <div className={`p-4 text-center text-lg font-bold border-t border-neutral-200 ${h2hData.A.avgAge <= h2hData.B.avgAge ? 'text-blue-700' : 'text-neutral-500'}`} title="Entre más bajo, equipo más joven">
                 {h2hData.A.avgAge.toFixed(1)} años
               </div>
               <div className="p-4 text-center border-t border-neutral-200 border-l border-r bg-white font-medium text-neutral-600">
                 Media de Edad del Bloque
               </div>
               <div className={`p-4 text-center text-lg font-bold border-t border-neutral-200 ${h2hData.B.avgAge <= h2hData.A.avgAge ? 'text-rose-700' : 'text-neutral-500'}`} title="Entre más bajo, equipo más joven">
                 {h2hData.B.avgAge.toFixed(1)} años
               </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
