import React from "react";
import { Camera, Maximize2, Table2, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { Button } from "../../../ui/button";
import { useTableScreenshot } from "../../../../hooks/useTableScreenshot";
import { Sheet, SheetContent, SheetTrigger } from "../../../ui/sheet";

export const GhostDraftRosterTable = ({ flatRows }: { flatRows: any[] }) => {
  const tableRef = React.useRef<HTMLDivElement>(null);
  const { handleCopyImage, isCopying } = useTableScreenshot(tableRef);
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 mb-2">
        <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          Draft fantasma
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-neutral-600 hover:text-indigo-600"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">{isExpanded ? "Reducir" : "Ampliar"}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const headers = ["Elección", "Equipo", "Orden", "Ronda", "C. Fantasma", "Ptos", "C. Elegido", "Ptos", "Dif", "Nota"];
              const rows = flatRows.map((r: any) => [
                r.pickNumber, r.teamName, r.orderDraft, r.round, r.ghost, r.ghostPoints, r.original, r.originalPoints, r.diff, r.original === r.ghost ? "🎯" : r.diff <= 500 ? "📉" : "☠️"
              ].join('\t'));
              navigator.clipboard.writeText([headers.join('\t'), ...rows].join('\n'));
            }}
            className="flex items-center gap-2 text-neutral-600 hover:text-indigo-600"
          >
            <Table2 className="w-4 h-4" />
            <span className="hidden sm:inline">Copiar texto</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleCopyImage({ fileName: 'draft-fantasma.png', scale: 3 })}
            disabled={isCopying}
            className="hidden sm:flex items-center gap-2 text-neutral-600 hover:text-indigo-600"
          >
            {isCopying ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Camera className="w-4 h-4" />}
            Copiar imagen
          </Button>
        </div>
      </div>
      
      <div ref={tableRef} className={cn("bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm", isExpanded ? "fixed inset-4 z-50 overflow-auto flex flex-col" : "")}>
        <div className={cn("overflow-auto", !isExpanded && "max-h-[1600px]")}>
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-100/50 text-neutral-500 text-xs uppercase font-medium border-b border-neutral-200 sticky top-0 z-10 shadow-sm bg-white">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap text-center">Elección</th>
                <th className="px-4 py-3 whitespace-nowrap">Nombre Equipo</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">Orden Draft</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">Ronda</th>
                <th className="px-4 py-3 text-indigo-700 bg-indigo-50/50">Ciclista Fantasma</th>
                <th className="px-4 py-3 text-right bg-indigo-50/50 text-indigo-700 whitespace-nowrap">Ptos Fantasma</th>
                <th className="px-4 py-3">Ciclista Elegido</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Ptos Elegido</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Dif puntos</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {flatRows.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-neutral-200 text-neutral-600 text-xs font-bold">
                      {row.pickNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {row.teamName}
                  </td>
                  <td className="px-4 py-3 text-center text-neutral-500">
                    {row.orderDraft}
                  </td>
                  <td className="px-4 py-3 text-center text-neutral-500">
                    {row.round}
                  </td>
                  <td className="px-4 py-3 bg-indigo-50/30">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span className="font-bold text-indigo-900">{row.ghost}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-indigo-700 bg-indigo-50/30">
                    {row.ghostPoints.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-800">
                    {row.original}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-600">
                    {row.originalPoints.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="flex-1 max-w-[80px] h-1.5 bg-neutral-100 rounded-full overflow-hidden flex justify-end">
                        {row.diff > 0 && (
                          <div className="h-full bg-gradient-to-l from-red-500 to-red-400 rounded-full" style={{ width: `${Math.min((row.diff / 1000) * 100, 100)}%` }} />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs font-bold w-12 text-right",
                        row.diff > 0 ? "text-red-600" : row.diff < 0 ? "text-emerald-600" : "text-neutral-400"
                      )}>
                        {row.diff > 0 ? "+" : ""}{row.diff.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.original === row.ghost ? (
                      <span className="text-lg" title="Elección perfecta">🎯</span>
                    ) : row.diff <= 500 ? (
                      <span className="text-lg" title="Elección aceptable">📉</span>
                    ) : (
                      <Sheet>
                        <SheetTrigger className="inline-flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 p-1 rounded-md transition-colors group border-none outline-none focus:ring-2 focus:ring-indigo-500/50">
                          <span className="text-lg" title="Mala elección - Clic para ver opciones">☠️</span>
                          <span className="text-[9px] font-bold text-neutral-400 group-hover:text-amber-600 flex items-center gap-0.5 mt-0.5 uppercase tracking-wider">¿Qué si...? <HelpCircle className="w-2.5 h-2.5" /></span>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md w-full p-0 overflow-hidden flex flex-col">
                          <div className="bg-neutral-900 px-5 py-6 shrink-0">
                            <h4 className="font-bold text-white text-lg flex items-center gap-2">
                              Simulador "¿Y si...?"
                            </h4>
                            <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
                              En la elección <strong>#{row.pickNumber}</strong>, en lugar de a <strong className="text-white">{row.original}</strong> ({row.originalPoints} pts), podrías haber elegido a:
                            </p>
                          </div>
                          <div className="bg-white flex-1 overflow-y-auto">
                            {row.missedOpportunities && row.missedOpportunities.length > 0 ? (
                              <div className="divide-y divide-neutral-100 pb-8">
                                {row.missedOpportunities.map((mo: any, i: number) => (
                                  <div key={i} className="px-5 py-4 hover:bg-neutral-50 flex items-center justify-between group/row transition-colors">
                                    <div className="flex flex-col min-w-0 pr-4">
                                      <span className="text-base font-bold text-neutral-900 truncate">{mo.name}</span>
                                      <span className="text-xs text-neutral-500 mt-1">
                                        Elegido en <strong className="text-neutral-700">Elec. #{mo.pickedAtPick}</strong> (Ronda {mo.pickedAtRound}) por <strong className="text-neutral-700 truncate inline-block max-w-[120px] align-bottom">{mo.pickedBy}</strong>
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                      <span className="text-base font-bold text-indigo-600">{mo.points.toLocaleString()} pts</span>
                                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded mt-1 shadow-sm">+{(mo.points - row.originalPoints).toLocaleString()} pts</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-3 h-full pb-20">
                                <span className="text-5xl">🤯</span>
                                <span className="text-base mt-2">No había mejores opciones disponibles</span>
                              </div>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}
                  </td>
                </tr>
              ))}
              {flatRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-neutral-500 italic">
                    No hay selecciones que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
