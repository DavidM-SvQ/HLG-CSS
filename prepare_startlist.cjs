const fs = require('fs');

const code = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

// Replace standard rect import with useMemo, useRef, etc..
let newCode = code.replace(
  'import React, { useState, useRef } from "react";',
  'import React, { useState, useRef, useMemo, useEffect } from "react";\nimport { useVirtualizer } from "@tanstack/react-virtual";'
);

newCode = newCode.replace(
  "const startlistTeamsTableRef = useRef<HTMLDivElement>(null);",
  "const startlistTeamsTableRef = useRef<HTMLDivElement>(null);\n  const parentRef = useRef<HTMLDivElement>(null);"
);

// We want to memoize filteredRows
// But first let's see how filteredRows are used.
// 508: {filteredRows.map((r, i) => ( ... ))}
// We replace it with rowVirtualizer!

fs.writeFileSync('src/components/tabs/StartlistView.tsx', newCode);
