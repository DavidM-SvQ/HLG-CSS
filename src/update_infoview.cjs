const fs = require('fs');

const file = 'src/components/tabs/InfoView.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { ExportToolbar }')) {
  content = content.replace(
    'import { getVal',
    'import { ExportToolbar } from "../ui/ExportToolbar";\nimport { getVal'
  );
}

// First replacement (points table)
const pointsRegex = /<button\s+onClick=\{\(\) => setIsPointsExpanded\(!isPointsExpanded\)\}[\s\S]*?<UploadCloud className="w-4 h-4" \/>\s*<\/button>/g;
content = content.replace(pointsRegex, `<ExportToolbar 
                          isExpanded={isPointsExpanded} 
                          onExpand={() => setIsPointsExpanded(!isPointsExpanded)} 
                          onCopyText={handleCopyPoints} 
                          isTextCopying={isPointsTextCopying} 
                          onCopyImage={handleCopyPointsImage} 
                          isImageCopying={isPointsImageCopying} 
                          onDownloadImage={handleDownloadPointsImage} 
                        />`);

// Second replacement (races table)
const racesRegex = /<button\s+onClick=\{\(\) => setIsRacesExpanded\(!isRacesExpanded\)\}[\s\S]*?<UploadCloud className="w-4 h-4" \/>\s*<\/button>/g;
content = content.replace(racesRegex, `<ExportToolbar 
                          isExpanded={isRacesExpanded} 
                          onExpand={() => setIsRacesExpanded(!isRacesExpanded)} 
                          onCopyText={handleCopyRaces} 
                          isTextCopying={isRacesTextCopying} 
                          onCopyImage={handleCopyRacesImage} 
                          isImageCopying={isRacesImageCopying} 
                          onDownloadImage={handleDownloadRacesImage} 
                        />`);

fs.writeFileSync(file, content);
console.log('InfoView updated');
