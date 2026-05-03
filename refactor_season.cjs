const fs = require('fs');
const ts = require('typescript');

const content = fs.readFileSync('src/components/tabs/SeasonView.tsx', 'utf-8');

// 1. Get ALL import lines
const importLines = content.split('\n').filter(line => line.startsWith('import '));

// 2. Find variables to put in context
const sourceFile = ts.createSourceFile('SeasonView.tsx', content, ts.ScriptTarget.Latest, true);
const variables = new Set(['cn', 'CyclistDetailView']); // explicitly add
const functions = new Set();
let returnIdx = -1;

// To find returnIdx exactly for the MAIN component
const lineColorsIdx = content.indexOf('const LINE_COLORS =');
returnIdx = content.indexOf('return (', lineColorsIdx);
if (returnIdx === -1) throw new Error("Could not find main return");

// Find specific markers
const tabsBarMarker = '{/* Season Sub-Tabs */}';
const tabsBarIdx = content.indexOf(tabsBarMarker, returnIdx);

const puntosStartStr = '{seasonSubTab === "puntos" && (';
const victoriasStartStr = '{seasonSubTab === "victorias" && (';
const ciclistasStartStr = '{seasonSubTab === "ciclistas" && (';

const puntosIdx = content.indexOf(puntosStartStr, tabsBarIdx);
const victoriasIdx = content.indexOf(victoriasStartStr, puntosIdx);
const ciclistasIdx = content.indexOf(ciclistasStartStr, victoriasIdx);

// End of main return
const beforeCiclistas = content.substring(0, content.lastIndexOf('</div>', content.length - 1));
const mainReturnEndIdx = content.lastIndexOf(')', beforeCiclistas.length);

const tabsBarContent = content.substring(tabsBarIdx, puntosIdx);
const puntosContent = content.substring(puntosIdx, victoriasIdx);
const victoriasContent = content.substring(victoriasIdx, ciclistasIdx);

// For ciclistasContent, get everything from ciclistasIdx to the end of the return
// Actually we can just find the closing brace that matches the start.
// Let's rely on basic string indexing for ciclistas content.
let ciclistasContent = content.substring(ciclistasIdx);
// ciclistasContent ends at the end of the main return
ciclistasContent = ciclistasContent.substring(0, ciclistasContent.lastIndexOf('</div>', ciclistasContent.length - 1));
ciclistasContent = ciclistasContent.substring(0, ciclistasContent.lastIndexOf('</div>', ciclistasContent.length - 1));

// Variables Extraction Logic (same as before)
function visit(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'SeasonView') {
    if (node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
      node.initializer.body.statements.forEach(stmt => {
        if (ts.isVariableStatement(stmt)) {
          stmt.declarationList.declarations.forEach(decl => {
            if (ts.isIdentifier(decl.name)) {
              variables.add(decl.name.text);
            } else if (ts.isArrayBindingPattern(decl.name)) {
              decl.name.elements.forEach(el => {
                if (ts.isBindingElement(el) && ts.isIdentifier(el.name)) {
                  variables.add(el.name.text);
                }
              });
            } else if (ts.isObjectBindingPattern(decl.name)) {
              decl.name.elements.forEach(el => {
                if (ts.isBindingElement(el) && ts.isIdentifier(el.name)) {
                  variables.add(el.name.text);
                }
              });
            }
          });
        } else if (ts.isFunctionDeclaration(stmt) && stmt.name) {
          functions.add(stmt.name.text);
        }
      });
    }
  }
  ts.forEachChild(node, visit);
}
visit(sourceFile);
Array.from(variables).forEach(v => functions.add(v));
// Add props manually
const explicitProps = [
  'files', 'playerTeamMap', 'playerByCyclist', 'uniqueRaces', 'leaderboard', 
  'raceWinners', 'globalTeamPartialWinsCount', 'globalTeamWinsCount', 
  'cyclistMetadata', 'cyclistRoundMap', 'playerOrderMap'
];
explicitProps.forEach(v => functions.add(v));

const allParamsStr = Array.from(functions).join(', ');

// Helper to generate sub-component
function generateComponent(name, jsx) {
  return `import React, { useContext } from "react";
${importLines.join('\n')}
import { SeasonViewContext } from "./SeasonViewContext";

export function ${name}() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const { ${allParamsStr} } = context;

  return (
    <>
      ${jsx}
    </>
  );
}
`;
}

if (!fs.existsSync('src/components/tabs/season')) {
  fs.mkdirSync('src/components/tabs/season');
}

fs.writeFileSync('src/components/tabs/season/SeasonViewContext.tsx', `
import { createContext } from 'react';
export const SeasonViewContext = createContext<any>(null);
`);

fs.writeFileSync('src/components/tabs/season/SeasonPointsTab.tsx', generateComponent('SeasonPointsTab', puntosContent));
fs.writeFileSync('src/components/tabs/season/SeasonWinsTab.tsx', generateComponent('SeasonWinsTab', victoriasContent));
fs.writeFileSync('src/components/tabs/season/SeasonCyclistsTab.tsx', generateComponent('SeasonCyclistsTab', ciclistasContent));

// Now rewrite SeasonView.tsx
const newReturn = `return (
    <SeasonViewContext.Provider value={{
      ${allParamsStr}
    }}>
      <div className="space-y-8">
        ${content.substring(returnIdx + 'return ('.length + 1, tabsBarIdx).replace(/\s*\<div className="space-y-8"\>/, '')}
        ${tabsBarContent}
        <SeasonPointsTab />
        <SeasonWinsTab />
        <SeasonCyclistsTab />
      </div>
    </SeasonViewContext.Provider>
  );
};

export default SeasonView;
`;

const importsToAdd = `
import { SeasonViewContext } from "./season/SeasonViewContext";
import { SeasonPointsTab } from "./season/SeasonPointsTab";
import { SeasonWinsTab } from "./season/SeasonWinsTab";
import { SeasonCyclistsTab } from "./season/SeasonCyclistsTab";
`;

let finalSeasonView = content.substring(0, returnIdx) + newReturn;
finalSeasonView = finalSeasonView.replace(/(import .*;\n)+/m, match => match + importsToAdd);

fs.writeFileSync('src/components/tabs/SeasonView.tsx', finalSeasonView);

console.log("Refactor complete.");
