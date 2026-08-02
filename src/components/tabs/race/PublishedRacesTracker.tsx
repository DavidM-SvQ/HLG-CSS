import { AppState } from '../../../lib/types';
import React, { useState, useEffect } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Clock, FileCheck } from "lucide-react";
import { supabase } from "../../../supabase";
import { getVal } from "../../../lib/data-processing";
import { Skeleton } from "../../ui/Skeleton";
import { Button } from "../../ui/button";

interface PublishedRacesTrackerProps {
  files: AppState;
  uniqueRaces: string[];
}

export const PublishedRacesTracker = ({ files, uniqueRaces }: PublishedRacesTrackerProps) => {
  const [publishedRaces, setPublishedRaces] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPublishedExpanded, setIsPublishedExpanded] = useState(false);

  useEffect(() => {
    const fetchPublished = async () => {
      try {
        const { data, error } = await supabase
          .from("global_files")
          .select("data")
          .eq("id", "published_races")
          .single();
          
        if (!error && data && data.data) {
          if (typeof data.data === 'string') {
            try {
              setPublishedRaces(JSON.parse(data.data));
            } catch (e) {
              console.error("Parse error:", e);
            }
          } else if (Array.isArray(data.data)) {
            setPublishedRaces(data.data);
          }
        }
      } catch (err) {
        console.error("Error loading published races:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchPublished();
  }, []);

  const savePublished = async (newPublished: string[]) => {
    setPublishedRaces(newPublished);
    try {
      const { error } = await supabase
        .from("global_files")
        .upsert({
          id: "published_races",
          data: newPublished,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error("Supabase upsert error:", error);
      }
    } catch (err) {
      console.error("Failed to save published races to supabase", err);
    }
  };

  const toggleRace = (race: string) => {
    if (publishedRaces.includes(race)) {
      savePublished(publishedRaces.filter(r => r !== race));
    } else {
      savePublished([...publishedRaces, race]);
    }
  };

  // Determine finished races
  const finishedRacesSet = new Set<string>();
  if (files.resultados?.data) {
    files?.resultados?.data.forEach((row: any) => {
      const type = getVal(row, "Tipo")?.trim();
      if (type && type.match(/Clasificación final/i)) {
         const race = getVal(row, "Carrera")?.trim();
         if (race) finishedRacesSet.add(race);
      }
    });
  }

  const finishedRaces = Array.from(finishedRacesSet).filter(r => uniqueRaces.includes(r));
  const pendingRaces = finishedRaces.filter(r => !publishedRaces.includes(r));
  const completedRaces = finishedRaces.filter(r => publishedRaces.includes(r));

  if (!isLoaded) return <div className="p-4 mb-8 bg-white border border-neutral-200 rounded-xl"><Skeleton className="h-16 w-full" /></div>;

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <FileCheck className="w-6 h-6 text-indigo-600" />
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Estado de Publicaciones</h2>
          <p className="text-sm text-neutral-500">Controla qué carreras finalizadas se han publicado en Telegram.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending panel */}
        <div className="border border-amber-200 bg-amber-50/30 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-amber-100/50 px-4 py-3 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-amber-800">
              <Clock className="w-4 h-4" />
              Pendientes
            </div>
            <span className="bg-amber-200 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold">
              {pendingRaces.length}
            </span>
          </div>
          <div className="p-2 flex-grow overflow-y-auto max-h-[300px]">
            {pendingRaces.length === 0 ? (
              <div className="text-center p-6 text-amber-600/70 text-sm italic">
                No hay carreras pendientes de publicar.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {pendingRaces.map(race => (
                  <Button variant="outline"
                    key={race}
                    onClick={() => toggleRace(race)}
                    className="flex justify-between items-center px-3 py-2.5 rounded-lg hover:bg-white border border-transparent hover:border-amber-200 hover:shadow-sm transition-all group"
                  >
                    <span className="font-medium text-amber-900 text-sm text-left">{race}</span>
                    <div className="w-5 h-5 rounded border border-amber-300 flex items-center justify-center text-transparent group-hover:border-indigo-400 group-hover:text-indigo-200 transition-colors">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Published panel */}
        <div className="border border-green-200 bg-green-50/30 rounded-xl overflow-hidden flex flex-col">
          <Button variant="outline" 
            className="bg-green-100/50 px-4 py-3 border-b border-green-200 flex items-center justify-between hover:bg-green-100/80 transition-colors w-full text-left"
            onClick={() => setIsPublishedExpanded(!isPublishedExpanded)}
          >
            <div className="flex items-center gap-2 font-semibold text-green-800">
              <CheckCircle2 className="w-4 h-4" />
              Publicadas
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-green-200 text-green-900 text-xs px-2 py-0.5 rounded-full font-bold">
                {completedRaces.length}
              </span>
              {isPublishedExpanded ? <ChevronUp className="w-4 h-4 text-green-700" /> : <ChevronDown className="w-4 h-4 text-green-700" />}
            </div>
          </Button>
          {isPublishedExpanded && (
            <div className="p-2 flex-grow overflow-y-auto max-h-[300px]">
              {completedRaces.length === 0 ? (
                <div className="text-center p-6 text-green-600/70 text-sm italic">
                  Aún no hay carreras publicadas.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {completedRaces.map(race => (
                    <Button variant="outline"
                      key={race}
                      onClick={() => toggleRace(race)}
                      className="flex justify-between items-center px-3 py-2.5 rounded-lg hover:bg-white border border-transparent hover:border-green-200 hover:shadow-sm transition-all group opacity-70 hover:opacity-100"
                    >
                      <span className="font-medium text-green-900 text-sm line-through decoration-green-300 decoration-2 text-left">{race}</span>
                      <CheckCircle2 className="w-5 h-5 text-green-500 group-hover:text-amber-400 transition-colors" />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
