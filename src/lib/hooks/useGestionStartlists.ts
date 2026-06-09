import { useState } from "react";
import { supabase } from "../../supabase";
import localforage from "localforage";
import { AppState } from "../types";

export function useGestionStartlists(
  files: AppState, 
  user: any, 
  playerByCyclist: Record<string, string>, 
  playerTeamMap: Record<string, string>,
  isSupabaseConfigured: boolean,
  fetchGlobalFile: (id: string, force?: boolean, isSupabaseConfigured?: boolean) => Promise<void>
) {
  const [startlistText, setStartlistText] = useState("");
  const [startlistRace, setStartlistRace] = useState("");
  const [parsedStartlist, setParsedStartlist] = useState<{
    carrera: string;
    resultados: { jugador: string; ciclistas: any[] }[];
    rawText?: string;
    updatedAt?: string;
  } | null>(null);
  const [isSavingStartlist, setIsSavingStartlist] = useState(false);

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
      const parts = cyclist.split(" ").filter(Boolean);
      const isUpperCase = (str: string) => str === str.toUpperCase() && str !== str.toLowerCase();
      const lastNames = parts.filter(isUpperCase).join(" ");
      const firstNames = parts.filter(p => !isUpperCase(p)).join(" ");
      
      const cyclistStandard = cyclist.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cyclistNoComma = cyclistStandard.replace(/,/g, "");
      const cyclistReversed = `${firstNames} ${lastNames}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const cyclistReversed2 = `${lastNames} ${firstNames}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

      const lineIndex = textLinesLower.findIndex((line) => {
        const lNoComma = line.replace(/,/g, "");
        
        const createRegex = (nameStr: string) => {
          // Escape special regex chars just in case (though names shouldn't have many)
          const escapedStr = nameStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return new RegExp(`\\b${escapedStr.replace(/ /g, '\\s+')}\\b`, "i");
        };

        return createRegex(cyclistStandard).test(lNoComma) || 
               createRegex(cyclistNoComma).test(lNoComma) || 
               createRegex(cyclistReversed).test(lNoComma) ||
               createRegex(cyclistReversed2).test(lNoComma);
      });

      if (lineIndex !== -1) {
        const originalLine = textLines[lineIndex];
        const lineParts = originalLine.split(/[\s\t]+/);
        let dorsal = "";
        if (lineParts.length > 0) {
          const match = originalLine.trim().match(/^([0-9]+[a-zA-Z]?)[^\w]/) || originalLine.trim().match(/^([0-9]+[a-zA-Z]?)$/);
          if (match) {
            dorsal = match[1];
          } else {
            // fallback, check first word
            const firstWord = lineParts[0].replace(/[^a-zA-Z0-9]/g, '');
            if (/^[0-9]+[a-zA-Z]?$/.test(firstWord)) {
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
      rawText: startlistText,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveStartlist = async () => {
    if (!parsedStartlist) return;
    setIsSavingStartlist(true);

    try {
      // files.startlist.data is actually expected to be the json array now
      const currentData = Array.isArray(files.startlist.data)
        ? files.startlist.data
        : [];

      // Upsert: replace if same name, otherwise push
      const existingIdx = currentData?.findIndex(
        (d: any) => d.carrera === parsedStartlist.carrera,
      );
      const newData = [...currentData];

      if (existingIdx !== -1) {
        newData[existingIdx] = parsedStartlist;
      } else {
        newData.push(parsedStartlist);
      }

      const isoDate = new Date().toISOString();
      if (navigator.onLine && isSupabaseConfigured && user) {
        const { error } = await supabase.from("global_files").upsert({
          id: "startlist",
          data: newData,
          updated_at: isoDate,
        });
        if (error) console.error("Supabase upsert error:", error);
      }

      await localforage.setItem("global_file_startlist", {
        data: newData,
        updated_at: isoDate,
      });

      await fetchGlobalFile("startlist", true, isSupabaseConfigured);

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

  const handleDeleteStartlist = async (carrera: string) => {
    try {
      const currentData = Array.isArray(files.startlist.data) ? files.startlist.data : [];
      const newData = currentData.filter((d: any) => d.carrera !== carrera);
      
      const isoDate = new Date().toISOString();
      if (navigator.onLine && isSupabaseConfigured && user) {
        const { error } = await supabase.from("global_files").upsert({
          id: "startlist",
          data: newData,
          updated_at: isoDate,
        });
        if (error) console.error("Supabase delete error:", error);
      }

      await localforage.setItem("global_file_startlist", {
        data: newData,
        updated_at: isoDate,
      });

      await fetchGlobalFile("startlist", true, isSupabaseConfigured);

    } catch (err: any) {
      console.error("Error deleting startlist:", err);
    }
  };

  const handleDeleteAllStartlists = async () => {
    try {
      const isoDate = new Date().toISOString();
      if (navigator.onLine && isSupabaseConfigured && user) {
        const { error } = await supabase.from("global_files").upsert({
          id: "startlist",
          data: [],
          updated_at: isoDate,
        });
        if (error) console.error("Supabase delete all error:", error);
      }

      await localforage.setItem("global_file_startlist", {
        data: [],
        updated_at: isoDate,
      });

      await fetchGlobalFile("startlist", true, isSupabaseConfigured);

    } catch (err: any) {
      console.error("Error deleting all startlists:", err);
    }
  };

  return {
    startlistText,
    setStartlistText,
    startlistRace,
    setStartlistRace,
    parsedStartlist,
    isSavingStartlist,
    handleParseStartlist,
    handleSaveStartlist,
    handleDeleteStartlist,
    handleDeleteAllStartlists
  };
}
