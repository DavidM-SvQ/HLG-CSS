import { copyImageToClipboard, copyTextToClipboard } from "./lib/clipboard";
import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useGestionStartlists } from "./lib/hooks/useGestionStartlists";
import { useFileUpload } from "./lib/hooks/useFileUpload";
import { FILE_TYPES } from "./lib/config/fileTypes";
import { useUrlState } from "./hooks/useUrlState";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import Papa from "papaparse";
import localforage from "localforage";
import { useDataStore } from "./lib/stores/useDataStore";
import { useComputedStore } from "./lib/stores/useComputedStore";
import { useAppComputations } from "./lib/hooks/useAppComputations";
import { AlertCircle } from "lucide-react";
import { PublicLayout } from "./components/layouts/PublicLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { AppHeader } from "./components/AppHeader";
import { AdminNav } from "./components/AdminNav";
import { TableSkeleton } from "./components/ui/Skeleton";
import { Routes, Route, Link, Navigate, useLocation, useSearchParams } from "react-router-dom";




import { cn } from "./lib/utils";
import { supabase } from "./supabase";
import { useAuth } from "./lib/auth/AuthContext";

import { AppState, FileState } from "./lib/types";

import { formatNumberSpanish, normalizeStr, getVal, getCategoryColorStyle } from "./lib/data-processing";
import { expandNodeForCapture } from "./lib/dom-utils";

import { usePageView } from "./lib/analytics/usePageView";
import { Button } from "./components/ui/button";



// --- Constants ---




// --- Helpers ---

// MultiSelect is now imported from components/ui/multi-select
import { Dialog, DialogContent, DialogTitle } from "./components/ui/dialog";

export default function App() {
  const location = useLocation();
  
  
  
  

  const {
    user,
    isAuthReady,
    isLoggingIn,
    showFrameWarning,
    setShowFrameWarning,
    isAdmin,
    isSupabaseConfigured,
    handleLogin,
    handleLogout
  } = useAuth();
  
  const [view, setView] = useState<"public" | "admin">("public");
  
  
  
  
  

  
  
  
  

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  


  
  


  // Info tab states
  
  const { files, setFiles, fetchGlobalFile, initializeGlobalFiles } = useDataStore();
  const { handleFileUpload } = useFileUpload(isSupabaseConfigured);
  const { 
    leaderboard, 
    raceWinners, 
    globalTeamWinsCount, 
    globalTeamPartialWinsCount, 
    uniqueRaces,
    cyclistMetadata,
    playerOrderMap,
    playerByCyclist,
    playerTeamMap,
    teamToPlayerMap,
    cyclistRoundMap 
  } = useComputedStore();

  useAppComputations();
  const currentTabName = location.pathname.split("/")[1] || "season";

  usePageView("app_navigation", { publicTab: currentTabName, view });

  // Removed isAdmin and isSupabaseConfigured (handled by AuthProvider)

  // Auth listener removed (handled by AuthProvider)




  // Automatically switch to admin view if user is admin
  useEffect(() => {
    if (isAdmin) setView("admin");
    else setView("public");
  }, [isAdmin]);

  const { 
    startlistText, setStartlistText, 
    startlistRace, setStartlistRace, 
    parsedStartlist, isSavingStartlist, 
    handleParseStartlist, handleSaveStartlist,
    handleDeleteStartlist, handleDeleteAllStartlists
  } = useGestionStartlists(files, user, playerByCyclist, playerTeamMap, isSupabaseConfigured, fetchGlobalFile);

  const essentialFiles = ["carreras", "ciclistas", "elecciones", "equipos", "puntos", "resultados"];
  const allFilesUploaded = essentialFiles.every(
    (key) => files[key as keyof AppState].data !== null,
  );

  // Removed the useEffect for calculatePoints as it is now handled by useAppComputations

  // Supabase sync for global files
  useEffect(() => {
    if (!isAuthReady || !isSupabaseConfigured) {
      if (!isSupabaseConfigured) {
        // Set loading to false if not configured to avoid permanent "Sincronizando"
        setFiles((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((key) => {
            (next[key as keyof AppState] as any).loading = false;
          });
          return next;
        });
      }
      return;
    }

    initializeGlobalFiles(isSupabaseConfigured);

    // Real-time subscription
    const channel = supabase
      .channel("global_files_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "global_files",
        },
        (payload) => {
          const id = (payload.new as any)?.id || (payload.old as any)?.id;
          if (id) fetchGlobalFile(id as keyof AppState, false, isSupabaseConfigured);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthReady]);

  // Login handler removed (handled by AuthProvider)

  // Logout handler removed (handled by AuthProvider)

  





























{/* Removed dead routines */}


  

  const lastUpdatedDates = (Object.values(files) as FileState[])
    .map((f) => (f.updatedAt ? new Date(f.updatedAt).getTime() : 0))
    .filter((t) => t > 0);
  const lastUpdated =
    lastUpdatedDates.length > 0
      ? new Date(Math.max(...lastUpdatedDates))
      : null;

  // --- Helpers ---
  const getFlagEmoji = (countryName: string) => {
    if (!countryName) return "";
    const country = countryName.trim().toLowerCase();
    const flags: Record<string, string> = {
      spain: "🇪🇸",
      españa: "🇪🇸",
      france: "🇫🇷",
      francia: "🇫🇷",
      italy: "🇮🇹",
      italia: "🇮🇹",
      belgium: "🇧🇪",
      bélgica: "🇧🇪",
      netherlands: "🇳🇱",
      "países bajos": "🇳🇱",
      holanda: "🇳🇱",
      slovenia: "🇸🇮",
      eslovenia: "🇸🇮",
      denmark: "🇩🇰",
      dinamarca: "🇩🇰",
      "great britain": "🇬🇧",
      "gran bretaña": "🇬🇧",
      "united kingdom": "🇬🇧",
      "reino unido": "🇬🇧",
      australia: "🇦🇺",
      usa: "🇺🇸",
      "united states": "🇺🇸",
      eeuu: "🇺🇸",
      "estados unidos": "🇺🇸",
      colombia: "🇨🇴",
      ecuador: "🇪🇨",
      norway: "🇳🇴",
      noruega: "🇳🇴",
      germany: "🇩🇪",
      alemania: "🇩🇪",
      switzerland: "🇨🇭",
      suiza: "🇨🇭",
      portugal: "🇵🇹",
      austria: "🇦🇹",
      ireland: "🇮🇪",
      irlanda: "🇮🇪",
      canada: "🇨🇦",
      canadá: "🇨🇦",
      "new zealand": "🇳🇿",
      "nueva zelanda": "🇳🇿",
      eritrea: "🇪🇷",
      kazakhstan: "🇰🇿",
      kazajistán: "🇰🇿",
      poland: "🇵🇱",
      polonia: "🇵🇱",
      "czech republic": "🇨🇿",
      "república checa": "🇨🇿",
      slovakia: "🇸🇰",
      eslovaquia: "🇸🇰",
      hungary: "🇭🇺",
      hungría: "🇭🇺",
      luxembourg: "🇱🇺",
      luxemburgo: "🇱🇺",
      "south africa": "🇿🇦",
      sudáfrica: "🇿🇦",
      latvia: "🇱🇻",
      letonia: "🇱🇻",
      estonia: "🇪🇪",
      lithuania: "🇱🇹",
      lituania: "🇱🇹",
      israel: "🇮🇱",
      japan: "🇯🇵",
      japón: "🇯🇵",
      china: "🇨🇳",
      russia: "🇷🇺",
      rusia: "🇷🇺",
      ukraine: "🇺🇦",
      ucrania: "🇺🇦",
      belarus: "🇧🇾",
      bielorrusia: "🇧🇾",
      mexico: "🇲🇽",
      méxico: "🇲🇽",
      argentina: "🇦🇷",
      brazil: "🇧🇷",
      brasil: "🇧🇷",
      venezuela: "🇻🇪",
      "costa rica": "🇨🇷",
      panama: "🇵🇦",
      panamá: "🇵🇦",
    };
    return flags[country] || countryName;
  };

  const formattedTeams = React.useMemo(() => {
    if (!files.elecciones.data) return [];

    const teamData: Record<string, string> = {}; // teamName -> order
    const uniquePlayers = [
      ...new Set(
        files.elecciones.data
          .map((r) => getVal(r, "Nombre_TG")?.trim())
          .filter(Boolean),
      ),
    ] as string[];

    files.elecciones?.data?.forEach((row) => {
      const jugador = getVal(row, "Nombre_TG")?.trim();
      const nombreEquipo = getVal(row, "Nombre_Equipo")?.trim() || jugador;
      if (jugador && nombreEquipo && !teamData[nombreEquipo]) {
        const playerIdx = uniquePlayers.indexOf(jugador);
        const order = (playerIdx + 1).toString().padStart(2, "0");
        teamData[nombreEquipo] = order;
      }
    });

    return Object.entries(teamData)
      .map(([name, order]) => ({
        label: `${name} [#${order}]`,
        value: name,
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [files.elecciones.data]);

  


  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-200">
      <Toaster position="top-center" richColors />
      
      <Dialog open={showFrameWarning} onOpenChange={setShowFrameWarning}>
        <DialogContent className="sm:max-w-md border-none shadow-xl rounded-2xl">
          <DialogTitle className="sr-only">Autenticación pausada</DialogTitle>
          <div className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-amber-100 p-2.5 rounded-full">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Autenticación pausada
            </h3>
            <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
              El navegador está bloqueando la ventana emergente (pop-up) de inicio de sesión de Google.
            </p>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-blue-900 mb-2">Pasos para iniciar sesión:</p>
              <ol className="text-sm text-blue-800 list-decimal pl-4 space-y-1">
                <li>Permite las ventanas emergentes para este sitio en la configuración de la barra de direcciones de tu navegador (arriba a la derecha).</li>
                <li>Vuelve a hacer click en "Iniciar sesión".</li>
              </ol>
            </div>
            
            <div className="flex justify-end">
              <Button variant="default" 
                onClick={() => setShowFrameWarning(false)}
                className="px-4 py-2 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Entendido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AppHeader 
        view={view}
        setView={setView}
        lastUpdated={lastUpdated}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {!isSupabaseConfigured && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            {/* Kept out for brevity, or we can leave it in App */}
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-900 font-bold">
                Configuración de Supabase pendiente
              </h3>
              <p className="text-amber-700 text-sm mt-1">
                Para que la sincronización de datos funcione, debes configurar
                las variables de entorno
              </p>
            </div>
          </div>
        )}

        {view === "admin" ? (
          <AdminLayout 
            files={files}
            user={user}
            handleFileUpload={handleFileUpload}
            leaderboard={leaderboard}
            uniqueRaces={uniqueRaces}
            globalTeamPartialWinsCount={globalTeamPartialWinsCount}
            raceWinners={raceWinners}
            globalTeamWinsCount={globalTeamWinsCount}
            cyclistMetadata={cyclistMetadata}
            cyclistRoundMap={cyclistRoundMap}
            playerOrderMap={playerOrderMap}
            playerTeamMap={playerTeamMap}
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
        ) : (
          <PublicLayout 
            files={files}
            leaderboard={leaderboard}
            raceWinners={raceWinners}
            globalTeamPartialWinsCount={globalTeamPartialWinsCount}
            globalTeamWinsCount={globalTeamWinsCount}
            cyclistMetadata={cyclistMetadata}
            cyclistRoundMap={cyclistRoundMap}
            playerOrderMap={playerOrderMap}
            playerTeamMap={playerTeamMap}
            playerByCyclist={playerByCyclist}
            uniqueRaces={uniqueRaces}
            formattedTeams={formattedTeams}
            getFlagEmoji={getFlagEmoji}
            teamToPlayerMap={teamToPlayerMap}
          />
        )}
      </main>
    </div>
  );
}
