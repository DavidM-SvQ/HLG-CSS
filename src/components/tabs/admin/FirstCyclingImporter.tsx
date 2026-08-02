import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Checkbox } from "../../ui/checkbox";
import { Download, ClipboardCopy, CheckCircle2, AlertTriangle, XCircle, Info, ShieldCheck, Check, Search } from "lucide-react";
import { useDataStore } from "../../../lib/stores/useDataStore";
import { getVal } from "../../../lib/data-processing";

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

  const [url, setUrl] = useState("");
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState("");

  const { files } = useDataStore();
  const [availableRaces, setAvailableRaces] = useState<string[]>([]);

  // Robust validation engine to check with "Carreras HLG 2026", "Puntos HLG 2026", "Ciclistas 2026" & "Elecciones 2026"
  const validationReport = useMemo(() => {
    if (!files.carreras?.data) return null;

    const cleanInputRace = carrera.trim();
    
    const normalize = (str: string) => {
      if (!str) return "";
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();
    };

    const normInput = normalize(cleanInputRace);
    let matchedRaceRow: any = null;
    let isExactMatch = false;

    if (normInput) {
      // First try exact normalized match
      matchedRaceRow = files?.carreras?.data.find(
        (r: any) => normalize(getVal(r, "Carrera") || "") === normInput
      );
      if (matchedRaceRow) {
        isExactMatch = true;
      } else {
        // Try substring match
        matchedRaceRow = files?.carreras?.data.find((r: any) => {
          const normSheet = normalize(getVal(r, "Carrera") || "");
          return normSheet.includes(normInput) || normInput.includes(normSheet);
        });
      }
    }

    const sheetRaceName = matchedRaceRow ? (getVal(matchedRaceRow, "Carrera") || "").trim() : "";
    const categoria = matchedRaceRow ? (getVal(matchedRaceRow, "Categoría") || "").trim() : "";

    // 2. Validate Puntos
    let hasPointsConfig = false;
    let pointsTableMatches = 0;
    if (categoria && files.puntos?.data) {
      const matches = files?.puntos?.data.filter((p: any) => {
        const catPuntos = normalize(getVal(p, "Categoría") || "");
        return catPuntos === normalize(categoria);
      });
      pointsTableMatches = matches.length;
      hasPointsConfig = matches.length > 0;
    }

    // 3. Validate Riders
    const riderChecks: { name: string; team: string; inCiclistas: boolean; inElecciones: boolean }[] = [];
    let criticalErrorsCount = 0;
    let warningCount = 0;

    if (resultText) {
      const lines = resultText.split("\n");
      const seenRiders = new Set<string>();

      lines.forEach((line) => {
        const parts = line.split("\t");
        if (parts.length >= 8) {
          const riderName = parts[7]?.trim();
          const teamName = parts[8]?.trim() || "";
          if (riderName && !seenRiders.has(riderName)) {
            seenRiders.add(riderName);

            // Check in Ciclistas 2026
            const normRider = normalize(riderName);
            const inCiclistas = !!files.ciclistas?.data?.some(
              (c: any) => normalize(getVal(c, "Ciclista") || "") === normRider
            );

            // Check in Elecciones 2026
            const inElecciones = !!files.elecciones?.data?.some(
              (e: any) => normalize(getVal(e, "Ciclista") || "") === normRider
            );

            if (!inCiclistas) criticalErrorsCount++;
            if (!inElecciones) warningCount++;

            riderChecks.push({
              name: riderName,
              team: teamName,
              inCiclistas,
              inElecciones,
            });
          }
        }
      });
    }

    return {
      cleanInputRace,
      matchedRaceRow,
      isExactMatch,
      sheetRaceName,
      categoria,
      hasPointsConfig,
      pointsTableMatches,
      riderChecks,
      criticalErrorsCount,
      warningCount,
    };
  }, [carrera, files.carreras, files.puntos, files.ciclistas, files.elecciones, resultText]);

  // Auto-correct carrera state if there's a strong normalized match but with slightly different letters
  useEffect(() => {
    if (validationReport && validationReport.sheetRaceName && validationReport.sheetRaceName !== carrera) {
      const normalize = (str: string) => {
        if (!str) return "";
        return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
      };
      if (normalize(validationReport.sheetRaceName) === normalize(carrera)) {
        setCarrera(validationReport.sheetRaceName);
      }
    }
  }, [validationReport?.sheetRaceName]);

  // Keep resultText columns in sync with manual edits to fields
  useEffect(() => {
    if (!resultText) return;

    let outputFecha = fecha;
    if (fecha.includes("-")) {
      const parts = fecha.split("-");
      if (parts.length === 3) {
        outputFecha = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const lines = resultText.split("\n");
    const updatedLines = lines.map((line) => {
      const parts = line.split("\t");
      if (parts.length >= 8) {
        parts[0] = outputFecha;
        parts[1] = carrera;
        parts[2] = tipo;
        parts[3] = etapa;
        return parts.join("\t");
      }
      return line;
    });

    const newText = updatedLines.join("\n");
    if (newText !== resultText) {
      setResultText(newText);
    }
  }, [carrera, tipo, etapa, fecha]);

  const handleImportFromUrl = async () => {
    if (!url) {
      setUrlError("Por favor, introduce una URL de FirstCycling.");
      return;
    }

    if (!url.toLowerCase().includes("firstcycling.com")) {
      setUrlError("La URL debe pertenecer a firstcycling.com");
      return;
    }

    setLoadingUrl(true);
    setUrlError("");

    try {
      const response = await fetch("/api/fetch-first-cycling", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Ocurrió un error al raspar la página.");
      }

      setCarrera(data.carrera || "");
      setEtapa(data.etapa || "");
      setTipo(data.tipo || "Etapa");
      setFecha(data.fecha || "");
      setResultText(data.tabulatedData || "");
      setCopied(false);
      setUrlError("");
    } catch (err: any) {
      setUrlError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoadingUrl(false);
    }
  };

  useEffect(() => {
    // Populate today's date in YYYY-MM-DD
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setFecha(`${yyyy}-${mm}-${dd}`);

    // Populate races from calendario, excluding finished races
    if (files.carreras?.data) {
      const allRaces = files?.carreras?.data
        .map((r: any) => String(getVal(r, "Carrera") || "").trim())
        .filter((r: string) => r !== "");
      
      const finishedRaces = new Set<string>();
      if (files.resultados?.data) {
         files?.resultados?.data.forEach((r: any) => {
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
                outLines.push(`${outputFecha}\t${carrera}\t${tipo}\t${etapa}\t${currentTeamPos}\t\t\t${name}\t${currentTeamName}\t`);
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
          
          // Parse UCI points: if there's any column after the team, find if the last one is a number
          let uciPoints = "";
          const teamIndex = cols.indexOf(teamName);
          if (teamIndex !== -1 && teamIndex < cols.length - 1) {
            const lastVal = cols[cols.length - 1];
            if (/^\d+(\.\d+)?$/.test(lastVal)) {
              uciPoints = lastVal;
            }
          }
          
          outLines.push(`${outputFecha}\t${carrera}\t${tipo}\t${etapa}\t${pos}\t\t\t${name}\t${teamName}\t${uciPoints}`);
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
            {/* Opción rápida: Importar por URL */}
            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200/60 space-y-3 shrink-0">
              <h3 className="font-bold text-sm text-orange-800 flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                Opción A: Importar directamente desde URL
              </h3>
              <p className="text-xs text-neutral-600">
                Pega la URL de la etapa o clasificación final en FirstCycling (ej. <i>https://firstcycling.com/race.php?r=17&y=2026&e=07</i>) y el sistema la procesará y generará las filas al instante.
              </p>
              <div className="flex gap-2">
                <Input 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                  placeholder="https://firstcycling.com/race.php?..." 
                  className="bg-white flex-1 border-orange-200/80 focus-visible:ring-orange-500 text-sm"
                />
                <Button 
                  onClick={handleImportFromUrl} 
                  disabled={loadingUrl}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm h-9 px-4 shrink-0 transition-colors"
                >
                  {loadingUrl ? "Procesando..." : "Importar URL"}
                </Button>
              </div>
              {urlError && (
                <p className="text-xs font-semibold text-red-600 mt-1">{urlError}</p>
              )}
            </div>

            <div className="text-center font-bold text-neutral-400 text-xs my-1">— O BIEN —</div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-4 shrink-0">
              <h3 className="font-bold text-sm text-neutral-800">Opción B: Pegar texto manualmente</h3>

              
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
            
            <div className="relative h-52 shrink-0 flex flex-col overflow-hidden">
              <Textarea 
                value={resultText} 
                readOnly
                className="font-mono text-sm flex-1 bg-neutral-50 resize-none whitespace-pre border-green-200 overflow-y-auto" 
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

            {resultText && validationReport && (
              <div className="mt-4 border border-neutral-200 rounded-xl bg-white p-4 space-y-4 flex-1 overflow-y-auto max-h-[350px] shadow-sm">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <ShieldCheck className={`w-4 h-4 ${validationReport.criticalErrorsCount > 0 || !validationReport.matchedRaceRow ? "text-red-500" : "text-emerald-500"}`} />
                    Verificación de Integridad y Fichas (2026)
                  </h4>
                  {validationReport.criticalErrorsCount > 0 || !validationReport.matchedRaceRow ? (
                    <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Error detectado
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Todo correcto
                    </span>
                  )}
                </div>

                {/* 1. Carrera y Puntos */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-neutral-700">1. Carrera y Puntos:</p>
                  {validationReport.matchedRaceRow ? (
                    <div className="space-y-1 pl-3 border-l-2 border-emerald-500">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>Carrera encontrada: "{validationReport.sheetRaceName}"</span>
                      </div>
                      <div className="text-[11px] text-neutral-600 pl-5">
                        Categoría de carrera: <span className="font-semibold">{validationReport.categoria || "No definida"}</span>
                      </div>
                      {validationReport.hasPointsConfig ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 pl-5 font-medium">
                          <Check className="w-3 h-3 shrink-0" />
                          Categoría válida en "Puntos HLG 2026" ({validationReport.pointsTableMatches} filas de puntos configuradas)
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-red-600 pl-5 font-semibold bg-red-50/50 p-1.5 rounded border border-red-100 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          ¡Advertencia!: No hay reglas de puntuación para "{validationReport.categoria}" en "Puntos HLG 2026". ¡Los puntos no se calcularán!
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5 pl-3 border-l-2 border-red-500 bg-red-50/40 p-2.5 rounded-r border-y border-r border-red-100">
                      <div className="flex items-center gap-1.5 text-xs text-red-700 font-bold">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>Carrera no registrada: "{carrera || "(Vacío)"}"</span>
                      </div>
                      <p className="text-[11px] text-red-600 pl-5 leading-relaxed">
                        No se encuentra en "Carreras HLG 2026". <strong>¡El cálculo de puntos de esta carrera fallará por completo!</strong>
                      </p>
                      <p className="text-[11px] text-neutral-600 pl-5">
                        Por favor, utiliza el selector de carreras de la Opción B para asignarle un nombre oficial de la lista o cámbialo en "Carreras HLG 2026".
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Ciclistas y Elecciones */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-neutral-700">2. Ciclistas y Elecciones (Draft):</p>
                  
                  {validationReport.riderChecks.length === 0 ? (
                    <p className="text-xs text-neutral-500 pl-3 italic">No hay ciclistas importados para verificar todavía.</p>
                  ) : (
                    <div className="space-y-2">
                      {/* Resumen */}
                      <div className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded border border-neutral-200/60 flex items-center justify-between">
                        <span>Total de ciclistas únicos en resultados: <strong className="text-neutral-800">{validationReport.riderChecks.length}</strong></span>
                        <div className="flex gap-2 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${validationReport.criticalErrorsCount > 0 ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                            Falta Ciclistas: {validationReport.criticalErrorsCount}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-bold ${validationReport.warningCount > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                            Falta Elecciones: {validationReport.warningCount}
                          </span>
                        </div>
                      </div>

                      {/* Lista de Errores Críticos (Ciclistas 2026) */}
                      {validationReport.criticalErrorsCount > 0 && (
                        <div className="pl-3 border-l-2 border-red-500 bg-red-50/30 p-2 rounded border border-red-100/50 space-y-1">
                          <p className="text-xs font-bold text-red-700 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Crítico: No registrados en "Ciclistas 2026"
                          </p>
                          <p className="text-[10px] text-red-600 leading-normal mb-1">
                            Estos corredores no están en la lista oficial de ciclistas. Si no se añaden, el sistema no podrá asignarles equipo UCI ni procesar su historial.
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {validationReport.riderChecks.filter(r => !r.inCiclistas).map((r, idx) => (
                              <span key={idx} className="text-[10px] font-mono font-semibold bg-red-100/80 text-red-800 px-2 py-0.5 rounded border border-red-200">
                                {r.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lista de Advertencias (Elecciones 2026) */}
                      {validationReport.warningCount > 0 && (
                        <div className="pl-3 border-l-2 border-amber-500 bg-amber-50/30 p-2 rounded border border-amber-100/50 space-y-1">
                          <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Sin mánager: No elegidos en "Elecciones 2026" (Draft)
                          </p>
                          <p className="text-[10px] text-amber-600 leading-normal mb-1">
                            Corredores que no fueron drafteados por ningún jugador de la liga. Esto es normal para corredores libres, pero se generarán 0 puntos para la liga.
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {validationReport.riderChecks.filter(r => r.inCiclistas && !r.inElecciones).map((r, idx) => (
                              <span key={idx} className="text-[10px] font-mono bg-amber-100/80 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                                {r.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Si todo es perfecto */}
                      {validationReport.criticalErrorsCount === 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pl-3 border-l-2 border-emerald-500 bg-emerald-50/20 p-2 rounded">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Todos los corredores existen en "Ciclistas 2026"
                          {validationReport.warningCount === 0 && " y fueron elegidos en el Draft (Elecciones)."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
