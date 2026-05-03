import React from 'react';
import { FileSpreadsheet, List, Flag, Clock, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface AdminNavProps {
  adminTab: "datos" | "gestion-startlists" | "reporte-carrera" | "reporte-mes" | "reporte-temporada";
  setAdminTab: (tab: "datos" | "gestion-startlists" | "reporte-carrera" | "reporte-mes" | "reporte-temporada") => void;
}

export function AdminNav({ adminTab, setAdminTab }: AdminNavProps) {
  return (
    <div className="flex items-center gap-2 border-b border-neutral-200 pb-4 overflow-x-auto">
      <button
        onClick={() => setAdminTab("datos")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
          adminTab === "datos"
            ? "bg-purple-50 text-purple-700"
            : "text-neutral-600 hover:bg-neutral-100",
        )}
      >
        <FileSpreadsheet className="w-4 h-4" />
        Datos
      </button>
      <button
        onClick={() => setAdminTab("gestion-startlists")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
          adminTab === "gestion-startlists"
            ? "bg-purple-50 text-purple-700"
            : "text-neutral-600 hover:bg-neutral-100",
        )}
      >
        <List className="w-4 h-4" />
        Gestor de startlist
      </button>
      <button
        onClick={() => setAdminTab("reporte-carrera")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
          adminTab === "reporte-carrera"
            ? "bg-purple-50 text-purple-700"
            : "text-neutral-600 hover:bg-neutral-100",
        )}
      >
        <Flag className="w-4 h-4" />
        Reporte carrera
      </button>
      <button
        onClick={() => setAdminTab("reporte-mes")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
          adminTab === "reporte-mes"
            ? "bg-purple-50 text-purple-700"
            : "text-neutral-600 hover:bg-neutral-100",
        )}
      >
        <Clock className="w-4 h-4" />
        Reporte mes
      </button>
      <button
        onClick={() => setAdminTab("reporte-temporada")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
          adminTab === "reporte-temporada"
            ? "bg-purple-50 text-purple-700"
            : "text-neutral-600 hover:bg-neutral-100",
        )}
      >
        <Trophy className="w-4 h-4" />
        Reporte temporada
      </button>
    </div>
  );
}
