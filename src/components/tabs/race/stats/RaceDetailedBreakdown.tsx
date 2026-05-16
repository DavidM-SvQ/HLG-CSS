import React from "react";
import { Users, X, CheckCircle2, Copy } from "lucide-react";
import { ExportToolbar } from "../../../ui/ExportToolbar";
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
    <div className="mt-12">
      <div className="flex items-center justify-between border-b pb-3 mb-6">
        <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Desglose por Equipo
        </h3>
        <div className="flex items-center gap-1.5">
          <ExportToolbar 
            isExpanded={isExpanded} 
            onExpand={() => setIsExpanded(!isExpanded)} 
            onCopyText={onCopyText} 
            isTextCopying={isTextCopying} 
            useClipboardIconForText={true} 
            textCopyLabel="" 
            onCopyImage={() => onCopyImage("full")} 
            isImageCopying={isImageCopying === "full"} 
            onDownloadImage={onDownloadImage} 
            customImageButtons={ raceTeams.length > 12 ? (
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
            }
          />
        </div>
      </div>
      <div
        id="detailed-team-breakdown"
        ref={tableRef}
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-2 -mx-2 rounded-xl",
          isExpanded ? "fixed inset-4 z-50 overflow-auto p-6 shadow-2xl m-0" : ""
        )}
      >
        {isExpanded && (
          <Button variant="outline"
            onClick={() => setIsExpanded(false)}
            className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore"
          >
            <X className="w-6 h-6" />
          </Button>
        )}
        {raceTeams.map((team: any) => {
          const cyclistMap = new Map<string, { ronda: string; total: number; concepts: any[]; }>();
          team?.details?.forEach((d: any) => {
            if (!cyclistMap.has(d.ciclista)) {
              cyclistMap.set(d.ciclista, { ronda: d.ronda, total: 0, concepts: [] });
            }
            const c = cyclistMap.get(d.ciclista)!;
            c.total += d.puntosObtenidos;
            c.concepts.push(d);
          });

          const sortedCyclists = Array.from(cyclistMap.entries())
            .filter(([_, data]) => team.jugador !== "No draft" || data.total > 0)
            .sort((a, b) => b[1].total - a[1].total);

          if (sortedCyclists.length === 0) return null;

          return (
            <div
              key={team.jugador}
              className="team-card-breakdown bg-neutral-50 rounded-lg p-4 border border-neutral-200 flex flex-col h-full min-w-[240px]"
            >
              <div className="flex justify-between items-center mb-2 border-b border-neutral-200 pb-1.5 gap-4">
                <span className="font-bold text-neutral-900 text-base whitespace-nowrap">
                  {team.nombreEquipo} [#{team.orden}]
                </span>
                <span className="font-mono font-bold text-blue-600 text-base whitespace-nowrap">
                  {team.totalPoints} pts
                </span>
              </div>
              <div className="space-y-1.5 flex-1">
                {sortedCyclists.map(([ciclista, data], idx) => (
                  <div key={idx} className="bg-white p-3 rounded border border-neutral-100 shadow-sm">
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <span className="font-bold text-neutral-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                        {ciclista} &lt;{data.ronda}&gt;
                      </span>
                      <span
                        className={cn(
                          "font-mono font-bold px-2 py-0.5 rounded text-xs whitespace-nowrap shrink-0",
                          data.total > 0 ? "text-green-700 bg-green-50" : "text-neutral-400 bg-neutral-50"
                        )}
                      >
                        {data.total > 0 ? `+${data.total}` : "0"}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {data.concepts
                        .filter((c: any) => c.puntosObtenidos > 0)
                        .map((c: any, cIdx: number) => (
                          <div
                            key={cIdx}
                            className="flex justify-between items-center text-[12px] mt-1 text-neutral-500 pl-2 border-l-2 border-neutral-200 gap-2"
                          >
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                              {c.tipoResultado} {c.posicion ? `(Pos ${c.posicion.toString().replace(/^p/i, "")})` : ""}
                            </span>
                            <span className="font-mono text-[11px] whitespace-nowrap shrink-0">
                              {c.puntosObtenidos > 0 ? `+${c.puntosObtenidos}` : "0"}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
