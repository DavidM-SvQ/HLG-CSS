import React, { useContext } from "react";
import { SeasonViewContext } from "./SeasonViewContext";
import { GeneralClassificationChart } from "./GeneralClassificationChart";
import { MonthlyEvolutionChart } from "./MonthlyEvolutionChart";
import { TopTeamsTable } from "./TopTeamsTable";
import { HotStreakTeams } from "./HotStreakTeams";

export function SeasonPointsTab() {
  const context = useContext(SeasonViewContext)!;

  return (
    <>
      <GeneralClassificationChart />
      <MonthlyEvolutionChart />
      <TopTeamsTable />
      <HotStreakTeams />
    </>
  );
}
