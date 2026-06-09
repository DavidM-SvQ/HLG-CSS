import React from "react";
import { Save, Search, Users, Trash, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { cn } from "../../../lib/utils";
import { getVal } from "../../../lib/data-processing";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { useGestionStartlists } from "../../../lib/hooks/useGestionStartlists";
import { useDataStore } from "../../../lib/stores/useDataStore";
import { useComputedStore } from "../../../lib/stores/useComputedStore";
import { useAuth } from "../../../lib/auth/AuthContext";

export const GestionStartlists = () => {
  const { files, fetchGlobalFile } = useDataStore();
  const { playerByCyclist, playerTeamMap } = useComputedStore();
  const { user, isSupabaseConfigured } = useAuth();
  
  const { 
    startlistText, setStartlistText, 
    startlistRace, setStartlistRace, 
    parsedStartlist, isSavingStartlist, 
    handleParseStartlist, handleSaveStartlist,
    handleDeleteStartlist, handleDeleteAllStartlists
  } = useGestionStartlists(files, user, playerByCyclist, playerTeamMap, isSupabaseConfigured, fetchGlobalFile);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
      <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Gestor de Startlists (Múltiples Carreras)
          </h2>
          <p className="text-sm text-neutral-500">
            Pega el texto de los participantes desde FirstCycling para
            detectar ciclistas de la liga y generar la tabla.
          </p>
        </div>
        {parsedStartlist && parsedStartlist.resultados.length > 0 && (
          <Button
            onClick={handleSaveStartlist}
            disabled={isSavingStartlist || !startlistRace.trim()}
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-sm whitespace-nowrap",
              isSavingStartlist || !startlistRace.trim()
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white",
            )}
          >
            <Save className="w-4 h-4" />
            {isSavingStartlist ? "Guardando..." : "Guardar Startlist"}
          </Button>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left Side: Input */}
        <div className="space-y-4 flex flex-col h-full">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nombre de la Carrera
            </label>
            <select
              value={startlistRace}
              onChange={(e) => setStartlistRace(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">-- Selecciona una carrera --</option>
              {(() => {
                const finishedRaces = new Set(
                  (files.resultados?.data || [])
                    .filter((r: any) => getVal(r, "Tipo")?.trim().match(/Clasificaci[oó]n final|CG/i))
                    .map((r: any) => getVal(r, "Carrera")?.trim() || "")
                );

                return files.carreras.data?.map((row: any, idx: number) => {
                  const carreraName = getVal(row, "Carrera")?.trim();
                  if (!carreraName || finishedRaces.has(carreraName)) return null;
                  return (
                    <option key={idx} value={carreraName}>
                      {carreraName}
                    </option>
                  );
                });
              })()}
            </select>
          </div>
          <div className="flex-1 flex flex-col min-h-[300px]">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Texto de Startlist (Copia y Pega)
            </label>
            <textarea
              value={startlistText}
              onChange={(e) => setStartlistText(e.target.value)}
              placeholder="Pega el listado directamente desde FirstCycling..."
              className="w-full flex-1 p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono tabular-nums text-xs text-neutral-600 bg-neutral-50/50"
            />
          </div>
          <Button onClick={handleParseStartlist} variant="outline" className="flex items-center justify-center gap-2">
            <Search className="w-5 h-5" />
            Procesar Texto y Detectar
          </Button>
        </div>

        {/* Right Side: Results */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 h-[600px] overflow-y-auto">
          {!parsedStartlist ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-3">
              <Users className="w-10 h-10" />
              <p className="text-sm">
                Procesa un texto para previsualizar los resultados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg border border-neutral-200 shadow-sm sticky top-0 z-10">
                <h3 className="font-bold text-neutral-900 text-lg">
                  {parsedStartlist.carrera}
                </h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                  {parsedStartlist.resultados?.reduce(
                    (acc: number, curr: any) => acc + curr.ciclistas.length,
                    0,
                  )}{" "}
                  ciclistas
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {parsedStartlist.resultados?.map((row: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-lg border border-neutral-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-neutral-900">
                        {playerTeamMap[row.jugador] || row.jugador}
                      </span>
                      <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                        {row.ciclistas.length} seleccionados
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {row.ciclistas.map((c: any, cIdx: number) => (
                        <span
                          key={cIdx}
                          className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-md mb-1"
                        >
                          {c.dorsal && (
                            <span className="opacity-50 mr-1 text-[10px]">
                              #{c.dorsal}
                            </span>
                          )}
                          {c.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Uploaded Startlists Summary */}
      <div className="border-t border-neutral-100 bg-neutral-50/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Startlists Subidas ({Array.isArray(files.startlist?.data) ? files.startlist.data.length : 0})</h3>
          {handleDeleteStartlist && Array.isArray(files.startlist?.data) && files.startlist.data.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (handleDeleteAllStartlists) {
                  handleDeleteAllStartlists();
                }
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash className="w-4 h-4 mr-2" />
              Borrar Todas
            </Button>
          )}
        </div>
        {Array.isArray(files.startlist?.data) && files.startlist.data.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-neutral-200 shadow-sm bg-white">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-500 uppercase font-medium text-xs border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3">Carrera</th>
                  <th className="px-4 py-3 text-center">Fecha Carrera</th>
                  <th className="px-4 py-3 text-center">Equipos / Ciclistas</th>
                  <th className="px-4 py-3 text-center">Actualización</th>
                  {handleDeleteStartlist && <th className="px-4 py-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {files.startlist.data.map((s: any, i: number) => {
                  const numCyclists = s.resultados?.reduce((acc: number, curr: any) => acc + (curr.ciclistas?.length || 0), 0) || 0;
                  const numEquipos = s.resultados?.length || 0;
                  
                  const matchCarrera = files.carreras?.data?.find((c: any) => getVal(c, "Carrera")?.trim() === s.carrera);
                  const fechaCarrera = matchCarrera ? (getVal(matchCarrera, "Fecha") || "-") : "-";
                  const statusCarrera = matchCarrera ? getVal(matchCarrera, "Tipo") : "";
                  const isFinished = statusCarrera?.match(/Clasificaci[oó]n final|CG/i);

                  let isRacePastDate = false;
                  if (fechaCarrera && fechaCarrera !== "-") {
                     const parts = fechaCarrera.split(/[-/]/);
                     if (parts.length >= 3) {
                       let day = parseInt(parts[0], 10);
                       let month = parseInt(parts[1], 10) - 1;
                       let year = parseInt(parts[2], 10);
                       if (year < 100) year += 2000;
                       if (parts[0].length === 4) {
                         year = parseInt(parts[0], 10);
                         day = parseInt(parts[2], 10);
                       }
                       const raceDate = new Date(year, month, day);
                       const today = new Date();
                       today.setHours(0, 0, 0, 0);
                       isRacePastDate = raceDate < today;
                     }
                  }

                  let isUpdatedToday = false;
                  const updatedAtStr = s.updatedAt || s.updated_at;
                  if (updatedAtStr) {
                    const d = new Date(updatedAtStr);
                    const today = new Date();
                    isUpdatedToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                  }

                  return (
                    <tr key={i} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-neutral-900">
                        <div className="flex items-center gap-2">
                          {s.carrera}
                          {isFinished && (
                            <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-medium">Finalizada</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums text-xs">
                        <div className="flex items-center justify-center gap-1.5">
                          {fechaCarrera}
                          {isRacePastDate && !isFinished && (
                            <AlertCircle className="w-4 h-4 text-red-500" title="La fecha de la carrera ya ha pasado" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-md text-xs">
                          {numEquipos} equipos / {numCyclists} ciclistas
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-neutral-500">
                        <div className="flex items-center justify-center gap-1.5">
                          {updatedAtStr ? new Date(updatedAtStr).toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : "-"}
                          {isUpdatedToday && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" title="Actualizado hoy" />
                          )}
                        </div>
                      </td>
                      {handleDeleteStartlist && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {s.rawText && (
                              <Dialog>
                                <DialogTrigger 
                                  className="group/button inline-flex items-center justify-center border border-transparent whitespace-nowrap rounded-lg text-sm font-medium transition-colors hover:bg-indigo-50 hover:text-indigo-700 text-indigo-500 bg-transparent h-8 w-8 !p-0"
                                  title="Ver texto pegado"
                                >
                                  <FileText className="w-4 h-4" />
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Texto Original - {s.carrera}</DialogTitle>
                                  </DialogHeader>
                                  <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 overflow-y-auto max-h-[60vh] font-mono text-xs whitespace-pre-wrap">
                                    {s.rawText}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteStartlist(s.carrera)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Eliminar startlist"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-neutral-500 italic text-center p-8 bg-white border border-neutral-200 rounded-xl shadow-sm">
            Ninguna startlist subida en el sistema.
          </div>
        )}
      </div>
    </div>
  );
};
