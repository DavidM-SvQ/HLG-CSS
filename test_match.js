const startlistText = `
1	 Pogacar Tadej	1	11593	 UAE Team Emirates-XRG	Mostrar más
11	 Vingegaard Jonas	2	8625	 Team Visma | Lease a Bike	Mostrar más
2	 del Toro Isaac *	3	5340	 UAE Team Emirates-XRG	Mostrar más
21	 Evenepoel Remco	4	5153	 Red Bull-BORA-hansgrohe	Mostrar más
171	 Pidcock Tom	5	3913	 Pinarello-Q36.5 Pro Cycling Team	Mostrar más
`;

const textLines = startlistText.split("\n").map(l => l.trim()).filter(Boolean);
const textLinesLower = textLines.map(l => l.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

const playerByCyclist = {
  "POGAČAR Tadej": "Jugador 1",
  "DEL TORO Isaac": "Jugador 1",
  "EVENEPOEL Remco": "Jugador 2",
  "PIDCOCK Thomas": "Jugador 3"
};

Object.keys(playerByCyclist).forEach((cyclist) => {
  const parts = cyclist.split(" ").filter(Boolean);
  const isUpperCase = (str) => str === str.toUpperCase() && str !== str.toLowerCase();
  const lastNames = parts.filter(isUpperCase).join(" ");
  const firstNames = parts.filter(p => !isUpperCase(p)).join(" ");
  
  const cyclistStandard = cyclist.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cyclistNoComma = cyclistStandard.replace(/,/g, "");
  const cyclistReversed = `${firstNames} ${lastNames}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const cyclistReversed2 = `${lastNames} ${firstNames}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const lineIndex = textLinesLower.findIndex((line) => {
    const lNoComma = line.replace(/,/g, "");
    const createRegex = (nameStr) => {
      const escapedStr = nameStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escapedStr.replace(/ /g, '\\s+')}\\b`, "i");
    };
    return createRegex(cyclistStandard).test(lNoComma) ||
           createRegex(cyclistNoComma).test(lNoComma) ||
           createRegex(cyclistReversed).test(lNoComma) ||
           createRegex(cyclistReversed2).test(lNoComma);
  });

  if (lineIndex !== -1) {
    const originalLine = textLines[lineIndex];
    let dorsal = "";
    const match = originalLine.trim().match(/^([0-9]+[a-zA-Z]?)[^\w]/) || originalLine.trim().match(/^([0-9]+[a-zA-Z]?)$/);
    if (match) {
      dorsal = match[1];
    }
    console.log(`Matched ${cyclist}: dorsal='${dorsal}' on line: ${originalLine}`);
  } else {
    console.log(`NOT MATCHED: ${cyclist}`);
  }
});
