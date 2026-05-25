import React from 'react';
import { FileSpreadsheet, List, Flag, Clock, Trophy, Beaker, Cloud } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from "./ui/button";

interface AdminNavProps {
  adminTab: "datos" | "datos-v2" | "gestion-startlists" | "reporte-carrera" | "reporte-mes" | "reporte-temporada" | "pruebas" | "estadisticas";
  setAdminTab: (tab: "datos" | "datos-v2" | "gestion-startlists" | "reporte-carrera" | "reporte-mes" | "reporte-temporada" | "pruebas" | "estadisticas") => void;
}

export function AdminNav({ adminTab, setAdminTab }: AdminNavProps) {
  return (
    <div className="flex items-center gap-2 border-b border-neutral-200 pb-4 overflow-x-auto">
      <Button variant="outline"
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
      </Button>
      <Button variant="outline"
        onClick={() => setAdminTab("datos-v2")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
          adminTab === "datos-v2"
            ? "bg-green-50 text-green-700 border-green-200"
            : "text-neutral-600 hover:bg-neutral-100",
        )}
      >
        <Cloud className="w-4 h-4" />
        Datos v2 (Sheets)
      </Button>
      <Button variant="outline"
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
      </Button>
      <Button variant="outline"
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
      </Button>
      <Button variant="outline"
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
      </Button>
      <Button variant="outline"
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
      </Button>
      <Button variant="outline"
        onClick={() => setAdminTab("pruebas")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
          adminTab === "pruebas"
            ? "bg-purple-50 text-purple-700"
            : "text-neutral-600 hover:bg-neutral-100",
        )}
      >
        <Beaker className="w-4 h-4" />
        Pruebas
      </Button>
      <Button variant="outline"
        onClick={() => setAdminTab("estadisticas")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
          adminTab === "estadisticas"
            ? "bg-purple-50 text-purple-700"
            : "text-neutral-600 hover:bg-neutral-100",
        )}
      >
        <FileSpreadsheet className="w-4 h-4" />
        Estadísticas
      </Button>
    </div>
  );
}
