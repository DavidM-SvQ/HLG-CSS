import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('global_files').select('data').eq('id', 'resultados');
  const str = JSON.stringify(data[0].data);
  console.log("Includes DNF?", str.includes("DNF"));
  console.log("Includes DNS?", str.includes("DNS"));
  console.log("Includes DSQ?", str.includes("DSQ"));
}
main();
