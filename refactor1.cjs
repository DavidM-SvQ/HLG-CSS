const fs = require('fs');

const originalCode = fs.readFileSync('src/components/tabs/season/TopDraftCyclists.tsx', 'utf8');
const lines = originalCode.split('\n');

const imports = lines.slice(0, 14).join('\n');
const rowComponent = lines.slice(1062).join('\n');
const filtersBlock = fs.readFileSync('filters.txt', 'utf8');
const tableBlock = fs.readFileSync('table.txt', 'utf8');

const filtersCode = `import React from "react";
import { Copy, Maximize2, UploadCloud, ChevronDown, CheckCircle2, ClipboardList, Search, X, User } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

export function TopDraftCyclistsFilters(props: any) {
  const {
    isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded,
    handleCopyTopCyclistsDraft, isTopCyclistsDraftCopying,
    topCyclistsLimit, handleCopyTopCyclistsDraftText, isTopCyclistsDraftTextCopying,
    handleDownloadTopCyclistsDraft, isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen,
    cyclistsTeamFilter, setCyclistsTeamFilter, playerTeamMap, getVal,
    isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen,
    cyclistsCategoryFilter, setCyclistsCategoryFilter, allCategories,
    isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen,
    cyclistsRoundFilter, setCyclistsRoundFilter, cyclistsRoundMap,
    cyclistsNameSearch, setCyclistsNameSearch, setTopCyclistsLimit
  } = props;

  return (
    <>
` + filtersBlock + `
    </>
  );
}
`;
fs.writeFileSync('src/components/tabs/season/TopDraftCyclistsFilters.tsx', filtersCode);

const tableCode = `import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Trophy, Calendar, Medal, Crown, TrendingUp, BarChart3, Users, LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../ui/button";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { cn } from "../../../lib/utils";

export function TopDraftCyclistsTable(props: any) {
  const {
    isTopCyclistsDraftExpanded, topCyclistsDraftRefContainer,
    cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection,
    sortedStats, topCyclistsLimit, maxVictorias, maxCarreras, minCarreras, maxDias, minDias,
    maxPpc, minPpc, maxPpd, minPpd, getFlagEmoji, getColorClass, getPuntosColor, formatNumberSpanish
  } = props;

  return (
    <>
` + tableBlock + `
    </>
  );
}

` + rowComponent;
fs.writeFileSync('src/components/tabs/season/TopDraftCyclistsTable.tsx', tableCode);

let newMainCode = originalCode.replace(
  filtersBlock + '\n' + tableBlock,
  `
                                <TopDraftCyclistsFilters
                                  {...{
                                    isTopCyclistsDraftExpanded, setIsTopCyclistsDraftExpanded,
                                    handleCopyTopCyclistsDraft, isTopCyclistsDraftCopying,
                                    topCyclistsLimit, handleCopyTopCyclistsDraftText, isTopCyclistsDraftTextCopying,
                                    handleDownloadTopCyclistsDraft, isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen,
                                    cyclistsTeamFilter, setCyclistsTeamFilter, playerTeamMap, getVal,
                                    isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen,
                                    cyclistsCategoryFilter, setCyclistsCategoryFilter, allCategories,
                                    isCyclistsRoundFilterOpen, setIsCyclistsRoundFilterOpen,
                                    cyclistsRoundFilter, setCyclistsRoundFilter, cyclistsRoundMap,
                                    cyclistsNameSearch, setCyclistsNameSearch, setTopCyclistsLimit
                                  }}
                                />
                                <TopDraftCyclistsTable
                                  {...{
                                    isTopCyclistsDraftExpanded, topCyclistsDraftRefContainer,
                                    cyclistsSortColumn, setCyclistsSortColumn, cyclistsSortDirection, setCyclistsSortDirection,
                                    sortedStats, topCyclistsLimit, maxVictorias, maxCarreras, minCarreras, maxDias, minDias,
                                    maxPpc, minPpc, maxPpd, minPpd, getFlagEmoji, getColorClass, getPuntosColor, formatNumberSpanish
                                  }}
                                />
  `
);

newMainCode = `import { TopDraftCyclistsFilters } from "./TopDraftCyclistsFilters";\nimport { TopDraftCyclistsTable } from "./TopDraftCyclistsTable";\n` + newMainCode;

newMainCode = newMainCode.substring(0, newMainCode.indexOf('function TopCyclistRow'));

fs.writeFileSync('src/components/tabs/season/TopDraftCyclists.tsx', newMainCode);
console.log('Done refactoring');
