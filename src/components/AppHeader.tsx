import React from 'react';
import { Trophy, Clock, LogOut, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from '@supabase/supabase-js'; // Or local User type

interface AppHeaderProps {
  view: "public" | "admin";
  setView: (view: "public" | "admin") => void;
  isAdmin: boolean;
  user: any;
  lastUpdated: Date | null;
  handleLogin: () => void;
  handleLogout: () => void;
  isLoggingIn: boolean;
}

export function AppHeader({
  view, setView, isAdmin, user, lastUpdated, handleLogin, handleLogout, isLoggingIn
}: AppHeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-blue-600 p-2 md:p-2 rounded-lg shrink-0">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-semibold tracking-tight text-neutral-900 truncate">
                Fantasy Ciclismo HLG
              </h1>
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
          
          <div className="flex md:hidden items-center shrink-0 ml-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className={cn(
                  "flex items-center gap-1.5 bg-white border border-neutral-200 px-2 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm",
                  isLoggingIn
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-neutral-50"
                )}
              >
                {isLoggingIn ? (
                  <div className="w-3.5 h-3.5 border-2 border-neutral-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 text-blue-600" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-4 overflow-x-auto pb-1 md:pb-0">
          {isAdmin && (
            <nav className="flex items-center bg-neutral-100 p-1 rounded-lg w-full md:w-auto shrink-0">
              <button
                onClick={() => setView("public")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 md:flex-none text-center",
                  view === "public"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Público
              </button>
              <button
                onClick={() => setView("admin")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 md:flex-none text-center",
                  view === "admin"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Admin
              </button>
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
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={cn(
                "flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm",
                isLoggingIn
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-neutral-50",
              )}
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-300 border-t-blue-600 rounded-full animate-spin" />
                  <span className="hidden sm:inline">Conectando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </>
              )}
            </button>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
