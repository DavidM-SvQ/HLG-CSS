import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('global_files').select('id, data').eq('id', 'resultados');
  const resultados = data[0].data;
  
  const giro = resultados.filter(r => String(r['Carrera'] || '').includes("Giro d'Italia"));
  
  const emptyPos = giro.filter(r => String(r['Pos'] || '').trim() === "");
  
  console.log("Empty POS in Giro:", emptyPos.length);
  if (emptyPos.length > 0) {
      console.log(emptyPos.slice(0, 5));
  }
}
main();
