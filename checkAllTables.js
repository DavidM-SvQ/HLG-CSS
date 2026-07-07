import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('global_files').select('id, data');
  
  for (let file of data) {
      if (!file.data) continue;
      const str = JSON.stringify(file.data).toUpperCase();
      const hasDnf = str.includes("DNF") || str.includes("DNS") || str.includes("DSQ") || str.includes("OTL") || str.includes("OOT");
      console.log(`Table ${file.id} has DNF/DNS/etc? ${hasDnf}`);
  }
}
main();
