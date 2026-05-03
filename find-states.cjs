const fs = require('fs');
const appCode = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const stateRegex = /const \[([a-zA-Z0-9]+),\s*(set[A-Z][a-zA-Z0-9]+)\]\s*=\s*useState/;
const setters = [
  'setDraftSubTab',
  'setDraftSearchTerm',
  'setIsDraftRoundFilterOpen',
  'setIsDraftTeamFilterOpen',
  'setIsDraftStatsFilterOpen',
  'setDraftRoundFilter',
  'setDraftTeamFilter',
  'setDraftStatsFilters',
  'setIsDraftTableExpanded',
  'setDraftSortDirection',
  'setDraftSortColumn',
  'setIsDraftDatosMonthFilterOpen',
  'setIsDraftDatosCategoryFilterOpen',
  'setIsDraftDatosTeamFilterOpen',
  'setDraftDatosMonthFilter',
  'setDraftDatosCategoryFilter',
  'setDraftDatosTeamFilter',
  'setIsDraftDatosTableExpanded',
  'setDraftDatosSortDirection',
  'setDraftDatosSortColumn',
  'setDraftDatosTooltip',
  'setIsDraftSummaryExpanded',
  'setDraftSummarySort'
];

let linesToRemove = [];

appCode.forEach((line, i) => {
  for (const setter of setters) {
    if (line.includes(setter) && !line.includes('onClick') && !line.includes('onChange')) {
      console.log(i, line);
    }
  }
});
