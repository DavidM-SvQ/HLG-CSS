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
    <header className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
              Fantasy Ciclismo HLG
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
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
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Actualizado: {lastUpdated.toLocaleDateString()}{" "}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <nav className="flex items-center bg-neutral-100 p-1 rounded-lg mr-4">
              <button
                onClick={() => setView("public")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
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
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  view === "admin"
                    ? "bg-white shadow-sm text-purple-600"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
              >
                Admin
              </button>
            </nav>
          )}

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
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-blue-600" />
                  Iniciar Sesión
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
