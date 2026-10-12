import React, { Suspense } from "react";
import { TableSkeleton } from "../../ui/Skeleton";

const TeamWinsRankingChart = React.lazy(() =>
  import("./TeamWinsRankingChart").then((m) => ({ default: m.TeamWinsRankingChart }))
);
const MonthlyWinsEvolutionChart = React.lazy(() =>
  import("./MonthlyWinsEvolutionChart").then((m) => ({ default: m.MonthlyWinsEvolutionChart }))
);
const WinsHistoryTable = React.lazy(() =>
  import("./WinsHistoryTable").then((m) => ({ default: m.WinsHistoryTable }))
);

export function SeasonWinsTab() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200"><TableSkeleton rows={4} /></div>}>
        <TeamWinsRankingChart />
      </Suspense>
      <Suspense fallback={<div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200"><TableSkeleton rows={4} /></div>}>
        <MonthlyWinsEvolutionChart />
      </Suspense>
      <Suspense fallback={<div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200"><TableSkeleton rows={6} /></div>}>
        <WinsHistoryTable />
      </Suspense>
    </div>
  );
}
