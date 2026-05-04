const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/season/SeasonCyclistsTab.tsx', 'utf8');

// The logic inside `{(() => { ... })()}` for each table returns an array of `<tr>`.
// We want to extract the items (e.g. `topCyclistsDraft`), and map over them with a virtualizer.
// Since the extraction of topCyclistsDraft, unscored, undebuted, noDraftPlayer is inside the return of SeasonCyclistsTab,
// it runs on every render.
// I will not extract to the top level, but instead I will just refactor SeasonCyclistsTab to compute the arrays upfront, and then render them.

code = code.replace(/return \(\s*<div className="space-y-6">/, match => {
  return `
  const topCyclistsDraftRefContainer = React.useRef<HTMLDivElement>(null);
  const unscoredRefContainer = React.useRef<HTMLDivElement>(null);
  const undebutedRefContainer = React.useRef<HTMLDivElement>(null);
  const noDraftRefContainer = React.useRef<HTMLDivElement>(null);
  
  ` + match;
});

// We need to inject `@tanstack/react-virtual`
if (!code.includes('@tanstack/react-virtual')) {
    code = "import { useVirtualizer } from '@tanstack/react-virtual';\n" + code;
}

fs.writeFileSync('src/components/tabs/season/SeasonCyclistsTab.tsx', code);
console.log("Hooks injected into SeasonCyclistsTab");
