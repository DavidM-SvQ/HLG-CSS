const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state variables for Category Filter
code = code.replace(
  "const [cyclistsRoundFilter, setCyclistsRoundFilter] = useState<string[]>([]);",
  `const [cyclistsRoundFilter, setCyclistsRoundFilter] = useState<string[]>([]);\n  const [cyclistsCategoryFilter, setCyclistsCategoryFilter] = useState<string[]>([]);\n  const [isCyclistsCategoryFilterOpen, setIsCyclistsCategoryFilterOpen] = useState(false);`
);

// 2. Remove "Copiar bloques de imagen (v2)" block: lines that look like: {(topCyclistsLimit >= 50 || topCyclistsLimit === 9999) && ( ... Copiar bloques de imagen (v2) ... )}
const v2Regex = /\{\(topCyclistsLimit >= 50 \|\| topCyclistsLimit === 9999\) && \([\s\S]*?Copiar bloques de imagen \(v2\)[\s\S]*?\)\s*\}\s*/g;
code = code.replace(v2Regex, "");

// 3. Add UI for Category Filter right before Round Filter
const categoryUiHtml = `
                                  {/* Category Multi-select Filter */}
                                  <div className="relative">
                                    <button 
                                      onClick={() => setIsCyclistsCategoryFilterOpen(!isCyclistsCategoryFilterOpen)}
                                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md shadow-sm hover:bg-neutral-50 transition-colors min-w-[150px]"
                                    >
                                      <span className="truncate">
                                        {cyclistsCategoryFilter.length === 0 
                                          ? "Todas las categorías" 
                                          : \`\${cyclistsCategoryFilter.length} categorías\`}
                                      </span>
                                      <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isCyclistsCategoryFilterOpen && "rotate-180")} />
                                    </button>

                                    {isCyclistsCategoryFilterOpen && (
                                      <>
                                        <div 
                                          className="fixed inset-0 z-10" 
                                          onClick={() => setIsCyclistsCategoryFilterOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                          <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase">Categorías</span>
                                            {cyclistsCategoryFilter.length > 0 && (
                                              <button 
                                                onClick={() => setCyclistsCategoryFilter([])}
                                                className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                              >
                                                Limpiar
                                              </button>
                                            )}
                                          </div>
                                          {Array.from(new Set(files.carreras.data?.map(r => getVal(r, 'Categoría')).map(c => c?.trim()).filter(Boolean)))
                                            .sort((a, b) => a.localeCompare(b))
                                            .map(cat => (
                                              <label 
                                                key={cat} 
                                                className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer transition-colors"
                                              >
                                                <input 
                                                  type="checkbox" 
                                                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                                  checked={cyclistsCategoryFilter.includes(cat)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setCyclistsCategoryFilter([...cyclistsCategoryFilter, cat]);
                                                    } else {
                                                      setCyclistsCategoryFilter(cyclistsCategoryFilter.filter(c => c !== cat));
                                                    }
                                                  }}
                                                />
                                                <span className="ml-2 text-sm text-neutral-700 truncate">{cat}</span>
                                              </label>
                                            ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
`;

code = code.replace(
  "{/* Round Multi-select Filter */}",
  categoryUiHtml + "\n                                  {/* Round Multi-select Filter */}"
);

// 4. Update Header rows to translate Wins -> Victorias, Races -> Carreras
code = code.replace(
  /<div className="flex items-center justify-center gap-1">Wins /g,
  '<div className="flex items-center justify-center gap-1">Victorias '
);
code = code.replace(
  /<div className="flex items-center justify-center gap-1">Races /g,
  '<div className="flex items-center justify-center gap-1">Carreras '
);

// 5. Update data logic to map races and handle Categorias
const logicFind = `                                      // First, map races to months
                                      const raceMonths: Record<string, number> = {};
                                      files.carreras.data?.forEach(r => {
                                        const carreraName = getVal(r, 'Carrera')?.trim();
                                        const fechaFin = getVal(r, 'Fecha');
                                        if (carreraName && fechaFin) {
                                          const parts = fechaFin.split(/[-/]/);
                                          if (parts.length >= 2) {
                                            const monthIndex = parseInt(parts[1]) - 1;
                                            raceMonths[carreraName] = monthIndex;
                                          }
                                        }
                                      });`;

const logicReplace = `                                      // First, map races to months and categories
                                      const raceMonths: Record<string, number> = {};
                                      const raceCats: Record<string, string> = {};
                                      files.carreras.data?.forEach(r => {
                                        const carreraName = getVal(r, 'Carrera')?.trim();
                                        const fechaFin = getVal(r, 'Fecha');
                                        const cat = getVal(r, 'Categoría')?.trim();
                                        if (carreraName) {
                                          if (cat) raceCats[carreraName] = cat;
                                          if (fechaFin) {
                                            const parts = fechaFin.split(/[-/]/);
                                            if (parts.length >= 2) {
                                              const monthIndex = parseInt(parts[1]) - 1;
                                              raceMonths[carreraName] = monthIndex;
                                            }
                                          }
                                        }
                                      });`;
code = code.replace(logicFind, logicReplace);

// 6. Check categories inside the details loop
const detailSkipFind = `                                          // Apply month filter
                                          if (cyclistsMonthFilter !== 'all' && raceMonths[d.carrera] !== parseInt(cyclistsMonthFilter)) {
                                            return;
                                          }`;
const detailSkipReplace = `                                          // Apply month filter
                                          if (cyclistsMonthFilter !== 'all' && raceMonths[d.carrera] !== parseInt(cyclistsMonthFilter)) {
                                            return;
                                          }
                                          // Apply category filter
                                          if (cyclistsCategoryFilter.length > 0) {
                                            const cat = raceCats[d.carrera];
                                            if (!cat || !cyclistsCategoryFilter.includes(cat)) return;
                                          }`;
code = code.replace(detailSkipFind, detailSkipReplace);


// 7. Add hidden condition for mapping to correctly paginate 25 items visually
const mapReturnFind = `                                      return sortedStats.map((s, idx) => {
                                        const { name, data, numCarreras, ppc, ppd, originalPos } = s;

                                        return (
                                          <tr key={name} className="hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] divide-x divide-neutral-100">`;
const mapReturnReplace = `                                      return sortedStats.map((s, idx) => {
                                        const { name, data, numCarreras, ppc, ppd, originalPos } = s;

                                        let isHiddenVisual = idx >= 25 && !isTopCyclistsDraftExpanded;
                                        if (isTopCyclistsDraftCopying) {
                                            if (isTopCyclistsDraftCopying === 'full') isHiddenVisual = false;
                                            else {
                                                const pageNum = parseInt(isTopCyclistsDraftCopying.substring(1));
                                                const start = (pageNum - 1) * 50;
                                                const end = start + 50;
                                                isHiddenVisual = !(idx >= start && idx < end);
                                            }
                                        }

                                        return (
                                          <tr key={name} className={cn("hover:bg-neutral-50 transition-colors top-cyclists-row text-[11px] divide-x divide-neutral-100", isHiddenVisual && "hidden")}>`;
code = code.replace(mapReturnFind, mapReturnReplace);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated');
