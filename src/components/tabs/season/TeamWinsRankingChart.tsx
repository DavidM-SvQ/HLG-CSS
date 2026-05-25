import React, { useContext } from "react";
import { Copy, Maximize2, UploadCloud, CheckCircle2, Trophy, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { useFilters } from "./useFilters";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { Button } from "../../ui/button";
import { ChartTooltip } from "../../ui/ChartTooltip";

export function TeamWinsRankingChart() {
  const context = useContext(SeasonViewContext)!;

  const {
    cn,
  } = context;

  const [isWinsRankingExpanded, setIsWinsRankingExpanded] = React.useState(false);
  const winsRankingRef = React.useRef<HTMLDivElement>(null);
  
  const { handleCopyImage: copyWinsRankingImage, handleDownloadImage: downloadWinsRankingImage, isCopying: isWinsRankingCopying } = useTableScreenshot(winsRankingRef);

  const handleCopyWinsRanking = async () => {
    await copyWinsRankingImage({ fileName: "export.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
  };
  const handleDownloadWinsRanking = async () => {
    await downloadWinsRankingImage({ fileName: "ranking-victorias.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
  };

  const { teamWinsRankingData } = useFilters(context);
  const maxChartWins = teamWinsRankingData.length > 0 ? teamWinsRankingData[0].wins : 0;

  return (
    <>
      <div
        ref={winsRankingRef}
        className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm group relative"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2 min-w-0">
            <Trophy className="w-5 h-5 text-yellow-500 shrink-0" />
            <span className="truncate">Ranking de Victorias por Equipo</span>
          </h3>
          <div className="copy-button-ignore flex items-center gap-2 shrink-0">
            <Button variant="outline"
              onClick={() => setIsWinsRankingExpanded(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
              title="Ampliar gráfico"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon"
              onClick={handleCopyWinsRanking}
              disabled={isWinsRankingCopying}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                isWinsRankingCopying
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
              )}
              title={isWinsRankingCopying ? "Copiado" : "Copiar gráfico como imagen"}
            >
              {isWinsRankingCopying ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm"
              onClick={handleDownloadWinsRanking}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
              title="Descargar gráfico como imagen"
            >
              <UploadCloud className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </div>
        <div className="h-[500px] w-full mt-4">
          <div className="w-full overflow-x-auto h-full min-h-[300px]">
            <div className="min-w-[800px] h-full">
              <ResponsiveContainer width="100%" height="99%">
                <BarChart
                  data={teamWinsRankingData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} interval={0} />
                  <Tooltip
                    cursor={{ fill: "#f5f5f5" }}
                    content={(props) => <ChartTooltip {...props} />}
                  />
                  <Bar dataKey="wins" radius={[0, 4, 4, 0]} barSize={24}>
                    {teamWinsRankingData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.wins > 0 && entry.wins === maxChartWins ? "#fbbf24" : "#3b82f6"} />
                    ))}
                    <LabelList dataKey="wins" position="right" fill="#737373" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {isWinsRankingExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Ranking de Victorias por Equipo
              </h3>
              <Button variant="outline"
                onClick={() => setIsWinsRankingExpanded(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="h-[700px] w-full">
                <div className="w-full overflow-x-auto h-full min-h-[300px]">
                  <div className="min-w-[800px] h-full">
                    <ResponsiveContainer width="100%" height="99%">
                      <BarChart
                        data={teamWinsRankingData}
                        layout="vertical"
                        margin={{ top: 20, right: 60, left: 40, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 14, fontWeight: 600, fill: "#404040" }} />
                        <Tooltip cursor={{ fill: "#f8fafc" }} content={(props) => <ChartTooltip {...props} />} />
                        <Bar dataKey="wins" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={40}>
                          <LabelList dataKey="wins" position="right" style={{ fill: "#1d4ed8", fontWeight: 800, fontSize: 16 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
