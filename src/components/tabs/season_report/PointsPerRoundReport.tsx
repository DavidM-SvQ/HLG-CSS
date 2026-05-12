import React, { useRef, useMemo } from "react";
import { Grid } from "lucide-react";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { cn } from "../../../lib/utils";

interface PointsPerRoundReportProps {
  monthReportData: any;
  monthsText: string;
}

export const PointsPerRoundReport: React.FC<PointsPerRoundReportProps> = ({
  monthReportData,
  monthsText,
}) => {
  const ref5 = useRef<HTMLDivElement>(null);

  const tableRows = useMemo(() => {
    if (!monthReportData) return null;
    return monthReportData.allTeams.map((team: string) => {
      let teamTotal = 0;
      const cells = monthReportData.allRounds.map((round: string) => {
        const pts = monthReportData.roundTeamPoints[round]?.[team] || 0;
        teamTotal += pts;

        const isMax = pts > 0 && pts === monthReportData.roundStats[round]?.max;
        const isMin = pts > 0 && pts === monthReportData.roundStats[round]?.min;
        const isZero = pts === 0;

        let cellStyle = {};
        if (isZero) {
          cellStyle = { backgroundColor: '#fee2e2' }; // red-100
        } else if (isMax) {
          cellStyle = { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' };
        } else if (isMin) {
          cellStyle = { backgroundColor: '#fef9c3', color: '#854d0e' };
        }

        return (
          <td key={round} className={cn("px-2 py-2 text-center border-r border-neutral-100", isZero ? "text-red-400" : "text-neutral-900")} style={cellStyle}>
            <span className="cursor-default">{pts > 0 ? pts : "0"}</span>
          </td>
        );
      });

      return (
        <tr key={team} className="hover:bg-neutral-50 transition-colors">
          <td className="px-4 py-2 font-medium text-neutral-900 border-r border-neutral-200 bg-white sticky left-0 z-10" title={team}>
            {team}
          </td>
          {cells}
          <td className="px-4 py-2 text-right font-bold text-blue-700 bg-blue-50/30">
            {teamTotal}
          </td>
        </tr>
      );
    });
  }, [monthReportData]);

  if (!monthReportData) return null;

  return (
    <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto" ref={ref5}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start mb-4 gap-4">
        <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
          <Grid className="w-5 h-5 text-indigo-600" /> Puntos por Ronda y Equipo {monthsText ? ` [${monthsText}]` : ""}
        </h3>
        <ExportToolbar targetRef={ref5} filename="puntos-ronda-equipo" />
      </div>
      <div className="table-responsive-wrapper overflow-x-auto w-full crosshair-container"><table className="w-full min-w-[600px] text-xs text-left whitespace-nowrap border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="pb-2 sticky left-0 bg-neutral-50 z-20 border-r border-b border-neutral-200 pr-2 shadow-sm font-bold">
              Equipo
            </th>
            {monthReportData.allRounds.map((r: string) => (
              <th
                key={r}
                className="pb-2 px-2 text-center font-bold text-neutral-500 w-10 border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10"
              >
                R{r}
              </th>
            ))}
            <th className="pb-2 px-4 text-right font-bold text-blue-600 bg-blue-50/50 sticky top-0 z-10 border-b border-neutral-200">
              TOTAL
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50 bg-white">
          {tableRows}
        </tbody>
      </table></div>
    </div>
  );
};
