import React from "react";
import { Users, X, CheckCircle2, Copy } from "lucide-react";
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
        onCopyImage: () => onCopyImage("full"),
        isImageCopying: isImageCopying === "full",
        onDownloadImage: onDownloadImage,
        customImageButtons: raceTeams.length > 12 ? (
          <div className="flex border-l border-neutral-200 pl-2 gap-1.5 ml-1">
            <Button variant="outline"
              onClick={() => onCopyImage("first")}
              disabled={!!isImageCopying}
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all copy-button-ignore",
                isImageCopying === "first"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                isImageCopying && isImageCopying !== "first" && "opacity-50 cursor-not-allowed"
              )}
              title="Copiar equipos 1-12"
            >
              {isImageCopying === "first" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              1-12
            </Button>
            <Button variant="outline"
              onClick={() => onCopyImage("second")}
              disabled={!!isImageCopying}
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all copy-button-ignore",
                isImageCopying === "second"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                isImageCopying && isImageCopying !== "second" && "opacity-50 cursor-not-allowed"
              )}
              title="Copiar equipos 13-24"
            >
              {isImageCopying === "second" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              13-24
            </Button>
            {raceTeams.length > 24 && (
              <Button variant="outline"
                onClick={() => onCopyImage("third")}
                disabled={!!isImageCopying}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all copy-button-ignore",
                  isImageCopying === "third"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                  isImageCopying && isImageCopying !== "third" && "opacity-50 cursor-not-allowed"
                )}
                title="Copiar equipos 25+"
              >
                {isImageCopying === "third" ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                25+
              </Button>
            )}
          </div>
        ) : null
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
          {raceTeams.filter((team: any) => team.totalPoints > 0 || team.jugador !== "No draft").map((team: any, teamIdx: number) => {
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

            if (sortedCyclists.length === 0) return null;

            return (
              <div 
                key={team.jugador} 
                data-team-card 
                data-team-index={teamIdx + 1}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-full"
              >
                {/* Team Header */}
                <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-bold text-neutral-900 leading-tight truncate max-w-[200px]" title={team.nombreEquipo}>
                      {team.nombreEquipo}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">#{team.orden}</span>
                  </div>
                  <div className="bg-blue-100 text-blue-800 font-bold font-mono px-3 py-1 rounded-full text-sm">
                    {team.totalPoints} pts
                  </div>
                </div>

                {/* Cyclists List */}
                <div className="p-0 flex-1 divide-y divide-neutral-100">
                  {sortedCyclists.map(([ciclista, data]) => (
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
