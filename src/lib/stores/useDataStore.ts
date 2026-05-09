import { create } from 'zustand';

export interface FileState {
  file: File | null;
  data: any[] | null;
  error: string | null;
  loading?: boolean;
  updatedAt?: string;
}

export interface AppState {
  carreras: FileState;
  ciclistas: FileState;
  elecciones: FileState;
  equipos: FileState;
  puntos: FileState;
  resultados: FileState;
  startlist: FileState;
}

const initialFileState: FileState = { file: null, data: null, error: null, loading: true };

interface DataStore {
  files: AppState;
  setFiles: (updater: AppState | ((prev: AppState) => AppState)) => void;
  updateFile: (fileKey: keyof AppState, state: Partial<FileState>) => void;
}

export const useDataStore = create<DataStore>((set) => ({
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
  }))
}));
