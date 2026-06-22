import { cn } from "../../../lib/utils";
import React, { useContext, useEffect } from "react";
import { Camera, CheckCircle2, CloudDownload, Maximize2, Trophy, Search, X } from "lucide-react";
import { SeasonViewContext } from "./SeasonViewContext";
import { useTopTeams } from "../../../lib/hooks/useTopTeams";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { useDebounce } from "../../../lib/hooks/useDebounce";

import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { TopTeamsTableContent } from "./TopTeamsTableContent";
import { ExportToolbar } from "../../ui/ExportToolbar";

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
  const [localCustomDateRange, setLocalCustomDateRange] = React.useState({
    start: `${new Date().getFullYear()}-01-01`,
    end: new Date().toISOString().split('T')[0]
  });

  // Keep localCustomDateRange in sync if it changes from outside or initializes
  useEffect(() => {
    if (teamsMonthFilter.startsWith("custom_")) {
      const parts = teamsMonthFilter.split("_");
      setLocalCustomDateRange({
        start: parts[1] || `${new Date().getFullYear()}-01-01`,
        end: parts[2] || new Date().toISOString().split('T')[0]
      });
    }
  }, [teamsMonthFilter]);
  
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

  const handleCopyText = () => {
    let header = `Clasificación de Equipos\n`;
    header += `Equipo\tPuntos\tPP Días\tDías\tPPC\tCarreras\tDiff.\n`;
    const rows = sortedTeams.map(t => {
      const pos = `${t.originalPos}º`;
      const name = t.nombreEquipo;
      const pts = Math.round(t.puntos) + " pts";
      const ppd = isFinite((t as any).ppd) ? ((t as any).ppd).toString().replace('.', ',') : "0,0";
      const days = typeof (t as any).totalDays === 'number' ? (t as any).totalDays : 0;
      const ppc = isFinite((t as any).ppc) ? ((t as any).ppc).toString().replace('.', ',') : "0,0";
      const runs = typeof (t as any).numCarreras === 'number' ? (t as any).numCarreras : 0;
      const diffStr = (t as any).diff > 0 ? `+${(t as any).diff}` : (t as any).diff < 0 ? `${(t as any).diff}` : "=";
      return `${pos} ${name}\t${pts}\t${ppd}\t${days}\t${ppc}\t${runs}\t${diffStr}`;
    }).join('\n');
    navigator.clipboard.writeText(header + rows);
  };

  const ITEMS_PER_BLOCK = 10;
  const numBlocks = Math.ceil(sortedTeams.length / ITEMS_PER_BLOCK);

  return (
    <>
      <div ref={topTeamsTableRef} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm mt-12 relative group">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3" />
        </div>
        <div className="flex flex-col lg:flex-row justify-between border-b pb-4 mb-4 gap-4 relative z-10">
          <div className="flex items-center gap-4 min-w-0 flex-wrap sm:flex-nowrap">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-2.5 rounded-xl shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-2xl text-neutral-900 tracking-tight flex items-center gap-2 flex-wrap min-w-0">
              Clasificación de Equipos
              {teamsMonthFilter !== "all" && (
                <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Solo data del mes seleccionado
                </span>
              )}
            </h3>
            <div className="copy-button-ignore shrink-0 ml-auto sm:ml-0">
              <ExportToolbar
                targetRef={topTeamsTableRef}
                filename="clasificacion-equipos"
                isExpanded={isTopTeamsTableExpanded}
                onExpand={() => setIsTopTeamsTableExpanded(true)}
                numBlocks={numBlocks}
                onCopyText={handleCopyText}
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3 w-full mb-6 relative z-10">
          <div className="relative w-full sm:w-64 max-w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="Buscar equipo..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border-neutral-200 rounded-xl focus-visible:ring-blue-500/20 font-medium h-10"
            />
          </div>
          <select 
            value={teamsMonthFilter.startsWith("custom_") ? "custom" : teamsMonthFilter} 
            onChange={(e) => {
              if (e.target.value === "custom") {
                const currentYear = new Date().getFullYear();
                const today = new Date().toISOString().split('T')[0];
                setTeamsMonthFilter(`custom_${currentYear}-01-01_${today}`);
              } else {
                setTeamsMonthFilter(e.target.value);
              }
              setTopTeamsSortColumn("puntos");
              setTopTeamsSortDirection("desc");
            }}
            className="w-full sm:w-auto px-4 py-2 font-semibold bg-white border border-neutral-200 rounded-xl shadow-sm hover:border-blue-300 focus-visible:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm h-10 shrink-0"
          >
            <option value="all">Todos los meses</option>
            <option value="custom">Rango de fechas</option>
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
                <option key={i} value={i.toString()}>
                  {m}
                </option>
              ));
            })()}
          </select>
          {teamsMonthFilter.startsWith("custom_") && (
            <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2 w-full sm:w-auto">
              <Input 
                type="date" 
                className="w-full sm:w-auto py-1 text-sm bg-neutral-50 h-10"
                value={localCustomDateRange.start}
                onChange={(e) => {
                  setLocalCustomDateRange(prev => ({ ...prev, start: e.target.value }));
                }}
              />
              <span className="text-neutral-500 font-medium hidden sm:inline">a</span>
              <Input 
                type="date" 
                className="w-full sm:w-auto py-1 text-sm bg-neutral-50 h-10"
                value={localCustomDateRange.end}
                onChange={(e) => {
                  setLocalCustomDateRange(prev => ({ ...prev, end: e.target.value }));
                }}
              />
              <Button 
                size="sm" 
                variant="default"
                onClick={() => {
                  setTeamsMonthFilter(`custom_${localCustomDateRange.start}_${localCustomDateRange.end}`);
                  setTopTeamsSortColumn("puntos");
                  setTopTeamsSortDirection("desc");
                }}
                className="h-10 w-full sm:w-auto"
              >
                Aplicar
              </Button>
            </div>
          )}
        </div>
        <div className="w-full overflow-x-auto">
          <TopTeamsTableContent {...tableProps} />
        </div>
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
