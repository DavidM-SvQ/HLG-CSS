import React, { useMemo } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import { motion } from 'motion/react';

export const SeasonHighlights = ({
  leaderboard,
  raceWinners,
  uniqueRaces,
  files
}: any) => {
  const { filteredLeaderboard, teamWinsCount } = useMemo(() => {
    const filteredLeaderboard = leaderboard?.filter((p: any) => p.nombreEquipo !== "No draft") || [];
    const teamWinsCount: Record<string, number> = {};
    filteredLeaderboard?.forEach((p: any) => {
      if (p.nombreEquipo !== "No draft" && p.nombreEquipo !== "No draft [99]") {
        teamWinsCount[p.nombreEquipo] = 0;
      }
    });
    Object.values(raceWinners || {}).forEach((teamName: any) => {
      const name = teamName as string;
      if (teamWinsCount[name] !== undefined) {
        teamWinsCount[name]++;
      }
    });
    return { filteredLeaderboard, teamWinsCount };
  }, [leaderboard, raceWinners]);

  const top3 = filteredLeaderboard.slice(0, 3);

  // Handle ties for Leader
  const maxPoints = filteredLeaderboard.length > 0 ? filteredLeaderboard[0].puntos : 0;
  const leaders = filteredLeaderboard.filter((p: any) => p.puntos === maxPoints);
  const leaderNames = leaders.map((l: any) => l.nombreEquipo).join(" / ");

  const maxWins = Math.max(...(Object.values(teamWinsCount) as number[]), 0);
  const topWinnerTeams = Object.keys(teamWinsCount).filter(
    (name) => teamWinsCount[name] === maxWins,
  );
  const winnerNames = topWinnerTeams.join(" / ");

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      className="flex flex-col gap-6"
    >
      {/* KPIs Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-gradient-to-br from-blue-50/80 to-white/90 backdrop-blur-xl border border-blue-100/60 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-6 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-100/50 rounded-full blur-[40px] group-hover:bg-blue-200/50 transition-colors duration-500" />
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl shrink-0 z-10 block backdrop-blur-md">
              <Trophy className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-blue-600/80 uppercase tracking-[0.2em] z-10 truncate">
              Carreras Term.
            </p>
          </div>
          <div className="z-10 mt-auto">
            <p className="text-4xl font-black text-neutral-900 tracking-tight flex items-baseline gap-2">
              {uniqueRaces?.length || 0} <span className="text-xl font-bold text-neutral-400">/ {files?.carreras?.data?.length || 0}</span>
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-gradient-to-br from-amber-50/80 to-white/90 backdrop-blur-xl border border-amber-100/60 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-6 relative overflow-hidden group">
           <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-100/50 rounded-full blur-[40px] group-hover:bg-amber-200/50 transition-colors duration-500" />
          <div className="flex items-center gap-4">
            <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl shrink-0 z-10 backdrop-blur-md">
              <Crown className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-amber-600/80 uppercase tracking-[0.2em] z-10 truncate">
              Líder Actual
            </p>
          </div>
          <div className="z-10 mt-auto">
            <p className="text-2xl font-black text-neutral-900 tracking-tight leading-tight line-clamp-1 mb-1">
              {leaderNames || "-"}
            </p>
            <p className="text-base font-bold text-amber-600/80">
              {maxPoints || 0} pts
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-gradient-to-br from-emerald-50/80 to-white/90 backdrop-blur-xl border border-emerald-100/60 rounded-[28px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-6 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-100/50 rounded-full blur-[40px] group-hover:bg-emerald-200/50 transition-colors duration-500" />
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl shrink-0 z-10 backdrop-blur-md">
              <Medal className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-[0.2em] z-10 truncate">
              Más Victorias
            </p>
          </div>
          <div className="z-10 mt-auto">
            <p className="text-2xl font-black text-neutral-900 tracking-tight leading-tight line-clamp-1 mb-1">
              {winnerNames || "-"}
            </p>
            <p className="text-base font-bold text-emerald-600/80">
              {maxWins} wins
            </p>
          </div>
        </motion.div>
      </div>

      {/* Virtual Podium */}
      {top3.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-end pt-12 pb-0 bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-neutral-50/50 to-transparent pointer-events-none" />
          <h3 className="text-sm font-black mb-10 text-neutral-400 uppercase tracking-[0.2em] relative z-10">
            Podio Virtual
          </h3>
          <div className="flex items-end gap-2 md:gap-8 px-4 relative z-10">
            {/* 2nd Place */}
            {top3[1] && (
              <motion.div whileHover={{ y: -4 }} className="flex flex-col items-center">
                <div className="mb-3 text-center">
                  <p className="text-sm font-bold text-neutral-700 truncate w-24 md:w-32">
                    {top3[1].nombreEquipo}
                  </p>
                  <p className="text-xs font-semibold text-neutral-500">
                    {top3[1].puntos} pts
                  </p>
                </div>
                <div className="w-24 md:w-32 h-32 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl flex items-start justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,1)] relative overflow-hidden border border-slate-200 border-b-0 pt-4">
                  <span className="text-5xl font-black text-slate-300 drop-shadow-sm">
                    2
                  </span>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <motion.div whileHover={{ y: -4 }} className="flex flex-col items-center z-10">
                <motion.div 
                   animate={{ y: [0, -8, 0] }} 
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Crown className="w-10 h-10 text-amber-400 mb-2 drop-shadow-md fill-amber-400/20" />
                </motion.div>
                <div className="mb-3 text-center">
                  <p className="text-base font-black text-neutral-900 truncate w-28 md:w-40">
                    {top3[0].nombreEquipo}
                  </p>
                  <p className="text-sm font-black text-amber-500">
                    {top3[0].puntos} pts
                  </p>
                </div>
                <div className="w-28 md:w-40 h-44 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-2xl flex items-start justify-center shadow-[inset_0_2px_15px_rgba(255,255,255,1),_0_-10px_30px_rgba(251,191,36,0.2)] relative overflow-hidden border-2 border-amber-300 border-b-0 pt-6">
                  <span className="text-7xl font-black text-amber-400/50 drop-shadow-sm">
                    1
                  </span>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <motion.div whileHover={{ y: -4 }} className="flex flex-col items-center">
                <div className="mb-3 text-center">
                  <p className="text-sm font-bold text-neutral-700 truncate w-24 md:w-32">
                    {top3[2].nombreEquipo}
                  </p>
                  <p className="text-xs font-semibold text-neutral-500">
                    {top3[2].puntos} pts
                  </p>
                </div>
                <div className="w-24 md:w-32 h-24 bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-2xl flex items-start justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,1)] relative overflow-hidden border border-orange-200 border-b-0 pt-4">
                  <span className="text-5xl font-black text-orange-300 drop-shadow-sm">
                    3
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
