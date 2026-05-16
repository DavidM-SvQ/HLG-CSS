import { useUrlState } from "../../../../hooks/useUrlState";

export function useUIState() {
  const [seasonSubTab, setSeasonSubTab] = useUrlState<"puntos" | "victorias" | "ciclistas">("seasonSubTab", "puntos");
  const [cyclistsSubTab, setCyclistsSubTab] = useUrlState<"draft" | "no-draft" | "detalle">("cyclistsSubTab", "draft");

  return {
    seasonSubTab, setSeasonSubTab,
    cyclistsSubTab, setCyclistsSubTab,
  };
}
