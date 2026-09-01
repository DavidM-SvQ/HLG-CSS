import React, { useRef, useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Grid, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { useTableScreenshot } from "../../../../hooks/useTableScreenshot";
import { ReportCard } from "../../../ui/ReportCard";
import { copyTextToClipboard } from "../../../../lib/clipboard";

interface RacePointsPerRoundProps {
  raceTeams: any[];
  isExpanded?: boolean;
  setIsExpanded?: (val: boolean) => void;
  onCopyImage?: () => void;
  isCopying?: boolean;
  onDownloadImage?: () => void;
  tableRef?: React.RefObject<HTMLDivElement>;
}

export const RacePointsPerRound: React.FC<RacePointsPerRoundProps> = ({
  raceTeams,
  isExpanded = false,
  setIsExpanded,
  onCopyImage,
  isCopying: isParentCopying,
  onDownloadImage,
  tableRef: parentTableRef,
}) => {
  const localTableRef = useRef<HTMLDivElement>(null);
  const cardRef = parentTableRef || localTableRef;
  const [isCopying, setIsCopying] = useState<string | boolean>(false);
  const [isTextCopying, setIsTextCopying] = useState(false);
  const { handleCopyImage, handleDownloadImage } = useTableScreenshot(cardRef);
  
  const [sortColumn, setSortColumn] = useState<string>("total");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [hoverInfo, setHoverInfo] = useState<{
    team: string;
    round: string;
    rect: DOMRect;
  } | null>(null);

  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (hoverInfo) {
        setHoverInfo(null);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hoverInfo]);

  const handleCellMouseEnter = (e: React.MouseEvent<HTMLTableCellElement>, team: string, round: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverInfo({
      team,
      round,
      rect,
    });
  };

  const handleCellMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setHoverInfo(null);
    }, 150);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === "desc" ? "asc" : "desc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const reportData = useMemo(() => {
    const validTeams = raceTeams.filter(t => t.jugador !== "No draft" && t.jugador !== "No draft [99]");
    const allTeams = validTeams.map(t => t.nombreEquipo);
    
    const roundTeamPoints: Record<string, Record<string, number>> = {};
    const roundTeamHasRider: Record<string, Record<string, boolean>> = {};
    const roundTeamDetails: Record<string, Record<string, Array<{
      ciclista: string;
      ronda: string;
      total: number;
      concepts: any[];
    }>>> = {};
    const roundStats: Record<string, { max: number; min: number }> = {};
    const allRoundsSet = new Set<string>();
    
    validTeams.forEach(team => {
      const cyclistMap = new Map<string, { ciclista: string; ronda: string; total: number; concepts: any[]; }>();
      team?.details?.forEach((d: any) => {
        let rStr = "0";
        if (d.ronda !== undefined && d.ronda !== null && d.ronda !== "") {
          const num = parseInt(d.ronda.toString(), 10);
          if (!isNaN(num) && num > 0) {
            rStr = String(num).padStart(2, '0');
          } else if (d.ronda.toString().toUpperCase() === "FA") {
            rStr = "0";
          } else {
            rStr = d.ronda.toString();
          }
        }
        
        const key = `${d.ciclista}_${rStr}`;
        if (!cyclistMap.has(key)) {
          cyclistMap.set(key, { ciclista: d.ciclista, ronda: rStr, total: 0, concepts: [] });
        }
        const c = cyclistMap.get(key)!;
        c.total += (d.puntosObtenidos || 0);
        if (d.puntosObtenidos > 0) {
          c.concepts.push(d);
        }
      });
      
      Array.from(cyclistMap.values()).forEach(c => {
        const rStr = c.ronda;
        
        if (!roundTeamPoints[rStr]) roundTeamPoints[rStr] = {};
        if (!roundTeamPoints[rStr][team.nombreEquipo]) roundTeamPoints[rStr][team.nombreEquipo] = 0;
        roundTeamPoints[rStr][team.nombreEquipo] += c.total;
        
        if (!roundTeamHasRider[rStr]) roundTeamHasRider[rStr] = {};
        roundTeamHasRider[rStr][team.nombreEquipo] = true;

        if (!roundTeamDetails[rStr]) roundTeamDetails[rStr] = {};
        if (!roundTeamDetails[rStr][team.nombreEquipo]) roundTeamDetails[rStr][team.nombreEquipo] = [];

        // Sort cyclist concepts in ascending order by stage number
        const sortedConcepts = [...c.concepts].sort((a, b) => {
          const getStageNum = (item: any) => {
            const etapaStr = (item.etapa || "").toString();
            const tipoStr = (item.tipoResultado || "").toString();
            let num = NaN;
            const matchEtapa = etapaStr.match(/\d+/);
            if (matchEtapa) {
              num = parseInt(matchEtapa[0], 10);
            } else {
              const matchTipo = tipoStr.match(/etapa\s*(\d+)/i) || tipoStr.match(/(\d+)/);
              if (matchTipo) {
                num = parseInt(matchTipo[1], 10);
              }
            }
            return isNaN(num) ? 9999 : num;
          };
          
          const numA = getStageNum(a);
          const numB = getStageNum(b);
          if (numA !== numB) return numA - numB;
          
          const labelA = (a.tipoResultado || a.etapa || "").toString();
          const labelB = (b.tipoResultado || b.etapa || "").toString();
          return labelA.localeCompare(labelB);
        });

        roundTeamDetails[rStr][team.nombreEquipo].push({
          ciclista: c.ciclista,
          ronda: c.ronda,
          total: c.total,
          concepts: sortedConcepts
        });
        
        allRoundsSet.add(rStr);
      });
    });

    if (validTeams.length > 0) {
      let maxRoundFound = 0;
      Array.from(allRoundsSet).forEach(r => {
        const num = parseInt(r, 10);
        if (!isNaN(num) && num > maxRoundFound) maxRoundFound = num;
      });
      
      const targetMax = Math.max(maxRoundFound, 25);
      for (let i = 1; i <= targetMax; i++) {
        allRoundsSet.add(String(i).padStart(2, '0'));
      }
    }
    
    const allRounds = Array.from(allRoundsSet).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      const isNumA = !isNaN(numA);
      const isNumB = !isNaN(numB);
      
      if (isNumA && isNumB) return numA - numB;
      if (isNumA) return -1;
      if (isNumB) return 1;
      return a.localeCompare(b);
    });

    // Calculate max and min per round column for values > 0
    allRounds.forEach(r => {
      const ptsList = allTeams.map(team => roundTeamPoints[r]?.[team] || 0);
      const positivePts = ptsList.filter(p => p > 0);
      roundStats[r] = {
        max: positivePts.length > 0 ? Math.max(...positivePts) : 0,
        min: positivePts.length > 0 ? Math.min(...positivePts) : 0
      };
    });
    
    allTeams.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortColumn === "equipo") {
        valA = a;
        valB = b;
      } else if (sortColumn === "total") {
        valA = allRounds.reduce((acc, r) => acc + (roundTeamPoints[r]?.[a] || 0), 0);
        valB = allRounds.reduce((acc, r) => acc + (roundTeamPoints[r]?.[b] || 0), 0);
      } else {
        valA = roundTeamPoints[sortColumn]?.[a] || 0;
        valB = roundTeamPoints[sortColumn]?.[b] || 0;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === "asc" ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });

    return { allTeams, allRounds, roundTeamPoints, roundTeamHasRider, roundTeamDetails, roundStats };
  }, [raceTeams, sortColumn, sortDirection]);

  const handleCopyText = async () => {
    if (!reportData) return;
    setIsTextCopying(true);
    let text = "🏆 Puntos por Ronda y Equipo\n\n";
    
    const getRoundLabel = (r: string) => {
      if (r === "0" || r.toUpperCase() === "FA") return "FA";
      const num = parseInt(r, 10);
      if (!isNaN(num) && num > 0) return `R${String(num).padStart(2, '0')}`;
      return `R${r}`;
    };

    const header = ["Equipo", ...reportData.allRounds.map(getRoundLabel), "TOTAL"];
    text += header.join("\t") + "\n";
    
    reportData.allTeams.forEach(team => {
      let teamTotal = 0;
      const row = [team];
      reportData.allRounds.forEach((round: string) => {
        const pts = reportData.roundTeamPoints[round]?.[team] || 0;
        const hasRider = reportData.roundTeamHasRider[round]?.[team];
        teamTotal += pts;
        row.push(pts > 0 ? pts.toString() : (hasRider ? "0" : "-"));
      });
      row.push(teamTotal.toString());
      text += row.join("\t") + "\n";
    });
    
    const success = await copyTextToClipboard(text, "puntos-ronda-equipo.txt");
    setTimeout(() => setIsTextCopying(false), 2000);
  };

  const handleCopy = async () => {
    setIsCopying(true);
    await handleCopyImage({});
    setTimeout(() => setIsCopying(false), 2000);
  };

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity ml-1 inline-block" />;
    return sortDirection === "desc" 
      ? <ArrowDown className="w-3 h-3 text-blue-600 ml-1 inline-block" />
      : <ArrowUp className="w-3 h-3 text-blue-600 ml-1 inline-block" />;
  };

  const getHeatMapStyle = (pts: number, maxPts: number): React.CSSProperties => {
    if (pts <= 0 || maxPts <= 0) return {};
    const ratio = Math.min(1, Math.max(0.04, pts / maxPts));
    
    // Green heat map scale from pale green tint (94% lightness) down to rich emerald (44% lightness)
    const lightness = 94 - ratio * 50;
    const saturation = 55 + ratio * 20;
    const bg = `hsl(142, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
    
    const isDarkBg = lightness < 64;
    const textColor = isDarkBg ? "#ffffff" : "#064e3b";
    const fontWeight = ratio > 0.35 ? (ratio > 0.75 ? "700" : "600") : "500";
    
    return {
      backgroundColor: bg,
      color: textColor,
      fontWeight: fontWeight
    };
  };

  const formatStageConcept = (c: any) => {
    let label = c.tipoResultado || "";
    const tipoLower = label.toLowerCase();
    if (tipoLower === 'etapa' && c.etapa) {
      label = `Etapa ${c.etapa.toString().replace(/etapa/i, '').trim()}`;
    } else if (c.etapa && tipoLower !== 'etapa' && c.etapa.toLowerCase() !== 'cg' && c.etapa.toLowerCase() !== 'gc') {
      const cleanedEtapa = c.etapa.toString().replace(/etapa/i, '').trim();
      if (tipoLower.includes('etapa')) {
        if (tipoLower.includes('crono') && tipoLower.includes('equipo')) {
          label = `Etapa ${cleanedEtapa} (CRE)`;
        } else {
          label = `Etapa ${cleanedEtapa} (${c.tipoResultado})`;
        }
      } else {
        label = `${c.tipoResultado} (Etapa ${cleanedEtapa})`;
      }
    }
    if (c.posicion) {
      const posClean = c.posicion.toString().replace(/^p/i, "").trim();
      label += ` (Pos ${posClean})`;
    }
    return label || "Puntos";
  };

  if (!reportData || reportData.allRounds.length === 0) return null;

  return (
    <ReportCard
      title="Puntos por Ronda y Equipo"
      icon={<Grid />}
      iconClassName="text-blue-600"
      filename="puntos-ronda-equipo"
      ref={cardRef}
      className="mt-12"
      toolbarProps={{
        isExpanded: isExpanded,
        onExpand: () => setIsExpanded && setIsExpanded(!isExpanded),
        onCopyImage: onCopyImage || handleCopy,
        isImageCopying: isParentCopying ?? isCopying,
        onDownloadImage: onDownloadImage || (() => handleDownloadImage({ fileName: "puntos-ronda-equipo.png" })),
        onCopyText: handleCopyText,
        isTextCopying: isTextCopying,
        useClipboardIconForText: true,
      }}
      bodyClassName="p-0 border-t border-neutral-100"
    >
      <div className="flex justify-center w-full bg-neutral-50/30">
        <div
          id="race-points-per-round-table"
          className="relative w-full max-w-full"
        >
          <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container">
            <table className="w-full text-xs text-left whitespace-nowrap border-separate border-spacing-0">
              <thead>
              <tr>
                <th 
                  className="py-2 pl-4 sticky left-0 bg-neutral-50 z-20 border-r border-b border-neutral-200 pr-2 shadow-sm font-bold min-w-[150px] cursor-pointer group hover:bg-neutral-100 transition-colors select-none"
                  onClick={() => handleSort("equipo")}
                >
                  <div className="flex items-center">
                    Equipo {renderSortIcon("equipo")}
                  </div>
                </th>
                {reportData.allRounds.map((r: string) => {
                  const label = r === "0" || r.toUpperCase() === "FA" ? "FA" : (parseInt(r, 10) > 0 ? `R${String(parseInt(r, 10)).padStart(2, '0')}` : `R${r}`);
                  return (
                    <th
                      key={r}
                      className="py-2 px-2 text-center font-bold text-neutral-500 w-10 border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10 cursor-pointer group hover:bg-neutral-100 transition-colors select-none"
                      onClick={() => handleSort(r)}
                    >
                      <div className="flex justify-center items-center">
                        {label} {renderSortIcon(r)}
                      </div>
                    </th>
                  );
                })}
                <th 
                  className="py-2 px-4 text-right font-bold text-blue-600 bg-blue-50/50 sticky top-0 z-10 border-b border-neutral-200 cursor-pointer group hover:bg-blue-100/50 transition-colors select-none"
                  onClick={() => handleSort("total")}
                >
                  <div className="flex justify-end items-center">
                    TOTAL {renderSortIcon("total")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 bg-white">
              {reportData.allTeams.map((team: string) => {
                let teamTotal = 0;
                const cells = reportData.allRounds.map((round: string) => {
                  const pts = reportData.roundTeamPoints[round]?.[team] || 0;
                  const hasRider = reportData.roundTeamHasRider[round]?.[team];
                  teamTotal += pts;

                  const isZero = hasRider && pts === 0;
                  const isNoRider = !hasRider && pts === 0;
                  const roundMax = reportData.roundStats[round]?.max || 0;
                  const roundMin = reportData.roundStats[round]?.min || 0;
                  const isMax = pts > 0 && pts === roundMax;
                  const isMin = pts > 0 && pts === roundMin && roundMax !== roundMin;

                  let cellStyle: React.CSSProperties = {};
                  let textStyleClass = "text-neutral-800";

                  if (isZero) {
                    cellStyle = { backgroundColor: '#fee2e2' }; // Red background
                    textStyleClass = "text-red-600 font-medium";
                  } else if (isNoRider) {
                    cellStyle = { backgroundColor: '#f9fafb' }; // Gray background
                    textStyleClass = "text-neutral-400 font-normal";
                  } else if (isMax) {
                    cellStyle = { backgroundColor: '#dcfce7' }; // Green background
                    textStyleClass = "text-emerald-800 font-bold";
                  } else if (isMin) {
                    cellStyle = { backgroundColor: '#fef9c3' }; // Yellow background
                    textStyleClass = "text-amber-800 font-semibold";
                  }

                  return (
                    <td 
                      key={round} 
                      className={cn(
                        "px-2 py-2 text-center border-r border-neutral-100 transition-colors select-none cursor-pointer hover:outline hover:outline-2 hover:outline-blue-500 hover:z-20", 
                        textStyleClass
                      )} 
                      style={cellStyle}
                      onMouseEnter={(e) => handleCellMouseEnter(e, team, round)}
                      onMouseLeave={handleCellMouseLeave}
                    >
                      <span className="cursor-pointer">{pts > 0 ? pts : (hasRider ? "0" : "-")}</span>
                    </td>
                  );
                });
                return (
                  <tr key={team} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-2 font-medium text-neutral-900 border-r border-neutral-200 bg-white sticky left-0 z-10" title={team}>
                      {team}
                    </td>
                    {cells}
                    <td className="px-4 py-2 text-right font-bold text-blue-700 bg-blue-50/30">
                      {teamTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Floating Detailed Tooltip on Cell Hover (Portaled to document.body) */}
      {hoverInfo && typeof document !== "undefined" && document.body && createPortal((() => {
        const { team, round, rect } = hoverInfo;
        const pts = reportData?.roundTeamPoints?.[round]?.[team] || 0;
        const hasRider = reportData?.roundTeamHasRider?.[round]?.[team];
        const cyclists = reportData?.roundTeamDetails?.[round]?.[team] || [];
        const roundLabel = round === "0" || round.toUpperCase() === "FA" ? "FA" : (parseInt(round, 10) > 0 ? `R${String(parseInt(round, 10)).padStart(2, '0')}` : `R${round}`);
        
        // Accurate viewport measurement
        const docEl = document.documentElement || document.body;
        const viewportWidth = window?.innerWidth || docEl?.clientWidth || 1200;
        const viewportHeight = window?.innerHeight || docEl?.clientHeight || 800;

        const tooltipWidth = Math.min(320, Math.max(260, viewportWidth - 24));
        const cellCenterX = rect ? rect.left + rect.width / 2 : viewportWidth / 2;
        
        // Calculate target left coordinate centered on cell
        let targetLeft = cellCenterX - tooltipWidth / 2;

        // Strictly keep within viewport margins (at least 16px from edges)
        if (targetLeft + tooltipWidth > viewportWidth - 16) {
          targetLeft = viewportWidth - tooltipWidth - 16;
        }
        if (targetLeft < 16) {
          targetLeft = 16;
        }

        const spaceAbove = rect ? rect.top : 0;
        const spaceBelow = rect ? viewportHeight - rect.bottom : viewportHeight;
        const showAbove = spaceBelow < 240 && spaceAbove > spaceBelow;

        const positionStyles: React.CSSProperties = {
          position: "fixed",
          left: `${Math.round(targetLeft)}px`,
          width: `${Math.round(tooltipWidth)}px`,
          maxWidth: `calc(100vw - 32px)`,
          zIndex: 999999,
          pointerEvents: "none",
        };

        if (showAbove && rect) {
          positionStyles.bottom = `${Math.max(12, Math.round(viewportHeight - rect.top + 8))}px`;
          positionStyles.maxHeight = `${Math.max(120, Math.min(380, spaceAbove - 20))}px`;
        } else if (rect) {
          positionStyles.top = `${Math.max(12, Math.round(rect.bottom + 8))}px`;
          positionStyles.maxHeight = `${Math.max(120, Math.min(380, spaceBelow - 20))}px`;
        }

        return (
          <div
            className="fixed z-[999999] pointer-events-none bg-slate-900 text-slate-100 rounded-xl p-3.5 shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs flex flex-col transition-opacity duration-150 animate-in fade-in zoom-in-95 box-border"
            style={positionStyles}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 select-none">
              <div>
                <div className="font-bold text-white text-xs truncate max-w-[180px]">{team}</div>
                <div className="text-[10px] text-slate-400 font-mono">Ronda {roundLabel}</div>
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded font-mono font-bold text-xs",
                pts > 0 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : (hasRider ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-slate-800 text-slate-400")
              )}>
                {pts > 0 ? `+${pts} pts` : (hasRider ? "0 pts" : "Sin ciclista")}
              </div>
            </div>

            {/* Cyclists & Stages Breakdown */}
            {!hasRider ? (
              <div className="text-[11px] text-slate-400 italic py-1">
                Ningún ciclista de esta ronda ha participado en la carrera (-).
              </div>
            ) : cyclists.length === 0 ? (
              <div className="text-[11px] text-slate-400 italic py-1">
                Sin datos de ciclista para esta ronda.
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-800/40 [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                {cyclists.map((c, idx) => {
                  const maxStagePts = Math.max(...(c.concepts || []).map((det: any) => det.puntosObtenidos || 0), 0);

                  return (
                    <div key={idx} className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700/60">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-100 truncate pr-1">{c.ciclista}</span>
                        <span className={cn("font-mono font-bold text-[11px]", c.total > 0 ? "text-emerald-400" : "text-slate-400")}>
                          {c.total > 0 ? `+${c.total} pts` : "0 pts"}
                        </span>
                      </div>
                      
                      {c.concepts && c.concepts.length > 0 ? (
                        <div className="space-y-1 mt-1.5 pt-1.5 border-t border-slate-700/50">
                          {c.concepts.map((concept: any, cIdx: number) => {
                            const isMaxStage = concept.puntosObtenidos > 0 && concept.puntosObtenidos === maxStagePts;

                            return (
                              <div key={cIdx} className="flex justify-between items-center text-[10px] gap-2">
                                <span className="truncate text-slate-300">{formatStageConcept(concept)}</span>
                                <span 
                                  className={cn(
                                    "font-mono shrink-0 px-1 py-0.2 rounded",
                                    isMaxStage 
                                      ? "text-emerald-400 font-bold bg-emerald-500/20 border border-emerald-500/40" 
                                      : "text-slate-300 font-medium"
                                  )}
                                >
                                  +{concept.puntosObtenidos}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">
                          Sin puntos sumados en etapas (0 pts)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })(), document.body)}
    </ReportCard>
  );
};
