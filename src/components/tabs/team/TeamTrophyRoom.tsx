import { AppState } from '../../../lib/types';
import React from "react";
import { Trophy } from "lucide-react";
import { getVal } from "../../../lib/data-processing";

interface TeamTrophyRoomProps {
  teamWins: number;
  raceWinners: Record<string, string>;
  selectedTeam: string;
  teamPlayer: any;
  files: AppState;
}

export const TeamTrophyRoom = ({
  teamWins,
  raceWinners,
  selectedTeam,
  teamPlayer,
  files,
}: TeamTrophyRoomProps) => {
  return (
    <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 mb-6">
      <h3 className="text-xs font-bold text-neutral-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
        <Trophy className="w-3 h-3 text-yellow-500" />
        Sala de Trofeos ({teamWins})
      </h3>
      {teamWins > 0 ? (
        <div className="flex flex-wrap gap-2">
          {Object.entries(raceWinners)
            .filter(([_, winner]) => winner === selectedTeam)
            .map(([race]) => {
              // Sum points for all cyclists of the team in this specific race
              const points =
                teamPlayer?.detalles
                  ?.filter((d: any) => d.carrera === race)
                  ?.reduce((sum: number, d: any) => sum + d.puntosObtenidos, 0) || 0;

              // Calculate total points for the race category to determine importance
              const raceData = files.carreras.data?.find(
                (r: any) => getVal(r, "Carrera") === race,
              );
              const category = raceData ? getVal(raceData, "Categoría") : null;
              const totalRacePoints = category
                ? files.puntos.data
                    ?.filter((p: any) => getVal(p, "Categoría") === category)
                    ?.reduce(
                      (sum: number, p: any) =>
                        sum + (parseInt(getVal(p, "Puntos")) || 0),
                      0,
                    ) || 0
                : 0;

              return { race, points, totalRacePoints };
            })
            .sort((a, b) => b.totalRacePoints - a.totalRacePoints)
            .map(({ race, points }) => (
              <div
                key={race}
                className="bg-white border border-neutral-200 rounded-lg px-3 py-2 flex items-center gap-2.5 shadow-sm"
              >
                <Trophy className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                <span className="text-xs font-medium text-neutral-800 whitespace-nowrap">
                  {race}
                </span>
                <span className="text-xs font-bold text-blue-600 flex-shrink-0 whitespace-nowrap">
                  {points} pts
                </span>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-400 italic">Aún no hay victorias...</p>
      )}
    </div>
  );
};
