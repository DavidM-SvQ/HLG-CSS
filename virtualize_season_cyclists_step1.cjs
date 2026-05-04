const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/season/SeasonCyclistsTab.tsx', 'utf8');

code = code.replace('import React, { useContext } from "react";', 'import React, { useContext, useRef } from "react";\\nimport { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";');

code = code.replace(
  'const { cn, CyclistDetailView, files, playerTeamMap',
  'const topCyclistsDraftRefContainer = useRef<HTMLDivElement>(null);\\n  const unscoredRefContainer = useRef<HTMLDivElement>(null);\\n  const undebutedRefContainer = useRef<HTMLDivElement>(null);\\n  const noDraftRefContainer = useRef<HTMLDivElement>(null);\\n\\n  const { cn, CyclistDetailView, files, playerTeamMap'
);

let currentContainerIndex = 0;
const containers = ['topCyclistsDraftRefContainer', 'unscoredRefContainer', 'undebutedRefContainer', 'noDraftRefContainer'];

code = code.replace(/<div className="table-responsive-wrapper overflow-auto w-full h-full">/g, function() {
    const ref = containers[currentContainerIndex++];
    return '<div ref={' + ref + '} className="table-responsive-wrapper overflow-auto w-full max-h-[600px]">';
});

fs.writeFileSync('src/components/tabs/season/SeasonCyclistsTab.tsx', code);
console.log("Refs injected!");
