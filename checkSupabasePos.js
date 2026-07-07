import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('global_files').select('id, data').eq('id', 'resultados');
  const resultados = data[0].data;
  
  const getVal = (row, key) => {
    for(let k of Object.keys(row)) {
      if(k.toLowerCase() === key.toLowerCase()) return row[k];
    }
    return undefined;
  };

  const retired = resultados.filter(r => {
    const pos = String(getVal(r, 'pos') || getVal(r, 'posicion') || getVal(r, 'posición') || '');
    return ["DNF", "DNS", "OOT", "DSQ", "OTL"].some(rs => pos.toUpperCase().includes(rs));
  });

  console.log("Total retired in POS column:", retired.length);
  if (retired.length > 0) {
      console.log(retired.slice(0, 5));
  } else {
      console.log("No retired found in POS column");
      // let's look for DNF in ANY column to see where it actually is
      const anyDnf = resultados.filter(r => Object.values(r).some(v => String(v).toUpperCase().includes("DNF")));
      console.log("Total DNF in any column:", anyDnf.length);
      if (anyDnf.length > 0) {
          console.log(anyDnf.slice(0, 2));
      }
  }
}
main();
