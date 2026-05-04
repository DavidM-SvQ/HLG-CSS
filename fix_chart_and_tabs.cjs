const fs = require('fs');

const files = [
    'src/components/tabs/SeasonView.tsx',
    'src/components/tabs/season/SeasonWinsTab.tsx',
    'src/components/tabs/season/SeasonPointsTab.tsx',
    'src/components/tabs/season/SeasonCyclistsTab.tsx',
    'src/components/tabs/DraftView.tsx'
];

for (const file of files) {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');

        // Fix season sub tab
        if (file.includes('SeasonView.tsx')) {
            code = code.replace(/const \[seasonSubTab, setSeasonSubTab\] = useState\("teams"\);/g, 'const [seasonSubTab, setSeasonSubTab] = useState("puntos");');
        }

        // Fix Recharts flashing
        // Sometimes React Recharts ResponsiveContainer flashes continuously
        // To fix: 
        // 1. replace width="100%" height="100%" with width="100%" height="99%" minHeight={300}
        // 2. OR add debounce to ResponsiveContainer? No, height="99%" or minimum height is the best fix.
        // Let's replace height="100%" with height="99%" on ResponsiveContainer.
        
        code = code.replace(/<ResponsiveContainer width="100%" height="100%">/g, '<ResponsiveContainer width="100%" height="99%">');
        code = code.replace(/<ResponsiveContainer width="100%" height="100%"\s*>/g, '<ResponsiveContainer width="100%" height="99%">');
        
        // Also remove `pb-4` on `<div className="w-full overflow-x-auto pb-4 h-full">` if it exists because that reduces height and causes shifting
        code = code.replace(/className="w-full overflow-x-auto pb-4 h-full"/g, 'className="w-full overflow-x-auto h-full"');

        fs.writeFileSync(file, code);
    }
}
console.log("Fixes applied");
