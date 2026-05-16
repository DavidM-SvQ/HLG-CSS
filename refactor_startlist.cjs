const fs = require('fs');

const filtersCode = fs.readFileSync('filters.txt', 'utf8');
const startlistTableBody = fs.readFileSync('startlistTableBody.txt', 'utf8');
const teamsTableCode = fs.readFileSync('teamsTable.txt', 'utf8');
const pointsTableCode = fs.readFileSync('pointsTable.txt', 'utf8');

// 1. StartlistFilters.tsx
const startlistFiltersCode = `import React from "react";
import { cn } from "../../lib/utils";

export function StartlistFilters(props: any) {
  const {
    startlistFilterTeam, setStartlistFilterTeam, uniqueTeams,
    startlistFilterRondas, setStartlistFilterRondas, uniqueRondas, toggleRonda,
    startlistFilterDiasMin, setStartlistFilterDiasMin,
    startlistFilterDiasMax, setStartlistFilterDiasMax,
    startlistFilterPuntosMin, setStartlistFilterPuntosMin,
    startlistFilterPuntosMax, setStartlistFilterPuntosMax,
    startlistFilterDebut, setStartlistFilterDebut,
  } = props;
  
  return (
    <>
` + filtersCode + `
    </>
  );
}
`;
fs.writeFileSync('src/components/tabs/season/StartlistFilters.tsx', startlistFiltersCode);

// 2. StartlistTable.tsx
const startlistTableCode = `import React from "react";
import { cn } from "../../lib/utils";
import { formatNumberSpanish } from "../../lib/data-processing";

export function StartlistTable(props: any) {
  const {
    startlistScrollRef, startlistSortCol, startlistSortDir, toggleSort,
    filteredRowPagination, filteredRows, getCyclistDiasColorStyle, getCyclistPpcColorStyle, getCyclistPointsColorStyle
  } = props;

  return (
    <>
` + startlistTableBody + `
    </>
  );
}
`;
fs.writeFileSync('src/components/tabs/season/StartlistTable.tsx', startlistTableCode);

// 3. StartlistTeamsTable.tsx
const startlistTeamsTableCode = `import React from "react";
import { Copy, Maximize2, Minimize2, UploadCloud, CheckCircle2, ClipboardList } from "lucide-react";
import { ExportToolbar } from "../ui/ExportToolbar";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { formatNumberSpanish } from "../../lib/data-processing";

export function StartlistTeamsTable(props: any) {
  const {
    isStartlistTeamsTableExpanded, setIsStartlistTeamsTableExpanded,
    startlistTeamsTableRef, handleCopyStartlistTeamsText, isStartlistTeamsTextCopying,
    handleCopyStartlistTeams, isStartlistTeamsCopying, teamRowPagination, handleDownloadStartlistTeams,
    teamRows, getTeamPointsColorStyle, getTeamPointsMediosColorStyle
  } = props;

  return (
    <>
` + teamsTableCode + `
    </>
  );
}
`;
fs.writeFileSync('src/components/tabs/season/StartlistTeamsTable.tsx', startlistTeamsTableCode);

// 4. StartlistPointsTable.tsx
const startlistPointsTableCode = `import React from "react";
import { Copy, Maximize2, Minimize2, UploadCloud, CheckCircle2, ClipboardList } from "lucide-react";
import { ExportToolbar } from "../ui/ExportToolbar";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export function StartlistPointsTable(props: any) {
  const {
    racePoints, raceCategory, isPointsExpanded, setIsPointsExpanded,
    handleCopyPoints, isPointsTextCopying, handleCopyPointsImage, isPointsImageCopying,
    pointsPagination, handleDownloadPointsImage, pointsTableRef
  } = props;

  return (
    <>
` + pointsTableCode + `
    </>
  );
}
`;
fs.writeFileSync('src/components/tabs/season/StartlistPointsTable.tsx', startlistPointsTableCode);

// Fix StartlistView.tsx
let main = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

const mainLines = main.split('\n');

let resLines = [];
let i = 0;
while (i < mainLines.length) {
  if (mainLines[i].includes('<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-end copy-button-ignore bg-neutral-50 p-3 rounded-md border border-neutral-200">')) {
     resLines.push(`
                      <StartlistFilters 
                        startlistFilterTeam={startlistFilterTeam} setStartlistFilterTeam={setStartlistFilterTeam} uniqueTeams={uniqueTeams}
                        startlistFilterRondas={startlistFilterRondas} setStartlistFilterRondas={setStartlistFilterRondas} uniqueRondas={uniqueRondas} toggleRonda={toggleRonda}
                        startlistFilterDiasMin={startlistFilterDiasMin} setStartlistFilterDiasMin={setStartlistFilterDiasMin}
                        startlistFilterDiasMax={startlistFilterDiasMax} setStartlistFilterDiasMax={setStartlistFilterDiasMax}
                        startlistFilterPuntosMin={startlistFilterPuntosMin} setStartlistFilterPuntosMin={setStartlistFilterPuntosMin}
                        startlistFilterPuntosMax={startlistFilterPuntosMax} setStartlistFilterPuntosMax={setStartlistFilterPuntosMax}
                        startlistFilterDebut={startlistFilterDebut} setStartlistFilterDebut={setStartlistFilterDebut}
                      />
     `);
     i += 106; // skip filters
  } else if (mainLines[i].includes('<div ref={startlistScrollRef}')) {
     resLines.push(`
                  <StartlistTable 
                    startlistScrollRef={startlistScrollRef} startlistSortCol={startlistSortCol} startlistSortDir={startlistSortDir} toggleSort={toggleSort}
                    filteredRowPagination={filteredRowPagination} filteredRows={filteredRows} getCyclistDiasColorStyle={getCyclistDiasColorStyle} 
                    getCyclistPpcColorStyle={getCyclistPpcColorStyle} getCyclistPointsColorStyle={getCyclistPointsColorStyle} formatNumberSpanish={formatNumberSpanish}
                  />
     `);
     i += 179; // skip main table body
  } else if (mainLines[i].includes('className={cn(') && mainLines[i+1] && mainLines[i+1].includes('"relative flex flex-col bg-white border border-neutral-200 shadow-sm rounded-lg p-6",') && mainLines[i+2] && mainLines[i+2].includes('isStartlistTeamsTableExpanded &&')) {
     resLines.push(`
                <StartlistTeamsTable
                  isStartlistTeamsTableExpanded={isStartlistTeamsTableExpanded} setIsStartlistTeamsTableExpanded={setIsStartlistTeamsTableExpanded}
                  startlistTeamsTableRef={startlistTeamsTableRef} handleCopyStartlistTeamsText={handleCopyStartlistTeamsText} isStartlistTeamsTextCopying={isStartlistTeamsTextCopying}
                  handleCopyStartlistTeams={handleCopyStartlistTeams} isStartlistTeamsCopying={isStartlistTeamsCopying} teamRowPagination={teamRowPagination} handleDownloadStartlistTeams={handleDownloadStartlistTeams}
                  teamRows={teamRows} getTeamPointsColorStyle={getTeamPointsColorStyle} getTeamPointsMediosColorStyle={getTeamPointsMediosColorStyle}
                />
     `);
     i += 134; // skip teams table
  } else if (mainLines[i].includes('{racePoints.length > 0 && (')) {
     resLines.push(`
          <StartlistPointsTable
            racePoints={racePoints} raceCategory={raceCategory} isPointsExpanded={isPointsExpanded} setIsPointsExpanded={setIsPointsExpanded}
            handleCopyPoints={handleCopyPoints} isPointsTextCopying={isPointsTextCopying} handleCopyPointsImage={handleCopyPointsImage} isPointsImageCopying={isPointsImageCopying}
            pointsPagination={pointsPagination} handleDownloadPointsImage={handleDownloadPointsImage} pointsTableRef={pointsTableRef}
          />
     `);
     i += 75; // skip points table
  } else {
     resLines.push(mainLines[i]);
     i++;
  }
}

let newMain = resLines.join('\n');
newMain = `import { StartlistFilters } from "./season/StartlistFilters";\nimport { StartlistTable } from "./season/StartlistTable";\nimport { StartlistTeamsTable } from "./season/StartlistTeamsTable";\nimport { StartlistPointsTable } from "./season/StartlistPointsTable";\n` + newMain;

fs.writeFileSync('src/components/tabs/StartlistView.tsx', newMain);

console.log('done refactoring StartlistView');
