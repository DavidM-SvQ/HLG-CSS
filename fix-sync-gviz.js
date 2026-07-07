import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import Papa from 'papaparse';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const sheetUrls = {
  ciclistas: "https://docs.google.com/spreadsheets/d/1imDY8fCIlJkRNlDLPzumsa4oCXuLAcG8rqEsA5CfpTQ/gviz/tq?tqx=out:csv&gid=2040713726",
  equipos: "https://docs.google.com/spreadsheets/d/1imDY8fCIlJkRNlDLPzumsa4oCXuLAcG8rqEsA5CfpTQ/gviz/tq?tqx=out:csv&gid=1055577607",
  puntos: "https://docs.google.com/spreadsheets/d/1imDY8fCIlJkRNlDLPzumsa4oCXuLAcG8rqEsA5CfpTQ/gviz/tq?tqx=out:csv&gid=477610090",
  resultados: "https://docs.google.com/spreadsheets/d/1imDY8fCIlJkRNlDLPzumsa4oCXuLAcG8rqEsA5CfpTQ/gviz/tq?tqx=out:csv&gid=877239396"
};

const cleanCsvText = (text) => {
  const lines = text.split("\n");
  let startIndex = 0;
  while (startIndex < lines.length) {
    const line = lines[startIndex].trim();
    if (line === "" || /^[,\s]*$/.test(line)) {
      startIndex++;
    } else {
      break;
    }
  }
  return lines.slice(startIndex).join("\n");
};

async function main() {
  for (const [id, url] of Object.entries(sheetUrls)) {
    console.log(`Processing ${id}...`);
    try {
      const text = execSync(`curl -sL '${url}'`).toString();
      
      const cleanedText = cleanCsvText(text);
      
      const parseResult = Papa.parse(cleanedText, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
      });
      
      if (parseResult.data.length === 0) {
        console.log(`0 rows for ${id}, skipping.`);
        continue;
      }
      
      const safeData = JSON.parse(JSON.stringify(parseResult.data).replace(/\\u0000/g, ''));
      
      const { data, error } = await supabase
        .from("global_files")
        .upsert({
          id,
          data: safeData,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error(`Error saving ${id}:`, error);
      } else {
        console.log(`Successfully saved ${id}, ${safeData.length} rows.`);
      }
    } catch (e) {
      console.error(`Exception processing ${id}:`, e);
    }
  }
}

main();
