import React from 'react';

export interface RaceTagInfo {
  label: string;
  badgeClasses: string;
  icon?: string;
  category?: string;
}

export function getRaceTag(raceName: string, raceCategory?: string): RaceTagInfo | null {
  if (!raceName && !raceCategory) return null;

  const cleanStr = (str: string) =>
    (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const raceLower = cleanStr(raceName);
  const catLower = cleanStr(raceCategory || "");

  // 1. Tour de France -> Le Tour (strictly only Tour de France)
  const isTour =
    catLower === "tour de france" ||
    catLower === "tour de francia" ||
    raceLower === "tour de france" ||
    raceLower === "tour de francia" ||
    raceLower === "le tour de france" ||
    raceLower === "le tour" ||
    raceLower === "tour" ||
    (raceLower.includes("tour de france") && !raceLower.includes("femmes")) ||
    (raceLower.includes("tour de francia") && !raceLower.includes("femmes"));

  if (isTour) {
    return {
      label: "Le Tour",
      badgeClasses: "bg-amber-100 text-amber-950 border border-amber-300 font-bold",
      icon: "🇫🇷",
      category: "Tour de France"
    };
  }

  // 2. Giro d'Italia -> Il Giro (strictly only Giro d'Italia)
  const isGiro =
    catLower === "giro d'italia" ||
    catLower === "giro d italia" ||
    catLower === "giro de italia" ||
    catLower === "giro" ||
    raceLower === "giro d'italia" ||
    raceLower === "giro d italia" ||
    raceLower === "giro de italia" ||
    raceLower === "il giro" ||
    raceLower === "giro" ||
    ((raceLower.includes("giro d'italia") || raceLower.includes("giro d italia") || raceLower.includes("giro de italia") || (raceLower.includes("giro") && raceLower.includes("italia"))) &&
      !raceLower.includes("sardegna") &&
      !raceLower.includes("emilia") &&
      !raceLower.includes("lombardia") &&
      !raceLower.includes("trentino") &&
      !raceLower.includes("sicilia") &&
      !raceLower.includes("appennino") &&
      !raceLower.includes("veneto"));

  if (isGiro) {
    return {
      label: "Il Giro",
      badgeClasses: "bg-pink-100 text-pink-950 border border-pink-300 font-bold",
      icon: "🇮🇹",
      category: "Giro d'Italia"
    };
  }

  // 3. Vuelta a España -> La Vuelta (strictly only Vuelta a España)
  const isVuelta =
    catLower === "vuelta a espana" ||
    catLower === "vuelta a espanha" ||
    catLower === "vuelta ciclista a espana" ||
    raceLower === "vuelta a espana" ||
    raceLower === "vuelta ciclista a espana" ||
    raceLower === "la vuelta ciclista a espana" ||
    raceLower === "la vuelta" ||
    raceLower === "vuelta" ||
    ((raceLower.includes("vuelta a espana") || raceLower.includes("vuelta ciclista a espana") || (raceLower.includes("vuelta") && raceLower.includes("espana"))) &&
      !raceLower.includes("murcia") &&
      !raceLower.includes("burgos") &&
      !raceLower.includes("andalucia") &&
      !raceLower.includes("valenciana") &&
      !raceLower.includes("aragon") &&
      !raceLower.includes("castilla") &&
      !raceLower.includes("asturias") &&
      !raceLower.includes("extremadura") &&
      !raceLower.includes("mallorca") &&
      !raceLower.includes("pais vasco") &&
      !raceLower.includes("la rioja") &&
      !raceLower.includes("alentejo") &&
      !raceLower.includes("san juan"));

  if (isVuelta) {
    return {
      label: "La Vuelta",
      badgeClasses: "bg-red-100 text-red-950 border border-red-300 font-bold",
      icon: "🇪🇸",
      category: "Vuelta a España"
    };
  }

  // 4. Monumentos (categoría Monumento / Monumentos)
  const isMonument =
    catLower === "monumento" ||
    catLower === "monumentos" ||
    raceLower.includes("milano-sanremo") || raceLower.includes("milan-san remo") || raceLower.includes("milan san remo") || raceLower.includes("milano sanremo") ||
    raceLower.includes("ronde van vlaanderen") || raceLower.includes("tour des flandres") || raceLower.includes("tour de flandes") || raceLower.includes("tour of flanders") ||
    raceLower.includes("paris-roubaix") || raceLower.includes("paris roubaix") ||
    raceLower.includes("liege-bastogne-liege") || raceLower.includes("lieja-bastogne-lieja") || raceLower.includes("lieja-bastona-lieja") || raceLower.includes("lieja bastona lieja") ||
    raceLower.includes("il lombardia") || raceLower.includes("giro de lombardia") || raceLower.includes("giro di lombardia");

  if (isMonument) {
    return {
      label: "Monumentos",
      badgeClasses: "bg-slate-100 text-slate-800 border border-slate-300 font-bold",
      icon: "🏛️",
      category: "Monumento"
    };
  }

  // 5. Mundiales (Mundial Ruta y Mundial Crono)
  const isMundial =
    catLower === "mundial ruta" ||
    catLower === "mundial crono" ||
    catLower === "mundial" ||
    catLower === "mundiales" ||
    catLower.includes("mundial") ||
    raceLower.includes("mundial ruta") ||
    raceLower.includes("mundial crono") ||
    raceLower.includes("mundial cri") ||
    raceLower.includes("mundial contrarreloj") ||
    raceLower.includes("campeonato del mundo") ||
    raceLower === "mundial";

  if (isMundial) {
    return {
      label: "Mundiales",
      badgeClasses: "bg-sky-100 text-sky-950 border border-sky-300 font-bold",
      icon: "🌈",
      category: catLower.includes("crono") ? "Mundial Crono" : "Mundial Ruta"
    };
  }

  // 6. JJOO (JJOO Crono y JJOO Ruta)
  const isJJOO =
    catLower === "jjoo ruta" ||
    catLower === "jjoo crono" ||
    catLower === "jjoo" ||
    catLower.includes("jjoo") ||
    catLower.includes("olimpic") ||
    raceLower.includes("jjoo ruta") ||
    raceLower.includes("jjoo crono") ||
    raceLower.includes("jjoo cri") ||
    raceLower.includes("jjoo contrarreloj") ||
    raceLower.includes("juegos olimpicos") ||
    raceLower.includes("olimpicos") ||
    raceLower === "jjoo";

  if (isJJOO) {
    return {
      label: "JJOO",
      badgeClasses: "bg-amber-100 text-amber-950 border border-amber-400 font-bold",
      icon: "🥇",
      category: catLower.includes("crono") ? "JJOO Crono" : "JJOO Ruta"
    };
  }

  // 7. Europeos (Europeo Ruta y Europeo Crono)
  const isEuropeo =
    catLower === "europeo ruta" ||
    catLower === "europeo crono" ||
    catLower === "europeo" ||
    catLower === "europeos" ||
    catLower.includes("europeo") ||
    catLower.includes("campeonato de europa") ||
    raceLower.includes("europeo ruta") ||
    raceLower.includes("europeo crono") ||
    raceLower.includes("campeonato de europa") ||
    raceLower.includes("europeos") ||
    raceLower === "europeo";

  if (isEuropeo) {
    return {
      label: "Europeos",
      badgeClasses: "bg-blue-100 text-blue-950 border border-blue-400 font-bold",
      icon: "⭐",
      category: catLower.includes("crono") ? "Europeo Crono" : "Europeo Ruta"
    };
  }

  // Fallback classic
  const isClassic =
    raceLower.includes("clasica") ||
    raceLower.includes("classic") ||
    raceLower.includes("strade bianche") ||
    raceLower.includes("amstel gold") ||
    raceLower.includes("la fleche") ||
    raceLower.includes("flecha valona");

  if (isClassic) {
    return {
      label: "Clásica",
      badgeClasses: "bg-stone-100 text-stone-800 border border-stone-300 font-bold",
      icon: "🚴",
      category: "Clásica"
    };
  }

  return null;
}

export function getRaceTheme(raceName: string, isThemesEnabled: boolean, raceCategory?: string) {
  if (!raceName || !isThemesEnabled) {
    return {
      containerClasses: "bg-white border-neutral-200",
      themeBadge: null,
      tagInfo: null
    };
  }

  const tagInfo = getRaceTag(raceName, raceCategory);
  const pattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  if (!tagInfo) {
    return {
      containerClasses: "bg-white border-neutral-200",
      themeBadge: null,
      tagInfo: null
    };
  }

  if (tagInfo.label === "Le Tour") {
    return {
      containerClasses: "border-yellow-300 shadow-[0_0_40px_rgba(234,179,8,0.15)] bg-yellow-50/30 overflow-hidden",
      tagInfo,
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 text-xs font-black px-4 py-1.5 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-yellow-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[10px]">🇫🇷</span> LE TOUR
          </div>
        </>
      )
    };
  } else if (tagInfo.label === "Il Giro") {
    return {
      containerClasses: "border-pink-300 shadow-[0_0_40px_rgba(236,72,153,0.15)] bg-pink-50/30 overflow-hidden",
      tagInfo,
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-black px-4 py-1.5 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-pink-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[10px]">🇮🇹</span> IL GIRO
          </div>
        </>
      )
    };
  } else if (tagInfo.label === "La Vuelta") {
    return {
      containerClasses: "border-red-300 shadow-[0_0_40px_rgba(239,68,68,0.15)] bg-red-50/30 overflow-hidden",
      tagInfo,
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-red-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black px-4 py-1.5 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-red-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-[10px]">🇪🇸</span> LA VUELTA
          </div>
        </>
      )
    };
  } else if (tagInfo.label === "Monumentos") {
    return {
      containerClasses: "border-slate-300 shadow-[0_0_40px_rgba(148,163,184,0.15)] bg-slate-50/50 overflow-hidden",
      tagInfo,
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-slate-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-slate-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-xs font-black px-4 py-1.5 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            🏛️ MONUMENTOS
          </div>
        </>
      )
    };
  } else if (tagInfo.label === "Mundiales") {
    return {
      containerClasses: "border-sky-300 shadow-[0_0_40px_rgba(56,189,248,0.18)] bg-sky-50/30 overflow-hidden",
      tagInfo,
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-blue-600 via-emerald-600 to-amber-500 text-white text-xs font-black px-4 py-1.5 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            🌈 MUNDIALES
          </div>
        </>
      )
    };
  } else if (tagInfo.label === "JJOO") {
    return {
      containerClasses: "border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.18)] bg-amber-50/30 overflow-hidden",
      tagInfo,
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 text-xs font-black px-4 py-1.5 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            🥇 JJOO
          </div>
        </>
      )
    };
  } else if (tagInfo.label === "Europeos") {
    return {
      containerClasses: "border-blue-400 shadow-[0_0_40px_rgba(37,99,235,0.18)] bg-blue-50/30 overflow-hidden",
      tagInfo,
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-yellow-300 text-xs font-black px-4 py-1.5 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-blue-500 uppercase tracking-wider flex items-center gap-1.5">
            ⭐ EUROPEOS
          </div>
        </>
      )
    };
  } else if (tagInfo.label === "Clásica") {
    return {
      containerClasses: "border-stone-200 shadow-[0_0_40px_rgba(168,162,158,0.1)] bg-stone-50/30 overflow-hidden",
      tagInfo,
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-stone-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-stone-500 to-stone-600 text-white text-xs font-bold px-4 py-1 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-stone-400 uppercase tracking-wider flex items-center gap-1.5">
            🚴 CLÁSICA
          </div>
        </>
      )
    };
  }

  return {
    containerClasses: "bg-white border-neutral-200",
    themeBadge: null,
    tagInfo
  };
}
