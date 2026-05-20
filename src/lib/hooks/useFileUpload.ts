import { useDataStore } from "../stores/useDataStore";
import { AppState } from "../types";
import { useAuth } from "../auth/AuthContext";
import Papa from "papaparse";
import localforage from "localforage";
import { supabase } from "../../supabase";
import { FILE_TYPES } from "../config/fileTypes";

export function useFileUpload(isSupabaseConfigured: boolean) {
  const { setFiles, fetchGlobalFile } = useDataStore();
  const { user } = useAuth();

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
          const parsedData = results.data;

          if (ftConfig?.global) {
            try {
              setFiles((prev) => ({
                ...prev,
                [id]: { ...prev[id], loading: true },
              }));

              const isoDate = new Date().toISOString();
              if (navigator.onLine && isSupabaseConfigured && user) {
                const { error } = await supabase.from("global_files").upsert({
                  id,
                  data: parsedData,
                  updated_at: isoDate,
                });
                if (error) console.error("Supabase upsert manual error:", error);
              }

              await localforage.setItem(`global_file_${id}`, {
                data: parsedData,
                updated_at: isoDate,
              });

              // State will be updated by real-time subscription or manual fetch
              fetchGlobalFile(id as keyof AppState, true, isSupabaseConfigured);
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
