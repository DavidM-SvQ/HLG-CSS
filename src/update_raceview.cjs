const fs = require('fs');

const file = 'src/components/tabs/RaceView.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { ExportToolbar }')) {
  content = content.replace(
    'import { RaceAdminReport',
    'import { ExportToolbar } from "../ui/ExportToolbar";\nimport { RaceAdminReport'
  );
}

// 1. Clasificación de Equipos
const regex1 = /<div className="flex items-center gap-1">[\s\S]*?<button[\s\S]*?onClick=\{\(\) =>\s*setIsRaceClassificationExpanded\(!isRaceClassificationExpanded\)\}[\s\S]*?<UploadCloud className="w-4 h-4" \/>\s*<\/button>\s*<\/div>/m;
content = content.replace(regex1, `<div className="flex items-center gap-1">
                      <ExportToolbar 
                        isExpanded={isRaceClassificationExpanded} 
                        onExpand={() => setIsRaceClassificationExpanded(!isRaceClassificationExpanded)} 
                        onCopyImage={handleCopyRaceClassification} 
                        onDownloadImage={handleDownloadRaceClassification} 
                      />
                    </div>`);

// 2. Clasificación de Ciclistas
const regex2 = /<div className="flex items-center gap-1">[\s\S]*?<button[\s\S]*?onClick=\{\(\) =>\s*setIsCyclistsExpanded\(!isCyclistsExpanded\)\}[\s\S]*?<UploadCloud className="w-4 h-4" \/>\s*<\/button>\s*<\/div>/m;
content = content.replace(regex2, `<div className="flex items-center gap-1">
                      <ExportToolbar 
                        isExpanded={isCyclistsExpanded} 
                        onExpand={() => setIsCyclistsExpanded(!isCyclistsExpanded)} 
                        onCopyImage={handleCopyCyclists} 
                        onDownloadImage={handleDownloadCyclists} 
                      />
                    </div>`);

// 3. Clasificación por Etapas
const regex3 = /<div className="flex items-center gap-1">[\s\S]*?<button[\s\S]*?onClick=\{\(\) => setIsStageExpanded\(!isStageExpanded\)\}[\s\S]*?<UploadCloud className="w-4 h-4" \/>\s*<\/button>\s*<\/div>/m;
content = content.replace(regex3, `<div className="flex items-center gap-1">
                        <ExportToolbar 
                          isExpanded={isStageExpanded} 
                          onExpand={() => setIsStageExpanded(!isStageExpanded)} 
                          onCopyImage={handleCopyRaceBreakdownImage} 
                          isImageCopying={isRaceBreakdownCopying} 
                          onDownloadImage={handleDownloadRaceBreakdownImage} 
                        />
                      </div>`);

// 4. Desglose por Equipo (complex toolbar)
const regex4 = /<div className="flex items-center gap-1\.5">[\s\S]*?<button[\s\S]*?onClick=\{handleCopyDetailedBreakdownText\}[\s\S]*?<button[\s\S]*?onClick=\{\(\) =>\s*setIsDetailedBreakdownExpanded\(\s*!isDetailedBreakdownExpanded,\s*\)\s*\}[\s\S]*?<button\s+onClick=\{\(\) => handleDownloadDetailedBreakdownImage\(\)\}[\s\S]*?<\/button>\s*(?:\{raceTeams\.length > 12 && \([\s\S]*?<\/div>\s*\)\})?\s*<\/div>/m;

// wait, the Desglose toolbar HAS the subsets 'first', 'second', 'third'. Let's keep those buttons and just replace the main ones with ExportToolbar, OR since ExportToolbar doesn't have the subsets, let ExportToolbar just handle text, expand, copy image full, download.
content = content.replace(regex4, (match) => {
  // extract the subsets buttons if they exist
  const subsetsMatch = match.match(/\{raceTeams\.length > 12 && \([\s\S]*?<\/div>\s*\)\}/);
  const subsetsCode = subsetsMatch ? subsetsMatch[0] : '';
  
  return `<div className="flex items-center gap-1.5">
                      <ExportToolbar 
                        isExpanded={isDetailedBreakdownExpanded} 
                        onExpand={() => setIsDetailedBreakdownExpanded(!isDetailedBreakdownExpanded)} 
                        onCopyText={handleCopyDetailedBreakdownText} 
                        isTextCopying={isDetailedBreakdownTextCopying} 
                        useClipboardIconForText={true} 
                        textCopyLabel="" 
                        onCopyImage={() => handleCopyDetailedBreakdownImage("full")} 
                        isImageCopying={isDetailedBreakdownCopying === "full"} 
                        onDownloadImage={handleDownloadDetailedBreakdownImage} 
                      />
                      ${subsetsCode}
                    </div>`;
});

fs.writeFileSync(file, content);
console.log('RaceView updated');
