import { useMemo } from 'react';
import { AppState } from '../../../../lib/types';
import { getVal } from '../../../../lib/data-processing';

export function useFormattedTeams(files: AppState | null) {
  return useMemo(() => {
    if (!files || !files.elecciones || !files.elecciones.data) return [];

    const teamData: Record<string, string> = {}; // teamName -> order
    const uniquePlayers = [
      ...new Set(
        files.elecciones.data
          .map((r: any) => getVal(r, "Nombre_TG")?.trim())
          .filter(Boolean),
      ),
    ] as string[];

    files.elecciones?.data?.forEach((row: any) => {
      const jugador = getVal(row, "Nombre_TG")?.trim();
      const nombreEquipo = getVal(row, "Nombre_Equipo")?.trim() || jugador;
      if (jugador && nombreEquipo && !teamData[nombreEquipo]) {
        const playerIdx = uniquePlayers.indexOf(jugador);
        const order = (playerIdx + 1).toString().padStart(2, "0");
        teamData[nombreEquipo] = order;
      }
    });

    return Object.entries(teamData)
      .map(([name, order]) => ({
        label: `${name} [#${order}]`,
        value: name,
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [files]);
}
