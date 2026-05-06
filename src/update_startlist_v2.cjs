const fs = require('fs');

const file = 'src/components/tabs/StartlistView.tsx';
let content = fs.readFileSync(file, 'utf8');

// First replace: from </select> to </div>\n                    )}
// The button part specifically starts after </select>
const block1Regex = /<\/select>\s*<button[\s\S]*?onClick=\{\(\) => setIsStartlistTableExpanded\(!isStartlistTableExpanded\)\}[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleCopyStartlist\}[\s\S]*?<\/button>\s*<\/div>\s*\)\}/m;
content = content.replace(block1Regex, `</select>
                        <ExportToolbar 
                          isExpanded={isStartlistTableExpanded} 
                          onExpand={() => setIsStartlistTableExpanded(!isStartlistTableExpanded)} 
                          onCopyImage={handleCopyStartlist} 
                          isImageCopying={isStartlistCopying} 
                        />
                      </div>
                    )}`);

// Second replace: Resumen Equipos
const block2Regex = /<div className="flex gap-2 relative copy-button-ignore">\s*<button[\s\S]*?onClick=\{\(\) =>[\s\S]*?setIsStartlistTeamsTableExpanded[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleCopyStartlistTeams\}[\s\S]*?<\/button>\s*<\/div>/m;
content = content.replace(block2Regex, `<div className="flex gap-2 relative copy-button-ignore">
                      <ExportToolbar 
                        isExpanded={isStartlistTeamsTableExpanded} 
                        onExpand={() => setIsStartlistTeamsTableExpanded(!isStartlistTeamsTableExpanded)} 
                        onCopyImage={handleCopyStartlistTeams} 
                        isImageCopying={isStartlistTeamsCopying} 
                      />
                    </div>`);

// Third replace: Puntuaciones
const block3Regex = /<div className="flex items-center gap-2 copy-button-ignore">\s*<button[\s\S]*?onClick=\{\(\) => setIsPointsExpanded\(!isPointsExpanded\)\}[\s\S]*?<UploadCloud className="w-4 h-4" \/>\s*<\/button>\s*<\/div>/m;
content = content.replace(block3Regex, `<div className="flex items-center gap-2 copy-button-ignore">
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
console.log("Replaced perfectly");
