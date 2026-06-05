import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/(^"|"$)/g, '');
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Copy functions from AppComputations to match logic exactly
const norm = (s: any): string => {
    if (!s) return "";
    return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
};

const getVal = (row: any, field: string): any => {
  if (!row) return "";
  const keys = Object.keys(row);
  const matchedKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === field.toLowerCase().replace(/[^a-z0-9]/g, ''));
  if (matchedKey) return row[matchedKey];
  return "";
};

async function run() {
  if (!supabaseUrl) return;
  const supabase = createClient(supabaseUrl, supabaseAnonKey!);
  
  const { data: resultados } = await supabase.from('global_files').select('data').eq('id', 'resultados').single();
  const { data: carreras } = await supabase.from('global_files').select('data').eq('id', 'carreras').single();
  const { data: puntos } = await supabase.from('global_files').select('data').eq('id', 'puntos').single();
  
  const raceTypeByName: Record<string, string> = {};
  carreras?.data?.forEach((row: any) => {
    const carrera = getVal(row, "Carrera")?.trim();
    const categoria = getVal(row, "Categoría")?.trim();
    if (carrera && categoria) {
      raceTypeByName[norm(carrera)] = categoria;
    }
  });
  
  const pointsLookup: Record<string, number> = {};
  puntos?.data?.forEach((row: any) => {
    const categoria = getVal(row, "Categoría")?.trim();
    const tipo = getVal(row, "Tipo")?.trim();
    const posicion = getVal(row, "Posición")?.trim();
    const pts = getVal(row, "Puntos");
    if (categoria && tipo && posicion) {
      pointsKey = `${norm(categoria)}_${norm(tipo)}_${norm(posicion)}`;
      pointsLookup[pointsKey] = Number(pts);
    }
  });
  
  console.log("Analyzing Mercan'Tour results rows:");
  const mercanRows = resultados?.data?.filter((r: any) => getVal(r, "Carrera")?.toLowerCase().includes("mercan")) || [];
  
  mercanRows.slice(0, 10).forEach((row: any) => {
    const ciclista = getVal(row, "Ciclista");
    const carrera = getVal(row, "Carrera");
    const tipoResultado = getVal(row, "Tipo");
    const posicion = getVal(row, "Posición") || getVal(row, "Pos");
    
    const tipoCarrera = raceTypeByName[norm(carrera)];
    const pointsKey = `${norm(tipoCarrera)}_${norm(tipoResultado)}_${norm(posicion)}`;
    const pts = pointsLookup[pointsKey] || 0;
    
    console.log(`- Rider: ${ciclista} | TipoCarrera: ${tipoCarrera} | TipoRes: ${tipoResultado} | Pos: ${posicion} | PointsKey: ${pointsKey} -> Points: ${pts}`);
  });
  
  // Also check if they exist under Clásica or Clasificación final points keys
  console.log("\nChecking points defined for 1.1 category in puntos database:");
  const matchesPuntos1_1 = puntos?.data?.filter((p: any) => getVal(p, "Categoría") === "1.1");
  console.log(JSON.stringify(matchesPuntos1_1, null, 2));
}

let pointsKey = "";
run();
