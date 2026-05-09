import React, { useMemo } from "react";
import { formatNumberSpanish, getVal } from "../../../lib/data-processing";
import { Award, Trophy, Crown, Flag } from "lucide-react";

export const SeasonMilestones = ({ leaderboard, files }: { leaderboard: any[]; files: any }) => {
  const milestones = useMemo(() => {
    if (!files.resultados?.data || !files.carreras?.data || !leaderboard) return [];

    const result: { label: string; team: string; date: string; icon: any; order: number }[] = [];

    // Parse all races to date and category mapping
    const raceMeta: Record<string, { date: string; dateObj: Date; category: string }> = {};
    files.carreras.data.forEach((r: any) => {
      const name = getVal(r, "Carrera")?.trim();
      const dateStr = getVal(r, "Fecha")?.trim();
      const cat = getVal(r, "Categoría")?.trim();
      if (name && dateStr) {
        // Date is like DD/MM/YYYY
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          const dObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          raceMeta[name] = { date: dateStr, dateObj: dObj, category: cat };
        }
      }
    });

    // Milestone 1: Reaching thresholds (1000, 2000, 3000, etc.)
    const teamPointsOverTime: Record<string, { date: Date; pts: number }[]> = {};
    const teams = new Set<string>();

    leaderboard.forEach(p => {
      const team = p.nombreEquipo;
      if (team === "No draft" || team.includes("No draft")) return; // Skip No draft
      teams.add(team);
      if (!teamPointsOverTime[team]) teamPointsOverTime[team] = [];
      p.detalles.forEach((d: any) => {
        const meta = raceMeta[d.carrera];
        if (meta) {
          teamPointsOverTime[team].push({ date: meta.dateObj, pts: d.puntosObtenidos });
        }
      });
    });

    const maxPointsReached = Math.max(...leaderboard.map(l => l.puntos));
    const thresholds = [];
    for (let i = 1000; i <= maxPointsReached; i += 1000) {
      thresholds.push(i);
    }

    const teamTimelines: Record<string, { date: Date; total: number }[]> = {};
    Array.from(teams).forEach(team => {
      const events = teamPointsOverTime[team].sort((a, b) => a.date.getTime() - b.date.getTime());
      let currentPts = 0;
      teamTimelines[team] = [];
      events.forEach(e => {
        currentPts += e.pts;
        teamTimelines[team].push({ date: e.date, total: currentPts });
      });
    });

    thresholds.forEach(th => {
      let earliestDate: Date | null = null;
      let winnerTeam = "";
      
      Array.from(teams).forEach(team => {
        const trn = teamTimelines[team].find(t => t.total >= th);
        if (trn) {
          if (!earliestDate || trn.date < earliestDate) {
            earliestDate = trn.date;
            winnerTeam = team;
          }
        }
      });

      if (winnerTeam && earliestDate) {
        result.push({
          label: `Primer equipo en llegar a ${formatNumberSpanish(th)} puntos`,
          team: winnerTeam,
          date: earliestDate.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
          icon: <Award className="w-5 h-5 text-purple-600 drop-shadow-sm" />,
          order: earliestDate.getTime()
        });
      }
    });

    // Milestone: Winners of Monuments and Grand Tours
    const monumentNames = ["milano-sanremo", "milán-san remo", "ronde van vlaanderen", "tour of flanders", "paris-roubaix", "parís-roubaix", "liège-bastogne-liège", "lieja-bastoña-lieja", "il lombardia", "giro de lombardía"];
    const gtNames = ["tour de france", "tour de francia", "giro d'italia", "giro de italia", "vuelta a españa", "la vuelta ciclista a españa"];
    
    const raceWinnersMap = new Map<string, { team: string; name: string; date: Date }>();
    leaderboard.forEach(p => {
      if (p.nombreEquipo === "No draft" || p.nombreEquipo.includes("No draft")) return;
      p.detalles.forEach((d: any) => {
        // Find general classification or one day race winners
        if (typeof d.posicion === 'number' && d.posicion === 1) {
          const type = d.tipoResultado?.toLowerCase() || "";
          if (type === "clasificación general" || (!type && !d.etapa && !d.ronda)) {
             const meta = raceMeta[d.carrera];
             if (meta) {
               raceWinnersMap.set(d.carrera, { team: p.nombreEquipo, name: d.carrera, date: meta.dateObj });
             }
          }
        }
      });
    });

    raceWinnersMap.forEach((val, raceName) => {
      const lower = raceName.toLowerCase();
      const isMonument = monumentNames.some(m => lower.includes(m));
      const isGt = gtNames.some(m => lower.includes(m));
      
      if (isMonument) {
        result.push({
          label: `Ganador de Monumento (${raceName})`,
          team: val.team,
          date: val.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
          icon: <Crown className="w-5 h-5 text-amber-500 drop-shadow-sm" />,
          order: val.date.getTime()
        });
      }
      if (isGt) {
        result.push({
          label: `Ganador de Gran Vuelta (${raceName})`,
          team: val.team,
          date: val.date.toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' }),
          icon: <Trophy className="w-5 h-5 text-emerald-500 drop-shadow-sm" />,
          order: val.date.getTime()
        });
      }
    });

    // Sort all milestones by date chronologically
    return result.sort((a, b) => a.order - b.order);
  }, [files.resultados?.data, files.carreras?.data, leaderboard]);

  if (milestones.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-5xl mx-auto">
      <div className="bg-white border flex flex-col border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center p-2 backdrop-blur border border-white/30 shrink-0">
            <Flag className="w-7 h-7 text-white drop-shadow" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-white tracking-tight">Hitos de la Temporada</h2>
            <p className="text-blue-100 font-medium text-sm mt-1">Los momentos clave que marcaron el año</p>
          </div>
        </div>

        <div className="p-0">
          <div className="divide-y divide-neutral-100">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 hover:bg-neutral-50/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0 shadow-sm">
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-neutral-900 text-sm">{m.label}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {m.team}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-mono text-neutral-400 shrink-0">
                  {m.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
