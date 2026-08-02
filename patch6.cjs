const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/race/stats/RacePointsPerRound.tsx', 'utf8');

code = code.replace(/onDownloadImage=\{\(\) \=\> handleDownloadImage\(\{ fileName: \"puntos\-ronda\-equipo\" \}\)\}/g, 'onDownloadImage={() => handleDownloadImage({ fileName: "puntos-ronda-equipo.png" })}');
// TypeScript Error: Type '() => Promise<void>' is not assignable to type '(range?: string | undefined) => void'.
code = code.replace(/onCopyImage=\{handleCopy\}/g, 'onCopyImage={() => { handleCopy(); }}');
code = code.replace(/onDownloadImage=\{\(\) \=\> handleDownloadImage\(\{ fileName: \"puntos\-ronda\-equipo\.png\" \}\)\}/g, 'onDownloadImage={() => { handleDownloadImage({ fileName: "puntos-ronda-equipo.png" }); }}');

fs.writeFileSync('src/components/tabs/race/stats/RacePointsPerRound.tsx', code);
