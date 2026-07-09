const fs = require('fs');
const startlistText = `1	 Pogacar Tadej	1	11593	 UAE Team Emirates-XRG	Mostrar más
11	 Vingegaard Jonas	2	8625	 Team Visma | Lease a Bike	Mostrar más
2	 del Toro Isaac *	3	5340	 UAE Team Emirates-XRG	Mostrar más
21	 Evenepoel Remco	4	5153	 Red Bull-BORA-hansgrohe	Mostrar más
171	 Pidcock Tom	5	3913	 Pinarello-Q36.5 Pro Cycling Team	Mostrar más
105	 Philipsen Jasper	7	3411	 Alpecin-Premier Tech	Mostrar más
51	 Seixas Paul *	8	3379	 Decathlon CMA CGM Team	Mostrar más
101	 van der Poel Mathieu	9	3290	 Alpecin-Premier Tech	Mostrar más
151	 De Lie Arnaud *	10	3193	 Lotto-Intermarché	Mostrar más
25	 Lipowitz Florian	12	2969	 Red Bull-BORA-hansgrohe	Mostrar más
181	 Grégoire Romain *	15	2575	 Groupama-FDJ United	Mostrar más
118	 Schmid Mauro	16	2529	 Team Jayco-AlUla	Mostrar más
24	 Hindley Jai	18	2514	 Red Bull-BORA-hansgrohe	Mostrar más
33	 Pedersen Mads	19	2433	 Lidl-Trek	Mostrar más`;

const textLines = startlistText.split("\n").map((line) => line.trim());
console.log(textLines[0].match(/^([0-9]+[a-zA-Z]?)[^\w]/));
