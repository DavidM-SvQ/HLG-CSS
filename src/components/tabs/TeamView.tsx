import React from "react";
import { CheckCircle2, Copy, UploadCloud } from "lucide-react";
import { useTableScreenshot } from "../../hooks/useTableScreenshot";
import { useTeamData } from "./team/hooks/useTeamData";
import { useFormattedTeams } from "./team/hooks/useFormattedTeams";

import { TeamKPIs } from "./team/TeamKPIs";
import { TeamTrophyRoom } from "./team/TeamTrophyRoom";
import { TeamCyclistsTable } from "./team/TeamCyclistsTable";
import { TeamSelector } from "./team/TeamSelector";
import { Button } from "../ui/button";
import { useUrlState } from "../../hooks/useUrlState";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";

export const TeamView = () => {
  const { files } = useDataStore();
  const { 
    leaderboard, 
    raceWinners, 
    globalTeamPartialWinsCount, 
    cyclistMetadata 
  } = useComputedStore();

  const [selectedTeam, setSelectedTeam] = useUrlState<string>("selected_team", "");

  const { ref: teamGlobalRef, isCopying: isTeamGlobalCopying, handleCopyImage, handleDownloadImage } = useTableScreenshot<HTMLDivElement>();

  const formattedTeams = useFormattedTeams(files);

  const teamComputedData = useTeamData({
    selectedTeam,
    leaderboard,
    raceWinners,
    globalTeamPartialWinsCount,
    files,
    formattedTeams,
    cyclistMetadata,
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6">
      <TeamSelector 
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        formattedTeams={formattedTeams}
      />

      {selectedTeam && teamComputedData ? (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm"
                onClick={() => handleCopyImage()}
                className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                title="Copiar imagen"
              >
                {isTeamGlobalCopying ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copiar Imagen
              </Button>
              <Button variant="ghost" size="sm"
                onClick={() => handleDownloadImage({ fileName: `equipo-${selectedTeam.replace(/\s+/g, "-").toLowerCase()}.png` })}
                className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                title="Descargar"
              >
                <UploadCloud className="w-4 h-4" />
                Descargar
              </Button>
            </div>
          </div>
          <div
            ref={teamGlobalRef}
            className="space-y-8 bg-white p-6 -mx-6 -mt-6 sm:mx-0 sm:mt-0 sm:p-6 sm:bg-white sm:border sm:border-neutral-200 sm:shadow-sm rounded-2xl"
          >
            {/* Title for image */}
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold text-neutral-900">
                {selectedTeam}
              </h2>
              <p className="text-sm text-neutral-500">
                Resumen de la temporada
              </p>
            </div>

            <TeamKPIs 
              teamPlayer={teamComputedData.teamPlayer}
              teamWins={teamComputedData.teamWins}
              teamPartialWins={teamComputedData.teamPartialWins}
              avgAge={teamComputedData.avgAge}
              unscoredCount={teamComputedData.unscoredCount}
              currentPuesto={teamComputedData.currentPuesto}
              difConOrden={teamComputedData.difConOrden}
            />

            <div>
              <TeamTrophyRoom 
                teamWins={teamComputedData.teamWins}
                raceWinners={raceWinners}
                selectedTeam={selectedTeam}
                teamPlayer={teamComputedData.teamPlayer}
                files={files}
              />

              <h3 className="font-semibold text-xl text-neutral-900 border-b pb-3 mb-4 flex items-center gap-2">
                Plantilla del Equipo
              </h3>
              
              <TeamCyclistsTable cyclistStats={teamComputedData.cyclistStats} />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-neutral-500">
          Selecciona un equipo para ver sus estadísticas y plantilla.
        </div>
      )}
    </div>
  );
};
