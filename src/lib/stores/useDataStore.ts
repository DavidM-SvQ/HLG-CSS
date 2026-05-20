import { create } from 'zustand';
import { supabase } from '../../supabase';
import localforage from 'localforage';

import { AppState, FileState } from '../types';

const initialFileState: FileState = { file: null, data: null, error: null, loading: true };

interface DataStore {
  files: AppState;
  setFiles: (updater: AppState | ((prev: AppState) => AppState)) => void;
  updateFile: (fileKey: keyof AppState, state: Partial<FileState>) => void;
  
  // New actions mapping to the hybrid cache logic
  fetchGlobalFile: (id: keyof AppState, force?: boolean, isSupabaseConfigured?: boolean) => Promise<void>;
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
  },
  
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

  fetchGlobalFile: async (id, force = false, isSupabaseConfigured = false) => {
    try {
      const cachedEntry: any = await localforage.getItem(`global_file_${id}`);

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
          supabase
            .from("global_files")
            .select("updated_at")
            .eq("id", id)
            .single()
            .then(({ data: metaData, error: metaError }) => {
              if (!metaError && metaData && metaData.updated_at !== cachedEntry.updated_at) {
                get().fetchGlobalFile(id, true, isSupabaseConfigured);
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

      const { data, error } = await supabase
        .from("global_files")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        await localforage.setItem(`global_file_${id}`, {
          data: data.data,
          updated_at: data.updated_at,
        });
        
        set((prev) => ({
          files: {
            ...prev.files,
            [id]: {
              file: null,
              data: data.data,
              error: null,
              loading: false,
              updatedAt: data.updated_at,
            }
          }
        }));
      } else {
        set((prev) => ({
          files: { ...prev.files, [id]: { ...prev.files[id], loading: false } }
        }));
      }
    } catch (e) {
      console.error(`Error in fetchGlobalFile for ${id}:`, e);
      set((prev) => ({
        files: { ...prev.files, [id]: { ...prev.files[id], loading: false } }
      }));
    }
  },

  initializeGlobalFiles: (isSupabaseConfigured) => {
    const essentialFiles: (keyof AppState)[] = ["carreras", "ciclistas", "elecciones", "equipos", "puntos", "resultados"];
    // Also include startlist
    const allGlobalFiles: (keyof AppState)[] = [...essentialFiles, "startlist"];
    
    allGlobalFiles.forEach((id) => {
      get().fetchGlobalFile(id, false, isSupabaseConfigured);
    });
  }
}));
