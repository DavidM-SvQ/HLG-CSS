const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/season/SeasonCyclistsTab.tsx', 'utf8');

code = code.replace('import React, { useContext, useRef } from "react";\\nimport { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";', 
'import React, { useContext, useRef } from "react";\nimport { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";');

code = code.replace(
  'const topCyclistsDraftRefContainer = useRef<HTMLDivElement>(null);\\n  const unscoredRefContainer = useRef<HTMLDivElement>(null);\\n  const undebutedRefContainer = useRef<HTMLDivElement>(null);\\n  const noDraftRefContainer = useRef<HTMLDivElement>(null);\\n\\n  const { cn, CyclistDetailView, files, playerTeamMap',
  'const topCyclistsDraftRefContainer = useRef<HTMLDivElement>(null);\n  const unscoredRefContainer = useRef<HTMLDivElement>(null);\n  const undebutedRefContainer = useRef<HTMLDivElement>(null);\n  const noDraftRefContainer = useRef<HTMLDivElement>(null);\n\n  const { cn, CyclistDetailView, files, playerTeamMap'
);

fs.writeFileSync('src/components/tabs/season/SeasonCyclistsTab.tsx', code);
console.log("Fixed newlines");
