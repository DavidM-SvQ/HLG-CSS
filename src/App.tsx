import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  UploadCloud, CheckCircle2, AlertCircle, Trophy, Medal, 
  Users, FileSpreadsheet, ChevronDown, ChevronUp, LogIn, LogOut, Globe, Clock, Info, Activity, Flag,
  List, LayoutGrid, ArrowUpRight, Crown, BarChart3, TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList,
  LineChart, Line, Legend
} from 'recharts';
import { cn } from './lib/utils';
import { supabase } from './supabase';

// --- Types ---
type ParsedData = Record<string, any>[];

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

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
  startlist: FileState;
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
    fecha?: string;
  }[];
}

// --- Constants ---
const LINE_COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', 
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1'
];

const FILE_TYPES = [
  { id: 'carreras', name: 'Carreras HLG 2026', icon: Trophy, expectedCols: ['Carrera', 'Categoría', 'Fecha'], global: true },
  { id: 'ciclistas', name: 'Ciclistas 2026', icon: Users, expectedCols: ['Ciclista', 'País', 'Equipo'], global: true },
  { id: 'elecciones', name: 'Elecciones 2026', icon: Users, expectedCols: ['Ciclista', 'Nombre_TG', 'Nombre_Equipo', 'Edad', 'Ronda', 'País'], global: true },
  { id: 'equipos', name: 'Equipos 2026', icon: Users, expectedCols: ['EQUIPO COMPLETO', 'EQUIPO BREVE'], global: true },
  { id: 'puntos', name: 'Puntos HLG 2026', icon: FileSpreadsheet, expectedCols: ['Categoría', 'Tipo', 'Posición', 'Puntos'], global: true },
  { id: 'resultados', name: 'Resultados FirstCycling', icon: Medal, expectedCols: ['Carrera', 'Ciclista', 'Tipo', 'Pos', 'Etapa'], global: true },
  { id: 'startlist', name: 'Startlist 2026', icon: List, expectedCols: ['BIB', 'CORREDOR', 'RANKING', 'PNT', 'EQUIPO', 'MOSTRAR MÁS'], global: true },
] as const;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [publicTab, setPublicTab] = useState<'season' | 'race' | 'startlist' | 'team' | 'draft' | 'info'>('season');
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [evolutionMode, setEvolutionMode] = useState<'acumulado' | 'mensual'>('acumulado');
  const [selectedEvolutionTeams, setSelectedEvolutionTeams] = useState<string[]>([]);
  const [seasonSubTab, setSeasonSubTab] = useState<'puntos' | 'victorias' | 'ciclistas'>('puntos');
  const [winsChartType, setWinsChartType] = useState<'acumulado' | 'mensual'>('acumulado');
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>('all');
  const [historyTeamFilter, setHistoryTeamFilter] = useState<string>('all');
  const [topCyclistsLimit, setTopCyclistsLimit] = useState<number>(25);
  const [cyclistsMonthFilter, setCyclistsMonthFilter] = useState<string>('all');
  const [cyclistsSortColumn, setCyclistsSortColumn] = useState<string>('puntos');
  const [cyclistsSortDirection, setCyclistsSortDirection] = useState<'asc' | 'desc'>('desc');
  
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
    startlist: { file: null, data: null, error: null, loading: true },
  });

  const isAdmin = user?.email === 'davidmv1985@gmail.com';
  const isSupabaseConfigured = !!(import.meta as any).env.VITE_SUPABASE_URL && !!(import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  // Auth listener
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'SUPABASE_SESSION' && event.data?.session) {
        const { access_token, refresh_token } = event.data.session;
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      }
    };
    window.addEventListener('message', handleMessage);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user as any ?? null);
      setIsAuthReady(true);
      if (session && window.opener) {
        window.opener.postMessage({ type: 'SUPABASE_SESSION', session }, '*');
        window.close();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as any ?? null);
      setIsAuthReady(true);
      if (session && window.opener) {
        window.opener.postMessage({ type: 'SUPABASE_SESSION', session }, '*');
        window.close();
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
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

  const fetchGlobalFile = async (id: string) => {
    const { data, error } = await supabase
      .from('global_files')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setFiles(prev => ({
        ...prev,
        [id]: { file: null, data: data.data, error: null, loading: false, updatedAt: data.updated_at }
      }));
    } else {
      setFiles(prev => ({
        ...prev,
        [id]: { ...prev[id as keyof AppState], loading: false }
      }));
    }
  };

  // Automatically calculate points when all files are ready
  useEffect(() => {
    if (allFilesUploaded) {
      calculatePoints();
    }
  }, [files, allFilesUploaded]);

  // Supabase sync for global files
  useEffect(() => {
    if (!isAuthReady || !isSupabaseConfigured) {
      if (!isSupabaseConfigured) {
        // Set loading to false if not configured to avoid permanent "Sincronizando"
        setFiles(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(key => {
            (next[key as keyof AppState] as any).loading = false;
          });
          return next;
        });
      }
      return;
    }

    // Initial fetch
    FILE_TYPES.filter(ft => ft.global).forEach(ft => {
      fetchGlobalFile(ft.id);
    });

    // Real-time subscription
    const channel = supabase
      .channel('global_files_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'global_files' 
      }, (payload) => {
        const id = (payload.new as any)?.id || (payload.old as any)?.id;
        if (id) fetchGlobalFile(id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthReady]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        const popup = window.open(data.url, 'oauth_popup', 'width=600,height=700');
        if (!popup) {
          alert("Por favor, permite las ventanas emergentes (popups) para iniciar sesión.");
          setIsLoggingIn(false);
          return;
        }
        
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            setIsLoggingIn(false);
          }
        }, 1000);
      } else {
        throw new Error("No redirect URL returned from Supabase");
      }
    } catch (error) {
      console.error("Login failed", error);
      alert("Error al iniciar sesión. Revisa la consola (F12) para ver el error técnico.");
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => supabase.auth.signOut();

  const handleFileUpload = (id: keyof AppState, file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const ftConfig = FILE_TYPES.find(f => f.id === id);
        const expectedCols = ftConfig?.expectedCols || [];
        const actualCols = results.meta.fields || [];
        
        const normalize = (s: string) => s.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, '')
          .trim();

        const missingCols = (expectedCols as string[]).filter(expected => 
          !actualCols.some(actual => normalize(actual as string) === normalize(expected as string))
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
              
              const { error } = await supabase
                .from('global_files')
                .upsert({ 
                  id, 
                  data: parsedData,
                  updated_at: new Date().toISOString()
                });

              if (error) throw error;
              
              // State will be updated by real-time subscription or manual fetch
              fetchGlobalFile(id);
            } catch (e: any) {
              console.error("Error saving to Supabase", e);
              setFiles(prev => ({
                ...prev,
                [id]: { file, data: null, error: `Error al guardar: ${e.message}` }
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
    const raceDateByName: Record<string, string> = {};
    carreras.data!.forEach(row => {
      const carrera = getVal(row, 'Carrera')?.trim();
      const categoria = getVal(row, 'Categoría')?.trim();
      const fecha = getVal(row, 'Fecha')?.trim();
      if (carrera && categoria) {
        raceTypeByName[carrera] = categoria;
      }
      if (carrera && fecha) {
        raceDateByName[carrera] = fecha;
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
        puntosObtenidos,
        fecha: raceDateByName[carrera]
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
  const normalize = (s: string) => s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '')
    .trim();
    
  const normalizedKey = normalize(key);
  const actualKey = Object.keys(row).find(k => normalize(k) === normalizedKey);
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
    if (!leaderboard || !files.carreras.data || !files.resultados.data) return {};
    const winners: Record<string, string> = {};
    const races = files.carreras.data.map(r => getVal(r, 'Carrera')).filter(Boolean) as string[];
    
    races.forEach(race => {
      // Check if race has a final classification
      const hasFinalClassification = files.resultados.data?.some(r => 
        getVal(r, 'Carrera') === race && 
        getVal(r, 'Tipo')?.match(/Clasificación final/i)
      );
      
      if (!hasFinalClassification) return;

      let maxPoints = 0;
      let winnerTeam = '';
      leaderboard.forEach(player => {
        if (player.nombreEquipo === 'No draft' || player.nombreEquipo === 'No draft [99]') return;
        const pts = player.detalles.filter(d => d.carrera === race).reduce((sum, d) => sum + d.puntosObtenidos, 0);
        if (pts > maxPoints) {
          maxPoints = pts;
          winnerTeam = player.nombreEquipo;
        }
      });
      if (winnerTeam) winners[race] = winnerTeam;
    });
    return winners;
  }, [leaderboard, files.carreras.data, files.resultados.data]);

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
                  <p className="text-xs font-semibold text-neutral-900 leading-none">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {isAdmin ? 'Administrador' : 'Jugador'}
                  </p>
                </div>
                {user.user_metadata?.avatar_url && (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full border border-neutral-200" referrerPolicy="no-referrer" />
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
                  isLoggingIn ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-50"
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isSupabaseConfigured && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-900 font-bold">Configuración de Supabase pendiente</h3>
              <p className="text-amber-700 text-sm mt-1">
                Para que la sincronización de datos funcione, debes configurar las variables de entorno 
                <code className="mx-1 px-1 bg-amber-100 rounded">VITE_SUPABASE_URL</code> y 
                <code className="mx-1 px-1 bg-amber-100 rounded">VITE_SUPABASE_ANON_KEY</code> en los ajustes del proyecto.
              </p>
              <div className="mt-4 p-4 bg-white/50 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wider">Configuración necesaria en Supabase:</p>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-amber-900 mb-1">1. Base de Datos (SQL Editor):</p>
                    <pre className="text-[10px] font-mono text-amber-900 overflow-x-auto whitespace-pre-wrap bg-white/50 p-2 rounded border border-amber-100">
{`create table global_files (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default now()
);

alter publication supabase_realtime add table global_files;
alter table global_files enable row level security;

create policy "Public read access" on global_files for select using (true);
create policy "Admin write access" on global_files for all using (auth.jwt() ->> 'email' = 'davidmv1985@gmail.com');`}
                    </pre>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-amber-900 mb-1">2. Autenticación (Providers):</p>
                    <ul className="text-[10px] text-amber-800 list-disc pl-4 space-y-2">
                      <li>Ve a <b>Authentication {'>'} Providers</b> y activa <b>Google</b>.</li>
                      <li><b>SOLUCIÓN DEFINITIVA AL ERROR 403:</b>
                        <div className="mt-2 p-3 bg-red-100/50 border border-red-200 rounded-lg">
                          <p className="font-bold text-red-900 mb-1">Sigue estos pasos en Google Cloud Console:</p>
                          <ol className="list-decimal pl-4 space-y-1 text-red-800">
                            <li>Ve a <b>"Pantalla de consentimiento de OAuth"</b>.</li>
                            <li>Busca el botón <b>"PUBLICAR APLICACIÓN"</b> (Publish App) y púlsalo. Esto quita las restricciones de "Usuarios de prueba".</li>
                            <li>Si prefieres no publicar, asegúrate de que tu email <code>davidmv1985@gmail.com</code> aparezca en la lista de <b>"Usuarios de prueba"</b> y que hayas aceptado la invitación si Google envió un correo.</li>
                            <li>En la pestaña <b>"Credenciales"</b>, verifica que el "ID de cliente de OAuth 2.0" tenga la <b>URI de redireccionamiento</b> de Supabase (la que termina en <code>/auth/v1/callback</code>).</li>
                          </ol>
                        </div>
                      </li>
                      <li>En Supabase, ve a <b>Authentication {'>'} URL Configuration</b> y añade esta URL a <b>"Redirect URLs"</b>:
                        <code className="ml-1 px-1 bg-amber-100 rounded break-all">{window.location.origin + window.location.pathname}</code>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                            {state.updatedAt && (
                              <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(state.updatedAt).toLocaleString('es-ES', { 
                                  day: '2-digit', month: '2-digit', year: 'numeric', 
                                  hour: '2-digit', minute: '2-digit' 
                                })}
                              </p>
                            )}
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
              <div className="space-y-8">
                {(() => {
                  const filteredLeaderboard = leaderboard?.filter(p => p.nombreEquipo !== 'No draft') || [];
                  const top3 = filteredLeaderboard.slice(0, 3);
                  
                  // Handle ties for Leader
                  const maxPoints = filteredLeaderboard.length > 0 ? filteredLeaderboard[0].puntos : 0;
                  const leaders = filteredLeaderboard.filter(p => p.puntos === maxPoints);
                  const leaderNames = leaders.map(l => l.nombreEquipo).join(' / ');
                  
                  // Calculate wins per team (excluding No draft)
                  const teamWinsCount: Record<string, number> = {};
                  filteredLeaderboard.forEach(p => {
                    if (p.nombreEquipo !== 'No draft' && p.nombreEquipo !== 'No draft [99]') {
                      teamWinsCount[p.nombreEquipo] = 0;
                    }
                  });
                  Object.values(raceWinners).forEach(teamName => {
                    const name = teamName as string;
                    if (teamWinsCount[name] !== undefined) {
                      teamWinsCount[name]++;
                    }
                  });
                  
                  const maxWins = Math.max(...Object.values(teamWinsCount), 0);
                  const topWinnerTeams = Object.keys(teamWinsCount).filter(name => teamWinsCount[name] === maxWins);
                  const winnerNames = topWinnerTeams.join(' / ');

                  return (
                    <>
                      {/* KPIs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Carreras Terminadas</p>
                            <p className="text-2xl font-bold text-neutral-900">{uniqueRaces.length}</p>
                          </div>
                        </div>

                        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                            <Crown className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Líder Actual</p>
                            <p className="text-xl font-bold text-neutral-900">{leaderNames || '-'}</p>
                            <p className="text-xs text-neutral-500">{maxPoints || 0} puntos</p>
                          </div>
                        </div>

                        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <Medal className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Más Victorias</p>
                            <p className="text-xl font-bold text-neutral-900">{winnerNames || '-'}</p>
                            <p className="text-xs text-neutral-500">{maxWins} victorias</p>
                          </div>
                        </div>
                      </div>

                      {/* Virtual Podium */}
                      {top3.length > 0 && (
                        <div className="flex flex-col items-center justify-end pt-12 pb-8 bg-white border border-neutral-200 rounded-2xl shadow-sm">
                          <h3 className="text-lg font-bold mb-8 text-neutral-800 uppercase tracking-widest">Podio Virtual</h3>
                          <div className="flex items-end gap-2 md:gap-8">
                            {/* 2nd Place */}
                            {top3[1] && (
                              <div className="flex flex-col items-center">
                                <div className="mb-2 text-center">
                                  <p className="text-sm font-bold text-neutral-700 truncate w-24 md:w-32">{top3[1].nombreEquipo}</p>
                                  <p className="text-xs text-neutral-500">{top3[1].puntos} pts</p>
                                </div>
                                <div className="w-24 md:w-32 h-32 bg-slate-300 rounded-t-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                  <span className="text-4xl font-black text-slate-400">2</span>
                                </div>
                              </div>
                            )}

                            {/* 1st Place */}
                            {top3[0] && (
                              <div className="flex flex-col items-center">
                                <Crown className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
                                <div className="mb-2 text-center">
                                  <p className="text-base font-black text-neutral-900 truncate w-28 md:w-40">{top3[0].nombreEquipo}</p>
                                  <p className="text-sm font-bold text-yellow-600">{top3[0].puntos} pts</p>
                                </div>
                                <div className="w-28 md:w-40 h-48 bg-yellow-400 rounded-t-xl flex items-center justify-center shadow-inner relative overflow-hidden border-x-4 border-t-4 border-yellow-300">
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                                  <span className="text-6xl font-black text-yellow-600">1</span>
                                </div>
                              </div>
                            )}

                            {/* 3rd Place */}
                            {top3[2] && (
                              <div className="flex flex-col items-center">
                                <div className="mb-2 text-center">
                                  <p className="text-sm font-bold text-neutral-700 truncate w-24 md:w-32">{top3[2].nombreEquipo}</p>
                                  <p className="text-xs text-neutral-500">{top3[2].puntos} pts</p>
                                </div>
                                <div className="w-24 md:w-32 h-24 bg-orange-400 rounded-t-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                  <span className="text-4xl font-black text-orange-600">3</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Season Sub-Tabs */}
                      <div className="flex justify-center mb-8">
                        <div className="flex bg-neutral-100 p-1.5 rounded-xl shadow-inner">
                          {[
                            { id: 'puntos', label: 'Puntos', icon: BarChart3 },
                            { id: 'victorias', label: 'Victorias', icon: Trophy },
                            { id: 'ciclistas', label: 'Ciclistas', icon: Users },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setSeasonSubTab(tab.id as any)}
                              className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200",
                                seasonSubTab === tab.id 
                                  ? "bg-white text-blue-600 shadow-md transform scale-105" 
                                  : "text-neutral-500 hover:text-neutral-700 hover:bg-white/50"
                              )}
                            >
                              <tab.icon className="w-4 h-4" />
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {seasonSubTab === 'puntos' && (
                        <>
                          {/* General Classification Chart */}
                          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 text-neutral-800 flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-blue-600" />
                              Clasificación General
                            </h3>
                            <div className="h-[500px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                  data={filteredLeaderboard.map((p, idx) => {
                                    const draftOrder = p.orden ? parseInt(p.orden) : 0;
                                    const currentPos = idx + 1;
                                    const diff = draftOrder - currentPos;
                                    return {
                                      ...p,
                                      displayName: `${p.nombreEquipo} [#${p.orden}]`,
                                      victorias: teamWinsCount[p.nombreEquipo] || 0,
                                      diff,
                                      pos: currentPos
                                    };
                                  })}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                  <XAxis 
                                    dataKey="displayName" 
                                    angle={-45} 
                                    textAnchor="end" 
                                    interval={0} 
                                    height={100}
                                    tick={(props) => {
                                      const { x, y, payload } = props;
                                      const item = filteredLeaderboard.find((p, idx) => {
                                        const draftOrder = p.orden ? parseInt(p.orden) : 0;
                                        const currentPos = idx + 1;
                                        const displayName = `${p.nombreEquipo} [#${p.orden}]`;
                                        return displayName === payload.value;
                                      });
                                      
                                      let color = '#64748b'; // default
                                      if (item) {
                                        const idx = filteredLeaderboard.indexOf(item);
                                        const draftOrder = item.orden ? parseInt(item.orden) : 0;
                                        const currentPos = idx + 1;
                                        const diff = draftOrder - currentPos;
                                        if (diff > 0) color = '#16a34a'; // green-600
                                        else if (diff < 0) color = '#dc2626'; // red-600
                                        else color = '#ca8a04'; // yellow-600
                                      }

                                      return (
                                        <g transform={`translate(${x},${y})`}>
                                          <text
                                            x={0}
                                            y={0}
                                            dy={16}
                                            textAnchor="end"
                                            fill={color}
                                            transform="rotate(-45)"
                                            style={{ fontSize: '11px', fontWeight: 600 }}
                                          >
                                            {payload.value}
                                          </text>
                                        </g>
                                      );
                                    }}
                                  />
                                  <YAxis tick={{fontSize: 12}} />
                                  <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                          <div className="bg-white p-4 border border-neutral-200 rounded-xl shadow-xl">
                                            <p className="font-bold text-neutral-900 mb-2">{data.nombreEquipo}</p>
                                            <div className="space-y-1 text-sm">
                                              <div className="flex justify-between gap-8">
                                                <span className="text-neutral-500">Puntos:</span>
                                                <span className="font-bold text-blue-600">{data.puntos}</span>
                                              </div>
                                              <div className="flex justify-between gap-8">
                                                <span className="text-neutral-500">Victorias:</span>
                                                <span className="font-bold text-yellow-600">{data.victorias}</span>
                                              </div>
                                              <div className="flex justify-between gap-8">
                                                <span className="text-neutral-500">Dif con orden:</span>
                                                <span className={cn(
                                                  "font-bold",
                                                  data.diff > 0 ? "text-green-600" : data.diff < 0 ? "text-red-600" : "text-yellow-600"
                                                )}>
                                                  {data.diff > 0 ? `+${data.diff}` : data.diff}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Bar dataKey="puntos" radius={[4, 4, 0, 0]}>
                                    {filteredLeaderboard.map((entry, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#fb923c' : '#3b82f6'} 
                                      />
                                    ))}
                                    <LabelList 
                                      dataKey="puntos" 
                                      position="top" 
                                      style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }} 
                                    />
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Monthly Evolution Chart */}
                          {(() => {
                            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                            const currentMonthIdx = new Date().getMonth(); // 0-indexed
                            
                            const teamColors: Record<string, string> = {};
                            filteredLeaderboard.forEach((team, idx) => {
                              const teamKey = `${team.nombreEquipo} <${team.orden}>`;
                              if (idx === 0) teamColors[teamKey] = '#fbbf24'; // Gold
                              else if (idx === 1) teamColors[teamKey] = '#94a3b8'; // Silver
                              else if (idx === 2) teamColors[teamKey] = '#fb923c'; // Bronze
                              else teamColors[teamKey] = LINE_COLORS[(idx - 3) % LINE_COLORS.length];
                            });

                            const monthlyEvolutionData = (() => {
                              const dataByMonth: any[] = months.map(m => ({ month: m }));
                              
                              filteredLeaderboard.forEach(team => {
                                const teamKey = `${team.nombreEquipo} <${team.orden}>`;
                                
                                // Skip if not selected (if any are selected)
                                if (selectedEvolutionTeams.length > 0 && !selectedEvolutionTeams.includes(teamKey)) {
                                  return;
                                }

                                let accumulated = 0;
                                
                                months.forEach((m, mIdx) => {
                                  const monthPoints = team.detalles.reduce((sum, d) => {
                                    if (!d.fecha) return sum;
                                    const parts = d.fecha.split('/');
                                    if (parts.length < 2) return sum;
                                    const monthIndex = parseInt(parts[1]) - 1;
                                    if (monthIndex === mIdx) return sum + d.puntosObtenidos;
                                    return sum;
                                  }, 0);
                                  
                                  if (evolutionMode === 'acumulado') {
                                    accumulated += monthPoints;
                                    dataByMonth[mIdx][teamKey] = accumulated;
                                  } else {
                                    dataByMonth[mIdx][teamKey] = monthPoints;
                                  }
                                });
                              });
                              
                              // Filter out months with no data AND future months
                              return dataByMonth.filter((m, idx) => {
                                const hasData = Object.keys(m).some(key => key !== 'month' && m[key] > 0);
                                return hasData && idx <= currentMonthIdx;
                              });
                            })();

                            return (
                              <div className="mt-12">
                                <div className="flex items-center justify-between border-b pb-3 mb-6">
                                  <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    Evolución Mensual
                                  </h3>
                                  <div className="flex bg-neutral-100 p-1 rounded-lg">
                                    <button 
                                      onClick={() => setEvolutionMode('acumulado')}
                                      className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                        evolutionMode === 'acumulado' ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                      )}
                                    >
                                      Acumulado
                                    </button>
                                    <button 
                                      onClick={() => setEvolutionMode('mensual')}
                                      className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                        evolutionMode === 'mensual' ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                      )}
                                    >
                                      Mensual
                                    </button>
                                  </div>
                                </div>

                                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                                  {/* Team Selector */}
                                  <div className="mb-6 pb-6 border-b border-neutral-100">
                                    <div className="flex items-center justify-between mb-4">
                                      <p className="text-sm font-bold text-neutral-700">Filtrar Equipos:</p>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => setSelectedEvolutionTeams([])}
                                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                        >
                                          Mostrar Todos
                                        </button>
                                        <button 
                                          onClick={() => setSelectedEvolutionTeams(filteredLeaderboard.map(t => `${t.nombreEquipo} <${t.orden}>`))}
                                          className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                                        >
                                          Seleccionar Todos
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {filteredLeaderboard.map((team, idx) => {
                                        const teamKey = `${team.nombreEquipo} <${team.orden}>`;
                                        const isSelected = selectedEvolutionTeams.length === 0 || selectedEvolutionTeams.includes(teamKey);
                                        const color = teamColors[teamKey];
                                        
                                        return (
                                          <button
                                            key={teamKey}
                                            onClick={() => {
                                              if (selectedEvolutionTeams.length === 0) {
                                                // If none were explicitly selected (all shown), select only this one
                                                setSelectedEvolutionTeams([teamKey]);
                                              } else {
                                                if (selectedEvolutionTeams.includes(teamKey)) {
                                                  const next = selectedEvolutionTeams.filter(t => t !== teamKey);
                                                  setSelectedEvolutionTeams(next);
                                                } else {
                                                  setSelectedEvolutionTeams([...selectedEvolutionTeams, teamKey]);
                                                }
                                              }
                                            }}
                                            className={cn(
                                              "px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2",
                                              isSelected 
                                                ? "bg-white shadow-sm" 
                                                : "bg-neutral-50 text-neutral-400 border-neutral-100 grayscale opacity-50"
                                            )}
                                            style={{ 
                                              borderColor: isSelected ? color : 'transparent',
                                              color: isSelected ? color : undefined
                                            }}
                                          >
                                            <div 
                                              className="w-2 h-2 rounded-full" 
                                              style={{ backgroundColor: color }}
                                            />
                                            {team.nombreEquipo}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="h-[600px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={monthlyEvolutionData} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="month" tick={{fontSize: 12}} />
                                        <YAxis tick={{fontSize: 12}} />
                                        <Tooltip 
                                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                          itemSorter={(item) => -(item.value as number)}
                                        />
                                        <Legend 
                                          verticalAlign="top" 
                                          align="center"
                                          height={80} 
                                          iconType="circle"
                                          wrapperStyle={{ paddingTop: '0px', paddingBottom: '40px', fontSize: '12px' }}
                                        />
                                        {Object.keys(teamColors).map(teamKey => {
                                          // Only render line if selected
                                          if (selectedEvolutionTeams.length > 0 && !selectedEvolutionTeams.includes(teamKey)) {
                                            return null;
                                          }
                                          return (
                                            <Line 
                                              key={teamKey}
                                              type="monotone" 
                                              dataKey={teamKey} 
                                              stroke={teamColors[teamKey]} 
                                              strokeWidth={3}
                                              dot={{ r: 4, strokeWidth: 2 }}
                                              activeDot={{ r: 6, strokeWidth: 0 }}
                                              connectNulls
                                            />
                                          );
                                        })}
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      )}

                      {seasonSubTab === 'victorias' && (
                        <div className="space-y-8">
                          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 text-neutral-800 flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-yellow-500" />
                              Ranking de Victorias por Equipo
                            </h3>
                            <div className="h-[500px] w-full mt-4">
                              {(() => {
                                const chartData = Object.entries(teamWinsCount)
                                  .map(([name, wins]) => {
                                    const teamInfo = filteredLeaderboard.find(p => p.nombreEquipo === name);
                                    const displayName = teamInfo ? `${name} <${teamInfo.orden}>` : name;
                                    return { name: displayName, wins };
                                  })
                                  .sort((a, b) => b.wins - a.wins);
                                const maxChartWins = chartData.length > 0 ? chartData[0].wins : 0;
                                
                                return (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={chartData}
                                      layout="vertical"
                                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                                      <XAxis type="number" allowDecimals={false} />
                                      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} interval={0} />
                                      <Tooltip 
                                        cursor={{fill: '#f5f5f5'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                      />
                                      <Bar dataKey="wins" radius={[0, 4, 4, 0]} barSize={24}>
                                        {chartData.map((entry, index) => (
                                          <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.wins > 0 && entry.wins === maxChartWins ? '#fbbf24' : '#3b82f6'} 
                                          />
                                        ))}
                                        <LabelList dataKey="wins" position="right" fill="#737373" fontSize={12} />
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Monthly Evolution Chart for Wins */}
                          {(() => {
                            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                            const currentMonthIdx = new Date().getMonth(); // 0-indexed
                            
                            const teamColors: Record<string, string> = {};
                            filteredLeaderboard.forEach((team, idx) => {
                              const teamKey = `${team.nombreEquipo} <${team.orden}>`;
                              if (idx === 0) teamColors[teamKey] = '#fbbf24'; // Gold
                              else if (idx === 1) teamColors[teamKey] = '#94a3b8'; // Silver
                              else if (idx === 2) teamColors[teamKey] = '#fb923c'; // Bronze
                              else teamColors[teamKey] = LINE_COLORS[(idx - 3) % LINE_COLORS.length];
                            });

                            const monthlyWinsEvolutionData = (() => {
                              const dataByMonth: any[] = months.map(m => ({ month: m }));
                              
                              // First, map races to months
                              const raceMonths: Record<string, number> = {};
                              files.carreras.data?.forEach(r => {
                                const carreraName = getVal(r, 'Carrera')?.trim();
                                const fechaFin = getVal(r, 'Fecha');
                                if (carreraName && fechaFin) {
                                  const parts = fechaFin.split(/[-/]/);
                                  if (parts.length >= 2) {
                                    const monthIndex = parseInt(parts[1]) - 1;
                                    raceMonths[carreraName] = monthIndex;
                                  }
                                }
                              });
                              
                              filteredLeaderboard.forEach(team => {
                                const teamKey = `${team.nombreEquipo} <${team.orden}>`;
                                
                                // Skip if not selected (if any are selected)
                                if (selectedEvolutionTeams.length > 0 && !selectedEvolutionTeams.includes(teamKey)) {
                                  return;
                                }

                                let accumulated = 0;
                                
                                months.forEach((m, mIdx) => {
                                  // Count wins for this team in this month
                                  let monthWins = 0;
                                  Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
                                    if (winnerTeam === team.nombreEquipo && raceMonths[raceName] === mIdx) {
                                      monthWins++;
                                    }
                                  });
                                  
                                  if (winsChartType === 'acumulado') {
                                    accumulated += monthWins;
                                    dataByMonth[mIdx][teamKey] = accumulated;
                                  } else {
                                    dataByMonth[mIdx][teamKey] = monthWins;
                                  }
                                });
                              });
                              
                              // Filter out months with no data AND future months
                              return dataByMonth.filter((m, idx) => {
                                const hasData = Object.keys(m).some(key => key !== 'month' && m[key] > 0);
                                return hasData && idx <= currentMonthIdx;
                              });
                            })();

                            return (
                              <div className="mt-12">
                                <div className="flex items-center justify-between border-b pb-3 mb-6">
                                  <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    Evolución Mensual de Victorias
                                  </h3>
                                  <div className="flex bg-neutral-100 p-1 rounded-lg">
                                    <button 
                                      onClick={() => setWinsChartType('acumulado')}
                                      className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                        winsChartType === 'acumulado' ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                      )}
                                    >
                                      Acumulado
                                    </button>
                                    <button 
                                      onClick={() => setWinsChartType('mensual')}
                                      className={cn(
                                        "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                        winsChartType === 'mensual' ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                      )}
                                    >
                                      Mensual
                                    </button>
                                  </div>
                                </div>

                                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                                  {/* Team Selector */}
                                  <div className="mb-6 pb-6 border-b border-neutral-100">
                                    <div className="flex items-center justify-between mb-4">
                                      <p className="text-sm font-bold text-neutral-700">Filtrar Equipos:</p>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => setSelectedEvolutionTeams([])}
                                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                                        >
                                          Mostrar Todos
                                        </button>
                                        <button 
                                          onClick={() => setSelectedEvolutionTeams(filteredLeaderboard.map(t => `${t.nombreEquipo} <${t.orden}>`))}
                                          className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                                        >
                                          Seleccionar Todos
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {filteredLeaderboard.map((team, idx) => {
                                        const teamKey = `${team.nombreEquipo} <${team.orden}>`;
                                        const isSelected = selectedEvolutionTeams.length === 0 || selectedEvolutionTeams.includes(teamKey);
                                        const color = teamColors[teamKey];
                                        
                                        return (
                                          <button
                                            key={teamKey}
                                            onClick={() => {
                                              if (selectedEvolutionTeams.includes(teamKey)) {
                                                setSelectedEvolutionTeams(selectedEvolutionTeams.filter(t => t !== teamKey));
                                              } else {
                                                setSelectedEvolutionTeams([...selectedEvolutionTeams, teamKey]);
                                              }
                                            }}
                                            className={cn(
                                              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                                              isSelected 
                                                ? "bg-white shadow-sm" 
                                                : "bg-neutral-50 text-neutral-400 border-transparent hover:bg-neutral-100"
                                            )}
                                            style={{ 
                                              borderColor: isSelected ? color : 'transparent',
                                              color: isSelected ? color : undefined
                                            }}
                                          >
                                            {team.nombreEquipo}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="h-[400px] w-full">
                                    {monthlyWinsEvolutionData.length > 0 ? (
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyWinsEvolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                          <XAxis 
                                            dataKey="month" 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                                            dy={10}
                                          />
                                          <YAxis 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                                            allowDecimals={false}
                                          />
                                          <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                            labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
                                          />
                                          <Legend 
                                            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                                            iconType="circle"
                                          />
                                          {filteredLeaderboard.map((team) => {
                                            const teamKey = `${team.nombreEquipo} <${team.orden}>`;
                                            if (selectedEvolutionTeams.length > 0 && !selectedEvolutionTeams.includes(teamKey)) return null;
                                            
                                            return (
                                              <Line 
                                                key={teamKey}
                                                type="monotone" 
                                                dataKey={teamKey} 
                                                stroke={teamColors[teamKey]} 
                                                strokeWidth={3}
                                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                              />
                                            );
                                          })}
                                        </LineChart>
                                      </ResponsiveContainer>
                                    ) : (
                                      <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
                                        No hay datos de victorias para mostrar en los meses transcurridos.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-12">
                            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <h3 className="font-bold text-neutral-800">Historial de Ganadores por Carrera</h3>
                              <div className="flex gap-2">
                                <select 
                                  value={historyTeamFilter}
                                  onChange={(e) => setHistoryTeamFilter(e.target.value)}
                                  className="text-sm border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                  <option value="all">Todos los equipos</option>
                                  {[...filteredLeaderboard]
                                    .sort((a, b) => a.nombreEquipo.localeCompare(b.nombreEquipo))
                                    .map(t => (
                                    <option key={t.nombreEquipo} value={t.nombreEquipo}>{t.nombreEquipo}</option>
                                  ))}
                                </select>
                                <select 
                                  value={historyMonthFilter}
                                  onChange={(e) => setHistoryMonthFilter(e.target.value)}
                                  className="text-sm border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                  <option value="all">Todos los meses</option>
                                  <option value="0">Enero</option>
                                  <option value="1">Febrero</option>
                                  <option value="2">Marzo</option>
                                  <option value="3">Abril</option>
                                  <option value="4">Mayo</option>
                                  <option value="5">Junio</option>
                                  <option value="6">Julio</option>
                                  <option value="7">Agosto</option>
                                  <option value="8">Septiembre</option>
                                  <option value="9">Octubre</option>
                                  <option value="10">Noviembre</option>
                                  <option value="11">Diciembre</option>
                                </select>
                              </div>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50">
                                  <tr>
                                    <th className="px-6 py-3 font-semibold">Carrera</th>
                                    <th className="px-6 py-3 font-semibold text-right">Equipo Ganador</th>
                                    <th className="px-6 py-3 font-semibold text-right">Puntos</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                  {(() => {
                                    // First, map races to months
                                    const raceMonths: Record<string, number> = {};
                                    files.carreras.data?.forEach(r => {
                                      const carreraName = getVal(r, 'Carrera')?.trim();
                                      const fechaFin = getVal(r, 'Fecha');
                                      if (carreraName && fechaFin) {
                                        const parts = fechaFin.split(/[-/]/);
                                        if (parts.length >= 2) {
                                          const monthIndex = parseInt(parts[1]) - 1;
                                          raceMonths[carreraName] = monthIndex;
                                        }
                                      }
                                    });

                                    const filteredRaces = uniqueRaces.filter(race => {
                                      const monthMatch = historyMonthFilter === 'all' || raceMonths[race] === parseInt(historyMonthFilter);
                                      const teamMatch = historyTeamFilter === 'all' || raceWinners[race] === historyTeamFilter;
                                      return monthMatch && teamMatch;
                                    });

                                    if (filteredRaces.length === 0) {
                                      return (
                                        <tr>
                                          <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                                            No hay carreras que coincidan con los filtros.
                                          </td>
                                        </tr>
                                      );
                                    }

                                    return filteredRaces.map(race => {
                                      const winnerTeamName = raceWinners[race];
                                      let winnerDisplayName = winnerTeamName;
                                      let winnerPoints = 0;
                                      
                                      if (winnerTeamName) {
                                        const teamInfo = filteredLeaderboard.find(p => p.nombreEquipo === winnerTeamName);
                                        if (teamInfo) {
                                          winnerDisplayName = `${winnerTeamName} <${teamInfo.orden}>`;
                                          winnerPoints = teamInfo.detalles
                                            .filter(d => d.carrera === race)
                                            .reduce((sum, d) => sum + d.puntosObtenidos, 0);
                                        }
                                      }

                                      return (
                                        <tr key={race} className="hover:bg-neutral-50 transition-colors">
                                          <td className="px-6 py-4 font-medium text-neutral-900">{race}</td>
                                          <td className="px-6 py-4 text-right">
                                            {winnerTeamName ? (
                                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 font-bold text-xs border border-yellow-100">
                                                <Trophy className="w-3 h-3" />
                                                {winnerDisplayName}
                                              </span>
                                            ) : (
                                              <span className="text-neutral-400 italic">Sin resultados</span>
                                            )}
                                          </td>
                                          <td className="px-6 py-4 text-right font-semibold text-neutral-700">
                                            {winnerTeamName ? winnerPoints : '-'}
                                          </td>
                                        </tr>
                                      );
                                    });
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      {seasonSubTab === 'ciclistas' && (
                        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                          <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-neutral-800">Top Ciclistas por Puntuación</h3>
                              <p className="text-xs text-neutral-500 mt-0.5">Ranking individual de todos los corredores con puntos.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <select 
                                value={cyclistsMonthFilter}
                                onChange={(e) => setCyclistsMonthFilter(e.target.value)}
                                className="text-sm border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                <option value="all">Todos los meses</option>
                                <option value="0">Enero</option>
                                <option value="1">Febrero</option>
                                <option value="2">Marzo</option>
                                <option value="3">Abril</option>
                                <option value="4">Mayo</option>
                                <option value="5">Junio</option>
                                <option value="6">Julio</option>
                                <option value="7">Agosto</option>
                                <option value="8">Septiembre</option>
                                <option value="9">Octubre</option>
                                <option value="10">Noviembre</option>
                                <option value="11">Diciembre</option>
                              </select>
                              <div className="flex bg-neutral-100 p-1 rounded-lg">
                                <button 
                                  onClick={() => setTopCyclistsLimit(25)}
                                  className={cn(
                                    "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                    topCyclistsLimit === 25 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                  )}
                                >
                                  Top 25
                                </button>
                                <button 
                                  onClick={() => setTopCyclistsLimit(50)}
                                  className={cn(
                                    "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                    topCyclistsLimit === 50 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                  )}
                                >
                                  Top 50
                                </button>
                                <button 
                                  onClick={() => setTopCyclistsLimit(100)}
                                  className={cn(
                                    "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                    topCyclistsLimit === 100 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                  )}
                                >
                                  Top 100
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50">
                                <tr>
                                  <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (cyclistsSortColumn === 'pos') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('pos'); setCyclistsSortDirection('asc'); } }}>
                                    <div className="flex items-center gap-1">Pos {cyclistsSortColumn === 'pos' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                  </th>
                                  <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (cyclistsSortColumn === 'nombre') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('nombre'); setCyclistsSortDirection('asc'); } }}>
                                    <div className="flex items-center gap-1">Ciclista {cyclistsSortColumn === 'nombre' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                  </th>
                                  <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (cyclistsSortColumn === 'equipo') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('equipo'); setCyclistsSortDirection('asc'); } }}>
                                    <div className="flex items-center gap-1">Equipo {cyclistsSortColumn === 'equipo' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                  </th>
                                  <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (cyclistsSortColumn === 'pais') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('pais'); setCyclistsSortDirection('asc'); } }}>
                                    <div className="flex items-center gap-1">País {cyclistsSortColumn === 'pais' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                  </th>
                                  <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (cyclistsSortColumn === 'victorias') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('victorias'); setCyclistsSortDirection('desc'); } }}>
                                    <div className="flex items-center justify-center gap-1">Victorias {cyclistsSortColumn === 'victorias' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                  </th>
                                  <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (cyclistsSortColumn === 'carreras') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('carreras'); setCyclistsSortDirection('desc'); } }}>
                                    <div className="flex items-center justify-center gap-1">Carreras {cyclistsSortColumn === 'carreras' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                  </th>
                                  <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" title="Días de competición" onClick={() => { if (cyclistsSortColumn === 'dias') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('dias'); setCyclistsSortDirection('desc'); } }}>
                                    <div className="flex items-center justify-center gap-1">Días {cyclistsSortColumn === 'dias' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                  </th>
                                  <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" title="Puntos por carrera" onClick={() => { if (cyclistsSortColumn === 'ppc') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('ppc'); setCyclistsSortDirection('desc'); } }}>
                                    <div className="flex items-center justify-center gap-1">P/C {cyclistsSortColumn === 'ppc' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                  </th>
                                  <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" title="Puntos por día de competición" onClick={() => { if (cyclistsSortColumn === 'ppd') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('ppd'); setCyclistsSortDirection('desc'); } }}>
                                    <div className="flex items-center justify-center gap-1">P/D {cyclistsSortColumn === 'ppd' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                  </th>
                                  <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (cyclistsSortColumn === 'puntos') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('puntos'); setCyclistsSortDirection('desc'); } }}>
                                    <div className="flex items-center justify-end gap-1">Puntos {cyclistsSortColumn === 'puntos' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-100">
                                {(() => {
                                  const cyclistStats: Record<string, { 
                                    puntos: number, 
                                    jugador: string, 
                                    nombreEquipo: string,
                                    orden: string,
                                    ronda: string,
                                    pais: string,
                                    victorias: number,
                                    carreras: Set<string>,
                                    dias: number
                                  }> = {};

                                  // First, map races to months
                                  const raceMonths: Record<string, number> = {};
                                  files.carreras.data?.forEach(r => {
                                    const carreraName = getVal(r, 'Carrera')?.trim();
                                    const fechaFin = getVal(r, 'Fecha');
                                    if (carreraName && fechaFin) {
                                      const parts = fechaFin.split(/[-/]/);
                                      if (parts.length >= 2) {
                                        const monthIndex = parseInt(parts[1]) - 1;
                                        raceMonths[carreraName] = monthIndex;
                                      }
                                    }
                                  });

                                  leaderboard?.forEach(player => {
                                    player.detalles.forEach(d => {
                                      // Apply month filter
                                      if (cyclistsMonthFilter !== 'all' && raceMonths[d.carrera] !== parseInt(cyclistsMonthFilter)) {
                                        return;
                                      }

                                      if (!cyclistStats[d.ciclista]) {
                                        cyclistStats[d.ciclista] = { 
                                          puntos: 0, 
                                          jugador: player.jugador, 
                                          nombreEquipo: player.nombreEquipo,
                                          orden: player.orden,
                                          ronda: d.ronda,
                                          pais: cyclistMetadata[d.ciclista]?.pais || '',
                                          victorias: 0,
                                          carreras: new Set(),
                                          dias: 0
                                        };
                                      }
                                      
                                      const stats = cyclistStats[d.ciclista];
                                      stats.puntos += d.puntosObtenidos;
                                      stats.carreras.add(d.carrera);
                                      
                                      // Check if this result is a win (1st place)
                                      const isPos01 = d.posicion === '01' || d.posicion === '1';
                                      const isValidType = [
                                        'Etapa', 
                                        'Etapa (Crono equipos)', 
                                        'Clasificación final', 
                                        'Clasificación final (Crono equipos)',
                                        'Clásica'
                                      ].includes(d.tipoResultado);
                                      
                                      if (isPos01 && isValidType) {
                                        stats.victorias += 1;
                                      }
                                      
                                      // Get race days from carreras data
                                      const raceData = files.carreras.data?.find(r => getVal(r, 'Carrera')?.trim() === d.carrera);
                                      if (raceData) {
                                        const diasStr = getVal(raceData, 'Días');
                                        if (diasStr) {
                                          stats.dias += parseInt(diasStr) || 1;
                                        } else {
                                          stats.dias += 1; // Default to 1 day if not specified
                                        }
                                      } else {
                                        stats.dias += 1;
                                      }
                                    });
                                  });

                                  const allStats = Object.entries(cyclistStats)
                                    .sort((a, b) => b[1].puntos - a[1].puntos)
                                    .map(([name, data], index) => {
                                      const numCarreras = data.carreras.size;
                                      const ppc = numCarreras > 0 ? parseFloat((data.puntos / numCarreras).toFixed(1)) : 0;
                                      const ppd = data.dias > 0 ? parseFloat((data.puntos / data.dias).toFixed(1)) : 0;
                                      return { name, data, numCarreras, ppc, ppd, originalPos: index + 1 };
                                    });

                                  // Sort the array
                                  allStats.sort((a, b) => {
                                    let valA: any, valB: any;
                                    switch (cyclistsSortColumn) {
                                      case 'pos': valA = a.originalPos; valB = b.originalPos; break;
                                      case 'nombre': valA = a.name; valB = b.name; break;
                                      case 'equipo': valA = a.data.nombreEquipo; valB = b.data.nombreEquipo; break;
                                      case 'pais': valA = a.data.pais; valB = b.data.pais; break;
                                      case 'victorias': valA = a.data.victorias; valB = b.data.victorias; break;
                                      case 'carreras': valA = a.numCarreras; valB = b.numCarreras; break;
                                      case 'dias': valA = a.data.dias; valB = b.data.dias; break;
                                      case 'ppc': valA = a.ppc; valB = b.ppc; break;
                                      case 'ppd': valA = a.ppd; valB = b.ppd; break;
                                      case 'puntos': default: valA = a.data.puntos; valB = b.data.puntos; break;
                                    }
                                    
                                    if (typeof valA === 'string' && typeof valB === 'string') {
                                      return cyclistsSortDirection === 'asc' 
                                        ? valA.localeCompare(valB) 
                                        : valB.localeCompare(valA);
                                    }
                                    
                                    if (valA < valB) return cyclistsSortDirection === 'asc' ? -1 : 1;
                                    if (valA > valB) return cyclistsSortDirection === 'asc' ? 1 : -1;
                                    return 0;
                                  });

                                  const sortedStats = allStats.slice(0, topCyclistsLimit);

                                  let maxVictorias = 0;
                                  let maxCarreras = 0, minCarreras = Infinity;
                                  let maxDias = 0, minDias = Infinity;
                                  let maxPpc = 0, minPpc = Infinity;
                                  let maxPpd = 0, minPpd = Infinity;
                                  let maxPuntos = 0, minPuntos = Infinity;

                                  if (sortedStats.length > 0) {
                                    maxPuntos = sortedStats[0].data.puntos;
                                    minPuntos = sortedStats[sortedStats.length - 1].data.puntos;
                                    
                                    sortedStats.forEach(s => {
                                      if (s.data.victorias > maxVictorias) maxVictorias = s.data.victorias;
                                      if (s.numCarreras > maxCarreras) maxCarreras = s.numCarreras;
                                      if (s.numCarreras < minCarreras) minCarreras = s.numCarreras;
                                      if (s.data.dias > maxDias) maxDias = s.data.dias;
                                      if (s.data.dias < minDias) minDias = s.data.dias;
                                      if (s.ppc > maxPpc) maxPpc = s.ppc;
                                      if (s.ppc < minPpc) minPpc = s.ppc;
                                      if (s.ppd > maxPpd) maxPpd = s.ppd;
                                      if (s.ppd < minPpd) minPpd = s.ppd;
                                    });
                                  }

                                  const getColorClass = (val: number, max: number, min: number, isZeroRed: boolean = false) => {
                                    if (isZeroRed && val === 0) return "text-red-600 font-bold";
                                    if (val === max && max > 0) return "text-green-600 font-bold";
                                    if (val === min && min < max && !isZeroRed) return "text-yellow-600 font-bold";
                                    return "text-neutral-700";
                                  };

                                  const getPuntosColor = (puntos: number) => {
                                    if (maxPuntos === minPuntos) return 'hsl(120, 70%, 40%)';
                                    const ratio = (puntos - minPuntos) / (maxPuntos - minPuntos);
                                    const hue = 45 + ratio * 75; // 45 (yellow/orange) to 120 (green)
                                    return `hsl(${hue}, 80%, 40%)`;
                                  };

                                  return sortedStats.map((s, idx) => {
                                    const { name, data, numCarreras, ppc, ppd, originalPos } = s;

                                    return (
                                      <tr key={name} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4">
                                          <span className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                            originalPos === 1 ? "bg-yellow-100 text-yellow-700" :
                                            originalPos === 2 ? "bg-neutral-200 text-neutral-600" :
                                            originalPos === 3 ? "bg-orange-100 text-orange-700" :
                                            "bg-neutral-100 text-neutral-500"
                                          )}>
                                            {originalPos}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-neutral-900 whitespace-nowrap">
                                          {name} <span className="text-neutral-400 font-normal text-xs">&lt;{data.ronda || '-'}&gt;</span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600 whitespace-nowrap">
                                          {data.nombreEquipo === 'No draft' ? (
                                            <span className="text-neutral-400 italic text-xs">No elegido</span>
                                          ) : (
                                            <span className="font-medium">{data.nombreEquipo} <span className="text-neutral-400 font-normal text-xs">[#{data.orden}]</span></span>
                                          )}
                                        </td>
                                        <td className="px-6 py-4 text-lg">{data.pais}</td>
                                        <td className={cn("px-6 py-4 text-center", getColorClass(data.victorias, maxVictorias, 0, true))}>{data.victorias}</td>
                                        <td className={cn("px-6 py-4 text-center", getColorClass(numCarreras, maxCarreras, minCarreras))}>{numCarreras}</td>
                                        <td className={cn("px-6 py-4 text-center", getColorClass(data.dias, maxDias, minDias))}>{data.dias}</td>
                                        <td className={cn("px-6 py-4 text-center", getColorClass(ppc, maxPpc, minPpc))}>{ppc.toFixed(1)}</td>
                                        <td className={cn("px-6 py-4 text-center", getColorClass(ppd, maxPpd, minPpd))}>{ppd.toFixed(1)}</td>
                                        <td className="px-6 py-4 text-right font-black" style={{ color: getPuntosColor(data.puntos) }}>
                                          {data.puntos}
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
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

                  const maxUniqueCyclists = Math.max(...raceTeams.map(t => t.uniqueCyclists), 0);

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
                      
                      const isVictory = (d.posicion === '1' || d.posicion === '01') && 
                                       d.tipoResultado !== 'Montaña final' && 
                                       d.tipoResultado !== 'Regularidad final';
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
                              {raceTeams.filter(t => t.nombreEquipo !== 'No draft' && t.nombreEquipo !== 'No draft [99]').map((team, idx) => (
                                <tr key={team.jugador} className="hover:bg-neutral-50 transition-colors">
                                  <td className="px-4 py-3 text-center font-medium text-lg">
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-sm text-neutral-400">{idx + 1}</span>}
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-neutral-900">
                                    {team.nombreEquipo} <span className="text-neutral-400 font-normal">[{team.orden}]</span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-neutral-600">
                                    {team.nombreEquipo === 'No draft' ? '-' : (
                                      <span className={cn(
                                        "px-2 py-1 rounded-md text-xs font-bold",
                                        team.uniqueCyclists === 0 ? "bg-red-100 text-red-600" : 
                                        team.uniqueCyclists === maxUniqueCyclists && maxUniqueCyclists > 0 ? "bg-yellow-100 text-yellow-700" : 
                                        "bg-neutral-100 text-neutral-600"
                                      )}>
                                        {team.uniqueCyclists}
                                      </span>
                                    )}
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
                            
                            const sortedCyclists = Array.from(cyclistMap.entries())
                              .filter(([_, data]) => team.jugador !== 'No draft' || data.total > 0)
                              .sort((a, b) => b[1].total - a[1].total);

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
                                      {data.concepts.filter(c => c.puntosObtenidos > 0 || data.total === 0).map((c, cIdx) => (
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
                                <th className="px-3 py-3 text-right font-semibold" title="Puntos por carrera disputada">P/C</th>
                                <th className="px-3 py-3 text-right font-semibold" title="Puntos por día de competición">P/D</th>
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

            {publicTab === 'startlist' && (
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Startlist Carrera</h2>
                    <p className="text-sm text-neutral-500 mt-1">Lista de corredores inscritos para la próxima competición.</p>
                  </div>
                  <List className="w-6 h-6 text-blue-600" />
                </div>

                {!files.startlist.data ? (
                  <div className="text-center py-20 text-neutral-500 italic">
                    No hay startlist cargada actualmente.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase text-[10px] tracking-wider font-bold">
                        <tr>
                          <th className="px-4 py-3 w-16 text-center">BIB</th>
                          <th className="px-4 py-3">Corredor</th>
                          <th className="px-4 py-3 text-center">Ranking</th>
                          <th className="px-4 py-3 text-center">PNT</th>
                          <th className="px-4 py-3">Equipo</th>
                          <th className="px-4 py-3">Información</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {files.startlist.data.map((row, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-4 py-3 text-center font-mono text-neutral-400">{getVal(row, 'BIB')}</td>
                            <td className="px-4 py-3 font-bold text-neutral-900">{getVal(row, 'CORREDOR')}</td>
                            <td className="px-4 py-3 text-center text-neutral-600">{getVal(row, 'RANKING')}</td>
                            <td className="px-4 py-3 text-center font-semibold text-blue-600">{getVal(row, 'PNT')}</td>
                            <td className="px-4 py-3 text-neutral-600 text-xs">{getVal(row, 'EQUIPO')}</td>
                            <td className="px-4 py-3 text-neutral-500 text-xs italic">{getVal(row, 'MOSTRAR MÁS')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {publicTab === 'draft' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Resumen del Draft 2026</h2>
                    <p className="text-sm text-neutral-500 mt-1">Distribución de ciclistas por equipo tras las elecciones.</p>
                  </div>
                  <LayoutGrid className="w-6 h-6 text-blue-600" />
                </div>

                {!files.elecciones.data ? (
                  <div className="text-center py-20 text-neutral-500 italic">
                    No hay datos del draft cargados.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(() => {
                      const teams: Record<string, any[]> = {};
                      files.elecciones.data.forEach(row => {
                        const teamName = getVal(row, 'Nombre_Equipo') || getVal(row, 'Nombre_TG');
                        if (teamName) {
                          if (!teams[teamName]) teams[teamName] = [];
                          teams[teamName].push(row);
                        }
                      });

                      return Object.entries(teams)
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([teamName, cyclists]) => (
                          <div key={teamName} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:border-blue-200 transition-all">
                            <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 flex justify-between items-center">
                              <h3 className="font-bold text-neutral-900 truncate">{teamName}</h3>
                              <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                                {cyclists.length} CICLISTAS
                              </span>
                            </div>
                            <div className="p-4 space-y-2">
                              {cyclists
                                .sort((a, b) => {
                                  const rA = parseInt(getVal(a, 'Ronda')) || 0;
                                  const rB = parseInt(getVal(b, 'Ronda')) || 0;
                                  return rA - rB;
                                })
                                .map((c, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-neutral-400 w-4">
                                        {getVal(c, 'Ronda') || '-'}
                                      </span>
                                      <span className="font-medium text-neutral-800">{getVal(c, 'Ciclista')}</span>
                                    </div>
                                    <span className="text-lg" title={getVal(c, 'País')}>
                                      {getFlagEmoji(getVal(c, 'País'))}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ));
                    })()}
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
                                
                                // Check if race has a final classification
                                const hasFinalClassification = files.resultados.data?.some(r => 
                                  getVal(r, 'Carrera') === race && 
                                  getVal(r, 'Tipo')?.match(/Clasificación final/i)
                                );
                                
                                if (!hasFinalClassification) return;

                                let maxPoints = 0;
                                let winner = '';
                                leaderboard.forEach(player => {
                                  if (player.nombreEquipo === 'No draft' || player.nombreEquipo === 'No draft [99]') return;
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
