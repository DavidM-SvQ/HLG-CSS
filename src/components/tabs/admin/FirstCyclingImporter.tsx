import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Checkbox } from "../../ui/checkbox";
import { Download, ClipboardCopy, CheckCircle2 } from "lucide-react";
import { useDataStore } from "../../../lib/stores/useDataStore";
import { getVal, normalizeStr } from "../../../lib/data-processing";

const TIPOS_RESULTADO = [
  "Clasificación final",
  "Etapa",
  "Etapa (Crono equipos)",
  "Clasificación final (Crono equipos)",
  "Clasificación de la montaña",
  "Clasificación por puntos",
  "Clasificación de los jóvenes",
];

export const FirstCyclingImporter = () => {
  const [open, setOpen] = useState(false);
  const [pcsText, setPcsText] = useState("");
  const [carrera, setCarrera] = useState("");
  const [tipo, setTipo] = useState(TIPOS_RESULTADO[1]);
  const [etapa, setEtapa] = useState("");
  const [fecha, setFecha] = useState("");
  const [isCRE, setIsCRE] = useState(false);
  const [resultText, setResultText] = useState("");
  const [copied, setCopied] = useState(false);

  const { files } = useDataStore();
  const [availableRaces, setAvailableRaces] = useState<string[]>([]);

  useEffect(() => {
    // Populate today's date in YYYY-MM-DD
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setFecha(`${yyyy}-${mm}-${dd}`);

    // Populate races from calendario, excluding finished races
    if (files.carreras?.data) {
      const allRaces = files.carreras.data
        .map((r: any) => String(getVal(r, "Carrera") || "").trim())
        .filter((r: string) => r !== "");
      
      const finishedRaces = new Set<string>();
      if (files.resultados?.data) {
         files.resultados.data.forEach((r: any) => {
            const tipoLower = String(getVal(r, "Tipo") || "").trim().toLowerCase();
            const raceName = String(getVal(r, "Carrera") || "").trim();
            if (tipoLower.includes("clasificaci") && (tipoLower.includes("final") || tipoLower.includes("general") || tipoLower === "cg" || tipoLower.includes("crono equipos"))) {
               finishedRaces.add(raceName);
            }
         });
      }

      setAvailableRaces(Array.from(new Set(allRaces)).filter(r => !finishedRaces.has(r)));
    }
  }, [files.carreras, files.resultados]);

  useEffect(() => {
    if (tipo.includes("Crono equipos")) {
      setIsCRE(true);
    } else {
      setIsCRE(false);
    }
  }, [tipo]);

  const handleGenerate = () => {
    let outputFecha = fecha;
    if (fecha.includes("-")) {
      const parts = fecha.split("-");
      if (parts.length === 3) {
        outputFecha = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const lines = pcsText.split('\n');
    let outLines: string[] = [];
    let currentTeamPos = "";
    let currentTeamName = "";

    lines.forEach((line) => {
      const t = line.trim();
      if (!t) return;

      if (isCRE) {
        // En CRE de FirstCycling: el equipo tiene posición y nombre
        const teamMatch = line.match(/^(\d+)\s+([^\t]+)/);
        if (teamMatch && teamMatch[1] && parseInt(teamMatch[1], 10) <= 50) {
          currentTeamPos = parseInt(teamMatch[1], 10).toString();
          currentTeamName = teamMatch[2].split(/\t/)[0].replace(/  .*/, '').trim();
          return;
        }

        let ridersStr = t.replace(/\b(?:Youth jersey|Leader jersey|Points jersey|Mountains jersey)\b/ig, '');
        const parts = ridersStr.split(/\s{2,}/);
        parts.forEach(p => {
            let name = p.replace(/\s*\(.*?\)\s*/g, '').trim();
            name = name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/.*jersey\s*/ig, '').trim();
            if (name && currentTeamPos) {
                outLines.push(`${outputFecha}\t${carrera}\t${tipo}\t${etapa}\t${currentTeamPos}\t\t\t${name}\t${currentTeamName}`);
            }
        });

      } else {
        // Normal stage
        const cols = line.split('\t').map(s => s.trim());
        let pos = "";
        let name = "";
        let teamName = "";

        if (cols.length > 2) {
           for (let i = 0; i < cols.length; i++) {
               const isRetired = ["DNF", "DNS", "OTL", "DSQ", "OOT"].includes(cols[i].toUpperCase());
               if ((cols[i].match(/^[0-9]+$/) || isRetired) && !pos) {
                   pos = cols[i];
               } else if (cols[i].match(/[a-zA-Z]/) && !name) {
                   name = cols[i];
                   if (cols.length > i + 1) {
                     teamName = cols[i + 1];
                   }
                   break;
               }
           }
        } else {
           // Fallback
           const normalMatch = line.match(/^(\d+|DNF|DNS|OTL|DSQ|OOT)\s+(?:\d+|-)?\s+(.+?)(?:\t|\s{2,}|\s+-|$)/i);
           if (normalMatch) {
             pos = normalMatch[1];
             name = normalMatch[2].trim();
           }
        }

        if (pos && name && !isNaN(parseInt(pos, 10))) {
          name = name.replace(/\s+\(.*?\)$/, '').trim();
          teamName = teamName.replace(/\s+\(.*?\)$/, '').trim();
          outLines.push(`${outputFecha}\t${carrera}\t${tipo}\t${etapa}\t${pos}\t\t\t${name}\t${teamName}`);
        }
      }
    });

    setResultText(outLines.join('\n'));
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-2 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 py-6 text-lg w-full sm:w-auto h-auto" />}>
        <Download className="w-5 h-5" />
        Herramienta Importar FirstCycling
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] md:max-w-6xl w-full h-[95vh] flex flex-col p-4 md:p-6 overflow-hidden">
        <DialogHeader className="shrink-0 mb-4">
          <DialogTitle className="text-xl">Generador de Resultados desde FirstCycling</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-4 shrink-0">
              <h3 className="font-semibold text-sm">1. Configura los datos base</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Carrera</label>
                  {availableRaces.length > 0 ? (
                    <select 
                      value={carrera} 
                      onChange={(e) => setCarrera(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">-- Seleccionar Carrera --</option>
                      {availableRaces.map((r, i) => (
                        <option key={i} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <Input value={carrera} onChange={(e) => setCarrera(e.target.value)} placeholder="Ej: Tour of Estonia" className="bg-white" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Fecha</label>
                  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Tipo</label>
                  <select 
                    value={tipo} 
                    onChange={(e) => setTipo(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {TIPOS_RESULTADO.map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">Etapa</label>
                  <Input value={etapa} onChange={(e) => setEtapa(e.target.value)} placeholder="Ej: 1, 2, CG" className="bg-white" />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-neutral-200 mt-2">
                <Checkbox 
                  id="isCRE" 
                  checked={isCRE} 
                  onCheckedChange={(checked) => setIsCRE(Boolean(checked))} 
                />
                <label htmlFor="isCRE" className="text-sm cursor-pointer font-bold text-orange-700">Es CRE (Contrarreloj por Equipos)</label>
              </div>
              <p className="text-xs text-neutral-500">
                Si es CRE, todos los ciclistas del equipo recibirán automáticamente la posición obtenida por su equipo.
              </p>
            </div>

            <div className="flex flex-col flex-1 min-h-[250px] overflow-hidden">
              <h3 className="font-semibold text-sm mb-1">2. Pega el texto de FirstCycling</h3>
              <p className="text-xs text-neutral-500 mb-2">Copia la tabla de resultados en FirstCycling y pégala aquí debajo.</p>
              <Textarea 
                value={pcsText} 
                onChange={(e) => setPcsText(e.target.value)} 
                className="font-mono text-sm flex-1 min-h-[150px] resize-none border-blue-200 focus-visible:ring-blue-500 overflow-y-auto" 
                style={{ fieldSizing: "fixed" } as any}
                placeholder="1   MILAN Jonathan   Lidl - Trek..."
              />
              <Button onClick={handleGenerate} className="w-full bg-orange-600 hover:bg-orange-700 mt-3 py-6 text-base shadow-sm shrink-0">
                Generar Filas para Google Sheets
              </Button>
            </div>
          </div>

          <div className="flex flex-col h-full min-h-[250px] overflow-hidden">
            <h3 className="font-semibold text-sm mb-1 shrink-0">3. Resultado para Copiar</h3>
            <p className="text-xs text-neutral-500 mb-2 shrink-0">
              Haz clic en <b>Copiar todo</b> y pega las filas en la pestaña Resultados, asegurándote de coincidir con la columna "Ciclista".
            </p>
            
            <div className="relative flex-1 min-h-[150px] flex flex-col overflow-hidden">
              <Textarea 
                value={resultText} 
                readOnly
                className="font-mono text-sm flex-1 min-h-[150px] h-full bg-neutral-50 resize-none whitespace-pre border-green-200 overflow-y-auto" 
                style={{ fieldSizing: "fixed" } as any}
                placeholder="Las filas generadas aparecerán aquí..."
              />
              {resultText && (
                <Button 
                  size="lg" 
                  onClick={handleCopy} 
                  className={`absolute top-3 right-3 gap-2 shadow-md transition-all ${copied ? 'bg-green-600 hover:bg-green-700 scale-105' : 'bg-neutral-800 hover:bg-neutral-900'}`}
                >
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <ClipboardCopy className="w-5 h-5" />}
                  {copied ? "¡Copiado al portapapeles!" : "Copiar todo"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
