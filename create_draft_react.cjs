const fs = require('fs');

const draftViewJSX = fs.readFileSync('draftView.txt', 'utf8');

const template = `import React, { useState, useRef, useMemo } from 'react';
import { Search, Minimize2, Maximize2, X, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getVal, getCategoryColorStyle, formatNumberSpanish } from '../../lib/data-processing';
import { ExportToolbar } from '../ui/ExportToolbar';

export interface DraftViewProps {
  files: any;
  draftCyclistStats: any;
  cyclistMetadata: any;
  playerTeamMap: any;
  getStatColor: (val: number, max: number, min?: number, inverted?: boolean, allowZero?: boolean, minNonZero?: number) => string;
  monthColors: any;
  monthOrder: any;
  allRaces: any;
}

export const DraftView: React.FC<DraftViewProps> = ({
  files,
  draftCyclistStats,
  cyclistMetadata,
  playerTeamMap,
  getStatColor,
  monthColors,
  monthOrder,
  allRaces
}) => {
  const [draftSubTab, setDraftSubTab] = useState<"elecciones" | "datos">("elecciones");
  const [draftSearchTerm, setDraftSearchTerm] = useState("");
  const [draftRoundFilter, setDraftRoundFilter] = useState<string[]>([]);
  const [draftTeamFilter, setDraftTeamFilter] = useState<string[]>([]);
  const [isDraftRoundFilterOpen, setIsDraftRoundFilterOpen] = useState(false);
  const [isDraftTeamFilterOpen, setIsDraftTeamFilterOpen] = useState(false);
  const [draftStatsFilters, setDraftStatsFilters] = useState<{ minPuntos: number; minVictorias: number; }>({ minPuntos: 0, minVictorias: 0 });
  const [isDraftStatsFilterOpen, setIsDraftStatsFilterOpen] = useState(false);
  const [draftDatosTooltip, setDraftDatosTooltip] = useState<any>(null);
  const [draftDatosMonthFilter, setDraftDatosMonthFilter] = useState<string[]>([]);
  const [draftDatosCategoryFilter, setDraftDatosCategoryFilter] = useState<string[]>([]);
  const [draftDatosTeamFilter, setDraftDatosTeamFilter] = useState<string[]>([]);
  const [isDraftDatosMonthFilterOpen, setIsDraftDatosMonthFilterOpen] = useState(false);
  const [isDraftDatosCategoryFilterOpen, setIsDraftDatosCategoryFilterOpen] = useState(false);
  const [isDraftDatosTeamFilterOpen, setIsDraftDatosTeamFilterOpen] = useState(false);
  const [draftSortColumn, setDraftSortColumn] = useState<string>("Elección");
  const [draftSortDirection, setDraftSortDirection] = useState<"asc" | "desc">("asc");
  const [draftDatosSortColumn, setDraftDatosSortColumn] = useState<string>("Orden");
  const [draftDatosSortDirection, setDraftDatosSortDirection] = useState<"asc" | "desc">("asc");
  const [isDraftTableExpanded, setIsDraftTableExpanded] = useState(false);
  const [isDraftDatosTableExpanded, setIsDraftDatosTableExpanded] = useState(false);
  const [isDraftSummaryExpanded, setIsDraftSummaryExpanded] = useState(false);
  const [draftSummarySort, setDraftSummarySort] = useState<{column: "Ronda" | "Equipo" | "Puntos" | "Victorias" | "Categorias"; direction: "asc" | "desc";}>({ column: "Puntos", direction: "desc" });

  const draftTableRef = useRef<HTMLDivElement>(null);
  const draftDatosTableRef = useRef<HTMLDivElement>(null);
  const draftSummaryTableRef = useRef<HTMLDivElement>(null);
  const draftChartRef = useRef<HTMLDivElement>(null);

  // Mocks for missing functions that were handled in App.tsx
  const isDraftTableCopying = false; 
  const handleCopyDraftTableImage = () => {};

  return (
    <>
${draftViewJSX.replace(/^            /gm, '')}
    </>
  );
};
`;

fs.writeFileSync('src/components/tabs/DraftView.tsx', template);
console.log('DraftView.tsx created.');
