import React, { useContext } from "react";
import { SeasonViewContext } from "./SeasonViewContext";
import { TeamWinsRankingChart } from "./TeamWinsRankingChart";
import { MonthlyWinsEvolutionChart } from "./MonthlyWinsEvolutionChart";
import { WinsHistoryTable } from "./WinsHistoryTable";

export function SeasonWinsTab() {
  const context = useContext(SeasonViewContext)!;

  return (
    <div className="space-y-8">
      <TeamWinsRankingChart />
      <MonthlyWinsEvolutionChart />
      <WinsHistoryTable />
    </div>
  );
}
