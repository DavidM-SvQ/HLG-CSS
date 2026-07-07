import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('global_files').select('id, data').eq('id', 'resultados');
  const resultados = data[0].data;
  
  const retired = resultados.filter(r => {
    return Object.values(r).some(v => {
      const s = String(v).toUpperCase();
      return s.includes("DNF") || s.includes("DNS") || s.includes("DSQ") || s.includes("OTL") || s.includes("OOT");
    });
  });

  console.log("Total retired in ANY column:", retired.length);
  if (retired.length > 0) {
      console.log(retired.slice(0, 5));
  }
}
main();
