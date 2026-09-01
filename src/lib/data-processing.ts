import React from 'react';

export const normalizedKeyCache: Record<string, string> = {};
const rowLayoutCache: Record<string, Record<string, string>> = {};

export const normalizeStr = (s: string) => {
  if (!s) return "";
  if (normalizedKeyCache[s]) return normalizedKeyCache[s];
  const res = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]/g, "")
    .trim();
  normalizedKeyCache[s] = res;
  return res;
};

export const getVal = (row: any, key: string) => {
  if (!row) return "";
  let val: any;
  if (row[key] !== undefined) {
    val = row[key];
  } else {
    // Very fast cache avoiding repeated Object.keys iterations on identical row layouts
    const cacheKey = Object.keys(row).join('|');
    if (!rowLayoutCache[cacheKey]) {
      const map: Record<string, string> = {};
      Object.keys(row).forEach(k => {
        map[normalizeStr(k)] = k;
      });
      rowLayoutCache[cacheKey] = map;
    }
    
    let normalizedKeys = [normalizeStr(key)];
    // Add common FirstCycling english/spanish aliases
    const aliases: Record<string, string[]> = {
      carrera: ["race", "event"],
      ciclista: ["rider", "name", "corredor"],
      posicion: ["pos.", "pos", "position", "pos1", "pos2", "pos_1", "pos_2", "posicion1", "posicion2"],
      "pos.": ["posicion", "position", "pos", "pos1", "pos2", "pos_1", "pos_2"],
      pos: ["pos.", "posicion", "position", "pos1", "pos2", "pos_1", "pos_2"],
      etapa: ["stage"],
      tipo: ["type", "class", "classification"],
      fecha: ["date"],
      puntos: ["pts", "points", "uci"],
      equipo: ["team"],
      nacido: ["age", "yob", "year"]
    };
    if (aliases[normalizedKeys[0]]) {
      normalizedKeys = normalizedKeys.concat(aliases[normalizedKeys[0]]);
    }

    let actualKey: string | undefined;
    for (const nk of normalizedKeys) {
      if (rowLayoutCache[cacheKey][nk]) {
        actualKey = rowLayoutCache[cacheKey][nk];
        break;
      }
    }
    
    val = actualKey ? row[actualKey] : "";
  }
  
  if (typeof val === 'string') {
    return val.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  }
  return val;
};

export const getCategoryColorStyle = (cat: string): React.CSSProperties => {
  if (!cat) return { backgroundColor: "transparent" };
  const c = cat.toUpperCase();
  // Tonos pasteles con mucha transparencia (0.4)
  if (c.includes('WT.A')) return { backgroundColor: "rgba(254, 226, 226, 0.4)" }; // red
  if (c.includes('WT.B') || c.includes('WT.C')) return { backgroundColor: "rgba(255, 237, 213, 0.4)" }; // orange
  if (c.includes('UWT') || c.includes('WT')) return { backgroundColor: "rgba(254, 226, 226, 0.4)" }; // red
  if (c.includes('PRO.A') || c.includes('PR.A')) return { backgroundColor: "rgba(219, 234, 254, 0.4)" }; // blue
  if (c.includes('PRO')) return { backgroundColor: "rgba(207, 250, 254, 0.4)" }; // cyan
  if (c.includes('1.1') || c.includes('2.1')) return { backgroundColor: "rgba(209, 250, 229, 0.4)" }; // emerald
  if (c.includes('1.2') || c.includes('2.2')) return { backgroundColor: "rgba(220, 252, 231, 0.4)" }; // green
  if (c.includes('1.') || c.includes('2.')) return { backgroundColor: "rgba(209, 250, 229, 0.4)" }; 
  if (c.includes('CC') || c.includes('NC') || c.includes('CN') || c.includes('NAT')) return { backgroundColor: "rgba(243, 232, 255, 0.4)" }; // purple
  if (c.includes('JO') || c.includes('CM') || c.includes('OLY') || c.includes('WC')) return { backgroundColor: "rgba(252, 231, 243, 0.4)" }; // pink
  return { backgroundColor: "rgba(248, 250, 252, 0.4)" }; // slate-50
};

export const parseSafeDateStr = (dStr: any) => {
  if (!dStr) return "";
  let s = dStr.toString().trim();
  
  const parts = s.split(/[-/.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  } else if (parts.length === 2) {
    return `${new Date().getFullYear()}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  } else {
    const v = parseFloat(s);
    if (!isNaN(v) && v > 10000) { // excel date
      const d = new Date((v - 25569) * 86400 * 1000);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  }
  return s;
};

export const formatNumberSpanish = (val: number | string | undefined | null) => {
  if (val === undefined || val === null) return "";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return val.toString();
  return new Intl.NumberFormat("es-ES").format(num);
};

export const parseDate = (d: string) => {
  if (!d) return 0;
  const p = d.split(/[-/]/);
  if (p.length !== 3) return 0;
  return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0])).getTime();
};

export const normalizeRaceName = (race: string): string => {
  if (!race) return "";
  let clean = race
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

  // Strip leading articles
  if (clean.startsWith("la")) clean = clean.substring(2);
  else if (clean.startsWith("el")) clean = clean.substring(2);
  else if (clean.startsWith("le")) clean = clean.substring(2);
  else if (clean.startsWith("il")) clean = clean.substring(2);
  else if (clean.startsWith("the")) clean = clean.substring(3);

  // Canonical Grand Tours
  if (
    clean.includes("vueltaespana") ||
    clean.includes("vueltacliclistaaespana") ||
    clean.includes("vueltaciclistaaespana") ||
    clean.includes("vueltaspain") ||
    clean.includes("vueltaaespana") ||
    (clean.includes("vuelta") && (clean.includes("espana") || clean.includes("spain"))) ||
    clean === "vuelta"
  ) {
    return "vuelta a espana";
  }

  if (
    clean.includes("tourdefrance") ||
    clean.includes("tourdefrancia") ||
    clean.includes("letourdefrance") ||
    clean === "tour" ||
    clean === "letour" ||
    clean.includes("tourfrance")
  ) {
    return "tour de france";
  }

  if (
    clean.includes("giroditalia") ||
    clean.includes("girodeitalia") ||
    clean.includes("girodiitalia") ||
    clean === "giro" ||
    clean === "ilgiro" ||
    clean.includes("giroitalia")
  ) {
    return "giro d italia";
  }

  // Canonical Classics & Stage Races
  if (clean.includes("parisnice") || clean.includes("parisniza")) return "paris niza";
  if (clean.includes("tirrenoadriatico")) return "tirreno adriatico";
  if (clean.includes("itzulia") || clean.includes("paisvasco")) return "itzulia";
  if (clean.includes("catalunya") || clean.includes("cataluna")) return "volta a catalunya";
  if (clean.includes("romandie") || clean.includes("romandia")) return "tour de romandie";
  if (clean.includes("dauphine") || clean.includes("delfinado")) return "criterium du dauphine";
  if (clean.includes("suisse") || clean.includes("suiza")) return "tour de suisse";
  if (clean.includes("pologne") || clean.includes("polonia")) return "tour de pologne";
  if (clean.includes("milanosanremo") || clean.includes("milansanremo")) return "milano sanremo";
  if (clean.includes("flandes") || clean.includes("flandres") || clean.includes("vlaanderen")) return "tour de flandes";
  if (clean.includes("roubaix")) return "paris roubaix";
  if (clean.includes("lieja") || clean.includes("liege")) return "lieja bastona lieja";
  if (clean.includes("lombardia")) return "il lombardia";
  if (clean.includes("amstel")) return "amstel gold race";
  if (clean.includes("flechavalona") || clean.includes("flechewallonne")) return "flecha valona";
  if (clean.includes("sansebastian") || clean.includes("klasikoa")) return "clasica san sebastian";

  return clean;
};

export const isSameRace = (raceA: string, raceB: string): boolean => {
  if (!raceA || !raceB) return false;
  if (raceA.trim().toLowerCase() === raceB.trim().toLowerCase()) return true;
  
  const normA = normalizeRaceName(raceA);
  const normB = normalizeRaceName(raceB);
  if (normA === normB) return true;

  const rawA = normalizeStr(raceA);
  const rawB = normalizeStr(raceB);
  if (rawA === rawB) return true;

  // Substring fallback if both long enough
  if (rawA.length > 5 && rawB.length > 5) {
    if (rawA.includes(rawB) || rawB.includes(rawA)) return true;
    if (normA.length > 5 && normB.length > 5) {
      if (normA.includes(normB) || normB.includes(normA)) return true;
    }
  }

  return false;
};

export const getCategoryAliases = (cat: string): string[] => {
  if (!cat) return [""];
  const n = normalizeStr(cat);

  // Vuelta a España specific
  if (
    n.includes("vuelta") ||
    n.includes("vueltaciclista") ||
    n.includes("vueltaspain") ||
    n === "vuelta" ||
    n === "lavuelta"
  ) {
    return [
      "vuelta a espana",
      "vueltaaespana",
      "vuelta",
      "lavuelta",
      "lavueltaaespana",
      "lavueltaciclistaaespana",
      "vueltaciclistaaespana",
      n
    ];
  }

  // Tour de France specific
  if (
    n.includes("tourdefrance") ||
    n.includes("tourdefrancia") ||
    n.includes("letour") ||
    n === "tour"
  ) {
    return [
      "tour de france",
      "tourdefrance",
      "tourdefrancia",
      "tour de francia",
      "tour",
      "letourdefrance",
      "letour",
      n
    ];
  }

  // Giro d'Italia specific
  if (
    n.includes("giro") ||
    n.includes("giroditalia") ||
    n.includes("girodeitalia") ||
    n === "giro" ||
    n === "ilgiro"
  ) {
    return [
      "giro d italia",
      "giroditalia",
      "girodeitalia",
      "giro de italia",
      "giro",
      "ilgiro",
      n
    ];
  }

  // Generic GT
  if (
    n === "gt" ||
    n.includes("granvuelta") ||
    n.includes("grandtour") ||
    n.includes("grandesvueltas")
  ) {
    return ["gt", "granvuelta", "grandtour", "grandesvueltas", n];
  }

  // Monumentos
  if (n.includes("monumento") || n.includes("mon")) {
    return ["monumentos", "monumento", "mon", n];
  }

  // 1.UWT
  if (n === "1uwt" || n.includes("1uwt") || n === "1.uwt" || n === "wta1") {
    return ["1uwt", "1.uwt", "uwt1", "wta1", "wta", "1wta", n];
  }

  // 2.UWT
  if (n === "2uwt" || n.includes("2uwt") || n === "2.uwt" || n === "wtb" || n === "uwt") {
    return ["2uwt", "2.uwt", "uwt2", "wtb", "2wtb", n];
  }

  // Pro
  if (n.includes("pro")) {
    return ["1pro", "1.pro", "pro1", "pra", "proa", "2pro", "2.pro", "pro2", "prb", "prob", "pro", n];
  }

  return [n];
};

export const getResultTypeAliases = (type: string): string[] => {
  if (!type) return [""];
  const n = normalizeStr(type);

  // General Classification / Final
  if (
    n.includes("clasificacionfinal") ||
    n.includes("generalfinal") ||
    n.includes("clasificaciongeneral") ||
    n === "cg" ||
    n === "gc" ||
    n === "final" ||
    n === "general"
  ) {
    return [
      "clasificacionfinal",
      "generalfinal",
      "clasificaciongeneral",
      "cg",
      "gc",
      "final",
      "general",
      n
    ];
  }

  // Stages
  if (
    n.includes("etapa") ||
    n.includes("stage") ||
    n === "cri" ||
    n === "contrarreloj"
  ) {
    if (n.includes("crono") && n.includes("equipo")) {
      return [
        "etapacronoequipos",
        "cre",
        "etapacre",
        "cronoporequipos",
        "clasificacionfinalcronoequipos",
        n
      ];
    }
    return ["etapa", "etapas", "stage", "etapaenlinea", "cri", "contrarreloj", n];
  }

  // Leader / Daily Leader Jersey (Maillot de líder / Maillot rojo / Líder por etapa / Líder diario)
  if (
    n.includes("lider") ||
    n.includes("maillot") ||
    n.includes("maglia") ||
    n.includes("jersey")
  ) {
    return [
      "lider",
      "lideretapa",
      "liderporetapa",
      "liderdiario",
      "maillotlider",
      "maillotdelider",
      "maillotrojo",
      "maillotamarillo",
      "magliarosa",
      "lidergeneral",
      "lidercg",
      "maillot",
      "liderpordia",
      n
    ];
  }

  // Points / Regularity
  if (
    n.includes("regularidad") ||
    n.includes("puntos") ||
    n.includes("maillotverde") ||
    n === "cp"
  ) {
    return [
      "regularidadfinal",
      "puntosfinal",
      "clasificacionporpuntos",
      "clasificacionporpuntosfinal",
      "regularidad",
      "puntos",
      "clasificacionregularidad",
      "clasificaciondelaregularidad",
      "maillotverde",
      "clasificacionpuntos",
      "cp",
      n
    ];
  }

  // Mountain
  if (
    n.includes("montana") ||
    n.includes("maillotdelamontana") ||
    n.includes("maillotlunares") ||
    n === "cm"
  ) {
    return [
      "montanafinal",
      "clasificaciondelamontana",
      "clasificacionmontanafinal",
      "montana",
      "clasificacionmontana",
      "clasificaciondelamontanafinal",
      "maillotdelamontana",
      "cm",
      n
    ];
  }

  // Youth
  if (
    n.includes("joven") ||
    n.includes("sub25") ||
    n.includes("maillotblanco") ||
    n === "cj"
  ) {
    return [
      "jovenesfinal",
      "clasificaciondelosjovenes",
      "clasificacionjovenesfinal",
      "mejorjoven",
      "jovenes",
      "sub25",
      "clasificacionjovenes",
      "clasificacionsub25",
      "maillotblanco",
      "cj",
      n
    ];
  }

  // Team time trial / Team GC
  if (n.includes("equipo") || n.includes("cre")) {
    return [
      "etapacronoequipos",
      "cre",
      "etapacre",
      "cronoporequipos",
      "clasificacionfinalcronoequipos",
      "equiposfinal",
      "clasificacionporequipos",
      "equipos",
      n
    ];
  }

  return [n];
};

export const getPositionAliases = (pos: string | number | undefined, type?: string): string[] => {
  if (pos === undefined || pos === null || pos === "") {
    const isLeader = type && normalizeStr(type).includes("lider");
    return isLeader ? ["1", "lider", "liderdiario", "liderporetapa", "etapa", "diario", ""] : [""];
  }

  const pStr = String(pos).trim();
  const cleaned = pStr.replace(/[º°.]/g, "").trim();
  const numVal = parseInt(cleaned, 10);
  const isLeader = type && (normalizeStr(type).includes("lider") || normalizeStr(type).includes("maillot"));

  const results = new Set<string>();
  if (cleaned) results.add(cleaned);
  if (!isNaN(numVal)) {
    results.add(String(numVal));
    results.add(String(numVal).padStart(2, '0'));
  }
  const normP = normalizeStr(pStr);
  if (normP) results.add(normP);

  if (isLeader) {
    results.add("1");
    results.add("01");
    results.add("lider");
    results.add("liderdiario");
    results.add("liderporetapa");
    results.add("etapa");
    results.add("diario");
    results.add("");
  }

  return Array.from(results);
};

export const getFlagEmoji = (countryName: string) => {
  if (!countryName) return '';
  const country = countryName.trim().toLowerCase();
  const flags: Record<string, string> = {
    spain: '🇪🇸',
    españa: '🇪🇸',
    france: '🇫🇷',
    francia: '🇫🇷',
    italy: '🇮🇹',
    italia: '🇮🇹',
    belgium: '🇧🇪',
    bélgica: '🇧🇪',
    netherlands: '🇳🇱',
    'países bajos': '🇳🇱',
    holanda: '🇳🇱',
    slovenia: '🇸🇮',
    eslovenia: '🇸🇮',
    denmark: '🇩🇰',
    dinamarca: '🇩🇰',
    'great britain': '🇬🇧',
    'gran bretaña': '🇬🇧',
    'united kingdom': '🇬🇧',
    'reino unido': '🇬🇧',
    gbr: '🇬🇧',
    australia: '🇦🇺',
    aus: '🇦🇺',
    usa: '🇺🇸',
    'united states': '🇺🇸',
    eeuu: '🇺🇸',
    'estados unidos': '🇺🇸',
    colombia: '🇨🇴',
    col: '🇨🇴',
    ecuador: '🇪🇨',
    ecu: '🇪🇨',
    norway: '🇳🇴',
    noruega: '🇳🇴',
    nor: '🇳🇴',
    germany: '🇩🇪',
    alemania: '🇩🇪',
    ger: '🇩🇪',
    switzerland: '🇨🇭',
    suiza: '🇨🇭',
    sui: '🇨🇭',
    portugal: '🇵🇹',
    por: '🇵🇹',
    austria: '🇦🇹',
    aut: '🇦🇹',
    ireland: '🇮🇪',
    irlanda: '🇮🇪',
    irl: '🇮🇪',
    canada: '🇨🇦',
    canadá: '🇨🇦',
    can: '🇨🇦',
    'new zealand': '🇳🇿',
    'nueva zelanda': '🇳🇿',
    nzl: '🇳🇿',
    eritrea: '🇪🇷',
    eri: '🇪🇷',
    kazakhstan: '🇰🇿',
    kazajistán: '🇰🇿',
    kaz: '🇰🇿',
    poland: '🇵🇱',
    polonia: '🇵🇱',
    pol: '🇵🇱',
    'czech republic': '🇨🇿',
    'república checa': '🇨🇿',
    czechia: '🇨🇿',
    cze: '🇨🇿',
    slovakia: '🇸🇰',
    eslovaquia: '🇸🇰',
    svk: '🇸🇰',
    hungary: '🇭🇺',
    hungría: '🇭🇺',
    hun: '🇭🇺',
    luxembourg: '🇱🇺',
    luxemburgo: '🇱🇺',
    lux: '🇱🇺',
    'south africa': '🇿🇦',
    sudáfrica: '🇿🇦',
    rsa: '🇿🇦',
    latvia: '🇱🇻',
    letonia: '🇱🇻',
    lat: '🇱🇻',
    estonia: '🇪🇪',
    est: '🇪🇪',
    lithuania: '🇱🇹',
    lituania: '🇱🇹',
    ltu: '🇱🇹',
    israel: '🇮🇱',
    isr: '🇮🇱',
    japan: '🇯🇵',
    japón: '🇯🇵',
    jpn: '🇯🇵',
    china: '🇨🇳',
    chn: '🇨🇳',
    russia: '🇷🇺',
    rusia: '🇷🇺',
    rus: '🇷🇺',
    ukraine: '🇺🇦',
    ucrania: '🇺🇦',
    ukr: '🇺🇦',
    belarus: '🇧🇾',
    bielorrusia: '🇧🇾',
    blr: '🇧🇾',
    mexico: '🇲🇽',
    méxico: '🇲🇽',
    mex: '🇲🇽',
    argentina: '🇦🇷',
    arg: '🇦🇷',
    brazil: '🇧🇷',
    brasil: '🇧🇷',
    bra: '🇧🇷',
    venezuela: '🇻🇪',
    ven: '🇻🇪',
    'costa rica': '🇨🇷',
    crc: '🇨🇷',
    panama: '🇵🇦',
    panamá: '🇵🇦',
    pan: '🇵🇦',
    uruguay: '🇺🇾',
    uru: '🇺🇾',
    greece: '🇬🇷',
    grecia: '🇬🇷',
    gre: '🇬🇷',
    'french polynesia': '🇵🇫',
    'polinesia francesa': '🇵🇫',
    gabon: '🇬🇦',
    'gabón': '🇬🇦',
    gab: '🇬🇦',
    lebanon: '🇱🇧',
    'líbano': '🇱🇧',
    libano: '🇱🇧',
    lbn: '🇱🇧',
    malawi: '🇲🇼',
    maw: '🇲🇼',
    niger: '🇳🇪',
    'níger': '🇳🇪',
    nig: '🇳🇪',
    monaco: '🇲🇨',
    'mónaco': '🇲🇨',
    mon: '🇲🇨',
    serbia: '🇷🇸',
    srb: '🇷🇸',
    sweden: '🇸🇪',
    suecia: '🇸🇪',
    swe: '🇸🇪',
    guatemala: '🇬🇹',
    gua: '🇬🇹',
  };
  return flags[country] || countryName;
};
