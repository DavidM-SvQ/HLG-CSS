import React, { Suspense } from "react";
import { TableSkeleton } from "../../ui/Skeleton";

const GeneralClassificationChart = React.lazy(() =>
  import("./GeneralClassificationChart").then((m) => ({ default: m.GeneralClassificationChart }))
);
const MonthlyEvolutionChart = React.lazy(() =>
  import("./MonthlyEvolutionChart").then((m) => ({ default: m.MonthlyEvolutionChart }))
);
const TopTeamsTable = React.lazy(() =>
  import("./TopTeamsTable").then((m) => ({ default: m.TopTeamsTable }))
);
const HotStreakTeams = React.lazy(() =>
  import("./HotStreakTeams").then((m) => ({ default: m.HotStreakTeams }))
);

export function SeasonPointsTab() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200"><TableSkeleton rows={4} /></div>}>
        <GeneralClassificationChart />
      </Suspense>
      <Suspense fallback={<div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200"><TableSkeleton rows={4} /></div>}>
        <MonthlyEvolutionChart />
      </Suspense>
      <Suspense fallback={<div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200"><TableSkeleton rows={6} /></div>}>
        <TopTeamsTable />
      </Suspense>
      <Suspense fallback={<div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-200"><TableSkeleton rows={4} /></div>}>
        <HotStreakTeams />
      </Suspense>
    </div>
  );
}
