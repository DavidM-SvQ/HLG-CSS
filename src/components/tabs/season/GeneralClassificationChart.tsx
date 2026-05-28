import React, { useContext } from "react";
import { BarChart3, X } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, LabelList } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { Button } from "../../ui/button";
import { ChartTooltip } from "../../ui/ChartTooltip";
import { ExportToolbar } from "../../ui/ExportToolbar";

export function GeneralClassificationChart() {
  const context = useContext(SeasonViewContext)!;
  const {
    cn,
    filteredLeaderboard,
    teamWinsCount
  } = context;

  const [isChartExpanded, setIsChartExpanded] = React.useState(false);
  const chartRef = React.useRef<HTMLDivElement>(null);

  const chartData = filteredLeaderboard.map((p, idx) => {
    const draftOrder = p.orden ? parseInt(p.orden) : 0;
    const currentPos = idx + 1;
    const diff = draftOrder - currentPos;
    return {
      ...p,
      displayName: `${p.nombreEquipo} [#${p.orden}]`,
      victorias: teamWinsCount[p.nombreEquipo] || 0,
      diff,
      pos: currentPos,
    };
  });

  return (
    <>
      <div
        ref={chartRef}
        className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm relative group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2 w-full sm:w-auto min-w-0">
            <BarChart3 className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="truncate">Clasificación General</span>
          </h3>
          <div className="copy-button-ignore">
            <ExportToolbar
              targetRef={chartRef}
              filename="clasificacion-general"
              isExpanded={false}
              onExpand={() => setIsChartExpanded(true)}
            />
          </div>
        </div>
        <div
          className="w-full"
          style={{
            height: Math.max(
              500,
              filteredLeaderboard.length * 35 + 60,
            ),
          }}
        >
          <div className="w-full h-full min-h-[300px]"><ResponsiveContainer width="100%" height="99%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 20,
                right: typeof window !== 'undefined' && window.innerWidth < 640 ? 25 : 50,
                left: typeof window !== 'undefined' && window.innerWidth < 640 ? 5 : 20,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f0f0f0"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                dataKey="displayName"
                type="category"
                width={typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : 150}
                interval={0}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const item = filteredLeaderboard?.find(
                    (p, idx) => {
                      const displayName = `${p.nombreEquipo} [#${p.orden}]`;
                      return displayName === payload.value;
                    },
                  );

                  let color = "#64748b"; // default
                  if (item) {
                    const idx =
                      filteredLeaderboard.indexOf(item);
                    const draftOrder = item.orden
                      ? parseInt(item.orden)
                      : 0;
                    const currentPos = idx + 1;
                    const diff = draftOrder - currentPos;
                    if (diff > 0)
                      color = "#16a34a"; // green-600
                    else if (diff < 0)
                      color = "#dc2626"; // red-600
                    else color = "#ca8a04"; // yellow-600
                  }

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={-10}
                        y={4}
                        textAnchor="end"
                        fill={color}
                        style={{
                          fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? "9px" : "11px",
                          fontWeight: 600,
                        }}
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                content={(props) => (
                  <ChartTooltip 
                    {...props} 
                    formatter={(value, name, item) => (
                      <div className="space-y-1">
                        <div className="flex justify-between gap-8">
                          <span className="text-neutral-500">Puntos:</span>
                          <span className="font-bold text-blue-600">{item.payload.puntos}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="text-neutral-500">Victorias:</span>
                          <span className="font-bold text-yellow-600">{item.payload.victorias}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="text-neutral-500">Dif con orden:</span>
                          <span className={cn(
                            "font-bold",
                            item.payload.diff > 0 ? "text-green-600" : item.payload.diff < 0 ? "text-red-600" : "text-yellow-600"
                          )}>
                            {item.payload.diff > 0 ? `+${item.payload.diff}` : item.payload.diff}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                )}
              />
              <Bar
                dataKey="puntos"
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              >
                {filteredLeaderboard.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0
                        ? "#fbbf24"
                        : index === 1
                          ? "#94a3b8"
                          : index === 2
                            ? "#fb923c"
                            : "#3b82f6"
                    }
                  />
                ))}
                <LabelList
                  dataKey="puntos"
                  position="right"
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    fill: "#64748b",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer></div>
        </div>
      </div>

      {isChartExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2 whitespace-nowrap">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Clasificación General
              </h3>
              <Button variant="outline"
                onClick={() => setIsChartExpanded(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div
                className="w-full"
                style={{
                  height: Math.max(
                    800,
                    filteredLeaderboard.length * 45 + 100,
                  ),
                }}
              >
                <div className="w-full h-full min-h-[300px]"><ResponsiveContainer width="100%" height="99%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: typeof window !== 'undefined' && window.innerWidth < 640 ? 30 : 80,
                      left: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 40,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 14 }}
                    />
                    <YAxis
                      dataKey="displayName"
                      type="category"
                      width={200}
                      interval={0}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const item =
                          filteredLeaderboard?.find(
                            (p, idx) => {
                              const displayName = `${p.nombreEquipo} [#${p.orden}]`;
                              return (
                                displayName ===
                                payload.value
                              );
                            },
                          );

                        let color = "#64748b";
                        if (item) {
                          const idx =
                            filteredLeaderboard.indexOf(
                              item,
                            );
                          const draftOrder = item.orden
                            ? parseInt(item.orden)
                            : 0;
                          const currentPos = idx + 1;
                          const diff =
                            draftOrder - currentPos;
                          if (diff > 0) color = "#16a34a";
                          else if (diff < 0)
                            color = "#dc2626";
                          else color = "#ca8a04";
                        }

                        return (
                          <g
                            transform={`translate(${x},${y})`}
                          >
                            <text
                              x={-15}
                              y={5}
                              textAnchor="end"
                              fill={color}
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                              }}
                            >
                              {payload.value}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      content={(props) => (
                        <ChartTooltip 
                          {...props} 
                          formatter={(value, name, item) => (
                            <div className="space-y-2">
                              <div className="flex justify-between gap-12 text-base">
                                <span className="text-neutral-500">Puntos:</span>
                                <span className="font-bold text-blue-600">{item.payload.puntos}</span>
                              </div>
                              <div className="flex justify-between gap-12 text-base">
                                <span className="text-neutral-500">Victorias:</span>
                                <span className="font-bold text-yellow-600">{item.payload.victorias}</span>
                              </div>
                              <div className="flex justify-between gap-12 text-base">
                                <span className="text-neutral-500">Dif con orden:</span>
                                <span className={cn(
                                  "font-bold",
                                  item.payload.diff > 0 ? "text-green-600" : item.payload.diff < 0 ? "text-red-600" : "text-yellow-600"
                                )}>
                                  {item.payload.diff > 0 ? `+${item.payload.diff}` : item.payload.diff}
                                </span>
                              </div>
                            </div>
                          )}
                        />
                      )}
                    />
                    <Bar
                      dataKey="puntos"
                      radius={[0, 6, 6, 0]}
                      isAnimationActive={false}
                    >
                      {filteredLeaderboard.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-expanded-${index}`}
                            fill={
                              index === 0
                                ? "#fbbf24"
                                : index === 1
                                  ? "#94a3b8"
                                  : index === 2
                                    ? "#fb923c"
                                    : "#3b82f6"
                            }
                          />
                        ),
                      )}
                      <LabelList
                        dataKey="puntos"
                        position="right"
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          fill: "#64748b",
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
