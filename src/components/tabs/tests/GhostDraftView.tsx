import React, { useState, useMemo, useRef } from "react";
import { useGhostDraft } from "../../../lib/hooks/useGhostDraft";
import { Ghost, ChevronDown, Trophy } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { useUrlState } from "../../../hooks/useUrlState";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { EmptyState } from "../../ui/EmptyState";
import { getVal } from "../../../lib/data-processing";
import { GhostDraftClassificationTable } from "../draft/components/GhostDraftClassificationTable";
import { GhostDraftRosterTable } from "../draft/components/GhostDraftRosterTable";

export const GhostDraftView = ({
  files,
  cyclistMetadata,
  playerTeamMap,
  playerOrderMap,
  mode = 'puntos'
}: any) => {
  const ghostDataRaw = useGhostDraft(
    files.elecciones.data,
    cyclistMetadata,
    playerTeamMap,
    playerOrderMap,
    mode
  );

  const [ghostTeamFilter, setGhostTeamFilter] = useUrlState<string[]>("ghostTeamFilter", []);
  const [isTeamFilterOpen, setIsTeamFilterOpen] = useState(false);

  const uniqueRounds = useMemo(() => {
    if (!files.elecciones?.data) return [];
    const rnds = new Set<string>();
    files.elecciones.data.forEach((d: any) => {
      const r = getVal(d, "Ronda");
      if (r) rnds.add(String(r));
    });
    return Array.from(rnds).sort((a,b) => parseInt(a) - parseInt(b));
  }, [files.elecciones?.data]);

  const maxAvailableRound = useMemo(() => {
    return Math.max(...uniqueRounds.map(Number), 1);
  }, [uniqueRounds]);

  const [currentRoundLimit, setCurrentRoundLimit] = useState<number | null>(null);
  const effectiveRoundLimit = currentRoundLimit ?? maxAvailableRound;

  const ghostData = useMemo(() => {
    if (!ghostDataRaw) return [];
    
    return ghostDataRaw.map((team: any) => {
      // Filter roster based on round limit slider
      const filteredRoster = team.ghostRoster.filter((r: any) => {
         return Number(r.round) <= effectiveRoundLimit;
      });

      const actualTeamPoints = filteredRoster.reduce((sum: number, r: any) => sum + r.originalPoints, 0);
      const ghostPoints = filteredRoster.reduce((sum: number, r: any) => sum + r.ghostPoints, 0);

      return {
        ...team,
        ghostRoster: filteredRoster,
        actualTeamPoints,
        ghostPoints,
        diff: ghostPoints - actualTeamPoints
      };
    }).filter((team: any) => {
      // Return true if team passes the team filter and has any valid roster items
      if (team.ghostRoster.length === 0) return false;
      const tName = team.teamName.replace(/ \[.*\]$/, '').trim();
      if (ghostTeamFilter.length > 0 && !ghostTeamFilter.includes(team.jugador) && !ghostTeamFilter.includes(tName)) return false;
      return true;
    }).sort((a: any, b: any) => b.diff - a.diff);
  }, [ghostDataRaw, effectiveRoundLimit, ghostTeamFilter]);

  const uniqueTeams = useMemo(() => {
    if (!files.elecciones?.data) return [];
    const ts = new Set<string>();
    files.elecciones.data.forEach((d: any) => {
      const j = getVal(d, "Jugador") || getVal(d, "Nombre_TG");
      if (j && playerTeamMap[j]) ts.add(String(playerTeamMap[j]));
      else if (j) ts.add(String(j));
    });
    return Array.from(ts).sort();
  }, [files.elecciones?.data, playerTeamMap]);

  const classificationData = useMemo(() => {
    if (!ghostData) return [];
    
    // Compute actual rankings
    const actualSorted = [...ghostData].sort((a: any, b: any) => b.actualTeamPoints - a.actualTeamPoints);
    const actualRanks = new Map<string, number>();
    actualSorted.forEach((team, index) => {
      actualRanks.set(team.jugador, index + 1);
    });

    // Compute ghost rankings
    const ghostSorted = [...ghostData].sort((a: any, b: any) => b.ghostPoints - a.ghostPoints);
    
    return ghostSorted.map((team, index) => {
      const ghostR = index + 1;
      const actualR = actualRanks.get(team.jugador) || 0;
      return {
        ...team,
        ghostRank: ghostR,
        actualRank: actualR,
        rankDiff: actualR - ghostR
      };
    });
  }, [ghostData]);

  const flatRows = useMemo(() => {
    if (!ghostDataRaw) return [];
    const rows: any[] = [];
    
    ghostDataRaw.forEach((team: any) => {
        const tName = team.teamName.replace(/ \[.*\]$/, '').trim();
        if (ghostTeamFilter.length > 0 && !ghostTeamFilter.includes(team.jugador) && !ghostTeamFilter.includes(tName)) {
          return;
        }

        team.ghostRoster.forEach((r: any) => {
           if (Number(r.round) > effectiveRoundLimit) {
             return;
           }

            rows.push({
               teamName: tName,
               jugador: team.jugador,
               orderDraft: team.teamName.match(/\[#([^\]]+)\]/)?.[1] || "?",
               pickNumber: r.pickNumber,
               round: r.round,
               original: r.original,
               originalPoints: r.originalPoints,
               ghost: r.ghost,
               ghostPoints: r.ghostPoints,
               diff: r.ghostPoints - r.originalPoints,
               missedOpportunities: r.missedOpportunities
            });
        });
    });

    return rows.sort((a, b) => a.pickNumber - b.pickNumber);
  }, [ghostDataRaw, ghostTeamFilter, effectiveRoundLimit]);

  if (!ghostDataRaw || ghostDataRaw.length === 0) {
    return <EmptyState icon={Ghost} title="No hay datos suficientes" description="No hay selecciones válidas para procesar el motor del Draft Fantasma." />;
  }

  const title = mode === 'puntos' ? 'El draft fantasma según puntos' : 'El draft fantasma según rondas';
  const description = mode === 'puntos' ? (
    <>¿Qué puntuación tendría tu equipo si, en tu turno, en lugar de elegir a tu corredor, hubieras elegido al <strong className="text-indigo-700">mejor ciclista que estaba libre</strong> en ese momento? 
    Los mánagers están ordenados por la diferencia de puntos "perdidos" (los puntos que se dejaron sobre la mesa).</>
  ) : (
    <>¿Qué puntuación tendría tu equipo si hubieras elegido al <strong className="text-indigo-700">mejor ciclista disponible de tu ronda o rondas anteriores</strong>? 
    Los mánagers están ordenados por la diferencia "perdida" respecto al máximo posible de esa ronda.</>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50/80 to-white/90 backdrop-blur-xl border border-indigo-100/60 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-100/50 rounded-full blur-[40px] group-hover:bg-indigo-200/50 transition-colors duration-500" />
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 relative z-10">
          <div className="p-4 bg-indigo-500/10 text-indigo-700 rounded-2xl shrink-0 backdrop-blur-md self-start">
            <Ghost className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-neutral-900 tracking-tight">{title}</h3>
            <p className="text-sm text-neutral-600 mt-2 max-w-3xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-6 bg-gradient-to-br from-indigo-50/50 to-white backdrop-blur-xl border border-indigo-100/60 p-4 rounded-2xl shadow-sm mb-6">
        {/* State Slider */}
        <div className="flex-1 min-w-[250px]">
          <div className="flex justify-between items-center text-sm font-bold text-neutral-700 mb-3">
            <span>Evolución del Draft</span>
            <span className="text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full text-xs shadow-sm shadow-indigo-100">Hasta Ronda {effectiveRoundLimit}</span>
          </div>
          <div className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-indigo-50 shadow-inner">
            <span className="text-xs text-neutral-500 font-bold w-4 text-center">1</span>
            <input 
              type="range" 
              min={1} 
              max={maxAvailableRound} 
              value={effectiveRoundLimit} 
              onChange={(e) => setCurrentRoundLimit(Number(e.target.value))}
              className="flex-1 h-2 bg-indigo-200/50 rounded-lg appearance-none cursor-pointer accent-indigo-600 block w-full"
            />
            <span className="text-xs text-neutral-500 font-bold w-4 text-center">{maxAvailableRound}</span>
          </div>
        </div>

        {/* Team Filter */}
        <Popover open={isTeamFilterOpen} onOpenChange={setIsTeamFilterOpen}>
          <PopoverTrigger render={
            <Button variant="outline"
              className="px-4 py-2 bg-white/80 border border-indigo-100 hover:border-indigo-200 hover:bg-white rounded-xl text-sm text-neutral-800 flex items-center gap-3 cursor-pointer min-w-[160px] max-w-[200px] shadow-sm h-[72px] transition-all"
            >
              <div className="flex flex-col items-start gap-1 w-full overflow-hidden">
                <span className="text-[10px] text-indigo-600/80 font-bold uppercase tracking-wider">Filtro Equipos</span>
                <span className="font-semibold truncate w-full text-left">{ghostTeamFilter.length === 0 ? "Todos" : `${ghostTeamFilter.length} sel.`}</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 ml-auto text-indigo-400 transition-transform", isTeamFilterOpen && "rotate-180")} />
            </Button>
          } />
          <PopoverContent className="w-56 p-0 rounded-xl shadow-xl z-50 py-2">
            <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Equipos</span>
              {ghostTeamFilter.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setGhostTeamFilter([])} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold h-6">Limpiar</Button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {uniqueTeams.map((t) => (
                <label key={t} className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer">
                  <input type="checkbox" className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500/20" checked={ghostTeamFilter.includes(t)} onChange={() => {
                    setGhostTeamFilter(ghostTeamFilter.includes(t) ? ghostTeamFilter.filter((x) => x !== t) : [...ghostTeamFilter, t]);
                  }} />
                  <span className="text-sm text-neutral-700 truncate">{t}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <GhostDraftRosterTable flatRows={flatRows} />

      <div className="mt-10">
        <GhostDraftClassificationTable classificationData={classificationData} />
      </div>
    </div>
  );
};
