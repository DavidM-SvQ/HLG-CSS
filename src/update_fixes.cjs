const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Initialize cyclistStats with all drafted players from playerByCyclist
const initializationTarget = `                                      const cyclistStats: Record<string, { 
                                        puntos: number, 
                                        jugador: string, 
                                        nombreEquipo: string,
                                        orden: string,
                                        ronda: string,
                                        pais: string,
                                        victorias: number,
                                        carreras: Set<string>,
                                        dias: number
                                      }> = {};

                                      // First, map races to months and categories`;

const initializationReplace = `                                      const cyclistStats: Record<string, { 
                                        puntos: number, 
                                        jugador: string, 
                                        nombreEquipo: string,
                                        orden: string,
                                        ronda: string,
                                        pais: string,
                                        victorias: number,
                                        carreras: Set<string>,
                                        dias: number
                                      }> = {};

                                      // Initialize all drafted players
                                      Object.entries(playerByCyclist).forEach(([ciclista, jugador]) => {
                                        if (jugador !== 'No draft') {
                                          cyclistStats[ciclista] = {
                                            puntos: 0,
                                            jugador: jugador,
                                            nombreEquipo: playerTeamMap[jugador] || '',
                                            orden: playerOrderMap[jugador] || '',
                                            ronda: cyclistRoundMap[ciclista] || '',
                                            pais: cyclistMetadata[ciclista]?.pais || '',
                                            victorias: 0,
                                            carreras: new Set(),
                                            dias: 0
                                          };
                                        }
                                      });

                                      // First, map races to months and categories`;

code = code.replace(initializationTarget, initializationReplace);

// 2. We don't want to skip unscored players when filtering, unless their team/ronda is excluded.
// The actual initialization logic already sets up 0 scores for them.

// 3. Fix the layout of the scroll container to comfortably fit ~30 rows
code = code.replace(
  'max-h-[640px] bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin',
  'max-h-[1050px] bg-white border-t border-neutral-100 pb-4 flex justify-center scrollbar-thin'
);

// 4. Fix copy blocks button array length. Use a state or length of allStats.
// Wait, we can't access topScorers length easily outside the block, BUT we can calculate the exact items beforehand,
// or just use 500 when "Todos", or use \`Object.keys(playerByCyclist).length\` which represents drafted players length.
// We can change: \`Math.ceil((topCyclistsLimit === 9999 ? 400 : topCyclistsLimit) / 50)\`
code = code.replace(
  'Math.ceil((topCyclistsLimit === 9999 ? 400 : topCyclistsLimit) / 50)',
  'Math.ceil((topCyclistsLimit === 9999 ? 500 : topCyclistsLimit) / 50)'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Done mapping.');
