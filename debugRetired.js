import fs from 'fs';

const resultados = JSON.parse(fs.readFileSync('public/resultados.json', 'utf8'));
const elecciones = JSON.parse(fs.readFileSync('public/elecciones.json', 'utf8'));

// find retired strings
const retiredStrings = ["DNF", "DNS", "OOT", "DSQ", "OTL"];

const retiredResults = resultados.filter(r => {
    const pos = String(r.Pos || r['Posición'] || '').toUpperCase();
    return retiredStrings.some(rs => pos.includes(rs));
});

console.log("Total retired results:", retiredResults.length);

const cyclistToPlayer = {};
elecciones.forEach(e => {
    const ciclista = String(e.Ciclista).trim();
    cyclistToPlayer[ciclista] = e.Nombre_Equipo || e.Equipo;
});

const draftedRetired = retiredResults.filter(r => {
    const ciclista = String(r.Ciclista).trim();
    return cyclistToPlayer[ciclista];
});

console.log("Drafted retired results:", draftedRetired.length);
if (draftedRetired.length > 0) {
    console.log("Sample drafted retired:", draftedRetired[0]);
    console.log("Team:", cyclistToPlayer[String(draftedRetired[0].Ciclista).trim()]);
}

