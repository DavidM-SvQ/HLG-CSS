import { useState } from "react";

export function useUIState() {
  const [seasonSubTab, setSeasonSubTab] = useState("puntos");
  const [cyclistsSubTab, setCyclistsSubTab] = useState("draft");
  const [selectedCyclistDetail, setSelectedCyclistDetail] = useState("");

  return {
    seasonSubTab, setSeasonSubTab,
    cyclistsSubTab, setCyclistsSubTab,
    selectedCyclistDetail, setSelectedCyclistDetail,
  };
}
