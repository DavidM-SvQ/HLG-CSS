import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('global_files').select('id, data').eq('id', 'resultados');
  if (error) {
    console.error(error);
    return;
  }
  const resultados = data[0].data;
  const retiredStrings = ["DNF", "DNS", "OOT", "DSQ", "OTL"];
  
  const getVal = (obj, key) => {
    const targetLower = key.toLowerCase();
    for (const k of Object.keys(obj)) {
        if (k.toLowerCase() === targetLower) return obj[k];
    }
    return undefined;
  };

  const retired = resultados.filter(r => {
    const pos = String(getVal(r, 'Pos') || getVal(r, 'Posición') || '').toUpperCase();
    return retiredStrings.some(rs => pos.includes(rs));
  });

  console.log("Total retired:", retired.length);
  if (retired.length > 0) {
    console.log("Sample 1:", retired[0]);
    console.log("Sample 2:", retired[1]);
  }
}

main();
