import { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, BarChart, Bar, Legend } from 'recharts';
import { cn } from '../../lib/utils';
import { ChartTooltip } from '../ui/ChartTooltip';
import { TestsIdeasTracker } from './tests/TestsIdeasTracker';
import { TestsCalendarHeatmap } from './tests/TestsCalendarHeatmap';
import { useDataStore } from '../../lib/stores/useDataStore';
import { useComputedStore } from '../../lib/stores/useComputedStore';
import { useTestsViewData } from './tests/hooks/useTestsViewData';

export function TestsView() {
  const { files } = useDataStore();
  const { 
    leaderboard,
    cyclistMetadata,
    playerTeamMap,
    cyclistRoundMap
  } = useComputedStore();
  
  const [dependencyTopCount, setDependencyTopCount] = useState<number>(3);
  
  const {
    draftData,
    teamDependencyData
  } = useTestsViewData(
    files, 
    cyclistMetadata, 
    cyclistRoundMap,
    dependencyTopCount
  );

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
          <p className="text-sm text-neutral-500 mt-1">Busca los "Robos" del draft (elegido muy tarde y con muchos puntos) y las "Decepciones" (elegido top 10 y con 0 puntos).</p>
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
                        formatter={(_value, _name, item) => (
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
                                {Math.round(isTop ? data.topPoints : data.restPoints)} pts ({typeof value === "number" ? value.toFixed(1) : value}%)
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
    </div>
  );
}

export default TestsView;
