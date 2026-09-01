import { useDataStore } from "../stores/useDataStore";
import { AppState } from "../types";
import { useAuth } from "../auth/AuthContext";
import Papa from "papaparse";
import localforage from "localforage";
import { supabase } from "../../supabase";
import { FILE_TYPES } from "../config/fileTypes";

export function useFileUpload(isSupabaseConfigured: boolean) {
  const { setFiles, selectedSeason, activeSeason } = useDataStore();
  const { user } = useAuth();

  const handleFileUpload = (id: keyof AppState, file: File) => {
    const season = selectedSeason || "2026";
    const seasonScopedId = `${season}_${id}`;

    setFiles((prev) => ({
      ...prev,
      [id]: { file, data: null, error: null, loading: true },
    }));

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      worker: true,
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
          const parsedData = results.data;

          if (ftConfig?.global) {
            try {
              setFiles((prev) => ({
                ...prev,
                [id]: { ...prev[id], loading: true },
              }));

              const isoDate = new Date().toISOString();
              if (navigator.onLine && isSupabaseConfigured && user) {
                // Upsert season-scoped record
                const { error } = await supabase.from("global_files").upsert({
                  id: seasonScopedId,
                  data: parsedData,
                  updated_at: isoDate,
                });
                if (error) {
                  console.error("Supabase upsert season record error:", error);
                  throw new Error(`Error en la nube: ${error.message || "Permiso denegado al intentar reemplazar tabla general"}`);
                }

                // If active season, also update legacy record for seamless backwards compatibility
                if (season === activeSeason || season === "2026") {
                  await supabase.from("global_files").upsert({
                    id,
                    data: parsedData,
                    updated_at: isoDate,
                  });
                }
              }

              // Local cache update
              await localforage.setItem(`global_file_${seasonScopedId}`, {
                data: parsedData,
                updated_at: isoDate,
              });
              if (season === activeSeason || season === "2026") {
                await localforage.setItem(`global_file_${id}`, {
                  data: parsedData,
                  updated_at: isoDate,
                });
              }

              // Update local state
              setFiles((prev) => ({
                ...prev,
                [id]: {
                  file,
                  data: parsedData,
                  error: null,
                  loading: false,
                  updatedAt: isoDate,
                }
              }));
            } catch (e: any) {
              console.error("Error saving global file", e);
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

  return { handleFileUpload };
}
