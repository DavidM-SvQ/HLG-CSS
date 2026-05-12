import React, { useState, useMemo, useRef } from "react";
import { CheckCircle2, Copy, UploadCloud } from "lucide-react";
import { domToDataUrl } from "modern-screenshot";
import { copyImageToClipboard } from "../../lib/clipboard";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { getVal } from "../../lib/data-processing";

import { TeamKPIs } from "./team/TeamKPIs";
import { TeamTrophyRoom } from "./team/TeamTrophyRoom";
import { TeamCyclistsTable } from "./team/TeamCyclistsTable";

export interface TeamViewProps {
  files: any;
  selectedTeam: string;
  setSelectedTeam: (val: string) => void;
  formattedTeams: any[];
  leaderboard: any[];
  raceWinners: Record<string, string>;
  globalTeamPartialWinsCount: any;
  cyclistMetadata: any;
}

export const TeamView = (props: TeamViewProps) => {
  const {
    files,
    selectedTeam,
    setSelectedTeam,
    formattedTeams,
    leaderboard,
    raceWinners,
    globalTeamPartialWinsCount,
    cyclistMetadata,
  } = props;

  const [isTeamGlobalCopying, setIsTeamGlobalCopying] = useState(false);
  const teamGlobalRef = useRef<HTMLDivElement>(null);

  const handleCopyTeamGlobalImage = async () => {
    if (!teamGlobalRef.current || isTeamGlobalCopying) return;
    setIsTeamGlobalCopying(true);

    const restore = expandNodeForCapture(teamGlobalRef.current);
    teamGlobalRef.current.style.setProperty("display", "block", "important");

    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const processCopy = async () => {
        const dataUrl = await domToDataUrl(teamGlobalRef.current!, {
          scale: 3,
          backgroundColor: "#ffffff",
          style: { overflow: "visible" },
        });
        const response = await fetch(dataUrl);
        return await response.blob();
      };
      await copyImageToClipboard(processCopy(), "export.png");
      setTimeout(() => setIsTeamGlobalCopying(false), 2000);
    } catch (err) {
      console.warn("Error during copy fallback", err);
    } finally {
      restore();
    }
  };

  const handleDownloadTeamGlobalImage = async () => {
    if (!teamGlobalRef.current) return;

    const restore = expandNodeForCapture(teamGlobalRef.current);
    teamGlobalRef.current.style.setProperty("display", "block", "important");

    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const dataUrl = await domToDataUrl(teamGlobalRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        style: { overflow: "visible" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `equipo-${selectedTeam.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading team image:", err);
    } finally {
      restore();
    }
  };

  const teamComputedData = useMemo(() => {
    if (!selectedTeam) return null;

    const teamPlayer = leaderboard?.find((p) => p.nombreEquipo === selectedTeam);
    const teamWins = Object.values(raceWinners).filter((w) => w === selectedTeam).length;
    const teamPartialWins = globalTeamPartialWinsCount.totals[selectedTeam] || 0;

    const teamCyclistsData = files.elecciones.data?.filter(
      (r: any) => (getVal(r, "Nombre_Equipo") || getVal(r, "Nombre_TG")) === selectedTeam
    ) || [];

    const ages = teamCyclistsData
      .map((c: any) => parseInt(getVal(c, "Edad")))
      .filter((a: number) => !isNaN(a));
      
    const avgAge = ages.length > 0 ? (ages.reduce((a: number, b: number) => a + b, 0) / ages.length).toFixed(1) : "-";

    const currentPuesto = leaderboard
      ? leaderboard?.findIndex((p) => p.nombreEquipo === selectedTeam) + 1
      : 0;
      
    const draftOrder = formattedTeams
      .find((t) => t.value === selectedTeam)
      ?.label.match(/\[#(\d+)\]/)?.[1];
      
    const draftOrderNum = draftOrder ? parseInt(draftOrder) : 0;
    const difConOrden = draftOrderNum - currentPuesto;

    const cyclistStats = teamCyclistsData.map((c: any) => {
      const ciclista = getVal(c, "Ciclista");
      const details = teamPlayer?.detalles.filter((d: any) => d.ciclista === ciclista) || [];

      const puntos = details.reduce((sum: number, d: any) => sum + d.puntosObtenidos, 0);

      const victorias = details.filter((d: any) => {
        const isPos01 = d.posicion === "01" || d.posicion === "1";
        const isValidType = [
          "Etapa",
          "Etapa (Crono equipos)",
          "Clasificación final",
          "Clasificación final (Crono equipos)",
        ].includes(d.tipoResultado);
        return isPos01 && isValidType;
      }).length;

      const metadata = cyclistMetadata[ciclista] || {
        edad: "-",
        pais: "-",
        equipoBreve: "-",
        ronda: "-",
        carrerasDisputadas: 0,
        diasCompeticion: 0,
      };

      return {
        ciclista,
        ronda: metadata.ronda,
        edad: metadata.edad || getVal(c, "Edad") || "-",
        pais: metadata.pais,
        equipoBreve: metadata.equipoBreve,
        puntos,
        victorias,
        carrerasDisputadas: metadata.carrerasDisputadas,
        diasCompeticion: metadata.diasCompeticion,
        puntosPorCarrera: metadata.carrerasDisputadas > 0 ? (puntos / metadata.carrerasDisputadas).toFixed(1) : "0.0",
        puntosPorDia: metadata.diasCompeticion > 0 ? (puntos / metadata.diasCompeticion).toFixed(1) : "0.0",
        pointsPct: (teamPlayer?.puntos || 0) > 0 ? (puntos / teamPlayer!.puntos) * 100 : 0,
      };
    });

    const unscoredCount = cyclistStats.filter((c: any) => c.puntos === 0).length;

    return {
      teamPlayer,
      teamWins,
      teamPartialWins,
      avgAge,
      currentPuesto,
      draftOrderNum,
      difConOrden,
      cyclistStats,
      unscoredCount,
    };
  }, [
    selectedTeam,
    leaderboard,
    raceWinners,
    globalTeamPartialWinsCount,
    files,
    formattedTeams,
    cyclistMetadata,
  ]);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6">
      <div className="max-w-md mb-8">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Selecciona tu equipo
        </label>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">-- Seleccionar Equipo --</option>
          {formattedTeams.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && teamComputedData ? (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTeamGlobalImage}
                className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                title="Copiar imagen"
              >
                {isTeamGlobalCopying ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copiar Imagen
              </button>
              <button
                onClick={handleDownloadTeamGlobalImage}
                className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                title="Descargar"
              >
                <UploadCloud className="w-4 h-4" />
                Descargar
              </button>
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
