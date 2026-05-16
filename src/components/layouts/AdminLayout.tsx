import React, { Suspense, useState } from "react";
import { AdminNav } from "../AdminNav";
import { TableSkeleton } from "../ui/Skeleton";
import { FILE_TYPES } from "../../lib/config/fileTypes";

const AdminDatosTab = React.lazy(() => import("../tabs/admin/AdminDatosTab").then(m => ({ default: m.AdminDatosTab })));
const GestionStartlists = React.lazy(() => import("../tabs/admin/GestionStartlists").then(m => ({ default: m.GestionStartlists })));
const RaceView = React.lazy(() => import("../tabs/RaceView").then(m => ({ default: m.RaceView })));
const MonthlyReportView = React.lazy(() => import("../tabs/MonthlyReportView").then(m => ({ default: m.MonthlyReportView })));
const SeasonReportView = React.lazy(() => import("../tabs/SeasonReportView").then(m => ({ default: m.SeasonReportView })));
const TestsView = React.lazy(() => import("../tabs/TestsView").then(m => ({ default: m.TestsView })));
const AdminAnalyticsView = React.lazy(() => import("../tabs/AdminAnalyticsView").then(m => ({ default: m.AdminAnalyticsView })));

export function AdminLayout({
  files,
  user,
  handleFileUpload,
  leaderboard,
  uniqueRaces,
  globalTeamPartialWinsCount,
  raceWinners,
  globalTeamWinsCount,
  cyclistMetadata,
  cyclistRoundMap,
  playerOrderMap,
  playerTeamMap,
  startlistRace,
  setStartlistRace,
  startlistText,
  setStartlistText,
  handleParseStartlist,
  parsedStartlist,
  isSavingStartlist,
  handleSaveStartlist,
  handleDeleteStartlist,
  handleDeleteAllStartlists,
}: any) {
  const [adminTab, setAdminTab] = useState<
    | "datos"
    | "gestion-startlists"
    | "reporte-carrera"
    | "reporte-mes"
    | "reporte-temporada"
    | "pruebas"
    | "estadisticas"
  >("datos");

  const [selectedRace, setSelectedRace] = useState("");

  return (
    <div className="space-y-6">
      <AdminNav adminTab={adminTab} setAdminTab={setAdminTab} />
      
      {adminTab === "datos" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton rows={8} /></div>}>
          <AdminDatosTab
            files={files}
            user={user}
            FILE_TYPES={FILE_TYPES}
            handleFileUpload={handleFileUpload}
            leaderboard={leaderboard}
          />
        </Suspense>
      )}

      {adminTab === "gestion-startlists" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton rows={8} /></div>}>
          <GestionStartlists
            files={files}
            user={user}
            startlistRace={startlistRace}
            setStartlistRace={setStartlistRace}
            startlistText={startlistText}
            setStartlistText={setStartlistText}
            handleParseStartlist={handleParseStartlist}
            parsedStartlist={parsedStartlist}
            isSavingStartlist={isSavingStartlist}
            handleSaveStartlist={handleSaveStartlist}
            handleDeleteStartlist={handleDeleteStartlist}
            handleDeleteAllStartlists={handleDeleteAllStartlists}
          />
        </Suspense>
      )}

      {adminTab === "reporte-carrera" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
          <RaceView 
            isAdminReport={true} 
            files={files} 
            selectedRace={selectedRace} 
            setSelectedRace={setSelectedRace} 
            uniqueRaces={uniqueRaces} 
            leaderboard={leaderboard} 
            globalTeamPartialWinsCount={globalTeamPartialWinsCount} 
            raceWinners={raceWinners} 
            globalTeamWinsCount={globalTeamWinsCount} 
            cyclistMetadata={cyclistMetadata} 
          />
        </Suspense>
      )}

      {adminTab === "reporte-mes" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
          <MonthlyReportView files={files} leaderboard={leaderboard} />
        </Suspense>
      )}

      {adminTab === "reporte-temporada" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
          <SeasonReportView files={files} leaderboard={leaderboard} cyclistRoundMap={cyclistRoundMap} cyclistMetadata={cyclistMetadata} playerOrderMap={playerOrderMap} />
        </Suspense>
      )}

      {adminTab === "pruebas" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
          <TestsView leaderboard={leaderboard} cyclistMetadata={cyclistMetadata} playerOrderMap={playerOrderMap} playerTeamMap={playerTeamMap} cyclistRoundMap={cyclistRoundMap} files={files} />
        </Suspense>
      )}

      {adminTab === "estadisticas" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
          <AdminAnalyticsView />
        </Suspense>
      )}
    </div>
  );
}
