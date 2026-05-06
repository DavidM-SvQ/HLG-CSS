import fs from 'fs';
const txt = fs.readFileSync('draftView.txt', 'utf8');
const startMatch = txt.indexOf('draftSubTab === "datos"');
const endMatch = txt.indexOf(')((()))||', startMatch); // we will figure out boundaries if needed, wait, I can just write it to a smaller file and view it
const substr = txt.substring(startMatch - 100, txt.length);
fs.writeFileSync('draft_datos_extracted.txt', substr);
