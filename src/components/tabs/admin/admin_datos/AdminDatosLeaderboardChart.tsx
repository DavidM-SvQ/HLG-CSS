import React from "react";
import { ResponsiveContainer, BarChart, Bar, LabelList, Cell, Tooltip, CartesianGrid, XAxis, YAxis } from "recharts";
import { UploadCloud } from "lucide-react";

export const AdminDatosLeaderboardChart = ({ leaderboard }: { leaderboard: any[] | null }) => {
  if (!leaderboard) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <UploadCloud className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h3 className="text-neutral-900 font-medium">Esperando datos</h3>
          <p className="text-neutral-500 text-sm max-w-sm mt-1">
            Sincroniza los archivos globales (o súbelos) y carga los
            resultados actuales para ver la clasificación.
          </p>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-500">
        No se encontraron puntos. Verifica que los nombres de ciclistas y
        carreras coincidan entre los archivos.
      </div>
    );
  }

  return (
    <div
      className="w-full"
      style={{
        height: Math.max(500, leaderboard.length * 40 + 60),
      }}
    >
      <div className="w-full overflow-x-auto pb-4 h-full">
        <div className="min-w-[800px] h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={leaderboard.map((p) => {
                const cyclistPointsMap: Record<
                  string,
                  { points: number; ronda: string }
                > = {};
                p?.detalles?.forEach((d: any) => {
                  if (!cyclistPointsMap[d.ciclista]) {
                    cyclistPointsMap[d.ciclista] = {
                      points: 0,
                      ronda: d.ronda || "99",
                    };
                  }
                  cyclistPointsMap[d.ciclista].points +=
                    d.puntosObtenidos;
                });
                const cyclists = Object.entries(
                  cyclistPointsMap,
                )
                  .map(([name, data]) => ({ name, ...data }))
                  .sort((a, b) =>
                    a.ronda.localeCompare(b.ronda),
                  );

                return {
                  ...p,
                  displayName: `${p.nombreEquipo} [#${p.orden}]`,
                  cyclists,
                };
              })}
              layout="vertical"
              margin={{
                top: 20,
                right: 60,
                left: 10,
                bottom: 20,
              }}
              barCategoryGap={12}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f1f5f9"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="displayName"
                type="category"
                width={160}
                tick={{
                  fontSize: 11,
                  fontWeight: 500,
                  fill: "#64748b",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as any;
                    return (
                      <div className="bg-white/95 backdrop-blur-sm border border-neutral-200 p-4 rounded-xl shadow-lg min-w-[240px]">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-xl drop-shadow-md border-2 border-white/50"
                            style={{ background: data.color }}
                          >
                            {data.rank}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 border-b border-neutral-100 pb-1 mb-1">
                              {data.displayName}
                            </p>
                            <p className="text-sm font-medium text-neutral-500">
                              {data.jugador}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                          <span className="text-neutral-500 font-medium text-sm">
                            Total
                          </span>
                          <span className="text-blue-600 font-bold text-lg">
                            {data.puntos}
                            <span className="text-xs text-blue-400 ml-1">
                              pts
                            </span>
                          </span>
                        </div>
                        {data.cyclists && (
                          <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
                            {data.cyclists.length > 0 ? (
                              data.cyclists.map((c: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-[11px] gap-3"
                                >
                                  <span className="text-neutral-500 font-medium truncate">
                                    <span className="text-neutral-400 mr-1.5 font-mono tabular-nums text-[9px]">
                                      #{c.ronda}
                                    </span>
                                    {c.name}
                                  </span>
                                  <span className="font-bold text-neutral-700 shrink-0">
                                    {c.points}
                                    <span className="text-[10px] font-normal text-neutral-400 ml-1">
                                      pts
                                    </span>
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-[11px] text-neutral-400 italic">
                                Sin puntos registrados
                              </div>
                            )}
                          </div>
                        )}
                        {(!data.cyclists || data.cyclists.length === 0) && (
                          <div className="mt-2 text-xs text-neutral-400 italic text-center">
                            Sin puntos registrados
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="puntos"
                fill="#3b82f6"
                radius={[0, 6, 6, 0]}
                barSize={26}
              >
                <LabelList
                  dataKey="puntos"
                  position="right"
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    fill: "#334155",
                  }}
                />
                {leaderboard.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0
                        ? "#3b82f6"
                        : index === 1
                          ? "#60a5fa"
                          : index === 2
                            ? "#93c5fd"
                            : "#cbd5e1"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
