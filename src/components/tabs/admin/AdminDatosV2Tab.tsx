import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { FILE_TYPES } from "../../../lib/config/fileTypes";
import { FileSpreadsheet, RefreshCcw, Save, ExternalLink, Calculator, Trophy, ChevronDown, ChevronRight, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { useDataStore } from "../../../lib/stores/useDataStore";
import { useComputedStore } from "../../../lib/stores/useComputedStore";
import { parse } from "papaparse";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { supabase } from "../../../supabase";

export const AdminDatosV2Tab = () => {
  const { files, updateFile } = useDataStore();
  const { leaderboard, cyclistMetadata, unassignedPointsLog, assignedPointsLog, debugLastRows, playerByCyclist } = useComputedStore();
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});
  const [expandedIframes, setExpandedIframes] = useState<Record<string, boolean>>({ resultados: true });
  
  // Guardamos las URLs de los Google Sheets publicos (CSV export format or standard)
  const [sheetUrls, setSheetUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>("");
  const [avisosFilter, setAvisosFilter] = useState<'todos' | 'errores'>('todos');

  const isSupabaseConfigured =
    !!(import.meta as any).env.VITE_SUPABASE_URL &&
    !!(import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  const displayUnassigned = useMemo(() => {
    if (!unassignedPointsLog) return [];
    if (avisosFilter === 'errores') {
      return unassignedPointsLog.filter(log => log.reason && !log.reason.startsWith("No se encontraron puntos para"));
    }
    return unassignedPointsLog;
  }, [unassignedPointsLog, avisosFilter]);

  const orderedFileTypes = React.useMemo(() => {
    return [...FILE_TYPES.filter(ft => !(ft as any).hiddenInAdmin)].sort((a, b) => {
      if (a.id === "resultados") return -1;
      if (b.id === "resultados") return 1;
      return 0;
    });
  }, []);
  
  useEffect(() => {
    // Cargar credenciales previas de localStorage
    const saved = localStorage.getItem('googleSheetsUrls');
    if (saved) {
      try {
        setSheetUrls(JSON.parse(saved));
      } catch(e) {}
    }

    // Cargar desde Supabase para tener la versión compartida entre dispositivos
    if (isSupabaseConfigured) {
      const fetchUrls = async () => {
        try {
          const { data, error } = await supabase
            .from("global_files")
            .select("data")
            .eq("id", "google_sheets_urls")
            .single();

          if (!error && data && data.data) {
            setSheetUrls(data.data as Record<string, string>);
            localStorage.setItem('googleSheetsUrls', JSON.stringify(data.data));
          }
        } catch (err) {
          console.error("Error cargando URLs de Google Sheets desde Supabase:", err);
        }
      };
      fetchUrls();
    }
  }, [isSupabaseConfigured]);

  const saveUrls = async (urls: Record<string, string>) => {
    setSheetUrls(urls);
    localStorage.setItem('googleSheetsUrls', JSON.stringify(urls));

    // Si Supabase está configurado, guardamos las URLs en la base de datos
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("global_files")
          .upsert({
            id: "google_sheets_urls",
            data: urls,
            updated_at: new Date().toISOString()
          });
        if (error) {
          console.error("Error al guardar URLs en Supabase:", error);
        }
      } catch (err) {
        console.error("Error al guardar URLs en Supabase:", err);
      }
    }
  };

  const handleUrlChange = (id: string, url: string) => {
    saveUrls({ ...sheetUrls, [id]: url });
  };

  const extractCsvExportUrl = (url: string) => {
    // Convierte https://docs.google.com/spreadsheets/d/123...456/edit#gid=0 
    // a https://docs.google.com/spreadsheets/d/123...456/gviz/tq?tqx=out:csv&gid=0
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return url;
    
    let csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv`;
    
    // extraemos el gid si existe para descargar la hoja correcta
    const gidMatch = url.match(/gid=([0-9]+)/);
    if (gidMatch) {
      csvUrl += `&gid=${gidMatch[1]}`;
    }
    
    csvUrl += `&t=${Date.now()}`;
    
    return csvUrl;
  };

  const extractIframeUrl = (url: string, id: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return null;
    let base = `https://docs.google.com/spreadsheets/d/${match[1]}/edit?rm=minimal`;
    const gidMatch = url.match(/gid=([0-9]+)/);
    if (gidMatch) {
      base += `#gid=${gidMatch[1]}`;
    }
    if (id === "resultados" && files.resultados?.data) {
      const rowCount = Array.isArray(files.resultados.data) ? files.resultados.data.length : 0;
      if (rowCount > 0) {
        // En lugar de enfocar una sola celda, mostramos las últimas 15 celdas y dejamos 100 de margen hacia abajo.
        // Esto previene que se oculten las últimas celdas al editar y facilita el scroll a quien escribe.
        const targetRowStart = Math.max(1, rowCount - 15);
        const targetRowEnd = rowCount + 100;
        if (base.includes("#")) {
          base += `&range=A${targetRowStart}:Z${targetRowEnd}`;
        } else {
          base += `#range=A${targetRowStart}:Z${targetRowEnd}`;
        }
      }
    }
    return base;
  };

  const syncSheet = async (id: string, showAlert: boolean = true, skipStateUpdate: boolean = false) => {
    const url = sheetUrls[id];
    if (!url) return null;

    setLoading(prev => ({ ...prev, [id]: true }));
    let rowCount = 0;
    try {
      const csvUrl = extractCsvExportUrl(url);
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error("Fallo al descargar el archivo. ¿Está configurado como Público?");
      const text = await res.text();
      
      if (text.trim().toLowerCase().startsWith("<!doctype html>") || text.trim().toLowerCase().startsWith("<html")) {
        throw new Error("El enlace devuelve una página web en lugar de un CSV. Asegúrate de que el documento es público para todos.");
      }
      
      const parseResult = parse(text, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
      });
      
      rowCount = parseResult.data.length;
      if (rowCount === 0) {
        throw new Error(`CSV vacío o sin contenido válido. (Preview: ${text.substring(0, 100).replace(/\\n/g, ' ')})`);
      }
      
      if (parseResult.errors.length > 0) {
        console.warn(`PapaParse encontró errores en ${id}:`, parseResult.errors);
      }
      
      const newData = { 
         file: new File([text], `${id}.csv`, { type: 'text/csv' }),
         data: parseResult.data as any,
         error: null,
         loading: false
      };

      if (!skipStateUpdate) {
        updateFile(id as any, newData);
      }

      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase
            .from("global_files")
            .upsert({
              id,
              data: parseResult.data,
              updated_at: new Date().toISOString()
            });
          if (error) {
            console.error("Error al guardar en Supabase:", error);
          }
        } catch (err) {
          console.error("Error al guardar en Supabase:", err);
        }
      }

      if (showAlert && !skipStateUpdate) {
         setSyncStatusMsg(`Sincronización de ${id} completada con éxito. Filas leídas: ${rowCount}`);
         setTimeout(() => setSyncStatusMsg(""), 5000);
      }
      
      return { rowCount, newData };
    } catch (e: any) {
      console.error(`Error in syncSheet for ${id}:`, e);
      let errorMsg = e.message;
      if (errorMsg === 'Failed to fetch') {
         errorMsg = "Bloqueado o permisos denegados. ¿Está el documento configurado como 'Cualquier usuario que tenga el vínculo puede LEER'?";
      }
      if (showAlert && !skipStateUpdate) {
         setSyncStatusMsg(`Error sincronizando ${id}: ` + errorMsg);
      }
      throw new Error(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const syncAll = async () => {
    const ids = FILE_TYPES.filter(ft => !(ft as any).hiddenInAdmin).map(ft => ft.id);
    setSyncStatusMsg("Sincronizando todas las tablas...");
    const counts: Record<string, number> = {};
    const errors: string[] = [];
    const bulkUpdates: Record<string, any> = {};
    
    for (const id of ids) {
      if (sheetUrls[id]) {
        try {
          const res = await syncSheet(id, false, true);
          if (res) {
            counts[id] = res.rowCount;
            bulkUpdates[id] = res.newData;
            if (res.rowCount === 0) errors.push(`${id} (cero filas)`);
          }
        } catch (e: any) {
          errors.push(`${id}: ${e.message}`);
        }
      }
    }
    
    if (Object.keys(bulkUpdates).length > 0) {
      useDataStore.getState().setFiles(prev => {
        const next = { ...prev };
        for (const id in bulkUpdates) {
          next[id] = { ...next[id as keyof typeof next], ...bulkUpdates[id] };
        }
        return next;
      });
    }

    let sum = 0;
    Object.values(counts).forEach(c => sum += c);
    let msg = `Sincronización completada. Tablas principales leídas correctamente.`;
    if (counts['resultados']) {
      msg = `Sincronización completada. Resultados: ${counts['resultados']} filas leídas.`;
    }
    if (errors.length > 0) {
       msg += ` Errores: ${errors.join(' | ')}`;
    } else {
       setTimeout(() => setSyncStatusMsg(""), 5000);
    }
    setSyncStatusMsg(msg);
  };

  const forceRecalculate = () => {
    useDataStore.getState().setFiles(prev => ({ ...prev }));
    setSyncStatusMsg("Puntos y clasificaciones recalculados con éxito.");
    setTimeout(() => {
      setSyncStatusMsg((current) => current === "Puntos y clasificaciones recalculados con éxito." ? "" : current);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            Integración Directa con Google Sheets (Datos v2)
          </h2>
        </div>
        <p className="text-sm text-neutral-600 mb-6">
           Pega la URL de tu Google Sheet para cada archivo. Si editas los datos directamente en el cuadro de abajo, <strong className="text-indigo-700 font-bold">debes hacer click en el botón de "Sincronizar"</strong> correspondiente o en "Sincronizar Todo" para que la app lea los nuevos datos y actualice los puntos.
        </p>

        <div className="grid grid-cols-1 gap-8">
          {orderedFileTypes.map((ft) => {
            const url = sheetUrls[ft.id] || "";
            const iframeUrl = extractIframeUrl(url, ft.id);
            const isIframeExpanded = !!expandedIframes[ft.id];

            return (
              <div key={ft.id} className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 flex flex-col">
                <div className="p-4 bg-white border-b border-neutral-200 flex flex-col gap-3">
                   <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setExpandedIframes(prev => ({...prev, [ft.id]: !prev[ft.id]}))}>
                     <div className="flex items-center gap-2">
                       {isIframeExpanded ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                       <div>
                         <h3 className="font-bold text-neutral-900">{ft.name}</h3>
                         <p className="text-xs text-neutral-500">{(ft as any).description}</p>
                       </div>
                     </div>
                     {url && (
                        <div onClick={e => e.stopPropagation()}>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors text-sm font-medium shrink-0 shadow-sm"
                              title="Abre la hoja original en otra pestaña. Útil si tienes problemas de desplazamiento (scroll) con la vista integrada."
                            >
                               <ExternalLink className="w-4 h-4" />
                               <span className="hidden sm:inline">Abrir en Google Sheets</span>
                            </a>
                        </div>
                     )}
                   </div>
                   
                   <div className="flex gap-2 w-full mt-2">
                     <Input 
                        placeholder="https://docs.google.com/spreadsheets/d/..." 
                        value={url}
                        onChange={(e) => handleUrlChange(ft.id, e.target.value)}
                        className="flex-1 bg-neutral-50 text-xs"
                     />
                     <Button 
                       disabled={!url || loading[ft.id]} 
                       onClick={() => syncSheet(ft.id)}
                       variant="outline"
                       className="gap-2 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                     >
                        <RefreshCcw className={`w-4 h-4 ${loading[ft.id] ? "animate-spin" : ""}`} />
                        {loading[ft.id] ? "Sincronizando..." : "Sincronizar"}
                     </Button>
                   </div>
                </div>

                {isIframeExpanded && (
                  iframeUrl ? (
                    <div 
                      className="w-full bg-neutral-100"
                      style={{ height: ft.id === "resultados" ? '1200px' : '600px' }}
                    >
                      <iframe 
                        src={iframeUrl} 
                        className="w-full h-full border-0 pointer-events-auto" 
                        title={`Preview ${ft.name}`}
                      />
                    </div>
                  ) : (
                    <div className="h-[200px] w-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm">
                      Previsualización no disponible (Falta URL válida)
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral-200">
          <Button onClick={syncAll} className="gap-2 bg-green-600 hover:bg-green-700 text-white py-6 text-lg w-full sm:w-auto">
            <RefreshCcw className="w-5 h-5" />
            Sincronizar Todas las Tablas
          </Button>
          <Button onClick={forceRecalculate} variant="outline" className="gap-2 py-6 text-lg w-full sm:w-auto">
            <Calculator className="w-5 h-5" />
            Refrescar Puntos Calculados
          </Button>
        </div>
        
        {syncStatusMsg && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100 flex items-center justify-center">
             {syncStatusMsg}
          </div>
        )}
      </div>
      
      <div className={`mt-8 p-6 rounded-2xl shadow-sm border ${unassignedPointsLog?.length ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${unassignedPointsLog?.length ? 'text-red-700' : 'text-green-700'}`}>
            {unassignedPointsLog?.length ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
            Avisos de Puntuación ({displayUnassigned?.length || 0})
          </h2>
          <select 
            value={avisosFilter} 
            onChange={(e) => setAvisosFilter(e.target.value as 'todos' | 'errores')}
            className="p-2 border rounded-lg text-sm bg-white"
          >
            <option value="todos">Mostrar todos ({unassignedPointsLog?.length || 0})</option>
            <option value="errores">Solo errores (excluir "0 puntos")</option>
          </select>
        </div>
        {displayUnassigned?.length ? (
          <>
            <p className="text-sm text-red-600 mb-4">Se han encontrado registros en Resultados que no han podido sumar puntos:</p>
            <div className="max-h-[300px] overflow-y-auto bg-white rounded border border-red-100 p-2">
              <ul className="space-y-2 text-sm">
              {displayUnassigned.slice(0, 500).map((log, i) => (
                  <li key={i} className="border-b border-neutral-100 pb-2">
                    <span className="font-bold text-neutral-800">{log.ciclista}</span> en <span className="italic">{log.carrera}</span> - Pos: {log.posicion} <span className="text-neutral-400 text-xs ml-1">(Fila Excel ~{log.originalIndex + 2})</span><br/>
                    <span className="text-red-500 text-xs">Causa: {log.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-green-600">No hay avisos para el filtro seleccionado.</p>
        )}
      </div>

      {assignedPointsLog && assignedPointsLog.length > 0 && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl shadow-sm mt-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-green-700">
            <Trophy className="w-6 h-6" />
            Puntos Sumados ({assignedPointsLog.length})
          </h2>
          <p className="text-sm text-green-600 mb-4">Registro de todos los puntos que se han sumado correctamente, ordenados de más reciente a más antiguo.</p>
          <div className="max-h-[300px] overflow-y-auto bg-white rounded border border-green-100 p-2">
            <ul className="space-y-2 text-sm">
              {assignedPointsLog.slice(0, 500).map((log, i) => (
                <li key={i} className="border-b border-neutral-100 pb-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-neutral-800">{log.ciclista}</span> <span className="text-neutral-500">en</span> <span className="italic">{log.carrera}</span>
                    <span className="text-neutral-400 text-xs ml-1">(Fila Excel ~{log.originalIndex + 2})</span>
                    <div className="text-xs text-neutral-500 flex flex-wrap items-center gap-y-1">
                      <span>
                        {log.tipoResultado} {log.etapa ? `(${log.etapa.toLowerCase().includes("etapa") ? log.etapa : `Etapa ${log.etapa}`}) ` : ''}- Pos: {log.posicion} | Fecha: {log.fecha || 'N/A'}
                      </span>
                      {log.nombreEquipo && (
                        <div className="flex items-center">
                          <span className="text-neutral-300 mx-1.5">|</span>
                          <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 text-[10px]">{log.nombreEquipo}</span>
                          <span className="text-neutral-400 text-[10px] font-mono ml-1">[{log.orden ? `#${log.orden}` : ''}]</span>
                          <span className="text-neutral-400 mx-1">{"->"}</span>
                          <span className="text-neutral-600 font-medium">Ronda {log.ronda ? parseInt(log.ronda, 10) || log.ronda : 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-bold text-green-600 text-lg shrink-0 ml-2">
                    +{log.puntos}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm mt-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <Calculator className="w-6 h-6 text-blue-600" />
          Clasificación y Puntos Calculados
        </h2>
        
        {leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-4">
            {leaderboard.map((team, idx) => {
              // Agrupar puntos por ciclista
              const cyclistPointData: Record<string, { total: number, detalles: any[] }> = {};
              team.detalles.forEach(d => {
                if (!cyclistPointData[d.ciclista]) {
                  cyclistPointData[d.ciclista] = { total: 0, detalles: [] };
                }
                cyclistPointData[d.ciclista].total += d.puntosObtenidos;
                cyclistPointData[d.ciclista].detalles.push(d);
              });

              const teamCyclistsStr = Object.keys(playerByCyclist).filter(c => playerByCyclist[c] === team.jugador);
              Object.keys(cyclistPointData).forEach(c => {
                 if (!teamCyclistsStr.includes(c)) teamCyclistsStr.push(c);
              });

              // Crear array de ciclistas con su metadata, ordenados por ronda
              const cyclistArr = teamCyclistsStr.map((name) => {
                const ptsRaw = cyclistPointData[name];
                const pts = ptsRaw?.total || 0;
                
                // Ordenar detalles por fecha descendente
                const detalles = ptsRaw?.detalles ? [...ptsRaw.detalles].sort((a, b) => {
                  if (!a.fecha) return 1;
                  if (!b.fecha) return -1;
                  const dateA = new Date(a.fecha);
                  const dateB = new Date(b.fecha);
                  return dateB.getTime() - dateA.getTime();
                }) : [];

                const meta = cyclistMetadata[name];
                return {
                  name,
                  pts,
                  rondaId: meta?.ronda || 'Z', // Si no hay ronda, al final
                  eleccion: meta?.eleccion || 999,
                  detalles
                };
              }).sort((a, b) => {
                const rA = String(a.rondaId);
                const rB = String(b.rondaId);
                if (rA !== rB) return rA.localeCompare(rB);
                return a.eleccion - b.eleccion;
              });

              const isExpanded = !!expandedTeams[team.nombreEquipo];

              return (
                <div key={team.nombreEquipo} className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                  <div 
                    className="p-4 bg-neutral-50 hover:bg-neutral-100 cursor-pointer flex items-center justify-between transition-colors"
                    onClick={() => setExpandedTeams(prev => ({ ...prev, [team.nombreEquipo]: !prev[team.nombreEquipo] }))}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900">{team.nombreEquipo}</h3>
                        <p className="text-xs text-neutral-500">{team.jugador}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="block font-bold text-lg text-blue-700">{team.puntos} pts</span>
                      </div>
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-neutral-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {cyclistArr.map(c => (
                          <div key={c.name} className="flex justify-between items-center p-2 rounded border border-neutral-100 bg-neutral-50 text-sm">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-[10px] font-mono bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-600 shrink-0">
                                {c.rondaId}
                              </span>
                              <span className="font-medium truncate" title={c.name}>{c.name}</span>
                            </div>
                            
                            {c.pts > 0 ? (
                              <Popover>
                                <PopoverTrigger className="font-bold text-indigo-600 tabular-nums shrink-0 ml-2 cursor-pointer border-b border-dotted border-indigo-300 bg-transparent p-0 m-0 border-t-0 border-x-0 outline-none">
                                      {c.pts} <span className="text-xs font-normal text-neutral-400">pts</span>
                                </PopoverTrigger>
                                  <PopoverContent side="top" align="center" className="w-[340px] max-w-[calc(100vw-32px)] p-0 z-[100] bg-white text-slate-800 border border-slate-200 shadow-xl overflow-hidden flex flex-col gap-0 [&>svg]:hidden [&>div.bg-foreground]:hidden">
                                    <div className="bg-white border-b border-slate-100 p-2 font-semibold text-xs shadow-sm flex items-center justify-between rounded-t-lg shrink-0">
                                      <span>Desglose {c.name}</span>
                                      <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px]">{c.pts} pts</span>
                                    </div>
                                    <div className="flex flex-col divide-y divide-slate-50 overflow-y-auto overflow-x-hidden max-h-[250px]">
                                      {c.detalles.filter((d: any) => d.puntosObtenidos > 0).map((det: any, i: number) => (
                                        <div key={i} className="px-3 py-2 text-xs flex justify-between items-start hover:bg-slate-50 last:mb-2">
                                          <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-2">
                                            <span className="font-semibold text-slate-800 break-words whitespace-normal leading-tight" title={det.carrera}>{det.carrera}</span>
                                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                                              {det.fecha && <span className="whitespace-nowrap">{det.fecha}</span>}
                                              {det.tipoResultado && (
                                                <span className="uppercase text-[9px] font-bold text-slate-400">
                                                  {det.tipoResultado.toLowerCase() === 'etapa' && det.etapa 
                                                    ? `Etapa ${det.etapa.replace(/etapa/i, '').trim()}`
                                                    : det.tipoResultado}
                                                  {det.tipoResultado.toLowerCase() !== 'etapa' && det.etapa && det.etapa.toLowerCase() !== 'cg' && det.etapa.toLowerCase() !== 'gc'
                                                    ? ` (Etapa ${det.etapa.replace(/etapa/i, '').trim()})`
                                                    : ''}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-right flex flex-col items-end shrink-0">
                                            <span className="font-bold text-indigo-600">{det.puntosObtenidos}</span>
                                            {det.posicion && <span className="text-[10px] text-slate-400">Pos: {det.posicion}</span>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </PopoverContent>
                              </Popover>
                            ) : (
                              <span className="font-bold text-neutral-400 tabular-nums shrink-0 ml-2">
                                0 <span className="text-xs font-normal text-neutral-300">pts</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {cyclistArr.length === 0 && (
                        <p className="text-sm text-neutral-500 italic text-center py-4">No hay ciclistas en la plantilla.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 text-center text-neutral-500 flex flex-col items-center gap-2">
            <Trophy className="w-10 h-10 text-neutral-300" />
            <p>No hay datos calculados. Asegúrate de tener cargados los equiposs, ciclistas y puntos, y sincroniza Resultados.</p>
          </div>
        )}
      </div>

      {debugLastRows && debugLastRows.length > 0 && (
        <div className="mt-8 p-4 rounded-xl border border-blue-200 bg-blue-50">
          <h2 className="font-bold text-blue-700 mb-2">Debug de últimas filas leídas</h2>
          <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded max-h-[200px]">
             {JSON.stringify(debugLastRows, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
