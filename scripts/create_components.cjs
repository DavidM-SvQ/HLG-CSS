const fs = require('fs');

const createPointsComponent = () => {
  const body = fs.readFileSync('src/components/tabs/draft/PointsComponentBody.txt', 'utf-8');
  const code = `import React from 'react';
import { ChevronUp, ChevronDown, X, ArrowUpDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getVal, getCategoryColorStyle } from '../../../lib/data-processing';

interface DraftPointsTableProps {
  files: any;
  leaderboard: any;
  draftDatosMonthFilter: string[];
  draftDatosCategoryFilter: string[];
  draftDatosTeamFilter: string[];
  draftDatosSortColumn: string;
  setDraftDatosSortColumn: (val: string) => void;
  draftDatosSortDirection: 'asc' | 'desc';
  setDraftDatosSortDirection: (val: 'asc' | 'desc') => void;
  isDraftDatosTableExpanded: boolean;
  setIsDraftDatosTableExpanded: (val: boolean) => void;
  draftDatosTableRef: React.RefObject<HTMLDivElement>;
  draftDatosTooltip: any;
  setDraftDatosTooltip: (val: any) => void;
  playerOrderMap: any;
  teamToPlayerMap: any;
}

export const DraftPointsTable: React.FC<DraftPointsTableProps> = ({
  files,
  leaderboard,
  draftDatosMonthFilter,
  draftDatosCategoryFilter,
  draftDatosTeamFilter,
  draftDatosSortColumn,
  setDraftDatosSortColumn,
  draftDatosSortDirection,
  setDraftDatosSortDirection,
  isDraftDatosTableExpanded,
  setIsDraftDatosTableExpanded,
  draftDatosTableRef,
  draftDatosTooltip,
  setDraftDatosTooltip,
  playerOrderMap,
  teamToPlayerMap
}) => {
  return (
    <>
      ${body}
    </>
  );
};
`;
  fs.writeFileSync('src/components/tabs/draft/DraftPointsTable.tsx', code);
};

const createSummaryComponent = () => {
  const body = fs.readFileSync('src/components/tabs/draft/SummaryComponentBody.txt', 'utf-8');
  const code = `import React from 'react';
import { Activity, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getVal } from '../../../lib/data-processing';

interface DraftPerformanceSummaryProps {
  files: any;
  leaderboard: any;
  draftDatosMonthFilter: string[];
  draftDatosCategoryFilter: string[];
  draftDatosTeamFilter: string[];
  draftSummarySort: { keys: string[]; order: "asc" | "desc" };
  setDraftSummarySort: React.Dispatch<React.SetStateAction<{keys: string[]; order: "asc" | "desc"}>>;
  isDraftSummaryExpanded: boolean;
  setIsDraftSummaryExpanded: (val: boolean) => void;
  draftSummaryTableRef: React.RefObject<HTMLDivElement>;
}

export const DraftPerformanceSummary: React.FC<DraftPerformanceSummaryProps> = ({
  files,
  leaderboard,
  draftDatosMonthFilter,
  draftDatosCategoryFilter,
  draftDatosTeamFilter,
  draftSummarySort,
  setDraftSummarySort,
  isDraftSummaryExpanded,
  setIsDraftSummaryExpanded,
  draftSummaryTableRef
}) => {
  return (
    <>
      ${body}
    </>
  );
};
`;
  fs.writeFileSync('src/components/tabs/draft/DraftPerformanceSummary.tsx', code);
};

const createChartComponent = () => {
  const body = fs.readFileSync('src/components/tabs/draft/ChartComponentBody.txt', 'utf-8');
  const code = `import React from 'react';
import { BarChart3, ChevronDown, Copy, Download, X, TrendingUp, Trophy, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Bar } from 'recharts';
import { cn } from '../../../lib/utils';
import { getVal } from '../../../lib/data-processing';
import { expandNodeForCapture } from '../../../lib/dom-utils';
import { domToDataUrl } from 'modern-screenshot';
import { copyImageToClipboard } from '../../../lib/clipboard';

interface DraftRoiChartProps {
  files: any;
  leaderboard: any;
  draftDatosMonthFilter: string[];
  draftDatosCategoryFilter: string[];
  draftDatosTeamFilter: string[];
  draftSummarySort: { keys: string[]; order: "asc" | "desc" };
  setDraftSummarySort: React.Dispatch<React.SetStateAction<{keys: string[]; order: "asc" | "desc"}>>;
  draftChartRef: React.RefObject<HTMLDivElement>;
  isDraftSummaryExpanded: boolean;
  setIsDraftSummaryExpanded: (val: boolean) => void;
}

export const DraftRoiChart: React.FC<DraftRoiChartProps> = ({
  files,
  leaderboard,
  draftDatosMonthFilter,
  draftDatosCategoryFilter,
  draftDatosTeamFilter,
  draftSummarySort,
  setDraftSummarySort,
  draftChartRef,
  isDraftSummaryExpanded,
  setIsDraftSummaryExpanded
}) => {
  return (
    <>
      ${body}
    </>
  );
};
`;
  fs.writeFileSync('src/components/tabs/draft/DraftRoiChart.tsx', code);
};

createPointsComponent();
createSummaryComponent();
createChartComponent();
console.log('Components created!');
