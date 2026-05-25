const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

const regex = /headerExtra=\{\s*!isStartlistTableExpanded && \(\s*<StartlistFilters[\s\S]*?\/>\s*\)\s*\}/;

const startlistFiltersCode = `
                <div className={cn("copy-button-ignore", isStartlistTableExpanded && "hidden")}>
                  <StartlistFilters
                    startlistFilterTeam={startlistFilterTeam}
                    setStartlistFilterTeam={setStartlistFilterTeam}
                    uniqueTeams={uniqueTeams}
                    startlistFilterRondas={startlistFilterRondas}
                    setStartlistFilterRondas={setStartlistFilterRondas}
                    uniqueRondas={uniqueRondas}
                    toggleRonda={toggleRonda}
                    startlistFilterDiasMin={startlistFilterDiasMin}
                    setStartlistFilterDiasMin={setStartlistFilterDiasMin}
                    startlistFilterDiasMax={startlistFilterDiasMax}
                    setStartlistFilterDiasMax={setStartlistFilterDiasMax}
                    startlistFilterPuntosMin={startlistFilterPuntosMin}
                    setStartlistFilterPuntosMin={setStartlistFilterPuntosMin}
                    startlistFilterPuntosMax={startlistFilterPuntosMax}
                    setStartlistFilterPuntosMax={setStartlistFilterPuntosMax}
                    startlistFilterDebut={startlistFilterDebut}
                    setStartlistFilterDebut={setStartlistFilterDebut}
                  />
                </div>`;

code = code.replace(regex, ''); // Remove headerExtra
code = code.replace(/<div className="space-y-6">\s*<ReportCard\s*title=\{`Ciclistas Participantes \(\$\{filteredRows\.length\}\)`\}/, 
  `<div className="space-y-6">
${startlistFiltersCode}
                <ReportCard
                  title={\`Ciclistas Participantes (\${filteredRows.length})\`}`);

fs.writeFileSync('src/components/tabs/StartlistView.tsx', code);
