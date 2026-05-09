import { copyImageToClipboard, copyTextToClipboard } from "./lib/clipboard";
import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import Papa from "papaparse";
import localforage from "localforage";
import { useDataStore } from "./lib/stores/useDataStore";
import { useComputedStore } from "./lib/stores/useComputedStore";
import { useAppComputations } from "./lib/hooks/useAppComputations";
import { domToBlob, domToDataUrl } from "modern-screenshot";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Medal,
  Users,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  LogIn,
  LogOut,
  Globe,
  Clock,
  Info,
  Activity,
  Flag,
  ClipboardList,
  List,
  LayoutGrid,
  ArrowUpRight,
  Crown,
  BarChart3,
  TrendingUp,
  History,
  User,
  UserMinus,
  Copy,
  Maximize2,
  Minimize2,
  Download,
  X,
  Search,
  Save,
  Trash2,
  FileText,
  ArrowUpDown,
  HelpCircle,
} from "lucide-react";
import { AppHeader } from "./components/AppHeader";
import { AdminNav } from "./components/AdminNav";

const MonthlyReportView = lazy(() => import("./components/tabs/MonthlyReportView").then(m => ({ default: m.MonthlyReportView })));
const SeasonReportView = lazy(() => import("./components/tabs/SeasonReportView").then(m => ({ default: m.SeasonReportView })));

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LabelList,
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  ReferenceArea,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { cn } from "./lib/utils";
import { supabase } from "./supabase";

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

import { formatNumberSpanish, normalizeStr, getVal, getCategoryColorStyle } from "./lib/data-processing";
import { expandNodeForCapture } from "./lib/dom-utils";

const CyclistDetailView = lazy(() => import("./components/modals/CyclistDetailView").then(m => ({ default: m.CyclistDetailView })));
const StartlistView = lazy(() => import("./components/tabs/StartlistView").then(m => ({ default: m.StartlistView })));
const RaceView = lazy(() => import("./components/tabs/RaceView").then(m => ({ default: m.RaceView })));
const TeamView = lazy(() => import("./components/tabs/TeamView").then(m => ({ default: m.TeamView })));
const SeasonView = lazy(() => import("./components/tabs/SeasonView").then(m => ({ default: m.SeasonView })));
const InfoView = lazy(() => import("./components/tabs/InfoView").then(m => ({ default: m.InfoView })));
const DraftView = lazy(() => import("./components/tabs/DraftView").then(m => ({ default: m.DraftView })));
const TestsView = lazy(() => import("./components/tabs/TestsView").then(m => ({ default: m.TestsView })));

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
  "#3b82f6",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#14b8a6",
  "#f97316",
  "#6366f1",
];

const FILE_TYPES = [
  {
    id: "carreras",
    name: "Carreras HLG 2026",
    icon: Trophy,
    expectedCols: ["Carrera", "Categoría", "Fecha"],
    global: true,
  },
  {
    id: "ciclistas",
    name: "Ciclistas 2026",
    icon: Users,
    expectedCols: ["Ciclista", "País", "Equipo"],
    global: true,
  },
  {
    id: "elecciones",
    name: "Elecciones 2026",
    icon: Users,
    expectedCols: [
      "Ciclista",
      "Nombre_TG",
      "Nombre_Equipo",
      "Edad",
      "Ronda",
      "País",
    ],
    global: true,
  },
  {
    id: "equipos",
    name: "Equipos 2026",
    icon: Users,
    expectedCols: ["EQUIPO COMPLETO", "EQUIPO BREVE"],
    global: true,
  },
  {
    id: "puntos",
    name: "Puntos HLG 2026",
    icon: FileSpreadsheet,
    expectedCols: ["Categoría", "Tipo", "Posición", "Puntos"],
    global: true,
  },
  {
    id: "resultados",
    name: "Resultados FirstCycling",
    icon: Medal,
    expectedCols: ["Carrera", "Ciclista", "Tipo", "Pos", "Etapa"],
    global: true,
  },
  {
    id: "startlist",
    name: "Startlist 2026",
    icon: List,
    expectedCols: [
      "BIB",
      "CORREDOR",
      "RANKING",
      "PNT",
      "EQUIPO",
      "MOSTRAR MÁS",
    ],
    global: true,
    hiddenInAdmin: true,
  },
] as const;

// --- Helpers ---

function MultiSelect({ options, value, onChange, placeholder }: { options: {value: string, label: string}[], value: string[], onChange: (v: string[]) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)} className="px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm text-neutral-700 flex items-center justify-between min-w-[150px] shadow-sm hover:bg-neutral-50">
        <span className="truncate">{value.length === 0 ? placeholder : `${placeholder} (${value.length})`}</span>
        <ChevronDown className="w-4 h-4 ml-2 text-neutral-400" />
      </button>
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-full min-w-[200px] bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 flex flex-col gap-1">
             <label className="flex items-center gap-2 p-1.5 hover:bg-neutral-50 rounded cursor-pointer">
               <input type="checkbox" checked={value.length === 0} onChange={() => onChange([])} className="rounded text-blue-600 focus:ring-blue-500" />
               <span className="text-sm font-medium">Todos</span>
             </label>
             <div className="h-px bg-neutral-100 my-1"></div>
             {options.map(opt => (
               <label key={opt.value} className="flex items-center gap-2 p-1.5 hover:bg-neutral-50 rounded cursor-pointer">
                 <input type="checkbox" checked={value.includes(opt.value)} onChange={(e) => {
                   if (e.target.checked) onChange([...value, opt.value]);
                   else onChange(value.filter(v => v !== opt.value));
                 }} className="rounded text-blue-600 focus:ring-blue-500" />
                 <span className="text-sm truncate">{opt.label}</span>
               </label>
             ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const initParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initTab = (initParams.get("tab") as any) || "season";
  const initRace = initParams.get("race") || "";
  const initStartlistRace = initParams.get("startlist_race") || "";
  const initTeam = initParams.get("selected_team") || "";

  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [view, setView] = useState<"public" | "admin">("public");
  const [adminTab, setAdminTab] = useState<
    | "datos"
    | "gestion-startlists"
    | "reporte-carrera"
    | "reporte-mes"
    | "reporte-temporada"
    | "pruebas"
  >("datos");
  const [publicTab, setPublicTab] = useState<
    "season" | "race" | "startlist" | "team" | "draft" | "info" | "pruebas"
  >(initTab);
  const [draftSubTab, setDraftSubTab] = useState<"elecciones" | "datos">(
    "elecciones",
  );
  const [draftSearchTerm, setDraftSearchTerm] = useState("");
  const [draftRoundFilter, setDraftRoundFilter] = useState<string[]>([]);
  const [draftTeamFilter, setDraftTeamFilter] = useState<string[]>([]);
  const [isDraftRoundFilterOpen, setIsDraftRoundFilterOpen] = useState(false);
  const [isDraftTeamFilterOpen, setIsDraftTeamFilterOpen] = useState(false);
  const [draftStatsFilters, setDraftStatsFilters] = useState<{
    minPoints?: number;
    maxPoints?: number;
    minWins?: number;
    maxWins?: number;
    minCarr?: number;
    maxCarr?: number;
    minDc?: number;
    maxDc?: number;
    minPpc?: number;
    maxPpc?: number;
    minPpd?: number;
    maxPpd?: number;
  }>({});
  const [isDraftStatsFilterOpen, setIsDraftStatsFilterOpen] = useState(false);
  const [draftDatosTooltip, setDraftDatosTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    data: any;
  } | null>(null);
  const [draftDatosMonthFilter, setDraftDatosMonthFilter] = useState<string[]>(
    [],
  );
  const [draftDatosCategoryFilter, setDraftDatosCategoryFilter] = useState<
    string[]
  >([]);
  const [draftDatosTeamFilter, setDraftDatosTeamFilter] = useState<string[]>(
    [],
  );
  const [isDraftDatosMonthFilterOpen, setIsDraftDatosMonthFilterOpen] =
    useState(false);
  const [isDraftDatosCategoryFilterOpen, setIsDraftDatosCategoryFilterOpen] =
    useState(false);
  const [isDraftDatosTeamFilterOpen, setIsDraftDatosTeamFilterOpen] =
    useState(false);
  const [draftSortColumn, setDraftSortColumn] = useState<string>("Elección");
  const [draftSortDirection, setDraftSortDirection] = useState<"asc" | "desc">(
    "asc",
  );
  const [draftDatosSortColumn, setDraftDatosSortColumn] =
    useState<string>("Orden");
  const [draftDatosSortDirection, setDraftDatosSortDirection] = useState<
    "asc" | "desc"
  >("asc");
  const [selectedRace, setSelectedRace] = useState<string>(initRace);
  const [publicStartlistRace, setPublicStartlistRace] = useState<string>(initStartlistRace);
  const [selectedTeam, setSelectedTeam] = useState<string>(initTeam);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [evolutionMode, setEvolutionMode] = useState<"acumulado" | "mensual">(
    "acumulado",
  );
  const [selectedEvolutionTeams, setSelectedEvolutionTeams] = useState<
    string[]
  >([]);
  const [seasonSubTab, setSeasonSubTab] = useState<
    "puntos" | "victorias" | "ciclistas"
  >("puntos");
  const [cyclistsSubTab, setCyclistsSubTab] = useState<"draft" | "no-draft" | "detalle">(
    "draft",
  );
  const [selectedCyclistDetail, setSelectedCyclistDetail] = useState("");
  const [winsChartType, setWinsChartType] = useState<"acumulado" | "mensual">(
    "acumulado",
  );
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>("all");
  const [historyTeamFilter, setHistoryTeamFilter] = useState<string>("all");
  const [historySortColumn, setHistorySortColumn] = useState<string>("fecha");
  const [historySortDirection, setHistorySortDirection] = useState<
    "asc" | "desc"
  >("desc");
  const [topCyclistsLimit, setTopCyclistsLimit] = useState<number>(25);
  const [cyclistsMonthFilter, setCyclistsMonthFilter] = useState<string>("all");
  const [cyclistsRoundFilter, setCyclistsRoundFilter] = useState<string[]>([]);
  const [cyclistsCategoryFilter, setCyclistsCategoryFilter] = useState<
    string[]
  >([]);
  const [cyclistsTeamFilter, setCyclistsTeamFilter] = useState<string[]>([]);
  const [isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen] =
    useState(false);
  const [isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen] =
    useState(false);
  const [isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen] =
    useState(false);
  const [cyclistsSortColumn, setCyclistsSortColumn] =
    useState<string>("puntos");
  const [cyclistsSortDirection, setCyclistsSortDirection] = useState<
    "asc" | "desc"
  >("desc");
  const [unscoredCyclistsTeamFilter, setUnscoredCyclistsTeamFilter] =
    useState<string>("all");
  const [unscoredCyclistsRoundFilter, setUnscoredCyclistsRoundFilter] =
    useState<string[]>([]);
  const [isUnscoredRoundFilterOpen, setIsUnscoredRoundFilterOpen] =
    useState(false);
  const [unscoredCyclistsSortColumn, setUnscoredCyclistsSortColumn] =
    useState<string>("ronda");
  const [unscoredCyclistsSortDirection, setUnscoredCyclistsSortDirection] =
    useState<"asc" | "desc">("asc");
  const [teamsSortColumn, setTeamsSortColumn] = useState<string>("puntos");
  const [teamsSortDirection, setTeamsSortDirection] = useState<"asc" | "desc">(
    "desc",
  );
  const [teamsMonthFilter, setTeamsMonthFilter] = useState<string>("all");
  const [undebutedCyclistsSortColumn, setUndebutedCyclistsSortColumn] =
    useState<string>("ronda");
  const [undebutedCyclistsSortDirection, setUndebutedCyclistsSortDirection] =
    useState<"asc" | "desc">("asc");
  const [undebutedCyclistsTeamFilter, setUndebutedCyclistsTeamFilter] =
    useState<string>("all");
  const [undebutedCyclistsRoundFilter, setUndebutedCyclistsRoundFilter] =
    useState<string[]>([]);
  const [isUndebutedRoundFilterOpen, setIsUndebutedRoundFilterOpen] =
    useState(false);

  const [noDraftCyclistsMonthFilter, setNoDraftCyclistsMonthFilter] =
    useState<string>("all");
  const [noDraftTopCyclistsLimit, setNoDraftTopCyclistsLimit] =
    useState<number>(25);
  const [noDraftCyclistsSortColumn, setNoDraftCyclistsSortColumn] =
    useState<string>("puntos");
  const [noDraftCyclistsSortDirection, setNoDraftCyclistsSortDirection] =
    useState<"asc" | "desc">("desc");
  const [
    noDraftUnscoredCyclistsSortColumn,
    setNoDraftUnscoredCyclistsSortColumn,
  ] = useState<string>("ciclista");
  const [
    noDraftUnscoredCyclistsSortDirection,
    setNoDraftUnscoredCyclistsSortDirection,
  ] = useState<"asc" | "desc">("asc");
  const [
    noDraftUndebutedCyclistsSortColumn,
    setNoDraftUndebutedCyclistsSortColumn,
  ] = useState<string>("ciclista");
  const [
    noDraftUndebutedCyclistsSortDirection,
    setNoDraftUndebutedCyclistsSortDirection,
  ] = useState<"asc" | "desc">("asc");

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
  const unscoredTableRef = useRef<HTMLDivElement>(null);
  const undebutedTableRef = useRef<HTMLDivElement>(null);
  const noDraftCyclistsTableRef = useRef<HTMLDivElement>(null);

  const [isCopying, setIsCopying] = useState(false);
  const [isTopTeamsTableCopying, setIsTopTeamsTableCopying] = useState(false);
  const [isEvolutionChartCopying, setIsEvolutionChartCopying] = useState(false);
  const [isWinsRankingCopying, setIsWinsRankingCopying] = useState(false);
  const [isWinsEvolutionCopying, setIsWinsEvolutionCopying] = useState(false);
  const [isWinsHistoryCopying, setIsWinsHistoryCopying] = useState<
    | "full"
    | "p1"
    | "p2"
    | "p3"
    | "p4"
    | "p5"
    | "p6"
    | "p7"
    | "p8"
    | "p9"
    | "p10"
    | null
  >(null);
  const [isWinsHistoryTextCopying, setIsWinsHistoryTextCopying] =
    useState(false);
  const [isRaceClassificationCopying, setIsRaceClassificationCopying] =
    useState(false);
  const [isCyclistsCopying, setIsCyclistsCopying] = useState(false);
  const [isStageCopying, setIsStageCopying] = useState(false);
  const [isPointsTextCopying, setIsPointsTextCopying] = useState(false);
  const [isPointsImageCopying, setIsPointsImageCopying] = useState(false);
  const [isRacesTextCopying, setIsRacesTextCopying] = useState(false);
  const [isRacesImageCopying, setIsRacesImageCopying] = useState(false);
  const [isTeamGlobalCopying, setIsTeamGlobalCopying] = useState(false);
  const [isRaceBreakdownCopying, setIsRaceBreakdownCopying] = useState(false);
  const [isDetailedBreakdownCopying, setIsDetailedBreakdownCopying] = useState<
    "full" | "first" | "second" | "third" | null
  >(null);
  const [isDetailedBreakdownTextCopying, setIsDetailedBreakdownTextCopying] =
    useState(false);
  const [isDraftTableCopying, setIsDraftTableCopying] = useState<string | null>(
    null,
  );
  const [isDraftDatosTableCopying, setIsDraftDatosTableCopying] =
    useState(false);
  const [isTopCyclistsDraftCopying, setIsTopCyclistsDraftCopying] = useState<
    | "full"
    | "p1"
    | "p2"
    | "p3"
    | "p4"
    | "p5"
    | "p6"
    | "p7"
    | "p8"
    | "p9"
    | "p10"
    | null
  >(null);
  const [isTopCyclistsDraftTextCopying, setIsTopCyclistsDraftTextCopying] =
    useState(false);
  const [isUnscoredCopying, setIsUnscoredCopying] = useState<
    "full" | "p1" | "p2" | "p3" | "p4" | null
  >(null);
  const [isUnscoredTextCopying, setIsUnscoredTextCopying] = useState(false);
  const [isUndebutedCopying, setIsUndebutedCopying] = useState<
    "full" | "p1" | "p2" | "p3" | "p4" | null
  >(null);
  const [isUndebutedTextCopying, setIsUndebutedTextCopying] = useState(false);
  const [isNoDraftCyclistsCopying, setIsNoDraftCyclistsCopying] = useState<
    | "full"
    | "p1"
    | "p2"
    | "p3"
    | "p4"
    | "p5"
    | "p6"
    | "p7"
    | "p8"
    | "p9"
    | "p10"
    | null
  >(null);
  const [isNoDraftCyclistsTextCopying, setIsNoDraftCyclistsTextCopying] =
    useState(false);

  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isTopTeamsTableExpanded, setIsTopTeamsTableExpanded] = useState(false);
  const [isEvolutionChartExpanded, setIsEvolutionChartExpanded] =
    useState(false);
  const [isWinsRankingExpanded, setIsWinsRankingExpanded] = useState(false);
  const [isWinsEvolutionExpanded, setIsWinsEvolutionExpanded] = useState(false);
  const [isWinsHistoryExpanded, setIsWinsHistoryExpanded] = useState(false);
  const [isRaceClassificationExpanded, setIsRaceClassificationExpanded] =
    useState(false);
  const [isCyclistsExpanded, setIsCyclistsExpanded] = useState(false);
  const [isStageExpanded, setIsStageExpanded] = useState(false);
  const [isDetailedBreakdownExpanded, setIsDetailedBreakdownExpanded] =
    useState(false);
  const [isDraftTableExpanded, setIsDraftTableExpanded] = useState(false);
  const [isDraftDatosTableExpanded, setIsDraftDatosTableExpanded] =
    useState(false);
  const [isDraftSummaryExpanded, setIsDraftSummaryExpanded] = useState(false);
  const draftSummaryTableRef = useRef<HTMLDivElement>(null);
  const draftChartRef = useRef<HTMLDivElement>(null);
  const [draftSummarySort, setDraftSummarySort] = useState<{
    keys: string[];
    order: "asc" | "desc";
  }>({ keys: ["totalPoints"], order: "desc" });
  const [isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded] =
    useState(false);
  const [isUnscoredExpanded, setIsUnscoredExpanded] = useState(false);
  const [isUndebutedExpanded, setIsUndebutedExpanded] = useState(false);
  const [isNoDraftCyclistsExpanded, setIsNoDraftCyclistsExpanded] =
    useState(false);
  const [isPointsExpanded, setIsPointsExpanded] = useState(false);
  const [isRacesExpanded, setIsRacesExpanded] = useState(false);

  const [teamCyclistsSortColumn, setTeamCyclistsSortColumn] =
    useState<string>("puntos");
  const [teamCyclistsSortDirection, setTeamCyclistsSortDirection] = useState<
    "asc" | "desc"
  >("desc");

  // Info tab states
  const [infoSubTab, setInfoSubTab] = useState<
    "menu" | "puntuaciones" | "carreras"
  >("menu");
  const [pointsCategoryFilter, setPointsCategoryFilter] = useState<string>("");
  const [pointsRaceSearch, setPointsRaceSearch] = useState<string>("");
  const [racesFilter, setRacesFilter] = useState<
    "all" | "finished" | "upcoming"
  >("all");
  const [racesCategoryFilter, setRacesCategoryFilter] = useState<string>("");
  const [racesMonthFilter, setRacesMonthFilter] = useState<string>("");
  const [infoCarrerasSortDir, setInfoCarrerasSortDir] = useState<"asc" | "desc">("asc");
  const { files, setFiles } = useDataStore();
  const { 
    leaderboard, 
    raceWinners, 
    globalTeamWinsCount, 
    globalTeamPartialWinsCount, 
    uniqueRaces,
    cyclistMetadata,
    playerOrderMap,
    playerByCyclist,
    playerTeamMap,
    teamToPlayerMap,
    cyclistRoundMap 
  } = useComputedStore();

  useAppComputations();

  useEffect(() => {
    if (view === "admin") return;
    const urlParams = new URLSearchParams(window.location.search);
    if (publicTab !== "season") urlParams.set("tab", publicTab); else urlParams.delete("tab");
    if (publicTab === "race" && selectedRace) urlParams.set("race", selectedRace); else urlParams.delete("race");
    if (publicTab === "startlist" && publicStartlistRace) urlParams.set("startlist_race", publicStartlistRace); else urlParams.delete("startlist_race");
    if (publicTab === "team" && selectedTeam) urlParams.set("selected_team", selectedTeam); else urlParams.delete("selected_team");

    const query = urlParams.toString();
    const newUrl = query ? `?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [publicTab, selectedRace, publicStartlistRace, selectedTeam, view]);

  const isAdmin = user?.email === "davidmv1985@gmail.com";
  const isSupabaseConfigured =
    !!(import.meta as any).env.VITE_SUPABASE_URL &&
    !!(import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  // Auth listener
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "SUPABASE_SESSION" && event.data?.session) {
        const { access_token, refresh_token } = event.data.session;
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      }
    };
    window.addEventListener("message", handleMessage);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser((session?.user as any) ?? null);
      setIsAuthReady(true);
      if (session && window.opener) {
        window.opener.postMessage({ type: "SUPABASE_SESSION", session }, "*");
        window.close();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as any) ?? null);
      setIsAuthReady(true);
      if (session && window.opener) {
        window.opener.postMessage({ type: "SUPABASE_SESSION", session }, "*");
        window.close();
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Automatically switch to admin view if user is admin
  useEffect(() => {
    if (isAdmin) setView("admin");
    else setView("public");
  }, [isAdmin]);

  const [startlistText, setStartlistText] = useState("");
  const [startlistRace, setStartlistRace] = useState("");
  const [parsedStartlist, setParsedStartlist] = useState<{
    carrera: string;
    resultados: { jugador: string; ciclistas: any[] }[];
    updatedAt?: string;
  } | null>(null);
  const [isSavingStartlist, setIsSavingStartlist] = useState(false);

  const essentialFiles = ["carreras", "ciclistas", "elecciones", "equipos", "puntos", "resultados"];
  const allFilesUploaded = essentialFiles.every(
    (key) => files[key as keyof AppState].data !== null,
  );

  const fetchGlobalFile = async (id: string, force = false) => {
    try {
      if (!isSupabaseConfigured) {
        setFiles((prev) => ({
          ...prev,
          [id]: { ...prev[id as keyof AppState], loading: false },
        }));
        return;
      }
      
      // Load from cache first for immediate rendering
      const cachedEntry: any = await localforage.getItem(`global_file_${id}`);
      if (!force && cachedEntry) {
        setFiles((prev) => ({
          ...prev,
          [id]: {
            file: null,
            data: cachedEntry.data,
            error: null,
            loading: false,
            updatedAt: cachedEntry.updated_at,
          },
        }));
        
        // Verify metadata in background
        supabase
          .from("global_files")
          .select("updated_at")
          .eq("id", id)
          .single()
          .then(({ data: metaData, error: metaError }) => {
            if (!metaError && metaData && metaData.updated_at !== cachedEntry.updated_at) {
              fetchGlobalFile(id, true); // Force fetch if outdated
            }
          });
        return;
      }

      // If we reach here, we need to fetch the full data
      const { data, error } = await supabase
        .from("global_files")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        // Save to cache
        await localforage.setItem(`global_file_${id}`, {
          data: data.data,
          updated_at: data.updated_at,
        });
        
        setFiles((prev) => ({
          ...prev,
          [id]: {
            file: null,
            data: data.data,
            error: null,
            loading: false,
            updatedAt: data.updated_at,
          },
        }));
      } else {
        setFiles((prev) => ({
          ...prev,
          [id]: { ...prev[id as keyof AppState], loading: false },
        }));
      }
    } catch (e) {
      console.error(`Error in fetchGlobalFile for ${id}:`, e);
      setFiles((prev) => ({
        ...prev,
        [id]: { ...prev[id as keyof AppState], loading: false },
      }));
    }
  };

  // Removed the useEffect for calculatePoints as it is now handled by useAppComputations

  // Supabase sync for global files
  useEffect(() => {
    if (!isAuthReady || !isSupabaseConfigured) {
      if (!isSupabaseConfigured) {
        // Set loading to false if not configured to avoid permanent "Sincronizando"
        setFiles((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((key) => {
            (next[key as keyof AppState] as any).loading = false;
          });
          return next;
        });
      }
      return;
    }

    // Initial fetch
    FILE_TYPES.filter((ft) => ft.global).forEach((ft) => {
      fetchGlobalFile(ft.id);
    });

    // Real-time subscription
    const channel = supabase
      .channel("global_files_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "global_files",
        },
        (payload) => {
          const id = (payload.new as any)?.id || (payload.old as any)?.id;
          if (id) fetchGlobalFile(id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthReady]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const popup = window.open(
          data.url,
          "oauth_popup",
          "width=600,height=700",
        );
        if (!popup) {
          alert(
            "Por favor, permite las ventanas emergentes (popups) para iniciar sesión.",
          );
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
      alert(
        "Error al iniciar sesión. Revisa la consola (F12) para ver el error técnico.",
      );
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => supabase.auth.signOut();

  const handleFileUpload = (id: keyof AppState, file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const ftConfig = FILE_TYPES.find((f) => f.id === id);
        const expectedCols = ftConfig?.expectedCols || [];
        const actualCols = results.meta.fields || [];

        const normalize = (s: string) =>
          s
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "")
            .trim();

        const missingCols = (expectedCols as string[]).filter(
          (expected) =>
            !actualCols.some(
              (actual) =>
                normalize(actual as string) === normalize(expected as string),
            ),
        );

        if (missingCols.length > 0) {
          setFiles((prev) => ({
            ...prev,
            [id]: {
              file,
              data: null,
              error: `Faltan columnas: ${missingCols.join(", ")}`,
            },
          }));
        } else {
          const parsedData = results.data as ParsedData;

          if (ftConfig?.global) {
            if (!user) {
              setFiles((prev) => ({
                ...prev,
                [id]: {
                  file,
                  data: null,
                  error: "Debes iniciar sesión para subir archivos globales",
                },
              }));
              return;
            }

            try {
              setFiles((prev) => ({
                ...prev,
                [id]: { ...prev[id], loading: true },
              }));

              const { error } = await supabase.from("global_files").upsert({
                id,
                data: parsedData,
                updated_at: new Date().toISOString(),
              });

              if (error) throw error;

              // State will be updated by real-time subscription or manual fetch
              fetchGlobalFile(id);
            } catch (e: any) {
              console.error("Error saving to Supabase", e);
              setFiles((prev) => ({
                ...prev,
                [id]: {
                  file,
                  data: null,
                  error: `Error al guardar: ${e.message}`,
                },
              }));
            }
          } else {
            setFiles((prev) => ({
              ...prev,
              [id]: { file, data: parsedData, error: null },
            }));
          }
        }
      },
      error: (error) => {
        setFiles((prev) => ({
          ...prev,
          [id]: { file, data: null, error: error.message },
        }));
      },
    });
  };






























  const handleCopyStage = async () => {
    if (!stageTableRef.current || isStageCopying) return;
    setIsStageCopying(true);
    const restore = expandNodeForCapture(stageTableRef.current);
    try {
      
              {
                const processCopy = async () => {
                  const dataUrl = await domToDataUrl(stageTableRef.current!, {
              scale: 3, 

        backgroundColor: '#ffffff',
              style: { overflow: "hidden" },
              
            });
            const response = await fetch(dataUrl);
            return await response.blob();
                };
                await copyImageToClipboard(processCopy(), "export.png");
                setTimeout(() => setIsStageCopying(false), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
    }
  };

  const handleDownloadStage = async () => {
    if (!stageTableRef.current) return;
    const restore = expandNodeForCapture(stageTableRef.current);
    try {
      const dataUrl = await domToDataUrl(stageTableRef.current, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        style: { overflow: "hidden" },
        
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "clasificacion-etapas.png";
      link.click();
    } catch (err) {
      console.error("Error downloading table:", err);
    } finally {
      restore();
    }
  };













  const handleCopyDraftTableImage = async (
    subset?:
      | "p1"
      | "p2"
      | "p3"
      | "p4"
      | "p5"
      | "p6"
      | "p7"
      | "p8"
      | "p9"
      | "p10",
  ) => {
    if (!draftTableRef.current || isDraftTableCopying) return;
    setIsDraftTableCopying(subset || "full");

    const tableContainer = draftTableRef.current;
    const originalClass = tableContainer.className;
    const rows = tableContainer.querySelectorAll(".draft-row");

    try {
      // Apply subset filtering (50 rows per block)
      if (subset) {
        const start =
          ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"].indexOf(
            subset,
          ) * 50;
        const end = start + 50;
        rows.forEach((row, idx) => {
          const num = idx + 1;
          if (num <= start || num > end) row.classList.add("hidden");
        });
      }

      // Force a clean layout for capture
      tableContainer.className =
        "bg-white border border-neutral-200 rounded-xl overflow-visible shadow-sm inline-block w-auto min-w-full";

      
              {
                const processCopy = async () => {
                  const dataUrl = await domToDataUrl(tableContainer, {
              scale: 3, 

        backgroundColor: '#ffffff',
              
              style: { overflow: "visible" },
              
            });
            const response = await fetch(dataUrl);
            return await response.blob();
                };
                await copyImageToClipboard(processCopy(), "export.png");
                setTimeout(() => setIsDraftTableCopying(null), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      tableContainer.className = originalClass;
      rows.forEach((row) => row.classList.remove("hidden"));
    }
  };

  const handleDownloadDraftTableImage = async (
    subset?:
      | "p1"
      | "p2"
      | "p3"
      | "p4"
      | "p5"
      | "p6"
      | "p7"
      | "p8"
      | "p9"
      | "p10",
  ) => {
    if (!draftTableRef.current) return;

    const tableContainer = draftTableRef.current;
    const originalClass = tableContainer.className;
    const rows = tableContainer.querySelectorAll(".draft-row");

    try {
      if (subset) {
        const start =
          ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"].indexOf(
            subset,
          ) * 50;
        const end = start + 50;
        rows.forEach((row, idx) => {
          const num = idx + 1;
          if (num <= start || num > end) row.classList.add("hidden");
        });
      }

      tableContainer.className =
        "bg-white border border-neutral-200 rounded-xl overflow-visible shadow-sm inline-block w-auto min-w-full";

      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        
        style: { overflow: "visible" },
        
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      const suffix = subset ? `-${subset}` : "";
      link.download = `draft-elecciones${suffix}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading draft table image:", err);
    } finally {
      tableContainer.className = originalClass;
      rows.forEach((row) => row.classList.remove("hidden"));
    }
  };

  const handleCopyDraftDatosTableImage = async () => {
    if (!draftDatosTableRef.current || isDraftDatosTableCopying) return;
    setIsDraftDatosTableCopying(true);

    const tableContainer = draftDatosTableRef.current;
    const restore = expandNodeForCapture(tableContainer);

    try {
      
              {
                const processCopy = async () => {
                  const dataUrl = await domToDataUrl(tableContainer, {
              scale: 3, 

        backgroundColor: '#ffffff',
              width: tableContainer.scrollWidth,
              style: { overflow: "visible" },
              
            });
            const response = await fetch(dataUrl);
            return await response.blob();
                };
                await copyImageToClipboard(processCopy(), "export.png");
                setTimeout(() => setIsDraftDatosTableCopying(false), 2000);
              }
              
    } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
      restore();
    }
  };

  const handleDownloadDraftDatosTableImage = async () => {
    if (!draftDatosTableRef.current) return;

    const tableContainer = draftDatosTableRef.current;
    const restore = expandNodeForCapture(tableContainer);

    try {
      const dataUrl = await domToDataUrl(tableContainer, {
        scale: 3, 
        
        backgroundColor: '#ffffff',
        width: tableContainer.scrollWidth,
        style: { overflow: "visible" },
        
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `draft-puntos-rondas.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading draft datos table image:", err);
    } finally {
      restore();
    }
  };


  

  const lastUpdatedDates = (Object.values(files) as FileState[])
    .map((f) => (f.updatedAt ? new Date(f.updatedAt).getTime() : 0))
    .filter((t) => t > 0);
  const lastUpdated =
    lastUpdatedDates.length > 0
      ? new Date(Math.max(...lastUpdatedDates))
      : null;

  // --- Helpers ---
  const getFlagEmoji = (countryName: string) => {
    if (!countryName) return "";
    const country = countryName.trim().toLowerCase();
    const flags: Record<string, string> = {
      spain: "🇪🇸",
      españa: "🇪🇸",
      france: "🇫🇷",
      francia: "🇫🇷",
      italy: "🇮🇹",
      italia: "🇮🇹",
      belgium: "🇧🇪",
      bélgica: "🇧🇪",
      netherlands: "🇳🇱",
      "países bajos": "🇳🇱",
      holanda: "🇳🇱",
      slovenia: "🇸🇮",
      eslovenia: "🇸🇮",
      denmark: "🇩🇰",
      dinamarca: "🇩🇰",
      "great britain": "🇬🇧",
      "gran bretaña": "🇬🇧",
      "united kingdom": "🇬🇧",
      "reino unido": "🇬🇧",
      australia: "🇦🇺",
      usa: "🇺🇸",
      "united states": "🇺🇸",
      eeuu: "🇺🇸",
      "estados unidos": "🇺🇸",
      colombia: "🇨🇴",
      ecuador: "🇪🇨",
      norway: "🇳🇴",
      noruega: "🇳🇴",
      germany: "🇩🇪",
      alemania: "🇩🇪",
      switzerland: "🇨🇭",
      suiza: "🇨🇭",
      portugal: "🇵🇹",
      austria: "🇦🇹",
      ireland: "🇮🇪",
      irlanda: "🇮🇪",
      canada: "🇨🇦",
      canadá: "🇨🇦",
      "new zealand": "🇳🇿",
      "nueva zelanda": "🇳🇿",
      eritrea: "🇪🇷",
      kazakhstan: "🇰🇿",
      kazajistán: "🇰🇿",
      poland: "🇵🇱",
      polonia: "🇵🇱",
      "czech republic": "🇨🇿",
      "república checa": "🇨🇿",
      slovakia: "🇸🇰",
      eslovaquia: "🇸🇰",
      hungary: "🇭🇺",
      hungría: "🇭🇺",
      luxembourg: "🇱🇺",
      luxemburgo: "🇱🇺",
      "south africa": "🇿🇦",
      sudáfrica: "🇿🇦",
      latvia: "🇱🇻",
      letonia: "🇱🇻",
      estonia: "🇪🇪",
      lithuania: "🇱🇹",
      lituania: "🇱🇹",
      israel: "🇮🇱",
      japan: "🇯🇵",
      japón: "🇯🇵",
      china: "🇨🇳",
      russia: "🇷🇺",
      rusia: "🇷🇺",
      ukraine: "🇺🇦",
      ucrania: "🇺🇦",
      belarus: "🇧🇾",
      bielorrusia: "🇧🇾",
      mexico: "🇲🇽",
      méxico: "🇲🇽",
      argentina: "🇦🇷",
      brazil: "🇧🇷",
      brasil: "🇧🇷",
      venezuela: "🇻🇪",
      "costa rica": "🇨🇷",
      panama: "🇵🇦",
      panamá: "🇵🇦",
    };
    return flags[country] || countryName;
  };

  const memoizedPointsData = React.useMemo(() => {
    let filteredPoints = files.puntos.data || [];

    if (pointsRaceSearch.trim()) {
      const searchLower = pointsRaceSearch.toLowerCase();
      const matchedRaces = files.carreras.data?.filter((r) =>
        getVal(r, "Carrera")?.toLowerCase().includes(searchLower)
      ) || [];
      const matchedCategories = new Set(
        matchedRaces.map((r) => getVal(r, "Categoría"))
      );
      filteredPoints = filteredPoints.filter((p) =>
        matchedCategories.has(getVal(p, "Categoría"))
      );
    } else if (pointsCategoryFilter) {
      filteredPoints = filteredPoints.filter(
        (p) => getVal(p, "Categoría") === pointsCategoryFilter
      );
    }
    
    return filteredPoints;
  }, [files.puntos.data, files.carreras.data, pointsRaceSearch, pointsCategoryFilter]);

  const memoizedRacesData = React.useMemo(() => {
    const now = new Date().getTime();
    const resultObj = files.carreras.data?.filter((r) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const isFinished = Object.keys(raceWinners).includes(carreraName || "");

      if (racesFilter === "finished" && !isFinished) return false;
      if (racesFilter === "upcoming" && isFinished) return false;
      if (racesCategoryFilter) {
        if (getVal(r, "Categoría") !== racesCategoryFilter) return false;
      }
      if (racesMonthFilter) {
        let dateObj: Date | null = null;
        const fecha = getVal(r, "Fecha");
        if (fecha) {
          const parts = fecha.toString().split(/[-/]/);
          if (parts.length === 3) {
            if (parts[0].length === 4) {
              dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
              dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
          }
        }
        if (dateObj) {
          if ((dateObj.getMonth() + 1).toString().padStart(2, "0") !== racesMonthFilter) {
            return false;
          }
        } else {
          return false;
        }
      }
      return true;
    });

    if (resultObj) {
      const parseDate = (dStr: string | null | undefined) => {
        if (!dStr) return 0;
        const p = dStr.toString().split(/[-/]/);
        if (p.length === 3) {
          if (p[0].length === 4) {
            return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2])).getTime();
          } else {
            return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0])).getTime();
          }
        }
        return 0;
      };
      
      resultObj.sort((a, b) => {
        const dA = parseDate(getVal(a, "Fecha"));
        const dB = parseDate(getVal(b, "Fecha"));
        return infoCarrerasSortDir === "asc" ? dA - dB : dB - dA;
      });
    }

    return resultObj || [];
  }, [files.carreras.data, raceWinners, racesFilter, racesCategoryFilter, racesMonthFilter, infoCarrerasSortDir]);

  const formattedTeams = React.useMemo(() => {
    if (!files.elecciones.data) return [];

    const teamData: Record<string, string> = {}; // teamName -> order
    const uniquePlayers = [
      ...new Set(
        files.elecciones.data
          .map((r) => getVal(r, "Nombre_TG")?.trim())
          .filter(Boolean),
      ),
    ] as string[];

    files.elecciones?.data?.forEach((row) => {
      const jugador = getVal(row, "Nombre_TG")?.trim();
      const nombreEquipo = getVal(row, "Nombre_Equipo")?.trim() || jugador;
      if (jugador && nombreEquipo && !teamData[nombreEquipo]) {
        const playerIdx = uniquePlayers.indexOf(jugador);
        const order = (playerIdx + 1).toString().padStart(2, "0");
        teamData[nombreEquipo] = order;
      }
    });

    return Object.entries(teamData)
      .map(([name, order]) => ({
        label: `${name} [#${order}]`,
        value: name,
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [files.elecciones.data]);

  const handleParseStartlist = () => {
    if (!startlistText) return;

    const textLines = startlistText.split("\n").map((line) => line.trim());
    const textLinesLower = textLines.map((line) =>
      line
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
    );
    const foundByPlayer: Record<string, any[]> = {};

    Object.keys(playerByCyclist).forEach((cyclist) => {
      // cyclist is the exact name from the csv, e.g. "POGAČAR Tadej"
      const cyclistLower = cyclist
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const lineIndex = textLinesLower.findIndex((line) =>
        line.includes(cyclistLower),
      );
      if (lineIndex !== -1) {
        const originalLine = textLines[lineIndex];
        const lineParts = originalLine.split(/[\s\t]+/);
        let dorsal = "";
        if (lineParts.length > 0) {
          const match = originalLine.trim().match(/^([0-9]+[A-Za-z]?)[^\w]/) || originalLine.trim().match(/^([0-9]+[A-Za-z]?)$/);
          if (match) {
            dorsal = match[1];
          } else {
            // fallback, check first word
            const firstWord = lineParts[0].replace(/[^A-Za-z0-9]/g, '');
            if (/^[0-9]+[A-Za-z]?$/.test(firstWord)) {
              dorsal = firstWord;
            }
          }
        }

        const player = playerByCyclist[cyclist];
        if (!foundByPlayer[player]) foundByPlayer[player] = [];
        foundByPlayer[player].push({ nombre: cyclist, dorsal });
      }
    });

    const results = Object.entries(foundByPlayer)
      .map(([jugador, ciclistas]) => ({
        jugador,
        ciclistas, // Now array of objects: { nombre, dorsal }
      }))
      .sort((a, b) => {
        const teamA = playerTeamMap[a.jugador] || a.jugador;
        const teamB = playerTeamMap[b.jugador] || b.jugador;
        return teamA.localeCompare(teamB);
      });

    setParsedStartlist({
      carrera: startlistRace || "Carrera sin nombre",
      resultados: results,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveStartlist = async () => {
    if (!parsedStartlist || !user) return;
    setIsSavingStartlist(true);

    try {
      // files.startlist.data is actually expected to be the json array now
      const currentData = Array.isArray(files.startlist.data)
        ? files.startlist.data
        : [];

      // Upsert: replace if same name, otherwise push
      const existingIdx = currentData?.findIndex(
        (d) => d.carrera === parsedStartlist.carrera,
      );
      const newData = [...currentData];

      if (existingIdx !== -1) {
        newData[existingIdx] = parsedStartlist;
      } else {
        newData.push(parsedStartlist);
      }

      const { error } = await supabase.from("global_files").upsert({
        id: "startlist",
        data: newData,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update local state implicitly through real-time sync or manual refresh
      fetchGlobalFile("startlist");

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
      const currentData = Array.isArray(files.startlist.data)
        ? files.startlist.data
        : [];
      const newData = currentData.filter((d: any) => d.carrera !== carreraName);

      const { error } = await supabase.from("global_files").upsert({
        id: "startlist",
        data: newData,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      fetchGlobalFile("startlist");
    } catch (err: any) {
      console.error("Error al eliminar startlist:", err);
    }
  };


  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-200">
      <Toaster position="top-center" richColors />
      <AppHeader 
        view={view}
        setView={setView}
        isAdmin={isAdmin}
        user={user}
        lastUpdated={lastUpdated}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        isLoggingIn={isLoggingIn}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isSupabaseConfigured && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-900 font-bold">
                Configuración de Supabase pendiente
              </h3>
              <p className="text-amber-700 text-sm mt-1">
                Para que la sincronización de datos funcione, debes configurar
                las variables de entorno
                <code className="mx-1 px-1 bg-amber-100 rounded">
                  VITE_SUPABASE_URL
                </code>{" "}
                y
                <code className="mx-1 px-1 bg-amber-100 rounded">
                  VITE_SUPABASE_ANON_KEY
                </code>{" "}
                en los ajustes del proyecto.
              </p>
              <div className="mt-4 p-4 bg-white/50 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wider">
                  Configuración necesaria en Supabase:
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-amber-900 mb-1">
                      1. Base de Datos (SQL Editor):
                    </p>
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
                    <p className="text-xs font-semibold text-amber-900 mb-1">
                      2. Autenticación (Providers):
                    </p>
                    <ul className="text-[10px] text-amber-800 list-disc pl-4 space-y-2">
                      <li>
                        Ve a <b>Authentication {">"} Providers</b> y activa{" "}
                        <b>Google</b>.
                      </li>
                      <li>
                        <b>SOLUCIÓN DEFINITIVA AL ERROR 403:</b>
                        <div className="mt-2 p-3 bg-red-100/50 border border-red-200 rounded-lg">
                          <p className="font-bold text-red-900 mb-1">
                            Sigue estos pasos en Google Cloud Console:
                          </p>
                          <ol className="list-decimal pl-4 space-y-1 text-red-800">
                            <li>
                              Ve a <b>"Pantalla de consentimiento de OAuth"</b>.
                            </li>
                            <li>
                              Busca el botón <b>"PUBLICAR APLICACIÓN"</b>{" "}
                              (Publish App) y púlsalo. Esto quita las
                              restricciones de "Usuarios de prueba".
                            </li>
                            <li>
                              Si prefieres no publicar, asegúrate de que tu
                              email <code>davidmv1985@gmail.com</code> aparezca
                              en la lista de <b>"Usuarios de prueba"</b> y que
                              hayas aceptado la invitación si Google envió un
                              correo.
                            </li>
                            <li>
                              En la pestaña <b>"Credenciales"</b>, verifica que
                              el "ID de cliente de OAuth 2.0" tenga la{" "}
                              <b>URI de redireccionamiento</b> de Supabase (la
                              que termina en <code>/auth/v1/callback</code>).
                            </li>
                          </ol>
                        </div>
                      </li>
                      <li>
                        En Supabase, ve a{" "}
                        <b>Authentication {">"} URL Configuration</b> y añade
                        esta URL a <b>"Redirect URLs"</b>:
                        <code className="ml-1 px-1 bg-amber-100 rounded break-all">
                          {window.location.origin + window.location.pathname}
                        </code>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "admin" ? (
          <div className="space-y-6">
            <AdminNav adminTab={adminTab} setAdminTab={setAdminTab} />
            {adminTab === "datos" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar: File Uploads (Only for Admin) */}
                <div className="lg:col-span-4 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">
                      Gestión de Datos
                    </h2>
                    <p className="text-sm text-neutral-500 mb-4">
                      Sube y sincroniza los archivos maestros del juego.
                    </p>
                  </div>

                  {!user && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                      <div className="flex gap-3">
                        <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Modo Local
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Inicia sesión para cargar y sincronizar los archivos
                            globales automáticamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {FILE_TYPES.filter((ft) => !(ft as any).hiddenInAdmin).map(
                      (ft) => {
                        const state = files[ft.id as keyof AppState];
                        const Icon = ft.icon;

                        return (
                          <div
                            key={ft.id}
                            className={cn(
                              "relative overflow-hidden border rounded-xl p-4 transition-all",
                              state.data
                                ? "bg-green-50 border-green-200"
                                : "bg-white border-neutral-200 hover:border-blue-300",
                              state.loading && "animate-pulse opacity-70",
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "p-2 rounded-lg",
                                    state.data
                                      ? "bg-green-100 text-green-700"
                                      : "bg-neutral-100 text-neutral-600",
                                  )}
                                >
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h3 className="font-medium text-sm text-neutral-900">
                                      {ft.name}
                                    </h3>
                                    {ft.global && (
                                      <Globe
                                        className="w-3 h-3 text-neutral-400"
                                        title="Archivo Global"
                                      />
                                    )}
                                  </div>
                                  <p className="text-xs text-neutral-500 mt-0.5">
                                    {state.loading
                                      ? "Sincronizando..."
                                      : state.data
                                        ? ft.global
                                          ? "Sincronizado en la nube"
                                          : state.file?.name
                                        : "Esperando archivo..."}
                                  </p>
                                  {state.updatedAt && (
                                    <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(state.updatedAt).toLocaleString(
                                        "es-ES",
                                        {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        },
                                      )}
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
                                if (file)
                                  handleFileUpload(
                                    ft.id as keyof AppState,
                                    file,
                                  );
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              title={`Subir ${ft.name}`}
                            />
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Main Content: Leaderboard */}
                <div className="lg:col-span-8">
                  <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
                    <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
                      <h2 className="text-lg font-semibold text-neutral-900 whitespace-nowrap">
                        Clasificación General
                      </h2>
                      <p className="text-sm text-neutral-500 whitespace-nowrap">
                        Resultados actualizados según los archivos cargados.
                      </p>
                    </div>

                    <div className="p-6">
                      {!leaderboard ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                            <UploadCloud className="w-8 h-8 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-neutral-900 font-medium">
                              Esperando datos
                            </h3>
                            <p className="text-neutral-500 text-sm max-w-sm mt-1">
                              Sincroniza los archivos globales (o súbelos) y
                              carga los resultados actuales para ver la
                              clasificación.
                            </p>
                          </div>
                        </div>
                      ) : leaderboard.length === 0 ? (
                        <div className="text-center py-20 text-neutral-500">
                          No se encontraron puntos. Verifica que los nombres de
                          ciclistas y carreras coincidan entre los archivos.
                        </div>
                      ) : (
                        <div
                          className="w-full"
                          style={{
                            height: Math.max(500, leaderboard.length * 40 + 60),
                          }}
                        >
                          <div className="w-full overflow-x-auto pb-4 h-full"><div className="min-w-[800px] h-full"><ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={leaderboard.map((p) => {
                                const cyclistPointsMap: Record<
                                  string,
                                  { points: number; ronda: string }
                                > = {};
                                p?.detalles?.forEach((d) => {
                                  if (!cyclistPointsMap[d.ciclista]) {
                                    cyclistPointsMap[d.ciclista] = {
                                      points: 0,
                                      ronda: d.ronda || "99",
                                    };
                                  }
                                  cyclistPointsMap[d.ciclista].points +=
                                    d.puntosObtenidos;
                                });
                                const cyclists = Object.entries(
                                  cyclistPointsMap,
                                )
                                  .map(([name, data]) => ({ name, ...data }))
                                  .sort((a, b) =>
                                    a.ronda.localeCompare(b.ronda),
                                  );

                                return {
                                  ...p,
                                  displayName: `${p.nombreEquipo} [#${p.orden}]`,
                                  cyclists,
                                };
                              })}
                              layout="vertical"
                              margin={{
                                top: 20,
                                right: 60,
                                left: 10,
                                bottom: 20,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                stroke="#f1f5f9"
                              />
                              <XAxis type="number" hide />
                              <YAxis
                                dataKey="displayName"
                                type="category"
                                width={160}
                                tick={{
                                  fontSize: 11,
                                  fontWeight: 500,
                                  fill: "#64748b",
                                }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip
                                cursor={{ fill: "#f8fafc" }}
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-xl min-w-[240px] z-50">
                                        <div className="flex items-center justify-between mb-3 border-b border-neutral-100 pb-2">
                                          <span className="font-bold text-neutral-900">
                                            {data.displayName}
                                          </span>
                                          <span className="text-blue-600 font-extrabold">
                                            {data.puntos}{" "}
                                            <span className="text-[10px] uppercase font-medium">
                                              pts
                                            </span>
                                          </span>
                                        </div>
                                        <div className="space-y-1.5">
                                          {data.cyclists.length > 0 ? (
                                            data.cyclists.map(
                                              (c: any, idx: number) => (
                                                <div
                                                  key={idx}
                                                  className="flex items-center justify-between text-[11px] gap-3"
                                                >
                                                  <span className="text-neutral-500 font-medium truncate">
                                                    <span className="text-neutral-400 mr-1.5 font-mono text-[9px]">
                                                      #{c.ronda}
                                                    </span>
                                                    {c.name}
                                                  </span>
                                                  <span className="font-bold text-neutral-700 shrink-0">
                                                    {c.points}{" "}
                                                    <span className="text-[10px] font-normal text-neutral-400">
                                                      pts
                                                    </span>
                                                  </span>
                                                </div>
                                              ),
                                            )
                                          ) : (
                                            <div className="text-[11px] text-neutral-400 italic">
                                              Sin puntos registrados
                                            </div>
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
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    fill: "#334155",
                                  }}
                                />
                                {leaderboard.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      index === 0
                                        ? "#3b82f6"
                                        : index === 1
                                          ? "#60a5fa"
                                          : index === 2
                                            ? "#93c5fd"
                                            : "#cbd5e1"
                                    }
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer></div></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {adminTab === "gestion-startlists" && (
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
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
                    <button
                      onClick={handleSaveStartlist}
                      disabled={isSavingStartlist || !startlistRace.trim()}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-sm",
                        isSavingStartlist || !startlistRace.trim()
                          ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white",
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
                          const racesWithResults = new Set(
                            (files.resultados.data || []).map(
                              (r: any) => getVal(r, "Carrera")?.trim() || "",
                            ),
                          );

                          return files.carreras.data?.map(
                            (row: any, idx: number) => {
                              const carreraName = getVal(row, "Carrera");
                              if (
                                !carreraName ||
                                racesWithResults.has(carreraName.trim())
                              )
                                return null;
                              return (
                                <option key={idx} value={carreraName}>
                                  {carreraName}
                                </option>
                              );
                            },
                          );
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
                              (acc, curr) => acc + (curr.ciclistas?.length || 0),
                              0,
                            ) || 0}{" "}
                            encontrados
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {parsedStartlist.resultados.map((res, idx) => (
                            <div
                              key={idx}
                              className="bg-white border border-neutral-200 p-2.5 rounded-lg shadow-sm"
                            >
                              <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5 mb-1.5">
                                <span className="font-bold text-neutral-800 text-xs truncate mr-2">
                                  {playerTeamMap[res.jugador] || res.jugador}{" "}
                                  {playerOrderMap[res.jugador]
                                    ? `[#${playerOrderMap[res.jugador]}]`
                                    : ""}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-full shrink-0">
                                  {res.ciclistas.length}
                                </span>
                              </div>
                              <ul className="space-y-0.5">
                                {res.ciclistas.map((c, i) => {
                                  const nombre =
                                    typeof c === "string" ? c : c.nombre;
                                  const dorsal =
                                    typeof c === "string" ? "" : c.dorsal;
                                  return (
                                    <li
                                      key={i}
                                      className="text-[11px] text-neutral-600 flex items-center gap-1.5"
                                    >
                                      <div className="w-1 h-1 rounded-full bg-blue-400 shrink-0"></div>
                                      <span className="truncate">
                                        {dorsal ? (
                                          <span className="text-neutral-400 mr-1 font-mono">
                                            {dorsal}
                                          </span>
                                        ) : null}
                                        {nombre}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {parsedStartlist.resultados.length === 0 && (
                          <div className="text-center py-10 text-neutral-500 italic text-sm">
                            No se encontró ningún ciclista de la liga en este
                            texto.
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
                  {Array.isArray(files.startlist.data) &&
                  files.startlist.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {files.startlist.data.map((sl: any, idx: number) => {
                        if (!sl || !sl.carrera) return null;
                        return (
                          <div
                            key={idx}
                            className="bg-white border border-neutral-200 rounded-lg p-3 flex justify-between items-center shadow-sm"
                          >
                            <div className="truncate pr-2">
                              <h4 className="font-semibold text-sm text-neutral-900 truncate">
                                {sl.carrera}
                              </h4>
                              <div className="flex flex-col text-[10px] text-neutral-500 mt-0.5">
                                <span>
                                  {sl.resultados?.reduce(
                                    (acc: number, curr: any) =>
                                      acc + (curr.ciclistas?.length || 0),
                                    0,
                                  )}{" "}
                                  participantes ligueros
                                </span>
                                {(sl.updatedAt ||
                                  (files.startlist as any).updatedAt) && (
                                  <span className="text-neutral-400">
                                    Actualizado:{" "}
                                    {new Date(
                                      sl.updatedAt ||
                                        (files.startlist as any).updatedAt,
                                    ).toLocaleString("es-ES")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteStartlist(sl.carrera)}
                              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                              title="Eliminar Startlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
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

            {adminTab === "reporte-carrera" && (
              <Suspense fallback={<div className="p-8 text-center text-neutral-500 font-medium animate-pulse">Cargando reporte de carrera...</div>}>
                <RaceView isAdminReport={true} files={files} selectedRace={selectedRace} setSelectedRace={setSelectedRace} uniqueRaces={uniqueRaces} leaderboard={leaderboard} globalTeamPartialWinsCount={globalTeamPartialWinsCount} raceWinners={raceWinners} globalTeamWinsCount={globalTeamWinsCount} cyclistMetadata={cyclistMetadata} />
              </Suspense>
            )}

            {adminTab === "reporte-mes" && (
              <Suspense fallback={<div className="p-8 text-center text-neutral-500 font-medium animate-pulse">Cargando reporte del mes...</div>}>
                <MonthlyReportView files={files} leaderboard={leaderboard} />
              </Suspense>
            )}

            {adminTab === "reporte-temporada" && (
              <Suspense fallback={<div className="p-8 text-center text-neutral-500 font-medium animate-pulse">Cargando reporte de temporada...</div>}>
                <SeasonReportView files={files} leaderboard={leaderboard} cyclistRoundMap={cyclistRoundMap} cyclistMetadata={cyclistMetadata} playerOrderMap={playerOrderMap} />
              </Suspense>
            )}

            {adminTab === "pruebas" && (
              <Suspense fallback={<div className="p-8 text-center text-neutral-500 font-medium animate-pulse">Cargando pruebas...</div>}>
                <TestsView cyclistMetadata={cyclistMetadata} playerOrderMap={playerOrderMap} playerTeamMap={playerTeamMap} cyclistRoundMap={cyclistRoundMap} files={files} />
              </Suspense>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Public Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-4 overflow-x-auto">
              <button
                onClick={() => setPublicTab("season")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === "season"
                    ? "bg-blue-50 text-blue-700"
                    : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                <Trophy className="w-4 h-4" />
                Resultados temporada
              </button>
              <button
                onClick={() => setPublicTab("race")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === "race"
                    ? "bg-blue-50 text-blue-700"
                    : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                <Flag className="w-4 h-4" />
                Clasificación de la carrera
              </button>
              <button
                onClick={() => setPublicTab("startlist")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === "startlist"
                    ? "bg-blue-50 text-blue-700"
                    : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                <List className="w-4 h-4" />
                Startlist carrera
              </button>
              <button
                onClick={() => setPublicTab("team")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === "team"
                    ? "bg-blue-50 text-blue-700"
                    : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                <Users className="w-4 h-4" />
                Equipos
              </button>
              <button
                onClick={() => setPublicTab("draft")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === "draft"
                    ? "bg-blue-50 text-blue-700"
                    : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                Draft
              </button>
              <button
                onClick={() => setPublicTab("info")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  publicTab === "info"
                    ? "bg-blue-50 text-blue-700"
                    : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                <Info className="w-4 h-4" />
                Información
              </button>
            </div>

            {/* Tab Content */}
            <Suspense fallback={<div className="p-8 text-center text-neutral-500 font-medium animate-pulse">Cargando pestaña...</div>}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={publicTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {publicTab === "season" && <SeasonView files={files} leaderboard={leaderboard} raceWinners={raceWinners} globalTeamPartialWinsCount={globalTeamPartialWinsCount} globalTeamWinsCount={globalTeamWinsCount} cyclistMetadata={cyclistMetadata} cyclistRoundMap={cyclistRoundMap} playerOrderMap={playerOrderMap} playerTeamMap={playerTeamMap} playerByCyclist={playerByCyclist} uniqueRaces={uniqueRaces} />}
                  {publicTab === "race" && <RaceView isAdminReport={false} files={files} selectedRace={selectedRace} setSelectedRace={setSelectedRace} uniqueRaces={uniqueRaces} leaderboard={leaderboard} globalTeamPartialWinsCount={globalTeamPartialWinsCount} raceWinners={raceWinners} globalTeamWinsCount={globalTeamWinsCount} cyclistMetadata={cyclistMetadata} />}
                  {publicTab === "team" && <TeamView files={files} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} formattedTeams={formattedTeams} leaderboard={leaderboard} raceWinners={raceWinners} globalTeamPartialWinsCount={globalTeamPartialWinsCount} cyclistMetadata={cyclistMetadata} />}
                  {publicTab === "startlist" && (
                    <StartlistView
                      files={files}
                      publicStartlistRace={publicStartlistRace}
                      setPublicStartlistRace={setPublicStartlistRace}
                      cyclistMetadata={cyclistMetadata}
                      cyclistRoundMap={cyclistRoundMap}
                      playerTeamMap={playerTeamMap}
                      playerOrderMap={playerOrderMap}
                    />
                  )}
                  {publicTab === "draft" && (
                    <DraftView
                      files={files}
                      cyclistMetadata={cyclistMetadata}
                      playerTeamMap={playerTeamMap}
                      leaderboard={leaderboard}
                      getFlagEmoji={getFlagEmoji}
                      teamToPlayerMap={teamToPlayerMap}
                      playerOrderMap={playerOrderMap}
                    />
                  )}
                  {publicTab === "info" && <InfoView files={files} infoSubTab={infoSubTab} setInfoSubTab={setInfoSubTab} memoizedPointsData={memoizedPointsData} memoizedRacesData={memoizedRacesData} raceWinners={raceWinners} />}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </div>
        )}
      </main>

      {draftDatosTooltip && draftDatosTooltip.show && (
        <div
          className="fixed z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: draftDatosTooltip.x, top: draftDatosTooltip.y }}
        >
          <div className="w-48 bg-neutral-900 text-white text-left text-xs rounded-lg shadow-xl p-3 flex flex-col gap-1.5 whitespace-nowrap">
            <div className="font-bold border-b border-neutral-700 pb-1 mb-0.5 break-words whitespace-normal">
              {draftDatosTooltip.data.cyclistName}
            </div>
            <div className="text-neutral-300">
              Equipo:{" "}
              <span className="text-white font-medium">
                {draftDatosTooltip.data.eqComp || "-"}
              </span>
            </div>
            <div className="text-neutral-300">
              Ronda:{" "}
              <span className="text-white font-medium">
                {draftDatosTooltip.data.r}
              </span>{" "}
              | Orden:{" "}
              <span className="text-white font-medium">
                {draftDatosTooltip.data.order || "-"}
              </span>
            </div>
            <div className="text-neutral-300">
              Victorias:{" "}
              <span className="text-yellow-400 font-bold">
                {draftDatosTooltip.data.wins}
              </span>
            </div>
            <div className="text-neutral-300">
              Puntos:{" "}
              <span className="text-white font-bold">
                {draftDatosTooltip.data.pts}
              </span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>
                C:{" "}
                <span className="text-white font-mono">
                  {draftDatosTooltip.data.meta.carrerasDisputadas}
                </span>
              </span>
              <span>
                DC:{" "}
                <span className="text-white font-mono">
                  {draftDatosTooltip.data.meta.diasCompeticion}
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-neutral-400">
              <span>
                {draftDatosTooltip.data.ppc.toFixed(1)}{" "}
                <span className="text-neutral-500">P/C</span>
              </span>
              <span>
                {draftDatosTooltip.data.ppdc.toFixed(1)}{" "}
                <span className="text-neutral-500">P/DC</span>
              </span>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45 border-r border-b border-neutral-900 pointer-events-none"></div>
          </div>
        </div>
      )}
    </div>
  );
}
