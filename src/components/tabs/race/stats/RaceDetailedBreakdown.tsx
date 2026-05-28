import React, { useMemo } from "react";
import { Users, X, CheckCircle2, Camera } from "lucide-react";
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

  const processedTeams = useMemo(() => {
    const valid = raceTeams
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
  }, [raceTeams]);

  const { valid, numBlocks } = processedTeams;

  return (
    <ReportCard
      title="Desglose por Equipo"
      icon={<Users />}
      iconClassName="text-blue-600"
      filename="desglose-equipo"
      ref={tableRef}
      className="mt-12"
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
                                {c.tipoResultado} {c.posicion ? `(Pos ${c.posicion.toString().replace(/^p/i, "")})` : ""}
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
