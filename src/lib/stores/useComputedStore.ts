import { PlayerScore, CyclistMetadata } from '../types';
import { create } from 'zustand';



interface ComputedStore {
  isComputing: boolean;
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
  unassignedPointsLog?: {ciclista: string, carrera: string, tipoResultado: string, posicion: string, reason: string, timestamp?: number, originalIndex?: number}[];
  assignedPointsLog?: {ciclista: string, carrera: string, tipoResultado: string, posicion: string, puntos: number, etapa?: string, fecha?: string, timestamp?: number, originalIndex?: number}[];
  debugLastRows?: any[];
  
  setComputedData: (data: Partial<ComputedStore>) => void;
  setIsComputing: (val: boolean) => void;
}

export const useComputedStore = create<ComputedStore>((set) => ({
  isComputing: false,
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
  unassignedPointsLog: [],
  assignedPointsLog: [],

  setComputedData: (data) => set((state) => ({ ...state, ...data })),
  setIsComputing: (val) => set({ isComputing: val }),
}));
