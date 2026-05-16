import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import React, { useContext, useEffect } from "react";
import { Copy, CheckCircle2, UploadCloud, Maximize2, Trophy, Search, ChevronUp, ChevronDown, X, Medal , ChevronRight} from "lucide-react";
import { expandNodeForCapture } from "../../../lib/dom-utils";
import { copyImageToClipboard } from "../../../lib/clipboard";
import { SeasonViewContext } from "./SeasonViewContext";
import { useTopTeams } from "../../../lib/hooks/useTopTeams";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { useUrlState } from "../../../hooks/useUrlState";
import { useDebounce } from "../../../lib/hooks/useDebounce";

import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
export function TopTeamsTable() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const {
    formatNumberSpanish,
    files
  } = context;

  const [teamsMonthFilter, setTeamsMonthFilter] = useUrlState("teamsMonthFilter", "all");
  const [topTeamsSortColumn, setTopTeamsSortColumn] = useUrlState("topTeamsSortColumn", "pos");
  const [topTeamsSortDirection, setTopTeamsSortDirection] = useUrlState<"asc" | "desc">("topTeamsSortDirection", "asc");
  const [leaderboardTeamsSearch, setLeaderboardTeamsSearch] = useUrlState("leaderboardTeamsSearch", "");
  const [isTopTeamsTableExpanded, setIsTopTeamsTableExpanded] = React.useState(false);
  const topTeamsTableRef = React.useRef<HTMLDivElement>(null);

  const [localSearch, setLocalSearch] = React.useState(leaderboardTeamsSearch);
  
  // Sync localSearch ONLY when URL state changes externally
  useEffect(() => {
    if (leaderboardTeamsSearch !== localSearch) {
      setLocalSearch(leaderboardTeamsSearch);
    }
  }, [leaderboardTeamsSearch]);
  
  const debouncedSearch = useDebounce(localSearch, 300);
  
  // Sync back to URL state when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== leaderboardTeamsSearch) {
      setLeaderboardTeamsSearch(debouncedSearch);
    }
  }, [debouncedSearch, leaderboardTeamsSearch, setLeaderboardTeamsSearch]);
  
  const { handleCopyImage: copyTopTeams, handleDownloadImage: downloadTopTeams, isCopying: isTopTeamsCopying } = useTableScreenshot(topTeamsTableRef);

  const handleCopyTopTeamsTable = async () => {
    await copyTopTeams({ fileName: "export.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
  };

  const handleDownloadTopTeamsTable = async () => {
    await downloadTopTeams({ fileName: "top_teams.png", scale: 3, filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")), backgroundColor: "#ffffff" });
  };

  const { 
    sortedTeams, 
    maxPoints, minPoints, 
    maxWins, minWins, 
    maxPartialWins, minPartialWins, 
    maxCarreras, minCarreras,
    maxPpc, minPpc,
    maxDays, minDays,
    maxPpd, minPpd
  } = useTopTeams(
    teamsMonthFilter,
    leaderboardTeamsSearch,
    topTeamsSortColumn,
    topTeamsSortDirection
  );

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

  const getPuntosColor = (puntos: number) => {
    if (maxPoints === minPoints) return "#3b82f6";
    // Normalize points between 0 and 1
    const normalized = (puntos - minPoints) / (maxPoints - minPoints);
    // Hue from 0 (red) to 120 (green)
    const hue = normalized * 120;
    // Adjust lightness and saturation for good readability on white
    return `hsl(${hue}, 85%, 45%)`;
  };

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
              <Button variant="outline"
                onClick={() => setIsTopTeamsTableExpanded(true)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                title="Ampliar tabla"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon"
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
              </Button>
              <Button variant="ghost" size="sm"
                onClick={handleDownloadTopTeamsTable}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                title="Descargar gráfico como imagen"
              >
                <UploadCloud className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <Input
                type="text"
                placeholder="Buscar equipo..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border-neutral-200 rounded-xl focus-visible:ring-blue-500/20 font-medium"
              />
            </div>
            <Select value={teamsMonthFilter} onValueChange={(value) => setTeamsMonthFilter(value)}>
              <SelectTrigger className="w-full sm:w-auto px-4 py-2 font-semibold bg-white border border-neutral-200 rounded-xl shadow-sm hover:border-blue-300">
                <SelectValue placeholder="Todas las carreras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las carreras</SelectItem>
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
                    <SelectItem key={i} value={i.toString()}>
                      {m}
                    </SelectItem>
                  ));
                })()}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="w-full overflow-x-auto"><div ref={topTeamsTableRef} className="min-w-[800px]"><table className="w-full">
          <thead>
            <tr className="border-b-2 border-neutral-200 bg-neutral-50">
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors rounded-tl-xl w-20"
                onClick={() => handleTeamsSort("originalPos")}
              >
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Pos
                  {getSortIcon("originalPos")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleTeamsSort("nombreEquipo")}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Equipo
                  {getSortIcon("nombreEquipo")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-20 whitespace-nowrap"
                onClick={() => handleTeamsSort("diff")}
                title="Diferencia de posiciones respecto al orden del draft"
              >
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Dif
                  {getSortIcon("diff")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-24 whitespace-nowrap"
                onClick={() => handleTeamsSort("wins")}
                title="Carreras ganadas (equipo con más puntos en la prueba)"
              >
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Vic
                  {getSortIcon("wins")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-24 whitespace-nowrap"
                onClick={() => handleTeamsSort("partialWins")}
                title="Clasificaciones Parciales (Etapas, etc)"
              >
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Parc
                  {getSortIcon("partialWins")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-24 whitespace-nowrap"
                onClick={() => handleTeamsSort("numCarreras")}
              >
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Carr
                  {getSortIcon("numCarreras")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-24 whitespace-nowrap"
                onClick={() => handleTeamsSort("ppc")}
              >
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  P/C
                  {getSortIcon("ppc")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-24 whitespace-nowrap"
                onClick={() => handleTeamsSort("totalDays")}
              >
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Días
                  {getSortIcon("totalDays")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-24 whitespace-nowrap"
                onClick={() => handleTeamsSort("ppd")}
              >
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  P/D
                  {getSortIcon("ppd")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-right cursor-pointer hover:bg-neutral-100 transition-colors rounded-tr-xl w-32"
                onClick={() => handleTeamsSort("puntos")}
              >
                <div className="flex items-center justify-end gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Puntos
                  {getSortIcon("puntos")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
            <AnimatePresence>
              {sortedTeams.map((team, idx) => (
                <TopTeamRow
                  key={team.nombreEquipo}
                  team={team}
                  idx={idx}
                  getPuntosColor={getPuntosColor}
                  formatNumberSpanish={formatNumberSpanish}
                  sortedTeams={sortedTeams}
                  maxWins={maxWins}
                  minWins={minWins}
                  maxPartialWins={maxPartialWins}
                  minPartialWins={minPartialWins}
                  maxCarreras={maxCarreras}
                  minCarreras={minCarreras}
                  maxPpc={maxPpc}
                  minPpc={minPpc}
                  maxDays={maxDays}
                  minDays={minDays}
                  maxPpd={maxPpd}
                  minPpd={minPpd}
                />
              ))}
            </AnimatePresence>
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
              <Button variant="outline"
                onClick={() => setIsTopTeamsTableExpanded(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
              >
                <X className="w-6 h-6" />
              </Button>
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
                      className="px-6 py-3 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-24"
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
                        Vic
                        {getSortIcon("wins")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-32"
                      onClick={() => handleTeamsSort("partialWins")}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Parc
                        {getSortIcon("partialWins")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-32"
                      onClick={() => handleTeamsSort("numCarreras")}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Carr
                        {getSortIcon("numCarreras")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-32"
                      onClick={() => handleTeamsSort("ppc")}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        P/C
                        {getSortIcon("ppc")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-32"
                      onClick={() => handleTeamsSort("totalDays")}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Días
                        {getSortIcon("totalDays")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-center cursor-pointer hover:bg-neutral-100 transition-colors w-32"
                      onClick={() => handleTeamsSort("ppd")}
                    >
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        P/D
                        {getSortIcon("ppd")}
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
                <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                  <AnimatePresence>
                    {sortedTeams.map((team, idx) => (
                      <TopTeamRow
                        key={team.nombreEquipo}
                        team={team}
                        idx={idx}
                        getPuntosColor={getPuntosColor}
                        formatNumberSpanish={formatNumberSpanish}
                        sortedTeams={sortedTeams}
                        maxWins={maxWins}
                        minWins={minWins}
                        maxPartialWins={maxPartialWins}
                        minPartialWins={minPartialWins}
                        maxCarreras={maxCarreras}
                        minCarreras={minCarreras}
                        maxPpc={maxPpc}
                        minPpc={minPpc}
                        maxDays={maxDays}
                        minDays={minDays}
                        maxPpd={maxPpd}
                        minPpd={minPpd}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table></div></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


function TopTeamRow({ 
  team, idx, getPuntosColor, formatNumberSpanish, sortedTeams,
  maxWins, minWins,
  maxPartialWins, minPartialWins,
  maxCarreras, minCarreras,
  maxPpc, minPpc,
  maxDays, minDays,
  maxPpd, minPpd
}: any) {
  const [expanded, setExpanded] = React.useState(false);
  const diff = team.diff;
  
  // Calculate if it's "close" to the one above it
  const prevTeam = idx > 0 ? sortedTeams[idx - 1] : null;
  const pointsDiff = prevTeam ? prevTeam.puntos - team.puntos : 0;
  const isClose = pointsDiff > 0 && pointsDiff < 50;

  const getStatColor = (val: number, max: number, min: number) => {
    if (max === min) return "text-neutral-500";
    if (val === max) return "text-green-800 font-bold bg-green-100";
    if (val === min) return "text-red-800 font-bold bg-red-100";
    return "text-neutral-500";
  };

  return (
    <>
      <motion.tr 
        layout 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.2 }} 
        className={cn(
          "hover:bg-neutral-50/80 transition-colors divide-x divide-neutral-100 group/row",
          expanded ? "bg-neutral-50" : "bg-white"
        )}
      >
        <td className="px-6 py-2 text-center whitespace-nowrap">
          <div className="flex flex-col items-center justify-center">
            <span className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border border-neutral-100",
              idx === 0 ? "bg-yellow-400 text-white border-yellow-500" : 
              idx === 1 ? "bg-neutral-300 text-neutral-700" : 
              idx === 2 ? "bg-orange-300 text-white border-orange-400" : 
              "bg-neutral-50 text-neutral-500"
            )}>
              {idx + 1}
            </span>
          </div>
        </td>
        <td className="px-6 py-2 font-bold text-neutral-900 group-hover/row:text-blue-700 transition-colors">
          {team.nombreEquipo}
        </td>
        <td className="px-6 py-2 text-center whitespace-nowrap">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
            diff > 0 ? "bg-green-100 text-green-700" : 
            diff < 0 ? "bg-red-100 text-red-700" : 
            "bg-neutral-100 text-neutral-500"
          )}>
            {diff > 0 ? `+${diff}` : diff === 0 ? "0" : diff}
          </span>
        </td>
        <td className={cn("px-6 py-2 text-center font-mono whitespace-nowrap", getStatColor(team.wins, maxWins, minWins))}>
          {team.wins}
        </td>
        <td className={cn("px-6 py-2 text-center font-mono whitespace-nowrap", getStatColor(team.partialWins, maxPartialWins, minPartialWins))}>
          {team.partialWins}
        </td>
        <td className={cn("px-6 py-2 text-center font-mono whitespace-nowrap", getStatColor(team.numCarreras, maxCarreras, minCarreras))}>
          {team.numCarreras}
        </td>
        <td className={cn("px-6 py-2 text-center font-mono whitespace-nowrap", getStatColor(team.ppc, maxPpc, minPpc))}>
          {team.ppc.toFixed(1)}
        </td>
        <td className={cn("px-6 py-2 text-center font-mono whitespace-nowrap", getStatColor(team.totalDays, maxDays, minDays))}>
          {team.totalDays}
        </td>
        <td className={cn("px-6 py-2 text-center font-mono whitespace-nowrap", getStatColor(team.ppd, maxPpd, minPpd))}>
          {team.ppd.toFixed(1)}
        </td>
        <td className="px-6 py-2 text-right">
          <div className="flex flex-col items-end">
            <span 
              className="font-black font-mono text-sm tracking-tight"
              style={{ color: getPuntosColor(team.puntos) }}
            >
              {formatNumberSpanish(team.puntos)}
            </span>
            {isClose && (
              <span className="text-[9px] text-red-500 font-bold leading-none mt-0.5">
                -{formatNumberSpanish(pointsDiff)} pts
              </span>
            )}
          </div>
        </td>
      </motion.tr>
    </>
  );
}
