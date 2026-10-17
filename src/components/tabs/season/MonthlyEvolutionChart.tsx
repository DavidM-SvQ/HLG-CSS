import React, { useContext } from "react";
import { createPortal } from "react-dom";
import { useUrlState } from "../../../hooks/useUrlState";
import { TrendingUp, X, Calendar, Table2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Brush } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { Button } from "../../ui/button";
import { ChartTooltip } from "../../ui/ChartTooltip";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { useDataStore } from "../../../lib/stores/useDataStore";
import { EvolutionDateFilter } from "./EvolutionDateFilter";
import { DailyPointsComparisonTable } from "./DailyPointsComparisonTable";

export function MonthlyEvolutionChart() {
  const context = useContext(SeasonViewContext)!;
  const { files } = useDataStore();
  const [hoveredTeam, setHoveredTeam] = React.useState<string | null>(null);
  const [localCustomDateRange, setLocalCustomDateRange] = React.useState({
    start: `${new Date().getFullYear()}-01-01`,
    end: new Date().toISOString().split('T')[0]
  });

  const {
    cn,
    filteredLeaderboard,
    LINE_COLORS,
  } = context;

  const [mainView, setMainView] = useUrlState<"grafico" | "tabla_diaria">("evolutionView", "grafico");
  const [evolutionMode, setEvolutionMode] = useUrlState<string>("evolutionMode", "posiciones");
  const [evolutionTimeFilter, setEvolutionTimeFilter] = useUrlState<string>("evolutionTimeFilter", "all");

  // Keep localCustomDateRange in sync if it changes from outside or initializes
  React.useEffect(() => {
    if (evolutionTimeFilter.startsWith("custom_")) {
      const parts = evolutionTimeFilter.split("_");
      setLocalCustomDateRange({
        start: parts[1] || `${new Date().getFullYear()}-01-01`,
        end: parts[2] || new Date().toISOString().split('T')[0]
      });
    }
  }, [evolutionTimeFilter]);

  const [isEvolutionChartExpanded, setIsEvolutionChartExpanded] = React.useState(false);
  const [selectedEvolutionTeams, setSelectedEvolutionTeams] = useUrlState<string[]>("evolutionTeamsFilter", []);
  const evolutionChartRef = React.useRef<HTMLDivElement>(null);

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

  const activeTeams = React.useMemo(() => {
    return filteredLeaderboard?.filter(t => !t.nombreEquipo.toLowerCase().includes("no draft")) || [];
  }, [filteredLeaderboard]);

  const { currentMonthIdx, currentWIdx, availableDateRange } = React.useMemo(() => {
    let dataMaxMonthIdx = -1;
    let dataMaxWIdx = -1;
    let minDate = "";
    let maxDate = "";

    activeTeams.forEach((team) => {
      team.detalles?.forEach((d: any) => {
        if (!d.fecha) return;
        if (!minDate || d.fecha < minDate) minDate = d.fecha;
        if (!maxDate || d.fecha > maxDate) maxDate = d.fecha;

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

    return {
      currentMonthIdx: dataMaxMonthIdx >= 0 ? dataMaxMonthIdx : new Date().getMonth(),
      currentWIdx: dataMaxWIdx >= 0 ? dataMaxWIdx : new Date().getMonth() * 4 + 3,
      availableDateRange: minDate && maxDate ? { minDate, maxDate } : undefined,
    };
  }, [activeTeams]);

  const teamColors = React.useMemo(() => {
    const colors: Record<string, string> = {};
    activeTeams.forEach((team, idx) => {
      const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
      if (idx === 0) colors[teamKey] = "#fbbf24"; // Gold
      else if (idx === 1) colors[teamKey] = "#94a3b8"; // Silver
      else if (idx === 2) colors[teamKey] = "#fb923c"; // Bronze
      else colors[teamKey] = LINE_COLORS[(idx - 3) % LINE_COLORS.length];
    });
    return colors;
  }, [activeTeams]);

  const evolutionData = React.useMemo(() => {
    // Parse filter mode
    let filterKind: "all" | "custom_date" | "month_range" | "week_range" | "single_week" | "single_month" = "all";
    let customStart = "";
    let customEnd = "";
    let mRangeStart = 0;
    let mRangeEnd = 11;
    let wRangeStart = 0;
    let wRangeEnd = 47;
    let singleWeekIdx = 0;
    let singleMonthIdx = 0;

    if (!evolutionTimeFilter || evolutionTimeFilter === "all") {
      filterKind = "all";
    } else if (evolutionTimeFilter.startsWith("custom_")) {
      filterKind = "custom_date";
      const parts = evolutionTimeFilter.split("_");
      if (parts.length === 3) {
        customStart = parts[1];
        customEnd = parts[2];
      }
    } else if (evolutionTimeFilter.startsWith("mrange_")) {
      filterKind = "month_range";
      const parts = evolutionTimeFilter.split("_");
      mRangeStart = parseInt(parts[1], 10) || 0;
      mRangeEnd = parseInt(parts[2], 10) || 0;
    } else if (evolutionTimeFilter.startsWith("wrange_")) {
      filterKind = "week_range";
      const parts = evolutionTimeFilter.split("_");
      wRangeStart = parseInt(parts[1], 10) || 0;
      wRangeEnd = parseInt(parts[2], 10) || 0;
    } else if (evolutionTimeFilter.startsWith("w_")) {
      filterKind = "single_week";
      const parts = evolutionTimeFilter.split("_");
      singleWeekIdx = parseInt(parts[1], 10) || 0;
    } else if (evolutionTimeFilter.includes("-")) {
      filterKind = "month_range";
      const [start, end] = evolutionTimeFilter.split("-").map(Number);
      mRangeStart = !isNaN(start) ? start : 0;
      mRangeEnd = !isNaN(end) ? end : 2;
    } else {
      const parsedMonth = parseInt(evolutionTimeFilter, 10);
      if (!isNaN(parsedMonth)) {
        filterKind = "single_month";
        singleMonthIdx = parsedMonth;
      }
    }

    const matchesDateString = (dateStr: string) => {
      if (filterKind !== "custom_date") return true;
      if (!customStart && !customEnd) return true;
      if (customStart && dateStr < customStart) return false;
      if (customEnd && dateStr > customEnd) return false;
      return true;
    };

    if (evolutionMode === "posiciones") {
      const weeks: string[] = [];
      for (let i = 0; i < 12; i++) {
        for (let w = 1; w <= 4; w++) {
          weeks.push(`${months[i]} S${w}`);
        }
      }
      
      const pointsByWeek = weeks.map(w => ({ month: w, scores: {} as Record<string, number> }));
      
      activeTeams.forEach((team) => {
        const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
        const weekPoints = new Array(48).fill(0);

        team.detalles?.forEach((d: any) => {
          if (!d.fecha) return;
          if (!matchesDateString(d.fecha)) return;
          const parts = d.fecha.split("-");
          if (parts.length < 3) return;
          const monthIndex = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          if (isNaN(monthIndex) || isNaN(day) || monthIndex < 0 || monthIndex > 11) return;

          let weekIndex = 1;
          if (day > 7 && day <= 14) weekIndex = 2;
          else if (day > 14 && day <= 21) weekIndex = 3;
          else if (day > 21) weekIndex = 4;

          const wIdx = monthIndex * 4 + (weekIndex - 1);
          weekPoints[wIdx] += (typeof d.puntosObtenidos === 'number' ? d.puntosObtenidos : 0);
        });

        let accumulated = 0;
        for (let wIdx = 0; wIdx < 48; wIdx++) {
          accumulated += weekPoints[wIdx];
          pointsByWeek[wIdx].scores[teamKey] = accumulated;
        }
      });

      const chartData: any[] = [];
      let started = false;

      pointsByWeek.forEach((weekData, wIdx) => {
        if (wIdx > currentWIdx && filterKind === "all") return;
        
        const hasPoints = Object.values(weekData.scores).some(val => val > 0);
        if (!hasPoints && !started && filterKind === "all") return;
        started = true;
        
        const teamsScoreArray = Object.entries(weekData.scores).map(([team, score]) => ({ team, score }));
        teamsScoreArray.sort((a, b) => b.score - a.score || a.team.localeCompare(b.team));
        
        const mIdx = Math.floor(wIdx / 4);
        const rankData: any = { month: weekData.month, mIdx, wIdx };
        
        teamsScoreArray.forEach((ts, idx) => {
          rankData[ts.team] = idx + 1;
        });
        
        chartData.push(rankData);
      });

      return chartData.filter((w) => {
        if (filterKind === "custom_date") {
          const mIdx = w.mIdx;
          const startMIdx = customStart ? parseInt(customStart.split("-")[1], 10) - 1 : 0;
          const endMIdx = customEnd ? parseInt(customEnd.split("-")[1], 10) - 1 : 11;
          if (mIdx < startMIdx || mIdx > endMIdx) return false;
        } else if (filterKind === "month_range") {
          if (w.mIdx < mRangeStart || w.mIdx > mRangeEnd) return false;
        } else if (filterKind === "single_month") {
          if (w.mIdx !== singleMonthIdx) return false;
        } else if (filterKind === "week_range") {
          if (w.wIdx < wRangeStart || w.wIdx > wRangeEnd) return false;
        } else if (filterKind === "single_week") {
          if (w.wIdx !== singleWeekIdx) return false;
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
      const dataByWeek: any[] = weeks.map((w, idx) => ({ month: w, wIdx: idx }));
      activeTeams.forEach((team) => {
        const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
        const weekPoints = new Array(48).fill(0);

        team.detalles?.forEach((d: any) => {
          if (!d.fecha) return;
          if (!matchesDateString(d.fecha)) return;
          const parts = d.fecha.split("-");
          if (parts.length < 3) return;
          const monthIndex = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          if (isNaN(monthIndex) || isNaN(day) || monthIndex < 0 || monthIndex > 11) return;

          let weekIndex = 1;
          if (day > 7 && day <= 14) weekIndex = 2;
          else if (day > 14 && day <= 21) weekIndex = 3;
          else if (day > 21) weekIndex = 4;

          const wIdx = monthIndex * 4 + (weekIndex - 1);
          weekPoints[wIdx] += (typeof d.puntosObtenidos === 'number' ? d.puntosObtenidos : 0);
        });

        let accumulated = 0;
        for (let wIdx = 0; wIdx < 48; wIdx++) {
          if (evolutionMode === "acumulado_semanal") {
            accumulated += weekPoints[wIdx];
            dataByWeek[wIdx][teamKey] = accumulated;
          } else {
            dataByWeek[wIdx][teamKey] = weekPoints[wIdx];
          }
        }
      });

      const firstWeekWithData = dataByWeek.findIndex((w) =>
        Object.keys(w).some((key) => key !== "month" && key !== "wIdx" && w[key] > 0),
      );

      return dataByWeek.filter((w, wIdx) => {
        if (filterKind === "all" && wIdx > currentWIdx) return false;
        if (filterKind === "all" && firstWeekWithData === -1) return false;

        if (filterKind === "custom_date") {
          const mIdx = Math.floor(wIdx / 4);
          const startMIdx = customStart ? parseInt(customStart.split("-")[1], 10) - 1 : 0;
          const endMIdx = customEnd ? parseInt(customEnd.split("-")[1], 10) - 1 : 11;
          if (mIdx < startMIdx || mIdx > endMIdx) return false;
          return true;
        } else if (filterKind === "month_range") {
          const mIdx = Math.floor(wIdx / 4);
          if (mIdx < mRangeStart || mIdx > mRangeEnd) return false;
          return true;
        } else if (filterKind === "single_month") {
          const mIdx = Math.floor(wIdx / 4);
          if (mIdx !== singleMonthIdx) return false;
          return true;
        } else if (filterKind === "week_range") {
          if (wIdx < wRangeStart || wIdx > wRangeEnd) return false;
          return true;
        } else if (filterKind === "single_week") {
          if (wIdx !== singleWeekIdx) return false;
          return true;
        }

        return wIdx >= firstWeekWithData;
      });
    }

    // Modalidad mensual o acumulado mensual
    const dataByMonth: any[] = months.map((m, idx) => ({
      month: m,
      mIdx: idx
    }));

    activeTeams.forEach((team) => {
      const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
      const monthPoints = new Array(12).fill(0);

      team.detalles?.forEach((d: any) => {
        if (!d.fecha) return;
        if (!matchesDateString(d.fecha)) return;
        const parts = d.fecha.split("-");
        if (parts.length < 3) return;
        const monthIndex = parseInt(parts[1], 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          monthPoints[monthIndex] += (typeof d.puntosObtenidos === 'number' ? d.puntosObtenidos : 0);
        }
      });

      let accumulated = 0;
      for (let mIdx = 0; mIdx < 12; mIdx++) {
        if (evolutionMode === "acumulado") {
          accumulated += monthPoints[mIdx];
          dataByMonth[mIdx][teamKey] = accumulated;
        } else {
          dataByMonth[mIdx][teamKey] = monthPoints[mIdx];
        }
      }
    });

    return dataByMonth.filter((m, idx) => {
      if (filterKind === "custom_date") {
        const startMIdx = customStart ? parseInt(customStart.split("-")[1], 10) - 1 : 0;
        const endMIdx = customEnd ? parseInt(customEnd.split("-")[1], 10) - 1 : 11;
        return idx >= startMIdx && idx <= endMIdx;
      }
      
      if (filterKind === "month_range") {
        if (idx < mRangeStart || idx > mRangeEnd) return false;
      } else if (filterKind === "single_month") {
        if (idx !== singleMonthIdx) return false;
      } else if (filterKind === "week_range") {
        const startM = Math.floor(wRangeStart / 4);
        const endM = Math.floor(wRangeEnd / 4);
        if (idx < startM || idx > endM) return false;
      } else if (filterKind === "single_week") {
        const targetM = Math.floor(singleWeekIdx / 4);
        if (idx !== targetM) return false;
      }

      const hasData = Object.keys(m).some(
        (key) => key !== "month" && key !== "mIdx" && m[key] > 0,
      );
      return hasData && idx <= currentMonthIdx;
    });
  }, [activeTeams, evolutionMode, evolutionTimeFilter, currentWIdx, currentMonthIdx]);

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

  const configuracionData = files.configuracion?.data || [];
  
  const getValue = (key: string, defaultValue: any) => {
    const item = configuracionData.find((item: any) => item.key === key);
    if (item === undefined) return defaultValue;
    if (item.value === "true") return true;
    if (item.value === "false") return false;
    return item.value;
  };
  const gradientChartsEnabled = getValue("gradient_charts_enabled", true);


  return (
    <>
      <div ref={evolutionChartRef} className="mt-12 group relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b pb-3 mb-6 gap-4">
          <div className="flex flex-wrap items-center gap-3 min-w-0 shrink-0">
            <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2 min-w-0">
              <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="truncate">Evolución por fechas</span>
            </h3>

            {/* View Switcher: Gráfico vs Tabla Diaria */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
              <button
                type="button"
                onClick={() => setMainView("grafico")}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 text-xs",
                  mainView === "grafico"
                    ? "bg-white text-neutral-900 shadow-2xs font-bold"
                    : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Gráfico</span>
              </button>
              <button
                type="button"
                onClick={() => setMainView("tabla_diaria")}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 text-xs",
                  mainView === "tabla_diaria"
                    ? "bg-white text-neutral-900 shadow-2xs font-bold"
                    : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Puntos por día</span>
              </button>
            </div>

            {mainView === "grafico" && (
              <div className="copy-button-ignore">
                <ExportToolbar
                  targetRef={evolutionChartRef}
                  filename="evolucion-mensual"
                  isExpanded={false}
                  onExpand={() => setIsEvolutionChartExpanded(true)}
                />
              </div>
            )}
          </div>

          {mainView === "grafico" && (
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
              <div className="flex flex-wrap bg-neutral-100 p-1 rounded-lg gap-1 w-full xl:w-auto">
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
              <div className="flex flex-wrap items-center justify-start xl:justify-end gap-2 w-full xl:w-auto">
                <EvolutionDateFilter
                  value={evolutionTimeFilter}
                  onChange={setEvolutionTimeFilter}
                  availableDateRange={availableDateRange}
                />
              </div>
            </div>
          )}
        </div>

        {mainView === "tabla_diaria" ? (
          <DailyPointsComparisonTable
            activeTeams={activeTeams}
            files={files}
            teamColors={teamColors}
            selectedEvolutionTeams={selectedEvolutionTeams}
          />
        ) : (
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
            <div className="w-full overflow-x-auto h-full min-h-[300px]"><div className="min-w-[800px] w-full h-full"><ResponsiveContainer width="100%" height="99%">
              <AreaChart
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
                  <>
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
                    <YAxis 
                      orientation="right"
                      reversed 
                      domain={[1, activeTeams.length]} 
                      tickCount={activeTeams.length}
                      tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={12}
                      interval={0}
                    />
                  </>
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
                      <Area isAnimationActive={false}
                        key={teamKey}
                        type="monotone"
                        dataKey={teamKey}
                        stroke={teamColors[teamKey]}
                        fill={evolutionMode !== "posiciones" ? teamColors[teamKey] : "transparent"}
                        onMouseEnter={() => setHoveredTeam(teamKey)}
                        onMouseLeave={() => setHoveredTeam(null)}
                        strokeWidth={isSelected ? 3 : 1}
                        strokeOpacity={opacity}
                        fillOpacity={evolutionMode !== "posiciones" ? opacity * 0.3 : 0}
                        
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
              </AreaChart>
            </ResponsiveContainer></div></div>
          </div>
        </div>
        )}
      </div>

      {isEvolutionChartExpanded && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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
                <div className="w-full overflow-x-auto h-full min-h-[300px]"><div className="min-w-[800px] w-full h-full"><ResponsiveContainer width="100%" height="99%">
                  <AreaChart
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
                      <>
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
                        <YAxis 
                          orientation="right"
                          reversed 
                          domain={[1, activeTeams.length]} 
                          tickCount={activeTeams.length}
                          tick={{ fontSize: 13, fill: '#64748b', fontWeight: 'bold' }}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={12}
                          interval={0}
                        />
                      </>
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
                          <Area isAnimationActive={false}
                            key={teamKey}
                            type="monotone"
                            dataKey={teamKey}
                            stroke={teamColors[teamKey]}
                            fill={evolutionMode !== "posiciones" ? teamColors[teamKey] : "transparent"}
                            onMouseEnter={() => setHoveredTeam(teamKey)}
                            onMouseLeave={() => setHoveredTeam(null)}
                            strokeWidth={isSelected ? 4 : 1}
                            strokeOpacity={opacity}
                            fillOpacity={evolutionMode !== "posiciones" ? opacity * 0.3 : 0}
                            
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
                  </AreaChart>
                </ResponsiveContainer></div></div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
