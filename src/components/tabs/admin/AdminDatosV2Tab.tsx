import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { FILE_TYPES } from "../../../lib/config/fileTypes";
import { FileSpreadsheet, RefreshCcw, Save, ExternalLink } from "lucide-react";
import { useDataStore } from "../../../lib/stores/useDataStore";
import { parse } from "papaparse";

export const AdminDatosV2Tab = () => {
  const { handleFileUpload } = useDataStore();
  
  // Guardamos las URLs de los Google Sheets publicos (CSV export format or standard)
  const [sheetUrls, setSheetUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Cargar credenciales previas de localStorage
    const saved = localStorage.getItem('googleSheetsUrls');
    if (saved) {
      try {
        setSheetUrls(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const saveUrls = (urls: Record<string, string>) => {
    setSheetUrls(urls);
    localStorage.setItem('googleSheetsUrls', JSON.stringify(urls));
  };

  const handleUrlChange = (id: string, url: string) => {
    saveUrls({ ...sheetUrls, [id]: url });
  };

  const extractCsvExportUrl = (url: string) => {
    // Convierte https://docs.google.com/spreadsheets/d/123...456/edit#gid=0 
    // a https://docs.google.com/spreadsheets/d/123...456/export?format=csv&gid=0
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return url;
    
    let csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
    
    // extraemos el gid si existe para descargar la hoja correcta
    const gidMatch = url.match(/gid=([0-9]+)/);
    if (gidMatch) {
      csvUrl += `&gid=${gidMatch[1]}`;
    }
    
    return csvUrl;
  };

  const extractIframeUrl = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return null;
    return `https://docs.google.com/spreadsheets/d/${match[1]}/edit?rm=minimal`;
  };

  const syncSheet = async (id: string) => {
    const url = sheetUrls[id];
    if (!url) return;

    setLoading({ ...loading, [id]: true });
    try {
      const csvUrl = extractCsvExportUrl(url);
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error("Fallo al descargar el archivo. ¿Está configurado como Público (Cualquiera con el enlace)?");
      const text = await res.text();
      
      // Papaparse for CSV content (File parsing equivalent)
      parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Wrap it as a File upload simulation
          handleFileUpload(id, results.data, new File([text], `${id}.csv`, { type: 'text/csv' }));
        },
        error: (err) => {
          throw new Error("Error procesando CSV: " + err.message);
        }
      });
      alert(`Sincronización de ${id} completada con éxito.`);
    } catch (e: any) {
      alert("Error sincronizando: " + e.message);
    } finally {
      setLoading({ ...loading, [id]: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <FileSpreadsheet className="w-6 h-6 text-green-600" />
          Integración Directa con Google Sheets (Datos v2)
        </h2>
        <p className="text-sm text-neutral-600 mb-6">
           Pega la URL de tu Google Sheet para cada archivo. Para que la sincronización automática funcione, el documento debe tener los permisos de <b>Cualquiera con el enlace puede leer</b>.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {FILE_TYPES.filter(ft => !ft.hiddenInAdmin).map((ft) => {
            const url = sheetUrls[ft.id] || "";
            const iframeUrl = extractIframeUrl(url);

            return (
              <div key={ft.id} className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 flex flex-col">
                <div className="p-4 bg-white border-b border-neutral-200 flex flex-col gap-3">
                   <div className="flex justify-between items-center">
                     <div>
                       <h3 className="font-bold text-neutral-900">{ft.name}</h3>
                       <p className="text-xs text-neutral-500">{ft.description}</p>
                     </div>
                     {url && (
                        <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 p-2">
                           <ExternalLink className="w-4 h-4" />
                        </a>
                     )}
                   </div>
                   
                   <div className="flex gap-2 w-full">
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

                {iframeUrl ? (
                  <div className="h-[400px] w-full bg-neutral-100 flex-1">
                    <iframe 
                      src={iframeUrl} 
                      className="w-full h-full border-0" 
                      title={`Preview ${ft.name}`}
                    />
                  </div>
                ) : (
                  <div className="h-[200px] w-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm">
                    Previsualización no disponible (Falta URL válida)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
