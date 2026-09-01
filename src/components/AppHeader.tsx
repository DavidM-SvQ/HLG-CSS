import React, { useMemo } from 'react';
import { Trophy, Clock, LogOut, LogIn, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth/AuthContext';
import { useDataStore } from '../lib/stores/useDataStore';
import { Button } from "./ui/button";

interface AppHeaderProps {
  view: "public" | "admin";
  setView: (view: "public" | "admin") => void;
  lastUpdated: Date | null;
}

export function AppHeader({
  view, setView, lastUpdated
}: AppHeaderProps) {
  const { user, isAdmin, handleLogin, handleLogout, isLoggingIn } = useAuth();
  const { selectedSeason, setSelectedSeason, availableSeasons, activeSeason, seasonOptions } = useDataStore();

  const visibleOptions = useMemo(() => {
    const visible = seasonOptions?.filter(o => o.visible);
    if (visible && visible.length > 0) {
      if (!visible.some(o => o.id === selectedSeason)) {
        const match = seasonOptions.find(o => o.id === selectedSeason);
        if (match) {
          return [...visible, match];
        }
        return [...visible, { id: selectedSeason, label: selectedSeason, visible: true }];
      }
      return visible;
    }
    return availableSeasons.map(s => ({
      id: s,
      label: s === activeSeason ? `${s} (En curso)` : `${s} (Histórico)`,
      visible: true
    }));
  }, [seasonOptions, availableSeasons, activeSeason, selectedSeason]);
  
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-40 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-blue-600 p-2 md:p-2 rounded-lg shrink-0">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-xl font-semibold tracking-tight text-neutral-900 truncate">
                  Fantasy Ciclismo HLG
                </h1>
                {selectedSeason !== activeSeason && (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-200">
                    Histórico {selectedSeason}
                  </span>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-1.5 md:gap-3 mt-0.5">
                <span
                  className={cn(
                    "text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0",
                    view === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700",
                  )}
                >
                  {view === "admin"
                    ? "Panel de Control"
                    : "Resultados Públicos"}
                </span>
                {lastUpdated && (
                  <span className="text-[10px] md:text-xs text-neutral-500 flex items-center gap-1 min-w-0">
                    <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
                    <span className="truncate">Act: {lastUpdated.toLocaleDateString()}{" "}
                    {lastUpdated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex md:hidden items-center shrink-0 ml-2 gap-2">
            {/* Mobile Season Selector */}
            <div className="flex items-center gap-1 bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-1">
              <Calendar className="w-3 h-3 text-neutral-500 shrink-0" />
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="bg-transparent text-xs font-bold text-neutral-800 focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                {visibleOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {user ? (
              <Button variant="ghost" size="icon"
                onClick={handleLogout}
                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            ) : (
              <Button variant="default" size="sm"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className={cn(
                  "flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm",
                  isLoggingIn ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                {isLoggingIn ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5 text-white" />
                )}
                <span className="leading-none mt-[1px]">Entrar</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-3 overflow-x-auto pb-1 md:pb-0">
          {/* Desktop Season Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-neutral-100 border border-neutral-200/80 rounded-lg px-2.5 py-1 shrink-0 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[11px] font-semibold text-neutral-500">Temp:</span>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-transparent text-xs font-bold text-neutral-900 focus:outline-none cursor-pointer pr-1 max-w-[200px]"
            >
              {visibleOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <nav className="flex items-center bg-neutral-100 p-1 rounded-lg w-full md:w-auto shrink-0">
              <Button variant="outline"
                onClick={() => setView("public")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 md:flex-none text-center",
                  view === "public"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Público
              </Button>
              <Button variant="outline"
                onClick={() => setView("admin")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 md:flex-none text-center",
                  view === "admin"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Admin
              </Button>
            </nav>
          )}

          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-neutral-900 leading-none">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {isAdmin ? "Administrador" : "Jugador"}
                  </p>
                </div>
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full border border-neutral-200"
                    referrerPolicy="no-referrer"
                  />
                )}
                <Button variant="ghost" size="sm"
                  onClick={handleLogout}
                  className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
            <Button variant="default" size="sm"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={cn(
                "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-transparent px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm",
                isLoggingIn ? "opacity-50 cursor-not-allowed" : "",
              )}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-white" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </Button>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
