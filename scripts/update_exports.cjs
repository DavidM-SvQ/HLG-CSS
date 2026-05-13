const fs = require('fs');
const path = require('path');

const replacements = [
  ['performImageCopy(topCyclistsDraftRef, setIsTopCyclistsDraftCopying, type || "full")', 'performImageCopy(topCyclistsDraftRef, setIsTopCyclistsDraftCopying, type || "full", "topCyclistsDraft")'],
  ['performImageCopy(topTeamsTableRef, setIsTopTeamsCopying)', 'performImageCopy(topTeamsTableRef, setIsTopTeamsCopying, true, "topTeamsTable")'],
  ['performImageCopy(noDraftCyclistsTableRef, setIsNoDraftCyclistsCopying, mode || "full")', 'performImageCopy(noDraftCyclistsTableRef, setIsNoDraftCyclistsCopying, mode || "full", "noDraftCyclists")'],
  ['performImageCopy(evolutionChartRef, setIsEvolutionChartCopying)', 'performImageCopy(evolutionChartRef, setIsEvolutionChartCopying, true, "monthlyEvolutionChart")'],
  ['performImageCopy(chartRef, setIsCopying)', 'performImageCopy(chartRef, setIsCopying, true, "generalClassificationChart")'],
  ['performImageCopy(undebutedTableRef, setIsUndebutedCopying, mode || "full")', 'performImageCopy(undebutedTableRef, setIsUndebutedCopying, mode || "full", "undebutedCyclists")'],
  ['performImageCopy(winsHistoryRef, setIsWinsHistoryCopying, type || "full")', 'performImageCopy(winsHistoryRef, setIsWinsHistoryCopying, type || "full", "winsHistoryTable")'],
  ['performImageCopy(unscoredTableRef, setIsUnscoredCopying, mode || "full")', 'performImageCopy(unscoredTableRef, setIsUnscoredCopying, mode || "full", "unscoredCyclists")'],
  ['performImageCopy(winsEvolutionRef, setIsWinsEvolutionCopying)', 'performImageCopy(winsEvolutionRef, setIsWinsEvolutionCopying, true, "monthlyWinsEvolutionChart")'],
  ['performImageCopy(winsRankingRef, setIsWinsRankingCopying)', 'performImageCopy(winsRankingRef, setIsWinsRankingCopying, true, "teamWinsRankingChart")'],
  ['performImageCopy(draftDatosTableRef, setIsDraftDatosTableCopying)', 'performImageCopy(draftDatosTableRef, setIsDraftDatosTableCopying, true, "draftDatosTable")'],
  ['performImageCopy(draftTableRef, setIsDraftTableCopying, part || true)', 'performImageCopy(draftTableRef, setIsDraftTableCopying, part || true, "draftElectionsTable")'],

  ['performImageDownload(topCyclistsDraftRef, `top-ciclistas-draft${type && type !== "full" ? `-${type}` : ""}.png`)', 'performImageDownload(topCyclistsDraftRef, `top-ciclistas-draft${type && type !== "full" ? `-${type}` : ""}.png`, "topCyclistsDraft")'],
  ['performImageDownload(topTeamsTableRef, "top_teams.png")', 'performImageDownload(topTeamsTableRef, "top_teams.png", "topTeamsTable")'],
  ['performImageDownload(noDraftCyclistsTableRef, `top-ciclistas-no-elegidos${mode && mode !== "full" ? `-${mode}` : ""}.png`)', 'performImageDownload(noDraftCyclistsTableRef, `top-ciclistas-no-elegidos${mode && mode !== "full" ? `-${mode}` : ""}.png`, "noDraftCyclists")'],
  ['performImageDownload(evolutionChartRef, "evolucion-mensual.png")', 'performImageDownload(evolutionChartRef, "evolucion-mensual.png", "monthlyEvolutionChart")'],
  ['performImageDownload(chartRef, "clasificacion-general.png")', 'performImageDownload(chartRef, "clasificacion-general.png", "generalClassificationChart")'],
  ['performImageDownload(undebutedTableRef, `ciclistas-sin-debutar${mode && mode !== "full" ? `-${mode}` : ""}.png`)', 'performImageDownload(undebutedTableRef, `ciclistas-sin-debutar${mode && mode !== "full" ? `-${mode}` : ""}.png`, "undebutedCyclists")'],
  ['performImageDownload(winsHistoryRef, `historial-ganadores${type && type !== "full" ? `-${type}` : ""}.png`)', 'performImageDownload(winsHistoryRef, `historial-ganadores${type && type !== "full" ? `-${type}` : ""}.png`, "winsHistoryTable")'],
  ['performImageDownload(unscoredTableRef, `ciclistas-sin-puntuar${mode && mode !== "full" ? `-${mode}` : ""}.png`)', 'performImageDownload(unscoredTableRef, `ciclistas-sin-puntuar${mode && mode !== "full" ? `-${mode}` : ""}.png`, "unscoredCyclists")'],
  ['performImageDownload(winsEvolutionRef, "evolucion-victorias.png")', 'performImageDownload(winsEvolutionRef, "evolucion-victorias.png", "monthlyWinsEvolutionChart")'],
  ['performImageDownload(winsRankingRef, "ranking-victorias.png")', 'performImageDownload(winsRankingRef, "ranking-victorias.png", "teamWinsRankingChart")'],
  ['performImageDownload(draftDatosTableRef, "draft-datos.png")', 'performImageDownload(draftDatosTableRef, "draft-datos.png", "draftDatosTable")'],
  ['performImageDownload(draftTableRef, `draft-elecciones${part && part !== true ? `-${part}` : ""}.png`)', 'performImageDownload(draftTableRef, `draft-elecciones${part && part !== true ? `-${part}` : ""}.png`, "draftElectionsTable")'],

  ['performTextCopy(topCyclistsDraftRef, setIsTopCyclistsDraftTextCopying)', 'performTextCopy(topCyclistsDraftRef, setIsTopCyclistsDraftTextCopying, "topCyclistsDraft")'],
  ['performTextCopy(noDraftCyclistsTableRef, setIsNoDraftCyclistsTextCopying)', 'performTextCopy(noDraftCyclistsTableRef, setIsNoDraftCyclistsTextCopying, "noDraftCyclists")'],
  ['performTextCopy(undebutedTableRef, setIsUndebutedTextCopying)', 'performTextCopy(undebutedTableRef, setIsUndebutedTextCopying, "undebutedCyclists")'],
  ['performTextCopy(winsHistoryRef, setIsWinsHistoryTextCopying)', 'performTextCopy(winsHistoryRef, setIsWinsHistoryTextCopying, "winsHistoryTable")'],
  ['performTextCopy(unscoredTableRef, setIsUnscoredTextCopying)', 'performTextCopy(unscoredTableRef, setIsUnscoredTextCopying, "unscoredCyclists")']
];

function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files);
}

const files = getFiles('src/components/tabs').filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  replacements.forEach(([find, replace]) => {
    if (content.includes(find)) {
      content = content.replace(find, replace);
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(file, content);
    console.log("Updated", file);
  }
});
