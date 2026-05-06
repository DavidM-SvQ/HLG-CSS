import React, { useContext } from "react";
import { Copy, CheckCircle2, UploadCloud, Maximize2, Trophy, Search, ChevronUp, ChevronDown, X, Medal } from "lucide-react";
import { SeasonViewContext } from "./SeasonViewContext";

export function TopTeamsTable() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const {
    cn,
    files,
    filteredLeaderboard,
    raceWinners,
    globalTeamPartialWinsCount,
    teamsMonthFilter,
    setTeamsMonthFilter,
    topTeamsSortColumn,
    setTopTeamsSortColumn,
    topTeamsSortDirection,
    setTopTeamsSortDirection,
    leaderboardTeamsSearch,
    setLeaderboardTeamsSearch,
    isTopTeamsCopying,
    topTeamsTableRef,
    isTopTeamsTableExpanded,
    setIsTopTeamsTableExpanded,
    handleCopyTopTeamsTable,
    handleDownloadTopTeamsTable,
    formatNumberSpanish,
    getVal,
  } = context;

  // Map races to months
  const raceMonths: Record<string, number> = {};
  files.carreras.data?.forEach((r) => {
    const carreraName = getVal(r, "Carrera")?.trim();
    const fechaFin = getVal(r, "Fecha");
    if (carreraName && fechaFin) {
      const parts = fechaFin.toString().split(/[-/]/);
      if (parts.length >= 2) {
        const monthIndex = parseInt(parts[1]) - 1;
        raceMonths[carreraName] = monthIndex;
      }
    }
  });

  const teamStats = filteredLeaderboard.map((team, idx) => {
    const filteredDetalles = team.detalles.filter((d) => {
      if (
        teamsMonthFilter !== "all" &&
        raceMonths[d.carrera] !== parseInt(teamsMonthFilter)
      ) {
        return false;
      }
      return true;
    });

    const puntos = filteredDetalles.reduce(
      (sum, d) => sum + d.puntosObtenidos,
      0,
    );
    const uniqueRaces = new Set(filteredDetalles.map((d) => d.carrera));
    const numCarreras = uniqueRaces.size;

    let totalDays = 0;
    uniqueRaces.forEach((raceName) => {
      const raceData = files.carreras.data?.find(
        (r) => getVal(r, "Carrera")?.trim() === raceName,
      );
      if (raceData) {
        const diasStr = getVal(raceData, "Días");
        totalDays += parseInt(diasStr) || 1;
      } else {
        totalDays += 1;
      }
    });

    // Calculate wins for this team in the filtered period
    let wins = 0;
    Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
      if (winnerTeam === team.nombreEquipo) {
        if (
          teamsMonthFilter === "all" ||
          raceMonths[raceName] === parseInt(teamsMonthFilter)
        ) {
          wins++;
        }
      }
    });

    // Calculate partial wins for this team in the filtered period
    let partialWins = 0;
    Object.entries(globalTeamPartialWinsCount.byRace).forEach(
      ([raceName, raceEvents]) => {
        if (
          teamsMonthFilter === "all" ||
          raceMonths[raceName] === parseInt(teamsMonthFilter)
        ) {
          Object.values(raceEvents).forEach((winnerTeams) => {
            if (winnerTeams.includes(team.nombreEquipo)) {
              partialWins++;
            }
          });
        }
      },
    );

    const ppc =
      numCarreras > 0 ? parseFloat((puntos / numCarreras).toFixed(1)) : 0;
    const ppd =
      totalDays > 0 ? parseFloat((puntos / totalDays).toFixed(1)) : 0;

    return {
      ...team,
      puntos,
      originalPos: idx + 1,
      wins,
      partialWins,
      ppc,
      ppd,
      numCarreras,
      totalDays,
    };
  });

  // Sort and Filter logic
  const handleTeamsSort = (column: string) => {
    if (topTeamsSortColumn === column) {
      setTopTeamsSortDirection(
        topTeamsSortDirection === "desc" ? "asc" : "desc",
      );
    } else {
      setTopTeamsSortColumn(column);
      setTopTeamsSortDirection("desc");
    }
  };

  const getSortIcon = (column: string) => {
    if (topTeamsSortColumn !== column) return null;
    return topTeamsSortDirection === "desc" ? (
      <ChevronDown className="w-4 h-4" />
    ) : (
      <ChevronUp className="w-4 h-4" />
    );
  };

  const searchedTeams = teamStats.filter((t) =>
    t.nombreEquipo
      .toLowerCase()
      .includes((leaderboardTeamsSearch || "").toLowerCase()),
  );

  const sortedTeams = [...searchedTeams].sort((a, b) => {
    const aVal = a[topTeamsSortColumn as keyof typeof a] ?? 0;
    const bVal = b[topTeamsSortColumn as keyof typeof b] ?? 0;

    let res = 0;
    if (typeof aVal === "number" && typeof bVal === "number") {
      res = aVal - bVal;
    } else {
      res = String(aVal).localeCompare(String(bVal));
    }
    return topTeamsSortDirection === "asc" ? res : -res;
  });

  const getPuntosColor = (puntos: number) => {
    if (puntos >= 900) return "#fbbf24";
    if (puntos >= 600) return "#94a3b8";
    if (puntos >= 400) return "#fb923c";
    return "#3b82f6";
  };

  const maxWins = Math.max(...sortedTeams.map((t) => t.wins));
  const maxPartialWins = Math.max(...sortedTeams.map((t) => t.partialWins));

  return (
    <>
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm mt-12 relative group overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/3 -translate-y-1/3" />
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 mb-6 gap-4 relative z-10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-2.5 rounded-xl shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-2xl text-neutral-900 tracking-tight flex items-center gap-2 truncate">
              Clasificación de Equipos
              {teamsMonthFilter !== "all" && (
                <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Solo data del mes seleccionado
                </span>
              )}
            </h3>
            <div className="copy-button-ignore flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsTopTeamsTableExpanded(true)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                title="Ampliar tabla"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyTopTeamsTable}
                disabled={isTopTeamsCopying}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                  isTopTeamsCopying
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:text-blue-600 hover:border-blue-200",
                )}
                title={
                  isTopTeamsCopying
                    ? "Copiado"
                    : "Copiar tabla como imagen"
                }
              >
                {isTopTeamsCopying ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleDownloadTopTeamsTable}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                title="Descargar gráfico como imagen"
              >
                <UploadCloud className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar equipo..."
                value={leaderboardTeamsSearch}
                onChange={(e) => setLeaderboardTeamsSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-neutral-400 font-medium"
              />
            </div>
            <select
              value={teamsMonthFilter}
              onChange={(e) => setTeamsMonthFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 text-sm font-semibold bg-white border border-neutral-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer hover:border-blue-300"
            >
              <option value="all">Todas las carreras</option>
              {(() => {
                const months = [
                  "Enero",
                  "Febrero",
                  "Marzo",
                  "Abril",
                  "Mayo",
                  "Junio",
                  "Julio",
                  "Agosto",
                  "Septiembre",
                  "Octubre",
                  "Noviembre",
                  "Diciembre",
                ];
                return months.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ));
              })()}
            </select>
          </div>
        </div>
        <div className="w-full overflow-x-auto"><div ref={topTeamsTableRef} className="min-w-[800px]"><table className="w-full">
          <thead>
            <tr className="border-b-2 border-neutral-200 bg-neutral-50">
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors rounded-tl-xl w-24"
                onClick={() => handleTeamsSort("originalPos")}
              >
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-neutral-500 uppercase tracking-wider">
                  Pos
                  {getSortIcon("originalPos")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleTeamsSort("nombreEquipo")}
              >
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-500 uppercase tracking-wider">
                  Equipo
                  {getSortIcon("nombreEquipo")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors whitespace-nowrap"
                onClick={() => handleTeamsSort("diff")}
                title="Diferencia de posiciones respecto al orden del draft"
              >
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Dif
                  {getSortIcon("diff")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-32 whitespace-nowrap"
                onClick={() => handleTeamsSort("wins")}
                title="Carreras donde el equipo obtuvo la mayor puntuación entre todos los participantes"
              >
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Victorias
                  {getSortIcon("wins")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-32 whitespace-nowrap"
                onClick={() => handleTeamsSort("partialWins")}
                title="Clasificaciones Parciales (Etapas, Montaña, Regularidad, Jóvenes, etc) donde un ciclista del equipo obtuvo el primer lugar"
              >
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Parciales
                  {getSortIcon("partialWins")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-right cursor-pointer hover:bg-neutral-100 transition-colors rounded-tr-xl w-32"
                onClick={() => handleTeamsSort("puntos")}
              >
                <div className="flex items-center justify-end gap-2 text-sm font-bold text-neutral-800 uppercase tracking-wider">
                  Puntos
                  {getSortIcon("puntos")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sortedTeams.map((team, idx) => {
              const prevTeam = idx > 0 ? sortedTeams[idx - 1] : null;
              const pointsDiff = prevTeam
                ? prevTeam.puntos - team.puntos
                : 0;
              const isClose = pointsDiff > 0 && pointsDiff <= 50;

              const draftOrder = team.orden
                ? parseInt(team.orden)
                : 0;
              const diff = draftOrder - team.originalPos;

              const posColor =
                team.originalPos === 1
                  ? "text-yellow-600 drop-shadow-sm"
                  : team.originalPos === 2
                    ? "text-neutral-500 drop-shadow-sm"
                    : team.originalPos === 3
                      ? "text-amber-700 drop-shadow-sm"
                      : "text-neutral-500";

              const winsColor =
                team.wins > 0 && team.wins === maxWins
                  ? "text-yellow-600 font-bold"
                  : "text-neutral-700";
              const partialWinsColor =
                team.partialWins > 0 &&
                team.partialWins === maxPartialWins
                  ? "text-yellow-600 font-bold"
                  : "text-neutral-700";

              return (
                <tr
                  key={team.jugador}
                  className="hover:bg-blue-50/50 transition-colors group/row"
                >
                  <td
                    className={cn(
                      "px-6 py-3 font-bold text-lg text-center whitespace-nowrap",
                      posColor,
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {team.originalPos === 1 ? (
                        <Medal className="w-6 h-6 text-yellow-500" />
                      ) : team.originalPos === 2 ? (
                        <Medal className="w-6 h-6 text-neutral-400" />
                      ) : team.originalPos === 3 ? (
                        <Medal className="w-6 h-6 text-amber-600" />
                      ) : (
                        team.originalPos
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 font-bold text-neutral-900 text-base whitespace-nowrap">
                    {team.nombreEquipo}{" "}
                    <span className="text-neutral-400 font-normal text-xs ml-1">
                      [#{team.orden}]
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center whitespace-nowrap font-mono scale-95">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-xs font-bold",
                        diff > 0
                          ? "bg-green-100 text-green-700"
                          : diff < 0
                            ? "bg-red-100 text-red-700"
                            : "bg-neutral-100 text-neutral-600",
                      )}
                    >
                      {diff > 0 ? (
                        <>
                          +<span className="font-mono tracking-tight">{formatNumberSpanish(Math.abs(diff))}</span>
                        </>
                      ) : diff < 0 ? (
                         <>
                          -<span className="font-mono tracking-tight">{formatNumberSpanish(Math.abs(diff))}</span>
                        </>
                      ) : (
                        <span className="font-mono tracking-tight">{formatNumberSpanish(0)}</span>
                      )}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-6 py-3 text-center text-base whitespace-nowrap font-mono",
                      winsColor,
                    )}
                  >
                    <span className="font-mono tracking-tight">{formatNumberSpanish(team.wins)}</span>
                  </td>
                  <td
                    className={cn(
                      "px-6 py-3 text-center text-base whitespace-nowrap font-mono",
                      partialWinsColor,
                    )}
                  >
                    <span className="font-mono tracking-tight">{formatNumberSpanish(team.partialWins)}</span>
                  </td>
                  <td
                    className="px-6 py-3 text-right text-xl whitespace-nowrap font-mono font-bold relative"
                    style={{ color: getPuntosColor(team.puntos) }}
                  >
                    {isClose && (
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-sans opacity-0 group-hover/row:opacity-100 transition-opacity whitespace-nowrap z-10 hidden md:block">
                        ¡A {formatNumberSpanish(pointsDiff)} pts!
                      </span>
                    )}
                    <span className="font-mono tracking-tight">{formatNumberSpanish(Math.round(team.puntos))}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div></div>
      </div>

      {isTopTeamsTableExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                Clasificación de Equipos
              </h3>
              <button
                onClick={() => setIsTopTeamsTableExpanded(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="w-full overflow-x-auto"><div className="min-w-[800px]"><table className="w-full">
                <thead>
                  <tr className="border-b-2 border-neutral-200 bg-neutral-50">
                    <th
                      className="px-6 py-3 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-24"
                      onClick={() => handleTeamsSort("originalPos")}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Pos
                        {getSortIcon("originalPos")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left cursor-pointer hover:bg-neutral-100 transition-colors"
                      onClick={() => handleTeamsSort("nombreEquipo")}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Equipo
                        {getSortIcon("nombreEquipo")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-center cursor-pointer hover:bg-neutral-100 transition-colors"
                      onClick={() => handleTeamsSort("diff")}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Dif
                        {getSortIcon("diff")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-32"
                      onClick={() => handleTeamsSort("wins")}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Victorias
                        {getSortIcon("wins")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-32"
                      onClick={() => handleTeamsSort("partialWins")}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Parciales
                        {getSortIcon("partialWins")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-right cursor-pointer hover:bg-neutral-100 transition-colors w-32"
                      onClick={() => handleTeamsSort("puntos")}
                    >
                      <div className="flex items-center justify-end gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                        Puntos
                        {getSortIcon("puntos")}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {sortedTeams.map((team, idx) => {
                    const draftOrder = team.orden ? parseInt(team.orden) : 0;
                    const posColor =
                      team.originalPos === 1
                        ? "text-yellow-600"
                        : team.originalPos === 2
                          ? "text-neutral-500"
                          : team.originalPos === 3
                            ? "text-amber-700"
                            : "text-neutral-500";
                    const diff = draftOrder - team.originalPos;

                    const winsColor =
                      team.wins > 0 && team.wins === maxWins
                        ? "text-yellow-600 font-bold"
                        : "text-neutral-700";
                    const partialWinsColor =
                      team.partialWins > 0 && team.partialWins === maxPartialWins
                        ? "text-yellow-600 font-bold"
                        : "text-neutral-700";

                    return (
                      <tr
                        key={team.jugador}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        <td
                          className={cn(
                            "px-6 py-2 font-bold text-base text-center whitespace-nowrap",
                            posColor,
                          )}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {team.originalPos === 1 ? (
                              <Medal className="w-5 h-5 text-yellow-500" />
                            ) : team.originalPos === 2 ? (
                              <Medal className="w-5 h-5 text-neutral-400" />
                            ) : team.originalPos === 3 ? (
                              <Medal className="w-5 h-5 text-amber-600" />
                            ) : (
                              team.originalPos
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-2 font-bold text-neutral-900 text-base whitespace-nowrap">
                          {team.nombreEquipo}{" "}
                          <span className="text-neutral-400 font-normal text-xs ml-1">
                            [#{team.orden}]
                          </span>
                        </td>
                        <td className="px-6 py-2 text-center whitespace-nowrap font-mono scale-95">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-md text-xs font-bold",
                              diff > 0
                                ? "bg-green-100 text-green-700"
                                : diff < 0
                                  ? "bg-red-100 text-red-700"
                                  : "bg-neutral-100 text-neutral-600",
                            )}
                          >
                            {diff > 0 ? (
                                <>+<span className="font-mono tracking-tight">{formatNumberSpanish(Math.abs(diff))}</span></>
                            ) : diff < 0 ? (
                                <>-<span className="font-mono tracking-tight">{formatNumberSpanish(Math.abs(diff))}</span></>
                            ) : (
                                <span className="font-mono tracking-tight">{formatNumberSpanish(0)}</span>
                            )}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "px-6 py-2 text-center text-base whitespace-nowrap font-mono",
                            winsColor,
                          )}
                        >
                          <span className="font-mono tracking-tight">{formatNumberSpanish(team.wins)}</span>
                        </td>
                        <td
                          className={cn(
                            "px-6 py-2 text-center text-base whitespace-nowrap font-mono",
                            partialWinsColor,
                          )}
                        >
                          <span className="font-mono tracking-tight">{formatNumberSpanish(team.partialWins)}</span>
                        </td>
                        <td
                          className="px-6 py-2 text-right text-lg whitespace-nowrap font-mono font-bold"
                          style={{
                            color: getPuntosColor(team.puntos),
                          }}
                        >
                          <span className="font-mono tracking-tight">{formatNumberSpanish(Math.round(team.puntos))}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table></div></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
