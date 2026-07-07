import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('global_files').select('id, data').eq('id', 'resultados');
  const resultados = data[0].data;
  
  const uniquePos = new Set();
  resultados.forEach(r => {
      const posStr = String(r['Pos'] || r['Posición'] || r['posicion'] || r['pos'] || '').trim().toUpperCase();
      uniquePos.add(posStr);
  });
  
  console.log("All unique POS:");
  console.log(Array.from(uniquePos).sort().join(", "));
}
main();
