import { cn } from "../../../lib/utils";
import React, { useContext, useEffect } from "react";
import { Copy, CheckCircle2, UploadCloud, Maximize2, Trophy, Search, X } from "lucide-react";
import { SeasonViewContext } from "./SeasonViewContext";
import { useTopTeams } from "../../../lib/hooks/useTopTeams";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { useDebounce } from "../../../lib/hooks/useDebounce";

import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { TopTeamsTableContent } from "./TopTeamsTableContent";

export function TopTeamsTable() {
  const context = useContext(SeasonViewContext)!;
  const {
    formatNumberSpanish,
    teamsMonthFilter, setTeamsMonthFilter,
    topTeamsSortColumn, setTopTeamsSortColumn,
    topTeamsSortDirection, setTopTeamsSortDirection,
    leaderboardTeamsSearch, setLeaderboardTeamsSearch
  } = context;

  const [isTopTeamsTableExpanded, setIsTopTeamsTableExpanded] = React.useState(false);
  const topTeamsTableRef = React.useRef<HTMLDivElement>(null);

  const [localSearch, setLocalSearch] = React.useState(leaderboardTeamsSearch);
  
  // Sync localSearch ONLY when URL state changes externally
  useEffect(() => {
    if (leaderboardTeamsSearch !== localSearch) {
      setLocalSearch(leaderboardTeamsSearch);
    }
  }, [leaderboardTeamsSearch, localSearch]);
  
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

  const getPuntosColor = (puntos: number) => {
    if (maxPoints === minPoints) return "#3b82f6";
    // Normalize points between 0 and 1
    const normalized = (puntos - minPoints) / (maxPoints - minPoints);
    // Hue from 0 (red) to 120 (green)
    const hue = normalized * 120;
    // Adjust lightness and saturation for good readability on white
    return `hsl(${hue}, 85%, 45%)`;
  };

  const tableProps = {
    topTeamsSortColumn,
    topTeamsSortDirection,
    handleTeamsSort,
    sortedTeams,
    getPuntosColor,
    formatNumberSpanish,
    maxWins, minWins,
    maxPartialWins, minPartialWins,
    maxCarreras, minCarreras,
    maxPpc, minPpc,
    maxDays, minDays,
    maxPpd, minPpd
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
        <div className="w-full overflow-x-auto"><div ref={topTeamsTableRef} className="min-w-[800px]">
          <TopTeamsTableContent {...tableProps} scrollRef={topTeamsTableRef} />
        </div></div>
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
              <div className="w-full overflow-x-auto"><div className="min-w-[800px]">
                <TopTeamsTableContent {...tableProps} dense />
              </div></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
