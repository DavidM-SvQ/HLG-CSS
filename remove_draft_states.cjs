const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regexes = [
  /^[ \t]*const \[view, setView\].*;\n?/m,
  /^[ \t]*const \[adminTab, setAdminTab\][\s\S]*?\("datos"\);\n?/m,
  /^[ \t]*const \[draftSubTab, setDraftSubTab\][\s\S]*?\("elecciones",\n[ \t]*\);\n?/m,
  /^[ \t]*const \[draftSearchTerm, setDraftSearchTerm\].*;\n?/m,
  /^[ \t]*const \[draftRoundFilter, setDraftRoundFilter\].*;\n?/m,
  /^[ \t]*const \[draftTeamFilter, setDraftTeamFilter\].*;\n?/m,
  /^[ \t]*const \[isDraftRoundFilterOpen, setIsDraftRoundFilterOpen\].*;\n?/m,
  /^[ \t]*const \[isDraftTeamFilterOpen, setIsDraftTeamFilterOpen\].*;\n?/m,
  /^[ \t]*const \[draftStatsFilters, setDraftStatsFilters\][\s\S]*?</m,
  // We'll just do a sweeping regex for all state related to "draft", "cyclists", "undebuted", "unscored", "teams", "history", "isDraft", "isTop", "isUnscored", "isUndebuted", "isNoDraft" etc.
];

// Instead of regexes, let's just use string replacement or write a script that identifies unused useStates.
