const fs = require('fs');

const path = 'src/components/tabs/admin/AdminDatosV2Tab.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the map function
const startIndex = content.indexOf('{leaderboard.map((team, idx) => {');
if (startIndex === -1) {
  console.log("Could not find leaderboard.map");
  process.exit(1);
}

const endIndex = content.indexOf('return (', startIndex);
if (endIndex === -1) {
  console.log("Could not find return inside map");
  process.exit(1);
}

const beforeCode = content.substring(0, startIndex);
const mapCode = content.substring(startIndex, endIndex);
const afterCode = content.substring(endIndex);

// Let's replace the grouping logic to be inside a component or useMemo.
// But it's easier to just push it inside `{isExpanded && (`
// Wait, we can't easily push it into JSX without an IIFE or extracting a component.
// So let's extract it to a subcomponent!

let subComponent = `
const TeamRow = ({ team, idx, playerByCyclist, cyclistMetadata }: any) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Agrupar puntos por ciclista
  const cyclistArr = React.useMemo(() => {
    if (!isExpanded) return [];
    const cyclistPointData: Record<string, { total: number, detalles: any[] }> = {};
    team.detalles.forEach((d: any) => {
      if (!cyclistPointData[d.ciclista]) {
        cyclistPointData[d.ciclista] = { total: 0, detalles: [] };
      }
      cyclistPointData[d.ciclista].total += d.puntosObtenidos;
      cyclistPointData[d.ciclista].detalles.push(d);
    });

    const teamCyclistsStr = Object.keys(playerByCyclist).filter(c => playerByCyclist[c] === team.jugador);
    Object.keys(cyclistPointData).forEach(c => {
       if (!teamCyclistsStr.includes(c)) teamCyclistsStr.push(c);
    });

    return teamCyclistsStr.map((name) => {
      const ptsRaw = cyclistPointData[name];
      const pts = ptsRaw?.total || 0;
      
      const meta = cyclistMetadata[name] || {};
      const ronda = meta.ronda !== undefined ? parseInt(meta.ronda as string, 10) : 99;
      const subRonda = meta.orden !== undefined ? parseInt(meta.orden as string, 10) : 99;
      
      return {
        name,
        points: pts,
        detalles: ptsRaw?.detalles || [],
        ronda,
        subRonda,
        equipoReal: meta.equipo || "Libre"
      };
    }).sort((a, b) => {
      if (a.ronda !== b.ronda) return a.ronda - b.ronda;
      return a.subRonda - b.subRonda;
    });
  }, [team, playerByCyclist, cyclistMetadata, isExpanded]);

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
      <div 
        className="p-4 bg-neutral-50 hover:bg-neutral-100 cursor-pointer flex items-center justify-between transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            {idx + 1}
          </div>
          <div>
            <h3 className="font-bold text-neutral-900">{team.nombreEquipo}</h3>
            <p className="text-xs text-neutral-500">{team.jugador}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block font-bold text-lg text-blue-700">{team.puntos} pts</span>
          </div>
          {isExpanded ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-white border-t border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {cyclistArr.map(c => (
              <div key={c.name} className="flex justify-between items-center p-2 rounded border border-neutral-100 bg-neutral-50 text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-medium text-neutral-800 truncate" title={c.name}>{c.name}</span>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-bold text-blue-600">{c.points} pts</span>
                  <span className="text-[10px] text-neutral-400">R{c.ronda} #{c.subRonda}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
`;

const leaderboardEnd = content.indexOf('</div>', content.indexOf('{leaderboard.map'));
// We will replace the entire mapping block!

let newContent = content.substring(0, content.indexOf('{leaderboard.map'));
newContent += '{leaderboard.map((team, idx) => (\n              <TeamRow key={team.nombreEquipo} team={team} idx={idx} playerByCyclist={playerByCyclist} cyclistMetadata={cyclistMetadata} />\n            ))}';
newContent += content.substring(content.indexOf('</div>\n          </div>', content.indexOf('{leaderboard.map')));

// Add the subcomponent at the end of the file, before the export if possible, or just before export const AdminDatosV2Tab = () => {
newContent = newContent.replace('export const AdminDatosV2Tab = () => {', subComponent + '\nexport const AdminDatosV2Tab = () => {\n');

fs.writeFileSync(path, newContent, 'utf8');
console.log("Patched successfully");
