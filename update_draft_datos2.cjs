const fs = require('fs');

const pointsContent = fs.readFileSync('src/components/tabs/draft/DraftDatos_points.tsx', 'utf-8');
const pointsLines = pointsContent.split('\n');

const filtersBlock = pointsLines.slice(0, 363).join('\n');

const code = `import { copyImageToClipboard, copyTextToClipboard } from "../../../lib/clipboard";
import React, { useState, useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown, ChevronUp, Copy, CheckCircle2, UploadCloud, Activity, FileText, Download, HelpCircle, ArrowUpDown, Maximize2, X, BarChart3, TrendingUp, Trophy } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getVal, getCategoryColorStyle, formatNumberSpanish } from '../../../lib/data-processing';
import { ExportToolbar } from '../../ui/ExportToolbar';
import { expandNodeForCapture } from '../../../lib/dom-utils';
import { domToDataUrl } from 'modern-screenshot';
import { DraftPointsTable } from './DraftPointsTable';
import { DraftPerformanceSummary } from './DraftPerformanceSummary';
import { DraftRoiChart } from './DraftRoiChart';

export interface DraftDatosProps {
  files: any;
  leaderboard: any;
  cyclistMetadata: any;
  teamToPlayerMap: any;
  playerOrderMap: any;
}

export const DraftDatos: React.FC<DraftDatosProps> = ({
  files,
  leaderboard,
  cyclistMetadata,
  teamToPlayerMap,
  playerOrderMap,
}) => {
  const [draftDatosMonthFilter, setDraftDatosMonthFilter] = useState<string[]>([]);
  const [draftDatosCategoryFilter, setDraftDatosCategoryFilter] = useState<string[]>([]);
  const [draftDatosTeamFilter, setDraftDatosTeamFilter] = useState<string[]>([]);
  const [isDraftDatosMonthFilterOpen, setIsDraftDatosMonthFilterOpen] = useState(false);
  const [isDraftDatosCategoryFilterOpen, setIsDraftDatosCategoryFilterOpen] = useState(false);
  const [isDraftDatosTeamFilterOpen, setIsDraftDatosTeamFilterOpen] = useState(false);
  const [draftDatosSortColumn, setDraftDatosSortColumn] = useState<string>("Orden");
  const [draftDatosSortDirection, setDraftDatosSortDirection] = useState<"asc" | "desc">("asc");
  const [isDraftDatosTableExpanded, setIsDraftDatosTableExpanded] = useState(false);
  const [isDraftSummaryExpanded, setIsDraftSummaryExpanded] = useState(false);
  const [draftSummarySort, setDraftSummarySort] = useState<{keys: string[]; order: "asc" | "desc";}>({ keys: ["totalPoints"], order: "desc" });
  const [draftDatosTooltip, setDraftDatosTooltip] = useState<any>(null);

  const draftDatosTableRef = useRef<HTMLDivElement>(null);
  const draftSummaryTableRef = useRef<HTMLDivElement>(null);
  const draftChartRef = useRef<HTMLDivElement>(null);
  
  const [isDraftDatosTableCopying, setIsDraftDatosTableCopying] = useState<string | false>(false);
  const handleCopyDraftDatosTableImage = () => {};
  const handleDownloadDraftDatosTableImage = () => {};

  return (
    <>
      <div className="space-y-6">
        {!files.elecciones?.data ? (
          <div className="text-center py-20 text-neutral-500 italic">
            No hay datos del draft cargados.
          </div>
        ) : (
          <>
${filtersBlock}

            <DraftPointsTable
              files={files}
              leaderboard={leaderboard}
              draftDatosMonthFilter={draftDatosMonthFilter}
              draftDatosCategoryFilter={draftDatosCategoryFilter}
              draftDatosTeamFilter={draftDatosTeamFilter}
              draftDatosSortColumn={draftDatosSortColumn}
              setDraftDatosSortColumn={setDraftDatosSortColumn}
              draftDatosSortDirection={draftDatosSortDirection}
              setDraftDatosSortDirection={setDraftDatosSortDirection}
              isDraftDatosTableExpanded={isDraftDatosTableExpanded}
              setIsDraftDatosTableExpanded={setIsDraftDatosTableExpanded}
              draftDatosTableRef={draftDatosTableRef}
              draftDatosTooltip={draftDatosTooltip}
              setDraftDatosTooltip={setDraftDatosTooltip}
              playerOrderMap={playerOrderMap}
              teamToPlayerMap={teamToPlayerMap}
            />

            <DraftPerformanceSummary
              files={files}
              leaderboard={leaderboard}
              draftDatosMonthFilter={draftDatosMonthFilter}
              draftDatosCategoryFilter={draftDatosCategoryFilter}
              draftDatosTeamFilter={draftDatosTeamFilter}
              draftSummarySort={draftSummarySort}
              setDraftSummarySort={setDraftSummarySort}
              isDraftSummaryExpanded={isDraftSummaryExpanded}
              setIsDraftSummaryExpanded={setIsDraftSummaryExpanded}
              draftSummaryTableRef={draftSummaryTableRef}
            />

            <DraftRoiChart
              files={files}
              leaderboard={leaderboard}
              draftDatosMonthFilter={draftDatosMonthFilter}
              draftDatosCategoryFilter={draftDatosCategoryFilter}
              draftDatosTeamFilter={draftDatosTeamFilter}
              draftSummarySort={draftSummarySort}
              setDraftSummarySort={setDraftSummarySort}
              draftChartRef={draftChartRef}
              isDraftSummaryExpanded={isDraftSummaryExpanded}
              setIsDraftSummaryExpanded={setIsDraftSummaryExpanded}
            />

          </>
        )}
      </div>
    </>
  );
};
`;

fs.writeFileSync('src/components/tabs/draft/DraftDatos.tsx', code);
console.log('Restored DraftDatos.tsx successfully');
