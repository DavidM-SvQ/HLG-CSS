import { useState } from "react";

export function useUIState() {
  const [seasonSubTab, setSeasonSubTab] = useState("puntos");
  const [cyclistsSubTab, setCyclistsSubTab] = useState("draft");

  return {
    seasonSubTab, setSeasonSubTab,
    cyclistsSubTab, setCyclistsSubTab,
  };
}
