import React, { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from 'recharts';

interface TestsViewProps {
  cyclistMetadata: Record<string, { puntosTotales: number; carrerasDisputadas: number; diasCompeticion: number; victorias: number; pais: string; equipoBreve: string }>;
  playerOrderMap: Record<string, string>;
  playerTeamMap: Record<string, string>;
  cyclistRoundMap: Record<string, string>;
  files: any;
}

export function TestsView({ cyclistMetadata, playerOrderMap, files }: TestsViewProps) {
  
  const draftData = useMemo(() => {
    if (!files.elecciones.data) return [];
    
    // Create cyclist to draft order mapping
    const orderMap: Record<string, number> = {};
    let orderCounter = 1;
    
    // Try to get draft order
    try {
      // First assume there's a strict order column or we just use iteration order if sorted
      // In APP.tsx playerOrderMap is used, let's see how it's mapped.
      // Usually eleciones maps player name to round, here we want overall pick number
      files.elecciones.data.forEach((row: any) => {
        const ciclista = (row["Ciclista"] || "").toString().trim();
        if (ciclista) {
           orderMap[ciclista] = orderCounter++;
        }
      });
    } catch(e) {}
    
    const results = [];
    
    for (const [ciclista, pickOrder] of Object.entries(orderMap)) {
      const puntos = cyclistMetadata[ciclista]?.puntosTotales || 0;
      results.push({
        ciclista,
        pickOrder,
        puntos
      });
    }
    
    return results.sort((a,b) => a.pickOrder - b.pickOrder);
  }, [files.elecciones.data, cyclistMetadata]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-neutral-200 rounded-lg shadow-lg">
          <p className="font-bold text-neutral-800">{data.ciclista}</p>
          <div className="mt-2 space-y-1 text-sm text-neutral-600">
            <p><span className="font-medium">Orden Draft:</span> {data.pickOrder}</p>
            <p><span className="font-medium">Puntos Totales:</span> {Math.round(data.puntos)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
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
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Ciclistas" data={draftData} fill="#3b82f6" fillOpacity={0.6} />
                  </ScatterChart>
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
