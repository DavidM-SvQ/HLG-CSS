const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/tests/GhostDraftView.tsx', 'utf8');

code = code.replace(
  /<PopoverTrigger asChild>\s*<Button variant="outline"\s*className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 flex items-center gap-2 cursor-pointer"\s*>\s*Rondas: \{ghostRoundFilter\.length === 0 \? "Todas" : ghostRoundFilter\.join\(\', \'\)\}\s*<ChevronDown className=\{cn\("w-4 h-4 text-neutral-400 transition-transform", isRoundFilterOpen && "rotate-180"\)\} \/>\s*<\/Button>\s*<\/PopoverTrigger>/s,
  `<PopoverTrigger render={<Button variant="outline"
              className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 flex items-center gap-2 cursor-pointer"
            >
              Rondas: {ghostRoundFilter.length === 0 ? "Todas" : ghostRoundFilter.join(', ')}
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isRoundFilterOpen && "rotate-180")} />
            </Button>} />`
);

code = code.replace(
  /<PopoverTrigger asChild>\s*<Button variant="outline"\s*className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 flex items-center gap-2 cursor-pointer max-w-\[200px\] truncate"\s*>\s*Equipos: \{ghostTeamFilter\.length === 0 \? "Todos" : \`\$\{ghostTeamFilter\.length\} sel\.\`\}\s*<ChevronDown className=\{cn\("w-4 h-4 text-neutral-400 transition-transform", isTeamFilterOpen && "rotate-180"\)\} \/>\s*<\/Button>\s*<\/PopoverTrigger>/s,
  `<PopoverTrigger render={<Button variant="outline"
              className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 flex items-center gap-2 cursor-pointer max-w-[200px] truncate"
            >
              Equipos: {ghostTeamFilter.length === 0 ? "Todos" : \`\${ghostTeamFilter.length} sel.\`}
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isTeamFilterOpen && "rotate-180")} />
            </Button>} />`
);

fs.writeFileSync('src/components/tabs/tests/GhostDraftView.tsx', code);
