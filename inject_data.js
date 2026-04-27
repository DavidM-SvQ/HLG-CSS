import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert dummy data into the empty arrays of <BarChart data={[]} for instance.
content = content.replace('<BarChart data={[]}', `<BarChart data={[
    { equipo: 'Eq A', ganador: 5, bueno: 12, malo: 3, nulo: 0 },
    { equipo: 'Eq B', ganador: 3, bueno: 10, malo: 5, nulo: 2 },
    { equipo: 'Eq C', ganador: 6, bueno: 8, malo: 4, nulo: 2 },
    { equipo: 'Eq D', ganador: 2, bueno: 14, malo: 2, nulo: 2 },
    { equipo: 'Eq E', ganador: 4, bueno: 9, malo: 6, nulo: 1 },
  ]}`);

content = content.replace('<LineChart data={[]}', `<LineChart data={[
    { ronda: 1, media: 2500 },
    { ronda: 2, media: 1800 },
    { ronda: 3, media: 1200 },
    { ronda: 4, media: 800 },
    { ronda: 5, media: 600 },
    { ronda: 6, media: 400 },
    { ronda: 7, media: 250 },
    { ronda: 8, media: 100 },
  ]}`);

content = content.replace('<BarChart data={[]} layout="vertical"', `<BarChart data={[
    { categoria: 'Draft Inicial', puntos: 48500 },
    { categoria: 'Mercado (No Draft)', puntos: 12400 },
  ]} layout="vertical"`);

content = content.replace('<AreaChart data={[]}', `<AreaChart data={[
    { equipo: 'Eq A', topPick: 12000, resto: 8500 },
    { equipo: 'Eq B', topPick: 9500, resto: 11000 },
    { equipo: 'Eq C', topPick: 14000, resto: 6000 },
    { equipo: 'Eq D', topPick: 11000, resto: 10500 },
    { equipo: 'Eq E', topPick: 8000, resto: 12000 },
  ]}`);

content = content.replace('<Scatter name="Ciclistas Draft" data={[]}', `<Scatter name="Ciclistas Draft" data={[
    { dias: 15, puntos: 2500, nombre: 'Pogacar' },
    { dias: 25, puntos: 1800, nombre: 'Vingegaard' },
    { dias: 40, puntos: 1200, nombre: 'Roglic' },
    { dias: 35, puntos: 800, nombre: 'Ayuso' },
    { dias: 10, puntos: 50, nombre: 'Pedersen' },
    { dias: 45, puntos: 2400, nombre: 'Van Aert' },
    { dias: 20, puntos: 1500, nombre: 'Van der Poel' },
    { dias: 50, puntos: 600, nombre: 'Kuss' },
  ]}`);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('Dummy data injected!');
