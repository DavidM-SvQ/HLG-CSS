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
  };
  return flags[country] || countryName;
};
