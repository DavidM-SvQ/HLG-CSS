import { create } from 'zustand';

export interface PlayerScore {
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
}

interface ComputedStore {
  leaderboard: PlayerScore[];
  raceWinners: Record<string, string>;
  globalTeamWinsCount: Record<string, number>;
  globalTeamPartialWinsCount: { totals: Record<string, number>; byRace: Record<string, Record<string, string[]>> };
  uniqueRaces: string[];
  cyclistMetadata: Record<string, CyclistMetadata>;
  playerOrderMap: Record<string, string>;
  playerByCyclist: Record<string, string>;
  playerTeamMap: Record<string, string>;
  teamToPlayerMap: Record<string, string>;
  cyclistRoundMap: Record<string, string>;
  
  setComputedData: (data: Partial<ComputedStore>) => void;
}

export const useComputedStore = create<ComputedStore>((set) => ({
  leaderboard: [],
  raceWinners: {},
  globalTeamWinsCount: {},
  globalTeamPartialWinsCount: { totals: {}, byRace: {} },
  uniqueRaces: [],
  cyclistMetadata: {},
  playerOrderMap: {},
  playerByCyclist: {},
  playerTeamMap: {},
  teamToPlayerMap: {},
  cyclistRoundMap: {},

  setComputedData: (data) => set((state) => ({ ...state, ...data })),
}));
