import React, { useMemo, useState, useRef, useEffect } from "react";
import { Users, Filter, ChevronDown, CheckCircle2 } from "lucide-react";
import { ReportCard } from "../../../ui/ReportCard";
import { Button } from "../../../ui/button";
import { cn } from "../../../../lib/utils";

export const RaceDetailedBreakdown = ({
  raceTeams,
  isExpanded,
  setIsExpanded,
  onCopyText,
  isTextCopying,
  onCopyImage,
  isImageCopying,
  onDownloadImage,
  tableRef,
}: any) => {
  const [selectedTeamsFilter, setSelectedTeamsFilter] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allTeamNames = useMemo(() => {
    return Array.from(new Set(raceTeams.map((t: any) => t.nombreEquipo))).filter(Boolean) as string[];
  }, [raceTeams]);

  const processedTeams = useMemo(() => {
    let valid = raceTeams
      .map((team: any, originalIndex: number) => {
        let weight = 4; // Headers spacing

        const cyclistMap = new Map<string, { ronda: string; total: number; concepts: any[]; }>();
        team?.details?.forEach((d: any) => {
          if (!cyclistMap.has(d.ciclista)) {
            cyclistMap.set(d.ciclista, { ronda: d.ronda, total: 0, concepts: [] });
          }
          const c = cyclistMap.get(d.ciclista)!;
          c.total += d.puntosObtenidos;
          if (d.puntosObtenidos > 0) {
            c.concepts.push(d);
          }
        });

        const sortedCyclists = Array.from(cyclistMap.entries())
          .filter(([_, data]) => team.jugador !== "No draft" || data.total > 0)
          .sort((a, b) => b[1].total - a[1].total);

        sortedCyclists.forEach(([_, data]) => {
          weight += 2; // Cyclist header
          weight += Math.max(1, data.concepts.length); // Rows
        });

        return { team, originalIndex, sortedCyclists, weight };
      })
      .filter((t: any) => t.sortedCyclists.length > 0 || t.team.totalPoints > 0);

    // Filtrar por equipos seleccionados
    if (selectedTeamsFilter.length > 0) {
      valid = valid.filter((t: any) => selectedTeamsFilter.includes(t.team.nombreEquipo));
    }

    const totalWeight = valid.reduce((acc: number, cur: any) => acc + cur.weight, 0);
    const numBlocks = valid.length > 18 ? 3 : (valid.length > 8 ? 2 : 1);
    const targetWeight = totalWeight / numBlocks;

    let currentBlock = 1;
    let currentWeight = 0;

    valid.forEach((t: any) => {
      if (currentBlock < numBlocks && currentWeight + (t.weight / 2) > targetWeight) {
        currentBlock++;
        currentWeight = 0;
      }
      t.block = currentBlock;
      currentWeight += t.weight;
    });

    return { valid, numBlocks };
  }, [raceTeams, selectedTeamsFilter]);

  const { valid, numBlocks } = processedTeams;

  return (
    <ReportCard
      title="Desglose por Equipo"
      icon={<Users />}
      iconClassName="text-blue-600"
      filename="desglose-equipo"
      ref={tableRef}
      className="mt-12"
      headerExtra={
        <div className="relative inline-block text-left" ref={filterRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-1.5 text-xs h-8 text-neutral-600 hover:text-blue-700 border-neutral-200 transition-all font-medium bg-white shadow-sm"
          >
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <span>Equipos ({selectedTeamsFilter.length === 0 ? "Todos" : `${selectedTeamsFilter.length}/${allTeamNames.length}`})</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </Button>

          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl z-[90] py-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 border-b border-neutral-100 flex justify-between items-center mb-1 bg-neutral-50/50 rounded-t-xl">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Seleccionar Equipos</span>
                {selectedTeamsFilter.length > 0 && (
                  <button
                    onClick={() => setSelectedTeamsFilter([])}
                    className="text-[10px] text-blue-600 hover:underline font-semibold"
                  >
                    Mostrar todos
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto px-1 py-1 space-y-0.5">
                {allTeamNames.length === 0 ? (
                  <div className="text-[11px] text-neutral-400 italic text-center py-4">No hay equipos</div>
                ) : (
                  allTeamNames.map(name => {
                    const isSelected = selectedTeamsFilter.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTeamsFilter(selectedTeamsFilter.filter(t => t !== name));
                          } else {
                            setSelectedTeamsFilter([...selectedTeamsFilter, name]);
                          }
                        }}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between",
                          isSelected ? "bg-blue-50/80 text-blue-750 font-semibold" : "hover:bg-neutral-50 text-neutral-700"
                        )}
                      >
                        <span className="truncate pr-2">{name}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // dummy block handled by father click
                          className="w-3.5 h-3.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 rounded-sm pointer-events-none"
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      }
      toolbarProps={{
        isExpanded: isExpanded,
        onExpand: () => setIsExpanded(!isExpanded),
        onCopyText: onCopyText,
        isTextCopying: isTextCopying,
        useClipboardIconForText: true,
        textCopyLabel: "",
        onCopyImage: (range?: string) => onCopyImage(range || "full"),
        isImageCopying: isImageCopying,
        onDownloadImage: (range?: string) => onDownloadImage?.(range || "full"),
        numBlocks: numBlocks > 1 ? numBlocks : undefined,
      }}
      bodyClassName="bg-white p-4 rounded-b-xl border-t border-neutral-100"
    >
      <div
        id="detailed-team-breakdown"
        className={cn(
          "w-full h-full",
          isExpanded ? "max-h-none" : "max-h-[800px] overflow-y-auto"
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-w-[800px] p-2 crosshair-container">
          {valid.map(({ team, originalIndex, sortedCyclists, block }: any) => {
            return (
              <div 
                key={team.jugador} 
                data-team-card 
                data-team-index={originalIndex + 1}
                data-block={block}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-full"
              >
                {/* Team Header */}
                <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-bold text-neutral-900 leading-tight truncate max-w-[240px]" title={`${team.nombreEquipo} [#${team.orden}]`}>
                      {team.nombreEquipo} <span className="font-mono text-neutral-500 opacity-80 font-normal">[{'#'}{team.orden}]</span>
                    </span>
                  </div>
                  <div className="bg-blue-100 text-blue-800 font-bold font-mono px-3 py-1 rounded-full text-sm">
                    {team.totalPoints} pts
                  </div>
                </div>

                {/* Cyclists List */}
                <div className="p-0 flex-1 divide-y divide-neutral-100">
                  {sortedCyclists.map(([ciclista, data]: any) => (
                    <div key={ciclista} className="px-4 py-3 hover:bg-neutral-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-neutral-800 text-sm">
                          {ciclista} <span className="text-neutral-400 font-normal text-xs ml-1">&lt;{data.ronda}&gt;</span>
                        </div>
                        <div className="text-xs font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                          +{data.total}
                        </div>
                      </div>
                      
                      {data.concepts.length > 0 ? (
                        <div className="space-y-1.5 mt-2 col-span-2">
                          {data.concepts.map((c: any, compIdx: number) => (
                            <div key={compIdx} className="flex justify-between items-center text-[11px] leading-tight">
                              <span className="text-neutral-600 truncate mr-2">
                                {(() => {
                                  let label = c.tipoResultado || "";
                                  const tipoLower = label.toLowerCase();
                                  if (tipoLower === 'etapa' && c.etapa) {
                                    label = `Etapa ${c.etapa.toString().replace(/etapa/i, '').trim()}`;
                                  } else if (c.etapa && tipoLower !== 'etapa' && c.etapa.toLowerCase() !== 'cg' && c.etapa.toLowerCase() !== 'gc') {
                                    const cleanedEtapa = c.etapa.toString().replace(/etapa/i, '').trim();
                                    if (tipoLower.includes('etapa')) {
                                      if (tipoLower.includes('crono') && tipoLower.includes('equipo')) {
                                        label = `Etapa ${cleanedEtapa} (Crono equipos)`;
                                      } else {
                                        label = `Etapa ${cleanedEtapa} (${c.tipoResultado})`;
                                      }
                                    } else {
                                      label = `${c.tipoResultado} (Etapa ${cleanedEtapa})`;
                                    }
                                  }
                                  return label;
                                })()}
                                {c.posicion ? ` (Pos ${c.posicion.toString().replace(/^p/i, "").trim()})` : ""}
                              </span>
                              <span className="font-mono text-neutral-500 shrink-0">
                                +{c.puntosObtenidos}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] italic text-neutral-400 mt-1">
                          Sin puntos conseguidos
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ReportCard>
  );
};
