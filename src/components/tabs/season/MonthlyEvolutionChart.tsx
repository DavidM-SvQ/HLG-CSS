import React, { useContext } from "react";
import { useUrlState } from "../../../hooks/useUrlState";
import { TrendingUp, Maximize2, Copy, CheckCircle2, UploadCloud, X } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Brush } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { Button } from "../../ui/button";
import { ChartTooltip } from "../../ui/ChartTooltip";

export function MonthlyEvolutionChart() {
  const context = useContext(SeasonViewContext);
  const [hoveredTeam, setHoveredTeam] = React.useState<string | null>(null);
  if (!context) return null;
  const {
    cn,
    filteredLeaderboard,
    LINE_COLORS,
  } = context;

  const [evolutionMode, setEvolutionMode] = useUrlState<string>("evolutionMode", "posiciones");
  const [evolutionTimeFilter, setEvolutionTimeFilter] = useUrlState<string>("evolutionTimeFilter", "all");
  const [isEvolutionChartExpanded, setIsEvolutionChartExpanded] = React.useState(false);
  const [selectedEvolutionTeams, setSelectedEvolutionTeams] = useUrlState<string[]>("evolutionTeamsFilter", []);
  const evolutionChartRef = React.useRef<HTMLDivElement>(null);
  
  const { handleCopyImage: copyEvolutionImage, handleDownloadImage: downloadEvolutionImage, isCopying: isEvolutionChartCopying } = useTableScreenshot(evolutionChartRef);

  const handleCopyEvolutionChart = async () => {
    await copyEvolutionImage({ fileName: "export.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
  };
  const handleDownloadEvolutionChart = async () => {
    await downloadEvolutionImage({ fileName: "evolucion-mensual.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
  };

  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const activeTeams = filteredLeaderboard?.filter(t => !t.nombreEquipo.toLowerCase().includes("no draft")) || [];

  let dataMaxMonthIdx = -1;
  let dataMaxWIdx = -1;

  activeTeams.forEach((team) => {
    team.detalles.forEach((d: any) => {
      if (!d.fecha) return;
      const parts = d.fecha.split("-");
      if (parts.length >= 3) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(monthIndex) && !isNaN(day)) {
          if (monthIndex > dataMaxMonthIdx) dataMaxMonthIdx = monthIndex;
          let weekIndex = 1;
          if (day > 7 && day <= 14) weekIndex = 2;
          else if (day > 14 && day <= 21) weekIndex = 3;
          else if (day > 21) weekIndex = 4;
          const wIdx = monthIndex * 4 + (weekIndex - 1);
          if (wIdx > dataMaxWIdx) dataMaxWIdx = wIdx;
        }
      }
    });
  });

  const currentMonthIdx = dataMaxMonthIdx >= 0 ? dataMaxMonthIdx : new Date().getMonth();
  const currentWIdx = dataMaxWIdx >= 0 ? dataMaxWIdx : new Date().getMonth() * 4 + 3;

  const teamColors: Record<string, string> = {};
  activeTeams.forEach((team, idx) => {
    const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
    if (idx === 0) teamColors[teamKey] = "#fbbf24"; // Gold
    else if (idx === 1) teamColors[teamKey] = "#94a3b8"; // Silver
    else if (idx === 2) teamColors[teamKey] = "#fb923c"; // Bronze
    else teamColors[teamKey] = LINE_COLORS[(idx - 3) % LINE_COLORS.length];
  });

  const getEvolutionData = () => {
    if (evolutionMode === "posiciones") {
      const weeks: string[] = [];
      for (let i = 0; i < 12; i++) {
        for (let w = 1; w <= 4; w++) {
          weeks.push(`${months[i]} S${w}`);
        }
      }
      
      const pointsByWeek = weeks.map(w => ({ month: w, scores: {} as Record<string, number> }));
      
      activeTeams.forEach(team => {
        const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
        let accumulated = 0;
        
        months.forEach((m, mIdx) => {
          for (let w = 1; w <= 4; w++) {
            const wIdx = mIdx * 4 + (w - 1);
            const weekPoints = team.detalles.reduce((sum: number, d: any) => {
              if (!d.fecha) return sum;
              const parts = d.fecha.split("-");
              if (parts.length < 3) return sum;
              const monthIndex = parseInt(parts[1], 10) - 1;
              const day = parseInt(parts[2], 10);
              if (isNaN(monthIndex) || isNaN(day)) return sum;

              let weekIndex = 1;
              if (day > 7 && day <= 14) weekIndex = 2;
              else if (day > 14 && day <= 21) weekIndex = 3;
              else if (day > 21) weekIndex = 4;

              if (monthIndex === mIdx && weekIndex === w) return sum + (typeof d.puntosObtenidos === 'number' ? d.puntosObtenidos : 0);
              return sum;
            }, 0);
            
            accumulated += weekPoints;
            pointsByWeek[wIdx].scores[teamKey] = accumulated;
          }
        });
      });

      const chartData: any[] = [];
      let started = false;

      pointsByWeek.forEach((weekData, wIdx) => {
        if (wIdx > currentWIdx) return;
        
        const hasPoints = Object.values(weekData.scores).some(val => val > 0);
        if (!hasPoints && !started) return;
        started = true;
        
        const teamsScoreArray = Object.entries(weekData.scores).map(([team, score]) => ({ team, score }));
        teamsScoreArray.sort((a, b) => b.score - a.score || a.team.localeCompare(b.team));
        
        const mIdx = Math.floor(wIdx / 4);
        const rankData: any = { month: weekData.month, mIdx };
        
        teamsScoreArray.forEach((ts, idx) => {
          rankData[ts.team] = idx + 1;
        });
        
        chartData.push(rankData);
      });

      return chartData.filter((w) => {
        if (evolutionTimeFilter !== "all") {
          if (evolutionTimeFilter.includes("-")) {
            const [start, end] = evolutionTimeFilter.split("-").map(Number);
            if (w.mIdx < start || w.mIdx > end) return false;
          } else {
            if (w.mIdx !== parseInt(evolutionTimeFilter)) return false;
          }
        }
        return true;
      });
    }

    if (evolutionMode === "semanal" || evolutionMode === "acumulado_semanal") {
      const weeks: string[] = [];
      for (let i = 0; i < 12; i++) {
        for (let w = 1; w <= 4; w++) {
          weeks.push(`${months[i]} S${w}`);
        }
      }
      const dataByWeek: any[] = weeks.map((w) => ({ month: w }));
      activeTeams.forEach((team) => {
        const teamKey = `${team.nombreEquipo} [#${team.orden}]`;

        let accumulated = 0;
        months.forEach((m, mIdx) => {
          for (let w = 1; w <= 4; w++) {
            const wIdx = mIdx * 4 + (w - 1);
            const weekPoints = team.detalles.reduce((sum, d) => {
              if (!d.fecha) return sum;
              const parts = d.fecha.split("-");
              if (parts.length < 3) return sum;
              const monthIndex = parseInt(parts[1], 10) - 1;
              const day = parseInt(parts[2], 10);
              if (isNaN(monthIndex) || isNaN(day)) return sum;

              let weekIndex = 1;
              if (day > 7 && day <= 14) weekIndex = 2;
              else if (day > 14 && day <= 21) weekIndex = 3;
              else if (day > 21) weekIndex = 4;

              if (monthIndex === mIdx && weekIndex === w)
                return sum + d.puntosObtenidos;
              return sum;
            }, 0);
            if (evolutionMode === "acumulado_semanal") {
              accumulated += weekPoints;
              dataByWeek[wIdx][teamKey] = accumulated;
            } else {
              dataByWeek[wIdx][teamKey] = weekPoints;
            }
          }
        });
      });

      const firstWeekWithData = dataByWeek.findIndex((w) =>
        Object.keys(w).some((key) => key !== "month" && w[key] > 0),
      );

      return dataByWeek.filter((w, wIdx) => {
        if (wIdx > currentWIdx) return false;
        if (firstWeekWithData === -1) return false;

        if (evolutionTimeFilter !== "all") {
          const mIdx = Math.floor(wIdx / 4);
          if (evolutionTimeFilter.includes("-")) {
            const [start, end] = evolutionTimeFilter.split("-").map(Number);
            if (mIdx < start || mIdx > end) return false;
          } else {
            if (mIdx !== parseInt(evolutionTimeFilter)) return false;
          }
          return true;
        }

        return wIdx >= firstWeekWithData;
      });
    }

    const dataByMonth: any[] = months.map((m) => ({
      month: m,
    }));

    activeTeams.forEach((team) => {
      const teamKey = `${team.nombreEquipo} [#${team.orden}]`;

      let accumulated = 0;

      months.forEach((m, mIdx) => {
        const monthPoints = team.detalles.reduce((sum, d) => {
          if (!d.fecha) return sum;
          const parts = d.fecha.split("-");
          if (parts.length < 3) return sum;
          const monthIndex = parseInt(parts[1], 10) - 1;
          if (monthIndex === mIdx) return sum + d.puntosObtenidos;
          return sum;
        }, 0);

        if (evolutionMode === "acumulado") {
          accumulated += monthPoints;
          dataByMonth[mIdx][teamKey] = accumulated;
        } else {
          dataByMonth[mIdx][teamKey] = monthPoints;
        }
      });
    });

    return dataByMonth.filter((m, idx) => {
      const hasData = Object.keys(m).some(
        (key) => key !== "month" && m[key] > 0,
      );
      return hasData && idx <= currentMonthIdx;
    });
  };

  const evolutionData = getEvolutionData();

  const EvolutionTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      // Sort by rank (value) if in positions mode, or by points desc otherwise
      const sorted = [...payload].sort((a, b) => 
        evolutionMode === "posiciones" ? a.value - b.value : b.value - a.value
      );
      
      return (
        <ChartTooltip 
          {...props} 
          payload={sorted}
          formatter={(value, name, p) => (
            <div className="flex items-center gap-2">
              {evolutionMode === "posiciones" && (
                <span className={cn(
                  "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shadow-sm border border-neutral-100",
                  p.value === 1 ? "bg-yellow-100 text-yellow-700" : 
                  p.value === 2 ? "bg-neutral-200 text-neutral-600" :
                  p.value === 3 ? "bg-orange-100 text-orange-700" :
                  "bg-white text-neutral-500"
                )}>
                  {p.value}
                </span>
              )}
              <span className={cn(
                "font-bold",
                hoveredTeam === p.dataKey ? "text-blue-600" : "text-neutral-900"
              )}>
                {evolutionMode === "posiciones" ? "" : value}
              </span>
            </div>
          )}
        />
      );
    }
    return null;
  };

  return (
    <>
      <div ref={evolutionChartRef} className="mt-12 group relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 mb-6 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2 min-w-0">
              <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="truncate">Evolución por fechas</span>
            </h3>
            <div className="copy-button-ignore flex items-center gap-2 shrink-0">
              <Button variant="outline"
                onClick={() => setIsEvolutionChartExpanded(true)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                title="Ampliar gráfico"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon"
                onClick={handleCopyEvolutionChart}
                disabled={isEvolutionChartCopying}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                  isEvolutionChartCopying
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100",
                )}
                title={
                  isEvolutionChartCopying
                    ? "Copiado"
                    : "Copiar gráfico como imagen"
                }
              >
                {isEvolutionChartCopying ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm"
                onClick={handleDownloadEvolutionChart}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                title="Descargar gráfico como imagen"
              >
                <UploadCloud className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-neutral-100 p-1 rounded-lg">
              <Button variant="outline"
                onClick={() => setEvolutionMode("posiciones")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  evolutionMode === "posiciones"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Posiciones
              </Button>
              <Button variant="outline"
                onClick={() => setEvolutionMode("acumulado")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  evolutionMode === "acumulado"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Acumulado mensual
              </Button>
              <Button variant="outline"
                onClick={() => setEvolutionMode("mensual")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  evolutionMode === "mensual"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Mensual
              </Button>
              <Button variant="outline"
                onClick={() => setEvolutionMode("acumulado_semanal")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  evolutionMode === "acumulado_semanal"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Acumulado semanal
              </Button>
              <Button variant="outline"
                onClick={() => setEvolutionMode("semanal")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  evolutionMode === "semanal"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Semanal
              </Button>
            </div>
            {(evolutionMode === "semanal" ||
              evolutionMode === "acumulado_semanal") && (
              <select
                value={evolutionTimeFilter}
                onChange={(e) => setEvolutionTimeFilter(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white border border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">Todas las semanas</option>
                <option value="0-2">T1 (Ene-Mar)</option>
                <option value="3-5">T2 (Abr-Jun)</option>
                <option value="6-8">T3 (Jul-Sep)</option>
                <option value="9-11">T4 (Oct-Dic)</option>
                <option value="0">Enero</option>
                <option value="1">Febrero</option>
                <option value="2">Marzo</option>
                <option value="3">Abril</option>
                <option value="4">Mayo</option>
                <option value="5">Junio</option>
                <option value="6">Julio</option>
                <option value="7">Agosto</option>
                <option value="8">Septiembre</option>
                <option value="9">Octubre</option>
                <option value="10">Noviembre</option>
                <option value="11">Diciembre</option>
              </select>
            )}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          {/* Team Selector */}
          <div className="mb-6 pb-6 border-b border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-neutral-700">
                Filtrar Equipos:
              </p>
              <div className="flex gap-2">
                <Button variant="outline"
                  onClick={() => setSelectedEvolutionTeams([])}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Todo
                </Button>
                <Button variant="outline"
                  onClick={() => setSelectedEvolutionTeams(["_NONE_"])}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                >
                  Ninguno
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {activeTeams.map((team, idx) => {
                const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                const isSelected =
                  selectedEvolutionTeams.length === 0 ||
                  (selectedEvolutionTeams.includes(teamKey) && !selectedEvolutionTeams.includes("_NONE_"));
                const color = teamColors[teamKey];

                return (
                  <Button variant="outline"
                    key={teamKey}
                    onClick={() => {
                      if (selectedEvolutionTeams.length === 0) {
                        setSelectedEvolutionTeams([teamKey]);
                      } else {
                        let next = selectedEvolutionTeams;
                        if (next.includes("_NONE_")) next = next.filter(t => t !== "_NONE_");
                        
                        if (next.includes(teamKey)) {
                          next = next.filter((t) => t !== teamKey);
                          if (next.length === 0) next = ["_NONE_"];
                          setSelectedEvolutionTeams(next);
                        } else {
                          setSelectedEvolutionTeams([
                            ...next,
                            teamKey,
                          ]);
                        }
                      }
                    }}
                    className={cn(
                      "px-2 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all border flex items-center justify-center gap-1.5 overflow-hidden",
                      isSelected
                        ? "bg-white shadow-sm"
                        : "bg-neutral-50 text-neutral-400 border-neutral-100 grayscale opacity-50",
                    )}
                    style={{
                      borderColor: isSelected ? color : "transparent",
                      color: isSelected ? color : undefined,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate max-w-[120px]">{team.nombreEquipo}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="h-[600px] w-full mt-4 border-t border-neutral-100 pt-6">
            <div className="w-full overflow-x-auto h-full"><div className="min-w-[800px] w-full h-full"><ResponsiveContainer width="100%" height="99%">
              <LineChart
                data={evolutionData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                {evolutionMode === "posiciones" ? (
                  <YAxis 
                    reversed 
                    domain={[1, activeTeams.length]} 
                    tickCount={activeTeams.length}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    interval={0}
                  />
                ) : (
                  <YAxis tick={{ fontSize: 12 }} />
                )}
                <Tooltip content={<EvolutionTooltip />} />
                {(evolutionMode === "semanal" ||
                  evolutionMode === "acumulado_semanal") && (
                  <Brush
                    dataKey="month"
                    height={30}
                    stroke="#3b82f6"
                    fill="#eff6ff"
                    tickFormatter={(value) => value}
                  />
                )}
                {Object.keys(teamColors)
                  .sort((a, b) => {
                    const aSelected =
                      selectedEvolutionTeams.length === 0 ||
                      selectedEvolutionTeams.includes(a);
                    const bSelected =
                      selectedEvolutionTeams.length === 0 ||
                      selectedEvolutionTeams.includes(b);
                    return aSelected === bSelected ? 0 : aSelected ? 1 : -1;
                  })
                  .map((teamKey) => {
                    const isSelected =
                      selectedEvolutionTeams.length === 0 ||
                      selectedEvolutionTeams.includes(teamKey);
                    const opacity = isSelected ? 1 : 0.15;
                    return (
                      <Line
                        key={teamKey}
                        type="monotone"
                        dataKey={teamKey}
                        stroke={teamColors[teamKey]}
                        onMouseEnter={() => setHoveredTeam(teamKey)}
                        onMouseLeave={() => setHoveredTeam(null)}
                        strokeWidth={isSelected ? 3 : 1}
                        strokeOpacity={opacity}
                        dot={isSelected ? { r: 4, strokeWidth: 2 } : false}
                        activeDot={
                          isSelected
                            ? {
                                r: 6,
                                strokeWidth: 0,
                                onMouseEnter: () => setHoveredTeam(teamKey),
                                onMouseLeave: () => setHoveredTeam(null),
                              }
                            : false
                        }
                        connectNulls
                      />
                    );
                  })}
              </LineChart>
            </ResponsiveContainer></div></div>
          </div>
        </div>
      </div>

      {isEvolutionChartExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Evolución por fechas (
                {evolutionMode === "posiciones" ? "Posiciones" : evolutionMode === "acumulado"
                  ? "Acumulado mensual"
                  : evolutionMode === "acumulado_semanal"
                    ? "Acumulado semanal"
                    : evolutionMode === "semanal"
                      ? "Semanal"
                      : "Mensual"}
                )
              </h3>
              <Button variant="outline"
                onClick={() => setIsEvolutionChartExpanded(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="h-[700px] w-full">
                <div className="w-full overflow-x-auto h-full"><div className="min-w-[800px] w-full h-full"><ResponsiveContainer width="100%" height="99%">
                  <LineChart
                    data={evolutionData}
                    margin={{
                      top: 20,
                      right: 40,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis dataKey="month" tick={{ fontSize: 14 }} />
                    {evolutionMode === "posiciones" ? (
                      <YAxis 
                        reversed 
                        domain={[1, activeTeams.length]} 
                        tickCount={activeTeams.length}
                        tick={{ fontSize: 13, fill: '#64748b', fontWeight: 'bold' }}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={12}
                        interval={0}
                      />
                    ) : (
                      <YAxis tick={{ fontSize: 14 }} />
                    )}
                    <Tooltip content={<EvolutionTooltip />} />
                    {(evolutionMode === "semanal" ||
                      evolutionMode === "acumulado_semanal" ||
                      evolutionMode === "posiciones") && (
                      <Brush
                        dataKey="month"
                        height={30}
                        stroke="#3b82f6"
                        fill="#eff6ff"
                        tickFormatter={(value) => value}
                      />
                    )}
                    {Object.keys(teamColors)
                      .sort((a, b) => {
                        const aSelected =
                          selectedEvolutionTeams.length === 0 ||
                          selectedEvolutionTeams.includes(a);
                        const bSelected =
                          selectedEvolutionTeams.length === 0 ||
                          selectedEvolutionTeams.includes(b);
                        return aSelected === bSelected ? 0 : aSelected ? 1 : -1;
                      })
                      .map((teamKey) => {
                        const isSelected =
                          selectedEvolutionTeams.length === 0 ||
                          selectedEvolutionTeams.includes(teamKey);
                        const opacity = isSelected ? 1 : 0.15;
                        return (
                          <Line
                            key={teamKey}
                            type="monotone"
                            dataKey={teamKey}
                            stroke={teamColors[teamKey]}
                            onMouseEnter={() => setHoveredTeam(teamKey)}
                            onMouseLeave={() => setHoveredTeam(null)}
                            strokeWidth={isSelected ? 4 : 1}
                            strokeOpacity={opacity}
                            dot={isSelected ? { r: 5, strokeWidth: 2 } : false}
                            activeDot={
                              isSelected
                                ? {
                                    r: 8,
                                    strokeWidth: 0,
                                    onMouseEnter: () => setHoveredTeam(teamKey),
                                    onMouseLeave: () => setHoveredTeam(null),
                                  }
                                : false
                            }
                            connectNulls
                          />
                        );
                      })}
                  </LineChart>
                </ResponsiveContainer></div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
