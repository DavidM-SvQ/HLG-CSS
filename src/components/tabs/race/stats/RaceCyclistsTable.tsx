import React from "react";
import { Users, X } from "lucide-react";
import { ReportCard } from "../../../ui/ReportCard";
import { cn } from "../../../../lib/utils";
import { VirtualizedTableBody } from "../../../ui/VirtualizedTableBody";
import { useDataStore } from "../../../../lib/stores/useDataStore";
import { useComputedStore } from "../../../../lib/stores/useComputedStore";
import { getCyclistAvatar } from "../../../../lib/utils/teamColors";
import { User } from "lucide-react";

export const RaceCyclistsTable = ({
  raceCyclists,
  minCyclistRacePoints,
  maxCyclistRacePoints,
  finalColumns,
  maxPointsByCol,
  isExpanded,
  setIsExpanded,
  onCopyImage,
  isCopying,
  onDownloadImage,
  tableRef,
}: any) => {
  const { files } = useDataStore();
  const { cyclistMetadata } = useComputedStore();
  const configuracionData = files.configuracion?.data || [];
  
  const getValue = (key: string, defaultValue: any) => {
    const item = configuracionData.find((item: any) => item.key === key);
    if (item === undefined) return defaultValue;
    if (item.value === "true") return true;
    if (item.value === "false") return false;
    return item.value;
  };
  const fantasyCardsEnabled = getValue("fantasy_cards_enabled", true);

  const maxVictorias = React.useMemo(() => {
    return Math.max(...(raceCyclists || []).map((c: any) => c.victorias || 0), 0);
  }, [raceCyclists]);

  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 opacity-20 text-[10px]">↕</span>;
    }
    return sortConfig.direction === "asc" ? (
      <span className="ml-1 text-[10px] text-blue-400">↑</span>
    ) : (
      <span className="ml-1 text-[10px] text-blue-400">↓</span>
    );
  };

  const filteredRaceCyclists = React.useMemo(() => {
    if (!raceCyclists) return [];
    
    // Show top 25 cyclists based on points
    const sortedByPoints = [...raceCyclists].sort((a, b) => b.puntos - a.puntos);
    const top25Ids = new Set(sortedByPoints.slice(0, 25).map(c => c.ciclista));

    // Determine stage winners
    const winnerIds = new Set<string>();
    raceCyclists.forEach((c: any) => {
      finalColumns?.forEach((col: any) => {
        const pts = c.pointsByCol ? (c.pointsByCol[col.formatted] || 0) : 0;
        if (pts > 0 && maxPointsByCol && pts === maxPointsByCol[col.formatted]) {
          winnerIds.add(c.ciclista);
        }
      });
    });

    const baseList = raceCyclists.filter((c: any) => top25Ids.has(c.ciclista) || winnerIds.has(c.ciclista));

    if (sortConfig) {
      baseList.sort((a, b) => {
        let aVal: any;
        let bVal: any;
        if (sortConfig.key === "ciclista") {
          aVal = a.ciclista;
          bVal = b.ciclista;
        } else if (sortConfig.key === "jugador") {
          aVal = a.jugador;
          bVal = b.jugador;
        } else if (sortConfig.key === "victorias") {
          aVal = a.victorias || 0;
          bVal = b.victorias || 0;
        } else if (sortConfig.key === "puntos") {
          aVal = a.puntos || 0;
          bVal = b.puntos || 0;
        } else {
          aVal = a.pointsByCol ? (a.pointsByCol[sortConfig.key] || 0) : 0;
          bVal = b.pointsByCol ? (b.pointsByCol[sortConfig.key] || 0) : 0;
        }

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return sortConfig.direction === "asc"
          ? (aVal < bVal ? -1 : 1)
          : (aVal > bVal ? -1 : 1);
      });
    }

    return baseList;
  }, [raceCyclists, finalColumns, maxPointsByCol, sortConfig]);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const renderRow = (c: any, index: number) => {
    return (
      <tr
        key={c.ciclista}
        className="hover:bg-blue-50/30 transition-colors group"
      >
        <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-blue-50 border-r border-neutral-100 z-10 min-w-[140px]">
          <div className="flex items-center gap-2">
            {fantasyCardsEnabled && (
              <img 
                src={getCyclistAvatar(c.ciclista)} 
                alt={c.ciclista} 
                className="w-7 h-7 rounded-full border border-neutral-200 bg-neutral-100 shrink-0" 
                loading="lazy"
              />
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-neutral-900 leading-tight text-xs truncate">
                {c.ciclista}{" "}
                <span className="text-neutral-400 font-normal">
                  &lt;{c.ronda}&gt;
                </span>
              </span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 pr-8 sticky left-[140px] shadow-[4px_0_12px_rgba(0,0,0,0.02)] bg-white group-hover:bg-blue-50 border-r border-neutral-100 z-10 text-[11px] w-48 truncate">
          <div className="flex flex-col">
            <span className="text-neutral-700 font-bold leading-tight flex items-center gap-2">
              <span>{c.jugador} [<span className="font-mono tabular-nums opacity-60">#{c.orden}</span>]</span>
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-center border-r border-neutral-100">
          {c.victorias > 0 ? (
            <span className={cn(
              "inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold",
              c.victorias === maxVictorias ? "bg-orange-100 text-orange-800" : "bg-neutral-100 text-neutral-700"
            )}>
              {c.victorias}
            </span>
          ) : (
            <span className="text-neutral-300">-</span>
          )}
        </td>
        {finalColumns?.map((col: any) => {
          const pts = c.pointsByCol ? (c.pointsByCol[col.formatted] || 0) : 0;
          const isMax = pts > 0 && maxPointsByCol && pts === maxPointsByCol[col.formatted];
          return (
            <td
              key={col.formatted}
              className="px-1.5 py-1.5 text-center tabular-nums font-mono border-r border-neutral-100 min-w-[36px]"
            >
              {pts > 0 ? (
                <span className={cn("inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded text-[9px] font-bold shadow-sm",
                  isMax ? "bg-yellow-100 text-yellow-800" : "bg-neutral-100 text-neutral-700"
                )}>
                  {pts}
                </span>
              ) : (
                <span className="text-neutral-200">-</span>
              )}
            </td>
          );
        })}
        <td
          className="px-4 py-3 text-center font-mono tabular-nums font-bold text-blue-600 text-[11px] sticky right-0 z-10 shadow-[-4px_0_12px_rgba(0,0,0,0.02)] min-w-[50px] bg-white group-hover:bg-blue-50 border-l border-neutral-100"
          style={{
            backgroundColor:
              c.puntos > 0
                ? `rgba(34, 197, 94, ${
                    0.03 +
                    ((c.puntos - minCyclistRacePoints) /
                      (maxCyclistRacePoints -
                        minCyclistRacePoints || 1)) *
                      0.15
                  })`
                : "white",
          }}
        >
          {c.puntos}
        </td>
      </tr>
    );
  };

  return (
    <ReportCard
      title="Clasificación de Ciclistas"
      icon={<Users />}
      iconClassName="text-blue-600"
      filename="clasificacion-ciclistas"
      ref={tableRef}
      className="mt-12"
      toolbarProps={{
        isExpanded: isExpanded,
        onExpand: () => setIsExpanded(!isExpanded),
        onCopyImage: onCopyImage,
        isImageCopying: isCopying,
        onDownloadImage: onDownloadImage
      }}
      bodyClassName="p-0 border-t border-neutral-100"
    >
      <div className="flex justify-center w-full bg-neutral-50/30">
        <div
          id="cyclists-classification-table"
          className={cn(
            "overflow-hidden relative max-h-[75vh] w-full max-w-full",
            isExpanded ? "max-h-none" : ""
          )}
        >
          <div ref={scrollRef} className="table-responsive-wrapper min-h-[300px] overflow-auto w-full h-full crosshair-container">
            <table className="w-full min-w-[600px] text-[10px] text-left whitespace-nowrap border-collapse mx-auto">
              <thead className="bg-[#1e293b] text-white uppercase text-[9px] font-bold tracking-tight sticky top-0 z-10 shadow-sm select-none">
                <tr>
                  <th 
                    className="px-4 py-3 min-w-[140px] sticky left-0 bg-[#1e293b] z-20 border-r border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("ciclista")}
                  >
                    Ciclista {getSortIcon("ciclista")}
                  </th>
                  <th 
                    className="px-4 py-3 w-48 sticky left-[140px] shadow-[4px_0_12px_rgba(0,0,0,0.2)] bg-[#1e293b] z-20 border-r border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("jugador")}
                  >
                    Equipo [#Orden] {getSortIcon("jugador")}
                  </th>
                  <th 
                    className="px-4 py-3 text-center border-r border-slate-700 min-w-[50px] cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("victorias")}
                  >
                    Vict. {getSortIcon("victorias")}
                  </th>
                  {finalColumns?.map((col: any) => (
                    <th
                      key={col.formatted}
                      className="px-1.5 py-1.5 text-center font-bold border-r border-slate-700 min-w-[36px] cursor-pointer hover:bg-slate-700 transition-colors"
                      onClick={() => requestSort(col.formatted)}
                    >
                      {col.formatted} {getSortIcon(col.formatted)}
                    </th>
                  ))}
                  <th 
                    className="px-4 py-3 text-center font-bold sticky right-0 bg-[#1e293b] z-20 border-l border-slate-700 min-w-[50px] shadow-[-4px_0_12px_rgba(0,0,0,0.2)] cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => requestSort("puntos")}
                  >
                    Puntos {getSortIcon("puntos")}
                  </th>
                </tr>
              </thead>
              <VirtualizedTableBody
                scrollElementRef={scrollRef}
                items={filteredRaceCyclists}
                renderRow={renderRow}
                colSpan={4 + (finalColumns?.length || 0)}
                estimateSize={44}
                className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 italic md:not-italic"
              />
            </table>
          </div>
        </div>
      </div>
    </ReportCard>
  );
};
