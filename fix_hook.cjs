const fs = require('fs');
const content = fs.readFileSync('src/components/tabs/season_report/hooks/monthReportDataLogic.txt', 'utf8');

const top = `import { useMemo } from "react";

export const getVal = (row: any, key: string) => {
  if (!row) return "";
  if (row[key] !== undefined) return row[key];
  const caseInsensitiveKey = Object.keys(row).find(
    (k) => k.toLowerCase() === key.toLowerCase()
  );
  return caseInsensitiveKey ? row[caseInsensitiveKey] : "";
};

export function useSeasonReportData({ files, leaderboard, selectedMonths }: any) {
  const raceMonths = useMemo(() => {
    const map: Record<string, number> = {};
    if (!files?.carreras?.data) return map;
    files.carreras.data.forEach((r: any) => {
      const carreraName = getVal(r, "Carrera")?.trim();
      const fechaFin = getVal(r, "Fecha");
      if (carreraName && fechaFin) {
        const parts = fechaFin.split(/[-/]/);
        if (parts.length >= 2) {
          map[carreraName] = parseInt(parts[1], 10) - 1;
        }
      }
    });
    return map;
  }, [files]);

  const availableMonths = useMemo(() => {
    return Array.from(new Set(Object.values(raceMonths)) as Set<number>).sort(
      (a, b) => a - b,
    );
  }, [raceMonths]);

`;

const bottom = `
  return { availableMonths, monthReportData };
}
`;

fs.writeFileSync('src/components/tabs/season_report/hooks/useSeasonReportData.ts', top + content + bottom);
