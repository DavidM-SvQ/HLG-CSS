const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/DraftView.tsx', 'utf8');

const hookInjections = `
  const draftComputedData = useMemo(() => {
    let minCarreras = Infinity;
    let minDc = Infinity;
    let minPpc = Infinity;
    let minPpd = Infinity;
    let minPct = Infinity;

    const maxPuntos = Math.max(
      1,
      ...Object.values(draftCyclistStats).map((s) => s.puntos)
    );

    files?.elecciones?.data?.forEach((row: any) => {
      const ciclista = getVal(row, "Ciclista") as string;
      if (!ciclista) return;
      const stats = draftCyclistStats[ciclista] || {
        puntos: 0,
        victorias: 0,
      };
      const meta = cyclistMetadata[ciclista] || {
        carrerasDisputadas: 0,
        diasCompeticion: 0,
      };

      const carr = meta.carrerasDisputadas;
      const dc = meta.diasCompeticion;
      const ppc = carr > 0 ? stats.puntos / carr : 0;
      const ppd = dc > 0 ? stats.puntos / dc : 0;

      const equipo =
        getVal(row, "Nombre_Equipo") ||
        (getVal(row, "Nombre_TG") as string);
      const pct =
        equipo && teamTotalPoints[equipo] > 0
          ? (stats.puntos / teamTotalPoints[equipo]) * 100
          : 0;

      if (carr > 0 && carr < minCarreras) minCarreras = carr;
      if (dc > 0 && dc < minDc) minDc = dc;
      if (ppc > 0 && ppc < minPpc) minPpc = ppc;
      if (ppd > 0 && ppd < minPpd) minPpd = ppd;
      if (pct > 0 && pct < minPct) minPct = pct;
    });

    return { maxPuntos, minCarreras, minDc, minPpc, minPpd, minPct };
  }, [files?.elecciones?.data, draftCyclistStats, cyclistMetadata, teamTotalPoints]);

  const draftFilteredData = useMemo(() => {
    if (!files?.elecciones?.data) return [];
    return files.elecciones.data.filter((row: any) => {
      const ciclista = getVal(row, "Ciclista") as string;
      const matchesSearch = ciclista
        ?.toLowerCase()
        .includes(draftSearchTerm.toLowerCase());
      const matchesRound =
        draftRoundFilter.length === 0 ||
        draftRoundFilter.includes(String(getVal(row, "Ronda")));
      const matchesTeam =
        draftTeamFilter.length === 0 ||
        draftTeamFilter.includes(
          String(getVal(row, "Nombre_Equipo") || getVal(row, "Nombre_TG"))
        );

      let matchesStats = true;
      if (ciclista) {
        const stats = draftCyclistStats[ciclista] || {
          puntos: 0,
          victorias: 0,
        };
        const meta = cyclistMetadata[ciclista] || {
          carrerasDisputadas: 0,
          diasCompeticion: 0,
        };
        const puntos = stats.puntos;
        const victorias = stats.victorias;
        const carr = meta.carrerasDisputadas;
        const dc = meta.diasCompeticion;
        const ppc = carr > 0 ? puntos / carr : 0;
        const ppd = dc > 0 ? puntos / dc : 0;

        if (
          draftStatsFilters.minPuntos !== undefined &&
          puntos < draftStatsFilters.minPuntos
        )
          matchesStats = false;
        if (
          draftStatsFilters.minVictorias !== undefined &&
          victorias < draftStatsFilters.minVictorias
        )
          matchesStats = false;
        // ignoring the max filters if they're not in the state right now, but let's just copy them as they were.
        // Wait, draftStatsFilters only has minPuntos and minVictorias! The other ones were unused or custom.
      }

      return matchesSearch && matchesRound && matchesTeam && matchesStats;
    });
  }, [files?.elecciones?.data, draftSearchTerm, draftRoundFilter, draftTeamFilter, draftStatsFilters, draftCyclistStats, cyclistMetadata]);
`;

code = code.replace(/return \(\s*<>\s*<div className="space-y-8">/, match => hookInjections + '\n  ' + match);

// Replace uses
code = code.replace(/const maxPuntos = Math\.max\(\s*1,\s*\.\.\.Object\.values\(draftCyclistStats\)\.map\(\s*\(s\) => s\.puntos,\s*\),\s*\);/g, '/* rem maxPuntos */ const maxPuntos = draftComputedData.maxPuntos;');
code = code.replace(/let minCarreras = Infinity;\s*let minDc = Infinity;\s*let minPpc = Infinity;\s*let minPpd = Infinity;\s*let minPct = Infinity;/g, '/* rem min variables */ const minCarreras=draftComputedData.minCarreras;\nconst minDc=draftComputedData.minDc;\nconst minPpc=draftComputedData.minPpc;\nconst minPpd=draftComputedData.minPpd;\nconst minPct=draftComputedData.minPct;');
code = code.replace(/files\.elecciones\?\.data\?\.forEach\(\(row\) => {\s*const ciclista = getVal\(row, "Ciclista"\) as string;\s*if \(!ciclista\) return;\s*const stats = draftCyclistStats\[ciclista\] \|\| {\s*puntos: 0,\s*victorias: 0,\s*};\s*const meta = cyclistMetadata\[ciclista\] \|\| {\s*carrerasDisputadas: 0,\s*diasCompeticion: 0,\s*};\s*const carr = meta\.carrerasDisputadas;\s*const dc = meta\.diasCompeticion;\s*const ppc = carr > 0 \? stats\.puntos \/ carr : 0;\s*const ppd = dc > 0 \? stats\.puntos \/ dc : 0;\s*const equipo =\s*getVal\(row, "Nombre_Equipo"\) \|\|\s*\(getVal\(row, "Nombre_TG"\) as string\);\s*const pct =\s*equipo && teamTotalPoints\[equipo\] > 0\s*\? \(stats\.puntos \/ teamTotalPoints\[equipo\]\) \* 100\s*: 0;\s*if \(carr > 0 && carr < minCarreras\)\s*minCarreras = carr;\s*if \(dc > 0 && dc < minDc\) minDc = dc;\s*if \(ppc > 0 && ppc < minPpc\) minPpc = ppc;\s*if \(ppd > 0 && ppd < minPpd\) minPpd = ppd;\s*if \(pct > 0 && pct < minPct\) minPct = pct;\s*}\);/g, '/* removed min mappings */');

fs.writeFileSync('src/components/tabs/DraftView.tsx', code);
console.log("Applied refactor2");
