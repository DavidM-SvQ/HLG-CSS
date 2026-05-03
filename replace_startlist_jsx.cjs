const fs = require('fs');

let code = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

// The original IIFE at line 208 was:
// {(() => {
//   const selectedData = ...

// Let's replace the whole {(() => { ... })()} block down to line 693.
// Wait, doing this via string match is dangerous if line numbers change.

const idxStart = code.indexOf('{(() => {\n            const selectedData = files.startlist.data');
const idxEnd = code.indexOf('          })()}\n        </div>');

console.log(idxStart, idxEnd);
if (idxStart !== -1 && idxEnd !== -1) {
  // We'll replace the block.
  
  const jsxBlock = `
        {(() => {
          const { filteredRows, teamRows, uniqueTeams, maxCiclistas, minCiclistas, minTeamPoints, maxTeamPoints, minTeamPointsMedios, maxTeamPointsMedios } = memoizedData;

          const getTeamPointsColorStyle = (punt: number) => {
              if (punt === 0) return {};
              return {
                backgroundColor: colorScale(
                  punt - minTeamPoints,
                  maxTeamPoints - minTeamPoints,
                ).replace("rgb", "rgba").replace(")", ", 0.2)"),
                color: colorScale(
                  punt - minTeamPoints,
                  maxTeamPoints - minTeamPoints,
                  true,
                ),
              };
          };

          const getTeamPointsMediosColorStyle = (punt: number) => {
              if (punt === 0) return {};
              return {
                backgroundColor: colorScale(
                  punt - minTeamPointsMedios,
                  maxTeamPointsMedios - minTeamPointsMedios,
                ).replace("rgb", "rgba").replace(")", ", 0.2)"),
                color: colorScale(
                  punt - minTeamPointsMedios,
                  maxTeamPointsMedios - minTeamPointsMedios,
                  true,
                ),
              };
          };

          const toggleSort = (
              col: "jugador" | "ronda" | "puntos" | "dias",
            ) => {
              if (startlistSortCol === col)
                setStartlistSortDir((prev) =>
                  prev === "asc" ? "desc" : "asc",
                );
              else {
                setStartlistSortCol(col);
                setStartlistSortDir("asc");
              }
            };
          
          return (
             // Keep the old JSX inside
          );
        })()}
  `;
}
