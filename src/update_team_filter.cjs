const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add "Equipos" multi-select filter state
code = code.replace(
  "const [cyclistsCategoryFilter, setCyclistsCategoryFilter] = useState<string[]>([]);",
  "const [cyclistsCategoryFilter, setCyclistsCategoryFilter] = useState<string[]>([]);\n  const [cyclistsTeamFilter, setCyclistsTeamFilter] = useState<string[]>([]);\n  const [isCyclistsTeamFilterOpen, setIsCyclistsTeamFilterOpen] = useState(false);"
);

// 2. Fix the layout logic for tool block inside the header.
// It wraps poorly and overlaps with the header title.
// Replace `flex flex-col sm:flex-row sm:items-center justify-between gap-4` -> `flex flex-col xl:flex-row justify-between gap-4` or similar, but the user is currently using `flex flex-col xl:flex-row xl:items-center justify-between gap-4` or similar. Let's make it `flex flex-col justify-between gap-4 xl:flex-row xl:items-start` and the filters wrapper to `flex flex-wrap gap-3 mt-3 xl:mt-0 items-center justify-end`
const headerOld = `<div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-4">`;

const headerNew = `<div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
                                <div className="flex-shrink-0">
                                  <div className="flex items-center gap-4">`;
code = code.replace(headerOld, headerNew);

const filtersOld = `<div className="flex flex-col sm:flex-row gap-3">
                                  
                                  {/* Category Multi-select Filter */}`;
const filtersNew = `<div className="flex flex-wrap items-center gap-3">
                                  
                                  {/* Teams Multi-select Filter */}
                                  <div className="relative">
                                    <button 
                                      onClick={() => setIsCyclistsTeamFilterOpen(!isCyclistsTeamFilterOpen)}
                                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[140px]"
                                    >
                                      <span className="truncate">
                                        {cyclistsTeamFilter.length === 0 
                                          ? "Todos los equipos" 
                                          : \`\${cyclistsTeamFilter.length} equipos\`}
                                      </span>
                                      <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isCyclistsTeamFilterOpen && "rotate-180")} />
                                    </button>

                                    {isCyclistsTeamFilterOpen && (
                                      <>
                                        <div 
                                          className="fixed inset-0 z-10" 
                                          onClick={() => setIsCyclistsTeamFilterOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                          <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase">Equipos</span>
                                            {cyclistsTeamFilter.length > 0 && (
                                              <button 
                                                onClick={() => setCyclistsTeamFilter([])}
                                                className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                              >
                                                Limpiar
                                              </button>
                                            )}
                                          </div>
                                          {Array.from(new Set(Object.values(cyclistStats).map(c => c.nombreEquipo).filter(t => t && t !== 'No draft')))
                                            .sort((a, b) => a.localeCompare(b))
                                            .map(team => (
                                              <label 
                                                key={team} 
                                                className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                              >
                                                <input 
                                                  type="checkbox" 
                                                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                  checked={cyclistsTeamFilter.includes(team)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setCyclistsTeamFilter([...cyclistsTeamFilter, team]);
                                                    } else {
                                                      setCyclistsTeamFilter(cyclistsTeamFilter.filter(t => t !== team));
                                                    }
                                                  }}
                                                />
                                                <span className="ml-2 text-sm text-neutral-700 truncate">{team}</span>
                                              </label>
                                            ))}
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Category Multi-select Filter */}`;
code = code.replace(filtersOld, filtersNew);


// 3. Add logic to apply Team filter in allStats
const filterOld = `                                        .filter(([name, data]) => {
                                          if (data.nombreEquipo === 'No draft') return false;
                                          if (cyclistsRoundFilter.length === 0) return true;
                                          return cyclistsRoundFilter.includes(data.ronda);
                                        })`;
const filterNew = `                                        .filter(([name, data]) => {
                                          if (data.nombreEquipo === 'No draft') return false;
                                          if (cyclistsTeamFilter.length > 0 && !cyclistsTeamFilter.includes(data.nombreEquipo)) return false;
                                          if (cyclistsRoundFilter.length > 0 && !cyclistsRoundFilter.includes(data.ronda)) return false;
                                          return true;
                                        })`;
code = code.replace(filterOld, filterNew);

fs.writeFileSync('src/App.tsx', code);
console.log('Done!');
