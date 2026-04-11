import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  UploadCloud, CheckCircle2, AlertCircle, Trophy, Medal, 
  Users, FileSpreadsheet, ChevronDown, ChevronUp, LogIn, LogOut, Globe, Clock, Info, Activity, Flag,
  List, LayoutGrid, ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from './lib/utils';
import { 
  auth, db, googleProvider, signInWithPopup, onAuthStateChanged, 
  doc, setDoc, getDoc, onSnapshot, User 
} from './firebase';

// --- Types ---
type ParsedData = Record<string, any>[];

interface FileState {
  file: File | null;
  data: ParsedData | null;
  error: string | null;
  loading?: boolean;
  updatedAt?: string;
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
  nombreEquipo: string;
  orden: string;
  puntos: number;
  detalles: {
    ciclista: string;
    ronda: string;
    carrera: string;
    tipoResultado: string;
    etapa?: string;
    posicion: string | number;
    puntosObtenidos: number;
  }[];
}

// --- Constants ---
const FILE_TYPES = [
  { id: 'carreras', name: 'Carreras HLG 2026', icon: Trophy, expectedCols: ['Carrera', 'Categoría', 'Fecha'], global: true },
  { id: 'ciclistas', name: 'Ciclistas 2026', icon: Users, expectedCols: ['Ciclista', 'Pais', 'Equipo'], global: true },
  { id: 'elecciones', name: 'Elecciones 2026', icon: Users, expectedCols: ['Ciclista', 'Nombre_TG', 'Nombre_Equipo', 'Edad', 'Ronda', 'País'], global: true },
  { id: 'equipos', name: 'Equipos 2026', icon: Users, expectedCols: ['EQUIPO COMPLETO', 'EQUIPO BREVE'], global: true },
  { id: 'puntos', name: 'Puntos HLG 2026', icon: FileSpreadsheet, expectedCols: ['Categoría', 'Tipo', 'Posición', 'Puntos'], global: true },
  { id: 'resultados', name: 'Resultados FirstCycling', icon: Medal, expectedCols: ['Carrera', 'Ciclista', 'Tipo', 'Pos', 'Etapa'], global: true },
] as const;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [publicTab, setPublicTab] = useState<'season' | 'race' | 'startlist' | 'team' | 'draft' | 'info'>('season');
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  
  // Info tab states
  const [infoSubTab, setInfoSubTab] = useState<'menu' | 'puntuaciones' | 'carreras'>('menu');
  const [pointsCategoryFilter, setPointsCategoryFilter] = useState<string>('');
  const [pointsRaceSearch, setPointsRaceSearch] = useState<string>('');
  const [racesFilter, setRacesFilter] = useState<'all' | 'finished' | 'upcoming'>('all');
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
  const [cyclistMetadata, setCyclistMetadata] = useState<Record<string, { 
    edad: string, 
    pais: string, 
    equipoBreve: string, 
    ronda: string,
    carrerasDisputadas: number,
    diasCompeticion: number
  }>>({});

  const allFilesUploaded = (Object.values(files) as FileState[]).every(f => f.data !== null);

  // Automatically calculate points when all files are ready
  useEffect(() => {
    if (allFilesUploaded) {
      calculatePoints();
    }
  }, [files, allFilesUploaded]);

  // Firestore sync for global files
  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const unsubscribes = FILE_TYPES.filter(ft => ft.global).map(ft => {
      return onSnapshot(doc(db, 'global_files', ft.id), async (snapshot) => {
        if (snapshot.exists()) {
          try {
            const docData = snapshot.data();
            let parsedData;
            
            if (docData.isChunked) {
              let fullString = '';
              for (let i = 0; i < docData.numChunks; i++) {
                const chunkSnap = await getDoc(doc(db, 'global_files', `${ft.id}_chunk_${i}`));
                if (chunkSnap.exists()) {
                  fullString += chunkSnap.data().data;
                }
              }
              parsedData = JSON.parse(fullString);
            } else {
              parsedData = JSON.parse(docData.data);
            }

            setFiles(prev => ({
              ...prev,
              [ft.id]: { file: null, data: parsedData, error: null, loading: false, updatedAt: docData.updatedAt }
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
          [ft.id]: { ...prev[ft.id as keyof AppState], loading: false, error: `Error de lectura (onSnapshot): ${error.message}` }
        }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [isAuthReady]);

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
        const missingCols = (expectedCols as string[]).filter(expected => 
          !actualCols.some(actual => (actual as string).toLowerCase() === (expected as string).toLowerCase())
        );

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
              const jsonString = JSON.stringify(parsedData);
              const CHUNK_SIZE = 900000; // 900KB
              
              if (jsonString.length > CHUNK_SIZE) {
                const numChunks = Math.ceil(jsonString.length / CHUNK_SIZE);
                for (let i = 0; i < numChunks; i++) {
                  const chunkData = jsonString.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                  await setDoc(doc(db, 'global_files', `${id}_chunk_${i}`), {
                    data: chunkData
                  });
                }
                await setDoc(doc(db, 'global_files', id), {
                  isChunked: true,
                  numChunks,
                  updatedAt: new Date().toISOString(),
                  updatedBy: user.uid
                });
              } else {
                await setDoc(doc(db, 'global_files', id), {
                  isChunked: false,
                  data: jsonString,
                  updatedAt: new Date().toISOString(),
                  updatedBy: user.uid
                });
              }
              // State will be updated by onSnapshot
            } catch (e: any) {
              console.error("Error saving to Firestore", e);
              setFiles(prev => ({
                ...prev,
                [id]: { file, data: null, error: `Error al guardar (setDoc): ${e.message}` }
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
    const playerOrderMap: Record<string, string> = {};
    const cyclistRoundMap: Record<string, string> = {};
    const playerTeamMap: Record<string, string> = {};
    const teamToPlayerMap: Record<string, string> = {};
    const cyclistMetadata: Record<string, { 
      edad: string, 
      pais: string, 
      equipoBreve: string, 
      ronda: string,
      carrerasDisputadas: number,
      diasCompeticion: number
    }> = {};
    
    const uniquePlayers = [...new Set(elecciones.data!.map(r => getVal(r, 'Nombre_TG')?.trim()).filter(Boolean))] as string[];
    const numPlayers = uniquePlayers.length;

    // Build team/cyclist info
    const fullToBreve: Record<string, string> = {};
    files.equipos.data?.forEach(row => {
      const full = getVal(row, 'EQUIPO COMPLETO')?.toString().trim().toLowerCase();
      const breve = getVal(row, 'EQUIPO BREVE')?.toString().trim();
      if (full && breve) fullToBreve[full] = breve;
    });

    const cyclistToInfo: Record<string, { pais: string, equipoBreve: string }> = {};
    files.ciclistas.data?.forEach(row => {
      const ciclista = getVal(row, 'Ciclista')?.toString().trim();
      const pais = getVal(row, 'Pais')?.toString().trim();
      const full = getVal(row, 'Equipo')?.toString().trim().toLowerCase();
      if (ciclista) {
        cyclistToInfo[ciclista] = {
          pais: pais || '',
          equipoBreve: (full && fullToBreve[full]) || ''
        };
      }
    });

    // Pre-calculate cyclist stats from resultados
    const cyclistStats: Record<string, { carreras: Set<string>, dias: number }> = {};
    resultados.data?.forEach(row => {
      const ciclista = getVal(row, 'Ciclista')?.trim();
      const carrera = getVal(row, 'Carrera')?.trim();
      const etapa = getVal(row, 'Etapa')?.toString().trim();
      
      if (ciclista && carrera) {
        if (!cyclistStats[ciclista]) {
          cyclistStats[ciclista] = { carreras: new Set(), dias: 0 };
        }
        cyclistStats[ciclista].carreras.add(carrera);
        
        // Días: count all except Etapa = CP or CM
        if (etapa !== 'CP' && etapa !== 'CM') {
          cyclistStats[ciclista].dias += 1;
        }
      }
    });

    elecciones.data!.forEach((row, idx) => {
      const ciclista = getVal(row, 'Ciclista')?.trim();
      const jugador = getVal(row, 'Nombre_TG')?.trim();
      const nombreEquipo = getVal(row, 'Nombre_Equipo')?.trim();
      const edad = getVal(row, 'Edad')?.toString().trim();
      const paisElecciones = getVal(row, 'País')?.trim();
      
      if (ciclista && jugador) {
        const playerIdx = uniquePlayers.indexOf(jugador);
        playerOrderMap[jugador] = (playerIdx + 1).toString().padStart(2, '0');
        
        if (nombreEquipo) {
          playerTeamMap[jugador] = nombreEquipo;
          teamToPlayerMap[nombreEquipo] = jugador;
        }
        
        let ronda = getVal(row, 'Ronda')?.toString().trim();
        if (!ronda && numPlayers > 0) {
            ronda = (Math.floor(idx / numPlayers) + 1).toString().padStart(2, '0');
        } else if (ronda) {
            ronda = ronda.padStart(2, '0');
        }
        
        playerByCyclist[ciclista] = jugador;
        cyclistRoundMap[ciclista] = ronda || '';

        cyclistMetadata[ciclista] = {
          edad: edad || '',
          pais: getFlagEmoji(paisElecciones || cyclistToInfo[ciclista]?.pais || ''),
          equipoBreve: cyclistToInfo[ciclista]?.equipoBreve || '',
          ronda: ronda || '',
          carrerasDisputadas: cyclistStats[ciclista]?.carreras.size || 0,
          diasCompeticion: cyclistStats[ciclista]?.dias || 0
        };
      }
    });

    setCyclistMetadata(cyclistMetadata);

    const raceTypeByName: Record<string, string> = {};
    carreras.data!.forEach(row => {
      const carrera = getVal(row, 'Carrera')?.trim();
      const categoria = getVal(row, 'Categoría')?.trim();
      if (carrera && categoria) {
        raceTypeByName[carrera] = categoria;
      }
    });

    const pointsLookup: Record<string, number> = {};
    puntos.data!.forEach(row => {
      const categoria = getVal(row, 'Categoría')?.trim();
      const tipo = getVal(row, 'Tipo')?.trim();
      const posicion = getVal(row, 'Posición')?.toString().trim();
      const pts = getVal(row, 'Puntos');

      if (categoria && tipo && posicion && pts !== undefined) {
        const key = `${categoria}_${tipo}_${posicion}`;
        pointsLookup[key] = Number(pts);
      }
    });

    // 2. Calculate scores
    const scoresMap: Record<string, PlayerScore> = {};

    resultados.data!.forEach(row => {
      const ciclista = getVal(row, 'Ciclista')?.trim();
      const carrera = getVal(row, 'Carrera')?.trim();
      const tipoResultado = getVal(row, 'Tipo')?.trim();
      const etapa = getVal(row, 'Etapa')?.toString().trim();
      const posicion = getVal(row, 'Pos')?.toString().trim() || '';

      if (!ciclista || !carrera || !tipoResultado) return;

      const jugador = playerByCyclist[ciclista] || 'No draft';
      
      const tipoCarrera = raceTypeByName[carrera];
      if (!tipoCarrera) return;

      const pointsKey = `${tipoCarrera}_${tipoResultado}_${posicion}`;
      const puntosObtenidos = pointsLookup[pointsKey] || 0;

      if (!scoresMap[jugador]) {
        scoresMap[jugador] = { 
          jugador, 
          nombreEquipo: jugador === 'No draft' ? 'No draft' : (playerTeamMap[jugador] || jugador),
          orden: jugador === 'No draft' ? '99' : (playerOrderMap[jugador] || ''),
          puntos: 0, 
          detalles: [] 
        };
      }

      scoresMap[jugador].puntos += puntosObtenidos;
      
      scoresMap[jugador].detalles.push({
        ciclista,
        ronda: cyclistRoundMap[ciclista] || '',
        carrera,
        tipoResultado,
        etapa,
        posicion,
        puntosObtenidos
      });
    });

    const sortedLeaderboard = Object.values(scoresMap).sort((a, b) => b.puntos - a.puntos);
    sortedLeaderboard.forEach(player => {
      player.detalles.sort((a, b) => b.puntosObtenidos - a.puntosObtenidos);
    });

    setLeaderboard(sortedLeaderboard);
  };

  const lastUpdatedDates = (Object.values(files) as FileState[])
    .map(f => f.updatedAt ? new Date(f.updatedAt).getTime() : 0)
    .filter(t => t > 0);
  const lastUpdated = lastUpdatedDates.length > 0 ? new Date(Math.max(...lastUpdatedDates)) : null;

  // --- Helpers ---
const getFlagEmoji = (countryName: string) => {
  if (!countryName) return '';
  const country = countryName.trim().toLowerCase();
  const flags: Record<string, string> = {
    "spain": "🇪🇸", "españa": "🇪🇸",
    "france": "🇫🇷", "francia": "🇫🇷",
    "italy": "🇮🇹", "italia": "🇮🇹",
    "belgium": "🇧🇪", "bélgica": "🇧🇪",
    "netherlands": "🇳🇱", "países bajos": "🇳🇱", "holanda": "🇳🇱",
    "slovenia": "🇸🇮", "eslovenia": "🇸🇮",
    "denmark": "🇩🇰", "dinamarca": "🇩🇰",
    "great britain": "🇬🇧", "gran bretaña": "🇬🇧", "united kingdom": "🇬🇧", "reino unido": "🇬🇧",
    "australia": "🇦🇺",
    "usa": "🇺🇸", "united states": "🇺🇸", "eeuu": "🇺🇸", "estados unidos": "🇺🇸",
    "colombia": "🇨🇴",
    "ecuador": "🇪🇨",
    "norway": "🇳🇴", "noruega": "🇳🇴",
    "germany": "🇩🇪", "alemania": "🇩🇪",
    "switzerland": "🇨🇭", "suiza": "🇨🇭",
    "portugal": "🇵🇹",
    "austria": "🇦🇹",
    "ireland": "🇮🇪", "irlanda": "🇮🇪",
    "canada": "🇨🇦", "canadá": "🇨🇦",
    "new zealand": "🇳🇿", "nueva zelanda": "🇳🇿",
    "eritrea": "🇪🇷",
    "kazakhstan": "🇰🇿", "kazajistán": "🇰🇿",
    "poland": "🇵🇱", "polonia": "🇵🇱",
    "czech republic": "🇨🇿", "república checa": "🇨🇿",
    "slovakia": "🇸🇰", "eslovaquia": "🇸🇰",
    "hungary": "🇭🇺", "hungría": "🇭🇺",
    "luxembourg": "🇱🇺", "luxemburgo": "🇱🇺",
    "south africa": "🇿🇦", "sudáfrica": "🇿🇦",
    "latvia": "🇱🇻", "letonia": "🇱🇻",
    "estonia": "🇪🇪",
    "lithuania": "🇱🇹", "lituania": "🇱🇹",
    "israel": "🇮🇱",
    "japan": "🇯🇵", "japón": "🇯🇵",
    "china": "🇨🇳",
    "russia": "🇷🇺", "rusia": "🇷🇺",
    "ukraine": "🇺🇦", "ucrania": "🇺🇦",
    "belarus": "🇧🇾", "bielorrusia": "🇧🇾",
    "mexico": "🇲🇽", "méxico": "🇲🇽",
    "argentina": "🇦🇷",
    "brazil": "🇧🇷", "brasil": "🇧🇷",
    "venezuela": "🇻🇪",
    "costa rica": "🇨🇷",
    "panama": "🇵🇦", "panamá": "🇵🇦",
  };
  return flags[country] || countryName;
};

const getVal = (row: any, key: string) => {
  if (!row) return '';
  const normalizedKey = key.toLowerCase().replace(/_/g, '').replace(/\s/g, '');
  const actualKey = Object.keys(row).find(k => 
    k.toLowerCase().replace(/_/g, '').replace(/\s/g, '') === normalizedKey
  );
  return actualKey ? row[actualKey] : '';
};

  const uniqueRaces = React.useMemo(() => {
    if (!files.resultados.data || !files.carreras.data) return [];
    const races = [...new Set(files.resultados.data.map(r => getVal(r, 'Carrera')))].filter(Boolean) as string[];
    
    const raceDates: Record<string, number> = {};
    files.carreras.data.forEach(r => {
      const carreraName = getVal(r, 'Carrera')?.trim();
      const fechaFin = getVal(r, 'Fecha');
      if (carreraName && fechaFin) {
        const parts = fechaFin.split(/[-/]/);
        if (parts.length === 3) {
          let date;
          if (parts[0].length === 4) {
             date = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
          } else {
             date = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
          }
          raceDates[carreraName] = date.getTime();
        }
      }
    });

    return races.sort((a, b) => {
      const dateA = raceDates[a] || 0;
      const dateB = raceDates[b] || 0;
      return dateB - dateA;
    });
  }, [files.resultados.data, files.carreras.data]);

  const raceWinners = React.useMemo(() => {
    if (!leaderboard || !files.carreras.data) return {};
    const winners: Record<string, string> = {};
    const races = files.carreras.data.map(r => getVal(r, 'Carrera')).filter(Boolean) as string[];
    
    races.forEach(race => {
      let maxPoints = 0;
      let winnerTeam = '';
      leaderboard.forEach(player => {
        const pts = player.detalles.filter(d => d.carrera === race).reduce((sum, d) => sum + d.puntosObtenidos, 0);
        if (pts > maxPoints) {
          maxPoints = pts;
          winnerTeam = player.nombreEquipo;
        }
      });
      if (winnerTeam) winners[race] = winnerTeam;
    });
    return winners;
  }, [leaderboard, files.carreras.data]);

  const formattedTeams = React.useMemo(() => {
    if (!files.elecciones.data) return [];
    
    const teamData: Record<string, string> = {}; // teamName -> order
    const uniquePlayers = [...new Set(files.elecciones.data.map(r => getVal(r, 'Nombre_TG')?.trim()).filter(Boolean))] as string[];
    
    files.elecciones.data.forEach(row => {
      const jugador = getVal(row, 'Nombre_TG')?.trim();
      const nombreEquipo = getVal(row, 'Nombre_Equipo')?.trim() || jugador;
      if (jugador && nombreEquipo && !teamData[nombreEquipo]) {
        const playerIdx = uniquePlayers.indexOf(jugador);
        const order = (playerIdx + 1).toString().padStart(2, '0');
        teamData[nombreEquipo] = order;
      }
    });

    return Object.entries(teamData)
      .map(([name, order]) => ({
        label: `${name} [#${order}]`,
        value: name
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [files.elecciones.data]);

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
              <div className="flex items-center gap-3 mt-0.5">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                  view === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                )}>
                  {view === 'admin' ? 'Panel de Control' : 'Resultados Públicos'}
                </span>
                {lastUpdated && (
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Actualizado: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                )}
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === 'admin' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar: File Uploads (Only for Admin) */}
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
          </div>
        ) : (
          <div className="space-y-8">
            {/* Public Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-4 overflow-x-auto">
              <button
                onClick={() => setPublicTab('season')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === 'season' ? "bg-blue-50 text-blue-700" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <Trophy className="w-4 h-4" />
                Resultados temporada
              </button>
              <button
                onClick={() => setPublicTab('race')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === 'race' ? "bg-blue-50 text-blue-700" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <Flag className="w-4 h-4" />
                Resultados carrera
              </button>
              <button
                onClick={() => setPublicTab('startlist')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === 'startlist' ? "bg-blue-50 text-blue-700" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <List className="w-4 h-4" />
                Startlist carrera
              </button>
              <button
                onClick={() => setPublicTab('team')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === 'team' ? "bg-blue-50 text-blue-700" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <Users className="w-4 h-4" />
                Equipos
              </button>
              <button
                onClick={() => setPublicTab('draft')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === 'draft' ? "bg-blue-50 text-blue-700" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                Draft
              </button>
              <button
                onClick={() => setPublicTab('info')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === 'info' ? "bg-blue-50 text-blue-700" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <Info className="w-4 h-4" />
                Información
              </button>
            </div>

            {/* Tab Content */}
            {publicTab === 'season' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Resumen de Temporada</h2>
                    <p className="text-sm text-neutral-500 mb-6">
                      Estadísticas y progreso de todos los jugadores en tiempo real.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">Carreras Procesadas</span>
                        </div>
                        <span className="font-bold">{uniqueRaces.length}</span>
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
                  </div>
                  
                  {leaderboard && leaderboard.length > 0 && (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                      <h2 className="text-lg font-semibold mb-4">Top 5 Jugadores</h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={leaderboard.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="jugador" type="category" axisLine={false} tickLine={false} fontSize={12} width={80} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Bar dataKey="puntos" radius={[0, 4, 4, 0]}>
                              {leaderboard.slice(0, 5).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#eab308' : index === 1 ? '#94a3b8' : index === 2 ? '#ea580c' : '#3b82f6'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-8">
                  <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
                    <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
                      <h2 className="text-lg font-semibold text-neutral-900">Clasificación General</h2>
                    </div>

                    <div className="p-6">
                      {!leaderboard ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                            <Activity className="w-8 h-8 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-neutral-900 font-medium">Esperando datos</h3>
                            <p className="text-neutral-500 text-sm max-w-sm mt-1">
                              Los resultados se mostrarán aquí cuando estén disponibles.
                            </p>
                          </div>
                        </div>
                      ) : leaderboard.length === 0 ? (
                        <div className="text-center py-20 text-neutral-500">
                          No se encontraron puntos.
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
              </div>
            )}

            {publicTab === 'race' && (
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6">
                <div className="max-w-md mb-8">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Selecciona una carrera</label>
                  <select 
                    value={selectedRace}
                    onChange={(e) => setSelectedRace(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">-- Seleccionar Carrera --</option>
                    {uniqueRaces.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {selectedRace ? (() => {
                  const raceTeams = leaderboard?.map(player => {
                    const details = player.detalles.filter(d => d.carrera === selectedRace);
                    if (details.length === 0) return null;
                    const totalPoints = details.reduce((sum, d) => sum + d.puntosObtenidos, 0);
                    const uniqueCyclists = new Set(details.map(d => d.ciclista)).size;
                    return {
                      jugador: player.jugador,
                      nombreEquipo: player.nombreEquipo,
                      orden: player.orden,
                      totalPoints,
                      uniqueCyclists,
                      details
                    };
                  }).filter(Boolean) as { jugador: string, nombreEquipo: string, orden: string, totalPoints: number, uniqueCyclists: number, details: any[] }[] || [];

                  raceTeams.sort((a, b) => b.totalPoints - a.totalPoints);

                  const allRaceResults = files.resultados.data?.filter(r => getVal(r, 'Carrera') === selectedRace) || [];
                  
                  const formatTipoResultado = (tipo: string) => {
                    const etapaMatch = tipo.match(/Etapa\s+(\d+[a-zA-Z]?)/i);
                    if (etapaMatch) return etapaMatch[1];
                    if (tipo.match(/Clasificación General|CG|Clasificación final/i)) return 'CG';
                    if (tipo.match(/Clasificación.*Montaña|CM|Montaña final/i)) return 'CM';
                    if (tipo.match(/Clasificación.*Puntos|CP|Regularidad final/i)) return 'CP';
                    if (tipo.match(/Clasificación.*Jóvenes|CJ/i)) return 'CJ';
                    return tipo;
                  };

                  const columnDefinitions = new Map<string, { originalTipo: string, originalEtapa?: string, formatted: string }>();
                  
                  allRaceResults.forEach(r => {
                    const tipo = getVal(r, 'Tipo')?.trim();
                    const etapa = getVal(r, 'Etapa')?.toString().trim();
                    
                    if (!tipo) return;
                    
                    const formatted = formatTipoResultado(tipo);
                    const isStage = /^\d+[a-zA-Z]?$/.test(formatted) || tipo.toLowerCase() === 'etapa';
                    
                    if (isStage) {
                      const stageNum = etapa || formatted;
                      const key = `Stage_${stageNum}`;
                      if (!columnDefinitions.has(key)) {
                        columnDefinitions.set(key, {
                          originalTipo: tipo,
                          originalEtapa: etapa,
                          formatted: stageNum
                        });
                      }
                    } else {
                      if (!columnDefinitions.has(formatted)) {
                        columnDefinitions.set(formatted, {
                          originalTipo: tipo,
                          formatted: formatted
                        });
                      }
                    }
                  });

                  const typesWithPoints = new Set<string>();
                  raceTeams.forEach(team => team.details.forEach(d => {
                    if (d.puntosObtenidos > 0) {
                      if (d.etapa) {
                        typesWithPoints.add(`Stage_${d.etapa}`);
                      } else {
                        typesWithPoints.add(formatTipoResultado(d.tipoResultado));
                      }
                    }
                  }));

                  // Filter out CM/CP if no points
                  const finalColumns = Array.from(columnDefinitions.values()).filter(col => {
                    if (col.formatted === 'CM' || col.formatted === 'CP') {
                      return typesWithPoints.has(col.formatted);
                    }
                    return true;
                  });

                  finalColumns.sort((a, b) => {
                    const isNumA = /^\d+[a-zA-Z]?$/.test(a.formatted);
                    const isNumB = /^\d+[a-zA-Z]?$/.test(b.formatted);
                    if (isNumA && isNumB) return parseInt(a.formatted) - parseInt(b.formatted);
                    if (isNumA) return -1;
                    if (isNumB) return 1;
                    
                    const order = ['CG', 'CP', 'CM', 'CJ'];
                    const idxA = order.indexOf(a.formatted);
                    const idxB = order.indexOf(b.formatted);
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    if (idxA !== -1) return -1;
                    if (idxB !== -1) return 1;
                    return a.formatted.localeCompare(b.formatted);
                  });

                  const teamStagePoints = raceTeams.map(team => {
                    const pointsByCol: Record<string, number> = {};
                    finalColumns.forEach(col => {
                      pointsByCol[col.formatted] = team.details
                        .filter(d => {
                          if (col.originalEtapa) {
                            return d.tipoResultado === col.originalTipo && d.etapa === col.originalEtapa;
                          }
                          // If it's a stage from "Etapa 1" format but no Etapa column
                          if (/^\d+[a-zA-Z]?$/.test(col.formatted) && !col.originalEtapa) {
                             return formatTipoResultado(d.tipoResultado) === col.formatted;
                          }
                          return formatTipoResultado(d.tipoResultado) === col.formatted;
                        })
                        .reduce((sum, d) => sum + d.puntosObtenidos, 0);
                    });
                    return {
                      jugador: team.jugador,
                      nombreEquipo: team.nombreEquipo,
                      orden: team.orden,
                      total: team.totalPoints,
                      pointsByCol
                    };
                  });

                  const maxPointsByCol: Record<string, number> = {};
                  finalColumns.forEach(col => {
                    maxPointsByCol[col.formatted] = Math.max(...teamStagePoints.map(t => t.pointsByCol[col.formatted] || 0));
                  });

                  const raceCyclistsMap = new Map<string, {
                    ciclista: string;
                    ronda: string;
                    jugador: string;
                    orden: string;
                    puntos: number;
                    victorias: number;
                  }>();

                  raceTeams.forEach(team => {
                    team.details.forEach(d => {
                      if (!raceCyclistsMap.has(d.ciclista)) {
                        raceCyclistsMap.set(d.ciclista, {
                          ciclista: d.ciclista,
                          ronda: d.ronda,
                          jugador: team.jugador,
                          orden: team.orden,
                          puntos: 0,
                          victorias: 0
                        });
                      }
                      const c = raceCyclistsMap.get(d.ciclista)!;
                      c.puntos += d.puntosObtenidos;
                      
                      const isVictory = d.posicion === '1' && (
                        /Etapa/i.test(d.tipoResultado) || /Clasificación General/i.test(d.tipoResultado) || /CG/i.test(d.tipoResultado)
                      );
                      if (isVictory) {
                        c.victorias += 1;
                      }
                    });
                  });

                  const raceCyclists = Array.from(raceCyclistsMap.values())
                    .filter(c => c.puntos > 0 || c.victorias > 0)
                    .sort((a, b) => b.puntos - a.puntos);

                  return (
                    <div className="space-y-10">
                      {/* Clean Leaderboard */}
                      <div>
                        <h3 className="font-semibold text-xl text-neutral-900 border-b pb-3 mb-4 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-blue-600" />
                          Clasificación de la Carrera
                        </h3>
                        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase text-xs">
                              <tr>
                                <th className="px-4 py-3 w-16 text-center">Pos</th>
                                <th className="px-4 py-3">Equipo</th>
                                <th className="px-4 py-3 text-center">Ciclistas</th>
                                <th className="px-4 py-3 text-right">Puntos</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {raceTeams.map((team, idx) => (
                                <tr key={team.jugador} className="hover:bg-neutral-50 transition-colors">
                                  <td className="px-4 py-3 text-center font-medium text-lg">
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-sm text-neutral-400">{idx + 1}</span>}
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-neutral-900">
                                    {team.nombreEquipo} <span className="text-neutral-400 font-normal">[{team.orden}]</span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-neutral-600">
                                    <span className="bg-neutral-100 px-2 py-1 rounded-md text-xs">{team.uniqueCyclists}</span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold text-blue-600 text-base">{team.totalPoints}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Cyclists Table */}
                      <div className="mt-12">
                        <h3 className="font-semibold text-xl text-neutral-900 border-b pb-3 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Clasificación de Ciclistas
                        </h3>
                        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase text-xs">
                              <tr>
                                <th className="px-4 py-3">Ciclista</th>
                                <th className="px-4 py-3">Jugador</th>
                                <th className="px-4 py-3 text-center">Victorias</th>
                                <th className="px-4 py-3 text-right">Puntos</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {raceCyclists.map((c, idx) => (
                                <tr key={c.ciclista} className="hover:bg-neutral-50 transition-colors">
                                  <td className="px-4 py-3 font-medium text-neutral-900">
                                    {c.ciclista} <span className="text-neutral-400 font-normal">&lt;{c.ronda}&gt;</span>
                                  </td>
                                  <td className="px-4 py-3 text-neutral-600">
                                    {c.jugador} <span className="text-neutral-400 font-normal">[{c.orden}]</span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {c.victorias > 0 ? (
                                      <span className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">
                                        {c.victorias}
                                      </span>
                                    ) : '-'}
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold text-blue-600">{c.puntos}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Stage Breakdown (if multiple types or stage race) */}
                      {(finalColumns.length > 1 || finalColumns.some(c => /^\d+/.test(c.formatted))) && (
                        <div className="mt-12">
                          <h3 className="font-semibold text-xl text-neutral-900 border-b pb-3 mb-6 flex items-center gap-2">
                            <Flag className="w-5 h-5 text-blue-600" />
                            Clasificación por Etapas / Conceptos
                          </h3>
                          <div className="bg-white border border-neutral-200 rounded-xl overflow-x-auto shadow-sm">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                              <thead className="bg-blue-600 text-white uppercase text-xs">
                                <tr>
                                  <th className="px-4 py-3 font-semibold">Equipo</th>
                                  {finalColumns.map(col => (
                                    <th key={col.formatted} className="px-4 py-3 text-center font-semibold">{col.formatted}</th>
                                  ))}
                                  <th className="px-4 py-3 text-right font-semibold">TOTAL</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-100">
                                {teamStagePoints.map((team, idx) => {
                                  // Find max total to color the total column
                                  const maxTotal = Math.max(...teamStagePoints.map(t => t.total));
                                  const minTotal = Math.min(...teamStagePoints.map(t => t.total));
                                  const totalRange = maxTotal - minTotal || 1;
                                  const intensity = Math.max(0.1, (team.total - minTotal) / totalRange);
                                  
                                  return (
                                    <tr key={team.jugador} className="hover:bg-neutral-50 transition-colors">
                                      <td className="px-4 py-3 font-medium text-neutral-900">
                                        {team.nombreEquipo} <span className="text-neutral-400 font-normal">[{team.orden}]</span>
                                      </td>
                                      {finalColumns.map(col => {
                                        const pts = team.pointsByCol[col.formatted] || 0;
                                        const isMax = pts > 0 && pts === maxPointsByCol[col.formatted];
                                        return (
                                          <td 
                                            key={col.formatted} 
                                            className={cn(
                                              "px-4 py-3 text-center",
                                              isMax ? "bg-yellow-200 font-bold text-yellow-900" : pts > 0 ? "text-neutral-700" : "text-neutral-300"
                                            )}
                                          >
                                            {pts > 0 ? pts : ''}
                                          </td>
                                        );
                                      })}
                                      <td 
                                        className="px-4 py-3 text-right font-bold"
                                        style={{ 
                                          backgroundColor: `rgba(34, 197, 94, ${intensity * 0.5})`,
                                          color: intensity > 0.5 ? '#14532d' : '#166534'
                                        }}
                                      >
                                        {team.total}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Detailed Breakdown */}
                      <div className="mt-12">
                        <h3 className="font-semibold text-xl text-neutral-900 border-b pb-3 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Desglose por Equipo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {raceTeams.map(team => {
                            const cyclistMap = new Map<string, { ronda: string, total: number, concepts: any[] }>();
                            team.details.forEach(d => {
                              if (!cyclistMap.has(d.ciclista)) {
                                cyclistMap.set(d.ciclista, { ronda: d.ronda, total: 0, concepts: [] });
                              }
                              const c = cyclistMap.get(d.ciclista)!;
                              c.total += d.puntosObtenidos;
                              c.concepts.push(d);
                            });
                            
                            const sortedCyclists = Array.from(cyclistMap.entries()).sort((a, b) => b[1].total - a[1].total);

                            return (
                              <div key={team.jugador} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                                <div className="flex justify-between items-center mb-3 border-b border-neutral-200 pb-2">
                                  <span className="font-bold text-neutral-900">
                                    {team.jugador} <span className="text-neutral-400 font-normal">[{team.orden}]</span>
                                  </span>
                                  <span className="font-bold text-blue-600">{team.totalPoints} pts</span>
                                </div>
                                <div className="space-y-2">
                                  {sortedCyclists.map(([ciclista, data], idx) => (
                                    <div key={idx} className="flex flex-col text-sm text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-100 shadow-sm">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-neutral-800">
                                          {ciclista} <span className="text-neutral-400 font-normal">&lt;{data.ronda}&gt;</span>
                                        </span>
                                        <span className={cn("font-semibold px-2 py-0.5 rounded-md text-xs", data.total > 0 ? "text-green-700 bg-green-100" : "text-neutral-500 bg-neutral-100")}>
                                          {data.total > 0 ? `+${data.total}` : '0'}
                                        </span>
                                      </div>
                                      {data.concepts.filter(c => c.puntosObtenidos > 0).map((c, cIdx) => (
                                        <div key={cIdx} className="flex justify-between items-center text-xs text-neutral-500 pl-2 border-l-2 border-neutral-100 mt-1">
                                          <span>{c.tipoResultado} - Pos: {c.posicion}</span>
                                          <span>+{c.puntosObtenidos}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-12 text-neutral-500">
                    Selecciona una carrera para ver el desglose de puntos.
                  </div>
                )}
              </div>
            )}

            {publicTab === 'team' && (
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6">
                <div className="max-w-md mb-8">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Selecciona tu equipo</label>
                  <select 
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">-- Seleccionar Equipo --</option>
                    {formattedTeams.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {selectedTeam ? (() => {
                  const teamPlayer = leaderboard?.find(p => p.nombreEquipo === selectedTeam);
                  const teamWins = Object.values(raceWinners).filter(w => w === selectedTeam).length;
                  
                  const teamCyclistsData = files.elecciones.data?.filter(r => (getVal(r, 'Nombre_Equipo') || getVal(r, 'Nombre_TG')) === selectedTeam) || [];
                  const ages = teamCyclistsData.map(c => parseInt(getVal(c, 'Edad'))).filter(a => !isNaN(a));
                  const avgAge = ages.length > 0 ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : '-';

                  // New KPIs: Puesto and Dif con orden
                  const currentPuesto = leaderboard ? leaderboard.findIndex(p => p.nombreEquipo === selectedTeam) + 1 : 0;
                  const draftOrder = formattedTeams.find(t => t.value === selectedTeam)?.label.match(/\[#(\d+)\]/)?.[1];
                  const draftOrderNum = draftOrder ? parseInt(draftOrder) : 0;
                  const difConOrden = draftOrderNum - currentPuesto;

                  const cyclistStats = teamCyclistsData.map(c => {
                    const ciclista = getVal(c, 'Ciclista');
                    const details = teamPlayer?.detalles.filter(d => d.ciclista === ciclista) || [];
                    
                    const puntos = details.reduce((sum, d) => sum + d.puntosObtenidos, 0);
                    
                    const victorias = details.filter(d => {
                      const isPos01 = d.posicion === '01' || d.posicion === '1';
                      const isValidType = [
                        'Etapa', 
                        'Etapa (Crono equipos)', 
                        'Clasificación final', 
                        'Clasificación final (Crono equipos)'
                      ].includes(d.tipoResultado);
                      return isPos01 && isValidType;
                    }).length;
                    
                    const metadata = cyclistMetadata[ciclista] || { edad: '-', pais: '-', equipoBreve: '-', ronda: '-', carrerasDisputadas: 0, diasCompeticion: 0 };

                    return {
                      ciclista,
                      ronda: metadata.ronda,
                      edad: metadata.edad || getVal(c, 'Edad') || '-',
                      pais: metadata.pais,
                      equipoBreve: metadata.equipoBreve,
                      puntos,
                      victorias,
                      carrerasDisputadas: metadata.carrerasDisputadas,
                      diasCompeticion: metadata.diasCompeticion,
                      puntosPorCarrera: metadata.carrerasDisputadas > 0 ? (puntos / metadata.carrerasDisputadas).toFixed(1) : '0.0',
                      puntosPorDia: metadata.diasCompeticion > 0 ? (puntos / metadata.diasCompeticion).toFixed(1) : '0.0'
                    };
                  }).sort((a, b) => b.puntos - a.puntos);

                  return (
                    <div className="space-y-8">
                      {/* KPIs */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
                          <div className="flex flex-col items-center text-center">
                            <Trophy className="w-5 h-5 text-blue-600 mb-2" />
                            <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">Puntos</p>
                            <p className="text-2xl font-bold text-neutral-900">{teamPlayer?.puntos || 0}</p>
                          </div>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 shadow-sm">
                          <div className="flex flex-col items-center text-center">
                            <Medal className="w-5 h-5 text-yellow-500 mb-2" />
                            <p className="text-[10px] font-medium text-yellow-600 uppercase tracking-wider">Victorias</p>
                            <p className="text-2xl font-bold text-neutral-900">{teamWins}</p>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 shadow-sm">
                          <div className="flex flex-col items-center text-center">
                            <Users className="w-5 h-5 text-green-600 mb-2" />
                            <p className="text-[10px] font-medium text-green-600 uppercase tracking-wider">Edad Media</p>
                            <p className="text-2xl font-bold text-neutral-900">{avgAge}</p>
                          </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 shadow-sm">
                          <div className="flex flex-col items-center text-center">
                            <LayoutGrid className="w-5 h-5 text-purple-600 mb-2" />
                            <p className="text-[10px] font-medium text-purple-600 uppercase tracking-wider">Puesto</p>
                            <p className="text-2xl font-bold text-neutral-900">{currentPuesto}</p>
                          </div>
                        </div>

                        <div className={cn(
                          "border rounded-2xl p-4 shadow-sm",
                          difConOrden > 0 ? "bg-green-50 border-green-100" : 
                          difConOrden === 0 ? "bg-yellow-50 border-yellow-100" : 
                          "bg-red-50 border-red-100"
                        )}>
                          <div className="flex flex-col items-center text-center">
                            <ArrowUpRight className={cn(
                              "w-5 h-5 mb-2",
                              difConOrden > 0 ? "text-green-600" : 
                              difConOrden === 0 ? "text-yellow-600" : 
                              "text-red-600"
                            )} />
                            <p className={cn(
                              "text-[10px] font-medium uppercase tracking-wider",
                              difConOrden > 0 ? "text-green-600" : 
                              difConOrden === 0 ? "text-yellow-600" : 
                              "text-red-600"
                            )}>Dif con orden</p>
                            <p className={cn(
                              "text-2xl font-bold",
                              difConOrden > 0 ? "text-green-700" : 
                              difConOrden === 0 ? "text-yellow-700" : 
                              "text-red-700"
                            )}>
                              {difConOrden > 0 ? `+${difConOrden}` : difConOrden}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cyclists Table */}
                      <div>
                        <h3 className="font-semibold text-xl text-neutral-900 border-b pb-3 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Plantilla del Equipo
                        </h3>
                        <div className="bg-white border border-neutral-200 rounded-xl overflow-x-auto shadow-sm">
                          <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase text-[10px] tracking-wider">
                              <tr>
                                <th className="px-4 py-3 font-semibold">Ciclista</th>
                                <th className="px-3 py-3 text-center font-semibold">Edad</th>
                                <th className="px-3 py-3 text-center font-semibold">País</th>
                                <th className="px-4 py-3 font-semibold">Equipo</th>
                                <th className="px-3 py-3 text-right font-semibold">Puntos</th>
                                <th className="px-3 py-3 text-center font-semibold">Vict.</th>
                                <th className="px-3 py-3 text-center font-semibold">Carr.</th>
                                <th className="px-3 py-3 text-center font-semibold">Días</th>
                                <th className="px-3 py-3 text-right font-semibold">P/C</th>
                                <th className="px-3 py-3 text-right font-semibold">P/D</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {cyclistStats.map((c, idx) => (
                                <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                  <td className="px-4 py-3 font-bold text-neutral-900">
                                    {c.ciclista} <span className="text-neutral-400 font-normal">&lt;{c.ronda}&gt;</span>
                                  </td>
                                  <td className="px-3 py-3 text-center text-neutral-600">{c.edad}</td>
                                  <td className="px-3 py-3 text-center text-neutral-600">{c.pais}</td>
                                  <td className="px-4 py-3 text-neutral-600 text-xs">{c.equipoBreve}</td>
                                  <td className="px-3 py-3 text-right font-bold text-blue-600">{c.puntos}</td>
                                  <td className="px-3 py-3 text-center">
                                    {c.victorias > 0 ? (
                                      <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                        {c.victorias}
                                      </span>
                                    ) : '-'}
                                  </td>
                                  <td className={cn("px-3 py-3 text-center", c.carrerasDisputadas === 0 ? "text-red-600 font-bold bg-red-50" : "text-neutral-600")}>
                                    {c.carrerasDisputadas}
                                  </td>
                                  <td className={cn("px-3 py-3 text-center", c.diasCompeticion === 0 ? "text-red-600 font-bold bg-red-50" : "text-neutral-600")}>
                                    {c.diasCompeticion}
                                  </td>
                                  <td className="px-3 py-3 text-right text-neutral-500 font-mono text-xs">{c.puntosPorCarrera}</td>
                                  <td className="px-3 py-3 text-right text-neutral-500 font-mono text-xs">{c.puntosPorDia}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-12 text-neutral-500">
                    Selecciona un equipo para ver sus estadísticas y plantilla.
                  </div>
                )}
              </div>
            )}

            {publicTab === 'info' && (
              <div className="space-y-8">
                {infoSubTab === 'menu' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
                    <button 
                      onClick={() => setInfoSubTab('puntuaciones')}
                      className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileSpreadsheet className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900">Puntuaciones</h3>
                      <p className="text-neutral-500 text-center text-sm">Consulta los puntos que otorga cada carrera según su categoría y tipo de resultado.</p>
                    </button>
                    
                    <button 
                      onClick={() => setInfoSubTab('carreras')}
                      className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Flag className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900">Carreras</h3>
                      <p className="text-neutral-500 text-center text-sm">Calendario de carreras, estado actual y ganadores de las pruebas ya disputadas.</p>
                    </button>
                  </div>
                )}

                {infoSubTab === 'puntuaciones' && (
                  <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setInfoSubTab('menu')} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                          <ChevronUp className="w-5 h-5 -rotate-90" />
                        </button>
                        <h3 className="font-semibold text-lg text-neutral-900">Detalle de puntos</h3>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="text" 
                          placeholder="Buscar carrera..." 
                          value={pointsRaceSearch}
                          onChange={(e) => setPointsRaceSearch(e.target.value)}
                          className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <select 
                          value={pointsCategoryFilter}
                          onChange={(e) => setPointsCategoryFilter(e.target.value)}
                          className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Todas las categorías</option>
                          {[...new Set(files.puntos.data?.map(r => r.Categoría))].filter(Boolean).map(c => (
                            <option key={c as string} value={c as string}>{c as string}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b border-neutral-100 sticky top-0">
                          <tr>
                            <th className="px-6 py-3">Categoría</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Posición</th>
                            <th className="px-6 py-3 text-right">Puntos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            let filteredPoints = files.puntos.data || [];
                            
                            if (pointsRaceSearch.trim()) {
                              const searchLower = pointsRaceSearch.toLowerCase();
                              const matchedRaces = files.carreras.data?.filter(r => getVal(r, 'Carrera')?.toLowerCase().includes(searchLower)) || [];
                              const matchedCategories = new Set(matchedRaces.map(r => getVal(r, 'Categoría')));
                              filteredPoints = filteredPoints.filter(p => matchedCategories.has(getVal(p, 'Categoría')));
                            } else if (pointsCategoryFilter) {
                              filteredPoints = filteredPoints.filter(p => getVal(p, 'Categoría') === pointsCategoryFilter);
                            }

                            return filteredPoints.map((r, idx) => (
                              <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50">
                                <td className="px-6 py-3 font-medium text-neutral-900">{getVal(r, 'Categoría')}</td>
                                <td className="px-6 py-3 text-neutral-600">{getVal(r, 'Tipo')}</td>
                                <td className="px-6 py-3 text-neutral-600">{getVal(r, 'Posición')}</td>
                                <td className="px-6 py-3 text-right font-bold text-blue-600">{getVal(r, 'Puntos')}</td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {infoSubTab === 'carreras' && (
                  <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setInfoSubTab('menu')} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                          <ChevronUp className="w-5 h-5 -rotate-90" />
                        </button>
                        <h3 className="font-semibold text-lg text-neutral-900">Detalle de carreras</h3>
                      </div>
                      <select 
                        value={racesFilter}
                        onChange={(e) => setRacesFilter(e.target.value as any)}
                        className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="all">Todas las carreras</option>
                        <option value="finished">Ya disputadas</option>
                        <option value="upcoming">Por disputar</option>
                      </select>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b border-neutral-100 sticky top-0">
                          <tr>
                            <th className="px-6 py-3">Carrera</th>
                            <th className="px-6 py-3">Categoría</th>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3 text-right">Ganador</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const now = new Date().getTime();
                            
                            // Calculate winners
                            const raceWinners: Record<string, string> = {};
                            if (leaderboard) {
                              const races = files.carreras.data?.map(r => r.Carrera) || [];
                              races.forEach(race => {
                                if (!race) return;
                                let maxPoints = 0;
                                let winner = '';
                                leaderboard.forEach(player => {
                                  const pts = player.detalles.filter(d => d.carrera === race).reduce((sum, d) => sum + d.puntosObtenidos, 0);
                                  if (pts > maxPoints) {
                                    maxPoints = pts;
                                    winner = player.nombreEquipo;
                                  }
                                });
                                if (winner) raceWinners[race] = winner;
                              });
                            }

                            return files.carreras.data?.filter(r => {
                              const carreraName = getVal(r, 'Carrera')?.trim();
                              const fechaFin = getVal(r, 'Fecha');
                              if (!carreraName || !fechaFin) return false;
                              const parts = fechaFin.split(/[-/]/);
                              if (parts.length !== 3) return true;
                              
                              let date;
                              if (parts[0].length === 4) {
                                 date = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
                              } else {
                                 date = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
                              }
                              
                              const isFinished = date.getTime() < now;
                              
                              if (racesFilter === 'finished' && !isFinished) return false;
                              if (racesFilter === 'upcoming' && isFinished) return false;
                              return true;
                            }).map((r, idx) => {
                              const fechaFin = getVal(r, 'Fecha');
                              const parts = fechaFin?.split(/[-/]/) || [];
                              let date = new Date();
                              if (parts.length === 3) {
                                if (parts[0].length === 4) {
                                   date = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
                                } else {
                                   date = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
                                }
                              }
                              const isFinished = date.getTime() < now;
                              const raceName = getVal(r, 'Carrera');
                              const winner = raceWinners[raceName];

                              return (
                                <tr key={idx} className={cn("border-b border-neutral-50 hover:bg-neutral-50", isFinished ? "bg-neutral-50/50 text-neutral-400" : "")}>
                                  <td className={cn("px-6 py-3 font-medium", isFinished ? "text-neutral-500" : "text-neutral-900")}>{raceName}</td>
                                  <td className="px-6 py-3">
                                    <span className={cn("px-2 py-1 rounded-md text-xs font-semibold", isFinished ? "bg-neutral-200 text-neutral-500" : "bg-neutral-100 text-neutral-600")}>{getVal(r, 'Categoría')}</span>
                                  </td>
                                  <td className="px-6 py-3">{fechaFin}</td>
                                  <td className="px-6 py-3 text-right font-bold text-blue-600">{winner || '-'}</td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
