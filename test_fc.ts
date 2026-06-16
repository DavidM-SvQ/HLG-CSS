const text = `
01	Team Visma | Lease a Bike	32:52
 Jorgenson Matteo  Nordhagen Jørgen (15)  Armirail Bruno (51)  Hagenes Per Strand (02:08)  Affini Edoardo (02:26)  Tulett Ben (04:36)  van Aert Wout (05:13)
02	Netcompany INEOS	+ 09
 Vauquelin Kévin  Onley Oscar  Rodriguez Carlos (+ 22)  Godon Dorian (+ 01:52)  Tarling Joshua (+ 01:52)  Watson Sam (+ 04:43)  De Plus Laurens (+ 06:09)
03	EF Education-EasyPost	+ 29
Youth jerseyLeader jersey Baudin Alex  Healy Ben (+ 02:06)  Steinhauser Georg (+ 02:06)  Leonard Michael (+ 02:27)  Quinn Sean (+ 03:53)  Walker Max (+ 04:21)  Mackellar Alastair (+ 04:21)
`;

const lines = text.split('\n');
let currentTeamPos = "";
let currentTeamName = "";

lines.forEach(line => {
    const trimmed = line.trim();
    if(!trimmed) return;
    
    const teamMatch = line.match(/^(\d+)\s+([^\t]+)/);
    if(teamMatch && teamMatch[1] && parseInt(teamMatch[1]) <= 50) {
        currentTeamPos = parseInt(teamMatch[1], 10).toString();
        currentTeamName = teamMatch[2].split(/\t/)[0].replace(/  .*/, '').trim();
        console.log("TEAM:", currentTeamPos, currentTeamName);
        return;
    }
    
    let ridersStr = trimmed.replace(/\b(?:Youth jersey|Leader jersey|Points jersey|Mountains jersey)\b/ig, '');
    const parts = ridersStr.split(/\s{2,}/);
    parts.forEach(p => {
        let name = p.replace(/\s*\(.*?\)\s*/g, '').trim();
        // remove jersey text if combined like "Youth jerseyLeader jersey Baudin Alex"
        name = name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/.*jersey\s*/ig, '').trim();
        if(name) {
            console.log(`\t RIDER: ${currentTeamPos}\t\t\t${name}\t${currentTeamName}`);
        }
    });
});
