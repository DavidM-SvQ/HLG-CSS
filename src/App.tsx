import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { domToBlob, domToDataUrl } from 'modern-screenshot';
import { 
  UploadCloud, CheckCircle2, AlertCircle, Trophy, Medal, 
  Users, FileSpreadsheet, ChevronDown, ChevronUp, LogIn, LogOut, Globe, Clock, Info, Activity, Flag, ClipboardList,
  List, LayoutGrid, ArrowUpRight, Crown, BarChart3, TrendingUp, History, User, UserMinus, Copy, Maximize2, X, Search, Save, Trash2, FileText
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
  { id: 'startlist', name: 'Startlist 2026', icon: List, expectedCols: ['BIB', 'CORREDOR', 'RANKING', 'PNT', 'EQUIPO', 'MOSTRAR MÁS'], global: true, hiddenInAdmin: true },
] as const;

// --- Helpers ---
const formatNumberSpanish = (val: number | string | undefined | null) => {
  if (val === undefined || val === null) return '';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return val.toString();
  return new Intl.NumberFormat('es-ES').format(num);
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [adminTab, setAdminTab] = useState<'datos' | 'gestion-startlists' | 'reporte-carrera' | 'reporte-mes' | 'reporte-temporada'>('datos');
  const [publicTab, setPublicTab] = useState<'season' | 'race' | 'startlist' | 'team' | 'draft' | 'info'>('season');
  const [draftSubTab, setDraftSubTab] = useState<'elecciones' | 'datos'>('elecciones');
  const [draftSearchTerm, setDraftSearchTerm] = useState('');
  const [draftRoundFilter, setDraftRoundFilter] = useState<string[]>([]);
  const [draftTeamFilter, setDraftTeamFilter] = useState<string[]>([]);
  const [isDraftRoundFilterOpen, setIsDraftRoundFilterOpen] = useState(false);
  const [isDraftTeamFilterOpen, setIsDraftTeamFilterOpen] = useState(false);
  const [draftSortColumn, setDraftSortColumn] = useState<string>('Elección');
  const [draftSortDirection, setDraftSortDirection] = useState<'asc' | 'desc'>('asc');
  const [draftDatosSortColumn, setDraftDatosSortColumn] = useState<string>('Orden');
  const [draftDatosSortDirection, setDraftDatosSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [publicStartlistRace, setPublicStartlistRace] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [evolutionMode, setEvolutionMode] = useState<'acumulado' | 'mensual'>('acumulado');
  const [selectedEvolutionTeams, setSelectedEvolutionTeams] = useState<string[]>([]);
  const [seasonSubTab, setSeasonSubTab] = useState<'puntos' | 'victorias' | 'ciclistas'>('puntos');
  const [cyclistsSubTab, setCyclistsSubTab] = useState<'draft' | 'no-draft'>('draft');
  const [winsChartType, setWinsChartType] = useState<'acumulado' | 'mensual'>('acumulado');
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>('all');
  const [historyTeamFilter, setHistoryTeamFilter] = useState<string>('all');
  const [historySortColumn, setHistorySortColumn] = useState<string>('fecha');
  const [historySortDirection, setHistorySortDirection] = useState<'asc' | 'desc'>('desc');
  const [topCyclistsLimit, setTopCyclistsLimit] = useState<number>(25);
  const [cyclistsMonthFilter, setCyclistsMonthFilter] = useState<string>('all');
  const [cyclistsRoundFilter, setCyclistsRoundFilter] = useState<string[]>([]);
  const [cyclistsCategoryFilter, setCyclistsCategoryFilter] = useState<string[]>([]);
  const [cyclistsTeamFilter, setCyclistsTeamFilter] = useState<string[]>([]);
  const [isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen] = useState(false);
  const [isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen] = useState(false);
  const [isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen] = useState(false);
  const [cyclistsSortColumn, setCyclistsSortColumn] = useState<string>('puntos');
  const [cyclistsSortDirection, setCyclistsSortDirection] = useState<'asc' | 'desc'>('desc');
  const [unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter] = useState<string>('all');
  const [unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter] = useState<string[]>([]);
  const [isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen] = useState(false);
  const [unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn] = useState<string>('ronda');
  const [unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection] = useState<'asc' | 'desc'>('asc');
  const [teamsSortColumn, setTeamsSortColumn] = useState<string>('puntos');
  const [teamsSortDirection, setTeamsSortDirection] = useState<'asc' | 'desc'>('desc');
  const [teamsMonthFilter, setTeamsMonthFilter] = useState<string>('all');
  const [undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn] = useState<string>('ronda');
  const [undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection] = useState<'asc' | 'desc'>('asc');
  const [undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter] = useState<string>('all');
  const [undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter] = useState<string[]>([]);
  const [isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen] = useState(false);
  
  const [noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter] = useState<string>('all');
  const [noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit] = useState<number>(25);
  const [noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn] = useState<string>('puntos');
  const [noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection] = useState<'asc' | 'desc'>('desc');
  const [noDraftUnscoredCyclistsSortColumn, setNoDraftUnscoredCyclistsSortColumn] = useState<string>('ciclista');
  const [noDraftUnscoredCyclistsSortDirection, setNoDraftUnscoredCyclistsSortDirection] = useState<'asc' | 'desc'>('asc');
  const [noDraftUndebutedCyclistsSortColumn, setNoDraftUndebutedCyclistsSortColumn] = useState<string>('ciclista');
  const [noDraftUndebutedCyclistsSortDirection, setNoDraftUndebutedCyclistsSortDirection] = useState<'asc' | 'desc'>('asc');

  const [startlistSortColumn, setStartlistSortColumn] = useState<string>('jugador');
  const [startlistSortDirection, setStartlistSortDirection] = useState<'asc' | 'desc'>('asc');
  const [startlistPlayerFilter, setStartlistPlayerFilter] = useState<string>('all');
  const startlistTableRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const topTeamsTableRef = useRef<HTMLDivElement>(null);
  const evolutionChartRef = useRef<HTMLDivElement>(null);
  const winsRankingRef = useRef<HTMLDivElement>(null);
  const winsEvolutionRef = useRef<HTMLDivElement>(null);
  const winsHistoryRef = useRef<HTMLDivElement>(null);
  const raceClassificationTableRef = useRef<HTMLDivElement>(null);
  const cyclistsTableRef = useRef<HTMLDivElement>(null);
  const stageTableRef = useRef<HTMLDivElement>(null);
  const pointsTableRef = useRef<HTMLDivElement>(null);
  const racesTableRef = useRef<HTMLDivElement>(null);
  const teamGlobalRef = useRef<HTMLDivElement>(null);
  const raceBreakdownTableRef = useRef<HTMLDivElement>(null);
  const detailedBreakdownRef = useRef<HTMLDivElement>(null);
  const draftTableRef = useRef<HTMLDivElement>(null);
  const draftDatosTableRef = useRef<HTMLDivElement>(null);
  const topCyclistsDraftRef = useRef<HTMLDivElement>(null);
  
  const [isCopying, setIsCopying] = useState(false);
  const [isTopTeamsTableCopying, setIsTopTeamsTableCopying] = useState(false);
  const [isEvolutionChartCopying, setIsEvolutionChartCopying] = useState(false);
  const [isWinsRankingCopying, setIsWinsRankingCopying] = useState(false);
  const [isWinsEvolutionCopying, setIsWinsEvolutionCopying] = useState(false);
  const [isWinsHistoryCopying, setIsWinsHistoryCopying] = useState<'full' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10' | null>(null);
  const [isWinsHistoryTextCopying, setIsWinsHistoryTextCopying] = useState(false);
  const [isRaceClassificationCopying, setIsRaceClassificationCopying] = useState(false);
  const [isCyclistsCopying, setIsCyclistsCopying] = useState(false);
  const [isStageCopying, setIsStageCopying] = useState(false);
  const [isPointsTextCopying, setIsPointsTextCopying] = useState(false);
  const [isPointsImageCopying, setIsPointsImageCopying] = useState(false);
  const [isRacesTextCopying, setIsRacesTextCopying] = useState(false);
  const [isRacesImageCopying, setIsRacesImageCopying] = useState(false);
  const [isTeamGlobalCopying, setIsTeamGlobalCopying] = useState(false);
  const [isRaceBreakdownCopying, setIsRaceBreakdownCopying] = useState(false);
  const [isDetailedBreakdownCopying, setIsDetailedBreakdownCopying] = useState<'full' | 'first' | 'second' | 'third' | null>(null);
  const [isDetailedBreakdownTextCopying, setIsDetailedBreakdownTextCopying] = useState(false);
  const [isDraftTableCopying, setIsDraftTableCopying] = useState<string | null>(null);
  const [isDraftDatosTableCopying, setIsDraftDatosTableCopying] = useState(false);
  const [isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying] = useState<'full' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10' | null>(null);
  const [isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying] = useState(false);
  
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isTopTeamsTableExpanded, setIsTopTeamsTableExpanded] = useState(false);
  const [isEvolutionChartExpanded, setIsEvolutionChartExpanded] = useState(false);
  const [isWinsRankingExpanded, setIsWinsRankingExpanded] = useState(false);
  const [isWinsEvolutionExpanded, setIsWinsEvolutionExpanded] = useState(false);
  const [isWinsHistoryExpanded, setIsWinsHistoryExpanded] = useState(false);
  const [isRaceClassificationExpanded, setIsRaceClassificationExpanded] = useState(false);
  const [isCyclistsExpanded, setIsCyclistsExpanded] = useState(false);
  const [isStageExpanded, setIsStageExpanded] = useState(false);
  const [isDetailedBreakdownExpanded, setIsDetailedBreakdownExpanded] = useState(false);
  const [isDraftTableExpanded, setIsDraftTableExpanded] = useState(false);
  const [isDraftDatosTableExpanded, setIsDraftDatosTableExpanded] = useState(false);
  const [isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded] = useState(false);
  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  const [isRacesExpanded, setIsRacesExpanded] = useState(false);

  const [teamCyclistsSortColumn, setTeamCyclistsSortColumn] = useState<string>('puntos');
  const [teamCyclistsSortDirection, setTeamCyclistsSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Info tab states
  const [infoSubTab, setInfoSubTab] = useState<'menu' | 'puntuaciones' | 'carreras'>('menu');
  const [pointsCategoryFilter, setPointsCategoryFilter] = useState<string>('');
  const [pointsRaceSearch, setPointsRaceSearch] = useState<string>('');
  const [racesFilter, setRacesFilter] = useState<'all' | 'finished' | 'upcoming'>('all');
  const [racesCategoryFilter, setRacesCategoryFilter] = useState<string>('');
  const [racesMonthFilter, setRacesMonthFilter] = useState<string>('');
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
  const [startlistText, setStartlistText] = useState("");
  const [startlistRace, setStartlistRace] = useState("");
  const [parsedStartlist, setParsedStartlist] = useState<{carrera: string, resultados: {jugador: string, ciclistas: string[]}[]} | null>(null);
  const [isSavingStartlist, setIsSavingStartlist] = useState(false);
  
  const [cyclistMetadata, setCyclistMetadata] = useState<Record<string, { 
    edad: string, 
    pais: string, 
    equipoBreve: string, 
    ronda: string,
    carrerasDisputadas: number,
    diasCompeticion: number,
    puntosTotales?: number,
    puntosPorCarrera?: Record<string, number>
  }>>({});
  const [playerOrderMap, setPlayerOrderMap] = useState<Record<string, string>>({});
  const [playerByCyclist, setPlayerByCyclist] = useState<Record<string, string>>({});
  const [playerTeamMap, setPlayerTeamMap] = useState<Record<string, string>>({});
  const [cyclistRoundMap, setCyclistRoundMap] = useState<Record<string, string>>({});

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

  const expandNodeForCapture = (element: HTMLElement) => {
    const scrollables = Array.from(element.querySelectorAll<HTMLElement>('[class*="max-h-"]'));
    if (element.className && typeof element.className === 'string' && element.className.includes('max-h-')) {
      scrollables.push(element);
    }
    
    const overflowNodes = Array.from(element.querySelectorAll<HTMLElement>('.overflow-y-auto, .overflow-y-scroll, .overflow-x-auto, .overflow-x-scroll, .overflow-hidden'));
    if (element.classList && (element.classList.contains('overflow-y-auto') || element.classList.contains('overflow-y-scroll') || element.classList.contains('overflow-x-auto') || element.classList.contains('overflow-x-scroll') || element.classList.contains('overflow-hidden'))) {
      overflowNodes.push(element);
    }

    const targets = new Set([...scrollables, ...overflowNodes]);

    const originalStyles: { node: HTMLElement; maxHeight: string; overflowY: string; overflowX: string; overflow: string }[] = [];
    
    targets.forEach(node => {
      originalStyles.push({
        node,
        maxHeight: node.style.maxHeight,
        height: node.style.height,
        overflowY: node.style.overflowY,
        overflowX: node.style.overflowX,
        overflow: node.style.overflow
      } as any);
      node.style.setProperty('max-height', 'none', 'important');
      node.style.setProperty('height', 'auto', 'important');
      node.style.setProperty('overflow-y', 'visible', 'important');
      node.style.setProperty('overflow-x', 'visible', 'important');
      node.style.setProperty('overflow', 'visible', 'important');
    });

    const originalElementStyle = {
      display: element.style.display,
      width: element.style.width,
      height: element.style.height,
      maxHeight: element.style.maxHeight,
      minWidth: element.style.minWidth,
      background: element.style.background
    };
    
    element.style.setProperty('display', 'inline-block', 'important');
    element.style.setProperty('width', 'auto', 'important');
    element.style.setProperty('height', 'auto', 'important');
    element.style.setProperty('max-height', 'none', 'important');
    element.style.setProperty('min-width', '100%', 'important');
    if (!element.style.background && !element.style.backgroundColor) {
      element.style.setProperty('background', '#ffffff', 'important');
    }

    return () => {
      originalStyles.forEach(({ node, maxHeight, height, overflowY, overflowX, overflow }: any) => {
        node.style.maxHeight = maxHeight;
        node.style.height = height;
        node.style.overflowY = overflowY;
        node.style.overflowX = overflowX;
        node.style.overflow = overflow;
      });
      
      element.style.display = originalElementStyle.display;
      element.style.width = originalElementStyle.width;
      element.style.height = originalElementStyle.height;
      element.style.maxHeight = originalElementStyle.maxHeight;
      element.style.minWidth = originalElementStyle.minWidth;
      element.style.background = originalElementStyle.background;
    };
  };

  const handleCopyChart = async () => {
    if (!chartRef.current || isCopying) return;
    
    setIsCopying(true);
    try {
      // Check if ClipboardItem is supported
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            // Use domToDataUrl first as it seems more reliable for Recharts labels
            const dataUrl = await domToDataUrl(chartRef.current!, {
              scale: 2,
              filter: (node) => {
                if (node instanceof Element) {
                  return !node.classList.contains('copy-button-ignore');
                }
                return true;
              }
            });
            
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            return blob;
          })() as Promise<Blob>
        });

        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsCopying(false);
      // Fallback: Download
      handleDownloadChart();
      /* Alert suppressed to improve user experience in iframe */
    }
  };

  const handleDownloadChart = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await domToDataUrl(chartRef.current, {
        scale: 2,
        filter: (node) => {
          if (node instanceof Element) {
            return !node.classList.contains('copy-button-ignore');
          }
          return true;
        }
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'clasificacion-general.png';
      link.click();
    } catch (err) {
      console.error('Error downloading chart:', err);
    }
  };

  const handleCopyTopTeamsTable = async () => {
    if (!topTeamsTableRef.current || isTopTeamsTableCopying) return;
    
    setIsTopTeamsTableCopying(true);
    let restore = () => {};
    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            restore = expandNodeForCapture(topTeamsTableRef.current!);
            try {
              const dataUrl = await domToDataUrl(topTeamsTableRef.current!, {
                scale: 3,
                backgroundColor: '#ffffff',
                style: { overflow: 'visible' },
                filter: (node) => {
                  if (node instanceof Element) {
                    return !node.classList.contains('copy-button-ignore');
                  }
                  return true;
                }
              });
              const response = await fetch(dataUrl);
              const blob = await response.blob();
              return blob;
            } finally {
              restore();
            }
          })() as Promise<Blob>
        });

        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsTopTeamsTableCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsTopTeamsTableCopying(false);
      handleDownloadTopTeamsTable();
      /* Alert suppressed to improve user experience in iframe */
    }
  };

  const handleDownloadTopTeamsTable = async () => {
    if (!topTeamsTableRef.current) return;
    const restore = expandNodeForCapture(topTeamsTableRef.current);
    try {
      const dataUrl = await domToDataUrl(topTeamsTableRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        style: { overflow: 'visible' },
        filter: (node) => {
          if (node instanceof Element) {
            return !node.classList.contains('copy-button-ignore');
          }
          return true;
        }
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'top-equipos-puntuacion.png';
      link.click();
    } catch (err) {
      console.error('Error downloading table:', err);
    } finally {
      restore();
    }
  };

  const handleCopyEvolutionChart = async () => {
    if (!evolutionChartRef.current || isEvolutionChartCopying) return;
    
    setIsEvolutionChartCopying(true);
    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(evolutionChartRef.current!, {
              scale: 2,
              filter: (node) => {
                if (node instanceof Element) {
                  return !node.classList.contains('copy-button-ignore');
                }
                return true;
              }
            });
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            return blob;
          })() as Promise<Blob>
        });

        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsEvolutionChartCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsEvolutionChartCopying(false);
      handleDownloadEvolutionChart();
      /* Alert suppressed to improve user experience in iframe */
    }
  };

  const handleDownloadEvolutionChart = async () => {
    if (!evolutionChartRef.current) return;
    try {
      const dataUrl = await domToDataUrl(evolutionChartRef.current, {
        scale: 2,
        filter: (node) => {
          if (node instanceof Element) {
            return !node.classList.contains('copy-button-ignore');
          }
          return true;
        }
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'evolucion-mensual.png';
      link.click();
    } catch (err) {
      console.error('Error downloading chart:', err);
    }
  };

  const handleCopyWinsRanking = async () => {
    if (!winsRankingRef.current || isWinsRankingCopying) return;
    setIsWinsRankingCopying(true);
    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(winsRankingRef.current!, {
              scale: 2,
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsWinsRankingCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsWinsRankingCopying(false);
      handleDownloadWinsRanking();
      /* Alert suppressed to improve user experience in iframe */
    }
  };

  const handleDownloadWinsRanking = async () => {
    if (!winsRankingRef.current) return;
    try {
      const dataUrl = await domToDataUrl(winsRankingRef.current, {
        scale: 2,
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'ranking-victorias.png';
      link.click();
    } catch (err) {
      console.error('Error downloading chart:', err);
    }
  };

  const handleCopyWinsEvolution = async () => {
    if (!winsEvolutionRef.current || isWinsEvolutionCopying) return;
    setIsWinsEvolutionCopying(true);
    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(winsEvolutionRef.current!, {
              scale: 2,
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsWinsEvolutionCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsWinsEvolutionCopying(false);
      handleDownloadWinsEvolution();
      /* Alert suppressed to improve user experience in iframe */
    }
  };

  const handleDownloadWinsEvolution = async () => {
    if (!winsEvolutionRef.current) return;
    try {
      const dataUrl = await domToDataUrl(winsEvolutionRef.current, {
        scale: 2,
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'evolucion-victorias.png';
      link.click();
    } catch (err) {
      console.error('Error downloading chart:', err);
    }
  };

  const handleCopyWinsHistoryText = async () => {
    if (!winsHistoryRef.current || isWinsHistoryTextCopying) return;
    setIsWinsHistoryTextCopying(true);
    
    // Extracción de datos de la UI
    const table = winsHistoryRef.current.querySelector('table');
    if (!table) {
      setIsWinsHistoryTextCopying(false);
      return;
    }

    const rows = Array.from(table.rows);
    const text = rows.map((row: any) => 
      Array.from(row.cells).map((cell: any) => cell.innerText.trim()).join('\t')
    ).join('\n');
    
    navigator.clipboard.writeText(text);
    setTimeout(() => setIsWinsHistoryTextCopying(false), 2000);
  };

  const handleCopyWinsHistory = async (subset?: 'full' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10') => {
    if (!winsHistoryRef.current || isWinsHistoryCopying) return;
    setIsWinsHistoryCopying(subset || 'full');
    
    const tableContainer = winsHistoryRef.current;
    const rows = tableContainer.querySelectorAll('.wins-history-row');
    const restore = expandNodeForCapture(tableContainer);

    try {
      if (subset && subset !== 'full') {
        const start = (['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'].indexOf(subset)) * 50;
        const end = start + 50;

      }

      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(tableContainer, {
              scale: 3,
              backgroundColor: '#ffffff',
              style: { overflow: 'visible' },
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        
        try {
          window.focus();
          await navigator.clipboard.write([clipboardItem]);
        } catch (copyErr) {
          /* console.error suppressed */
          throw copyErr;
        }
        setTimeout(() => setIsWinsHistoryCopying(null), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsWinsHistoryCopying(null);
      handleDownloadWinsHistory(subset);
      /* Alert suppressed to improve user experience in iframe */
    } finally {
      restore();
    }
  };

  const handleDownloadWinsHistory = async (subset?: 'full' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10') => {
    if (!winsHistoryRef.current) return;
    
    const tableContainer = winsHistoryRef.current;
    const rows = tableContainer.querySelectorAll('.wins-history-row');
    const restore = expandNodeForCapture(tableContainer);

    try {
      if (subset && subset !== 'full') {
        const start = (['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'].indexOf(subset)) * 50;
        const end = start + 50;

      }

      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3,
        backgroundColor: '#ffffff',
        style: { overflow: 'visible' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      const suffix = (subset && subset !== 'full') ? `-${subset}` : '';
      link.download = `historial-ganadores${suffix}.png`;
      link.click();
    } catch (err) {
      console.error('Error downloading table:', err);
    } finally {
      restore();
    }
  };

  const handleCopyRaceClassification = async () => {
    if (!raceClassificationTableRef.current || isRaceClassificationCopying) return;
    setIsRaceClassificationCopying(true);
    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(raceClassificationTableRef.current!, {
              scale: 2,
              style: { overflow: 'hidden' },
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsRaceClassificationCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsRaceClassificationCopying(false);
      handleDownloadRaceClassification();
      /* Alert suppressed to improve user experience in iframe */
    }
  };

  const handleDownloadRaceClassification = async () => {
    if (!raceClassificationTableRef.current) return;
    try {
      const dataUrl = await domToDataUrl(raceClassificationTableRef.current, {
        scale: 2,
        style: { overflow: 'hidden' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'clasificacion-carrera.png';
      link.click();
    } catch (err) {
      console.error('Error downloading table:', err);
    }
  };

  const handleCopyTopCyclistsDraftText = async () => {
    if (!topCyclistsDraftRef.current || isTopCyclistsDraftTextCopying) return;
    setIsTopCyclistsDraftTextCopying(true);
    
    const table = topCyclistsDraftRef.current.querySelector('table');
    if (!table) {
      setIsTopCyclistsDraftTextCopying(false);
      return;
    }

    const rows = Array.from(table.rows);
    const text = rows.map((row: any) => 
      Array.from(row.cells).map((cell: any) => cell.innerText.trim()).join('\t')
    ).join('\n');
    
    navigator.clipboard.writeText(text);
    setTimeout(() => setIsTopCyclistsDraftTextCopying(false), 2000);
  };

  const handleCopyTopCyclistsDraft = async (subset?: 'full' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10' | 'p11' | 'p12' | 'p13' | 'p14' | 'p15' | 'p16' | 'p17' | 'p18' | 'p19' | 'p20') => {
    if (!topCyclistsDraftRef.current || isTopCyclistsDraftCopying) return;
    setIsTopCyclistsDraftCopying(subset || 'full');
    
    // Wait for React to re-render the button states before capturing
    await new Promise(resolve => setTimeout(resolve, 200));

    const tableContainer = topCyclistsDraftRef.current;
    if (!tableContainer) return;
    const rows = tableContainer.querySelectorAll('.top-cyclists-row');
    const restore = expandNodeForCapture(tableContainer);

    try {


      const dataUrl = await domToDataUrl(tableContainer, {
        scale: subset === 'full' ? 0.9 : 3,
        backgroundColor: '#ffffff',
        style: { 
          overflow: 'visible',
          textRendering: 'optimizeLegibility'
        },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });

      if (typeof ClipboardItem !== 'undefined') {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const clipboardItem = new ClipboardItem({ 'image/png': blob });
        try {
          window.focus();
          await navigator.clipboard.write([clipboardItem]);
        } catch (copyErr) {
          /* console.error suppressed */
          // If write fails, it will fall through to the catch block and trigger download
          throw copyErr;
        }
        setTimeout(() => setIsTopCyclistsDraftCopying(null), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsTopCyclistsDraftCopying(null);
      handleDownloadTopCyclistsDraft(subset);
      /* Alert suppressed to improve user experience in iframe */
    } finally {
      restore();
    }
  };

  const handleDownloadTopCyclistsDraft = async (subset?: 'full' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10' | 'p11' | 'p12' | 'p13' | 'p14' | 'p15' | 'p16' | 'p17' | 'p18' | 'p19' | 'p20') => {
    if (!topCyclistsDraftRef.current) return;
    
    const tableContainer = topCyclistsDraftRef.current;
    const rows = tableContainer.querySelectorAll('.top-cyclists-row');
    const restore = expandNodeForCapture(tableContainer);

    try {


      const dataUrl = await domToDataUrl(tableContainer, {
        scale: subset === 'full' ? 0.9 : 3,
        backgroundColor: '#ffffff',
        style: { 
          overflow: 'visible',
          textRendering: 'optimizeLegibility'
        },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      const suffix = (subset && subset !== 'full') ? `-${subset}` : '';
      link.download = `top-ciclistas-draft${suffix}.png`;
      link.click();
    } catch (err) {
      console.error('Error downloading table:', err);
    } finally {
      restore();
    }
  };

  const handleCopyCyclists = async () => {
    if (!cyclistsTableRef.current || isCyclistsCopying) return;
    setIsCyclistsCopying(true);
    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(cyclistsTableRef.current!, {
              scale: 2,
              style: { overflow: 'hidden' },
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsCyclistsCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsCyclistsCopying(false);
      handleDownloadCyclists();
      /* Alert suppressed to improve user experience in iframe */
    }
  };

  const handleDownloadCyclists = async () => {
    if (!cyclistsTableRef.current) return;
    try {
      const dataUrl = await domToDataUrl(cyclistsTableRef.current, {
        scale: 2,
        style: { overflow: 'hidden' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'clasificacion-ciclistas.png';
      link.click();
    } catch (err) {
      console.error('Error downloading table:', err);
    }
  };

  const handleCopyStage = async () => {
    if (!stageTableRef.current || isStageCopying) return;
    setIsStageCopying(true);
    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(stageTableRef.current!, {
              scale: 2,
              style: { overflow: 'hidden' },
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsStageCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsStageCopying(false);
      handleDownloadStage();
      /* Alert suppressed to improve user experience in iframe */
    }
  };

  const handleDownloadStage = async () => {
    if (!stageTableRef.current) return;
    try {
      const dataUrl = await domToDataUrl(stageTableRef.current, {
        scale: 2,
        style: { overflow: 'hidden' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'clasificacion-etapas.png';
      link.click();
    } catch (err) {
      console.error('Error downloading table:', err);
    }
  };

  const handleCopyPointsImage = async () => {
    if (!pointsTableRef.current || isPointsImageCopying) return;
    setIsPointsImageCopying(true);
    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(pointsTableRef.current!, {
              scale: 2,
              style: { overflow: 'hidden' },
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsPointsImageCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsPointsImageCopying(false);
      handleDownloadPointsImage();
      /* Alert suppressed to improve user experience in iframe */
    }
  };

  const handleDownloadPointsImage = async () => {
    if (!pointsTableRef.current) return;
    try {
      const dataUrl = await domToDataUrl(pointsTableRef.current, {
        scale: 2,
        style: { overflow: 'hidden' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'detalle-puntos.png';
      link.click();
    } catch (err) {
      console.error('Error downloading table:', err);
    }
  };

  const handleCopyRaces = async () => {
    const table = document.querySelector('table');
    if (!table || isRacesTextCopying) return;
    setIsRacesTextCopying(true);
    const rows = Array.from(table.rows);
    const text = rows.map(row => 
      Array.from(row.cells).map(cell => cell.innerText.trim()).join('\t')
    ).join('\n');
    navigator.clipboard.writeText(text);
    setTimeout(() => setIsRacesTextCopying(false), 2000);
  };

  const handleCopyRacesImage = async () => {
    if (!racesTableRef.current || isRacesImageCopying) return;
    setIsRacesImageCopying(true);
    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(racesTableRef.current!, {
              scale: 2,
              style: { overflow: 'hidden' },
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsRacesImageCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsRacesImageCopying(false);
      handleDownloadRacesImage();
      /* Alert suppressed to improve user experience in iframe */
    }
  };

  const handleDownloadRacesImage = async () => {
    if (!racesTableRef.current) return;
    try {
      const dataUrl = await domToDataUrl(racesTableRef.current, {
        scale: 2,
        style: { overflow: 'hidden' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'detalle-carreras.png';
      link.click();
    } catch (err) {
      console.error('Error downloading table:', err);
    }
  };

  const handleCopyTeamGlobalImage = async () => {
    if (!teamGlobalRef.current || isTeamGlobalCopying) return;
    setIsTeamGlobalCopying(true);
    
    const tableContainer = teamGlobalRef.current.querySelector('.table-container-for-capture');
    if (tableContainer) {
      tableContainer.classList.remove('overflow-x-auto');
      tableContainer.classList.add('overflow-visible');
    }

    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(teamGlobalRef.current!, {
              scale: 2,
              width: teamGlobalRef.current!.scrollWidth,
              style: { overflow: 'visible' },
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsTeamGlobalCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsTeamGlobalCopying(false);
      handleDownloadTeamGlobalImage();
      /* Alert suppressed to improve user experience in iframe */
    } finally {
      if (tableContainer) {
        tableContainer.classList.add('overflow-x-auto');
        tableContainer.classList.remove('overflow-visible');
      }
    }
  };

  const handleDownloadTeamGlobalImage = async () => {
    if (!teamGlobalRef.current) return;
    
    const tableContainer = teamGlobalRef.current.querySelector('.table-container-for-capture');
    if (tableContainer) {
      tableContainer.classList.remove('overflow-x-auto');
      tableContainer.classList.add('overflow-visible');
    }

    try {
      const dataUrl = await domToDataUrl(teamGlobalRef.current, {
        scale: 2,
        width: teamGlobalRef.current.scrollWidth,
        style: { overflow: 'visible' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `equipo-${selectedTeam.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.click();
    } catch (err) {
      console.error('Error downloading team image:', err);
    } finally {
      if (tableContainer) {
        tableContainer.classList.add('overflow-x-auto');
        tableContainer.classList.remove('overflow-visible');
      }
    }
  };

  const handleCopyRaceBreakdownImage = async () => {
    if (!raceBreakdownTableRef.current || isRaceBreakdownCopying) return;
    setIsRaceBreakdownCopying(true);
    
    const tableContainer = raceBreakdownTableRef.current;
    const originalClass = tableContainer.className;
    tableContainer.classList.remove('overflow-x-auto');
    tableContainer.classList.add('overflow-visible');

    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(tableContainer, {
              scale: 2,
              width: tableContainer.scrollWidth,
              style: { overflow: 'visible' },
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsRaceBreakdownCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsRaceBreakdownCopying(false);
      handleDownloadRaceBreakdownImage();
      /* Alert suppressed to improve user experience in iframe */
    } finally {
      tableContainer.className = originalClass;
    }
  };

  const handleDownloadRaceBreakdownImage = async () => {
    if (!raceBreakdownTableRef.current) return;
    
    const tableContainer = raceBreakdownTableRef.current;
    const originalClass = tableContainer.className;
    tableContainer.classList.remove('overflow-x-auto');
    tableContainer.classList.add('overflow-visible');

    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 2,
        width: tableContainer.scrollWidth,
        style: { overflow: 'visible' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `clasificacion-etapas-${selectedRace.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.click();
    } catch (err) {
      console.error('Error downloading race breakdown image:', err);
    } finally {
      tableContainer.className = originalClass;
    }
  };

  const handleCopyDetailedBreakdownImage = async (subset?: 'full' | 'first' | 'second' | 'third') => {
    if (!detailedBreakdownRef.current || isDetailedBreakdownCopying) return;
    setIsDetailedBreakdownCopying(subset || 'full');
    
    const container = detailedBreakdownRef.current;
    const originalClass = container.className;
    const cards = container.querySelectorAll('.team-card-breakdown');
    
    try {
      // Apply subset filtering if requested (12 cards per image for 4-column layout)
      if (subset) {
        cards.forEach((card, idx) => {
          const num = idx + 1;
          if (subset === 'first' && num > 12) card.classList.add('hidden');
          if (subset === 'second' && (num <= 12 || num > 24)) card.classList.add('hidden');
          if (subset === 'third' && num <= 24) card.classList.add('hidden');
        });
      }

      // Force a 4-column grid for wide capture
      container.className = cn(
        "grid grid-cols-4 gap-4 bg-white p-6 rounded-xl w-[1400px]",
        subset ? "" : "grid-cols-4"
      );

      if (typeof ClipboardItem !== 'undefined') {
        const dataUrl = await domToDataUrl(container, {
          scale: subset === 'full' ? 0.9 : 3,
        backgroundColor: '#ffffff',
        style: {
            textRendering: 'optimizeLegibility'
          },
          filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
        });
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const clipboardItem = new ClipboardItem({ 'image/png': blob });
        
        try {
          window.focus();
          await navigator.clipboard.write([clipboardItem]);
        } catch (copyErr) {
          /* console.error suppressed */
          throw copyErr;
        }
        setTimeout(() => setIsDetailedBreakdownCopying(null), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsDetailedBreakdownCopying(null);
      handleDownloadDetailedBreakdownImage(subset);
      /* Alert suppressed to improve user experience in iframe */
    } finally {
      container.className = originalClass;
      cards.forEach(card => card.classList.remove('hidden'));
    }
  };

  const handleDownloadDetailedBreakdownImage = async (subset?: 'full' | 'first' | 'second' | 'third') => {
    if (!detailedBreakdownRef.current) return;
    
    const container = detailedBreakdownRef.current;
    const originalClass = container.className;
    const cards = container.querySelectorAll('.team-card-breakdown');

    try {
       // Apply subset filtering (12 cards per image for 4-column layout)
       if (subset) {
        cards.forEach((card, idx) => {
          const num = idx + 1;
          if (subset === 'first' && num > 12) card.classList.add('hidden');
          if (subset === 'second' && (num <= 12 || num > 24)) card.classList.add('hidden');
          if (subset === 'third' && num <= 24) card.classList.add('hidden');
        });
      }

      container.className = cn(
        "grid grid-cols-4 gap-4 bg-white p-6 rounded-xl w-[1400px]",
        subset ? "" : "grid-cols-4"
      );

      const dataUrl = await domToDataUrl(container, {
        scale: subset === 'full' ? 0.9 : 3,
        backgroundColor: '#ffffff',
        style: {
          textRendering: 'optimizeLegibility'
        },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      const suffix = subset ? `-${subset}` : '';
      link.download = `desglose-equipos-${selectedRace.replace(/\s+/g, '-').toLowerCase()}${suffix}.png`;
      link.click();
    } catch (err) {
      console.error('Error downloading detailed breakdown image:', err);
    } finally {
      container.className = originalClass;
      cards.forEach(card => card.classList.remove('hidden'));
    }
  };

  const handleCopyDetailedBreakdownText = () => {
    if (!selectedRace || !leaderboard) return;
    setIsDetailedBreakdownTextCopying(true);

    const teams = leaderboard?.map(player => {
      const details = player.detalles.filter(d => d.carrera === selectedRace);
      const totalPoints = details.reduce((sum, d) => sum + d.puntosObtenidos, 0);
      return {
        nombreEquipo: player.nombreEquipo,
        orden: player.orden,
        totalPoints,
        details
      };
    }).filter(t => t.nombreEquipo !== 'No draft' && t.nombreEquipo !== 'No draft [99]')
      .sort((a, b) => b.totalPoints - a.totalPoints);

    let text = `🏆 DESGLOSE POR EQUIPO - ${selectedRace}\n\n`;

    teams.forEach(team => {
      if (team.totalPoints === 0) return;
      text += `--- ${team.nombreEquipo} [#${team.orden}] (${team.totalPoints} pts) ---\n`;
      
      const cyclistMap = new Map<string, { total: number, concepts: any[] }>();
      team.details.forEach(d => {
        if (!cyclistMap.has(d.ciclista)) {
          cyclistMap.set(d.ciclista, { total: 0, concepts: [] });
        }
        const c = cyclistMap.get(d.ciclista)!;
        c.total += d.puntosObtenidos;
        if (d.puntosObtenidos > 0) {
          c.concepts.push(d);
        }
      });

      const sortedCyclists = Array.from(cyclistMap.entries())
        .filter(([_, data]) => data.total > 0)
        .sort((a, b) => b[1].total - a[1].total);

      sortedCyclists.forEach(([ciclista, data]) => {
        text += `📍 ${ciclista}: +${data.total} pts\n`;
        data.concepts.forEach(c => {
           text += `   • ${c.tipoResultado} ${c.posicion ? `(Pos ${c.posicion.toString().replace(/^p/i, '')})` : ''}: +${c.puntosObtenidos}\n`;
        });
        text += `\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setTimeout(() => setIsDetailedBreakdownTextCopying(false), 2000);
  };

  const handleCopyDraftTableImage = async (subset?: 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10') => {
    if (!draftTableRef.current || isDraftTableCopying) return;
    setIsDraftTableCopying(subset || 'full');
    
    const tableContainer = draftTableRef.current;
    const originalClass = tableContainer.className;
    const rows = tableContainer.querySelectorAll('.draft-row');
    
    try {
      // Apply subset filtering (50 rows per block)
      if (subset) {
        const start = (['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'].indexOf(subset)) * 50;
        const end = start + 50;
        rows.forEach((row, idx) => {
          const num = idx + 1;
          if (num <= start || num > end) row.classList.add('hidden');
        });
      }

      // Force a clean layout for capture
      tableContainer.className = "bg-white border border-neutral-200 rounded-xl overflow-visible shadow-sm inline-block w-auto min-w-full";

      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(tableContainer, {
              scale: 3,
              backgroundColor: '#ffffff',
              style: { overflow: 'visible' },
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsDraftTableCopying(null), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsDraftTableCopying(null);
      handleDownloadDraftTableImage(subset);
      /* Alert suppressed to improve user experience in iframe */
    } finally {
      tableContainer.className = originalClass;
      rows.forEach(row => row.classList.remove('hidden'));
    }
  };

  const handleDownloadDraftTableImage = async (subset?: 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10') => {
    if (!draftTableRef.current) return;
    
    const tableContainer = draftTableRef.current;
    const originalClass = tableContainer.className;
    const rows = tableContainer.querySelectorAll('.draft-row');

    try {
      if (subset) {
        const start = (['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'].indexOf(subset)) * 50;
        const end = start + 50;
        rows.forEach((row, idx) => {
          const num = idx + 1;
          if (num <= start || num > end) row.classList.add('hidden');
        });
      }

      tableContainer.className = "bg-white border border-neutral-200 rounded-xl overflow-visible shadow-sm inline-block w-auto min-w-full";

      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3,
        backgroundColor: '#ffffff',
        style: { overflow: 'visible' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      const suffix = subset ? `-${subset}` : '';
      link.download = `draft-elecciones${suffix}.png`;
      link.click();
    } catch (err) {
      console.error('Error downloading draft table image:', err);
    } finally {
      tableContainer.className = originalClass;
      rows.forEach(row => row.classList.remove('hidden'));
    }
  };

  const handleCopyDraftDatosTableImage = async () => {
    if (!draftDatosTableRef.current || isDraftDatosTableCopying) return;
    setIsDraftDatosTableCopying(true);
    
    const tableContainer = draftDatosTableRef.current;
    const originalClass = tableContainer.className;
    tableContainer.classList.remove('overflow-x-auto');
    tableContainer.classList.add('overflow-visible');

    try {
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'image/png': (async () => {
            const dataUrl = await domToDataUrl(tableContainer, {
              scale: 2,
              width: tableContainer.scrollWidth,
              style: { overflow: 'visible' },
              filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>
        });
        await navigator.clipboard.write([clipboardItem]);
        setTimeout(() => setIsDraftDatosTableCopying(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      /* console.error suppressed */
      setIsDraftDatosTableCopying(false);
      handleDownloadDraftDatosTableImage();
      /* Alert suppressed to improve user experience in iframe */
    } finally {
      tableContainer.className = originalClass;
    }
  };

  const handleDownloadDraftDatosTableImage = async () => {
    if (!draftDatosTableRef.current) return;
    
    const tableContainer = draftDatosTableRef.current;
    const originalClass = tableContainer.className;
    tableContainer.classList.remove('overflow-x-auto');
    tableContainer.classList.add('overflow-visible');

    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 2,
        width: tableContainer.scrollWidth,
        style: { overflow: 'visible' },
        filter: (node) => node instanceof Element ? !node.classList.contains('copy-button-ignore') : true
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `draft-puntos-rondas.png`;
      link.click();
    } catch (err) {
      console.error('Error downloading draft datos table image:', err);
    } finally {
      tableContainer.className = originalClass;
    }
  };

  const handleCopyPoints = async () => {
    const table = document.querySelector('table');
    if (!table || isPointsTextCopying) return;
    setIsPointsTextCopying(true);
    const rows = Array.from(table.rows);
    const text = rows.map(row => 
      Array.from(row.cells).map(cell => cell.innerText.trim()).join('\t')
    ).join('\n');
    navigator.clipboard.writeText(text);
    setTimeout(() => setIsPointsTextCopying(false), 2000);
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
      diasCompeticion: number,
      puntosTotales?: number,
      puntosPorCarrera?: Record<string, number>
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

    // Populate metadata for ALL cyclists first
    files.ciclistas.data?.forEach(row => {
      const ciclista = getVal(row, 'Ciclista')?.toString().trim();
      if (ciclista) {
        cyclistMetadata[ciclista] = {
          edad: '',
          pais: getFlagEmoji(cyclistToInfo[ciclista]?.pais || ''),
          equipoBreve: cyclistToInfo[ciclista]?.equipoBreve || '',
          ronda: '',
          carrerasDisputadas: cyclistStats[ciclista]?.carreras.size || 0,
          diasCompeticion: cyclistStats[ciclista]?.dias || 0
        };
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

    setPlayerOrderMap(playerOrderMap);
    setPlayerByCyclist(playerByCyclist);
    setPlayerTeamMap(playerTeamMap);
    setCyclistRoundMap(cyclistRoundMap);

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
    const cyclistPointsTotals: Record<string, number> = {};
    const cyclistPointsByRace: Record<string, Record<string, number>> = {};

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

      // Accumulate for metadata
      if (!cyclistPointsTotals[ciclista]) cyclistPointsTotals[ciclista] = 0;
      cyclistPointsTotals[ciclista] += puntosObtenidos;

      if (!cyclistPointsByRace[ciclista]) cyclistPointsByRace[ciclista] = {};
      if (!cyclistPointsByRace[ciclista][carrera]) cyclistPointsByRace[ciclista][carrera] = 0;
      cyclistPointsByRace[ciclista][carrera] += puntosObtenidos;

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

    // Update metadata with calculated points
    Object.keys(cyclistMetadata).forEach(ciclista => {
      cyclistMetadata[ciclista].puntosTotales = cyclistPointsTotals[ciclista] || 0;
      cyclistMetadata[ciclista].puntosPorCarrera = cyclistPointsByRace[ciclista] || {};
    });

    setCyclistMetadata({ ...cyclistMetadata });
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

  const handleParseStartlist = () => {
    if (!startlistText) return;

    const textLines = startlistText.split('\n').map(line => line.trim());
    const textLinesLower = textLines.map(line => line.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    const foundByPlayer: Record<string, any[]> = {};

    Object.keys(playerByCyclist).forEach(cyclist => {
      // cyclist is the exact name from the csv, e.g. "POGAČAR Tadej"
      const cyclistLower = cyclist.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const lineIndex = textLinesLower.findIndex(line => line.includes(cyclistLower));
      if (lineIndex !== -1) {
        const originalLine = textLines[lineIndex];
        const lineParts = originalLine.split(/[\s\t]+/);
        let dorsal = '';
        if (lineParts.length > 0 && /^[A-Za-z0-9]+$/.test(lineParts[0])) {
           dorsal = lineParts[0];
        }

        const player = playerByCyclist[cyclist];
        if (!foundByPlayer[player]) foundByPlayer[player] = [];
        foundByPlayer[player].push({ nombre: cyclist, dorsal });
      }
    });

    const results = Object.entries(foundByPlayer)
      .map(([jugador, ciclistas]) => ({
        jugador,
        ciclistas // Now array of objects: { nombre, dorsal }
      }))
      .sort((a, b) => b.ciclistas.length - a.ciclistas.length);

    setParsedStartlist({
      carrera: startlistRace || 'Carrera sin nombre',
      resultados: results
    });
  };

  const handleSaveStartlist = async () => {
    if (!parsedStartlist || !user) return;
    setIsSavingStartlist(true);

    try {
      // files.startlist.data is actually expected to be the json array now
      const currentData = Array.isArray(files.startlist.data) ? files.startlist.data : [];
      
      // Upsert: replace if same name, otherwise push
      const existingIdx = currentData.findIndex(d => d.carrera === parsedStartlist.carrera);
      const newData = [...currentData];
      
      if (existingIdx !== -1) {
        newData[existingIdx] = parsedStartlist;
      } else {
        newData.push(parsedStartlist);
      }

      const { error } = await supabase
        .from('global_files')
        .upsert({ 
          id: 'startlist', 
          data: newData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Update local state implicitly through real-time sync or manual refresh
      fetchGlobalFile('startlist');
      
      // Reset form
      setStartlistText("");
      setStartlistRace("");
      setParsedStartlist(null);
      alert("Startlist guardada correctamente.");
    } catch (err: any) {
      console.error("Error saving startlist:", err);
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setIsSavingStartlist(false);
    }
  };

  const handleDeleteStartlist = async (carreraName: string) => {
    try {
      const currentData = Array.isArray(files.startlist.data) ? files.startlist.data : [];
      const newData = currentData.filter((d: any) => d.carrera !== carreraName);
      
      const { error } = await supabase
        .from('global_files')
        .upsert({ 
          id: 'startlist', 
          data: newData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      fetchGlobalFile('startlist');
      
    } catch (err: any) {
      console.error("Error al eliminar startlist:", err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-200">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-40">
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
          <div className="space-y-6">
            {/* Admin Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-4 overflow-x-auto">
              <button
                onClick={() => setAdminTab('datos')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  adminTab === 'datos' ? "bg-purple-50 text-purple-700" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Datos
              </button>
              <button
                onClick={() => setAdminTab('gestion-startlists')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  adminTab === 'gestion-startlists' ? "bg-purple-50 text-purple-700" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <List className="w-4 h-4" />
                Gestor de startlist
              </button>
              <button
                onClick={() => setAdminTab('reporte-carrera')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  adminTab === 'reporte-carrera' ? "bg-purple-50 text-purple-700" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <Flag className="w-4 h-4" />
                Reporte carrera
              </button>
              <button
                onClick={() => setAdminTab('reporte-mes')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  adminTab === 'reporte-mes' ? "bg-purple-50 text-purple-700" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <Clock className="w-4 h-4" />
                Reporte mes
              </button>
              <button
                onClick={() => setAdminTab('reporte-temporada')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  adminTab === 'reporte-temporada' ? "bg-purple-50 text-purple-700" : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <Trophy className="w-4 h-4" />
                Reporte temporada
              </button>
            </div>

            {adminTab === 'datos' && (
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
                    {FILE_TYPES.filter(ft => !(ft as any).hiddenInAdmin).map((ft) => {
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
                        <div className="w-full" style={{ height: Math.max(500, leaderboard.length * 40 + 60) }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={leaderboard.map((p) => {
                                const cyclistPointsMap: Record<string, { points: number, ronda: string }> = {};
                                p.detalles.forEach(d => {
                                  if (!cyclistPointsMap[d.ciclista]) {
                                    cyclistPointsMap[d.ciclista] = { points: 0, ronda: d.ronda || '99' };
                                  }
                                  cyclistPointsMap[d.ciclista].points += d.puntosObtenidos;
                                });
                                const cyclists = Object.entries(cyclistPointsMap)
                                  .map(([name, data]) => ({ name, ...data }))
                                  .sort((a, b) => a.ronda.localeCompare(b.ronda));

                                return {
                                  ...p,
                                  displayName: `${p.nombreEquipo} [#${p.orden}]`,
                                  cyclists
                                };
                              })}
                              layout="vertical"
                              margin={{ top: 20, right: 60, left: 10, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                              <XAxis type="number" hide />
                              <YAxis 
                                dataKey="displayName" 
                                type="category" 
                                width={160} 
                                tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-xl min-w-[240px] z-50">
                                        <div className="flex items-center justify-between mb-3 border-b border-neutral-100 pb-2">
                                          <span className="font-bold text-neutral-900">{data.displayName}</span>
                                          <span className="text-blue-600 font-extrabold">{data.puntos} <span className="text-[10px] uppercase font-medium">pts</span></span>
                                        </div>
                                        <div className="space-y-1.5">
                                          {data.cyclists.length > 0 ? (
                                            data.cyclists.map((c: any, idx: number) => (
                                              <div key={idx} className="flex items-center justify-between text-[11px] gap-3">
                                                <span className="text-neutral-500 font-medium truncate">
                                                  <span className="text-neutral-400 mr-1.5 font-mono text-[9px]">#{c.ronda}</span>
                                                  {c.name}
                                                </span>
                                                <span className="font-bold text-neutral-700 shrink-0">{c.points} <span className="text-[10px] font-normal text-neutral-400">pts</span></span>
                                              </div>
                                            ))
                                          ) : (
                                            <div className="text-[11px] text-neutral-400 italic">Sin puntos registrados</div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar 
                                dataKey="puntos" 
                                fill="#3b82f6" 
                                radius={[0, 6, 6, 0]} 
                                barSize={26}
                              >
                                <LabelList 
                                  dataKey="puntos" 
                                  position="right" 
                                  style={{ fontSize: '11px', fontWeight: '800', fill: '#334155' }} 
                                />
                                {leaderboard.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#60a5fa' : index === 2 ? '#93c5fd' : '#cbd5e1'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'gestion-startlists' && (
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Gestor de Startlists (Múltiples Carreras)</h2>
                    <p className="text-sm text-neutral-500">Pega el texto de los participantes desde FirstCycling para detectar ciclistas de la liga y generar la tabla.</p>
                  </div>
                  {parsedStartlist && parsedStartlist.resultados.length > 0 && (
                    <button
                      onClick={handleSaveStartlist}
                      disabled={isSavingStartlist || !startlistRace.trim()}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-sm",
                        isSavingStartlist || !startlistRace.trim()
                          ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      )}
                    >
                      <Save className="w-4 h-4" />
                      {isSavingStartlist ? "Guardando..." : "Guardar Startlist"}
                    </button>
                  )}
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                  {/* Left Side: Input */}
                  <div className="space-y-4 flex flex-col h-full">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre de la Carrera</label>
                      <select
                        value={startlistRace}
                        onChange={(e) => setStartlistRace(e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      >
                        <option value="">-- Selecciona una carrera --</option>
                        {(() => {
                          const racesWithResults = new Set(
                            (files.resultados.data || []).map((r: any) => getVal(r, 'Carrera')?.trim() || '')
                          );

                          return files.carreras.data?.map((row: any, idx: number) => {
                            const carreraName = getVal(row, 'Carrera');
                            if (!carreraName || racesWithResults.has(carreraName.trim())) return null;
                            return <option key={idx} value={carreraName}>{carreraName}</option>;
                          });
                        })()}
                      </select>
                    </div>
                    <div className="flex-1 flex flex-col min-h-[300px]">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Texto de Startlist (Copia y Pega)</label>
                      <textarea
                        value={startlistText}
                        onChange={(e) => setStartlistText(e.target.value)}
                        placeholder="Pega el listado directamente desde FirstCycling..."
                        className="w-full flex-1 p-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-xs text-neutral-600 bg-neutral-50/50"
                      />
                    </div>
                    <button
                      onClick={handleParseStartlist}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Search className="w-5 h-5" />
                      Procesar Texto y Detectar
                    </button>
                  </div>

                  {/* Right Side: Results */}
                  <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 h-[600px] overflow-y-auto">
                    {!parsedStartlist ? (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-3">
                        <Users className="w-10 h-10" />
                        <p className="text-sm">Procesa un texto para previsualizar los resultados</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg border border-neutral-200 shadow-sm sticky top-0 z-10">
                          <h3 className="font-bold text-neutral-900 text-lg">{parsedStartlist.carrera}</h3>
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                            {parsedStartlist.resultados.reduce((acc, curr) => acc + curr.ciclistas.length, 0)} encontrados
                          </span>
                        </div>

                        {parsedStartlist.resultados.map((res, idx) => (
                          <div key={idx} className="bg-white border border-neutral-200 p-4 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center border-b border-neutral-100 pb-2 mb-2">
                              <span className="font-bold text-neutral-800">
                                {playerTeamMap[res.jugador] || res.jugador} {playerOrderMap[res.jugador] ? `[#${playerOrderMap[res.jugador]}]` : ''}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                                {res.ciclistas.length} ciclistas
                              </span>
                            </div>
                            <ul className="space-y-1.5">
                              {res.ciclistas.map((c, i) => {
                                const nombre = typeof c === 'string' ? c : c.nombre;
                                const dorsal = typeof c === 'string' ? '' : c.dorsal;
                                return (
                                  <li key={i} className="text-sm text-neutral-600 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                                    <span className="truncate">{dorsal ? <span className="text-neutral-400 mr-2">#{dorsal}</span> : null}{nombre}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                        
                        {parsedStartlist.resultados.length === 0 && (
                          <div className="text-center py-10 text-neutral-500 italic text-sm">
                            No se encontró ningún ciclista de la liga en este texto.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Saved Startlists Manager */}
                <div className="border-t border-neutral-100 bg-neutral-50/50 p-6 rounded-b-2xl">
                  <h3 className="text-md font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <List className="w-5 h-5 text-neutral-500" />
                    Startlists guardadas en el sistema
                  </h3>
                  {Array.isArray(files.startlist.data) && files.startlist.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {files.startlist.data.map((sl: any, idx: number) => {
                        if (!sl || !sl.carrera) return null;
                        return (
                          <div key={idx} className="bg-white border border-neutral-200 rounded-lg p-3 flex justify-between items-center shadow-sm">
                            <div className="truncate pr-2">
                              <h4 className="font-semibold text-sm text-neutral-900 truncate">{sl.carrera}</h4>
                              <span className="text-[10px] text-neutral-500">{sl.resultados?.reduce((acc: number, curr: any) => acc + (curr.ciclistas?.length || 0), 0)} participantes ligueros</span>
                            </div>
                            <button
                              onClick={() => handleDeleteStartlist(sl.carrera)}
                              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                              title="Eliminar Startlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500 italic bg-white border border-neutral-200 rounded-lg p-4 text-center">
                      No hay ninguna carrera guardada actualmente.
                    </div>
                  )}
                </div>
              </div>
            )}

            {adminTab === 'reporte-carrera' && (
              <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <Flag className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Reporte de Carrera</h2>
                <p className="text-neutral-500 max-w-sm mt-2">Próximamente podrás generar reportes detallados por competición aquí.</p>
              </div>
            )}

            {adminTab === 'reporte-mes' && (
              <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Reporte Mensual</h2>
                <p className="text-neutral-500 max-w-sm mt-2">Próximamente podrás generar resúmenes mensuales del juego aquí.</p>
              </div>
            )}

            {adminTab === 'reporte-temporada' && (
              <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Reporte de Temporada</h2>
                <p className="text-neutral-500 max-w-sm mt-2">Próximamente podrás generar el informe final de la temporada aquí.</p>
              </div>
            )}
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
                          <div ref={chartRef} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm relative group">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Clasificación General
                              </h3>
                              <div className="copy-button-ignore flex items-center gap-2">
                                <button
                                  onClick={() => setIsChartExpanded(true)}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                  title="Ampliar gráfico"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCopyChart}
                                  disabled={isCopying}
                                  className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                    isCopying 
                                      ? "bg-green-50 text-green-600 border border-green-200" 
                                      : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                                  )}
                                  title={isCopying ? "Copiado" : "Copiar gráfico como imagen"}
                                >
                                  {isCopying ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={handleDownloadChart}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                  title="Descargar gráfico como imagen"
                                >
                                  <UploadCloud className="w-4 h-4 rotate-180" />
                                </button>
                              </div>
                            </div>
                            <div className="w-full" style={{ height: Math.max(500, filteredLeaderboard.length * 35 + 60) }}>
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
                                  layout="vertical"
                                  margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                  <XAxis type="number" tick={{fontSize: 12}} />
                                  <YAxis 
                                    dataKey="displayName" 
                                    type="category"
                                    width={150}
                                    interval={0}
                                    tick={(props) => {
                                      const { x, y, payload } = props;
                                      const item = filteredLeaderboard.find((p, idx) => {
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
                                            x={-10}
                                            y={4}
                                            textAnchor="end"
                                            fill={color}
                                            style={{ fontSize: '11px', fontWeight: 600 }}
                                          >
                                            {payload.value}
                                          </text>
                                        </g>
                                      );
                                    }}
                                  />
                                  <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                          <div className="bg-white p-4 border border-neutral-200 rounded-xl shadow-xl">
                                            <p className="font-bold text-neutral-900 mb-2">{data.displayName}</p>
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
                                  <Bar dataKey="puntos" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                                    {filteredLeaderboard.map((entry, index) => (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#fb923c' : '#3b82f6'} 
                                      />
                                    ))}
                                    <LabelList 
                                      dataKey="puntos" 
                                      position="right" 
                                      style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }} 
                                    />
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Expanded Chart Modal */}
                          {isChartExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                    Clasificación General
                                  </h3>
                                  <button 
                                    onClick={() => setIsChartExpanded(false)}
                                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8">
                                  <div className="w-full" style={{ height: Math.max(800, filteredLeaderboard.length * 45 + 100) }}>
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
                                        layout="vertical"
                                        margin={{ top: 20, right: 80, left: 40, bottom: 20 }}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                        <XAxis type="number" tick={{fontSize: 14}} />
                                        <YAxis 
                                          dataKey="displayName" 
                                          type="category"
                                          width={200}
                                          interval={0}
                                          tick={(props) => {
                                            const { x, y, payload } = props;
                                            const item = filteredLeaderboard.find((p, idx) => {
                                              const displayName = `${p.nombreEquipo} [#${p.orden}]`;
                                              return displayName === payload.value;
                                            });
                                            
                                            let color = '#64748b';
                                            if (item) {
                                              const idx = filteredLeaderboard.indexOf(item);
                                              const draftOrder = item.orden ? parseInt(item.orden) : 0;
                                              const currentPos = idx + 1;
                                              const diff = draftOrder - currentPos;
                                              if (diff > 0) color = '#16a34a';
                                              else if (diff < 0) color = '#dc2626';
                                              else color = '#ca8a04';
                                            }

                                            return (
                                              <g transform={`translate(${x},${y})`}>
                                                <text
                                                  x={-15}
                                                  y={5}
                                                  textAnchor="end"
                                                  fill={color}
                                                  style={{ fontSize: '13px', fontWeight: 600 }}
                                                >
                                                  {payload.value}
                                                </text>
                                              </g>
                                            );
                                          }}
                                        />
                                        <Tooltip 
                                          cursor={{fill: '#f8fafc'}}
                                          content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              const data = payload[0].payload;
                                              return (
                                                <div className="bg-white p-5 border border-neutral-200 rounded-xl shadow-2xl">
                                                  <p className="font-bold text-neutral-900 text-lg mb-3">{data.displayName}</p>
                                                  <div className="space-y-2 text-base">
                                                    <div className="flex justify-between gap-12">
                                                      <span className="text-neutral-500">Puntos:</span>
                                                      <span className="font-bold text-blue-600">{data.puntos}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-12">
                                                      <span className="text-neutral-500">Victorias:</span>
                                                      <span className="font-bold text-yellow-600">{data.victorias}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-12">
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
                                        <Bar dataKey="puntos" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                                          {filteredLeaderboard.map((entry, index) => (
                                            <Cell 
                                              key={`cell-expanded-${index}`} 
                                              fill={index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#fb923c' : '#3b82f6'} 
                                            />
                                          ))}
                                          <LabelList 
                                            dataKey="puntos" 
                                            position="right" 
                                            style={{ fontSize: '12px', fontWeight: 'bold', fill: '#64748b' }} 
                                          />
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Monthly Evolution Chart */}
                          {(() => {
                            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                            const currentMonthIdx = new Date().getMonth(); // 0-indexed
                            
                            const teamColors: Record<string, string> = {};
                            filteredLeaderboard.forEach((team, idx) => {
                              const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                              if (idx === 0) teamColors[teamKey] = '#fbbf24'; // Gold
                              else if (idx === 1) teamColors[teamKey] = '#94a3b8'; // Silver
                              else if (idx === 2) teamColors[teamKey] = '#fb923c'; // Bronze
                              else teamColors[teamKey] = LINE_COLORS[(idx - 3) % LINE_COLORS.length];
                            });

                            const monthlyEvolutionData = (() => {
                              const dataByMonth: any[] = months.map(m => ({ month: m }));
                              
                              filteredLeaderboard.forEach(team => {
                                const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                                
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
                              <div ref={evolutionChartRef} className="mt-12 group relative">
                                <div className="flex items-center justify-between border-b pb-3 mb-6">
                                  <div className="flex items-center gap-4">
                                    <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
                                      <TrendingUp className="w-5 h-5 text-blue-600" />
                                      Evolución Mensual
                                    </h3>
                                    <div className="copy-button-ignore flex items-center gap-2">
                                      <button
                                        onClick={() => setIsEvolutionChartExpanded(true)}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Ampliar gráfico"
                                      >
                                        <Maximize2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={handleCopyEvolutionChart}
                                        disabled={isEvolutionChartCopying}
                                        className={cn(
                                          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                          isEvolutionChartCopying 
                                            ? "bg-green-50 text-green-600 border border-green-200" 
                                            : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                                        )}
                                        title={isEvolutionChartCopying ? "Copiado" : "Copiar gráfico como imagen"}
                                      >
                                        {isEvolutionChartCopying ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={handleDownloadEvolutionChart}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Descargar gráfico como imagen"
                                      >
                                        <UploadCloud className="w-4 h-4 rotate-180" />
                                      </button>
                                    </div>
                                  </div>
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
                                          onClick={() => setSelectedEvolutionTeams(filteredLeaderboard.map(t => `${t.nombreEquipo} [#${t.orden}]`))}
                                          className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                                        >
                                          Seleccionar Todos
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {filteredLeaderboard.map((team, idx) => {
                                        const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
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
                                      <LineChart data={monthlyEvolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="month" tick={{fontSize: 12}} />
                                        <YAxis tick={{fontSize: 12}} />
                                        <Tooltip 
                                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                          itemSorter={(item) => -(item.value as number)}
                                        />
                                        <Legend 
                                          verticalAlign="bottom" 
                                          align="center"
                                          height={80} 
                                          iconType="circle"
                                          wrapperStyle={{ paddingTop: '40px', paddingBottom: '0px', fontSize: '12px' }}
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

                          {/* Expanded Evolution Chart Modal */}
                          {isEvolutionChartExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                    Evolución Mensual ({evolutionMode === 'acumulado' ? 'Acumulado' : 'Mensual'})
                                  </h3>
                                  <button 
                                    onClick={() => setIsEvolutionChartExpanded(false)}
                                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8">
                                  <div className="h-[700px] w-full">
                                    {(() => {
                                      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                                      const currentMonthIdx = new Date().getMonth();
                                      
                                      const teamColors: Record<string, string> = {};
                                      filteredLeaderboard.forEach((team, idx) => {
                                        const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                                        if (idx === 0) teamColors[teamKey] = '#fbbf24';
                                        else if (idx === 1) teamColors[teamKey] = '#94a3b8';
                                        else if (idx === 2) teamColors[teamKey] = '#fb923c';
                                        else teamColors[teamKey] = LINE_COLORS[(idx - 3) % LINE_COLORS.length];
                                      });

                                      const modalEvolutionData = (() => {
                                        const dataByMonth: any[] = months.map(m => ({ month: m }));
                                        
                                        filteredLeaderboard.forEach(team => {
                                          const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                                          if (selectedEvolutionTeams.length > 0 && !selectedEvolutionTeams.includes(teamKey)) return;

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
                                        
                                        return dataByMonth.filter((m, idx) => {
                                          const hasData = Object.keys(m).some(key => key !== 'month' && m[key] > 0);
                                          return hasData && idx <= currentMonthIdx;
                                        });
                                      })();

                                      return (
                                        <ResponsiveContainer width="100%" height="100%">
                                          <LineChart data={modalEvolutionData} margin={{ top: 20, right: 40, left: 20, bottom: 60 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="month" tick={{fontSize: 14}} />
                                            <YAxis tick={{fontSize: 14}} />
                                            <Tooltip 
                                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '14px' }}
                                              itemSorter={(item) => -(item.value as number)}
                                            />
                                            <Legend 
                                              verticalAlign="bottom" 
                                              align="center"
                                              height={100} 
                                              iconType="circle"
                                              wrapperStyle={{ paddingTop: '40px', paddingBottom: '0px', fontSize: '14px' }}
                                            />
                                            {Object.keys(teamColors).map(teamKey => {
                                              if (selectedEvolutionTeams.length > 0 && !selectedEvolutionTeams.includes(teamKey)) return null;
                                              return (
                                                <Line 
                                                  key={teamKey}
                                                  type="monotone" 
                                                  dataKey={teamKey} 
                                                  stroke={teamColors[teamKey]} 
                                                  strokeWidth={4}
                                                  dot={{ r: 5, strokeWidth: 2 }}
                                                  activeDot={{ r: 8, strokeWidth: 0 }}
                                                  connectNulls
                                                />
                                              );
                                            })}
                                          </LineChart>
                                        </ResponsiveContainer>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Top Teams Table */}
                          {(() => {
                            // Map races to months
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

                            const teamStats = filteredLeaderboard.map((team, idx) => {
                              const filteredDetalles = team.detalles.filter(d => {
                                if (teamsMonthFilter !== 'all' && raceMonths[d.carrera] !== parseInt(teamsMonthFilter)) {
                                  return false;
                                }
                                return true;
                              });

                              const puntos = filteredDetalles.reduce((sum, d) => sum + d.puntosObtenidos, 0);
                              const uniqueRaces = new Set(filteredDetalles.map(d => d.carrera));
                              const numCarreras = uniqueRaces.size;
                              
                              let totalDays = 0;
                              uniqueRaces.forEach(raceName => {
                                const raceData = files.carreras.data?.find(r => getVal(r, 'Carrera')?.trim() === raceName);
                                if (raceData) {
                                  const diasStr = getVal(raceData, 'Días');
                                  totalDays += parseInt(diasStr) || 1;
                                } else {
                                  totalDays += 1;
                                }
                              });

                              // Calculate wins for this team in the filtered period (team with most points in race)
                              let wins = 0;
                              Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
                                if (winnerTeam === team.nombreEquipo) {
                                  if (teamsMonthFilter === 'all' || raceMonths[raceName] === parseInt(teamsMonthFilter)) {
                                    wins++;
                                  }
                                }
                              });

                              const ppc = numCarreras > 0 ? parseFloat((puntos / numCarreras).toFixed(1)) : 0;
                              const ppd = totalDays > 0 ? parseFloat((puntos / totalDays).toFixed(1)) : 0;

                              return { 
                                ...team, 
                                puntos, 
                                numCarreras, 
                                totalDays, 
                                wins, 
                                ppc, 
                                ppd,
                                diff: (parseInt(team.orden) || 0)
                              };
                            });

                            // Determine ranking based on current period points
                            teamStats.sort((a, b) => b.puntos - a.puntos || (parseInt(a.orden) - parseInt(b.orden)));
                            teamStats.forEach((team, idx) => {
                              team.originalPos = idx + 1;
                              team.diff = (parseInt(team.orden) || 0) - (idx + 1);
                            });

                            // Sort the array according to user selection
                            teamStats.sort((a, b) => {
                              let valA: any, valB: any;
                              switch (teamsSortColumn) {
                                case 'pos': valA = a.originalPos; valB = b.originalPos; break;
                                case 'equipo': valA = a.nombreEquipo; valB = b.nombreEquipo; break;
                                case 'dif': valA = a.diff; valB = b.diff; break;
                                case 'victorias': valA = a.wins; valB = b.wins; break;
                                case 'puntos': default: valA = a.puntos; valB = b.puntos; break;
                              }
                              
                              if (typeof valA === 'string' && typeof valB === 'string') {
                                return teamsSortDirection === 'asc' 
                                  ? valA.localeCompare(valB) 
                                  : valB.localeCompare(valA);
                              }
                              
                              if (valA < valB) return teamsSortDirection === 'asc' ? -1 : 1;
                              if (valA > valB) return teamsSortDirection === 'asc' ? 1 : -1;
                              return 0;
                            });

                            let maxWins = 0, minWins = Infinity;
                            let maxCarreras = 0, minCarreras = Infinity;
                            let maxDias = 0, minDias = Infinity;
                            let maxPpc = 0, minPpc = Infinity;
                            let maxPpd = 0, minPpd = Infinity;
                            let maxPuntos = 0, minPuntos = Infinity;

                            if (teamStats.length > 0) {
                              maxPuntos = Math.max(...teamStats.map(s => s.puntos));
                              minPuntos = Math.min(...teamStats.map(s => s.puntos));
                              maxWins = Math.max(...teamStats.map(s => s.wins));
                              minWins = Math.min(...teamStats.map(s => s.wins));
                              maxCarreras = Math.max(...teamStats.map(s => s.numCarreras));
                              minCarreras = Math.min(...teamStats.map(s => s.numCarreras));
                              maxDias = Math.max(...teamStats.map(s => s.totalDays));
                              minDias = Math.min(...teamStats.map(s => s.totalDays));
                              maxPpc = Math.max(...teamStats.map(s => s.ppc));
                              minPpc = Math.min(...teamStats.map(s => s.ppc));
                              maxPpd = Math.max(...teamStats.map(s => s.ppd));
                              minPpd = Math.min(...teamStats.map(s => s.ppd));
                            }

                            const getPuntosColor = (val: number) => {
                              if (maxPuntos === minPuntos && val > 0) return "rgb(22, 163, 74)"; // Green 600
                              if (maxPuntos === minPuntos) return "rgb(64, 64, 64)"; // Neutral 700
                              const ratio = (val - minPuntos) / (maxPuntos - minPuntos);
                              
                              // Smooth interpolation: Red (0) -> Yellow (0.5) -> Green (1)
                              // Hue: 0 (Red) -> 120 (Green). 
                              // Since Red is 0 and Green is 120 in HSL hue circle:
                              const hue = ratio * 130; 
                              return `hsl(${hue}, 80%, 35%)`; 
                            };

                            const getColorClass = (val: number, max: number, min: number, isZeroRed: boolean = false) => {
                              if (isZeroRed && val === 0) return "text-red-600 font-bold";
                              if (val === max && max > 0) return "text-green-600 font-bold";
                              if (val === min && min < max && !isZeroRed) return "text-yellow-600 font-bold";
                              return "text-neutral-700";
                            };

                            return (
                              <div ref={topTeamsTableRef} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-12 group relative">
                                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                        <LayoutGrid className="w-5 h-5 text-blue-600" />
                                        Top Equipos por Puntuación
                                      </h3>
                                      <p className="text-xs text-neutral-500 mt-0.5">Ranking de los equipos fantasy por puntuación total.</p>
                                    </div>
                                    <div className="copy-button-ignore flex items-center gap-2">
                                      <button
                                        onClick={() => setIsTopTeamsTableExpanded(true)}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Ampliar tabla"
                                      >
                                        <Maximize2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={handleCopyTopTeamsTable}
                                        disabled={isTopTeamsTableCopying}
                                        className={cn(
                                          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                          isTopTeamsTableCopying 
                                            ? "bg-green-50 text-green-600 border border-green-200" 
                                            : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                                        )}
                                        title={isTopTeamsTableCopying ? "Copiado" : "Copiar tabla como imagen"}
                                      >
                                        {isTopTeamsTableCopying ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={handleDownloadTopTeamsTable}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Descargar tabla como imagen"
                                      >
                                        <UploadCloud className="w-4 h-4 rotate-180" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <select 
                                      value={teamsMonthFilter}
                                      onChange={(e) => setTeamsMonthFilter(e.target.value)}
                                      className="px-3 py-2 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                <div className="overflow-x-auto overflow-y-auto max-h-none min-h-[600px] flex justify-center bg-neutral-50/20 pb-8 scrollbar-thin relative mt-2">
                                  <table className="w-auto min-w-[600px] text-sm text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-100 rounded-lg">
                                    <thead className="text-[10px] text-neutral-500 uppercase z-20 sticky top-0 bg-neutral-50">
                                      <tr>
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors whitespace-nowrap border-b border-neutral-100" onClick={() => { if (teamsSortColumn === 'pos') { setTeamsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamsSortColumn('pos'); setTeamsSortDirection('asc'); } }}>
                                          <div className="flex items-center gap-1">Pos {teamsSortColumn === 'pos' && (teamsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                        </th>
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors whitespace-nowrap border-b border-neutral-100" onClick={() => { if (teamsSortColumn === 'equipo') { setTeamsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamsSortColumn('equipo'); setTeamsSortDirection('asc'); } }}>
                                          <div className="flex items-center gap-1">Equipo {teamsSortColumn === 'equipo' && (teamsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                        </th>
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors whitespace-nowrap border-b border-neutral-100" title="Diferencia con el orden en el draft" onClick={() => { if (teamsSortColumn === 'dif') { setTeamsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamsSortColumn('dif'); setTeamsSortDirection('desc'); } }}>
                                          <div className="flex items-center justify-center gap-1">Dif {teamsSortColumn === 'dif' && (teamsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                        </th>
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors whitespace-nowrap border-b border-neutral-100" onClick={() => { if (teamsSortColumn === 'victorias') { setTeamsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamsSortColumn('victorias'); setTeamsSortDirection('desc'); } }}>
                                          <div className="flex items-center justify-center gap-1">Victorias {teamsSortColumn === 'victorias' && (teamsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                        </th>
                                        <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors whitespace-nowrap border-b border-neutral-100" onClick={() => { if (teamsSortColumn === 'puntos') { setTeamsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamsSortColumn('puntos'); setTeamsSortDirection('desc'); } }}>
                                          <div className="flex items-center justify-end gap-1">Puntos {teamsSortColumn === 'puntos' && (teamsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                      {teamStats.map((team) => {
                                        const posColor = team.originalPos === 1 ? "text-yellow-600 bg-yellow-50/50" : 
                                                         team.originalPos === 2 ? "text-neutral-500 bg-neutral-50/50" : 
                                                         team.originalPos === 3 ? "text-amber-700 bg-amber-50/50" : 
                                                         "text-neutral-400";
                                        
                                        const winsColor = team.wins === 0 ? "text-red-600 font-bold" :
                                                          team.wins === maxWins && maxWins > 0 ? "text-green-600 font-bold" :
                                                          team.wins === minWins && minWins < maxWins ? "text-yellow-600 font-bold" :
                                                          "text-neutral-700";

                                        return (
                                          <tr key={team.jugador} className="hover:bg-blue-50/30 transition-colors text-xs">
                                            <td className={cn("px-4 py-1 font-bold text-center whitespace-nowrap", posColor)}>
                                              <div className="flex items-center justify-center gap-1 text-[11px]">
                                                {team.originalPos === 1 ? <Medal className="w-4 h-4 text-yellow-500" /> :
                                                 team.originalPos === 2 ? <Medal className="w-4 h-4 text-neutral-400" /> :
                                                 team.originalPos === 3 ? <Medal className="w-4 h-4 text-amber-600" /> :
                                                 team.originalPos}
                                              </div>
                                            </td>
                                            <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                              {team.nombreEquipo} <span className="text-neutral-400 font-normal text-[9px] ml-1">[#{team.orden}]</span>
                                            </td>
                                            <td className="px-4 py-1 text-center whitespace-nowrap font-mono scale-90">
                                              <span className={cn(
                                                "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold",
                                                team.diff > 0 ? "bg-green-100 text-green-800" : 
                                                team.diff < 0 ? "bg-red-100 text-red-800" : 
                                                "bg-neutral-100 text-neutral-600"
                                              )}>
                                                {team.diff > 0 ? `+${formatNumberSpanish(team.diff)}` : formatNumberSpanish(team.diff)}
                                              </span>
                                            </td>
                                            <td className={cn("px-4 py-1 text-center whitespace-nowrap font-mono", winsColor)}>
                                              {formatNumberSpanish(team.wins)}
                                            </td>
                                            <td className="px-4 py-1 text-right text-sm whitespace-nowrap font-mono font-bold" style={{ color: getPuntosColor(team.puntos) }}>
                                              {formatNumberSpanish(team.puntos)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Expanded Top Teams Table Modal */}
                          {isTopTeamsTableExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                                    <LayoutGrid className="w-6 h-6 text-blue-600" />
                                    Top Equipos por Puntuación
                                  </h3>
                                  <button 
                                    onClick={() => setIsTopTeamsTableExpanded(false)}
                                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                                <div className="flex-1 overflow-auto p-8">
                                  {(() => {
                                    // Re-calculate stats for the modal
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

                                    const modalTeamStats = filteredLeaderboard.map((team, idx) => {
                                      const filteredDetalles = team.detalles.filter(d => {
                                        if (teamsMonthFilter !== 'all' && raceMonths[d.carrera] !== parseInt(teamsMonthFilter)) {
                                          return false;
                                        }
                                        return true;
                                      });

                                      const puntos = filteredDetalles.reduce((sum, d) => sum + d.puntosObtenidos, 0);
                                      const uniqueRaces = new Set(filteredDetalles.map(d => d.carrera));
                                      const numCarreras = uniqueRaces.size;
                                      
                                      let totalDays = 0;
                                      uniqueRaces.forEach(raceName => {
                                        const raceData = files.carreras.data?.find(r => getVal(r, 'Carrera')?.trim() === raceName);
                                        if (raceData) {
                                          const diasStr = getVal(raceData, 'Días');
                                          totalDays += parseInt(diasStr) || 1;
                                        } else {
                                          totalDays += 1;
                                        }
                                      });

                                      let wins = 0;
                                      Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
                                        if (winnerTeam === team.nombreEquipo) {
                                          if (teamsMonthFilter === 'all' || raceMonths[raceName] === parseInt(teamsMonthFilter)) {
                                            wins++;
                                          }
                                        }
                                      });

                                      const ppc = numCarreras > 0 ? parseFloat((puntos / numCarreras).toFixed(1)) : 0;
                                      const ppd = totalDays > 0 ? parseFloat((puntos / totalDays).toFixed(1)) : 0;

                                      return { 
                                        ...team, 
                                        puntos, 
                                        numCarreras, 
                                        totalDays, 
                                        wins, 
                                        ppc, 
                                        ppd,
                                        diff: (parseInt(team.orden) || 0)
                                      };
                                    });

                                    // Determine ranking based on current period points
                                    modalTeamStats.sort((a, b) => b.puntos - a.puntos || (parseInt(a.orden) - parseInt(b.orden)));
                                    modalTeamStats.forEach((team, idx) => {
                                      team.originalPos = idx + 1;
                                      team.diff = (parseInt(team.orden) || 0) - (idx + 1);
                                    });

                                    modalTeamStats.sort((a, b) => {
                                      let valA: any, valB: any;
                                      switch (teamsSortColumn) {
                                        case 'pos': valA = a.originalPos; valB = b.originalPos; break;
                                        case 'equipo': valA = a.nombreEquipo; valB = b.nombreEquipo; break;
                                        case 'dif': valA = a.diff; valB = b.diff; break;
                                        case 'victorias': valA = a.wins; valB = b.wins; break;
                                        case 'puntos': default: valA = a.puntos; valB = b.puntos; break;
                                      }
                                      
                                      if (typeof valA === 'string' && typeof valB === 'string') {
                                        return teamsSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                                      }
                                      
                                      if (valA < valB) return teamsSortDirection === 'asc' ? -1 : 1;
                                      if (valA > valB) return teamsSortDirection === 'asc' ? 1 : -1;
                                      return 0;
                                    });

                                    let maxWins = 0, minWins = Infinity;
                                    let maxPuntos = 0, minPuntos = Infinity;
                                    if (modalTeamStats.length > 0) {
                                      maxPuntos = Math.max(...modalTeamStats.map(s => s.puntos));
                                      minPuntos = Math.min(...modalTeamStats.map(s => s.puntos));
                                      maxWins = Math.max(...modalTeamStats.map(s => s.wins));
                                      minWins = Math.min(...modalTeamStats.map(s => s.wins));
                                    }

                                    const getPuntosColor = (val: number) => {
                                      if (maxPuntos === minPuntos && val > 0) return "rgb(22, 163, 74)";
                                      if (maxPuntos === minPuntos) return "rgb(64, 64, 64)";
                                      const ratio = (val - minPuntos) / (maxPuntos - minPuntos);
                                      const hue = ratio * 130;
                                      return `hsl(${hue}, 80%, 35%)`;
                                    };

                                    return (
                                        <div className="max-h-[85vh] overflow-y-auto scrollbar-thin">
                                          <div className="flex justify-center bg-neutral-50/20 py-6">
                                            <table className="w-auto min-w-[700px] text-base text-left bg-white border-separate border-spacing-0 shadow-xl rounded-xl border border-neutral-100">
                                              <thead className="text-xs text-neutral-500 uppercase z-20">
                                                <tr>
                                                  <th className="sticky top-0 z-30 bg-neutral-50 px-6 py-2.5 font-bold text-center whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors border-b border-neutral-100" onClick={() => { if (teamsSortColumn === 'pos') { setTeamsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamsSortColumn('pos'); setTeamsSortDirection('asc'); } }}>
                                                    <div className="flex items-center justify-center gap-1">Pos {teamsSortColumn === 'pos' && (teamsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}</div>
                                                  </th>
                                                  <th className="sticky top-0 z-30 bg-neutral-50 px-6 py-2.5 font-bold whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors border-b border-neutral-100" onClick={() => { if (teamsSortColumn === 'equipo') { setTeamsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamsSortColumn('equipo'); setTeamsSortDirection('asc'); } }}>
                                                    <div className="flex items-center gap-1">Equipo {teamsSortColumn === 'equipo' && (teamsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}</div>
                                                  </th>
                                                  <th className="sticky top-0 z-30 bg-neutral-50 px-6 py-2.5 font-bold text-center whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors border-b border-neutral-100" onClick={() => { if (teamsSortColumn === 'dif') { setTeamsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamsSortColumn('dif'); setTeamsSortDirection('asc'); } }}>
                                                    <div className="flex items-center justify-center gap-1">Dif {teamsSortColumn === 'dif' && (teamsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}</div>
                                                  </th>
                                                  <th className="sticky top-0 z-30 bg-neutral-50 px-6 py-2.5 font-bold text-center whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors border-b border-neutral-100" onClick={() => { if (teamsSortColumn === 'victorias') { setTeamsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamsSortColumn('victorias'); setTeamsSortDirection('asc'); } }}>
                                                    <div className="flex items-center justify-center gap-1">Victorias {teamsSortColumn === 'victorias' && (teamsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}</div>
                                                  </th>
                                                  <th className="sticky top-0 z-30 bg-neutral-50 px-6 py-2.5 font-bold text-right whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors border-b border-neutral-100" onClick={() => { if (teamsSortColumn === 'puntos') { setTeamsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamsSortColumn('puntos'); setTeamsSortDirection('asc'); } }}>
                                                    <div className="flex items-center justify-end gap-1">Puntos {teamsSortColumn === 'puntos' && (teamsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}</div>
                                                  </th>
                                                </tr>
                                              </thead>
                                          <tbody className="divide-y divide-neutral-100">
                                            {modalTeamStats.map((team) => {
                                              const posColor = team.originalPos === 1 ? "text-yellow-600 bg-yellow-50/50" : 
                                                               team.originalPos === 2 ? "text-neutral-500 bg-neutral-50/50" : 
                                                               team.originalPos === 3 ? "text-amber-700 bg-amber-50/50" : 
                                                               "text-neutral-400";
                                              
                                              const winsColor = team.wins === 0 ? "text-red-600 font-bold" :
                                                                team.wins === maxWins && maxWins > 0 ? "text-green-600 font-bold" :
                                                                team.wins === minWins && minWins < maxWins ? "text-yellow-600 font-bold" :
                                                                "text-neutral-700";

                                              return (
                                                <tr key={team.jugador} className="hover:bg-blue-50/30 transition-colors">
                                                  <td className={cn("px-6 py-2 font-bold text-base text-center whitespace-nowrap", posColor)}>
                                                    <div className="flex items-center justify-center gap-2">
                                                      {team.originalPos === 1 ? <Medal className="w-5 h-5 text-yellow-500" /> :
                                                       team.originalPos === 2 ? <Medal className="w-5 h-5 text-neutral-400" /> :
                                                       team.originalPos === 3 ? <Medal className="w-5 h-5 text-amber-600" /> :
                                                       team.originalPos}
                                                    </div>
                                                  </td>
                                                  <td className="px-6 py-2 font-bold text-neutral-900 text-base whitespace-nowrap">
                                                    {team.nombreEquipo} <span className="text-neutral-400 font-normal text-xs ml-1">[#{team.orden}]</span>
                                                  </td>
                                                  <td className="px-6 py-2 text-center whitespace-nowrap font-mono scale-95">
                                                    <span className={cn(
                                                      "px-2 py-0.5 rounded-md text-xs font-bold",
                                                      team.diff > 0 ? "bg-green-100 text-green-700" : team.diff < 0 ? "bg-red-100 text-red-700" : "bg-neutral-100 text-neutral-600"
                                                    )}>
                                                      {team.diff > 0 ? `+${formatNumberSpanish(team.diff)}` : formatNumberSpanish(team.diff)}
                                                    </span>
                                                  </td>
                                                  <td className={cn("px-6 py-2 text-center text-base whitespace-nowrap font-mono", winsColor)}>
                                                    {formatNumberSpanish(team.wins)}
                                                  </td>
                                                  <td className="px-6 py-2 text-right text-lg whitespace-nowrap font-mono font-bold" style={{ color: getPuntosColor(team.puntos) }}>
                                                    {formatNumberSpanish(team.puntos)}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {seasonSubTab === 'victorias' && (
                        <div className="space-y-8">
                          <div ref={winsRankingRef} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm group relative">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Ranking de Victorias por Equipo
                              </h3>
                              <div className="copy-button-ignore flex items-center gap-2">
                                <button
                                  onClick={() => setIsWinsRankingExpanded(true)}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                  title="Ampliar gráfico"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCopyWinsRanking}
                                  disabled={isWinsRankingCopying}
                                  className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                    isWinsRankingCopying 
                                      ? "bg-green-50 text-green-600 border border-green-200" 
                                      : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                                  )}
                                  title={isWinsRankingCopying ? "Copiado" : "Copiar gráfico como imagen"}
                                >
                                  {isWinsRankingCopying ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={handleDownloadWinsRanking}
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                  title="Descargar gráfico como imagen"
                                >
                                  <UploadCloud className="w-4 h-4 rotate-180" />
                                </button>
                              </div>
                            </div>
                            <div className="h-[500px] w-full mt-4">
                              {(() => {
                                const chartData = Object.entries(teamWinsCount)
                                  .map(([name, wins]) => {
                                    const teamInfo = filteredLeaderboard.find(p => p.nombreEquipo === name);
                                    const displayName = teamInfo ? `${name} [#${teamInfo.orden}]` : name;
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

                          {/* Expanded Wins Ranking Modal */}
                          {isWinsRankingExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                    Ranking de Victorias por Equipo
                                  </h3>
                                  <button 
                                    onClick={() => setIsWinsRankingExpanded(false)}
                                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8">
                                  <div className="h-[700px] w-full">
                                    {(() => {
                                      const chartData = Object.entries(teamWinsCount)
                                        .map(([name, wins]) => {
                                          const teamInfo = filteredLeaderboard.find(p => p.nombreEquipo === name);
                                          const displayName = teamInfo ? `${name} [#${teamInfo.orden}]` : name;
                                          return { name: displayName, wins };
                                        })
                                        .sort((a, b) => b.wins - a.wins);
                                      
                                      return (
                                        <ResponsiveContainer width="100%" height="100%">
                                          <BarChart
                                            data={chartData}
                                            layout="vertical"
                                            margin={{ top: 20, right: 60, left: 40, bottom: 20 }}
                                          >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                            <XAxis type="number" hide />
                                            <YAxis 
                                              dataKey="name" 
                                              type="category" 
                                              width={200} 
                                              tick={{ fontSize: 14, fontWeight: 600, fill: '#404040' }}
                                            />
                                            <Tooltip 
                                              cursor={{ fill: '#f8fafc' }}
                                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar 
                                              dataKey="wins" 
                                              fill="#3b82f6" 
                                              radius={[0, 8, 8, 0]} 
                                              barSize={40}
                                            >
                                              <LabelList dataKey="wins" position="right" style={{ fill: '#1d4ed8', fontWeight: 800, fontSize: 16 }} />
                                            </Bar>
                                          </BarChart>
                                        </ResponsiveContainer>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Monthly Evolution Chart for Wins */}
                          {(() => {
                            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                            const currentMonthIdx = new Date().getMonth(); // 0-indexed
                            
                            const teamColors: Record<string, string> = {};
                            filteredLeaderboard.forEach((team, idx) => {
                              const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
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
                                const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                                
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
                              <div ref={winsEvolutionRef} className="mt-12 group relative">
                                <div className="flex items-center justify-between border-b pb-3 mb-6">
                                  <div className="flex items-center gap-4">
                                    <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
                                      <TrendingUp className="w-5 h-5 text-blue-600" />
                                      Evolución Mensual de Victorias
                                    </h3>
                                    <div className="copy-button-ignore flex items-center gap-2">
                                      <button
                                        onClick={() => setIsWinsEvolutionExpanded(true)}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Ampliar gráfico"
                                      >
                                        <Maximize2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={handleCopyWinsEvolution}
                                        disabled={isWinsEvolutionCopying}
                                        className={cn(
                                          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                          isWinsEvolutionCopying 
                                            ? "bg-green-50 text-green-600 border border-green-200" 
                                            : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                                        )}
                                        title={isWinsEvolutionCopying ? "Copiado" : "Copiar gráfico como imagen"}
                                      >
                                        {isWinsEvolutionCopying ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={handleDownloadWinsEvolution}
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                        title="Descargar gráfico como imagen"
                                      >
                                        <UploadCloud className="w-4 h-4 rotate-180" />
                                      </button>
                                    </div>
                                  </div>
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
                                          onClick={() => setSelectedEvolutionTeams(filteredLeaderboard.map(t => `${t.nombreEquipo} [#${t.orden}]`))}
                                          className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                                        >
                                          Seleccionar Todos
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {filteredLeaderboard.map((team, idx) => {
                                        const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
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
                                        <LineChart data={monthlyWinsEvolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
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
                                            verticalAlign="bottom"
                                            align="center"
                                            wrapperStyle={{ fontSize: '12px', paddingTop: '30px' }}
                                            iconType="circle"
                                          />
                                          {filteredLeaderboard.map((team) => {
                                            const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
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

                          {/* Expanded Wins Evolution Modal */}
                          {isWinsEvolutionExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                    Evolución Mensual de Victorias ({winsChartType === 'acumulado' ? 'Acumulado' : 'Mensual'})
                                  </h3>
                                  <button 
                                    onClick={() => setIsWinsEvolutionExpanded(false)}
                                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8">
                                  <div className="h-[700px] w-full">
                                    {(() => {
                                      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                                      const currentMonthIdx = new Date().getMonth();
                                      
                                      const teamColors: Record<string, string> = {};
                                      filteredLeaderboard.forEach((team, idx) => {
                                        const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                                        if (idx === 0) teamColors[teamKey] = '#fbbf24';
                                        else if (idx === 1) teamColors[teamKey] = '#94a3b8';
                                        else if (idx === 2) teamColors[teamKey] = '#fb923c';
                                        else teamColors[teamKey] = LINE_COLORS[(idx - 3) % LINE_COLORS.length];
                                      });

                                      const modalWinsEvolutionData = (() => {
                                        const dataByMonth: any[] = months.map(m => ({ month: m }));
                                        
                                        filteredLeaderboard.forEach(team => {
                                          const teamKey = `${team.nombreEquipo} [#${team.orden}]`;
                                          if (selectedEvolutionTeams.length > 0 && !selectedEvolutionTeams.includes(teamKey)) return;

                                          let accumulated = 0;
                                          months.forEach((m, mIdx) => {
                                            let monthWins = 0;
                                            Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
                                              if (winnerTeam === team.nombreEquipo) {
                                                const raceData = files.carreras.data?.find(r => getVal(r, 'Carrera')?.trim() === raceName);
                                                if (raceData) {
                                                  const fechaFin = getVal(raceData, 'Fecha');
                                                  if (fechaFin) {
                                                    const parts = fechaFin.split(/[-/]/);
                                                    if (parts.length >= 2) {
                                                      const raceMonthIndex = parseInt(parts[1]) - 1;
                                                      if (raceMonthIndex === mIdx) monthWins++;
                                                    }
                                                  }
                                                }
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
                                        
                                        return dataByMonth.filter((m, idx) => {
                                          const hasData = Object.keys(m).some(key => key !== 'month' && m[key] > 0);
                                          return hasData && idx <= currentMonthIdx;
                                        });
                                      })();

                                      return (
                                        <ResponsiveContainer width="100%" height="100%">
                                          <LineChart data={modalWinsEvolutionData} margin={{ top: 20, right: 40, left: 20, bottom: 60 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="month" tick={{fontSize: 14}} />
                                            <YAxis tick={{fontSize: 14}} />
                                            <Tooltip 
                                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '14px' }}
                                              itemSorter={(item) => -(item.value as number)}
                                            />
                                            <Legend 
                                              verticalAlign="bottom" 
                                              align="center"
                                              height={100} 
                                              iconType="circle"
                                              wrapperStyle={{ paddingTop: '40px', paddingBottom: '0px', fontSize: '14px' }}
                                            />
                                            {Object.keys(teamColors).map(teamKey => {
                                              if (selectedEvolutionTeams.length > 0 && !selectedEvolutionTeams.includes(teamKey)) return null;
                                              return (
                                                <Line 
                                                  key={teamKey}
                                                  type="monotone" 
                                                  dataKey={teamKey} 
                                                  stroke={teamColors[teamKey]} 
                                                  strokeWidth={4}
                                                  dot={{ r: 5, strokeWidth: 2 }}
                                                  activeDot={{ r: 8, strokeWidth: 0 }}
                                                  connectNulls
                                                />
                                              );
                                            })}
                                          </LineChart>
                                        </ResponsiveContainer>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {(() => {
                            // First, map races to months and dates
                            const raceMonths: Record<string, number> = {};
                            const raceDates: Record<string, string> = {};
                            files.carreras.data?.forEach(r => {
                              const carreraName = getVal(r, 'Carrera')?.trim();
                              const fechaFin = getVal(r, 'Fecha');
                              if (carreraName && fechaFin) {
                                raceDates[carreraName] = fechaFin;
                                const parts = fechaFin.split(/[-/]/);
                                if (parts.length >= 2) {
                                  const monthIndex = parseInt(parts[1]) - 1;
                                  raceMonths[carreraName] = monthIndex;
                                }
                              }
                            });

                            const raceData = uniqueRaces.map(race => {
                              const winnerTeamName = raceWinners[race];
                              let winnerDisplayName = winnerTeamName || '';
                              let winnerPoints = 0;
                              
                              if (winnerTeamName) {
                                const teamInfo = filteredLeaderboard.find(p => p.nombreEquipo === winnerTeamName);
                                if (teamInfo) {
                                  winnerDisplayName = `${winnerTeamName} [#${teamInfo.orden}]`;
                                  winnerPoints = teamInfo.detalles
                                    .filter(d => d.carrera === race)
                                    .reduce((sum, d) => sum + d.puntosObtenidos, 0);
                                }
                              }

                              return {
                                race,
                                winnerTeamName,
                                winnerDisplayName,
                                winnerPoints,
                                month: raceMonths[race],
                                date: raceDates[race] || ''
                              };
                            });

                            const filteredRaces = raceData.filter(item => {
                              const monthMatch = historyMonthFilter === 'all' || item.month === parseInt(historyMonthFilter);
                              const teamMatch = historyTeamFilter === 'all' || item.winnerTeamName === historyTeamFilter;
                              return monthMatch && teamMatch;
                            });

                            // Sort the filtered races
                            filteredRaces.sort((a, b) => {
                              let valA: any, valB: any;
                              switch (historySortColumn) {
                                case 'fecha': {
                                  const parseDate = (d: string) => {
                                    if (!d) return 0;
                                    const parts = d.split(/[-/]/);
                                    if (parts.length === 3) {
                                      // Assume dd/mm/yyyy or yyyy-mm-dd
                                      if (parts[0].length === 4) {
                                        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getTime();
                                      } else {
                                        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
                                      }
                                    }
                                    return 0;
                                  };
                                  valA = parseDate(a.date);
                                  valB = parseDate(b.date);
                                  break;
                                }
                                case 'equipo': valA = a.winnerTeamName || ''; valB = b.winnerTeamName || ''; break;
                                case 'puntos': valA = a.winnerPoints; valB = b.winnerPoints; break;
                                case 'carrera': default: valA = a.race; valB = b.race; break;
                              }

                              if (typeof valA === 'string' && typeof valB === 'string') {
                                return historySortDirection === 'asc' 
                                  ? valA.localeCompare(valB) 
                                  : valB.localeCompare(valA);
                              }
                              
                              if (valA < valB) return historySortDirection === 'asc' ? -1 : 1;
                              if (valA > valB) return historySortDirection === 'asc' ? 1 : -1;
                              return 0;
                            });

                            const numBlocks = Math.ceil(filteredRaces.length / 50);

                            return (
                              <>
                                {numBlocks > 1 && (
                                  <div className="flex flex-col gap-2 mt-12 copy-button-ignore">
                                    <div className="flex items-center justify-end">
                                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Copiar bloques de imagen ({filteredRaces.length} carreras):</span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                                      {Array.from({ length: numBlocks }).map((_, i) => {
                                        const s = `p${i + 1}`;
                                        const start = i * 50 + 1;
                                        const end = Math.min((i + 1) * 50, filteredRaces.length);
                                        const label = `${start}-${end}`;
                                        const isCopyingThis = isWinsHistoryCopying === s;
                                        return (
                                          <button 
                                            key={s}
                                            onClick={() => handleCopyWinsHistory(s as any)} 
                                            disabled={!!isWinsHistoryCopying}
                                            className={cn(
                                              "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all",
                                              isCopyingThis ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                              (isWinsHistoryCopying && !isCopyingThis) && "opacity-50 cursor-not-allowed"
                                            )}
                                          >
                                            {isCopyingThis ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                                <div ref={winsHistoryRef} className={cn("bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm group relative", numBlocks <= 1 && "mt-12")}>
                            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                  <History className="w-5 h-5 text-purple-600" />
                                  Historial de Ganadores por Carrera
                                </h3>
                                <div className="copy-button-ignore flex items-center gap-2">
                                  <button
                                    onClick={() => setIsWinsHistoryExpanded(true)}
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                    title="Ampliar tabla"
                                  >
                                    <Maximize2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleCopyWinsHistoryText}
                                    disabled={isWinsHistoryTextCopying}
                                    className={cn(
                                      "flex items-center justify-center px-3 h-8 rounded-lg transition-all shadow-sm text-sm font-medium",
                                      isWinsHistoryTextCopying 
                                        ? "bg-green-50 text-green-600 border border-green-200" 
                                        : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                                    )}
                                    title="Copiar como texto"
                                  >
                                    {isWinsHistoryTextCopying ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <ClipboardList className="w-4 h-4 mr-1.5" />}
                                    Texto
                                  </button>
                                  <button
                                    onClick={() => handleCopyWinsHistory('full')}
                                    disabled={!!isWinsHistoryCopying}
                                    className={cn(
                                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm",
                                      isWinsHistoryCopying === 'full' 
                                        ? "bg-green-50 text-green-600 border border-green-200" 
                                        : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                                    )}
                                    title={isWinsHistoryCopying === 'full' ? "Copiado" : "Copiar tabla como imagen"}
                                  >
                                    {isWinsHistoryCopying === 'full' ? (
                                      <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDownloadWinsHistory('full')}
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
                                    title="Descargar tabla como imagen"
                                  >
                                    <UploadCloud className="w-4 h-4 rotate-180" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <select 
                                  value={historyTeamFilter}
                                  onChange={(e) => setHistoryTeamFilter(e.target.value)}
                                  className="px-3 py-2 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                  className="px-3 py-2 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                            <div className="overflow-x-auto overflow-y-auto max-h-[75vh]">
                              <table className="w-full text-sm text-left">
                                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10">
                                  <tr>
                                    <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (historySortColumn === 'fecha') { setHistorySortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setHistorySortColumn('fecha'); setHistorySortDirection('asc'); } }}>
                                      <div className="flex items-center gap-1">Fecha {historySortColumn === 'fecha' && (historySortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                    </th>
                                    <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (historySortColumn === 'carrera') { setHistorySortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setHistorySortColumn('carrera'); setHistorySortDirection('asc'); } }}>
                                      <div className="flex items-center gap-1">Carrera {historySortColumn === 'carrera' && (historySortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-right cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (historySortColumn === 'equipo') { setHistorySortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setHistorySortColumn('equipo'); setHistorySortDirection('asc'); } }}>
                                      <div className="flex items-center justify-end gap-1">Equipo Ganador {historySortColumn === 'equipo' && (historySortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                    </th>
                                    <th className="px-6 py-3 font-semibold text-right cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (historySortColumn === 'puntos') { setHistorySortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setHistorySortColumn('puntos'); setHistorySortDirection('desc'); } }}>
                                      <div className="flex items-center justify-end gap-1">Puntos {historySortColumn === 'puntos' && (historySortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                  {(() => {
                                    if (filteredRaces.length === 0) {
                                      return (
                                        <tr>
                                          <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                                            No hay carreras que coincidan con los filtros.
                                          </td>
                                        </tr>
                                      );
                                    }

                                    return filteredRaces.map(item => {
                                      const { race, winnerTeamName, winnerDisplayName, winnerPoints, date } = item;
                                      return (
                                        <tr key={race} className="hover:bg-neutral-50 transition-colors wins-history-row">
                                          <td className="px-6 py-4 text-neutral-500 font-mono text-xs">{date}</td>
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
                          </>
                        );
                      })()}

                      {/* Expanded Wins History Modal */}
                          {isWinsHistoryExpanded && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                                    <History className="w-6 h-6 text-purple-600" />
                                    Historial de Ganadores por Carrera
                                  </h3>
                                  <button 
                                    onClick={() => setIsWinsHistoryExpanded(false)}
                                    className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8">
                                  <table className="w-full text-base text-left">
                                    <thead className="text-sm text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10">
                                      <tr>
                                        <th className="px-6 py-4 font-bold">Fecha</th>
                                        <th className="px-6 py-4 font-bold">Carrera</th>
                                        <th className="px-6 py-4 font-bold text-right">Equipo Ganador</th>
                                        <th className="px-6 py-4 font-bold text-right">Puntos</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                      {(() => {
                                        const historyData = [];
                                        Object.entries(raceWinners).forEach(([raceName, winnerTeam]) => {
                                          const raceData = files.carreras.data?.find(r => getVal(r, 'Carrera')?.trim() === raceName);
                                          if (raceData) {
                                            const fechaFin = getVal(raceData, 'Fecha');
                                            const teamInfo = filteredLeaderboard.find(p => p.nombreEquipo === winnerTeam);
                                            const winnerDisplayName = teamInfo ? `${winnerTeam} [#${teamInfo.orden}]` : winnerTeam;
                                            const winnerPoints = teamInfo ? teamInfo.detalles
                                              .filter(d => d.carrera === raceName)
                                              .reduce((sum, d) => sum + d.puntosObtenidos, 0) : 0;

                                            historyData.push({
                                              fecha: fechaFin || '',
                                              carrera: raceName,
                                              equipo: winnerDisplayName,
                                              puntos: winnerPoints
                                            });
                                          }
                                        });

                                        return historyData
                                          .sort((a, b) => {
                                            const parseDate = (d: string) => {
                                              if (!d) return 0;
                                              const parts = d.split(/[-/]/);
                                              if (parts.length === 3) {
                                                if (parts[0].length === 4) return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getTime();
                                                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
                                              }
                                              return 0;
                                            };
                                            return parseDate(b.fecha) - parseDate(a.fecha);
                                          })
                                          .map((row, idx) => (
                                            <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                              <td className="px-6 py-4 text-neutral-600">{row.fecha}</td>
                                              <td className="px-6 py-4 font-bold text-neutral-900">{row.carrera}</td>
                                              <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                                                  <Trophy className="w-3 h-3" />
                                                  {row.equipo}
                                                </span>
                                              </td>
                                              <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">{row.puntos}</td>
                                            </tr>
                                          ));
                                      })()}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {seasonSubTab === 'ciclistas' && (
                        <div className="space-y-8">
                          {/* Sub-tabs for Ciclistas */}
                          <div className="flex justify-center">
                            <div className="flex bg-neutral-100 p-1.5 rounded-xl shadow-inner">
                              {[
                                { id: 'draft', label: 'Draft', icon: Users },
                                { id: 'no-draft', label: 'No draft', icon: AlertCircle },
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  onClick={() => setCyclistsSubTab(tab.id as any)}
                                  className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200",
                                    cyclistsSubTab === tab.id 
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

                          {cyclistsSubTab === 'draft' ? (
                            <>
                              <div ref={topCyclistsDraftRef} className={cn("bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm relative", isTopCyclistsDraftExpanded && "fixed inset-4 z-50 overflow-y-auto max-h-none shadow-2xl p-0")}>
                                {isTopCyclistsDraftExpanded && (
                                  <button onClick={() => setIsTopCyclistsDraftExpanded(false)} className="fixed top-8 right-8 p-3 bg-neutral-800 text-white rounded-full shadow-2xl z-[60] copy-button-ignore hover:bg-neutral-700 transition-all cursor-pointer">
                                    <X className="w-5 h-5" />
                                  </button>
                                )}
                              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
                                <div className="flex-shrink-0">
                                  <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                      <User className="w-5 h-5 text-orange-600" />
                                      Top Ciclistas por Puntuación
                                    </h3>
                                    <div className="copy-button-ignore flex items-center gap-2">
                                      <button onClick={() => setIsTopCyclistsDraftExpanded(true)} className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm" title="Ampliar tabla">
                                        <Maximize2 className="w-4 h-4" />
                                      </button>
                                      <button onClick={handleCopyTopCyclistsDraftText} disabled={isTopCyclistsDraftTextCopying} className={cn('px-2 py-1.5 text-xs font-semibold rounded-lg border shadow-sm flex items-center gap-1.5 transition-all', isTopCyclistsDraftTextCopying ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100')} title="Copiar texto de la tabla">
                                        {isTopCyclistsDraftTextCopying ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                        <span className="sr-only sm:not-sr-only">Texto</span>
                                      </button>
                                      <button onClick={() => handleCopyTopCyclistsDraft('full')} disabled={!!isTopCyclistsDraftCopying} className={cn('flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm border', isTopCyclistsDraftCopying === 'full' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100')} title="Copiar tabla completa como imagen">
                                        {isTopCyclistsDraftCopying === 'full' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                      </button>
                                      <button onClick={() => handleDownloadTopCyclistsDraft('full')} className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm" title="Descargar tabla completa como imagen">
                                        <UploadCloud className="w-4 h-4 rotate-180" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-neutral-500 mt-0.5">Ranking individual de todos los corredores con puntos.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                  
                                  {/* Teams Multi-select Filter */}
                                  <div className="relative">
                                    <button 
                                      onClick={() => setIsCyclistsTeamFilterOpen(!isCyclistsTeamFilterOpen)}
                                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
                                    >
                                      <span className="truncate">
                                        {cyclistsTeamFilter.length === 0 
                                          ? "Todos los equipos" 
                                          : `${cyclistsTeamFilter.length} equipos`}
                                      </span>
                                      <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isCyclistsTeamFilterOpen && "rotate-180")} />
                                    </button>

                                    {isCyclistsTeamFilterOpen && (
                                      <>
                                        <div 
                                          className="fixed inset-0 z-10" 
                                          onClick={() => setIsCyclistsTeamFilterOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                          <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase">Equipos</span>
                                            {cyclistsTeamFilter.length > 0 && (
                                              <button 
                                                onClick={() => setCyclistsTeamFilter([])}
                                                className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                              >
                                                Limpiar
                                              </button>
                                            )}
                                          </div>
                                          {Array.from(new Set(leaderboard?.filter(p => p.jugador !== 'No draft').map(p => p.nombreEquipo) || []))
                                            .filter(Boolean)
                                            .sort((a, b) => a!.localeCompare(b!))
                                            .map(team => (
                                              <label 
                                                key={team} 
                                                className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                              >
                                                <input 
                                                  type="checkbox" 
                                                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                  checked={cyclistsTeamFilter.includes(team)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setCyclistsTeamFilter([...cyclistsTeamFilter, team]);
                                                    } else {
                                                      setCyclistsTeamFilter(cyclistsTeamFilter.filter(t => t !== team));
                                                    }
                                                  }}
                                                />
                                                <span className="ml-2 text-sm text-neutral-700 truncate">{team}</span>
                                              </label>
                                            ))}
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Category Multi-select Filter */}
                                  <div className="relative">
                                    <button 
                                      onClick={() => setIsCyclistsCategoryFilterOpen(!isCyclistsCategoryFilterOpen)}
                                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[150px]"
                                    >
                                      <span className="truncate">
                                        {cyclistsCategoryFilter.length === 0 
                                          ? "Todas las categorías" 
                                          : `${cyclistsCategoryFilter.length} categorías`}
                                      </span>
                                      <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isCyclistsCategoryFilterOpen && "rotate-180")} />
                                    </button>

                                    {isCyclistsCategoryFilterOpen && (
                                      <>
                                        <div 
                                          className="fixed inset-0 z-10" 
                                          onClick={() => setIsCyclistsCategoryFilterOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                          <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase">Categorías</span>
                                            {cyclistsCategoryFilter.length > 0 && (
                                              <button 
                                                onClick={() => setCyclistsCategoryFilter([])}
                                                className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                              >
                                                Limpiar
                                              </button>
                                            )}
                                          </div>
                                          {Array.from(new Set(files.carreras.data?.map(r => getVal(r, 'Categoría')).map(c => c?.trim()).filter(Boolean)))
                                            .sort((a, b) => a.localeCompare(b))
                                            .map(cat => (
                                              <label 
                                                key={cat} 
                                                className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                              >
                                                <input 
                                                  type="checkbox" 
                                                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                  checked={cyclistsCategoryFilter.includes(cat)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setCyclistsCategoryFilter([...cyclistsCategoryFilter, cat]);
                                                    } else {
                                                      setCyclistsCategoryFilter(cyclistsCategoryFilter.filter(c => c !== cat));
                                                    }
                                                  }}
                                                />
                                                <span className="ml-2 text-sm text-neutral-700 truncate">{cat}</span>
                                              </label>
                                            ))}
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Round Multi-select Filter */}
                                  <div className="relative">
                                    <button 
                                      onClick={() => setIsCyclistsRoundFilterOpen(!isCyclistsRoundFilterOpen)}
                                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
                                    >
                                      <span className="truncate">
                                        {cyclistsRoundFilter.length === 0 
                                          ? "Todas las rondas" 
                                          : `${cyclistsRoundFilter.length} rondas`}
                                      </span>
                                      <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isCyclistsRoundFilterOpen && "rotate-180")} />
                                    </button>

                                    {isCyclistsRoundFilterOpen && (
                                      <>
                                        <div 
                                          className="fixed inset-0 z-10" 
                                          onClick={() => setIsCyclistsRoundFilterOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                          <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase">Rondas</span>
                                            {cyclistsRoundFilter.length > 0 && (
                                              <button 
                                                onClick={() => setCyclistsRoundFilter([])}
                                                className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                              >
                                                Limpiar
                                              </button>
                                            )}
                                          </div>
                                          {Array.from(new Set(Object.values(cyclistRoundMap) as string[]))
                                            .filter(Boolean)
                                            .sort((a, b) => a.localeCompare(b))
                                            .map(ronda => (
                                              <label 
                                                key={ronda} 
                                                className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                              >
                                                <input 
                                                  type="checkbox" 
                                                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                  checked={cyclistsRoundFilter.includes(ronda)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setCyclistsRoundFilter([...cyclistsRoundFilter, ronda]);
                                                    } else {
                                                      setCyclistsRoundFilter(cyclistsRoundFilter.filter(r => r !== ronda));
                                                    }
                                                  }}
                                                />
                                                <span className="ml-2 text-sm text-neutral-700">Ronda {ronda}</span>
                                              </label>
                                            ))}
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  <select 
                                    value={cyclistsMonthFilter}
                                    onChange={(e) => setCyclistsMonthFilter(e.target.value)}
                                    className="px-3 py-2 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                    <button 
                                      onClick={() => setTopCyclistsLimit(9999)}
                                      className={cn(
                                        "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                        topCyclistsLimit === 9999 ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                      )}
                                    >
                                      Todos
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {topCyclistsLimit > 50 && (
                                <div className="flex flex-col gap-2 p-4 copy-button-ignore border-b border-neutral-100 bg-neutral-50/30">
                                  <div className="flex items-center justify-end">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Copiar bloques de imagen:</span>
                                  </div>
                                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                                    {Array.from({ length: Math.ceil((topCyclistsLimit === 9999 ? 500 : topCyclistsLimit) / 50) }).map((_, i) => {
                                      const s = `p${i + 1}`;
                                      const start = i * 50 + 1;
                                      const end = (i + 1) * 50;
                                      const label = `${start}-${end}`;
                                      const isCopyingThis = isTopCyclistsDraftCopying === s;
                                      return (
                                        <button 
                                          key={s}
                                          onClick={() => handleCopyTopCyclistsDraft(s as any)} 
                                          disabled={!!isTopCyclistsDraftCopying}
                                          className={cn(
                                            "px-2.5 py-1 text-xs font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                            isCopyingThis ? "bg-green-50 text-green-700 border-green-200" : "bg-white",
                                            (isTopCyclistsDraftCopying && !isCopyingThis) && "opacity-50 cursor-not-allowed"
                                          )}
                                        >
                                          {isCopyingThis ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                          {label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              <div className="overflow-x-auto overflow-y-auto max-h-[1050px] bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin">
                                <table className="w-auto min-w-[700px] text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-200 rounded-lg">
                                  <thead className="text-[10px] text-neutral-500 uppercase z-20">
                                    <tr className="divide-x divide-neutral-100">
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200" onClick={() => { if (cyclistsSortColumn === 'pos') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('pos'); setCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">Pos {cyclistsSortColumn === 'pos' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200" onClick={() => { if (cyclistsSortColumn === 'nombre') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('nombre'); setCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">Ciclista {cyclistsSortColumn === 'nombre' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200" onClick={() => { if (cyclistsSortColumn === 'equipo') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('equipo'); setCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">Equipo {cyclistsSortColumn === 'equipo' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200" onClick={() => { if (cyclistsSortColumn === 'pais') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('pais'); setCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">País {cyclistsSortColumn === 'pais' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200" onClick={() => { if (cyclistsSortColumn === 'victorias') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('victorias'); setCyclistsSortDirection('desc'); } }}>
                                        <div className="flex items-center justify-center gap-1">Victorias {cyclistsSortColumn === 'victorias' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200" onClick={() => { if (cyclistsSortColumn === 'carreras') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('carreras'); setCyclistsSortDirection('desc'); } }}>
                                        <div className="flex items-center justify-center gap-1">Carreras {cyclistsSortColumn === 'carreras' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200" title="Días de competición" onClick={() => { if (cyclistsSortColumn === 'dias') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('dias'); setCyclistsSortDirection('desc'); } }}>
                                        <div className="flex items-center justify-center gap-1">Días {cyclistsSortColumn === 'dias' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200" title="Puntos por carrera" onClick={() => { if (cyclistsSortColumn === 'ppc') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('ppc'); setCyclistsSortDirection('desc'); } }}>
                                        <div className="flex items-center justify-center gap-1">P/C {cyclistsSortColumn === 'ppc' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-3 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200" title="Puntos por día de competición" onClick={() => { if (cyclistsSortColumn === 'ppd') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('ppd'); setCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center justify-center gap-1">P/D {cyclistsSortColumn === 'ppd' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200" onClick={() => { if (cyclistsSortColumn === 'puntos') { setCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setCyclistsSortColumn('puntos'); setCyclistsSortDirection('desc'); } }}>
                                        <div className="flex items-center justify-end gap-1">Puntos {cyclistsSortColumn === 'puntos' && (cyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
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

                                      // Initialize all drafted players
                                      Object.entries(playerByCyclist).forEach(([ciclista, jugador]) => {
                                        if (jugador !== 'No draft') {
                                          cyclistStats[ciclista] = {
                                            puntos: 0,
                                            jugador: jugador,
                                            nombreEquipo: playerTeamMap[jugador] || '',
                                            orden: playerOrderMap[jugador] || '',
                                            ronda: cyclistRoundMap[ciclista] || '',
                                            pais: cyclistMetadata[ciclista]?.pais || '',
                                            victorias: 0,
                                            carreras: new Set(),
                                            dias: 0
                                          };
                                        }
                                      });

                                      // First, map races to months and categories
                                      const raceMonths: Record<string, number> = {};
                                      const raceCats: Record<string, string> = {};
                                      files.carreras.data?.forEach(r => {
                                        const carreraName = getVal(r, 'Carrera')?.trim();
                                        const fechaFin = getVal(r, 'Fecha');
                                        const cat = getVal(r, 'Categoría')?.trim();
                                        if (carreraName) {
                                          if (cat) raceCats[carreraName] = cat;
                                          if (fechaFin) {
                                            const parts = fechaFin.split(/[-/]/);
                                            if (parts.length >= 2) {
                                              const monthIndex = parseInt(parts[1]) - 1;
                                              raceMonths[carreraName] = monthIndex;
                                            }
                                          }
                                        }
                                      });

                                      leaderboard?.forEach(player => {
                                        player.detalles.forEach(d => {
                                          // Apply month filter
                                          if (cyclistsMonthFilter !== 'all' && raceMonths[d.carrera] !== parseInt(cyclistsMonthFilter)) {
                                            return;
                                          }
                                          // Apply category filter
                                          if (cyclistsCategoryFilter.length > 0) {
                                            const cat = raceCats[d.carrera];
                                            if (!cat || !cyclistsCategoryFilter.includes(cat)) return;
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
                                        .filter(([name, data]) => {
                                          if (data.nombreEquipo === 'No draft') return false;
                                          if (cyclistsTeamFilter.length > 0 && !cyclistsTeamFilter.includes(data.nombreEquipo)) return false;
                                          if (cyclistsRoundFilter.length > 0 && !cyclistsRoundFilter.includes(data.ronda)) return false;
                                          return true;
                                        })
                                        .sort((a, b) => b[1].puntos - a[1].puntos)
                                        .map(([name, data], index) => {
                                          const numCarreras = data.carreras.size;
                                          const ppc = numCarreras > 0 ? parseFloat((data.puntos / numCarreras).toFixed(1)) : 0;
                                          const ppd = data.dias > 0 ? parseFloat((data.puntos / data.dias).toFixed(1)) : 0;
                                          return { name, data, numCarreras, ppc, ppd, originalPos: index + 1 };
                                        });

                                      // Tomamos el top N primero para mantener siempre los corredores con más puntos
                                      const topScorers = topCyclistsLimit === 9999 ? allStats : allStats.slice(0, topCyclistsLimit);

                                      // Sort the array by column AFTER slicing
                                      topScorers.sort((a, b) => {
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

                                      const sortedStats = topScorers;

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

                                        let isHiddenVisual = false;
                                        if (isTopCyclistsDraftCopying) {
                                            if (isTopCyclistsDraftCopying === 'full') isHiddenVisual = false;
                                            else {
                                                const pageNum = parseInt(isTopCyclistsDraftCopying.substring(1));
                                                const start = (pageNum - 1) * 50;
                                                const end = start + 50;
                                                isHiddenVisual = !(idx >= start && idx < end);
                                            }
                                        }

                                        if (isHiddenVisual && isTopCyclistsDraftCopying) return null;

                                        return (
                                          <tr key={name} className={cn("hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] divide-x divide-neutral-100", isHiddenVisual && "hidden")}>
                                            <td className="px-3 py-1 text-center">
                                              <span className={cn(
                                                "w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[9px] font-bold",
                                                originalPos === 1 ? "bg-yellow-100 text-yellow-700" :
                                                originalPos === 2 ? "bg-neutral-200 text-neutral-600" :
                                                originalPos === 3 ? "bg-orange-100 text-orange-700" :
                                                "bg-neutral-100 text-neutral-500"
                                              )}>
                                                {originalPos}
                                              </span>
                                            </td>
                                            <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                              {name} <span className="text-neutral-400 font-normal text-[9px]">&lt;{data.ronda || '-'}&gt;</span>
                                            </td>
                                            <td className="px-4 py-1 text-neutral-600 whitespace-nowrap">
                                              {data.nombreEquipo === 'No draft' ? (
                                                <span className="text-neutral-400 italic text-[10px]">No elegido</span>
                                              ) : (
                                                <span className="font-medium">{data.nombreEquipo} <span className="text-neutral-400 font-normal text-[9px]">[#{data.orden}]</span></span>
                                              )}
                                            </td>
                                            <td className="px-3 py-1 text-base text-center">{data.pais}</td>
                                            <td className={cn("px-3 py-1 text-center font-mono", getColorClass(data.victorias, maxVictorias, 0, true))}>{formatNumberSpanish(data.victorias)}</td>
                                            <td className={cn("px-3 py-1 text-center font-mono", getColorClass(numCarreras, maxCarreras, minCarreras))}>{formatNumberSpanish(numCarreras)}</td>
                                            <td className={cn("px-3 py-1 text-center font-mono", getColorClass(data.dias, maxDias, minDias))}>{formatNumberSpanish(data.dias)}</td>
                                            <td className={cn("px-3 py-1 text-center font-mono", getColorClass(ppc, maxPpc, minPpc))}>{formatNumberSpanish(ppc.toFixed(1))}</td>
                                            <td className={cn("px-3 py-1 text-center font-mono", getColorClass(ppd, maxPpd, minPpd))}>{formatNumberSpanish(ppd.toFixed(1))}</td>
                                            <td className="px-4 py-1 text-right font-black font-mono text-sm" style={{ color: getPuntosColor(data.puntos) }}>
                                              {formatNumberSpanish(data.puntos)}
                                            </td>
                                          </tr>
                                        );
                                      });
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Unscored Cyclists Table */}
                            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-8">
                              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                    <UserMinus className="w-5 h-5 text-neutral-400" />
                                    Ciclistas sin puntuar ({(() => {
                                      // Get all cyclists from elecciones
                                      const unscored = files.elecciones.data?.map(row => {
                                        const ciclista = getVal(row, 'Ciclista')?.trim();
                                        const jugador = getVal(row, 'Nombre_TG')?.trim();
                                        
                                        // Calculate points
                                        let points = 0;
                                        leaderboard?.forEach(p => {
                                          if (p.jugador === jugador) {
                                            p.detalles.forEach(d => {
                                              if (d.ciclista === ciclista) {
                                                points += d.puntosObtenidos;
                                              }
                                            });
                                          }
                                        });

                                        if (points > 0) return null;
                                        return { ciclista, ronda: cyclistRoundMap[ciclista] || '', nombreEquipo: getVal(row, 'Nombre_Equipo')?.trim() };
                                      }).filter(Boolean) as any[];

                                      // Filter by team and round
                                      return unscored.filter(c => {
                                        const teamMatch = unscoredCyclistsTeamFilter === 'all' || c.nombreEquipo === unscoredCyclistsTeamFilter;
                                        const roundMatch = unscoredCyclistsRoundFilter.length === 0 || unscoredCyclistsRoundFilter.includes(c.ronda);
                                        return teamMatch && roundMatch;
                                      }).length;
                                    })()})
                                  </h3>
                                  <p className="text-xs text-neutral-500 mt-0.5">Corredores elegidos en el draft que aún no han sumado puntos.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  {/* Round Multi-select Filter */}
                                  <div className="relative">
                                    <button 
                                      onClick={() => setIsUnscoredRoundFilterOpen(!isUnscoredRoundFilterOpen)}
                                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
                                    >
                                      <span className="truncate">
                                        {unscoredCyclistsRoundFilter.length === 0 
                                          ? "Todas las rondas" 
                                          : `${unscoredCyclistsRoundFilter.length} rondas`}
                                      </span>
                                      <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isUnscoredRoundFilterOpen && "rotate-180")} />
                                    </button>

                                    {isUnscoredRoundFilterOpen && (
                                      <>
                                        <div 
                                          className="fixed inset-0 z-10" 
                                          onClick={() => setIsUnscoredRoundFilterOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 py-2 max-h-64 overflow-y-auto">
                                          <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase">Rondas</span>
                                            {unscoredCyclistsRoundFilter.length > 0 && (
                                              <button 
                                                onClick={() => setUnscoredCyclistsRoundFilter([])}
                                                className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                              >
                                                Limpiar
                                              </button>
                                            )}
                                          </div>
                                          {Array.from(new Set(Object.values(cyclistRoundMap) as string[]))
                                            .filter(Boolean)
                                            .sort((a, b) => a.localeCompare(b))
                                            .map(ronda => (
                                              <label 
                                                key={ronda} 
                                                className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                              >
                                                <input 
                                                  type="checkbox" 
                                                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                  checked={unscoredCyclistsRoundFilter.includes(ronda)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setUnscoredCyclistsRoundFilter([...unscoredCyclistsRoundFilter, ronda]);
                                                    } else {
                                                      setUnscoredCyclistsRoundFilter(unscoredCyclistsRoundFilter.filter(r => r !== ronda));
                                                    }
                                                  }}
                                                />
                                                <span className="ml-2 text-sm text-neutral-700">Ronda {ronda}</span>
                                              </label>
                                            ))}
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  <select 
                                    value={unscoredCyclistsTeamFilter}
                                    onChange={(e) => setUnscoredCyclistsTeamFilter(e.target.value)}
                                    className="px-3 py-2 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  >
                                    <option value="all">Todos los equipos</option>
                                    {leaderboard?.map(p => (
                                      <option key={p.nombreEquipo} value={p.nombreEquipo}>{p.nombreEquipo}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="overflow-x-auto overflow-y-auto max-h-[900px] bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin">
                                <table className="min-w-full text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-200 rounded-lg">
                                  <thead className="text-[10px] text-neutral-500 uppercase z-20">
                                    <tr className="divide-x divide-neutral-100">
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap" onClick={() => { if (unscoredCyclistsSortColumn === 'jugador') { setUnscoredCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setUnscoredCyclistsSortColumn('jugador'); setUnscoredCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">Jugador {unscoredCyclistsSortColumn === 'jugador' && (unscoredCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap" onClick={() => { if (unscoredCyclistsSortColumn === 'ciclista') { setUnscoredCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setUnscoredCyclistsSortColumn('ciclista'); setUnscoredCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">Ciclista {unscoredCyclistsSortColumn === 'ciclista' && (unscoredCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap" onClick={() => { if (unscoredCyclistsSortColumn === 'ronda') { setUnscoredCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setUnscoredCyclistsSortColumn('ronda'); setUnscoredCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1 text-center justify-center">Ronda {unscoredCyclistsSortColumn === 'ronda' && (unscoredCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap" title="Carreras disputadas" onClick={() => { if (unscoredCyclistsSortColumn === 'carreras') { setUnscoredCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setUnscoredCyclistsSortColumn('carreras'); setUnscoredCyclistsSortDirection('desc'); } }}>
                                        <div className="flex items-center justify-center gap-1">Carreras {unscoredCyclistsSortColumn === 'carreras' && (unscoredCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap" title="Días de competición" onClick={() => { if (unscoredCyclistsSortColumn === 'dias') { setUnscoredCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setUnscoredCyclistsSortColumn('dias'); setUnscoredCyclistsSortDirection('desc'); } }}>
                                        <div className="flex items-center justify-center gap-1">Días {unscoredCyclistsSortColumn === 'dias' && (unscoredCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-100">
                                    {(() => {
                                      // Get all cyclists from elecciones
                                      const unscored = files.elecciones.data?.map(row => {
                                        const ciclista = getVal(row, 'Ciclista')?.trim();
                                        const jugador = getVal(row, 'Nombre_TG')?.trim();
                                        const nombreEquipo = getVal(row, 'Nombre_Equipo')?.trim();
                                        const orden = playerOrderMap[jugador] || '';
                                        const ronda = cyclistRoundMap[ciclista] || '';
                                        
                                        // Calculate points
                                        let points = 0;
                                        leaderboard?.forEach(p => {
                                          if (p.jugador === jugador) {
                                            p.detalles.forEach(d => {
                                              if (d.ciclista === ciclista) {
                                                points += d.puntosObtenidos;
                                              }
                                            });
                                          }
                                        });

                                        if (points > 0) return null;

                                        // Get metadata
                                        const meta = cyclistMetadata[ciclista] || { carrerasDisputadas: 0, diasCompeticion: 0 };

                                        return {
                                          ciclista,
                                          jugador,
                                          nombreEquipo,
                                          orden,
                                          ronda,
                                          carreras: meta.carrerasDisputadas,
                                          dias: meta.diasCompeticion
                                        };
                                      }).filter(Boolean) as any[];

                                      // Filter by team and round
                                      const filtered = unscored.filter(c => {
                                        const teamMatch = unscoredCyclistsTeamFilter === 'all' || c.nombreEquipo === unscoredCyclistsTeamFilter;
                                        const roundMatch = unscoredCyclistsRoundFilter.length === 0 || unscoredCyclistsRoundFilter.includes(c.ronda);
                                        return teamMatch && roundMatch;
                                      });

                                      // Sort
                                      filtered.sort((a, b) => {
                                        let valA: any, valB: any;
                                        switch (unscoredCyclistsSortColumn) {
                                          case 'jugador': valA = a.nombreEquipo; valB = b.nombreEquipo; break;
                                          case 'ciclista': valA = a.ciclista; valB = b.ciclista; break;
                                          case 'ronda': valA = a.ronda; valB = b.ronda; break;
                                          case 'carreras': valA = a.carreras; valB = b.carreras; break;
                                          case 'dias': valA = a.dias; valB = b.dias; break;
                                          default: valA = a.ronda; valB = b.ronda; break;
                                        }

                                        if (typeof valA === 'string' && typeof valB === 'string') {
                                          return unscoredCyclistsSortDirection === 'asc' 
                                            ? valA.localeCompare(valB) 
                                            : valB.localeCompare(valA);
                                        }
                                        
                                        if (valA < valB) return unscoredCyclistsSortDirection === 'asc' ? -1 : 1;
                                        if (valA > valB) return unscoredCyclistsSortDirection === 'asc' ? 1 : -1;
                                        return 0;
                                      });

                                      // Calculate max values for conditional formatting
                                      const maxCarreras = Math.max(...filtered.map(c => c.carreras), 0);
                                      const maxDias = Math.max(...filtered.map(c => c.dias), 0);

                                      if (filtered.length === 0) {
                                        return (
                                          <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-neutral-400 italic text-[11px]">
                                              No hay ciclistas sin puntuar que coincidan con los criterios.
                                            </td>
                                          </tr>
                                        );
                                      }

                                      return filtered.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100">
                                          <td className="px-4 py-1 text-neutral-600 whitespace-nowrap">
                                            <span className="font-medium">{c.nombreEquipo}</span> <span className="text-neutral-400 font-normal text-[9px]">[#{c.orden}]</span>
                                          </td>
                                          <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                            {c.ciclista}
                                          </td>
                                          <td className={cn(
                                            "px-4 py-1 text-center font-mono whitespace-nowrap",
                                            ["01", "02", "03", "1", "2", "3"].includes(c.ronda) ? "bg-yellow-50 text-yellow-700 font-bold" : "text-neutral-500"
                                          )}>
                                            {c.ronda}
                                          </td>
                                          <td className={cn(
                                            "px-4 py-1 text-center font-mono whitespace-nowrap",
                                            c.carreras === 0 ? "text-red-600 font-bold" : c.carreras === maxCarreras && maxCarreras > 0 ? "text-green-600 font-bold" : "text-neutral-600"
                                          )}>
                                            {c.carreras}
                                          </td>
                                          <td className={cn(
                                            "px-4 py-1 text-center font-mono whitespace-nowrap",
                                            c.dias === 0 ? "text-red-600 font-bold" : c.dias === maxDias && maxDias > 0 ? "text-green-600 font-bold" : "text-neutral-600"
                                          )}>
                                            {c.dias}
                                          </td>
                                        </tr>
                                      ));
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            {/* Undebuted Cyclists Table */}
                            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm mt-8">
                              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                    <UserMinus className="w-5 h-5 text-neutral-400" />
                                    Ciclistas sin debutar ({(() => {
                                        const undebuted = files.elecciones.data?.map(row => {
                                          const ciclista = getVal(row, 'Ciclista')?.trim();
                                          const jugador = getVal(row, 'Nombre_TG')?.trim();
                                          const nombreEquipo = getVal(row, 'Nombre_Equipo')?.trim();
                                          const ronda = cyclistRoundMap[ciclista] || '';
                                          const meta = cyclistMetadata[ciclista] || { carrerasDisputadas: 0, diasCompeticion: 0 };
                                          
                                          if (meta.diasCompeticion > 0) return null;

                                          return { nombreEquipo, ronda };
                                        }).filter(Boolean) as any[];

                                        const filtered = undebuted.filter(c => {
                                          const teamMatch = undebutedCyclistsTeamFilter === 'all' || c.nombreEquipo === undebutedCyclistsTeamFilter;
                                          const roundMatch = undebutedCyclistsRoundFilter.length === 0 || undebutedCyclistsRoundFilter.includes(c.ronda);
                                          return teamMatch && roundMatch;
                                        });

                                        return filtered.length;
                                      })()})
                                  </h3>
                                  <p className="text-xs text-neutral-500 mt-0.5">Corredores elegidos en el draft que aún no han disputado ninguna carrera (días = 0).</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <div className="relative">
                                    <button 
                                      onClick={() => setIsUndebutedRoundFilterOpen(!isUndebutedRoundFilterOpen)}
                                      className={cn(
                                        "flex items-center gap-2 px-3 py-2 text-sm border rounded-md shadow-sm transition-all",
                                        undebutedCyclistsRoundFilter.length > 0 
                                          ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" 
                                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                      )}
                                    >
                                      <List className="w-4 h-4" />
                                      {undebutedCyclistsRoundFilter.length === 0 
                                        ? "Todas las rondas" 
                                        : `${undebutedCyclistsRoundFilter.length} ${undebutedCyclistsRoundFilter.length === 1 ? 'ronda' : 'rondas'}`}
                                      <ChevronDown className={cn("w-4 h-4 transition-transform", isUndebutedRoundFilterOpen && "rotate-180")} />
                                    </button>

                                    {isUndebutedRoundFilterOpen && (
                                      <>
                                        <div 
                                          className="fixed inset-0 z-10" 
                                          onClick={() => setIsUndebutedRoundFilterOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 py-1 max-h-64 overflow-y-auto">
                                          <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Filtrar por ronda</span>
                                            {undebutedCyclistsRoundFilter.length > 0 && (
                                              <button 
                                                onClick={() => setUndebutedCyclistsRoundFilter([])}
                                                className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                              >
                                                Limpiar
                                              </button>
                                            )}
                                          </div>
                                          {Array.from(new Set(Object.values(cyclistRoundMap) as string[]))
                                            .filter(Boolean)
                                            .sort((a, b) => a.localeCompare(b))
                                            .map(ronda => (
                                              <label 
                                                key={ronda} 
                                                className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                              >
                                                <input 
                                                  type="checkbox" 
                                                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                  checked={undebutedCyclistsRoundFilter.includes(ronda)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setUndebutedCyclistsRoundFilter([...undebutedCyclistsRoundFilter, ronda]);
                                                    } else {
                                                      setUndebutedCyclistsRoundFilter(undebutedCyclistsRoundFilter.filter(r => r !== ronda));
                                                    }
                                                  }}
                                                />
                                                <span className="ml-2 text-sm text-neutral-700">Ronda {ronda}</span>
                                              </label>
                                            ))}
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  <select 
                                    value={undebutedCyclistsTeamFilter}
                                    onChange={(e) => setUndebutedCyclistsTeamFilter(e.target.value)}
                                    className="px-3 py-2 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  >
                                    <option value="all">Todos los equipos</option>
                                    {leaderboard?.map(p => (
                                      <option key={p.nombreEquipo} value={p.nombreEquipo}>{p.nombreEquipo}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="overflow-x-auto overflow-y-auto max-h-[900px] bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin">
                                <table className="min-w-full text-xs text-left bg-white border-separate border-spacing-0 shadow-sm border border-neutral-200 rounded-lg">
                                  <thead className="text-[10px] text-neutral-500 uppercase z-20">
                                    <tr className="divide-x divide-neutral-100">
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap" onClick={() => { if (undebutedCyclistsSortColumn === 'jugador') { setUndebutedCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setUndebutedCyclistsSortColumn('jugador'); setUndebutedCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">Jugador {undebutedCyclistsSortColumn === 'jugador' && (undebutedCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap" onClick={() => { if (undebutedCyclistsSortColumn === 'ciclista') { setUndebutedCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setUndebutedCyclistsSortColumn('ciclista'); setUndebutedCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">Ciclista {undebutedCyclistsSortColumn === 'ciclista' && (undebutedCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                      <th className="sticky top-0 z-30 bg-neutral-50 px-4 py-2 font-bold cursor-pointer hover:bg-neutral-100 select-none transition-colors border-b border-neutral-200 whitespace-nowrap" onClick={() => { if (undebutedCyclistsSortColumn === 'ronda') { setUndebutedCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setUndebutedCyclistsSortColumn('ronda'); setUndebutedCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">Ronda {undebutedCyclistsSortColumn === 'ronda' && (undebutedCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>)}</div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-100">
                                    {(() => {
                                      // Get all cyclists from elecciones
                                      const undebuted = files.elecciones.data?.map(row => {
                                        const ciclista = getVal(row, 'Ciclista')?.trim();
                                        const jugador = getVal(row, 'Nombre_TG')?.trim();
                                        const nombreEquipo = getVal(row, 'Nombre_Equipo')?.trim();
                                        const orden = playerOrderMap[jugador] || '';
                                        const ronda = cyclistRoundMap[ciclista] || '';
                                        
                                        // Get metadata
                                        const meta = cyclistMetadata[ciclista] || { carrerasDisputadas: 0, diasCompeticion: 0 };

                                        if (meta.diasCompeticion > 0) return null;

                                        return {
                                          ciclista,
                                          jugador,
                                          nombreEquipo,
                                          orden,
                                          ronda
                                        };
                                      }).filter(Boolean) as any[];

                                      // Filter by team and round
                                      const filtered = undebuted.filter(c => {
                                        const teamMatch = undebutedCyclistsTeamFilter === 'all' || c.nombreEquipo === undebutedCyclistsTeamFilter;
                                        const roundMatch = undebutedCyclistsRoundFilter.length === 0 || undebutedCyclistsRoundFilter.includes(c.ronda);
                                        return teamMatch && roundMatch;
                                      });

                                      // Sort
                                      filtered.sort((a, b) => {
                                        let valA: any, valB: any;
                                        switch (undebutedCyclistsSortColumn) {
                                          case 'jugador': valA = a.nombreEquipo; valB = b.nombreEquipo; break;
                                          case 'ciclista': valA = a.ciclista; valB = b.ciclista; break;
                                          case 'ronda': valA = parseInt(a.ronda) || 0; valB = parseInt(b.ronda) || 0; break;
                                          default: valA = parseInt(a.ronda) || 0; valB = parseInt(b.ronda) || 0; break;
                                        }

                                        if (typeof valA === 'string' && typeof valB === 'string') {
                                          return undebutedCyclistsSortDirection === 'asc' 
                                            ? valA.localeCompare(valB) 
                                            : valB.localeCompare(valA);
                                        }
                                        
                                        if (valA < valB) return undebutedCyclistsSortDirection === 'asc' ? -1 : 1;
                                        if (valA > valB) return undebutedCyclistsSortDirection === 'asc' ? 1 : -1;
                                        return 0;
                                      });

                                      if (filtered.length === 0) {
                                        return <tr><td colSpan={3} className="px-6 py-10 text-center text-neutral-400 italic text-[11px]">No hay ciclistas sin debutar que coincidan con los filtros.</td></tr>;
                                      }

                                      return filtered.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors text-[11px] divide-x divide-neutral-100">
                                          <td className="px-4 py-1 text-neutral-600 whitespace-nowrap">
                                            <span className="font-medium">{c.nombreEquipo}</span> <span className="text-neutral-400 font-normal text-[9px]">[#{c.orden}]</span>
                                          </td>
                                          <td className="px-4 py-1 font-bold text-neutral-900 whitespace-nowrap">
                                            {c.ciclista}
                                          </td>
                                          <td className={cn(
                                            "px-4 py-1 text-center font-mono whitespace-nowrap",
                                            ["01", "02", "03", "1", "2", "3"].includes(c.ronda) ? "bg-yellow-50 text-yellow-700 font-bold" : "text-neutral-500"
                                          )}>
                                            {c.ronda}
                                          </td>
                                        </tr>
                                      ));
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-8">
                            {/* Top Cyclists (No draft) */}
                            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-red-600" />
                                    Top Ciclistas No Elegidos (No draft)
                                  </h3>
                                  <p className="text-xs text-neutral-500 mt-0.5">Corredores que han sumado puntos pero no fueron elegidos por ningún equipo.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <select 
                                    value={noDraftCyclistsMonthFilter}
                                    onChange={(e) => setNoDraftCyclistsMonthFilter(e.target.value)}
                                    className="px-3 py-2 text-sm bg-white border-neutral-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                    {[25, 50, 100].map(limit => (
                                      <button 
                                        key={limit}
                                        onClick={() => setNoDraftTopCyclistsLimit(limit)}
                                        className={cn(
                                          "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                          noDraftTopCyclistsLimit === limit ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                                        )}
                                      >
                                        Top {limit}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="overflow-x-auto overflow-y-auto max-h-[75vh]">
                                <table className="w-full text-sm text-left">
                                  <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 sticky top-0 z-10">
                                    <tr>
                                      <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (noDraftCyclistsSortColumn === 'pos') { setNoDraftCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setNoDraftCyclistsSortColumn('pos'); setNoDraftCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">Pos {noDraftCyclistsSortColumn === 'pos' && (noDraftCyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                      </th>
                                      <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (noDraftCyclistsSortColumn === 'nombre') { setNoDraftCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setNoDraftCyclistsSortColumn('nombre'); setNoDraftCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">Ciclista {noDraftCyclistsSortColumn === 'nombre' && (noDraftCyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                      </th>
                                      <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (noDraftCyclistsSortColumn === 'equipo') { setNoDraftCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setNoDraftCyclistsSortColumn('equipo'); setNoDraftCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">Equipo {noDraftCyclistsSortColumn === 'equipo' && (noDraftCyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                      </th>
                                      <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (noDraftCyclistsSortColumn === 'pais') { setNoDraftCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setNoDraftCyclistsSortColumn('pais'); setNoDraftCyclistsSortDirection('asc'); } }}>
                                        <div className="flex items-center gap-1">País {noDraftCyclistsSortColumn === 'pais' && (noDraftCyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                      </th>
                                      <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (noDraftCyclistsSortColumn === 'victorias') { setNoDraftCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setNoDraftCyclistsSortColumn('victorias'); setNoDraftCyclistsSortDirection('desc'); } }}>
                                        <div className="flex items-center justify-center gap-1">Victorias {noDraftCyclistsSortColumn === 'victorias' && (noDraftCyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                      </th>
                                      <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (noDraftCyclistsSortColumn === 'carreras') { setNoDraftCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setNoDraftCyclistsSortColumn('carreras'); setNoDraftCyclistsSortDirection('desc'); } }}>
                                        <div className="flex items-center justify-center gap-1">Carreras {noDraftCyclistsSortColumn === 'carreras' && (noDraftCyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                      </th>
                                      <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" title="Puntos por carrera" onClick={() => { if (noDraftCyclistsSortColumn === 'ppc') { setNoDraftCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setNoDraftCyclistsSortColumn('ppc'); setNoDraftCyclistsSortDirection('desc'); } }}>
                                        <div className="flex items-center justify-center gap-1">P/C {noDraftCyclistsSortColumn === 'ppc' && (noDraftCyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                      </th>
                                      <th className="px-6 py-3 font-semibold cursor-pointer hover:bg-neutral-100 select-none transition-colors" onClick={() => { if (noDraftCyclistsSortColumn === 'puntos') { setNoDraftCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setNoDraftCyclistsSortColumn('puntos'); setNoDraftCyclistsSortDirection('desc'); } }}>
                                        <div className="flex items-center justify-end gap-1">Puntos {noDraftCyclistsSortColumn === 'puntos' && (noDraftCyclistsSortDirection === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}</div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-100">
                                    {(() => {
                                      const noDraftPlayer = leaderboard?.find(p => p.jugador === 'No draft');
                                      if (!noDraftPlayer) {
                                        return <tr><td colSpan={8} className="px-6 py-10 text-center text-neutral-400 italic">No hay datos de puntuación para ciclistas no elegidos.</td></tr>;
                                      }

                                      const cyclistStats: Record<string, { 
                                        puntos: number, 
                                        pais: string,
                                        equipoBreve: string,
                                        victorias: number,
                                        carreras: Set<string>,
                                        dias: number
                                      }> = {};

                                      // Map races to months
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

                                      noDraftPlayer.detalles.forEach(d => {
                                        if (noDraftCyclistsMonthFilter !== 'all' && raceMonths[d.carrera] !== parseInt(noDraftCyclistsMonthFilter)) {
                                          return;
                                        }

                                        if (!cyclistStats[d.ciclista]) {
                                          const meta = cyclistMetadata[d.ciclista];
                                          cyclistStats[d.ciclista] = { 
                                            puntos: 0, 
                                            pais: meta?.pais || '',
                                            equipoBreve: meta?.equipoBreve || '',
                                            victorias: 0,
                                            carreras: new Set(),
                                            dias: 0
                                          };
                                        }
                                        
                                        const stats = cyclistStats[d.ciclista];
                                        stats.puntos += d.puntosObtenidos;
                                        stats.carreras.add(d.carrera);
                                        
                                        const isPos01 = d.posicion === '01' || d.posicion === '1';
                                        const isValidType = ['Etapa', 'Etapa (Crono equipos)', 'Clasificación final', 'Clasificación final (Crono equipos)', 'Clásica'].includes(d.tipoResultado);
                                        if (isPos01 && isValidType) stats.victorias += 1;
                                      });

                                      const allStats = Object.entries(cyclistStats)
                                        .sort((a, b) => b[1].puntos - a[1].puntos)
                                        .map(([name, data], index) => {
                                          const numCarreras = data.carreras.size;
                                          const ppc = numCarreras > 0 ? parseFloat((data.puntos / numCarreras).toFixed(1)) : 0;
                                          return { name, data, numCarreras, ppc, originalPos: index + 1 };
                                        });

                                      allStats.sort((a, b) => {
                                        let valA: any, valB: any;
                                        switch (noDraftCyclistsSortColumn) {
                                          case 'pos': valA = a.originalPos; valB = b.originalPos; break;
                                          case 'nombre': valA = a.name; valB = b.name; break;
                                          case 'equipo': valA = a.data.equipoBreve; valB = b.data.equipoBreve; break;
                                          case 'pais': valA = a.data.pais; valB = b.data.pais; break;
                                          case 'victorias': valA = a.data.victorias; valB = b.data.victorias; break;
                                          case 'carreras': valA = a.numCarreras; valB = b.numCarreras; break;
                                          case 'ppc': valA = a.ppc; valB = b.ppc; break;
                                          case 'puntos': default: valA = a.data.puntos; valB = b.data.puntos; break;
                                        }
                                        if (typeof valA === 'string' && typeof valB === 'string') {
                                          return noDraftCyclistsSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                                        }
                                        if (valA < valB) return noDraftCyclistsSortDirection === 'asc' ? -1 : 1;
                                        if (valA > valB) return noDraftCyclistsSortDirection === 'asc' ? 1 : -1;
                                        return 0;
                                      });

                                      const sortedStats = allStats.slice(0, noDraftTopCyclistsLimit);
                                      if (sortedStats.length === 0) {
                                        return <tr><td colSpan={8} className="px-6 py-10 text-center text-neutral-400 italic">No hay ciclistas no elegidos que coincidan con los criterios.</td></tr>;
                                      }

                                      const maxPuntos = sortedStats[0].data.puntos;
                                      const minPuntos = sortedStats[sortedStats.length - 1].data.puntos;
                                      const maxVictorias = Math.max(...sortedStats.map(s => s.data.victorias), 0);

                                      return sortedStats.map((s) => (
                                        <tr key={s.name} className="hover:bg-neutral-50 transition-colors">
                                          <td className="px-6 py-4">
                                            <span className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                              s.originalPos === 1 ? "bg-yellow-100 text-yellow-700" :
                                              s.originalPos === 2 ? "bg-neutral-200 text-neutral-600" :
                                              s.originalPos === 3 ? "bg-orange-100 text-orange-700" : "bg-neutral-100 text-neutral-500"
                                            )}>
                                              {s.originalPos}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 font-bold text-neutral-900 whitespace-nowrap">{s.name}</td>
                                          <td className="px-6 py-4 text-neutral-600 whitespace-nowrap">{s.data.equipoBreve}</td>
                                          <td className="px-6 py-4 text-lg">{s.data.pais}</td>
                                          <td className={cn("px-6 py-4 text-center", s.data.victorias > 0 ? "text-green-600 font-bold" : "text-neutral-400")}>{s.data.victorias}</td>
                                          <td className="px-6 py-4 text-center text-neutral-600">{s.numCarreras}</td>
                                          <td className="px-6 py-4 text-center text-neutral-600">{s.ppc.toFixed(1)}</td>
                                          <td className="px-6 py-4 text-right font-black" style={{ color: `hsl(${45 + ((s.data.puntos - minPuntos) / (maxPuntos - minPuntos || 1)) * 75}, 80%, 40%)` }}>
                                            {s.data.puntos}
                                          </td>
                                        </tr>
                                      ));
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
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
                  }).filter(t => t.nombreEquipo !== 'No draft' && t.nombreEquipo !== 'No draft [99]') || [];

                  // Sort: 0 cyclists at bottom, then points desc, then cyclists asc
                  raceTeams.sort((a, b) => {
                    if (a.uniqueCyclists === 0 && b.uniqueCyclists !== 0) return 1;
                    if (a.uniqueCyclists !== 0 && b.uniqueCyclists === 0) return -1;
                    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
                    return a.uniqueCyclists - b.uniqueCyclists;
                  });

                  // Pre-calculate positions
                  const rankedTeams = raceTeams.map((team, idx, arr) => {
                    if (team.uniqueCyclists === 0) return { ...team, pos: null };
                    
                    // Find the first team with the same points and cyclists to determine position
                    const firstInGroup = arr.findIndex(t => t.totalPoints === team.totalPoints && t.uniqueCyclists === team.uniqueCyclists);
                    return { ...team, pos: firstInGroup + 1 };
                  });
                  const maxUniqueCyclists = Math.max(...rankedTeams.filter(t => t.pos !== null).map(t => t.uniqueCyclists), 0);
                  const minUniqueCyclists = Math.min(...rankedTeams.filter(t => t.pos !== null).map(t => t.uniqueCyclists));
                  const maxRacePoints = Math.max(...rankedTeams.filter(t => t.pos !== null).map(t => t.totalPoints), 0);
                  const minRacePoints = Math.min(...rankedTeams.filter(t => t.pos !== null).map(t => t.totalPoints), 0);

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
                          jugador: team.nombreEquipo,
                          orden: team.orden,
                          puntos: 0,
                          victorias: 0
                        });
                      }
                      const c = raceCyclistsMap.get(d.ciclista)!;
                      c.jugador = team.nombreEquipo; // Ensure it uses the team name if updated
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

                  const maxCyclistRacePoints = Math.max(...raceCyclists.map(c => c.puntos), 0);
                  const minCyclistRacePoints = Math.min(...raceCyclists.map(c => c.puntos), 0);

                  return (
                    <div className="space-y-10">
                      {/* Clean Leaderboard */}
                      <div>
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                          <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-blue-600" />
                            Clasificación de la Carrera
                          </h3>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setIsRaceClassificationExpanded(!isRaceClassificationExpanded)} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore">
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button onClick={handleCopyRaceClassification} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={handleDownloadRaceClassification} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore">
                              <UploadCloud className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <div id="race-classification-table" ref={raceClassificationTableRef} className={cn("bg-white border border-neutral-200 rounded-xl overflow-x-auto max-h-[75vh] overflow-y-auto shadow-sm inline-block", isRaceClassificationExpanded ? "fixed inset-4 z-50 max-h-none" : "")}>
                            {isRaceClassificationExpanded && (
                              <button onClick={() => setIsRaceClassificationExpanded(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore">
                                <X className="w-6 h-6" />
                              </button>
                            )}
                            <table className="w-auto text-sm text-left border-collapse mx-auto">
                              <thead className="bg-[#1e293b] text-white border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10">
                              <tr>
                                <th className="px-3 py-1.5 w-10 text-center">#</th>
                                <th className="px-3 py-1.5 min-w-[140px]">Equipo</th>
                                <th className="px-3 py-1.5 text-center">Cic.</th>
                                <th className="px-3 py-1.5 text-right">Pts</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {rankedTeams.filter(t => t.nombreEquipo !== 'No draft' && t.nombreEquipo !== 'No draft [99]').map((team) => (
                                <tr key={team.jugador} className="hover:bg-blue-50/30 transition-colors group">
                                  <td className="px-3 py-1.5 text-center font-mono text-xs text-neutral-400">
                                    {team.pos === 1 ? '🥇' : team.pos === 2 ? '🥈' : team.pos === 3 ? '🥉' : team.pos || '-'}
                                  </td>
                                  <td className="px-3 py-1.5">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-neutral-900 leading-tight text-xs">{team.nombreEquipo} [#{team.orden}]</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-1.5 text-center">
                                    <span className={cn(
                                      "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                                      team.uniqueCyclists === 0 ? "bg-red-50 text-red-500" : 
                                      team.uniqueCyclists === maxUniqueCyclists ? "bg-green-100 text-green-700" : 
                                      "bg-neutral-100 text-neutral-600"
                                    )}>
                                      {team.uniqueCyclists}
                                    </span>
                                  </td>
                                  <td 
                                    className="px-3 py-1.5 text-right font-mono font-bold text-blue-600 text-xs"
                                    style={{ 
                                      backgroundColor: team.totalPoints > 0 ? `rgba(34, 197, 94, ${0.03 + ((team.totalPoints - minRacePoints) / (maxRacePoints - minRacePoints || 1)) * 0.15})` : 'transparent'
                                    }}
                                  >
                                    {team.totalPoints}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                      {/* Cyclists Table */}
                      <div className="mt-12">
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                          <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Clasificación de Ciclistas
                          </h3>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setIsCyclistsExpanded(!isCyclistsExpanded)} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore">
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button onClick={handleCopyCyclists} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={handleDownloadCyclists} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore">
                              <UploadCloud className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <div id="cyclists-classification-table" ref={cyclistsTableRef} className={cn("bg-white border border-neutral-200 rounded-xl overflow-x-auto max-h-[75vh] overflow-y-auto shadow-sm inline-block", isCyclistsExpanded ? "fixed inset-4 z-50 max-h-none" : "")}>
                            {isCyclistsExpanded && (
                              <button onClick={() => setIsCyclistsExpanded(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore">
                                <X className="w-6 h-6" />
                              </button>
                            )}
                            <table className="w-auto text-sm text-left border-collapse mx-auto">
                              <thead className="bg-[#1e293b] text-white border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10">
                              <tr>
                                <th className="px-3 py-1.5 min-w-[140px]">Ciclista</th>
                                <th className="px-3 py-1.5 min-w-[140px]">Nombre_Equipo [#Orden]</th>
                                <th className="px-3 py-1.5 text-center">Vict.</th>
                                <th className="px-3 py-1.5 text-right">Pts</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {raceCyclists.map((c, idx) => (
                                <tr key={c.ciclista} className="hover:bg-blue-50/30 transition-colors">
                                  <td className="px-3 py-1.5">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-neutral-900 leading-tight text-xs">{c.ciclista} <span className="text-neutral-400 font-normal">&lt;{c.ronda}&gt;</span></span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-1.5 pr-8">
                                    <div className="flex flex-col">
                                      <span className="text-neutral-700 font-medium leading-tight text-xs">{c.jugador} [#{c.orden}]</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-1.5 text-center">
                                    {c.victorias > 0 ? (
                                      <span className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 w-4 h-4 rounded text-[10px] font-bold">
                                        {c.victorias}
                                      </span>
                                    ) : <span className="text-neutral-300">-</span>}
                                  </td>
                                  <td 
                                    className="px-3 py-1.5 text-right font-mono font-bold text-blue-600 text-xs"
                                    style={{ 
                                      backgroundColor: c.puntos > 0 ? `rgba(34, 197, 94, ${0.03 + ((c.puntos - minCyclistRacePoints) / (maxCyclistRacePoints - minCyclistRacePoints || 1)) * 0.15})` : 'transparent'
                                    }}
                                  >
                                    {c.puntos}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                      {/* Stage Breakdown (if multiple types or stage race) */}
                      {(finalColumns.length > 1 || finalColumns.some(c => /^\d+/.test(c.formatted))) && (
                        <div className="mt-12">
                        <div className="flex items-center justify-between border-b pb-3 mb-6">
                          <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
                            <Flag className="w-5 h-5 text-blue-600" />
                            Clasificación por Etapas / Conceptos
                          </h3>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setIsStageExpanded(!isStageExpanded)} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore">
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button onClick={handleCopyRaceBreakdownImage} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore">
                              {isRaceBreakdownCopying ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button onClick={handleDownloadRaceBreakdownImage} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore">
                              <UploadCloud className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <div id="race-breakdown-table" ref={raceBreakdownTableRef} className={cn("bg-white border border-neutral-200 rounded-xl overflow-x-auto max-h-[75vh] overflow-y-auto shadow-sm inline-block max-w-full", isStageExpanded ? "fixed inset-4 z-50 max-h-none" : "")}>
                            {isStageExpanded && (
                              <button onClick={() => setIsStageExpanded(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore">
                                <X className="w-6 h-6" />
                              </button>
                            )}
                            <table className="w-auto text-[10px] text-left whitespace-nowrap border-collapse mx-auto">
                                <thead className={cn(
                                  "bg-[#1e293b] text-white uppercase text-[9px] font-bold tracking-tight sticky top-0 z-10"
                                )}>
                                  <tr>
                                    <th className="px-2 py-1.5 font-bold sticky left-0 bg-[#1e293b] z-20 border-r border-slate-700">Equipo</th>
                                    {finalColumns.map(col => (
                                      <th key={col.formatted} className="px-1.5 py-1.5 text-center font-bold border-r border-slate-700">{col.formatted}</th>
                                    ))}
                                    <th className="px-2 py-1.5 text-right font-bold sticky right-0 bg-[#1e293b] z-20 border-l border-slate-700">TOTAL</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 italic md:not-italic">
                                  {teamStagePoints.map((team, idx) => {
                                    const maxTotal = Math.max(...teamStagePoints.map(t => t.total));
                                    const minTotal = Math.min(...teamStagePoints.map(t => t.total));
                                    const totalRange = maxTotal - minTotal || 1;
                                    const intensity = Math.max(0.1, (team.total - minTotal) / totalRange);
                                    
                                    return (
                                      <tr key={team.jugador} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-2 py-1 font-bold text-neutral-900 sticky left-0 bg-white group-hover:bg-blue-50 border-r border-neutral-100 z-10 text-[11px]">
                                          <span>{team.nombreEquipo} [#{team.orden}]</span>
                                        </td>
                                        {finalColumns.map(col => {
                                          const pts = team.pointsByCol[col.formatted] || 0;
                                          const isMax = pts > 0 && pts === maxPointsByCol[col.formatted];
                                          return (
                                            <td 
                                              key={col.formatted} 
                                              className={cn(
                                                "px-1.5 py-1 text-center font-mono border-r border-neutral-50 text-[10px]",
                                                isMax ? "bg-yellow-100 font-bold text-yellow-800" : pts > 0 ? "text-neutral-700" : "text-neutral-200"
                                              )}
                                            >
                                              {pts > 0 ? pts : '-'}
                                            </td>
                                          );
                                        })}
                                        <td 
                                          className="px-2 py-1 text-right font-mono font-bold sticky right-0 z-10 border-l border-neutral-100 text-[11px]"
                                          style={{ 
                                            backgroundColor: team.total > 0 ? `rgba(34, 197, 94, ${0.1 + intensity * 0.3})` : 'white',
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
                        </div>
                      )}

                      {/* Detailed Breakdown */}
                      <div className="mt-12">
                        <div className="flex items-center justify-between border-b pb-3 mb-6">
                          <h3 className="font-semibold text-xl text-neutral-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Desglose por Equipo
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <button onClick={handleCopyDetailedBreakdownText} disabled={isDetailedBreakdownTextCopying} className={cn('px-2 py-1.5 text-xs font-semibold rounded-lg border shadow-sm flex items-center gap-1.5 transition-all copy-button-ignore', isDetailedBreakdownTextCopying ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100')} title="Copiar como texto">
                              {isDetailedBreakdownTextCopying ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <ClipboardList className="w-4 h-4" />}
                              <span className="sr-only sm:not-sr-only">Texto</span>
                            </button>
                            <button onClick={() => setIsDetailedBreakdownExpanded(!isDetailedBreakdownExpanded)} className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm copy-button-ignore" title="Ampliar">
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleCopyDetailedBreakdownImage('full')} disabled={!!isDetailedBreakdownCopying} className={cn('flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm border copy-button-ignore', isDetailedBreakdownCopying === 'full' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100')} title="Copiar como imagen completa">
                              {isDetailedBreakdownCopying === 'full' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleDownloadDetailedBreakdownImage()} className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm copy-button-ignore" title="Descargar imagen completa">
                              <UploadCloud className="w-4 h-4 rotate-180" />
                            </button>
                            {raceTeams.length > 12 && (
                              <div className="flex border-l border-neutral-200 pl-2 gap-1.5 ml-1">
                                <button 
                                  onClick={() => handleCopyDetailedBreakdownImage('first')} 
                                  disabled={!!isDetailedBreakdownCopying}
                                  className={cn(
                                    "px-2.5 py-1 text-[10px] font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all copy-button-ignore",
                                    isDetailedBreakdownCopying === 'first' ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                    (isDetailedBreakdownCopying && isDetailedBreakdownCopying !== 'first') && "opacity-50 cursor-not-allowed"
                                  )}
                                  title="Copiar equipos 1-12"
                                >
                                  {isDetailedBreakdownCopying === 'first' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  1-12
                                </button>
                                <button 
                                  onClick={() => handleCopyDetailedBreakdownImage('second')} 
                                  disabled={!!isDetailedBreakdownCopying}
                                  className={cn(
                                    "px-2.5 py-1 text-[10px] font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all copy-button-ignore",
                                    isDetailedBreakdownCopying === 'second' ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                    (isDetailedBreakdownCopying && isDetailedBreakdownCopying !== 'second') && "opacity-50 cursor-not-allowed"
                                  )}
                                  title="Copiar equipos 13-24"
                                >
                                  {isDetailedBreakdownCopying === 'second' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  13-24
                                </button>
                                {raceTeams.length > 24 && (
                                  <button 
                                    onClick={() => handleCopyDetailedBreakdownImage('third')} 
                                    disabled={!!isDetailedBreakdownCopying}
                                    className={cn(
                                      "px-2.5 py-1 text-[10px] font-semibold rounded-md border shadow-sm flex items-center gap-1.5 transition-all copy-button-ignore",
                                      isDetailedBreakdownCopying === 'third' ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900",
                                      (isDetailedBreakdownCopying && isDetailedBreakdownCopying !== 'third') && "opacity-50 cursor-not-allowed"
                                    )}
                                    title="Copiar equipos 25+"
                                  >
                                    {isDetailedBreakdownCopying === 'third' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    25+
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div id="detailed-team-breakdown" ref={detailedBreakdownRef} className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-2 -mx-2 rounded-xl", isDetailedBreakdownExpanded ? "fixed inset-4 z-50 overflow-auto p-6 shadow-2xl m-0" : "")}>
                          {isDetailedBreakdownExpanded && (
                            <button onClick={() => setIsDetailedBreakdownExpanded(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore">
                              <X className="w-6 h-6" />
                            </button>
                          )}
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

                            if (sortedCyclists.length === 0) return null;

                            return (
                              <div key={team.jugador} className="team-card-breakdown bg-neutral-50 rounded-lg p-3 border border-neutral-200 flex flex-col h-full min-w-[240px]">
                                <div className="flex justify-between items-center mb-2 border-b border-neutral-200 pb-1.5 gap-4">
                                  <span className="font-bold text-neutral-900 text-[13px] whitespace-nowrap">
                                    {team.nombreEquipo} [#{team.orden}]
                                  </span>
                                  <span className="font-mono font-bold text-blue-600 text-sm whitespace-nowrap">{team.totalPoints} pts</span>
                                </div>
                                <div className="space-y-1.5 flex-1">
                                  {sortedCyclists.map(([ciclista, data], idx) => (
                                    <div key={idx} className="bg-white p-2 rounded border border-neutral-100 shadow-sm">
                                      <div className="flex justify-between items-center mb-1 gap-2">
                                        <span className="font-bold text-neutral-800 text-[11px] whitespace-nowrap overflow-hidden text-ellipsis">
                                          {ciclista} &lt;{data.ronda}&gt;
                                        </span>
                                        <span className={cn("font-mono font-bold px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap shrink-0", data.total > 0 ? "text-green-700 bg-green-50" : "text-neutral-400 bg-neutral-50")}>
                                          {data.total > 0 ? `+${data.total}` : '0'}
                                        </span>
                                      </div>
                                      <div className="space-y-0.5">
                                        {data.concepts.filter(c => c.puntosObtenidos > 0).map((c, cIdx) => (
                                          <div key={cIdx} className="flex justify-between items-center text-[9px] text-neutral-500 pl-1.5 border-l border-neutral-200 gap-2">
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                              {c.tipoResultado} {c.posicion ? `(Pos ${c.posicion.toString().replace(/^p/i, '')})` : ''}
                                            </span>
                                            <span className="font-mono whitespace-nowrap shrink-0">{c.puntosObtenidos > 0 ? `+${c.puntosObtenidos}` : '0'}</span>
                                          </div>
                                        ))}
                                      </div>
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
                      puntosPorDia: metadata.diasCompeticion > 0 ? (puntos / metadata.diasCompeticion).toFixed(1) : '0.0',
                      pointsPct: (teamPlayer?.puntos || 0) > 0 ? (puntos / teamPlayer!.puntos) * 100 : 0
                    };
                  }).sort((a, b) => {
                    let valA: any, valB: any;
                    switch (teamCyclistsSortColumn) {
                      case 'ronda': valA = a.ronda; valB = b.ronda; break;
                      case 'ciclista': valA = a.ciclista; valB = b.ciclista; break;
                      case 'edad': valA = a.edad === '-' ? 0 : parseInt(a.edad); valB = b.edad === '-' ? 0 : parseInt(b.edad); break;
                      case 'pais': valA = a.pais; valB = b.pais; break;
                      case 'equipo': valA = a.equipoBreve; valB = b.equipoBreve; break;
                      case 'puntos': valA = a.puntos; valB = b.puntos; break;
                      case 'victorias': valA = a.victorias; valB = b.victorias; break;
                      case 'carreras': valA = a.carrerasDisputadas; valB = b.carrerasDisputadas; break;
                      case 'dias': valA = a.diasCompeticion; valB = b.diasCompeticion; break;
                      case 'ppc': valA = parseFloat(a.puntosPorCarrera); valB = parseFloat(b.puntosPorCarrera); break;
                      case 'ppd': valA = parseFloat(a.puntosPorDia); valB = parseFloat(b.puntosPorDia); break;
                      case 'pct': valA = a.pointsPct; valB = b.pointsPct; break;
                      default: valA = a.puntos; valB = b.puntos; break;
                    }

                    if (typeof valA === 'string' && typeof valB === 'string') {
                      return teamCyclistsSortDirection === 'asc' 
                        ? valA.localeCompare(valB) 
                        : valB.localeCompare(valA);
                    }
                    
                    if (valA < valB) return teamCyclistsSortDirection === 'asc' ? -1 : 1;
                    if (valA > valB) return teamCyclistsSortDirection === 'asc' ? 1 : -1;
                    return 0;
                  });

                  // Calculate max/min values for conditional formatting
                  const maxVict = Math.max(...cyclistStats.map(c => c.victorias));
                  const minVict = Math.min(...cyclistStats.map(c => c.victorias));
                  const maxCarr = Math.max(...cyclistStats.map(c => c.carrerasDisputadas));
                  const minCarr = Math.min(...cyclistStats.map(c => c.carrerasDisputadas));
                  const maxDias = Math.max(...cyclistStats.map(c => c.diasCompeticion));
                  const minDias = Math.min(...cyclistStats.map(c => c.diasCompeticion));
                  const maxPpc = Math.max(...cyclistStats.map(c => parseFloat(c.puntosPorCarrera)));
                  const minPpc = Math.min(...cyclistStats.map(c => parseFloat(c.puntosPorCarrera)));
                  const maxPpd = Math.max(...cyclistStats.map(c => parseFloat(c.puntosPorDia)));
                  const minPpd = Math.min(...cyclistStats.map(c => parseFloat(c.puntosPorDia)));
                  const maxPct = Math.max(...cyclistStats.map(c => c.pointsPct));
                  const maxPoints = Math.max(...cyclistStats.map(c => c.puntos));
                  const minPoints = Math.min(...cyclistStats.map(c => c.puntos));
                  const unscoredCount = cyclistStats.filter(c => c.puntos === 0).length;

                  const getStatColor = (val: number, max: number, min: number, zeroIsRed: boolean = true, onlyMax: boolean = false) => {
                    if (!onlyMax && zeroIsRed && val === 0) return "text-red-600 font-bold";
                    if (val === max && max > 0) return "text-green-600 font-bold";
                    if (!onlyMax && val === min && min < max) return "text-yellow-600 font-bold";
                    return "text-neutral-600";
                  };

                  const getPointsBg = (puntos: number) => {
                    if (puntos === 0) return 'transparent';
                    if (maxPoints === minPoints) return 'rgba(34, 197, 94, 0.1)';
                    const ratio = (puntos - minPoints) / (maxPoints - minPoints);
                    return `rgba(34, 197, 94, ${0.05 + ratio * 0.2})`; // Light green scale
                  };

                  return (
                    <div className="space-y-4">
                      <div className="flex justify-end mb-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={handleCopyTeamGlobalImage}
                            className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                            title="Copiar imagen"
                          >
                            {isTeamGlobalCopying ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            Copiar Imagen
                          </button>
                          <button 
                            onClick={handleDownloadTeamGlobalImage}
                            className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                            title="Descargar"
                          >
                            <UploadCloud className="w-4 h-4" />
                            Descargar
                          </button>
                        </div>
                      </div>
                      <div ref={teamGlobalRef} className="space-y-8 bg-white p-6 -mx-6 -mt-6 sm:mx-0 sm:mt-0 sm:p-6 sm:bg-white sm:border sm:border-neutral-200 sm:shadow-sm rounded-2xl">
                        {/* Title for image */}
                        <div className="text-center mb-2">
                          <h2 className="text-2xl font-bold text-neutral-900">{selectedTeam}</h2>
                          <p className="text-sm text-neutral-500">Resumen de la temporada</p>
                        </div>
                        {/* KPIs */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
                            <Trophy className="w-4 h-4 text-blue-600 mb-1 shrink-0" />
                            <p className="text-[8px] font-medium text-blue-600 uppercase tracking-tight leading-tight mb-1 text-center">Puntos</p>
                            <p className="text-xl font-bold text-neutral-900 leading-none text-center">{teamPlayer?.puntos || 0}</p>
                          </div>
                          
                          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
                            <Medal className="w-4 h-4 text-yellow-500 mb-1 shrink-0" />
                            <p className="text-[8px] font-medium text-yellow-600 uppercase tracking-tight leading-tight mb-1 text-center">Victorias</p>
                            <p className="text-xl font-bold text-neutral-900 leading-none text-center">{teamWins}</p>
                          </div>
                          
                          <div className="bg-green-50 border border-green-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
                            <Users className="w-4 h-4 text-green-600 mb-1 shrink-0" />
                            <p className="text-[8px] font-medium text-green-600 uppercase tracking-tight leading-tight mb-1 text-center">Edad Media</p>
                            <p className="text-xl font-bold text-neutral-900 leading-none text-center">{avgAge}</p>
                          </div>
                          
                          <div className="bg-red-50 border border-red-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
                            <UserMinus className="w-4 h-4 text-red-600 mb-1 shrink-0" />
                            <p className="text-[8px] font-medium text-red-600 uppercase tracking-tight leading-tight mb-1 text-center">Sin puntuar</p>
                            <p className="text-xl font-bold text-neutral-900 leading-none text-center">{unscoredCount}</p>
                          </div>

                          <div className="bg-purple-50 border border-purple-100 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]">
                            <LayoutGrid className="w-4 h-4 text-purple-600 mb-1 shrink-0" />
                            <p className="text-[8px] font-medium text-purple-600 uppercase tracking-tight leading-tight mb-1 text-center">Puesto</p>
                            <p className="text-xl font-bold text-neutral-900 leading-none text-center">{currentPuesto}</p>
                          </div>

                          <div className={cn(
                            "border rounded-xl p-2 shadow-sm flex flex-col items-center justify-center min-h-[64px]",
                            difConOrden > 0 ? "bg-green-50 border-green-100" : 
                            difConOrden === 0 ? "bg-yellow-50 border-yellow-100" : 
                            "bg-red-50 border-red-100"
                          )}>
                            <ArrowUpRight className={cn(
                              "w-4 h-4 mb-1 shrink-0",
                              difConOrden > 0 ? "text-green-600" : 
                              difConOrden === 0 ? "text-yellow-600" : 
                              "text-red-600"
                            )} />
                            <p className={cn(
                              "text-[8px] font-medium uppercase tracking-tight leading-tight mb-1 text-center",
                              difConOrden > 0 ? "text-green-600" : 
                              difConOrden === 0 ? "text-yellow-600" : 
                              "text-red-600"
                            )}>Dif orden</p>
                            <p className={cn(
                              "text-xl font-bold leading-none text-center",
                              difConOrden > 0 ? "text-green-700" : 
                              difConOrden === 0 ? "text-yellow-700" : 
                              "text-red-700"
                            )}>
                              {difConOrden > 0 ? `+${difConOrden}` : difConOrden}
                            </p>
                          </div>
                        </div>

                      {/* Cyclists Table */}
                      <div>
                      {/* Sala de Trofeos */}
                      <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 mb-6">
                        <h3 className="text-xs font-bold text-neutral-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                          <Trophy className="w-3 h-3 text-yellow-500" />
                          Sala de Trofeos ({teamWins})
                        </h3>
                        {teamWins > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(raceWinners)
                              .filter(([_, winner]) => winner === selectedTeam)
                              .map(([race]) => {
                                // Sum points for all cyclists of the team in this specific race
                                const points = teamPlayer?.detalles
                                  .filter(d => d.carrera === race)
                                  .reduce((sum, d) => sum + d.puntosObtenidos, 0) || 0;
                                
                                // Calculate total points for the race category to determine importance
                                const raceData = files.carreras.data?.find(r => getVal(r, 'Carrera') === race);
                                const category = raceData ? getVal(raceData, 'Categoría') : null;
                                const totalRacePoints = category ? files.puntos.data?.filter(p => getVal(p, 'Categoría') === category)
                                  .reduce((sum, p) => sum + (parseInt(getVal(p, 'Puntos')) || 0), 0) || 0 : 0;
                                  
                                return { race, points, totalRacePoints };
                              })
                              .sort((a, b) => b.totalRacePoints - a.totalRacePoints)
                              .map(({ race, points }) => (
                                <div key={race} className="bg-white border border-neutral-200 rounded-lg px-3 py-2 flex items-center gap-2.5 shadow-sm">
                                  <Trophy className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                                  <span className="text-xs font-medium text-neutral-800 whitespace-nowrap">{race}</span>
                                  <span className="text-xs font-bold text-blue-600 flex-shrink-0 whitespace-nowrap">{points} pts</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-400 italic">Aún no hay victorias...</p>
                        )}
                      </div>

                        <h3 className="font-semibold text-xl text-neutral-900 border-b pb-3 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Plantilla del Equipo
                        </h3>
                        <div className="table-container-for-capture bg-white border border-neutral-200 rounded-xl overflow-x-auto max-h-[75vh] overflow-y-auto shadow-sm flex justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          <table className="w-auto text-xs text-left whitespace-nowrap border-collapse mx-auto">
                            <thead className="bg-[#1e293b] text-white border-b border-neutral-100 text-[9px] tracking-tight uppercase font-bold sticky top-0 z-10">
                              <tr>
                                <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-700 select-none transition-colors" title="Ronda de elección" onClick={() => { if (teamCyclistsSortColumn === 'ronda') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('ronda'); setTeamCyclistsSortDirection('asc'); } }}>
                                  <div className="flex items-center justify-center gap-1">Rnd {teamCyclistsSortColumn === 'ronda' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                                <th className="px-3 py-2 font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => { if (teamCyclistsSortColumn === 'ciclista') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('ciclista'); setTeamCyclistsSortDirection('asc'); } }}>
                                  <div className="flex items-center gap-1">Ciclista {teamCyclistsSortColumn === 'ciclista' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                                <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => { if (teamCyclistsSortColumn === 'edad') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('edad'); setTeamCyclistsSortDirection('asc'); } }}>
                                  <div className="flex items-center justify-center gap-1">Ed. {teamCyclistsSortColumn === 'edad' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                                <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => { if (teamCyclistsSortColumn === 'pais') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('pais'); setTeamCyclistsSortDirection('asc'); } }}>
                                  <div className="flex items-center justify-center gap-1">País {teamCyclistsSortColumn === 'pais' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                                <th className="px-3 py-2 font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => { if (teamCyclistsSortColumn === 'equipo') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('equipo'); setTeamCyclistsSortDirection('asc'); } }}>
                                  <div className="flex items-center gap-1">Equipo {teamCyclistsSortColumn === 'equipo' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                                <th className="px-2 py-2 text-right font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => { if (teamCyclistsSortColumn === 'puntos') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('puntos'); setTeamCyclistsSortDirection('desc'); } }}>
                                  <div className="flex items-center justify-end gap-1">Pts {teamCyclistsSortColumn === 'puntos' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                                <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => { if (teamCyclistsSortColumn === 'victorias') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('victorias'); setTeamCyclistsSortDirection('desc'); } }}>
                                  <div className="flex items-center justify-center gap-1">V. {teamCyclistsSortColumn === 'victorias' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                                <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => { if (teamCyclistsSortColumn === 'carreras') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('carreras'); setTeamCyclistsSortDirection('desc'); } }}>
                                  <div className="flex items-center justify-center gap-1">C. {teamCyclistsSortColumn === 'carreras' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                                <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => { if (teamCyclistsSortColumn === 'dias') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('dias'); setTeamCyclistsSortDirection('desc'); } }}>
                                  <div className="flex items-center justify-center gap-1">D. {teamCyclistsSortColumn === 'dias' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                                <th className="px-2 py-2 text-right font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" title="Puntos por carrera disputada" onClick={() => { if (teamCyclistsSortColumn === 'ppc') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('ppc'); setTeamCyclistsSortDirection('desc'); } }}>
                                  <div className="flex items-center justify-end gap-1">P/C {teamCyclistsSortColumn === 'ppc' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                                <th className="px-2 py-2 text-right font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" title="Puntos por día de competición" onClick={() => { if (teamCyclistsSortColumn === 'ppd') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('ppd'); setTeamCyclistsSortDirection('asc'); } }}>
                                  <div className="flex items-center justify-end gap-1">P/D {teamCyclistsSortColumn === 'ppd' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                                <th className="px-2 py-2 text-right font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" title="% de puntos sobre el total del equipo" onClick={() => { if (teamCyclistsSortColumn === 'pct') { setTeamCyclistsSortDirection(d => d === 'asc' ? 'desc' : 'asc'); } else { setTeamCyclistsSortColumn('pct'); setTeamCyclistsSortDirection('desc'); } }}>
                                  <div className="flex items-center justify-end gap-1">% {teamCyclistsSortColumn === 'pct' && (teamCyclistsSortDirection === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</div>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {cyclistStats.map((c, idx) => (
                                <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                  <td className={cn(
                                    "px-2 py-1.5 text-center font-mono text-[10px]",
                                    ["01", "02", "03", "1", "2", "3"].includes(c.ronda) ? "bg-yellow-50 text-yellow-700 font-bold" : "text-neutral-500"
                                  )}>
                                    {c.ronda}
                                  </td>
                                  <td className="px-3 py-1.5 font-bold text-neutral-900 text-[11px]">
                                    {c.ciclista}
                                  </td>
                                  <td className="px-2 py-1.5 text-center text-neutral-600 text-[10px]">{c.edad}</td>
                                  <td className="px-2 py-1.5 text-center text-neutral-600 text-[10px]">{c.pais}</td>
                                  <td className="px-3 py-1.5 text-neutral-600 text-[9px]">{c.equipoBreve}</td>
                                  <td 
                                    className={cn(
                                      "px-2 py-1.5 text-right font-bold text-[10px]",
                                      c.puntos === 0 ? "text-red-600" : "text-blue-600"
                                    )}
                                    style={{ backgroundColor: getPointsBg(c.puntos) }}
                                  >
                                    {c.puntos}
                                  </td>
                                  <td className={cn("px-2 py-1.5 text-center text-[10px]", getStatColor(c.victorias, maxVict, minVict))}>
                                    {c.victorias}
                                  </td>
                                  <td className={cn("px-2 py-1.5 text-center text-[10px]", getStatColor(c.carrerasDisputadas, maxCarr, minCarr))}>
                                    {c.carrerasDisputadas}
                                  </td>
                                  <td className={cn("px-2 py-1.5 text-center text-[10px]", getStatColor(c.diasCompeticion, maxDias, minDias))}>
                                    {c.diasCompeticion}
                                  </td>
                                  <td className={cn("px-2 py-1.5 text-right font-mono text-[10px]", getStatColor(parseFloat(c.puntosPorCarrera), maxPpc, minPpc, false, true))}>
                                    {c.puntosPorCarrera}
                                  </td>
                                  <td className={cn("px-2 py-1.5 text-right font-mono text-[10px]", getStatColor(parseFloat(c.puntosPorDia), maxPpd, minPpd, false, true))}>
                                    {c.puntosPorDia}
                                  </td>
                                  <td className={cn("px-2 py-1.5 text-right font-mono text-[10px]", getStatColor(c.pointsPct, maxPct, 0, false, true))}>
                                    {c.pointsPct.toFixed(1)}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 min-h-[600px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b pb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Startlists por Carrera</h2>
                    <p className="text-sm text-neutral-500 mt-1">Consulta los ciclistas de la liga participantes en cada carrera.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <List className="w-5 h-5 text-blue-600 hidden md:block" />
                    {Array.isArray(files.startlist.data) && files.startlist.data.length > 0 && (
                      <select 
                        value={publicStartlistRace}
                        onChange={(e) => setPublicStartlistRace(e.target.value)}
                        className="pl-3 pr-8 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">-- Selecciona carrera --</option>
                        {files.startlist.data.filter(sl => sl && sl.carrera).map((sl: any, idx: number) => (
                          <option key={idx} value={sl.carrera}>{sl.carrera}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {(!Array.isArray(files.startlist.data) || files.startlist.data.length === 0) ? (
                  <div className="text-center py-20 text-neutral-500 italic">
                    No hay startlists cargadas actualmente.
                  </div>
                ) : !publicStartlistRace ? (
                  <div className="text-center py-20 text-neutral-500 flex flex-col items-center gap-4">
                    <List className="w-12 h-12 text-blue-200" />
                    <p>Selecciona una carrera en el menú superior para ver los participantes.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const selectedData = files.startlist.data.find(d => d.carrera === publicStartlistRace);
                      if (!selectedData) return null;

                      let rows: any[] = [];
                      selectedData.resultados.forEach((res: any) => {
                        res.ciclistas.forEach((c: any) => {
                          const nombre = typeof c === 'string' ? c : c.nombre;
                          const dorsal = typeof c === 'string' ? '' : c.dorsal;
                          
                          const jugador = res.jugador;
                          const equipoManger = playerTeamMap[jugador] || jugador;
                          const order = playerOrderMap[jugador] || '99';
                          const equipoOrdered = `${equipoManger} [#${order}]`;
                          const ronda = cyclistRoundMap[nombre] || '';
                          const meta = cyclistMetadata[nombre] || {};

                          const totalPuntos = meta.puntosTotales || 0;
                          const carreraPuntos = meta.puntosPorCarrera?.[publicStartlistRace] || 0;
                          const displayPuntos = totalPuntos - carreraPuntos;
                          const dias = meta.diasCompeticion || 0;
                          const debut = dias === 0 ? 'Sí' : '';

                          rows.push({
                            jugador: equipoOrdered,
                            jugadorName: jugador,
                            dorsal: dorsal || '',
                            ciclista: nombre,
                            ronda: ronda,
                            pais: meta.pais || '',
                            equipo: meta.equipoBreve || '',
                            dias,
                            puntos: displayPuntos,
                            debut
                          });
                        });
                      });

                      const uniquePlayersInStartlist = [...new Set(rows.map(r => r.jugadorName))].sort((a, b) => a.localeCompare(b));

                      let filteredRows = startlistPlayerFilter === 'all' 
                        ? rows 
                        : rows.filter(r => r.jugadorName === startlistPlayerFilter);

                      const nonZeroPoints = filteredRows.map(r => r.puntos).filter(p => p > 0);
                      const maxP = nonZeroPoints.length > 0 ? Math.max(...nonZeroPoints) : 0;
                      const minP = nonZeroPoints.length > 0 ? Math.min(...nonZeroPoints) : 0;

                      const getPointsColor = (p: number) => {
                        if (p === 0) return 'bg-red-100 text-red-700';
                        if (maxP === minP) return 'bg-emerald-50 text-emerald-700';
                        const ratio = (p - minP) / (maxP - minP);
                        // Shift from yellow to green
                        // yellow: 255, 255, 0 -> emerald/green: 0, 128, 0 roughly
                        // Let's use Tailwind's classes or dynamic style
                        if (ratio > 0.8) return 'bg-emerald-200 text-emerald-900';
                        if (ratio > 0.6) return 'bg-emerald-100 text-emerald-800';
                        if (ratio > 0.4) return 'bg-yellow-100 text-yellow-800';
                        if (ratio > 0.2) return 'bg-yellow-50 text-yellow-700';
                        return 'bg-yellow-100 text-yellow-800';
                      };

                      filteredRows.sort((a, b) => {
                        let aVal: any = '';
                        let bVal: any = '';

                        if (startlistSortColumn === 'jugador') {
                           aVal = a.jugador; bVal = b.jugador;
                        } else if (startlistSortColumn === 'dorsal') {
                           aVal = parseInt(a.dorsal) || 9999; bVal = parseInt(b.dorsal) || 9999;
                        } else if (startlistSortColumn === 'ciclista') {
                           aVal = a.ciclista; bVal = b.ciclista;
                        } else if (startlistSortColumn === 'ronda') {
                           aVal = parseInt(a.ronda) || 99; bVal = parseInt(b.ronda) || 99;
                        } else if (startlistSortColumn === 'pais') {
                           aVal = a.pais; bVal = b.pais;
                        } else if (startlistSortColumn === 'equipo') {
                           aVal = a.equipo; bVal = b.equipo;
                        } else if (startlistSortColumn === 'dias') {
                           aVal = a.dias; bVal = b.dias;
                        } else if (startlistSortColumn === 'puntos') {
                           aVal = a.puntos; bVal = b.puntos;
                        }

                        if (aVal < bVal) return startlistSortDirection === 'asc' ? -1 : 1;
                        if (aVal > bVal) return startlistSortDirection === 'asc' ? 1 : -1;
                        return 0;
                      });

                      const handleSort = (col: string) => {
                        if (startlistSortColumn === col) {
                          setStartlistSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                        } else {
                          setStartlistSortColumn(col);
                          setStartlistSortDirection('asc');
                        }
                      };

                      return (
                        <div className="flex flex-col space-y-4">
                           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                             <div className="flex items-center gap-3">
                               <label className="text-sm font-medium text-neutral-700 whitespace-nowrap">Filtrar por Equipo:</label>
                               <select
                                 value={startlistPlayerFilter}
                                 onChange={(e) => setStartlistPlayerFilter(e.target.value)}
                                 className="pl-3 pr-8 py-1.5 bg-white border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                               >
                                 <option value="all">Todos los Equipos ({uniquePlayersInStartlist.length})</option>
                                 {uniquePlayersInStartlist.map((p, idx) => {
                                   const equipoName = playerTeamMap[p] || p;
                                   return <option key={idx} value={p}>{equipoName}</option>;
                                 })}
                               </select>
                             </div>
                             
                             <div className="flex items-center gap-2">
                               <button onClick={async () => {
                                 if (!startlistTableRef.current) return;
                                 try {
                                   if (typeof ClipboardItem !== 'undefined') {
                                     const clipboardItem = new ClipboardItem({
                                       'image/png': (async () => {
                                         const dataUrl = await domToDataUrl(startlistTableRef.current!, { scale: 2 });
                                         return await (await fetch(dataUrl)).blob();
                                       })()
                                     });
                                     await navigator.clipboard.write([clipboardItem]);
                                     /* Alert suppressed to improve user experience in iframe */
                                   } else {
                                     alert('Copiar imagen no está soportado en este navegador.');
                                   }
                                 } catch (err) {
                                   console.error(err);
                                 }
                               }} className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Copiar como imagen">
                                <Copy className="w-4 h-4" />
                               </button>
                               <button onClick={async () => {
                                 if (!startlistTableRef.current) return;
                                 try {
                                   const dataUrl = await domToDataUrl(startlistTableRef.current, { scale: 2 });
                                   const link = document.createElement('a');
                                   link.href = dataUrl;
                                   link.download = `Startlist_${publicStartlistRace}.png`;
                                   link.click();
                                 } catch (err) {
                                   console.error(err);
                                 }
                               }} className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
                                Descargar Imagen
                               </button>
                             </div>
                           </div>
                           
                           <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm bg-white" ref={startlistTableRef}>
                             <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
                               <table className="w-full text-sm text-left">
                                 <thead className="bg-[#1e293b] text-white border-b border-neutral-200 sticky top-0 z-10">
                                   <tr>
                                     <th className="px-3 py-3 font-semibold cursor-pointer select-none group whitespace-nowrap" onClick={() => handleSort('jugador')}>
                                       <div className="flex items-center gap-1">Nombre_Equipo [#Orden] <ArrowUpRight className={cn("w-3 h-3 transition-transform", startlistSortColumn === 'jugador' ? (startlistSortDirection === 'asc' ? "rotate-45" : "rotate-135") : "opacity-0")} /></div>
                                     </th>
                                     <th className="px-3 py-3 font-semibold cursor-pointer select-none group whitespace-nowrap" onClick={() => handleSort('dorsal')}>
                                       <div className="flex items-center gap-1">Dorsal <ArrowUpRight className={cn("w-3 h-3 transition-transform", startlistSortColumn === 'dorsal' ? (startlistSortDirection === 'asc' ? "rotate-45" : "rotate-135") : "opacity-0")} /></div>
                                     </th>
                                     <th className="px-3 py-3 font-semibold cursor-pointer select-none group whitespace-nowrap" onClick={() => handleSort('ciclista')}>
                                       <div className="flex items-center gap-1">Ciclista &lt;Ronda&gt; <ArrowUpRight className={cn("w-3 h-3 transition-transform", startlistSortColumn === 'ciclista' ? (startlistSortDirection === 'asc' ? "rotate-45" : "rotate-135") : "opacity-0")} /></div>
                                     </th>
                                     <th className="px-3 py-3 font-semibold cursor-pointer select-none group whitespace-nowrap" onClick={() => handleSort('pais')}>
                                       <div className="flex items-center gap-1">País <ArrowUpRight className={cn("w-3 h-3 transition-transform", startlistSortColumn === 'pais' ? (startlistSortDirection === 'asc' ? "rotate-45" : "rotate-135") : "opacity-0")} /></div>
                                     </th>
                                     <th className="px-3 py-3 font-semibold cursor-pointer select-none group whitespace-nowrap" onClick={() => handleSort('equipo')}>
                                       <div className="flex items-center gap-1">Equipo <ArrowUpRight className={cn("w-3 h-3 transition-transform", startlistSortColumn === 'equipo' ? (startlistSortDirection === 'asc' ? "rotate-45" : "rotate-135") : "opacity-0")} /></div>
                                     </th>
                                     <th className="px-3 py-3 font-semibold whitespace-nowrap">Debut</th>
                                     <th className="px-3 py-3 font-semibold cursor-pointer select-none group whitespace-nowrap" onClick={() => handleSort('dias')}>
                                       <div className="flex items-center gap-1">Días <ArrowUpRight className={cn("w-3 h-3 transition-transform", startlistSortColumn === 'dias' ? (startlistSortDirection === 'asc' ? "rotate-45" : "rotate-135") : "opacity-0")} /></div>
                                     </th>
                                     <th className="px-3 py-3 font-semibold cursor-pointer select-none group whitespace-nowrap" onClick={() => handleSort('puntos')}>
                                       <div className="flex items-center gap-1">Puntos <ArrowUpRight className={cn("w-3 h-3 transition-transform", startlistSortColumn === 'puntos' ? (startlistSortDirection === 'asc' ? "rotate-45" : "rotate-135") : "opacity-0")} /></div>
                                     </th>
                                   </tr>
                                 </thead>
                                 <tbody className="divide-y divide-neutral-100">
                                   {filteredRows.map((r, i) => (
                                     <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                                       <td className="px-3 py-2 font-medium">{r.jugador}</td>
                                       <td className="px-3 py-2 text-neutral-500 font-mono text-xs">{r.dorsal}</td>
                                       <td className="px-3 py-2">
                                         {r.ciclista} <span className="text-neutral-400 text-xs ml-1">&lt;{r.ronda}&gt;</span>
                                       </td>
                                       <td className="px-3 py-2 text-center text-lg leading-none" title={r.pais}>{r.pais}</td>
                                       <td className="px-3 py-2 text-neutral-600 text-xs">{r.equipo}</td>
                                       <td className={cn("px-3 py-2 text-center font-bold text-xs", r.debut === 'Sí' ? "bg-yellow-200 text-yellow-900" : "")}>{r.debut}</td>
                                       <td className={cn("px-3 py-2 text-center font-mono text-xs", r.dias === 0 ? "bg-red-200 text-red-900" : "")}>{r.dias}</td>
                                       <td className={cn("px-3 py-2 text-right font-mono text-xs font-bold", getPointsColor(r.puntos))}>{r.puntos}</td>
                                     </tr>
                                   ))}
                                 </tbody>
                               </table>
                             </div>
                           </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {publicTab === 'draft' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Draft 2026</h2>
                    <p className="text-sm text-neutral-500 mt-1">Información y resultados del draft.</p>
                  </div>
                  <div className="flex bg-neutral-100 p-1 rounded-lg self-start">
                    <button
                      onClick={() => setDraftSubTab('elecciones')}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all",
                        draftSubTab === 'elecciones' ? "bg-white text-blue-600 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
                      )}
                    >
                      Elecciones
                    </button>
                    <button
                      onClick={() => setDraftSubTab('datos')}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all",
                        draftSubTab === 'datos' ? "bg-white text-blue-600 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
                      )}
                    >
                      Datos
                    </button>
                  </div>
                </div>

                {draftSubTab === 'elecciones' && (
                  <div className="space-y-6">
                    {!files.elecciones.data ? (
                      <div className="text-center py-20 text-neutral-500 italic">
                        No hay datos del draft cargados.
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <div className="relative flex-1 sm:w-64">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                              <input
                                type="text"
                                placeholder="Buscar ciclista..."
                                value={draftSearchTerm}
                                onChange={(e) => setDraftSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                              />
                            </div>
                            <div className="relative">
                              <button 
                                onClick={() => {
                                  setIsDraftRoundFilterOpen(!isDraftRoundFilterOpen);
                                  setIsDraftTeamFilterOpen(false);
                                }}
                                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[140px] justify-between cursor-pointer"
                              >
                                <span className="text-neutral-700">
                                  {draftRoundFilter.length === 0 
                                    ? 'Todas las rondas' 
                                    : `${draftRoundFilter.length} rondas`}
                                </span>
                                <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isDraftRoundFilterOpen && "rotate-180")} />
                              </button>

                              {isDraftRoundFilterOpen && (
                                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                                  <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Rondas</span>
                                    {draftRoundFilter.length > 0 && (
                                      <button 
                                        onClick={() => setDraftRoundFilter([])}
                                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                                      >
                                        Limpiar
                                      </button>
                                    )}
                                  </div>
                                  <div className="max-h-60 overflow-y-auto">
                                    {Array.from(new Set(files.elecciones.data.map(d => String(getVal(d, 'Ronda'))).filter(Boolean)))
                                      .sort((a, b) => parseInt(a as string) - parseInt(b as string))
                                      .map(ronda => (
                                        <label key={ronda} className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                                            checked={draftRoundFilter.includes(ronda)}
                                            onChange={() => {
                                              if (draftRoundFilter.includes(ronda)) {
                                                setDraftRoundFilter(draftRoundFilter.filter(r => r !== ronda));
                                              } else {
                                                setDraftRoundFilter([...draftRoundFilter, ronda]);
                                              }
                                            }}
                                          />
                                          <span className="text-sm text-neutral-700">Ronda {ronda}</span>
                                        </label>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <button 
                                onClick={() => {
                                  setIsDraftTeamFilterOpen(!isDraftTeamFilterOpen);
                                  setIsDraftRoundFilterOpen(false);
                                }}
                                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center gap-2 min-w-[160px] justify-between cursor-pointer"
                              >
                                <span className="text-neutral-700">
                                  {draftTeamFilter.length === 0 
                                    ? 'Todos los equipos' 
                                    : `${draftTeamFilter.length} equipos`}
                                </span>
                                <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isDraftTeamFilterOpen && "rotate-180")} />
                              </button>

                              {isDraftTeamFilterOpen && (
                                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                                  <div className="px-3 py-1 flex justify-between items-center border-b border-neutral-100 mb-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Equipos</span>
                                    {draftTeamFilter.length > 0 && (
                                      <button 
                                        onClick={() => setDraftTeamFilter([])}
                                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                                      >
                                        Limpiar
                                      </button>
                                    )}
                                  </div>
                                  <div className="max-h-60 overflow-y-auto">
                                    {Array.from(new Set(files.elecciones.data.map(d => String(getVal(d, 'Nombre_Equipo') || getVal(d, 'Nombre_TG'))).filter(Boolean)))
                                      .sort()
                                      .map(team => (
                                        <label key={team} className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500/20"
                                            checked={draftTeamFilter.includes(team)}
                                            onChange={() => {
                                              if (draftTeamFilter.includes(team)) {
                                                setDraftTeamFilter(draftTeamFilter.filter(t => t !== team));
                                              } else {
                                                setDraftTeamFilter([...draftTeamFilter, team]);
                                              }
                                            }}
                                          />
                                          <span className="text-sm text-neutral-700">{team}</span>
                                        </label>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <button onClick={() => setIsDraftTableExpanded(!isDraftTableExpanded)} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore" title="Ampliar">
                               <Maximize2 className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleCopyDraftTableImage()} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore" title="Copiar como imagen completa">
                               {isDraftTableCopying === 'full' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                             </button>
                             <button onClick={() => handleDownloadDraftTableImage()} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore" title="Descargar imagen completa">
                               <UploadCloud className="w-4 h-4" />
                             </button>
                           </div>
                        </div>

                        {(() => {
                          const filteredData = files.elecciones.data.filter(row => {
                            const matchesSearch = getVal(row, 'Ciclista')?.toLowerCase().includes(draftSearchTerm.toLowerCase());
                            const matchesRound = draftRoundFilter.length === 0 || draftRoundFilter.includes(String(getVal(row, 'Ronda')));
                            const matchesTeam = draftTeamFilter.length === 0 || draftTeamFilter.includes(String(getVal(row, 'Nombre_Equipo') || getVal(row, 'Nombre_TG')));
                            return matchesSearch && matchesRound && matchesTeam;
                          });

                          const numBlocks = Math.ceil(filteredData.length / 50);

                          return (
                            <>
                              {numBlocks > 1 && (
                                <div className="flex flex-col gap-2 mt-4 copy-button-ignore">
                                  <div className="flex items-center justify-end">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Copiar bloques de imagen ({filteredData.length} ciclistas):</span>
                                  </div>
                                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                                    {Array.from({ length: numBlocks }).map((_, i) => {
                                      const s = `p${i + 1}`;
                                      const start = i * 50 + 1;
                                      const end = Math.min((i + 1) * 50, filteredData.length);
                                      const label = `${start}-${end}`;
                                      const isCopyingThis = isDraftTableCopying === s;
                                      return (
                                        <button 
                                          key={s}
                                          onClick={() => handleCopyDraftTableImage(s as any)} 
                                          className={cn(
                                            "px-2.5 py-1 text-[10px] rounded border font-bold transition-all shadow-sm active:scale-95",
                                            isCopyingThis 
                                              ? "bg-green-600 border-green-600 text-white" 
                                              : "bg-white text-blue-600 border-neutral-200 hover:bg-blue-50 hover:text-blue-700"
                                          )}
                                          title={`Copiar bloque ${start}-${end}`}
                                        >
                                          {label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                               <div className="flex justify-center mt-4">
                                 <div ref={draftTableRef} className={cn("bg-white border border-neutral-200 rounded-xl overflow-x-auto max-h-[75vh] overflow-y-auto shadow-sm inline-block max-w-full", isDraftTableExpanded ? "fixed inset-4 z-50 max-h-none" : "")}>
                                   {isDraftTableExpanded && (
                                     <button onClick={() => setIsDraftTableExpanded(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore">
                                       <X className="w-6 h-6" />
                                     </button>
                                   )}
                                   {(() => {
                                     const draftCyclistStats: Record<string, { puntos: number, victorias: number }> = {};
                                     leaderboard?.forEach(player => {
                                       player.detalles.forEach(d => {
                                         if (!draftCyclistStats[d.ciclista]) {
                                           draftCyclistStats[d.ciclista] = { puntos: 0, victorias: 0 };
                                         }
                                         draftCyclistStats[d.ciclista].puntos += d.puntosObtenidos;
                                         
                                         const isPos01 = d.posicion === '01' || d.posicion === '1';
                                         const isValidType = [
                                           'Etapa', 
                                           'Etapa (Crono equipos)', 
                                           'Clasificación final', 
                                           'Clasificación final (Crono equipos)',
                                           'Clásica'
                                         ].includes(d.tipoResultado);
                                         
                                         if (isPos01 && isValidType) {
                                           draftCyclistStats[d.ciclista].victorias += 1;
                                         }
                                       });
                                     });
                                     
                                     const maxPuntos = Math.max(1, ...Object.values(draftCyclistStats).map(s => s.puntos));

                                     return (
                                       <table className="w-auto text-sm text-left whitespace-nowrap border-collapse mx-auto">
                                         <thead className={cn(
                                           "bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase text-[10px] tracking-wider sticky top-0 z-10"
                                         )}>
                                           <tr>
                                             {['Elección', 'Nombre_Equipo', 'Orden_Draft', 'Ronda', 'Ciclista', 'Edad', 'País', 'Eq_Comp', 'Puntos', 'Victorias'].map(col => (
                                               <th 
                                                 key={col}
                                                 className="px-4 py-3 font-semibold cursor-pointer hover:bg-neutral-100 transition-colors"
                                                 onClick={() => {
                                                   if (draftSortColumn === col) {
                                                     setDraftSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                                   } else {
                                                     setDraftSortColumn(col);
                                                     setDraftSortDirection('asc');
                                                   }
                                                 }}
                                               >
                                                 <div className="flex items-center gap-1">
                                                   {col.replace('_', ' ')}
                                                   {draftSortColumn === col && (
                                                     <span className="text-blue-600">
                                                       {draftSortDirection === 'asc' ? '↑' : '↓'}
                                                     </span>
                                                   )}
                                                 </div>
                                               </th>
                                             ))}
                                           </tr>
                                         </thead>
                                         <tbody className="divide-y divide-neutral-100">
                                           {filteredData
                                             .sort((a, b) => {
                                               if (draftSortColumn === 'Puntos') {
                                                 const ptsA = draftCyclistStats[getVal(a, 'Ciclista') || '']?.puntos || 0;
                                                 const ptsB = draftCyclistStats[getVal(b, 'Ciclista') || '']?.puntos || 0;
                                                 return draftSortDirection === 'asc' ? ptsA - ptsB : ptsB - ptsA;
                                               }
                                               
                                               if (draftSortColumn === 'Victorias') {
                                                 const vicA = draftCyclistStats[getVal(a, 'Ciclista') || '']?.victorias || 0;
                                                 const vicB = draftCyclistStats[getVal(b, 'Ciclista') || '']?.victorias || 0;
                                                 return draftSortDirection === 'asc' ? vicA - vicB : vicB - vicA;
                                               }

                                               const valA = getVal(a, draftSortColumn);
                                               const valB = getVal(b, draftSortColumn);
                                               
                                               if (!valA) return 1;
                                               if (!valB) return -1;
                                               
                                               const numA = parseFloat(valA);
                                               const numB = parseFloat(valB);
                                               
                                               if (!isNaN(numA) && !isNaN(numB)) {
                                                 return draftSortDirection === 'asc' ? numA - numB : numB - numA;
                                               }
                                               
                                               return draftSortDirection === 'asc' 
                                                 ? String(valA).localeCompare(String(valB))
                                                 : String(valB).localeCompare(String(valA));
                                             })
                                      .map((row, idx) => {
                                        const ciclista = getVal(row, 'Ciclista') || '';
                                        const stats = draftCyclistStats[ciclista] || { puntos: 0, victorias: 0 };
                                        
                                        let pointsStyle = {};
                                        if (stats.puntos === 0) {
                                          pointsStyle = { backgroundColor: '#fee2e2', color: '#b91c1c' }; // red-100, red-700
                                        } else {
                                          const ratio = stats.puntos / maxPuntos;
                                          // Hue from 45 (yellow) to 142 (green)
                                          const hue = 45 + (ratio * (142 - 45));
                                          pointsStyle = { 
                                            backgroundColor: `hsl(${hue}, 80%, 85%)`, 
                                            color: `hsl(${hue}, 90%, 25%)` 
                                          };
                                        }
                                        
                                        return (
                                          <tr key={idx} className="draft-row hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-2 font-medium text-neutral-900">{getVal(row, 'Elección')}</td>
                                            <td className="px-4 py-2">{getVal(row, 'Nombre_Equipo') || getVal(row, 'Nombre_TG')}</td>
                                            <td className="px-4 py-2 text-center">{getVal(row, 'Orden_Draft')}</td>
                                            <td className="px-4 py-2 text-center">
                                              <span className="inline-flex items-center justify-center bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-xs font-bold">
                                                {getVal(row, 'Ronda')}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 font-medium text-blue-600">{ciclista}</td>
                                            <td className="px-4 py-2 text-center">{getVal(row, 'Edad')}</td>
                                            <td className="px-4 py-2 text-center" title={getVal(row, 'País')}>
                                              <span className="text-lg">{getFlagEmoji(getVal(row, 'País'))}</span>
                                            </td>
                                            <td className="px-4 py-2 text-neutral-500">{getVal(row, 'Eq_Comp')}</td>
                                            <td className="px-4 py-2 text-right">
                                            <span 
                                              className="inline-flex items-center justify-center px-2 py-1 rounded font-bold min-w-[3rem]"
                                              style={pointsStyle}
                                            >
                                              {stats.puntos}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-center">
                                            {stats.victorias > 0 ? (
                                              <span className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">
                                                {stats.victorias}
                                              </span>
                                            ) : '-'}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                                     );
                                   })()}
                                 </div>
                               </div>
                             </>
                           );
                         })()}
                       </>
                     )}
                   </div>
                 )}
                
                {draftSubTab === 'datos' && (
                  <div className="space-y-6">
                    {!files.elecciones.data ? (
                      <div className="text-center py-20 text-neutral-500 italic">
                        No hay datos del draft cargados.
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                          <div>
                            <h3 className="font-semibold text-lg text-neutral-900">Puntos por Ronda y Equipo</h3>
                            <p className="text-xs text-neutral-500">Puntos totales conseguidos por cada elección del draft.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setIsDraftDatosTableExpanded(!isDraftDatosTableExpanded)} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore" title="Ampliar">
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button onClick={handleCopyDraftDatosTableImage} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore" title="Copiar como imagen">
                              {isDraftDatosTableCopying ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button onClick={handleDownloadDraftDatosTableImage} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore" title="Descargar imagen">
                              <UploadCloud className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div ref={draftDatosTableRef} className={cn("bg-white border border-neutral-200 rounded-xl overflow-x-auto max-h-[75vh] overflow-y-auto shadow-sm", isDraftDatosTableExpanded ? "fixed inset-4 z-50 p-6 shadow-2xl m-0 max-h-none" : "")}>
                          {isDraftDatosTableExpanded && (
                            <button onClick={() => setIsDraftDatosTableExpanded(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore">
                              <X className="w-6 h-6" />
                            </button>
                          )}
                          {(() => {
                            // 1. Pre-calculate cyclist points
                            const cyclistPoints: Record<string, number> = {};
                            leaderboard?.forEach(player => {
                              player.detalles.forEach(d => {
                                cyclistPoints[d.ciclista] = (cyclistPoints[d.ciclista] || 0) + d.puntosObtenidos;
                              });
                            });

                            // 2. Map teams, rounds and orders
                            const teamRoundData: Record<string, Record<number, number>> = {};
                            const teamOrderMap: Record<string, string> = {};
                            const teamsSet = new Set<string>();
                            
                            files.elecciones.data.forEach(row => {
                              const teamName = getVal(row, 'Nombre_Equipo') || getVal(row, 'Nombre_TG');
                              const round = parseInt(getVal(row, 'Ronda'));
                              const cyclist = getVal(row, 'Ciclista');
                              const order = getVal(row, 'Orden_Draft');
                              
                              if (teamName && !isNaN(round)) {
                                teamsSet.add(teamName);
                                if (!teamRoundData[teamName]) teamRoundData[teamName] = {};
                                teamRoundData[teamName][round] = cyclistPoints[cyclist] || 0;
                                if (order) teamOrderMap[teamName] = order;
                              }
                            });

                            const sortedTeams = Array.from(teamsSet).sort((a, b) => {
                              if (draftDatosSortColumn === 'Orden') {
                                const orderA = parseInt(teamOrderMap[a] || '0');
                                const orderB = parseInt(teamOrderMap[b] || '0');
                                return draftDatosSortDirection === 'asc' ? orderA - orderB : orderB - orderA;
                              }
                              if (draftDatosSortColumn === 'TOTAL') {
                                const totalA = rounds.reduce((sum, r) => sum + (teamRoundData[a][r] || 0), 0);
                                const totalB = rounds.reduce((sum, r) => sum + (teamRoundData[b][r] || 0), 0);
                                return draftDatosSortDirection === 'asc' ? totalA - totalB : totalB - totalA;
                              }
                              if (draftDatosSortColumn.startsWith('R')) {
                                const round = parseInt(draftDatosSortColumn.substring(1));
                                const ptsA = teamRoundData[a][round] || 0;
                                const ptsB = teamRoundData[b][round] || 0;
                                return draftDatosSortDirection === 'asc' ? ptsA - ptsB : ptsB - ptsA;
                              }
                              // Default sort by order
                              const orderA = parseInt(teamOrderMap[a] || '0');
                              const orderB = parseInt(teamOrderMap[b] || '0');
                              return orderA - orderB;
                            });
                            const rounds = Array.from({ length: 25 }, (_, i) => i + 1);

                            // 3. Calculate max and min (min > 0) per round
                            const roundStats: Record<number, { max: number, min: number }> = {};
                            rounds.forEach(r => {
                              const pointsInRound = sortedTeams.map(t => teamRoundData[t][r] || 0);
                              const positivePoints = pointsInRound.filter(p => p > 0);
                              roundStats[r] = {
                                max: Math.max(...pointsInRound),
                                min: positivePoints.length > 0 ? Math.min(...positivePoints) : 0
                              };
                            });

                            return (
                              <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
                                <thead className={cn(
                                  "bg-neutral-50 border-b border-neutral-100 text-neutral-500 uppercase text-[10px] tracking-wider sticky top-0 z-10"
                                )}>
                                  <tr>
                                    <th 
                                      className="px-4 py-3 font-bold text-neutral-900 border-r border-neutral-200 bg-neutral-50 sticky left-0 z-20 cursor-pointer hover:bg-neutral-100"
                                      onClick={() => {
                                        if (draftDatosSortColumn === 'Orden') {
                                          setDraftDatosSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                        } else {
                                          setDraftDatosSortColumn('Orden');
                                          setDraftDatosSortDirection('asc');
                                        }
                                      }}
                                    >
                                      <div className="flex items-center gap-1">
                                        Equipo {draftDatosSortColumn === 'Orden' && (draftDatosSortDirection === 'asc' ? '↑' : '↓')}
                                      </div>
                                    </th>
                                    {rounds.map(r => (
                                      <th 
                                        key={r} 
                                        className="px-2 py-3 text-center font-bold text-neutral-500 border-r border-neutral-100 min-w-[3rem] cursor-pointer hover:bg-neutral-100"
                                        onClick={() => {
                                          const col = `R${r}`;
                                          if (draftDatosSortColumn === col) {
                                            setDraftDatosSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                          } else {
                                            setDraftDatosSortColumn(col);
                                            setDraftDatosSortDirection('desc');
                                          }
                                        }}
                                      >
                                        <div className="flex items-center justify-center gap-1">
                                          R{r} {draftDatosSortColumn === `R${r}` && (draftDatosSortDirection === 'asc' ? '↑' : '↓')}
                                        </div>
                                      </th>
                                    ))}
                                    <th 
                                      className="px-4 py-3 text-right font-bold text-blue-600 bg-blue-50/50 cursor-pointer hover:bg-blue-100/50"
                                      onClick={() => {
                                        if (draftDatosSortColumn === 'TOTAL') {
                                          setDraftDatosSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                        } else {
                                          setDraftDatosSortColumn('TOTAL');
                                          setDraftDatosSortDirection('desc');
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-end gap-1">
                                        TOTAL {draftDatosSortColumn === 'TOTAL' && (draftDatosSortDirection === 'asc' ? '↑' : '↓')}
                                      </div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                  {sortedTeams.map(team => {
                                    let teamTotal = 0;
                                    const teamOrder = teamOrderMap[team] || '?';
                                    return (
                                      <tr key={team} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-2 font-medium text-neutral-900 border-r border-neutral-200 bg-white sticky left-0 z-10">
                                          {team} <span className="text-[10px] text-neutral-400 font-normal">[#{teamOrder}]</span>
                                        </td>
                                        {rounds.map(r => {
                                          const pts = teamRoundData[team][r] || 0;
                                          teamTotal += pts;
                                          
                                          const isMax = pts > 0 && pts === roundStats[r].max;
                                          const isMin = pts > 0 && pts === roundStats[r].min;
                                          const isZero = pts === 0;
                                          
                                          let cellStyle = {};
                                          if (isZero) {
                                            cellStyle = { backgroundColor: '#fee2e2' }; // red-100
                                          } else if (isMax) {
                                            cellStyle = { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' }; // green-100, green-800
                                          } else if (isMin) {
                                            cellStyle = { backgroundColor: '#fef9c3', color: '#854d0e' }; // yellow-100, yellow-800
                                          }
                                          
                                          return (
                                            <td 
                                              key={r} 
                                              className={cn(
                                                "px-2 py-2 text-center border-r border-neutral-100",
                                                isZero ? "text-red-400" : "text-neutral-900"
                                              )}
                                              style={cellStyle}
                                            >
                                              {pts > 0 ? pts : '0'}
                                            </td>
                                          );
                                        })}
                                        <td className="px-4 py-2 text-right font-bold text-blue-700 bg-blue-50/30">
                                          {teamTotal}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            );
                          })()}
                        </div>
                      </>
                    )}
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
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsPointsExpanded(!isPointsExpanded)} 
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                          title="Ampliar"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={handleCopyPoints}
                          className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors copy-button-ignore"
                          title="Copiar texto"
                        >
                          {isPointsTextCopying ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          Copiar (Texto)
                        </button>
                        <button 
                          onClick={handleCopyPointsImage}
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                          title="Copiar imagen"
                        >
                          {isPointsImageCopying ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={handleDownloadPointsImage}
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                          title="Descargar"
                        >
                          <UploadCloud className="w-4 h-4" />
                        </button>
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
                    <div className={cn("overflow-x-auto max-h-[600px] overflow-y-auto", isPointsExpanded ? "fixed inset-4 z-50 bg-white p-4 shadow-2xl rounded-xl" : "")}>
                      {isPointsExpanded && (
                        <button onClick={() => setIsPointsExpanded(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore">
                          <X className="w-6 h-6" />
                        </button>
                      )}
                      <div ref={pointsTableRef} className="bg-white">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b border-neutral-100 sticky top-0 z-10">
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
                      <select 
                        value={racesCategoryFilter}
                        onChange={(e) => setRacesCategoryFilter(e.target.value)}
                        className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Todas las categorías</option>
                        {[...new Set(files.carreras.data?.map(r => getVal(r, 'Categoría')))].filter(Boolean).map(c => (
                          <option key={c as string} value={c as string}>{c as string}</option>
                        ))}
                      </select>
                      <select 
                        value={racesMonthFilter}
                        onChange={(e) => setRacesMonthFilter(e.target.value)}
                        className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Todos los meses</option>
                        {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                          <option key={m} value={(i + 1).toString().padStart(2, '0')}>{m}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsRacesExpanded(!isRacesExpanded)} 
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                          title="Ampliar"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={handleCopyRaces}
                          className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors copy-button-ignore"
                          title="Copiar texto"
                        >
                          {isRacesTextCopying ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          Copiar (Texto)
                        </button>
                        <button 
                          onClick={handleCopyRacesImage}
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                          title="Copiar imagen"
                        >
                          {isRacesImageCopying ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={handleDownloadRacesImage}
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 copy-button-ignore"
                          title="Descargar"
                        >
                          <UploadCloud className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div ref={racesTableRef} className={cn("overflow-x-auto max-h-[600px] overflow-y-auto", isRacesExpanded ? "fixed inset-4 z-50 bg-white p-4 shadow-2xl rounded-xl" : "")}>
                      {isRacesExpanded && (
                        <button onClick={() => setIsRacesExpanded(false)} className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg z-10 copy-button-ignore">
                          <X className="w-6 h-6" />
                        </button>
                      )}
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b border-neutral-100 sticky top-0 z-10">
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

                            return files.carreras.data?.filter(r => {
                              const carreraName = getVal(r, 'Carrera')?.trim();
                              const fechaFin = getVal(r, 'Fecha');
                              const categoria = getVal(r, 'Categoría');
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
                              if (racesCategoryFilter && categoria !== racesCategoryFilter) return false;
                              if (racesMonthFilter && (date.getMonth() + 1).toString().padStart(2, '0') !== racesMonthFilter) return false;
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
