import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const normalizeStr = (s) => {
  if (typeof s !== "string") return "";
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9.]/g, "").trim();
};

async function main() {
  const { data, error } = await supabase.from('global_files').select('id, data').eq('id', 'resultados');
  const resultados = data[0].data;
  console.log("Total rows:", resultados.length);
  
  const aliases = {
      posicion: ["pos.", "pos", "position", "pos1", "pos2", "pos_1", "pos_2", "posicion1", "posicion2"],
      pos: ["pos.", "posicion", "position", "pos1", "pos2", "pos_1", "pos_2"],
  };

  const retired = resultados.filter(r => {
    const keys = Object.keys(r);
    let posKey = keys.find(k => normalizeStr(k) === 'posicion' || normalizeStr(k) === 'pos');
    if (!posKey) {
        for (const k of keys) {
            const norm = normalizeStr(k);
            if (aliases.pos && aliases.pos.includes(norm)) { posKey = k; break; }
            if (aliases.posicion && aliases.posicion.includes(norm)) { posKey = k; break; }
        }
    }
    const pos = String(r[posKey] || '').toUpperCase();
    return ["DNF", "DNS", "OOT", "DSQ", "OTL"].some(rs => pos.includes(rs));
  });

  console.log("Total retired:", retired.length);
  if (retired.length > 0) {
    console.log("Sample 1:", retired[0]);
  } else {
    // print first row to see keys
    console.log("Row 0 keys:", Object.keys(resultados[0]));
    console.log("Row 0:", resultados[0]);
  }
}

main();
