import React from "react";
import { Copy, Camera, Download, Maximize2, Table2, CheckCircle2, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Minus } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { Button } from "../../../ui/button";
import { useTableScreenshot } from "../../../../hooks/useTableScreenshot";
import { motion, AnimatePresence } from "motion/react";

export const GhostDraftClassificationTable = ({ classificationData }: { classificationData: any[] }) => {
  const tableRef = React.useRef<HTMLDivElement>(null);
  const { handleCopyImage, handleDownloadImage, isCopying } = useTableScreenshot(tableRef);
  const [isExpandedClass, setIsExpandedClass] = React.useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          Clasificación con Draft Fantasma
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExpandedClass(!isExpandedClass)}
            className="flex items-center gap-2 text-neutral-600 hover:text-indigo-600"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">{isExpandedClass ? "Reducir" : "Ampliar"}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const text = classificationData.map((t: any) => `${t.ghostRank}. ${t.teamName.replace(/ \[.*\]$/, '').trim()}: ${t.ghostPoints.toLocaleString()} pts ${t.rankDiff > 0 ? `(Sube ${t.rankDiff})` : t.rankDiff < 0 ? `(Baja ${Math.abs(t.rankDiff)})` : '(=)'}`).join('\n');
              navigator.clipboard.writeText(text);
            }}
            className="flex items-center gap-2 text-neutral-600 hover:text-indigo-600"
          >
            <Table2 className="w-4 h-4" />
            <span className="hidden sm:inline">Copiar bloques</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleCopyImage({ fileName: 'clasificacion-fantasma.png', scale: 3 })}
            disabled={isCopying}
            className="hidden sm:flex items-center gap-2 text-neutral-600 hover:text-indigo-600"
          >
            {isCopying ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Camera className="w-4 h-4" />}
            Copiar imagen
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDownloadImage({ fileName: 'clasificacion-fantasma.png', scale: 3 })}
            className="flex items-center gap-2 text-neutral-600 hover:text-indigo-600"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar imagen</span>
          </Button>
        </div>
      </div>

      <div 
        ref={tableRef}
        className={cn("bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm", isExpandedClass ? "fixed inset-4 z-50 overflow-auto flex flex-col" : "")}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase font-medium border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 w-12 text-center">Pos</th>
                <th className="px-4 py-3 w-12 text-center">+/-</th>
                <th className="px-4 py-3">Equipo [#Orden]</th>
                <th className="px-4 py-3 w-16 text-center">Pos Actual</th>
                <th className="px-4 py-3 text-right bg-indigo-50/50 text-indigo-700">Ptos Fantasma</th>
                <th className="px-4 py-3 text-right">Puntos Reales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <AnimatePresence>
                {classificationData.map((team: any, idx: number) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                    key={team.jugador} 
                    className="hover:bg-neutral-50 transition-colors bg-white z-10 relative"
                  >
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "inline-flex justify-center items-center w-6 h-6 rounded-full text-xs font-bold",
                        idx === 0 ? "bg-amber-100 text-amber-700" : 
                        idx === 1 ? "bg-neutral-200 text-neutral-700" : 
                        idx === 2 ? "bg-orange-100 text-orange-800" : 
                        "text-neutral-500"
                      )}>
                        {team.ghostRank}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {team.rankDiff >= 3 ? (
                          <>
                            <ChevronsUp className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-600 font-bold text-xs">{team.rankDiff}</span>
                          </>
                        ) : team.rankDiff > 0 ? (
                          <>
                            <ChevronUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-500 font-bold text-xs">{team.rankDiff}</span>
                          </>
                        ) : team.rankDiff <= -3 ? (
                          <>
                            <ChevronsDown className="w-4 h-4 text-red-500" />
                            <span className="text-red-600 font-bold text-xs">{Math.abs(team.rankDiff)}</span>
                          </>
                        ) : team.rankDiff < 0 ? (
                          <>
                            <ChevronDown className="w-4 h-4 text-red-400" />
                            <span className="text-red-500 font-bold text-xs">{Math.abs(team.rankDiff)}</span>
                          </>
                        ) : (
                          <span className="text-neutral-400 font-medium text-xs"><Minus className="w-4 h-4" /></span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {team.teamName}
                    </td>
                    <td className="px-4 py-3 text-center text-neutral-500 font-medium font-mono text-xs">
                      {team.actualRank}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-700 bg-indigo-50/30">
                      {team.ghostPoints.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">
                      {team.actualTeamPoints.toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {classificationData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 italic">
                    No hay resultados que coincidan con los filtros
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
