import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('global_files').select('id, data').in('id', ['startlist', 'startlists_v2', 'ciclistas']);
  
  for (let file of data) {
      console.log("File:", file.id);
      const str = JSON.stringify(file.data);
      console.log("Includes DNF?", str.includes("DNF"));
      if (str.includes("DNF")) {
          const anyDnf = file.data.filter(r => Object.values(r).some(v => String(v).toUpperCase().includes("DNF")));
          console.log("DNF rows:", anyDnf.slice(0, 2));
      }
  }
}
main();
