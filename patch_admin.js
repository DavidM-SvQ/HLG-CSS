const fs = require('fs');

const path = 'src/components/tabs/admin/AdminDatosV2Tab.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the safeData block
const target = `      if (isSupabaseConfigured) {
        try {
          // PostgreSQL JSONB no soporta null bytes (\\u0000)
          const safeData = JSON.parse(JSON.stringify(parseResult.data).replace(/\\\\u0000/g, ''));
          const { error } = await supabase
            .from("global_files")
            .upsert({
              id,
              data: safeData,
              updated_at: new Date().toISOString()
            });`;

const replacement = `      if (isSupabaseConfigured) {
        try {
          // PostgreSQL JSONB no soporta null bytes (\\u0000)
          let safeData = JSON.parse(JSON.stringify(parseResult.data).replace(/\\\\u0000/g, ''));
          
          if (id === "resultados") {
            const neededColumns = ["Ciclista", "Carrera", "Tipo", "Etapa", "Posición", "Pos", "Fecha", "Equipo", "Nacido", "País", "Pais"];
            safeData = safeData.map(row => {
               const newRow = {};
               for (const col of neededColumns) {
                  if (row[col] !== undefined && row[col] !== null && row[col] !== "") {
                     newRow[col] = row[col];
                  }
               }
               return newRow;
            }).filter(row => row["Ciclista"] && (row["Posición"] || row["Pos"]));
          }
          
          const { error } = await supabase
            .from("global_files")
            .upsert({
              id,
              data: safeData,
              updated_at: new Date().toISOString()
            });`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
