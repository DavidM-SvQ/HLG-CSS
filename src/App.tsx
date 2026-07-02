import React, { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { useDataStore } from "./lib/stores/useDataStore";
import { useAppComputations } from "./lib/hooks/useAppComputations";
import { AlertCircle } from "lucide-react";
import { PublicLayout } from "./components/layouts/PublicLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { AppHeader } from "./components/AppHeader";
import { OfflineIndicator } from "./components/ui/OfflineIndicator";
import { useLocation } from "react-router-dom";

import { supabase } from "./supabase";
import { useAuth } from "./lib/auth/AuthContext";

import { AppState, FileState } from "./lib/types";

import { usePageView } from "./lib/analytics/usePageView";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "./components/ui/dialog";

import { MilestoneNotifier } from "./components/MilestoneNotifier";

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
  
  const { files, fetchGlobalFile, initializeGlobalFiles } = useDataStore();

  useAppComputations();
  const currentTabName = location.pathname.split("/")[1] || "season";
  
  // Extract URL parameters for analytics
  const searchParams = new window.URLSearchParams(location.search);
  const selectedTeam = searchParams.get("selected_team");
  const selectedRace = searchParams.get("selected_race");

  usePageView("app_navigation", { 
    publicTab: currentTabName, 
    view,
    ...(selectedTeam && { selectedTeam }),
    ...(selectedRace && { selectedRace })
  });

  // Removed isAdmin and isSupabaseConfigured (handled by AuthProvider)

  // Auth listener removed (handled by AuthProvider)




  // Automatically switch to admin view if user is admin
  useEffect(() => {
    if (isAdmin) setView("admin");
    else setView("public");
  }, [isAdmin]);

  const essentialFiles = ["carreras", "ciclistas", "elecciones", "equipos", "puntos", "resultados"];
  const allFilesUploaded = essentialFiles.every(
    (key) => files[key as keyof AppState].data !== null,
  );

  // Removed the useEffect for calculatePoints as it is now handled by useAppComputations

  // Supabase sync for global files
  useEffect(() => {
    // Always initialize to load any cached localforage data
    initializeGlobalFiles(isSupabaseConfigured);

    if (!isAuthReady || !isSupabaseConfigured) {
      return;
    }

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
  }, [isAuthReady, isSupabaseConfigured, initializeGlobalFiles, fetchGlobalFile]);

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

  


  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-200 relative flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.3]" style={{ backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      
      <div className="relative z-10 flex-1 flex flex-col">
        <Toaster position="top-center" richColors />
        <MilestoneNotifier />
        <OfflineIndicator />
          
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

        <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-4 md:py-8 flex-1">
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
            <AdminLayout />
          ) : (
            <PublicLayout />
          )}
        </main>
      </div>
    </div>
  );
}
