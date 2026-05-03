const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf8');

const hookInjections = `
  const raceTypeByName = useMemo(() => {
    const map: Record<string, string> = {};
    files?.carreras?.data?.forEach((row: any) => {
      const carrera = getVal(row, "Carrera")?.trim();
      const categoria = getVal(row, "Categoría")?.trim();
      if (carrera && categoria) map[carrera] = categoria;
    });
    return map;
  }, [files?.carreras?.data]);

  const raceDateByName = useMemo(() => {
    const map: Record<string, string> = {};
    files?.carreras?.data?.forEach((row: any) => {
      const carrera = getVal(row, "Carrera")?.trim();
      const fecha = getVal(row, "Fecha")?.trim();
      if (carrera && fecha) map[carrera] = fecha;
    });
    return map;
  }, [files?.carreras?.data]);

  const draftCyclistStats = useMemo(() => {
    const stats: Record<string, { puntos: number; victorias: number }> = {};
    leaderboard?.forEach((player: any) => {
      player?.detalles?.forEach((d: any) => {
        if (!stats[d.ciclista]) {
          stats[d.ciclista] = { puntos: 0, victorias: 0 };
        }
        stats[d.ciclista].puntos += d.puntosObtenidos;

        const isPos01 = d.posicion === "01" || d.posicion === "1";
        const isValidType = [
          "Etapa",
          "Etapa (Crono equipos)",
          "Clasificación final",
          "Clasificación final (Crono equipos)",
          "Clásica",
        ].includes(d.tipoResultado);

        if (isPos01 && isValidType) {
          stats[d.ciclista].victorias += 1;
        }
      });
    });
    return stats;
  }, [leaderboard]);

  const teamTotalPoints = useMemo(() => {
    const totals: Record<string, number> = {};
    files.elecciones?.data?.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista") as string;
      const equipo = getVal(row, "Nombre_Equipo") || (getVal(row, "Nombre_TG") as string);
      const pts = draftCyclistStats[ciclista]?.puntos || 0;
      if (equipo) {
        totals[equipo] = (totals[equipo] || 0) + pts;
      }
    });
    return totals;
  }, [files?.elecciones?.data, draftCyclistStats]);
`;

code = code.replace(/return \(\s*<>\s*<div className="space-y-8">/, match => hookInjections + '\n  ' + match);

// Remove the recalculations inside the file by just commenting them out or stripping them
// We can use plain text replacement for the known blocks, but let's be careful.
// Let's just comment out `const teamTotalPoints:` so it uses the memoized one.
// Wait, inner variables shadow the outer ones if they have the same name!
// `const teamTotalPoints: Record<string, number> = {};` -> `/* const teamTotalPoints... */`
code = code.replace(/const teamTotalPoints:\s*Record<string,\s*number>\s*=\s*{};/g, '/* removed teamTotalPoints init */');
code = code.replace(/files\.elecciones\?\.data\?\.forEach\(\(row\) => {\s*const ciclista = getVal\(row, "Ciclista"\) as string;\s*const equipo =\s*getVal\(row, "Nombre_Equipo"\) \|\|\s*\(getVal\(row, "Nombre_TG"\) as string\);\s*const pts =\s*draftCyclistStats\[ciclista\]\?\.puntos \|\| 0;\s*if \(equipo\) {\s*teamTotalPoints\[equipo\] =\s*\(teamTotalPoints\[equipo\] \|\| 0\) \+ pts;\s*}\s*}\);/g, '/* removed teamTotalPoints calc */');

code = code.replace(/const draftCyclistStats:\s*Record<\s*string,\s*{ puntos: number; victorias: number }\s*>\s*=\s*{};/g, '/* removed draftCyclistStats init */');
code = code.replace(/leaderboard\?\.forEach\(\(player\) => {\s*player\?\.detalles\?\.forEach\(\(d\) => {\s*if \(!draftCyclistStats\[d\.ciclista\]\) {\s*draftCyclistStats\[d\.ciclista\] = {\s*puntos: 0,\s*victorias: 0,\s*};\s*}\s*draftCyclistStats\[d\.ciclista\]\.puntos \+=\s*d\.puntosObtenidos;\s*const isPos01 =\s*d\.posicion === "01" \|\| d\.posicion === "1";\s*const isValidType = \[\s*"Etapa",\s*"Etapa \(Crono equipos\)",\s*"Clasificación final",\s*"Clasificación final \(Crono equipos\)",\s*"Clásica",\s*\].includes\(d\.tipoResultado\);\s*if \(isPos01 && isValidType\) {\s*draftCyclistStats\[d\.ciclista\]\.victorias \+= 1;\s*}\s*}\);\s*}\);/g, '/* removed draftCyclistStats calc */');

code = code.replace(/const raceTypeByName:\s*Record<string,\s*string>\s*=\s*{};/g, '/* removed raceTypeByName init */');
code = code.replace(/const raceDateByName:\s*Record<string,\s*string>\s*=\s*{};/g, '/* removed raceDateByName init */');
code = code.replace(/files\.carreras\?\.data\?\.forEach\(\(row\) => {\s*const carrera = getVal\(row, "Carrera"\)\?\.trim\(\);\s*const categoria = getVal\(\s*row,\s*"Categoría",\s*\)\?\.trim\(\);\s*const fecha = getVal\(row, "Fecha"\)\?\.trim\(\);\s*if \(carrera && categoria\)\s*raceTypeByName\[carrera\] = categoria;\s*if \(carrera && fecha\)\s*raceDateByName\[carrera\] = fecha;\s*}\);/g, '/* removed race mappings calc */');

// There is also `// Compute race properties\n const raceTypeByName...` block
code = code.replace(/const raceTypeByName: Record<string, string> = {};\s*const raceDateByName: Record<string, string> = {};\s*files\.carreras\?\.data\?\.forEach\(\(row\) => {\s*const carrera = getVal\(row, "Carrera"\)\?\.trim\(\);\s*const categoria = getVal\(\s*row,\s*"Categoría",\s*\)\?\.trim\(\);\s*const fecha = getVal\(row, "Fecha"\)\?\.trim\(\);\s*if \(carrera && categoria\)\s*raceTypeByName\[carrera\] = categoria;\s*if \(carrera && fecha\)\s*raceDateByName\[carrera\] = fecha;\s*}\);/g, '/* removed race mappings calc 2 */');


// In line 1427 there's a smaller block without fecha
code = code.replace(/const raceTypeByName:\s*Record<\s*string,\s*string\s*>\s*=\s*{};\s*files\.carreras\?\.data\?\.forEach\(\(row\) => {\s*const carrera = getVal\(\s*row,\s*"Carrera",\s*\)\?\.trim\(\);\s*const categoria = getVal\(\s*row,\s*"Categoría",\s*\)\?\.trim\(\);\s*if \(carrera && categoria\)\s*raceTypeByName\[carrera\] = categoria;\s*}\);/g, '/* removed smaller raceTypeByName */');

fs.writeFileSync('src/components/tabs/DraftView.tsx', code);
console.log("Replaced definitions");

