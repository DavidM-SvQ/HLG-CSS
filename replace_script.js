import fs from 'fs';

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const regexDatos = /\{\s*adminTab === "datos" && \([\s\S]*?\)\s*\}(?=\s*\{adminTab === "gestion-startlists")/g;
if (regexDatos.test(content)) {
  content = content.replace(regexDatos, `{adminTab === "datos" && (
              <Suspense fallback={<div className="p-8"><TableSkeleton rows={8} /></div>}>
                <AdminDatosTab
                  files={files}
                  user={user}
                  FILE_TYPES={FILE_TYPES}
                  handleFileUpload={handleFileUpload}
                  leaderboard={leaderboard}
                />
              </Suspense>
            )}
`);
  console.log("Replaced datos");
} else {
  console.log("Could not find datos");
}

const regexStartlist = /\{\s*adminTab === "gestion-startlists" && \([\s\S]*?\)\s*\}(?=\s*\{adminTab === "reporte-carrera")/g;
if (regexStartlist.test(content)) {
  content = content.replace(regexStartlist, `{adminTab === "gestion-startlists" && (
              <Suspense fallback={<div className="p-8"><TableSkeleton rows={8} /></div>}>
                <GestionStartlists
                  files={files}
                  user={user}
                  startlistRace={startlistRace}
                  setStartlistRace={setStartlistRace}
                  startlistText={startlistText}
                  setStartlistText={setStartlistText}
                  handleParseStartlist={handleParseStartlist}
                  parsedStartlist={parsedStartlist}
                  isSavingStartlist={isSavingStartlist}
                  handleSaveStartlist={handleSaveStartlist}
                />
              </Suspense>
            )}
`);
  console.log("Replaced gestion-startlists");
} else {
  console.log("Could not find startlists");
}

fs.writeFileSync(path, content, 'utf8');
console.log("Done.");
