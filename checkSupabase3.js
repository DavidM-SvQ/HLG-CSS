import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('global_files').select('id, data').eq('id', 'resultados');
  const resultados = data[0].data;
  
  const nonNumericPos = resultados.filter(r => {
    const pos = String(r['Pos'] || '').trim();
    if (pos === "") return false;
    return isNaN(Number(pos));
  });

  console.log("Total non-numeric Pos:", nonNumericPos.length);
  if (nonNumericPos.length > 0) {
      console.log(nonNumericPos.slice(0, 5));
  }
}

main();
