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

  setComputedData: (data) => set((state) => ({ ...state, ...data })),
  setIsComputing: (val) => set({ isComputing: val }),
}));
