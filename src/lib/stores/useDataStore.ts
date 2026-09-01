import { create } from 'zustand';
import { supabase } from '../../supabase';
import localforage from 'localforage';

import { AppState, FileState, SeasonOption } from '../types';

const initialFileState: FileState = { file: null, data: null, error: null, loading: true };

const defaultSeasonOptions: SeasonOption[] = [
  { id: "2026", label: "Temporada 2026 (En curso)", visible: true },
  { id: "2027", label: "Temporada 2027 (Histórico)", visible: true }
];

export const parseSeasonConfigFromData = (data: any[]): { activeSeason?: string; availableSeasons?: string[]; seasonOptions?: SeasonOption[] } => {
  if (!Array.isArray(data)) return {};

  const activeSeasonVal = data.find((item: any) => item.key === "active_season")?.value;
  const availableSeasonsVal = data.find((item: any) => item.key === "available_seasons")?.value;
  const seasonOptionsVal = data.find((item: any) => item.key === "season_options")?.value;

  const activeSeason = activeSeasonVal ? String(activeSeasonVal) : undefined;
  let seasonOptions: SeasonOption[] | undefined;
  let availableSeasons: string[] | undefined;

  if (seasonOptionsVal) {
    try {
      const parsed = typeof seasonOptionsVal === "string" ? JSON.parse(seasonOptionsVal) : seasonOptionsVal;
      if (Array.isArray(parsed) && parsed.length > 0) {
        seasonOptions = parsed.map((item: any) => ({
          id: String(item.id || item.value || ""),
          label: String(item.label || item.name || item.id || ""),
          visible: item.visible !== false,
        })).filter(o => o.id);
        availableSeasons = seasonOptions.map(o => o.id);
      }
    } catch (e) {
      console.warn("Could not parse season_options:", e);
    }
  }

  if (!seasonOptions && availableSeasonsVal) {
    try {
      const parsed = typeof availableSeasonsVal === "string" ? JSON.parse(availableSeasonsVal) : availableSeasonsVal;
      if (Array.isArray(parsed) && parsed.length > 0) {
        availableSeasons = parsed.map(String);
      }
    } catch {
      if (typeof availableSeasonsVal === "string") {
        availableSeasons = availableSeasonsVal.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }

    if (availableSeasons && availableSeasons.length > 0) {
      const currentActive = activeSeason || "2026";
      seasonOptions = availableSeasons.map(s => ({
        id: s,
        label: s === currentActive ? `${s} (En curso)` : `${s} (Histórico)`,
        visible: true,
      }));
    }
  }

  return { activeSeason, availableSeasons, seasonOptions };
};

interface DataStore {
  files: AppState;
  selectedSeason: string;
  activeSeason: string;
  availableSeasons: string[];
  seasonOptions: SeasonOption[];
  setFiles: (updater: AppState | ((prev: AppState) => AppState)) => void;
  updateFile: (fileKey: keyof AppState, state: Partial<FileState>) => void;
  setSelectedSeason: (season: string, isSupabaseConfigured?: boolean) => Promise<void>;
  setActiveSeason: (season: string) => void;
  setAvailableSeasons: (seasons: string[]) => void;
  setSeasonOptions: (options: SeasonOption[]) => void;
  
  // Hybrid cache actions
  fetchGlobalFile: (id: keyof AppState, force?: boolean, isSupabaseConfigured?: boolean, seasonOverride?: string) => Promise<void>;
  initializeGlobalFiles: (isSupabaseConfigured: boolean) => void;
}

export const useDataStore = create<DataStore>((set, get) => ({
  files: {
    carreras: initialFileState,
    ciclistas: initialFileState,
    elecciones: initialFileState,
    equipos: initialFileState,
    puntos: initialFileState,
    resultados: initialFileState,
    startlist: initialFileState,
    configuracion: initialFileState,
  },
  selectedSeason: "2026",
  activeSeason: "2026",
  availableSeasons: ["2026", "2027"],
  seasonOptions: defaultSeasonOptions,
  
  setFiles: (updater) => set((state) => ({
    files: typeof updater === 'function' ? updater(state.files) : updater
  })),
  
  updateFile: (fileKey, chunk) => set((state) => ({
    files: {
      ...state.files,
      [fileKey]: {
        ...state.files[fileKey],
        ...chunk
      }
    }
  })),

  setActiveSeason: (season: string) => set({ activeSeason: season }),
  setAvailableSeasons: (seasons: string[]) => set({ availableSeasons: seasons }),
  setSeasonOptions: (options: SeasonOption[]) => set({ 
    seasonOptions: options,
    availableSeasons: options.map(o => o.id)
  }),

  setSelectedSeason: async (season: string, isSupabaseConfigured = false) => {
    set({ selectedSeason: season });
    const essentialFiles: (keyof AppState)[] = ["carreras", "ciclistas", "elecciones", "equipos", "puntos", "resultados", "startlist"];
    
    // Put them in loading state
    set((prev) => ({
      files: {
        ...prev.files,
        ...essentialFiles.reduce((acc, k) => ({
          ...acc,
          [k]: { ...prev.files[k], loading: true, data: null, error: null }
        }), {})
      }
    }));

    // Fetch in parallel for this season
    await Promise.all(
      essentialFiles.map((id) => get().fetchGlobalFile(id, false, isSupabaseConfigured, season))
    );
  },

  fetchGlobalFile: async (id, force = false, isSupabaseConfigured = false, seasonOverride?: string) => {
    try {
      if (id === "configuracion") {
        // Global configuration is shared across seasons
        const cachedEntry: any = await localforage.getItem("global_file_configuracion");

        if (cachedEntry) {
          set((prev) => ({
            files: {
              ...prev.files,
              configuracion: {
                ...prev.files.configuracion,
                data: cachedEntry.data,
                loading: false,
                updatedAt: cachedEntry.updated_at,
              }
            }
          }));

          // Process season settings from cache if present
          if (Array.isArray(cachedEntry.data)) {
            const { activeSeason, availableSeasons, seasonOptions } = parseSeasonConfigFromData(cachedEntry.data);
            if (activeSeason) set({ activeSeason });
            if (availableSeasons) set({ availableSeasons });
            if (seasonOptions) set({ seasonOptions });
          }
        }

        if (isSupabaseConfigured && navigator.onLine) {
          const { data, error } = await supabase
            .from("global_files")
            .select("*")
            .eq("id", "configuracion")
            .single();

          if (!error && data) {
            await localforage.setItem("global_file_configuracion", {
              data: data.data,
              updated_at: data.updated_at,
            });

            set((prev) => ({
              files: {
                ...prev.files,
                configuracion: {
                  file: null,
                  data: data.data,
                  error: null,
                  loading: false,
                  updatedAt: data.updated_at,
                }
              }
            }));

            if (Array.isArray(data.data)) {
              const { activeSeason, availableSeasons, seasonOptions } = parseSeasonConfigFromData(data.data);
              if (activeSeason) {
                set({ activeSeason });
                // If user hasn't explicitly picked a different season yet, sync selectedSeason
                const currentSelected = get().selectedSeason;
                if (!currentSelected || currentSelected === "2026") {
                  set({ selectedSeason: activeSeason });
                }
              }
              if (availableSeasons) set({ availableSeasons });
              if (seasonOptions) set({ seasonOptions });
            }
          } else {
            set((prev) => ({
              files: { ...prev.files, configuracion: { ...prev.files.configuracion, loading: false } }
            }));
          }
        }
        return;
      }

      // For seasonal data files (carreras, resultados, ciclistas, equipos, elecciones, puntos, startlist)
      const season = seasonOverride || get().selectedSeason || get().activeSeason || "2026";
      const seasonScopedId = `${season}_${id}`;
      const legacyId = id;

      // 1. Try localforage for seasonScopedId first, then legacyId
      let cachedEntry: any = await localforage.getItem(`global_file_${seasonScopedId}`);
      if (!cachedEntry && season === "2026") {
        cachedEntry = await localforage.getItem(`global_file_${legacyId}`);
      }

      if (!isSupabaseConfigured) {
        if (cachedEntry) {
          set((prev) => ({
            files: {
              ...prev.files,
              [id]: {
                ...prev.files[id],
                data: cachedEntry.data,
                loading: false,
                updatedAt: cachedEntry.updated_at,
              }
            }
          }));
        } else {
          set((prev) => ({
            files: { ...prev.files, [id]: { ...prev.files[id], loading: false } }
          }));
        }
        return;
      }
      
      if (!force && cachedEntry) {
        set((prev) => ({
          files: {
            ...prev.files,
            [id]: {
              file: null,
              data: cachedEntry.data,
              error: null,
              loading: false,
              updatedAt: cachedEntry.updated_at,
            }
          }
        }));
        
        if (navigator.onLine) {
          // Check if remote version is newer
          supabase
            .from("global_files")
            .select("updated_at, id")
            .or(`id.eq.${seasonScopedId},id.eq.${legacyId}`)
            .then(({ data: metaList }) => {
              const matched = metaList?.find(m => m.id === seasonScopedId) || metaList?.find(m => m.id === legacyId);
              if (matched && matched.updated_at !== cachedEntry.updated_at) {
                get().fetchGlobalFile(id, true, isSupabaseConfigured, season);
              }
            });
        }
        return;
      }

      if (!navigator.onLine) {
        set((prev) => ({
          files: { ...prev.files, [id]: { ...prev.files[id], loading: false, error: "Offline" } }
        }));
        return;
      }

      // Query Supabase: first for seasonScopedId
      let remoteData: any = null;
      let remoteUpdatedAt: string | undefined;

      const { data: scopedRecord } = await supabase
        .from("global_files")
        .select("*")
        .eq("id", seasonScopedId)
        .maybeSingle();

      if (scopedRecord) {
        remoteData = scopedRecord.data;
        remoteUpdatedAt = scopedRecord.updated_at;
      } else {
        // Fallback to legacy id (e.g. for initial 2026 data)
        const { data: legacyRecord } = await supabase
          .from("global_files")
          .select("*")
          .eq("id", legacyId)
          .maybeSingle();

        if (legacyRecord) {
          remoteData = legacyRecord.data;
          remoteUpdatedAt = legacyRecord.updated_at;
        }
      }

      if (remoteData) {
        await localforage.setItem(`global_file_${seasonScopedId}`, {
          data: remoteData,
          updated_at: remoteUpdatedAt,
        });
        
        set((prev) => ({
          files: {
            ...prev.files,
            [id]: {
              file: null,
              data: remoteData,
              error: null,
              loading: false,
              updatedAt: remoteUpdatedAt,
            }
          }
        }));
      } else {
        set((prev) => ({
          files: { ...prev.files, [id]: { ...prev.files[id], loading: false, data: null } }
        }));
      }
    } catch (e) {
      console.error(`Error in fetchGlobalFile for ${id} (season: ${seasonOverride || get().selectedSeason}):`, e);
      set((prev) => ({
        files: { ...prev.files, [id]: { ...prev.files[id], loading: false } }
      }));
    }
  },

  initializeGlobalFiles: (isSupabaseConfigured) => {
    // First fetch global configuracion
    get().fetchGlobalFile("configuracion", false, isSupabaseConfigured);

    // Fetch essential files for current season
    const essentialFiles: (keyof AppState)[] = ["carreras", "ciclistas", "elecciones", "equipos", "puntos", "resultados", "startlist"];
    essentialFiles.forEach((id) => {
      get().fetchGlobalFile(id, false, isSupabaseConfigured);
    });
  }
}));
