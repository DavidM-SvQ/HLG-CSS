import { useState } from "react";
import { useUrlState } from "../../../../hooks/useUrlState";

export function useStartlistState() {
  const [publicStartlistRace, setPublicStartlistRace] = useState<string>("");

  const [startlistSortCol, setStartlistSortCol] = useUrlState<
    "jugador" | "ronda" | "puntos" | "dias"
  >("sort_col", "jugador");
  const [startlistSortDir, setStartlistSortDir] = useUrlState<"asc" | "desc">(
    "sort_dir",
    "asc"
  );
  const [startlistFilterTeam, setStartlistFilterTeam] = useUrlState<string>(
    "team",
    "All"
  );
  const [startlistFilterRondas, setStartlistFilterRondas] = useUrlState<
    string[]
  >("rondas", []);
  const [startlistFilterDiasMin, setStartlistFilterDiasMin] = useUrlState<
    number | ""
  >("dias_min", "");
  const [startlistFilterDiasMax, setStartlistFilterDiasMax] = useUrlState<
    number | ""
  >("dias_max", "");
  const [startlistFilterDebut, setStartlistFilterDebut] = useUrlState<string>(
    "debut",
    "Todos"
  );
  const [startlistFilterPuntosMin, setStartlistFilterPuntosMin] = useUrlState<
    number | ""
  >("puntos_min", "");
  const [startlistFilterPuntosMax, setStartlistFilterPuntosMax] = useUrlState<
    number | ""
  >("puntos_max", "");

  const [isStartlistTableExpanded, setIsStartlistTableExpanded] = useState(false);
  const [isStartlistTeamsTableExpanded, setIsStartlistTeamsTableExpanded] = useState(false);
  const [isPointsExpanded, setIsPointsExpanded] = useState(false);

  return {
    publicStartlistRace, setPublicStartlistRace,
    startlistSortCol, setStartlistSortCol,
    startlistSortDir, setStartlistSortDir,
    startlistFilterTeam, setStartlistFilterTeam,
    startlistFilterRondas, setStartlistFilterRondas,
    startlistFilterDiasMin, setStartlistFilterDiasMin,
    startlistFilterDiasMax, setStartlistFilterDiasMax,
    startlistFilterDebut, setStartlistFilterDebut,
    startlistFilterPuntosMin, setStartlistFilterPuntosMin,
    startlistFilterPuntosMax, setStartlistFilterPuntosMax,
    isStartlistTableExpanded, setIsStartlistTableExpanded,
    isStartlistTeamsTableExpanded, setIsStartlistTeamsTableExpanded,
    isPointsExpanded, setIsPointsExpanded
  };
}
