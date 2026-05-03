import React from 'react';

export const normalizedKeyCache: Record<string, string> = {};

export const normalizeStr = (s: string) => {
  if (!s) return "";
  if (normalizedKeyCache[s]) return normalizedKeyCache[s];
  const res = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
  normalizedKeyCache[s] = res;
  return res;
};

export const getVal = (row: any, key: string) => {
  if (!row) return "";
  if (row[key] !== undefined) return row[key];
  const normalizedKey = normalizeStr(key);
  const actualKey = Object.keys(row).find(
    (k) => normalizeStr(k) === normalizedKey,
  );
  return actualKey ? row[actualKey] : "";
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
