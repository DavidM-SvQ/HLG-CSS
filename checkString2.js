import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('global_files').select('data').eq('id', 'resultados');
  const resultados = data[0].data;
  const dnsRows = resultados.filter(r => Object.values(r).some(v => String(v).toUpperCase().includes("DNS")));
  console.log("DNS rows:", dnsRows.length);
  if (dnsRows.length > 0) {
      console.log(dnsRows.slice(0, 5));
  }
}
main();
