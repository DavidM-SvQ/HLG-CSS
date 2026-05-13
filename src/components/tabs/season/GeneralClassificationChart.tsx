import React, { useContext } from "react";
import { Maximize2, Copy, CheckCircle2, UploadCloud, BarChart3, X } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, LabelList } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";

export function GeneralClassificationChart() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const {
    cn,
    filteredLeaderboard,
    teamWinsCount
  } = context;

  const [isChartExpanded, setIsChartExpanded] = React.useState(false);
  const chartRef = React.useRef<HTMLDivElement>(null);
  
  const { handleCopyImage: copyChartImage, handleDownloadImage: downloadChartImage, isCopying } = useTableScreenshot(chartRef);

  const handleCopyChart = async () => {
    await copyChartImage({ fileName: "export.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
  };
  const handleDownloadChart = async () => {
    await downloadChartImage({ fileName: "clasificacion-general.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
  };

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
          <div className="copy-button-ignore flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsChartExpanded(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
              title="Ampliar gráfico"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyChart}
              disabled={isCopying}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                isCopying
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100",
              )}
              title={
                isCopying
                  ? "Copiado"
                  : "Copiar gráfico como imagen"
              }
            >
              {isCopying ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleDownloadChart}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
              title="Descargar gráfico como imagen"
            >
              <UploadCloud className="w-4 h-4 rotate-180" />
            </button>
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
          <div className="w-full overflow-x-auto h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="99%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 20,
                right: 50,
                left: 20,
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
                width={150}
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
                          fontSize: "11px",
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
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 border border-neutral-200 rounded-xl shadow-xl">
                        <p className="font-bold text-neutral-900 mb-2">
                          {data.displayName}
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between gap-8">
                            <span className="text-neutral-500">
                              Puntos:
                            </span>
                            <span className="font-bold text-blue-600">
                              {data.puntos}
                            </span>
                          </div>
                          <div className="flex justify-between gap-8">
                            <span className="text-neutral-500">
                              Victorias:
                            </span>
                            <span className="font-bold text-yellow-600">
                              {data.victorias}
                            </span>
                          </div>
                          <div className="flex justify-between gap-8">
                            <span className="text-neutral-500">
                              Dif con orden:
                            </span>
                            <span
                              className={cn(
                                "font-bold",
                                data.diff > 0
                                  ? "text-green-600"
                                  : data.diff < 0
                                    ? "text-red-600"
                                    : "text-yellow-600",
                              )}
                            >
                              {data.diff > 0
                                ? `+${data.diff}`
                                : data.diff}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
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
          </ResponsiveContainer></div></div>
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
              <button
                onClick={() => setIsChartExpanded(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
              >
                <X className="w-6 h-6" />
              </button>
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
                <div className="w-full overflow-x-auto h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="99%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 80,
                      left: 40,
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
                      content={({ active, payload }) => {
                        if (
                          active &&
                          payload &&
                          payload.length
                        ) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-5 border border-neutral-200 rounded-xl shadow-2xl">
                              <p className="font-bold text-neutral-900 text-lg mb-3">
                                {data.displayName}
                              </p>
                              <div className="space-y-2 text-base">
                                <div className="flex justify-between gap-12">
                                  <span className="text-neutral-500">
                                    Puntos:
                                  </span>
                                  <span className="font-bold text-blue-600">
                                    {data.puntos}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-12">
                                  <span className="text-neutral-500">
                                    Victorias:
                                  </span>
                                  <span className="font-bold text-yellow-600">
                                    {data.victorias}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-12">
                                  <span className="text-neutral-500">
                                    Dif con orden:
                                  </span>
                                  <span
                                    className={cn(
                                      "font-bold",
                                      data.diff > 0
                                        ? "text-green-600"
                                        : data.diff < 0
                                          ? "text-red-600"
                                          : "text-yellow-600",
                                    )}
                                  >
                                    {data.diff > 0
                                      ? `+${data.diff}`
                                      : data.diff}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
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
                </ResponsiveContainer></div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
