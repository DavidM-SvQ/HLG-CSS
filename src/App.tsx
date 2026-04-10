import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  UploadCloud, CheckCircle2, AlertCircle, Trophy, Medal, 
  Users, FileSpreadsheet, ChevronDown, ChevronUp, LogIn, LogOut, Globe 
} from 'lucide-react';
import { cn } from './lib/utils';
import { 
  auth, db, googleProvider, signInWithPopup, onAuthStateChanged, 
  doc, setDoc, onSnapshot, User 
} from './firebase';

// --- Types ---
type ParsedData = Record<string, any>[];

interface FileState {
  file: File | null;
  data: ParsedData | null;
  error: string | null;
  loading?: boolean;
}

interface AppState {
  carreras: FileState;
  ciclistas: FileState;
  elecciones: FileState;
  equipos: FileState;
  puntos: FileState;
  resultados: FileState;
}

interface PlayerScore {
  jugador: string;
  puntos: number;
  detalles: {
    ciclista: string;
    carrera: string;
    tipoResultado: string;
    posicion: string | number;
    puntosObtenidos: number;
  }[];
}

// --- Constants ---
const FILE_TYPES = [
  { id: 'carreras', name: 'Carreras HLG 2026', icon: Trophy, expectedCols: ['Carrera', 'Categoría'], global: true },
  { id: 'ciclistas', name: 'Ciclistas 2026', icon: Users, expectedCols: ['Ciclista'], global: true },
  { id: 'elecciones', name: 'Elecciones 2026', icon: Users, expectedCols: ['Ciclista', 'Nombre_TG'], global: true },
  { id: 'equipos', name: 'Equipos 2026', icon: Users, expectedCols: ['EQUIPO COMPLETO'], global: true },
  { id: 'puntos', name: 'Puntos HLG 2026', icon: FileSpreadsheet, expectedCols: ['Categoría', 'Tipo', 'Posición', 'Puntos'], global: true },
  { id: 'resultados', name: 'Resultados FirstCycling', icon: Medal, expectedCols: ['Carrera', 'Ciclista', 'Tipo', 'Pos'], global: true },
] as const;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [files, setFiles] = useState<AppState>({
    carreras: { file: null, data: null, error: null, loading: true },
    ciclistas: { file: null, data: null, error: null, loading: true },
    elecciones: { file: null, data: null, error: null, loading: true },
    equipos: { file: null, data: null, error: null, loading: true },
    puntos: { file: null, data: null, error: null, loading: true },
    resultados: { file: null, data: null, error: null, loading: true },
  });

  const isAdmin = user?.email === 'davidmv1985@gmail.com';

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
  }, []);

  // Automatically switch to admin view if user is admin
  useEffect(() => {
    if (isAdmin) setView('admin');
    else setView('public');
  }, [isAdmin]);

  const [leaderboard, setLeaderboard] = useState<PlayerScore[] | null>(null);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const allFilesUploaded = (Object.values(files) as FileState[]).every(f => f.data !== null);

  // Automatically calculate points when all files are ready
  useEffect(() => {
    if (allFilesUploaded) {
      calculatePoints();
    }
  }, [files, allFilesUploaded]);

  // Firestore sync for global files
  useEffect(() => {
    if (!isAuthReady || !user) {
      // If not logged in, stop loading global files
      setFiles(prev => ({
        ...prev,
        carreras: { ...prev.carreras, loading: false },
        ciclistas: { ...prev.ciclistas, loading: false },
        elecciones: { ...prev.elecciones, loading: false },
        equipos: { ...prev.equipos, loading: false },
        puntos: { ...prev.puntos, loading: false },
      }));
      return;
    }

    const unsubscribes = FILE_TYPES.filter(ft => ft.global).map(ft => {
      return onSnapshot(doc(db, 'global_files', ft.id), (snapshot) => {
        if (snapshot.exists()) {
          try {
            const docData = snapshot.data();
            const parsedData = JSON.parse(docData.data);
            setFiles(prev => ({
              ...prev,
              [ft.id]: { file: null, data: parsedData, error: null, loading: false }
            }));
          } catch (e) {
            console.error(`Error parsing global file ${ft.id}`, e);
            setFiles(prev => ({
              ...prev,
              [ft.id]: { ...prev[ft.id as keyof AppState], loading: false, error: "Error al sincronizar datos globales" }
            }));
          }
        } else {
          setFiles(prev => ({
            ...prev,
            [ft.id]: { ...prev[ft.id as keyof AppState], loading: false, data: null }
          }));
        }
      }, (error) => {
        console.error(`Firestore error for ${ft.id}`, error);
        setFiles(prev => ({
          ...prev,
          [ft.id]: { ...prev[ft.id as keyof AppState], loading: false, error: "Permiso denegado o error de red" }
        }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user, isAuthReady]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => auth.signOut();

  const handleFileUpload = (id: keyof AppState, file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      complete: async (results) => {
        const ftConfig = FILE_TYPES.find(f => f.id === id);
        const expectedCols = ftConfig?.expectedCols || [];
        const actualCols = results.meta.fields || [];
        const missingCols = expectedCols.filter(col => !actualCols.includes(col));

        if (missingCols.length > 0) {
          setFiles(prev => ({
            ...prev,
            [id]: { file, data: null, error: `Faltan columnas: ${missingCols.join(', ')}` }
          }));
        } else {
          const parsedData = results.data as ParsedData;
          
          if (ftConfig?.global) {
            if (!user) {
              setFiles(prev => ({
                ...prev,
                [id]: { file, data: null, error: "Debes iniciar sesión para subir archivos globales" }
              }));
              return;
            }

            try {
              setFiles(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }));
              await setDoc(doc(db, 'global_files', id), {
                data: JSON.stringify(parsedData),
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid
              });
              // State will be updated by onSnapshot
            } catch (e) {
              console.error("Error saving to Firestore", e);
              setFiles(prev => ({
                ...prev,
                [id]: { file, data: null, error: "Error al guardar en la nube" }
              }));
            }
          } else {
            setFiles(prev => ({
              ...prev,
              [id]: { file, data: parsedData, error: null }
            }));
          }
        }
      },
      error: (error) => {
        setFiles(prev => ({
          ...prev,
          [id]: { file, data: null, error: error.message }
        }));
      }
    });
  };

  const calculatePoints = () => {
    if (!allFilesUploaded) return;

    const { carreras, puntos, elecciones, resultados } = files;

    // 1. Build lookup dictionaries
    const playerByCyclist: Record<string, string> = {};
    elecciones.data!.forEach(row => {
      const ciclista = row.Ciclista?.trim();
      const jugador = row.Nombre_TG?.trim();
      if (ciclista && jugador) {
        playerByCyclist[ciclista] = jugador;
      }
    });

    const raceTypeByName: Record<string, string> = {};
    carreras.data!.forEach(row => {
      const carrera = row.Carrera?.trim();
      const categoria = row.Categoría?.trim();
      if (carrera && categoria) {
        raceTypeByName[carrera] = categoria;
      }
    });

    const pointsLookup: Record<string, number> = {};
    puntos.data!.forEach(row => {
      const categoria = row.Categoría?.trim();
      const tipo = row.Tipo?.trim();
      const posicion = row.Posición?.toString().trim();
      const pts = row.Puntos;

      if (categoria && tipo && posicion && pts !== undefined) {
        const key = `${categoria}_${tipo}_${posicion}`;
        pointsLookup[key] = Number(pts);
      }
    });

    // 2. Calculate scores
    const scoresMap: Record<string, PlayerScore> = {};

    resultados.data!.forEach(row => {
      const ciclista = row.Ciclista?.trim();
      const carrera = row.Carrera?.trim();
      const tipoResultado = row.Tipo?.trim();
      const posicion = row.Pos?.toString().trim();

      if (!ciclista || !carrera || !tipoResultado || !posicion) return;

      const jugador = playerByCyclist[ciclista];
      if (!jugador) return;

      const tipoCarrera = raceTypeByName[carrera];
      if (!tipoCarrera) return;

      const pointsKey = `${tipoCarrera}_${tipoResultado}_${posicion}`;
      const puntosObtenidos = pointsLookup[pointsKey] || 0;

      if (!scoresMap[jugador]) {
        scoresMap[jugador] = { jugador, puntos: 0, detalles: [] };
      }

      scoresMap[jugador].puntos += puntosObtenidos;
      
      if (puntosObtenidos > 0) {
        scoresMap[jugador].detalles.push({
          ciclista,
          carrera,
          tipoResultado,
          posicion,
          puntosObtenidos
        });
      }
    });

    const sortedLeaderboard = Object.values(scoresMap).sort((a, b) => b.puntos - a.puntos);
    sortedLeaderboard.forEach(player => {
      player.detalles.sort((a, b) => b.puntosObtenidos - a.puntosObtenidos);
    });

    setLeaderboard(sortedLeaderboard);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-200">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Fantasy Ciclismo HLG</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                  view === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                )}>
                  {view === 'admin' ? 'Panel de Control' : 'Resultados Públicos'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <nav className="flex items-center bg-neutral-100 p-1 rounded-lg mr-4">
                <button 
                  onClick={() => setView('public')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    view === 'public' ? "bg-white shadow-sm text-blue-600" : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  Público
                </button>
                <button 
                  onClick={() => setView('admin')}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    view === 'admin' ? "bg-white shadow-sm text-purple-600" : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  Admin
                </button>
              </nav>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-neutral-900 leading-none">{user.displayName}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {isAdmin ? 'Administrador' : 'Jugador'}
                  </p>
                </div>
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-neutral-200" referrerPolicy="no-referrer" />
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
                className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar: File Uploads (Only for Admin) */}
        {view === 'admin' ? (
          <div className="lg:col-span-4 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Gestión de Datos</h2>
              <p className="text-sm text-neutral-500 mb-4">
                Sube y sincroniza los archivos maestros del juego.
              </p>
            </div>

            {!user && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Modo Local</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Inicia sesión para cargar y sincronizar los archivos globales automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {FILE_TYPES.map((ft) => {
                const state = files[ft.id as keyof AppState];
                const Icon = ft.icon;
                
                return (
                  <div 
                    key={ft.id} 
                    className={cn(
                      "relative overflow-hidden border rounded-xl p-4 transition-all",
                      state.data ? "bg-green-50 border-green-200" : "bg-white border-neutral-200 hover:border-blue-300",
                      state.loading && "animate-pulse opacity-70"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          state.data ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-600"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-medium text-sm text-neutral-900">{ft.name}</h3>
                            {ft.global && <Globe className="w-3 h-3 text-neutral-400" title="Archivo Global" />}
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {state.loading ? "Sincronizando..." : 
                             state.data ? (ft.global ? "Sincronizado en la nube" : state.file?.name) : 
                             "Esperando archivo..."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {state.data ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        ) : state.error ? (
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        ) : null}
                      </div>
                    </div>

                    {state.error && (
                      <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                        {state.error}
                      </div>
                    )}

                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(ft.id as keyof AppState, file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title={`Subir ${ft.name}`}
                    />
                  </div>
                );
              })}
            </div>

            <button
              onClick={calculatePoints}
              disabled={!allFilesUploaded}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                allFilesUploaded 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow" 
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              )}
            >
              <Trophy className="w-5 h-5" />
              Recalcular Puntuaciones
            </button>
          </div>
        ) : (
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Resumen de Temporada</h2>
              <p className="text-sm text-neutral-500 mb-6">
                Aquí podrás ver las estadísticas y el progreso de todos los jugadores en tiempo real.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Carreras Procesadas</span>
                  </div>
                  <span className="font-bold">{files.resultados.data?.length ? [...new Set(files.resultados.data.map(r => r.Carrera))].length : 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Jugadores Activos</span>
                  </div>
                  <span className="font-bold">{leaderboard?.length || 0}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100">
                <p className="text-xs text-neutral-400 text-center italic">
                  Los datos se actualizan automáticamente cuando el administrador sube nuevos resultados.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content: Leaderboard */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
            <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
              <h2 className="text-lg font-semibold text-neutral-900">Clasificación General</h2>
              <p className="text-sm text-neutral-500">Resultados actualizados según los archivos cargados.</p>
            </div>

            <div className="p-6">
              {!leaderboard ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                    <UploadCloud className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-neutral-900 font-medium">Esperando datos</h3>
                    <p className="text-neutral-500 text-sm max-w-sm mt-1">
                      Sincroniza los archivos globales (o súbelos) y carga los resultados actuales para ver la clasificación.
                    </p>
                  </div>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-20 text-neutral-500">
                  No se encontraron puntos. Verifica que los nombres de ciclistas y carreras coincidan entre los archivos.
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((player, index) => (
                    <div 
                      key={player.jugador} 
                      className="border border-neutral-200 rounded-xl overflow-hidden transition-all hover:border-blue-200 bg-white"
                    >
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50"
                        onClick={() => setExpandedPlayer(expandedPlayer === player.jugador ? null : player.jugador)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                            index === 0 ? "bg-yellow-100 text-yellow-700" :
                            index === 1 ? "bg-neutral-200 text-neutral-700" :
                            index === 2 ? "bg-orange-100 text-orange-800" :
                            "bg-blue-50 text-blue-700"
                          )}>
                            {index + 1}
                          </div>
                          <h3 className="font-semibold text-lg text-neutral-900">{player.jugador}</h3>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-bold text-xl text-neutral-900">{player.puntos}</div>
                            <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Puntos</div>
                          </div>
                          {expandedPlayer === player.jugador ? (
                            <ChevronUp className="w-5 h-5 text-neutral-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-neutral-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedPlayer === player.jugador && (
                        <div className="border-t border-neutral-100 bg-neutral-50 p-4">
                          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                            Desglose de Puntos
                          </h4>
                          {player.detalles.length > 0 ? (
                            <div className="space-y-2">
                              {player.detalles.map((detalle, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm bg-white p-3 rounded-lg border border-neutral-100 shadow-sm">
                                  <div className="flex-1">
                                    <span className="font-medium text-neutral-900">{detalle.ciclista}</span>
                                    <span className="text-neutral-400 mx-2">•</span>
                                    <span className="text-neutral-600">{detalle.carrera}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-right">
                                    <div className="text-neutral-500 text-xs">
                                      {detalle.tipoResultado} (Pos: {detalle.posicion})
                                    </div>
                                    <div className="font-semibold text-blue-600 w-12">
                                      +{detalle.puntosObtenidos}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-500 italic">
                              No hay puntos registrados aún.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
