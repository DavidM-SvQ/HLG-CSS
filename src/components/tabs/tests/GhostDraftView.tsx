import React, { useState } from "react";
import { useGhostDraft } from "../../../lib/hooks/useGhostDraft";
import { Ghost, TrendingUp, Trophy, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../../lib/utils";

export const GhostDraftView = ({
  files,
  cyclistMetadata,
  playerTeamMap,
  playerOrderMap
}: any) => {
  const ghostData = useGhostDraft(
    files.elecciones.data,
    cyclistMetadata,
    playerTeamMap,
    playerOrderMap
  );

  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  if (!ghostData || ghostData.length === 0) {
    return <div className="text-neutral-500 text-sm py-4">No hay datos suficientes para el Draft Fantasma.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/20">
            <Ghost className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-indigo-900">El "Draft Fantasma" (El Qué hubiera pasado)</h3>
            <p className="text-sm text-indigo-700/80 mt-1 max-w-3xl">
              ¿Qué puntuación tendría tu equipo si, en tu turno, en lugar de elegir a tu corredor, hubieras elegido al <strong>mejor ciclista que estaba libre</strong> en ese momento? 
              Los mánagers están ordenados por la diferencia de puntos "perdidos" (los puntos que se dejaron sobre la mesa).
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {ghostData.map((team) => {
          const isExpanded = expandedTeam === team.jugador;
          
          return (
            <div 
              key={team.jugador}
              className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setExpandedTeam(isExpanded ? null : team.jugador)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ring-1 ring-neutral-100">
                    {team.teamName.match(/\[#([^\]]+)\]/)?.[1] || "?"}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">{team.teamName.replace(/ \[#.*\]$/, '')}</h4>
                    <p className="text-xs text-neutral-500">{team.jugador}</p>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-8">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Puntos Reales</p>
                    <p className="font-medium text-neutral-700">{team.actualTeamPoints.toLocaleString()}</p>
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-neutral-300 hidden md:block" />

                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Draft Fantasma</p>
                    <p className="font-bold text-indigo-700">{team.ghostPoints.toLocaleString()}</p>
                  </div>

                  <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-red-100 min-w-[120px] justify-center">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold text-sm">+{team.diff.toLocaleString()} pts</span>
                  </div>

                  <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="bg-neutral-50 border-t border-neutral-100 p-5 p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-neutral-100/50 text-neutral-500 text-xs uppercase font-medium">
                        <tr>
                          <th className="px-4 py-3 whitespace-nowrap">Elección General</th>
                          <th className="px-4 py-3">Elección Real</th>
                          <th className="px-4 py-3 text-indigo-700 bg-indigo-50/50">Elección Fantasma</th>
                          <th className="px-4 py-3 text-right">Diferencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
                        {team.ghostRoster.map((roster: any, idx: number) => {
                          const realPoints = cyclistMetadata[roster.original]?.puntosTotales || 0;
                          const diff = roster.ghostPoints - realPoints;
                          
                          return (
                            <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-neutral-200 text-neutral-600 text-xs font-bold mr-2">
                                  {roster.pickNumber}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-neutral-800">{roster.original}</p>
                                  <p className="text-xs text-neutral-500">{realPoints.toLocaleString()} pts</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 bg-indigo-50/30">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  <div>
                                    <p className="font-bold text-indigo-900">{roster.ghost}</p>
                                    <p className="text-xs text-indigo-700/70">{roster.ghostPoints.toLocaleString()} pts</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="flex-1 max-w-[80px] h-1.5 bg-neutral-100 rounded-full overflow-hidden flex justify-end">
                                    {diff > 0 && (
                                      <div className="h-full bg-gradient-to-l from-red-500 to-red-400 rounded-full" style={{ width: `${Math.min((diff / 1000) * 100, 100)}%` }} />
                                    )}
                                  </div>
                                  <span className={cn(
                                    "text-xs font-bold w-12 text-right",
                                    diff > 0 ? "text-red-600" : diff < 0 ? "text-emerald-600" : "text-neutral-400"
                                  )}>
                                    {diff > 0 ? "+" : ""}{diff.toLocaleString()}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
