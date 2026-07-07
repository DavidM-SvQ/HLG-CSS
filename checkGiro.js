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
  console.log("Total Giro rows:", giro.length);
  
  if (giro.length > 0) {
      // Find rows that might be retired
      const possibleRetired = giro.filter(r => {
          return Object.values(r).some(v => {
              const s = String(v).toUpperCase();
              return s === "DNF" || s === "DNS" || s === "DSQ" || s === "OTL" || s === "OOT";
          });
      });
      console.log("Possible retired in Giro:", possibleRetired.length);
      if (possibleRetired.length > 0) {
          console.log(possibleRetired.slice(0, 5));
      } else {
          console.log("No exact match for DNF/DNS/etc in Giro");
          // Print some Giro rows to inspect structure
          console.log(giro.slice(0, 3));
      }
  }
}
main();
