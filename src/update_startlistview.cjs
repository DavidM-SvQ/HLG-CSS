const fs = require('fs');

const file = 'src/components/tabs/StartlistView.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { ExportToolbar }')) {
  content = content.replace(
    'import { List',
    'import { ExportToolbar } from "../ui/ExportToolbar";\nimport { List'
  );
}

// 1. Ciclistas Participantes (lines 384-420 approx)
// Looks like:
/*
<button
  onClick={() => setIsStartlistTableExpanded(!isStartlistTableExpanded)}
...
</button>
<button
  onClick={handleCopyStartlist}
...
  {isStartlistCopying ? (
    <CheckCircle2 className="w-4 h-4" />
  ) : (
    <Copy className="w-4 h-4" />
  )}
</button>
*/
const ciclistasRegex = /<button[\s\S]*?onClick=\{\(\) =>\s*setIsStartlistTableExpanded[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleCopyStartlist\}[\s\S]*?<\/button>/m;
content = content.replace(ciclistasRegex, `<ExportToolbar 
                          isExpanded={isStartlistTableExpanded} 
                          onExpand={() => setIsStartlistTableExpanded(!isStartlistTableExpanded)} 
                          onCopyImage={handleCopyStartlist} 
                          isImageCopying={isStartlistCopying} 
                        />`);

// 2. Resumen Equipos
const equiposRegex = /<button[\s\S]*?onClick=\{\(\) =>\s*setIsStartlistTeamsTableExpanded[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleCopyStartlistTeams\}[\s\S]*?<\/button>/m;
content = content.replace(equiposRegex, `<ExportToolbar 
                        isExpanded={isStartlistTeamsTableExpanded} 
                        onExpand={() => setIsStartlistTeamsTableExpanded(!isStartlistTeamsTableExpanded)} 
                        onCopyImage={handleCopyStartlistTeams} 
                        isImageCopying={isStartlistTeamsCopying} 
                      />`);

// 3. Puntos
const puntosRegex = /<div className="flex items-center gap-2 copy-button-ignore">[\s\S]*?<button[\s\S]*?onClick=\{\(\) => setIsPointsExpanded\(!isPointsExpanded\)\}[\s\S]*?<UploadCloud className="w-4 h-4" \/>\s*<\/button>\s*<\/div>/m;
content = content.replace(puntosRegex, `<div className="flex items-center gap-2 copy-button-ignore">
                  <ExportToolbar 
                    isExpanded={isPointsExpanded} 
                    onExpand={() => setIsPointsExpanded(!isPointsExpanded)} 
                    onCopyText={handleCopyPoints} 
                    isTextCopying={isPointsTextCopying} 
                    onCopyImage={handleCopyPointsImage} 
                    isImageCopying={isPointsImageCopying} 
                    onDownloadImage={handleDownloadPointsImage} 
                  />
                </div>`);

fs.writeFileSync(file, content);
console.log('StartlistView updated');
