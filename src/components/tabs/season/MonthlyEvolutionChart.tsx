import React, { useContext } from "react";
import { TrendingUp, Maximize2, Copy, CheckCircle2, UploadCloud, X } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Brush } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";

export function MonthlyEvolutionChart() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const {
    cn,
    filteredLeaderboard,
    evolutionMode,
    setEvolutionMode,
    evolutionTimeFilter,
    setEvolutionTimeFilter,
    isEvolutionChartExpanded,
    setIsEvolutionChartExpanded,
    isEvolutionChartCopying,
    evolutionChartRef,
    selectedEvolutionTeams,
    setSelectedEvolutionTeams,
    handleCopyEvolutionChart,
    handleDownloadEvolutionChart,
    LINE_COLORS,
  } = context;

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
  const currentMonthIdx = new Date().getMonth(); // 0-indexed
  const currentDayStr = new Date().getDate();
  const currentWeekStr = currentDayStr > 21 ? 3 : currentDayStr > 14 ? 2 : currentDayStr > 7 ? 1 : 0;
  const currentWIdx = currentMonthIdx * 4 + currentWeekStr;

  const teamColors: Record<string, string> = {};
  filteredLeaderboard?.forEach((team, idx) => {
    const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
    if (idx === 0) teamColors[teamKey] = "#fbbf24"; // Gold
    else if (idx === 1) teamColors[teamKey] = "#94a3b8"; // Silver
    else if (idx === 2) teamColors[teamKey] = "#fb923c"; // Bronze
    else teamColors[teamKey] = LINE_COLORS[(idx - 3) % LINE_COLORS.length];
  });

  const getEvolutionData = () => {
    if (evolutionMode === "semanal" || evolutionMode === "acumulado_semanal") {
      const weeks: string[] = [];
      for (let i = 0; i < 12; i++) {
        for (let w = 1; w <= 4; w++) {
          weeks.push(`${months[i]} S${w}`);
        }
      }
      const dataByWeek: any[] = weeks.map((w) => ({ month: w }));
      filteredLeaderboard?.forEach((team) => {
        const teamKey = `${team.nombreEquipo} [#${team.orden}]`;

        let accumulated = 0;
        months.forEach((m, mIdx) => {
          for (let w = 1; w <= 4; w++) {
            const wIdx = mIdx * 4 + (w - 1);
            const weekPoints = team.detalles.reduce((sum, d) => {
              if (!d.fecha) return sum;
              const parts = d.fecha.split("/");
              if (parts.length < 2) return sum;
              const monthIndex = parseInt(parts[1]) - 1;
              const day = parseInt(parts[0]);
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

    filteredLeaderboard?.forEach((team) => {
      const teamKey = `${team.nombreEquipo} [#${team.orden}]`;

      let accumulated = 0;

      months.forEach((m, mIdx) => {
        const monthPoints = team.detalles.reduce((sum, d) => {
          if (!d.fecha) return sum;
          const parts = d.fecha.split("/");
          if (parts.length < 2) return sum;
          const monthIndex = parseInt(parts[1]) - 1;
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
              <button
                onClick={() => setIsEvolutionChartExpanded(true)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                title="Ampliar gráfico"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
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
              </button>
              <button
                onClick={handleDownloadEvolutionChart}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                title="Descargar gráfico como imagen"
              >
                <UploadCloud className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-neutral-100 p-1 rounded-lg">
              <button
                onClick={() => setEvolutionMode("acumulado")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  evolutionMode === "acumulado"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Acumulado mensual
              </button>
              <button
                onClick={() => setEvolutionMode("mensual")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  evolutionMode === "mensual"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Mensual
              </button>
              <button
                onClick={() => setEvolutionMode("acumulado_semanal")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  evolutionMode === "acumulado_semanal"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Acumulado semanal
              </button>
              <button
                onClick={() => setEvolutionMode("semanal")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  evolutionMode === "semanal"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Semanal
              </button>
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
                <button
                  onClick={() => setSelectedEvolutionTeams([])}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Mostrar Todos
                </button>
                <button
                  onClick={() =>
                    setSelectedEvolutionTeams(
                      filteredLeaderboard.map(
                        (t) => `${t.nombreEquipo} [#${t.orden}]`,
                      ),
                    )
                  }
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                >
                  Seleccionar Todos
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredLeaderboard.map((team, idx) => {
                const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                const isSelected =
                  selectedEvolutionTeams.length === 0 ||
                  selectedEvolutionTeams.includes(teamKey);
                const color = teamColors[teamKey];

                return (
                  <button
                    key={teamKey}
                    onClick={() => {
                      if (selectedEvolutionTeams.length === 0) {
                        setSelectedEvolutionTeams([teamKey]);
                      } else {
                        if (selectedEvolutionTeams.includes(teamKey)) {
                          const next = selectedEvolutionTeams.filter(
                            (t) => t !== teamKey,
                          );
                          setSelectedEvolutionTeams(next);
                        } else {
                          setSelectedEvolutionTeams([
                            ...selectedEvolutionTeams,
                            teamKey,
                          ]);
                        }
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2",
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
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {team.nombreEquipo}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-[600px] w-full">
            <div className="w-full overflow-x-auto h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="99%">
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
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  itemSorter={(item) => -(item.value as number)}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  height={80}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: "20px",
                    paddingBottom: "0px",
                    fontSize: "12px",
                  }}
                />
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
                        strokeWidth={isSelected ? 3 : 1}
                        strokeOpacity={opacity}
                        dot={isSelected ? { r: 4, strokeWidth: 2 } : false}
                        activeDot={
                          isSelected
                            ? {
                                r: 6,
                                strokeWidth: 0,
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
                {evolutionMode === "acumulado"
                  ? "Acumulado mensual"
                  : evolutionMode === "acumulado_semanal"
                    ? "Acumulado semanal"
                    : evolutionMode === "semanal"
                      ? "Semanal"
                      : "Mensual"}
                )
              </h3>
              <button
                onClick={() => setIsEvolutionChartExpanded(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="h-[700px] w-full">
                <div className="w-full overflow-x-auto h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="99%">
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
                    <YAxis tick={{ fontSize: 14 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        fontSize: "14px",
                      }}
                      itemSorter={(item) => -(item.value as number)}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      height={100}
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: "20px",
                        paddingBottom: "0px",
                        fontSize: "14px",
                      }}
                    />
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
                            strokeWidth={isSelected ? 4 : 1}
                            strokeOpacity={opacity}
                            dot={isSelected ? { r: 5, strokeWidth: 2 } : false}
                            activeDot={
                              isSelected
                                ? {
                                    r: 8,
                                    strokeWidth: 0,
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
