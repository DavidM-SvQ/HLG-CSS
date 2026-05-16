import React, { Suspense, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Trophy, Flag, List, Users, LayoutGrid, Info } from "lucide-react";
import { TableSkeleton } from "../ui/Skeleton";
import { useUrlState } from "../../hooks/useUrlState";

const StartlistView = React.lazy(() => import("../tabs/StartlistView").then(m => ({ default: m.StartlistView })));
const RaceView = React.lazy(() => import("../tabs/RaceView").then(m => ({ default: m.RaceView })));
const TeamView = React.lazy(() => import("../tabs/TeamView").then(m => ({ default: m.TeamView })));
const SeasonView = React.lazy(() => import("../tabs/SeasonView").then(m => ({ default: m.SeasonView })));
const InfoView = React.lazy(() => import("../tabs/InfoView").then(m => ({ default: m.InfoView })));
const DraftView = React.lazy(() => import("../tabs/DraftView").then(m => ({ default: m.DraftView })));

export function PublicLayout({
  files,
  leaderboard,
  raceWinners,
  globalTeamPartialWinsCount,
  globalTeamWinsCount,
  cyclistMetadata,
  cyclistRoundMap,
  playerOrderMap,
  playerTeamMap,
  playerByCyclist,
  uniqueRaces,
  formattedTeams,
  getFlagEmoji,
  teamToPlayerMap,
}: any) {
  const location = useLocation();
  const initParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initRace = initParams.get("race") || "";
  const initStartlistRace = initParams.get("startlist_race") || "";
  const initTeam = initParams.get("selected_team") || "";

  const [selectedRace, setSelectedRace] = useUrlState<string>("race", initRace);
  const [publicStartlistRace, setPublicStartlistRace] = useUrlState<string>("startlist_race", initStartlistRace);
  const [selectedTeam, setSelectedTeam] = useUrlState<string>("selected_team", initTeam);
  
  const [infoSubTab, setInfoSubTab] = useState<"menu" | "puntuaciones" | "carreras">("menu");

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Public Tabs Navigation */}
      <div className="flex items-center justify-start sm:justify-center lg:justify-start gap-2 border-b border-neutral-200 pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Link
          to="/season"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
            (location.pathname === "/season" || location.pathname === "/")
              ? "bg-blue-50 text-blue-700"
              : "text-neutral-600 hover:bg-neutral-100",
          )}
        >
          <Trophy className="w-4 h-4" />
          Resultados temporada
        </Link>
        <Link
          to="/race"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
            location.pathname.startsWith("/race")
              ? "bg-blue-50 text-blue-700"
              : "text-neutral-600 hover:bg-neutral-100",
          )}
        >
          <Flag className="w-4 h-4" />
          Clasificación de la carrera
        </Link>
        <Link
          to="/startlist"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
            location.pathname.startsWith("/startlist")
              ? "bg-blue-50 text-blue-700"
              : "text-neutral-600 hover:bg-neutral-100",
          )}
        >
          <List className="w-4 h-4" />
          Startlist carrera
        </Link>
        <Link
          to="/team"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
            location.pathname.startsWith("/team")
              ? "bg-blue-50 text-blue-700"
              : "text-neutral-600 hover:bg-neutral-100",
          )}
        >
          <Users className="w-4 h-4" />
          Equipos
        </Link>
        <Link
          to="/draft"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
            location.pathname.startsWith("/draft")
              ? "bg-blue-50 text-blue-700"
              : "text-neutral-600 hover:bg-neutral-100",
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          Draft
        </Link>
        <Link
          to="/info"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
            location.pathname.startsWith("/info")
              ? "bg-blue-50 text-blue-700"
              : "text-neutral-600 hover:bg-neutral-100",
          )}
        >
          <Info className="w-4 h-4" />
          Información
        </Link>
      </div>

      {/* Tab Content */}
      <Suspense fallback={<div className="p-8"><TableSkeleton rows={8} /></div>}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname.split("/")[1] || "season"}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/season" replace />} />
              <Route path="/season" element={<SeasonView files={files} leaderboard={leaderboard} raceWinners={raceWinners} globalTeamPartialWinsCount={globalTeamPartialWinsCount} globalTeamWinsCount={globalTeamWinsCount} cyclistMetadata={cyclistMetadata} cyclistRoundMap={cyclistRoundMap} playerOrderMap={playerOrderMap} playerTeamMap={playerTeamMap} playerByCyclist={playerByCyclist} uniqueRaces={uniqueRaces} />} />
              <Route path="/race" element={<RaceView isAdminReport={false} files={files} selectedRace={selectedRace} setSelectedRace={setSelectedRace} uniqueRaces={uniqueRaces} leaderboard={leaderboard} globalTeamPartialWinsCount={globalTeamPartialWinsCount} raceWinners={raceWinners} globalTeamWinsCount={globalTeamWinsCount} cyclistMetadata={cyclistMetadata} />} />
              <Route path="/team" element={<TeamView files={files} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} formattedTeams={formattedTeams} leaderboard={leaderboard} raceWinners={raceWinners} globalTeamPartialWinsCount={globalTeamPartialWinsCount} cyclistMetadata={cyclistMetadata} />} />
              <Route path="/startlist" element={<StartlistView files={files} publicStartlistRace={publicStartlistRace} setPublicStartlistRace={setPublicStartlistRace} cyclistMetadata={cyclistMetadata} cyclistRoundMap={cyclistRoundMap} playerTeamMap={playerTeamMap} playerOrderMap={playerOrderMap} />} />
              <Route path="/draft" element={<DraftView files={files} cyclistMetadata={cyclistMetadata} playerTeamMap={playerTeamMap} leaderboard={leaderboard} getFlagEmoji={getFlagEmoji} teamToPlayerMap={teamToPlayerMap} playerOrderMap={playerOrderMap} />} />
              <Route path="/info" element={<InfoView files={files} infoSubTab={infoSubTab} setInfoSubTab={setInfoSubTab} raceWinners={raceWinners} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}
