import React, { useContext } from "react";
import { useUrlState } from "../../../hooks/useUrlState";
import { Copy, Maximize2, UploadCloud, CheckCircle2, TrendingUp, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { useFilters } from "./useFilters";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { Button } from "../../ui/button";
import { ChartTooltip } from "../../ui/ChartTooltip";

export function MonthlyWinsEvolutionChart() {
  const context = useContext(SeasonViewContext)!;

  const {
    cn,
    filteredLeaderboard,
  } = context;

  const [isWinsEvolutionExpanded, setIsWinsEvolutionExpanded] = React.useState(false);
  const winsEvolutionRef = React.useRef<HTMLDivElement>(null);
  
  const [winsChartType, setWinsChartType] = useUrlState<string>("winsChartType", "acumulado");
  const [selectedEvolutionTeams, setSelectedEvolutionTeams] = useUrlState<string[]>("winsChartEvolutionTeams", []);
  
  const { handleCopyImage, handleDownloadImage, isCopying } = useTableScreenshot(winsEvolutionRef);

  const handleCopyWinsEvolution = async () => {
    await handleCopyImage({
      fileName: "export.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff"
    });
  };
  const handleDownloadWinsEvolution = async () => {
    await handleDownloadImage({
      fileName: "evolucion-victorias.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff"
    });
  };

  const { teamColors, monthlyWinsEvolutionData } = useFilters({
    ...context,
    winsChartType,
    selectedEvolutionTeams,
  });

  return (
    <>
      <div ref={winsEvolutionRef} className="mt-8 group relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 mb-6 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2 min-w-0">
              <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="truncate">Evolución Mensual de Victorias</span>
            </h3>
            <div className="copy-button-ignore flex items-center gap-2 shrink-0">
              <Button variant="outline"
                onClick={() => setIsWinsEvolutionExpanded(true)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                title="Ampliar gráfico"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon"
                onClick={handleCopyWinsEvolution}
                disabled={!!isCopying}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                  isCopying
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                )}
                title={isCopying ? "Copiado" : "Copiar gráfico como imagen"}
              >
                {isCopying ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm"
                onClick={handleDownloadWinsEvolution}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                title="Descargar gráfico como imagen"
              >
                <UploadCloud className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
          <div className="flex bg-neutral-100 p-1 rounded-lg">
            <Button variant="outline"
              onClick={() => setWinsChartType("acumulado")}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                winsChartType === "acumulado"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Acumulado
            </Button>
            <Button variant="outline"
              onClick={() => setWinsChartType("mensual")}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                winsChartType === "mensual"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Mensual
            </Button>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          {/* Team Selector */}
          <div className="mb-6 pb-6 border-b border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-neutral-700">Filtrar Equipos:</p>
              <div className="flex gap-2">
                <Button variant="outline"
                  onClick={() => setSelectedEvolutionTeams([])}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Mostrar Todos
                </Button>
                <Button variant="outline"
                  onClick={() =>
                    setSelectedEvolutionTeams(
                      filteredLeaderboard.map((t: any) => `${t.nombreEquipo} [#${t.orden}]`)
                    )
                  }
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                >
                  Seleccionar Todos
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredLeaderboard.map((team: any) => {
                const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                const isSelected =
                  selectedEvolutionTeams.length === 0 || selectedEvolutionTeams.includes(teamKey);
                const color = teamColors[teamKey];

                return (
                  <Button variant="outline"
                    key={teamKey}
                    onClick={() => {
                      if (selectedEvolutionTeams.includes(teamKey)) {
                        setSelectedEvolutionTeams(
                          selectedEvolutionTeams.filter((t: string) => t !== teamKey)
                        );
                      } else {
                        setSelectedEvolutionTeams([...selectedEvolutionTeams, teamKey]);
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      isSelected
                        ? "bg-white shadow-sm"
                        : "bg-neutral-50 text-neutral-400 border-transparent hover:bg-neutral-100"
                    )}
                    style={{
                      borderColor: isSelected ? color : "transparent",
                      color: isSelected ? color : undefined,
                    }}
                  >
                    {team.nombreEquipo}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="h-[400px] w-full">
            {monthlyWinsEvolutionData.length > 0 ? (
              <div className="w-full overflow-x-auto h-full">
                <div className="min-w-[800px] h-full">
                  <ResponsiveContainer width="100%" height="99%">
                    <LineChart
                      data={monthlyWinsEvolutionData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={(props) => <ChartTooltip {...props} />}
                      />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ fontSize: "12px", paddingTop: "30px" }}
                        iconType="circle"
                      />
                      {filteredLeaderboard.map((team: any) => {
                        const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                        if (
                          selectedEvolutionTeams.length > 0 &&
                          !selectedEvolutionTeams.includes(teamKey)
                        )
                          return null;

                        return (
                          <Line
                            key={teamKey}
                            type="monotone"
                            dataKey={teamKey}
                            stroke={teamColors[teamKey]}
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
                No hay datos de victorias para mostrar en los meses transcurridos.
              </div>
            )}
          </div>
        </div>
      </div>

      {isWinsEvolutionExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Evolución Mensual de Victorias ({winsChartType === "acumulado" ? "Acumulado" : "Mensual"})
              </h3>
              <Button variant="outline"
                onClick={() => setIsWinsEvolutionExpanded(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="h-[700px] w-full">
                <div className="w-full overflow-x-auto h-full">
                  <div className="min-w-[800px] h-full">
                    <ResponsiveContainer width="100%" height="99%">
                      <LineChart
                        data={monthlyWinsEvolutionData}
                        margin={{ top: 20, right: 40, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 14 }} />
                        <YAxis tick={{ fontSize: 14 }} allowDecimals={false} />
                        <Tooltip
                          content={(props) => <ChartTooltip {...props} />}
                        />
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          height={100}
                          iconType="circle"
                          wrapperStyle={{ paddingTop: "40px", paddingBottom: "0px", fontSize: "14px" }}
                        />
                        {filteredLeaderboard.map((team: any) => {
                          const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                          if (
                            selectedEvolutionTeams.length > 0 &&
                            !selectedEvolutionTeams.includes(teamKey)
                          )
                            return null;
                          return (
                            <Line
                              key={teamKey}
                              type="monotone"
                              dataKey={teamKey}
                              stroke={teamColors[teamKey]}
                              strokeWidth={4}
                              dot={{ r: 5, strokeWidth: 2 }}
                              activeDot={{ r: 8, strokeWidth: 0 }}
                              connectNulls
                            />
                          );
                        })}
                      </LineChart>
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
