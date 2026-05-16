import { ExportToolbar } from "../../ui/ExportToolbar";
import React from 'react';
import { BarChart3, ChevronDown, Copy, Download, X, TrendingUp, Trophy, Activity, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Bar } from 'recharts';
import { cn } from '../../../lib/utils';
import { getVal } from '../../../lib/data-processing';
import { useTableScreenshot } from '../../../hooks/useTableScreenshot';
import { useDraftStats } from './hooks/useDraftStats';
import { Button } from "../../ui/button";

interface DraftRoiChartProps {
  files: any;
  leaderboard: any;
  draftDatosMonthFilter: string[];
  draftDatosCategoryFilter: string[];
  draftDatosTeamFilter: string[];
  draftSummarySort: { keys: string[]; order: "asc" | "desc" };
  setDraftSummarySort: React.Dispatch<React.SetStateAction<{keys: string[]; order: "asc" | "desc"}>>;
  draftChartRef: React.RefObject<HTMLDivElement>;
  isDraftSummaryExpanded: boolean;
  setIsDraftSummaryExpanded: (val: boolean) => void;
  playerOrderMap?: any;
  teamToPlayerMap?: any;
}

const CustomDraftTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 border border-neutral-200 shadow-lg rounded-xl w-64 ring-1 ring-black/5">
        <p className="font-bold text-neutral-900 border-b border-neutral-100 pb-2 mb-3">
          {data.equipo}
        </p>
        <div className="space-y-3">
          <div className="bg-green-50/50 p-2 rounded-lg border border-green-100/50">
            <p className="text-xs font-bold text-green-800 flex justify-between mb-1">
              <span>1º por ronda</span>
              <span className="font-black">
                {data.ganador} ({data.pctGanadores}%)
              </span>
            </p>
          </div>
          <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
            <p className="text-xs font-bold text-blue-800 flex justify-between mb-1">
              <span>Buenos (Top 2-5)</span>
              <span className="font-black">
                {data.bueno} ({data.pctBuenos}%)
              </span>
            </p>
          </div>
          <div className="bg-yellow-50/50 p-2 rounded-lg border border-yellow-100/50">
            <p className="text-xs font-bold text-yellow-800 flex justify-between mb-1">
              <span>Normales (Top 6-14)</span>
              <span className="font-black">
                {data.normal} ({data.pctNormales}%)
              </span>
            </p>
          </div>
          <div className="bg-orange-50/50 p-2 rounded-lg border border-orange-100/50">
            <p className="text-xs font-bold text-orange-800 flex justify-between mb-1">
              <span>Malos (Top 15+ o 0pts)</span>
              <span className="font-black">
                {data.malo} ({data.pctMalos}%)
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const DraftRoiChart: React.FC<DraftRoiChartProps> = ({
  files,
  leaderboard,
  draftDatosMonthFilter,
  draftDatosCategoryFilter,
  draftDatosTeamFilter,
  draftSummarySort,
  setDraftSummarySort,
  draftChartRef,
  isDraftSummaryExpanded,
  setIsDraftSummaryExpanded,
  playerOrderMap = {},
  teamToPlayerMap = {}
}) => {
  const { teamSummaries } = useDraftStats({
    files,
    leaderboard,
    draftDatosMonthFilter,
    draftDatosCategoryFilter,
    draftDatosTeamFilter,
  });

  const sortedSummaries = [...teamSummaries].sort((a, b) => {
    for (const key of draftSummarySort.keys) {
      const valA = a[key as keyof typeof a] || 0;
      const valB = b[key as keyof typeof b] || 0;
      if (valA !== valB) {
        return draftSummarySort.order === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    }
    return 0;
  });

  const chartData = sortedSummaries.map((s) => {
    const jugador = teamToPlayerMap[s.team] || s.team;
    const order = playerOrderMap[jugador];
    const equipoVisual = order ? `${s.team} [#${order}]` : s.team;
    return {
      equipo: equipoVisual,
      fullEquipo: s.team,
      ganador: s.pickGanador,
      bueno: s.buenosPicks,
      normal: s.normalesPicks,
      malo: s.malosPicks,
      nulo: s.sinPuntuar,
      totalPicks: s.totalPicks,
      pctGanadores: s.pctGanadores.toFixed(1),
      pctBuenos: s.pctBuenos.toFixed(1),
      pctNormales: s.pctNormales.toFixed(1),
      pctMalos: s.pctMalos.toFixed(1),
    };
  });

  const { handleCopyImage: copyRoiChartImage, handleDownloadImage: downloadRoiChartImage, isCopying: isRoiChartCopying } = useTableScreenshot(draftChartRef);

  return (
    <div
      className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm overflow-hidden"
      ref={draftChartRef as React.RefObject<HTMLDivElement>}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="min-w-0 pr-4">
          <h3 className="font-semibold text-lg text-neutral-900 flex items-center gap-2 min-w-0">
            <BarChart3 className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="truncate">Rentabilidad de Picks por Equipo</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-1 truncate">
            Eficiencia relativa según segmentación de rendimiento por ronda
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0 copy-button-ignore">
          <div className="flex items-center gap-1 bg-neutral-50 p-1 rounded-lg border border-neutral-100">
            <span className="text-[10px] text-neutral-400 font-bold px-2 uppercase tracking-wider">
              Ordenar por:
            </span>
            <details className="relative group">
              <summary className="text-xs bg-white border border-neutral-200 rounded-md px-3 py-1.5 outline-none font-medium flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span>Opciones ({draftSummarySort.keys.length})</span>
                <ChevronDown className="w-3 h-3" />
              </summary>
              <div className="absolute right-0 top-full mt-1 w-48 p-2 bg-white border border-neutral-200 rounded-xl shadow-xl z-[100] flex flex-col gap-1">
                {[
                  { id: "pctGanadores", label: "% Ganadores" },
                  { id: "pctBuenos", label: "% Buenos" },
                  { id: "pctMalos", label: "% Malos" },
                  { id: "pctSinPuntuar", label: "% Sin Puntos" },
                  { id: "totalPoints", label: "Puntos Totales" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      checked={draftSummarySort.keys.includes(opt.id)}
                      onChange={(e) => {
                        setDraftSummarySort((prev) => {
                          const keys = e.target.checked
                            ? [...prev.keys, opt.id]
                            : prev.keys.filter((k) => k !== opt.id);
                          return { ...prev, keys: keys.length ? keys : prev.keys };
                        });
                      }}
                    />
                    <span className="text-xs text-neutral-700 font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </details>
          </div>
          <ExportToolbar
            onCopyImage={() => copyRoiChartImage({
                fileName: "grafico_draft.png", scale: 3, style: { overflow: "visible", backgroundColor: "#ffffff" }
            })}
            isImageCopying={isRoiChartCopying}
            onDownloadImage={() => downloadRoiChartImage({
                fileName: `rentabilidad-picks-${new Date().toISOString().split("T")[0]}.png`, scale: 3, style: { overflow: "visible", backgroundColor: "#ffffff" }
            })}
          />
        </div>
      </div>
      <div className="h-[500px]">
        <div className="w-full overflow-x-auto pb-4 h-full">
          <div className="min-w-[800px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} stroke="#9ca3af" />
                <YAxis
                  dataKey="equipo"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={220}
                  stroke="#4b5563"
                  interval={0}
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={0} dy={4} textAnchor="end" fill="#4b5563" fontSize={11} fontWeight={600}>
                        {payload.value}
                      </text>
                    </g>
                  )}
                />
                <RechartsTooltip content={<CustomDraftTooltip />} cursor={{ fill: "#f8fafc", opacity: 0.5 }} />
                <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{ fontSize: "11px", paddingBottom: "20px", fontWeight: "500" }} />
                <Bar dataKey="ganador" stackId="a" fill="#15803d" name="1º" radius={[0, 0, 0, 0]} />
                <Bar dataKey="bueno" stackId="a" fill="#4ade80" name="Buenos (Top 2-5)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="normal" stackId="a" fill="#facc15" name="Normales (Top 6-14)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="malo" stackId="a" fill="#fb923c" name="Malos (Top 15+)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
