const fs = require('fs');
let main = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

const varsToExtract = `
  const { filteredRows, teamRows, uniqueTeams, uniqueRondas, maxCiclistas, minCiclistas, minTeamPoints, maxTeamPoints, minTeamPointsMedios, maxTeamPointsMedios } = memoizedData;

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

  const filteredRowPagination = calculatePages(filteredRows, 50, "jugador");
  const teamRowPagination = calculatePages(teamRows, 30);

  const toggleRonda = (ronda: string) => {
    setStartlistFilterRondas((prev) => 
      prev.includes(ronda) ? prev.filter((r) => r !== ronda) : [...prev, ronda]
    );
  };
`;

// wait, calculatePages is defined inside the component?
// Let's replace {(() => { ... return ( ... ); })()} with just the return statement part conditionally.

main = main.replace('{(() => {\\n            if (memoizedData.filteredRows.length === 0 && memoizedData.teamRows.length === 0) return null;\\n            const { filteredRows, teamRows, uniqueTeams, uniqueRondas, maxCiclistas, minCiclistas, minTeamPoints, maxTeamPoints, minTeamPointsMedios, maxTeamPointsMedios } = memoizedData;', '  const getTeam... { \\n'); // wait, this is hard using replace.

fs.writeFileSync('flatten_startlist.cjs', `
const fs = require('fs');
let text = fs.readFileSync('src/components/tabs/StartlistView.tsx', 'utf8');

const iifeStartStr = '{(() => {';
const iifeStart = text.indexOf(iifeStartStr);

let newText = text.substring(0, iifeStart) + 
  \`{memoizedData.filteredRows.length > 0 || memoizedData.teamRows.length > 0 ? (\` + 
  \`\\n              <div className="space-y-6">\\n\` + text.substring(text.indexOf('<div\\n                  className={cn('));

newText = newText.replace('              </div>\\n            );\\n          })()}', '              </div>\\n            ) : null}');

// Now put the const definitions before the return statement of StartlistView:
const insertPoint = text.indexOf('return (\\n    <div className="space-y-6 animate-fade-in"');

fs.writeFileSync('src/components/tabs/StartlistView.tsx', newText);
`);
