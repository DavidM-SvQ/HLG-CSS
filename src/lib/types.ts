export type ParsedData = Record<string, any>[];

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface FileState {
  file: File | null;
  data: ParsedData | null;
  error: string | null;
  loading?: boolean;
  updatedAt?: string;
}

export interface SeasonOption {
  id: string;
  label: string;
  visible: boolean;
}

export interface AppState {
  carreras: FileState;
  ciclistas: FileState;
  elecciones: FileState;
  equipos: FileState;
  puntos: FileState;
  resultados: FileState;
  startlist: FileState;
  configuracion: FileState;
}


export interface PlayerScoreDetail {
  ciclista: string;
  ronda?: string;
  carrera: string;
  tipoResultado?: string;
  etapa?: string;
  posicion?: string | number;
  puntosObtenidos: number;
  fecha?: string;
}

export interface PlayerScore {
  pos?: number;
  jugador: string;
  nombreEquipo: string;
  orden?: string;
  puntos: number;
  detalles: PlayerScoreDetail[];
}

export interface CyclistMetadata {
  edad: string;
  nacido: string;
  pais: string;
  paisLetras: string;
  equipoBreve: string;
  ronda: string;
  eleccion: number;
  carrerasDisputadas: number;
  diasCompeticion: number;
  victorias: number;
  puntosTotales?: number;
  puntosPorCarrera?: Record<string, number>;
  fcId?: string;
  foto?: string;
}

export interface TopTeamStat {
  jugador: string;
  nombreEquipo: string;
  orden?: string;
  puntos: number;
  originalPos: number;
  wins: number;
  partialWins: number;
  ppc: number;
  ppd: number;
  numCarreras: number;
  totalDays: number;
}

export interface TopDraftStat {
  ciclista: string;
  puntos: number;
  jugador: string;
  nombreEquipo: string;
  orden: string;
  ronda: string;
  pais: string;
  victorias: number;
  carreras: Set<string>;
  dias: number;
  numCarreras: number;
  ppc: number;
  ppd: number;
  originalIndex: number;
}

export interface StartlistTeamRow {
  ciclista_nombre: string;
  equipo_uci: string;
  team: string;
}
